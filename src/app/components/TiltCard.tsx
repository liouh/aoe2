"use client";

import React, { useRef, useState } from "react";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number; // Maximum rotation in degrees
  perspective?: number; // 3D perspective
  scale?: number; // Scale on hover
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  maxRotation = 5,
  perspective = 1000,
  scale = 1.02,
  onMouseEnter,
  onMouseLeave,
  style,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const card = containerRef.current;
    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Clamp coordinates to stationary container bounds
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Adapt rotation for tall cards to keep physical 3D displacement
    // at the edges balanced and avoid large perspective shifts
    const maxRotX = centerY > centerX ? Math.max(1.5, maxRotation * (centerX / centerY)) : maxRotation;
    const maxRotY = centerX > centerY ? Math.max(1.5, maxRotation * (centerY / centerX)) : maxRotation;

    const rotateY = ((x - centerX) / centerX) * maxRotY;
    const rotateX = ((centerY - y) / centerY) * maxRotX;

    setTransform(
      `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(0)`
    );
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    handleMouseMove(e);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(false);
    setTransform(""); // Reset transform
    onMouseLeave?.(e);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="tilt-card-wrapper relative h-full w-full flex flex-col"
      {...rest}
    >
      <div
        className={`${className} ${isHovering ? "is-hovered" : ""} w-full h-full flex-1 transition-transform duration-200 ease-out`}
        style={{
          transform: isHovering ? transform : "none",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
          zIndex: isHovering ? 20 : 1,
          position: "relative",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};
