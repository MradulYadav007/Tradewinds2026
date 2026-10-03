import type { MediaAsset } from '../content/types';
import { mediaUrl } from '../lib/media';

export function Media({
  media,
  className = '',
  priority = false,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = true,
  controls = false,
}: { media: MediaAsset | string; className?: string; priority?: boolean; autoPlay?: boolean; muted?: boolean; loop?: boolean; playsInline?: boolean; controls?: boolean }) {
  const asset: MediaAsset = typeof media === 'string'
    ? { type: 'image', src: media, alt: '', width: 0, height: 0 }
    : media;
  if (asset.type === 'video') {
    return <video className={className} src={mediaUrl(asset.src)} poster={asset.poster ? mediaUrl(asset.poster) : undefined} width={asset.width} height={asset.height} controls={controls} autoPlay={autoPlay} muted={muted} loop={loop} playsInline={playsInline} preload="metadata" aria-label={asset.alt} />;
  }
  return <img className={className} src={mediaUrl(asset.src)} alt={asset.alt} width={asset.width} height={asset.height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" srcSet={asset.sources?.map(source => `${mediaUrl(source.src)} ${source.width}w`).join(', ')} sizes={asset.sources?.length ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined} />;
}
