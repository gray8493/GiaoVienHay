import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Polygon,
  Rect,
  Line,
  G,
  Polyline,
} from 'react-native-svg';
import { classService, MyClassItem } from '../services/class.service';
import { attendanceService } from '../services/attendance.service';
import { feesService, ClassFeesSummary } from '../services/fees.service';
import { remarksService, ExamReminderItem, StudentRemarkItem } from '../services/remarks.service';
import { authService } from '../services/auth.service';

export interface ClassOption {
  id: string;
  name: string;
  studentsCount: number;
  room: string;
  roleType: 'HOMEROOM' | 'SUBJECT';
  subjectBadge: string;
  nextLessonTitle: string;
  nextLessonTime: string;
  ctaText: string;
}

export const TEACHER_CLASSES: ClassOption[] = [];

interface TeacherHomeScreenProps {
  currentClassId?: string;
  hasNoClass?: boolean;
  onSelectClass?: (classId: string, className?: string) => void;
  onEnterClassroom?: () => void;
  onOpenAIQuiz?: () => void;
  onOpenWheel?: () => void;
  onManageClass?: () => void;
  onOpenHealthInsurance?: () => void;
  onOpenRemarksExam?: (initialTab?: 'REMARKS' | 'EXAMS') => void;
  onOpenNotifications?: () => void;
  onTabChange?: (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => void;
}

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  currentClassId = '',
  hasNoClass = false,
  onSelectClass,
  onEnterClassroom,
  onOpenAIQuiz,
  onOpenWheel,
  onManageClass,
  onOpenHealthInsurance,
  onOpenRemarksExam,
  onOpenNotifications,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance' | 'gradebook' | 'profile'>('schedule');
  const [internalClassId, setInternalClassId] = useState<string>(currentClassId);
  const [isClassSheetVisible, setIsClassSheetVisible] = useState<boolean>(false);

  // Dynamic Dashboard States from Backend
  const [teacherName, setTeacherName] = useState<string>(() => authService.getUser()?.full_name || 'Thầy/Cô');
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<{ presentCount: number; totalCount: number }>({ presentCount: 0, totalCount: 0 });
  const [feesSummary, setFeesSummary] = useState<ClassFeesSummary | null>(null);
  const [examReminders, setExamReminders] = useState<ExamReminderItem[]>([]);
  const [remarksList, setRemarksList] = useState<StudentRemarkItem[]>([]);

  // Modal Tạo Lớp / Vào Lớp cho trạng thái TEA-01.empty
  const [createClassModalVisible, setCreateClassModalVisible] = useState(false);
  const [joinClassModalVisible, setJoinClassModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('6');
  const [newClassYear, setNewClassYear] = useState('2026-2027');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClassId = internalClassId || currentClassId;
  const isNoClassState = hasNoClass || selectedClassId === 'cls_empty' || (!selectedClassId && classesList.length === 0) || classesList.length === 0;
  const currentClass =
    classesList.find((c) => c.id === selectedClassId) ||
    classesList[0] || {
      id: 'cls_empty',
      name: 'Chưa có lớp',
      studentsCount: 0,
      room: '',
      roleType: 'HOMEROOM' as const,
      subjectBadge: '',
      nextLessonTitle: '',
      nextLessonTime: '',
      ctaText: 'Tạo Lớp',
    };
  const isHomeroom = currentClass.roleType === 'HOMEROOM';

  useEffect(() => {
    if (currentClassId && currentClassId !== 'cls_empty') {
      setInternalClassId(currentClassId);
    }
  }, [currentClassId]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedClassId !== 'cls_empty') {
      loadClassDashboard(selectedClassId);
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    try {
      await authService.ensureToken();
      const user = authService.getUser();
      if (user && user.full_name) {
        setTeacherName(user.full_name);
      }
      const cls = await classService.getMyClasses();
      if (Array.isArray(cls)) {
        if (cls.length > 0) {
          const mapped: ClassOption[] = cls.map((c, idx) => ({
            id: c.id,
            name: c.name.startsWith('Lớp ') ? c.name : `Lớp ${c.name}`,
            studentsCount: typeof c.student_count === 'number' ? c.student_count : 0,
            room: c.school_name ? c.school_name : (c.grade_level ? `Khối ${c.grade_level}` : ''),
            roleType: c.role_type || (idx === 0 ? 'HOMEROOM' : 'SUBJECT'),
            subjectBadge: c.subject_name || (c.role_type === 'HOMEROOM' ? 'Chủ nhiệm' : 'Bộ môn'),
            nextLessonTitle: `${c.name} - Tiết ${idx + 1}`,
            nextLessonTime: '08:00 – 08:45',
            ctaText: c.role_type === 'HOMEROOM' ? 'Vào Lớp' : 'Dò Bài',
          }));
          setClassesList(mapped);
          if (mapped[0] && (!currentClassId || currentClassId === 'cls_empty' || currentClassId === 'cls_6a1' || !mapped.some(m => m.id === currentClassId))) {
            setInternalClassId(mapped[0].id);
            onSelectClass?.(mapped[0].id, mapped[0].name);
          }
        } else {
          setClassesList([]);
          setInternalClassId('cls_empty');
        }
      }
    } catch (e) {
      console.warn('Error fetching classes:', e);
    }
  };

  const loadClassDashboard = async (clsId: string) => {
    try {
      attendanceService.getTodayPresentStudents(clsId).then((res: any) => {
        if (res) {
          const tot = currentClass.studentsCount || (res.present_students?.length) || 0;
          const pres = typeof res.total_present === 'number' ? res.total_present : (res.present_students?.length || 0);
          setAttendanceStats({
            presentCount: Math.min(pres, tot > 0 ? tot : pres),
            totalCount: tot,
          });
        }
      }).catch(() => null);

      feesService.getClassFeesList(clsId).then((res: any) => {
        if (res) setFeesSummary(res);
      }).catch(() => null);

      remarksService.getClassExamReminders(clsId).then((res: any) => {
        if (res && res.length > 0) setExamReminders(res);
      }).catch(() => null);

      remarksService.getClassRemarks(clsId).then((res: any) => {
        if (res && res.length > 0) setRemarksList(res);
      }).catch(() => null);
    } catch (e) {
      console.warn('Error loading real dashboard data:', e);
    }
  };

  const handleTabPress = (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => {
    if ((tab === 'attendance' || tab === 'gradebook') && isNoClassState) {
      Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
      return;
    }
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleChooseClass = (classItem: ClassOption) => {
    setInternalClassId(classItem.id);
    onSelectClass?.(classItem.id, classItem.name);
    setIsClassSheetVisible(false);
  };

  const handleHeroCta = () => {
    if (isHomeroom) {
      onEnterClassroom?.();
    } else {
      // GVBM: Vào lớp & dò bài cũ trực tiếp bằng Vòng quay gọi tên
      onOpenWheel?.();
    }
  };

  const handleCreateClassSubmit = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên lớp học (ví dụ: 6A1)');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await classService.createClass({
        name: newClassName.trim(),
        grade_level: parseInt(newClassGrade, 10) || 6,
        academic_year: newClassYear,
      });
      setCreateClassModalVisible(false);
      setNewClassName('');
      Alert.alert('Thành công', `Đã tạo lớp ${created.name || newClassName} thành công!`);
      if (created?.id) {
        setInternalClassId(created.id);
        onSelectClass?.(created.id);
      }
      await loadClasses();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo lớp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinClassSubmit = async () => {
    if (!joinInviteCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã mời tham gia lớp học');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await classService.joinClass(joinInviteCode.trim());
      setJoinClassModalVisible(false);
      setJoinInviteCode('');
      Alert.alert('Thành công', 'Đã tham gia lớp học thành công!');
      await loadClasses();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Mã mời không hợp lệ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isNoClassState) {
    return (
      <View style={styles.container}>
        {/* Background Peach Linear Gradient */}
        <LinearGradient
          colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
          locations={[0, 0.38, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Decorative Swirls */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
            <Path d="M-40 180 C80 120, 260 220, 420 140" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" strokeDasharray="8 8" opacity={0.3} />
            <Path d="M-20 620 C110 540, 280 660, 410 570" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" strokeDasharray="10 10" opacity={0.3} />
          </Svg>
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* Header Section (TEA-01 style: avatar + "Xin chào," + "Cô Nguyễn Thu Hà" + bell, no class pill) */}
          <View style={[styles.header, { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }]}>
            <View style={styles.teacherInfoWrap}>
              <View style={styles.avatarBorderRing}>
                <View style={styles.avatarContainer}>
                  <Svg width={44} height={44} viewBox="0 0 64 64" fill="none">
                    <Circle cx="32" cy="32" r="32" fill="#FEEAD8" />
                    <Path d="M32 35C24.8 35 19 40.8 19 48V56H45V48C45 40.8 39.2 35 32 35Z" fill="#5E5CE6" />
                    <Circle cx="32" cy="24" r="10" fill="#FDBC87" />
                    <Path
                      d="M22 23C22 17 26 13 32 13C38 13 42 17 42 23C42 25 39 26 39 26C39 26 38 29 36 29C34 29 32 28 32 28C32 28 30 29 28 29C26 29 25 26 25 26C25 26 22 25 22 23Z"
                      fill="#4B2C20"
                    />
                    <Circle cx="28.5" cy="24.5" r="1.5" fill="#333322" />
                    <Circle cx="35.5" cy="24.5" r="1.5" fill="#333322" />
                    <Path d="M30 28C30.8 29 33.2 29 34 28" stroke="#D97706" strokeWidth={1.2} strokeLinecap="round" />
                    <Circle cx="28" cy="24" r="3.2" stroke="#4F46E5" strokeWidth={1.1} fill="none" />
                    <Circle cx="36" cy="24" r="3.2" stroke="#4F46E5" strokeWidth={1.1} fill="none" />
                    <Path d="M31.2 24H32.8" stroke="#4F46E5" strokeWidth={1.1} />
                  </Svg>
                </View>
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingSubtitle}>Xin chào,</Text>
                <Text style={styles.greetingTeacherName}>{teacherName}</Text>
              </View>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.notificationBtn}
              activeOpacity={0.8}
              onPress={onOpenNotifications}
              accessibilityLabel="Thông báo"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2}>
                <Path
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <View style={styles.notificationAlertDot} />
            </TouchableOpacity>
          </View>

          {/* Centered Empty State Main Content */}
          <View style={styles.emptyMainContent}>
            {/* 3D Pastel Claymation School Building */}
            <View style={styles.emptyIllustrationWrap}>
              <View style={styles.emptyIllustrationGlow} />
              <Image
                source={require('../../assets/empty_classroom_3d.jpg')}
                style={styles.emptyIllustrationImage}
                resizeMode="contain"
              />
            </View>

            {/* Title: "Chưa Có Lớp" (20px bold, centered) */}
            <Text style={styles.emptyTitle}>Chưa Có Lớp</Text>

            {/* Action Buttons Container */}
            <View style={styles.emptyButtonsContainer}>
              {/* Full-width Orange Pill Primary Button: "Tạo Lớp" */}
              <TouchableOpacity
                style={styles.emptyPrimaryBtn}
                onPress={() => setCreateClassModalVisible(true)}
                activeOpacity={0.88}
              >
                <Text style={styles.emptyPrimaryBtnText}>Tạo Lớp</Text>
              </TouchableOpacity>

              {/* Outlined Orange Pill Button: "Vào Lớp Bằng Mã" */}
              <TouchableOpacity
                style={styles.emptyOutlinedBtn}
                onPress={() => setJoinClassModalVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyOutlinedBtnText}>Vào Lớp Bằng Mã</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Floating Dark Dock Bar */}
          <View style={styles.dockWrapper} pointerEvents="box-none">
            <View style={styles.dockBar}>
              <TouchableOpacity style={styles.dockTabItem} activeOpacity={0.8} onPress={() => handleTabPress('schedule')}>
                <View style={styles.dockActiveIconWrap}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                    <Path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.dockTabTextActive}>Lịch dạy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dockTabItem} activeOpacity={0.8} onPress={() => handleTabPress('attendance')}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                  <Path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.dockTabTextInactive}>Điểm danh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dockTabItem} activeOpacity={0.8} onPress={() => handleTabPress('gradebook')}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                  <Path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.dockTabTextInactive}>Sổ điểm</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dockTabItem} activeOpacity={0.8} onPress={() => handleTabPress('profile')}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                  <Path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.dockTabTextInactive}>Cá nhân</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Modal Tạo Lớp */}
        <Modal
          visible={createClassModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCreateClassModalVisible(false)}
        >
          <View style={styles.sheetOverlay}>
            <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setCreateClassModalVisible(false)} />
            <View style={styles.dialogSheetBox}>
              <View style={styles.dragHandle} />
              <Text style={styles.dialogSheetTitle}>Tạo Lớp Học Mới</Text>
              <View style={{ gap: 12, marginBottom: 16 }}>
                <TextInput
                  style={styles.dialogInput}
                  placeholder="Tên lớp (ví dụ: 6A1, 7A2)"
                  placeholderTextColor="#9D9AA8"
                  value={newClassName}
                  onChangeText={setNewClassName}
                />
                <TextInput
                  style={styles.dialogInput}
                  placeholder="Khối lớp (ví dụ: 6)"
                  placeholderTextColor="#9D9AA8"
                  keyboardType="numeric"
                  value={newClassGrade}
                  onChangeText={setNewClassGrade}
                />
                <TextInput
                  style={styles.dialogInput}
                  placeholder="Năm học (ví dụ: 2026-2027)"
                  placeholderTextColor="#9D9AA8"
                  value={newClassYear}
                  onChangeText={setNewClassYear}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={styles.dialogCancelBtn} onPress={() => setCreateClassModalVisible(false)}>
                  <Text style={styles.dialogCancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dialogPrimaryBtn} onPress={handleCreateClassSubmit} disabled={isSubmitting}>
                  <Text style={styles.dialogPrimaryBtnText}>{isSubmitting ? 'Đang tạo...' : 'Tạo Lớp'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Vào Lớp Bằng Mã */}
        <Modal
          visible={joinClassModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setJoinClassModalVisible(false)}
        >
          <View style={styles.sheetOverlay}>
            <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setJoinClassModalVisible(false)} />
            <View style={styles.dialogSheetBox}>
              <View style={styles.dragHandle} />
              <Text style={styles.dialogSheetTitle}>Vào Lớp Bằng Mã</Text>
              <Text style={styles.dialogSheetSubtitle}>Nhập mã mời được cung cấp bởi Giáo viên chủ nhiệm</Text>
              <TextInput
                style={[styles.dialogInput, { marginBottom: 16 }]}
                placeholder="Mã mời (ví dụ: INV-6A1-9821 hoặc TCH-6A1-4417)"
                placeholderTextColor="#9D9AA8"
                autoCapitalize="characters"
                value={joinInviteCode}
                onChangeText={setJoinInviteCode}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={styles.dialogCancelBtn} onPress={() => setJoinClassModalVisible(false)}>
                  <Text style={styles.dialogCancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dialogPrimaryBtn} onPress={handleJoinClassSubmit} disabled={isSubmitting}>
                  <Text style={styles.dialogPrimaryBtnText}>{isSubmitting ? 'Đang vào...' : 'Vào Lớp'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Peach Linear Gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Sparkles & Doodles */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={styles.starTopRight}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="#FDE68A" opacity={0.35}>
            <Path d="M12 0L14.5 8.5L23.5 11L14.5 13.5L12 22L9.5 13.5L0.5 11L9.5 8.5z" />
          </Svg>
        </View>

        <View style={styles.starMidLeft}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="#FFFFFF" opacity={0.3}>
            <Path d="M12 0L14.5 8.5L23.5 11L14.5 13.5L12 22L9.5 13.5L0.5 11L9.5 8.5z" />
          </Svg>
        </View>

        <View style={styles.starBottomRight}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="#FEF3C7" opacity={0.4}>
            <Path d="M12 0L14.5 8.5L23.5 11L14.5 13.5L12 22L9.5 13.5L0.5 11L9.5 8.5z" />
          </Svg>
        </View>

        <View style={styles.curvedDoodle}>
          <Svg width={160} height={160} viewBox="0 0 100 100" fill="none">
            <Path
              d="M10,20 Q60,10 80,60 T10,95"
              stroke="#FFFFFF"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.25}
            />
          </Svg>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= 1. HEADER SECTION ================= */}
          <View style={styles.header}>
            {/* Teacher Profile & Greeting */}
            <View style={styles.teacherInfoWrap}>
              <View style={styles.avatarBorderRing}>
                <View style={styles.avatarContainer}>
                  <Svg width={44} height={44} viewBox="0 0 64 64" fill="none">
                    <Circle cx="32" cy="32" r="32" fill="#FEEAD8" />
                    <Path d="M32 35C24.8 35 19 40.8 19 48V56H45V48C45 40.8 39.2 35 32 35Z" fill="#5E5CE6" />
                    <Circle cx="32" cy="24" r="10" fill="#FDBC87" />
                    <Path
                      d="M22 23C22 17 26 13 32 13C38 13 42 17 42 23C42 25 39 26 39 26C39 26 38 29 36 29C34 29 32 28 32 28C32 28 30 29 28 29C26 29 25 26 25 26C25 26 22 25 22 23Z"
                      fill="#4B2C20"
                    />
                    <Circle cx="28.5" cy="24.5" r="1.5" fill="#333322" />
                    <Circle cx="35.5" cy="24.5" r="1.5" fill="#333322" />
                    <Path d="M30 28C30.8 29 33.2 29 34 28" stroke="#D97706" strokeWidth={1.2} strokeLinecap="round" />
                    <Circle cx="28" cy="24" r="3.2" stroke="#4F46E5" strokeWidth={1.1} fill="none" />
                    <Circle cx="36" cy="24" r="3.2" stroke="#4F46E5" strokeWidth={1.1} fill="none" />
                    <Path d="M31.2 24H32.8" stroke="#4F46E5" strokeWidth={1.1} />
                  </Svg>
                </View>
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingSubtitle}>Xin chào,</Text>
                <Text style={styles.greetingTeacherName} numberOfLines={1} ellipsizeMode="tail">
                  {teacherName}
                </Text>
              </View>
            </View>

            {/* Badges & Notification Bell */}
            <View style={styles.headerRightActions}>
              {/* Class Switcher Dropdown Button */}
              <TouchableOpacity
                style={styles.gvcnBadge}
                activeOpacity={0.8}
                onPress={() => setIsClassSheetVisible(true)}
              >
                <Text style={styles.gvcnBadgeText} numberOfLines={1}>
                  {isHomeroom ? `GVCN ${currentClass.name.replace('Lớp ', '')}` : `GVBM ${currentClass.name.replace('Lớp ', '')}`}
                </Text>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2}>
                  <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>

              {/* Notification Button */}
              <TouchableOpacity
                style={styles.notificationBtn}
                activeOpacity={0.8}
                onPress={onOpenNotifications}
                accessibilityLabel="Thông báo"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2}>
                  <Path
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <View style={styles.notificationAlertDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 2. HERO CARD (NEXT LESSON) ================= */}
          <View style={styles.heroCard}>
            {/* Background Glows */}
            <View style={styles.heroGlowBottomRight} />
            <View style={styles.heroGlowTopLeft} />

            {/* 3D Cute School Theme Illustration placed top-right */}
            <View style={styles.heroIllustrationContainer} pointerEvents="none">
              <Svg width={85} height={85} viewBox="0 0 120 120" fill="none">
                <G rotation="-6" origin="60, 60">
                  <Polygon points="60,20 102,40 60,60 18,40" fill="#F58F4C" />
                  <Polygon points="60,24 96,40 60,56 24,40" fill="#FFCFA3" />
                  <Path d="M35 48 C35 72 85 72 85 48 Z" fill="#D97706" />
                  <Circle cx="60" cy="40" r={3.5} fill="#FFFFFF" />
                  <Path d="M60 40 Q84 48 88 66" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
                  <Polygon points="85,65 91,65 89,78 87,78" fill="#F58F4C" />
                  <G transform="translate(14, 52) rotate(35)">
                    <Rect x={0} y={0} width={46} height={14} rx={3} fill="#FFFFFF" fillOpacity={0.95} />
                    <Line x1={8} y1={0} x2={8} y2={6} stroke="#F58F4C" strokeWidth={1.5} />
                    <Line x1={16} y1={0} x2={16} y2={4} stroke="#F58F4C" strokeWidth={1.5} />
                    <Line x1={24} y1={0} x2={24} y2={6} stroke="#F58F4C" strokeWidth={1.5} />
                    <Line x1={32} y1={0} x2={32} y2={4} stroke="#F58F4C" strokeWidth={1.5} />
                    <Line x1={40} y1={0} x2={40} y2={6} stroke="#F58F4C" strokeWidth={1.5} />
                  </G>
                  <Path d="M96 24L98 30L104 32L98 34L96 40L94 34L88 32L94 30Z" fill="#FFF3E6" />
                </G>
              </Svg>
            </View>

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <View style={styles.heroTagPill}>
                <Text style={styles.heroTagText}>TIẾT DẠY TIẾP THEO</Text>
              </View>

              <Text style={styles.heroTitle} numberOfLines={2}>
                {currentClass.nextLessonTitle}
              </Text>

              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaItem}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2}>
                    <Circle cx={12} cy={12} r={10} />
                    <Path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.heroMetaText}>{currentClass.nextLessonTime}</Text>
                </View>
                <Text style={styles.heroMetaSeparator}>•</Text>
                <View style={styles.heroMetaItem}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2}>
                    <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.heroMetaText}>{currentClass.room}</Text>
                </View>
              </View>

              {/* Quick Action CTA Button */}
              <TouchableOpacity
                style={styles.heroCtaBtn}
                onPress={handleHeroCta}
                activeOpacity={0.85}
              >
                <Text style={styles.heroCtaBtnText}>{currentClass.ctaText}</Text>
                <View style={styles.heroCtaArrowCircle}>
                  <Text style={styles.heroCtaArrowText}>→</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 3. QUICK STATS BENTO GRID ================= */}
          {/* GVCN: 6 ô (gồm Sĩ số & BHYT) | GVBM: 4 ô 2x2 (Trợ giảng AI, Dò bài cũ, Nhận xét HS, Lịch kiểm tra) */}
          <View style={styles.bentoGrid}>
            {isHomeroom ? (
              <>
                {/* Row 1: Sĩ số 6A1 & Trợ giảng AI */}
                <View style={styles.bentoRow}>
                  {/* Card 1: Sĩ số 6A1 */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={onManageClass || onEnterClassroom}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 20 20" fill="#F58F4C">
                          <Path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Sĩ số {currentClass.name.replace('Lớp ', '')}</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoPrimaryValue}>
                        {attendanceStats.totalCount > 0 ? `${attendanceStats.presentCount}/${attendanceStats.totalCount}` : '0/0'}
                      </Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                          <View style={styles.pulsingGreenDot} />
                          <Text style={[styles.statusBadgeText, { color: '#059669' }]}>
                            {attendanceStats.totalCount > 0
                              ? `Có mặt ${Math.round((attendanceStats.presentCount / attendanceStats.totalCount) * 100)}%`
                              : 'Chưa có HS'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Card 2: Trợ giảng AI */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={onOpenAIQuiz}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#5E5CE6" strokeWidth={2}>
                          <Path
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Trợ giảng AI</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoSubtitleText} numberOfLines={1}>Soạn đề bài mới</Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#5E5CE6' }]}>Tạo nhanh ✨</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Row 2: Dò bài cũ & BHYT Lớp CN */}
                <View style={styles.bentoRow}>
                  {/* Card 3: Dò bài cũ */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={onOpenWheel}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Circle cx={12} cy={12} r={9} />
                          <Path d="M12 3v9l6 3" strokeLinecap="round" strokeLinejoin="round" />
                          <Path d="M9 12a3 3 0 116 0 3 3 0 01-6 0z" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Dò bài cũ</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoSubtitleText} numberOfLines={1}>Vòng quay gọi tên</Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#6B6880' }]}>Ngẫu nhiên 🎲</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Card 4: BHYT Lớp CN */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={onOpenHealthInsurance}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Path
                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>BHYT Lớp CN</Text>
                    </View>

                    <View>
                      <View style={styles.bhytValueRow}>
                        <Text style={styles.bhytNumerator}>
                          {feesSummary ? `${feesSummary.insurance_paid_count}/${feesSummary.total_students}` : currentClass.studentsCount > 0 ? `0/${currentClass.studentsCount}` : '0/0'}
                        </Text>
                        <Text style={styles.bhytStatusLabel}>Đã nộp</Text>
                      </View>
                      <View style={styles.bhytProgressBarTrack}>
                        <View
                          style={[
                            styles.bhytProgressBarFill,
                            { width: `${feesSummary ? feesSummary.insurance_percent : 0}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Row 3: Nhận xét HS & Lịch kiểm tra */}
                <View style={styles.bentoRow}>
                  {/* Card 5: Nhận xét HS */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={() => onOpenRemarksExam?.('REMARKS')}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Nhận xét HS</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoSubtitleText} numberOfLines={1}>Gửi phụ huynh</Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#6B6880' }]}>
                            {remarksList.length > 0 ? `${remarksList.length} lời nhắn 💬` : 'Chưa có lời nhắn 💬'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Card 6: Lịch kiểm tra */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={() => onOpenRemarksExam?.('EXAMS')}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Lịch kiểm tra</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoSubtitleText} numberOfLines={1}>
                        {examReminders[0]?.subject_name || 'Dặn dò ôn thi'}
                      </Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#6B6880' }]}>
                            {examReminders.length > 0 && examReminders[0].exam_date
                              ? (() => {
                                  try {
                                    const parts = examReminders[0].exam_date.split('-');
                                    if (parts.length === 3) return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)} 📅`;
                                  } catch (e) {}
                                  return `${examReminders[0].exam_date} 📅`;
                                })()
                              : examReminders.length > 0
                              ? `${examReminders.length} sắp tới 📅`
                              : 'Chưa có lịch 📅'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* GVBM Bento Grid: 2x2 đúng chuẩn HTML TEA-01.GVBM */
              <>
                {/* Row 1: Trợ giảng AI & Dò bài cũ */}
                <View style={styles.bentoRow}>
                  {/* Card 1: Trợ giảng AI */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={onOpenAIQuiz}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Path
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Trợ giảng AI</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoSubtitleText} numberOfLines={1}>Soạn đề bài mới</Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#6B6880' }]}>Tạo nhanh</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Card 2: Dò bài cũ */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={onOpenWheel}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Circle cx={12} cy={12} r={9} />
                          <Path d="M12 3v9l6 3" strokeLinecap="round" strokeLinejoin="round" />
                          <Path d="M9 12a3 3 0 116 0 3 3 0 01-6 0z" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Dò bài cũ</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoSubtitleText} numberOfLines={1}>Vòng quay gọi tên</Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#6B6880' }]}>Ngẫu nhiên</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Row 2: Nhận xét HS & Lịch kiểm tra */}
                <View style={styles.bentoRow}>
                  {/* Card 3: Nhận xét HS */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={() => onOpenRemarksExam?.('REMARKS')}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Nhận xét HS</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoSubtitleText} numberOfLines={1}>Gửi phụ huynh</Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#6B6880' }]}>
                            {remarksList.length > 0 ? `${remarksList.length} lời nhắn` : 'Chưa có lời nhắn'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Card 4: Lịch kiểm tra */}
                  <TouchableOpacity
                    style={styles.bentoCard}
                    onPress={() => onOpenRemarksExam?.('EXAMS')}
                    activeOpacity={0.88}
                  >
                    <View style={styles.bentoCardHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={styles.bentoLabel}>Lịch kiểm tra</Text>
                    </View>

                    <View>
                      <Text style={styles.bentoSubtitleText} numberOfLines={1}>
                        {examReminders[0]?.subject_name || 'Dặn dò ôn thi'}
                      </Text>
                      <View style={styles.bentoTagWrapper}>
                        <View style={[styles.statusBadge, { backgroundColor: '#FFF1E6', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#6B6880' }]}>
                            {examReminders.length > 0 && examReminders[0].exam_date
                              ? (() => {
                                  try {
                                    const parts = examReminders[0].exam_date.split('-');
                                    if (parts.length === 3) return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
                                  } catch (e) {}
                                  return examReminders[0].exam_date;
                                })()
                              : 'Chưa có lịch'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* ================= 4. DAILY TIMELINE SECTION ================= */}
          <View style={styles.timelineSection}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineTitleText}>Lịch dạy còn lại hôm nay</Text>
              <View style={styles.timelineCountBadge}>
                <Text style={styles.timelineCountBadgeText}>
                  {classesList.filter((c) => c.id !== selectedClassId).length > 0
                    ? `${classesList.filter((c) => c.id !== selectedClassId).length} tiết`
                    : '1 tiết'}
                </Text>
              </View>
            </View>

            {/* Vertical Timeline Items matching Stitch AI */}
            <View style={styles.timelineList}>
              <View style={styles.timelineVerticalLine} />

              {classesList.filter((c) => c.id !== selectedClassId).length > 0 ? (
                classesList
                  .filter((c) => c.id !== selectedClassId)
                  .map((clsItem, idx) => (
                    <TouchableOpacity
                      key={clsItem.id}
                      style={styles.timelineItem}
                      activeOpacity={0.88}
                      onPress={() => handleChooseClass(clsItem)}
                    >
                      <View style={idx === 0 ? styles.indicatorDotUpcoming : styles.indicatorDotPending} />
                      <View style={styles.timelineCard}>
                        <View style={styles.timelineCardContent}>
                          <Text style={styles.timelineLessonTitle}>
                            Tiết {idx + 3}: {clsItem.subjectBadge} – {clsItem.name.replace('Lớp ', '')}
                          </Text>
                          <View style={styles.timelineMetaRow}>
                            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}>
                              <Circle cx={12} cy={12} r={10} />
                              <Path d="M12 6v6l3 2" />
                            </Svg>
                            <Text style={styles.timelineMetaText}>
                              {idx === 0 ? '09:15 – 10:00' : '10:15 – 11:00'}
                            </Text>
                            <Text style={styles.timelineMetaDot}>•</Text>
                            <Text style={styles.timelineMetaText}>
                              {clsItem.room}
                            </Text>
                          </View>
                        </View>
                        <View style={idx === 0 ? styles.upcomingBadge : styles.pendingBadge}>
                          <Text style={idx === 0 ? styles.upcomingBadgeText : styles.pendingBadgeText}>
                            {idx === 0 ? 'Sắp tới' : 'Chưa dạy'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
              ) : (
                <View style={styles.timelineItem}>
                  <View style={styles.indicatorDotUpcoming} />
                  <View style={styles.timelineCard}>
                    <View style={styles.timelineCardContent}>
                      <Text style={styles.timelineLessonTitle}>
                        {examReminders[0]?.exam_type
                          ? `${examReminders[0].exam_type} – ${examReminders[0].subject_name}`
                          : `${currentClass.name} – Ôn tập kiến thức`}
                      </Text>
                      <View style={styles.timelineMetaRow}>
                        <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}>
                          <Circle cx={12} cy={12} r={10} />
                          <Path d="M12 6v6l3 2" />
                        </Svg>
                        <Text style={styles.timelineMetaText}>
                          {examReminders[0]?.exam_date ? `Ngày ${examReminders[0].exam_date}` : '09:15 – 10:00'}
                        </Text>
                        <Text style={styles.timelineMetaDot}>•</Text>
                        <Text style={styles.timelineMetaText}>
                          {currentClass.room}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.upcomingBadge}>
                      <Text style={styles.upcomingBadgeText}>Sắp tới</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* ================= 5. FLOATING BOTTOM DOCK ================= */}
        <View style={styles.dockWrapper} pointerEvents="box-none">
          <View style={styles.dockBar}>
            {/* Tab 1: Lịch dạy (Active) */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => handleTabPress('schedule')}
              activeOpacity={0.8}
            >
              <View style={styles.dockActiveIconWrap}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                  <Path
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.dockTabTextActive}>Lịch dạy</Text>
            </TouchableOpacity>

            {/* Tab 2: Điểm danh (GVCN) hoặc Dò bài (GVBM) */}
            {isHomeroom ? (
              <TouchableOpacity
                style={styles.dockTabItem}
                onPress={() => handleTabPress('attendance')}
                activeOpacity={0.8}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'attendance' ? '#FFFFFF' : '#94A3B8'} strokeWidth={2}>
                  <Path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={[styles.dockTabText, activeTab === 'attendance' ? styles.dockTabTextActive : styles.dockTabTextInactive]}>
                  Điểm danh
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.dockTabItem}
                onPress={() => {
                  if (isNoClassState) {
                    Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                    return;
                  }
                  if (onOpenWheel) onOpenWheel();
                  else handleTabPress('attendance');
                }}
                activeOpacity={0.8}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                  <Rect x={4} y={4} width={16} height={16} rx={2} stroke="#94A3B8" strokeWidth={2} />
                  <Circle cx={8.5} cy={8.5} r={1.2} fill="#94A3B8" />
                  <Circle cx={15.5} cy={8.5} r={1.2} fill="#94A3B8" />
                  <Circle cx={12} cy={12} r={1.2} fill="#94A3B8" />
                  <Circle cx={8.5} cy={15.5} r={1.2} fill="#94A3B8" />
                  <Circle cx={15.5} cy={15.5} r={1.2} fill="#94A3B8" />
                </Svg>
                <Text style={[styles.dockTabText, styles.dockTabTextInactive]}>
                  Dò bài
                </Text>
              </TouchableOpacity>
            )}

            {/* Tab 3: Sổ điểm */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => handleTabPress('gradebook')}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'gradebook' ? '#FFFFFF' : '#94A3B8'} strokeWidth={2}>
                <Path
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.dockTabText, activeTab === 'gradebook' ? styles.dockTabTextActive : styles.dockTabTextInactive]}>
                Sổ điểm
              </Text>
            </TouchableOpacity>

            {/* Tab 4: Cá nhân */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => handleTabPress('profile')}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'profile' ? '#FFFFFF' : '#94A3B8'} strokeWidth={2}>
                <Path
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.dockTabText, activeTab === 'profile' ? styles.dockTabTextActive : styles.dockTabTextInactive]}>
                Cá nhân
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ================= 6. TEA-01.BS: BOTTOM SHEET CHỌN LỚP ================= */}
      <Modal
        visible={isClassSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsClassSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsClassSheetVisible(false)}>
            <View style={styles.sheetBackdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.sheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
            </View>

            {/* Sheet Header: Title & Close Button */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chọn Lớp</Text>
              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setIsClassSheetVisible(false)}
                activeOpacity={0.8}
                accessibilityLabel="Đóng"
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2.4}>
                  <Path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Classes Card with dynamic classes list */}
            <View style={styles.classesCard}>
              {classesList.map((item, index) => {
                const isSelected = item.id === selectedClassId;
                const isFirst = index === 0;
                const isLast = index === classesList.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.classRow,
                      isSelected && styles.classRowSelected,
                      isFirst && styles.classRowFirst,
                      isLast && styles.classRowLast,
                      index > 0 && styles.classRowDivider,
                    ]}
                    onPress={() => handleChooseClass(item)}
                    activeOpacity={0.85}
                  >
                    {/* Left: Icon Tile + Class Info */}
                    <View style={styles.classRowLeft}>
                      {/* Icon Tile */}
                      <View
                        style={[
                          styles.classIconTile,
                          isSelected ? styles.classIconTileSelected : styles.classIconTileNormal,
                        ]}
                      >
                        {item.roleType === 'HOMEROOM' ? (
                          /* Users Icon */
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <Circle cx={9} cy={7} r={4} />
                            <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </Svg>
                        ) : (
                          /* Subject / Monitor Icon */
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <Rect x={2} y={3} width={20} height={14} rx={2} ry={2} />
                            <Line x1={8} y1={21} x2={16} y2={21} />
                            <Line x1={12} y1={17} x2={12} y2={21} />
                          </Svg>
                        )}
                      </View>

                      {/* Class name & metadata */}
                      <View style={styles.classInfoTextWrap}>
                        <Text style={styles.classNameText}>{item.name}</Text>
                        <Text style={styles.classSubMetaText}>
                          {item.studentsCount} học sinh{item.room ? ` • ${item.room}` : ''}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Badge Pill + Check/Radio Circle */}
                    <View style={styles.classRowRight}>
                      {/* Pill Badge */}
                      <View
                        style={[
                          styles.classPillBadge,
                          isSelected ? styles.classPillBadgeSelected : styles.classPillBadgeNormal,
                        ]}
                      >
                        <Text style={styles.classPillBadgeText}>{item.subjectBadge}</Text>
                      </View>

                      {/* Check Circle if selected, else hollow radio ring */}
                      {isSelected ? (
                        <View style={styles.selectedCheckCircle}>
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                            <Polyline points="20 6 9 17 4 12" />
                          </Svg>
                        </View>
                      ) : (
                        <View style={styles.unselectedHollowCircle} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {classesList.length === 0 && (
                <View style={{ paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#6B6880', textAlign: 'center' }}>
                    Bạn chưa có lớp học nào. Vui lòng tạo lớp mới.
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom Safe Area Bar (Home indicator) */}
            <View style={styles.homeIndicatorWrap}>
              <View style={styles.homeIndicator} />
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
    backgroundColor: '#FFE3C8',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
    gap: 14,
  },

  /* Decorative Sparkles */
  starTopRight: {
    position: 'absolute',
    top: 48,
    right: 24,
  },
  starMidLeft: {
    position: 'absolute',
    top: 200,
    left: 12,
  },
  starBottomRight: {
    position: 'absolute',
    top: 520,
    right: 16,
  },
  curvedDoodle: {
    position: 'absolute',
    top: 110,
    right: 0,
  },

  /* 1. Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 2,
  },
  teacherInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  avatarBorderRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    flexShrink: 0,
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    backgroundColor: '#FED7AA',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingTextContainer: {
    justifyContent: 'center',
    flex: 1,
    minWidth: 0,
  },
  greetingSubtitle: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B6880',
    marginBottom: 2,
  },
  greetingTeacherName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  gvcnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFE3C8',
    gap: 5,
    flexShrink: 0,
  },
  gvcnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B6880',
  },
  gvcnBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  notificationBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notificationAlertDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  /* 2. Hero Card */
  heroCard: {
    borderRadius: 24,
    backgroundColor: '#1E1B2E',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroGlowBottomRight: {
    position: 'absolute',
    right: -32,
    bottom: -32,
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: 'rgba(245, 143, 76, 0.2)',
  },
  heroGlowTopLeft: {
    position: 'absolute',
    left: -24,
    top: -24,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroIllustrationContainer: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 90,
    height: 90,
  },
  heroContent: {
    paddingRight: 76,
  },
  heroTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    borderRadius: 999,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  heroMetaSeparator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCtaBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  heroCtaArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaArrowText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#F58F4C',
  },

  /* 3. Bento Grid */
  bentoGrid: {
    gap: 10,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  bentoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bentoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  bentoLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#6B6880',
  },
  bentoPrimaryValue: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.4,
  },
  bentoSubtitleText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  bentoTagWrapper: {
    marginTop: 5,
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
  bhytValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  bhytNumerator: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  bhytStatusLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#6B6880',
  },
  bhytProgressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#FFEDD5',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  bhytProgressBarFill: {
    height: '100%',
    backgroundColor: '#F58F4C',
    borderRadius: 3,
  },

  /* 4. Timeline Section */
  timelineSection: {
    paddingTop: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  timelineTitleText: {
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  timelineCountBadge: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  timelineCountBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#6B6880',
  },
  timelineList: {
    position: 'relative',
    paddingLeft: 14,
    gap: 9,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 6,
    top: 14,
    bottom: 14,
    width: 2,
    backgroundColor: '#FED7AA',
  },
  timelineItem: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDotUpcoming: {
    position: 'absolute',
    left: -14,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#F58F4C',
    zIndex: 10,
  },
  indicatorDotPending: {
    position: 'absolute',
    left: -14,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#CBD5E1',
    zIndex: 10,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineCardContent: {
    flex: 1,
    paddingRight: 8,
  },
  timelineLessonTitle: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  timelineMetaText: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    color: '#6B6880',
  },
  timelineMetaDot: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  upcomingBadge: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  upcomingBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#6B6880',
  },
  pendingBadge: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  pendingBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#6B6880',
  },

  /* 5. Floating Bottom Dock */
  dockWrapper: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    zIndex: 50,
  },
  dockBar: {
    height: 60,
    backgroundColor: 'rgba(30, 27, 46, 0.95)',
    borderRadius: 30,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 8,
  },
  dockTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dockActiveIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
  dockTabText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  dockTabTextActive: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  dockTabTextInactive: {
    color: '#94A3B8',
  },

  /* 6. TEA-01.BS Bottom Sheet Styles */
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 24,
    zIndex: 100,
  },
  dragHandleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: '#DDD7D0',
    borderRadius: 999,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingTop: 4,
  },
  sheetTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE9E2',
    overflow: 'hidden',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  classRowSelected: {
    backgroundColor: '#FFF1E6',
  },
  classRowFirst: {
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  classRowLast: {
    borderBottomLeftRadius: 19,
    borderBottomRightRadius: 19,
  },
  classRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F2ECE6',
  },
  classRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  classIconTile: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classIconTileSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(245, 143, 76, 0.3)',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  classIconTileNormal: {
    backgroundColor: '#FFF1E6',
  },
  classInfoTextWrap: {
    flex: 1,
  },
  classNameText: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  classSubMetaText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 2,
  },
  classRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  classPillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 999,
  },
  classPillBadgeSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E2D8',
  },
  classPillBadgeNormal: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: 'rgba(245, 143, 76, 0.15)',
  },
  classPillBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#6B6880',
  },
  selectedCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  unselectedHollowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D5CED8',
    backgroundColor: 'transparent',
  },
  homeIndicatorWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 4,
  },
  homeIndicator: {
    width: 128,
    height: 4.5,
    backgroundColor: 'rgba(30, 27, 46, 0.2)',
    borderRadius: 999,
  },

  /* TEA-01.empty Styles */
  emptyMainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -20,
  },
  emptyIllustrationWrap: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  emptyIllustrationGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 207, 163, 0.45)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 8,
  },
  emptyIllustrationImage: {
    width: 240,
    height: 240,
    borderRadius: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: -0.3,
  },
  emptyButtonsContainer: {
    width: '100%',
    maxWidth: 342,
    gap: 12,
  },
  emptyPrimaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 4,
  },
  emptyPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyOutlinedBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
    borderColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyOutlinedBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F58F4C',
  },
  dialogSheetBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  dialogSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogSheetSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6880',
    textAlign: 'center',
    marginBottom: 16,
  },
  dialogInput: {
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
  dialogCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F58F4C',
  },
  dialogPrimaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
