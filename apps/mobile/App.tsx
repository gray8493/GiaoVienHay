import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RoleSelectionScreen } from './src/screens/RoleSelectionScreen';
import { TeacherHomeScreen } from './src/screens/TeacherHomeScreen';

type ScreenKey = 'teacher_home' | 'onboarding' | 'login' | 'role' | 'showcase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('teacher_home');
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1200;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Top Floating Control Bar to switch between screens or view showcase */}
      <SafeAreaView style={styles.controlHeaderArea}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'teacher_home' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('teacher_home')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'teacher_home' && styles.tabTextActive,
              ]}
            >
              ★ TEA-01 (Home)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'onboarding' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('onboarding')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'onboarding' && styles.tabTextActive,
              ]}
            >
              Onboarding
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'login' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('login')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'login' && styles.tabTextActive,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'role' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('role')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'role' && styles.tabTextActive,
              ]}
            >
              Role
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'showcase' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('showcase')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'showcase' && styles.tabTextActive,
              ]}
            >
              Showcase All
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Screen Viewport */}
      {currentScreen === 'showcase' ? (
        <ScrollView
          horizontal
          contentContainerStyle={styles.showcaseContainer}
          showsHorizontalScrollIndicator={false}
        >
          {/* Screen 0: Teacher Home (TEA-01) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <TeacherHomeScreen
              onEnterClassroom={() => alert('Chuyển tới TEA-02: Điểm danh')}
              onOpenAIQuiz={() => alert('Chuyển tới TEA-04: Tạo bài tập AI')}
              onOpenWheel={() => alert('Chuyển tới TEA-05: Mini-Game Vòng quay')}
            />
          </View>

          {/* Screen 1 Frame: Onboarding */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <OnboardingScreen onNavigateToLogin={() => setCurrentScreen('login')} />
          </View>

          {/* Screen 2 Frame: Login */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <LoginScreen
              onLoginSuccess={() => setCurrentScreen('teacher_home')}
              onNavigateToSignup={() => setCurrentScreen('role')}
            />
          </View>

          {/* Screen 3 Frame: Role Selection */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <RoleSelectionScreen
              onBack={() => setCurrentScreen('login')}
              onContinue={() => setCurrentScreen('teacher_home')}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.singleScreenWrap}>
          <View style={[styles.phoneFrame, !isLargeScreen && styles.phoneFrameMobile]}>
            {currentScreen === 'teacher_home' && (
              <TeacherHomeScreen
                onEnterClassroom={() => alert('Chuyển tới TEA-02: Điểm danh')}
                onOpenAIQuiz={() => alert('Chuyển tới TEA-04: Tạo bài tập AI')}
                onOpenWheel={() => alert('Chuyển tới TEA-05: Mini-Game Vòng quay')}
              />
            )}
            {currentScreen === 'onboarding' && (
              <OnboardingScreen onNavigateToLogin={() => setCurrentScreen('login')} />
            )}
            {currentScreen === 'login' && (
              <LoginScreen
                onLoginSuccess={() => setCurrentScreen('teacher_home')}
                onNavigateToSignup={() => setCurrentScreen('role')}
              />
            )}
            {currentScreen === 'role' && (
              <RoleSelectionScreen
                onBack={() => setCurrentScreen('login')}
                onContinue={() => setCurrentScreen('teacher_home')}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EAE6FA', // Soft ambient pastel purple/cream canvas gradient backdrop
  },
  controlHeaderArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.12)',
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F0FC',
  },
  tabItemActive: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  singleScreenWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  showcaseContainer: {
    paddingHorizontal: 30,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 28,
  },
  phoneFrame: {
    width: 390,
    height: 844,
    backgroundColor: '#FAF8FF',
    borderRadius: 44,
    overflow: 'hidden',
    shadowColor: '#3B1875',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  phoneFrameMobile: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  phoneNotch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -45,
    width: 90,
    height: 20,
    backgroundColor: '#1E1B2E',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 999,
  },
});
