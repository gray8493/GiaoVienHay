import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Svg, Path, Circle, Rect, Line } from 'react-native-svg';
import { parentService } from '../services/parent.service';

interface ParentJoinCodeScreenProps {
  onBack?: () => void;
  onJoinSuccess?: () => void;
}

export const ParentJoinCodeScreen: React.FC<ParentJoinCodeScreenProps> = ({
  onBack,
  onJoinSuccess,
}) => {
  const [inviteCode, setInviteCode] = useState('INV-6A1-9821');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã mời do giáo viên cung cấp');
      return;
    }

    setIsSubmitting(true);
    try {
      await parentService.linkNewChild(inviteCode.trim());
      Alert.alert('Thành công', 'Đã liên kết tài khoản học sinh thành công!');
      if (onJoinSuccess) {
        onJoinSuccess();
      } else if (onBack) {
        onBack();
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Mã mời không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Decor Stars */}
      <View style={styles.bgDecorWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path d="M340 60 L342 66 L348 68 L342 70 L340 76 L338 70 L332 68 L338 66 Z" fill="#F58F4C" fillOpacity={0.25} />
          <Path d="M20 380 L22 386 L28 388 L22 390 L20 396 L18 390 L12 388 L18 386 Z" fill="#F58F4C" fillOpacity={0.25} />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.5}>
              <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhập Mã Mời</Text>
        </View>

        {/* Code Entry Card */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
              <Path d="M21 2l-2 2m-1.5 1.5L14 9M3 15a6 6 0 1 1 8.9 5.3L21 8.4V4h-4.4L11 9.6A6 6 0 0 1 3 15z" />
              <Circle cx="7.5" cy="16.5" r="1.5" fill="#F58F4C" />
            </Svg>
          </View>

          <Text style={styles.instructionText}>
            Nhập mã mời do giáo viên cung cấp để liên kết tài khoản con của bạn
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.codeInput}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="INV-6A1-9821"
              placeholderTextColor="#A09DAE"
              autoCapitalize="characters"
              textAlign="center"
            />
          </View>
        </View>

        {/* QR Code Action Button */}
        <TouchableOpacity
          style={styles.qrBtn}
          activeOpacity={0.85}
          onPress={() => Alert.alert('Quét mã QR', 'Mở camera quét mã QR trên giấy mời của giáo viên.')}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
            <Rect x="3" y="3" width="7" height="7" rx="1" />
            <Rect x="14" y="3" width="7" height="7" rx="1" />
            <Rect x="14" y="14" width="7" height="7" rx="1" />
            <Rect x="3" y="14" width="7" height="7" rx="1" />
          </Svg>
          <Text style={styles.qrBtnText}>Quét Mã QR</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.9}
          onPress={handleJoin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Tham Gia</Text>
          )}
        </TouchableOpacity>
        <View style={styles.homeIndicator} />
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
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 13,
    color: '#6B6880',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
    marginBottom: 20,
  },
  inputWrapper: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E0EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  codeInput: {
    width: '100%',
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: 2,
    textAlign: 'center',
  },
  qrBtn: {
    width: '100%',
    height: 50,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  qrBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F58F4C',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: 'rgba(255, 243, 230, 0.95)',
    alignItems: 'center',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(30, 27, 46, 0.2)',
    marginTop: 12,
  },
});
