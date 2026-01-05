import type { IAdapter, CommandType } from './adapter.types';
import type { CommandMessage } from '../common/messaging';
import { detectAdapterAlias } from '../common/site-detect';
import { ChatGPTAdapter } from './adapters/chatgpt';
import { ClaudeAdapter } from './adapters/claude';
import { GrokAdapter } from './adapters/grok';
import { GeminiAdapter } from './adapters/gemini';
import { GmailAdapter } from './adapters/gmail';
import { GoogleSearchAdapter } from './adapters/google-search';
import { GoogleDriveAdapter } from './adapters/google-drive';
import { WikipediaAdapter } from './adapters/wikipedia';
import { AmazonAdapter } from './adapters/amazon';
import { GenericAdapter } from './adapters/adapter.generic';
import { createChristmasDecorations, type ChristmasDecorController } from '../themes/christmas/decorations';
import { singleGPTMode as setSingleGPTModeFlag, shouldEnableForAlias } from './singleGPTMode';

const ENABLE_STORAGE_KEY = 'kityEnabled';
const THEME_DECOR_STORAGE_KEY = 'kityThemeDecorEnabled';
const currentAdapterAlias = detectAdapterAlias(new URL(window.location.href));

type ControlMessage =
  | { type: 'KITY_SET_ENABLED'; enabled: boolean }
  | { type: 'KITY_SET_THEME_ENABLED'; enabled: boolean }
  | CommandMessage;

let desiredEnabled = true;
let currentAdapter: IAdapter | null = null;
let isKityEnabled: boolean | null = null;
let listenersAttached = false;
let decorEnabled = false;
let decorController: ChristmasDecorController | null = null;

const SIDEBAR_NAV_REPEAT_MS = 70;
let sidebarNavRepeatTimer: number | null = null;
let sidebarNavDirection: 'up' | 'down' | null = null;

const runtimeMessageHandler = (message: ControlMessage): void => {
  if (message.type === 'KITY_SET_ENABLED') {
    setEnabledState(message.enabled);
    return;
  }

  if (message.type === 'KITY_SET_THEME_ENABLED') {
    setDecorationsEnabled(message.enabled);
    return;
  }

  if (!isKityEnabled) {
    return;
  }

  if (message.type === 'EXECUTE_COMMAND') {
    executeCommand(message.command);
  }
};

bootstrap();
chrome.runtime.onMessage.addListener(runtimeMessageHandler);

export function singleGPTMode(enabled: boolean): void {
  setSingleGPTModeFlag(enabled);
  setEnabledState(desiredEnabled);
}

function bootstrap(): void {
  chrome.storage.sync.get(
    [
      ENABLE_STORAGE_KEY,
      THEME_DECOR_STORAGE_KEY,
    ],
    (items) => {
      const stored = items[ENABLE_STORAGE_KEY];
      const storedDecor = (items[THEME_DECOR_STORAGE_KEY] as boolean | undefined) ?? false;

      setEnabledState(stored === undefined ? true : !!stored);
      setDecorationsEnabled(!!storedDecor);
    }
  );

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') {
      return;
    }

    if (ENABLE_STORAGE_KEY in changes) {
      const newValue = !!changes[ENABLE_STORAGE_KEY].newValue;
      setEnabledState(newValue);
    }

    if (THEME_DECOR_STORAGE_KEY in changes) {
      const newDecorValue = !!changes[THEME_DECOR_STORAGE_KEY].newValue;
      setDecorationsEnabled(newDecorValue);
    }
  });
}

function setEnabledState(enabled: boolean): void {
  desiredEnabled = enabled;
  const shouldEnable = shouldEnableForAlias(currentAdapterAlias, desiredEnabled);
  const handlersMatchState = listenersAttached === shouldEnable;

  if (isKityEnabled === shouldEnable && handlersMatchState) {
    if (!shouldEnable) {
      decorController?.unmount();
    } else if (decorEnabled) {
      decorController?.mount();
    }
    return;
  }

  isKityEnabled = shouldEnable;

  if (shouldEnable) {
    ensureAdapter();
    attachGlobalHandlers();
    if (decorEnabled) {
      if (!decorController) {
        decorController = createChristmasDecorations(document);
      }
      decorController.mount();
    }
    console.info('[Kity] Enabled on this page');
  } else {
    detachGlobalHandlers();
    disposeAdapter();
    resetVisualState();
    decorController?.unmount();
    console.info('[Kity] Disabled on this page');
  }
}

function ensureAdapter(): void {
  if (currentAdapter) {
    return;
  }

  currentAdapter = createAdapter();
  currentAdapter.init();
}

function disposeAdapter(): void {
  if (!currentAdapter) {
    return;
  }

  currentAdapter.dispose?.();
  currentAdapter = null;
}

function attachGlobalHandlers(): void {
  if (listenersAttached) {
    return;
  }

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  listenersAttached = true;
}

function detachGlobalHandlers(): void {
  if (!listenersAttached) {
    return;
  }

  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);

  listenersAttached = false;
}

function resetVisualState(): void {
  document
    .querySelectorAll('.kity-focus')
    .forEach((element) => element.classList.remove('kity-focus'));
  document
    .querySelectorAll('.kity-selected')
    .forEach((element) => element.classList.remove('kity-selected'));
}

function setDecorationsEnabled(enabled: boolean): void {
  if (decorEnabled === enabled) {
    return;
  }

  decorEnabled = enabled;

  if (!isKityEnabled) {
    decorController?.unmount();
    return;
  }

  if (enabled) {
    if (!decorController) {
      decorController = createChristmasDecorations(document);
    }
    decorController.mount();
  } else {
    decorController?.unmount();
  }
}

function createAdapter(): IAdapter {
  const alias = currentAdapterAlias;

  if (alias === 'gpt') {
    return new ChatGPTAdapter();
  }

  if (alias === 'claude') {
    return new ClaudeAdapter();
  }

  if (alias === 'grok') {
    return new GrokAdapter();
  }

  if (alias === 'gemini') {
    return new GeminiAdapter();
  }

  if (alias === 'gmail') {
    return new GmailAdapter();
  }

  if (alias === 'google') {
    return new GoogleSearchAdapter();
  }

  if (alias === 'gdrive') {
    return new GoogleDriveAdapter();
  }

  if (alias === 'wpedia') {
    return new WikipediaAdapter();
  }

  if (alias === 'amazon') {
    return new AmazonAdapter();
  }

  return new GenericAdapter();
}

function executeCommand(command: CommandType): void {
  if (!isKityEnabled) {
    return;
  }

  console.log('[Kity] Execute command:', command);

  if (!currentAdapter) {
    console.warn('[Kity] No adapter loaded');
    return;
  }

  const methodMap: Record<CommandType, keyof IAdapter> = {
    focusSidebar: 'focusSidebar',
    focusMain: 'focusMain',
    navigateUp: 'navigateUp',
    navigateDown: 'navigateDown',
    extendSelUp: 'extendSelectionUp',
    extendSelDown: 'extendSelectionDown',
    prevUser: 'prevUser',
    nextUser: 'nextUser',
    jumpToFirst: 'jumpToFirst',
    jumpToLast: 'jumpToLast',
    copySelected: 'copySelected',
  };

  const method = methodMap[command];
  const fn = currentAdapter[method] as (() => void) | undefined;

  if (fn && typeof fn === 'function') {
    fn.call(currentAdapter);
  } else {
    console.warn('[Kity] Method not found or not a function:', method);
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (!isKityEnabled) {
    return;
  }

  const target = event.target as HTMLElement;
  const { altKey, shiftKey, ctrlKey, metaKey, key } = event;

  const isInInputField =
    target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

  if (isInInputField && !ctrlKey) {
    return;
  }

  if (ctrlKey && !shiftKey && !altKey && !metaKey && key === 'ArrowLeft') {
    event.preventDefault();
    executeCommand('focusSidebar');
  } else if (ctrlKey && !shiftKey && !altKey && !metaKey && key === 'ArrowRight') {
    event.preventDefault();
    executeCommand('focusMain');
  } else if (ctrlKey && !shiftKey && !altKey && !metaKey && key === 'c') {
    // Let native copy run when user has an explicit selection (including inside inputs/textareas)
    const selection = window.getSelection();
    const hasDomSelection = !!selection && !selection.isCollapsed && selection.toString().length > 0;

    const activeElement = document.activeElement as HTMLElement | null;
    const isTextInput =
      activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
    const hasInputSelection =
      isTextInput &&
      activeElement.selectionStart !== null &&
      activeElement.selectionEnd !== null &&
      activeElement.selectionStart !== activeElement.selectionEnd;

    if (hasDomSelection || hasInputSelection) {
      return; // preserve native copy for manual selections
    }

    event.preventDefault();
    executeCommand('copySelected');
  } else if (ctrlKey && !shiftKey && !altKey && !metaKey && key === 'a') {
    event.preventDefault();
    const hasSelection = window.getSelection()?.toString().length;
    if (hasSelection) {
      executeCommand('extendSelUp');
    } else {
      executeCommand('jumpToFirst');
    }
  } else if (ctrlKey && !shiftKey && !altKey && !metaKey && key === 'z') {
    event.preventDefault();
    const hasSelection = window.getSelection()?.toString().length;
    if (hasSelection) {
      executeCommand('extendSelDown');
    } else {
      executeCommand('jumpToLast');
    }
  } else if (ctrlKey && !shiftKey && !altKey && !metaKey && key === 'ArrowUp') {
    event.preventDefault();
    const isInSidebar = currentAdapter?.isInSidebar?.() ?? false;

    if (isInSidebar) {
      if (!event.repeat) {
        startSidebarNavHold('up');
      }
    } else if (currentAdapter?.startScroll) {
      currentAdapter.startScroll('up');
    }
  } else if (ctrlKey && !shiftKey && !altKey && !metaKey && key === 'ArrowDown') {
    event.preventDefault();
    const isInSidebar = currentAdapter?.isInSidebar?.() ?? false;

    if (isInSidebar) {
      if (!event.repeat) {
        startSidebarNavHold('down');
      }
    } else if (currentAdapter?.startScroll) {
      currentAdapter.startScroll('down');
    }
  } else if (ctrlKey && shiftKey && !altKey && !metaKey && key === 'ArrowUp') {
    event.preventDefault();
    executeCommand('prevUser');
  } else if (ctrlKey && shiftKey && !altKey && !metaKey && key === 'ArrowDown') {
    event.preventDefault();
    executeCommand('nextUser');
  } else if (ctrlKey && !shiftKey && !altKey && !metaKey && key === 'Enter') {
    event.preventDefault();
    const focused = document.querySelector('.kity-focus');
    if (focused instanceof HTMLElement) {
      focused.click();
    }
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  if (!isKityEnabled) {
    return;
  }

  const { key } = event;

  if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'Control' || key === 'Alt') {
    currentAdapter?.stopScroll?.();
    stopSidebarNavHold();
  }

  if (currentAdapter && 'resetCopyGlow' in currentAdapter && typeof currentAdapter.resetCopyGlow === 'function') {
    currentAdapter.resetCopyGlow();
  }
}

function startSidebarNavHold(direction: 'up' | 'down'): void {
  const command = direction === 'up' ? 'navigateUp' : 'navigateDown';

  if (sidebarNavDirection && sidebarNavDirection !== direction) {
    stopSidebarNavHold();
  }

  executeCommand(command);

  if (sidebarNavRepeatTimer !== null) {
    return;
  }

  sidebarNavDirection = direction;
  sidebarNavRepeatTimer = window.setInterval(() => executeCommand(command), SIDEBAR_NAV_REPEAT_MS);
}

function stopSidebarNavHold(): void {
  if (sidebarNavRepeatTimer !== null) {
    window.clearInterval(sidebarNavRepeatTimer);
    sidebarNavRepeatTimer = null;
  }

  sidebarNavDirection = null;
}
