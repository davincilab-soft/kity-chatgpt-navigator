/**
 * ChatGPT Adapter - Main integration module
 */

import type { IAdapter } from '../../adapter.types';
import { setFocusRing, showToast } from '../../../common/dom';
import { ChatGPTSelectors } from './selectors';
import { ScrollManager } from './scroll-manager';
import { SidebarNavigator } from './sidebar-navigator';
import { UserMessageNavigator } from './user-message-navigator';
import { TextSelector } from './text-selector';
import { CodeCopier } from './code-copier';
import { Trackers } from './trackers';

export class ChatGPTAdapter implements IAdapter {
  id = 'gpt';
  supports = {
    sidebar: true,
    mainPane: true,
    input: true,
    userInputsNav: true,
  };

  // Module instances
  private scrollManager: ScrollManager;
  private sidebarNavigator: SidebarNavigator;
  private userMessageNavigator: UserMessageNavigator;
  private textSelector: TextSelector;
  private codeCopier: CodeCopier;
  private trackers: Trackers;

  // State
  private lastFocusedPane: 'sidebar' | 'main' = 'main';

  constructor() {
    this.scrollManager = new ScrollManager();
    this.sidebarNavigator = new SidebarNavigator();
    this.userMessageNavigator = new UserMessageNavigator();
    this.textSelector = new TextSelector();
    this.codeCopier = new CodeCopier();
    this.trackers = new Trackers();
  }

  init(): void {
    console.log('[Kity] ChatGPT adapter initialized');

    // Setup mouse tracking
    this.trackers.setupMouseTracking((x, y) => {
      this.codeCopier.updateMousePosition(x, y);
    });
  }

  // ==================== Pane Navigation ====================

  focusSidebar(): void {
    this.sidebarNavigator.focusSidebar();
    this.lastFocusedPane = 'sidebar';
  }

  focusMain(): void {
    const main = ChatGPTSelectors.getMain();
    if (main) {
      setFocusRing(main);
      this.lastFocusedPane = 'main';
    } else {
      showToast('No main pane found');
    }
  }

  // ==================== Sidebar Navigation ====================

  navigateUp(): void {
    this.sidebarNavigator.navigateUp();
  }

  navigateDown(): void {
    this.sidebarNavigator.navigateDown();
  }

  // ==================== User Message Navigation ====================

  prevUser(): void {
    this.userMessageNavigator.prevUser();
  }

  nextUser(): void {
    this.userMessageNavigator.nextUser();
  }

  // ==================== Jump Navigation ====================

  jumpToFirst(): void {
    // Reset if switching from user navigation
    this.userMessageNavigator.switchToGeneralNav();

    const main = ChatGPTSelectors.getMain();
    if (main) {
      // Find all messages, filtering out UI elements at the bottom
      const messages = ChatGPTSelectors.getAllMessages(150);

      if (messages.length > 0) {
        // Focus on the first message and scroll to its top
        setFocusRing(messages[0]);
        showToast('Earliest message');
      } else {
        showToast('No messages found');
      }
    } else {
      showToast('No main pane found');
    }
  }

  jumpToLast(): void {
    // Reset if switching from user navigation
    this.userMessageNavigator.switchToGeneralNav();

    const main = ChatGPTSelectors.getMain();
    if (main) {
      // Find all messages without bottom filtering first
      const allMessages = Array.from(
        main.querySelectorAll('[data-message-author-role], [data-message-id], article')
      ).filter((msg) => {
        // Only exclude obvious non-message elements (mode selector, thinking indicator)
        // by checking if they're within the input area (bottom 100px) AND don't have message attributes
        const rect = msg.getBoundingClientRect();
        const isInInputArea = rect.top > window.innerHeight - 100;
        const hasMessageRole = msg.hasAttribute('data-message-author-role') || msg.hasAttribute('data-message-id');

        // Keep if it has text content AND (has message attributes OR not in input area)
        return msg.textContent?.trim() && (hasMessageRole || !isInInputArea);
      });

      if (allMessages.length > 0) {
        // Focus on the last message and scroll to its bottom
        setFocusRing(allMessages[allMessages.length - 1]);
        showToast('Latest message');
      } else {
        showToast('No messages found');
      }
    } else {
      showToast('No main pane found');
    }
  }

  // ==================== Text Selection ====================

  extendSelectionUp(): void {
    this.textSelector.extendSelectionUp();
  }

  extendSelectionDown(): void {
    this.textSelector.extendSelectionDown();
  }

  // ==================== Code Copying ====================

  copySelected(): void {
    this.codeCopier.copySelected();
  }

  resetCopyGlow(): void {
    this.codeCopier.resetCopyState();
  }

  // ==================== Scrolling ====================

  startScroll(direction: 'up' | 'down'): void {
    this.scrollManager.startScroll(direction);
  }

  stopScroll(): void {
    this.scrollManager.stopScroll();
  }
}
