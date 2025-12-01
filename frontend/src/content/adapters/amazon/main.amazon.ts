import type { IAdapter } from '../../adapter.types';
import { setFocusRing, showToast } from '../../../common/dom';
import { AmazonSelectors } from './selectors';
import { ScrollManager } from './scroll-manager';

export class AmazonAdapter implements IAdapter {
  id = 'amazon';
  supports = {
    sidebar: false,
    mainPane: true,
  };

  private scrollManager: ScrollManager;

  constructor() {
    this.scrollManager = new ScrollManager();
  }

  init(): void {
    console.log('%c[Kity] Amazon adapter initialized', 'color: #FF9900; font-weight: bold;');
  }

  startScroll(direction: 'up' | 'down'): void {
    this.scrollManager.startScroll(direction);
  }

  stopScroll(): void {
    this.scrollManager.stopScroll();
  }

  focusSidebar(): void {
    showToast('No sidebar navigation available');
  }

  focusMain(): void {
    const main = AmazonSelectors.getMain();
    if (main) {
      setFocusRing(main);
      window.setTimeout(() => main.classList.remove('kity-focus'), 400);
    } else {
      showToast('No main content found');
    }
  }
}
