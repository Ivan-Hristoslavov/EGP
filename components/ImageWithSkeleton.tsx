"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface ImageWithSkeletonProps extends ImageProps {
  containerClassName?: string;
  skeletonClassName?: string;
}

export default function ImageWithSkeleton({
  containerClassName = "",
  skeletonClassName = "",
  className = "",
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isLoaded ? "opacity-0" : "opacity-100"
        } ${skeletonClassName || "animate-pulse bg-gradient-to-br from-[#ddd5c3]/70 via-[#c9c1b0]/40 to-white/30"}`}
      />
      <Image
        {...props}
        className={`transition-opacity duration-700 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
}

