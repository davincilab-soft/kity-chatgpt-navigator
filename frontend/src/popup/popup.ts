/// <reference types="chrome"/>

import { queryActiveChatGptTab } from "../common/tabs";

interface PopupState {
  enabled: boolean;
  decorEnabled: boolean;
}

const STORAGE_KEYS = {
  enabled: "kityEnabled",
  decor: "kityThemeDecorEnabled",
} as const;

const BRAND_LOGO_SRC = chrome.runtime.getURL("icons/Icon32px.png");
const SUPPORT_URL = "https://buy.stripe.com/7sY8wI2iz7i57VH38McjS01";
const SUPPORT_API_URL = "";

let toggleCheckbox: HTMLInputElement | null = null;
let decorCheckbox: HTMLInputElement | null = null;
let kitySlider: HTMLElement | null = null;
let decorSlider: HTMLElement | null = null;
let paidPromoTitle: HTMLElement | null = null;
let promoSubtitle: HTMLElement | null = null;
let promoGuidance: HTMLElement | null = null;
let decorCard: HTMLElement | null = null;
let decorTitle: HTMLElement | null = null;
let popupBody: HTMLElement | null = null;
let decorCardParent: HTMLElement | null = null;
let decorCardPlaceholder: Comment | null = null;
let supportButton: HTMLButtonElement | null = null;

let popupState: PopupState = {
  enabled: true,
  decorEnabled: false,
};

document.addEventListener("DOMContentLoaded", () => {
  cacheDomElements();
  attachEventListeners();
  void initState();
  subscribeToStorageChanges();
});

function cacheDomElements() {
  toggleCheckbox = document.getElementById("kity-toggle") as HTMLInputElement | null;
  kitySlider = document.querySelector(".kity-toggle-slider");
  decorCheckbox = document.getElementById("decor-toggle") as HTMLInputElement | null;
  decorSlider = document.querySelector(".decor-toggle-slider");
  paidPromoTitle = document.getElementById("paid-promo-title");
  promoSubtitle = document.getElementById("promo-subtitle");
  promoGuidance = document.querySelector(".promo__guidance-list");
  decorCard = document.getElementById("decor-card");
  decorTitle = document.querySelector(".decor-card__title");
  popupBody = document.getElementById("popup-body");
  supportButton = document.getElementById("support-btn") as HTMLButtonElement | null;

  if (decorCard?.parentElement) {
    decorCardParent = decorCard.parentElement;
    decorCardPlaceholder = document.createComment("decor-card-anchor");
    decorCardParent.insertBefore(decorCardPlaceholder, decorCard);
  }

  const brandLogo = document.getElementById("brand-logo") as HTMLImageElement | null;
  if (brandLogo) {
    brandLogo.src = BRAND_LOGO_SRC;
  }
}

function attachEventListeners() {
  toggleCheckbox?.addEventListener("change", onToggleChanged);
  decorCheckbox?.addEventListener("change", onDecorToggleChanged);
  supportButton?.addEventListener("click", onSupportClicked);
}

async function initState() {
  await loadToggleState();
  render();
}

function loadToggleState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.enabled, STORAGE_KEYS.decor], (items) => {
      const storedEnabled = items[STORAGE_KEYS.enabled];
      const storedDecor = items[STORAGE_KEYS.decor];
      popupState.enabled = storedEnabled === undefined ? true : !!storedEnabled;
      popupState.decorEnabled = storedDecor === undefined ? false : !!storedDecor;
      resolve();
    });
  });
}

function subscribeToStorageChanges() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;

    let shouldRerender = false;

    if (STORAGE_KEYS.enabled in changes) {
      popupState.enabled = !!changes[STORAGE_KEYS.enabled].newValue;
      shouldRerender = true;
    }

    if (STORAGE_KEYS.decor in changes) {
      popupState.decorEnabled = !!changes[STORAGE_KEYS.decor].newValue;
      shouldRerender = true;
    }

    if (shouldRerender) {
      render();
    }
  });
}

function onToggleChanged() {
  if (!toggleCheckbox) return;

  const newEnabled = toggleCheckbox.checked;
  popupState.enabled = newEnabled;
  updateSliderVisual(kitySlider, newEnabled);
  chrome.runtime.sendMessage({ type: "KITY_UPDATE_ICON", enabled: newEnabled });
  chrome.storage.sync.set({ [STORAGE_KEYS.enabled]: newEnabled });
}

function onDecorToggleChanged() {
  if (!decorCheckbox) return;
  const enabled = decorCheckbox.checked;
  popupState.decorEnabled = enabled;
  renderDecorToggle();

  chrome.storage.sync.set({ [STORAGE_KEYS.decor]: enabled }, () => {
    queryActiveChatGptTab((tab) => {
      const tabId = tab?.id;
      if (!tabId) return;
      chrome.tabs.sendMessage(tabId, { type: "KITY_SET_THEME_ENABLED", enabled }, () => {
        // ignore missing content script errors
      });
    });
  });
}

function onSupportClicked() {
  supportButton?.classList.add("is-loading");
  void resolveSupportUrl()
    .then((url) => {
      if (url) {
        chrome.tabs.create({ url });
      }
    })
    .finally(() => {
      supportButton?.classList.remove("is-loading");
    });
}

async function resolveSupportUrl(): Promise<string | null> {
  if (SUPPORT_API_URL) {
    try {
      const resp = await fetch(SUPPORT_API_URL, { method: "GET" });
      if (resp.ok) {
        const data = (await resp.json()) as { url?: string };
        if (data.url) return data.url;
      }
    } catch (error) {
      console.warn("Support link fetch failed", error);
    }
  }
  return SUPPORT_URL ?? null;
}

function render() {
  renderToggle();
  renderView();
  renderDecorToggle();
}

function renderToggle() {
  if (!toggleCheckbox) return;

  toggleCheckbox.checked = popupState.enabled;
  updateSliderVisual(kitySlider, popupState.enabled);
}

function renderView() {
  const isOn = popupState.enabled;

  if (paidPromoTitle) {
    paidPromoTitle.textContent = isOn
      ? "Keyboard shortcuts are ready for ChatGPT."
      : "Turn on Kity to enable ChatGPT shortcuts.";
  }

  if (promoSubtitle) {
    promoSubtitle.textContent = isOn
      ? "Shortcuts run locally; no data ever leaves your browser."
      : "";
    promoSubtitle.style.display = isOn ? "" : "none";
  }

  if (promoGuidance) {
    promoGuidance.classList.toggle("promo__guidance-list--disabled", !isOn);
    promoGuidance.style.display = isOn ? "" : "none";
  }

  if (decorCard) {
    const cardInDom = decorCardParent?.contains(decorCard);
    if (!cardInDom && decorCardPlaceholder && decorCardPlaceholder.parentNode) {
      decorCardPlaceholder.parentNode.insertBefore(decorCard, decorCardPlaceholder);
    }
    decorCard.hidden = false;
  }

  triggerViewSwapAnimation();
}

function updateSliderVisual(slider: Element | null, isOn: boolean) {
  if (!slider) return;
  slider.classList.toggle("toggle-slider--on", isOn);
  slider.classList.toggle("toggle-slider--off", !isOn);
  const sliderStateOn = slider.querySelector(".toggle-slider__state--on");
  const sliderStateOff = slider.querySelector(".toggle-slider__state--off");
  sliderStateOn?.classList.toggle("is-active", isOn);
  sliderStateOff?.classList.toggle("is-active", !isOn);
}

function renderDecorToggle() {
  if (!decorCheckbox) return;
  decorCheckbox.checked = popupState.decorEnabled;
  updateSliderVisual(decorSlider, decorCheckbox.checked);
  decorCheckbox.disabled = false;
  if (decorTitle) {
    decorTitle.classList.toggle("decor-card__title--on", decorCheckbox.checked);
    decorTitle.classList.toggle("decor-card__title--off", !decorCheckbox.checked);
  }
}

function triggerViewSwapAnimation() {
  if (!popupBody) return;
  popupBody.classList.remove("popup-body--swap");
  // force reflow to restart animation
  void popupBody.offsetWidth;
  popupBody.classList.add("popup-body--swap");
}
