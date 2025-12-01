/// <reference types="chrome"/>

import {
  hasActiveAccess,
  LICENSE_STORAGE_KEYS,
  LicenseService,
} from "../shared/license";

type KityMessage =
  | { type: "KITY_OPEN_DOCS" }
  | { type: "KITY_GET_STATUS" }
  | { type: "KITY_SIGN_OUT" }
  | { type: "KITY_UPDATE_ICON"; enabled: boolean };

type BackgroundMessage =
  | KityMessage;

interface KityStatusResponse {
  enabled: boolean;
  hasToken: boolean;
  userEmail?: string | null;
  plan?: string;
  forceLocalFree?: boolean;
}

const ACTIVE_ICON = {
  16: "icons/Icon16px.png",
  32: "icons/Icon32px.png",
  48: "icons/Icon48px.png",
  128: "icons/Icon128px.png",
};

const INACTIVE_ICON = {
  16: "icons/Icon_grey16px.png",
  32: "icons/Icon_grey32px.png",
  48: "icons/Icon_grey48px.png",
  128: "icons/Icon_grey128px.png",
};

const STORAGE_KEYS = {
  enabled: "kityEnabled",
} as const;

const LOCAL_STORAGE_KEYS = {
  enabled: "kityEnabledLocal",
} as const;

const DOCS_URL = "https://kity.software/";

const licenseService = new LicenseService();

let cachedEnabled: boolean | null = null;
let runtimeFunctionalEnabled = false;

chrome.action.setIcon({ path: INACTIVE_ICON });
void loadLocalEnabled();
void initializeLicense();
refreshLicenseAfterDelay(1000);

chrome.runtime.onInstalled.addListener(() => {
  primeEnabledState({ setDefaultIfMissing: true });
});

chrome.runtime.onStartup?.addListener(() => {
  primeEnabledState({ setDefaultIfMissing: false });
  refreshLicenseAfterDelay(500);
});

chrome.runtime.onMessage.addListener(
  (
    message: BackgroundMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    let willRespondAsync = false;

    switch (message.type) {
      case "KITY_OPEN_DOCS":
        handleOpenDocs();
        sendResponse({ ok: true });
        break;

      case "KITY_GET_STATUS":
        willRespondAsync = true;
        void handleGetStatus(sendResponse);
        break;

      case "KITY_SIGN_OUT":
        willRespondAsync = true;
        void handleSignOut(sendResponse);
        break;

      case "KITY_UPDATE_ICON":
        cachedEnabled = message.enabled;
        updateEffectiveState();
        sendResponse?.({ ok: true });
        break;

      default:
        break;
    }

    return willRespondAsync;
  }
);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;

  let shouldRecompute = false;

  if (STORAGE_KEYS.enabled in changes) {
    cachedEnabled = !!changes[STORAGE_KEYS.enabled].newValue;
    shouldRecompute = true;
  }

  if (
    LICENSE_STORAGE_KEYS.plan in changes ||
    LICENSE_STORAGE_KEYS.forceLocalFree in changes
  ) {
    shouldRecompute = true;
  }

  if (shouldRecompute) {
    updateEffectiveState();
  }
});

async function initializeLicense(): Promise<void> {
  await licenseService.init();
  updateEffectiveState();
}

async function handleGetStatus(
  sendResponse: (response: KityStatusResponse) => void
): Promise<void> {
  try {
    await licenseService.refreshFromBackend();
  } catch (error) {
    console.warn("Failed to refresh license", error);
  }

  const state = licenseService.getState();
  sendResponse({
    enabled: cachedEnabled ?? true,
    hasToken: !!state.token,
    userEmail: state.forceLocalFree ? null : state.email,
    plan: state.plan,
    forceLocalFree: state.forceLocalFree,
  });
}

async function handleSignOut(
  sendResponse: (response: { ok: boolean }) => void
): Promise<void> {
  try {
    await licenseService.signOutLocally();
    updateEffectiveState();
    sendResponse({ ok: true });
  } catch (error) {
    console.warn("Error signing out:", error);
    sendResponse({ ok: false });
  }
}

function handleOpenDocs() {
  chrome.tabs.create({ url: DOCS_URL }, () => {
    if (chrome.runtime.lastError) {
      console.warn("Error opening docs tab:", chrome.runtime.lastError.message);
    }
  });
}

function broadcastEnabledState(enabled: boolean): void {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id) {
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        { type: "KITY_SET_ENABLED", enabled },
        () => {
          if (chrome.runtime.lastError) {
            // Expected for tabs without the content script; ignore.
          }
        }
      );
    });
  });
}

function updateActionIcon(enabled: boolean): void {
  chrome.action.setIcon({
    path: enabled ? ACTIVE_ICON : INACTIVE_ICON,
  });
}

function primeEnabledState(options?: { setDefaultIfMissing?: boolean }) {
  chrome.storage.sync.get([STORAGE_KEYS.enabled], (items) => {
    const stored = items[STORAGE_KEYS.enabled];
    const hasStored = stored !== undefined;
    if (hasStored) {
      cachedEnabled = !!stored;
    } else if (options?.setDefaultIfMissing) {
      cachedEnabled = true;
      chrome.storage.sync.set({ [STORAGE_KEYS.enabled]: true }, () => {
        updateEffectiveState();
      });
    }
    updateEffectiveState();
  });
}

function computeEffectiveEnabled(): boolean {
  const licenseState = licenseService.getState();
  const hasAccess = hasActiveAccess({
    forceLocalFree: licenseState.forceLocalFree,
  });
  return !!cachedEnabled && hasAccess;
}

function updateEffectiveState(): void {
  if (cachedEnabled === null) {
    return;
  }

  const functionalEnabled = computeEffectiveEnabled();
  updateActionIcon(cachedEnabled);
  chrome.storage.local.set({ [LOCAL_STORAGE_KEYS.enabled]: cachedEnabled });

  if (runtimeFunctionalEnabled === functionalEnabled) {
    return;
  }

  runtimeFunctionalEnabled = functionalEnabled;
  broadcastEnabledState(functionalEnabled);
}

function loadLocalEnabled(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([LOCAL_STORAGE_KEYS.enabled], (items) => {
      const storedLocal = items[LOCAL_STORAGE_KEYS.enabled];
      if (storedLocal !== undefined && cachedEnabled === null) {
        cachedEnabled = !!storedLocal;
        updateEffectiveState();
      }
      resolve();
    });
  });
}

function refreshLicenseAfterDelay(delayMs: number): void {
  setTimeout(() => {
    void licenseService.refreshFromBackend().then(() => updateEffectiveState());
  }, delayMs);
}
