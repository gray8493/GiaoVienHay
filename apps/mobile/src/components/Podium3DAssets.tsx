import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Ellipse,
  Rect,
  G,
  Text as SvgText,
} from 'react-native-svg';

interface Medal3DProps {
  rank: 1 | 2 | 3;
  size?: number;
}

/**
 * Huy chương 3D Vector Cao cấp (UI/UX Pro Max)
 * - Rank 1: Huy chương Vàng Quán Quân (Gold Medal #1) có dải ruy băng đỏ thắt sọc vàng kim, vành đúc nổi và số 1 nổi khối 3D.
 * - Rank 2: Huy chương Bạc (Silver Medal #2) sáng bóng với dải ruy băng xanh hoàng gia.
 * - Rank 3: Huy chương Đồng (Bronze Medal #3) ấm áp với dải ruy băng cam hổ phách.
 * - 100% Vector SVG sắc nét, không dùng emoji, trong suốt và không dính phông nền.
 */
export const Medal3D: React.FC<Medal3DProps> = ({ rank, size = 38 }) => {
  const isGold = rank === 1;
  const isSilver = rank === 2;

  // Gradient ID duy nhất theo rank
  const p = `medal_${rank}_`;

  return (
    <View style={[styles.center, { width: size, height: (size * 74) / 60 }]}>
      <Svg width={size} height={(size * 74) / 60} viewBox="0 0 60 74" fill="none">
        <Defs>
          {/* ================= 1. DẢI RUY BĂNG ================= */}
          <LinearGradient id={`${p}ribbonLeft`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isGold ? (
              [
                <Stop key="1" offset="0%" stopColor="#F87171" />,
                <Stop key="2" offset="50%" stopColor="#EF4444" />,
                <Stop key="3" offset="100%" stopColor="#B91C1C" />,
              ]
            ) : isSilver ? (
              [
                <Stop key="1" offset="0%" stopColor="#60A5FA" />,
                <Stop key="2" offset="50%" stopColor="#3B82F6" />,
                <Stop key="3" offset="100%" stopColor="#1D4ED8" />,
              ]
            ) : (
              [
                <Stop key="1" offset="0%" stopColor="#FB923C" />,
                <Stop key="2" offset="50%" stopColor="#F97316" />,
                <Stop key="3" offset="100%" stopColor="#C2410C" />,
              ]
            )}
          </LinearGradient>

          <LinearGradient id={`${p}ribbonRight`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isGold ? (
              [
                <Stop key="1" offset="0%" stopColor="#EF4444" />,
                <Stop key="2" offset="50%" stopColor="#DC2626" />,
                <Stop key="3" offset="100%" stopColor="#991B1B" />,
              ]
            ) : isSilver ? (
              [
                <Stop key="1" offset="0%" stopColor="#3B82F6" />,
                <Stop key="2" offset="50%" stopColor="#2563EB" />,
                <Stop key="3" offset="100%" stopColor="#1E40AF" />,
              ]
            ) : (
              [
                <Stop key="1" offset="0%" stopColor="#F97316" />,
                <Stop key="2" offset="50%" stopColor="#EA580C" />,
                <Stop key="3" offset="100%" stopColor="#9A3412" />,
              ]
            )}
          </LinearGradient>

          <LinearGradient id={`${p}ribbonStripe`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isGold ? (
              [
                <Stop key="1" offset="0%" stopColor="#FEF08A" />,
                <Stop key="2" offset="100%" stopColor="#F59E0B" />,
              ]
            ) : isSilver ? (
              [
                <Stop key="1" offset="0%" stopColor="#FFFFFF" />,
                <Stop key="2" offset="100%" stopColor="#CBD5E1" />,
              ]
            ) : (
              [
                <Stop key="1" offset="0%" stopColor="#FED7AA" />,
                <Stop key="2" offset="100%" stopColor="#FDBA74" />,
              ]
            )}
          </LinearGradient>

          {/* ================= 2. KIM LOẠI HUY CHƯƠNG ================= */}
          {/* Vành ngoài đúc nổi (Outer Beveled Rim) */}
          <LinearGradient id={`${p}coinRim`} x1="15%" y1="10%" x2="85%" y2="90%">
            {isGold ? (
              [
                <Stop key="1" offset="0%" stopColor="#FFFDEB" />,
                <Stop key="2" offset="20%" stopColor="#FDE68A" />,
                <Stop key="3" offset="50%" stopColor="#F59E0B" />,
                <Stop key="4" offset="80%" stopColor="#D97706" />,
                <Stop key="5" offset="100%" stopColor="#78350F" />,
              ]
            ) : isSilver ? (
              [
                <Stop key="1" offset="0%" stopColor="#FFFFFF" />,
                <Stop key="2" offset="25%" stopColor="#F1F5F9" />,
                <Stop key="3" offset="55%" stopColor="#CBD5E1" />,
                <Stop key="4" offset="85%" stopColor="#94A3B8" />,
                <Stop key="5" offset="100%" stopColor="#475569" />,
              ]
            ) : (
              [
                <Stop key="1" offset="0%" stopColor="#FFEDD5" />,
                <Stop key="2" offset="25%" stopColor="#FDBA74" />,
                <Stop key="3" offset="55%" stopColor="#EA580C" />,
                <Stop key="4" offset="85%" stopColor="#9A3412" />,
                <Stop key="5" offset="100%" stopColor="#431407" />,
              ]
            )}
          </LinearGradient>

          {/* Lòng trong huy chương (Inner Coin Face) */}
          <RadialGradient id={`${p}coinInner`} cx="40%" cy="35%" r="65%">
            {isGold ? (
              [
                <Stop key="1" offset="0%" stopColor="#FEF08A" />,
                <Stop key="2" offset="45%" stopColor="#F59E0B" />,
                <Stop key="3" offset="85%" stopColor="#D97706" />,
                <Stop key="4" offset="100%" stopColor="#B45309" />,
              ]
            ) : isSilver ? (
              [
                <Stop key="1" offset="0%" stopColor="#FFFFFF" />,
                <Stop key="2" offset="50%" stopColor="#E2E8F0" />,
                <Stop key="3" offset="85%" stopColor="#94A3B8" />,
                <Stop key="4" offset="100%" stopColor="#64748B" />,
              ]
            ) : (
              [
                <Stop key="1" offset="0%" stopColor="#FED7AA" />,
                <Stop key="2" offset="50%" stopColor="#FB923C" />,
                <Stop key="3" offset="85%" stopColor="#C2410C" />,
                <Stop key="4" offset="100%" stopColor="#7C2D12" />,
              ]
            )}
          </RadialGradient>

          {/* Vết bóng sáng cong (Gloss Highlight) */}
          <LinearGradient id={`${p}gloss`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>

          {/* Sao lấp lánh (Sparkle) */}
          <LinearGradient id={`${p}sparkle`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#FDE047" />
          </LinearGradient>
        </Defs>

        {/* 1. DẢI RUY BĂNG GẬP (Folded V-Ribbon) */}
        <G>
          {/* Cánh ruy băng trái */}
          <Path
            d="M 17 0 L 29 36 L 21 37 L 9 0 Z"
            fill={`url(#${p}ribbonLeft)`}
          />
          {/* Sọc kẻ giữa ruy băng trái */}
          <Path
            d="M 12.5 0 L 25 36.5 L 23 36.7 L 10.5 0 Z"
            fill={`url(#${p}ribbonStripe)`}
            opacity={0.8}
          />

          {/* Cánh ruy băng phải */}
          <Path
            d="M 43 0 L 31 36 L 39 37 L 51 0 Z"
            fill={`url(#${p}ribbonRight)`}
          />
          {/* Sọc kẻ giữa ruy băng phải */}
          <Path
            d="M 47.5 0 L 35 36.5 L 37 36.7 L 49.5 0 Z"
            fill={`url(#${p}ribbonStripe)`}
            opacity={0.8}
          />
        </G>

        {/* 2. BÓNG ĐỔ DƯỚI HUY CHƯƠNG */}
        <Ellipse cx="30" cy="50" rx="19.5" ry="19.5" fill="rgba(0,0,0,0.22)" />

        {/* 3. MẶT NGOÀI HUY CHƯƠNG (Outer Coin Rim) */}
        <Circle cx="30" cy="48" r="19" fill={`url(#${p}coinRim)`} />

        {/* 4. RÃNH VIỀN 3D NỔI (Beveled Grooves) */}
        <Circle
          cx="30"
          cy="48"
          r="16.5"
          stroke={isGold ? '#FEF08A' : isSilver ? '#FFFFFF' : '#FED7AA'}
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          opacity={0.8}
          fill="none"
        />

        {/* 5. LÒNG TRONG HUY CHƯƠNG (Inner Coin Face) */}
        <Circle cx="30" cy="48" r="15" fill={`url(#${p}coinInner)`} />

        {/* 6. VẾT BÓNG SÁNG CONG 3D (Gloss Curvature) */}
        <Path
          d="M 17 42 C 19 36, 26 34, 34 35 C 28 37, 21 41, 18 47 Z"
          fill={`url(#${p}gloss)`}
        />

        {/* 7. CHỮ SỐ THỨ HẠNG NỔI KHỐI (Embossed Rank Number) */}
        {/* Bóng chữ số đổ nổi khối */}
        <SvgText
          x="31.2"
          y="55.2"
          fontSize="20"
          fontWeight="900"
          textAnchor="middle"
          fill={isGold ? '#78350F' : isSilver ? '#334155' : '#431407'}
          opacity={0.65}
        >
          {rank}
        </SvgText>
        {/* Mặt chữ số chính */}
        <SvgText
          x="30"
          y="54"
          fontSize="20"
          fontWeight="900"
          textAnchor="middle"
          fill="#FFFFFF"
        >
          {rank}
        </SvgText>

        {/* 8. NGÔI SAO LẤP LÁNH ĐỈNH HUY CHƯƠNG (Sparkle Star) */}
        {isGold && (
          <G transform="translate(44, 34)">
            <Path
              d="M 0 -4.5 Q 0 0 4.5 0 Q 0 0 0 4.5 Q 0 0 -4.5 0 Q 0 0 0 -4.5 Z"
              fill={`url(#${p}sparkle)`}
            />
            <Circle cx="0" cy="0" r="1" fill="#FFFFFF" />
          </G>
        )}
      </Svg>
    </View>
  );
};

/**
 * Vương miện Quán quân 3D Vector (UI/UX Pro Max)
 * Thay thế cho emoji 👑 bị vỡ hạt
 */
export const Crown3D: React.FC<{ size?: number }> = ({ size = 26 }) => {
  return (
    <View style={[styles.center, { width: size, height: (size * 22) / 28 }]}>
      <Svg width={size} height={(size * 22) / 28} viewBox="0 0 32 25" fill="none">
        <Defs>
          {/* Thân vương miện vàng óng */}
          <LinearGradient id="crownGold" x1="10%" y1="0%" x2="90%" y2="100%">
            <Stop offset="0%" stopColor="#FFFDEB" />
            <Stop offset="25%" stopColor="#FDE047" />
            <Stop offset="55%" stopColor="#F59E0B" />
            <Stop offset="85%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>

          {/* Đai viền vương miện */}
          <LinearGradient id="crownBase" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#CA8A04" />
            <Stop offset="50%" stopColor="#FEF08A" />
            <Stop offset="100%" stopColor="#CA8A04" />
          </LinearGradient>

          {/* Ngọc ruby đỏ */}
          <RadialGradient id="rubyGrad" cx="35%" cy="30%" r="65%">
            <Stop offset="0%" stopColor="#FECACA" />
            <Stop offset="40%" stopColor="#EF4444" />
            <Stop offset="100%" stopColor="#991B1B" />
          </RadialGradient>

          {/* Ngọc sapphire xanh dương */}
          <RadialGradient id="sapphireGrad" cx="35%" cy="30%" r="65%">
            <Stop offset="0%" stopColor="#BFDBFE" />
            <Stop offset="40%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#1E40AF" />
          </RadialGradient>
        </Defs>

        {/* Bóng đổ vương miện */}
        <Ellipse cx="16" cy="23.5" rx="12" ry="2.2" fill="rgba(0,0,0,0.25)" />

        {/* Thân vương miện 3 đỉnh uốn cong 3D */}
        <Path
          d="M 4 20 L 5 7 L 11 14 L 16 3 L 21 14 L 27 7 L 28 20 Z"
          fill="url(#crownGold)"
        />

        {/* Đai vương miện phía dưới (Crown Base Band) */}
        <Rect x="4" y="19" width="24" height="4.5" rx="2" fill="url(#crownBase)" />
        {/* Rãnh kim cương trên đai */}
        <Circle cx="8" cy="21.2" r="1.1" fill="#78350F" />
        <Circle cx="12" cy="21.2" r="1.1" fill="#78350F" />
        <Circle cx="16" cy="21.2" r="1.3" fill="#B91C1C" />
        <Circle cx="20" cy="21.2" r="1.1" fill="#78350F" />
        <Circle cx="24" cy="21.2" r="1.1" fill="#78350F" />

        {/* Viên ngọc trên 3 đỉnh chóp */}
        {/* Đỉnh trái (Sapphire) */}
        <Circle cx="5" cy="6.5" r="2.2" fill="url(#sapphireGrad)" />
        <Circle cx="4.5" cy="5.8" r="0.7" fill="#FFFFFF" />

        {/* Đỉnh giữa cao nhất (Ruby lớn) */}
        <Circle cx="16" cy="2.5" r="3" fill="url(#rubyGrad)" />
        <Circle cx="15.2" cy="1.6" r="1" fill="#FFFFFF" />

        {/* Đỉnh phải (Sapphire) */}
        <Circle cx="27" cy="6.5" r="2.2" fill="url(#sapphireGrad)" />
        <Circle cx="26.5" cy="5.8" r="0.7" fill="#FFFFFF" />

        {/* Vệt loáng sáng thân vương miện */}
        <Path
          d="M 15 5 L 17 5 L 18 13 L 14 13 Z"
          fill="#FFFFFF"
          opacity={0.35}
        />
      </Svg>
    </View>
  );
};

/**
 * Cúp Vàng Vinh Danh 3D Cao cấp (Top Right Trophy Cup)
 * Rực rỡ, chân thực, thay thế icon cúp 2D phẳng
 */
export const Trophy3D: React.FC<{ size?: number }> = ({ size = 76 }) => {
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
        <Defs>
          {/* Ánh sáng hào quang phía sau cúp */}
          <RadialGradient id="trophyGlow" cx="50%" cy="40%" r="55%">
            <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.45" />
            <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </RadialGradient>

          {/* Vàng cúp kim loại 3D */}
          <LinearGradient id="cupGoldGrad" x1="15%" y1="10%" x2="85%" y2="90%">
            <Stop offset="0%" stopColor="#FFFDEB" />
            <Stop offset="22%" stopColor="#FDE68A" />
            <Stop offset="50%" stopColor="#F59E0B" />
            <Stop offset="80%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>

          {/* Chân đế đá cúp (Trophy Marble/Pedestal) */}
          <LinearGradient id="pedestalBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#64748B" />
            <Stop offset="50%" stopColor="#334155" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>

          {/* Vành miệng cúp vàng */}
          <LinearGradient id="cupRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="50%" stopColor="#FFFDEB" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>

          {/* Quai cầm cúp (Handles) */}
          <LinearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="40%" stopColor="#FBBF24" />
            <Stop offset="100%" stopColor="#92400E" />
          </LinearGradient>

          {/* Vết loáng bóng (Gloss) */}
          <LinearGradient id="trophyGloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* 1. Hào quang tỏa sáng phía sau */}
        <Circle cx="44" cy="40" r="38" fill="url(#trophyGlow)" />

        {/* 2. Bóng đổ đế cúp */}
        <Ellipse cx="44" cy="78" rx="22" ry="5.5" fill="rgba(0,0,0,0.3)" />

        {/* 3. Chân đế cúp (Pedestal) */}
        {/* Tầng dưới của đế */}
        <Rect x="26" y="69" width="36" height="9" rx="3.5" fill="url(#pedestalBaseGrad)" />
        <Rect x="28" y="70" width="32" height="1.8" rx="0.9" fill="#94A3B8" opacity={0.6} />

        {/* Tầng trên của đế */}
        <Rect x="31" y="62" width="26" height="8" rx="2.5" fill="url(#cupGoldGrad)" />

        {/* Trụ cổ cúp nối lên thân */}
        <Path d="M 39 53 L 49 53 L 47 63 L 41 63 Z" fill="url(#cupGoldGrad)" />

        {/* 4. Hai quai cầm cúp 3D (Trophy Handles) */}
        {/* Quai trái */}
        <Path
          d="M 27 24 C 13 24, 10 38, 20 46 C 24 49, 29 48, 29 44 C 29 42, 23 42, 20 38 C 17 33, 20 28, 27 28 Z"
          fill="url(#handleGrad)"
        />
        {/* Quai phải */}
        <Path
          d="M 61 24 C 75 24, 78 38, 68 46 C 64 49, 59 48, 59 44 C 59 42, 65 42, 68 38 C 71 33, 68 28, 61 28 Z"
          fill="url(#handleGrad)"
        />

        {/* 5. Thân bầu cúp chính (Cup Body) */}
        <Path
          d="M 26 18
             L 62 18
             C 62 38, 56 54, 44 54
             C 32 54, 26 38, 26 18 Z"
          fill="url(#cupGoldGrad)"
        />

        {/* Vành miệng cúp nổi (Cup Rim) */}
        <Ellipse cx="44" cy="18" rx="19" ry="5" fill="url(#cupRimGrad)" />
        <Ellipse cx="44" cy="18" rx="16" ry="3.5" fill="#78350F" opacity={0.6} />

        {/* 6. Vết loáng bóng 3D cong theo thân cúp */}
        <Path
          d="M 32 22
             C 34 22, 38 28, 36 38
             C 34 46, 31 48, 30 48
             C 29 44, 30 32, 32 22 Z"
          fill="url(#trophyGloss)"
        />

        {/* 7. Ngôi sao chạm nổi chính giữa thân cúp */}
        <G transform="translate(44, 34)">
          {/* Bóng sao */}
          <Path
            d="M 0 -8.5 Q 0 0 8.5 0 Q 0 0 0 8.5 Q 0 0 -8.5 0 Q 0 0 0 -8.5 Z"
            fill="#78350F"
            opacity={0.5}
            transform="translate(0.8, 1)"
          />
          {/* Sao trắng vàng nổi */}
          <Path
            d="M 0 -8.5 Q 0 0 8.5 0 Q 0 0 0 8.5 Q 0 0 -8.5 0 Q 0 0 0 -8.5 Z"
            fill="#FFFDEB"
          />
          <Circle cx="0" cy="0" r="1.8" fill="#F59E0B" />
        </G>

        {/* 8. Các ngôi sao phép màu lấp lánh xung quanh cúp */}
        <G transform="translate(71, 15)">
          <Path d="M 0 -5 Q 0 0 5 0 Q 0 0 0 5 Q 0 0 -5 0 Q 0 0 0 -5 Z" fill="#FEF08A" />
          <Circle cx="0" cy="0" r="1" fill="#FFFFFF" />
        </G>
        <G transform="translate(16, 17)">
          <Path d="M 0 -4 Q 0 0 4 0 Q 0 0 0 4 Q 0 0 -4 0 Q 0 0 0 -4 Z" fill="#FEF08A" />
        </G>
        <Circle cx="76" cy="34" r="1.6" fill="#FDE047" opacity={0.85} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
