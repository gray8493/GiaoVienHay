import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Polygon,
  Polyline,
  Rect,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import { gradesService } from '../services/grades.service';
import { authService } from '../services/auth.service';
import { classService } from '../services/class.service';

interface StudentGrade {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  oral: number | null;
  test15p: number | null;
  test1p: number | null;
  midTerm: number | null;
  final?: number | null;
  stars: number;
  comment: string;
}

interface GradebookScreenProps {
  currentClassId?: string;
  className?: string;
  onBackToHome?: () => void;
  onTabChange?: (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => void;
}

export const GradebookScreen: React.FC<GradebookScreenProps> = ({
  currentClassId = 'cls_1a_2026',
  className = 'Lớp 1A',
  onBackToHome,
  onTabChange,
}) => {
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'good' | 'fair' | 'need_effort'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quản lý môn học & chế độ Xem (Visibility / Read-only) theo Backend & phân quyền
  const [selectedSubject, setSelectedSubject] = useState<'MATH' | 'LIT' | 'CS'>('MATH');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    loadGradebookData();
  }, [currentClassId, selectedSubject]);

  const loadGradebookData = async () => {
    setIsLoading(true);
    try {
      const [gradesRes, lbRes, classDetail] = await Promise.all([
        gradesService.getClassGrades(currentClassId, selectedSubject).catch(() => null),
        gradesService.getLeaderboard(currentClassId, selectedSubject).catch(() => null),
        classService.getClassDetail(currentClassId).catch(() => null),
      ]);

      if (lbRes && lbRes.top_students && lbRes.top_students.length > 0) {
        setLeaderboard(lbRes.top_students);
      } else {
        setLeaderboard([]);
      }

      if (classDetail && classDetail.students && classDetail.students.length > 0) {
        const mapped: StudentGrade[] = classDetail.students.map((s: any, idx: number) => {
          const studentScores = Array.isArray(gradesRes)
            ? gradesRes.find((g: any) => g.student_id === s.id)?.scores || []
            : [];
          const oral = studentScores.find((sc: any) => sc.type === 'ORAL_TEST')?.value ?? null;
          const test15p = studentScores.find((sc: any) => sc.type === 'TEST_15P')?.value ?? null;
          const test1p = studentScores.find((sc: any) => sc.type === 'TEST_1P')?.value ?? null;
          const midTerm = studentScores.find((sc: any) => sc.type === 'MID_TERM')?.value ?? null;
          const finalScore = studentScores.find((sc: any) => sc.type === 'FINAL')?.value ?? null;
          const comment = studentScores[0]?.comment || 'Chăm ngoan';

          return {
            id: s.id,
            rank: idx + 1,
            name: s.full_name || s.name || `Học sinh ${idx + 1}`,
            avatar: `https://api.dicebear.com/7.x/bottts/png?seed=${s.id}`,
            oral,
            test15p,
            test1p,
            midTerm,
            final: finalScore,
            stars: 10 + (idx % 5) * 5,
            comment,
          };
        });
        setStudents(mapped);
      } else {
        setStudents([]);
      }
    } catch (e) {
      setStudents([]);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Môn 'LIT' (Ngữ Văn) do GV khác dạy => GVCN chỉ có quyền xem (Read-only)
  const isReadOnly = selectedSubject === 'LIT' || isPreviewMode;

  // Modal 1: Nhập điểm (TEA-06b)
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
  const [activeScoreType, setActiveScoreType] = useState<'oral' | 'test15p' | 'test1p' | 'midTerm' | 'final'>('test1p');
  const [inputScore, setInputScore] = useState('9.0');
  const [teacherComment, setTeacherComment] = useState('Thuộc bài tốt, trình bày sạch đẹp');

  // Modal 2: Gửi sổ liên lạc (TEA-06c)
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Screen 4: Thành công (TEA-06d)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Chuyển đổi môn học vòng quanh (Toán -> Ngữ Văn -> Tin Học -> Toán)
  const handleToggleSubject = () => {
    setSelectedSubject((prev) => {
      if (prev === 'MATH') return 'LIT';
      if (prev === 'LIT') return 'CS';
      return 'MATH';
    });
  };

  const getSubjectDisplayName = () => {
    if (selectedSubject === 'LIT') return 'Ngữ Văn';
    if (selectedSubject === 'CS') return 'Tin Học';
    return currentClassId === 'cls_6a2' ? 'Toán Đại' : 'Toán Hình';
  };

  // Mở modal nhập điểm cho học sinh (chỉ cho phép khi không ở chế độ Read-only)
  const handleOpenScoreModal = (student: StudentGrade, scoreType?: 'oral' | 'test15p' | 'test1p' | 'midTerm') => {
    if (isReadOnly) return;
    setSelectedStudent(student);
    if (scoreType) {
      setActiveScoreType(scoreType);
      const val = student[scoreType];
      setInputScore(val !== null ? val.toFixed(1) : '');
    } else {
      setActiveScoreType('test1p');
      setInputScore(student.test1p !== null ? student.test1p.toFixed(1) : '9.0');
    }
    setTeacherComment(student.comment || 'Thuộc bài tốt, trình bày sạch đẹp');
    setScoreModalVisible(true);
  };

  // Nhập số trên keypad
  const handleKeypadPress = (val: string) => {
    if (val === 'DEL') {
      setInputScore((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
    } else if (val === '.') {
      if (!inputScore.includes('.')) {
        setInputScore((prev) => (prev.length === 0 ? '0.' : prev + '.'));
      }
    } else {
      if (inputScore.length < 4) {
        const nextVal = inputScore + val;
        const num = parseFloat(nextVal);
        if (!isNaN(num) && num <= 10) {
          setInputScore(nextVal);
        }
      }
    }
  };

  // Lưu điểm học sinh và chuyển học sinh kế tiếp
  const handleSaveScoreAndNext = async () => {
    if (!selectedStudent) return;
    const num = parseFloat(inputScore);
    const validScore = isNaN(num) ? 9.0 : Math.min(10, Math.max(0, num));

    // Cập nhật state học sinh
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            [activeScoreType]: validScore,
            comment: teacherComment,
          };
        }
        return s;
      })
    );

    // Gọi backend API nếu có kết nối
    try {
      const typeMap: Record<string, 'ORAL_TEST' | 'TEST_15P' | 'TEST_1P' | 'MID_TERM' | 'FINAL'> = {
        oral: 'ORAL_TEST',
        test15p: 'TEST_15P',
        test1p: 'TEST_1P',
        midTerm: 'MID_TERM',
        final: 'FINAL',
      };
      await gradesService.batchInputScores({
        class_id: currentClassId,
        subject_code: selectedSubject,
        score_type: typeMap[activeScoreType] || 'TEST_1P',
        semester: 1,
        scores: [
          {
            student_id: selectedStudent.id,
            score_value: validScore,
            teacher_comment: teacherComment,
          },
        ],
      });
    } catch (e) {
      // Ignored for demo
    }

    // Tìm học sinh tiếp theo
    const currentIndex = students.findIndex((s) => s.id === selectedStudent.id);
    if (currentIndex >= 0 && currentIndex < students.length - 1) {
      const nextStudent = students[currentIndex + 1];
      setSelectedStudent(nextStudent);
      const scoreVal = activeScoreType === 'final' ? null : nextStudent[activeScoreType];
      setInputScore(scoreVal !== null && scoreVal !== undefined ? scoreVal.toFixed(1) : '9.0');
      setTeacherComment(nextStudent.comment || 'Chăm chú lắng nghe, hoàn thành bài tập');
    } else {
      setScoreModalVisible(false);
    }
  };

  // Xác nhận gửi sổ liên lạc
  const handleConfirmSendGradebook = async () => {
    setIsSending(true);
    try {
      const typeMap: Record<string, 'ORAL_TEST' | 'TEST_15P' | 'TEST_1P' | 'MID_TERM' | 'FINAL'> = {
        oral: 'ORAL_TEST',
        test15p: 'TEST_15P',
        test1p: 'TEST_1P',
        midTerm: 'MID_TERM',
        final: 'FINAL',
      };
      await gradesService.publishScores({
        class_id: currentClassId,
        subject_code: selectedSubject,
        score_type: typeMap[activeScoreType] || 'TEST_1P',
        semester: 1,
      });
    } catch (e) {
      // Ignored
    }

    setTimeout(() => {
      setIsSending(false);
      setSendModalVisible(false);
      setShowSuccessScreen(true);
    }, 800);
  };

  // ====================== MÀN HÌNH THÀNH CÔNG (TEA-06d) ======================
  if (showSuccessScreen) {
    return (
      <View style={styles.successRoot}>
        {/* Background Peach Linear Gradient */}
        <LinearGradient
          colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
          locations={[0, 0.46, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Ambient gentle curves & Sparkles */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
            <Path
              d="M -20 160 C 90 140, 120 290, 280 220 C 340 190, 380 240, 420 220"
              stroke="#F58F4C"
              strokeWidth={1.5}
              strokeDasharray="4 6"
              opacity={0.32}
            />
            <Path
              d="M 40 380 C 130 420, 220 340, 360 410"
              stroke="#F58F4C"
              strokeWidth={1.2}
              strokeDasharray="3 5"
              opacity={0.22}
            />
            <Circle cx="52" cy="126" r={3.5} fill="#F58F4C" opacity={0.55} />
            <Circle cx="336" cy="142" r={4} fill="#FFFFFF" opacity={0.8} />
            <Circle cx="318" cy="303" r={3} fill="#F58F4C" opacity={0.45} />
          </Svg>
        </View>

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContentContainer}>
            {/* 3D Pastel Delight Illustration */}
            <View style={styles.successIllustrationWrap}>
              <View style={styles.successGlowAura} />
              <Svg width={200} height={180} viewBox="0 0 220 200" fill="none">
                <Defs>
                  <SvgLinearGradient id="checkGlow" x1="45" y1="55" x2="135" y2="155">
                    <Stop offset="0%" stopColor="#34D399" />
                    <Stop offset="0.65" stopColor="#10B981" />
                    <Stop offset="1" stopColor="#059669" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="bellGrad" x1="38" y1="110" x2="72" y2="154">
                    <Stop offset="0%" stopColor="#FDE047" />
                    <Stop offset="0.5" stopColor="#F59E0B" />
                    <Stop offset="1" stopColor="#D97706" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="planeGradMain" x1="120" y1="42" x2="185" y2="78">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="1%" stopColor="#E2E8F0" />
                  </SvgLinearGradient>
                </Defs>

                {/* Dashed flight trail */}
                <Path
                  d="M 85 125 C 105 140, 120 115, 130 96 C 136 83, 145 72, 160 62"
                  stroke="#FFFFFF"
                  strokeDasharray="4 5"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  opacity={0.9}
                />

                {/* Large Emerald Badge */}
                <Circle cx="95" cy="105" r="46" fill="url(#checkGlow)" />
                <Circle cx="95" cy="105" r="42" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={1.8} fill="none" />
                <Path
                  d="M 79 105 L 90 116 L 113 93"
                  stroke="#FFFFFF"
                  strokeWidth={6.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Whimsical Golden Bell */}
                <G transform="rotate(-14 52 130)">
                  <Circle cx="52" cy="142" r="5" fill="#B45309" />
                  <Path d="M 44 136 C 44 136 40 135 40 132 C 40 128 44 124 45 118 C 46 112 50 110 52 110 C 54 110 58 112 59 118 C 60 124 64 128 64 132 C 64 135 60 136 60 136 Z" fill="url(#bellGrad)" />
                  <Ellipse cx="52" cy="136" rx="10" ry="2.2" fill="#F59E0B" />
                </G>

                {/* 3D Paper Plane */}
                <G transform="rotate(8 152 64)">
                  <Polygon points="178,48 132,68 158,78" fill="url(#planeGradMain)" />
                  <Polygon points="178,48 132,68 144,56" fill="#F1F5F9" />
                  <Polygon points="158,78 148,85 146,74" fill="#CBD5E1" />
                </G>
              </Svg>
            </View>

            {/* Typography */}
            <Text style={styles.successHeadline}>Đã gửi sổ liên lạc!</Text>
            <Text style={styles.successSubtitle}>Lớp 6A1 • Toán học • Học kỳ 1</Text>

            {/* Bento Stats Card */}
            <View style={styles.successBentoCard}>
              <View style={styles.successStatCol}>
                <Text style={styles.successStatNumDark}>40</Text>
                <Text style={styles.successStatLabel}>Học sinh</Text>
              </View>

              <View style={styles.successStatColMiddle}>
                <View style={styles.successColDividerLeft} />
                <Text style={styles.successStatNumGreen}>40</Text>
                <Text style={styles.successStatLabelGreen}>Đã gửi</Text>
                <View style={styles.successColDividerRight} />
              </View>

              <View style={styles.successStatCol}>
                <Text style={styles.successStatNumGray}>0</Text>
                <Text style={styles.successStatLabel}>Chưa gửi</Text>
              </View>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.successBottomActions}>
            <TouchableOpacity
              style={styles.btnPrimaryOrange}
              onPress={() => setShowSuccessScreen(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.btnPrimaryOrangeText}>Về Sổ Điểm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnTextLink}
              onPress={onBackToHome}
              activeOpacity={0.7}
            >
              <Text style={styles.btnTextLinkText}>Về Trang Chủ</Text>
            </TouchableOpacity>

            <View style={styles.homeIndicator} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ====================== MÀN HÌNH CHÍNH (TEA-06) ======================
  return (
    <View style={styles.root}>
      {/* Background Peach Linear Gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Fixed Header: Profile & Notifications */}
        <View style={styles.topHeader}>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatarWrap}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1T89ldUCu91qNyOe5l_mf-jHDD_MHVfYxPQX-5dugu0Zo_TnDF2SP7zhn6AbEreyWGcReZrQyjU7v6BJjnW5rb7Air4XhYqD_pdGsLiDyt7moEDkNBpUd_9Q_CLvtjTAViAM7yFTmidv8B7rIo1w1iyYt9-qGcowZ35Lj3m5k9B8a39cBy6Z7x3_i6vmHyMLpcvcJlPAzcHc6uhr3mjQW727psowj5Ae4TpVkjgLLVCjNopROlPL3fA',
                }}
                style={styles.profileAvatarImg}
              />
              <View style={styles.onlineBadgeGreen} />
            </View>
            <View>
              <Text style={styles.greetingText}>Xin chào,</Text>
              <Text style={styles.teacherNameText}>{authService.getUser()?.full_name || 'Thầy/Cô'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notiCircleBtn}
            activeOpacity={0.8}
            accessibilityLabel="Thông báo"
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2}>
              <Path
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <View style={styles.redDot} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Title & Export Row */}
          <View style={styles.titleExportRow}>
            <Text style={styles.pageMainTitle}>Sổ Điểm & Vinh Danh</Text>
            <View style={styles.headerActionBtnsRow}>
              {/* Nút mắt (Visibility Mode): Bật/Tắt chế độ Chỉ xem */}
              <TouchableOpacity
                style={[
                  styles.visibilityEyeBtn,
                  isReadOnly && styles.visibilityEyeBtnActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setIsPreviewMode((prev) => !prev)}
                accessibilityLabel="Chế độ xem"
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={isReadOnly ? "#F58F4C" : "#6B6880"} strokeWidth={2}>
                  <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <Circle cx="12" cy="12" r="3" />
                </Svg>
              </TouchableOpacity>

              {/* Nút Xuất file */}
              <TouchableOpacity
                style={styles.exportFileBtn}
                activeOpacity={0.8}
                onPress={() => alert('Đang xuất bảng điểm Excel...')}
                accessibilityLabel="Xuất file báo cáo"
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#984704" strokeWidth={2.5}>
                  <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <Line x1="7" y1="10" x2="12" y2="15" />
                  <Line x1="12" y1="15" x2="17" y2="10" />
                  <Line x1="12" y1="15" x2="12" y2="3" />
                </Svg>
                <Text style={styles.exportFileBtnText}>Xuất file</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Dropdown Chips Row */}
          <View style={styles.dropdownFiltersRow}>
            {/* Chip 1: Class (fixed badge pill) */}
            <View style={styles.classChipFixed}>
              <Text style={styles.classChipFixedText}>
                {className || (currentClassId === 'cls_1a_2026' ? 'Lớp 1A' : currentClassId.replace('cls_', 'Lớp ').toUpperCase())}
              </Text>
            </View>

            {/* Chip 2: Subject (Tap to switch subject) */}
            <TouchableOpacity
              style={styles.dropdownChipBtn}
              activeOpacity={0.85}
              onPress={handleToggleSubject}
            >
              <Text style={styles.dropdownChipText}>{getSubjectDisplayName()}</Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            {/* Chip 3: Semester */}
            <TouchableOpacity style={styles.dropdownChipBtn} activeOpacity={0.85}>
              <Text style={styles.dropdownChipText}>Học kỳ 1</Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Hero Podium Bento Card (Weekly Honor) */}
          <View style={styles.heroPodiumCard}>
            {/* 3D Gold Trophy Icon Top Right */}
            <View style={styles.podiumTrophyWrap}>
              <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
                <Defs>
                  <SvgLinearGradient id="trophyCup" x1="24" y1="16" x2="56" y2="52">
                    <Stop offset="0%" stopColor="#FFFBF2" />
                    <Stop offset="40%" stopColor="#FFE8B3" />
                    <Stop offset="80%" stopColor="#FFD480" />
                    <Stop offset="100%" stopColor="#F8BE54" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="glossHighlight" x1="28" y1="18" x2="38" y2="32">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="pedestalGrad" x1="28" y1="56" x2="52" y2="70">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="100%" stopColor="#EDE9FE" />
                  </SvgLinearGradient>
                </Defs>
                <Ellipse cx="40" cy="66" rx="16" ry="4" fill="rgba(0,0,0,0.18)" />
                <Rect x="28" y="58" width="24" height="8" rx="4" fill="url(#pedestalGrad)" />
                <Rect x="36" y="46" width="8" height="13" rx="3" fill="url(#trophyCup)" />
                <Path d="M24 16C24 16 23 38 40 38C57 38 56 16 56 16H24Z" fill="url(#trophyCup)" />
                <Path d="M26 18C28 26 36 32 40 32C44 32 52 26 54 18" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
                <Ellipse cx="32" cy="24" rx="5" ry="7" fill="url(#glossHighlight)" />
                <Path d="M24 20C17 20 14 26 14 31C14 37 19 40 25 40" stroke="url(#trophyCup)" strokeWidth={4.5} strokeLinecap="round" fill="none" />
                <Path d="M56 20C63 20 66 26 66 31C66 37 61 40 55 40" stroke="url(#trophyCup)" strokeWidth={4.5} strokeLinecap="round" fill="none" />
                <Path d="M40 22L41.8 26.2L46.2 26.6L42.8 29.5L43.8 33.9L40 31.6L36.2 33.9L37.2 29.5L33.8 26.6L38.2 26.2L40 22Z" fill="#FFFFFF" fillOpacity={0.9} />
              </Svg>
            </View>

            <View style={styles.podiumHeaderTexts}>
              <Text style={styles.podiumSubBadge}>VINH DANH TUẦN 14</Text>
              <Text style={styles.podiumTitle}>Top Học Sinh Xuất Sắc</Text>
            </View>

            {/* 3 Pillars */}
            {leaderboard.length >= 3 ? (
              <View style={styles.podiumGrid}>
                {/* Rank 2 */}
                <View style={styles.podiumCol}>
                  <View style={styles.podiumAvatarWrap}>
                    <Image
                      source={{ uri: `https://api.dicebear.com/7.x/bottts/png?seed=${leaderboard[1].student_name}` }}
                      style={styles.podiumAvatarImgSmall}
                    />
                    <View style={styles.rankPillWhite}>
                      <Text style={styles.rankPillText}>2</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumStudentName} numberOfLines={1}>{leaderboard[1].student_name}</Text>
                  <Text style={styles.podiumStudentScore}>TB: {leaderboard[1].score}</Text>
                  <View style={styles.podiumPillar2}>
                    <Text style={styles.pillarRankLabel}>HẠNG 2</Text>
                    <Text style={styles.medalEmoji}>🥈</Text>
                  </View>
                </View>

                {/* Rank 1: Quán Quân */}
                <View style={styles.podiumColCenter}>
                  <View style={styles.crownWrap}>
                    <Text style={styles.crownEmoji}>👑</Text>
                  </View>
                  <View style={styles.podiumAvatarWrap}>
                    <Image
                      source={{ uri: `https://api.dicebear.com/7.x/bottts/png?seed=${leaderboard[0].student_name}` }}
                      style={styles.podiumAvatarImgLarge}
                    />
                    <View style={styles.rankPillOrange}>
                      <Text style={styles.rankPillTextWhite}>1</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumStudentName} numberOfLines={1}>{leaderboard[0].student_name}</Text>
                  <Text style={styles.podiumStudentScoreCenter}>TB: {leaderboard[0].score}</Text>
                  <View style={styles.podiumPillar1}>
                    <Text style={styles.pillarRankLabelChampion}>QUÁN QUÂN</Text>
                    <Text style={styles.starCluster}>⭐⭐⭐</Text>
                  </View>
                </View>

                {/* Rank 3 */}
                <View style={styles.podiumCol}>
                  <View style={styles.podiumAvatarWrap}>
                    <Image
                      source={{ uri: `https://api.dicebear.com/7.x/bottts/png?seed=${leaderboard[2].student_name}` }}
                      style={styles.podiumAvatarImgSmall}
                    />
                    <View style={styles.rankPillWhite}>
                      <Text style={styles.rankPillText}>3</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumStudentName} numberOfLines={1}>{leaderboard[2].student_name}</Text>
                  <Text style={styles.podiumStudentScore}>TB: {leaderboard[2].score}</Text>
                  <View style={styles.podiumPillar3}>
                    <Text style={styles.pillarRankLabel}>HẠNG 3</Text>
                    <Text style={styles.medalEmoji}>🥉</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.9 }}>
                  Chưa có dữ liệu vinh danh tuần này cho môn học.
                </Text>
              </View>
            )}
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarBox}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
              <Circle cx="11" cy="11" r="8" />
              <Line x1="21" y1="21" x2="16.65" y2="16.65" />
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tên hoặc mã học sinh..."
              placeholderTextColor="#6B6880"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Chips / Segments */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentChipsRow}>
            <TouchableOpacity
              style={[styles.segmentBtn, selectedSegment === 'all' && styles.segmentBtnActive]}
              onPress={() => setSelectedSegment('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, selectedSegment === 'all' && styles.segmentTextActive]}>
                Tất cả ({students.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, selectedSegment === 'good' && styles.segmentBtnActive]}
              onPress={() => setSelectedSegment('good')}
              activeOpacity={0.8}
            >
              <View style={styles.grayBullet} />
              <Text style={[styles.segmentText, selectedSegment === 'good' && styles.segmentTextActive]}>
                Giỏi ({students.filter(s => (s.test15p || s.oral || s.test1p || 0) >= 8.0).length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, selectedSegment === 'fair' && styles.segmentBtnActive]}
              onPress={() => setSelectedSegment('fair')}
              activeOpacity={0.8}
            >
              <View style={styles.grayBullet} />
              <Text style={[styles.segmentText, selectedSegment === 'fair' && styles.segmentTextActive]}>
                Khá ({students.filter(s => { const a = (s.test15p || s.oral || s.test1p || 0); return a >= 6.5 && a < 8.0; }).length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, selectedSegment === 'need_effort' && styles.segmentBtnActive]}
              onPress={() => setSelectedSegment('need_effort')}
              activeOpacity={0.8}
            >
              <View style={styles.grayBullet} />
              <Text style={[styles.segmentText, selectedSegment === 'need_effort' && styles.segmentTextActive]}>
                Cần cố gắng ({students.filter(s => (s.test15p || s.oral || s.test1p || 0) < 6.5).length})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Student Grade Cards Feed */}
          <View style={styles.studentsGradeFeed}>
            {students.length === 0 ? (
              <View style={{ padding: 32, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1B2E', marginBottom: 6 }}>
                  {searchQuery ? 'Không tìm thấy học sinh phù hợp' : 'Chưa có dữ liệu sổ điểm'}
                </Text>
                <Text style={{ fontSize: 13, color: '#6B6880', textAlign: 'center' }}>
                  {searchQuery ? 'Vui lòng kiểm tra lại từ khóa tìm kiếm' : 'Lớp học chưa có học sinh hoặc chưa có dữ liệu điểm môn này.'}
                </Text>
              </View>
            ) : (
              (selectedSegment === 'good'
                ? students.filter(s => (s.test15p || s.oral || s.test1p || 0) >= 8.0)
                : selectedSegment === 'fair'
                ? students.filter(s => { const a = (s.test15p || s.oral || s.test1p || 0); return a >= 6.5 && a < 8.0; })
                : selectedSegment === 'need_effort'
                ? students.filter(s => (s.test15p || s.oral || s.test1p || 0) < 6.5)
                : students
              )
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((student) => (
              <View key={student.id} style={styles.studentGradeCard}>
                {/* Header row: rank & avatar & name */}
                <View style={styles.studentCardHeader}>
                  <View style={styles.studentCardHeaderLeft}>
                    <View style={styles.rankBadgePill}>
                      <Text style={styles.rankBadgePillText}>#{student.rank}</Text>
                    </View>
                    <Image source={{ uri: student.avatar }} style={styles.studentAvatarCircle} />
                    <Text style={styles.studentCardName} numberOfLines={1}>{student.name}</Text>
                  </View>
                </View>

                {/* 4 Score Columns */}
                <View style={styles.fourScoreCols}>
                  {/* Miệng */}
                  <TouchableOpacity
                    style={styles.scoreBox}
                    onPress={() => handleOpenScoreModal(student, 'oral')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.scoreTypeLabel}>Miệng</Text>
                    <Text style={styles.scoreValueBig}>{student.oral !== null ? student.oral.toFixed(1) : '--'}</Text>
                  </TouchableOpacity>

                  {/* 15 phút */}
                  <TouchableOpacity
                    style={styles.scoreBox}
                    onPress={() => handleOpenScoreModal(student, 'test15p')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.scoreTypeLabel}>15 phút</Text>
                    <Text style={styles.scoreValueBig}>{student.test15p !== null ? student.test15p.toFixed(1) : '--'}</Text>
                  </TouchableOpacity>

                  {/* 1 Tiết */}
                  {student.test1p !== null ? (
                    <TouchableOpacity
                      style={styles.scoreBox}
                      onPress={() => handleOpenScoreModal(student, 'test1p')}
                      activeOpacity={isReadOnly ? 1 : 0.7}
                    >
                      <Text style={styles.scoreTypeLabel}>1 Tiết</Text>
                      <Text style={styles.scoreValueBig}>{student.test1p.toFixed(1)}</Text>
                    </TouchableOpacity>
                  ) : isReadOnly ? (
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreTypeLabel}>1 Tiết</Text>
                      <Text style={styles.scoreValuePlaceholder}>--</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.scoreBoxDashed}
                      onPress={() => handleOpenScoreModal(student, 'test1p')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scoreTypeLabelDashed}>1 Tiết</Text>
                      <Text style={styles.scoreInputPrompt}>+ Nhập</Text>
                    </TouchableOpacity>
                  )}

                  {/* Thi GK */}
                  <TouchableOpacity
                    style={styles.scoreBox}
                    onPress={() => handleOpenScoreModal(student, 'midTerm')}
                    activeOpacity={isReadOnly ? 1 : 0.7}
                  >
                    <Text style={styles.scoreTypeLabel}>Thi GK</Text>
                    <Text style={student.midTerm !== null ? styles.scoreValueBig : styles.scoreValuePlaceholder}>
                      {student.midTerm !== null ? student.midTerm.toFixed(1) : '--'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Footer: Stars/Comment & Nút Vào điểm (ẩn nút Vào điểm khi ở chế độ Read-only) */}
                <View style={styles.cardFooterRow}>
                  <View style={[styles.starsCommentPill, isReadOnly && styles.starsCommentPillFull]}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="#F58F4C" style={{ marginRight: 2 }}>
                      <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </Svg>
                    <Text style={styles.starCountBold}>+{student.stars} sao</Text>
                    <Text style={styles.dotSep}>•</Text>
                    <Text style={styles.commentShort} numberOfLines={1}>{student.comment}</Text>
                  </View>

                  {!isReadOnly && (
                    <TouchableOpacity
                      style={styles.btnVaoDiem}
                      onPress={() => handleOpenScoreModal(student)}
                      activeOpacity={0.75}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                        <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </Svg>
                      <Text style={styles.btnVaoDiemText}>Vào điểm</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )))}
          </View>
        </ScrollView>

        {/* Floating CTA Deck: Gửi Sổ Liên Lạc (Chỉ hiển thị khi có quyền chỉnh sửa/công bố) */}
        {!isReadOnly && (
          <View style={styles.floatingCtaDeck}>
            <TouchableOpacity
              style={styles.btnGuiSoLienLac}
              onPress={() => setSendModalVisible(true)}
              activeOpacity={0.88}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <Polyline points="22,6 12,13 2,6" />
              </Svg>
              <Text style={styles.btnGuiSoLienLacText}>Gửi Sổ Liên Lạc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Dock Navigation */}
        <View style={styles.dockWrapper}>
          <View style={styles.dockBar}>
            {/* Lịch dạy */}
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

            {/* Điểm danh */}
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

            {/* Sổ điểm (Active) */}
            <TouchableOpacity
              style={styles.dockTabItem}
              activeOpacity={0.8}
            >
              <View style={styles.dockActiveIconWrap}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                  <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </Svg>
              </View>
              <Text style={styles.dockTabTextActive}>Sổ điểm</Text>
            </TouchableOpacity>

            {/* Cá nhân */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => onTabChange?.('profile')}
              activeOpacity={0.8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <Circle cx="12" cy="7" r="4" />
              </Svg>
              <Text style={styles.dockTabTextInactive}>Cá nhân</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= MODAL TEA-06b: NHẬP ĐIỂM HỌC SINH ================= */}
        <Modal
          visible={scoreModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setScoreModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setScoreModalVisible(false)}
              activeOpacity={1}
            />

            <View style={styles.scoreModalContainer}>
              {/* Drag Handle */}
              <View style={styles.modalDragHandle} />

              {/* Student Header */}
              {selectedStudent && (
                <View style={styles.modalStudentHeader}>
                  <View style={styles.modalStudentInfoLeft}>
                    <View style={styles.modalAvatarEmoji}>
                      <Text style={{ fontSize: 18 }}>👦</Text>
                    </View>
                    <View>
                      <Text style={styles.modalStudentName}>{selectedStudent.name}</Text>
                      <Text style={styles.modalStudentClass}>Lớp 6A1 • Toán học</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.modalCloseCircle}
                    onPress={() => setScoreModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 16, color: '#6B6880' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Score Type Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scoreTypePillsRow}>
                <TouchableOpacity
                  style={[styles.scoreTypePill, activeScoreType === 'oral' && styles.scoreTypePillActive]}
                  onPress={() => setActiveScoreType('oral')}
                >
                  <Text style={styles.scoreTypePillText}>⭐ Miệng: 9.0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scoreTypePill, activeScoreType === 'test15p' && styles.scoreTypePillActive]}
                  onPress={() => setActiveScoreType('test15p')}
                >
                  <Text style={styles.scoreTypePillText}>📝 15 Phút: 9.5</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scoreTypePill, activeScoreType === 'test1p' && styles.scoreTypePillActive]}
                  onPress={() => setActiveScoreType('test1p')}
                >
                  <Text style={[styles.scoreTypePillText, activeScoreType === 'test1p' && { color: '#F58F4C', fontWeight: '800' }]}>
                    🎯 1 Tiết
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.scoreTypePillDashed}
                  onPress={() => setActiveScoreType('midTerm')}
                >
                  <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }}>Giữa Kỳ</Text>
                </TouchableOpacity>

                <View style={styles.scoreTypePillLocked}>
                  <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600' }}>🔒 Cuối Kỳ</Text>
                </View>
              </ScrollView>

              {/* Big Score Display */}
              <View style={styles.bigScoreCard}>
                <View style={styles.bigScoreLeft}>
                  <Text style={styles.bigScoreDigits}>{inputScore || '0'}</Text>
                  <View style={styles.cursorBlinkPill} />
                  <Text style={styles.bigScoreTotal}>/10</Text>
                </View>

                <View style={styles.bigScoreRight}>
                  <View style={styles.scalePill}>
                    <Text style={styles.scalePillText}>Thang 0.0 - 10.0</Text>
                  </View>
                  <Text style={styles.factorLabel}>Hệ số 2</Text>
                </View>
              </View>

              {/* Quick Preset Pills */}
              <View style={styles.presetPillsRow}>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setInputScore((prev) => (Math.min(10, (parseFloat(prev) || 0) + 0.5)).toFixed(1))}>
                  <Text style={styles.presetBtnText}>+0.5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setInputScore((prev) => (Math.min(10, (parseFloat(prev) || 0) + 1.0)).toFixed(1))}>
                  <Text style={styles.presetBtnText}>+1.0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setInputScore('10.0')}>
                  <Text style={styles.presetBtnText}>Điểm 10</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setInputScore('9.0')}>
                  <Text style={styles.presetBtnText}>Điểm 9</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setInputScore('8.0')}>
                  <Text style={styles.presetBtnText}>Điểm 8</Text>
                </TouchableOpacity>
              </View>

              {/* Comment Field */}
              <View style={styles.commentBox}>
                <View style={styles.commentBoxHeader}>
                  <Text style={styles.commentBoxLabel}>NHẬN XÉT GỬI PHỤ HUYNH</Text>
                  <Text style={styles.aiSuggestText}>Gợi ý AI ✨</Text>
                </View>
                <TextInput
                  style={styles.commentInput}
                  value={teacherComment}
                  onChangeText={setTeacherComment}
                  placeholder="Nhập nhận xét..."
                />
              </View>

              {/* Numeric Keypad Grid */}
              <View style={styles.keypadGrid}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={key === 'DEL' ? styles.keypadDelBtn : styles.keypadNumBtn}
                    onPress={() => handleKeypadPress(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={key === 'DEL' ? styles.keypadDelText : styles.keypadNumText}>
                      {key === 'DEL' ? '⌫ Xóa' : key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Footer Actions */}
              <View style={styles.modalFooterActions}>
                <Text style={styles.nextStudentCaption}>
                  Tiếp theo: <Text style={{ fontWeight: '800', color: '#1E1B2E' }}>Trần Minh Anh</Text> • 3/40
                </Text>
                <View style={styles.dualModalButtons}>
                  <TouchableOpacity
                    style={styles.btnLuuNhap}
                    onPress={() => setScoreModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnLuuNhapText}>Lưu nháp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnLuuTiepTheo}
                    onPress={handleSaveScoreAndNext}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.btnLuuTiepTheoText}>Lưu & Tiếp Theo →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* ================= MODAL TEA-06c: GỬI SỔ LIÊN LẠC ================= */}
        <Modal
          visible={sendModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSendModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setSendModalVisible(false)}
              activeOpacity={1}
            />

            <View style={styles.sendModalCard}>
              <View style={styles.modalDragHandle} />

              {/* 3D Envelope Illustration */}
              <View style={styles.envelopeWrap}>
                <Svg width={96} height={96} viewBox="0 0 120 120">
                  <Defs>
                    <SvgLinearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#FFF1E6" />
                      <Stop offset="60%" stopColor="#FFDBC8" />
                      <Stop offset="100%" stopColor="#F58F4C" />
                    </SvgLinearGradient>
                  </Defs>
                  <Rect fill="#E6DFFA" height="52" rx="14" width="76" x="22" y="38" />
                  <Rect fill="#FFFFFF" height="38" opacity="0.95" rx="8" width="60" x="30" y="24" />
                  <Rect fill="url(#envGrad)" height="52" rx="14" width="84" x="18" y="42" />
                  <Circle cx="60" cy="68" r="14" fill="#F59E0B" />
                  <Circle cx="60" cy="73" r="2" fill="#FFFFFF" />
                </Svg>
              </View>

              <Text style={styles.sendModalTitle}>Gửi sổ liên lạc?</Text>
              <Text style={styles.sendModalDesc}>
                40 phụ huynh lớp 6A1 sẽ nhận thông báo điểm môn Toán học • Học kỳ 1.
              </Text>

              {/* Summary Info Card */}
              <View style={styles.sendSummaryBox}>
                <View style={styles.sendSummaryRow}>
                  <Text style={styles.checkIconGreen}>✓</Text>
                  <Text style={styles.sendSummaryTextReady}>Đã có điểm: Miệng, 15 phút, 1 Tiết</Text>
                </View>
                <View style={styles.summaryHDivider} />
                <View style={styles.sendSummaryRow}>
                  <Text style={styles.minusIconGray}>−</Text>
                  <Text style={styles.sendSummaryTextPending}>Chưa có điểm: Thi GK, Thi CK</Text>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={styles.btnConfirmSend}
                onPress={handleConfirmSendGradebook}
                disabled={isSending}
                activeOpacity={0.88}
              >
                <Text style={styles.btnConfirmSendText}>
                  {isSending ? 'Đang gửi thông báo...' : 'Xác Nhận Gửi ✈'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnDeSau}
                onPress={() => setSendModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.btnDeSauText}>Để Sau</Text>
              </TouchableOpacity>

              <View style={styles.homeIndicator} />
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
    backgroundColor: '#FFF3E6',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileAvatarWrap: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  profileAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineBadgeGreen: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingText: {
    fontSize: 13,
    lineHeight: 16,
    color: '#6B6880',
  },
  teacherNameText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  notiCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },

  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 170,
    gap: 12,
  },

  /* Title & Export */
  titleExportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  pageMainTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  headerActionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibilityEyeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  visibilityEyeBtnActive: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: 'rgba(245, 143, 76, 0.4)',
  },
  exportFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  exportFileBtnText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#984704',
  },

  /* Dropdown filters */
  dropdownFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  classChipFixed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1E6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  classChipFixedText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#6B6880',
  },
  dropdownChipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dropdownChipText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#1E1B2E',
  },

  /* Hero Podium Bento Card */
  heroPodiumCard: {
    backgroundColor: '#5E5CE6',
    borderRadius: 22,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#5E5CE6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  podiumTrophyWrap: {
    position: 'absolute',
    top: -4,
    right: 4,
  },
  podiumHeaderTexts: {
    marginBottom: 8,
  },
  podiumSubBadge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.6,
  },
  podiumTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  podiumGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
    gap: 6,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  podiumColCenter: {
    flex: 1.1,
    alignItems: 'center',
    marginTop: -8,
  },
  crownWrap: {
    marginBottom: 2,
  },
  crownEmoji: {
    fontSize: 16,
  },
  podiumAvatarWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  podiumAvatarImgSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  podiumAvatarImgLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankPillWhite: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  rankPillOrange: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 19,
    height: 19,
    borderRadius: 9.5,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPillTextWhite: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  podiumStudentName: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  podiumStudentScore: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },
  podiumStudentScoreCenter: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  podiumPillar1: {
    width: '100%',
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumPillar2: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumPillar3: {
    width: '100%',
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarRankLabelChampion: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pillarRankLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  starCluster: {
    fontSize: 10,
    marginTop: 2,
  },
  medalEmoji: {
    fontSize: 14,
    marginTop: 2,
  },

  /* Search Bar */
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    color: '#1E1B2E',
    paddingVertical: 2,
  },

  /* Segment Chips */
  segmentChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentBtnActive: {
    backgroundColor: '#F58F4C',
  },
  segmentText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  grayBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },

  /* Student Grade Cards Feed */
  studentsGradeFeed: {
    gap: 10,
  },
  studentGradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  studentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rankBadgePill: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  rankBadgePillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  studentAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  studentCardName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1E1B2E',
    flex: 1,
  },
  fourScoreCols: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#FFF1E6',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBoxDashed: {
    flex: 1,
    backgroundColor: '#FFF1E6',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F58F4C',
  },
  scoreTypeLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#6B6880',
  },
  scoreTypeLabelDashed: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#F58F4C',
  },
  scoreValueBig: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    marginTop: 2,
  },
  scoreValuePlaceholder: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#6B6880',
    marginTop: 2,
  },
  scoreInputPrompt: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    color: '#F58F4C',
    marginTop: 2,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  starsCommentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    flex: 1,
    marginRight: 8,
  },
  starsCommentPillFull: {
    marginRight: 0,
  },
  starSymbol: {
    fontSize: 11,
  },
  starCountBold: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  dotSep: {
    fontSize: 10,
    color: '#6B6880',
  },
  commentShort: {
    fontSize: 11,
    lineHeight: 14,
    color: '#6B6880',
    flex: 1,
  },
  btnVaoDiem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  btnVaoDiemText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#1E1B2E',
  },

  /* Floating CTA Deck */
  floatingCtaDeck: {
    position: 'absolute',
    bottom: 74,
    left: 16,
    right: 16,
    zIndex: 40,
  },
  btnGuiSoLienLac: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  btnGuiSoLienLacText: {
    fontSize: 15.5,
    lineHeight: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Bottom Dock */
  dockWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    zIndex: 50,
  },
  dockBar: {
    height: 56,
    backgroundColor: '#1E1B2E',
    borderRadius: 28,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  dockTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },
  dockActiveIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
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
  },

  /* ================= MODAL STYLES ================= */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 46, 0.48)',
    justifyContent: 'flex-end',
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 8,
  },

  /* Score Modal Container */
  scoreModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 8,
  },
  modalStudentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalStudentInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalAvatarEmoji: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStudentName: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  modalStudentClass: {
    fontSize: 11,
    lineHeight: 14,
    color: '#6B6880',
  },
  modalCloseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreTypePillsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  scoreTypePill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  scoreTypePillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F58F4C',
    borderWidth: 1.5,
  },
  scoreTypePillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#6B21A8',
  },
  scoreTypePillDashed: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  scoreTypePillLocked: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  bigScoreCard: {
    backgroundColor: '#FFF1E6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFE3C8',
  },
  bigScoreLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bigScoreDigits: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  cursorBlinkPill: {
    width: 2.5,
    height: 32,
    backgroundColor: '#F58F4C',
    borderRadius: 1.5,
    marginHorizontal: 4,
    alignSelf: 'center',
  },
  bigScoreTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6880',
  },
  bigScoreRight: {
    alignItems: 'flex-end',
  },
  scalePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 2,
  },
  scalePillText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: '#C2410C',
  },
  factorLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: '#8C6D58',
    fontWeight: '500',
  },

  presetPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetBtnText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#1E1B2E',
  },

  commentBox: {
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 8,
  },
  commentBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentBoxLabel: {
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: '800',
    color: '#6B6880',
  },
  aiSuggestText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  commentInput: {
    fontSize: 12.5,
    lineHeight: 16,
    color: '#1E1B2E',
    paddingVertical: 2,
  },

  /* Keypad */
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keypadNumBtn: {
    width: '31.5%',
    height: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  keypadNumText: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  keypadDelBtn: {
    width: '31.5%',
    height: 38,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadDelText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#475569',
  },

  modalFooterActions: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  nextStudentCaption: {
    fontSize: 11,
    lineHeight: 14,
    color: '#6B6880',
    textAlign: 'center',
    marginBottom: 6,
  },
  dualModalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  btnLuuNhap: {
    width: 90,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLuuNhapText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#F58F4C',
  },
  btnLuuTiepTheo: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnLuuTiepTheoText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ================= SEND MODAL STYLES (TEA-06c) ================= */
  sendModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 6,
  },
  envelopeWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendModalTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    color: '#1E1B2E',
    textAlign: 'center',
  },
  sendModalDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B6880',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 6,
  },
  sendSummaryBox: {
    width: '100%',
    backgroundColor: '#FFF6EF',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    marginBottom: 6,
  },
  sendSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIconGreen: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
  },
  minusIconGray: {
    color: '#887367',
    fontWeight: '800',
    fontSize: 14,
  },
  sendSummaryTextReady: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  sendSummaryTextPending: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B6880',
  },
  summaryHDivider: {
    height: 1,
    backgroundColor: '#FED7AA',
  },
  btnConfirmSend: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  btnConfirmSendText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnDeSau: {
    width: '100%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDeSauText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#6B6880',
  },

  /* ================= SUCCESS SCREEN STYLES (TEA-06d) ================= */
  successRoot: {
    flex: 1,
    backgroundColor: '#FFF3E6',
  },
  successContentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  successIllustrationWrap: {
    width: 200,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  successGlowAura: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  successHeadline: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    color: '#1E1B2E',
    marginTop: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B6880',
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
  },
  successBentoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  successStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  successStatColMiddle: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  successColDividerLeft: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 1,
    backgroundColor: '#F1F5F9',
  },
  successColDividerRight: {
    position: 'absolute',
    right: 0,
    top: 6,
    bottom: 6,
    width: 1,
    backgroundColor: '#F1F5F9',
  },
  successStatNumDark: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  successStatNumGreen: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#10B981',
  },
  successStatNumGray: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#6B6880',
  },
  successStatLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6B6880',
    marginTop: 2,
  },
  successStatLabelGreen: {
    fontSize: 12,
    lineHeight: 16,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 2,
  },
  successBottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 10,
  },
  btnPrimaryOrange: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPrimaryOrangeText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnTextLink: {
    paddingVertical: 6,
  },
  btnTextLinkText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#6B6880',
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(30, 27, 46, 0.25)',
    marginTop: 8,
  },
});
