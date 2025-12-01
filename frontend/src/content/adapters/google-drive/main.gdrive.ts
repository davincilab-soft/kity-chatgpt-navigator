import type { IAdapter } from '../../adapter.types';
import { setFocusRing, showToast } from '../../../common/dom';
import { GoogleDriveSelectors } from './selectors';
import { ScrollManager } from './scroll-manager';

export class GoogleDriveAdapter implements IAdapter {
  id = 'gdrive';
  supports = {
    sidebar: false,
    mainPane: true,
  };

  private scrollManager: ScrollManager;

  constructor() {
    this.scrollManager = new ScrollManager();
  }

  init(): void {
    console.log('%c[Kity] Google Drive adapter initialized', 'color: #0F9D58; font-weight: bold;');
  }

  startScroll(direction: 'up' | 'down'): void {
    this.scrollManager.startScroll(direction);
  }

  stopScroll(): void {
    this.scrollManager.stopScroll();
  }

  focusSidebar(): void {
    showToast('No sidebar available on Google Drive');
  }

  focusMain(): void {
    const main = GoogleDriveSelectors.getMain();
    if (main) {
      setFocusRing(main);
      window.setTimeout(() => main.classList.remove('kity-focus'), 400);
    } else {
      showToast('No Drive view found');
    }
  }
}
