export function mediaUrl(src: string, base = import.meta.env.VITE_MEDIA_BASE_URL || ''): string {
  if (/^https:\/\//i.test(src)) {
    const url = new URL(src);
    if (url.username || url.password) throw new Error('Media URLs must not contain credentials.');
    return src;
  }
  if (!src.startsWith('/media/') || src.includes('..') || /[?#\\]/.test(src)) {
    throw new Error(`Media must use a /media/ path or HTTPS URL: ${src}`);
  }
  if (!base) return src;
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_MEDIA_BASE_URL must be an HTTPS base URL without credentials, query or fragment.');
  }
  return `${base.replace(/\/$/, '')}${src}`;
}
