/**
 * Claude Adapter - minimal scrolling support
 */

import type { IAdapter } from '../../adapter.types';
import { ClaudeScrollManager } from './claude-scroll-manager';

export class ClaudeAdapter implements IAdapter {
  id = 'claude';
  supports = {
    mainPane: true,
  };

  private scrollManager: ClaudeScrollManager;

  constructor() {
    this.scrollManager = new ClaudeScrollManager();
  }

  init(): void {
    console.log('[Kity] Claude adapter initialized');
  }

  startScroll(direction: 'up' | 'down'): void {
    this.scrollManager.startScroll(direction);
  }

  stopScroll(): void {
    this.scrollManager.stopScroll();
  }
}
