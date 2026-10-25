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
  G,
} from 'react-native-svg';

interface Bell3DProps {
  /** Kích thước tổng thể (vuông), mặc định 76 */
  size?: number;
  /** Độ nghiêng nhẹ phong cách 3D (độ âm hoặc dương, mặc định -8) */
  tiltAngle?: number;
  /** Bật hoạt ảnh đung đưa / nhịp thở 3D nhẹ nhàng (mặc định true) */
  animated?: boolean;
  /** Hiển thị các ngôi sao lấp lánh 3D xung quanh (mặc định true) */
  showSparkles?: boolean;
  /** Hiển thị sóng rung âm thanh chuông (mặc định true) */
  showChimeRings?: boolean;
  /** Điểm chấm đỏ báo có thông báo mới */
  hasBadge?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Component Chuông 3D cao cấp (UI/UX Pro Max)
 * - 100% SVG Vector sắc nét, KHÔNG dính phông nền caro giả lập (100% Transparent Background)
 * - Phối màu Amber / Gold bóng bẩy với nhiều tầng ánh sáng specular, rim đổ bóng, quả lắc nổi khối
 * - Tạo cảm giác 3D Depth, Floating Clapper & Ambient Glow
 */
export const Bell3D: React.FC<Bell3DProps> = ({
  size = 76,
  tiltAngle = -7,
  animated = true,
  showSparkles = true,
  showChimeRings = true,
  hasBadge = false,
  style,
}) => {
  const swingAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Hoạt ảnh đung đưa chuông tự nhiên (gentle periodic swing)
    const swingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swingAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swingAnim, {
          toValue: -1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Hoạt ảnh nổi bồng bềnh 3D (gentle floating)
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    swingLoop.start();
    floatLoop.start();

    return () => {
      swingLoop.stop();
      floatLoop.stop();
    };
  }, [animated, swingAnim, floatAnim]);

  const rotateInterpolation = swingAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [`${tiltAngle - 3}deg`, `${tiltAngle}deg`, `${tiltAngle + 3}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { translateY: animated ? floatAnim : 0 },
            { rotate: animated ? rotateInterpolation : `${tiltAngle}deg` },
          ],
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Defs>
          {/* 1. Ambient Glow phía sau chuông */}
          <RadialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFA459" stopOpacity="0.32" />
            <Stop offset="65%" stopColor="#FF8330" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
          </RadialGradient>

          {/* 2. Quai treo chuông (Top Loop) */}
          <LinearGradient id="loopGrad" x1="25%" y1="0%" x2="75%" y2="100%">
            <Stop offset="0%" stopColor="#FFF2B2" />
            <Stop offset="30%" stopColor="#FBBF24" />
            <Stop offset="70%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>

          {/* 3. Thân vòm chuông chính (Bell Dome 3D Body) */}
          <LinearGradient id="bellBodyGrad" x1="15%" y1="10%" x2="88%" y2="92%">
            <Stop offset="0%" stopColor="#FFF7D6" />
            <Stop offset="18%" stopColor="#FDE68A" />
            <Stop offset="42%" stopColor="#F59E0B" />
            <Stop offset="72%" stopColor="#D97706" />
            <Stop offset="92%" stopColor="#B45309" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>

          {/* 4. Vành miệng chuông đúc nổi (Extruded 3D Rim Lip) */}
          <LinearGradient id="rimGrad" x1="10%" y1="0%" x2="90%" y2="100%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="22%" stopColor="#FDE68A" />
            <Stop offset="50%" stopColor="#F59E0B" />
            <Stop offset="82%" stopColor="#B45309" />
            <Stop offset="100%" stopColor="#451A03" />
          </LinearGradient>

          {/* 5. Bên trong lòng chuông (Hollow Cavity) */}
          <RadialGradient id="innerHollowGrad" cx="50%" cy="40%" r="50%">
            <Stop offset="0%" stopColor="#3F1500" />
            <Stop offset="70%" stopColor="#692200" />
            <Stop offset="100%" stopColor="#9A3412" />
          </RadialGradient>

          {/* 6. Quả lắc chuông (3D Clapper Ball) */}
          <RadialGradient id="clapperGrad" cx="35%" cy="30%" r="65%">
            <Stop offset="0%" stopColor="#FFFDEB" />
            <Stop offset="25%" stopColor="#FDE68A" />
            <Stop offset="60%" stopColor="#EA580C" />
            <Stop offset="90%" stopColor="#9A3412" />
            <Stop offset="100%" stopColor="#451A03" />
          </RadialGradient>

          {/* 7. Vết loáng sáng bóng bẩy (Specular Gloss) */}
          <LinearGradient id="glossGrad" x1="0%" y1="0%" x2="80%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
            <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </LinearGradient>

          {/* 8. Viền phản quang đáy (Bottom Bounce Rim Light) */}
          <LinearGradient id="bounceLightGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </LinearGradient>

          {/* 9. Ánh sao lấp lánh (Sparkle Star) */}
          <LinearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="50%" stopColor="#FDE047" />
            <Stop offset="100%" stopColor="#F97316" />
          </LinearGradient>

          {/* 10. Sóng rung âm thanh chuông */}
          <LinearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#F97316" stopOpacity="0" />
            <Stop offset="50%" stopColor="#F59E0B" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* 1. Ambient Glow nhẹ xung quanh */}
        <Circle cx="60" cy="60" r="54" fill="url(#ambientGlow)" />

        {/* 2. Sóng âm thanh lan toả (Chime Rings) */}
        {showChimeRings && (
          <G opacity={0.65}>
            <Path
              d="M100 42 C108 50, 108 66, 100 76"
              stroke="url(#sparkleGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <Path
              d="M109 35 C120 47, 120 71, 109 85"
              stroke="url(#sparkleGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 3"
              opacity={0.7}
            />
          </G>
        )}

        {/* 3. Bóng đổ lอย (3D Floating Drop Shadow) */}
        <Ellipse cx="60" cy="112" rx="34" ry="5.5" fill="#C2410C" fillOpacity="0.22" />

        {/* 4. Quai móc đỉnh chuông (Top Loop) */}
        <G>
          {/* Thân ngoài quai */}
          <Path
            d="M48 24 C48 13, 72 13, 72 24 C72 28, 48 28, 48 24 Z"
            fill="url(#loopGrad)"
          />
          {/* Lỗ hổng bên trong quai */}
          <Path
            d="M53 23 C53 17, 67 17, 67 23 C67 25, 53 25, 53 23 Z"
            fill="#FFE79A"
            opacity={0.35}
          />
          {/* Vết loáng quai */}
          <Path
            d="M50 20 C50 14, 60 14, 62 16"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={0.8}
          />
        </G>

        {/* 5. Quả lắc chuông (Clapper) thò ra bên dưới */}
        <G>
          {/* Cuống lắc bên trong */}
          <Path d="M58 84 L58 96 L62 96 L62 84 Z" fill="#692200" />
          {/* Quả bi lắc vàng óng 3D */}
          <Circle cx="60" cy="98" r="9.5" fill="url(#clapperGrad)" />
          {/* Đốm sáng trên bi lắc */}
          <Circle cx="57" cy="95" r="2.8" fill="#FFFFFF" opacity={0.85} />
          <Circle cx="62" cy="100" r="1.5" fill="#FFFBEB" opacity={0.4} />
        </G>

        {/* 6. Lòng trong miệng chuông (Hollow Dark Interior) */}
        <Ellipse cx="60" cy="87" rx="35" ry="9" fill="url(#innerHollowGrad)" />

        {/* 7. Thân vòm chuông chính (Bell 3D Dome) */}
        <Path
          d="M 60 22
             C 65 22, 72 26, 75 36
             C 77 44, 76 56, 79 67
             C 82 77, 95 82, 95 87
             C 95 91, 80 94, 60 94
             C 40 94, 25 91, 25 87
             C 25 82, 38 77, 41 67
             C 44 56, 43 44, 45 36
             C 48 26, 55 22, 60 22 Z"
          fill="url(#bellBodyGrad)"
        />

        {/* 8. Vành đúc dày 3D ở miệng chuông (Torus 3D Lip) */}
        <Path
          d="M 23 87
             C 23 82.5, 39 79, 60 79
             C 81 79, 97 82.5, 97 87
             C 97 92, 81 96, 60 96
             C 39 96, 23 92, 23 87 Z"
          fill="url(#rimGrad)"
        />

        {/* Rãnh sáng bên trong vành miệng chuông */}
        <Ellipse
          cx="60"
          cy="87.5"
          rx="34.5"
          ry="6.5"
          stroke="url(#bounceLightGrad)"
          strokeWidth="1.6"
          fill="none"
        />

        {/* 9. Vết bóng loáng vát cong 3D (Gloss Specular Curvature) */}
        <Path
          d="M 49 32
             C 52 32, 53 38, 51 46
             C 48 57, 43 68, 38 76
             C 34 77, 32 75, 34 70
             C 37 60, 42 46, 44 38
             C 45 34, 47 32, 49 32 Z"
          fill="url(#glossGrad)"
        />

        {/* Đốm loáng sáng đỉnh vòm (Crown Specular Dot) */}
        <Ellipse
          cx="52"
          cy="31"
          rx="5"
          ry="2.5"
          transform="rotate(-18 52 31)"
          fill="#FFFFFF"
          opacity={0.88}
        />

        {/* Vệt phản quang nhẹ phía đối xứng bên phải */}
        <Path
          d="M 72 38
             C 74 44, 73 54, 76 66
             C 77 71, 79 74, 80 73
             C 79 70, 77 64, 75 54
             C 74 46, 73 40, 72 38 Z"
          fill="#FFFFFF"
          opacity={0.25}
        />

        {/* 10. Các ngôi sao phép màu 3D lấp lánh (Sparkle Stars) */}
        {showSparkles && (
          <G>
            {/* Ngôi sao lớn trên góc phải */}
            <Path
              d="M 98 16 Q 98 23 105 23 Q 98 23 98 30 Q 98 23 91 23 Q 98 23 98 16 Z"
              fill="url(#sparkleGrad)"
            />
            <Circle cx="98" cy="23" r="1.8" fill="#FFFFFF" />

            {/* Ngôi sao nhỏ bên góc trái */}
            <Path
              d="M 18 54 Q 18 59 23 59 Q 18 59 18 64 Q 18 59 13 59 Q 18 59 18 54 Z"
              fill="url(#sparkleGrad)"
              opacity={0.9}
            />
            <Circle cx="18" cy="59" r="1.2" fill="#FFFFFF" />

            {/* Đốm sao li ti bay lơ lửng */}
            <Circle cx="106" cy="38" r="1.5" fill="#FDE047" opacity={0.85} />
            <Circle cx="24" cy="40" r="1.2" fill="#FDE047" opacity={0.7} />
          </G>
        )}

        {/* 11. Chấm đỏ báo thông báo mới (nếu có) */}
        {hasBadge && (
          <G>
            <Circle cx="92" cy="28" r="7.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.2" />
            <Circle cx="90" cy="26" r="2.2" fill="#FCA5A5" opacity={0.8} />
          </G>
        )}
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
