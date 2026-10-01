// Runs before React and styles load to avoid a flash of the wrong theme.
// Keep the storage key aligned with src/lib/theme.ts.
(() => {
  let preference = null;
  try {
    preference = localStorage.getItem('portfolio-theme');
  } catch {
    // Restricted storage should never prevent the page from rendering.
  }
  const dark =
    preference === 'dark' ||
    (preference !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#14181F' : '#F5F2EC';
})();
