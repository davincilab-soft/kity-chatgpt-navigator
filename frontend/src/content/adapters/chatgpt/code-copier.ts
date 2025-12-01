/**
 * Code block copying logic with mouse tracking
 */

import { showToast } from '../../../common/dom';
import { ChatGPTSelectors } from './selectors';

type CopyStrategyOrigin = 'cursor' | 'fallback';
type CopyStrategy =
  | { type: 'text'; message: Element; origin: CopyStrategyOrigin }
  | { type: 'code'; message: Element; block: Element; origin: CopyStrategyOrigin };

export class CodeCopier {
  private mouseX = 0;
  private mouseY = 0;
  private hasMouseMoved = false; // Track if mouse has moved at least once
  private readonly DISTANCE_THRESHOLD = 150; // pixels
  private readonly MIN_HIGHLIGHT_DURATION = 200; // milliseconds
  private highlightTimeout: number | null = null;
  private hasCopied = false;
  private currentHighlightedResponse: Element | null = null;
  private currentGlowElement: Element | null = null;
  private lastCopyStrategy: CopyStrategy | null = null;
  private lastCopyMouseX = 0;
  private lastCopyMouseY = 0;
  private lastCopyScrollPosition = 0;
  private lastCursorElement: Element | null = null;

  constructor() {
    // No dependencies needed
  }

  /**
   * Update mouse cursor position
   */
  updateMousePosition(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
    this.hasMouseMoved = true;
  }

  /**
   * Reset the copy state when key is released
   */
  resetCopyState(): void {
    // Don't start the timeout if we haven't copied yet
    if (!this.hasCopied) {
      return;
    }

    // Only set the timeout if one isn't already running
    if (this.highlightTimeout) {
      return;
    }

    // Set a minimum display time for the highlight
    this.highlightTimeout = window.setTimeout(() => {
      // Remove glow effect from all code blocks
      document.querySelectorAll('.kity-code-copied').forEach(el => {
        el.classList.remove('kity-code-copied');
      });

      // Remove response highlight
      this.clearResponseHighlight();

      this.highlightTimeout = null;
      this.hasCopied = false;
    }, this.MIN_HIGHLIGHT_DURATION);
  }

  /**
   * Copy code or text from the message under cursor, or copy selected text if any
   */
  copySelected(): void {
    console.log('[Kity] copySelected called');

    // If already copied during this key hold, don't copy again
    if (this.hasCopied) {
      console.log('[Kity] Already copied during this key hold');
      return;
    }

    // Check if user has manually selected text (ignore programmatic selections)
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selection && selection.rangeCount > 0) {
      // Check if the selection is inside a code block or the message we're trying to copy
      // If so, ignore it and proceed with canvas copy
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;

      // Check if selection is inside a code block (pre element)
      let current = container.parentElement;
      let isInCodeBlock = false;
      while (current && current !== document.body) {
        if (current.tagName === 'PRE') {
          isInCodeBlock = true;
          break;
        }
        current = current.parentElement;
      }

      // If user selected text outside code blocks, copy that selection
      if (!isInCodeBlock) {
        console.log('[Kity] User has selected text, copying selection');
        this.copyTextToClipboard(selectedText);
        this.hasCopied = true;
        return;
      }

      // Otherwise, ignore the selection and continue with canvas copy
      console.log('[Kity] Selection is inside code block, ignoring and using canvas copy');
    }

    // No text selected (or selection inside code block), use cursor-based copying
    console.log('[Kity] No text selected, using cursor-based copying');

    const cursorMessage = this.getMessageAtCursor();

    if (!cursorMessage) {
      const cachedStrategy = this.getCachedStrategy();
      if (cachedStrategy) {
        console.log('[Kity] Reusing last copy target');
        this.executeCopyStrategy(cachedStrategy);
        return;
      }
    }

    const targetMessage =
      cursorMessage ||
      this.getFocusedMessage() ||
      this.getBestViewportMessage();

    if (!targetMessage) {
      console.log('[Kity] No target message resolved for copy');
      return;
    }

    console.log('[Kity] Resolved message for copy');

    const strategy = this.determineCopyStrategy(targetMessage, cursorMessage);
    this.executeCopyStrategy(strategy);
    this.cacheStrategy(strategy);
  }

  /**
   * Get the message element directly under the cursor
   * Returns null if cursor is not over a valid message
   */
  private getMessageAtCursor(): Element | null {
    const element = this.resolveElementAtCursor();
    let message: Element | null = null;

    if (element) {
      this.lastCursorElement = element;
      if (!this.hasMouseMoved) {
        const rect = element.getBoundingClientRect();
        this.mouseX = rect.left + rect.width / 2;
        this.mouseY = rect.top + rect.height / 2;
        this.hasMouseMoved = true;
      }
      message = ChatGPTSelectors.findParentMessage(element as HTMLElement);
    } else {
      this.lastCursorElement = null;
    }

    if (!message && this.isCursorInMainPane()) {
      message = this.getMessageByCursorY();
    }

    if (message) {
      const role = message.getAttribute('data-message-author-role') ?? 'message';
      console.log(`[Kity] Found ${role} message at cursor`);
    } else {
      console.log('[Kity] No message container found at cursor');
    }

    return message;
  }

  private resolveElementAtCursor(): Element | null {
    if (this.hasMouseMoved) {
      return document.elementFromPoint(this.mouseX, this.mouseY);
    }

    const hovered = document.querySelectorAll(':hover');
    if (hovered.length > 0) {
      return hovered[hovered.length - 1] as Element;
    }

    return null;
  }

  private getMessageByCursorY(): Element | null {
    const messages = ChatGPTSelectors.getAllMessages();
    if (!messages.length) {
      return null;
    }

    const screenWidth = window.innerWidth;
    const safeX = Math.min(Math.max(this.mouseX, 0), screenWidth);

    for (const msg of messages) {
      if (!msg.isConnected) {
        continue;
      }

      const rect = msg.getBoundingClientRect();
      if (this.mouseY >= rect.top && this.mouseY <= rect.bottom) {
        const paddedLeft = rect.left - 200;
        const paddedRight = rect.right + 200;
        if (safeX >= paddedLeft && safeX <= paddedRight) {
          return msg;
        }
      }
    }

    return null;
  }

  private isCursorInMainPane(): boolean {
    const main = ChatGPTSelectors.getMain();
    if (!main) {
      return false;
    }

    const rect = main.getBoundingClientRect();
    return this.mouseY >= rect.top && this.mouseY <= rect.bottom;
  }

  /**
   * Get currently focused message element if available
   */
  private getFocusedMessage(): Element | null {
    const focused = document.querySelector('.kity-focus');
    if (!focused) {
      return null;
    }

    if (ChatGPTSelectors.isMessageElement(focused)) {
      return focused;
    }

    if (focused instanceof HTMLElement) {
      const parentMessage = ChatGPTSelectors.findParentMessage(focused);
      if (parentMessage) {
        return parentMessage;
      }
    }

    return null;
  }

  /**
   * Pick the most visible message when cursor/focus are unavailable
   */
  private getBestViewportMessage(): Element | null {
    const messages = ChatGPTSelectors.getAllMessages();
    if (!messages.length) {
      return null;
    }

    const viewportCenter = window.innerHeight / 2;
    const coveragePreference = 0.05; // if coverage differs by less than this, prefer closer to center

    let bestMessage: Element | null = null;
    let bestCoverage = -1;
    let bestDistance = Infinity;

    messages.forEach((msg) => {
      if (!msg.isConnected) {
        return;
      }

      const rect = msg.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        return; // not visible
      }

      const visibleHeight = this.getVisibleHeight(msg);
      if (visibleHeight <= 0) {
        return;
      }

      const coverage = visibleHeight / window.innerHeight;
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportCenter);

      const coverageImproved = coverage > bestCoverage + coveragePreference;
      const coverageComparable = Math.abs(coverage - bestCoverage) <= coveragePreference;

      if (coverageImproved || (coverageComparable && distance < bestDistance)) {
        bestMessage = msg;
        bestCoverage = coverage;
        bestDistance = distance;
      }
    });

    if (bestMessage) {
      console.log('[Kity] Using best-viewport message fallback');
    }

    return bestMessage;
  }

  /**
   * Determine whether to copy message text or a specific code block
   */
  private determineCopyStrategy(selectedMessage: Element, cursorMessage: Element | null): CopyStrategy {
    const codeBlocks = Array.from(selectedMessage.querySelectorAll('pre'));
    const origin: CopyStrategyOrigin = cursorMessage === selectedMessage ? 'cursor' : 'fallback';

    if (origin === 'fallback' || codeBlocks.length === 0) {
      return { type: 'text', message: selectedMessage, origin };
    }

    const cursorIsInMessage = origin === 'cursor';
    if (cursorIsInMessage) {
      const cursorBlock = this.getCodeBlockAtCursor(codeBlocks);
      if (cursorBlock) {
        console.log('[Kity] Cursor inside code block, prioritizing canvas copy');
        return { type: 'code', message: selectedMessage, block: cursorBlock, origin };
      }

      console.log('[Kity] Cursor inside message text, copying full message');
      return { type: 'text', message: selectedMessage, origin };
    }

    const { messageHeight, codeHeight } = this.measureVisibleContent(selectedMessage, codeBlocks);
    const plainHeight = Math.max(0, messageHeight - codeHeight);

    if (plainHeight >= codeHeight) {
      return { type: 'text', message: selectedMessage, origin };
    }

    const dominantBlock = this.selectLargestVisibleCodeBlock(codeBlocks) || this.selectCodeBlockByViewport(codeBlocks) || codeBlocks[0];
    return {
      type: 'code',
      message: selectedMessage,
      block: dominantBlock,
      origin,
    };
  }

  /**
   * Execute the chosen copy strategy
   */
  private executeCopyStrategy(strategy: CopyStrategy): void {
    this.hasCopied = true;

    if (strategy.type === 'text') {
      this.copyFullMessage(strategy.message);
      return;
    }

    const codeBlocks = Array.from(strategy.message.querySelectorAll('pre'));
    if (codeBlocks.length === 0) {
      console.warn('[Kity] Expected code blocks but none found, copying full message instead');
      this.copyFullMessage(strategy.message);
      return;
    }

    const highlightCodeOnly = strategy.origin === 'cursor';
    this.copyCodeBlock(codeBlocks, strategy.message, strategy.block, highlightCodeOnly);
  }

  /**
   * Cache the last strategy so it can be reused if viewport state is unchanged
   */
  private cacheStrategy(strategy: CopyStrategy): void {
    this.lastCopyStrategy = strategy;
    this.lastCopyMouseX = this.mouseX;
    this.lastCopyMouseY = this.mouseY;
    this.lastCopyScrollPosition = this.getScrollPosition();
  }

  private getCachedStrategy(): CopyStrategy | null {
    if (!this.lastCopyStrategy) {
      return null;
    }

    const sameMouse = this.lastCopyMouseX === this.mouseX && this.lastCopyMouseY === this.mouseY;
    const sameScroll = this.lastCopyScrollPosition === this.getScrollPosition();
    const messageConnected = this.lastCopyStrategy.message.isConnected;
    const blockConnected =
      this.lastCopyStrategy.type === 'code'
        ? this.lastCopyStrategy.block.isConnected
        : true;

    if (sameMouse && sameScroll && messageConnected && blockConnected) {
      return this.lastCopyStrategy;
    }

    return null;
  }

  private getScrollPosition(): number {
    const container = ChatGPTSelectors.getScrollContainer();
    if (container) {
      return container.scrollTop;
    }

    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  /**
   * Copy a code block from the selected message
   */
  private copyCodeBlock(
    codeBlocks: Element[],
    selectedMessage: Element,
    preferredBlock: Element | null,
    highlightCodeOnly: boolean
  ): void {
    console.log('[Kity] Found', codeBlocks.length, 'code blocks');

    let targetBlock: Element | null = preferredBlock || null;

    if (!targetBlock) {
      if (codeBlocks.length === 1) {
        targetBlock = codeBlocks[0];
      } else {
        targetBlock = this.selectCodeBlockByMouse(codeBlocks);
      }
    }

    if (!targetBlock) {
      targetBlock = codeBlocks[0];
    }

    if (targetBlock) {
      // Calculate the actual index within code blocks only
      const blockIndex = codeBlocks.indexOf(targetBlock as HTMLPreElement) + 1;
      const totalCodeBlocks = codeBlocks.length;

      if (highlightCodeOnly) {
        this.clearResponseHighlight();
      } else {
        this.highlightResponse(selectedMessage);
      }
      this.applyGlitterEffect(targetBlock);

      // Try to find the copy button near this code block
      const copyButton = ChatGPTSelectors.findCopyButton(targetBlock);

      if (copyButton) {
        console.log('[Kity] Found copy button, clicking it');

        // Click the button to trigger native copy
        (copyButton as HTMLElement).click();

        // Wait a bit for the native copy to complete, then show our toast
        setTimeout(() => {
          showToast(totalCodeBlocks > 1
            ? `Copied canvas ${blockIndex}/${totalCodeBlocks}`
            : 'Copied canvas');
        }, 50);
        return;
      } else {
        console.log('[Kity] No copy button found, falling back to text extraction');
        // Fallback: copy text directly
        const textToCopy = targetBlock.textContent?.trim() || '';
        if (textToCopy) {
          const toastMessage =
            totalCodeBlocks > 1
              ? `Copied canvas ${blockIndex}/${totalCodeBlocks}`
              : 'Copied canvas';
          this.copyTextToClipboard(textToCopy, toastMessage);
          return;
        }
      }
    }
  }

  /**
   * Determine which portion of the message is most visible
   */
  private measureVisibleContent(message: Element, codeBlocks: Element[]): { messageHeight: number; codeHeight: number } {
    const messageHeight = this.getVisibleHeight(message);

    let codeHeight = 0;
    codeBlocks.forEach((block) => {
      codeHeight += this.getVisibleHeight(block);
    });

    // Clamp code height so it doesn't exceed message height
    codeHeight = Math.min(codeHeight, messageHeight);

    return { messageHeight, codeHeight };
  }

  private getVisibleHeight(element: Element): number {
    const rect = element.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, window.innerHeight);
    return Math.max(0, visibleBottom - visibleTop);
  }

  private selectLargestVisibleCodeBlock(codeBlocks: Element[]): Element | null {
    let targetBlock: Element | null = null;
    let maxVisibleHeight = 0;

    codeBlocks.forEach((block) => {
      const visibleHeight = this.getVisibleHeight(block);
      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        targetBlock = block;
      }
    });

    return targetBlock;
  }

  private getCodeBlockAtCursor(codeBlocks: Element[]): Element | null {
    const matchByY = (block: Element): boolean => {
      const rect = block.getBoundingClientRect();
      return this.mouseY >= rect.top && this.mouseY <= rect.bottom;
    };

    if (this.hasMouseMoved) {
      for (const block of codeBlocks) {
        if (matchByY(block)) {
          return block;
        }
      }
    }

    if (this.lastCursorElement instanceof HTMLElement) {
      const hoveredBlock = ChatGPTSelectors.findParentCodeBlock(this.lastCursorElement);
      if (hoveredBlock && codeBlocks.includes(hoveredBlock)) {
        return hoveredBlock;
      }
    }

    return null;
  }

  /**
   * Select the appropriate code block based on mouse position
   */
  private selectCodeBlockByMouse(codeBlocks: Element[]): Element | null {
    let targetBlock: Element | null = this.getCodeBlockAtCursor(codeBlocks);

    if (targetBlock) {
      console.log('[Kity] Mouse is inside code block');
      return targetBlock;
    }

    // If mouse is not inside any block, find the closest one
    if (!targetBlock) {
      let minDistance = Infinity;

      codeBlocks.forEach((block, index) => {
        const rect = block.getBoundingClientRect();

        // Calculate distance from mouse cursor to the nearest edge of the code block
        const closestX = Math.max(rect.left, Math.min(this.mouseX, rect.right));
        const closestY = Math.max(rect.top, Math.min(this.mouseY, rect.bottom));
        const distance = Math.sqrt(
          Math.pow(closestX - this.mouseX, 2) +
          Math.pow(closestY - this.mouseY, 2)
        );

        console.log(`[Kity] Code block ${index + 1} distance from mouse:`, distance);
        if (distance < minDistance) {
          minDistance = distance;
          targetBlock = block;
        }
      });

      // If the closest block is still too far away (mouse is between blocks or on text),
      // fall back to using the block closest to viewport center
      if (minDistance > this.DISTANCE_THRESHOLD) {
        console.log('[Kity] Mouse too far from any block, using viewport center');
        targetBlock = this.selectCodeBlockByViewport(codeBlocks);
      }
    }

    return targetBlock;
  }

  /**
   * Select code block closest to viewport center
   */
  private selectCodeBlockByViewport(codeBlocks: Element[]): Element | null {
    let targetBlock: Element | null = null;
    let minDistance = Infinity;
    const viewportCenterY = window.innerHeight / 2;

    codeBlocks.forEach((block) => {
      const rect = block.getBoundingClientRect();
      const blockCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(blockCenterY - viewportCenterY);

      if (distance < minDistance) {
        minDistance = distance;
        targetBlock = block;
      }
    });

    return targetBlock;
  }

  /**
   * Copy the full message text
   */
  private copyFullMessage(selectedMessage: Element): void {
    console.log('[Kity] No code blocks found, copying full message');
    const textToCopy = selectedMessage.textContent || '';

    if (!textToCopy.trim()) {
      console.log('[Kity] Selected message is empty');
      showToast('Selected message is empty');
      return;
    }

    this.highlightResponse(selectedMessage);
    const toastMessage = this.buildMessageCopyToast(selectedMessage);
    this.copyTextToClipboard(textToCopy.trim(), toastMessage);
  }

  private buildMessageCopyToast(message: Element): string {
    const role = this.getMessageRole(message);
    if (role !== 'assistant' && role !== 'user') {
      return 'Copied';
    }

    const messages = ChatGPTSelectors.getAllMessages();
    const roleMessages = messages.filter((msg) => this.getMessageRole(msg) === role);
    const index = roleMessages.indexOf(message);
    const position = index >= 0 ? index + 1 : roleMessages.length || 1;
    const total = roleMessages.length || position;

    if (role === 'assistant') {
      return `Copied response ${position}/${total}`;
    }

    return `Copied request ${position}/${total}`;
  }

  private getMessageRole(message: Element): string {
    const direct = message.getAttribute('data-message-author-role');
    if (direct) {
      return direct.toLowerCase();
    }

    const idAttr = message.getAttribute('data-message-id');
    if (idAttr && idAttr.startsWith('assistant-')) {
      return 'assistant';
    }
    if (idAttr && idAttr.startsWith('user-')) {
      return 'user';
    }

    return (message.getAttribute('role') || '').toLowerCase();
  }

  /**
   * Copy text to clipboard using multiple methods
   */
  private copyTextToClipboard(text: string, toastMessage = 'Copied'): void {
    console.log('[Kity] Text to copy:', text.substring(0, 100) + '...');

    // Copy to clipboard using multiple methods for better compatibility
    try {
      const showSuccess = (): void => {
        showToast(toastMessage);
      };

      // Method 1: Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          console.log('[Kity] Copied successfully via clipboard API');
          showSuccess();
        }).catch((err) => {
          console.error('[Kity] Clipboard API failed:', err);
          // Fallback to execCommand
          this.copyUsingExecCommand(text, toastMessage);
        });
      } else {
        // Fallback to execCommand
        console.log('[Kity] Clipboard API not available, using execCommand');
        this.copyUsingExecCommand(text, toastMessage);
      }
    } catch (err) {
      console.error('[Kity] Copy failed:', err);
      showToast('Failed to copy');
    }
  }

  /**
   * Copy text using legacy execCommand method
   */
  private copyUsingExecCommand(text: string, successMessage = 'Copied'): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('[Kity] Copied successfully via execCommand');
        showToast(successMessage);
      } else {
        console.error('[Kity] execCommand copy failed');
        showToast('Failed to copy');
      }
    } catch (err) {
      console.error('[Kity] execCommand error:', err);
      showToast('Failed to copy');
    } finally {
      document.body.removeChild(textarea);
    }
  }

  /**
   * Apply green highlight animation to code block
   */
  private applyGlitterEffect(element: Element): void {
    // Store the current glow element
    this.currentGlowElement = element;

    // Add the green highlight animation class (stays until key release)
    element.classList.add('kity-code-copied');
  }

  /**
   * Highlight the copied response element
   */
  private highlightResponse(message: Element): void {
    const target = this.getHighlightTarget(message);

    if (this.currentHighlightedResponse !== target) {
      this.clearResponseHighlight();
      this.currentHighlightedResponse = target;
    }

    target.classList.add('kity-response-copied');
  }

  private clearResponseHighlight(): void {
    if (this.currentHighlightedResponse) {
      this.currentHighlightedResponse.classList.remove('kity-response-copied');
      this.currentHighlightedResponse = null;
    }
  }

  /**
   * Prefer the smallest content container for highlight so the glow matches text width
   */
  private getHighlightTarget(message: Element): Element {
    const preferSelectors = [
      '.markdown',
      '.prose',
      '[data-message-author-role] .whitespace-pre-wrap',
      '[data-message-author-role] .text-base',
    ];

    for (const selector of preferSelectors) {
      const el = message.querySelector(selector);
      if (el) return el;
    }

    const nonEmptyDiv = Array.from(message.querySelectorAll('div')).find(
      (el) => el.textContent?.trim()
    );
    return nonEmptyDiv ?? message;
  }
}
