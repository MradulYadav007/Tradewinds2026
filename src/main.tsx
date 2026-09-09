import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/theme.css';

const root = document.getElementById('root')!;
const app = <StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>;
// Static pages have no query-specific HTML. Mount fresh for event-prefilled URLs.
if (root.hasChildNodes() && !window.location.search) hydrateRoot(root, app);
else createRoot(root).render(app);
