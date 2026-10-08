import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
}

/**
 * Scholaro Brand Logo
 * Geometric folded hexagonal ribbon mark in vibrant purple
 */
export const ScholaroLogo: React.FC<LogoProps> = ({ size = 32, color = '#7C3AED' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <G>
        {/* Layer 1: Left Chevron / Fold */}
        <Path
          d="M14 12L24 6L28 9L18 15L28 21L24 24L14 18Z"
          fill={color}
          opacity={0.75}
        />
        {/* Layer 2: Main Fold */}
        <Path
          d="M20 18L30 12L34 15L24 21L34 27L30 30L20 24Z"
          fill={color}
          opacity={0.9}
        />
        {/* Layer 3: Foreground Chevron */}
        <Path
          d="M26 24L36 18L40 21L30 27L40 33L36 36L26 30Z"
          fill={color}
        />
        {/* Bottom anchor fold */}
        <Path
          d="M16 28L26 22L30 25L20 31L30 37L26 40L16 34Z"
          fill={color}
          opacity={0.8}
        />
      </G>
    </Svg>
  );
};
