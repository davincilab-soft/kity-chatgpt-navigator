/**
 * Google Search adapter
 */

import type { IAdapter } from '../../adapter.types';
import { setFocusRing, showToast } from '../../../common/dom';
import { GoogleSearchSelectors } from './selectors';
import { ScrollManager } from './scroll-manager';

export class GoogleSearchAdapter implements IAdapter {
  id = 'google';
  supports = {
    sidebar: false,
    mainPane: true,
    input: false,
  };

  private scrollManager: ScrollManager;

  constructor() {
    this.scrollManager = new ScrollManager();
  }

  init(): void {
    console.log('%c[Kity] Google Search adapter initialized', 'color: #4285F4; font-weight: bold;');
  }

  startScroll(direction: 'up' | 'down'): void {
    this.scrollManager.startScroll(direction);
  }

  stopScroll(): void {
    this.scrollManager.stopScroll();
  }

  focusSidebar(): void {
    showToast('No sidebar available on Google Search');
  }

  focusMain(): void {
    const main = GoogleSearchSelectors.getMain();
    if (main) {
      setFocusRing(main);
      window.setTimeout(() => {
        main.classList.remove('kity-focus');
      }, 400);
    } else {
      showToast('No results area found');
    }
  }
}
