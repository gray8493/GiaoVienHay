import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { parentService, ChildItem } from '../services/parent.service';
import { getInitials } from '../utils/format';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

interface ParentProfileScreenProps {
  onBackToHome?: () => void;
  onNavigateToTab?: (tabKey: 'home' | 'academic' | 'fees' | 'profile') => void;
  onNavigateToAddChild?: () => void;
  onLogout?: () => void;
}

export const ParentProfileScreen: React.FC<ParentProfileScreenProps> = ({
  onBackToHome,
  onNavigateToTab,
  onNavigateToAddChild,
  onLogout,
}) => {
  const [parentName, setParentName] = useState(() => authService.getUser()?.full_name || 'Phụ huynh');
  const [parentPhone, setParentPhone] = useState(() => authService.getUser()?.phone || '');
  const [parentEmail, setParentEmail] = useState(() => authService.getUser()?.email || '');
  const [children, setChildren] = useState<ChildItem[]>([]);

  // Sheet Sửa hồ sơ phụ huynh (viết lại toàn bộ — bản cũ không mở được)
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [pEditName, setPEditName] = useState(parentName);
  const [pEditEmail, setPEditEmail] = useState(parentEmail);
  const [pEditNameErr, setPEditNameErr] = useState<string | null>(null);
  const [pEditEmailErr, setPEditEmailErr] = useState<string | null>(null);
  const [pEditSaving, setPEditSaving] = useState(false);

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

  const openProfileEditor = () => {
    setPEditName(parentName);
    setPEditEmail(parentEmail);
    setPEditNameErr(null);
    setPEditEmailErr(null);
    setProfileEditOpen(true);
  };

  const submitProfileEdit = async () => {
    setPEditNameErr(null);
    setPEditEmailErr(null);

    const trimmedName = pEditName.trim();
    const trimmedEmail = pEditEmail.trim();

    if (trimmedName.length < 2) {
      setPEditNameErr('Họ và tên phải có ít nhất 2 ký tự');
      return;
    }

    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setPEditEmailErr('Địa chỉ email không đúng định dạng');
        return;
      }
    }

    setPEditSaving(true);
    try {
      const updated = await userService.updateProfile({
        full_name: trimmedName,
        email: trimmedEmail || undefined,
      });

      setParentName(updated.full_name || trimmedName);
      setParentEmail(updated.email !== undefined ? (updated.email || '') : trimmedEmail);
      // Đồng bộ luôn phiên đăng nhập để tên hiện đúng ở mọi màn hình
      authService.setUser({
        ...(authService.getUser() || {}),
        full_name: updated.full_name || trimmedName,
        email: updated.email !== undefined ? (updated.email || trimmedEmail) : (authService.getUser()?.email || ''),
      } as any);

      setProfileEditOpen(false);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setPEditSaving(false);
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
      await authService.changePassword(oldPassword, newPassword);
      setChangePasswordModalVisible(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    await authService.ensureToken();
    try {
      const profile = await userService.getProfile();
      if (profile) {
        if (profile.full_name) setParentName(profile.full_name);
        if (profile.phone) setParentPhone(profile.phone);
        if (profile.email) setParentEmail(profile.email);
      }
    } catch {
      const user = authService.getUser();
      if (user) {
        if (user.full_name) setParentName(user.full_name);
        if (user.phone) setParentPhone(user.phone);
        if (user.email) setParentEmail(user.email);
      }
    }
    const kids = await parentService.getLinkedChildren();
    setChildren(kids);
  };

  return (
    <View style={styles.container}>
      {/* Background Decor Stars */}
      <View style={styles.bgDecorWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path d="M340 60 L342 66 L348 68 L342 70 L340 76 L338 70 L332 68 L338 66 Z" fill="#F58F4C" fillOpacity={0.25} />
          <Path d="M20 380 L22 386 L28 388 L22 390 L20 396 L18 390 L12 388 L18 386 Z" fill="#F58F4C" fillOpacity={0.25} />
          <Path d="M350 680 L352 686 L358 688 L352 690 L350 696 L348 690 L342 688 L348 686 Z" fill="#F58F4C" fillOpacity={0.2} />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cá Nhân</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileIdentityRow}
            activeOpacity={0.75}
            onPress={openProfileEditor}
            accessibilityLabel="Chỉnh sửa hồ sơ"
          >
            {/* Letter Avatar */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(parentName)}</Text>
            </View>

            <View style={styles.profileNameGroup}>
              <Text style={styles.profileNameTitle}>{parentName}</Text>
              <View style={styles.roleBadgePill}>
                <Text style={styles.roleBadgeText}>Phụ huynh</Text>
              </View>
            </View>

            {/* Edit Profile Button Icon */}
            <View style={styles.editBtn}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.2}>
                <Path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          {/* Phone Information */}
          <View style={styles.contactRow}>
            <View style={styles.phoneIconTile}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Số điện thoại</Text>
              <Text style={styles.phoneText}>{parentPhone || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          {/* Email Information */}
          <View style={[styles.contactRow, { marginTop: 10 }]}>
            <View style={styles.phoneIconTile}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <Polyline points="22,6 12,13 2,6" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Email liên hệ</Text>
              <Text style={[styles.phoneText, !parentEmail && { color: '#9E9BB2', fontWeight: '500' }]}>
                {parentEmail || 'Chưa cập nhật email'}
              </Text>
            </View>
          </View>
        </View>

        {/* Children List Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Con Của Tôi</Text>

          {children.map((child, idx) => (
            <React.Fragment key={child.id || idx}>
              <View style={styles.childRow}>
                <View style={styles.childRowLeft}>
                  <View style={styles.childAvatarSmall}>
                    <Text style={styles.childAvatarSmallText}>{child.avatar_letters || 'BN'}</Text>
                  </View>
                  <View>
                    <Text style={styles.childNameText}>{child.full_name}</Text>
                    <Text style={styles.childClassText}>{child.class_name}</Text>
                  </View>
                </View>
              </View>
              {idx < children.length - 1 && <View style={styles.itemDivider} />}
            </React.Fragment>
          ))}

          <View style={styles.itemDivider} />

          {/* Add Child Row */}
          <TouchableOpacity
            style={styles.addChildRow}
            activeOpacity={0.8}
            onPress={onNavigateToAddChild}
          >
            <View style={styles.addChildCircle}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.5}>
                <Line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                <Line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.addChildText}>+ Thêm Con</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Card: Đổi mật khẩu */}
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingsRow}
            activeOpacity={0.8}
            onPress={() => setChangePasswordModalVisible(true)}
          >
            <View style={styles.settingsLeft}>
              <View style={styles.settingsIconTile}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                  <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </Svg>
              </View>
              <Text style={styles.settingsText}>Đổi mật khẩu</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
              <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutWrap}>
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={async () => {
              if (Platform.OS === 'web') {
                const confirmed = typeof window !== 'undefined' ? window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?') : true;
                if (confirmed) {
                  await authService.logout();
                  onLogout?.();
                }
                return;
              }

              Alert.alert('Xác nhận đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
                { text: 'Hủy', style: 'cancel' },
                {
                  text: 'Đăng xuất',
                  style: 'destructive',
                  onPress: async () => {
                    await authService.logout();
                    onLogout?.();
                  },
                },
              ]);
            }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2}>
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
              <Polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
              <Line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.logoutText}>Đăng Xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dock điều hướng đáy (Tab Cá Nhân Active) */}
      <View style={styles.dockContainer}>
        <TouchableOpacity
          style={styles.dockItem}
          onPress={onBackToHome}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <Polyline points="9 22 9 12 15 12 15 22" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => onNavigateToTab?.('academic')}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Học tập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => onNavigateToTab?.('fees')}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Rect x="2" y="4" width="20" height="16" rx="2" />
              <Line x1="2" y1="10" x2="22" y2="10" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Thu phí</Text>
        </TouchableOpacity>

        {/* Tab 4: Cá nhân (ACTIVE Bubble) */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBubbleActive}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
          </View>
          <Text style={styles.dockLabelActive}>Cá nhân</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: Đổi mật khẩu (giống giao viên) */}
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
            <View style={styles.sheetDragHandle} />
            <Text style={styles.sheetTitle}>Đổi Mật Khẩu</Text>

            <View style={styles.passwordInputsWrap}>
              {/* Mật khẩu hiện tại */}
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

              {/* Mật khẩu mới */}
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

              {/* Nhập lại mật khẩu mới */}
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

            <View style={styles.sheetHomeIndicatorWrap}>
              <View style={styles.sheetHomeIndicator} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Sheet Chỉnh Sửa Hồ Sơ (viết lại — mở được trên web) */}
<Modal
  visible={profileEditOpen}
  transparent
  animationType="slide"
  onRequestClose={() => setProfileEditOpen(false)}
>
  <View style={styles.modalBackdrop}>
    <TouchableOpacity
      style={StyleSheet.absoluteFillObject}
      activeOpacity={1}
      onPress={() => setProfileEditOpen(false)}
    />
    <View style={styles.editProfileSheetBox}>
      <View style={styles.sheetDragHandle} />
      <View style={styles.editSheetHeaderRow}>
        <View>
          <Text style={styles.sheetTitle}>Chỉnh Sửa Hồ Sơ</Text>
          <Text style={styles.sheetSubtitle}>Cập nhật họ tên và email liên hệ</Text>
        </View>
        <TouchableOpacity
          style={styles.sheetCloseBtn}
          onPress={() => setProfileEditOpen(false)}
          activeOpacity={0.7}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2.2}>
            <Line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            <Line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.editProfileScroll}>
        {/* Họ và tên */}
        <View style={styles.fieldBlock}>
          <Text style={styles.inputFieldLabel}>
            Họ và tên <Text style={{ color: '#F58F4C' }}>*</Text>
          </Text>
          <View style={[styles.inputContainer, !!pEditNameErr && styles.inputContainerError]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={pEditNameErr ? '#EF4444' : '#F58F4C'} strokeWidth={2}>
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
            <TextInput
              style={styles.sheetTextInput}
              placeholder="Nhập họ và tên phụ huynh..."
              placeholderTextColor="#9D9AA8"
              value={pEditName}
              onChangeText={(t) => {
                setPEditName(t);
                if (pEditNameErr) setPEditNameErr(null);
              }}
            />
            {pEditName.length > 0 && (
              <TouchableOpacity onPress={() => setPEditName('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
                  <Circle cx="12" cy="12" r="10" />
                  <Line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
                  <Line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            )}
          </View>
          {pEditNameErr ? (
            <Text style={styles.errorText}>{pEditNameErr}</Text>
          ) : null}
        </View>

        {/* Email liên hệ */}
        <View style={styles.fieldBlock}>
          <Text style={styles.inputFieldLabel}>Email liên hệ</Text>
          <View style={[styles.inputContainer, !!pEditEmailErr && styles.inputContainerError]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={pEditEmailErr ? '#EF4444' : '#F58F4C'} strokeWidth={2}>
              <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <Polyline points="22,6 12,13 2,6" />
            </Svg>
            <TextInput
              style={styles.sheetTextInput}
              placeholder="ví dụ: phuhuynh@gmail.com"
              placeholderTextColor="#9D9AA8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={pEditEmail}
              onChangeText={(t) => {
                setPEditEmail(t);
                if (pEditEmailErr) setPEditEmailErr(null);
              }}
            />
          </View>
          {pEditEmailErr ? (
            <Text style={styles.errorText}>{pEditEmailErr}</Text>
          ) : null}
        </View>

        {/* SĐT đăng nhập — chỉ đọc */}
        <View style={styles.fieldBlock}>
          <View style={styles.labelRowBetween}>
            <Text style={styles.inputFieldLabel}>Số điện thoại đăng nhập</Text>
            <View style={styles.lockBadge}>
              <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2.5}>
                <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </Svg>
              <Text style={styles.lockBadgeText}>Cố định</Text>
            </View>
          </View>
          <View style={[styles.inputContainer, styles.inputContainerDisabled]}>
            <Text style={styles.disabledInputText}>{parentPhone || 'Chưa cập nhật'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.sheetButtonsRow}>
        <TouchableOpacity
          style={styles.sheetCancelBtn}
          onPress={() => setProfileEditOpen(false)}
          activeOpacity={0.8}
          disabled={pEditSaving}
        >
          <Text style={styles.sheetCancelBtnText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sheetPrimaryBtn}
          onPress={submitProfileEdit}
          disabled={pEditSaving}
          activeOpacity={0.88}
        >
          <Text style={styles.sheetPrimaryBtnText}>
            {pEditSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sheetHomeIndicatorWrap}>
        <View style={styles.sheetHomeIndicator} />
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFCFA3',
    position: 'relative',
  },
  bgDecorWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  scrollArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    marginBottom: 16,
    position: 'relative',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  profileIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6B6880',
  },
  profileNameGroup: {
    flex: 1,
  },
  profileNameTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    lineHeight: 24,
  },
  roleBadgePill: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1EDF7',
    marginVertical: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phoneIconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B2E',
  },

  /* Children Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B2E',
    marginBottom: 12,
  },
  childRow: {
    paddingVertical: 4,
  },
  childRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarSmallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B6880',
  },
  childNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  childClassText: {
    fontSize: 12,
    color: '#6B6880',
    marginTop: 1,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F7F5FA',
    marginVertical: 10,
  },
  addChildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  addChildCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChildText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F58F4C',
  },

  /* Settings Card */
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B2E',
  },

  /* Logout */
  logoutWrap: {
    marginTop: 4,
  },
  logoutBtn: {
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },

  /* Dock */
  dockContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: 'rgba(30, 27, 46, 0.96)',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 8,
    zIndex: 50,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconBubbleActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  dockIconBox: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9E9BB2',
    marginTop: 3,
  },
  dockLabelActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },

  /* Modal Đổi mật khẩu */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 46, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 390 : '100%',
    alignSelf: 'center',
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
    backgroundColor: '#FEF2F2',
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

  /* Contact rows on profile card */
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#887367',
    marginBottom: 2,
  },

  /* Edit Profile Sheet Styles /ui-ux-pro-max */
  editProfileSheetBox: {
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
    maxHeight: '90%',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 390 : '100%',
    alignSelf: 'center',
  },
  editSheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#887367',
    marginTop: 2,
    fontWeight: '500',
  },
  sheetCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileScroll: {
    maxHeight: 400,
  },
  avatarPreviewSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarPreviewOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFDBC8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  avatarPreviewInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F58F4C',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPreviewHint: {
    fontSize: 12,
    color: '#887367',
    marginTop: 8,
    fontWeight: '500',
  },
  formInputsWrap: {
    gap: 14,
    marginBottom: 16,
    paddingTop: 4,
  },
  fieldBlock: {
    gap: 6,
  },
  inputFieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#3D2C29',
  },
  labelRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  lockBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E0EA',
    gap: 10,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputContainerDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  disabledInputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  phoneLockHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginLeft: 4,
  },
  sheetPrimaryGradientBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
