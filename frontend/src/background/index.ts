import type { CommandType } from '../content/adapter.types';
import { queryActiveChatGptTab } from '../common/tabs';

// Map keyboard shortcuts to commands
const commandMap: Record<string, CommandType> = {
  'focus-sidebar': 'focusSidebar',
  'focus-main': 'focusMain',
  'navigate-up': 'navigateUp',
  'navigate-down': 'navigateDown',
  'extend-sel-up': 'extendSelUp',
  'extend-sel-down': 'extendSelDown',
  'prev-user': 'prevUser',
  'next-user': 'nextUser',
};

chrome.commands.onCommand.addListener((command) => {
  const mappedCommand = commandMap[command];
  if (!mappedCommand) {
    return;
  }

  chrome.storage.sync.get(['kityEnabled'], (items) => {
    const enabled = items.kityEnabled;
    if (enabled !== undefined && !enabled) {
      return;
    }

    queryActiveChatGptTab((tab) => {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXECUTE_COMMAND',
          command: mappedCommand,
        });
      }
    });
  });
});
