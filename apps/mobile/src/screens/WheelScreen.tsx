import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  Polygon,
  Polyline,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  G,
  ClipPath,
} from 'react-native-svg';
import { quizService, ORAL_SCORE_QUIZ_ID } from '../services/quiz.service';
import { attendanceService } from '../services/attendance.service';

interface WheelScreenProps {
  currentClassId?: string;
  className?: string;
  subjectName?: string;
  onBack?: () => void;
  onGoHome?: () => void;
}

interface StudentCandidate {
  id: string;
  code: string;
  name: string;
  fullName: string;
  gender: string;
  order: number;
}

export const WheelScreen: React.FC<WheelScreenProps> = ({
  currentClassId = '',
  className = 'Lớp học',
  subjectName = '',
  onBack,
  onGoHome,
}) => {
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentCandidate | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [presentCount, setPresentCount] = useState<number>(0);

  useEffect(() => {
    loadPresentStudents();
  }, [currentClassId]);

  const loadPresentStudents = async () => {
    try {
      const res = await attendanceService.getTodayPresentStudents(currentClassId);
      const formatted: StudentCandidate[] = (res?.present_students || []).map((s, idx) => {
        const parts = s.full_name.trim().split(' ');
        const shortName = parts[parts.length - 1] || s.full_name;
        return {
          id: s.id,
          code: s.student_code || `HS${idx + 1}`,
          name: shortName,
          fullName: s.full_name,
          gender: 'N/A',
          order: idx + 1,
        };
      });
      setStudents(formatted);
      setSelectedStudent(formatted[0] ?? null);
      setPresentCount(res?.total_present ?? formatted.length);
    } catch (e) {
      setStudents([]);
      setSelectedStudent(null);
      setPresentCount(0);
    }
  };

  // Modal chấm điểm miệng
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [inputScore, setInputScore] = useState('');
  const [teacherComment, setTeacherComment] = useState('');

  // Màn hình thành công (Đã lưu điểm miệng)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Animation quay vòng
  const spinValue = useRef(new Animated.Value(0)).current;

  const handleSpin = () => {
    if (isSpinning) return;
    if (students.length === 0) {
      Alert.alert(
        'Chưa có học sinh có mặt',
        'Hôm nay lớp chưa được điểm danh hoặc danh sách có mặt đang trống. Vui lòng điểm danh trước khi dò bài.'
      );
      return;
    }
    setIsSpinning(true);

    const randomExtra = Math.floor(Math.random() * students.length);
    const targetStudent = students[randomExtra];

    // Xoay 5 vòng (1800 độ) + góc của học sinh (theo 12 múi hiển thị trên đồ họa)
    const targetDeg = 1800 + (360 - (randomExtra % 12) * 30);

    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: targetDeg,
      duration: 2500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSelectedStudent(targetStudent);
      setIsSpinning(false);
    });
  };

  const handleSkip = () => {
    if (students.length === 0) return;
    const currentIndex = selectedStudent
      ? students.findIndex((s) => s.id === selectedStudent.id)
      : -1;
    const nextIndex = (currentIndex + 1) % students.length;
    setSelectedStudent(students[nextIndex]);
  };

  const handleSaveScore = async () => {
    if (!selectedStudent) return;
    const score = parseFloat(inputScore);
    if (isNaN(score) || score < 0 || score > 10) {
      Alert.alert('Thông báo', 'Vui lòng nhập điểm hợp lệ trong khoảng 0 đến 10');
      return;
    }
    try {
      await quizService.recordInClassScore(ORAL_SCORE_QUIZ_ID, {
        student_id: selectedStudent.id,
        score,
        teacher_note: teacherComment,
        mode_played: 'GOLDEN_BELL',
        sync_to_scores_table: true,
      });

      setScoreModalVisible(false);
      setShowSuccessScreen(true);
    } catch (e: any) {
      Alert.alert('Thông báo', e.message || 'Không thể lưu điểm');
    }
  };

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // MÀN HÌNH 3: THÀNH CÔNG (ĐÃ LƯU ĐIỂM MIỆNG)
  if (showSuccessScreen) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
          locations={[0, 0.45, 1.0]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeContainer}>
          <ScrollView
            contentContainerStyle={styles.successScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 3D Gold Star & Pencil Illustration (~200px) */}
            <View style={styles.successIllustrationWrap}>
              <Svg width={200} height={200} viewBox="0 0 200 200" fill="none">
                <Defs>
                  <SvgLinearGradient id="goldStar" x1="40" y1="30" x2="160" y2="170" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor="#FFE885" />
                    <Stop offset="0.35" stopColor="#FFC837" />
                    <Stop offset="1" stopColor="#F58F4C" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="checkGrad" x1="75" y1="75" x2="125" y2="125" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor="#34D399" />
                    <Stop offset="1" stopColor="#059669" />
                  </SvgLinearGradient>
                </Defs>

                {/* Outer Ribbon Wings */}
                <G transform="translate(100, 100) rotate(15) translate(-100, -100)">
                  <Path d="M68,142 L52,182 L78,172 L100,185 L90,146 Z" fill="#F58F4C" opacity={0.85} />
                  <Path d="M132,142 L148,182 L122,172 L100,185 L110,146 Z" fill="#EA580C" opacity={0.9} />
                </G>

                {/* 3D Star Badge Base */}
                <Circle cx="100" cy="98" r="58" fill="url(#goldStar)" />

                {/* Bevels */}
                <Path d="M100,52 L112,83 L145,86 L120,108 L128,141 L100,123 L72,141 L80,108 L55,86 L88,83 Z" fill="#FFAA00" opacity="0.4" />
                <Path d="M100,52 L112,83 L100,98 L88,83 Z" fill="#FFEBAA" opacity="0.8" />
                <Path d="M145,86 L120,108 L100,98 L112,83 Z" fill="#FFC938" />

                {/* Circular Inner Badge for Success Checkmark */}
                <Circle cx="100" cy="98" r="32" fill="#FFFFFF" />
                <Circle cx="100" cy="98" r="28" fill="url(#checkGrad)" />

                {/* White Checkmark */}
                <Path d="M88 98 L96 106 L113 88" stroke="#FFFFFF" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />

                {/* Leaning Cute Pencil */}
                <G transform="translate(136, 118) rotate(34) scale(0.9)">
                  <Rect x="0" y="0" width="18" height="14" rx="5" fill="#FDA4AF" />
                  <Rect x="0" y="11" width="18" height="7" fill="#E2E8F0" />
                  <Rect x="0" y="18" width="18" height="38" rx="2" fill="#5E5CE6" />
                  <Polygon points="0,56 18,56 9,72" fill="#FED7AA" />
                  <Polygon points="6,66 12,66 9,72" fill="#1E1B2E" />
                </G>

                {/* Sparkles */}
                <Circle cx="48" cy="156" r="4.5" fill="#FFFFFF" opacity={0.9} />
                <Circle cx="168" cy="158" r="3.5" fill="#FFE27A" opacity={0.8} />
              </Svg>
            </View>

            {/* Title */}
            <Text style={styles.successTitle}>Đã lưu điểm miệng!</Text>
            <Text style={styles.successSubtitle}>
              {subjectName ? `${subjectName} • ` : ''}
              {className}
            </Text>

            {/* White Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <View style={styles.summaryStudentInfo}>
                  <View style={styles.studentAvatarCircle}>
                    <Text style={styles.studentAvatarText}>
                      {selectedStudent
                        ? selectedStudent.name
                            .split(' ')
                            .map((w) => w.charAt(0))
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        : '--'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.summaryStudentName}>{selectedStudent?.fullName || '--'}</Text>
                    <View style={styles.summaryMetaRow}>
                      <View style={styles.summaryCodeBadge}>
                        <Text style={styles.summaryCodeBadgeText}>{selectedStudent?.code || '--'}</Text>
                      </View>
                      <Text style={styles.summaryOrderText}>STT: {selectedStudent?.order ?? '--'}</Text>
                    </View>
                  </View>
                </View>

                {/* Big Score */}
                <View style={styles.summaryScoreWrap}>
                  <Text style={styles.summaryScoreLabel}>Điểm miệng</Text>
                  <Text style={styles.summaryScoreValue}>{inputScore}</Text>
                </View>
              </View>

              {/* Teacher Comment */}
              <View style={styles.summaryCommentWrap}>
                <Text style={styles.summaryCommentTitle}>Nhận xét của cô:</Text>
                <View style={styles.summaryCommentBox}>
                  <Text style={styles.summaryCommentText}>“{teacherComment}”</Text>
                </View>
              </View>

              {/* Bottom Tag */}
              <View style={styles.summaryBottomRow}>
                <View style={styles.greenRecordedBadge}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5}>
                    <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.greenRecordedBadgeText}>Đã ghi vào sổ điểm</Text>
                </View>
                <Text style={styles.timestampText}>Vừa xong • 08:24</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.successActionsArea}>
              <TouchableOpacity
                style={styles.callOtherBtn}
                onPress={() => {
                  setShowSuccessScreen(false);
                  handleSkip();
                }}
                activeOpacity={0.9}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                  <Path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.callOtherBtnText}>Gọi Bạn Khác</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.goHomeLink}
                onPress={onGoHome || onBack}
                activeOpacity={0.7}
              >
                <Text style={styles.goHomeLinkText}>Về Trang Chủ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // MÀN HÌNH 1: VÒNG QUAY MAY MẮN
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityLabel="Quay lại"
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.5}>
                <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.screenTitle}>Dò Bài Cũ</Text>
              <Text style={styles.screenSubtitle}>
                {[subjectName, className].filter(Boolean).join(' • ')}
              </Text>
              <View style={styles.attendancePill}>
                <View style={styles.onlineDot} />
                <Text style={styles.attendancePillText}>{`${presentCount} em có mặt`}</Text>
              </View>
            </View>
          </View>

          {/* 3D Microphone Illustration */}
          <View style={styles.micIllustrationWrap}>
            <Svg width={80} height={80} viewBox="0 0 100 100">
              <Circle cx={50} cy={50} r={40} fill="#FFE3C8" opacity={0.6} />
              <Path d="M22 24 Q22 32 14 32 Q22 32 22 40 Q22 32 30 32 Q22 32 22 24 Z" fill="#F59E0B" />
              <Path d="M82 42 Q82 48 76 48 Q82 48 82 54 Q82 48 88 48 Q82 48 82 42 Z" fill="#F59E0B" />
              <Rect x={42} y={46} width={16} height={34} rx={8} fill="#5E5CE6" transform="rotate(-25 50 63)" />
              <Rect x={44} y={74} width={12} height={6} rx={3} fill="#3B3860" transform="rotate(-25 50 63)" />
              <Circle cx={39} cy={35} r={17} fill="#F58F4C" />
              <Ellipse cx={37} cy={32} rx={13} ry={9} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.8} />
              <Circle cx={32} cy={27} r={4} fill="#FFFFFF" opacity={0.8} />
            </Svg>
          </View>
        </View>

        {/* Wheel Bento Card */}
        <View style={styles.wheelCardContainer}>
          <View style={styles.wheelCard}>
            {/* Pointer at the top pointing down */}
            <View style={styles.topPointerWrap}>
              <Svg width={34} height={42} viewBox="0 0 34 42" fill="none">
                <Path d="M17 40L4 12C2 7.5 5.5 2 10.5 2H23.5C28.5 2 32 7.5 30 12L17 40Z" fill="#1E1B2E" />
                <Path d="M17 37L6 13C4.5 9 7.2 5 11.5 5H22.5C26.8 5 29.5 9 28 13L17 37Z" fill="#F58F4C" />
                <Circle cx={17} cy={14} r={5} fill="#FFFFFF" />
                <Circle cx={17} cy={14} r={2.5} fill="#5E5CE6" />
              </Svg>
            </View>

            {/* 12-Segment Wheel Animated */}
            <View style={styles.wheelWrapper}>
              <Animated.View
                style={[
                  styles.wheelSvgWrap,
                  { transform: [{ rotate: spinInterpolate }] },
                ]}
              >
                <Svg width={286} height={286} viewBox="0 0 300 300">
                  <Defs>
                    <ClipPath id="wheelClip">
                      <Circle cx={150} cy={150} r={148} />
                    </ClipPath>
                  </Defs>
                  <G clipPath="url(#wheelClip)">
                    {/* 12 Segments */}
                    <Path d="M150,150 L111.4,7.1 A148,148 0 0,1 188.6,7.1 Z" fill="#EDEBFF" />
                    <Path d="M150,150 L188.6,7.1 A148,148 0 0,1 254.6,45.4 Z" fill="#FFF1E6" />
                    <Path d="M150,150 L254.6,45.4 A148,148 0 0,1 292.9,111.4 Z" fill="#F58F4C" />
                    <Path d="M150,150 L292.9,111.4 A148,148 0 0,1 292.9,188.6 Z" fill="#FFFFFF" />
                    <Path d="M150,150 L292.9,188.6 A148,148 0 0,1 254.6,254.6 Z" fill="#EDEBFF" />
                    <Path d="M150,150 L254.6,254.6 A148,148 0 0,1 188.6,292.9 Z" fill="#FFF1E6" />
                    <Path d="M150,150 L188.6,292.9 A148,148 0 0,1 111.4,292.9 Z" fill="#F58F4C" />
                    <Path d="M150,150 L111.4,292.9 A148,148 0 0,1 45.4,254.6 Z" fill="#FFFFFF" />
                    <Path d="M150,150 L45.4,254.6 A148,148 0 0,1 7.1,188.6 Z" fill="#EDEBFF" />
                    <Path d="M150,150 L7.1,188.6 A148,148 0 0,1 7.1,111.4 Z" fill="#FFF1E6" />
                    <Path d="M150,150 L7.1,111.4 A148,148 0 0,1 45.4,45.4 Z" fill="#F58F4C" />
                    <Path d="M150,150 L45.4,45.4 A148,148 0 0,1 111.4,7.1 Z" fill="#FFFFFF" />

                    {/* Separators */}
                    <Line x1={150} y1={150} x2={111.4} y2={7.1} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={188.6} y2={7.1} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={254.6} y2={45.4} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={292.9} y2={111.4} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={292.9} y2={188.6} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={254.6} y2={254.6} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={188.6} y2={292.9} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={111.4} y2={292.9} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={45.4} y2={254.6} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={7.1} y2={188.6} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={7.1} y2={111.4} stroke="#FFFFFF" strokeWidth={2.5} />
                    <Line x1={150} y1={150} x2={45.4} y2={45.4} stroke="#FFFFFF" strokeWidth={2.5} />
                  </G>
                </Svg>
              </Animated.View>

              {/* Center Spin Button */}
              <View style={styles.centerSpinWrap}>
                <TouchableOpacity
                  style={styles.centerSpinBtn}
                  onPress={handleSpin}
                  activeOpacity={0.9}
                  disabled={isSpinning}
                >
                  <Text style={styles.centerSpinBtnText}>QUAY</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Result chip */}
            <View style={styles.resultChip}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="#F59E0B">
                <Path d="M12 2L14.7 8.3L21.5 9.1L16.4 13.7L17.8 20.4L12 17L6.2 20.4L7.6 13.7L2.5 9.1L9.3 8.3L12 2Z" />
              </Svg>
              <Text style={styles.resultChipText}>
                Đang gọi: <Text style={styles.resultChipBoldName}>{selectedStudent?.name || '--'}</Text>
              </Text>
            </View>

            <Text style={styles.wheelFootnote}>
              Học sinh được chọn ngẫu nhiên từ danh sách có mặt
            </Text>
          </View>
        </View>

        {/* Fixed Bottom Controls */}
        <View style={styles.fixedBottomBar}>
          <Text style={styles.bottomHintText}>
            Gọi trúng em đã chấm? Bấm <Text style={{ fontWeight: '700', color: '#1E1B2E' }}>Bỏ qua</Text>
          </Text>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={styles.skipBtnText}>Bỏ qua</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.openScoreModalBtn}
            onPress={() => {
              if (!selectedStudent) {
                Alert.alert(
                  'Chưa chọn được học sinh',
                  'Danh sách học sinh có mặt đang trống. Vui lòng điểm danh trước khi dò bài.'
                );
                return;
              }
              setScoreModalVisible(true);
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.openScoreModalBtnText}>Chấm Điểm Miệng</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
              <Path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* MÀN HÌNH 2: MODAL CHẤM ĐIỂM MIỆNG (BOTTOM-SHEET) */}
        <Modal
          visible={scoreModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setScoreModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalDragHandle} />

              <Text style={styles.modalSectionLabel}>Học sinh được gọi</Text>
              <View style={styles.modalStudentRow}>
                <View style={styles.modalStudentLeft}>
                  <View style={styles.modalAvatarCircle}>
                    <Text style={styles.modalAvatarText}>
                      {selectedStudent
                        ? selectedStudent.name
                            .split(' ')
                            .map((w) => w.charAt(0))
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        : '--'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.modalStudentName}>{selectedStudent?.fullName || '--'}</Text>
                    <Text style={styles.modalStudentMeta}>
                      STT: {selectedStudent?.order ?? '--'} • {selectedStudent?.gender || '--'}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalCodeBadge}>
                  <Text style={styles.modalCodeBadgeText}>{selectedStudent?.code || '--'}</Text>
                </View>
              </View>

              {/* Điểm miệng */}
              <Text style={[styles.modalSectionLabel, { marginTop: 12 }]}>Điểm miệng</Text>
              <View style={styles.modalScoreBox}>
                <View style={styles.modalScoreDisplayRow}>
                  <Text style={styles.modalScoreDisplayText}>{inputScore}</Text>
                  <View style={styles.cursorBlink} />
                </View>
                <Text style={styles.modalScoreScale}>Thang 0.0 - 10.0</Text>

                {/* Quick-pick chips */}
                <View style={styles.quickPickRow}>
                  {['7.0', '8.0', '8.5', '9.0', '10'].map((sc) => (
                    <TouchableOpacity
                      key={sc}
                      style={[styles.quickPickBtn, inputScore === sc && styles.quickPickBtnActive]}
                      onPress={() => setInputScore(sc)}
                    >
                      <Text style={[styles.quickPickBtnText, inputScore === sc && styles.quickPickBtnTextActive]}>
                        {sc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Nhận xét */}
              <Text style={[styles.modalSectionLabel, { marginTop: 12 }]}>Nhận xét</Text>
              <View style={styles.commentInputBox}>
                <TextInput
                  style={styles.commentTextInput}
                  value={teacherComment}
                  onChangeText={setTeacherComment}
                  placeholder="Nhận xét ngắn về bài cũ"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.modalSyncNote}>
                Ghi vào cột điểm miệng{subjectName ? ` • ${subjectName}` : ''}
              </Text>

              <TouchableOpacity
                style={styles.saveScoreBtn}
                onPress={handleSaveScore}
                activeOpacity={0.9}
              >
                <Text style={styles.saveScoreBtnText}>Lưu Điểm Miệng</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                  <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setScoreModalVisible(false)}
              >
                <Text style={styles.modalCloseBtnText}>Đóng</Text>
              </TouchableOpacity>
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

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitleWrap: {
    gap: 2,
    flex: 1,
  },
  screenTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  screenSubtitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: '#6B6880',
  },
  attendancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE8D6',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  attendancePillText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#F58F4C',
  },
  micIllustrationWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Wheel Card */
  wheelCardContainer: {
    paddingHorizontal: 20,
    marginTop: 4,
    flex: 1,
  },
  wheelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  topPointerWrap: {
    position: 'absolute',
    top: -6,
    zIndex: 30,
    alignItems: 'center',
  },
  wheelWrapper: {
    width: 286,
    height: 286,
    borderRadius: 143,
    borderWidth: 4,
    borderColor: '#FFF3E6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },
  wheelSvgWrap: {
    width: 286,
    height: 286,
  },
  centerSpinWrap: {
    position: 'absolute',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSpinBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F58F4C',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  centerSpinBtnText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resultChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EDEBFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  resultChipText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#5E5CE6',
  },
  resultChipBoldName: {
    color: '#1E1B2E',
  },
  wheelFootnote: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#6B6880',
    textAlign: 'center',
  },

  /* Fixed Bottom Bar */
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomHintText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B6880',
  },
  skipBtn: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#F58F4C',
  },
  openScoreModalBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  openScoreModalBtnText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Modal Bottom Sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 46, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalSectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6B6880',
    marginBottom: 6,
  },
  modalStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalStudentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDEBFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  modalAvatarText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: '#5E5CE6',
  },
  modalStudentName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  modalStudentMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B6880',
  },
  modalCodeBadge: {
    backgroundColor: '#F1F0FB',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  modalCodeBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#5E5CE6',
  },
  modalScoreBox: {
    backgroundColor: '#FFF1E6',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE6D2',
  },
  modalScoreDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalScoreDisplayText: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#F58F4C',
  },
  cursorBlink: {
    width: 2,
    height: 28,
    backgroundColor: '#F58F4C',
  },
  modalScoreScale: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#6B6880',
    marginTop: 2,
  },
  quickPickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickPickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  quickPickBtnActive: {
    backgroundColor: '#F58F4C',
    borderColor: '#F58F4C',
  },
  quickPickBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  quickPickBtnTextActive: {
    color: '#FFFFFF',
  },
  commentInputBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FBFBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentTextInput: {
    fontSize: 13,
    color: '#1E1B2E',
  },
  modalSyncNote: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B6880',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  saveScoreBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  saveScoreBtnText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCloseBtnText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: '#6B6880',
  },

  /* Màn hình thành công (Success) */
  successScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    alignItems: 'center',
  },
  successIllustrationWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  successTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#1E1B2E',
    marginTop: 8,
  },
  successSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 4,
    marginBottom: 16,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#DC732D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFEA',
  },
  summaryStudentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDEBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#5E5CE6',
  },
  summaryStudentName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  summaryCodeBadge: {
    backgroundColor: '#EDEBFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  summaryCodeBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#5E5CE6',
  },
  summaryOrderText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6B6880',
  },
  summaryScoreWrap: {
    alignItems: 'flex-end',
  },
  summaryScoreLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#6B6880',
    textTransform: 'uppercase',
  },
  summaryScoreValue: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: '#F58F4C',
  },
  summaryCommentWrap: {
    paddingVertical: 12,
  },
  summaryCommentTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6B6880',
    marginBottom: 4,
  },
  summaryCommentBox: {
    backgroundColor: '#FFF8F3',
    borderWidth: 1,
    borderColor: '#FFE7D6',
    borderRadius: 12,
    padding: 10,
  },
  summaryCommentText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#1E1B2E',
  },
  summaryBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  greenRecordedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  greenRecordedBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#059669',
  },
  timestampText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#A3A0B5',
  },
  successActionsArea: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  callOtherBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  callOtherBtnText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  goHomeLink: {
    paddingVertical: 6,
  },
  goHomeLinkText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#6B6880',
  },
});
