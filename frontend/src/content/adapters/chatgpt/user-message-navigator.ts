/**
 * User message navigation logic for ChatGPT interface
 */

import { setFocusRing, showToast, showMessageCounter } from '../../../common/dom';
import { ChatGPTSelectors } from './selectors';

export class UserMessageNavigator {
  private currentIndex = 0;
  private userMessages: Element[] = [];
  private isInUserNavMode = false;
  private lastNavType: 'user' | 'general' | null = null;

  /**
   * Refresh the list of user messages
   */
  refreshUserMessages(): void {
    this.userMessages = ChatGPTSelectors.getUserMessages();
  }

  /**
   * Enter user navigation mode
   */
  enterUserNavMode(): void {
    this.isInUserNavMode = true;
    this.refreshUserMessages();

    if (this.userMessages.length === 0) {
      showToast('No user messages');
      return;
    }

    // Find current focus
    const currentFocus = document.querySelector('.kity-focus');

    // Check if current focus is already a user message
    if (currentFocus) {
      const focusedIndex = this.userMessages.indexOf(currentFocus as Element);

      if (focusedIndex >= 0) {
        // Current focus is already a user message, keep it
        this.currentIndex = focusedIndex;
      } else {
        // Current focus is not a user message (e.g., main pane or sidebar)
        // Find the closest message to the current focus
        let closestIndex = 0;
        let minDistance = Infinity;

        const focusRect = currentFocus.getBoundingClientRect();

        this.userMessages.forEach((msg, idx) => {
          const msgRect = msg.getBoundingClientRect();
          const distance = Math.abs(msgRect.top - focusRect.top);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        });

        this.currentIndex = closestIndex;
      }
    } else {
      // No focus, start from last user message
      this.currentIndex = this.userMessages.length - 1;
    }

    const targetMessage = this.userMessages[this.currentIndex];
    if (targetMessage && targetMessage.isConnected) {
      setFocusRing(targetMessage);
      // Show counter: currentIndex is 0-based, so add 1 for display
      showMessageCounter(this.currentIndex + 1, this.userMessages.length);
    } else {
      console.error('[Kity] Target message not found or not in DOM');
      showToast('Error: Cannot focus message');
    }
  }

  /**
   * Exit user navigation mode
   */
  exitUserNavMode(): void {
    this.isInUserNavMode = false;
  }

  /**
   * Navigate to previous user message
   */
  prevUser(): void {
    // Reset if switching from general navigation
    if (this.lastNavType === 'general') {
      this.exitUserNavMode();
    }
    this.lastNavType = 'user';

    if (!this.isInUserNavMode) {
      this.enterUserNavMode();
      return; // enterUserNavMode already sets focus, so return
    }

    // Find currently focused message before refreshing
    const currentFocus = document.querySelector('.kity-focus');

    // Refresh messages list to catch any new messages
    this.refreshUserMessages();

    if (this.userMessages.length === 0) {
      showToast('No user messages');
      return;
    }

    // Re-sync currentIndex by finding the focused element in the new list
    if (currentFocus) {
      const newIndex = this.userMessages.findIndex(msg => msg === currentFocus || msg.contains(currentFocus));
      if (newIndex !== -1) {
        this.currentIndex = newIndex;
        // Re-apply focus ring to ensure it's highlighted after refresh
        setFocusRing(this.userMessages[this.currentIndex]);
      }
    }

    if (this.currentIndex > 0) {
      this.currentIndex--;
      const targetMessage = this.userMessages[this.currentIndex];
      if (targetMessage && targetMessage.isConnected) {
        setFocusRing(targetMessage);
        // Show counter: currentIndex is 0-based, so add 1 for display
        showMessageCounter(this.currentIndex + 1, this.userMessages.length);
      } else {
        console.error('[Kity] Target message not found or not in DOM');
        showToast('Error: Cannot focus message');
      }
    }
  }

  /**
   * Navigate to next user message
   */
  nextUser(): void {
    // Reset if switching from general navigation
    if (this.lastNavType === 'general') {
      this.exitUserNavMode();
    }
    this.lastNavType = 'user';

    if (!this.isInUserNavMode) {
      this.enterUserNavMode();
      return; // enterUserNavMode already sets focus, so return
    }

    // Find currently focused message before refreshing
    const currentFocus = document.querySelector('.kity-focus');

    // Refresh messages list to catch any new messages
    this.refreshUserMessages();

    if (this.userMessages.length === 0) {
      showToast('No user messages');
      return;
    }

    // Re-sync currentIndex by finding the focused element in the new list
    if (currentFocus) {
      const newIndex = this.userMessages.findIndex(msg => msg === currentFocus || msg.contains(currentFocus));
      if (newIndex !== -1) {
        this.currentIndex = newIndex;
        // Re-apply focus ring to ensure it's highlighted after refresh
        setFocusRing(this.userMessages[this.currentIndex]);
      }
    }

    if (this.currentIndex < this.userMessages.length - 1) {
      this.currentIndex++;
      const targetMessage = this.userMessages[this.currentIndex];
      if (targetMessage && targetMessage.isConnected) {
        setFocusRing(targetMessage);
        // Show counter: currentIndex is 0-based, so add 1 for display
        showMessageCounter(this.currentIndex + 1, this.userMessages.length);
      } else {
        console.error('[Kity] Target message not found or not in DOM');
        showToast('Error: Cannot focus message');
      }
    }
  }

  /**
   * Mark navigation as switching to general mode
   */
  switchToGeneralNav(): void {
    this.lastNavType = 'general';
  }
}
