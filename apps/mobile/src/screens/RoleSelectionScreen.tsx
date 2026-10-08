import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  StudentAvatar,
  ParentsAvatar,
  TeacherAvatar,
  AddCategoryIcon,
} from '../components/RoleAvatars';

interface RoleSelectionScreenProps {
  onBack?: () => void;
  onContinue?: (role: string) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onBack,
  onContinue,
}) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'parents' | 'teacher' | 'other'>('student');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FF" />
      <View style={styles.container}>
        {/* Header with Circular Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={onBack}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="#1E293B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Title & Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            Tell Us About Yourself
          </Text>
          <Text style={styles.subtitle}>
            Tell us a little about yourself so we can get to know you better.
          </Text>
        </View>

        {/* 2x2 Bento Selection Grid */}
        <View style={styles.gridContainer}>
          {/* Card 1: Student */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.roleCard,
              selectedRole === 'student' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('student')}
          >
            <View style={styles.avatarWrap}>
              <StudentAvatar size={66} />
            </View>
            <Text style={styles.roleTitle} numberOfLines={1}>
              Student
            </Text>
            <Text style={styles.roleDesc}>
              Are you planning to use our platform for learning?
            </Text>
          </TouchableOpacity>

          {/* Card 2: Parents */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.roleCard,
              selectedRole === 'parents' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('parents')}
          >
            <View style={styles.avatarWrap}>
              <ParentsAvatar size={66} />
            </View>
            <Text style={styles.roleTitle} numberOfLines={1}>
              Parents
            </Text>
            <Text style={styles.roleDesc}>
              Learning through engaging meaningful experiences.
            </Text>
          </TouchableOpacity>

          {/* Card 3: Teacher */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.roleCard,
              selectedRole === 'teacher' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('teacher')}
          >
            <View style={styles.avatarWrap}>
              <TeacherAvatar size={66} />
            </View>
            <Text style={styles.roleTitle} numberOfLines={1}>
              Teacher
            </Text>
            <Text style={styles.roleDesc}>
              Are you planning to use our platform for teaching?
            </Text>
          </TouchableOpacity>

          {/* Card 4: Add Category */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.roleCard,
              styles.roleCardDashed,
              selectedRole === 'other' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('other')}
          >
            <View style={[styles.avatarWrap, styles.plusWrap]}>
              <AddCategoryIcon size={46} />
            </View>
            <Text style={styles.roleTitle} numberOfLines={1}>
              Add Category
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom CTA Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.88}
            onPress={() => onContinue && onContinue(selectedRole)}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 8,
  },
  header: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  roleCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 185,
    justifyContent: 'flex-start',
  },
  roleCardActive: {
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  roleCardDashed: {
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  avatarWrap: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  plusWrap: {
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B2E',
    textAlign: 'center',
    marginBottom: 6,
  },
  roleDesc: {
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  bottomSection: {
    width: '100%',
    paddingTop: 12,
  },
  continueBtn: {
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
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
