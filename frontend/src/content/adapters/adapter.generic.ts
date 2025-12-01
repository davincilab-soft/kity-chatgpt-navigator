import type { IAdapter } from '../adapter.types';
import { showToast, setFocusRing } from '../../common/dom';

export class GenericAdapter implements IAdapter {
  id = 'generic';
  supports = {
    mainPane: true,
  };

  init(): void {
    console.log('[Kity] Generic adapter initialized');
  }

  focusMain(): void {
    const main = document.querySelector('main') ||
                document.querySelector('[role="main"]') ||
                document.body;
    const firstFocusable = main.querySelector('a, button, input, textarea, [tabindex]');
    if (firstFocusable) {
      setFocusRing(firstFocusable);
    } else {
      showToast('No focusable element found');
    }
  }

  navigateUp(): void {
    const focused = document.querySelector('.kity-focus');
    if (focused?.previousElementSibling) {
      setFocusRing(focused.previousElementSibling);
    }
  }

  navigateDown(): void {
    const focused = document.querySelector('.kity-focus');
    if (focused?.nextElementSibling) {
      setFocusRing(focused.nextElementSibling);
    }
  }
}