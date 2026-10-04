import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/theme.css';

const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
if (navigationEntry?.type === 'reload' && window.location.pathname !== '/') {
  window.location.replace('/');
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('a[href]');
  if (!link || link.hasAttribute('download')) return;

  link.target = '_blank';
  link.rel = [...new Set([...link.rel.split(/\s+/).filter(Boolean), 'noopener', 'noreferrer'])].join(' ');
}, true);

const root = document.getElementById('root')!;
const app = <StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>;
// Static pages have no query-specific HTML. Mount fresh for event-prefilled URLs.
if (root.hasChildNodes() && !window.location.search) hydrateRoot(root, app);
else createRoot(root).render(app);
