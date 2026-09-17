// Matra Keyboard Navigation & View Routing Controller

const tabs = ['typing', 'font', 'dict', 'converter', 'care', 'settings'];

export function initNavigation() {
  const savedTab = localStorage.getItem('matra_active_tab') || 'typing';
  setTab(savedTab, false);
}

export function switchView(_viewName) {
  const appView = document.getElementById('view-app');
  if (appView) appView.classList.remove('hidden');
}

export function setTab(tabName, persist = true) {
  if (!tabs.includes(tabName)) {
    tabName = 'typing';
  }

  tabs.forEach((t) => {
    const content = document.getElementById(`content-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (content) content.classList.add('hidden');
    if (btn) btn.classList.remove('active');
  });

  const activeContent = document.getElementById(`content-${tabName}`);
  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) activeBtn.classList.add('active');

  if (persist) {
    localStorage.setItem('matra_active_tab', tabName);
  }
}
