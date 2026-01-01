/**
 * Scroll management with acceleration and deceleration
 */

import { ChatGPTSelectors } from './selectors';

export class ScrollManager {
  private isScrolling = false;
  private scrollDirection: 'up' | 'down' | null = null;
  private scrollSpeed = 0;
  private scrollAnimationId: number | null = null;
  private readonly maxScrollSpeed = 50;
  private readonly scrollAcceleration = 2;
  private readonly scrollDeceleration = 3;

  /**
   * Start scrolling in the specified direction
   */
  startScroll(direction: 'up' | 'down'): void {
    this.scrollDirection = direction;
    this.isScrolling = true;

    // If animation is not already running, start it
    if (this.scrollAnimationId === null) {
      this.scrollSpeed = 0; // Start from zero for acceleration
      this.runScrollAnimation();
    }
  }

  /**
   * Stop scrolling (with deceleration)
   */
  stopScroll(): void {
    this.isScrolling = false;
    // Don't immediately stop - let deceleration happen in the animation loop
  }

  /**
   * Main scroll animation loop
   */
  private runScrollAnimation(): void {
    const container = ChatGPTSelectors.getScrollContainer();
    if (!container) {
      console.log('[Kity] Scroll container not found');
      this.scrollAnimationId = null;
      return;
    }

    // Accelerate or decelerate
    if (this.isScrolling) {
      // Accelerate up to max speed
      this.scrollSpeed = Math.min(this.scrollSpeed + this.scrollAcceleration, this.maxScrollSpeed);
    } else {
      // Decelerate
      this.scrollSpeed = Math.max(this.scrollSpeed - this.scrollDeceleration, 0);
    }

    // Apply scroll - try multiple methods for compatibility with virtual scrolling
    if (this.scrollSpeed > 0) {
      const delta = this.scrollDirection === 'down' ? this.scrollSpeed : -this.scrollSpeed;

      // Try scrollBy first (works better with some virtual scroll implementations)
      if ('scrollBy' in container && typeof container.scrollBy === 'function') {
        container.scrollBy(0, delta);
      } else {
        // Fallback to scrollTop
        container.scrollTop += delta;
      }
    }

    // Continue animation if still moving
    if (this.scrollSpeed > 0) {
      this.scrollAnimationId = requestAnimationFrame(() => this.runScrollAnimation());
    } else {
      // Animation stopped
      this.scrollAnimationId = null;
      this.scrollDirection = null;
    }
  }
}
