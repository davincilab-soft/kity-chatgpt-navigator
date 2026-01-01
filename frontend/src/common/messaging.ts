import type { CommandType } from '../content/adapter.types';
import { queryActiveChatGptTab } from './tabs';

export interface CommandMessage {
  type: 'EXECUTE_COMMAND';
  command: CommandType;
}

export function sendCommand(command: CommandType): void {
  queryActiveChatGptTab((tab) => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'EXECUTE_COMMAND', command });
    }
  });
}
