import React from 'react';

interface CheckerboardProps {
  className?: string;
  children: React.ReactNode;
  checkerSize?: number;
}

/**
 * Checkerboard pattern implemented purely with solid SVG rectangles (no gradients).
 */
export const Checkerboard: React.FC<CheckerboardProps> = ({
  className = '',
  children,
  checkerSize = 16,
}) => {
  // 2x2 solid colored grid in SVG data URI
  const svgPattern = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${checkerSize * 2}" height="${checkerSize * 2}"><rect width="${checkerSize}" height="${checkerSize}" fill="%23f1f5f9"/><rect x="${checkerSize}" width="${checkerSize}" height="${checkerSize}" fill="%23e2e8f0"/><rect y="${checkerSize}" width="${checkerSize}" height="${checkerSize}" fill="%23e2e8f0"/><rect x="${checkerSize}" y="${checkerSize}" width="${checkerSize}" height="${checkerSize}" fill="%23f1f5f9"/></svg>`;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `url('${svgPattern}')`,
        backgroundRepeat: 'repeat',
      }}
    >
      {children}
    </div>
  );
};
