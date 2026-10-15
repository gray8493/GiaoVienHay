import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

export const StudentAvatar: React.FC<{ size?: number }> = ({ size = 64 }) => {
  return (
    <View style={styles.center}>
      <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <Defs>
          <LinearGradient id="studentSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FED7AA" />
            <Stop offset="100%" stopColor="#FDBA74" />
          </LinearGradient>
          <LinearGradient id="studentShirt" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>
          <LinearGradient id="studentVest" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FBBF24" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>
        </Defs>

        {/* Head */}
        <Circle cx="40" cy="28" r="16" fill="url(#studentSkin)" />

        {/* Brown Hair */}
        <Path
          d="M26 25 C26 14 54 14 54 25 C50 20 44 18 36 22 C30 25 28 26 26 25 Z"
          fill="#78350F"
        />

        {/* Eyes & Smile */}
        <Circle cx="35" cy="27" r="1.8" fill="#1F2937" />
        <Circle cx="45" cy="27" r="1.8" fill="#1F2937" />
        <Path d="M38 33 Q40 36 42 33" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Shoulders / Green Shirt */}
        <Path d="M22 68 Q24 45 40 45 Q56 45 58 68 Z" fill="url(#studentShirt)" />

        {/* Yellow Vest / Suspenders */}
        <Rect x="30" y="47" width="5" height="21" rx="2" fill="url(#studentVest)" />
        <Rect x="45" y="47" width="5" height="21" rx="2" fill="url(#studentVest)" />

        {/* Book / Bag in hands */}
        <Rect x="26" y="52" width="28" height="18" rx="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="1" />
        <Rect x="30" y="55" width="20" height="2" fill="#FFFFFF" opacity={0.8} />
        <Rect x="30" y="60" width="14" height="2" fill="#FFFFFF" opacity={0.8} />
      </Svg>
    </View>
  );
};

export const ParentsAvatar: React.FC<{ size?: number }> = ({ size = 64 }) => {
  return (
    <View style={styles.center}>
      <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <Defs>
          <LinearGradient id="parentSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FED7AA" />
            <Stop offset="100%" stopColor="#FDBA74" />
          </LinearGradient>
        </Defs>

        {/* Father (Left) */}
        <G>
          <Circle cx="30" cy="30" r="13" fill="url(#parentSkin)" />
          {/* Hair */}
          <Path d="M19 28 C19 18 41 18 41 28 C37 23 32 22 25 25 Z" fill="#451A03" />
          {/* Glasses */}
          <Circle cx="26" cy="30" r="4.5" stroke="#1F2937" strokeWidth="1.5" fill="none" />
          <Circle cx="35" cy="30" r="4.5" stroke="#1F2937" strokeWidth="1.5" fill="none" />
          <Path d="M30.5 30 L31.5 30" stroke="#1F2937" strokeWidth="1.5" />
          <Circle cx="26" cy="30" r="1.5" fill="#1F2937" />
          <Circle cx="35" cy="30" r="1.5" fill="#1F2937" />
          <Path d="M29 36 Q31 38 33 36" stroke="#DC2626" strokeWidth="1" strokeLinecap="round" fill="none" />
          {/* Blue Polo */}
          <Path d="M16 68 Q18 46 30 46 Q40 46 42 68 Z" fill="#2563EB" />
        </G>

        {/* Mother / Child (Right) */}
        <G>
          <Circle cx="52" cy="32" r="12" fill="url(#parentSkin)" />
          {/* Hair */}
          <Path d="M42 30 C42 20 62 20 62 30 C58 26 53 25 48 27 Z" fill="#78350F" />
          {/* Eyes & Smile */}
          <Circle cx="48" cy="31" r="1.5" fill="#1F2937" />
          <Circle cx="56" cy="31" r="1.5" fill="#1F2937" />
          <Path d="M50 37 Q52 39 54 37" stroke="#DC2626" strokeWidth="1" strokeLinecap="round" fill="none" />
          {/* Red/Coral Top */}
          <Path d="M40 68 Q43 47 53 47 Q63 47 65 68 Z" fill="#F87171" />
        </G>

        {/* Sparkle yellow star */}
        <Path d="M41 14 L42.5 17 L45.5 17.5 L43 19.5 L44 22.5 L41 20.5 L38 22.5 L39 19.5 L36.5 17.5 L39.5 17 Z" fill="#FBBF24" />
      </Svg>
    </View>
  );
};

export const TeacherAvatar: React.FC<{ size?: number }> = ({ size = 64 }) => {
  return (
    <View style={styles.center}>
      <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <Defs>
          <LinearGradient id="teacherSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FED7AA" />
            <Stop offset="100%" stopColor="#FDBA74" />
          </LinearGradient>
          <LinearGradient id="teacherShirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FB7185" />
            <Stop offset="100%" stopColor="#E11D48" />
          </LinearGradient>
        </Defs>

        {/* Head */}
        <Circle cx="40" cy="28" r="15" fill="url(#teacherSkin)" />

        {/* Hair */}
        <Path d="M26 26 C26 15 54 15 54 26 C50 20 44 19 36 22 Z" fill="#991B1B" />

        {/* Glasses */}
        <Circle cx="35" cy="27" r="4.5" stroke="#991B1B" strokeWidth="1.5" fill="none" />
        <Circle cx="45" cy="27" r="4.5" stroke="#991B1B" strokeWidth="1.5" fill="none" />
        <Path d="M39.5 27 L40.5 27" stroke="#991B1B" strokeWidth="1.5" />
        <Circle cx="35" cy="27" r="1.5" fill="#1F2937" />
        <Circle cx="45" cy="27" r="1.5" fill="#1F2937" />
        <Path d="M38 33 Q40 35 42 33" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Red Shirt */}
        <Path d="M22 68 Q24 45 40 45 Q56 45 58 68 Z" fill="url(#teacherShirt)" />

        {/* Blue Textbook in Arm */}
        <Rect x="44" y="48" width="16" height="20" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
        <Rect x="47" y="52" width="10" height="2" fill="#FFFFFF" opacity={0.9} />

        {/* Pen in Hand */}
        <Path d="M26 50 L28 42 L31 43 L29 51 Z" fill="#60A5FA" />
        <Path d="M28 42 L29.5 39 L31 43 Z" fill="#1E293B" />
      </Svg>
    </View>
  );
};

export const AddCategoryIcon: React.FC<{ size?: number }> = ({ size = 64 }) => {
  return (
    <View style={styles.center}>
      <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <Path
          d="M40 24 V56 M24 40 H56"
          stroke="#1F2937"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
