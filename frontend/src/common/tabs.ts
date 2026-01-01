/// <reference types="chrome" />

export const CHAT_GPT_URL_PATTERNS: string[] = [
  'https://chat.openai.com/*',
  'https://chatgpt.com/*',
];

export function queryActiveChatGptTab(
  callback: (tab?: chrome.tabs.Tab) => void,
): void {
  chrome.tabs.query(
    { active: true, currentWindow: true, url: CHAT_GPT_URL_PATTERNS },
    (tabs) => callback(tabs[0]),
  );
}

export function queryAllChatGptTabs(
  callback: (tabs: chrome.tabs.Tab[]) => void,
): void {
  chrome.tabs.query({ url: CHAT_GPT_URL_PATTERNS }, callback);
}
