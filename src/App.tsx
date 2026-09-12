import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header, Footer, RouteEffects } from './components/Layout';
import IntroAnimation from './components/IntroAnimation';
import HomePage from './pages/HomePage';
import { EventsPage, SpeakersPage, ClubsPage, CalendarPage, NotFoundPage } from './pages/ContentPages';
import RegisterPage from './pages/RegisterPage';
import { routes } from './routes';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const route = routes.find(item => item.path === pathname.replace(/\/$/, '') || (item.path === '/' && pathname === '/'));
    document.title = route?.title || 'Page not found — Trade Winds';
    document.querySelector('meta[name="description"]')?.setAttribute('content', route?.description || 'Page not found.');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && import.meta.env.VITE_SITE_URL && route) canonical.setAttribute('href', `${import.meta.env.VITE_SITE_URL.replace(/\/$/, '')}${route.path}`);
  }, [pathname]);
  return <>
    <IntroAnimation />
    <RouteEffects />
    <Header />
    <main id="main-content" tabIndex={-1} className="min-h-[65vh] outline-none">
      <Routes><Route path="/" element={<HomePage />} /><Route path="/viewallevents" element={<EventsPage />} /><Route path="/viewallspeakers" element={<SpeakersPage />} /><Route path="/viewallclubs" element={<ClubsPage />} /><Route path="/calendar" element={<CalendarPage />} /><Route path="/registernow" element={<RegisterPage />} /><Route path="*" element={<NotFoundPage />} /></Routes>
    </main>
    <Footer />
  </>;
}
