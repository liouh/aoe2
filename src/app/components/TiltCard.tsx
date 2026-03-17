"use client";

import React, { useRef, useState, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number; // Maximum rotation in degrees
  perspective?: number; // 3D perspective
  scale?: number; // Scale on hover
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  maxRotation = 10,
  perspective = 1000,
  scale = 1.02,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top; // y position within the element

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation based on cursor position relative to center
      // x-axis movement creates rotation around y-axis, and vice-versa
      const rotateY = ((x - centerX) / centerX) * maxRotation;
      const rotateX = ((centerY - y) / centerY) * maxRotation; // Negative so it tilts towards mouse

      setTransform(
        `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(0)`
      );
    },
    [maxRotation, perspective, scale]
  );

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTransform(""); // Reset transform
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className} transition-transform duration-200 ease-out`}
      style={{
        transform: isHovering ? transform : "none",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased",
        zIndex: isHovering ? 20 : 1,
        position: "relative",
      }}
    >
      {children}
    </div>
  );
};
