import { useEffect, useState } from 'react';
import { site } from '../content';
import { Media } from './Media';

export default function IntroAnimation() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const leavingDelay = reducedMotion ? 70 : 1800;
    const removeDelay = reducedMotion ? 120 : 2600;

    const leavingTimer = window.setTimeout(() => setIsLeaving(true), leavingDelay);
    const removeTimer = window.setTimeout(() => setShowIntro(false), removeDelay);

    return () => {
      window.clearTimeout(leavingTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!showIntro) {
    return null;
  }

  return (
    <div className={`intro-screen${isLeaving ? ' intro-screen-leaving' : ''}`} aria-hidden="true">
      <div className="intro-screen__inner">
        <Media media={site.logo} priority className="intro-logo" />
      </div>
    </div>
  );
}
