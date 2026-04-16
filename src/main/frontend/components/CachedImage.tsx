import React, { useState, useEffect } from 'react';
import { DataService } from '../services/DataService';

const dataService = DataService.getInstance();

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  style?: React.CSSProperties;
}

/**
 * Renders a POI image by resolving it from the Cache API first (offline-capable),
 * falling back to the remote URL when not yet cached.
 * Uses /images/placeholder.png while the URL is being resolved.
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  className,
  loading,
  onClick,
  onError,
  style,
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>('/images/placeholder.png');

  useEffect(() => {
    if (!src) return;
    let cancelled = false;

    dataService.getCachedImageUrl(src).then(url => {
      if (!cancelled) setResolvedSrc(url);
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading={loading}
      onClick={onClick}
      onError={onError}
      style={style}
    />
  );
};

