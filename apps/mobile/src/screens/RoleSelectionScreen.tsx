import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

interface RoleSelectionScreenProps {
  onBack?: () => void;
  onContinue?: (role: 'TEACHER' | 'PARENT') => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onBack,
  onContinue,
}) => {
  const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'PARENT'>('TEACHER');

  return (
    <View style={styles.root}>
      {/* Background Peach Linear Gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative SVG Overlay */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          fill="none"
          style={styles.svgOverlay}
        >
          <Path
            d="M-20 180 C80 140, 160 230, 240 190 C320 150, 360 210, 420 180"
            stroke="#F58F4C"
            strokeWidth={1.5}
            strokeDasharray="4 6"
            opacity={0.3}
          />
          <Path
            d="M-30 460 C90 430, 170 510, 270 470 C350 430, 390 490, 430 460"
            stroke="#F58F4C"
            strokeWidth={1.5}
            strokeDasharray="4 6"
            opacity={0.25}
          />
          <Circle cx="330" cy="270" r={2.5} fill="#F58F4C" opacity={0.35} />
          <Circle cx="50" cy="460" r={3} fill="#F58F4C" opacity={0.3} />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Navigation Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={onBack}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="#1C192C">
                <Path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bạn Là Ai?</Text>
          </View>

          {/* Interactive Role Selection Stack */}
          <View style={styles.roleGroup}>
            {/* Card 1: Giáo Viên */}
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'TEACHER' ? styles.roleCardSelected : styles.roleCardUnselected,
              ]}
              activeOpacity={0.9}
              onPress={() => setSelectedRole('TEACHER')}
            >
              {/* Checked Indicator Pill */}
              {selectedRole === 'TEACHER' && (
                <View style={styles.checkIndicator}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FFFFFF">
                    <Path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
                  </Svg>
                </View>
              )}

              {/* Glossy 3D Asset */}
              <View style={styles.avatarWrap}>
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKnD6PaCKtqHO-i7zjDhOiS3TihnCXa1HvFSlMAFuuCirfv-yjHAyMNW-A-YSnGLQyih76fiG9iyfKApcYLEvqYZPF-58J-PelTeWZcNAQNB2SFGF6mYicHode8vkTcW01q4CApUH5zonOXUdGt5F_zGNZ2gTEV9Jj2_yr4yTzaONQXz8HhPLc1wVS24VVqKUNQC0Jpf175j-bTFcAq95Wjs9OSPzyHxbHvDQ5l9UtJWUN5ktTVkx4Og',
                  }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>

              {/* Role Label */}
              <Text style={styles.roleLabel}>Giáo Viên</Text>
            </TouchableOpacity>

            {/* Card 2: Phụ Huynh */}
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'PARENT' ? styles.roleCardSelected : styles.roleCardUnselected,
              ]}
              activeOpacity={0.9}
              onPress={() => setSelectedRole('PARENT')}
            >
              {/* Checked Indicator Pill */}
              {selectedRole === 'PARENT' && (
                <View style={styles.checkIndicator}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FFFFFF">
                    <Path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
                  </Svg>
                </View>
              )}

              {/* Glossy 3D Asset */}
              <View style={styles.avatarWrap}>
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8ITQ7bNz8ShhC8aAZImEkUocaZ7OOxwcZ0fa8Bo1071oSd_QvMwF9fAn0iVBgPS-o9eE3EFbmVBM0GWADFmAR9V-ZMmqypmXlcu7iHE4ec98Yj9cL7D5MK5Nvpmm0jk0W982aAM4ax_LJ9Tl4iC1kHf6s4GLRjWOVSsmiWycZyIW7SRCvi1tJE_7NGqt86dP30vWHQDkuktoi0B_Hh2RncKR_4ykEM-A2oCIFdHzahHhBKyrSUw_GoQ',
                  }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>

              {/* Role Label */}
              <Text style={styles.roleLabel}>Phụ Huynh</Text>
            </TouchableOpacity>
          </View>

          {/* Fixed Bottom Action */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.continueButton}
              activeOpacity={0.88}
              onPress={() => onContinue?.(selectedRole)}
            >
              <Text style={styles.continueButtonText}>Tiếp Tục</Text>
            </TouchableOpacity>

            {/* Home Indicator */}
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
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C192C',
  },
  roleGroup: {
    gap: 16,
  },
  roleCard: {
    height: 150,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  roleCardSelected: {
    backgroundColor: 'rgba(255, 219, 200, 0.65)',
    borderWidth: 2,
    borderColor: '#F58F4C',
  },
  roleCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  checkIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  roleLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C192C',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 999,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: 'rgba(28, 25, 44, 0.3)',
    borderRadius: 999,
    marginTop: 20,
  },
});
