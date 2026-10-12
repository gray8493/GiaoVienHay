import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Svg, Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { parentService, ChildItem } from '../services/parent.service';
import { authService } from '../services/auth.service';

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
  const [parentName, setParentName] = useState('Bác Trần Văn Hùng');
  const [parentPhone, setParentPhone] = useState('0977 112 233');
  const [children, setChildren] = useState<ChildItem[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    await authService.ensureToken();
    const user = authService.getUser();
    if (user) {
      if (user.full_name) setParentName(user.full_name);
      if (user.phone) setParentPhone(user.phone);
    }
    const kids = await parentService.getLinkedChildren();
    setChildren(kids);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (name.slice(0, 2) || 'PH').toUpperCase();
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
          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Thông tin', 'Tính năng chỉnh sửa hồ sơ phụ huynh đang được cập nhật.')}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
              <Path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <View style={styles.profileIdentityRow}>
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
          </View>

          <View style={styles.cardDivider} />

          {/* Phone Information */}
          <View style={styles.phoneRow}>
            <View style={styles.phoneIconTile}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={styles.phoneText}>{parentPhone}</Text>
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
            onPress={() => Alert.alert('Đổi mật khẩu', 'Vui lòng kiểm tra mã xác thực SMS gửi về 0912 345 678.')}
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
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6B6880',
  },
  profileNameGroup: {
    flex: 1,
    paddingRight: 32,
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
});
