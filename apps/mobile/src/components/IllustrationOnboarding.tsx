import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const IllustrationOnboarding: React.FC<{ width?: number; height?: number }> = ({
  width = 310,
  height = 270,
}) => {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 340 300" fill="none">
        <Defs>
          {/* Gradients for rich 3D shading */}
          <LinearGradient id="chalkboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4A6CF7" />
            <Stop offset="100%" stopColor="#2A45C2" />
          </LinearGradient>
          <LinearGradient id="boardInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#252836" />
            <Stop offset="100%" stopColor="#1E202B" />
          </LinearGradient>
          <LinearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D946EF" />
            <Stop offset="100%" stopColor="#A855F7" />
          </LinearGradient>
          <LinearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFD3C4" />
            <Stop offset="100%" stopColor="#FBBDA6" />
          </LinearGradient>
          <LinearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#831843" />
            <Stop offset="100%" stopColor="#500724" />
          </LinearGradient>
          <LinearGradient id="bellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="100%" stopColor="#EAB308" />
          </LinearGradient>
        </Defs>

        {/* 1. Chalkboard Behind */}
        <G transform="rotate(-4 130 140)">
          {/* Outer Frame */}
          <Rect
            x="30"
            y="65"
            width="200"
            height="135"
            rx="16"
            fill="url(#chalkboardGrad)"
            stroke="#6366F1"
            strokeWidth="3"
          />
          {/* Inner Board */}
          <Rect
            x="40"
            y="75"
            width="180"
            height="115"
            rx="10"
            fill="url(#boardInner)"
          />
          {/* Formula text */}
          <SvgText
            x="145"
            y="142"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="bold"
            letterSpacing={1.5}
            opacity={0.9}
          >
            + c = 0
          </SvgText>
        </G>

        {/* 2. Desk Bell & Sound Waves on Right */}
        <G transform="translate(235, 60)">
          {/* Sound waves / Vibration lines */}
          <Path d="M12 4L8 -8" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M22 0L24 -12" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M32 4L38 -6" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />

          {/* Bell Dome */}
          <Circle cx="22" cy="24" r="22" fill="url(#bellGrad)" />
          {/* Bell top knob */}
          <Rect x="19" y="1" width="6" height="5" rx="2" fill="#92400E" />
          {/* Bell Base */}
          <Rect x="6" y="38" width="32" height="10" rx="3" fill="#1F2937" />
          {/* Base Stand */}
          <Rect x="12" y="48" width="20" height="18" rx="2" fill="#4B5563" />
        </G>

        {/* 3. Graded Test Paper Sheet */}
        <G transform="translate(230, 105) rotate(10 25 35)">
          <Rect
            x="0"
            y="0"
            width="65"
            height="85"
            rx="6"
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth="1.5"
          />
          {/* Paper lines */}
          <Rect x="8" y="14" width="28" height="3" rx="1.5" fill="#93C5FD" />
          <Rect x="8" y="24" width="38" height="3" rx="1.5" fill="#E5E7EB" />
          <Rect x="8" y="34" width="45" height="3" rx="1.5" fill="#E5E7EB" />
          <Rect x="8" y="44" width="42" height="3" rx="1.5" fill="#E5E7EB" />

          {/* Grade A Badge */}
          <Circle cx="48" cy="18" r="11" fill="#DCFCE7" stroke="#10B981" strokeWidth="1.5" />
          <SvgText x="43" y="22" fill="#059669" fontSize="11" fontWeight="bold">
            A
          </SvgText>

          {/* Grade F Red Stamp */}
          <Circle cx="16" cy="62" r="10" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
          <SvgText x="12" y="66" fill="#DC2626" fontSize="10" fontWeight="bold">
            F
          </SvgText>
        </G>

        {/* 4. Female Teacher 3D Character */}
        <G>
          {/* Hair back */}
          <Circle cx="95" cy="120" r="30" fill="url(#hairGrad)" />

          {/* Torso / Purple Blouse */}
          <Path
            d="M62 205 Q70 170 95 170 Q120 170 130 205 L145 285 L50 285 Z"
            fill="url(#shirtGrad)"
          />

          {/* Neck */}
          <Rect x="88" y="152" width="16" height="22" rx="6" fill="url(#skinGrad)" />

          {/* Head */}
          <Circle cx="96" cy="128" r="24" fill="url(#skinGrad)" />

          {/* Hair Front/Stylized Bangs */}
          <Path
            d="M72 124 C72 100 118 95 120 120 C110 115 102 112 90 122 C84 128 78 132 72 124 Z"
            fill="url(#hairGrad)"
          />

          {/* Cute Face: Eyes & Smile & Blush */}
          <Circle cx="89" cy="128" r="2.2" fill="#1F2937" />
          <Circle cx="104" cy="128" r="2.2" fill="#1F2937" />
          <Circle cx="84" cy="134" r="3" fill="#FDA4AF" opacity={0.7} />
          <Circle cx="109" cy="134" r="3" fill="#FDA4AF" opacity={0.7} />
          <Path
            d="M93 136 Q97 141 101 136"
            stroke="#B91C1C"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Arm: Pointing Up to Chalkboard */}
          <Path
            d="M125 180 Q150 160 185 130 Q195 122 205 105"
            stroke="url(#skinGrad)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Pointing Hand */}
          <Circle cx="205" cy="105" r="9" fill="url(#skinGrad)" />
          <Path
            d="M205 105 L215 95"
            stroke="url(#skinGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Left Arm & Books Stack */}
          <G>
            {/* Books Stack (Yellow & Teal) */}
            <Rect
              x="52"
              y="200"
              width="44"
              height="48"
              rx="6"
              fill="#FDE047"
              stroke="#CA8A04"
              strokeWidth="2"
            />
            <Rect
              x="62"
              y="194"
              width="38"
              height="48"
              rx="6"
              fill="#2DD4BF"
              stroke="#0D9488"
              strokeWidth="2"
            />
            <Path d="M72 242 L72 254 L80 248 L88 254 L88 242" fill="#EF4444" />

            {/* Arm wrapping books */}
            <Path
              d="M62 188 Q48 215 72 235"
              stroke="url(#skinGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <Circle cx="72" cy="235" r="8" fill="url(#skinGrad)" />
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
  },
});
