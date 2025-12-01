/**
 * Text selection logic for ChatGPT messages
 */

import { showToast } from '../../../common/dom';
import { ChatGPTSelectors } from './selectors';

export class TextSelector {
  private lastClickedMessage: Element | null = null;

  /**
   * Set the last clicked message
   */
  setLastClickedMessage(message: Element | null): void {
    this.lastClickedMessage = message;
  }

  /**
   * Select/deselect text in a message
   */
  selectText(): void {
    let targetMessage: Element | null = null;

    // Priority 1: If user clicked on a message, use that
    if (this.lastClickedMessage && document.body.contains(this.lastClickedMessage)) {
      targetMessage = this.lastClickedMessage;
    } else {
      // Priority 2: Find the message closest to viewport center (assistant only)
      const main = ChatGPTSelectors.getMain();
      if (!main) {
        showToast('No main pane found');
        return;
      }

      // Get all messages (both assistant and user)
      const allMessages = main.querySelectorAll('[data-message-author-role]');
      const messages = Array.from(allMessages).filter((msg) => {
        const rect = msg.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Include messages that are at least partially visible
        // Only exclude messages that are completely below the viewport or have no content
        const isVisible = rect.top < windowHeight && rect.bottom > 0;
        const hasContent = msg.textContent && msg.textContent.trim().length > 0;

        return isVisible && hasContent;
      });

      if (messages.length === 0) {
        showToast('No messages found');
        return;
      }

      // Find the first message that's currently visible in the viewport (center of screen)
      const viewportCenter = window.innerHeight / 2;
      let minDistance = Infinity;

      for (const msg of messages) {
        const rect = msg.getBoundingClientRect();
        const msgCenter = rect.top + rect.height / 2;
        const distance = Math.abs(msgCenter - viewportCenter);

        // Check if message is at least partially visible
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          if (distance < minDistance) {
            minDistance = distance;
            targetMessage = msg;
          }
        }
      }

      if (!targetMessage) {
        showToast('No visible message');
        return;
      }
    }

    // Toggle selection on the target message
    if (targetMessage.classList.contains('kity-selected')) {
      targetMessage.classList.remove('kity-selected');
      showToast('Text deselected');
    } else {
      // Remove previous selection
      document.querySelectorAll('.kity-selected').forEach(el => el.classList.remove('kity-selected'));
      // Add selection to target message
      targetMessage.classList.add('kity-selected');
    }
  }

  /**
   * Extend text selection up (line-based)
   */
  extendSelectionUp(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parent = container.parentElement;
    if (!parent) return;

    // Find the previous text sibling
    const prev = this.getPreviousTextSibling(container);
    if (prev) {
      range.setStartBefore(prev);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /**
   * Extend text selection down (line-based)
   */
  extendSelectionDown(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Find the next text sibling
    const next = this.getNextTextSibling(container);
    if (next) {
      range.setEndAfter(next);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /**
   * Get previous text sibling node
   */
  private getPreviousTextSibling(node: Node): Node | null {
    let prev = node.previousSibling;
    while (prev && prev.nodeType !== Node.TEXT_NODE) {
      prev = prev.previousSibling;
    }
    return prev;
  }

  /**
   * Get next text sibling node
   */
  private getNextTextSibling(node: Node): Node | null {
    let next = node.nextSibling;
    while (next && next.nodeType !== Node.TEXT_NODE) {
      next = next.nextSibling;
    }
    return next;
  }
}
