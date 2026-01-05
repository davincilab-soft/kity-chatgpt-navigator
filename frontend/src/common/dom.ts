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
const MAIN_FOCUS_DURATION_MS = 500; // 0.5s on main pane
const MESSAGE_FOCUS_DURATION_MS = 400;

type FocusRingOptions = {
  scroll?: boolean;
  block?: ScrollLogicalPosition;
};

/**
 * Detects if an element is likely a message/conversation element.
 * Uses common patterns across different LLM chat interfaces.
 */
function isLikelyMessage(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // Common message indicators across LLM UIs
  if (
    element.hasAttribute('data-message-author-role') ||
    element.hasAttribute('data-message-id') ||
    tagName === 'article'
  ) {
    return true;
  }

  // Check for message-like class names (common patterns)
  const className = element.className || '';
  const messagePatterns = [
    /message/i,
    /conversation/i,
    /chat-item/i,
    /response/i,
  ];

  return messagePatterns.some(pattern => pattern.test(className));
}

export function setFocusRing(element: Element, options?: FocusRingOptions): void {
  if (!element || !element.isConnected) {
    console.warn('[Kity] Cannot set focus ring: element not in DOM');
    return;
  }

  const shouldScroll = options?.scroll ?? true;
  const block = options?.block ?? 'center';

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

  const tagName = element.tagName.toLowerCase();
  const isMain = tagName === 'main';
  const isMessage = isLikelyMessage(element);

  // Avoid scrolling the whole page when focusing the main pane
  const skipScroll = !shouldScroll || isMain;

  if (!skipScroll) {
    // Use browser's native scrollIntoView which is more reliable
    // Scroll to center position instantly, then optionally smooth adjust
    element.scrollIntoView({ behavior: 'instant', block });

    // Small delay then do a smooth adjustment if needed
    setTimeout(() => {
      if (element.classList.contains('kity-focus')) {
        element.scrollIntoView({ behavior: 'smooth', block });
      }
    }, 50);
  }

  // If it's a main pane, remove focus ring after the configured duration
  if (isMain) {
    focusRingTimeout = window.setTimeout(() => {
      element.classList.remove('kity-focus');
      focusRingTimeout = null;
    }, MAIN_FOCUS_DURATION_MS);
  }
  // If it's a message-like element, remove focus ring after 400ms
  else if (isMessage) {
    focusRingTimeout = window.setTimeout(() => {
      element.classList.remove('kity-focus');
      focusRingTimeout = null;
    }, MESSAGE_FOCUS_DURATION_MS);
  }
}
