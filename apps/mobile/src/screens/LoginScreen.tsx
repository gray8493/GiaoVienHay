import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { authService } from '../services/auth.service';

interface LoginScreenProps {
  onLoginSuccess?: (user?: any) => void;
  onNavigateToSignup?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignup,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await authService.login({ phone, password });
      onLoginSuccess?.(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Top 3D Educational Illustration */}
            <View style={styles.illustrationWrap}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDswx2hTFvGT6E6moN712p1cjuMNGjkZupKqFaiZhIBAOZp9MurYXqaPWYcmROU-OthsKVymKYE-4h9y3gH34GOuvOR-hlWnGmoPgidTscLp_gqH-aFhifDZnk-dgSAUAiMdSfpwtsJL0ENB3hB2iasnTI8ZJl00GhKvL8-vb6jvcWP7iACRHco8XcA7NRrtGjex4KsAxjERsOB3dqL7jO9XIIg5hMYxCmLI-EXFaVDMwPhAV_TzRCnpQ',
                }}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>

            {/* Brand Row */}
            <View style={styles.brandRow}>
              <View style={styles.brandIconCircle}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="#FFFFFF">
                  <Path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
                </Svg>
              </View>
              <Text style={styles.brandTitle}>GiaoVienHay</Text>
            </View>

            {/* Welcome Title */}
            <Text style={styles.welcomeTitle}>Chào Mừng Trở Lại</Text>

            {/* Error Message if any */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input Form */}
            <View style={styles.formContainer}>
              {/* Phone Input */}
              <View style={styles.inputWrapper}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="#6B6880" style={styles.inputIcon}>
                  <Path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" />
                </Svg>
                <TextInput
                  style={styles.textInput}
                  placeholder="Số điện thoại"
                  placeholderTextColor="#6B6880"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="#6B6880" style={styles.inputIcon}>
                  <Path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z" />
                </Svg>
                <TextInput
                  style={styles.textInput}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#6B6880"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#6B6880">
                    {showPassword ? (
                      <Path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" />
                    ) : (
                      <Path d="M12 7C14.76 7 17 9.24 17 12C17 12.64 16.88 13.26 16.65 13.82L19.56 16.73C21.07 15.42 22.27 13.81 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.17L10.17 7.34C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8Z" />
                    )}
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>

            {/* Exactly ONE Solid Orange Button */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.88}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Đăng Nhập</Text>
              )}
            </TouchableOpacity>

            {/* Bottom Registration Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Chưa có tài khoản? </Text>
              <TouchableOpacity
                onPress={onNavigateToSignup}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  illustrationWrap: {
    width: 220,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1B2E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B2E',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1E1B2E',
  },
  eyeButton: {
    padding: 6,
    marginLeft: 6,
  },
  loginButton: {
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
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  registerPrompt: {
    fontSize: 14,
    color: '#1E1B2E',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B2E',
    textDecorationLine: 'underline',
  },
});
