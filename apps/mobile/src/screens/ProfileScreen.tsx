import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Rect,
  Circle,
  Line,
  Polygon,
  Polyline,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { userService, UserProfile } from '../services/user.service';
import { authService } from '../services/auth.service';

interface ProfileScreenProps {
  onBackToHome?: () => void;
  onTabChange?: (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => void;
  onLogout?: () => void;
  onNavigateToMyClasses?: () => void;
  onNavigateToRegister?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBackToHome,
  onTabChange,
  onLogout,
  onNavigateToMyClasses,
  onNavigateToRegister,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const cached = authService.getUser();
    return {
      id: cached?.id || '',
      phone: cached?.phone || '',
      full_name: cached?.full_name || 'Giáo viên',
      email: cached?.email || '',
      role: cached?.role || 'TEACHER_HOMEROOM',
      homeroom_class: '',
      school_name: cached?.school_name || 'Chưa cập nhật',
      teaching_subjects: cached?.teaching_subjects || [],
    };
  });

  // Modal Đổi mật khẩu
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Modal Chỉnh sửa hồ sơ
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState(profile.full_name);
  const [editEmail, setEditEmail] = useState(profile.email || '');
  const [editSchool, setEditSchool] = useState(profile.school_name || '');
  // Môn dạy làm việc bằng MÃ CHUẨN trùng backend (MATH/LIT/ENG/CS/SCIENCE/...) — hiển thị bằng nhãn VN
  const ALL_SUBJECTS: { code: string; label: string }[] = [
    { code: 'MATH', label: 'Toán' },
    { code: 'LIT', label: 'Ngữ Văn' },
    { code: 'ENG', label: 'Tiếng Anh' },
    { code: 'CS', label: 'Tin Học' },
    { code: 'SCIENCE', label: 'Khoa học' },
    { code: 'HISTORY', label: 'Lịch sử' },
    { code: 'GEOGRAPHY', label: 'Địa lí' },
    { code: 'ETHICS', label: 'Đạo đức' },
  ];
  const subjectLabel = (code: string) =>
    ALL_SUBJECTS.find((s) => s.code === code)?.label || code;

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setEditName(data.full_name);
      setEditEmail(data.email || '');
      setEditSchool(data.school_name || '');
      if (data.teaching_subjects && data.teaching_subjects.length > 0) {
        setSelectedSubjects(data.teaching_subjects); // Mã môn chuẩn từ backend
      } else {
        setSelectedSubjects([]);
      }
    } catch (e) {
      // Giữ mock fallback
    }
  };

  const handleToggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await userService.updateProfile({
        full_name: editName,
        email: editEmail,
        school_name: editSchool,
        teaching_subjects: selectedSubjects,
      });
      setProfile(updated);
      setEditProfileModalVisible(false);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setOldPasswordError(false);
    if (!oldPassword || !newPassword) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin mật khẩu');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp');
      return;
    }
    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        current_password: oldPassword,
        new_password: newPassword,
      });
      setChangePasswordModalVisible(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOldPasswordError(false);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('không chính xác') || msg.includes('AUTH_INVALID_CREDENTIALS') || msg.toLowerCase().includes('password')) {
        setOldPasswordError(true);
      } else {
        Alert.alert('Lỗi', msg || 'Không thể đổi mật khẩu');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutPress = async () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?') : true;
      if (confirmed) {
        await authService.logout();
        await userService.logout();
        onLogout?.();
      }
      return;
    }

    Alert.alert(
      'Đăng Xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng Xuất',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            await userService.logout();
            onLogout?.();
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.root}>
      {/* Background continuous peach gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.4, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient subtle glow orbs */}
      <View style={styles.ambientGlowTopRight} pointerEvents="none" />
      <View style={styles.ambientGlowBottomLeft} pointerEvents="none" />

      <SafeAreaView style={styles.safeContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.screenTitle}>Cá Nhân</Text>
            </View>

            {/* 3D Soft Glossy Notebook Illustration with Pencil & Sparkles */}
            <View style={styles.headerIllustrationWrap}>
              <Svg width={90} height={80} viewBox="0 0 100 90" fill="none">
                <Defs>
                  <SvgLinearGradient id="bookGrad" x1="22" y1="18" x2="72" y2="80" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor="#3B82F6" />
                    <Stop offset="1" stopColor="#2563EB" />
                  </SvgLinearGradient>
                </Defs>

                {/* Ambient Sparkles */}
                <Path d="M82 12L83.5 17L88.5 18.5L83.5 20L82 25L80.5 20L75.5 18.5L80.5 17L82 12Z" fill="#FDBA74" />
                <Path d="M12 40L13 43L16 44L13 45L12 48L11 45L8 44L11 43L12 40Z" fill="#FDBA74" opacity={0.8} />

                {/* Back Book Cover */}
                <Rect
                  x={22}
                  y={16}
                  width={54}
                  height={66}
                  rx={8}
                  fill="#4F46E5"
                  opacity={0.9}
                  transform="rotate(-6 49 49)"
                />

                {/* Book Spine Fold */}
                <Rect
                  x={18}
                  y={18}
                  width={52}
                  height={64}
                  rx={8}
                  fill="#6366F1"
                  transform="rotate(-3 44 50)"
                />

                {/* Front Cover Gradient */}
                <Rect
                  x={22}
                  y={18}
                  width={50}
                  height={62}
                  rx={7}
                  fill="url(#bookGrad)"
                />

                {/* Inner Pages Rim */}
                <Path
                  d="M68 20L70 20C72.2 20 74 21.8 74 24V74C74 76.2 72.2 78 70 78L68 78V20Z"
                  fill="#F8FAFC"
                  opacity={0.9}
                />

                {/* Bookmark Ribbon */}
                <Path d="M38 18V42L44 38L50 42V18H38Z" fill="#F97316" />

                {/* Pencil across book */}
                <G transform="rotate(32 60 52)">
                  <Rect x={52} y={22} width={10} height={42} rx={3} fill="#F59E0B" />
                  <Rect x={52} y={22} width={10} height={7} rx={2} fill="#E2E8F0" />
                  <Path d="M52 64L57 74L62 64H52Z" fill="#FDE68A" />
                  <Polygon points="56,72 57,74 58,72" fill="#334155" />
                </G>

                {/* Book Badge */}
                <Circle cx={48} cy={56} r={9} fill="#FFFFFF" fillOpacity={0.3} />
                <Path
                  d="M45 56L47.5 58.5L51.5 53.5"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>

          {/* Main Card Container */}
          <View style={styles.cardsStack}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              {/* Top Profile Row */}
              <View style={styles.topProfileRow}>
                <View style={styles.avatarIdentityWrap}>
                  {/* Avatar with Status Dot */}
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarInnerCircle}>
                      {/* Friendly Teacher Avatar SVG */}
                      <Svg width={48} height={48} viewBox="0 0 48 48" fill="none" style={styles.avatarSvg}>
                        <Circle cx={24} cy={18} r={9} fill="#4F46E5" />
                        {/* Glasses */}
                        <Circle cx={21} cy={18} r={3.5} stroke="#FDE047" strokeWidth={1.5} />
                        <Circle cx={27} cy={18} r={3.5} stroke="#FDE047" strokeWidth={1.5} />
                        <Path d="M24.5 18H23.5" stroke="#FDE047" strokeWidth={1.5} />
                        {/* Shoulders */}
                        <Path
                          d="M10 40C10 32.268 16.268 26 24 26C31.732 26 38 32.268 38 40"
                          fill="#6366F1"
                        />
                      </Svg>
                    </View>
                    {/* Green Active Dot */}
                    <View style={styles.activeDot} />
                  </View>

                  {/* Name and Homeroom Badge */}
                  <View style={styles.identityTextWrap}>
                    <Text style={styles.teacherNameText} numberOfLines={1}>
                      {profile.full_name}
                    </Text>
                    <View style={styles.homeroomBadge}>
                      <Text style={styles.homeroomBadgeText}>
                        {profile.homeroom_class ? `GVCN ${profile.homeroom_class}` : 'Giáo viên'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Edit Profile Button */}
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setEditProfileModalVisible(true)}
                  activeOpacity={0.8}
                  accessibilityLabel="Chỉnh sửa thông tin"
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth={2}>
                    <Path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" />
                    <Path
                      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Information Rows */}
              <View style={styles.infoRowsContainer}>
                {/* Phone */}
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2}>
                      <Path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text style={styles.infoRowText}>{profile.phone}</Text>
                </View>

                {/* Email: chỉ hiển thị khi người dùng có email thực tế */}
                {profile.email ? (
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2}>
                        <Rect x={2} y={4} width={20} height={16} rx={2} strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <Text style={styles.infoRowText} numberOfLines={1}>
                      {profile.email}
                    </Text>
                  </View>
                ) : null}

                {/* School: chỉ hiển thị khi có dữ liệu thực tế */}
                {profile.school_name ? (
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconBox, { backgroundColor: '#ECFDF5' }]}>
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2}>
                        <Path d="M3 21h18" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M9 7h1" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M9 11h1" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M9 15h1" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M14 7h1" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M14 11h1" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M14 15h1" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <Text style={styles.infoRowText}>{profile.school_name}</Text>
                  </View>
                ) : null}
              </View>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {/* Teaching Subjects */}
              <View style={styles.subjectsSection}>
                <Text style={styles.subjectsTitle}>Môn dạy</Text>
                <View style={styles.subjectChipsRow}>
                  {(profile.teaching_subjects || []).map((sub, index) => (
                    <View key={index} style={styles.subjectChip}>
                      <Text style={styles.subjectChipText}>{subjectLabel(sub)}</Text>
                    </View>
                  ))}
                  {(!profile.teaching_subjects || profile.teaching_subjects.length === 0) && (
                    <Text style={styles.subjectsEmptyText}>Chưa cập nhật môn dạy</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Settings Card: Lớp Của Tôi & Đổi Mật Khẩu */}
            <View style={styles.settingsCard}>
              {/* Row 1: Lớp Của Tôi */}
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => {
                  if (onNavigateToMyClasses) {
                    onNavigateToMyClasses();
                  } else {
                    onTabChange?.('schedule');
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingsLeftWrap}>
                  <View style={styles.settingsIconBox}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                      <Circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={styles.settingsTitle}>Lớp Của Tôi</Text>
                </View>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                  <Path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>

              <View style={styles.settingsDivider} />

              {/* Row 2: Đổi Mật Khẩu */}
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => setChangePasswordModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.settingsLeftWrap}>
                  <View style={styles.settingsIconBox}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={styles.settingsTitle}>Đổi mật khẩu</Text>
                </View>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                  <Path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Logout Action Button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogoutPress}
              activeOpacity={0.88}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2}>
                <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                <Polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
                <Line x1={21} y1={12} x2={9} y2={12} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.logoutBtnText}>Đăng Xuất</Text>
            </TouchableOpacity>


          </View>

          {/* Reserved Space for Bottom Dock */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating Dock Navigation */}
        <View style={styles.dockContainer}>
          <View style={styles.dockBar}>
            {/* Tab 1: Lịch dạy */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => onTabChange?.('schedule')}
              activeOpacity={0.8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <Line x1="16" y1="2" x2="16" y2="6" />
                <Line x1="8" y1="2" x2="8" y2="6" />
                <Line x1="3" y1="10" x2="21" y2="10" />
              </Svg>
              <Text style={styles.dockTabTextInactive}>Lịch dạy</Text>
            </TouchableOpacity>

            {/* Tab 2: Điểm danh */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => onTabChange?.('attendance')}
              activeOpacity={0.8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <Polyline points="22 4 12 14.01 9 11.01" />
              </Svg>
              <Text style={styles.dockTabTextInactive}>Điểm danh</Text>
            </TouchableOpacity>

            {/* Tab 3: Sổ điểm */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => onTabChange?.('gradebook')}
              activeOpacity={0.8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                <Path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <Path d="M6 6h10" />
                <Path d="M6 10h10" />
              </Svg>
              <Text style={styles.dockTabTextInactive}>Sổ điểm</Text>
            </TouchableOpacity>

            {/* Tab 4: Cá nhân (Active) */}
            <TouchableOpacity style={styles.dockTabItem} activeOpacity={0.9}>
              <View style={styles.dockActivePill}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
                  <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <Circle cx="12" cy="7" r="4" />
                </Svg>
              </View>
              <Text style={styles.dockTabTextActive}>Cá nhân</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal: Đổi mật khẩu TEA-10.2 & TEA-10.2b */}
        <Modal
          visible={changePasswordModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setChangePasswordModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => setChangePasswordModalVisible(false)}
            />
            <View style={styles.passwordSheetBox}>
              {/* Drag Handle */}
              <View style={styles.sheetDragHandle} />

              <Text style={styles.sheetTitle}>Đổi Mật Khẩu</Text>

              {/* 3 Input password */}
              <View style={styles.passwordInputsWrap}>
                {/* Input 1: Mật khẩu hiện tại (Kèm Error State TEA-10.2b) */}
                <View>
                  <View style={[styles.passwordInputContainer, oldPasswordError && styles.passwordInputContainerError]}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={oldPasswordError ? '#EF4444' : '#F58F4C'} strokeWidth={2}>
                      <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
                      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </Svg>
                    <TextInput
                      style={styles.sheetTextInput}
                      secureTextEntry={!showOldPassword}
                      placeholder="Mật khẩu hiện tại"
                      placeholderTextColor="#9D9AA8"
                      value={oldPassword}
                      onChangeText={txt => {
                        setOldPassword(txt);
                        if (oldPasswordError) setOldPasswordError(false);
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                        {showOldPassword ? (
                          <>
                            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <Circle cx="12" cy="12" r="3" />
                          </>
                        ) : (
                          <>
                            <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <Line x1="1" y1="1" x2="23" y2="23" />
                          </>
                        )}
                      </Svg>
                    </TouchableOpacity>
                  </View>
                  {oldPasswordError && (
                    <View style={styles.errorTextRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2.5}>
                        <Circle cx="12" cy="12" r="10" />
                        <Line x1="12" y1="8" x2="12" y2="12" />
                        <Line x1="12" y1="16" x2="12.01" y2="16" />
                      </Svg>
                      <Text style={styles.errorText}>Sai mật khẩu</Text>
                    </View>
                  )}
                </View>

                {/* Input 2: Mật khẩu mới */}
                <View style={styles.passwordInputContainer}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
                    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </Svg>
                  <TextInput
                    style={styles.sheetTextInput}
                    secureTextEntry={!showNewPassword}
                    placeholder="Mật khẩu mới"
                    placeholderTextColor="#9D9AA8"
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                      {showNewPassword ? (
                        <>
                          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <Circle cx="12" cy="12" r="3" />
                        </>
                      ) : (
                        <>
                          <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <Line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      )}
                    </Svg>
                  </TouchableOpacity>
                </View>

                {/* Input 3: Nhập lại */}
                <View style={styles.passwordInputContainer}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
                    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </Svg>
                  <TextInput
                    style={styles.sheetTextInput}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Nhập lại"
                    placeholderTextColor="#9D9AA8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                      {showConfirmPassword ? (
                        <>
                          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <Circle cx="12" cy="12" r="3" />
                        </>
                      ) : (
                        <>
                          <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <Line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      )}
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Actions Buttons: Grid 2 buttons */}
              <View style={styles.sheetButtonsRow}>
                <TouchableOpacity
                  style={styles.sheetCancelBtn}
                  onPress={() => {
                    setChangePasswordModalVisible(false);
                    setOldPasswordError(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sheetCancelBtnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetPrimaryBtn}
                  onPress={handleChangePassword}
                  disabled={isChangingPassword}
                  activeOpacity={0.88}
                >
                  <Text style={styles.sheetPrimaryBtnText}>
                    {isChangingPassword ? 'Đang lưu...' : 'Cập Nhật'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* iOS Home Indicator */}
              <View style={styles.sheetHomeIndicatorWrap}>
                <View style={styles.sheetHomeIndicator} />
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Chỉnh sửa thông tin cá nhân TEA-10.1 */}
        <Modal
          visible={editProfileModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditProfileModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => setEditProfileModalVisible(false)}
            />
            <View style={styles.editProfileSheetBox}>
              {/* Drag Handle */}
              <View style={styles.sheetDragHandle} />

              <Text style={styles.sheetTitle}>Sửa Hồ Sơ</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.editProfileScroll}>
                {/* 3 White Inputs Stacked */}
                <View style={styles.editInputsStack}>
                  <TextInput
                    style={styles.editTextInput}
                    placeholder="Họ và tên"
                    placeholderTextColor="#9D9AA8"
                    value={editName}
                    onChangeText={setEditName}
                  />
                  <TextInput
                    style={styles.editTextInput}
                    placeholder="Email"
                    placeholderTextColor="#9D9AA8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={editEmail}
                    onChangeText={setEditEmail}
                  />
                  <TextInput
                    style={styles.editTextInput}
                    placeholder="Trường giảng dạy"
                    placeholderTextColor="#9D9AA8"
                    value={editSchool}
                    onChangeText={setEditSchool}
                  />
                </View>

                {/* Môn dạy section */}
                <View style={styles.editSubjectsSection}>
                  <Text style={styles.editSubjectsSectionTitle}>Môn dạy</Text>
                  <View style={styles.subjectChipsWrap}>
                    {ALL_SUBJECTS.map((sub, idx) => {
                      const isSelected = selectedSubjects.includes(sub.code);
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.editSubjectChip, isSelected && styles.editSubjectChipSelected]}
                          onPress={() => handleToggleSubject(sub.code)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.editSubjectChipText, isSelected && styles.editSubjectChipTextSelected]}>
                            {sub.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Fixed Action Buttons */}
              <View style={styles.sheetButtonsRow}>
                <TouchableOpacity
                  style={styles.sheetCancelBtn}
                  onPress={() => setEditProfileModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sheetCancelBtnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetPrimaryBtn}
                  onPress={handleSaveProfile}
                  disabled={isSavingProfile}
                  activeOpacity={0.88}
                >
                  <Text style={styles.sheetPrimaryBtnText}>
                    {isSavingProfile ? 'Đang lưu...' : 'Lưu'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* iOS Home Indicator */}
              <View style={styles.sheetHomeIndicatorWrap}>
                <View style={styles.sheetHomeIndicator} />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFE3C8',
  },
  safeContainer: {
    flex: 1,
  },
  ambientGlowTopRight: {
    position: 'absolute',
    top: 30,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(253, 186, 116, 0.28)',
  },
  ambientGlowBottomLeft: {
    position: 'absolute',
    top: 320,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(254, 215, 170, 0.32)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.5,
  },
  headerIllustrationWrap: {
    width: 90,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Cards Stack */
  cardsStack: {
    gap: 12,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3E8E2',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  topProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  avatarIdentityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  avatarContainer: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFEDD5',
    padding: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInnerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarSvg: {
    marginTop: 6,
  },
  activeDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  identityTextWrap: {
    flex: 1,
    gap: 4,
  },
  teacherNameText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  homeroomBadge: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  homeroomBadgeText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  /* Information Rows */
  infoRowsContainer: {
    gap: 10,
    paddingTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoRowText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },

  /* Divider */
  cardDivider: {
    height: 1,
    backgroundColor: '#F3E8E2',
    marginVertical: 14,
  },

  /* Subjects */
  subjectsSection: {
    gap: 8,
  },
  subjectsTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#94A3B8',
  },
  subjectsEmptyText: {
    fontSize: 13,
    color: '#9D9AA8',
    fontStyle: 'italic',
  },
  subjectChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  subjectChip: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  subjectChipText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#1E1B2E',
  },

  /* Settings Card */
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3E8E2',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },

  /* Logout Button */
  logoutBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutBtnText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#EF4444',
  },

  /* Bottom Dock Navigation */
  dockContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  dockBar: {
    width: 342,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E1B2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  dockTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockActivePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
  },
  dockTabTextActive: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dockTabTextInactive: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 46, 0.5)',
    justifyContent: 'flex-end',
  },
  passwordSheetBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingHorizontal: 20,
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.16,
    shadowRadius: 36,
    elevation: 10,
  },
  editProfileSheetBox: {
    height: '72%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingHorizontal: 20,
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.16,
    shadowRadius: 36,
    elevation: 10,
  },
  sheetDragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E0DC',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  passwordInputsWrap: {
    gap: 12,
    marginBottom: 16,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0EA',
    gap: 10,
  },
  passwordInputContainerError: {
    borderColor: '#EF4444',
  },
  sheetTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E1B2E',
  },
  errorTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  sheetButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  sheetCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F58F4C',
  },
  sheetPrimaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  sheetPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetHomeIndicatorWrap: {
    alignItems: 'center',
    paddingTop: 12,
  },
  sheetHomeIndicator: {
    width: 128,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(30, 27, 46, 0.2)',
  },
  editProfileScroll: {
    flex: 1,
    marginBottom: 12,
  },
  editInputsStack: {
    gap: 12,
    marginBottom: 16,
  },
  editTextInput: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2DD',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E1B2E',
  },
  editSubjectsSection: {
    marginTop: 4,
    marginBottom: 12,
  },
  editSubjectsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
    marginBottom: 10,
  },
  subjectChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  editSubjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2DD',
  },
  editSubjectChipSelected: {
    backgroundColor: '#FFF1E6',
    borderColor: '#F58F4C',
  },
  editSubjectChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6880',
  },
  editSubjectChipTextSelected: {
    fontWeight: '700',
    color: '#F58F4C',
  },
});
