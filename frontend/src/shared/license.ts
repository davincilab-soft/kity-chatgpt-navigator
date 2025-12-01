export type LicensePlan = "pro";

export interface LicenseState {
  plan: LicensePlan;
  email: string | null;
  forceLocalFree: boolean;
  lastSyncedAt: string | null;
  token: string | null;
}

type LicenseListener = (state: LicenseState) => void;

export const LICENSE_STORAGE_KEYS = {
  plan: "kityPlan",
  email: "kityUserEmail",
  forceLocalFree: "kityForceLocalFree",
  lastSyncedAt: "kityLicenseLastSyncedAt",
  token: "kityAuthToken",
} as const;

const defaultState: LicenseState = {
  plan: "pro",
  email: null,
  forceLocalFree: false,
  lastSyncedAt: null,
  token: null,
};

export class LicenseService {
  private state: LicenseState = { ...defaultState };
  private listeners = new Set<LicenseListener>();
  private initialized = false;

  constructor() {
    this.handleStorageChange = this.handleStorageChange.bind(this);
  }

  isPaid(): boolean {
    return true;
  }

  hasAccess(): boolean {
    return hasActiveAccess(this.state);
  }

  getEmail(): string | null {
    return this.state.email;
  }

  getState(): LicenseState {
    return { ...this.state };
  }

  onChange(listener: LicenseListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async init(): Promise<LicenseState> {
    await this.loadFromStorage();

    await this.refreshFromBackend();

    if (!this.initialized) {
      chrome.storage.onChanged.addListener(this.handleStorageChange);
      this.initialized = true;
    }

    return this.getState();
  }

  async refreshFromBackend(): Promise<LicenseState> {
    return this.ensureProAccess();
  }

  async signIn(options?: { email?: string | null; token?: string | null }): Promise<LicenseState> {
    await this.persistState({
      plan: "pro",
      email: options?.email ?? this.state.email,
      forceLocalFree: false,
      lastSyncedAt: new Date().toISOString(),
      token: options?.token ?? this.state.token ?? "local-pro",
    });
    return this.getState();
  }

  async signOutLocally(): Promise<LicenseState> {
    await this.persistState({
      ...defaultState,
      forceLocalFree: true,
      lastSyncedAt: new Date().toISOString(),
    });

    return this.getState();
  }

  private async persistState(partial: Partial<LicenseState>): Promise<void> {
    const nextState: LicenseState = {
      ...this.state,
      ...partial,
    };

    await new Promise<void>((resolve) => {
      chrome.storage.sync.set(
        {
          [LICENSE_STORAGE_KEYS.plan]: nextState.plan,
          [LICENSE_STORAGE_KEYS.email]: nextState.email,
          [LICENSE_STORAGE_KEYS.forceLocalFree]: nextState.forceLocalFree,
          [LICENSE_STORAGE_KEYS.lastSyncedAt]: nextState.lastSyncedAt,
          [LICENSE_STORAGE_KEYS.token]: nextState.token,
        },
        () => resolve()
      );
    });

    this.state = nextState;
    this.notify();
  }

  private async loadFromStorage(): Promise<void> {
    const items = await new Promise<Record<string, any>>((resolve) => {
      chrome.storage.sync.get(
        Object.values(LICENSE_STORAGE_KEYS),
        (result) => resolve(result)
      );
    });

    this.state = {
      plan: "pro",
      email: (items[LICENSE_STORAGE_KEYS.email] as string | null | undefined) ?? null,
      forceLocalFree: !!items[LICENSE_STORAGE_KEYS.forceLocalFree],
      lastSyncedAt:
        (items[LICENSE_STORAGE_KEYS.lastSyncedAt] as string | null | undefined) ?? null,
      token: (items[LICENSE_STORAGE_KEYS.token] as string | null | undefined) ?? null,
    };

    await this.ensureProAccess();
    this.notify();
  }

  private handleStorageChange(
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) {
    if (areaName !== "sync") return;

    const relevantKeys = Object.values(LICENSE_STORAGE_KEYS);
    const hasChange = relevantKeys.some((key) => key in changes);
    if (!hasChange) {
      return;
    }

    const newState = { ...this.state };
    if (LICENSE_STORAGE_KEYS.plan in changes) {
      newState.plan =
        (changes[LICENSE_STORAGE_KEYS.plan].newValue as LicensePlan | undefined) ?? "pro";
    }
    if (LICENSE_STORAGE_KEYS.email in changes) {
      newState.email =
        (changes[LICENSE_STORAGE_KEYS.email].newValue as string | null | undefined) ?? null;
    }
    if (LICENSE_STORAGE_KEYS.forceLocalFree in changes) {
      newState.forceLocalFree = !!changes[LICENSE_STORAGE_KEYS.forceLocalFree].newValue;
    }
    if (LICENSE_STORAGE_KEYS.lastSyncedAt in changes) {
      newState.lastSyncedAt =
        (changes[LICENSE_STORAGE_KEYS.lastSyncedAt].newValue as string | null | undefined) ??
        null;
    }
    if (LICENSE_STORAGE_KEYS.token in changes) {
      newState.token =
        (changes[LICENSE_STORAGE_KEYS.token].newValue as string | null | undefined) ?? null;
    }

    this.state = newState;
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  private async ensureProAccess(): Promise<LicenseState> {
    if (this.state.plan !== "pro" || this.state.forceLocalFree) {
      await this.persistState({
        plan: "pro",
        forceLocalFree: false,
        lastSyncedAt: new Date().toISOString(),
      });
    }
    return this.getState();
  }
}

export function hasActiveAccess(state: {
  forceLocalFree?: boolean;
}): boolean {
  return !state.forceLocalFree;
}
