export function mountHud(data, crowdCount) {
  const css = document.createElement('style');
  css.textContent = `
    .hud { position: fixed; z-index: 2; pointer-events: none; font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif; color: #2b1a12; }
    .hud-title { top: 14px; left: 14px; max-width: calc(100vw - 28px); padding: 10px 16px 9px; background: #f1e3c2; border: 3px solid #2b1a12; box-shadow: 4px 4px 0 #b5523b; }
    .hud-title h1 { margin: 0; font-size: clamp(15px, 2.2vw, 22px); letter-spacing: 0.02em; }
    .hud-title p { margin: 3px 0 0; font-size: 12px; color: #6b4a33; }
    .hud-hint { bottom: 14px; left: 50%; transform: translateX(-50%); max-width: calc(100vw - 28px); padding: 6px 12px; font-size: 12px; background: rgba(241, 227, 194, 0.88); border: 2px solid #2b1a12; white-space: nowrap; }
    @media (max-width: 640px) { .hud-hint { white-space: normal; text-align: center; } }
  `;
  document.head.appendChild(css);
  const title = document.createElement('div');
  title.className = 'hud hud-title';
  title.innerHTML = `<h1></h1><p></p>`;
  title.querySelector('h1').textContent = data.title;
  title.querySelector('p').textContent = `${data.subtitle} · ${crowdCount.toLocaleString()} people`;
  const hint = document.createElement('div');
  hint.className = 'hud hud-hint';
  const touch = matchMedia('(pointer: coarse)').matches;
  hint.textContent = touch
    ? 'Drag left side to walk · Drag right side to look around'
    : 'WASD / arrows: walk · Shift: run · Drag: orbit camera · Scroll: zoom';
  document.body.append(title, hint);
  document.title = data.title;
}
