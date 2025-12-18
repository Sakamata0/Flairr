import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    const initial = document.getElementById('initial-loading');
    const appRoot = document.querySelector('app-root');

    function removeInitial() {
      if (initial && initial.parentNode) {
        initial.parentNode.removeChild(initial);
      }
    }

    if (!initial) return;

    if (!appRoot) {
      // No app root found, remove initial after short delay
      setTimeout(removeInitial, 500);
      return;
    }

    // Remove the initial loader once:
    // 1. A page-specific .loading-screen appears (like profile's custom loader)
    // 2. Real content is rendered (headers, main sections, etc.)
    const observer = new MutationObserver(() => {
      const appLoader = appRoot.querySelector('.loading-screen');
      // Check for meaningful content: headers, mains, navs, asides, not just generic text
      const hasRealContent = !!(
        appRoot.querySelector('header') ||
        appRoot.querySelector('main') ||
        appRoot.querySelector('nav') ||
        appRoot.querySelector('aside') ||
        (appRoot.querySelector('router-outlet') && appRoot.innerHTML.includes('<'))
      );
      
      if (appLoader || hasRealContent) {
        removeInitial();
        observer.disconnect();
        if (fallbackHandle) clearTimeout(fallbackHandle);
      }
    });

    observer.observe(appRoot, { childList: true, subtree: true, attributes: false });

    // Fallback: ensure the initial loader is removed after 4s to avoid long stuck screen
    const fallbackHandle = setTimeout(() => {
      removeInitial();
      observer.disconnect();
    }, 4000);
  })
  .catch((err) => console.error(err));
