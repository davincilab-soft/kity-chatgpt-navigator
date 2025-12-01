import type { CommandType } from '../content/adapter.types';

export interface CommandMessage {
  type: 'EXECUTE_COMMAND';
  command: CommandType;
}

export function sendCommand(command: CommandType): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'EXECUTE_COMMAND', command });
    }
  });
}