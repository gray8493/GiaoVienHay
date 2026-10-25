import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Ellipse,
  Rect,
  Line,
  G,
} from 'react-native-svg';

interface EducationHero3DProps {
  width?: number;
  height?: number;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Component Minh hoạ Giáo dục 3D Cao cấp (UI/UX Pro Max)
 * Thay thế cho hình ảnh tĩnh bị dính phông nền chữ nhật:
 * - 100% Vector SVG trong suốt (Transparent Background), không dính phông caro hay khối nền chữ nhật.
 * - Gồm: Sổ tay lò xo xanh ngọc (Mint Notebook), Bút chì 3D (Pencil), Mũ cử nhân (Graduation Cap), Chuông vàng cán gỗ (Golden Bell).
 * - Tích hợp bóng đổ nổi khối (Clay 3D depth shadows), ánh sáng specular và hiệu ứng bồng bềnh nhẹ nhàng.
 */
export const EducationHero3D: React.FC<EducationHero3DProps> = ({
  width = 270,
  height = 175,
  animated = true,
  style,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Hoạt ảnh bồng bềnh 3D mượt mà
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Hoạt ảnh lấp lánh nhẹ của các ngôi sao
    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    sparkleLoop.start();

    return () => {
      floatLoop.stop();
      sparkleLoop.stop();
    };
  }, [animated, floatAnim, sparkleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          transform: [{ translateY: animated ? floatAnim : 0 }],
        },
        style,
      ]}
    >
      <Svg width={width} height={height} viewBox="0 0 280 180" fill="none">
        <Defs>
          {/* ================= 1. BÓNG ĐỔ KHÔNG GIAN (Depth Shadows) ================= */}
          <RadialGradient id="ambientSoftGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFA459" stopOpacity="0.25" />
            <Stop offset="70%" stopColor="#FFC38B" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>

          {/* ================= 2. SỔ TAY XANH NGỌC (Mint 3D Notebook) ================= */}
          {/* Mặt bìa sổ gradient */}
          <LinearGradient id="mintCoverGrad" x1="15%" y1="10%" x2="85%" y2="90%">
            <Stop offset="0%" stopColor="#C6F6D5" />
            <Stop offset="25%" stopColor="#9AE6B4" />
            <Stop offset="65%" stopColor="#68D391" />
            <Stop offset="100%" stopColor="#38A169" />
          </LinearGradient>

          {/* Độ dày mép sách (Cover thickness) */}
          <LinearGradient id="mintThicknessGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#48BB78" />
            <Stop offset="100%" stopColor="#22543D" />
          </LinearGradient>

          {/* Các trang giấy bên trong (Cream Pages) */}
          <LinearGradient id="pageStackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="80%" stopColor="#FEFCBF" />
            <Stop offset="100%" stopColor="#ECC94B" />
          </LinearGradient>

          {/* Vòng xoắn lò xo bạc 3D */}
          <LinearGradient id="spiralRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="35%" stopColor="#E2E8F0" />
            <Stop offset="70%" stopColor="#CBD5E1" />
            <Stop offset="100%" stopColor="#64748B" />
          </LinearGradient>

          {/* ================= 3. MŨ CỬ NHÂN (Navy Graduation Cap) ================= */}
          {/* Đỉnh nón thoi 3D */}
          <LinearGradient id="capTopGrad" x1="20%" y1="10%" x2="80%" y2="90%">
            <Stop offset="0%" stopColor="#475569" />
            <Stop offset="25%" stopColor="#334155" />
            <Stop offset="75%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>

          {/* Mép vát nón cử nhân */}
          <LinearGradient id="capBevelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#020617" />
          </LinearGradient>

          {/* Chóp nón ôm đầu (Skullcap) */}
          <LinearGradient id="skullCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#334155" />
            <Stop offset="60%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#020617" />
          </LinearGradient>

          {/* Dây tua rua vàng (Golden Tassel) */}
          <LinearGradient id="tasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="40%" stopColor="#FACC15" />
            <Stop offset="85%" stopColor="#CA8A04" />
            <Stop offset="100%" stopColor="#854D0E" />
          </LinearGradient>

          {/* ================= 4. CHUÔNG VÀNG CÁN GỖ (Golden School Bell) ================= */}
          {/* Cán gỗ (Wooden Handle) */}
          <LinearGradient id="woodHandleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FDBA74" />
            <Stop offset="30%" stopColor="#C2410C" />
            <Stop offset="70%" stopColor="#9A3412" />
            <Stop offset="100%" stopColor="#451A03" />
          </LinearGradient>

          {/* Thân chuông vàng bóng */}
          <LinearGradient id="bellGoldGrad" x1="20%" y1="10%" x2="80%" y2="90%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="25%" stopColor="#FDE68A" />
            <Stop offset="50%" stopColor="#F59E0B" />
            <Stop offset="80%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>

          {/* Vành chuông đúc */}
          <LinearGradient id="bellGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FEF3C7" />
            <Stop offset="45%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#451A03" />
          </LinearGradient>

          {/* ================= 5. BÚT CHÌ VÀNG (3D Yellow Pencil) ================= */}
          <LinearGradient id="pencilWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="40%" stopColor="#EAB308" />
            <Stop offset="85%" stopColor="#CA8A04" />
            <Stop offset="100%" stopColor="#713F12" />
          </LinearGradient>

          <LinearGradient id="pencilEraserGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F472B6" />
            <Stop offset="60%" stopColor="#DB2777" />
            <Stop offset="100%" stopColor="#9D174D" />
          </LinearGradient>

          <LinearGradient id="pencilFerruleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F8FAFC" />
            <Stop offset="50%" stopColor="#CBD5E1" />
            <Stop offset="100%" stopColor="#64748B" />
          </LinearGradient>

          <LinearGradient id="pencilConeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FED7AA" />
            <Stop offset="100%" stopColor="#FDBA74" />
          </LinearGradient>

          {/* ================= 6. VẾT BÓNG SÁNG & NGÔI SAO (Shine & Sparkles) ================= */}
          <LinearGradient id="specularGloss" x1="0%" y1="0%" x2="80%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>

          <LinearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="45%" stopColor="#FDE047" />
            <Stop offset="100%" stopColor="#F97316" />
          </LinearGradient>
        </Defs>

        {/* 0. Ambient Light Glow nhẹ xung quanh */}
        <Circle cx="140" cy="90" r="110" fill="url(#ambientSoftGlow)" />

        {/* ================= BÓNG ĐỔ DƯỚI NỀN (3D Ground Ambient Shadows) ================= */}
        <G opacity={0.25}>
          {/* Bóng sổ tay */}
          <Ellipse cx="112" cy="138" rx="46" ry="9" fill="#9A3412" />
          {/* Bóng mũ cử nhân */}
          <Ellipse cx="178" cy="126" rx="30" ry="7" fill="#1E293B" />
          {/* Bóng chuông */}
          <Ellipse cx="218" cy="138" rx="20" ry="5.5" fill="#9A3412" />
          {/* Bóng bút chì */}
          <Ellipse cx="72" cy="142" rx="22" ry="4.5" fill="#9A3412" />
        </G>

        {/* ================= 1. SỔ TAY LÒ XO XANH NGỌC (Mint 3D Notebook) ================= */}
        <G transform="rotate(-7 110 95)">
          {/* Bìa dưới & độ dày gáy sổ (Bottom Cover & Spine Bevel) */}
          <Path
            d="M 64 56 C 64 50, 70 46, 76 46 L 144 46 C 150 46, 156 50, 156 56 L 156 126 C 156 132, 150 136, 144 136 L 76 136 C 70 136, 64 132, 64 126 Z"
            fill="url(#mintThicknessGrad)"
          />

          {/* Lớp xấp giấy trắng ngà (Page Stack Thickness) */}
          <Path
            d="M 69 52 L 147 52 C 151 52, 154 55, 154 59 L 154 128 C 154 132, 151 134, 147 134 L 69 134 C 67 134, 66 133, 66 131 L 66 55 C 66 53, 67 52, 69 52 Z"
            fill="url(#pageStackGrad)"
          />
          {/* Viền nếp gấp cạnh giấy */}
          <Path d="M 152 56 L 152 129" stroke="#E2E8F0" strokeWidth="1.2" />

          {/* Bìa trước nổi khối 3D (Mint Front Cover) */}
          <Rect
            x="64"
            y="48"
            width="88"
            height="84"
            rx="12"
            fill="url(#mintCoverGrad)"
          />

          {/* Vết loáng bóng trên bìa sổ (Gloss reflection) */}
          <Path
            d="M 72 54 C 80 52, 110 52, 126 56 C 100 68, 76 84, 70 102 C 68 94, 68 62, 72 54 Z"
            fill="url(#specularGloss)"
            opacity={0.65}
          />

          {/* Logo quả táo / mầm lá nổi dễ thương trên bìa (Cute Emblem) */}
          <G transform="translate(108, 86)">
            {/* Quả táo / trái tim */}
            <Circle cx="0" cy="2" r="9" fill="#34D399" opacity={0.9} />
            <Circle cx="-3" cy="1" r="2.2" fill="#FFFFFF" opacity={0.6} />
            {/* Cuống lá xinh */}
            <Path
              d="M 0 -7 C 2 -11, 6 -11, 7 -8 C 7 -5, 3 -5, 0 -7 Z"
              fill="#059669"
            />
          </G>

          {/* Các vòng xoắn lò xo 3D bên hông trái (White-Silver Spiral Rings) */}
          {[56, 66, 76, 86, 96, 106, 116].map((ringY, idx) => (
            <G key={`spiral-${idx}`}>
              {/* Lỗ xỏ lò xo */}
              <Circle cx="67" cy={ringY + 1} r="2.5" fill="#22543D" opacity={0.6} />
              {/* Vòng kim loại uốn cong 3D */}
              <Path
                d={`M 67 ${ringY - 2} C 57 ${ringY - 2}, 57 ${ringY + 4}, 67 ${ringY + 4}`}
                stroke="url(#spiralRingGrad)"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Đốm bóng kim loại */}
              <Circle cx="59" cy={ringY + 1} r="1" fill="#FFFFFF" />
            </G>
          ))}
        </G>

        {/* ================= 2. MŨ CỬ NHÂN 3D (Navy Graduation Mortarboard) ================= */}
        <G transform="rotate(4 178 82)">
          {/* Chóp nón ôm đầu bên dưới (Cap Crown / Skullcap) */}
          <Path
            d="M 162 76 C 162 76, 160 94, 178 96 C 196 94, 194 76, 194 76 Z"
            fill="url(#skullCapGrad)"
          />
          <Ellipse cx="178" cy="76" rx="16" ry="4" fill="#0F172A" />

          {/* Độ dày cạnh vát của mặt nón (Diamond Bevel Thickness) */}
          <Path
            d="M 144 68 L 178 84 L 212 68 L 212 72 L 178 88 L 144 72 Z"
            fill="url(#capBevelGrad)"
          />

          {/* Mặt thoi phẳng trên đỉnh nón (Diamond Top) */}
          <Path
            d="M 178 52 L 212 68 L 178 84 L 144 68 Z"
            fill="url(#capTopGrad)"
          />

          {/* Vết loáng bóng vát trên mặt nón */}
          <Path
            d="M 178 54 L 198 64 L 178 74 L 158 64 Z"
            fill="#FFFFFF"
            opacity={0.12}
          />

          {/* Nút tròn vàng giữa đỉnh nón (Center Golden Button) */}
          <Circle cx="178" cy="68" r="3.6" fill="url(#tasselGrad)" />
          <Circle cx="177" cy="67" r="1.2" fill="#FFFFFF" opacity={0.8} />

          {/* Dây tua rua buông rủ 3D (Golden Tassel String) */}
          <Path
            d="M 178 68 C 188 66, 198 72, 204 80 L 204 90"
            stroke="url(#tasselGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Chùm tua rua rủ xuống (Tassel Fringe) */}
          <Path
            d="M 201 90 L 207 90 L 206 100 C 205 102, 203 102, 202 100 Z"
            fill="url(#tasselGrad)"
          />
          {/* Nhẫn thắt tua rua */}
          <Rect x="200.5" y="89" width="7" height="2.5" rx="1" fill="#78350F" />
        </G>

        {/* ================= 3. CHUÔNG VÀNG CÁN GỖ (Golden School Bell) ================= */}
        <G transform="rotate(22 216 106)">
          {/* Cán cầm bằng gỗ tiện tròn 3D (Lathed Wooden Handle) */}
          {/* Đỉnh núm tròn của cán gỗ */}
          <Circle cx="216" cy="66" r="4.5" fill="url(#woodHandleGrad)" />
          <Circle cx="214.5" cy="64.5" r="1.3" fill="#FFFFFF" opacity={0.7} />
          {/* Thân cán gỗ thon */}
          <Path
            d="M 213.5 69 C 213 78, 214 84, 212 90 L 220 90 C 218 84, 219 78, 218.5 69 Z"
            fill="url(#woodHandleGrad)"
          />
          {/* Vòng nối kim loại giữa cán gỗ và chuông */}
          <Rect x="211" y="89" width="10" height="3" rx="1" fill="#FDE68A" />

          {/* Thân vòm chuông vàng 3D (Bell Gold Dome) */}
          <Path
            d="M 216 91
               C 220 91, 224 95, 226 102
               C 227 107, 226 113, 230 119
               C 232 123, 234 125, 234 127
               C 234 130, 226 132, 216 132
               C 206 132, 198 130, 198 127
               C 198 125, 200 123, 202 119
               C 206 113, 205 107, 206 102
               C 208 95, 212 91, 216 91 Z"
            fill="url(#bellGoldGrad)"
          />

          {/* Vành miệng chuông đúc nổi (Gold Rim Lip) */}
          <Ellipse cx="216" cy="127" rx="18" ry="4.5" fill="url(#bellGoldRim)" />
          {/* Rãnh bóng sáng trong vành chuông */}
          <Ellipse cx="216" cy="127" rx="15" ry="2.8" stroke="#FFFBEB" strokeWidth="1" fill="none" opacity={0.6} />

          {/* Quả lắc tròn nhỏ thò ra dưới đáy (Clapper) */}
          <Circle cx="216" cy="132" r="3.2" fill="#78350F" />
          <Circle cx="215.2" cy="131" r="1" fill="#FDE68A" />

          {/* Vệt loáng cong bóng bẩy trên thân chuông */}
          <Path
            d="M 210 96 C 212 96, 212 104, 209 112 C 206 120, 202 122, 202 121 C 203 116, 207 106, 208 98 Z"
            fill="#FFFFFF"
            opacity={0.7}
          />
        </G>

        {/* ================= 4. BÚT CHÌ VÀNG 3D (Yellow 3D Pencil) ================= */}
        <G transform="rotate(-26 80 134)">
          {/* Tẩy hồng phía đuôi (Pink Eraser) */}
          <Path
            d="M 52 131 C 49 131, 47 133, 47 136 C 47 139, 49 141, 52 141 L 56 141 L 56 131 Z"
            fill="url(#pencilEraserGrad)"
          />
          {/* Khâu kim loại bạc (Silver Ferrule) */}
          <Rect x="56" y="131" width="6" height="10" fill="url(#pencilFerruleGrad)" />
          <Line x1="59" y1="131" x2="59" y2="141" stroke="#64748B" strokeWidth="0.8" />

          {/* Thân bút chì vàng vát cạnh (Yellow Barrel) */}
          <Rect x="62" y="131" width="30" height="10" fill="url(#pencilWoodGrad)" />
          {/* Đường khía cạnh 3D trên thân chì */}
          <Line x1="62" y1="134.5" x2="92" y2="134.5" stroke="#FFFFFF" strokeWidth="1.2" opacity={0.6} />
          <Line x1="62" y1="138" x2="92" y2="138" stroke="#713F12" strokeWidth="0.8" opacity={0.4} />

          {/* Đầu gỗ chuốt nhọn (Sharpened Wood Cone) */}
          <Path d="M 92 131 L 102 136 L 92 141 Z" fill="url(#pencilConeGrad)" />

          {/* Ngòi chì xám đen (Graphite Lead Tip) */}
          <Path d="M 99 134.5 L 103 136 L 99 137.5 Z" fill="#1E293B" />
        </G>

        {/* ================= 5. CÁC NGÔI SAO PHÉP MÀU 3D LẤP LÁNH (Magical Sparkles) ================= */}
        {/* Ngôi sao to góc trên trái */}
        <G transform="translate(48, 48)">
          <Path
            d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z"
            fill="url(#starGrad)"
          />
          <Circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
        </G>

        {/* Ngôi sao giữa đỉnh */}
        <G transform="translate(136, 32)">
          <Path
            d="M 0 -6 Q 0 0 6 0 Q 0 0 0 6 Q 0 0 -6 0 Q 0 0 0 -6 Z"
            fill="url(#starGrad)"
          />
          <Circle cx="0" cy="0" r="1.2" fill="#FFFFFF" />
        </G>

        {/* Ngôi sao góc trên phải */}
        <G transform="translate(242, 54)">
          <Path
            d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z"
            fill="url(#starGrad)"
          />
          <Circle cx="0" cy="0" r="1.4" fill="#FFFFFF" />
        </G>

        {/* Ngôi sao nhỏ phía dưới chuông */}
        <G transform="translate(248, 122)">
          <Path
            d="M 0 -5 Q 0 0 5 0 Q 0 0 0 5 Q 0 0 -5 0 Q 0 0 0 -5 Z"
            fill="url(#starGrad)"
          />
          <Circle cx="0" cy="0" r="1" fill="#FFFFFF" />
        </G>

        {/* Ngôi sao nhỏ cạnh bút chì */}
        <G transform="translate(78, 156)">
          <Path
            d="M 0 -4.5 Q 0 0 4.5 0 Q 0 0 0 4.5 Q 0 0 -4.5 0 Q 0 0 0 -4.5 Z"
            fill="url(#starGrad)"
            opacity={0.85}
          />
        </G>

        {/* Các hạt bụi ánh sáng vàng lơ lửng (Ambient Fairy Dust Orbs) */}
        <Circle cx="42" cy="74" r="1.8" fill="#FDE047" opacity={0.7} />
        <Circle cx="120" cy="22" r="1.5" fill="#FDE047" opacity={0.8} />
        <Circle cx="168" cy="40" r="1.6" fill="#FDE047" opacity={0.7} />
        <Circle cx="230" cy="80" r="2" fill="#FDE047" opacity={0.65} />
        <Circle cx="258" cy="98" r="1.4" fill="#FDE047" opacity={0.7} />
        <Circle cx="168" cy="144" r="1.5" fill="#FDE047" opacity={0.6} />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
