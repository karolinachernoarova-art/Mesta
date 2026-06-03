import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageWithFallbackProps {
  src?: string;
  fallbackSrc?: string;
  className?: string;
  alt?: string;
  onClick?: () => void;
}

export default function ImageWithFallback({ src, fallbackSrc, className, alt, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const defaultFallback = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80';
  const displaySrc = error || !src ? (fallbackSrc || defaultFallback) : src;

  return (
    <span className={cn("relative block overflow-hidden bg-[#ECECE1]", className)}>
      {!loaded && (
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-[#F5F5F0] via-[#ECECE1] to-[#F5F5F0] animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-[#5A5A40]" />
        </span>
      )}
      <img
        src={displaySrc}
        alt={alt || "Image"}
        className={cn("h-full w-full object-cover transition-all duration-700", loaded ? "opacity-100 scale-100" : "opacity-0 scale-105")}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) {
            setError(true);
            setLoaded(false);
          }
        }}
        {...props}
      />
    </span>
  );
}
