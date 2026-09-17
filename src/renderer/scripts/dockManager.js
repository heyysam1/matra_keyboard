// Matra Keyboard Top Dock / Bar Variant Manager

let activeDockVariant = parseInt(localStorage.getItem('matra_dock_variant') || '1', 10);

export function initDockManager() {
  setDockVariant(activeDockVariant, false);
}

export function setDockVariant(variantNum, persist = true) {
  activeDockVariant = variantNum;

  for (let i = 1; i <= 5; i++) {
    const preview = document.getElementById(`dock-preview-v${i}`);
    const card = document.getElementById(`dock-card-${i}`);

    if (i === variantNum) {
      if (preview) {
        preview.classList.remove('hidden');
        preview.style.display = 'flex';
      }
      if (card) {
        card.classList.add('active');
      }
    } else {
      if (preview) {
        preview.classList.add('hidden');
        preview.style.display = 'none';
      }
      if (card) {
        card.classList.remove('active');
      }
    }
  }

  if (persist) {
    localStorage.setItem('matra_dock_variant', variantNum);
  }
}

export function getActiveDockVariant() {
  return activeDockVariant;
}
