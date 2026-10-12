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
} from 'react-native';
import { Svg, Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';
import { classService, StudentItem, ClassDetailData } from '../services/class.service';

const { width } = Dimensions.get('window');

interface ClassManagementScreenProps {
  onBack?: () => void;
  classId?: string;
}

export const ClassManagementScreen: React.FC<ClassManagementScreenProps> = ({
  onBack,
  classId = 'cls_6a1',
}) => {
  const [classData, setClassData] = useState<ClassDetailData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>('stu_02'); // Mặc định mở Trần Bảo Nam như database
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState<'PARENT' | 'TEACHER'>('TEACHER');
  const [teacherInviteCode, setTeacherInviteCode] = useState('TCH-6A1-4417');
  const [parentInviteCode, setParentInviteCode] = useState('PAR-6A1-8821');
  const [currentInviteCode, setCurrentInviteCode] = useState('TCH-6A1-4417');
  const [copiedToast, setCopiedToast] = useState(false);

  // Form State Thêm học sinh
  const [formName, setFormName] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formGender, setFormGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [formPhone, setFormPhone] = useState('');

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = async () => {
    const data = await classService.getClassDetail(classId);
    setClassData(data);
    const cleanName = (data.name || '6A1').toUpperCase().replace(/\s+/g, '');
    if (data.invite_code) {
      setParentInviteCode(data.invite_code.startsWith('INV-') ? data.invite_code.replace('INV-', 'PAR-') : data.invite_code);
      setTeacherInviteCode(`TCH-${cleanName}-4417`);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedStudentId(prev => (prev === id ? null : id));
    setActiveMenuStudentId(null);
  };

  const handleToggleMenu = (id: string) => {
    setActiveMenuStudentId(prev => (prev === id ? null : id));
  };

  const handleOpenDelete = (student: StudentItem) => {
    setActiveMenuStudentId(null);
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete || !classData) return;
    await classService.removeStudent(classId, studentToDelete.id);
    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        student_count: Math.max(0, prev.student_count - 1),
        students: prev.students.filter(s => s.id !== studentToDelete.id),
      };
    });
    setShowDeleteDialog(false);
    setStudentToDelete(null);
  };

  const handleSaveStudent = async () => {
    if (!formName.trim() || !classData) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên học sinh');
      return;
    }

    const newStudent = await classService.addStudent(classId, {
      full_name: formName.trim(),
      dob: formDob.trim(),
      gender: formGender,
      parent_phone: formPhone.trim(),
    });

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        student_count: prev.student_count + 1,
        students: [newStudent, ...prev.students],
      };
    });

    setShowAddModal(false);
    // Reset form
    setFormName('');
    setFormPhone('');
  };

  const handleRefreshInviteCode = async () => {
    try {
      const res = await classService.generateInviteCode(classId);
      const cleanClassName = (classData?.name || '6A1').toUpperCase().replace(/\s+/g, '');
      const rawCode = res.invite_code || '';
      const suffix = rawCode.includes('-') ? rawCode.split('-').pop() : Math.floor(1000 + Math.random() * 9000).toString();

      if (inviteRole === 'TEACHER') {
        setTeacherInviteCode(`TCH-${cleanClassName}-${suffix}`);
      } else {
        setParentInviteCode(`PAR-${cleanClassName}-${suffix}`);
      }
    } catch (e) {
      const cleanClassName = (classData?.name || '6A1').toUpperCase().replace(/\s+/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      if (inviteRole === 'TEACHER') {
        setTeacherInviteCode(`TCH-${cleanClassName}-${randomSuffix}`);
      } else {
        setParentInviteCode(`PAR-${cleanClassName}-${randomSuffix}`);
      }
    }
  };

  const handleCopyCode = () => {
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // Avatar helper
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColors = (index: number) => {
    const palettes = [
      { bg: '#E0E7FF', text: '#4A47D2' },
      { bg: '#FEF3C7', text: '#B45309' },
      { bg: '#FCE7F3', text: '#BE185D' },
      { bg: '#EDE9FE', text: '#7C3AED' },
      { bg: '#CCFBF1', text: '#0F766E' },
    ];
    return palettes[index % palettes.length];
  };

  const filteredStudents = (classData?.students || []).filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Decorative Swirls & Sparkles Background */}
      <View style={styles.bgDecor} pointerEvents="none">
        <Svg width="390" height="844" viewBox="0 0 390 844" fill="none">
          <Path
            d="M-20 120C80 90 140 180 230 150C320 120 370 200 420 180"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeDasharray="4 8"
            strokeLinecap="round"
            opacity={0.5}
          />
          <Path
            d="M-40 380C60 340 130 460 250 410C350 370 380 470 430 440"
            stroke="#FFFFFF"
            strokeWidth={2}
            opacity={0.4}
          />
          <Path
            d="M10 650C100 600 160 700 280 660C360 630 400 710 420 690"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeDasharray="6 10"
            strokeLinecap="round"
            opacity={0.45}
          />
          {/* Sparkles */}
          <Path d="M60 90L62 95L67 97L62 99L60 104L58 99L53 97L58 95Z" fill="#F58F4C" opacity={0.7} />
          <Path d="M320 220L322 225L327 227L322 229L320 234L318 229L313 227L318 225Z" fill="#F58F4C" opacity={0.7} />
          <Path d="M340 580L342 585L347 587L342 589L340 594L338 589L333 587L338 585Z" fill="#FFAA5C" opacity={0.6} />
        </Svg>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 19l-7-7 7-7"
                  stroke="#1C192C"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản Lý Lớp Học</Text>
          </View>

          {/* 3D Pastel Books & Pencil Illustration */}
          <View style={styles.illustrationWrapper}>
            <Svg width={72} height={56} viewBox="0 0 88 72" fill="none">
              <Path d="M72 10L73.5 14.5L78 16L73.5 17.5L72 22L70.5 17.5L66 16L70.5 14.5Z" fill="#F58F4C" opacity={0.8} />
              <Path d="M18 6L19 9L22 10L19 11L18 14L17 11L14 10L17 9Z" fill="#FFAA5C" opacity={0.9} />
              {/* Bottom Pastel Book */}
              <G transform="rotate(-6 44 48)">
                <Rect x={20} y={42} width={46} height={11} rx={4} fill="#6462EC" />
                <Rect x={22} y={44} width={42} height={7} rx={2} fill="#E2DFFF" />
              </G>
              {/* Top Pastel Book */}
              <G transform="rotate(4 46 36)">
                <Rect x={24} y={30} width={44} height={10} rx={3.5} fill="#22C087" />
                <Rect x={26} y={32} width={40} height={6.5} rx={2} fill="#DCFCE7" />
              </G>
              {/* Playful 3D Pencil */}
              <G transform="rotate(38 52 26)">
                <Rect x={42} y={10} width={8} height={28} rx={2.5} fill="#FBBF24" />
                <Path d="M42 38L46 45L50 38H42Z" fill="#FED7AA" />
                <Path d="M44.8 43L46 45L47.2 43H44.8Z" fill="#1C192C" />
                <Rect x={42} y={10} width={8} height={6} rx={2} fill="#F472B6" />
              </G>
            </Svg>
          </View>
        </View>

        {/* Class Info Bento Card */}
        <View style={styles.classInfoCard}>
          <View style={styles.classInfoLeft}>
            <View style={styles.classTitleRow}>
              <Text style={styles.className}>{classData?.name || 'Lớp 6A1'}</Text>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>Khối {classData?.grade_level || 6} • {classData?.academic_year || '2026-2027'}</Text>
              </View>
            </View>
            <View style={styles.schoolRow}>
              <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1m-4 6v-4h4v4"
                  stroke="#F58F4C"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.schoolText}>{classData?.school_name || 'THCS Lê Quý Đôn'}</Text>
            </View>
            <Text style={styles.homeroomTeacherText}>GVCN: {classData?.homeroom_teacher || 'Cô Nguyễn Thu Hà'}</Text>
          </View>

          <View style={styles.classInfoRight}>
            <Text style={styles.studentCountNumber}>{classData?.student_count || 38}</Text>
            <Text style={styles.studentCountLabel}>học sinh</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={8} stroke="#887367" strokeWidth={2} />
            <Path d="M21 21l-4.35-4.35" stroke="#887367" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm học sinh theo tên hoặc mã..."
            placeholderTextColor="#887367"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Student List Bento Container */}
        <View style={styles.studentListCard}>
          {filteredStudents.map((student, idx) => {
            const isExpanded = expandedStudentId === student.id;
            const isMenuOpen = activeMenuStudentId === student.id;
            const colors = getAvatarColors(idx);

            return (
              <View
                key={student.id}
                style={[
                  styles.studentRowContainer,
                  isExpanded && styles.studentRowExpanded,
                  idx === filteredStudents.length - 1 && !isExpanded && { borderBottomWidth: 0 },
                ]}
              >
                {/* Click row to expand/collapse */}
                <TouchableOpacity
                  style={styles.studentRowMain}
                  onPress={() => handleToggleExpand(student.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.studentLeft}>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.avatarText, { color: colors.text }]}>
                        {getInitials(student.full_name)}
                      </Text>
                    </View>
                    <View style={styles.studentMeta}>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {student.full_name}
                      </Text>
                      <Text style={styles.studentCode}>
                        {student.student_code}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rowRightActions}>
                    <TouchableOpacity
                      style={styles.moreBtn}
                      onPress={() => handleToggleMenu(student.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Circle cx={5} cy={12} r={2} fill="#554339" />
                        <Circle cx={12} cy={12} r={2} fill="#554339" />
                        <Circle cx={19} cy={12} r={2} fill="#554339" />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                {/* Popover Action Menu */}
                {isMenuOpen && (
                  <View style={styles.popoverMenu}>
                    <TouchableOpacity
                      style={styles.popoverItem}
                      onPress={() => handleOpenDelete(student)}
                    >
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          stroke="#BA1A1A"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <Text style={styles.popoverDeleteText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Sub-row details when Expanded */}
                {isExpanded && (
                  <View style={styles.expandedDetailsRow}>
                    <View style={styles.infoPill}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#984704" strokeWidth={2} />
                        <Path d="M16 2v4M8 2v4M3 10h18" stroke="#984704" strokeWidth={2} strokeLinecap="round" />
                      </Svg>
                      <Text style={styles.infoPillText}>{student.dob || '12/03/2014'}</Text>
                    </View>

                    {student.parent_phone ? (
                      <View style={styles.infoPill}>
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            stroke="#984704"
                            strokeWidth={2}
                          />
                        </Svg>
                        <Text style={styles.infoPillText}>{student.parent_phone}</Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      <View style={styles.fixedBottomBar}>
        {/* Outlined Pill: Mã Mời (~38%) */}
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => setShowInviteModal(true)}
          activeOpacity={0.85}
        >
          <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={3} width={7} height={7} rx={1} stroke="#F58F4C" strokeWidth={2} />
            <Rect x={14} y={3} width={7} height={7} rx={1} stroke="#F58F4C" strokeWidth={2} />
            <Rect x={3} y={14} width={7} height={7} rx={1} stroke="#F58F4C" strokeWidth={2} />
            <Path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3v1h-3z" fill="#F58F4C" />
          </Svg>
          <Text style={styles.inviteBtnText}>Mã Mời</Text>
        </TouchableOpacity>

        {/* Primary Filled Pill: Thêm Học Sinh (~62%) */}
        <TouchableOpacity
          style={styles.addStudentBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.88}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
          </Svg>
          <Text style={styles.addStudentBtnText}>Thêm Học Sinh</Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* TEA-08.2: MODAL THÊM HỌC SINH (BOTTOM-SHEET) */}
      {/* ======================================================== */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />

          <View style={styles.addSheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header with Title + 3D Graduation Cap Icon */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Thêm Học Sinh</Text>
              <View style={styles.capIconWrapper}>
                <Svg width={36} height={36} viewBox="0 0 40 40" fill="none">
                  <Path
                    d="M20 7L3 16L20 25L37 16L20 7Z"
                    fill="#F58F4C"
                  />
                  <Path
                    d="M8 21.5V28C8 32 13.5 35 20 35C26.5 35 32 32 32 28V21.5L20 28L8 21.5Z"
                    fill="#EA580C"
                  />
                  <Path
                    d="M33 18.5V29C33 29 35 30 35 32"
                    stroke="#FBBF24"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Circle cx={35} cy={32} r={2} fill="#F59E0B" />
                </Svg>
              </View>
            </View>

            {/* Form Fields */}
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              {/* Field 1: Họ và tên * */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Họ và tên <Text style={{ color: '#BA1A1A' }}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputText}
                    placeholder="Nhập họ và tên học sinh"
                    placeholderTextColor="#A3A0B5"
                    value={formName}
                    onChangeText={setFormName}
                  />
                </View>
              </View>

              {/* Field 2: Ngày sinh */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngày sinh</Text>
                <View style={styles.inputBoxWithIcon}>
                  <TextInput
                    style={styles.inputText}
                    placeholder="DD/MM/YYYY (VD: 15/06/2014)"
                    placeholderTextColor="#A3A0B5"
                    value={formDob}
                    onChangeText={setFormDob}
                  />
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#F58F4C" strokeWidth={2} />
                    <Path d="M16 2v4M8 2v4M3 10h18" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                </View>
              </View>

              {/* Field 3: Giới tính */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giới tính</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[
                      styles.genderPill,
                      formGender === 'MALE' ? styles.genderPillActive : styles.genderPillInactive,
                    ]}
                    onPress={() => setFormGender('MALE')}
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        formGender === 'MALE' ? styles.genderPillTextActive : styles.genderPillTextInactive,
                      ]}
                    >
                      Nam
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.genderPill,
                      formGender === 'FEMALE' ? styles.genderPillActive : styles.genderPillInactive,
                    ]}
                    onPress={() => setFormGender('FEMALE')}
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        formGender === 'FEMALE' ? styles.genderPillTextActive : styles.genderPillTextInactive,
                      ]}
                    >
                      Nữ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Field 4: SĐT phụ huynh */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>SĐT phụ huynh</Text>
                <View style={styles.inputBoxWithIcon}>
                  <TextInput
                    style={styles.inputText}
                    placeholder="09xx xxx xxx"
                    placeholderTextColor="#A3A0B5"
                    keyboardType="phone-pad"
                    value={formPhone}
                    onChangeText={setFormPhone}
                  />
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      stroke="#F58F4C"
                      strokeWidth={2}
                    />
                  </Svg>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Form Actions */}
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.cancelSheetBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelSheetBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveSheetBtn}
                onPress={handleSaveStudent}
                activeOpacity={0.88}
              >
                <Text style={styles.saveSheetBtnText}>Lưu</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* TEA-08.4: DIALOG XÁC NHẬN XÓA HỌC SINH */}
      {/* ======================================================== */}
      <Modal
        visible={showDeleteDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            {/* 3D Pastel Red Trash Can Vector */}
            <View style={styles.trashIconContainer}>
              <View style={styles.trashGlow} />
              <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
                <Defs>
                  <SvgLinearGradient id="trashGrad" x1="16" y1="22" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                    <Stop offset="0%" stopColor="#FF7676" />
                    <Stop offset="100%" stopColor="#EF4444" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="lidGrad" x1="14" y1="14" x2="50" y2="22" gradientUnits="userSpaceOnUse">
                    <Stop offset="0%" stopColor="#FFA2A2" />
                    <Stop offset="100%" stopColor="#F87171" />
                  </SvgLinearGradient>
                </Defs>
                {/* Trash body */}
                <Path
                  d="M20 23L23.2 51.5C23.5 54.5 26 56.8 29.1 56.8H34.9C38 56.8 40.5 54.5 40.8 51.5L44 23H20Z"
                  fill="url(#trashGrad)"
                />
                {/* Ridges */}
                <Path d="M27 28L28.2 49" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.45} />
                <Path d="M32 28L32 49" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.45} />
                <Path d="M37 28L35.8 49" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.45} />
                {/* Lid */}
                <Rect x={15} y={18} width={34} height={6} rx={3} fill="url(#lidGrad)" />
                <Path d="M27 18V13.5C27 12.1 28.1 11 29.5 11H34.5C35.9 11 37 12.1 37 13.5V18" stroke="url(#lidGrad)" strokeWidth={3} strokeLinecap="round" />
                {/* Gold Sparkle */}
                <Path d="M49 8L50.8 13.2L56 15L50.8 16.8L49 22L47.2 16.8L42 15L47.2 13.2Z" fill="#F59E0B" />
              </Svg>
            </View>

            <Text style={styles.dialogTitle}>Xóa học sinh?</Text>
            <Text style={styles.dialogDesc}>
              {studentToDelete?.full_name || 'Học sinh này'} sẽ bị xóa khỏi {classData?.name || 'lớp 6A1'}.
            </Text>

            {/* Stacked Action Buttons */}
            <View style={styles.dialogActionCol}>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleConfirmDelete}
                activeOpacity={0.88}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.deleteConfirmBtnText}>Xóa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setShowDeleteDialog(false)}
              >
                <Text style={styles.deleteCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* TEA-08.3: BOTTOM SHEET MÃ MỜI PHỤ HUYNH */}
      {/* ======================================================== */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowInviteModal(false)}
          />

          <View style={styles.inviteSheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header Title dynamic */}
            <Text style={styles.inviteSheetTitle}>
              {inviteRole === 'TEACHER' ? 'Mã Mời Giáo Viên' : 'Mã Mời Phụ Huynh'}
            </Text>

            {/* Role Switcher Pill [Phụ Huynh] | [Giáo Viên] */}
            <View style={styles.inviteRoleSegment}>
              <TouchableOpacity
                style={[styles.inviteRoleBtn, inviteRole === 'PARENT' && styles.inviteRoleBtnActive]}
                onPress={() => setInviteRole('PARENT')}
                activeOpacity={0.8}
              >
                <Text style={[styles.inviteRoleBtnText, inviteRole === 'PARENT' && styles.inviteRoleBtnTextActive]}>
                  Phụ Huynh
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inviteRoleBtn, inviteRole === 'TEACHER' && styles.inviteRoleBtnActive]}
                onPress={() => setInviteRole('TEACHER')}
                activeOpacity={0.8}
              >
                <Text style={[styles.inviteRoleBtnText, inviteRole === 'TEACHER' && styles.inviteRoleBtnTextActive]}>
                  Giáo Viên
                </Text>
              </TouchableOpacity>
            </View>

            {/* QR Card in Peach #FFF1E6 with sparkles */}
            <View style={styles.qrCardContainer}>
              <Text style={styles.sparkleTopRight}>✦</Text>
              <Text style={styles.sparkleBottomLeft}>✧</Text>
              <Text style={styles.sparkleTopLeft}>★</Text>

              {/* Clean QR code Vector SVG */}
              <View style={styles.qrWhiteBox}>
                <Svg width={140} height={140} viewBox="0 0 100 100" fill="#2D2A26">
                  {/* Top-Left Finder */}
                  <Rect x={5} y={5} width={28} height={28} rx={5} fill="#2D2A26" />
                  <Rect x={9} y={9} width={20} height={20} rx={3} fill="#FFFFFF" />
                  <Rect x={13} y={13} width={12} height={12} rx={2} fill="#2D2A26" />

                  {/* Top-Right Finder */}
                  <Rect x={67} y={5} width={28} height={28} rx={5} fill="#2D2A26" />
                  <Rect x={71} y={9} width={20} height={20} rx={3} fill="#FFFFFF" />
                  <Rect x={75} y={13} width={12} height={12} rx={2} fill="#2D2A26" />

                  {/* Bottom-Left Finder */}
                  <Rect x={5} y={67} width={28} height={28} rx={5} fill="#2D2A26" />
                  <Rect x={9} y={71} width={20} height={20} rx={3} fill="#FFFFFF" />
                  <Rect x={13} y={75} width={12} height={12} rx={2} fill="#2D2A26" />

                  {/* Timing & Alignment Bits */}
                  <Rect x={37} y={10} width={4} height={4} rx={1} />
                  <Rect x={45} y={10} width={4} height={4} rx={1} />
                  <Rect x={53} y={10} width={4} height={4} rx={1} />
                  <Rect x={10} y={37} width={4} height={4} rx={1} />
                  <Rect x={10} y={45} width={4} height={4} rx={1} />

                  {/* Central Branded Pixel in Orange */}
                  <Rect x={40} y={36} width={6} height={6} rx={1} />
                  <Rect x={48} y={46} width={6} height={6} rx={1.5} fill="#F58F4C" />
                  <Rect x={58} y={46} width={8} height={8} rx={1} />
                  <Rect x={38} y={58} width={14} height={6} rx={1} />

                  {/* Dense data dots */}
                  <Rect x={68} y={38} width={5} height={5} rx={1} />
                  <Rect x={77} y={38} width={5} height={5} rx={1} />
                  <Rect x={68} y={47} width={8} height={5} rx={1} />
                  <Rect x={80} y={47} width={5} height={5} rx={1} />
                  <Rect x={37} y={68} width={8} height={5} rx={1} />
                  <Rect x={49} y={68} width={5} height={5} rx={1} />
                  <Rect x={68} y={68} width={6} height={6} rx={1} />
                  <Rect x={78} y={68} width={8} height={6} rx={1} />
                  <Rect x={37} y={77} width={5} height={8} rx={1} />
                  <Rect x={46} y={77} width={8} height={5} rx={1} />
                  <Rect x={68} y={78} width={8} height={5} rx={1} />
                  <Rect x={80} y={78} width={6} height={5} rx={1} />
                </Svg>
              </View>
            </View>

            {/* Invite Code Text + Round Copy Button */}
            <View style={styles.inviteCodeRow}>
              <Text style={styles.inviteCodeText}>
                {inviteRole === 'TEACHER' ? teacherInviteCode : parentInviteCode}
              </Text>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={handleCopyCode}
                activeOpacity={0.8}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect x={9} y={9} width={13} height={13} rx={2} stroke="#F58F4C" strokeWidth={2} />
                  <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#F58F4C" strokeWidth={2} />
                </Svg>
              </TouchableOpacity>
            </View>

            {copiedToast && (
              <Text style={styles.copiedToastText}>✓ Đã sao chép mã mời vào bộ nhớ tạm</Text>
            )}

            {/* Validity Pill with Clock */}
            <View style={styles.validityPill}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} stroke="#6B6880" strokeWidth={2} />
                <Path d="M12 6v6l4 2" stroke="#6B6880" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={styles.validityText}>Hiệu lực 72 giờ</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.inviteActionsCol}>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => {
                  const activeCode = inviteRole === 'TEACHER' ? teacherInviteCode : parentInviteCode;
                  const roleLabel = inviteRole === 'TEACHER' ? 'giáo viên bộ môn' : 'phụ huynh';
                  Alert.alert('Chia sẻ mã mời', `Mã mời ${roleLabel} lớp ${classData?.name}: ${activeCode}`);
                }}
                activeOpacity={0.88}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx={18} cy={5} r={3} stroke="#FFFFFF" strokeWidth={2} />
                  <Circle cx={6} cy={12} r={3} stroke="#FFFFFF" strokeWidth={2} />
                  <Circle cx={18} cy={19} r={3} stroke="#FFFFFF" strokeWidth={2} />
                  <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#FFFFFF" strokeWidth={2} />
                </Svg>
                <Text style={styles.shareBtnText}>Chia Sẻ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.refreshCodeBtn}
                onPress={handleRefreshInviteCode}
                activeOpacity={0.85}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    stroke="#F58F4C"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.refreshCodeBtnText}>Tạo Mã Mới</Text>
              </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C192C',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: '#1C192C',
    letterSpacing: -0.2,
  },
  illustrationWrapper: {
    width: 68,
    height: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  classInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  classInfoLeft: {
    flex: 1,
    paddingRight: 12,
  },
  classTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  className: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
    color: '#1C192C',
  },
  gradeBadge: {
    backgroundColor: '#FFE5D3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  gradeBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#F58F4C',
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  schoolText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#554339',
  },
  homeroomTeacherText: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    color: '#887367',
    marginTop: 3,
  },
  classInfoRight: {
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  studentCountNumber: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    color: '#1C192C',
  },
  studentCountLabel: {
    fontSize: 11.5,
    lineHeight: 15,
    color: '#887367',
    fontWeight: '500',
    marginTop: 2,
  },
  searchBar: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#1C192C',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#1C192C',
    padding: 0,
  },
  studentListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  studentRowContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EBFF',
    position: 'relative',
  },
  studentRowExpanded: {
    backgroundColor: '#FFF1E6',
    borderRadius: 16,
    padding: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#FFDBC8',
    borderBottomWidth: 1,
  },
  studentRowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  studentMeta: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1C192C',
  },
  studentCode: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    color: '#887367',
    marginTop: 2,
  },
  rowRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popoverMenu: {
    position: 'absolute',
    right: 0,
    top: 38,
    width: 105,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1EBFF',
    zIndex: 50,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  popoverDeleteText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#BA1A1A',
  },
  expandedDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingLeft: 52,
    flexWrap: 'wrap',
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFDBC8',
  },
  infoPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#554339',
  },

  // Fixed Bottom Bar
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#1C192C',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.7)',
  },
  inviteBtn: {
    width: '36%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  inviteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F58F4C',
  },
  addStudentBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
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
  addStudentBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropDismiss: {
    flex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },

  // TEA-08.2 Add Student Bottom Sheet
  addSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    maxHeight: 560,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C192C',
    letterSpacing: -0.2,
  },
  capIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#FFE0CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    maxHeight: 320,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#554339',
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputBoxWithIcon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C192C',
    flex: 1,
    padding: 0,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderPill: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillActive: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1.5,
    borderColor: '#F58F4C',
  },
  genderPillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderPillText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  genderPillTextActive: {
    color: '#F58F4C',
    fontWeight: '700',
  },
  genderPillTextInactive: {
    color: '#6B6880',
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 8,
  },
  cancelSheetBtn: {
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelSheetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F58F4C',
  },
  saveSheetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  saveSheetBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // TEA-08.4 Delete Dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 26, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#180F24',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    elevation: 8,
  },
  trashIconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  trashGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    opacity: 0.8,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C192C',
    marginBottom: 8,
  },
  dialogDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#6B6880',
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogActionCol: {
    width: '100%',
    gap: 10,
  },
  deleteConfirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  deleteConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteCancelBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#554339',
  },

  // TEA-08.3 Invite Modal
  inviteSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    alignItems: 'center',
  },
  inviteSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2A26',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  inviteRoleSegment: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    padding: 4,
    width: '100%',
    maxWidth: 260,
    marginBottom: 14,
    gap: 4,
  },
  inviteRoleBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteRoleBtnActive: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  inviteRoleBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  inviteRoleBtnTextActive: {
    fontWeight: '700',
    color: '#F58F4C',
  },
  qrCardContainer: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#FFE3C8',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: -8,
    right: -6,
    color: '#F58F4C',
    fontSize: 16,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: -6,
    left: -6,
    color: '#F58F4C',
    fontSize: 14,
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: 4,
    left: -10,
    color: '#F58F4C',
    fontSize: 12,
  },
  qrWhiteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  inviteCodeText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#2D2A26',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: 'rgba(245, 143, 76, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedToastText: {
    fontSize: 11.5,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  validityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 10,
  },
  validityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  inviteActionsCol: {
    width: '100%',
    gap: 10,
    marginTop: 16,
  },
  shareBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshCodeBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshCodeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F58F4C',
  },
});
