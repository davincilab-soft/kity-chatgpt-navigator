import type { CommandType } from '../content/adapter.types';

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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'EXECUTE_COMMAND',
          command: mappedCommand,
        });
      }
    });
  });
});
