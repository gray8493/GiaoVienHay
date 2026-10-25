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
  Alert,
  Dimensions,
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
import { classService, SUBJECT_LABELS, SCHOOL_SUBJECTS } from '../services/class.service';
import { Crown3D, Trophy3D } from '../components/Podium3DAssets';

const buildSubjectOptions = (codes: string[]) => {
  const unique = Array.from(new Set(codes.filter(Boolean)));
  return unique.map((code) => ({ code, label: SUBJECT_LABELS[code] || code }));
};

// Tuần hiện tại tính từ đầu năm học (tháng 9) để nhãn vinh danh luôn đúng thời điểm
const getCurrentAcademicWeek = (date: Date = new Date()) => {
  const startYear = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
  const academicYearStart = new Date(startYear, 8, 1);
  const days = Math.floor((date.getTime() - academicYearStart.getTime()) / 86400000);
  return Math.max(1, Math.floor(days / 7) + 1);
};

// Bề rộng ô điểm: tính sao cho cả 5 cột (Miệng/15p/1 Tiết/Thi GK/Thi CK) khít 1 hàng
// 56 = padding màn hình + padding card, 32 = 4 gap giữa 5 ô
const SCORE_BOX_W = (Dimensions.get('window').width - 56 - 32) / 5;

// 5 cột điểm chuẩn backend (key FE field + score_type API + nhãn hiển thị)
const SCORE_COLUMNS = [
  { key: 'oral', type: 'ORAL_TEST', label: 'Miệng' },
  { key: 'test15p', type: 'TEST_15P', label: '15 phút' },
  { key: 'test1p', type: 'TEST_1P', label: '1 Tiết' },
  { key: 'midTerm', type: 'MID_TERM', label: 'Thi GK' },
  { key: 'final', type: 'FINAL', label: 'Thi CK' },
] as const;

type ScoreColKey = (typeof SCORE_COLUMNS)[number]['key'];

// Hệ số nhân để tính điểm trung bình tổng (công thức phổ thông: TX 1 / 15p 2 / 1 tiết 3 / GK 2 / CK 3)
const SCORE_WEIGHTS: Record<ScoreColKey, number> = {
  oral: 1,
  test15p: 2,
  test1p: 3,
  midTerm: 2,
  final: 3,
};

// Tính điểm TB tổng của học sinh theo trọng số, chỉ tính các cột đã có điểm
const computeStudentAverage = (s: StudentGrade | null): number | null => {
  if (!s) return null;
  let scoreSum = 0;
  let weightSum = 0;
  for (const col of SCORE_COLUMNS) {
    const v = s[col.key];
    if (v === null || v === undefined) continue;
    scoreSum += v * SCORE_WEIGHTS[col.key];
    weightSum += SCORE_WEIGHTS[col.key];
  }
  return weightSum > 0 ? scoreSum / weightSum : null;
};

// Xếp hạng theo đúng điểm TB (có trọng số) hiển thị trên badge:
// Giỏi >= 8.0, Khá >= 6.5, còn lại (hoặc chưa có điểm) -> Trung Bình
const classifyStudent = (s: StudentGrade): 'good' | 'fair' | 'avg' => {
  const avg = computeStudentAverage(s);
  if (avg === null) return 'avg';
  if (avg >= 8.0) return 'good';
  if (avg >= 6.5) return 'fair';
  return 'avg';
};

interface StudentGrade {
  id: string;
  rank: number;
  name: string;
  oral: number | null;
  test15p: number | null;
  test1p: number | null;
  midTerm: number | null;
  final?: number | null;
}

interface GradebookScreenProps {
  currentClassId: string;
  className?: string;
  onBackToHome?: () => void;
  onTabChange?: (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => void;
}

export const GradebookScreen: React.FC<GradebookScreenProps> = ({
  currentClassId,
  className = 'Lớp học',
  onBackToHome,
  onTabChange,
}) => {
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'good' | 'fair' | 'need_effort'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quản lý môn học & chế độ Xem (Visibility / Read-only) theo Backend & phân quyền
  const [selectedSubject, setSelectedSubject] = useState<string>('MATH');
  const [subjectOptions, setSubjectOptions] = useState<{ code: string; label: string }[]>([{ code: 'MATH', label: 'Toán' }]);
  const [isClassHomeroom, setIsClassHomeroom] = useState<boolean>(false);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [pickerView, setPickerView] = useState<'subject' | 'semester' | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    loadGradebookData();
  }, [currentClassId, selectedSubject, selectedSemester]);

  const loadGradebookData = async () => {
    setIsLoading(true);
    try {
      const [gradesRes, lbRes, classDetail] = await Promise.all([
        gradesService.getClassGrades(currentClassId, selectedSubject, selectedSemester).catch(() => null),
        gradesService.getLeaderboard(currentClassId, selectedSubject, selectedSemester).catch(() => null),
        classService.getClassDetail(currentClassId).catch(() => null),
      ]);

      // Xác định GVCN + danh sách môn theo quyền: GVCN xem đủ môn của trường,
      // GVBM chỉ đúng môn được phân công (chuỗi dữ liệu thật: phân công lớp → my-subject → hồ sơ)
      const role = await classService
        .getMyRoleInClass(currentClassId, classDetail)
        .catch(() => ({
          isHomeroom: false,
          myAssignedCodes: [],
          allAssignedCodes: [],
          apiSubjectCodes: [],
          profileSubjectCodes: [],
        }));
      setIsClassHomeroom(role.isHomeroom);
      if (role.isHomeroom) {
        setSubjectOptions(buildSubjectOptions([...role.allAssignedCodes, ...SCHOOL_SUBJECTS]));
      } else {
        const mine = role.myAssignedCodes.length > 0
          ? role.myAssignedCodes
          : role.apiSubjectCodes.length > 0
          ? role.apiSubjectCodes
          : role.profileSubjectCodes;
        setSubjectOptions(buildSubjectOptions(mine));
      }

      if (lbRes && lbRes.top_students && lbRes.top_students.length > 0) {
        setLeaderboard(lbRes.top_students);
      } else {
        setLeaderboard([]);
      }

      if (classDetail && classDetail.students && classDetail.students.length > 0) {
        // API trả về các dòng điểm phẳng: { studentId/student_id, scoreType/score_type, scoreValue/score_value, term }
        // Nhóm theo học sinh + lọc học kỳ, rồi map sang các trường hiển thị
        const scoreRows: any[] = Array.isArray(gradesRes) ? gradesRes : [];
        const scoresByStudent = new Map<string, any[]>();
        for (const row of scoreRows) {
          const sid = row.student_id ?? row.studentId;
          if (!sid) continue;
          if (!scoresByStudent.has(sid)) scoresByStudent.set(sid, []);
          scoresByStudent.get(sid)!.push(row);
        }
        const pickValue = (rows: any[], scoreType: string): number | null => {
          let latest: any = null;
          for (const sc of rows) {
            const type = String(sc.scoreType ?? sc.score_type ?? '');
            if (type !== scoreType) continue;
            // Nếu có nhiều bản ghi cùng loại, ưu tiên bản ghi mới nhất (lần chấm sau thắng)
            if (
              latest === null ||
              String(sc.createdAt ?? sc.created_at ?? '') >
                String(latest.createdAt ?? latest.created_at ?? '')
            ) {
              latest = sc;
            }
          }
          if (!latest) return null;
          const raw = latest.scoreValue ?? latest.score_value;
          const num = Number(raw);
          if (raw === null || raw === undefined || isNaN(num)) return null;
          return num;
        };

        const mapped: StudentGrade[] = classDetail.students.map((s: any, idx: number) => {
          const studentScores = (scoresByStudent.get(s.id) || []).filter(
            (r: any) => !r.term || Number(r.term) === selectedSemester,
          );
          const oral = pickValue(studentScores, 'ORAL_TEST');
          const test15p = pickValue(studentScores, 'TEST_15P');
          const test1p = pickValue(studentScores, 'TEST_1P');
          const midTerm = pickValue(studentScores, 'MID_TERM');
          const finalScore = pickValue(studentScores, 'FINAL');

          return {
            id: s.id,
            rank: idx + 1,
            name: s.full_name || s.name || `Học sinh ${idx + 1}`,
            oral,
            test15p,
            test1p,
            midTerm,
            final: finalScore,
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

  // Môn không được phân công sẽ do backend chặn quyền (403); chế độ xem chỉ từ nút mắt
  const isReadOnly = isPreviewMode;

  // Modal 1: Nhập điểm (TEA-06b)
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
  const [activeScoreType, setActiveScoreType] = useState<ScoreColKey>('test1p');
  const [inputScore, setInputScore] = useState('');
  // Bản nháp các cột đã gõ trong phiên mở modal (chưa lưu API): đổi qua đổi lại cột không mất số
  const [draftScores, setDraftScores] = useState<Partial<Record<ScoreColKey, string>>>({});
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Modal 2: Gửi sổ liên lạc (TEA-06c)
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Screen 4: Thành công (TEA-06d)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const getSubjectDisplayName = () => {
    return SUBJECT_LABELS[selectedSubject] || selectedSubject;
  };

  // Đổi học kỳ
  const handlePickSemester = (semester: number) => {
    setSelectedSemester(semester);
    setPickerView(null);
  };

  // Định dạng điểm hiển thị trên pill cột điểm
  const formatScorePill = (v: number | null | undefined) =>
    v !== null && v !== undefined ? v.toFixed(1) : '--';

  // Giá trị hiển thị trên pill: ưu tiên bản nháp đang gõ, sau đó mới đến điểm đã lưu
  const getPillScoreText = (colKey: ScoreColKey) => {
    const draft = draftScores[colKey];
    if (draft !== undefined && draft.trim() !== '') {
      const num = parseFloat(draft);
      return isNaN(num) ? '--' : num.toFixed(1);
    }
    return formatScorePill(selectedStudent?.[colKey]);
  };

  // Mở modal nhập điểm cho học sinh (chỉ cho phép khi không ở chế độ Read-only)
  const handleOpenScoreModal = (student: StudentGrade, scoreType?: ScoreColKey) => {
    if (isReadOnly) return;
    setSelectedStudent(student);
    setDraftScores({});
    if (scoreType) {
      setActiveScoreType(scoreType);
      const val = student[scoreType];
      setInputScore(val !== null && val !== undefined ? val.toFixed(1) : '');
    } else {
      setActiveScoreType('test1p');
      setInputScore(student.test1p !== null ? student.test1p.toFixed(1) : '');
    }
    setScoreModalVisible(true);
  };

  // Đổi cột điểm: ưu tiên bản nháp vừa gõ ở cột đó, không có mới nạp điểm đã lưu
  const switchScoreType = (type: ScoreColKey) => {
    setActiveScoreType(type);
    const draft = draftScores[type];
    if (draft !== undefined) {
      setInputScore(draft);
      return;
    }
    const val = selectedStudent ? selectedStudent[type] : null;
    setInputScore(val !== null && val !== undefined ? val.toFixed(1) : '');
  };

  // Ghi luôn số đang gõ vào bản nháp của cột hiện tại
  const setCurrentInputValue = (value: string) => {
    setInputScore(value);
    setDraftScores((prev) => ({ ...prev, [activeScoreType]: value }));
  };

  // Nhập số trên keypad
  const handleKeypadPress = (val: string) => {
    if (val === 'DEL') {
      if (inputScore.length > 0) {
        setCurrentInputValue(inputScore.slice(0, -1));
      }
    } else if (val === '.') {
      if (!inputScore.includes('.')) {
        setCurrentInputValue(inputScore.length === 0 ? '0.' : inputScore + '.');
      }
    } else {
      if (inputScore.length < 4) {
        const nextVal = inputScore + val;
        const num = parseFloat(nextVal);
        if (!isNaN(num) && num <= 10) {
          setCurrentInputValue(nextVal);
        }
      }
    }
  };

  // Lưu TOÀN BỘ cột đã gõ (bản nháp) cho học sinh này, lưu xong đóng modal
  // (không tự nhảy sang học sinh khác — giáo viên tự bấm ô điểm của học sinh tiếp theo)
  const handleSaveScore = async () => {
    if (!selectedStudent || isSavingScore) return;
    const entries: Array<{ colKey: ScoreColKey; value: number }> = [];
    for (const col of SCORE_COLUMNS) {
      const raw = (draftScores[col.key] ?? '').trim();
      if (raw === '') continue;
      const num = parseFloat(raw);
      if (isNaN(num) || num < 0 || num > 10) {
        Alert.alert('Thông báo', `Điểm cột ${col.label} không hợp lệ. Vui lòng nhập giá trị từ 0 đến 10.`);
        return;
      }
      entries.push({ colKey: col.key, value: num });
    }
    if (entries.length === 0) {
      Alert.alert('Thông báo', 'Bạn chưa nhập điểm nào cho học sinh này');
      return;
    }
    setIsSavingScore(true);

    // Gọi backend API trước, chỉ cập nhật state khi lưu thành công
    try {
      for (const entry of entries) {
        const col = SCORE_COLUMNS.find((c) => c.key === entry.colKey)!;
        await gradesService.batchInputScores({
          class_id: currentClassId,
          subject_code: selectedSubject,
          score_type: col.type,
          semester: selectedSemester,
          scores: [
            {
              student_id: selectedStudent.id,
              score_value: entry.value,
            },
          ],
        });
      }
    } catch (e: any) {
      setIsSavingScore(false);
      Alert.alert('Lỗi', e.message || 'Không thể lưu điểm');
      return;
    }

    // Cập nhật state học sinh rồi đóng modal để giáo viên tự bấm ô của học sinh khác
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStudent.id) return s;
        const next = { ...s };
        for (const entry of entries) {
          (next as any)[entry.colKey] = entry.value;
        }
        return next;
      })
    );
    setIsSavingScore(false);
    setScoreModalVisible(false);
  };

  // Cột điểm đã có dữ liệu / chưa có dữ liệu (tính từ bảng điểm hiện tại)
  const filledCols = SCORE_COLUMNS.filter((c) =>
    students.some((s) => s[c.key] !== null && s[c.key] !== undefined)
  );
  const missingCols = SCORE_COLUMNS.filter(
    (c) => !filledCols.includes(c)
  );

  // Đã gõ điểm nào trong modal (bản nháp + ô hiện tại) để sáng nút Lưu
  const hasDraftScores =
    Object.values(draftScores).some((v) => (v ?? '').trim() !== '') ||
    inputScore.trim() !== '';

  // Xác nhận gửi sổ liên lạc: chỉ công bố các cột ĐÃ CÓ điểm, bỏ qua cột trống
  // (tránh lỗi backend NO_SCORES_TO_PUBLISH khi cột active chưa nhập điểm nào)
  const handleConfirmSendGradebook = async () => {
    if (isSending) return;
    if (filledCols.length === 0) {
      Alert.alert('Thông báo', 'Chưa có cột điểm nào có dữ liệu. Vui lòng nhập điểm trước khi gửi sổ liên lạc.');
      return;
    }
    setIsSending(true);
    try {
      for (const col of filledCols) {
        await gradesService.publishScores({
          class_id: currentClassId,
          subject_code: selectedSubject,
          score_type: col.type,
          semester: selectedSemester,
        });
      }
    } catch (e: any) {
      setIsSending(false);
      Alert.alert('Lỗi', e.message || 'Không thể công bố sổ điểm');
      return;
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
              <Text style={styles.successSubtitle}>{className || 'Lớp học'} • {getSubjectDisplayName()} • Học kỳ {selectedSemester}</Text>

            {/* Bento Stats Card — số liệu thật: tổng HS của lớp, số HS có điểm
                trong các cột vừa công bố, số HS chưa có điểm nào */}
            <View style={styles.successBentoCard}>
              <View style={styles.successStatCol}>
                <Text style={styles.successStatNumDark}>{students.length}</Text>
                <Text style={styles.successStatLabel}>Học sinh</Text>
              </View>

              <View style={styles.successStatColMiddle}>
                <View style={styles.successColDividerLeft} />
                <Text style={styles.successStatNumGreen}>
                  {students.filter((s) => filledCols.some((c) => s[c.key] !== null && s[c.key] !== undefined)).length}
                </Text>
                <Text style={styles.successStatLabelGreen}>Đã gửi</Text>
                <View style={styles.successColDividerRight} />
              </View>

              <View style={styles.successStatCol}>
                <Text style={styles.successStatNumGray}>
                  {students.filter((s) => !filledCols.some((c) => s[c.key] !== null && s[c.key] !== undefined)).length}
                </Text>
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
                {className || 'Lớp học'}
              </Text>
            </View>

            {/* Chip 2: Subject (Dropdown chọn môn xem) */}
            <TouchableOpacity
              style={styles.dropdownChipBtn}
              activeOpacity={0.85}
              onPress={() => setPickerView('subject')}
            >
              <Text style={styles.dropdownChipText}>{getSubjectDisplayName()}</Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            {/* Chip 3: Semester */}
            <TouchableOpacity
              style={styles.dropdownChipBtn}
              activeOpacity={0.85}
              onPress={() => setPickerView('semester')}
            >
              <Text style={styles.dropdownChipText}>Học kỳ {selectedSemester}</Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Hero Podium Bento Card (Weekly Honor) */}
          <LinearGradient
            colors={['#3B38A8', '#4F46E5', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroPodiumCard}
          >
            {/* Background 3D Ambient Aura & Sparkles */}
            <View style={styles.podiumBgAura} pointerEvents="none">
              <Svg width="100%" height="100%" viewBox="0 0 360 220" fill="none">
                <Defs>
                  <SvgRadialGradient id="bgGlowRadial" cx="85%" cy="20%" r="55%">
                    <Stop offset="0%" stopColor="#FBBF24" stopOpacity={0.35} />
                    <Stop offset="50%" stopColor="#818CF8" stopOpacity={0.15} />
                    <Stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </SvgRadialGradient>
                  <SvgRadialGradient id="leftAmbient" cx="15%" cy="80%" r="45%">
                    <Stop offset="0%" stopColor="#C084FC" stopOpacity={0.25} />
                    <Stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </SvgRadialGradient>
                </Defs>
                <Rect x="0" y="0" width="360" height="220" fill="url(#bgGlowRadial)" />
                <Rect x="0" y="0" width="360" height="220" fill="url(#leftAmbient)" />
                {/* Sparkle stars */}
                <Path d="M 24 28 Q 24 33 29 33 Q 24 33 24 38 Q 24 33 19 33 Q 24 33 24 28 Z" fill="#FDE047" opacity={0.6} />
                <Path d="M 120 18 Q 120 21 123 21 Q 120 21 120 24 Q 120 21 117 21 Q 120 21 120 18 Z" fill="#FFFFFF" opacity={0.5} />
                <Circle cx="70" cy="45" r="1.5" fill="#FEF08A" opacity={0.7} />
                <Circle cx="150" cy="35" r="1.2" fill="#FFFFFF" opacity={0.5} />
              </Svg>
            </View>

            {/* 3D Gold Trophy Icon Top Right */}
            <View style={styles.podiumTrophyWrap}>
              <Trophy3D size={84} />
            </View>

            <View style={styles.podiumHeaderTexts}>
              <View style={styles.podiumSubBadgeContainer}>
                <Text style={styles.podiumSubBadgeDot}>✦</Text>
                <Text style={styles.podiumSubBadge}>VINH DANH TUẦN {getCurrentAcademicWeek()}</Text>
              </View>
              <Text style={styles.podiumTitle}>Top Học Sinh Xuất Sắc</Text>
            </View>

            {/* 3 Pillars: chỉ hiển thị học sinh thật đã có điểm của lớp hiện tại */}
            {leaderboard.length > 0 ? (
              <View style={[styles.podiumGrid, leaderboard.length === 1 && { justifyContent: 'center' }]}>
                {/* Hạng 2 */}
                {leaderboard[1] && (
                  <View style={styles.podiumCol}>
                    <View style={styles.podiumAvatarWrap}>
                      <View style={styles.silverAvatarRing}>
                        <Image
                          source={{ uri: `https://api.dicebear.com/7.x/bottts/png?seed=${leaderboard[1].student_name}` }}
                          style={styles.podiumAvatarImgSmall}
                        />
                      </View>
                      <View style={styles.rankPillSilver}>
                        <Text style={styles.rankPillTextSilver}>2</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumStudentName} numberOfLines={1}>{leaderboard[1].student_name}</Text>
                    <Text style={styles.podiumStudentScore}>TB: {leaderboard[1].score}</Text>
                    <View style={styles.podiumPillar2}>
                      <Text style={styles.pillarRankLabel}>HẠNG 2</Text>
                    </View>
                  </View>
                )}

                {/* Hạng 1: Quán Quân */}
                <View style={styles.podiumColCenter}>
                  <View style={styles.crownWrap}>
                    <Crown3D size={32} />
                  </View>
                  <View style={styles.podiumAvatarWrap}>
                    <View style={styles.goldAvatarRing}>
                      <Image
                        source={{ uri: `https://api.dicebear.com/7.x/bottts/png?seed=${leaderboard[0].student_name}` }}
                        style={styles.podiumAvatarImgLarge}
                      />
                    </View>
                    <View style={styles.rankPillGold}>
                      <Text style={styles.rankPillTextGold}>1</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumStudentNameCenter} numberOfLines={1}>{leaderboard[0].student_name}</Text>
                  <Text style={styles.podiumStudentScoreCenter}>TB: {leaderboard[0].score}</Text>
                  <View style={styles.podiumPillar1}>
                    <View style={styles.championHeaderBadge}>
                      <Text style={styles.pillarRankLabelChampion}>QUÁN QUÂN</Text>
                    </View>
                  </View>
                </View>

                {/* Hạng 3 */}
                {leaderboard[2] && (
                  <View style={styles.podiumCol}>
                    <View style={styles.podiumAvatarWrap}>
                      <View style={styles.bronzeAvatarRing}>
                        <Image
                          source={{ uri: `https://api.dicebear.com/7.x/bottts/png?seed=${leaderboard[2].student_name}` }}
                          style={styles.podiumAvatarImgSmall}
                        />
                      </View>
                      <View style={styles.rankPillBronze}>
                        <Text style={styles.rankPillTextBronze}>3</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumStudentName} numberOfLines={1}>{leaderboard[2].student_name}</Text>
                    <Text style={styles.podiumStudentScore}>TB: {leaderboard[2].score}</Text>
                    <View style={styles.podiumPillar3}>
                      <Text style={styles.pillarRankLabel}>HẠNG 3</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.9 }}>
                  Chưa có dữ liệu điểm môn {getSubjectDisplayName()} của lớp để vinh danh.
                </Text>
              </View>
            )}
          </LinearGradient>

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
                Giỏi ({students.filter(s => classifyStudent(s) === 'good').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, selectedSegment === 'fair' && styles.segmentBtnActive]}
              onPress={() => setSelectedSegment('fair')}
              activeOpacity={0.8}
            >
              <View style={styles.grayBullet} />
              <Text style={[styles.segmentText, selectedSegment === 'fair' && styles.segmentTextActive]}>
                Khá ({students.filter(s => classifyStudent(s) === 'fair').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, selectedSegment === 'need_effort' && styles.segmentBtnActive]}
              onPress={() => setSelectedSegment('need_effort')}
              activeOpacity={0.8}
            >
              <View style={styles.grayBullet} />
              <Text style={[styles.segmentText, selectedSegment === 'need_effort' && styles.segmentTextActive]}>
                Trung Bình ({students.filter(s => classifyStudent(s) === 'avg').length})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Student Grade Cards Feed */}
          <View style={styles.studentsGradeFeed}>
            {isLoading && students.length === 0 ? (
              <View style={{ padding: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 12 }}>
                <ActivityIndicator size="large" color="#F58F4C" />
                <Text style={{ marginTop: 14, fontSize: 13, color: '#6B6880', fontWeight: '600' }}>
                  Đang tải bảng điểm học sinh...
                </Text>
              </View>
            ) : students.length === 0 ? (
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
                ? students.filter(s => classifyStudent(s) === 'good')
                : selectedSegment === 'fair'
                ? students.filter(s => classifyStudent(s) === 'fair')
                : selectedSegment === 'need_effort'
                ? students.filter(s => classifyStudent(s) === 'avg')
                : students
              )
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((student) => {
                const avgScore = computeStudentAverage(student);
                return (
              <View key={student.id} style={styles.studentGradeCard}>
                {/* Header row: rank & avatar & name & điểm TB tổng */}
                <View style={styles.studentCardHeader}>
                  <View style={styles.studentCardHeaderLeft}>
                    <View style={styles.rankBadgePill}>
                      <Text style={styles.rankBadgePillText}>#{student.rank}</Text>
                    </View>
                    <Text style={styles.studentCardName} numberOfLines={1}>{student.name}</Text>
                  </View>

                  <View style={styles.avgBadge}>
                    <Text style={styles.avgBadgeLabel}>TB</Text>
                    <Text style={[styles.avgBadgeValue, avgScore === null && styles.avgBadgeEmpty]}>
                      {avgScore !== null ? avgScore.toFixed(1) : '--'}
                    </Text>
                  </View>
                </View>

                {/* Score Columns: 5 cột khít 1 hàng (ScrollView ngang dự phòng cho máy hẹp) */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  contentContainerStyle={styles.scoreColsRow}
                >
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

                  {/* Thi CK */}
                  <TouchableOpacity
                    style={styles.scoreBox}
                    onPress={() => handleOpenScoreModal(student, 'final')}
                    activeOpacity={isReadOnly ? 1 : 0.7}
                  >
                    <Text style={styles.scoreTypeLabel}>Thi CK</Text>
                    <Text style={student.final !== null && student.final !== undefined ? styles.scoreValueBig : styles.scoreValuePlaceholder}>
                      {student.final !== null && student.final !== undefined ? student.final.toFixed(1) : '--'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Footer: Nút Vào điểm (ẩn nút Vào điểm khi ở chế độ Read-only) */}
                <View style={styles.cardFooterRow}>
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
                );
                }))
              }
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
              <Text style={styles.dockTabTextInactive}>Trang chủ</Text>
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

        {/* ================= MODAL: CHỌN MÔN / HỌC KỲ ================= */}
        <Modal
          visible={pickerView !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setPickerView(null)}
        >
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setPickerView(null)}
              activeOpacity={1}
            />
            <View style={styles.pickerSheet}>
              <View style={styles.modalDragHandle} />
              <Text style={styles.pickerTitle}>
                {pickerView === 'semester' ? 'Chọn học kỳ' : 'Chọn môn học'}
              </Text>
              {pickerView === 'semester' ? (
                <>
                  {[1, 2].map((semester) => {
                    const isActive = selectedSemester === semester;
                    return (
                      <TouchableOpacity
                        key={semester}
                        style={[styles.pickerOptionRow, isActive && styles.pickerOptionRowActive]}
                        onPress={() => handlePickSemester(semester)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pickerOptionText, isActive && styles.pickerOptionTextActive]}>
                          Học kỳ {semester}
                        </Text>
                        {isActive && (
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.5}>
                            <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </>
              ) : (
                <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
                  {subjectOptions.map((opt) => {
                    const isActive = opt.code === selectedSubject;
                    return (
                      <TouchableOpacity
                        key={opt.code}
                        style={[styles.pickerOptionRow, isActive && styles.pickerOptionRowActive]}
                        onPress={() => {
                          setSelectedSubject(opt.code);
                          setPickerView(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pickerOptionText, isActive && styles.pickerOptionTextActive]}>
                          {opt.label}
                        </Text>
                        {isActive && (
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.5}>
                            <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {!isClassHomeroom && (
                    <Text style={styles.pickerNote}>
                      Bạn đang xem các môn được phân công giảng dạy trong lớp này. GVCN của lớp xem được tất cả môn.
                    </Text>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

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
                      <Text style={styles.modalStudentClass}>{className || 'Lớp học'} • {getSubjectDisplayName()}</Text>
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
                  onPress={() => switchScoreType('oral')}
                >
                  <Text style={[styles.scoreTypePillText, activeScoreType === 'oral' && { color: '#F58F4C', fontWeight: '800' }]}>
                    Miệng: {getPillScoreText('oral')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scoreTypePill, activeScoreType === 'test15p' && styles.scoreTypePillActive]}
                  onPress={() => switchScoreType('test15p')}
                >
                  <Text style={[styles.scoreTypePillText, activeScoreType === 'test15p' && { color: '#F58F4C', fontWeight: '800' }]}>
                    15 Phút: {getPillScoreText('test15p')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scoreTypePill, activeScoreType === 'test1p' && styles.scoreTypePillActive]}
                  onPress={() => switchScoreType('test1p')}
                >
                  <Text style={[styles.scoreTypePillText, activeScoreType === 'test1p' && { color: '#F58F4C', fontWeight: '800' }]}>
                    1 Tiết: {getPillScoreText('test1p')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scoreTypePillDashed, activeScoreType === 'midTerm' && styles.scoreTypePillActive]}
                  onPress={() => switchScoreType('midTerm')}
                >
                  <Text style={[{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }, activeScoreType === 'midTerm' && { color: '#F58F4C', fontWeight: '800' }]}>
                    Giữa Kỳ: {getPillScoreText('midTerm')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scoreTypePillDashed, activeScoreType === 'final' && styles.scoreTypePillActive]}
                  onPress={() => switchScoreType('final')}
                >
                  <Text style={[{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }, activeScoreType === 'final' && { color: '#F58F4C', fontWeight: '800' }]}>
                    Cuối Kỳ: {getPillScoreText('final')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Big Score Display */}
              <View style={styles.bigScoreCard}>
                <View style={styles.bigScoreLeft}>
                  <Text style={[styles.bigScoreDigits, inputScore === '' && { color: '#C7C9D1' }]}>
                    {inputScore !== '' ? inputScore : '--'}
                  </Text>
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
                <TouchableOpacity
                  style={[styles.btnLuuDiem, !hasDraftScores && { opacity: 0.5 }]}
                  onPress={handleSaveScore}
                  activeOpacity={0.88}
                  disabled={isSavingScore}
                >
                  {isSavingScore ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.btnLuuTiepTheoText}>Lưu Điểm</Text>
                  )}
                </TouchableOpacity>
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
                {students.length} phụ huynh {className || 'lớp học'} sẽ nhận thông báo điểm {getSubjectDisplayName()} • Học kỳ {selectedSemester}.
              </Text>

              {/* Summary Info Card (tính động theo dữ liệu thật) */}
              <View style={styles.sendSummaryBox}>
                <View style={styles.sendSummaryRow}>
                  <Text style={filledCols.length > 0 ? styles.checkIconGreen : styles.minusIconGray}>
                    {filledCols.length > 0 ? '✓' : '−'}
                  </Text>
                  <Text
                    style={filledCols.length > 0 ? styles.sendSummaryTextReady : styles.sendSummaryTextPending}
                    numberOfLines={2}
                  >
                    {filledCols.length > 0
                      ? `Sẽ gửi điểm: ${filledCols.map((c) => c.label).join(', ')}`
                      : 'Chưa có cột điểm nào có dữ liệu'}
                  </Text>
                </View>
                {missingCols.length > 0 && (
                  <React.Fragment>
                    <View style={styles.summaryHDivider} />
                    <View style={styles.sendSummaryRow}>
                      <Text style={styles.minusIconGray}>−</Text>
                      <Text style={styles.sendSummaryTextPending} numberOfLines={2}>
                        Bỏ qua (chưa có điểm): {missingCols.map((c) => c.label).join(', ')}
                      </Text>
                    </View>
                  </React.Fragment>
                )}
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
    borderRadius: 24,
    padding: 16,
    paddingTop: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  podiumBgAura: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  podiumTrophyWrap: {
    position: 'absolute',
    top: 2,
    right: 6,
    zIndex: 1,
  },
  podiumHeaderTexts: {
    marginBottom: 6,
    zIndex: 2,
  },
  podiumSubBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  podiumSubBadgeDot: {
    fontSize: 10,
    color: '#FDE047',
  },
  podiumSubBadge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#FDE047',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  podiumTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  podiumGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
    gap: 8,
    zIndex: 2,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  podiumColCenter: {
    flex: 1.15,
    alignItems: 'center',
    marginTop: -10,
  },
  crownWrap: {
    marginBottom: -2,
    zIndex: 3,
  },
  podiumAvatarWrap: {
    position: 'relative',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldAvatarRing: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(251, 191, 36, 0.35)',
    borderWidth: 2,
    borderColor: '#FDE047',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  silverAvatarRing: {
    padding: 2.5,
    borderRadius: 999,
    backgroundColor: 'rgba(226, 232, 240, 0.25)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  bronzeAvatarRing: {
    padding: 2.5,
    borderRadius: 999,
    backgroundColor: 'rgba(249, 115, 22, 0.25)',
    borderWidth: 2,
    borderColor: '#FDBA74',
  },
  podiumAvatarImgSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  podiumAvatarImgLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  rankPillGold: {
    position: 'absolute',
    bottom: -3,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D97706',
    borderWidth: 1.5,
    borderColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPillTextGold: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rankPillSilver: {
    position: 'absolute',
    bottom: -3,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#475569',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPillTextSilver: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rankPillBronze: {
    position: 'absolute',
    bottom: -3,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#9A3412',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPillTextBronze: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  podiumStudentName: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  podiumStudentNameCenter: {
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  podiumStudentScore: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  podiumStudentScoreCenter: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '800',
    color: '#FEF08A',
    marginTop: 1,
  },
  podiumPillar1: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  podiumPillar2: {
    width: '100%',
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  podiumPillar3: {
    width: '100%',
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  championHeaderBadge: {
    backgroundColor: 'rgba(254, 240, 138, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.6)',
  },
  pillarRankLabelChampion: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: '#FEF08A',
    letterSpacing: 0.8,
  },
  pillarRankLabel: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.92)',
    letterSpacing: 0.5,
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
  avgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    flexShrink: 0,
  },
  avgBadgeLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: '#F58F4C',
  },
  avgBadgeValue: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  avgBadgeEmpty: {
    color: '#C7C9D1',
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
  studentCardName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1E1B2E',
    flex: 1,
  },
  scoreColsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBox: {
    width: SCORE_BOX_W,
    backgroundColor: '#FFF1E6',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBoxDashed: {
    width: SCORE_BOX_W,
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
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 46, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 26,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B2E',
    marginBottom: 10,
  },
  pickerList: {
    maxHeight: 360,
  },
  pickerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  pickerOptionRowActive: {
    backgroundColor: '#FFF1E6',
  },
  pickerOptionText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#4B5563',
  },
  pickerOptionTextActive: {
    fontWeight: '700',
    color: '#F58F4C',
  },
  pickerNote: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#9A8894',
    marginTop: 10,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
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
    paddingTop: 10,
  },
  btnLuuDiem: {
    width: '100%',
    height: 46,
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
