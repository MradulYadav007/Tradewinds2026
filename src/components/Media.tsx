import type { MediaAsset } from '../content/types';
import { mediaUrl } from '../lib/media';

export function Media({ media, className = '', priority = false }: { media: any; className?: string; priority?: boolean }) {
  if (media.type === 'video') {
    return <video className={className} src={mediaUrl(media.src)} poster={media.poster ? mediaUrl(media.poster) : undefined} width={media.width} height={media.height} controls playsInline preload="metadata" aria-label={media.alt} />;
  }
  return <img className={className} src={mediaUrl(media.src)} alt={media.alt} width={media.width} height={media.height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" srcSet={media.sources?.map((source:any) => `${mediaUrl(source.src)} ${source.width}w`).join(', ')} sizes={media.sources?.length ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined} />;
}
