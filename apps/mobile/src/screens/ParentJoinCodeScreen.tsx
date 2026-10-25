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
  KeyboardAvoidingView,
} from 'react-native';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import {
  parentService,
  PreviewClassData,
  JoinClassChildPayload,
} from '../services/parent.service';

interface ParentJoinCodeScreenProps {
  onBack?: () => void;
  onJoinSuccess?: () => void;
}

export const ParentJoinCodeScreen: React.FC<ParentJoinCodeScreenProps> = ({
  onBack,
  onJoinSuccess,
}) => {
  // Step 1: Nhập mã mời lớp; Step 2: Xác nhận lớp & Điền thông tin con
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [inviteCode, setInviteCode] = useState('');
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [classInfo, setClassInfo] = useState<PreviewClassData | null>(null);

  // Step 2 state (Thông tin con của phụ huynh)
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childGender, setChildGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [relationship, setRelationship] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý kiểm tra mã mời lớp (Step 1 -> Step 2)
  const handleCheckInviteCode = async () => {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã mời do giáo viên chủ nhiệm cung cấp');
      return;
    }

    setIsCheckingCode(true);
    try {
      const data = await parentService.previewClassByInvite(cleanCode);
      setClassInfo(data);
      setStep(2);
    } catch (e: any) {
      Alert.alert(
        'Không tìm thấy lớp học',
        e?.message || 'Mã mời lớp học không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại.',
      );
    } finally {
      setIsCheckingCode(false);
    }
  };

  // Xử lý xác nhận tham gia lớp & liên kết con (Step 2)
  const handleSubmitJoin = async () => {
    if (!childName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên của con');
      return;
    }

    const rawDob = childDob.trim();
    if (!rawDob) {
      Alert.alert('Thông báo', 'Vui lòng nhập ngày sinh của con');
      return;
    }

    // Chuẩn hóa định dạng ngày sinh DD/MM/YYYY
    let dobIso = rawDob;
    const dobMatch = rawDob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dobMatch) {
      const d = Number(dobMatch[1]);
      const m = Number(dobMatch[2]);
      const y = Number(dobMatch[3]);
      const parsed = new Date(Date.UTC(y, m - 1, d));
      const isValid =
        parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
      if (!isValid) {
        Alert.alert('Thông báo', 'Ngày sinh không tồn tại trong lịch thực tế');
        return;
      }
      dobIso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    } else if (!rawDob.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Thông báo', 'Ngày sinh cần có định dạng DD/MM/YYYY (ví dụ: 15/05/2018)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: JoinClassChildPayload = {
        invite_code: inviteCode.trim().toUpperCase(),
        child_name: childName.trim(),
        dob: dobIso,
        gender: childGender,
        relationship: relationship,
      };

      const result = await parentService.linkNewChild(payload);
      Alert.alert(
        'Liên kết thành công!',
        `Đã kết nối thành công với hồ sơ của em ${result.full_name} tại ${result.class_name || classInfo?.name || 'lớp học'}!`,
        [
          {
            text: 'Bắt đầu theo dõi',
            onPress: () => {
              if (onJoinSuccess) {
                onJoinSuccess();
              } else if (onBack) {
                onBack();
              }
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert('Lỗi liên kết', e?.message || 'Không thể liên kết con vào lớp học. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background Decor */}
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
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (step === 2) {
                setStep(1);
              } else {
                onBack?.();
              }
            }}
            activeOpacity={0.8}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.5}>
              <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>
              {step === 1 ? 'Nhập Mã Lớp Học' : 'Thông Tin Con Em'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {step === 1 ? 'Bước 1: Xác nhận lớp' : 'Bước 2: Điền thông tin kết nối'}
            </Text>
          </View>
        </View>

        {/* ======================================================== */}
        {/* BƯỚC 1: NHẬP MÃ MỜI LỚP HỌC */}
        {/* ======================================================== */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                  <Path d="M21 2l-2 2m-1.5 1.5L14 9M3 15a6 6 0 1 1 8.9 5.3L21 8.4V4h-4.4L11 9.6A6 6 0 0 1 3 15z" />
                  <Circle cx="7.5" cy="16.5" r="1.5" fill="#F58F4C" />
                </Svg>
              </View>

              <Text style={styles.cardMainTitle}>Mã Mời Lớp Học</Text>
              <Text style={styles.instructionText}>
                Nhập mã mời lớp do giáo viên chủ nhiệm cung cấp để tìm lớp và kết nối hồ sơ học sinh của con.
              </Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.codeInput}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  placeholder="VD: GVH-1A-2024"
                  placeholderTextColor="#A09DAE"
                  autoCapitalize="characters"
                  textAlign="center"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* QR Code Action Button */}
            <TouchableOpacity
              style={styles.qrBtn}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Quét mã QR', 'Tính năng mở máy ảnh quét mã QR trên giấy mời của giáo viên.')}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Rect x="3" y="3" width="7" height="7" rx="1" />
                <Rect x="14" y="3" width="7" height="7" rx="1" />
                <Rect x="14" y="14" width="7" height="7" rx="1" />
                <Rect x="3" y="14" width="7" height="7" rx="1" />
              </Svg>
              <Text style={styles.qrBtnText}>Quét Mã QR Lớp Học</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ======================================================== */}
        {/* BƯỚC 2: XÁC NHẬN LỚP & ĐIỀN THÔNG TIN CON (PHƯƠNG ÁN 1) */}
        {/* ======================================================== */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            {/* Bento Card: Lớp Học Đã Tìm Thấy */}
            {classInfo && (
              <View style={styles.classFoundCard}>
                <View style={styles.classFoundHeader}>
                  <View style={styles.classTitleRow}>
                    <Text style={styles.classFoundName}>{classInfo.name}</Text>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeBadgeText}>
                        Khối {classInfo.grade_level} • {classInfo.academic_year}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17l-5-5" stroke="#15803D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.verifiedBadgeText}>Lớp học chính thức</Text>
                  </View>
                </View>

                {classInfo.school_name ? (
                  <View style={styles.classMetaRow}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#984704" strokeWidth={2}>
                      <Path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1m-4 6v-4h4v4" strokeLinecap="round" />
                    </Svg>
                    <Text style={styles.classMetaText}>{classInfo.school_name}</Text>
                  </View>
                ) : null}

                <View style={styles.classMetaRow}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#984704" strokeWidth={2}>
                    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" />
                  </Svg>
                  <Text style={styles.classMetaText}>GVCN: {classInfo.homeroom_teacher}</Text>
                </View>
              </View>
            )}

            {/* Form Card: Thông Tin Con Của Phụ Huynh */}
            <View style={styles.childFormCard}>
              <View style={styles.formSectionHeader}>
                <View style={styles.formSectionIcon}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill="#F58F4C"
                    />
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formSectionTitle}>THÔNG TIN CON CỦA BẠN</Text>
                  <Text style={styles.formSectionSubtitle}>
                    Hệ thống sẽ kết nối bạn với con tại lớp học này
                  </Text>
                </View>
              </View>

              {/* Field 1: Họ và tên con * */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Họ và tên con <Text style={{ color: '#BA1A1A' }}>*</Text>
                </Text>
                <View style={styles.formInputBox}>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: Trần Bảo Nam hoặc Lê Minh Khôi"
                    placeholderTextColor="#A09DAE"
                    value={childName}
                    onChangeText={setChildName}
                  />
                </View>
              </View>

              {/* Field 2: Ngày sinh con * */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Ngày sinh của con <Text style={{ color: '#BA1A1A' }}>*</Text>
                </Text>
                <View style={styles.formInputBoxWithIcon}>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY (VD: 15/05/2018)"
                    placeholderTextColor="#A09DAE"
                    value={childDob}
                    onChangeText={setChildDob}
                  />
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                    <Rect x={3} y={4} width={18} height={18} rx={2} />
                    <Path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                  </Svg>
                </View>
              </View>

              {/* Field 3: Giới tính của con */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giới tính của con</Text>
                <View style={styles.pillRow}>
                  <TouchableOpacity
                    style={[styles.pillBtn, childGender === 'MALE' ? styles.pillBtnActive : styles.pillBtnInactive]}
                    onPress={() => setChildGender('MALE')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillBtnText, childGender === 'MALE' ? styles.pillBtnTextActive : styles.pillBtnTextInactive]}>
                      👦 Con Trai (Nam)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pillBtn, childGender === 'FEMALE' ? styles.pillBtnActive : styles.pillBtnInactive]}
                    onPress={() => setChildGender('FEMALE')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillBtnText, childGender === 'FEMALE' ? styles.pillBtnTextActive : styles.pillBtnTextInactive]}>
                      👧 Con Gái (Nữ)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Field 4: Mối quan hệ với con */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Bạn là ai của con?</Text>
                <View style={styles.pillRow}>
                  {(['Bố', 'Mẹ', 'Người giám hộ'] as const).map(rel => (
                    <TouchableOpacity
                      key={rel}
                      style={[styles.pillBtnSmall, relationship === rel ? styles.pillBtnActive : styles.pillBtnInactive]}
                      onPress={() => setRelationship(rel)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pillBtnTextSmall, relationship === rel ? styles.pillBtnTextActive : styles.pillBtnTextInactive]}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {step === 1 ? (
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.9}
            onPress={handleCheckInviteCode}
            disabled={isCheckingCode}
          >
            {isCheckingCode ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnContentRow}>
                <Text style={styles.submitBtnText}>Tiếp Tục</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelStepBtn}
              onPress={() => setStep(1)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelStepBtnText}>Đổi mã</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { flex: 1 }]}
              activeOpacity={0.9}
              onPress={handleSubmitJoin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.btnContentRow}>
                  <Text style={styles.submitBtnText}>Xác Nhận & Tham Gia</Text>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.homeIndicator} />
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 130,
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
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#887367',
    fontWeight: '500',
    marginTop: 2,
  },
  stepContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
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
    marginBottom: 14,
  },
  cardMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C192C',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 13,
    color: '#6B6880',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
    marginBottom: 20,
  },
  inputWrapper: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  codeInput: {
    width: '100%',
    fontSize: 22,
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  qrBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F58F4C',
  },

  // Step 2: Class Found Bento Card
  classFoundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  classFoundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF1E6',
    marginBottom: 10,
  },
  classTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  classFoundName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C192C',
  },
  gradeBadge: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#984704',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  classMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  classMetaText: {
    fontSize: 12.5,
    color: '#6B5A51',
    fontWeight: '500',
  },

  // Step 2: Child Form Card
  childFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF1E6',
    marginBottom: 14,
  },
  formSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFDBC8',
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#984704',
    letterSpacing: 0.4,
  },
  formSectionSubtitle: {
    fontSize: 11,
    color: '#887367',
    marginTop: 1,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1C192C',
    marginBottom: 6,
  },
  formInputBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: '#EAE6E1',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  formInputBoxWithIcon: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: '#EAE6E1',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formInput: {
    fontSize: 13.5,
    color: '#1C192C',
    fontWeight: '600',
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pillBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnSmall: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1.5,
    borderColor: '#F58F4C',
  },
  pillBtnInactive: {
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: '#EAE6E1',
  },
  pillBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  pillBtnTextSmall: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillBtnTextActive: {
    color: '#984704',
    fontWeight: '700',
  },
  pillBtnTextInactive: {
    color: '#6B5A51',
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: 'rgba(255, 243, 230, 0.96)',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelStepBtn: {
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelStepBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F58F4C',
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
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: 15.5,
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
