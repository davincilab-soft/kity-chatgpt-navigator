/**
 * Mouse and click tracking for ChatGPT interface
 */

import { ChatGPTSelectors } from './selectors';

export class Trackers {
  private onMessageClick?: (message: Element) => void;
  private onMouseMove?: (x: number, y: number) => void;

  /**
   * Setup click tracking for messages and code blocks
   */
  setupClickTracking(onMessageClick: (message: Element) => void): void {
    this.onMessageClick = onMessageClick;

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Check if clicked on or within a code block
      const codeBlock = ChatGPTSelectors.findParentCodeBlock(target);
      if (codeBlock) {
        console.log('[Kity] Clicked code block tracked');
      }

      // Find if the clicked element is within a message
      const messageElement = ChatGPTSelectors.findParentMessage(target);

      if (messageElement) {
        this.onMessageClick?.(messageElement);
        console.log('[Kity] Clicked message tracked:', messageElement.getAttribute('data-message-author-role'));
      } else {
        console.log('[Kity] Click target:', target.tagName, target.className);
      }
    });
  }

  /**
   * Setup mouse movement tracking
   */
  setupMouseTracking(onMouseMove: (x: number, y: number) => void): void {
    this.onMouseMove = onMouseMove;

    document.addEventListener('mousemove', (event) => {
      this.onMouseMove?.(event.clientX, event.clientY);
    });
  }
}
