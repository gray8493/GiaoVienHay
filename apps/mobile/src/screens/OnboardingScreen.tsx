import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ScholaroLogo } from '../components/ScholaroLogo';
import { IllustrationOnboarding } from '../components/IllustrationOnboarding';

interface OnboardingScreenProps {
  onNavigateToLogin?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onNavigateToLogin,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FF" />
      <View style={styles.container}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <ScholaroLogo size={28} color="#7C3AED" />
            <Text style={styles.brandTitle}>Scholaro</Text>
          </View>

          {/* Language Selector Pill */}
          <TouchableOpacity activeOpacity={0.8} style={styles.langPill}>
            <Text style={styles.langIcon}>文A</Text>
            <Text style={styles.langText}>English</Text>
          </TouchableOpacity>
        </View>

        {/* 3D Stylized Illustration Area */}
        <View style={styles.illustrationWrap}>
          <IllustrationOnboarding width={310} height={260} />
        </View>

        {/* Text Content */}
        <View style={styles.contentSection}>
          <Text style={styles.title} numberOfLines={1}>
            Stay Connected, Anytime
          </Text>
          <Text style={styles.subtitle}>
            Instant announcements, chat with teachers, and stay updated on school events wherever you are.
          </Text>

          {/* Carousel Pagination Dots */}
          <View style={styles.paginationRow}>
            <View style={styles.dotInactive} />
            <View style={styles.dotActive} />
            <View style={styles.dotInactive} />
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.88}
            onPress={onNavigateToLogin}
          >
            <Text style={styles.ctaButtonText}>Explore Now</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.signupText}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  langIcon: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  langText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  contentSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B2E',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#7C3AED',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  signupText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B2E',
  },
});
