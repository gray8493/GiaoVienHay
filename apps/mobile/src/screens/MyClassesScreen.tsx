import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Svg, Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Ellipse } from 'react-native-svg';
import { classService, MyClassItem } from '../services/class.service';
import { authService } from '../services/auth.service';

interface SubjectOptionItem {
  code: string;
  name: string;
}

const AVAILABLE_SUBJECTS: SubjectOptionItem[] = [
  { code: 'MATH', name: 'Toán' },
  { code: 'LIT', name: 'Ngữ Văn' },
  { code: 'ENG', name: 'Tiếng Anh' },
  { code: 'CS', name: 'Tin Học' },
  { code: 'PHYSICS', name: 'Vật Lý' },
  { code: 'CHEM', name: 'Hóa Học' },
  { code: 'BIO', name: 'Sinh Học' },
  { code: 'HIST', name: 'Lịch Sử' },
  { code: 'GEO', name: 'Địa Lý' },
  { code: 'GDCD', name: 'GDCD' },
];

const { width } = Dimensions.get('window');

interface MyClassesScreenProps {
  onBack?: () => void;
  onSelectClass?: (classId: string, classData?: MyClassItem) => void;
}

type ScreenView = 'MY_CLASSES' | 'CREATE_CLASS' | 'JOIN_BY_CODE';

export const MyClassesScreen: React.FC<MyClassesScreenProps> = ({
  onBack,
  onSelectClass,
}) => {
  const [currentView, setCurrentView] = useState<ScreenView>('MY_CLASSES');
  const [classes, setClasses] = useState<MyClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Bottom Sheet "Thêm Lớp" (TEA-11.BS)
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addOption, setAddOption] = useState<'CREATE' | 'JOIN'>('CREATE');

  // Form State "Tạo Lớp Mới" (TEA-11.3)
  const [classNameInput, setClassNameInput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<1 | 2>(1);
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Form State "Vào Lớp Bằng Mã" (TEA-11.4)
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('MATH');
  const [profileSubjects, setProfileSubjects] = useState<string[]>([]);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  useEffect(() => {
    loadClasses();
    initTeacherProfileSubjects();
  }, []);

  const initTeacherProfileSubjects = () => {
    try {
      const user = authService.getUser();
      const rawSubjects = user?.teaching_subjects || (user as any)?.subjects || [];
      if (Array.isArray(rawSubjects) && rawSubjects.length > 0) {
        const normalized = rawSubjects.map((s: string) => {
          const str = String(s).trim().toUpperCase();
          if (str.includes('VĂN') || str.includes('VAN') || str === 'LIT' || str === 'LITERATURE') return 'LIT';
          if (str.includes('TOÁN') || str.includes('TOAN') || str === 'MATH') return 'MATH';
          if (str.includes('ANH') || str === 'ENG' || str === 'ENGLISH') return 'ENG';
          if (str.includes('TIN') || str === 'CS' || str === 'INFORMATICS') return 'CS';
          if (str.includes('LÝ') || str.includes('LY') || str === 'PHYSICS') return 'PHYSICS';
          if (str.includes('HÓA') || str.includes('HOA') || str === 'CHEM') return 'CHEM';
          if (str.includes('SINH') || str === 'BIO') return 'BIO';
          if (str.includes('SỬ') || str.includes('SU') || str === 'HIST') return 'HIST';
          if (str.includes('ĐỊA') || str.includes('DIA') || str === 'GEO') return 'GEO';
          if (str.includes('GDCD') || str.includes('ĐẠO') || str === 'GDCD') return 'GDCD';
          return str;
        });
        setProfileSubjects(normalized);
        if (normalized[0]) {
          setSelectedSubject(normalized[0]);
        }
      }
    } catch (e) {
      console.warn('initTeacherProfileSubjects error:', e);
    }
  };

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await classService.getMyClasses();
      setClasses(data);
    } catch (e) {
      console.warn('Lỗi khi tải danh sách lớp:', e);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán số liệu thống kê
  const totalClassesCount = classes.length;
  const totalStudentsCount = classes.reduce((sum, item) => sum + (item.student_count || 0), 0);

  // Xử lý nộp form Tạo Lớp (TEA-11.3)
  const handleCreateClass = async () => {
    if (!classNameInput.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên lớp học (ví dụ: 6A4 hoặc 7A1)');
      return;
    }

    // Niên khóa: chuẩn hóa dấu gạch (– — → -) và kiểm định dạng YYYY-YYYY
    const normalizedYear = academicYear.trim().replace(/[–—]/g, '-');
    if (!/^\d{4}-\d{4}$/.test(normalizedYear)) {
      Alert.alert('Thông báo', 'Niên khóa cần định dạng YYYY-YYYY, ví dụ 2026-2027');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const payloadName = classNameInput.trim().startsWith('Lớp')
        ? classNameInput.trim()
        : `Lớp ${classNameInput.trim()}`;

      const newClassRes = await classService.createClass({
        name: payloadName,
        grade_level: selectedGrade,
        academic_year: normalizedYear,
      });

      const newClassItem: MyClassItem = {
        id: newClassRes.id || `cls_${Date.now()}`,
        name: newClassRes.name || payloadName,
        grade_level: selectedGrade,
        academic_year: newClassRes.academic_year || normalizedYear,
        school_name: newClassRes.school_name || newClassRes.schoolName || '',
        student_count: 0,
        role_type: 'HOMEROOM',
        icon_name: 'groups',
      };

      setClasses(prev => [newClassItem, ...prev]);
      Alert.alert('Thành công', `Đã tạo ${payloadName} thành công!`);
      setClassNameInput('');
      setCurrentView('MY_CLASSES');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo lớp học lúc này');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Xử lý nộp form Vào Lớp Bằng Mã (TEA-11.4)
  const handleJoinClass = async () => {
    const code = inviteCodeInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã lớp học');
      return;
    }

    setIsSubmittingJoin(true);
    try {
      const result = await classService.joinClass(code, selectedSubject);

      if (!result?.class_id) {
        throw new Error('Không thể xác định lớp học vừa tham gia');
      }

      const matchedSub = AVAILABLE_SUBJECTS.find(s => s.code === selectedSubject);
      const subjectLabel = matchedSub?.name || selectedSubject;
      const iconType = selectedSubject === 'MATH' ? 'square_foot' : selectedSubject === 'CS' ? 'laptop_mac' : 'school';

      const joinedClassItem: MyClassItem = {
        id: result.class_id,
        name: result.class_name
          ? result.class_name.startsWith('Lớp')
            ? result.class_name
            : `Lớp ${result.class_name}`
          : 'Lớp học',
        grade_level: result.grade_level ?? result.gradeLevel ?? 0,
        academic_year: result.academic_year ?? result.academicYear ?? '',
        school_name: result.school_name ?? result.schoolName ?? '',
        student_count: result.student_count ?? result.studentCount ?? 0,
        role_type: 'SUBJECT',
        subject_name: subjectLabel,
        subject_names: [subjectLabel],
        icon_name: iconType,
      };

      setClasses(prev => {
        const filtered = prev.filter(c => c.id !== joinedClassItem.id);
        return [...filtered, joinedClassItem];
      });

      // Tải lại danh sách đầy đủ từ server để đồng bộ
      loadClasses();

      Alert.alert('Thành công', `Đã tham gia lớp với vai trò Giáo viên bộ môn ${subjectLabel}!`);
      setInviteCodeInput('');
      setCurrentView('MY_CLASSES');
    } catch (err: any) {
      Alert.alert('Thông báo', err.message || 'Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  // ==========================================
  // RENDER: TEA-11.3 TẠO LỚP MỚI
  // ==========================================
  if (currentView === 'CREATE_CLASS') {
    return (
      <View style={styles.container}>
        {/* Ambient SVG Waves & Stars Background */}
        <View style={styles.bgSvgContainer} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
            <Path
              d="M-40 120C60 80 180 220 280 160C380 100 420 20 440 0"
              stroke="#FFFFFF"
              strokeDasharray="4 8"
              strokeLinecap="round"
              strokeWidth="1.5"
              opacity={0.6}
            />
            <Path
              d="M-20 480C80 430 140 560 260 520C380 480 390 380 420 340"
              stroke="#FFFFFF"
              strokeLinecap="round"
              strokeWidth="2"
              opacity={0.4}
            />
            <Path
              d="M60 760C160 700 240 820 360 770"
              stroke="#FFFFFF"
              strokeDasharray="6 6"
              strokeWidth="1.5"
              opacity={0.5}
            />
            <G fill="#FFFFFF" opacity={0.75}>
              <Circle cx="190" cy="280" r="1.8" opacity={0.7} />
              <Circle cx="290" cy="420" r="1.5" opacity={0.6} />
              <Circle cx="110" cy="640" r="2" opacity={0.7} />
              <Circle cx="240" cy="730" r="1.5" opacity={0.6} />
            </G>
          </Svg>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Navigation & Playful 3D Graduation Cap Graphic */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentView('MY_CLASSES')}
                activeOpacity={0.8}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1C192C" strokeWidth={2.5}>
                  <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>Tạo Lớp Mới</Text>
            </View>

            {/* Soft Glossy 3D Graduation Cap Graphic */}
            <View style={styles.capGraphicWrapper}>
              <Svg width={72} height={72} viewBox="0 0 88 88" fill="none">
                <Defs>
                  <SvgLinearGradient id="capTop" x1="16" y1="20" x2="72" y2="44" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#7371FC" />
                    <Stop offset="0.6" stopColor="#5552E0" />
                    <Stop offset="1" stopColor="#403DB5" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="capGleam" x1="44" y1="18" x2="44" y2="34" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#FFFFFF" stopOpacity="0.45" />
                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="skullBase" x1="28" y1="40" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#4744C9" />
                    <Stop offset="1" stopColor="#2D2A82" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="tasselGold" x1="44" y1="30" x2="68" y2="58" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#FFE17D" />
                    <Stop offset="0.7" stopColor="#F5A623" />
                    <Stop offset="1" stopColor="#D97706" />
                  </SvgLinearGradient>
                </Defs>
                <Path d="M28 38C28 38 29 55 44 55C59 55 60 38 60 38L44 45L28 38Z" fill="url(#skullBase)" />
                <Path d="M44 19L74 33L44 46L14 33L44 19Z" fill="url(#capTop)" />
                <Path d="M44 20.5L71 33L44 44.5L17 33L44 20.5Z" fill="url(#capGleam)" />
                <Ellipse cx="44" cy="32.5" rx="3.5" ry="2" fill="#FFE17D" />
                <Path
                  d="M44 32.5C49 33.5 58 37 63 43C64.5 45 65.5 48 66 52"
                  stroke="url(#tasselGold)"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <Path d="M63.5 51C65.5 52 67.5 55 67.5 59C66 59 64 57.5 63 56L63.5 51Z" fill="url(#tasselGold)" />
              </Svg>
            </View>
          </View>

          {/* Primary White Form Card */}
          <View style={styles.cardContainer}>
            {/* Item 1: Class Name Field */}
            <View style={styles.formItem}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tên lớp (ví dụ: 6A4)"
                  placeholderTextColor="#DBC1B4"
                  value={classNameInput}
                  onChangeText={setClassNameInput}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Item 2: School Level (Cấp 1 / Cấp 2) */}
            <View style={styles.formItem}>
              <Text style={styles.fieldLabel}>Cấp học</Text>
              <View style={styles.gradeGrid}>
                {([1, 2] as const).map((lv) => {
                  const isSelected = selectedLevel === lv;
                  return (
                    <TouchableOpacity
                      key={lv}
                      style={[
                        styles.levelPill,
                        isSelected ? styles.gradePillActive : styles.gradePillInactive,
                      ]}
                      onPress={() => {
                        setSelectedLevel(lv);
                        // Đổi cấp → đưa khối về đầu dải tương ứng (1 hoặc 6)
                        setSelectedGrade(lv === 1 ? 1 : 6);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.gradePillText,
                          isSelected ? styles.gradePillTextActive : styles.gradePillTextInactive,
                        ]}
                      >
                        {lv === 1 ? 'Cấp 1 (Tiểu học)' : 'Cấp 2 (THCS)'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Item 3: Grade Level Segmented Pills */}
            <View style={styles.formItem}>
              <Text style={styles.fieldLabel}>Khối</Text>
              <View style={styles.gradeGrid}>
                {(selectedLevel === 1 ? [1, 2, 3, 4, 5] : [6, 7, 8, 9]).map((g) => {
                  const isSelected = selectedGrade === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.gradePill,
                        isSelected ? styles.gradePillActive : styles.gradePillInactive,
                      ]}
                      onPress={() => setSelectedGrade(g)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.gradePillText,
                          isSelected ? styles.gradePillTextActive : styles.gradePillTextInactive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Item 4: School Year Input (nhập được, mặc định năm học hiện tại) */}
            <View style={styles.formItem}>
              <Text style={styles.fieldLabel}>Niên khóa</Text>
              <View style={styles.schoolYearBox}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                  <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <Path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                </Svg>
                <TextInput
                  style={styles.schoolYearText}
                  placeholder="2026-2027"
                  placeholderTextColor="#DBC1B4"
                  value={academicYear}
                  onChangeText={setAcademicYear}
                  maxLength={9}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Subtle Informative Hint Container */}
          <View style={styles.hintContainer}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
              <Path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.hintText}>
              Dữ liệu môn học và sĩ số có thể tùy chỉnh thêm sau khi tạo.
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Bottom Bar: Nút Tạo Lớp */}
        <View style={styles.bottomBarContainer}>
          <TouchableOpacity
            style={styles.heroActionButton}
            onPress={handleCreateClass}
            activeOpacity={0.9}
            disabled={isSubmittingCreate}
          >
            {isSubmittingCreate ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.heroActionText}>Tạo Lớp</Text>
            )}
          </TouchableOpacity>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    );
  }

  // ==========================================
  // RENDER: TEA-11.4 VÀO LỚP BẰNG MÃ
  // ==========================================
  if (currentView === 'JOIN_BY_CODE') {
    return (
      <View style={styles.container}>
        {/* Ambient SVG Waves & Stars Background */}
        <View style={styles.bgSvgContainer} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
            <Path
              d="M-40 120C60 80 180 220 280 160C380 100 420 20 440 0"
              stroke="#FFFFFF"
              strokeDasharray="4 8"
              strokeLinecap="round"
              strokeWidth="1.5"
              opacity={0.6}
            />
            <Path
              d="M-20 480C80 430 140 560 260 520C380 480 390 380 420 340"
              stroke="#FFFFFF"
              strokeLinecap="round"
              strokeWidth="2"
              opacity={0.4}
            />
            <Path
              d="M60 760C160 700 240 820 360 770"
              stroke="#FFFFFF"
              strokeDasharray="6 6"
              strokeWidth="1.5"
              opacity={0.5}
            />
          </Svg>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Navigation */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentView('MY_CLASSES')}
                activeOpacity={0.8}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1C192C" strokeWidth={2.5}>
                  <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>Vào Lớp Bằng Mã</Text>
            </View>
          </View>

          {/* Main White Bento Container */}
          <View style={styles.cardContainer}>
            {/* Code Input Module */}
            <View style={styles.codeBoxWrapper}>
              <TextInput
                style={styles.codeInput}
                value={inviteCodeInput}
                onChangeText={setInviteCodeInput}
                placeholder="Nhập mã mời do GVCN cung cấp"
                placeholderTextColor="#A09DAE"
                autoCapitalize="characters"
                textAlign="center"
              />
            </View>

            {/* Dynamic Subject Pill Selection Module */}
            <View style={styles.subjectModule}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.fieldLabel}>Môn học phụ trách</Text>
                {profileSubjects.length > 0 && (
                  <Text style={{ fontSize: 11, color: '#F58F4C', fontWeight: '600' }}>
                    ★ Môn trong hồ sơ của bạn
                  </Text>
                )}
              </View>
              <View style={styles.subjectGridWrap}>
                {AVAILABLE_SUBJECTS.map(subj => {
                  const isSelected = selectedSubject === subj.code;
                  const isProfileSubject = profileSubjects.includes(subj.code);
                  return (
                    <TouchableOpacity
                      key={subj.code}
                      style={[
                        styles.subjectChip,
                        isSelected ? styles.subjectChipActive : styles.subjectChipInactive,
                        isProfileSubject && !isSelected && styles.subjectChipProfile,
                      ]}
                      onPress={() => setSelectedSubject(subj.code)}
                      activeOpacity={0.8}
                    >
                      {isProfileSubject && (
                        <View style={styles.profileBadgeDot} />
                      )}
                      <Text
                        style={[
                          styles.subjectChipText,
                          isSelected ? styles.subjectChipTextActive : styles.subjectChipTextInactive,
                        ]}
                      >
                        {subj.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Soft Context Note Banner */}
            <View style={styles.noteBanner}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#984704" strokeWidth={2}>
                <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <Path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.noteBannerText}>
                Mã này được cấp trực tiếp bởi ban giám hiệu hoặc giáo viên trưởng bộ môn.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Bar: Nút Vào Lớp */}
        <View style={styles.bottomBarContainer}>
          <TouchableOpacity
            style={styles.heroActionButton}
            onPress={handleJoinClass}
            activeOpacity={0.9}
            disabled={isSubmittingJoin}
          >
            {isSubmittingJoin ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.heroActionText}>Vào Lớp</Text>
            )}
          </TouchableOpacity>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    );
  }

  // ==========================================
  // RENDER: TEA-11 LỚP CỦA TÔI (MÀN HÌNH CHÍNH)
  // ==========================================
  return (
    <View style={styles.container}>
      {/* Ambient SVG Waves & Stars Background */}
      <View style={styles.bgSvgContainer} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path
            d="M-40 120C60 80 180 220 280 160C380 100 420 20 440 0"
            stroke="#FFFFFF"
            strokeDasharray="4 8"
            strokeLinecap="round"
            strokeWidth="1.5"
            opacity={0.6}
          />
          <Path
            d="M-20 480C80 430 140 560 260 520C380 480 390 380 420 340"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeWidth="2"
            opacity={0.4}
          />
          <Path
            d="M60 760C160 700 240 820 360 770"
            stroke="#FFFFFF"
            strokeDasharray="6 6"
            strokeWidth="1.5"
            opacity={0.5}
          />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Back button + Tiêu đề */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1C192C" strokeWidth={2.5}>
                <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Lớp Của Tôi</Text>
          </View>
        </View>

        {/* Bento Card: Danh sách lớp học */}
        <View style={styles.classesCard}>
          {loading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator color="#F58F4C" size="small" />
              <Text style={{ marginTop: 8, fontSize: 13, color: '#6B6880' }}>Đang tải danh sách lớp...</Text>
            </View>
          ) : classes.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#6B6880' }}>Chưa có lớp nào. Hãy thêm lớp mới!</Text>
            </View>
          ) : (
            classes.map((cls, index) => {
              const isLast = index === classes.length - 1;
              const isHomeroom = cls.role_type === 'HOMEROOM';
              const subjectLabels: string[] =
                cls.subject_names && cls.subject_names.length > 0
                  ? cls.subject_names
                  : cls.subject_name
                  ? [cls.subject_name]
                  : [];
              const roleText = isHomeroom
                ? subjectLabels.length > 0
                  ? `Chủ nhiệm · ${subjectLabels.join(', ')}`
                  : 'Chủ nhiệm'
                : subjectLabels.length > 0
                ? `Bộ môn · ${subjectLabels.join(', ')}`
                : 'Bộ môn';

              return (
                <View key={cls.id || index}>
                  <TouchableOpacity
                    style={styles.classRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (onSelectClass) {
                        onSelectClass(cls.id, cls);
                      }
                    }}
                  >
                    {/* Icon Box */}
                    <View style={styles.classIconBox}>
                      {cls.icon_name === 'square_foot' ? (
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Path d="M3 3v18h18L3 3z" />
                          <Path d="M7 17v4M11 13v4M15 9v4" strokeLinecap="round" />
                        </Svg>
                      ) : cls.icon_name === 'laptop_mac' ? (
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Rect x="3" y="4" width="18" height="12" rx="2" />
                          <Path d="M2 20h20" strokeLinecap="round" />
                        </Svg>
                      ) : (
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <Circle cx="9" cy="7" r="4" />
                          <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </Svg>
                      )}
                    </View>

                    {/* Class Info */}
                    <View style={styles.classInfo}>
                      <Text style={styles.className} numberOfLines={1}>{cls.name}</Text>
                      <Text style={styles.classStudents}>{cls.student_count} học sinh</Text>
                    </View>

                    {/* Role Pill & Action */}
                    <View style={styles.roleWrap}>
                      <View style={styles.rolePill}>
                        <Text style={styles.rolePillText} numberOfLines={1}>
                          {roleText}
                        </Text>
                      </View>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#554339" strokeWidth={2.5}>
                        <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                  </TouchableOpacity>

                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })
          )}
        </View>

        {/* 2 Thẻ thống kê Bento */}
        <View style={styles.statsGrid}>
          {/* Box 1: Lớp đang dạy */}
          <View style={styles.statBox}>
            <View style={styles.statIconBox}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <Path d="M6 12v5c3 3 9 3 12 0v-5" />
              </Svg>
            </View>
            <View>
              <Text style={styles.statValue}>{totalClassesCount}</Text>
              <Text style={styles.statLabel}>Lớp đang dạy</Text>
            </View>
          </View>

          {/* Box 2: Tổng học sinh */}
          <View style={styles.statBox}>
            <View style={styles.statIconBox}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Circle cx="12" cy="8" r="5" />
                <Path d="M20 21a8 8 0 1 0-16 0" />
              </Svg>
            </View>
            <View>
              <Text style={styles.statValue}>{totalStudentsCount}</Text>
              <Text style={styles.statLabel}>Tổng học sinh</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar: Nút Thêm Lớp (Fix lỗi rớt dòng chữ) */}
      <View style={styles.bottomBarContainer}>
        <TouchableOpacity
          style={styles.heroActionButton}
          onPress={() => setShowAddSheet(true)}
          activeOpacity={0.9}
        >
          <View style={styles.heroButtonInner}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3}>
              <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.heroActionText} numberOfLines={1}>
              Thêm Lớp
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.homeIndicator} />
      </View>

      {/* ======================================================== */}
      {/* BOTTOM SHEET MODAL: TEA-11.BS HỘP THOẠI THÊM LỚP        */}
      {/* ======================================================== */}
      <Modal
        visible={showAddSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          {/* Dimmed Background Touchable to Dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setShowAddSheet(false)}
          />

          {/* Bottom Sheet Container */}
          <View style={styles.bottomSheet}>
            {/* Drag Handle Indicator */}
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Sheet Title */}
            <Text style={styles.sheetTitle}>Thêm Lớp</Text>

            {/* Two Large Selectable Cards */}
            <View style={styles.sheetCardsWrap}>
              {/* Card 1: Tạo Lớp Mới */}
              <TouchableOpacity
                style={[
                  styles.selectCard,
                  addOption === 'CREATE' ? styles.selectCardActive : styles.selectCardInactive,
                ]}
                onPress={() => setAddOption('CREATE')}
                activeOpacity={0.8}
              >
                <View style={styles.selectCardLeft}>
                  <View style={styles.selectCardIconBox}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <Path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </Svg>
                  </View>
                  <Text style={styles.selectCardTitle}>Tạo Lớp Mới</Text>
                </View>

                {/* Radio check */}
                {addOption === 'CREATE' ? (
                  <View style={styles.radioCheckActive}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.5}>
                      <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                ) : (
                  <View style={styles.radioCheckInactive} />
                )}
              </TouchableOpacity>

              {/* Card 2: Vào Lớp Bằng Mã */}
              <TouchableOpacity
                style={[
                  styles.selectCard,
                  addOption === 'JOIN' ? styles.selectCardActive : styles.selectCardInactive,
                ]}
                onPress={() => setAddOption('JOIN')}
                activeOpacity={0.8}
              >
                <View style={styles.selectCardLeft}>
                  <View style={styles.selectCardIconBox}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Path d="M21 2l-2 2m-2-2l2 2" />
                      <Path d="M15.5 8.5L7 17l-3 3-1-1 3-3 8.5-8.5a4.24 4.24 0 0 1 6 6z" strokeLinejoin="round" />
                      <Circle cx="17.5" cy="6.5" r="1.5" />
                    </Svg>
                  </View>
                  <Text style={styles.selectCardTitle}>Vào Lớp Bằng Mã</Text>
                </View>

                {/* Radio check */}
                {addOption === 'JOIN' ? (
                  <View style={styles.radioCheckActive}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.5}>
                      <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                ) : (
                  <View style={styles.radioCheckInactive} />
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Action: Tiếp Tục */}
            <View style={styles.sheetButtonWrap}>
              <TouchableOpacity
                style={styles.sheetContinueButton}
                activeOpacity={0.9}
                onPress={() => {
                  setShowAddSheet(false);
                  if (addOption === 'CREATE') {
                    setCurrentView('CREATE_CLASS');
                  } else {
                    setCurrentView('JOIN_BY_CODE');
                  }
                }}
              >
                <Text style={styles.sheetContinueText}>Tiếp Tục</Text>
              </TouchableOpacity>

              {/* iOS Home Indicator */}
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
  bgSvgContainer: {
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 48,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C192C',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  capGraphicWrapper: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* White Bento Card List */
  classesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 3,
    marginBottom: 14,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  classIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  classInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  className: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C192C',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  classStudents: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6880',
  },
  roleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    maxWidth: 195,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#554339',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C192C',
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 2,
  },

  /* Fixed Bottom Bar */
  bottomBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: 'rgba(255, 243, 230, 0.95)',
    alignItems: 'center',
  },
  heroActionButton: {
    width: '100%',
    height: 50,
    borderRadius: 9999,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 4,
  },
  heroButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#1C192C',
    borderRadius: 3,
    marginTop: 10,
    opacity: 0.7,
  },

  /* Bottom Sheet Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 43, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#1C192B',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 40,
    elevation: 10,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetHandle: {
    width: 44,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(160, 157, 174, 0.35)',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C192B',
    letterSpacing: -0.2,
    marginBottom: 18,
  },
  sheetCardsWrap: {
    gap: 12,
    marginBottom: 20,
  },
  selectCard: {
    height: 96,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectCardActive: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1.5,
    borderColor: '#F58F4C',
  },
  selectCardInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE6EB',
  },
  selectCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  selectCardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C192B',
    letterSpacing: -0.2,
  },
  radioCheckActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCheckInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DBC1B4',
    backgroundColor: '#FFFFFF',
  },
  sheetButtonWrap: {
    alignItems: 'center',
  },
  sheetContinueButton: {
    width: '100%',
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C192B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  sheetContinueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetHomeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: 'rgba(28, 25, 43, 0.25)',
    borderRadius: 2,
    marginTop: 14,
  },

  /* Form Screen Styles (TEA-11.3 & TEA-11.4) */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    gap: 16,
  },
  formItem: {
    gap: 8,
  },
  inputBox: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(220, 210, 200, 0.65)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    color: '#1C192C',
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
  },
  gradeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  levelPill: {
    flex: 1,
    height: 44,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  gradePill: {
    flex: 1,
    height: 44,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradePillActive: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1.5,
    borderColor: '#F58F4C',
  },
  gradePillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(220, 210, 200, 0.65)',
  },
  gradePillText: {
    fontSize: 15,
  },
  gradePillTextActive: {
    fontWeight: '700',
    color: '#F58F4C',
  },
  gradePillTextInactive: {
    fontWeight: '600',
    color: '#6B6880',
  },
  schoolYearBox: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(220, 210, 200, 0.65)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  schoolYearText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C192C',
    flex: 1,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#554339',
    flex: 1,
    lineHeight: 16,
  },

  /* TEA-11.4 Styles */
  codeBoxWrapper: {
    width: '100%',
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(220, 210, 200, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  codeInput: {
    width: '100%',
    fontSize: 22,
    fontWeight: '800',
    color: '#1C192C',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subjectModule: {
    gap: 8,
  },
  subjectGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChipProfile: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFFBF7',
  },
  profileBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F58F4C',
    marginRight: -2,
  },
  subjectRow: {
    flexDirection: 'row',
    gap: 10,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  subjectChipActive: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1.5,
    borderColor: '#F58F4C',
  },
  subjectChipInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(220, 210, 200, 0.65)',
  },
  subjectChipText: {
    fontSize: 15,
  },
  subjectChipTextActive: {
    fontWeight: '700',
    color: '#F58F4C',
  },
  subjectChipTextInactive: {
    fontWeight: '500',
    color: '#6B6880',
  },
  noteBanner: {
    backgroundColor: '#F7F1FF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  noteBannerText: {
    fontSize: 13,
    color: '#554339',
    lineHeight: 18,
    flex: 1,
  },
});
