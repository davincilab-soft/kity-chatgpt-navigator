export const SINGLE_CHATGPT_MODE = true;

let singleGPTModeEnabled = SINGLE_CHATGPT_MODE;

export function singleGPTMode(enabled: boolean): void {
  singleGPTModeEnabled = enabled;
}

export function shouldEnableForAlias(adapterAlias: string, desiredEnabled: boolean): boolean {
  if (!desiredEnabled) {
    return false;
  }

  if (!singleGPTModeEnabled) {
    return true;
  }

  return adapterAlias === 'gpt';
}
