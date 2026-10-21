import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polygon,
  Polyline,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import {
  attendanceService,
  AttendanceStatus,
  AttendanceRecordItem,
} from '../services/attendance.service';
import { classService } from '../services/class.service';

export interface StudentAttendance {
  id: number;
  student_id?: string;
  code: string;
  name: string;
  initials: string;
  status: 'present' | 'absent';
  excused?: boolean;
  reason?: string;
}

export interface AttendanceSavedData {
  totalCount: number;
  presentCount: number;
  absentCount: number;
  className: string;
  lessonName: string;
  lessonTime: string;
  absentStudents: Array<{
    id: number | string;
    name: string;
    code: string;
    initials: string;
    excused: boolean;
    reason: string;
  }>;
}

interface AttendanceScreenProps {
  classId: string;
  className?: string;
  onBack?: () => void;
  onSaveSuccess?: (savedData: AttendanceSavedData) => void;
  onTabChange?: (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => void;
}

// Điểm danh đầu ngày tương ứng tiết 1 (mặc định backend theo mô tả DTO)
const DAILY_ATTENDANCE_PERIOD = 1;

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  classId,
  className = 'Lớp học',
  onBack,
  onSaveSuccess,
  onTabChange,
}) => {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedRecords, setHasSavedRecords] = useState(false);

  useEffect(() => {
    loadClassStudents();
  }, [classId]);

  const loadClassStudents = async () => {
    setIsLoading(true);
    try {
      const detail = await classService.getClassDetail(classId);
      if (detail && detail.students && detail.students.length > 0) {
        // Tải trạng thái điểm danh đã lưu hôm nay (nếu có) để mở lại màn hình vẫn đúng trạng thái
        let savedMap = new Map<string, any>();
        try {
          const today = new Date().toISOString().split('T')[0];
          const existingRes: any = await attendanceService.getClassAttendance(classId, today);
          // Phòng hờ: service đã chuẩn hoá thành mảng, nhưng vẫn chấp nhận wrapper { records: [...] }
          const existing = Array.isArray(existingRes) ? existingRes : existingRes?.records || [];
          existing.forEach((r: any) => {
            const sid = r.studentId || r.student_id;
            if (sid) savedMap.set(String(sid), r);
          });
        } catch (e) {}
        setHasSavedRecords(savedMap.size > 0);

        const mapped: StudentAttendance[] = detail.students.map((s, idx) => {
          const fullName = s.full_name || (s as any).name || '';
          const parts = fullName.trim().split(' ');
          const initials = parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : (parts[0]?.substring(0, 2) || 'HS').toUpperCase();

          const saved = savedMap.get(String(s.id));
          const savedStatus = saved?.status;
          const isAbsent = !!saved && savedStatus !== AttendanceStatus.PRESENT;

          return {
            id: idx + 1,
            student_id: s.id,
            code: s.student_code || `HS${String(idx + 1).padStart(4, '0')}`,
            name: fullName || 'Học sinh',
            initials,
            status: isAbsent ? 'absent' : 'present',
            excused: isAbsent ? savedStatus === AttendanceStatus.ABSENT_EXCUSED : undefined,
            reason: isAbsent ? saved?.note || '' : undefined,
          };
        });
        setStudents(mapped);
      } else {
        setStudents([]);
        setHasSavedRecords(false);
      }
    } catch (e) {
      setStudents([]);
      setHasSavedRecords(false);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCount = students.length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const presentCount = totalCount - absentCount;

  const toggleStudent = (id: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (s.status === 'present') {
            return {
              ...s,
              status: 'absent',
              excused: true,
              reason: s.reason || '',
            };
          } else {
            return {
              ...s,
              status: 'present',
            };
          }
        }
        return s;
      })
    );
  };

  const setExcused = (id: number, excused: boolean) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, excused } : s))
    );
  };

  const updateReason = (id: number, reason: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reason } : s))
    );
  };

  const handleSaveAttendance = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const records: AttendanceRecordItem[] = students.map((s) => ({
        student_id: s.student_id || '',
        status:
          s.status === 'present'
            ? AttendanceStatus.PRESENT
            : s.excused
            ? AttendanceStatus.ABSENT_EXCUSED
            : AttendanceStatus.ABSENT_UNEXCUSED,
        note: s.reason || (s.excused ? 'Vắng có phép' : 'Vắng không phép'),
      }));

      // Gọi API backend 05-attendance POST /attendance/submit (upsert: cho phép lưu lại để sửa)
      await attendanceService.submitAttendance({
        class_id: classId,
        attendance_date: new Date().toISOString().split('T')[0],
        period: DAILY_ATTENDANCE_PERIOD,
        records,
      });
      setHasSavedRecords(true);

      const absentList = students
        .filter((s) => s.status === 'absent')
        .map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          initials: s.initials,
          excused: !!s.excused,
          reason: s.reason || (s.excused ? 'Vắng có phép' : 'Vắng không phép'),
        }));

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');

      onSaveSuccess?.({
        totalCount,
        presentCount,
        absentCount,
        className,
        lessonName: 'Điểm danh đầu ngày',
        lessonTime: `${hh}:${mi}`,
        absentStudents: absentList,
      });
    } catch (err: any) {
      Alert.alert(
        'Lỗi',
        err?.message || 'Không thể lưu điểm danh. Vui lòng kiểm tra kết nối và thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Background Peach Linear Gradient matching TEA-02 */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Swirls & Sparkles */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={styles.bgSwirl1} />
        <View style={styles.bgSwirl2} />

        <View style={styles.sparkle1}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="#FDE047">
            <Path d="M12 0l2.8 9.2L24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8z" />
          </Svg>
        </View>

        <View style={styles.sparkle2}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FDE047">
            <Path d="M12 0l2.8 9.2L24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8z" />
          </Svg>
        </View>

        <View style={styles.sparkle3}>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="#F59E0B">
            <Path d="M12 0l2.8 9.2L24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8z" />
          </Svg>
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= 1. HEADER SECTION ================= */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Back button */}
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

              {/* Title & Date Pill */}
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Điểm Danh {className}
                </Text>
                <View style={styles.datePill}>
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
                    <Line x1={16} y1={2} x2={16} y2={6} />
                    <Line x1={8} y1={2} x2={8} y2={6} />
                    <Line x1={3} y1={10} x2={21} y2={10} />
                  </Svg>
                  <Text style={styles.datePillText}>
                    {new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())}
                  </Text>
                </View>
              </View>
            </View>

            {/* 3D Pastel Clay Notebook Illustration (SVG) */}
            <View style={styles.notebookIllustration} pointerEvents="none">
              <Svg width={78} height={78} viewBox="0 0 100 100">
                <Defs>
                  <SvgLinearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#818CF8" />
                    <Stop offset="100%" stopColor="#4F46E5" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#34D399" />
                    <Stop offset="100%" stopColor="#059669" />
                  </SvgLinearGradient>
                </Defs>

                {/* Back page with rotation */}
                <G rotation="-6" origin="48, 50">
                  <Rect x={18} y={14} width={60} height={72} rx={14} fill="#FFFFFF" opacity={0.9} />
                </G>

                {/* Main Notebook board */}
                <Rect x={22} y={16} width={58} height={70} rx={14} fill="url(#bookCover)" />

                {/* White inner sheet */}
                <Rect x={26} y={22} width={50} height={58} rx={10} fill="#F8FAFC" />

                {/* Note sheet lines */}
                <Rect x={32} y={32} width={26} height={3.5} rx={1.75} fill="#CBD5E1" />
                <Rect x={32} y={40} width={36} height={3.5} rx={1.75} fill="#CBD5E1" />
                <Rect x={32} y={48} width={22} height={3.5} rx={1.75} fill="#CBD5E1" />

                {/* Floating Green Checkmark Badge */}
                <Circle cx={68} cy={64} r={16} fill="url(#badgeGrad)" />
                <Path d="M62 64l4 4 8-8" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />

                {/* Sparkles */}
                <Polygon points="20,10 22,15 27,16 22,18 20,23 18,18 13,16 18,15" fill="#FDE047" />
                <Polygon points="78,16 80,20 84,21 80,23 79,27 77,23 73,21 77,20" fill="#FBBF24" />
              </Svg>
            </View>
          </View>

          {/* ================= 2. QUICK STATS BAR ================= */}
          <View style={styles.quickStatsBar}>
            <View style={styles.statsCols}>
              {/* Total Col */}
              <View style={styles.statColItem}>
                <Text style={styles.statTotalNum}>{totalCount}</Text>
                <Text style={styles.statLabelTotal}>Tổng sĩ số</Text>
              </View>

              <View style={styles.statDivider} />

              {/* Present Col */}
              <View style={styles.statColItem}>
                <Text style={styles.statPresentNum}>{presentCount}</Text>
                <Text style={styles.statLabelPresent}>Có mặt</Text>
              </View>

              <View style={styles.statDivider} />

              {/* Absent Col */}
              <View style={styles.statColItem}>
                <Text style={styles.statAbsentNum}>{absentCount}</Text>
                <Text style={styles.statLabelAbsent}>Vắng</Text>
              </View>
            </View>

            {/* Guidance Row */}
            <View style={styles.statsGuidanceRow}>
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Circle cx={12} cy={12} r={10} />
                <Line x1={12} y1={16} x2={12} y2={12} />
                <Line x1={12} y1={8} x2={12.01} y2={8} />
              </Svg>
              <Text style={styles.statsGuidanceText} numberOfLines={1}>
                {hasSavedRecords
                  ? 'Đã lưu hôm nay. Có thể chỉnh sửa rồi lưu lại.'
                  : 'Cả lớp mặc định có mặt. Chạm để đổi vắng.'}
              </Text>
            </View>
          </View>

          {/* ================= 3. STUDENT LIST SECTION ================= */}
          <View style={styles.studentListSection}>
            {/* Header row & Search */}
            <View style={styles.listHeaderRow}>
              <View style={styles.listHeaderLeft}>
                <Text style={styles.listTitle}>Danh sách học sinh</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{totalCount} em</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.searchToggleBtn}
                onPress={() => setSearchOpen(!searchOpen)}
                activeOpacity={0.7}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                  <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.searchToggleText}>Tìm tên</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input Box */}
            {searchOpen && (
              <View style={styles.searchBoxWrap}>
                <TextInput
                  style={styles.searchBoxInput}
                  placeholder="Nhập tên hoặc mã học sinh..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearSearchText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* List of Students */}
            <View style={styles.studentsContainer}>
              {filteredStudents.length === 0 ? (
                <View style={{ padding: 32, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1B2E', marginBottom: 6 }}>
                    {searchQuery ? 'Không tìm thấy học sinh phù hợp' : 'Lớp chưa có học sinh'}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6B6880', textAlign: 'center' }}>
                    {searchQuery ? 'Vui lòng kiểm tra lại từ khóa tìm kiếm' : 'Lớp học này chưa có danh sách học sinh để thực hiện điểm danh.'}
                  </Text>
                </View>
              ) : (
                filteredStudents.map((student, index) => {
                const formattedIndex = String(student.id).padStart(2, '0');
                const isPresent = student.status === 'present';

                if (isPresent) {
                  return (
                    <View key={student.id} style={styles.studentItemPresent}>
                      <View style={styles.studentItemLeft}>
                        <Text style={styles.studentIndexNum}>{formattedIndex}</Text>
                        <View style={styles.studentAvatar}>
                          <Text style={styles.studentAvatarText}>{student.initials}</Text>
                        </View>
                        <View style={styles.studentInfoCol}>
                          <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                          <Text style={styles.studentCode}>{student.code}</Text>
                        </View>
                      </View>

                      {/* Toggle Absent Button */}
                      <TouchableOpacity
                        style={styles.btnToggleAbsent}
                        onPress={() => toggleStudent(student.id)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.btnToggleAbsentText}>Vắng</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                // Absent Expanded Row
                return (
                  <View
                    key={student.id}
                    style={styles.studentItemAbsentExpanded}
                  >
                    {/* Top Line */}
                    <View style={styles.absentTopRow}>
                      <View style={styles.studentItemLeft}>
                        <Text style={[styles.studentIndexNum, { color: '#F58F4C' }]}>
                          {formattedIndex}
                        </Text>
                        <View style={styles.studentAvatar}>
                          <Text style={styles.studentAvatarText}>{student.initials}</Text>
                        </View>
                        <View style={styles.studentInfoCol}>
                          <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                          <Text style={styles.studentCode}>{student.code}</Text>
                        </View>
                      </View>

                      {/* Active Absent Badge */}
                      <TouchableOpacity
                        style={styles.badgeAbsentActive}
                        onPress={() => toggleStudent(student.id)}
                        activeOpacity={0.75}
                      >
                        <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2.5}>
                          <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={styles.badgeAbsentActiveText}>Vắng</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Expanded Section */}
                    <View style={styles.absentExpandedSection}>
                      {/* Excused vs Unexcused Toggle Buttons */}
                      <View style={styles.excusedToggleRow}>
                        <TouchableOpacity
                          style={[styles.pillBtn, student.excused ? styles.pillBtnActiveExcused : styles.pillBtnInactive]}
                          onPress={() => setExcused(student.id, true)}
                          activeOpacity={0.8}
                        >
                          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={student.excused ? '#F58F4C' : '#6B6880'} strokeWidth={2.2}>
                            <Circle cx={12} cy={12} r={9} />
                            <Path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                          <Text style={[styles.pillBtnText, student.excused ? styles.pillBtnTextActiveExcused : styles.pillBtnTextInactive]}>
                            Có phép
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.pillBtn, !student.excused ? styles.pillBtnActiveUnexcused : styles.pillBtnInactive]}
                          onPress={() => setExcused(student.id, false)}
                          activeOpacity={0.8}
                        >
                          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={!student.excused ? '#F58F4C' : '#6B6880'} strokeWidth={2.2}>
                            <Circle cx={12} cy={12} r={9} />
                            <Line x1={5.6} y1={5.6} x2={18.4} y2={18.4} />
                          </Svg>
                          <Text style={[styles.pillBtnText, !student.excused ? styles.pillBtnTextActiveUnexcused : styles.pillBtnTextInactive]}>
                            Không phép
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Reason Input Pill: chỉ hiện khi vắng CÓ PHÉP */}
                      {student.excused && (
                        <View style={styles.reasonPillWrap}>
                          <TextInput
                            style={styles.reasonTextInput}
                            placeholder="Lý do vắng (không bắt buộc)"
                            placeholderTextColor="#94A3B8"
                            value={student.reason}
                            onChangeText={(text) => updateReason(student.id, text)}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                );
              }))}
            </View>
          </View>
        </ScrollView>

        {/* ================= 4. FIXED BOTTOM ACTION BAR ================= */}
        <View style={styles.bottomActionBar}>
          {/* Notification Note */}
          <View style={styles.notiNoteRow}>
            <Svg width={14} height={14} viewBox="0 0 20 20" fill="#F58F4C">
              <Path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </Svg>
            <Text style={styles.notiNoteText}>
              Sẽ tự động gửi thông báo đến <Text style={styles.notiNoteHighlight}>{absentCount}</Text> phụ huynh
            </Text>
          </View>

          {/* Main Action CTA Button: "Lưu & Báo Phụ Huynh" */}
          <TouchableOpacity
            style={[styles.btnSaveAttendance, totalCount === 0 && { opacity: 0.5 }]}
            onPress={handleSaveAttendance}
            activeOpacity={0.88}
            disabled={isSubmitting || totalCount === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.btnSaveAttendanceText}>
                  {hasSavedRecords ? 'Cập nhật & Báo Phụ Huynh' : 'Lưu & Báo Phụ Huynh'}
                </Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2} style={styles.sendIcon}>
                  <Path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Dock Navigation (4 tabs, giống các trang khác) */}
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

            {/* Điểm danh (Active) */}
            <TouchableOpacity style={styles.dockTabItem} activeOpacity={0.8}>
              <View style={styles.dockActiveIconWrap}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                  <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <Polyline points="22 4 12 14.01 9 11.01" />
                </Svg>
              </View>
              <Text style={styles.dockTabTextActive}>Điểm danh</Text>
            </TouchableOpacity>

            {/* Sổ điểm */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => onTabChange?.('gradebook')}
              activeOpacity={0.8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </Svg>
              <Text style={styles.dockTabTextInactive}>Sổ điểm</Text>
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
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFCFA3',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 250,
    gap: 12,
  },

  /* Decorative elements */
  bgSwirl1: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderStyle: 'dashed',
  },
  bgSwirl2: {
    position: 'absolute',
    top: 180,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  sparkle1: {
    position: 'absolute',
    top: 32,
    right: 120,
  },
  sparkle2: {
    position: 'absolute',
    top: 130,
    left: 24,
  },
  sparkle3: {
    position: 'absolute',
    top: 290,
    right: 16,
  },

  /* 1. Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    marginBottom: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    flexShrink: 0,
  },
  headerTitleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  datePillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  notebookIllustration: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: -4,
  },

  /* 2. Quick Stats Bar */
  quickStatsBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  statsCols: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statColItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F3F4F6',
  },
  statTotalNum: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  statLabelTotal: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 2,
  },
  statPresentNum: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#10B981',
  },
  statLabelPresent: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
  },
  statAbsentNum: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#EF4444',
  },
  statLabelAbsent: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },
  statsGuidanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 9,
    marginTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statsGuidanceText: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    color: '#6B6880',
  },

  /* 3. Student List Section */
  studentListSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  badgeCount: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F58F4C',
  },
  searchToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
  },
  searchBoxWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  searchBoxInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E1B2E',
  },
  clearSearchText: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingLeft: 8,
  },
  studentsContainer: {
    gap: 6,
  },

  /* Student Items */
  studentItemPresent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  studentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  studentIndexNum: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    width: 18,
  },
  studentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B6880',
  },
  studentInfoCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  studentCode: {
    fontSize: 11,
    color: '#6B6880',
    marginTop: 1,
  },
  btnToggleAbsent: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5.5,
  },
  btnToggleAbsentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  /* Absent Expanded Card */
  studentItemAbsentExpanded: {
    backgroundColor: '#FFF1E6',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginVertical: 2,
  },
  absentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeAbsentActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeAbsentActiveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
  },
  absentExpandedSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(254, 215, 170, 0.7)',
    gap: 8,
  },
  excusedToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillBtnActiveExcused: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#F58F4C',
  },
  pillBtnActiveUnexcused: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#F58F4C',
  },
  pillBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  pillBtnTextActiveExcused: {
    color: '#F58F4C',
    fontWeight: '700',
  },
  pillBtnTextActiveUnexcused: {
    color: '#F58F4C',
    fontWeight: '700',
  },
  pillBtnTextInactive: {
    color: '#1E1B2E',
  },
  reasonPillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    gap: 6,
  },
  reasonTextInput: {
    flex: 1,
    fontSize: 12,
    color: '#1E1B2E',
    padding: 0,
  },
  listFooterNote: {
    paddingTop: 8,
    alignItems: 'center',
  },
  listFooterNoteText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  /* 4. Bottom Action Bar: trải sát đáy màn hình, dock đen đè lên phía dưới */
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 78,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
  },

  /* Bottom Dock Navigation */
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
  notiNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  notiNoteText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
  },
  notiNoteHighlight: {
    fontWeight: '800',
    color: '#1E1B2E',
  },
  btnSaveAttendance: {
    height: 52,
    backgroundColor: '#F58F4C',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 4,
  },
  btnSaveAttendanceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sendIcon: {
    transform: [{ rotate: '-12deg' }],
  },
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
});
