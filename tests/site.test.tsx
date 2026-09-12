import { describe, expect, it } from 'vitest';
import { render } from '../src/entry-server';
import { routes } from '../src/routes';
import { validateContent } from '../src/lib/validate-content';
import { mediaUrl } from '../src/lib/media';
import { registrationDraft, registrationHref } from '../src/lib/registration';
import { events } from '../src/content';
import { remainingTime } from '../src/components/Countdown';

describe('deployable site', () => {
  it('validates content references and asset metadata', () => expect(validateContent).not.toThrow());
  it.each(routes)('renders $path with content before JavaScript runs', route => {
    const html = render(route.path);
    expect(html).toContain('<h1');
    expect(html).toContain('main-content');
    expect(html).not.toContain('data-framer');
  });
  it('renders a real not-found page', () => expect(render('/unknown')).toContain('PAGE NOT FOUND.'));
  it('preselects the event when following its registration link', () => expect(render(registrationHref(events[1]))).toContain('value="culture-code" selected=""'));
  it('keeps the draft explicit that it is not submitted', () => expect(registrationDraft({ name: 'Test', email: 'test@example.com', institution: 'College', event: 'Case Conquest', team: '' })).toContain('has not been submitted'));
});

describe('intro animation', () => {
  it('renders a reusable intro markup using the existing site logo source', () => {
    const html = render('/');
    expect(html).toContain('/media/tradewinds-logo.png');
    expect(html).toContain('intro-screen');
  });
});

describe('CDN media', () => {
  it('uses local files by default', () => expect(mediaUrl('/media/logo.png', '')).toBe('/media/logo.png'));
  it('resolves a configured CDN base', () => expect(mediaUrl('/media/logo.png', 'https://cdn.example.com/')).toBe('https://cdn.example.com/media/logo.png'));
  it('keeps per-file external HTTPS URLs', () => expect(mediaUrl('https://images.example.com/photo.webp?w=800', '')).toBe('https://images.example.com/photo.webp?w=800'));
  it.each(['javascript:alert(1)', '//other.example.com/a.png', '/media/../private.txt'])('rejects unsafe local media: %s', path => expect(() => mediaUrl(path, '')).toThrow());
  it('rejects a non-HTTPS CDN base', () => expect(() => mediaUrl('/media/logo.png', 'http://cdn.example.com')).toThrow());
});

describe('registration countdown', () => {
  it('expires without displaying negative time', () => expect(remainingTime('2026-09-10T00:00:00+05:30', Date.parse('2026-09-11T00:00:00+05:30'))).toBeNull());
  it('honors the configured timezone', () => expect(remainingTime('2026-09-10T00:00:00+05:30', Date.parse('2026-09-09T18:29:00Z'))).toBe('00 : 00 : 01 : 00'));
});
