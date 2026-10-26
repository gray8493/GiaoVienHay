import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { IllustrationOnboarding } from '../components/IllustrationOnboarding';

interface OnboardingScreenProps {
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  return (
    <View style={styles.root}>
      {/* Background Peach Linear Gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Swirls & Floating Stars */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          fill="none"
          style={styles.svgOverlay}
        >
          {/* Swirl Dashed Lines */}
          <Path
            d="M-20 180 C80 140, 160 230, 240 190 C320 150, 360 210, 420 180"
            stroke="#F58F4C"
            strokeWidth={1.5}
            strokeDasharray="4 6"
            opacity={0.35}
          />
          <Path
            d="M-30 460 C90 430, 170 510, 270 470 C350 430, 390 490, 430 460"
            stroke="#F58F4C"
            strokeWidth={1.5}
            strokeDasharray="4 6"
            opacity={0.3}
          />

          {/* Floating Stars */}
          <Path
            d="M340 100 L342 106 L348 108 L342 110 L340 116 L338 110 L332 108 L338 106 Z"
            fill="#F58F4C"
            opacity={0.5}
          />
          <Path
            d="M48 310 L49.5 314.5 L54 316 L49.5 317.5 L48 322 L46.5 317.5 L42 316 L46.5 314.5 Z"
            fill="#F58F4C"
            opacity={0.45}
          />
          <Path
            d="M352 420 L354 425 L359 427 L354 429 L352 434 L350 429 L345 427 L350 425 Z"
            fill="#F58F4C"
            opacity={0.5}
          />
          <Path
            d="M60 620 L61.5 624.5 L66 626 L61.5 627.5 L60 632 L58.5 627.5 L54 626 L58.5 624.5 Z"
            fill="#F58F4C"
            opacity={0.4}
          />

          {/* Floating Circles */}
          <Circle cx={330} cy={270} r={2.5} fill="#F58F4C" opacity={0.35} />
          <Circle cx={50} cy={460} r={3} fill="#F58F4C" opacity={0.3} />
          <Circle cx={340} cy={560} r={2} fill="#F58F4C" opacity={0.4} />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* 1. Brand Row: Top-Left (round dark mark + text) */}
          <View style={styles.brandRow}>
            <View style={styles.brandIconCircle}>
              {/* Auto Stories (Open Book) Icon */}
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="#FFFFFF">
                <Path d="M19 1H5C3.9 1 3 1.9 3 3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V3C21 1.9 20.1 1 19 1ZM19 19H5V3H11V11L13.5 9.5L16 11V3H19V19Z" />
              </Svg>
            </View>
            <Text style={styles.brandTitle}>GiaoVienHay</Text>
          </View>

          {/* 2. Hero 3D Illustration: Centered ~300px (100% Vector SVG, No fake background) */}
          <View style={styles.heroSection}>
            <IllustrationOnboarding width={Math.min(SCREEN_WIDTH - 48, 320)} height={270} />
          </View>

          {/* 3. Bottom Interactive Section */}
          <View style={styles.bottomSection}>
            {/* Headline */}
            <Text style={styles.headline}>Lớp Học Trong Tầm Tay</Text>

            {/* Action Button: Full-width Solid Orange Pill */}
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.88}
              onPress={onNavigateToLogin}
            >
              <Text style={styles.primaryButtonText}>Bắt Đầu</Text>
            </TouchableOpacity>

            {/* Bottom Row: Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Chưa có tài khoản? </Text>
              <TouchableOpacity
                onPress={onNavigateToRegister || onNavigateToLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>

            {/* Home Indicator Bar */}
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFCFA3',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    zIndex: 10,
  },
  brandIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1B2E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B2E',
    letterSpacing: -0.4,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
    paddingVertical: 8,
    zIndex: 10,
  },
  imageCard: {
    width: Math.min(SCREEN_WIDTH - 60, 300),
    height: Math.min(SCREEN_WIDTH - 60, 300),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropBlurEffect: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 8,
    zIndex: 10,
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#1E1B2E',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 28,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#F58F4C',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerPrompt: {
    fontSize: 14,
    color: '#6B6880',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B2E',
    textDecorationLine: 'underline',
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: 'rgba(30, 27, 46, 0.2)',
    borderRadius: 999,
    marginTop: 24,
  },
});
