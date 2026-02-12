"use client";

import { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";

interface ImageWithSkeletonProps extends ImageProps {
  containerClassName?: string;
  skeletonClassName?: string;
}

export default function ImageWithSkeleton({
  containerClassName = "",
  skeletonClassName = "",
  className = "",
  fill,
  width,
  height,
  onLoad,
  onError,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    onLoad?.(e);
    if (isMountedRef.current) {
      setHasError(false);
      setIsLoaded(true);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    onError?.(e);
    if (isMountedRef.current) {
      setHasError(true);
      setIsLoaded(false);
    }
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {!hasError && (
        <>
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              isLoaded ? "opacity-0" : "opacity-100"
            } ${skeletonClassName || "animate-pulse bg-gradient-to-br from-[#ddd5c3]/70 via-[#c9c1b0]/40 to-white/30"}`}
          />
          <Image
            {...props}
            fill={fill}
            width={fill ? undefined : (width || 800)}
            height={fill ? undefined : (height || 600)}
            className={`transition-opacity duration-700 ease-out ${
              isLoaded ? "opacity-100" : "opacity-0"
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-default-100 text-default-400 text-sm">
          Image unavailable
        </div>
      )}
    </div>
  );
}

