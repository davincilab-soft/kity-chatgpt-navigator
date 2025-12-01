export function showToast(message: string, duration = 2000): void {
  // Remove any existing toasts first
  const existingToasts = document.querySelectorAll('.kity-toast');
  existingToasts.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'kity-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

let messageCounterTimeout: number | null = null;

export function showMessageCounter(current: number, total: number, duration = 1500): void {
  // Remove existing counter if any
  const existingCounter = document.querySelector('.kity-message-counter');
  if (existingCounter) {
    existingCounter.remove();
  }

  // Clear existing timeout
  if (messageCounterTimeout !== null) {
    clearTimeout(messageCounterTimeout);
  }

  const counter = document.createElement('div');
  counter.className = 'kity-message-counter';
  counter.textContent = `${current} of ${total} messages`;
  document.body.appendChild(counter);

  setTimeout(() => counter.classList.add('show'), 10);
  messageCounterTimeout = window.setTimeout(() => {
    counter.classList.remove('show');
    setTimeout(() => counter.remove(), 200);
    messageCounterTimeout = null;
  }, duration);
}

export function scrollIntoView(element: Element, block: ScrollLogicalPosition = 'center'): void {
  element.scrollIntoView({ behavior: 'smooth', block });
}

let focusRingTimeout: number | null = null;

export function setFocusRing(element: Element): void {
  if (!element || !element.isConnected) {
    console.warn('[Kity] Cannot set focus ring: element not in DOM');
    return;
  }

  // Clear any existing timeout
  if (focusRingTimeout !== null) {
    clearTimeout(focusRingTimeout);
    focusRingTimeout = null;
  }

  // Remove existing focus rings
  document.querySelectorAll('.kity-focus').forEach(el => el.classList.remove('kity-focus'));

  // Add focus ring to element immediately
  element.classList.add('kity-focus');

  // Force a reflow to ensure the class is applied
  void element.getBoundingClientRect();

  // Log for debugging
  console.log('[Kity] Focus ring set on:', element);

  // Use browser's native scrollIntoView which is more reliable
  // Scroll to center position instantly, then optionally smooth adjust
  element.scrollIntoView({ behavior: 'instant', block: 'center' });

  // Small delay then do a smooth adjustment if needed
  setTimeout(() => {
    if (element.classList.contains('kity-focus')) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 50);

  const tagName = element.tagName.toLowerCase();
  const isMain = tagName === 'main';
  const isMessage =
    element.hasAttribute('data-message-author-role') ||
    element.hasAttribute('data-message-id') ||
    tagName === 'article';

  // If it's a main pane, remove focus ring after 500ms
  if (isMain) {
    focusRingTimeout = window.setTimeout(() => {
      element.classList.remove('kity-focus');
      focusRingTimeout = null;
    }, 500);
  }
  // If it's a ChatGPT message, remove focus ring after 400ms
  else if (isMessage) {
    focusRingTimeout = window.setTimeout(() => {
      element.classList.remove('kity-focus');
      focusRingTimeout = null;
    }, 400);
  }
}
