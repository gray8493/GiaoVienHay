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
} from 'react-native';
import { Svg, Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Line } from 'react-native-svg';
import {
  remarksService,
  StudentRemarkItem,
  ExamReminderItem,
  RemarkStatus,
} from '../services/remarks.service';

interface RemarksExamScreenProps {
  onBack?: () => void;
  classId?: string;
  initialTab?: 'REMARKS' | 'EXAMS';
}

type RemarkFilter = 'ALL' | 'SENT' | 'UNSENT';

export const RemarksExamScreen: React.FC<RemarksExamScreenProps> = ({
  onBack,
  classId = '',
  initialTab = 'REMARKS',
}) => {
  const [activeTab, setActiveTab] = useState<'REMARKS' | 'EXAMS'>(initialTab);
  const [remarksList, setRemarksList] = useState<StudentRemarkItem[]>([]);
  const [examsList, setExamsList] = useState<ExamReminderItem[]>([]);

  // Tab A states
  const [searchQuery, setSearchQuery] = useState('');
  const [remarkFilter, setRemarkFilter] = useState<RemarkFilter>('ALL');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>('stu_02'); // Mặc định mở Trần Bảo Nam như database

  // Modal TEA-09.2 Nhập nhận xét
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [targetStudent, setTargetStudent] = useState<StudentRemarkItem | null>(null);
  const [remarkSubject, setRemarkSubject] = useState('Toán học');
  const [remarkContent, setRemarkContent] = useState('Em tiếp thu bài nhanh, hăng hái phát biểu.');

  // Modal TEA-09.3 Tạo lịch kiểm tra
  const [showExamModal, setShowExamModal] = useState(false);
  const [examSubject, setExamSubject] = useState('Toán học');
  const [examDate, setExamDate] = useState('16/10/2026');
  const [examType, setExamType] = useState('Kiểm tra 15 phút');
  const [examMessage, setExamMessage] = useState('Kính nhờ phụ huynh nhắc con ôn kỹ các dạng bài chương 1 cho bài kiểm tra.');

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    if (!classId || classId === 'cls_empty') {
      setRemarksList([]);
      setExamsList([]);
      return;
    }
    const remarks = await remarksService.getClassRemarks(classId);
    const exams = await remarksService.getClassExamReminders(classId);
    setRemarksList(remarks);
    setExamsList(exams);
  };

  const handleOpenRemarkModal = (student: StudentRemarkItem) => {
    setTargetStudent(student);
    setRemarkSubject(student.subject_name || 'Toán học');
    setRemarkContent(student.content || 'Em tiếp thu bài nhanh, hăng hái phát biểu.');
    setShowRemarkModal(true);
  };

  const handleSaveRemark = async () => {
    if (!targetStudent || !remarkContent.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung nhận xét');
      return;
    }

    await remarksService.createRemark({
      student_id: targetStudent.student_id,
      class_id: classId,
      subject_code: targetStudent.subject_code,
      content: remarkContent.trim(),
    });

    setRemarksList(prev =>
      prev.map(item => {
        if (item.id === targetStudent.id) {
          return {
            ...item,
            content: remarkContent.trim(),
            status: 'READ',
            sent_date: `Gửi hôm nay • ${remarkSubject}`,
          };
        }
        return item;
      })
    );

    setShowRemarkModal(false);
    Alert.alert('Thành công! ✨', `Đã gửi lời nhận xét cho học sinh ${targetStudent.student_name}.`);
  };

  const handleCreateExam = async () => {
    if (!examMessage.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập lời dặn dò kiểm tra');
      return;
    }

    await remarksService.createExamReminder({
      class_id: classId,
      subject_code: examSubject === 'Toán học' ? 'MATH' : 'LIT',
      exam_type: examType,
      exam_date: examDate,
      message: examMessage.trim(),
    });

    const newExam: ExamReminderItem = {
      id: 'exam_' + Date.now(),
      class_id: classId,
      subject_code: 'MATH',
      subject_name: examSubject,
      exam_type: examType,
      exam_date: examDate,
      day_of_week: 'Thứ Sáu',
      day_number: '16',
      month_str: 'Th10',
      message: examMessage.trim(),
      teacher_name: 'Cô Nguyễn Thu Hà',
      created_at: 'Hôm nay',
    };

    setExamsList(prev => [newExam, ...prev]);
    setShowExamModal(false);
    Alert.alert('Đã gửi thông báo! 📢', `Lịch kiểm tra ${examSubject} (${examType}) đã được gửi đến toàn thể 38 phụ huynh.`);
  };

  const getAvatarColors = (index: number) => {
    const palettes = [
      { bg: '#EEF2FF', text: '#4F46E5' },
      { bg: '#FEF3C7', text: '#B45309' },
      { bg: '#FCE7F3', text: '#BE185D' },
      { bg: '#E0E7FF', text: '#4338CA' },
      { bg: '#CCFBF1', text: '#0F766E' },
    ];
    return palettes[index % palettes.length];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredRemarks = remarksList.filter(item => {
    const matchSearch =
      item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student_code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    if (remarkFilter === 'SENT') return item.status === 'READ' || item.status === 'UNREAD';
    if (remarkFilter === 'UNSENT') return item.status === 'NONE';
    return true;
  });

  const sentCount = remarksList.filter(r => r.status !== 'NONE').length;
  const unsentCount = remarksList.filter(r => r.status === 'NONE').length;

  return (
    <View style={styles.container}>
      {/* Decorative Swirls & Sparkles Background */}
      <View style={styles.bgDecor} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path
            d="M-40 120C60 90 140 180 230 150C320 120 370 190 430 180"
            stroke="#F58F4C"
            strokeWidth={1.5}
            strokeDasharray="4 6"
            opacity={0.3}
          />
          <Path
            d="M-20 450C90 400 170 510 270 470C360 430 390 530 440 500"
            stroke="#F58F4C"
            strokeWidth={1.5}
            strokeDasharray="6 8"
            opacity={0.25}
          />
          <Path d="M330 95L332.5 102L340 104.5L332.5 107L330 114L327.5 107L320 104.5L327.5 102L330 95Z" fill="#F58F4C" opacity={0.4} />
          <Path d="M52 230L53.8 235.2L59 237L53.8 238.8L52 244L50.2 238.8L45 237L50.2 235.2L52 230Z" fill="#F58F4C" opacity={0.35} />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Row 1: Top Navigation Controls */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 19l-7-7 7-7"
                stroke="#1F2937"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.classPillDropdown}>
            <Text style={styles.classPillText}>Lớp 6A1</Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M6 9l6 6 6-6" stroke="#4B5563" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </View>

        {/* Row 2: Heading & 3D Illustration Graphic */}
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text style={styles.headingTitle}>Nhận Xét & Lịch Kiểm Tra</Text>
            <Text style={styles.headingSubtitle}>Năm học 2024 - 2025</Text>
          </View>

          {/* 3D Pastel Illustration Badge */}
          <View style={styles.illustrationBadge}>
            <View style={styles.badgeGlow} />
            <Svg width={64} height={64} viewBox="0 0 90 90" fill="none">
              <Rect x={22} y={24} width={38} height={46} rx={8} fill="#FFFFFF" />
              <Rect x={22} y={24} width={8} height={46} rx={4} fill="#FFB68B" />
              <Line x1={36} y1={36} x2={52} y2={36} stroke="#E6DFFA" strokeWidth={2.5} strokeLinecap="round" />
              <Line x1={36} y1={44} x2={48} y2={44} stroke="#E6DFFA" strokeWidth={2.5} strokeLinecap="round" />
              <Line x1={36} y1={52} x2={54} y2={52} stroke="#E6DFFA" strokeWidth={2.5} strokeLinecap="round" />
              {/* Cute Pencil */}
              <G transform="rotate(28 58 36)">
                <Rect x={52} y={22} width={8} height={28} rx={2} fill="#F58F4C" />
                <Path d="M52 22L56 14L60 22H52Z" fill="#312E42" />
                <Rect x={52} y={47} width={8} height={5} rx={1.5} fill="#EDEBFF" />
              </G>
              {/* Chat Bubble */}
              <Circle cx={24} cy={30} r={11} fill="#4A47D2" />
              <Path d="M19 28H29M19 32H25" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </View>
        </View>

        {/* Segmented Control 2 Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'REMARKS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('REMARKS')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabBtnText, activeTab === 'REMARKS' && styles.tabBtnTextActive]}>
              Lời Nhận Xét
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'EXAMS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('EXAMS')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabBtnText, activeTab === 'EXAMS' && styles.tabBtnTextActive]}>
              Lịch Kiểm Tra
            </Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* TAB A: LỜI NHẬN XÉT (TEA-09.1) */}
        {/* ======================================================== */}
        {activeTab === 'REMARKS' && (
          <View style={styles.tabContentCol}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={11} cy={11} r={8} stroke="#9CA3AF" strokeWidth={2} />
                <Path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm học sinh"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filter Chips Carousel */}
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.filterChip, remarkFilter === 'ALL' && styles.filterChipActive]}
                onPress={() => setRemarkFilter('ALL')}
              >
                <Text style={[styles.filterChipText, remarkFilter === 'ALL' && styles.filterChipTextActive]}>
                  Tất cả ({remarksList.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, remarkFilter === 'SENT' && styles.filterChipActive]}
                onPress={() => setRemarkFilter('SENT')}
              >
                <Text style={[styles.filterChipText, remarkFilter === 'SENT' && styles.filterChipTextActive]}>
                  Đã gửi ({sentCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, remarkFilter === 'UNSENT' && styles.filterChipActive]}
                onPress={() => setRemarkFilter('UNSENT')}
              >
                <Text style={[styles.filterChipText, remarkFilter === 'UNSENT' && styles.filterChipTextActive]}>
                  Chưa gửi ({unsentCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Student List Bento Container */}
            <View style={styles.studentListCard}>
              {filteredRemarks.map((student, idx) => {
                const colors = getAvatarColors(idx);
                const isExpanded = expandedStudentId === student.id;

                return (
                  <View key={student.id}>
                    <View style={styles.studentRow}>
                      <TouchableOpacity
                        style={styles.studentLeftArea}
                        onPress={() => setExpandedStudentId(isExpanded ? null : student.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.avatarBox, { backgroundColor: colors.bg }]}>
                          <Text style={[styles.avatarText, { color: colors.text }]}>
                            {getInitials(student.student_name)}
                          </Text>
                        </View>
                        <View style={styles.studentInfoCol}>
                          <Text style={styles.studentName} numberOfLines={1}>
                            {student.student_name}
                          </Text>
                          <Text style={styles.studentCode}>{student.student_code}</Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.studentRightActions}>
                        {student.status === 'READ' && (
                          <View style={styles.badgeRead}>
                            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                              <Path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth={3} strokeLinecap="round" />
                            </Svg>
                            <Text style={styles.badgeReadText}>Đã đọc</Text>
                          </View>
                        )}

                        {student.status === 'UNREAD' && (
                          <View style={styles.badgeUnread}>
                            <View style={styles.orangeDot} />
                            <Text style={styles.badgeUnreadText}>Chưa xem</Text>
                          </View>
                        )}

                        {student.status === 'NONE' && (
                          <View style={styles.badgeNone}>
                            <Text style={styles.badgeNoneText}>Chưa có</Text>
                          </View>
                        )}

                        {/* Edit Remark Pen Button */}
                        <TouchableOpacity
                          style={styles.editPenBtn}
                          onPress={() => handleOpenRemarkModal(student)}
                          activeOpacity={0.8}
                        >
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                              stroke="#F58F4C"
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                            <Path
                              d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="#F58F4C"
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                          </Svg>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Expanded Remark Content Box */}
                    {isExpanded && student.content && (
                      <View style={styles.expandedRemarkBox}>
                        <Text style={styles.expandedRemarkText}>{student.content}</Text>
                        <View style={styles.expandedRemarkMetaRow}>
                          <Text style={styles.expandedMetaDate}>{student.sent_date || 'Gửi gần đây'}</Text>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#9A3412" strokeWidth={2} />
                          </Svg>
                        </View>
                      </View>
                    )}

                    {idx < filteredRemarks.length - 1 && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB B: LỊCH KIỂM TRA (TEA-09.1b) */}
        {/* ======================================================== */}
        {activeTab === 'EXAMS' && (
          <View style={styles.tabContentCol}>
            {examsList.map(exam => (
              <View key={exam.id} style={styles.examCard}>
                {/* Left Date Block */}
                <View style={styles.examDateBlock}>
                  <Text style={styles.examDayWeekText}>{exam.day_of_week}</Text>
                  <Text style={styles.examDayNumberText}>{exam.day_number}</Text>
                  <Text style={styles.examMonthText}>{exam.month_str}</Text>
                </View>

                {/* Right Content */}
                <View style={styles.examRightCol}>
                  <View style={styles.examTitleRow}>
                    <Text style={styles.examSubjectText}>{exam.subject_name}</Text>
                    <View style={styles.examTypePill}>
                      <Text style={styles.examTypePillText}>{exam.exam_type}</Text>
                    </View>
                  </View>

                  <Text style={styles.examMessageText} numberOfLines={3}>
                    {exam.message}
                  </Text>

                  <View style={styles.examMetaRow}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                        stroke="#887367"
                        strokeWidth={2}
                      />
                    </Svg>
                    <Text style={styles.examMetaText}>
                      {exam.teacher_name} • {exam.created_at}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Fixed Bottom Action for Tab B: Tạo Lịch Kiểm Tra */}
      {activeTab === 'EXAMS' && (
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={styles.createExamBtn}
            onPress={() => setShowExamModal(true)}
            activeOpacity={0.88}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
            <Text style={styles.createExamBtnText}>Tạo Lịch Kiểm Tra</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ======================================================== */}
      {/* TEA-09.2: HỘP THOẠI NHẬP LỜI NHẬN XÉT (BOTTOM-SHEET) */}
      {/* ======================================================== */}
      <Modal
        visible={showRemarkModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRemarkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowRemarkModal(false)}
          />

          <View style={styles.sheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Student Header Row */}
            <View style={styles.sheetStudentHeader}>
              <View style={styles.sheetStudentLeft}>
                <View style={styles.sheetAvatarBox}>
                  <Text style={styles.sheetAvatarText}>
                    {targetStudent ? getInitials(targetStudent.student_name) : 'BN'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.sheetStudentName}>
                    {targetStudent?.student_name || 'Trần Bảo Nam'}
                  </Text>
                  <View style={styles.sheetStudentCodeBadge}>
                    <Text style={styles.sheetStudentCodeText}>
                      {targetStudent?.student_code || 'HS240102'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setShowRemarkModal(false)}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Field 1: Môn học Dropdown Module */}
            <View style={styles.inputCard}>
              <Text style={styles.inputCardLabel}>MÔN HỌC</Text>
              <View style={styles.inputCardRow}>
                <Text style={styles.inputCardValue}>{remarkSubject}</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 9l6 6 6-6" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>

            {/* Field 2: Nhận xét Text Area Module */}
            <View style={[styles.inputCard, { marginTop: 12 }]}>
              <Text style={styles.inputCardLabel}>NHẬN XÉT</Text>
              <TextInput
                style={styles.textareaInput}
                multiline
                numberOfLines={3}
                value={remarkContent}
                onChangeText={setRemarkContent}
                placeholder="Nhập lời nhận xét..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Send Remark Action Button */}
            <TouchableOpacity
              style={styles.sendRemarkBtn}
              onPress={handleSaveRemark}
              activeOpacity={0.88}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="#FFFFFF">
                <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </Svg>
              <Text style={styles.sendRemarkBtnText}>Gửi Nhận Xét</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* TEA-09.3: HỘP THOẠI TẠO LỊCH KIỂM TRA (BOTTOM-SHEET) */}
      {/* ======================================================== */}
      <Modal
        visible={showExamModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowExamModal(false)}
          />

          <View style={styles.sheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.sheetSimpleHeader}>
              <Text style={styles.sheetSimpleTitle}>Tạo Lịch Kiểm Tra</Text>
              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setShowExamModal(false)}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Row: Môn học & Ngày kiểm tra */}
            <View style={styles.dualFieldRow}>
              {/* Field 1: Môn học */}
              <View style={styles.halfFieldBox}>
                <Text style={styles.halfFieldLabel}>Môn học</Text>
                <View style={styles.halfFieldBottom}>
                  <Text style={styles.halfFieldValue}>{examSubject}</Text>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                </View>
              </View>

              {/* Field 2: Ngày kiểm tra */}
              <View style={styles.halfFieldBox}>
                <Text style={styles.halfFieldLabel}>Ngày kiểm tra</Text>
                <View style={styles.halfFieldBottom}>
                  <TextInput
                    style={styles.halfFieldInput}
                    value={examDate}
                    onChangeText={setExamDate}
                    placeholder="DD/MM/YYYY"
                  />
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#F58F4C" strokeWidth={2} />
                    <Path d="M16 2v4M8 2v4M3 10h18" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                </View>
              </View>
            </View>

            {/* Form Section: Hình thức (4 quick pills) */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.examPillsLabel}>Hình thức</Text>
              <View style={styles.examPillsGrid}>
                {['Kiểm tra 15 phút', 'Kiểm tra 1 tiết', 'Thi Giữa kỳ', 'Thi Cuối kỳ'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.examPillItem, examType === type && styles.examPillItemActive]}
                    onPress={() => setExamType(type)}
                  >
                    <Text style={[styles.examPillItemText, examType === type && styles.examPillItemTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Form Section: Dặn dò phụ huynh */}
            <View style={[styles.inputCard, { marginTop: 14 }]}>
              <Text style={styles.inputCardLabel}>DẶN DÒ PHỤ HUYNH</Text>
              <TextInput
                style={styles.textareaInput}
                multiline
                numberOfLines={3}
                value={examMessage}
                onChangeText={setExamMessage}
                placeholder="Nhập nội dung dặn dò..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.broadcastExamBtn}
              onPress={handleCreateExam}
              activeOpacity={0.88}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.broadcastExamBtnText}>Gửi Thông Báo</Text>
              <View style={styles.broadcastBadge}>
                <Text style={styles.broadcastBadgeText}>38</Text>
              </View>
            </TouchableOpacity>
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
    position: 'relative',
  },
  bgDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  classPillDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  classPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  headingTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  headingSubtitle: {
    fontSize: 12,
    color: '#78350F',
    opacity: 0.75,
    fontWeight: '600',
    marginTop: 2,
  },
  illustrationBadge: {
    width: 72,
    height: 72,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#FFD8B5',
    opacity: 0.5,
    transform: [{ rotate: '4deg' }],
  },

  // Segmented Control
  tabBar: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  tabContentCol: {
    gap: 12,
  },

  // TAB A: Remarks
  searchBar: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#1F2937',
    padding: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  studentListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 3,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  studentLeftArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  studentInfoCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  studentCode: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
  },
  studentRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeRead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  badgeUnread: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  badgeUnreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  badgeNone: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeNoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  editPenBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedRemarkBox: {
    backgroundColor: '#FFF1E6',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  expandedRemarkText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#374151',
    fontWeight: '500',
  },
  expandedRemarkMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  expandedMetaDate: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#9A3412',
  },
  divider: {
    height: 1,
    backgroundColor: '#F7EFEA',
    marginVertical: 6,
  },

  // TAB B: Exams
  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 3,
  },
  examDateBlock: {
    width: 64,
    borderRadius: 16,
    backgroundColor: '#FFF1E6',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examDayWeekText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#984704',
  },
  examDayNumberText: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    color: '#F58F4C',
    marginVertical: 1,
  },
  examMonthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#984704',
  },
  examRightCol: {
    flex: 1,
  },
  examTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    flexWrap: 'wrap',
  },
  examSubjectText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  examTypePill: {
    backgroundColor: '#EDEBFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  examTypePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  examMessageText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
    marginTop: 6,
  },
  examMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  examMetaText: {
    fontSize: 11.5,
    color: '#887367',
    fontWeight: '500',
  },

  // Fixed Bottom Bar Tab B
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 18,
    elevation: 8,
  },
  createExamBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  createExamBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modals Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdropDismiss: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -10 },
    shadowRadius: 30,
    elevation: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },

  // TEA-09.2 Remark Sheet
  sheetStudentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetStudentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFDBC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#984704',
  },
  sheetStudentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  sheetStudentCodeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  sheetStudentCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  sheetCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  textareaInput: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1E293B',
    padding: 0,
    minHeight: 60,
  },
  sendRemarkBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  sendRemarkBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // TEA-09.3 Exam Sheet
  sheetSimpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetSimpleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  dualFieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfFieldBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  halfFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  halfFieldBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  halfFieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  halfFieldInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    padding: 0,
    flex: 1,
  },
  examPillsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  examPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  examPillItem: {
    width: '48%',
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examPillItemActive: {
    backgroundColor: '#FFF1E6',
    borderColor: '#F58F4C',
  },
  examPillItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  examPillItemTextActive: {
    color: '#F58F4C',
    fontWeight: '700',
  },
  broadcastExamBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  broadcastExamBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  broadcastBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  broadcastBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F58F4C',
  },
});
