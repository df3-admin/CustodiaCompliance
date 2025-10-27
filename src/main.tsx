import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Declare gtag type for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Track page views on route changes
if (typeof window !== 'undefined') {
  // Track initial page load
  if (window.gtag) {
    window.gtag('config', 'G-RDYG5Q470Y', {
      page_path: window.location.pathname + window.location.search
    });
  }

  // Track page views on route changes (for React Router)
  window.addEventListener('popstate', () => {
    if (window.gtag) {
      window.gtag('config', 'G-RDYG5Q470Y', {
        page_path: window.location.pathname + window.location.search
      });
    }
  });

  // Override history methods to track navigation
  const originalPushState = window.history.pushState;
  window.history.pushState = function(...args) {
    originalPushState.apply(window.history, args);
    if (window.gtag) {
      window.gtag('config', 'G-RDYG5Q470Y', {
        page_path: window.location.pathname + window.location.search
      });
    }
  };

  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function(...args) {
    originalReplaceState.apply(window.history, args);
    if (window.gtag) {
      window.gtag('config', 'G-RDYG5Q470Y', {
        page_path: window.location.pathname + window.location.search
      });
    }
  };
}
