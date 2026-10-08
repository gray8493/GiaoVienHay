import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polygon,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
} from 'react-native-svg';

export interface StudentAttendance {
  id: number;
  code: string;
  name: string;
  initials: string;
  avatarColors: [string, string];
  initialsColor: string;
  status: 'present' | 'absent';
  excused?: boolean;
  reason?: string;
}

const INITIAL_STUDENTS: StudentAttendance[] = [
  {
    id: 1,
    code: 'HS240101',
    name: 'Nguyễn Minh Anh',
    initials: 'MA',
    avatarColors: ['#DBEAFE', '#C7D2FE'],
    initialsColor: '#4F46E5',
    status: 'present',
  },
  {
    id: 2,
    code: 'HS240102',
    name: 'Trần Gia Bảo',
    initials: 'GB',
    avatarColors: ['#FDE68A', '#FDBA74'],
    initialsColor: '#92400E',
    status: 'absent',
    excused: true,
    reason: 'Bị sốt, mẹ xin phép',
  },
  {
    id: 3,
    code: 'HS240103',
    name: 'Lê Thị Cẩm Tú',
    initials: 'CT',
    avatarColors: ['#FCE7F3', '#FECDD3'],
    initialsColor: '#E11D48',
    status: 'present',
  },
  {
    id: 4,
    code: 'HS240104',
    name: 'Phạm Hoàng Nam',
    initials: 'HN',
    avatarColors: ['#F3E8FF', '#DDD6FE'],
    initialsColor: '#6D28D9',
    status: 'absent',
    excused: false,
    reason: '',
  },
  {
    id: 5,
    code: 'HS240105',
    name: 'Võ Khánh Linh',
    initials: 'KL',
    avatarColors: ['#D1FAE5', '#99F6E4'],
    initialsColor: '#0F766E',
    status: 'present',
  },
  {
    id: 6,
    code: 'HS240106',
    name: 'Đặng Quốc Huy',
    initials: 'QH',
    avatarColors: ['#CFFAFE', '#BFDBFE'],
    initialsColor: '#1D4ED8',
    status: 'present',
  },
  {
    id: 7,
    code: 'HS240107',
    name: 'Hoàng Hải Đăng',
    initials: 'HĐ',
    avatarColors: ['#FEF08A', '#FDE68A'],
    initialsColor: '#B45309',
    status: 'present',
  },
  {
    id: 8,
    code: 'HS240108',
    name: 'Bùi Thanh Trúc',
    initials: 'TT',
    avatarColors: ['#FDF2F8', '#FBCFE8'],
    initialsColor: '#BE185D',
    status: 'present',
  },
];

interface AttendanceScreenProps {
  onBack?: () => void;
  onSaveSuccess?: () => void;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  onBack,
  onSaveSuccess,
}) => {
  const [students, setStudents] = useState<StudentAttendance[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const totalCount = 38; // Official class size
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const presentCount = totalCount - absentCount;

  const toggleStatus = (id: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.status === 'present') {
          return { ...s, status: 'absent', excused: true, reason: s.reason || '' };
        }
        return { ...s, status: 'present' };
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

  const handleSave = () => {
    onSaveSuccess?.();
  };

  const filteredStudents = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  return (
    <View style={styles.container}>
      {/* Background Peach Linear Gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Swirls & Sparkles */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Top-right dashed swirl */}
        <View style={styles.bgSwirl1} />
        {/* Mid-left solid swirl */}
        <View style={styles.bgSwirl2} />

        {/* Sparkle 1 */}
        <View style={styles.sparkle1}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="#FDE047" opacity={0.75}>
            <Path d="M12 0l2.8 9.2L24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8z" />
          </Svg>
        </View>

        {/* Sparkle 2 */}
        <View style={styles.sparkle2}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FDE047" opacity={0.7}>
            <Path d="M12 0l2.8 9.2L24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8z" />
          </Svg>
        </View>

        {/* Sparkle 3 */}
        <View style={styles.sparkle3}>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="#F59E0B" opacity={0.65}>
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
                <Text style={styles.headerTitle}>Điểm Danh Lớp 6A1</Text>
                <View style={styles.datePill}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
                    <Line x1={16} y1={2} x2={16} y2={6} />
                    <Line x1={8} y1={2} x2={8} y2={6} />
                    <Line x1={3} y1={10} x2={21} y2={10} />
                  </Svg>
                  <Text style={styles.datePillText}>Thứ Năm, 08/10/2026</Text>
                </View>
              </View>
            </View>

            {/* 3D Pastel Clay Notebook Illustration (SVG) */}
            <View style={styles.notebookIllustration} pointerEvents="none">
              <Svg width={88} height={88} viewBox="0 0 100 100">
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

            {/* Instructional Guidance */}
            <View style={styles.statsGuidanceRow}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Circle cx={12} cy={12} r={10} />
                <Line x1={12} y1={16} x2={12} y2={12} />
                <Line x1={12} y1={8} x2={12.01} y2={8} />
              </Svg>
              <Text style={styles.statsGuidanceText}>Cả lớp mặc định có mặt. Chạm để đổi vắng.</Text>
            </View>
          </View>

          {/* ================= 3. STUDENT LIST SECTION ================= */}
          <View style={styles.studentListSection}>
            {/* Header row of list & Search bar */}
            <View style={styles.studentListHeader}>
              <View style={styles.studentListHeaderLeft}>
                <Text style={styles.studentListTitle}>Danh sách học sinh</Text>
                <View style={styles.studentCountBadge}>
                  <Text style={styles.studentCountText}>{totalCount} em</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.searchToggleBtn}
                onPress={() => setIsSearching(!isSearching)}
                activeOpacity={0.7}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                  <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.searchToggleText}>Tìm tên</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input (Toggled) */}
            {isSearching && (
              <View style={styles.searchBoxWrap}>
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Nhập tên hoặc mã học sinh..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.searchClearBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Students Rows */}
            <View style={styles.studentsContainer}>
              {filteredStudents.map((student, idx) => {
                const isAbsent = student.status === 'absent';
                const formattedIndex = (student.id < 10 ? `0${student.id}` : `${student.id}`);

                if (!isAbsent) {
                  // Present Row
                  return (
                    <View key={student.id} style={styles.studentItemPresent}>
                      <View style={styles.studentItemLeft}>
                        <Text style={styles.studentIndexNum}>{formattedIndex}</Text>
                        <LinearGradient
                          colors={student.avatarColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.studentAvatar}
                        >
                          <Text style={[styles.studentAvatarText, { color: student.initialsColor }]}>
                            {student.initials}
                          </Text>
                        </LinearGradient>
                        <View>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <Text style={styles.studentCode}>{student.code}</Text>
                        </View>
                      </View>

                      {/* Toggle Absent Button */}
                      <TouchableOpacity
                        style={styles.btnToggleAbsent}
                        onPress={() => toggleStatus(student.id)}
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
                    style={[
                      styles.studentItemAbsentExpanded,
                      student.excused ? styles.borderOrange : styles.borderRed,
                    ]}
                  >
                    {/* Top Line */}
                    <View style={styles.absentTopRow}>
                      <View style={styles.studentItemLeft}>
                        <Text style={[styles.studentIndexNum, student.excused ? { color: '#FB923C' } : { color: '#F87171' }]}>
                          {formattedIndex}
                        </Text>
                        <LinearGradient
                          colors={student.avatarColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.studentAvatar}
                        >
                          <Text style={[styles.studentAvatarText, { color: student.initialsColor }]}>
                            {student.initials}
                          </Text>
                        </LinearGradient>
                        <View>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <Text style={styles.studentCode}>{student.code}</Text>
                        </View>
                      </View>

                      {/* Active Absent Badge */}
                      <TouchableOpacity
                        style={styles.badgeAbsentActive}
                        onPress={() => toggleStatus(student.id)}
                        activeOpacity={0.75}
                      >
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2.5}>
                          <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={styles.badgeAbsentActiveText}>Vắng</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Expanded Section */}
                    <View style={[styles.absentExpandedSection, student.excused ? styles.borderOrangeTop : styles.borderRedTop]}>
                      {/* Excused vs Unexcused Toggle Buttons */}
                      <View style={styles.excusedToggleRow}>
                        <TouchableOpacity
                          style={[
                            styles.excusedPill,
                            student.excused ? styles.excusedPillActive : styles.excusedPillInactive,
                          ]}
                          onPress={() => setExcused(student.id, true)}
                        >
                          <Text style={[styles.excusedPillText, student.excused ? styles.excusedPillTextActive : styles.excusedPillTextInactive]}>
                            Có phép
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.excusedPill,
                            !student.excused ? styles.unexcusedPillActive : styles.excusedPillInactive,
                          ]}
                          onPress={() => setExcused(student.id, false)}
                        >
                          <Text style={[styles.excusedPillText, !student.excused ? styles.unexcusedPillTextActive : styles.excusedPillTextInactive]}>
                            Không phép
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Reason Input Pill */}
                      <View style={[styles.reasonInputContainer, student.excused ? styles.reasonBorderOrange : styles.reasonBorderGray]}>
                        <Text style={styles.reasonEmoji}>💬</Text>
                        <TextInput
                          style={styles.reasonTextInput}
                          placeholder="Lý do vắng (không bắt buộc)"
                          placeholderTextColor="#9CA3AF"
                          value={student.reason}
                          onChangeText={(txt) => updateReason(student.id, txt)}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* List Footer Indicator */}
            <View style={styles.listFooter}>
              <Text style={styles.listFooterText}>+30 học sinh khác trong danh sách</Text>
            </View>
          </View>
        </ScrollView>

        {/* ================= 4. FIXED BOTTOM ACTION BAR ================= */}
        <View style={styles.bottomActionBar}>
          {/* Notification Note */}
          <View style={styles.notificationNoteRow}>
            <Svg width={14} height={14} viewBox="0 0 20 20" fill="#F58F4C">
              <Path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </Svg>
            <Text style={styles.notificationNoteText}>
              Sẽ tự động gửi thông báo đến <Text style={styles.notificationBold}>{absentCount}</Text> phụ huynh
            </Text>
          </View>

          {/* Main Action CTA Button */}
          <TouchableOpacity
            style={styles.btnSaveAttendance}
            onPress={handleSave}
            activeOpacity={0.88}
          >
            <Text style={styles.btnSaveAttendanceText}>Lưu & Báo Phụ Huynh</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2} style={styles.planeIcon}>
              <Path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          {/* iOS Home Indicator Spacing */}
          <View style={styles.homeIndicatorBar} />
        </View>
      </SafeAreaView>
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
    paddingTop: 12,
    paddingBottom: 130, // Space for fixed bottom action bar
    gap: 16,
  },

  /* Background Swirls */
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
    right: 128,
  },
  sparkle2: {
    position: 'absolute',
    top: 128,
    left: 24,
  },
  sparkle3: {
    position: 'absolute',
    top: 288,
    right: 16,
  },

  /* 1. Header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 8,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitleWrap: {
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.4,
  },
  datePill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 999,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  notebookIllustration: {
    width: 88,
    height: 88,
    marginTop: -10,
    marginRight: -6,
  },

  /* 2. Quick Stats Bar */
  quickStatsBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
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
    height: 36,
    backgroundColor: '#F3F4F6',
  },
  statTotalNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E1B2E',
    lineHeight: 32,
    marginBottom: 2,
  },
  statLabelTotal: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
  },
  statPresentNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
    lineHeight: 32,
    marginBottom: 2,
  },
  statLabelPresent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  statAbsentNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#EF4444',
    lineHeight: 32,
    marginBottom: 2,
  },
  statLabelAbsent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  statsGuidanceRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(243, 244, 246, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statsGuidanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
  },

  /* 3. Student List Section */
  studentListSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  studentListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 12,
  },
  studentListHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentListTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  studentCountBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  studentCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F58F4C',
  },
  searchToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  searchToggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
  },
  searchBoxWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E1B2E',
  },
  searchClearBtnText: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 4,
  },
  studentsContainer: {
    gap: 8,
  },
  studentItemPresent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  studentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  studentIndexNum: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    width: 20,
  },
  studentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B2E',
    lineHeight: 18,
  },
  studentCode: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 2,
  },
  btnToggleAbsent: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnToggleAbsentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  /* Absent Expanded Item */
  studentItemAbsentExpanded: {
    borderRadius: 14,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  borderOrange: {
    backgroundColor: '#FFF1E6',
    borderColor: '#FED7AA',
  },
  borderRed: {
    backgroundColor: '#FFF5EE',
    borderColor: '#FECACA',
  },
  absentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeAbsentActive: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeAbsentActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  absentExpandedSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  borderOrangeTop: {
    borderTopColor: 'rgba(254, 215, 170, 0.7)',
  },
  borderRedTop: {
    borderTopColor: '#FEE2E2',
  },
  excusedToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  excusedPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  excusedPillActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  unexcusedPillActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  excusedPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  excusedPillText: {
    fontSize: 11,
  },
  excusedPillTextActive: {
    fontWeight: '700',
    color: '#B45309',
  },
  unexcusedPillTextActive: {
    fontWeight: '700',
    color: '#DC2626',
  },
  excusedPillTextInactive: {
    fontWeight: '500',
    color: '#6B7280',
  },
  reasonInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reasonBorderOrange: {
    borderColor: '#FED7AA',
  },
  reasonBorderGray: {
    borderColor: '#E5E7EB',
  },
  reasonEmoji: {
    fontSize: 12,
  },
  reasonTextInput: {
    flex: 1,
    fontSize: 12,
    color: '#1E1B2E',
    paddingVertical: 0,
  },

  listFooter: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  listFooterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  /* 4. Fixed Bottom Action Bar */
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  notificationNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  notificationNoteText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
  },
  notificationBold: {
    color: '#1E1B2E',
    fontWeight: '700',
  },
  btnSaveAttendance: {
    width: '100%',
    height: 52,
    backgroundColor: '#F58F4C',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  btnSaveAttendanceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planeIcon: {
    transform: [{ rotate: '-12deg' }, { translateY: -1 }],
  },
  homeIndicatorBar: {
    width: 120,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
});
