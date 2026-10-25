import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Shield application against external browser extension errors (MetaMask inpage.js, web3 wallet injections)
if (typeof window !== 'undefined') {
  const isExtensionNoise = (msg?: string, stack?: string) => {
    const text = `${msg || ''} ${stack || ''}`.toLowerCase();
    return (
      text.includes('metamask') ||
      text.includes('inpage.js') ||
      text.includes('chrome-extension://') ||
      text.includes('failed to connect to metamask') ||
      text.includes('ethereum')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = event.reason?.message || String(event.reason || '');
    const reasonStack = event.reason?.stack || '';
    if (isExtensionNoise(reasonMsg, reasonStack)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener(
    'error',
    (event) => {
      const filename = event.filename || '';
      const message = event.message || '';
      const stack = (event.error && event.error.stack) || '';
      if (isExtensionNoise(`${message} ${filename}`, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const joined = args.map((a) => (typeof a === 'object' && a !== null ? (a.message || a.stack || '') : String(a))).join(' ');
    if (isExtensionNoise(joined)) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
