import type { IAdapter } from '../../adapter.types';
import { setFocusRing, showToast } from '../../../common/dom';
import { WikipediaSelectors } from './selectors';
import { ScrollManager } from './scroll-manager';

export class WikipediaAdapter implements IAdapter {
  id = 'wpedia';
  supports = {
    sidebar: false,
    mainPane: true,
  };

  private scrollManager: ScrollManager;

  constructor() {
    this.scrollManager = new ScrollManager();
  }

  init(): void {
    console.log('%c[Kity] Wikipedia adapter initialized', 'color: #3366cc; font-weight: bold;');
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
    const main = WikipediaSelectors.getMain();
    if (main) {
      setFocusRing(main);
      window.setTimeout(() => main.classList.remove('kity-focus'), 400);
    } else {
      showToast('No article content found');
    }
  }
}
