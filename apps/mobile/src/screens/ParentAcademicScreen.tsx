import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Svg, Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Line, Polyline } from 'react-native-svg';
import { parentService } from '../services/parent.service';

interface ParentAcademicScreenProps {
  studentId?: string;
  studentName?: string;
  className?: string;
  onBackToHome?: () => void;
  onNavigateToTab?: (tabKey: 'home' | 'academic' | 'fees' | 'profile') => void;
  onOpenNotifications?: () => void;
}

type TabType = 'GRADES' | 'REMARKS' | 'ATTENDANCE';

export const ParentAcademicScreen: React.FC<ParentAcademicScreenProps> = ({
  studentId = 'stu_02',
  studentName = 'Trần Bảo Nam',
  className = '1A',
  onBackToHome,
  onNavigateToTab,
  onOpenNotifications,
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>('GRADES');
  const [semester, setSemester] = useState<'HK1' | 'HK2'>('HK1');
  const [selectedMonth, setSelectedMonth] = useState('Tháng 10');

  // Dữ liệu Điểm số
  const [academicData, setAcademicData] = useState<any[]>([]);

  // Dữ liệu Nhận xét & Lịch kiểm tra
  const [examsList, setExamsList] = useState<any[]>([]);
  const [remarksList, setRemarksList] = useState<any[]>([]);

  // Dữ liệu Chuyên cần
  const [attendanceSummary, setAttendanceSummary] = useState<any>({
    present_count: 4,
    absent_count: 2,
    rate_week: '66.7%',
    note: 'Cần nộp giấy xác nhận khám bệnh vào Thứ Hai',
  });
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentTab, studentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (currentTab === 'GRADES') {
        const data = await parentService.getFullAcademicRecord(studentId);
        setAcademicData(data);
      } else if (currentTab === 'REMARKS') {
        const data = await parentService.getRemarksAndExams(studentId);
        setExamsList(data.exams);
        setRemarksList(data.remarks);
      } else {
        const data = await parentService.getAttendanceDetails(studentId, '2026-10');
        if (data.summary) setAttendanceSummary(data.summary);
        if (data.logs) setAttendanceLogs(data.logs);
      }
    } catch (e) {
      console.warn('Lỗi khi tải dữ liệu học tập phụ huynh:', e);
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận đã đọc nhận xét
  const handleConfirmRemark = (remarkId: string) => {
    setRemarksList(prev =>
      prev.map(r => (r.id === remarkId ? { ...r, is_read: true } : r))
    );
    Alert.alert('Thành công', 'Đã xác nhận đã đọc nhận xét của giáo viên.');
  };

  return (
    <View style={styles.container}>
      {/* Background Decorative Circles & Stars */}
      <View style={styles.bgDecorWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Circle cx="350" cy="80" r="120" fill="#FFB68B" opacity={0.12} />
          <Circle cx="30" cy="380" r="100" fill="#F58F4C" opacity={0.08} />
          <Path d="M340 60 L342 66 L348 68 L342 70 L340 76 L338 70 L332 68 L338 66 Z" fill="#984704" fillOpacity={0.15} />
          <Path d="M42 220 L44 225 L49 227 L44 229 L42 234 L40 229 L35 227 L40 225 Z" fill="#984704" fillOpacity={0.15} />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ROW ================= */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Học Tập</Text>

          {/* Nút lọc bên phải tùy tab */}
          {currentTab === 'GRADES' && (
            <TouchableOpacity
              style={styles.filterPillButton}
              activeOpacity={0.8}
              onPress={() => setSemester(prev => (prev === 'HK1' ? 'HK2' : 'HK1'))}
            >
              <Text style={styles.filterPillText} numberOfLines={1}>
                {semester === 'HK1' ? 'Học kỳ 1' : 'Học kỳ 2'}
              </Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#554339" strokeWidth={2.5}>
                <Path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          )}

          {currentTab === 'REMARKS' && (
            <TouchableOpacity
              style={styles.bellButton}
              activeOpacity={0.8}
              onPress={onOpenNotifications}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2}>
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </Svg>
            </TouchableOpacity>
          )}

          {currentTab === 'ATTENDANCE' && (
            <TouchableOpacity
              style={styles.filterPillButton}
              activeOpacity={0.8}
            >
              <Text style={styles.filterPillText} numberOfLines={1}>{selectedMonth}</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#554339" strokeWidth={2.5}>
                <Path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          )}
        </View>

        {/* Student Badge Pill: FIX LỖI RỚT DÒNG */}
        <View style={styles.studentBadgeRow}>
          <View style={styles.studentBadgePill}>
            {currentTab === 'ATTENDANCE' && (
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#984704" strokeWidth={2}>
                <Circle cx="12" cy="8" r="5" />
                <Path d="M20 21a8 8 0 1 0-16 0" />
              </Svg>
            )}
            <Text style={styles.studentBadgeText} numberOfLines={1}>
              {studentName} • {className}
            </Text>
          </View>
        </View>

        {/* ================= SEGMENTED CONTROL ================= */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, currentTab === 'GRADES' && styles.segmentBtnActive]}
            onPress={() => setCurrentTab('GRADES')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segmentText, currentTab === 'GRADES' && styles.segmentTextActive]}>
              Điểm Số
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, currentTab === 'REMARKS' && styles.segmentBtnActive]}
            onPress={() => setCurrentTab('REMARKS')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segmentText, currentTab === 'REMARKS' && styles.segmentTextActive]}>
              Nhận Xét
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, currentTab === 'ATTENDANCE' && styles.segmentBtnActive]}
            onPress={() => setCurrentTab('ATTENDANCE')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segmentText, currentTab === 'ATTENDANCE' && styles.segmentTextActive]}>
              Chuyên Cần
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator color="#F58F4C" size="small" />
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 1: PAR-02a ĐIỂM SỐ                                   */}
        {/* ======================================================== */}
        {!loading && currentTab === 'GRADES' && (
          <View style={styles.tabContentWrap}>
            {academicData.map((item, index) => (
              <View key={index} style={styles.subjectCard}>
                {/* Subject Header */}
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectTitleGroup}>
                    <View style={[styles.subjectDot, { backgroundColor: item.dot_color || '#F58F4C' }]} />
                    <Text style={styles.subjectName} numberOfLines={1}>
                      {item.subject_name}
                    </Text>
                  </View>
                  <View style={styles.avgBadgePill}>
                    <Text style={styles.avgBadgeText} numberOfLines={1}>
                      {item.average_score}
                    </Text>
                  </View>
                </View>

                {/* 4 Score Columns Grid: FIX LỖI ĐÈ CHỮ */}
                <View style={styles.scoresGrid}>
                  {item.scores?.map((score: any, idx: number) => {
                    const isFaint = score.value === '--';
                    return (
                      <View key={idx} style={[styles.scoreBox, isFaint && styles.scoreBoxFaint]}>
                        <Text style={styles.scoreTypeLabel} numberOfLines={1}>
                          {score.label}
                        </Text>
                        <Text style={[styles.scoreValueText, isFaint && styles.scoreValueFaint]} numberOfLines={1}>
                          {score.value}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PAR-02b NHẬN XÉT & LỊCH KIỂM TRA                  */}
        {/* ======================================================== */}
        {!loading && currentTab === 'REMARKS' && (
          <View style={styles.tabContentWrap}>
            {/* Card: Lịch Kiểm Tra */}
            <View style={styles.examSectionCard}>
              <View style={styles.examCardHeader}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                  <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <Line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                  <Line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                  <Line x1="3" y1="10" x2="21" y2="10" />
                </Svg>
                <Text style={styles.examCardTitle} numberOfLines={1}>Lịch Kiểm Tra</Text>
              </View>

              {examsList.map((exam, idx) => (
                <View key={exam.id || idx}>
                  <View style={styles.examRow}>
                    <View style={styles.examRowLeft}>
                      <View style={styles.examIconTile}>
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                          {idx === 0 ? (
                            <>
                              <Rect x="3" y="4" width="18" height="18" rx="2" />
                              <Path d="M16 2v4M8 2v4M3 10h18" />
                            </>
                          ) : (
                            <>
                              <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </>
                          )}
                        </Svg>
                      </View>
                      <Text style={styles.examTitleText} numberOfLines={1}>{exam.title}</Text>
                    </View>
                    <Text style={styles.examDateBadge} numberOfLines={1}>{exam.date_label}</Text>
                  </View>
                  {idx < examsList.length - 1 && <View style={styles.hairlineDivider} />}
                </View>
              ))}
            </View>

            {/* Các Card Nhận Xét: FIX LỖI RỚT NGÀY THÁNG */}
            {remarksList.map((rmk) => (
              <View key={rmk.id} style={styles.remarkCard}>
                <View style={styles.remarkHeader}>
                  <Text style={styles.remarkTeacherTitle} numberOfLines={1}>
                    {rmk.teacher_title}
                  </Text>
                  <Text style={styles.remarkDateText} numberOfLines={1}>
                    {rmk.date_str}
                  </Text>
                </View>

                <Text style={styles.remarkContentText}>
                  {rmk.content}
                </Text>

                <View style={styles.remarkActionWrap}>
                  {rmk.is_read ? (
                    <View style={styles.readBadge}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={3}>
                        <Polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={styles.readBadgeText}>Đã đọc</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.confirmReadBtn}
                      activeOpacity={0.85}
                      onPress={() => handleConfirmRemark(rmk.id)}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={3}>
                        <Polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={styles.confirmReadText}>Xác Nhận</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {/* Micro-Quote Card */}
            <View style={styles.quoteCard}>
              <View style={styles.quoteIconBox}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#984704" strokeWidth={2}>
                  <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </Svg>
              </View>
              <Text style={styles.quoteText}>
                "Mỗi ngày một trang sách mới cùng thầy cô và bạn bè."
              </Text>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PAR-02c CHUYÊN CẦN                                */}
        {/* ======================================================== */}
        {!loading && currentTab === 'ATTENDANCE' && (
          <View style={styles.tabContentWrap}>
            {/* Stats Summary Card: FIX LỖI RỚT CHỮ CÓ MẶT / VẮNG */}
            <View style={styles.attendanceSummaryCard}>
              {/* Cột Có mặt */}
              <View style={styles.attStatCol}>
                <View style={styles.attIconCircleGreen}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#006C49" strokeWidth={2.5}>
                    <Polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.attStatNumberGreen}>{attendanceSummary.present_count}</Text>
                <Text style={styles.attStatLabel} numberOfLines={1}>Có mặt</Text>
              </View>

              <View style={styles.attDividerVer} />

              {/* Cột Vắng */}
              <View style={styles.attStatCol}>
                <View style={styles.attIconCircleRed}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#BA1A1A" strokeWidth={2.5}>
                    <Line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                    <Line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                  </Svg>
                </View>
                <Text style={styles.attStatNumberRed}>{attendanceSummary.absent_count}</Text>
                <Text style={styles.attStatLabel} numberOfLines={1}>Vắng</Text>
              </View>
            </View>

            {/* Attendance Log Detail Card: FIX LỖI RỚT CHỮ TRONG LOG */}
            <View style={styles.attendanceLogCard}>
              {attendanceLogs.map((log, idx) => {
                const isAbsent = log.status === 'ABSENT';
                const isExcused = log.permit_status === 'EXCUSED';

                return (
                  <View key={log.id || idx}>
                    <View style={styles.logRow}>
                      <View style={styles.logRowHeader}>
                        <View style={styles.logDateGroup}>
                          <View style={[styles.logIndicatorDot, { backgroundColor: isAbsent ? '#EF4444' : '#10B981' }]} />
                          <Text style={styles.logDateTitle} numberOfLines={1}>{log.date_title}</Text>
                        </View>

                        {/* Badges bên phải */}
                        <View style={styles.logBadgesGroup}>
                          {isAbsent ? (
                            <>
                              <View style={styles.badgeAbsent}>
                                <Text style={styles.badgeAbsentText}>VẮNG</Text>
                              </View>
                              <View style={styles.badgePermitWhite}>
                                <Svg width={12} height={12} viewBox="0 0 20 20" fill={isExcused ? '#10B981' : '#EF4444'}>
                                  {isExcused ? (
                                    <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                  ) : (
                                    <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.28 7.34a.75.75 0 011.06-1.06L10 8.94l2.66-2.66a.75.75 0 111.06 1.06L11.06 10l2.66 2.66a.75.75 0 11-1.06 1.06L10 11.06l-2.66 2.66a.75.75 0 01-1.06-1.06L8.94 10 6.28 7.34z" clipRule="evenodd" />
                                  )}
                                </Svg>
                                <Text style={styles.badgePermitText} numberOfLines={1}>{log.permit_label}</Text>
                              </View>
                            </>
                          ) : (
                            <View style={styles.badgePresentGreen}>
                              <Text style={styles.badgePresentText} numberOfLines={1}>Có mặt</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Ghi chú lý do nếu vắng */}
                      {log.reason && (
                        <View style={styles.logReasonRow}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
                            <Circle cx="12" cy="12" r="10" />
                            <Line x1="12" y1="16" x2="12" y2="12" />
                            <Line x1="12" y1="8" x2="12.01" y2="8" />
                          </Svg>
                          <Text style={styles.logReasonText}>Lý do: {log.reason}</Text>
                        </View>
                      )}
                    </View>
                    {idx < attendanceLogs.length - 1 && <View style={styles.hairlineDivider} />}
                  </View>
                );
              })}
            </View>

            {/* Motivational Footer Note */}
            <View style={styles.attFooterNoteCard}>
              <View style={styles.attFooterIconBox}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#984704" strokeWidth={2}>
                  <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <Polyline points="9 12 11 14 15 10" />
                </Svg>
              </View>
              <View style={styles.attFooterTextWrap}>
                <Text style={styles.attFooterTitle} numberOfLines={1}>
                  Chuyên cần tuần này: {attendanceSummary.rate_week}
                </Text>
                <Text style={styles.attFooterSub} numberOfLines={1}>
                  {attendanceSummary.note}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================= DOCK ĐIỀU HƯỚNG ĐÁY ================= */}
      <View style={styles.dockContainer}>
        {/* Tab 1: Trang chủ */}
        <TouchableOpacity
          style={styles.dockItem}
          onPress={onBackToHome}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <Polyline points="9 22 9 12 15 12 15 22" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Trang chủ</Text>
        </TouchableOpacity>

        {/* Tab 2: Học tập (Active Bubble) */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBubbleActive}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </Svg>
          </View>
          <Text style={styles.dockLabelActive}>Học tập</Text>
        </TouchableOpacity>

        {/* Tab 3: Thu phí */}
        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => onNavigateToTab?.('fees')}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Rect x="2" y="4" width="20" height="16" rx="2" />
              <Line x1="2" y1="10" x2="22" y2="10" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Thu phí</Text>
        </TouchableOpacity>

        {/* Tab 4: Cá nhân */}
        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => onNavigateToTab?.('profile')}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Cá nhân</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 110,
  },

  /* Header Row */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    minHeight: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  filterPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C192C',
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },

  /* Student Badge Row: FIX LỖI RỚT DÒNG */
  studentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  studentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
  },

  /* Segmented Control */
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 9999,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  segmentTextActive: {
    color: '#F58F4C',
    fontWeight: '700',
  },

  tabContentWrap: {
    gap: 12,
  },

  /* PAR-02a Subject Cards */
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  subjectTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subjectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C192C',
    letterSpacing: -0.2,
  },
  avgBadgePill: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    flexShrink: 0,
  },
  avgBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#554339',
  },
  scoresGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#FFF1E6',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  scoreBoxFaint: {
    opacity: 0.65,
  },
  scoreTypeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#554339',
    marginBottom: 3,
    textAlign: 'center',
  },
  scoreValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C192C',
    textAlign: 'center',
  },
  scoreValueFaint: {
    color: '#887367',
  },

  /* PAR-02b Remarks & Exams */
  examSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  examCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  examCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  examRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  examIconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B2E',
    flex: 1,
  },
  examDateBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
    flexShrink: 0,
    marginLeft: 8,
  },
  hairlineDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  remarkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  remarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  remarkTeacherTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B2E',
    flex: 1,
    paddingRight: 8,
  },
  remarkDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
    flexShrink: 0,
  },
  remarkContentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  remarkActionWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  confirmReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  confirmReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F58F4C',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  readBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFDBC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#554339',
    flex: 1,
    lineHeight: 16,
  },

  /* PAR-02c Attendance Tab */
  attendanceSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  attStatCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attIconCircleGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(111, 251, 190, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  attStatNumberGreen: {
    fontSize: 30,
    fontWeight: '900',
    color: '#10B981',
    lineHeight: 34,
  },
  attIconCircleRed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 218, 214, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  attStatNumberRed: {
    fontSize: 30,
    fontWeight: '900',
    color: '#EF4444',
    lineHeight: 34,
  },
  attStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6880',
    marginTop: 2,
  },
  attDividerVer: {
    width: 1,
    height: 52,
    backgroundColor: '#EBE5FF',
  },
  attendanceLogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  logRow: {
    paddingVertical: 10,
  },
  logRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  logDateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logDateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  logBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  badgeAbsent: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  badgeAbsentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badgePermitWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  badgePermitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  badgePresentGreen: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  badgePresentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingLeft: 16,
  },
  logReasonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
  },
  attFooterNoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attFooterIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFDBC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attFooterTextWrap: {
    flex: 1,
  },
  attFooterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  attFooterSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 1,
  },

  /* Dock điều hướng đáy */
  dockContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: 'rgba(30, 27, 46, 0.96)',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 8,
    zIndex: 50,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconBubbleActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  dockIconBox: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9E9BB2',
    marginTop: 3,
  },
  dockLabelActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
});
