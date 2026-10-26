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
import { Bell3D } from '../components/Bell3D';

interface RegisterScreenProps {
  initialRole?: 'TEACHER' | 'PARENT';
  onBack?: () => void;
  onRegisterSuccess?: (user?: any) => void;
  onNavigateToLogin?: () => void;
}

const AVAILABLE_SUBJECTS = [
  { code: 'MATH', label: 'Toán Học' },
  { code: 'LITERATURE', label: 'Tiếng Việt / Ngữ Văn' },
  { code: 'ENGLISH', label: 'Tiếng Anh' },
  { code: 'SCIENCE', label: 'Khoa Học' },
  { code: 'INFORMATICS', label: 'Tin Học' },
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  initialRole = 'TEACHER',
  onBack,
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [role, setRole] = useState<'TEACHER' | 'PARENT'>(initialRole);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['MATH']);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleSubject = (code: string) => {
    if (selectedSubjects.includes(code)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== code));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, code]);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !phone || !password || !confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (!/^(03|05|07|08|09)\d{8}$/.test(phone.trim())) {
      setErrorMessage('Số điện thoại phải gồm đúng 10 chữ số, bắt đầu bằng đầu số hợp lệ: 03, 05, 07, 08, 09');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại không khớp');
      return;
    }

    // Chuẩn mật khẩu khớp yêu cầu Backend: 8+ ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setErrorMessage(
        'Mật khẩu phải từ 8 ký tự trở lên, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@ $ ! % * ? &)\nVí dụ: MatKhau123@',
      );
      return;
    }

    if (role === 'TEACHER' && !schoolName.trim()) {
      setErrorMessage('Giáo viên bắt buộc phải nhập Tên trường công tác');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const data = await authService.register({
        full_name: fullName,
        phone,
        password,
        role: role === 'TEACHER' ? 'TEACHER_HOMEROOM' : 'PARENT',
        school_name: role === 'TEACHER' ? schoolName : undefined,
        teaching_subjects: role === 'TEACHER' ? selectedSubjects : undefined,
      });

      onRegisterSuccess?.(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký không thành công');
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

      {/* Decorative SVG Background */}
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
            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  style={styles.backButton}
                  activeOpacity={0.8}
                  onPress={onBack}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#1C192C">
                    <Path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" />
                  </Svg>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo Tài Khoản</Text>
              </View>

              <View style={styles.headerImageWrap}>
                <Bell3D size={52} tiltAngle={-6} animated={true} />
              </View>
            </View>

            {/* Selected Role Pill Badge */}
            <View style={styles.roleBadgeRow}>
              <View style={styles.roleBadge}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="#984704">
                  <Path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
                </Svg>
                <Text style={styles.roleBadgeText}>
                  {role === 'TEACHER' ? 'Giáo Viên' : 'Phụ Huynh'}
                </Text>
              </View>
            </View>

            {/* Error Message if any */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* One Large White Card with Stacked Inputs */}
            <View style={styles.cardContainer}>
              {/* Field 1: Họ và tên */}
              <View style={styles.fieldRow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="#887367" style={styles.fieldIcon}>
                  <Path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                </Svg>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Họ và tên"
                  placeholderTextColor="#887367"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Field 2: Số điện thoại */}
              <View style={styles.fieldRow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="#887367" style={styles.fieldIcon}>
                  <Path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" />
                </Svg>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Số điện thoại"
                  placeholderTextColor="#887367"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Field 3: Mật khẩu */}
              <View style={styles.fieldRow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="#887367" style={styles.fieldIcon}>
                  <Path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z" />
                </Svg>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#887367"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#887367">
                    <Path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Field 4: Nhập lại mật khẩu */}
              <View style={styles.fieldRow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="#887367" style={styles.fieldIcon}>
                  <Path d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.8L18.76 16.26C19.54 15.03 20 13.57 20 12C20 7.58 16.42 4 12 4ZM12 18C8.69 18 6 15.31 6 12C6 10.99 6.25 10.03 6.7 9.2L5.24 7.74C4.46 8.97 4 10.43 4 12C4 16.42 7.58 20 12 20V23L16 19L12 15V18Z" />
                </Svg>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#887367"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#887367">
                    <Path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Dành cho Giáo viên: Trường học & Môn dạy (Theo đúng Backend) */}
              {role === 'TEACHER' && (
                <>
                  {/* Field 5: Tên trường công tác */}
                  <View style={styles.fieldRow}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="#887367" style={styles.fieldIcon}>
                      <Path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z" />
                    </Svg>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="Tên trường công tác (Bắt buộc)"
                      placeholderTextColor="#887367"
                      value={schoolName}
                      onChangeText={setSchoolName}
                    />
                  </View>

                  {/* Field 6: Môn học phụ trách */}
                  <View style={styles.subjectSection}>
                    <Text style={styles.subjectLabel}>Chọn môn giảng dạy:</Text>
                    <View style={styles.subjectChipWrap}>
                      {AVAILABLE_SUBJECTS.map((sub) => {
                        const isSelected = selectedSubjects.includes(sub.code);
                        return (
                          <TouchableOpacity
                            key={sub.code}
                            style={[
                              styles.subjectChip,
                              isSelected && styles.subjectChipActive,
                            ]}
                            onPress={() => toggleSubject(sub.code)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.subjectChipText,
                                isSelected && styles.subjectChipTextActive,
                              ]}
                            >
                              {sub.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.88}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Đăng Ký</Text>
              )}
            </TouchableOpacity>

            {/* Bottom Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Đã có tài khoản? </Text>
              <TouchableOpacity
                onPress={onNavigateToLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Đăng nhập</Text>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  headerImageWrap: {
    width: 75,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header3DAsset: {
    width: '100%',
    height: '100%',
  },
  roleBadgeRow: {
    marginBottom: 16,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFDBC8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C192C',
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
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#F7F1FF',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1C192C',
  },
  eyeButton: {
    padding: 6,
  },
  subjectSection: {
    paddingTop: 4,
  },
  subjectLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C192C',
    marginBottom: 8,
  },
  subjectChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  subjectChipActive: {
    backgroundColor: '#F58F4C',
    borderColor: '#F58F4C',
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B21A8',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
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
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginPrompt: {
    fontSize: 14,
    color: '#1C192C',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C192C',
    textDecorationLine: 'underline',
  },
});
