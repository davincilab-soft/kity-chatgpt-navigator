/**
 * Gmail adapter for Kity browser extension
 * Handles navigation and interactions specific to Gmail
 */

import type { IAdapter } from '../../adapter.types';
import { setFocusRing, showToast } from '../../../common/dom';
import { GmailDOMExplorer } from './dom-explorer';
import { GmailSelectors } from './selectors';
import { SidebarNavigator } from './sidebar-navigator';

export class GmailAdapter implements IAdapter {
  id = 'gmail';
  supports = {
    sidebar: true,
    mainPane: true,
    input: true,
  };
  // Module instances
  private sidebarNavigator: SidebarNavigator;

  // State
  private lastFocusedPane: 'sidebar' | 'main' = 'main';

  constructor() {
    this.sidebarNavigator = new SidebarNavigator();
  }

  init(): void {
    // Add visual identifier in console
    console.log(
      '%c[Kity] Gmail adapter initialized',
      'color: #4CAF50; font-weight: bold; font-size: 14px;'
    );
    console.log('[Kity] Version: 1.0.0 | Site: Gmail | Adapter: gmail');

    // Expose DOM explorer for manual use
    GmailDOMExplorer.expose();
  }

  // ==================== Pane Navigation ====================

  focusSidebar(): void {
    this.sidebarNavigator.focusSidebar();
    this.lastFocusedPane = 'sidebar';
  }

  focusMain(): void {
    const main = GmailSelectors.getMain();
    if (main) {
      setFocusRing(main);
      this.lastFocusedPane = 'main';
    } else {
      showToast('No main pane found');
    }
  }

  // ==================== Navigation ====================

  navigateUp(): void {
    // TODO: Implement navigation up in email list
    showToast('Navigate up not implemented yet');
  }

  navigateDown(): void {
    // TODO: Implement navigation down in email list
    showToast('Navigate down not implemented yet');
  }

  // ==================== User Message Navigation ====================

  prevUser(): void {
    // TODO: Implement previous email navigation
    showToast('Previous email not implemented yet');
  }

  nextUser(): void {
    // TODO: Implement next email navigation
    showToast('Next email not implemented yet');
  }

  // ==================== Selection Extension ====================

  extendSelectionUp(): void {
    // TODO: Implement selection extension up
    showToast('Extend selection up not implemented yet');
  }

  extendSelectionDown(): void {
    // TODO: Implement selection extension down
    showToast('Extend selection down not implemented yet');
  }

  // ==================== Jump Navigation ====================

  jumpToFirst(): void {
    // TODO: Implement jump to first email
    showToast('Jump to first not implemented yet');
  }

  jumpToLast(): void {
    // TODO: Implement jump to last email
    showToast('Jump to last not implemented yet');
  }

  // ==================== Copying ====================

  copySelected(): void {
    // TODO: Implement email content copying
    showToast('Copy not implemented yet');
  }

  // ==================== Scrolling ====================

  startScroll?(direction: 'up' | 'down'): void {
    // TODO: Implement smooth scrolling
    console.log('[Kity] Start scroll:', direction);
  }

  stopScroll?(): void {
    // TODO: Implement scroll stop
    console.log('[Kity] Stop scroll');
  }
}
