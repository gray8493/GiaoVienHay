import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Platform,
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
  Text as SvgText,
} from 'react-native-svg';
import { attendanceService } from '../services/attendance.service';
import { classService } from '../services/class.service';
import { gradesService } from '../services/grades.service';
import { SUBJECT_LABELS } from '../constants/academic';

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

// Bảng màu 12 múi hài hòa, tương phản cao, phong cách UI/UX Pro Max
const SLICE_PALETTE = [
  { bg: '#FF6B4A', dark: '#C83818', text: '#FFFFFF' }, // 0. Cam san hô
  { bg: '#3B82F6', dark: '#1D4ED8', text: '#FFFFFF' }, // 1. Xanh dương
  { bg: '#10B981', dark: '#047857', text: '#FFFFFF' }, // 2. Xanh ngọc
  { bg: '#8B5CF6', dark: '#6D28D9', text: '#FFFFFF' }, // 3. Tím hoa cà
  { bg: '#F59E0B', dark: '#B45309', text: '#FFFFFF' }, // 4. Vàng hổ phách
  { bg: '#EC4899', dark: '#BE185D', text: '#FFFFFF' }, // 5. Hồng phấn
  { bg: '#06B6D4', dark: '#0E7490', text: '#FFFFFF' }, // 6. Xanh lam ngọc
  { bg: '#6366F1', dark: '#4338CA', text: '#FFFFFF' }, // 7. Chàm hoàng gia
  { bg: '#14B8A6', dark: '#0F766E', text: '#FFFFFF' }, // 8. Xanh mòng két
  { bg: '#F97316', dark: '#C2410C', text: '#FFFFFF' }, // 9. Cam cà rốt
  { bg: '#A855F7', dark: '#7E22CE', text: '#FFFFFF' }, // 10. Tím thạch anh
  { bg: '#E11D48', dark: '#9F1239', text: '#FFFFFF' }, // 11. Đỏ anh đào
];

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
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('MATH');
  // Điểm miệng hiện có của từng học sinh (để hỏi xác nhận trước khi ghi đè)
  const [oralScoreMap, setOralScoreMap] = useState<Map<string, number>>(new Map());

  // Animation quay vòng bánh xe
  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotationDeg = useRef(0);

  // Animation kim chỉ nhấp nhô (Wobble)
  const pointerWobble = useRef(new Animated.Value(0)).current;

  // Animation nút ấn QUAY (Scale press)
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadPresentStudents();
  }, [currentClassId]);

  const loadPresentStudents = async () => {
    try {
      const [res, mySubject] = await Promise.all([
        attendanceService.getTodayPresentStudents(currentClassId),
        classService.getMySubject(currentClassId),
      ]);
      const firstSubject = (mySubject.teaching_subjects || [])[0];
      setSelectedSubjectCode(firstSubject ? String(firstSubject) : 'MATH');
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

      // Tải điểm miệng hiện có của môn đang dạy để hỏi xác nhận khi ghi đè
      try {
        const grades: any = await gradesService.getClassGrades(currentClassId, selectedSubjectCode, 1);
        const rows = Array.isArray(grades) ? grades : grades?.rows || [];
        const map = new Map<string, number>();
        for (const r of rows) {
          if (String(r.scoreType || r.score_type || '') !== 'ORAL_TEST') continue;
          const sid = String(r.studentId || r.student_id || '');
          const v = Number(r.scoreValue ?? r.score_value);
          if (sid && !isNaN(v)) map.set(sid, v);
        }
        setOralScoreMap(map);
      } catch {
        setOralScoreMap(new Map());
      }
    } catch (e) {
      setStudents([]);
      setSelectedStudent(null);
      setPresentCount(0);
    }
  };

  // Chuẩn bị danh sách học sinh hiển thị trên nan quạt (Tối ưu từ 6 đến 12 múi để chữ to rõ)
  const wheelSlices = useMemo(() => {
    if (students.length === 0) {
      return [
        { id: '1', code: 'HS01', name: 'Em 1', fullName: 'Học sinh 1', gender: 'N/A', order: 1 },
        { id: '2', code: 'HS02', name: 'Em 2', fullName: 'Học sinh 2', gender: 'N/A', order: 2 },
        { id: '3', code: 'HS03', name: 'Em 3', fullName: 'Học sinh 3', gender: 'N/A', order: 3 },
        { id: '4', code: 'HS04', name: 'Em 4', fullName: 'Học sinh 4', gender: 'N/A', order: 4 },
        { id: '5', code: 'HS05', name: 'Em 5', fullName: 'Học sinh 5', gender: 'N/A', order: 5 },
        { id: '6', code: 'HS06', name: 'Em 6', fullName: 'Học sinh 6', gender: 'N/A', order: 6 },
      ];
    }
    if (students.length < 6) {
      const repeated: StudentCandidate[] = [];
      while (repeated.length < 6) {
        repeated.push(...students);
      }
      return repeated.slice(0, 6);
    }
    if (students.length > 12) {
      // Giới hạn 12 múi để tên học sinh không bị co cụm, giữ thẩm mỹ cao cấp
      return students.slice(0, 12);
    }
    return students;
  }, [students]);

  const totalSlices = wheelSlices.length;
  const sliceAngle = 360 / totalSlices;

  // Modal chấm điểm miệng
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [inputScore, setInputScore] = useState('');
  const [teacherComment, setTeacherComment] = useState('');
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Bắt đầu quay vòng
  const handleSpin = () => {
    if (isSpinning) return;
    if (students.length === 0) {
      Alert.alert(
        'Chưa có học sinh có mặt',
        'Hôm nay lớp chưa được điểm danh hoặc danh sách có mặt đang trống. Vui lòng điểm danh trước khi dò bài.',
      );
      return;
    }

    // Hiệu ứng ấn nút QUAY
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setIsSpinning(true);

    // Chọn ngẫu nhiên 1 học sinh từ danh sách có mặt thực tế
    const randomIndex = Math.floor(Math.random() * students.length);
    const chosenStudent = students[randomIndex];

    // Xác định múi đích tương ứng trên vòng quay
    let targetSliceIdx = wheelSlices.findIndex((s) => s.id === chosenStudent.id);
    if (targetSliceIdx === -1) {
      // Nếu em này ngoài top 12, gán tạm vào múi ngẫu nhiên để kim chỉ đúng
      targetSliceIdx = randomIndex % totalSlices;
    }

    // Góc tâm của múi đích
    const midAngle = (targetSliceIdx + 0.5) * sliceAngle;
    // Góc cần dừng để múi này nằm ngay dưới kim chỉ ở đỉnh (12h = 0 độ)
    const targetStopDeg = (360 - midAngle) % 360;

    // Quay tối thiểu 5 vòng (1800 độ) + góc bù để kim dừng chuẩn xác
    const baseRotations = 1800;
    const finalDegree = currentRotationDeg.current + baseRotations + ((targetStopDeg - (currentRotationDeg.current % 360) + 360) % 360);

    // Bắt đầu lắc kim nhịp nhàng
    pointerWobble.setValue(0);
    const wobbleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pointerWobble, {
          toValue: 1,
          duration: 90,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(pointerWobble, {
          toValue: -1,
          duration: 90,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    wobbleLoop.start();

    Animated.timing(spinValue, {
      toValue: finalDegree,
      duration: 3200,
      easing: Easing.bezier(0.18, 0.89, 0.32, 1.0),
      useNativeDriver: true,
    }).start(() => {
      wobbleLoop.stop();
      Animated.spring(pointerWobble, {
        toValue: 0,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();

      currentRotationDeg.current = finalDegree;
      setSelectedStudent(chosenStudent);
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

  const handleScoreTextChange = (text: string) => {
    const cleaned = text.replace(/[^\d.]/g, '');
    if (!cleaned) {
      setInputScore('');
      return;
    }
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) return;
    const [intPart, decPart, extraPart] = cleaned.split('.');
    if (extraPart !== undefined) return;
    if (decPart !== undefined) {
      if (decPart.length > 1) return;
      if (!intPart) return;
      const joined = `${intPart}.${decPart}`;
      if (Number(joined) > 10) return;
      setInputScore(joined);
      return;
    }
    if (Number(cleaned) > 10) return;
    setInputScore(cleaned);
  };

  const handleSaveScore = async () => {
    if (!selectedStudent) return;
    if (!currentClassId) {
      Alert.alert('Thông báo', 'Chưa xác định được lớp học. Vui lòng chọn lớp trước khi chấm điểm.');
      return;
    }
    const score = parseFloat(inputScore);
    if (isNaN(score) || score < 0 || score > 10) {
      Alert.alert('Thông báo', 'Vui lòng nhập điểm hợp lệ trong khoảng 0 đến 10');
      return;
    }

    const doSave = async () => {
      try {
        await gradesService.batchInputScores({
          class_id: currentClassId,
          subject_code: selectedSubjectCode || 'MATH',
          score_type: 'ORAL_TEST',
          semester: 1,
          is_correction: true,
          scores: [
            {
              student_id: selectedStudent.id,
              score_value: score,
              teacher_comment: teacherComment,
            },
          ],
        });

        // Cập nhật map để lần chấm sau hỏi xác nhận với điểm mới nhất
        setOralScoreMap((prev) => new Map(prev).set(selectedStudent.id, score));
        setScoreModalVisible(false);
        setShowSuccessScreen(true);
      } catch (e: any) {
        Alert.alert('Thông báo', e.message || 'Không thể lưu điểm');
      }
    };

    // Học sinh đã có điểm miệng → hỏi xác nhận trước khi ghi đè
    const oldScore = oralScoreMap.get(selectedStudent.id);
    if (oldScore !== undefined) {
      Alert.alert(
        'Thay đổi điểm miệng?',
        `Em ${selectedStudent.fullName || selectedStudent.name} đang có điểm miệng ${oldScore}. Bạn muốn thay bằng ${score}?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thay đổi', onPress: doSave },
        ],
      );
      return;
    }

    await doSave();
  };

  const subjectLabel =
    SUBJECT_LABELS[selectedSubjectCode] || selectedSubjectCode || subjectName || 'Toán học';

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const pointerInterpolate = pointerWobble.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '10deg'],
  });

  // MÀN HÌNH 3: THÀNH CÔNG (ĐÃ LƯU ĐIỂM MIỆNG)
  if (showSuccessScreen) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={['#FFF8EE', '#FFF1E2', '#FFE6D1']}
          locations={[0, 0.45, 1.0]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeContainer}>
          <ScrollView
            contentContainerStyle={styles.successScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 3D Gold Star & Success Badge Illustration */}
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
                <Path d="M100,52 L112,83 L145,86 L120,108 L128,141 L100,123 L72,141 L80,108 L55,86 L88,83 Z" fill="#FFAA00" opacity="0.4" />
                <Path d="M100,52 L112,83 L100,98 L88,83 Z" fill="#FFEBAA" opacity="0.8" />
                <Path d="M145,86 L120,108 L100,98 L112,83 Z" fill="#FFC938" />

                {/* Circular Inner Badge for Success Checkmark */}
                <Circle cx="100" cy="98" r="32" fill="#FFFFFF" />
                <Circle cx="100" cy="98" r="28" fill="url(#checkGrad)" />
                <Path d="M88 98 L96 106 L113 88" stroke="#FFFFFF" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />

                {/* Leaning Cute Pencil */}
                <G transform="translate(136, 118) rotate(34) scale(0.9)">
                  <Rect x="0" y="0" width="18" height="14" rx="5" fill="#FDA4AF" />
                  <Rect x="0" y="11" width="18" height="7" fill="#E2E8F0" />
                  <Rect x="0" y="18" width="18" height="38" rx="2" fill="#5E5CE6" />
                  <Polygon points="0,56 18,56 9,72" fill="#FED7AA" />
                  <Polygon points="6,66 12,66 9,72" fill="#1E1B2E" />
                </G>

                <Circle cx="48" cy="156" r="4.5" fill="#FFFFFF" opacity={0.9} />
                <Circle cx="168" cy="158" r="3.5" fill="#FFE27A" opacity={0.8} />
              </Svg>
            </View>

            <Text style={styles.successTitle}>Đã lưu điểm miệng!</Text>
            <Text style={styles.successSubtitle}>
              {subjectLabel} • {className}
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

                <View style={styles.summaryScoreWrap}>
                  <Text style={styles.summaryScoreLabel}>Điểm miệng</Text>
                  <Text style={styles.summaryScoreValue}>{inputScore}</Text>
                </View>
              </View>

              {teacherComment ? (
                <View style={styles.summaryCommentWrap}>
                  <Text style={styles.summaryCommentTitle}>Nhận xét của cô:</Text>
                  <View style={styles.summaryCommentBox}>
                    <Text style={styles.summaryCommentText}>“{teacherComment}”</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.summaryBottomRow}>
                <View style={styles.greenRecordedBadge}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5}>
                    <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.greenRecordedBadgeText}>Đã ghi vào sổ điểm</Text>
                </View>
                <Text style={styles.timestampText}>Vừa xong</Text>
              </View>
            </View>

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

  // MÀN HÌNH 1: VÒNG QUAY MAY MẮN 3D
  const WHEEL_RADIUS = 138;
  const CENTER_XY = 150;

  return (
    <View style={styles.root}>
      {/* Background tone kem ấm đồng bộ toàn hệ thống */}
      <LinearGradient
        colors={['#FFF8EE', '#FFF3E5', '#FFE7D1']}
        locations={[0, 0.45, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Họa tiết trang trí nền 3D confetti */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Circle cx="12%" cy="16%" r={3} fill="#F58F4C" opacity={0.3} />
          <Circle cx="88%" cy="14%" r={4} fill="#FFB68B" opacity={0.4} />
          <Circle cx="8%" cy="58%" r={3.5} fill="#5E5CE6" opacity={0.25} />
          <Circle cx="92%" cy="62%" r={4} fill="#F58F4C" opacity={0.35} />
          <Circle cx="45%" cy="8%" r={2.5} fill="#F59E0B" opacity={0.35} />
          {/* Confetti rectangles */}
          <Rect x="20" y="240" width={10} height={5} rx={2} fill="#FF7043" opacity={0.25} transform="rotate(25 25 242)" />
          <Rect x="350" y="220" width={12} height={6} rx={2} fill="#3B82F6" opacity={0.25} transform="rotate(-35 356 223)" />
        </Svg>
      </View>

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
                {[subjectLabel, className].filter(Boolean).join(' • ')}
              </Text>
              <View style={styles.attendancePill}>
                <View style={styles.onlineDot} />
                <Text style={styles.attendancePillText}>{`${presentCount} em có mặt`}</Text>
              </View>
            </View>
          </View>

          {/* 3D Trophy / Golden Mic Illustration */}
          <View style={styles.micIllustrationWrap}>
            <Svg width={74} height={74} viewBox="0 0 100 100">
              <Defs>
                <SvgRadialGradient id="trophyGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFE79A" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#F58F4C" stopOpacity="0" />
                </SvgRadialGradient>
                <SvgLinearGradient id="goldCup" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFF2A3" />
                  <Stop offset="30%" stopColor="#FBBF24" />
                  <Stop offset="70%" stopColor="#F59E0B" />
                  <Stop offset="100%" stopColor="#B45309" />
                </SvgLinearGradient>
              </Defs>
              <Circle cx={50} cy={50} r={38} fill="url(#trophyGlow)" />
              {/* Sparkles */}
              <Path d="M22 24 Q22 30 16 30 Q22 30 22 36 Q22 30 28 30 Q22 30 22 24 Z" fill="#F59E0B" />
              <Path d="M80 34 Q80 39 75 39 Q80 39 80 44 Q80 39 85 39 Q80 39 80 34 Z" fill="#F59E0B" />
              {/* Cute 3D Trophy / Microphone */}
              <Rect x={42} y={48} width={16} height={32} rx={8} fill="#4F46E5" transform="rotate(-25 50 63)" />
              <Rect x={45} y={72} width={10} height={6} rx={3} fill="#312E81" transform="rotate(-25 50 63)" />
              <Circle cx={39} cy={35} r={17} fill="url(#goldCup)" />
              <Ellipse cx={37} cy={32} rx={13} ry={9} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.8} />
              <Circle cx={33} cy={28} r={3.5} fill="#FFFFFF" opacity={0.85} />
            </Svg>
          </View>
        </View>

        {/* Khung Bento Vòng Quay 3D (3D Wheel Card) */}
        <View style={styles.wheelCardContainer}>
          <View style={styles.wheelCard}>
            {/* Kim chỉ 3D Hoàng Gia ở đỉnh (3D Gold Pointer with Wobble) */}
            <Animated.View
              style={[
                styles.topPointerWrap,
                {
                  transform: [{ rotate: pointerInterpolate }],
                },
              ]}
            >
              <Svg width={38} height={48} viewBox="0 0 38 48" fill="none">
                <Defs>
                  <SvgLinearGradient id="pointerGoldL" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFF8CC" />
                    <Stop offset="60%" stopColor="#FBBF24" />
                    <Stop offset="100%" stopColor="#D97706" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="pointerGoldR" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FBBF24" />
                    <Stop offset="60%" stopColor="#D97706" />
                    <Stop offset="100%" stopColor="#92400E" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="pointerGem" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#818CF8" />
                    <Stop offset="100%" stopColor="#4338CA" />
                  </SvgLinearGradient>
                </Defs>

                {/* Drop shadow */}
                <Path d="M19 46 L6 14 C4 9 7.5 4 12.5 4 H25.5 C30.5 4 34 9 32 14 L19 46 Z" fill="rgba(30, 27, 46, 0.28)" />
                {/* Left Bevel */}
                <Path d="M19 43 L8 14 C6.5 10 9 6 13.5 6 H19 V43 Z" fill="url(#pointerGoldL)" />
                {/* Right Bevel */}
                <Path d="M19 43 L30 14 C31.5 10 29 6 24.5 6 H19 V43 Z" fill="url(#pointerGoldR)" />
                {/* Center ridge highlight */}
                <Line x1={19} y1={6} x2={19} y2={43} stroke="#FFFFFF" strokeWidth={1.2} opacity={0.7} />
                {/* Center Gem Pivot */}
                <Circle cx={19} cy={14} r={6.5} fill="url(#pointerGem)" />
                <Circle cx={19} cy={14} r={6.5} stroke="#FFFBEB" strokeWidth={1.5} fill="none" />
                <Circle cx={17.5} cy={12.5} r={1.8} fill="#FFFFFF" opacity={0.8} />
              </Svg>
            </Animated.View>

            {/* Khung chứa Vòng Quay 3D */}
            <View style={styles.wheel3DHousing}>
              {/* Lớp bóng đổ chân đế 3D khối trụ dày */}
              <View style={styles.wheelCylinderShadow} />

              <Animated.View
                style={[
                  styles.wheelSvgWrap,
                  { transform: [{ rotate: spinInterpolate }] },
                ]}
              >
                <Svg width={300} height={300} viewBox="0 0 300 300">
                  <Defs>
                    {/* Vành ngoài kim loại vàng đúc (3D Metallic Gold Rim) */}
                    <SvgLinearGradient id="goldRimGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFBEB" />
                      <Stop offset="25%" stopColor="#FDE68A" />
                      <Stop offset="50%" stopColor="#F59E0B" />
                      <Stop offset="80%" stopColor="#D97706" />
                      <Stop offset="100%" stopColor="#78350F" />
                    </SvgLinearGradient>

                    {/* Vành bóng phản chiếu bên trong */}
                    <SvgRadialGradient id="innerShineGrad" cx="50%" cy="50%" r="50%">
                      <Stop offset="65%" stopColor="rgba(255,255,255,0)" />
                      <Stop offset="90%" stopColor="rgba(255,255,255,0.3)" />
                      <Stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
                    </SvgRadialGradient>
                  </Defs>

                  {/* 1. NỀN BÁNH XE */}
                  <Circle
                    cx={CENTER_XY}
                    cy={CENTER_XY}
                    r={WHEEL_RADIUS + 8}
                    fill="#B45309"
                  />

                  {/* 2. CÁC MÚI NAN QUẠT VÀ TÊN HỌC SINH */}
                  {wheelSlices.map((student, idx) => {
                    const color = SLICE_PALETTE[idx % SLICE_PALETTE.length];
                    const startDeg = idx * sliceAngle;
                    const endDeg = (idx + 1) * sliceAngle;
                    const midDeg = (idx + 0.5) * sliceAngle;

                    const radStart = (startDeg * Math.PI) / 180;
                    const radEnd = (endDeg * Math.PI) / 180;

                    const x1 = CENTER_XY + WHEEL_RADIUS * Math.sin(radStart);
                    const y1 = CENTER_XY - WHEEL_RADIUS * Math.cos(radStart);
                    const x2 = CENTER_XY + WHEEL_RADIUS * Math.sin(radEnd);
                    const y2 = CENTER_XY - WHEEL_RADIUS * Math.cos(radEnd);

                    const largeArc = sliceAngle > 180 ? 1 : 0;
                    const pathData = `M ${CENTER_XY} ${CENTER_XY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

                    // Tên hiển thị (Tối đa 7 ký tự để không bị cắt)
                    const displayName = student.name.length > 8 ? student.name.slice(0, 7) + '…' : student.name;

                    return (
                      <G key={`slice_${student.id}_${idx}`}>
                        {/* Nan quạt */}
                        <Path d={pathData} fill={color.bg} />

                        {/* Viền ngăn cách nan quạt */}
                        <Line
                          x1={CENTER_XY}
                          y1={CENTER_XY}
                          x2={x2.toFixed(2)}
                          y2={y2.toFixed(2)}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                          opacity={0.85}
                        />

                        {/* TÊN HỌC SINH TRÊN NAN QUẠT (Tự động xoay xuôi mắt để không bị lộn ngược đầu) */}
                        {(() => {
                          const isBottomHalf = midDeg > 90 && midDeg < 270;
                          const rot = isBottomHalf ? midDeg + 180 : midDeg;
                          const textY = isBottomHalf ? 254 : (totalSlices > 10 ? 50 : 46);
                          const shadowY = isBottomHalf ? 255 : (totalSlices > 10 ? 51 : 47);
                          const dotY = isBottomHalf ? 236 : 64;
                          const orderY = isBottomHalf ? 224 : 77;

                          return (
                            <G rotation={rot} origin={`${CENTER_XY}, ${CENTER_XY}`}>
                              {/* Text shadow mờ tạo chiều sâu 3D */}
                              <SvgText
                                x={CENTER_XY}
                                y={shadowY}
                                fill="rgba(0,0,0,0.4)"
                                fontSize={totalSlices > 10 ? 11.5 : 13}
                                fontWeight="bold"
                                textAnchor="middle"
                                letterSpacing={0.4}
                              >
                                {displayName}
                              </SvgText>

                              {/* Tên chính chữ trắng sắc nét */}
                              <SvgText
                                x={CENTER_XY}
                                y={textY}
                                fill="#FFFFFF"
                                fontSize={totalSlices > 10 ? 11.5 : 13}
                                fontWeight="bold"
                                textAnchor="middle"
                                letterSpacing={0.4}
                              >
                                {displayName}
                              </SvgText>

                              {/* Chấm ngọc / Số thứ tự học sinh */}
                              <Circle
                                cx={CENTER_XY}
                                cy={dotY}
                                r={totalSlices > 10 ? 2.8 : 3.2}
                                fill="rgba(255,255,255,0.8)"
                              />
                              <SvgText
                                x={CENTER_XY}
                                y={orderY}
                                fill="rgba(255,255,255,0.95)"
                                fontSize={8.5}
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {student.order ? `#${student.order}` : ''}
                              </SvgText>
                            </G>
                          );
                        })()}
                      </G>
                    );
                  })}

                  {/* Viền bóng đổ 3D nhẹ ở mép trong vành */}
                  <Circle
                    cx={CENTER_XY}
                    cy={CENTER_XY}
                    r={WHEEL_RADIUS - 1}
                    stroke="rgba(0, 0, 0, 0.2)"
                    strokeWidth={2.5}
                    fill="none"
                  />

                  {/* 3. VÀNH ĐÚC KIM LOẠI 3D ĐÈ LÊN MÉP NGOÀI */}
                  <Circle
                    cx={CENTER_XY}
                    cy={CENTER_XY}
                    r={WHEEL_RADIUS + 3}
                    stroke="url(#goldRimGrad)"
                    strokeWidth={14}
                    fill="none"
                  />
                  <Circle
                    cx={CENTER_XY}
                    cy={CENTER_XY}
                    r={WHEEL_RADIUS - 3}
                    stroke="#FFFBEB"
                    strokeWidth={1.5}
                    fill="none"
                    opacity={0.8}
                  />

                  {/* 3. CÁC ĐINH TÁN NGỌC VÀNG KIM 3D QUANH VÀNH (3D Gold Rivets) */}
                  {Array.from({ length: 12 }).map((_, rIdx) => {
                    const rDeg = rIdx * 30;
                    const rRad = (rDeg * Math.PI) / 180;
                    const rx = CENTER_XY + 145 * Math.sin(rRad);
                    const ry = CENTER_XY - 145 * Math.cos(rRad);
                    return (
                      <G key={`rivet_${rIdx}`}>
                        {/* Shadow */}
                        <Circle cx={rx} cy={ry + 0.8} r={4.5} fill="#78350F" opacity={0.7} />
                        {/* Gold Base */}
                        <Circle cx={rx} cy={ry} r={4} fill="#FDE047" />
                        <Circle cx={rx} cy={ry} r={2.8} fill="#F59E0B" />
                        {/* Highlight */}
                        <Circle cx={rx - 1} cy={ry - 1} r={1.2} fill="#FFFFFF" opacity={0.9} />
                      </G>
                    );
                  })}
                </Svg>
              </Animated.View>

              {/* 4. NÚT ẤN VÒM 3D TRUNG TÂM "QUAY" (3D Central Dome Button) */}
              <View style={styles.centerSpinWrap}>
                <TouchableOpacity
                  onPress={handleSpin}
                  activeOpacity={0.88}
                  disabled={isSpinning}
                >
                  <Animated.View
                    style={[
                      styles.centerSpinBtn3D,
                      {
                        transform: [{ scale: buttonScale }],
                      },
                    ]}
                  >
                    <Svg width={78} height={78} viewBox="0 0 78 78">
                      <Defs>
                        {/* Vành mạ vàng kim chrome */}
                        <SvgLinearGradient id="btnRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFDEB" />
                          <Stop offset="50%" stopColor="#FBBF24" />
                          <Stop offset="100%" stopColor="#92400E" />
                        </SvgLinearGradient>

                        {/* Vòm cầu đỏ cam 3D */}
                        <SvgRadialGradient id="domeGrad" cx="40%" cy="35%" r="65%">
                          <Stop offset="0%" stopColor="#FF855D" />
                          <Stop offset="45%" stopColor="#FF5722" />
                          <Stop offset="85%" stopColor="#EA580C" />
                          <Stop offset="100%" stopColor="#9A3412" />
                        </SvgRadialGradient>

                        {/* Highlight phản quang thủy tinh */}
                        <SvgLinearGradient id="glossHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
                          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                        </SvgLinearGradient>
                      </Defs>

                      {/* Khối đế viền mạ vàng */}
                      <Circle cx={39} cy={40} r={37} fill="#78350F" />
                      <Circle cx={39} cy={39} r={36} fill="url(#btnRimGrad)" />
                      <Circle cx={39} cy={39} r={32} fill="#FFFFFF" />

                      {/* Mặt vòm cầu 3D cam lửa */}
                      <Circle cx={39} cy={39} r={30} fill="url(#domeGrad)" />

                      {/* Dải sáng phản quang cong bán nguyệt ở nửa trên */}
                      <Ellipse cx={39} cy={24} rx={19} ry={9} fill="url(#glossHighlight)" />

                      {/* Tia chớp / Ngôi sao nhỏ */}
                      <Path
                        d="M39 17 L40.5 21 L44.5 22.5 L40.5 24 L39 28 L37.5 24 L33.5 22.5 L37.5 21 Z"
                        fill="#FFF3B0"
                        opacity={0.8}
                      />
                    </Svg>

                    {/* Text "QUAY" nổi 3D in hoa */}
                    <View style={styles.centerTextWrap}>
                      <Text style={styles.centerSpinBtnText}>QUAY</Text>
                      <Text style={styles.centerSpinSubText}>SPIN</Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. THẺ HỌC SINH ĐƯỢC GỌI 3D (Student Spotlight Bento Card) */}
            <View style={styles.studentSpotlightCard}>
              {selectedStudent ? (
                <View style={styles.spotlightContentRow}>
                  {/* Avatar 3D học sinh */}
                  <View style={styles.spotlightAvatarCircle}>
                    <Text style={styles.spotlightAvatarText}>
                      {selectedStudent.name
                        .split(' ')
                        .map((w) => w.charAt(0))
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                    <View style={styles.spotlightOrderBadge}>
                      <Text style={styles.spotlightOrderText}>#{selectedStudent.order}</Text>
                    </View>
                  </View>

                  {/* Thông tin học sinh */}
                  <View style={styles.spotlightInfoWrap}>
                    <View style={styles.spotlightBadgeRow}>
                      <View style={styles.callingBadge}>
                        <View style={styles.pulsingGreenDot} />
                        <Text style={styles.callingBadgeText}>
                          {isSpinning ? 'ĐANG QUAY VÒNG...' : 'ĐANG GỌI LÊN BẢNG'}
                        </Text>
                      </View>
                      <Text style={styles.spotlightCodeText}>{selectedStudent.code}</Text>
                    </View>

                    <Text style={styles.spotlightStudentName} numberOfLines={1}>
                      {isSpinning ? 'Đang chọn em...' : selectedStudent.fullName}
                    </Text>
                    <Text style={styles.spotlightClassMeta}>
                      {className} • {subjectLabel}
                    </Text>
                  </View>

                  {/* Nút đổi nhanh em khác */}
                  <TouchableOpacity
                    style={styles.quickSkipIconBtn}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                    accessibilityLabel="Đổi bạn khác"
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.2}>
                      <Path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.spotlightEmptyState}>
                  <Text style={styles.spotlightEmptyText}>
                    Chạm nút <Text style={{ fontWeight: '800', color: '#F58F4C' }}>QUAY</Text> ở tâm để gọi ngẫu nhiên một em lên bảng
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.wheelFootnote}>
              Tên học sinh hiển thị trực tiếp trên vòng quay • Ngẫu nhiên 100%
            </Text>
          </View>
        </View>

        {/* Thanh Điều Khiển Đáy Cố Định (Fixed Bottom Bar) */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.actionRow}>
            {/* Nút Bỏ qua */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleSkip}
              activeOpacity={0.8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.2}>
                <Path d="M5 4l10 8-10 8V4z" fill="#F58F4C" />
                <Line x1="19" y1="5" x2="19" y2="19" strokeLinecap="round" />
              </Svg>
              <Text style={styles.skipBtnText}>Bỏ qua</Text>
            </TouchableOpacity>

            {/* Nút Chấm Điểm Miệng 3D */}
            <TouchableOpacity
              style={styles.openScoreModalBtn}
              onPress={() => {
                if (!selectedStudent) {
                  Alert.alert(
                    'Chưa chọn được học sinh',
                    'Danh sách học sinh có mặt đang trống. Vui lòng điểm danh trước khi dò bài.',
                  );
                  return;
                }
                setScoreModalVisible(true);
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FFA26B', '#F58F4C', '#EA580C']}
                locations={[0, 0.5, 1.0]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.4}>
                <Path d="M12 20h9" strokeLinecap="round" />
                <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.openScoreModalBtnText}>Chấm Điểm Miệng</Text>
            </TouchableOpacity>
          </View>
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

              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Chấm Điểm Miệng</Text>
                <TouchableOpacity
                  style={styles.modalCloseIconBtn}
                  onPress={() => setScoreModalVisible(false)}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                    <Line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                    <Line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Học sinh được chọn */}
              <View style={styles.modalStudentCard}>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalStudentName}>{selectedStudent?.fullName || '--'}</Text>
                  <Text style={styles.modalStudentMeta}>
                    STT: {selectedStudent?.order ?? '--'} • Mã: {selectedStudent?.code || '--'} • {className}
                  </Text>
                </View>
              </View>

              {/* Thang điểm & Ô nhập điểm */}
              <Text style={styles.modalSectionLabel}>Điểm số (Thang 0 - 10)</Text>
              <View style={styles.modalScoreBox}>
                <TextInput
                  style={styles.modalScoreInput}
                  value={inputScore}
                  onChangeText={handleScoreTextChange}
                  placeholder="0.0"
                  placeholderTextColor="#E8C4A8"
                  keyboardType="numeric"
                  textAlign="center"
                  maxLength={4}
                />
              </View>

              {/* Nhận xét giáo viên */}
              <Text style={[styles.modalSectionLabel, { marginTop: 16 }]}>Nhận xét về bài cũ</Text>
              <View style={styles.commentInputBox}>
                <TextInput
                  style={styles.commentTextInput}
                  value={teacherComment}
                  onChangeText={setTeacherComment}
                  placeholder="Nhập nhận xét của thầy/cô về bài cũ..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.modalSyncNote}>
                Điểm sẽ tự động ghi vào cột Điểm miệng • {subjectLabel}
              </Text>

              {/* Nút Lưu điểm */}
              <TouchableOpacity
                style={styles.saveScoreBtn}
                onPress={handleSaveScore}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#FFA26B', '#F58F4C', '#EA580C']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.saveScoreBtnText}>Lưu Điểm Miệng</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                  <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
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
    backgroundColor: '#FFF8EE',
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
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE7D3',
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
    fontWeight: '600',
    color: '#887367',
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
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
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
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Wheel Bento Card */
  wheelCardContainer: {
    paddingHorizontal: 18,
    marginTop: 4,
    flex: 1,
  },
  wheelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFE7D3',
  },
  topPointerWrap: {
    position: 'absolute',
    top: 0,
    zIndex: 40,
    alignItems: 'center',
  },
  wheel3DHousing: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    position: 'relative',
  },
  wheelCylinderShadow: {
    position: 'absolute',
    width: 296,
    height: 296,
    borderRadius: 148,
    backgroundColor: '#78350F',
    top: 6,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  wheelSvgWrap: {
    width: 300,
    height: 300,
  },
  centerSpinWrap: {
    position: 'absolute',
    zIndex: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSpinBtn3D: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  centerTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 24,
  },
  centerSpinBtnText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  centerSpinSubText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '800',
    color: '#FFF2CC',
    letterSpacing: 1,
  },

  /* Thẻ học sinh được gọi Spotlight 3D */
  studentSpotlightCard: {
    width: '100%',
    backgroundColor: '#FFFBF7',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FFE2C7',
    marginTop: 14,
    marginBottom: 6,
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  spotlightContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spotlightAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF7043',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFE0B2',
    position: 'relative',
  },
  spotlightAvatarText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  spotlightOrderBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1E1B2E',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  spotlightOrderText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFB68B',
  },
  spotlightInfoWrap: {
    flex: 1,
    gap: 2,
  },
  spotlightBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  callingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EDEBFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  callingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5E5CE6',
    letterSpacing: 0.3,
  },
  spotlightCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#887367',
  },
  spotlightStudentName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  spotlightClassMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#887367',
  },
  quickSkipIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE0C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightEmptyState: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  spotlightEmptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#887367',
    textAlign: 'center',
  },
  wheelFootnote: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#A39287',
    textAlign: 'center',
    marginTop: 4,
  },

  /* Fixed Bottom Bar */
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFE7D3',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skipBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  skipBtnText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#F58F4C',
  },
  openScoreModalBtn: {
    flex: 2,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  openScoreModalBtnText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Modal Bottom Sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 46, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  modalCloseIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStudentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF8F3',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE7D6',
    marginBottom: 14,
  },
  modalAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF7043',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalStudentName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  modalStudentMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#887367',
    marginTop: 2,
  },
  modalSectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#6B6880',
    marginBottom: 8,
  },
  modalScoreBox: {
    backgroundColor: '#FFF1E6',
    borderRadius: 18,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE6D2',
  },
  modalScoreInput: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: '#F58F4C',
    padding: 0,
    minWidth: 100,
  },
  commentInputBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FBFBFE',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  commentTextInput: {
    fontSize: 13,
    color: '#1E1B2E',
  },
  modalSyncNote: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#887367',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  saveScoreBtn: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EA580C',
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
    borderColor: '#FFE7D3',
    shadowColor: '#C97A3E',
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
    backgroundColor: '#FF7043',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
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
    shadowColor: '#EA580C',
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
