
const ASSIGNABLE_SUBJECTS = [
  { code: 'LIT', label: 'Ngữ văn', iconColor: '#EA580C', bg: '#FFF7ED' },
  { code: 'MATH', label: 'Toán', iconColor: '#2563EB', bg: '#EFF6FF' },
  { code: 'ENG', label: 'Tiếng Anh', iconColor: '#7C3AED', bg: '#F5F3FF' },
  { code: 'CS', label: 'Tin học', iconColor: '#059669', bg: '#ECFDF5' },
  { code: 'ART', label: 'Mỹ thuật', iconColor: '#DB2777', bg: '#FDF2F8' },
  { code: 'MUSIC', label: 'Âm nhạc', iconColor: '#D97706', bg: '#FFFBEB' },
  { code: 'PE', label: 'Thể chất', iconColor: '#4F46E5', bg: '#EEF2FF' },
  { code: 'SCI', label: 'Khoa học', iconColor: '#0D9488', bg: '#F0FDFA' },
  { code: 'HIST_GEO', label: 'Lịch sử & Địa lý', iconColor: '#B45309', bg: '#FEF3C7' },
  { code: 'ETHICS', label: 'Đạo đức', iconColor: '#16A34A', bg: '#F0FDF4' },
];

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
  Linking,
  KeyboardAvoidingView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Svg, Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Line } from 'react-native-svg';
import {
  classService,
  StudentItem,
  ClassDetailData,
  SubjectTeacherItem,
  SUBJECT_LABELS,
} from '../services/class.service';
import { getInitials } from '../utils/format';
import { authService } from '../services/auth.service';

const { width } = Dimensions.get('window');

interface ClassManagementScreenProps {
  onBack?: () => void;
  classId?: string;
}

export const ClassManagementScreen: React.FC<ClassManagementScreenProps> = ({
  onBack,
  classId = '',
}) => {
  const [classData, setClassData] = useState<ClassDetailData | null>(null);
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'TEACHERS'>('STUDENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<string | null>(null);

  // State: Modal Phân Công Giáo Viên Bộ Môn
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSubjectCode, setAssignSubjectCode] = useState('LIT');
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignTeacherItem, setAssignTeacherItem] = useState<any>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState('');
  const [availableTeachersList, setAvailableTeachersList] = useState<any[]>([]);
  const [isSearchingTeachers, setIsSearchingTeachers] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  const handleOpenAssignModal = async (preselectSubject?: string) => {
    const sc = preselectSubject || 'LIT';
    setAssignSubjectCode(sc);
    setAssignSearchQuery('');
    setShowAssignModal(true);
    setIsSearchingTeachers(true);
    try {
      const teachers = await classService.searchTeachers('', sc);
      setAvailableTeachersList(teachers);
      const currentAssigned = (classData?.subject_teachers || []).find(
        (st: any) => (st.subject_code || st.subjectCode) === sc
      );
      if (currentAssigned) {
        setAssignTeacherId(currentAssigned.teacher_id);
        const match = teachers.find((t: any) => t.id === currentAssigned.teacher_id);
        setAssignTeacherItem(match || {
          id: currentAssigned.teacher_id,
          full_name: currentAssigned.teacher_name,
          phone: currentAssigned.phone,
        });
      } else {
        const bestMatch = teachers.find((t: any) =>
          (t.teaching_subjects || []).map((s: string) => String(s).toUpperCase()).includes(sc)
        );
        if (bestMatch) {
          setAssignTeacherId(bestMatch.id);
          setAssignTeacherItem(bestMatch);
        } else {
          setAssignTeacherId('');
          setAssignTeacherItem(null);
        }
      }
    } catch (e) {
      console.warn('handleOpenAssignModal error:', e);
    } finally {
      setIsSearchingTeachers(false);
    }
  };

  const handleSelectSubjectInModal = async (code: string) => {
    setAssignSubjectCode(code);
    setIsSearchingTeachers(true);
    try {
      const teachers = await classService.searchTeachers(assignSearchQuery, code);
      setAvailableTeachersList(teachers);
      const currentAssigned = (classData?.subject_teachers || []).find(
        (st: any) => (st.subject_code || st.subjectCode) === code
      );
      if (currentAssigned) {
        setAssignTeacherId(currentAssigned.teacher_id);
        const match = teachers.find((t: any) => t.id === currentAssigned.teacher_id);
        setAssignTeacherItem(match || {
          id: currentAssigned.teacher_id,
          full_name: currentAssigned.teacher_name,
          phone: currentAssigned.phone,
        });
      } else {
        const bestMatch = teachers.find((t: any) =>
          (t.teaching_subjects || []).map((s: string) => String(s).toUpperCase()).includes(code)
        );
        if (bestMatch) {
          setAssignTeacherId(bestMatch.id);
          setAssignTeacherItem(bestMatch);
        } else {
          setAssignTeacherId('');
          setAssignTeacherItem(null);
        }
      }
    } catch (e) {
      console.warn('handleSelectSubjectInModal error:', e);
    } finally {
      setIsSearchingTeachers(false);
    }
  };

  const handleSearchTeachersInModal = async (text: string) => {
    setAssignSearchQuery(text);
    setIsSearchingTeachers(true);
    try {
      const teachers = await classService.searchTeachers(text, assignSubjectCode);
      setAvailableTeachersList(teachers);
    } catch (e: any) {
      setAvailableTeachersList([]);
      Alert.alert('Thông báo', e?.message || 'Không thể tải danh sách giáo viên. Vui lòng thử lại.');
    } finally {
      setIsSearchingTeachers(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!assignSubjectCode) {
      Alert.alert('Chưa chọn môn', 'Vui lòng chọn môn học cần phân công.');
      return;
    }
    if (!assignTeacherId) {
      Alert.alert('Chưa chọn giáo viên', 'Vui lòng chọn một thầy cô để phụ trách môn học này.');
      return;
    }

    setIsSubmittingAssign(true);
    try {
      const currentList = Array.isArray(classData?.subject_teachers) ? classData!.subject_teachers : [];
      const otherSubjects = currentList.filter(
        (st: any) => (st.subject_code || st.subjectCode) !== assignSubjectCode
      );

      const updatedList = [
        ...otherSubjects.map((st: any) => ({
          teacher_id: st.teacher_id,
          subject_code: st.subject_code,
        })),
        {
          teacher_id: assignTeacherId,
          subject_code: assignSubjectCode,
        },
      ];

      await classService.updateSubjectTeachers(classId, updatedList);

      const subjName = SUBJECT_LABELS[assignSubjectCode] || assignSubjectCode;
      const teacherName = assignTeacherItem?.full_name || 'Giáo viên';
      Alert.alert('Thành công', `Đã phân công ${teacherName} phụ trách môn ${subjName}!`);

      setShowAssignModal(false);
      await loadClassData();
    } catch (e: any) {
      Alert.alert('Lỗi phân công', e?.message || 'Không thể lưu phân công. Vui lòng thử lại.');
    } finally {
      setIsSubmittingAssign(false);
    }
  };


  // Phân quyền GVCN vs GVBM
  const currentUserId = authService.getUser()?.id || '';
  const isHomeroom = !!(
    classData &&
    ((classData as any).homeroom_teacher_id === currentUserId ||
      (classData as any).homeroomTeacherId === currentUserId)
  );

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState<'PARENT' | 'TEACHER'>('TEACHER');
  const [teacherInviteCode, setTeacherInviteCode] = useState('');
  const [parentInviteCode, setParentInviteCode] = useState('');
  const [currentInviteCode, setCurrentInviteCode] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Form State Thêm học sinh
  const [formName, setFormName] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formGender, setFormGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [formPhone, setFormPhone] = useState('');
  const [formParentName, setFormParentName] = useState('');
  const [formParentRelationship, setFormParentRelationship] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadClassData(true);
    setIsRefreshing(false);
  };

  const loadClassData = async (silent = false) => {
    if (!silent) setIsLoadingData(true);
    if (!classId || classId === 'cls_empty') {
      setClassData(null);
      return;
    }
    try {
      const data = await classService.getClassDetail(classId);
      setClassData({
        ...data,
        student_count: Array.isArray(data.students)
          ? data.students.length
          : data.student_count,
      });
      if (data.invite_code) {
        const inviteCode = data.invite_code.trim().toUpperCase();
        setTeacherInviteCode(inviteCode);
        setParentInviteCode(inviteCode);
        setCurrentInviteCode(inviteCode);
      }
    } catch (e: any) {
      console.error('[ClassManagementScreen] loadClassData failed:', e?.message || e);
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
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
    if (!isHomeroom) {
      Alert.alert('Thông báo', 'Chỉ Giáo viên chủ nhiệm mới có quyền xóa học sinh khỏi lớp.');
      return;
    }
    setActiveMenuStudentId(null);
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };

  const formatDobToDmy = (dob?: string) => {
    if (!dob) return '';
    const iso = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : dob;
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
    }
    return phone;
  };

  
  const cleanHonorific = (name?: string | null): string => {
    if (!name) return '';
    return name.replace(/^(Bác|Cô|Chú|Anh|Chị|Ông|Bà)\s+/i, '').trim();
  };

  const handleCallParent = (phone?: string) => {
    if (!phone) {
      Alert.alert('Thông báo', 'Học sinh chưa có số điện thoại phụ huynh');
      return;
    }
    const clean = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      Alert.alert('Thông báo', 'Thiết bị không hỗ trợ tính năng gọi điện thoại');
    });
  };

  const handleSmsParent = (phone?: string, studentName?: string) => {
    if (!phone) {
      Alert.alert('Thông báo', 'Học sinh chưa có số điện thoại phụ huynh');
      return;
    }
    const clean = phone.replace(/\s+/g, '');
    const defaultMsg = studentName
      ? `Kính gửi phụ huynh em ${studentName}, GVCN lớp ${classData?.name || ''} xin trao đổi:`
      : '';
    Linking.openURL(`sms:${clean}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(defaultMsg)}`).catch(() => {
      Alert.alert('Thông báo', 'Thiết bị không hỗ trợ gửi tin nhắn SMS');
    });
  };

  const handleOpenAddModal = () => {
    if (!isHomeroom) {
      Alert.alert('Thông báo', 'Chỉ Giáo viên chủ nhiệm mới có quyền thêm học sinh vào lớp.');
      return;
    }
    setEditingStudentId(null);
    setFormName('');
    setFormDob('');
    setFormGender('FEMALE');
    setFormPhone('');
    setFormParentName('');
    setFormParentRelationship('Bố');
    setShowAddModal(true);
  };

  const handleOpenEditStudent = (student: StudentItem) => {
    if (!isHomeroom) {
      Alert.alert('Thông báo', 'Chỉ Giáo viên chủ nhiệm mới có quyền chỉnh sửa hồ sơ học sinh.');
      return;
    }
    setActiveMenuStudentId(null);
    setEditingStudentId(student.id);
    setFormName(student.full_name || '');
    setFormDob(formatDobToDmy(student.dob));
    setFormGender(student.gender === 'MALE' ? 'MALE' : 'FEMALE');
    setFormPhone(student.parent_phone || '');
    setFormParentName(student.parent_name || '');
    setFormParentRelationship(
      (student.parent_relationship === 'Mẹ' || student.parent_relationship === 'Người giám hộ'
        ? student.parent_relationship
        : 'Bố') as any,
    );
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingStudentId(null);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete || !classData) return;
    try {
      await classService.removeStudent(classId, studentToDelete.id);
    } catch (e: any) {
      Alert.alert('Thông báo', e?.message || 'Không thể xoá học sinh. Vui lòng thử lại.');
      return;
    }
    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        student_count: Math.max(0, prev.students.length - 1),
        students: prev.students.filter(s => s.id !== studentToDelete.id),
      };
    });
    setShowDeleteDialog(false);
    setStudentToDelete(null);
  };

  const handleSaveStudent = async () => {
    if (isSavingStudent || !classData) return;
    if (!formName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên học sinh');
      return;
    }

    const dobRaw = formDob.trim();
    if (!dobRaw) {
      Alert.alert('Thông báo', 'Vui lòng nhập ngày sinh học sinh');
      return;
    }
    let dobIso = '';
    const dobMatch = dobRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!dobMatch) {
      Alert.alert('Thông báo', 'Ngày sinh cần định dạng DD/MM/YYYY, ví dụ 15/06/2014');
      return;
    }
    const d = Number(dobMatch[1]);
    const m = Number(dobMatch[2]);
    const y = Number(dobMatch[3]);
    const parsed = new Date(Date.UTC(y, m - 1, d));
    const realDate =
      parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
    if (!realDate) {
      Alert.alert('Thông báo', 'Ngày sinh không tồn tại trong lịch thực tế');
      return;
    }
    dobIso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const phoneValue = formPhone.trim();
    if (!phoneValue) {
      Alert.alert('Thông báo', 'Vui lòng nhập SĐT phụ huynh');
      return;
    }

    setIsSavingStudent(true);
    try {
      const payload: any = {
        full_name: formName.trim(),
        dob: dobIso,
        gender: formGender,
        parent_phone: phoneValue,
        parent_name: formParentName.trim() || undefined,
        parent_relationship: formParentRelationship,
      };

      if (editingStudentId) {
        const editingStudent = classData.students.find(s => s.id === editingStudentId);
        if (!editingStudent) {
          throw new Error('Không tìm thấy học sinh cần chỉnh sửa');
        }
        const updated = await classService.updateStudent(classId, editingStudent, payload);
        setClassData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            students: prev.students.map(s => (s.id === editingStudent.id ? updated : s)),
          };
        });
      } else {
        const newStudent = await classService.addStudent(classId, payload);
        setClassData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            student_count: prev.students.length + 1,
            students: [newStudent, ...prev.students],
          };
        });
      }

      setShowAddModal(false);
      setEditingStudentId(null);
      // Reset toàn bộ form để lần mở tiếp theo không dính dữ liệu học sinh cũ
      setFormName('');
      setFormDob('');
      setFormGender('FEMALE');
      setFormPhone('');
      setFormParentName('');
      setFormParentRelationship('Bố');
    } catch (e: any) {
      Alert.alert(
        'Thông báo',
        e?.message ||
          (editingStudentId
            ? 'Không thể cập nhật học sinh. Vui lòng thử lại.'
            : 'Không thể thêm học sinh. Vui lòng thử lại.'),
      );
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleRefreshInviteCode = async () => {
    try {
      const res = await classService.generateInviteCode(classId);
      const rawCode = (res.invite_code || '').trim().toUpperCase();
      if (!rawCode) throw new Error('Máy chủ không trả về mã mời');
      setTeacherInviteCode(rawCode);
      setParentInviteCode(rawCode);
      setCurrentInviteCode(rawCode);
    } catch (e: any) {
      Alert.alert('Thông báo', e?.message || 'Không thể tạo mã mời. Vui lòng thử lại.');
    }
  };

  const handleCopyCode = () => {
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // Avatar helper
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

  const getTeacherAvatarColors = (index: number) => {
    const palettes = [
      { bg: '#E0E7FF', text: '#4338CA' },
      { bg: '#FCE7F3', text: '#BE185D' },
      { bg: '#FEF3C7', text: '#B45309' },
      { bg: '#CCFBF1', text: '#0F766E' },
      { bg: '#EDE9FE', text: '#6D28D9' },
      { bg: '#FFEDD5', text: '#C2410C' },
    ];
    return palettes[index % palettes.length];
  };

  const getSubjectBadgeStyle = (code: string) => {
    switch (code.toUpperCase()) {
      case 'MATH':
        return { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE', dot: '#6366F1' };
      case 'LIT':
      case 'LITERATURE':
        return { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3', dot: '#F43F5E' };
      case 'ENG':
      case 'ENGLISH':
        return { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF', dot: '#A855F7' };
      case 'CS':
      case 'INFORMATICS':
        return { bg: '#ECFEFF', text: '#0E7490', border: '#A5F3FC', dot: '#06B6D4' };
      case 'MUSIC':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' };
      case 'ART':
        return { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8', dot: '#EC4899' };
      case 'PE':
        return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', dot: '#10B981' };
      case 'SCIENCE':
      case 'PHYSICS':
      case 'CHEM':
      case 'BIO':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' };
      case 'HIST':
      case 'HISTORY':
      case 'GEO':
      case 'GEOGRAPHY':
        return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', dot: '#D97706' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', dot: '#6B7280' };
    }
  };

  const handleCallTeacher = (phone?: string) => {
    if (!phone) {
      Alert.alert('Thông báo', 'Giáo viên này chưa cập nhật số điện thoại.');
      return;
    }
    const telUrl = `tel:${phone.replace(/\s+/g, '')}`;
    Linking.canOpenURL(telUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(telUrl);
        } else {
          Alert.alert('Số điện thoại liên hệ', phone);
        }
      })
      .catch(() => {
        Alert.alert('Số điện thoại liên hệ', phone);
      });
  };

  const allSubjectTeachers: SubjectTeacherItem[] = classData?.subject_teachers || [];

  const availableSubjects = Array.from(
    new Set(allSubjectTeachers.map(t => t.subject_code))
  ).map(code => ({
    code,
    label: SUBJECT_LABELS[code] || code,
    count: allSubjectTeachers.filter(t => t.subject_code === code).length,
  }));

  const filteredTeachers = allSubjectTeachers.filter(t => {
    const query = teacherSearchQuery.toLowerCase().trim();
    const subName = t.subject_name || SUBJECT_LABELS[t.subject_code] || t.subject_code || '';
    const matchQuery =
      !query ||
      t.teacher_name.toLowerCase().includes(query) ||
      subName.toLowerCase().includes(query) ||
      (t.phone && t.phone.includes(query));

    if (!matchQuery) return false;

    if (subjectFilter !== 'ALL') {
      return t.subject_code === subjectFilter;
    }
    return true;
  });

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
              <Text style={styles.className}>{classData?.name || 'Lớp học'}</Text>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>
                  Khối {classData?.grade_level || '—'}{classData?.academic_year ? ` • ${classData.academic_year}` : ''}
                </Text>
              </View>
            </View>
              {classData?.school_name ? (
                <View style={styles.schoolRow}>
                  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1m-4 6v-4h4v4"
                      stroke="#F58F4C"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <Text style={styles.schoolText}>{classData.school_name}</Text>
                </View>
              ) : null}
              {classData?.homeroom_teacher ? (
                <Text style={styles.homeroomTeacherText}>GVCN: {classData.homeroom_teacher}</Text>
              ) : null}
          </View>

          <View style={styles.classInfoRight}>
            {isLoadingData && !classData ? (
              <ActivityIndicator size="small" color="#F58F4C" style={{ marginBottom: 4 }} />
            ) : (
              <Text style={styles.studentCountNumber}>{classData?.student_count || 0}</Text>
            )}
            <Text style={styles.studentCountLabel}>học sinh</Text>
          </View>
        </View>

        {/* Segmented Control 2 Tabs (chuẩn ui-ux-pro-max như RemarksExamScreen) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'STUDENTS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('STUDENTS')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabBtnText, activeTab === 'STUDENTS' && styles.tabBtnTextActive]}>
              Học Sinh ({classData?.students?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'TEACHERS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('TEACHERS')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabBtnText, activeTab === 'TEACHERS' && styles.tabBtnTextActive]}>
              Giáo Viên Bộ Môn ({allSubjectTeachers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* TAB 1: HỌC SINH */}
        {/* ======================================================== */}
        {activeTab === 'STUDENTS' && (
          <View style={styles.tabContentCol}>
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
              {searchQuery.trim() ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.searchClearBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M18 6L6 18M6 6l12 12" stroke="#887367" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Student List Bento Container */}
            <View style={styles.studentListCard}>
              {isLoadingData && (!classData || (classData.students && classData.students.length === 0)) ? (
                <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="large" color="#F58F4C" />
                  <Text style={{ marginTop: 14, fontSize: 13, color: '#887367', fontWeight: '600' }}>
                    Đang tải danh sách học sinh...
                  </Text>
                </View>
              ) : filteredStudents.length === 0 ? (
                <View style={styles.studentEmptyState}>
                  <View style={styles.studentEmptyIconWrap}>
                    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={1.8}>
                      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                      <Circle cx={9} cy={7} r={4} strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={styles.studentEmptyTitle}>
                    {searchQuery.trim() ? 'Không tìm thấy học sinh' : 'Lớp chưa có học sinh'}
                  </Text>
                  <Text style={styles.studentEmptySubtitle}>
                    {searchQuery.trim()
                      ? 'Không có em nào khớp tên hoặc mã bạn vừa tìm. Thử từ khóa khác nhé.'
                      : isHomeroom
                      ? 'Bấm “+ Thêm Học Sinh” ở bên dưới để nhập tên, ngày sinh và số điện thoại phụ huynh.'
                      : 'Giáo viên chủ nhiệm chưa cập nhật học sinh cho lớp này. Thầy cô vui lòng liên hệ GVCN nhé.'}
                  </Text>
                  {searchQuery.trim() ? (
                    <TouchableOpacity
                      style={styles.studentEmptyAction}
                      onPress={() => setSearchQuery('')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.studentEmptyActionText}>Xóa tìm kiếm</Text>
                    </TouchableOpacity>
                  ) : isHomeroom ? (
                    <TouchableOpacity
                      style={styles.studentEmptyAction}
                      onPress={handleOpenAddModal}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.studentEmptyActionText}>+ Thêm học sinh đầu tiên</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
              {filteredStudents.map((student, idx) => {
                const isExpanded = expandedStudentId === student.id;
                const isMenuOpen = activeMenuStudentId === student.id;
                const focusStudentId = activeMenuStudentId || expandedStudentId;
                const isOtherFocused = focusStudentId !== null && focusStudentId !== student.id;
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
                          <View style={styles.studentCodeRow}>
                            <Text style={styles.studentCode}>
                              {student.student_code}
                            </Text>
                            {student.parent_name ? (
                              <>
                                <Text style={styles.studentMetaDot}>•</Text>
                                <Text style={styles.studentParentBrief} numberOfLines={1}>
                                  {student.parent_relationship || 'PH'}: {cleanHonorific(student.parent_name)}
                                </Text>
                              </>
                            ) : null}
                          </View>
                        </View>
                      </View>

                      {isHomeroom && (
                        <View style={styles.rowRightActions}>
                          <TouchableOpacity
                            style={[styles.moreBtn, isOtherFocused && styles.moreBtnLocked]}
                            onPress={() => handleToggleMenu(student.id)}
                            disabled={isOtherFocused}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                              <Circle cx={5} cy={12} r={2} fill="#554339" />
                              <Circle cx={12} cy={12} r={2} fill="#554339" />
                              <Circle cx={19} cy={12} r={2} fill="#554339" />
                            </Svg>
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Popover Action Menu */}
                    {isMenuOpen && (
                      <View style={styles.popoverMenu}>
                        <TouchableOpacity
                          style={styles.popoverItem}
                          onPress={() => handleOpenEditStudent(student)}
                        >
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                              stroke="#F58F4C"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                          <Text style={styles.popoverEditText}>Chỉnh sửa</Text>
                        </TouchableOpacity>

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

                    {/* Sub-row details when Expanded - Bento Family Connection Card */}
                    {isExpanded && (
                      <View style={styles.expandedFamilyCard}>
                        {/* Header Box: Badge & Tên phần */}
                        <View style={styles.familyHeaderRow}>
                          <View style={styles.familyHeaderLeft}>
                            <Text style={styles.familyHeaderTitle}>THÔNG TIN PHỤ HUYNH</Text>
                          </View>

                          {/* Trạng thái liên kết App (ẩn nếu chưa cài) */}
                          {student.is_parent_app_connected ? (
                            <View style={styles.appConnectedBadge}>
                              <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                                <Path d="M20 6L9 17l-5-5" stroke="#15803D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                              </Svg>
                              <Text style={styles.appConnectedText}>Đã kết nối App</Text>
                            </View>
                          ) : null}
                        </View>

                        {/* Thông tin Phụ huynh chính */}
                        <View style={styles.parentMainInfoRow}>
                          <View style={styles.parentAvatarBox}>
                            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                              <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" />
                              <Circle cx={9} cy={7} r={4} stroke="#F58F4C" strokeWidth={2} />
                              <Path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" />
                              <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" />
                            </Svg>
                          </View>

                          <View style={styles.parentTextCol}>
                            <View style={styles.parentNameWithRole}>
                              <Text style={styles.parentFullNameText}>
                                {cleanHonorific(student.parent_name) || 'Phụ huynh học sinh'}
                              </Text>
                              <View style={styles.roleChip}>
                                <Text style={styles.roleChipText}>{student.parent_relationship || 'Phụ huynh'}</Text>
                              </View>
                            </View>
                            <Text style={styles.parentPhoneFormatted}>
                              {formatPhoneNumber(student.parent_phone) || 'Chưa cập nhật SĐT'}
                            </Text>
                          </View>
                        </View>

                        {/* Hàng nút tương tác nhanh One-Tap Contact */}
                        <View style={styles.quickContactRow}>
                          

                          {/* Nút Gọi Ngay */}
                          {student.parent_phone ? (
                            <TouchableOpacity
                              style={styles.parentCallBtn}
                              onPress={() => handleCallParent(student.parent_phone)}
                              activeOpacity={0.8}
                            >
                              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                                <Path
                                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                                  fill="#15803D"
                                />
                              </Svg>
                              <Text style={styles.parentCallBtnText}>Gọi điện</Text>
                            </TouchableOpacity>
                          ) : null}

                          {/* Nút Nhắn Tin SMS */}
                          {student.parent_phone ? (
                            <TouchableOpacity
                              style={styles.parentSmsBtn}
                              onPress={() => handleSmsParent(student.parent_phone, student.full_name)}
                              activeOpacity={0.8}
                            >
                              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                                <Path
                                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                                  stroke="#0284C7"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                              <Text style={styles.parentSmsBtnText}>Nhắn tin</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: GIÁO VIÊN BỘ MÔN (chuẩn /ui-ux-pro-max Bento Grid) */}
        {/* ======================================================== */}
        {activeTab === 'TEACHERS' && (
          <View style={styles.tabContentCol}>
            {/* Search Bar GVBM */}
            <View style={styles.searchBar}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={11} cy={11} r={8} stroke="#887367" strokeWidth={2} />
                <Path d="M21 21l-4.35-4.35" stroke="#887367" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm GVBM theo tên hoặc môn..."
                placeholderTextColor="#887367"
                value={teacherSearchQuery}
                onChangeText={setTeacherSearchQuery}
              />
              {teacherSearchQuery.trim() ? (
                <TouchableOpacity
                  onPress={() => setTeacherSearchQuery('')}
                  style={styles.searchClearBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M18 6L6 18M6 6l12 12" stroke="#887367" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Subject Filter Chips Carousel */}
            {availableSubjects.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subjectChipsScroll}
                style={styles.subjectChipsWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.subjectChip,
                    subjectFilter === 'ALL' && styles.subjectChipActive,
                  ]}
                  onPress={() => setSubjectFilter('ALL')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.subjectChipText,
                      subjectFilter === 'ALL' && styles.subjectChipTextActive,
                    ]}
                  >
                    Tất cả ({allSubjectTeachers.length})
                  </Text>
                </TouchableOpacity>

                {availableSubjects.map(sub => {
                  const isActive = subjectFilter === sub.code;
                  return (
                    <TouchableOpacity
                      key={sub.code}
                      style={[
                        styles.subjectChip,
                        isActive && styles.subjectChipActive,
                      ]}
                      onPress={() => setSubjectFilter(sub.code)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.subjectChipText,
                          isActive && styles.subjectChipTextActive,
                        ]}
                      >
                        {sub.label} ({sub.count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Bento Banner: Môn học chưa phân công (chỉ hiện khi có môn chưa gán và là GVCN) */}
            {isHomeroom && (() => {
              const assignedCodes = new Set(
                (classData?.subject_teachers || []).map((st: any) =>
                  (st.subject_code || st.subjectCode || '').toUpperCase()
                )
              );
              const unassignedList = ASSIGNABLE_SUBJECTS.filter((s) => !assignedCodes.has(s.code));
              if (unassignedList.length === 0) return null;

              return (
                <View style={styles.unassignedBentoCard}>
                  <View style={styles.unassignedBentoHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={styles.unassignedDot} />
                      <Text style={styles.unassignedBentoTitle}>
                        Chưa phân công ({unassignedList.length} môn)
                      </Text>
                    </View>
                    <Text style={styles.unassignedBentoHint}>Chạm để gán ngay</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                  >
                    {unassignedList.map((sub) => (
                      <TouchableOpacity
                        key={sub.code}
                        style={[styles.unassignedChip, { backgroundColor: sub.bg }]}
                        onPress={() => handleOpenAssignModal(sub.code)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.unassignedChipText, { color: sub.iconColor }]}>
                          + {sub.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            })()}

            {/* Teacher Bento Cards Col */}
            <View style={styles.teacherCardsCol}>
              {isLoadingData && (!classData || (classData.subject_teachers && classData.subject_teachers.length === 0)) ? (
                <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="large" color="#F58F4C" />
                  <Text style={{ marginTop: 14, fontSize: 13, color: '#887367', fontWeight: '600' }}>
                    Đang tải danh sách giáo viên bộ môn...
                  </Text>
                </View>
              ) : filteredTeachers.length === 0 ? (
                <View style={styles.studentEmptyState}>
                  <View style={styles.studentEmptyIconWrap}>
                    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={1.8}>
                      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                      <Circle cx={9} cy={7} r={4} strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={styles.studentEmptyTitle}>
                    {teacherSearchQuery.trim() || subjectFilter !== 'ALL'
                      ? 'Không tìm thấy giáo viên'
                      : 'Chưa có giáo viên bộ môn'}
                  </Text>
                  <Text style={styles.studentEmptySubtitle}>
                    {teacherSearchQuery.trim() || subjectFilter !== 'ALL'
                      ? 'Không có thầy cô nào khớp từ khóa hoặc bộ môn đã chọn. Hãy thử lại nhé.'
                      : isHomeroom
                      ? 'Chia sẻ mã mời hoặc mời các thầy cô bộ môn tham gia lớp học ngay dưới đây.'
                      : 'Lớp học hiện tại chưa có thông tin giáo viên bộ môn khác.'}
                  </Text>
                  {teacherSearchQuery.trim() || subjectFilter !== 'ALL' ? (
                    <TouchableOpacity
                      style={styles.studentEmptyAction}
                      onPress={() => {
                        setTeacherSearchQuery('');
                        setSubjectFilter('ALL');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.studentEmptyActionText}>Xóa bộ lọc</Text>
                    </TouchableOpacity>
                  ) : isHomeroom ? (
                    <TouchableOpacity
                      style={styles.studentEmptyAction}
                      onPress={() => {
                        setInviteRole('TEACHER');
                        setShowInviteModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.studentEmptyActionText}>+ Mời GVBM ngay</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                filteredTeachers.map((teacher, idx) => {
                  const avatarColors = getTeacherAvatarColors(idx);
                  const badgeStyle = getSubjectBadgeStyle(teacher.subject_code);
                  const isCurrent = !!(teacher.is_current_user || teacher.teacher_id === currentUserId);

                  return (
                    <View
                      key={`${teacher.teacher_id}_${teacher.subject_code}_${idx}`}
                      style={[
                        styles.teacherCard,
                        isCurrent && styles.teacherCardCurrent,
                      ]}
                    >
                      {/* Top Row: Avatar + Name & Badges + Call Quick Action */}
                      <View style={styles.teacherCardHeader}>
                        {/* Pastel Avatar */}
                        <View style={[styles.teacherAvatarCircle, { backgroundColor: avatarColors.bg }]}>
                          <Text style={[styles.teacherAvatarText, { color: avatarColors.text }]}>
                            {getInitials(teacher.teacher_name)}
                          </Text>
                        </View>

                        {/* Teacher Name & Subject Badge */}
                        <View style={styles.teacherInfoCol}>
                          <View style={styles.teacherNameRow}>
                            <Text style={styles.teacherName} numberOfLines={1}>
                              {teacher.teacher_name}
                            </Text>
                            {isCurrent && (
                              <View style={styles.youBadge}>
                                <Text style={styles.youBadgeText}>Bạn</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.teacherBadgeRow}>
                            <View
                              style={[
                                styles.subjectBadgePill,
                                {
                                  backgroundColor: badgeStyle.bg,
                                  borderColor: badgeStyle.border,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.subjectBadgeDot,
                                  { backgroundColor: badgeStyle.dot },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.subjectBadgeText,
                                  { color: badgeStyle.text },
                                ]}
                              >
                                {teacher.subject_name || SUBJECT_LABELS[teacher.subject_code] || teacher.subject_code}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Actions: Edit Assignment (GVCN) & Quick Call */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {isHomeroom && (
                            <TouchableOpacity
                              style={styles.quickEditBtn}
                              onPress={() => handleOpenAssignModal(teacher.subject_code)}
                              activeOpacity={0.8}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                <Path
                                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                                  stroke="#F58F4C"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <Path
                                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                  stroke="#F58F4C"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.quickCallBtn}
                            onPress={() => handleCallTeacher(teacher.phone)}
                            activeOpacity={0.8}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                              <Path
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                stroke="#F58F4C"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </Svg>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Bottom Info Row: Phone & Email */}
                      {(teacher.phone || teacher.email) ? (
                        <View style={styles.teacherCardFooter}>
                          {teacher.phone ? (
                            <TouchableOpacity
                              style={styles.teacherContactItem}
                              onPress={() => handleCallTeacher(teacher.phone)}
                              activeOpacity={0.7}
                            >
                              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                                <Path
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  stroke="#78350F"
                                  strokeWidth={2}
                                />
                              </Svg>
                              <Text style={styles.teacherContactText}>{teacher.phone}</Text>
                            </TouchableOpacity>
                          ) : null}

                          {teacher.email ? (
                            <View style={styles.teacherContactItem}>
                              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                                <Rect x={3} y={5} width={18} height={14} rx={2} stroke="#78350F" strokeWidth={2} />
                                <Path d="M3 7l9 6 9-6" stroke="#78350F" strokeWidth={2} strokeLinecap="round" />
                              </Svg>
                              <Text style={styles.teacherContactText} numberOfLines={1}>
                                {teacher.email}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      {isHomeroom ? (
        activeTab === 'STUDENTS' ? (
          <View style={styles.fixedBottomBar}>
            {/* Outlined Pill: Mã Mời (~38%) */}
            <TouchableOpacity
              style={styles.inviteBtn}
              onPress={() => {
                setInviteRole('PARENT');
                setShowInviteModal(true);
              }}
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
              onPress={handleOpenAddModal}
              activeOpacity={0.88}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
              </Svg>
              <Text style={styles.addStudentBtnText}>Thêm Học Sinh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.fixedBottomBar}>
            {/* Outlined Pill: Mã Mời GVBM (~38%) */}
            <TouchableOpacity
              style={styles.inviteBtn}
              onPress={() => {
                setInviteRole('TEACHER');
                setShowInviteModal(true);
              }}
              activeOpacity={0.85}
            >
              <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={3} width={7} height={7} rx={1} stroke="#F58F4C" strokeWidth={2} />
                <Rect x={14} y={3} width={7} height={7} rx={1} stroke="#F58F4C" strokeWidth={2} />
                <Rect x={3} y={14} width={7} height={7} rx={1} stroke="#F58F4C" strokeWidth={2} />
                <Path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3v1h-3z" fill="#F58F4C" />
              </Svg>
              <Text style={styles.inviteBtnText}>Mã Mời GV</Text>
            </TouchableOpacity>

            {/* Primary Filled Pill: Phân Công Bộ Môn (~62%) */}
            <TouchableOpacity
              style={styles.addStudentBtn}
              onPress={() => handleOpenAssignModal()}
              activeOpacity={0.88}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
              </Svg>
              <Text style={styles.addStudentBtnText}>Phân Công Bộ Môn</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={[styles.addStudentBtn, { width: '100%', flex: 1, backgroundColor: '#F58F4C' }]}
            onPress={() => {
              setInviteRole('TEACHER');
              setShowInviteModal(true);
            }}
            activeOpacity={0.85}
          >
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <Rect x={3} y={3} width={7} height={7} rx={1} stroke="#FFFFFF" strokeWidth={2} />
              <Rect x={14} y={3} width={7} height={7} rx={1} stroke="#FFFFFF" strokeWidth={2} />
              <Rect x={3} y={14} width={7} height={7} rx={1} stroke="#FFFFFF" strokeWidth={2} />
              <Path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3v1h-3z" fill="#FFFFFF" />
            </Svg>
            <Text style={styles.addStudentBtnText}>Mã Lớp Học: {classData?.invite_code || currentInviteCode || 'Chưa tạo'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ======================================================== */}
      {/* TEA-08.2: MODAL THÊM HỌC SINH (BOTTOM-SHEET) */}
      {/* ======================================================== */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseAddModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={handleCloseAddModal}
          />

          <View style={styles.addSheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header with Title + 3D Graduation Cap Icon */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editingStudentId ? 'Chỉnh Sửa Học Sinh' : 'Thêm Học Sinh'}
              </Text>
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

              {/* Field 2: Ngày sinh * */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Ngày sinh <Text style={{ color: '#BA1A1A' }}>*</Text>
                </Text>
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

              {/* Parent Connection Section Divider */}
              <View style={styles.modalSectionDivider}>
                <Text style={styles.modalSectionTitle}>THÔNG TIN PHỤ HUYNH</Text>
              </View>

              {/* Field 4: Họ tên phụ huynh */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Họ tên phụ huynh (Bố / Mẹ)</Text>
                <View style={styles.inputBoxWithIcon}>
                  <TextInput
                    style={styles.inputText}
                    placeholder="VD: Trần Văn Hùng hoặc Hoàng Thị Thảo"
                    placeholderTextColor="#A3A0B5"
                    value={formParentName}
                    onChangeText={setFormParentName}
                  />
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" />
                    <Circle cx={12} cy={7} r={4} stroke="#F58F4C" strokeWidth={2} />
                  </Svg>
                </View>
              </View>

              {/* Field 5: Mối quan hệ với học sinh */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quan hệ với học sinh</Text>
                <View style={styles.genderRow}>
                  {(['Bố', 'Mẹ', 'Người giám hộ'] as const).map(rel => (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.genderPill,
                        formParentRelationship === rel ? styles.genderPillActive : styles.genderPillInactive,
                      ]}
                      onPress={() => setFormParentRelationship(rel)}
                    >
                      <Text
                        style={[
                          styles.genderPillText,
                          formParentRelationship === rel ? styles.genderPillTextActive : styles.genderPillTextInactive,
                        ]}
                      >
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Field 6: SĐT phụ huynh * */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  SĐT phụ huynh <Text style={{ color: '#BA1A1A' }}>*</Text>
                </Text>
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
                onPress={handleCloseAddModal}
              >
                <Text style={styles.cancelSheetBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveSheetBtn, isSavingStudent && { opacity: 0.6 }]}
                onPress={handleSaveStudent}
                activeOpacity={0.88}
                disabled={isSavingStudent}
              >
                <Text style={styles.saveSheetBtnText}>{isSavingStudent ? 'Đang lưu...' : 'Lưu'}</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}

      {/* ======================================================== */}
      {/* MODAL PHÂN CÔNG GIÁO VIÊN BỘ MÔN (UI/UX PRO MAX) */}
      {/* ======================================================== */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.addSheetContainer}>
            {/* Thanh indicator kéo nhẹ */}
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Header Modal */}
            <View style={styles.assignSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Phân Công Giáo Viên Bộ Môn</Text>
                <Text style={styles.assignSheetSubtitle}>
                  {classData?.name || 'Lớp học'} · Chọn môn và thầy cô phụ trách
                </Text>
              </View>
              <TouchableOpacity
                style={styles.assignSheetCloseBtn}
                onPress={() => setShowAssignModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 460 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Bước 1: Chọn Môn Học */}
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.assignStepLabel}>1. CHỌN BỘ MÔN CẦN PHÂN CÔNG</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assignSubjectScroll}>
                  {ASSIGNABLE_SUBJECTS.map((sub) => {
                    const isSelected = assignSubjectCode === sub.code;
                    const assignedSt = (classData?.subject_teachers || []).find(
                      (st: any) => (st.subject_code || st.subjectCode) === sub.code
                    );
                    return (
                      <TouchableOpacity
                        key={sub.code}
                        style={[
                          styles.assignSubjectCard,
                          isSelected && styles.assignSubjectCardActive,
                        ]}
                        onPress={() => handleSelectSubjectInModal(sub.code)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.assignSubjectIconBox, { backgroundColor: sub.bg }]}>
                          <Text style={[styles.assignSubjectIconText, { color: sub.iconColor }]}>
                            {sub.label.charAt(0)}
                          </Text>
                        </View>
                        <Text style={[styles.assignSubjectCardTitle, isSelected && styles.assignSubjectCardTitleActive]}>
                          {sub.label}
                        </Text>
                        <Text style={styles.assignSubjectStatusText} numberOfLines={1}>
                          {assignedSt ? assignedSt.teacher_name : 'Chưa có'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Bước 2: Tìm kiếm & Chọn Giáo Viên */}
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.assignStepLabel}>2. CHỌN GIÁO VIÊN PHỤ TRÁCH</Text>
                  <Text style={styles.assignSubjBadge}>
                    Môn: {SUBJECT_LABELS[assignSubjectCode] || assignSubjectCode}
                  </Text>
                </View>

                {/* Search Bar Input */}
                <View style={styles.assignSearchBar}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Circle cx={11} cy={11} r={8} stroke="#9CA3AF" strokeWidth={2} />
                    <Path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                  <TextInput
                    style={styles.assignSearchInput}
                    placeholder="Tìm theo tên hoặc SĐT (VD: Lê Thị Hằng)..."
                    placeholderTextColor="#9CA3AF"
                    value={assignSearchQuery}
                    onChangeText={handleSearchTeachersInModal}
                  />
                  {assignSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearchTeachersInModal('')}>
                      <Text style={{ fontSize: 13, color: '#9CA3AF', paddingHorizontal: 4 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Teachers List */}
                <View style={{ gap: 8, marginTop: 10 }}>
                  {isSearchingTeachers ? (
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#F58F4C" />
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>Đang tìm danh sách giáo viên...</Text>
                    </View>
                  ) : availableTeachersList.length === 0 ? (
                    <View style={{ paddingVertical: 24, alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#4B5563' }}>Không tìm thấy giáo viên phù hợp</Text>
                      <Text style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Hãy thử tìm kiếm với từ khóa khác hoặc SĐT nhé</Text>
                    </View>
                  ) : (
                    availableTeachersList.map((teacher) => {
                      const isSelected = assignTeacherId === teacher.id;
                      const teachesThisSubject = (teacher.teaching_subjects || [])
                        .map((s: string) => String(s).toUpperCase())
                        .includes(assignSubjectCode);

                      return (
                        <TouchableOpacity
                          key={teacher.id}
                          style={[
                            styles.teacherSelectItem,
                            isSelected && styles.teacherSelectItemActive,
                          ]}
                          onPress={() => {
                            setAssignTeacherId(teacher.id);
                            setAssignTeacherItem(teacher);
                          }}
                          activeOpacity={0.8}
                        >
                          {/* Avatar */}
                          <View style={[styles.teacherSelectAvatar, isSelected && { backgroundColor: '#FFEDD5', borderColor: '#F58F4C' }]}>
                            <Text style={[styles.teacherSelectAvatarText, isSelected && { color: '#EA580C' }]}>
                              {(teacher.full_name || 'GV').charAt(0).toUpperCase()}
                            </Text>
                          </View>

                          {/* Info */}
                          <View style={{ flex: 1, gap: 2 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={[styles.teacherSelectName, isSelected && { color: '#EA580C', fontWeight: '800' }]}>
                                {teacher.full_name}
                              </Text>
                              {teachesThisSubject && (
                                <View style={styles.matchBadge}>
                                  <Text style={styles.matchBadgeText}>Chuyên môn</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.teacherSelectPhone}>
                              SĐT: {teacher.phone || 'Chưa cập nhật'} · {teacher.school_name || 'Chu Văn An'}
                            </Text>
                          </View>

                          {/* Radio Check Circle */}
                          <View style={[styles.selectRadioCircle, isSelected && styles.selectRadioCircleActive]}>
                            {isSelected && (
                              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                <Path d="M20 6L9 17l-5-5" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                              </Svg>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Form Actions */}
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.cancelSheetBtn}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.cancelSheetBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveSheetBtn,
                  (!assignTeacherId || isSubmittingAssign) && { opacity: 0.55 },
                ]}
                onPress={handleSaveAssignment}
                activeOpacity={0.88}
                disabled={!assignTeacherId || isSubmittingAssign}
              >
                <Text style={styles.saveSheetBtnText}>
                  {isSubmittingAssign ? 'Đang lưu...' : 'Lưu Phân Công'}
                </Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
              {studentToDelete?.full_name || 'Học sinh này'} sẽ bị xóa khỏi {classData?.name || 'lớp học'}.
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

            {/* Context Hint Text for Selected Role */}
            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#6B6880', textAlign: 'center', lineHeight: 17 }}>
                {inviteRole === 'TEACHER'
                  ? 'Thầy cô GVBM khi nhập mã này sẽ chọn môn học mình phụ trách để tự động vào sổ điểm của lớp.'
                  : 'Phụ huynh nhập mã hoặc quét QR để liên kết hồ sơ con theo số điện thoại đã đăng ký.'}
              </Text>
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
  studentEmptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  studentEmptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  studentEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2C29',
    marginBottom: 6,
    textAlign: 'center',
  },
  studentEmptySubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#887367',
    textAlign: 'center',
    marginBottom: 14,
  },
  studentEmptyAction: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#F58F4C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  studentEmptyActionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#F58F4C',
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
  studentCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flexWrap: 'nowrap',
  },
  studentCode: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    color: '#887367',
  },
  studentMetaDot: {
    fontSize: 11,
    color: '#D1C7BD',
  },
  studentParentBrief: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '600',
    color: '#984704',
    flexShrink: 1,
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
  moreBtnLocked: {
    opacity: 0.35,
  },
  popoverMenu: {
    position: 'absolute',
    right: 0,
    top: 38,
    width: 118,
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
  popoverEditText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#F58F4C',
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

  // Bento Family Connection Card (/ui-ux-pro-max)
  expandedFamilyCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  familyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF1E6',
    marginBottom: 10,
  },
  familyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  familyHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#984704',
    letterSpacing: 0.4,
  },
  appConnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  appConnectedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  appUnconnectedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  appUnconnectedText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  parentMainInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  parentAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFDBC8',
  },
  parentTextCol: {
    flex: 1,
  },
  parentNameWithRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  parentFullNameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C192C',
  },
  roleChip: {
    backgroundColor: '#FFE4D6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  parentPhoneFormatted: {
    fontSize: 12.5,
    color: '#887367',
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  quickContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dobPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F9F8F6',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE6E1',
  },
  dobPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B5A51',
  },
  parentCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  parentCallBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },
  parentSmsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  parentSmsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },

  // Fixed Bottom Bar
  subjectTeacherBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF7ED',
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#8C5A32',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  subjectTeacherNoticeText: {
    fontSize: 12,
    color: '#8C5A32',
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
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
  modalSectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FFDBC8',
  },
  modalSectionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#984704',
    letterSpacing: 0.5,
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

  // Segmented Control (chuẩn ui-ux-pro-max như RemarksExamScreen)
  tabBar: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.12,
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
  searchClearBtn: {
    padding: 4,
  },

  // Subject Filter Chips
  subjectChipsWrapper: {
    marginBottom: 2,
  },
  subjectChipsScroll: {
    gap: 8,
    paddingRight: 16,
  },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEEBDD',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  subjectChipActive: {
    backgroundColor: '#FFF4EC',
    borderColor: '#F58F4C',
  },
  subjectChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  subjectChipTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },

  // Teacher Bento Cards
  teacherCardsCol: {
    gap: 12,
  },
  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FEEBDD',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  teacherCardCurrent: {
    borderColor: '#F58F4C',
    backgroundColor: '#FFFAF7',
  },
  teacherCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teacherAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  teacherAvatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  teacherInfoCol: {
    flex: 1,
    gap: 4,
  },
  teacherNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  youBadge: {
    backgroundColor: '#F58F4C',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  youBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  teacherBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  subjectBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subjectBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  quickCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: 'rgba(245, 143, 76, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  teacherCardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5EBE1',
  },
  teacherContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  // Assign Subject Modal Styles (ui-ux-pro-max)
  
  
  assignSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  assignSheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  assignSheetSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },

  assignStepLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.6,
  },
  assignSubjBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  assignSubjectScroll: {
    gap: 8,
    paddingVertical: 6,
    paddingRight: 10,
  },
  assignSubjectCard: {
    width: 96,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    gap: 4,
  },
  assignSubjectCardActive: {
    borderColor: '#F58F4C',
    backgroundColor: '#FFF7ED',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  assignSubjectIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignSubjectIconText: {
    fontSize: 14,
    fontWeight: '800',
  },
  assignSubjectCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
  },
  assignSubjectCardTitleActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  assignSubjectStatusText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  assignSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  assignSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    padding: 0,
  },
  teacherSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  teacherSelectItemActive: {
    borderColor: '#F58F4C',
    backgroundColor: '#FFFAF7',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  teacherSelectAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherSelectAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
  },
  teacherSelectName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  matchBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  teacherSelectPhone: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectRadioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectRadioCircleActive: {
    borderColor: '#F58F4C',
    backgroundColor: '#F58F4C',
  },
  editTeacherBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editTeacherBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },

  teacherContactText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
    opacity: 0.85,
  },
  quickEditBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: 'rgba(245, 143, 76, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unassignedBentoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 143, 76, 0.15)',
    shadowColor: '#1E293B',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  unassignedBentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  unassignedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F58F4C',
  },
  unassignedBentoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  unassignedBentoHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unassignedChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  unassignedChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
