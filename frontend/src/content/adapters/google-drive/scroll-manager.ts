import { GoogleDriveSelectors } from './selectors';

export class ScrollManager {
  private isScrolling = false;
  private scrollDirection: 'up' | 'down' | null = null;
  private scrollSpeed = 0;
  private scrollAnimationId: number | null = null;
  private readonly maxScrollSpeed = 50;
  private readonly scrollAcceleration = 2;
  private readonly scrollDeceleration = 3;

  startScroll(direction: 'up' | 'down'): void {
    this.scrollDirection = direction;
    this.isScrolling = true;

    if (this.scrollAnimationId === null) {
      this.scrollSpeed = 0;
      this.runScrollAnimation();
    }
  }

  stopScroll(): void {
    this.isScrolling = false;
  }

  private runScrollAnimation(): void {
    const scrollContainer = GoogleDriveSelectors.getScrollContainer();
    if (!scrollContainer) {
      console.warn('[Kity][GDrive] Scroll container not found');
      this.scrollAnimationId = null;
      return;
    }

    if (this.isScrolling) {
      this.scrollSpeed = Math.min(this.scrollSpeed + this.scrollAcceleration, this.maxScrollSpeed);
    } else {
      this.scrollSpeed = Math.max(this.scrollSpeed - this.scrollDeceleration, 0);
    }

    const isWindowScroll =
      scrollContainer === document.scrollingElement ||
      scrollContainer === document.documentElement ||
      scrollContainer === document.body;

    if (this.scrollDirection === 'up') {
      if (isWindowScroll) {
        window.scrollBy(0, -this.scrollSpeed);
      } else {
        (scrollContainer as HTMLElement).scrollTop -= this.scrollSpeed;
      }
    } else if (this.scrollDirection === 'down') {
      if (isWindowScroll) {
        window.scrollBy(0, this.scrollSpeed);
      } else {
        (scrollContainer as HTMLElement).scrollTop += this.scrollSpeed;
      }
    }

    if (this.scrollSpeed > 0) {
      this.scrollAnimationId = requestAnimationFrame(() => this.runScrollAnimation());
    } else {
      this.scrollAnimationId = null;
      this.scrollDirection = null;
    }
  }
}
