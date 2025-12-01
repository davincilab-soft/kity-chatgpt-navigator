export interface ChristmasDecorController {
  mount(): void;
  unmount(): void;
  isMounted(): boolean;
}

const animation_speed = 350; // ms for image slide-in/out
const ANIMATION_BUFFER = 50; // buffer to ensure the exit animation finishes before removal

export function createChristmasDecorations(host: Document = document): ChristmasDecorController {
  let styleEl: HTMLStyleElement | null = null;
  let container: HTMLDivElement | null = null;
  let unmountTimer: number | null = null;
  let pendingFrame: number | null = null;

  const ensureStyle = () => {
    if (styleEl) return;

    styleEl = host.createElement('style');
    styleEl.textContent = `
      .kity-xmas-decor {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483630;
        background: transparent !important;
      }

      .xmas-decor-top-left,
      .xmas-decor-bottom-right {
        position: absolute;
        display: block;
        user-select: none;
        mix-blend-mode: normal;
        background: transparent !important;
        filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.18));
        will-change: transform, opacity;
        height: auto;
        max-width: none;
        opacity: 0;
      }

      .xmas-decor-top-left {
        top: -8px;
        left: -8px;
        width: clamp(90px, 11vw, 130px);
        transform: translate(-80%, -80%);
      }

      .xmas-decor-bottom-right {
        bottom: 0;
        right: 8px;
        width: clamp(70px, 9vw, 110px);
        transform: translateY(120%);
      }

      .kity-xmas-snow {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .kity-xmas-snow__flake {
        position: absolute;
        width: var(--flake-size, 6px);
        height: var(--flake-size, 6px);
        border-radius: 50%;
        background: var(--flake-color, rgba(166, 216, 255, 0.5));
        top: -10vh;
        animation: kity-xmas-snow-fall var(--flake-duration, 10s) linear infinite;
        will-change: transform, opacity;
        box-shadow: var(--flake-shadow, 0 0 8px rgba(166, 216, 255, 0.35));
      }

      @keyframes kity-xmas-snow-fall {
        0% {
          transform: translate3d(var(--flake-x, 0), -10vh, 0);
          opacity: 0.8;
        }
        60% {
          opacity: 0.9;
        }
        100% {
          transform: translate3d(calc(var(--flake-x, 0) + var(--flake-drift, 80px)), 110vh, 0);
          opacity: 0.2;
        }
      }

      @keyframes kity-xmas-top-left-in {
        from {
          transform: translate(-80%, -80%);
          opacity: 0;
        }
        to {
          transform: translate(0, 0);
          opacity: 1;
        }
      }

      @keyframes kity-xmas-bottom-right-in {
        from {
          transform: translateY(120%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes kity-xmas-top-left-out {
        from {
          transform: translate(0, 0);
          opacity: 1;
        }
        to {
          transform: translate(-80%, -80%);
          opacity: 0;
        }
      }

      @keyframes kity-xmas-bottom-right-out {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(120%);
          opacity: 0;
        }
      }

      .xmas-decor-top-left.is-in {
        animation: kity-xmas-top-left-in var(--kity-xmas-anim-speed, ${animation_speed}ms) ease-out forwards;
      }

      .xmas-decor-bottom-right.is-in {
        animation: kity-xmas-bottom-right-in var(--kity-xmas-anim-speed, ${animation_speed}ms) ease-out forwards;
      }

      .xmas-decor-top-left.is-out {
        animation: kity-xmas-top-left-out var(--kity-xmas-anim-speed, ${animation_speed}ms) ease-in forwards;
      }

      .xmas-decor-bottom-right.is-out {
        animation: kity-xmas-bottom-right-out var(--kity-xmas-anim-speed, ${animation_speed}ms) ease-in forwards;
      }

      @media (max-width: 900px) {
        .xmas-decor-top-left,
        .xmas-decor-bottom-right {
          opacity: 0.85;
        }
      }
    `;

    const head = host.head || host.documentElement || host.body;
    head?.appendChild(styleEl);
  };

  const mount = () => {
    ensureStyle();
    if (container) {
      return;
    }

    if (unmountTimer !== null) {
      clearTimeout(unmountTimer);
      unmountTimer = null;
    }

    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = null;
    }

    container = host.createElement('div');
    container.className = 'kity-xmas-decor';
    container.style.setProperty('--kity-xmas-anim-speed', `${animation_speed}ms`);

    const placements: Array<{ className: string; filename: string }> = [
      { className: 'xmas-decor-top-left', filename: 'top-left-corner-1.png' },
      { className: 'xmas-decor-bottom-right', filename: 'snowman_bottom_right.png' },
    ];

    placements.forEach((item) => {
      const img = host.createElement('img');
      img.className = item.className;
      img.alt = 'Christmas decoration';
      img.src = chrome.runtime.getURL(`themes/christmas/${item.filename}`);
      container?.appendChild(img);
    });

    const snowLayer = host.createElement('div');
    snowLayer.className = 'kity-xmas-snow';

    const flakesPerSide = 25;
    const createFlakes = (side: 'left' | 'right') => {
      for (let i = 0; i < flakesPerSide; i += 1) {
        const flake = host.createElement('div');
        flake.className = 'kity-xmas-snow__flake';
        const baseX = side === 'left' ? Math.random() * 35 : 65 + Math.random() * 35;
        const drift = (side === 'left' ? 1 : -1) * (40 + Math.random() * 60);
        const size = 4 + Math.random() * 6;
        const duration = 8 + Math.random() * 6;
        const delay = Math.random() * 6;
        const cornerWeight =
          side === 'left'
            ? Math.max(0, 1 - baseX / 35)
            : Math.max(0, (baseX - 65) / 35);
        const baseColor = { r: 166, g: 216, b: 255 };
        const darken = 22 * cornerWeight;
        const r = Math.max(120, baseColor.r - darken);
        const g = Math.max(160, baseColor.g - darken);
        const b = Math.max(200, baseColor.b - darken);
        const alpha = 0.4 + 0.25 * cornerWeight;
        flake.style.setProperty('--flake-x', `${baseX}vw`);
        flake.style.setProperty('--flake-drift', `${drift}px`);
        flake.style.setProperty('--flake-size', `${size}px`);
        flake.style.setProperty('--flake-duration', `${duration}s`);
        flake.style.setProperty('--flake-color', `rgba(${r}, ${g}, ${b}, ${alpha})`);
        flake.style.setProperty('--flake-shadow', `0 0 8px rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`);
        flake.style.animationDelay = `${delay}s`;
        snowLayer.appendChild(flake);
      }
    };

    createFlakes('left');
    createFlakes('right');

    container.appendChild(snowLayer);

    (host.body || host.documentElement || host).appendChild(container);

    const animateIn = () => {
      if (!container) {
        return;
      }
      const images = Array.from(
        container.querySelectorAll('.xmas-decor-top-left, .xmas-decor-bottom-right')
      );
      images.forEach((img) => {
        img.classList.remove('is-out');
        // force reflow to allow re-adding is-in if toggled quickly
        void (img as HTMLElement).offsetWidth;
        img.classList.add('is-in');
      });
    };

    pendingFrame = requestAnimationFrame(animateIn);
  };

  const unmount = () => {
    if (!container) {
      return;
    }

    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = null;
    }

    const images = Array.from(
      container.querySelectorAll('.xmas-decor-top-left, .xmas-decor-bottom-right')
    );

    images.forEach((img) => {
      img.classList.remove('is-in');
      img.classList.add('is-out');
    });

    const teardown = () => {
      container?.remove();
      container = null;
      unmountTimer = null;
    };

    if (unmountTimer !== null) {
      clearTimeout(unmountTimer);
    }
    unmountTimer = window.setTimeout(teardown, animation_speed + ANIMATION_BUFFER);
  };

  return {
    mount,
    unmount,
    isMounted: () => !!container,
  };
}
