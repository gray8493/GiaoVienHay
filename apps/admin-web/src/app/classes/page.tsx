'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ClassMonitoringItem,
  SEED_CLASSES_MONITORING,
  SEED_STUDENTS_BY_CLASS,
  getAdminClassesMonitoring,
  createClassApi,
  getAdminSchoolsApi,
  createAdminSchoolApi,
  updateAdminSchoolApi,
  deleteAdminSchoolApi,
  addStudentToClassApi,
  removeStudentFromClassApi,
} from '../../lib/api-classes';

type ViewLevel = 'SCHOOLS' | 'GRADES' | 'CLASSES' | 'STUDENTS';

interface SchoolItem {
  id: string;
  name: string;
  type: 'PRIMARY' | 'SECONDARY' | 'HIGH';
  typeLabel: string;
  district: string;
  city: string;
  grades: number[];
  isNationalStandard: boolean;
  totalClasses: number;
  totalStudents: number;
  appLinkedPercent: number;
}

interface StudentItem {
  id: string;
  class_id: string;
  class_name: string;
  student_code: string;
  full_name: string;
  dob: string;
  gender: 'MALE' | 'FEMALE';
  parent_name: string;
  parent_phone: string;
  insurance_paid: boolean;
  app_connected: boolean;
}

// 1. Initial Mock Schools
const SYSTEM_SCHOOLS: SchoolItem[] = [
  {
    id: 'TR-001',
    name: 'THCS Lê Quý Đôn',
    type: 'SECONDARY',
    typeLabel: 'Cấp 2 THCS',
    district: 'Quận Cầu Giấy',
    city: 'TP. Hà Nội',
    grades: [6, 7, 8, 9],
    isNationalStandard: true,
    totalClasses: 32,
    totalStudents: 1280,
    appLinkedPercent: 95.2,
  },
  {
    id: 'TR-002',
    name: 'THCS Chu Văn An',
    type: 'SECONDARY',
    typeLabel: 'Cấp 2 THCS',
    district: 'Quận Tây Hồ',
    city: 'TP. Hà Nội',
    grades: [6, 7, 8, 9],
    isNationalStandard: true,
    totalClasses: 28,
    totalStudents: 1120,
    appLinkedPercent: 92.4,
  },
  {
    id: 'TR-003',
    name: 'THPT Chuyên Nguyễn Huệ',
    type: 'HIGH',
    typeLabel: 'Cấp 3 THPT',
    district: 'Quận Hà Đông',
    city: 'TP. Hà Nội',
    grades: [10, 11, 12],
    isNationalStandard: true,
    totalClasses: 36,
    totalStudents: 1440,
    appLinkedPercent: 98.1,
  },
  {
    id: 'TR-004',
    name: 'THCS Phan Đình Phùng',
    type: 'SECONDARY',
    typeLabel: 'Cấp 2 THCS',
    district: 'Quận Ba Đình',
    city: 'TP. Hà Nội',
    grades: [6, 7, 8, 9],
    isNationalStandard: true,
    totalClasses: 30,
    totalStudents: 1200,
    appLinkedPercent: 94.0,
  },
  {
    id: 'TR-005',
    name: 'THCS Vinschool Central',
    type: 'SECONDARY',
    typeLabel: 'Liên cấp THCS',
    district: 'Quận Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    grades: [6, 7, 8, 9],
    isNationalStandard: true,
    totalClasses: 40,
    totalStudents: 1600,
    appLinkedPercent: 98.5,
  },
  {
    id: 'TR-006',
    name: 'THCS Lương Thế Vinh',
    type: 'SECONDARY',
    typeLabel: 'Cấp 2 THCS',
    district: 'Quận Cầu Giấy',
    city: 'TP. Hà Nội',
    grades: [6, 7, 8, 9],
    isNationalStandard: true,
    totalClasses: 24,
    totalStudents: 960,
    appLinkedPercent: 91.8,
  },
];
 
const GRADE_LEADERS: Record<number, { name: string; dept: string }> = {
  6: { name: 'Thầy Trần Quang Hùng', dept: 'Tổ Toán' },
  7: { name: 'Cô Nguyễn Thị Mai Lan', dept: 'Tổ Ngữ Văn' },
  8: { name: 'Thầy Lê Hoàng Nam', dept: 'Tổ Vật Lý' },
  9: { name: 'Cô Phạm Bích Ngọc', dept: 'Tổ Tiếng Anh' },
  10: { name: 'Thầy Vũ Đình Long', dept: 'Tổ Toán - Tin' },
  11: { name: 'Cô Đào Thu Thủy', dept: 'Tổ Ngoại Ngữ' },
  12: { name: 'Thầy Hoàng Trọng Nghĩa', dept: 'Tổ Tự Nhiên' },
};

// Helper to generate full student data from seed
const generateInitialStudents = (): Record<string, StudentItem[]> => {
  const result: Record<string, StudentItem[]> = {};

  Object.entries(SEED_STUDENTS_BY_CLASS).forEach(([classId, rawStudents]) => {
    result[classId] = rawStudents.map((st, idx) => ({
      id: st.id,
      class_id: st.class_id,
      class_name: st.class_name,
      student_code: st.student_code || `HS-${st.class_name}${String(idx + 1).padStart(2, '0')}`,
      full_name: st.full_name,
      dob: st.dob || '2013-05-15',
      gender: (st.gender === 'FEMALE' ? 'FEMALE' : 'MALE') as 'MALE' | 'FEMALE',
      parent_name: `Phụ huynh em ${st.full_name.split(' ').slice(-1)[0]}`,
      parent_phone: st.parent_phone || '0912 345 678',
      insurance_paid: idx % 6 !== 0,
      app_connected: idx % 8 !== 0,
    }));
  });

  return result;
};

interface GradeClassItem {
  id: string;
  name: string;
  specialization: string;
  track: string;
  teacher: string;
  initials: string;
  studentsCount: number;
  boys: number;
  girls: number;
  feePercent: number;
  feeText: string;
  isActive: boolean;
}

const GRADE_7_MOCK_CLASSES: GradeClassItem[] = [
  { id: '7A1', name: '7A1', specialization: 'Lớp 7A1 - Lớp chọn Toán', track: 'Hệ chuẩn chất lượng cao', teacher: 'Cô Nguyễn Thị Mai Lan', initials: 'ML', studentsCount: 40, boys: 20, girls: 20, feePercent: 100, feeText: '100% Hoàn thành', isActive: true },
  { id: '7A2', name: '7A2', specialization: 'Lớp 7A2 - Tiếng Anh mở rộng', track: 'Chương trình song ngữ Anh - Việt', teacher: 'Thầy Trần Quang Hùng', initials: 'QH', studentsCount: 40, boys: 19, girls: 21, feePercent: 100, feeText: '100% Hoàn thành', isActive: true },
  { id: '7A3', name: '7A3', specialization: 'Lớp 7A3 - Chuẩn Bộ GD&ĐT', track: 'Định hướng Khoa học tự nhiên', teacher: 'Cô Đặng Bảo Ngọc', initials: 'BN', studentsCount: 40, boys: 22, girls: 18, feePercent: 97.5, feeText: '97.5% Đã nộp', isActive: true },
  { id: '7A4', name: '7A4', specialization: 'Lớp 7A4 - Chuẩn Bộ GD&ĐT', track: 'Định hướng Khoa học xã hội', teacher: 'Thầy Lê Gia Huy', initials: 'GH', studentsCount: 40, boys: 18, girls: 22, feePercent: 100, feeText: '100% Hoàn thành', isActive: true },
  { id: '7A5', name: '7A5', specialization: 'Lớp 7A5 - Chuẩn Bộ GD&ĐT', track: 'Định hướng Tin học & STEM', teacher: 'Cô Vũ Thùy Anh', initials: 'TA', studentsCount: 40, boys: 21, girls: 19, feePercent: 95, feeText: '95% Đã nộp', isActive: true },
  { id: '7A6', name: '7A6', specialization: 'Lớp 7A6 - Chuẩn Bộ GD&ĐT', track: 'Định hướng Nghệ thuật & Kỹ năng', teacher: 'Thầy Phạm Văn Thắng', initials: 'VT', studentsCount: 40, boys: 20, girls: 20, feePercent: 100, feeText: '100% Hoàn thành', isActive: true },
  { id: '7A7', name: '7A7', specialization: 'Lớp 7A7 - Chuẩn Bộ GD&ĐT', track: 'Định hướng Thể thao học đường', teacher: 'Cô Hoàng Thu Hằng', initials: 'TH', studentsCount: 40, boys: 23, girls: 17, feePercent: 100, feeText: '100% Hoàn thành', isActive: true },
  { id: '7A8', name: '7A8', specialization: 'Lớp 7A8 - Chuẩn Hội nhập', track: 'Tăng cường Ngoại ngữ 2 (Tiếng Nhật)', teacher: 'Thầy Đỗ Quốc Khánh', initials: 'DK', studentsCount: 40, boys: 18, girls: 22, feePercent: 100, feeText: '100% Hoàn thành', isActive: true },
];

const getClassesForGrade = (grade: number): GradeClassItem[] => {
  if (grade === 7) return GRADE_7_MOCK_CLASSES;
  return Array.from({ length: 8 }, (_, idx) => {
    const num = idx + 1;
    const item = GRADE_7_MOCK_CLASSES[idx];
    return {
      id: `${grade}A${num}`,
      name: `${grade}A${num}`,
      specialization: `Lớp ${grade}A${num} - ${item.specialization.split(' - ')[1] || 'Chuẩn Bộ GD&ĐT'}`,
      track: item.track,
      teacher: item.teacher,
      initials: item.initials,
      studentsCount: 40,
      boys: item.boys,
      girls: item.girls,
      feePercent: item.feePercent,
      feeText: item.feeText,
      isActive: true,
    };
  });
};

export default function ClassesAndStudentsManagementPage() {
  // Navigation Drill-Down State (Level by level)
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>('SCHOOLS');
  const [selectedSchool, setSelectedSchool] = useState<SchoolItem | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassMonitoringItem | null>(null);

  // Master Data States (Clean Slate: 100% live data from Firestore API)
  const [schoolsList, setSchoolsList] = useState<SchoolItem[]>([]);
  const [classesList, setClassesList] = useState<ClassMonitoringItem[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, StudentItem[]>>({});

  // Search & Filter
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState('ALL');

  const [gradeSearch, setGradeSearch] = useState('');
  const [gradeFilterTab, setGradeFilterTab] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [classSearch, setClassSearch] = useState('');
  const [classFilterTab, setClassFilterTab] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentGenderFilter, setStudentGenderFilter] = useState('ALL');
  const [studentInsuranceFilter, setStudentInsuranceFilter] = useState('ALL');

  // Modals & Action States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassMonitoringItem | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  const [profileStudent, setProfileStudent] = useState<StudentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Class Modal
  const [classNameInput, setClassNameInput] = useState('');
  const [classRoomInput, setClassRoomInput] = useState('');
  const [classTeacherInput, setClassTeacherInput] = useState('');
  const [classTeacherPhoneInput, setClassTeacherPhoneInput] = useState('');

  // Form states for Student Modal
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [studentDobInput, setStudentDobInput] = useState('2013-05-15');
  const [studentGenderInput, setStudentGenderInput] = useState<'MALE' | 'FEMALE'>('MALE');
  const [parentNameInput, setParentNameInput] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');
  const [studentInsuranceInput, setStudentInsuranceInput] = useState(true);

  // School Modal States (Thêm / Sửa / Xóa trường tại Cấp 1)
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolItem | null>(null);
  const [schoolNameInput, setSchoolNameInput] = useState('');
  const [schoolTypeInput, setSchoolTypeInput] = useState<'PRIMARY' | 'SECONDARY' | 'HIGH'>('SECONDARY');
  const [schoolDistrictInput, setSchoolDistrictInput] = useState('Quận Cầu Giấy');
  const [schoolCityInput, setSchoolCityInput] = useState('TP. Hà Nội');
  const [schoolGradesInput, setSchoolGradesInput] = useState<number[]>([6, 7, 8, 9]);
  const [schoolStandardInput, setSchoolStandardInput] = useState(true);
  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [deletingSchool, setDeletingSchool] = useState<SchoolItem | null>(null);
  const [isDeletingSchool, setIsDeletingSchool] = useState(false);
  const [activeDropdownSchoolId, setActiveDropdownSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveDropdownSchoolId(null);
    };
    if (activeDropdownSchoolId) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [activeDropdownSchoolId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddSchool = () => {
    setEditingSchool(null);
    setSchoolNameInput('');
    setSchoolTypeInput('SECONDARY');
    setSchoolDistrictInput('Quận Cầu Giấy');
    setSchoolCityInput('TP. Hà Nội');
    setSchoolGradesInput([6, 7, 8, 9]);
    setSchoolStandardInput(true);
    setIsSchoolModalOpen(true);
  };

  const handleOpenEditSchool = (sch: SchoolItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSchool(sch);
    setSchoolNameInput(sch.name);
    setSchoolTypeInput(sch.type);
    setSchoolDistrictInput(sch.district || 'Quận Cầu Giấy');
    setSchoolCityInput(sch.city || 'TP. Hà Nội');
    setSchoolGradesInput(sch.grades || (sch.type === 'SECONDARY' ? [6, 7, 8, 9] : [1, 2, 3, 4, 5]));
    setSchoolStandardInput(sch.isNationalStandard);
    setIsSchoolModalOpen(true);
  };

  const handleSchoolTypeChange = (newType: 'PRIMARY' | 'SECONDARY' | 'HIGH') => {
    setSchoolTypeInput(newType);
    if (newType === 'PRIMARY') setSchoolGradesInput([1, 2, 3, 4, 5]);
    else if (newType === 'SECONDARY') setSchoolGradesInput([6, 7, 8, 9]);
    else setSchoolGradesInput([10, 11, 12]);
  };

  const toggleSchoolGrade = (grade: number) => {
    if (schoolGradesInput.includes(grade)) {
      if (schoolGradesInput.length > 1) {
        setSchoolGradesInput(schoolGradesInput.filter((g) => g !== grade));
      }
    } else {
      setSchoolGradesInput([...schoolGradesInput, grade].sort((a, b) => a - b));
    }
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolNameInput.trim()) {
      showToast('Vui lòng nhập tên trường');
      return;
    }

    setIsSavingSchool(true);
    const typeLabel =
      schoolTypeInput === 'PRIMARY'
        ? 'Cấp 1 Tiểu học'
        : schoolTypeInput === 'SECONDARY'
        ? 'Cấp 2 THCS'
        : 'Cấp 3 THPT';

    const payload = {
      name: schoolNameInput.trim(),
      type: schoolTypeInput,
      typeLabel,
      district: schoolDistrictInput.trim(),
      city: schoolCityInput.trim(),
      grades: schoolGradesInput,
      isNationalStandard: schoolStandardInput,
    };

    if (editingSchool) {
      const updated = await updateAdminSchoolApi(editingSchool.id, payload);
      setSchoolsList((prev) =>
        prev.map((s) => (s.id === editingSchool.id ? { ...s, ...(updated || payload) } : s))
      );
      showToast(`Đã cập nhật thông tin trường ${schoolNameInput.trim()}`);
    } else {
      const created = await createAdminSchoolApi(payload);
      const newSchool: SchoolItem = created || {
        id: `TR-${Math.floor(100 + Math.random() * 900)}`,
        name: schoolNameInput.trim(),
        type: schoolTypeInput,
        typeLabel,
        district: schoolDistrictInput.trim(),
        city: schoolCityInput.trim(),
        grades: schoolGradesInput,
        isNationalStandard: schoolStandardInput,
        totalClasses: 0,
        totalStudents: 0,
        appLinkedPercent: 0,
      };
      setSchoolsList((prev) => [newSchool, ...prev]);
      showToast(`Đã thêm mới trường ${schoolNameInput.trim()} thành công`);
    }

    setIsSavingSchool(false);
    setIsSchoolModalOpen(false);
  };

  const handleConfirmDeleteSchool = async () => {
    if (!deletingSchool) return;
    setIsDeletingSchool(true);
    await deleteAdminSchoolApi(deletingSchool.id);
    setSchoolsList((prev) => prev.filter((s) => s.id !== deletingSchool.id));
    showToast(`Đã xóa trường ${deletingSchool.name} khỏi hệ thống`);
    setIsDeletingSchool(false);
    setDeletingSchool(null);
  };

  // Nạp danh sách trường học và lớp học thật từ Backend khi mở trang
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [liveClasses, liveSchools] = await Promise.all([
          getAdminClassesMonitoring(),
          getAdminSchoolsApi(),
        ]);
        if (isMounted) {
          setClassesList(liveClasses || []);
          setSchoolsList(liveSchools || []);
        }
      } catch (e) {
        console.warn('Lỗi tải dữ liệu từ API:', e);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with Global Search in Header across all levels
  useEffect(() => {
    const handleGlobalSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const q = customEvent.detail || '';
      if (currentLevel === 'SCHOOLS') setSchoolSearch(q);
      else if (currentLevel === 'GRADES') setGradeSearch(q);
      else if (currentLevel === 'CLASSES') setClassSearch(q);
      else if (currentLevel === 'STUDENTS') setStudentSearch(q);
    };
    window.addEventListener('app-global-search', handleGlobalSearch);
    return () => window.removeEventListener('app-global-search', handleGlobalSearch);
  }, [currentLevel]);

  // Level Navigation Handlers
  const handleSelectSchool = (school: SchoolItem) => {
    setSelectedSchool(school);
    setSelectedGrade(null);
    setSelectedClass(null);
    setCurrentLevel('GRADES');
  };

  const handleSelectGrade = (grade: number) => {
    setSelectedGrade(grade);
    setSelectedClass(null);
    setCurrentLevel('CLASSES');
  };

  const handleSelectClass = (cls: ClassMonitoringItem) => {
    setSelectedClass(cls);
    setCurrentLevel('STUDENTS');
  };

  const handleGoToSchools = () => {
    setSelectedSchool(null);
    setSelectedGrade(null);
    setSelectedClass(null);
    setCurrentLevel('SCHOOLS');
  };

  const handleGoToGrades = () => {
    setSelectedGrade(null);
    setSelectedClass(null);
    setCurrentLevel('GRADES');
  };

  const handleGoToClasses = () => {
    setSelectedClass(null);
    setCurrentLevel('CLASSES');
  };

  // Class CRUD Handlers
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassNameInput(`${selectedGrade || 7}${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`);
    setClassRoomInput(`Phòng A${(selectedGrade || 7) * 100 + 1}`);
    setClassTeacherInput('');
    setClassTeacherPhoneInput('');
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: ClassMonitoringItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClass(cls);
    setClassNameInput(cls.name);
    setClassRoomInput(cls.room || '');
    setClassTeacherInput(cls.homeroom_teacher);
    setClassTeacherPhoneInput(cls.homeroom_teacher_phone || '');
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    if (editingClass) {
      setClassesList((prev) =>
        prev.map((c) =>
          c.class_id === editingClass.class_id
            ? {
                ...c,
                name: classNameInput.trim(),
                room: classRoomInput.trim(),
                homeroom_teacher: classTeacherInput.trim() || c.homeroom_teacher,
                homeroom_teacher_phone: classTeacherPhoneInput.trim() || c.homeroom_teacher_phone,
              }
            : c
        )
      );
      showToast(`Đã cập nhật thông tin lớp ${classNameInput.trim()}`);
    } else {
      const newClassId = `cls-${Date.now().toString(36)}`;
      const newCls: ClassMonitoringItem = {
        class_id: newClassId,
        name: classNameInput.trim(),
        grade_level: selectedGrade || 7,
        room: classRoomInput.trim() || 'Phòng A101',
        homeroom_teacher: classTeacherInput.trim() || 'Chưa phân công',
        homeroom_teacher_phone: classTeacherPhoneInput.trim() || '0900 000 000',
        student_count: 0,
        linked_parents_count: 0,
        insurance_paid_count: 0,
        academic_year: '2026-2027',
        invite_code: `INV-${classNameInput.trim().toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setClassesList((prev) => [newCls, ...prev]);
      setStudentsByClass((prev) => ({ ...prev, [newClassId]: [] }));

      // Gửi yêu cầu tạo lớp trực tiếp tới Backend API
      try {
        await createClassApi({
          name: classNameInput.trim(),
          grade_level: selectedGrade || 7,
          academic_year: '2026-2027',
          school_name: selectedSchool?.name,
          homeroom_teacher: classTeacherInput.trim() || undefined,
        });
      } catch (err) {
        console.warn('Lỗi đồng bộ tạo lớp lên backend:', err);
      }

      showToast(`Đã tạo mới lớp ${newCls.name} thành công`);
    }
    setIsClassModalOpen(false);
  };

  const handleDeleteClass = (classId: string, className: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa lớp ${className}?`)) {
      setClassesList((prev) => prev.filter((c) => c.class_id !== classId));
      showToast(`Đã xóa lớp ${className} khỏi hệ thống`);
    }
  };

  // Student CRUD Handlers
  const handleOpenAddStudent = () => {
    if (!selectedClass) return;
    setEditingStudent(null);
    setStudentNameInput('');
    setStudentCodeInput(`HS-${selectedClass.name}${String((studentsByClass[selectedClass.class_id]?.length || 0) + 1).padStart(2, '0')}`);
    setStudentDobInput('2013-05-15');
    setStudentGenderInput('MALE');
    setParentNameInput('');
    setParentPhoneInput('0912 ');
    setStudentInsuranceInput(true);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (st: StudentItem) => {
    setEditingStudent(st);
    setStudentNameInput(st.full_name);
    setStudentCodeInput(st.student_code);
    setStudentDobInput(st.dob);
    setStudentGenderInput(st.gender);
    setParentNameInput(st.parent_name);
    setParentPhoneInput(st.parent_phone);
    setStudentInsuranceInput(st.insurance_paid);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNameInput.trim() || !selectedClass) return;

    if (editingStudent) {
      setStudentsByClass((prev) => {
        const list = prev[selectedClass.class_id] || [];
        return {
          ...prev,
          [selectedClass.class_id]: list.map((s) =>
            s.id === editingStudent.id
              ? {
                  ...s,
                  full_name: studentNameInput.trim(),
                  student_code: studentCodeInput.trim(),
                  dob: studentDobInput,
                  gender: studentGenderInput,
                  parent_name: parentNameInput.trim(),
                  parent_phone: parentPhoneInput.trim(),
                  insurance_paid: studentInsuranceInput,
                }
              : s
          ),
        };
      });
      showToast(`Đã cập nhật học sinh ${studentNameInput.trim()}`);
    } else {
      const newSt: StudentItem = {
        id: `stu-${Date.now().toString(36)}`,
        class_id: selectedClass.class_id,
        class_name: selectedClass.name,
        student_code: studentCodeInput.trim() || `HS-${selectedClass.name}${Date.now().toString().slice(-3)}`,
        full_name: studentNameInput.trim(),
        dob: studentDobInput,
        gender: studentGenderInput,
        parent_name: parentNameInput.trim() || 'Phụ huynh học sinh',
        parent_phone: parentPhoneInput.trim(),
        insurance_paid: studentInsuranceInput,
        app_connected: true,
      };

      setStudentsByClass((prev) => ({
        ...prev,
        [selectedClass.class_id]: [newSt, ...(prev[selectedClass.class_id] || [])],
      }));

      setClassesList((prev) =>
        prev.map((c) =>
          c.class_id === selectedClass.class_id ? { ...c, student_count: c.student_count + 1 } : c
        )
      );

      // Gửi yêu cầu lưu học sinh xuống Backend API (Module 03-classes)
      try {
        await addStudentToClassApi(selectedClass.class_id, {
          full_name: studentNameInput.trim(),
          dob: studentDobInput,
          gender: studentGenderInput,
          parent_phone: parentPhoneInput.trim() || undefined,
        });
      } catch (err) {
        console.warn('Lỗi đồng bộ thêm học sinh lên Backend:', err);
      }

      showToast(`Đã thêm học sinh ${newSt.full_name} vào lớp ${selectedClass.name}`);
    }
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!selectedClass) return;
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh ${studentName} khỏi lớp ${selectedClass.name}?`)) {
      setStudentsByClass((prev) => ({
        ...prev,
        [selectedClass.class_id]: (prev[selectedClass.class_id] || []).filter((s) => s.id !== studentId),
      }));

      setClassesList((prev) =>
        prev.map((c) =>
          c.class_id === selectedClass.class_id ? { ...c, student_count: Math.max(0, c.student_count - 1) } : c
        )
      );

      // Gửi yêu cầu xóa học sinh xuống Backend API (Module 03-classes)
      try {
        await removeStudentFromClassApi(selectedClass.class_id, studentId);
      } catch (err) {
        console.warn('Lỗi đồng bộ xóa học sinh lên Backend:', err);
      }

      showToast(`Đã xóa học sinh ${studentName}`);
    }
  };


  // Filtered Lists
  const filteredSchools = useMemo(() => {
    return schoolsList.filter((sch) => {
      const matchSearch =
        sch.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        sch.district.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        sch.city.toLowerCase().includes(schoolSearch.toLowerCase());
      
      const isLienCap = sch.name.includes('Vinschool') || sch.typeLabel.includes('Liên cấp');
      let matchType = true;
      if (schoolTypeFilter === 'SECONDARY') {
        matchType = sch.type === 'SECONDARY' && !isLienCap;
      } else if (schoolTypeFilter === 'HIGH') {
        matchType = sch.type === 'HIGH';
      } else if (schoolTypeFilter === 'LIENCAP') {
        matchType = isLienCap;
      } else if (schoolTypeFilter === 'PENDING') {
        matchType = false;
      }
      return matchSearch && matchType;
    });
  }, [schoolsList, schoolSearch, schoolTypeFilter]);


  // Danh sách lớp hợp lệ trực thuộc các trường đang có trong hệ thống
  const validClassesList = useMemo(() => {
    if (schoolsList.length === 0) return [];
    const allGradeLevels = schoolsList.flatMap((s) => s.grades || []);
    return classesList.filter((cls) => allGradeLevels.includes(cls.grade_level));
  }, [schoolsList, classesList]);

  const filteredClasses = useMemo(() => {
    if (!selectedGrade) return [];
    return classesList.filter((cls) => {
      const matchGrade = cls.grade_level === selectedGrade;
      const matchSearch =
        cls.name.toLowerCase().includes(classSearch.toLowerCase()) ||
        cls.homeroom_teacher.toLowerCase().includes(classSearch.toLowerCase()) ||
        (cls.room || '').toLowerCase().includes(classSearch.toLowerCase());
      return matchGrade && matchSearch;
    });
  }, [classesList, selectedGrade, classSearch]);

  const currentGradeClasses = useMemo(() => {
    if (!selectedGrade) return [];
    return classesList
      .filter((cls) => cls.grade_level === selectedGrade)
      .map((cls) => {
        const students = studentsByClass[cls.class_id] || [];
        return {
          id: cls.class_id,
          name: cls.name,
          specialization: `Lớp ${cls.name} - Chuẩn Bộ GD&ĐT`,
          track: 'Học kỳ I 2026-2027',
          teacher: cls.homeroom_teacher || 'Chưa phân công',
          initials: cls.name ? cls.name.slice(0, 2) : 'LH',
          studentsCount: students.length || cls.student_count || 0,
          boys: students.filter((s) => s.gender === 'MALE').length,
          girls: students.filter((s) => s.gender === 'FEMALE').length,
          feePercent: 100,
          feeText: '100% Hoàn thành',
          isActive: true,
          rawClass: cls,
        };
      })
      .filter((c) => {
        if (classFilterTab === 'ACTIVE' && !c.isActive) return false;
        if (classSearch.trim()) {
          const q = classSearch.toLowerCase();
          const match =
            c.name.toLowerCase().includes(q) ||
            c.specialization.toLowerCase().includes(q) ||
            c.teacher.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });
  }, [classesList, selectedGrade, classFilterTab, classSearch, studentsByClass]);

  const currentClassStudents = useMemo(() => {
    if (!selectedClass) return [];
    const list = studentsByClass[selectedClass.class_id] || [];
    return list.filter((st) => {
      const matchSearch =
        st.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.student_code.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.parent_phone.includes(studentSearch);
      const matchGender = studentGenderFilter === 'ALL' || st.gender === studentGenderFilter;
      const matchInsurance =
        studentInsuranceFilter === 'ALL' ||
        (studentInsuranceFilter === 'PAID' && st.insurance_paid) ||
        (studentInsuranceFilter === 'UNPAID' && !st.insurance_paid);
      return matchSearch && matchGender && matchInsurance;
    });
  }, [studentsByClass, selectedClass, studentSearch, studentGenderFilter, studentInsuranceFilter]);

  const studentStats = useMemo(() => {
    if (!selectedClass) return { total: 0, boys: 0, girls: 0, insurancePaid: 0, appConnected: 0 };
    const list = studentsByClass[selectedClass.class_id] || [];
    const total = list.length;
    const boys = list.filter((s) => s.gender === 'MALE').length;
    const girls = list.filter((s) => s.gender === 'FEMALE').length;
    const insurancePaid = list.filter((s) => s.insurance_paid).length;
    const appConnected = list.filter((s) => s.app_connected).length;
    return { total, boys, girls, insurancePaid, appConnected };
  }, [studentsByClass, selectedClass]);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7 space-y-6 dot-matrix-bg min-h-screen">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-slate-500 text-xs">
        <Link href="/" className="hover:text-slate-900 transition-colors flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[16px] text-slate-400">home</span>
          <span>Trang chủ</span>
        </Link>
        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
        <button
          type="button"
          onClick={handleGoToSchools}
          className={`hover:text-slate-900 transition-colors cursor-pointer ${
            currentLevel === 'SCHOOLS' ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'
          }`}
        >
          Quản lý Lớp &amp; Học sinh
        </button>

        {currentLevel === 'SCHOOLS' && (
          <>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span className="text-slate-900 font-semibold">Danh sách Trường học</span>
          </>
        )}

        {selectedSchool && currentLevel !== 'SCHOOLS' && (
          <>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <button
              type="button"
              onClick={handleGoToGrades}
              className={`hover:text-slate-900 transition-colors cursor-pointer ${
                currentLevel === 'GRADES' ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'
              }`}
            >
              {selectedSchool.name}
            </button>
          </>
        )}

        {selectedGrade && (currentLevel === 'CLASSES' || currentLevel === 'STUDENTS') && (
          <>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <button
              type="button"
              onClick={handleGoToClasses}
              className={`hover:text-slate-900 transition-colors cursor-pointer ${
                currentLevel === 'CLASSES' ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'
              }`}
            >
              Khối {selectedGrade}
            </button>
          </>
        )}

        {selectedClass && currentLevel === 'STUDENTS' && (
          <>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span className="text-slate-900 font-semibold">Lớp {selectedClass.name}</span>
          </>
        )}

        {/* Back Button */}
        {currentLevel !== 'SCHOOLS' && (
          <button
            type="button"
            onClick={() => {
              if (currentLevel === 'STUDENTS') handleGoToClasses();
              else if (currentLevel === 'CLASSES') handleGoToGrades();
              else if (currentLevel === 'GRADES') handleGoToSchools();
            }}
            title="Quay lại cấp trước"
            className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* CẤP 1: DANH SÁCH TRƯỜNG HỌC (HORIZONTAL LIST ROWS) */}
      {/* ========================================================================= */}
      {currentLevel === 'SCHOOLS' && (
        <div className="space-y-6">
          {/* Breadcrumb & Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Danh sách Trường học &amp; Đơn vị liên kết
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                  {schoolsList.length} Đơn vị
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Hệ thống quản lý {schoolsList.length} trường học và cơ sở giáo dục trực thuộc nền tảng.
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenAddSchool}
                className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[16px]">add</span>
                <span>Thêm trường</span>
              </button>
            </div>
          </div>

          {/* BEGIN: Minimalist KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tổng cơ sở */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng cơ sở</span>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{schoolsList.length}</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-500">
                    <span className="material-symbols-outlined !text-[14px]">apartment</span>
                    <span>Cơ sở hoạt động</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">apartment</span>
                </div>
              </div>
            </div>

            {/* Card 2: Quy mô khối */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Quy mô khối</span>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                    {schoolsList.reduce((acc, s) => acc + (s.grades?.length || 0), 0)}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-500">
                    <span className="material-symbols-outlined !text-[14px]">layers</span>
                    <span>Khối đào tạo thực tế</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">layers</span>
                </div>
              </div>
            </div>

            {/* Card 3: Tổng số lớp */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng số lớp</span>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{validClassesList.length}</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-500">
                    <span className="material-symbols-outlined !text-[14px]">meeting_room</span>
                    <span>Lớp học trên hệ thống</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">meeting_room</span>
                </div>
              </div>
            </div>

            {/* Card 4: Tổng học sinh */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng học sinh</span>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                    {validClassesList.reduce((acc, c) => acc + (c.student_count || 0), 0)}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-500">
                    <span className="material-symbols-outlined !text-[14px]">school</span>
                    <span>Học sinh được xếp lớp</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">school</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: Minimalist KPI Cards Row */}

          {/* BEGIN: Table & Filters Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
            {/* Top Status Tabs bar */}
            <div className="px-5 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap bg-white">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSchoolTypeFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-full font-semibold text-xs transition cursor-pointer ${
                    schoolTypeFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                  }`}
                >
                  Tất cả <span className="text-[11px] opacity-75 font-normal ml-0.5">(38)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSchoolTypeFilter('SECONDARY')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    schoolTypeFilter === 'SECONDARY'
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                  }`}
                >
                  THCS <span className="text-[11px] text-slate-400 ml-0.5">(24)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSchoolTypeFilter('HIGH')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    schoolTypeFilter === 'HIGH'
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                  }`}
                >
                  THPT <span className="text-[11px] text-slate-400 ml-0.5">(10)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSchoolTypeFilter('LIENCAP')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    schoolTypeFilter === 'LIENCAP'
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                  }`}
                >
                  Liên cấp <span className="text-[11px] text-slate-400 ml-0.5">(4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSchoolTypeFilter('PENDING')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    schoolTypeFilter === 'PENDING'
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                  }`}
                >
                  Đang chờ duyệt <span className="text-[11px] text-slate-400 ml-0.5">(0)</span>
                </button>
              </div>
            </div>

            {/* Data Table matching approved design */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    <th scope="col" className="py-3 px-6 text-left">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                        <span>Trường học &amp; Địa bàn</span>
                      </div>
                    </th>
                    <th scope="col" className="py-3 px-6 text-left">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                        <span>Cấp học</span>
                      </div>
                    </th>
                    <th scope="col" className="py-3 px-6 text-left">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                        <span>Quy mô đào tạo</span>
                      </div>
                    </th>
                    <th scope="col" className="py-3 px-6 text-left">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                        <span>Trạng thái</span>
                      </div>
                    </th>
                    <th scope="col" className="py-3 px-6 text-right">
                      <div className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-800">
                        <span>Hành động</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white whitespace-nowrap">
                  {filteredSchools.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-14 px-6 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined !text-[24px]">account_balance</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">Hệ thống chưa có trường học nào</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Bắt đầu thiết lập hệ thống bằng cách thêm trường học đầu tiên của bạn.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenAddSchool}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined !text-[16px]">add</span>
                            <span>Thêm trường học</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSchools.map((school) => {
                    const levelBadge = school.name.includes('Vinschool')
                      ? 'Liên cấp THCS - THPT'
                      : school.type === 'HIGH'
                      ? 'THPT (Cấp 3)'
                      : 'THCS (Cấp 2)';

                    return (
                      <tr
                        key={school.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => handleSelectSchool(school)}
                      >
                        <td className="py-3.5 px-6">
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-black transition-colors">
                              {school.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {school.district}, {school.city}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-slate-600 font-medium">
                          {levelBadge}
                        </td>
                        <td className="py-3.5 px-6 text-slate-600">
                          <span className="font-medium text-slate-800">{school.grades.length} khối</span> •{' '}
                          {school.totalClasses} lớp • {school.totalStudents.toLocaleString()} HS
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Đang hoạt động
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right relative">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSchool(school);
                              }}
                              className="inline-flex items-center text-xs font-semibold text-slate-900 hover:text-black hover:underline cursor-pointer"
                            >
                              <span>Vào khối học</span>
                            </button>

                            {/* Dropdown 3 chấm dọc */}
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownSchoolId((prev) => (prev === school.id ? null : school.id));
                                }}
                                className="p-1.5 text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                title="Tùy chọn thao tác"
                                aria-label="Tùy chọn trường học"
                              >
                                <span className="material-symbols-outlined !text-[18px]">more_vert</span>
                              </button>

                              {activeDropdownSchoolId === school.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownSchoolId(null);
                                      handleOpenEditSchool(school, e);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-black hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined !text-[16px] text-slate-500">edit</span>
                                    <span>Chỉnh sửa trường</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownSchoolId(null);
                                      setDeletingSchool(school);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100"
                                  >
                                    <span className="material-symbols-outlined !text-[16px] text-rose-500">delete</span>
                                    <span>Xóa trường học</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching approved design */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 bg-white">
              <div className="text-xs text-slate-500 font-normal">
                Hiển thị <span className="font-semibold text-slate-800">{filteredSchools.length > 0 ? `1-${filteredSchools.length}` : '0'}</span> trong{' '}
                <span className="font-semibold text-slate-800">{schoolsList.length}</span> trường học
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Hàng:</span>
                  <select className="py-1 pl-2 pr-6 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer">
                    <option value="6">6</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <button
                    type="button"
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-900 text-white font-medium text-xs shadow-xs"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition text-xs cursor-pointer"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition text-xs cursor-pointer"
                  >
                    3
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CẤP 2: DANH SÁCH KHỐI HỌC (APPROVED DESIGN) */}
      {/* ========================================================================= */}
      {currentLevel === 'GRADES' && selectedSchool && (
        <div className="space-y-6">
          {/* Breadcrumbs & Header Section */}
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Danh sách Khối học - {selectedSchool.name}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                    {selectedSchool.grades.length} Khối
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Hệ thống quản lý {selectedSchool.grades.length} khối học và {selectedSchool.totalStudents.toLocaleString()} học sinh trực thuộc cơ sở.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => showToast('Mở cửa sổ thêm khối học mới')}
                  className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined !text-[16px]">add</span>
                  <span>Thêm khối học</span>
                </button>
              </div>
            </div>
          </div>

          {/* BEGIN: KPICardsRow */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tổng số khối */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng số khối</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{selectedSchool.grades.length}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">apartment</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined !text-[14px]">trending_flat</span>
                  +0%
                </span>
                <span>
                  {selectedSchool.grades && selectedSchool.grades.length > 0
                    ? `K${selectedSchool.grades[0]} - K${selectedSchool.grades[selectedSchool.grades.length - 1]}`
                    : 'Chưa thiết lập khối'}
                </span>
              </div>
            </div>

            {/* Card 2: Tổng số lớp */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng số lớp</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{selectedSchool.totalClasses}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">layers</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined !text-[14px]">equalizer</span>
                  Trung bình
                </span>
                <span>
                  {selectedSchool.grades && selectedSchool.grades.length > 0
                    ? Math.round(selectedSchool.totalClasses / selectedSchool.grades.length)
                    : 0}{' '}
                  lớp/khối
                </span>
              </div>
            </div>

            {/* Card 3: Tổng học sinh */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng học sinh</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{selectedSchool.totalStudents.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">school</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined !text-[14px]">check_circle</span>
                  100%
                </span>
                <span>đã xếp lớp</span>
              </div>
            </div>

            {/* Card 4: Giáo viên phụ trách */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Giáo viên phụ trách</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {
                      new Set(
                        classesList
                          .filter((c) => selectedSchool.grades.includes(c.grade_level))
                          .map((c) => c.homeroom_teacher)
                          .filter(Boolean)
                      ).size
                    }
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">groups</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined !text-[14px]">verified</span>
                  100%
                </span>
                <span>GVCN &amp; GVBM</span>
              </div>
            </div>
          </section>
          {/* END: KPICardsRow */}

          {/* BEGIN: FilterAndSearchToolbar */}
          <section className="space-y-3.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setGradeFilterTab('ALL')}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                  gradeFilterTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                }`}
              >
                Tất cả ({selectedSchool.grades.length})
              </button>
              <button
                type="button"
                onClick={() => setGradeFilterTab('ACTIVE')}
                className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                  gradeFilterTab === 'ACTIVE'
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                }`}
              >
                Đang hoạt động ({selectedSchool.grades.length})
              </button>
            </div>

            {/* Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined !text-[18px]">search</span>
                </span>
                <input
                  type="text"
                  value={gradeSearch}
                  onChange={(e) => setGradeSearch(e.target.value)}
                  placeholder="Tìm kiếm khối học, giáo viên phụ trách..."
                  className="w-full h-9 pl-9 pr-4 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400 text-slate-800 shadow-2xs"
                />
              </div>
            </div>
          </section>
          {/* END: FilterAndSearchToolbar */}

          {/* BEGIN: GradeDataTable */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    <th className="py-3 px-6 whitespace-nowrap" scope="col">Khối học &amp; Trường</th>
                    <th className="py-3 px-6 whitespace-nowrap" scope="col">Trưởng khối</th>
                    <th className="py-3 px-6 whitespace-nowrap" scope="col">Quy mô đào tạo</th>
                    <th className="py-3 px-6 whitespace-nowrap" scope="col">Trạng thái</th>
                    <th className="py-3 px-6 text-right whitespace-nowrap" scope="col">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {selectedSchool.grades
                    .filter((grade) => {
                      const leader = GRADE_LEADERS[grade] || { name: 'Thầy Trưởng Khối', dept: 'Ban giám hiệu' };
                      const matchSearch =
                        !gradeSearch ||
                        `Khối ${grade}`.toLowerCase().includes(gradeSearch.toLowerCase()) ||
                        leader.name.toLowerCase().includes(gradeSearch.toLowerCase()) ||
                        leader.dept.toLowerCase().includes(gradeSearch.toLowerCase());
                      return matchSearch;
                    })
                    .map((grade) => {
                      const leader = GRADE_LEADERS[grade] || { name: 'Thầy Trưởng Khối', dept: 'Tổ Chuyên Môn' };
                      const gradeClasses = classesList.filter((c) => c.grade_level === grade);
                      const totalStudentsInGrade =
                        gradeClasses.reduce(
                          (acc, cur) => acc + (studentsByClass[cur.class_id]?.length || cur.student_count),
                          0
                        ) || Math.round(selectedSchool.totalStudents / selectedSchool.grades.length);

                      return (
                        <tr
                          key={grade}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                          onClick={() => handleSelectGrade(grade)}
                        >
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                                K{grade}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 text-xs group-hover:text-black transition-colors">
                                  Khối {grade} (Lớp {grade})
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap font-medium text-slate-800">
                            {leader.name} <span className="text-slate-400 font-normal">({leader.dept})</span>
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap text-slate-600 font-medium">
                            {gradeClasses.length || 8} lớp • {totalStudentsInGrade} HS
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Đang hoạt động
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectGrade(grade);
                              }}
                              className="inline-flex items-center text-xs font-semibold text-slate-900 hover:text-slate-700 hover:underline cursor-pointer"
                            >
                              <span>Danh sách lớp học</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* BEGIN: TableFooterPagination */}
            <div className="px-6 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">
                Hiển thị <span className="font-semibold text-slate-800">1-{selectedSchool.grades.length}</span> trong{' '}
                <span className="font-semibold text-slate-800">{selectedSchool.grades.length}</span> khối học
              </div>
              <div className="flex items-center gap-4">
                {/* Row Per Page Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Hàng:</span>
                  <select className="text-xs bg-white border border-slate-200 rounded-md py-1 pl-2 pr-6 focus:ring-slate-400 focus:border-slate-400 text-slate-700 shadow-sm cursor-pointer">
                    <option defaultValue="6">6</option>
                    <option value="12">12</option>
                    <option value="24">24</option>
                  </select>
                </div>
                {/* Page Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed font-medium text-xs"
                    disabled
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-medium text-xs shadow-xs"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-medium text-xs transition cursor-pointer"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-medium text-xs transition cursor-pointer"
                  >
                    3
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-medium text-xs transition cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
            {/* END: TableFooterPagination */}
          </div>
          {/* END: GradeDataTable */}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CẤP 3: DANH SÁCH LỚP HỌC (APPROVED DESIGN TABLE) */}
      {/* ========================================================================= */}
      {currentLevel === 'CLASSES' && selectedSchool && selectedGrade && (
        <div className="space-y-6">

          {/* PAGE TITLE & MAJOR ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Danh sách Lớp học - Khối {selectedGrade}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                  {currentGradeClasses.length} Lớp học
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Hệ thống quản lý {currentGradeClasses.length} lớp học và {currentGradeClasses.length * 40} học sinh trực thuộc Khối {selectedGrade} niên khóa 2026 - 2027.
              </p>
            </div>
            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleOpenAddClass}
                className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors border border-slate-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Thêm lớp học</span>
              </button>
            </div>
          </div>

          {/* 4 MINIMALIST KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tổng số lớp */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Tổng số lớp</span>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{currentGradeClasses.length}</div>
                <div className="mt-1 text-xs text-slate-400">
                  K{selectedGrade}: {selectedGrade}A1 - {selectedGrade}A{currentGradeClasses.length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </div>
            </div>

            {/* Card 2: Tổng học sinh */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Tổng học sinh</span>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{currentGradeClasses.length * 40}</div>
                <div className="mt-1 text-xs text-slate-400">Trung bình 40 HS/lớp</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
            </div>

            {/* Card 3: Chuyên cần hôm nay */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Chuyên cần hôm nay</span>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">98.4%</div>
                <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  {Math.round(currentGradeClasses.length * 40 * 0.984)}/{currentGradeClasses.length * 40} có mặt
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </div>
            </div>

            {/* Card 4: Giáo viên chủ nhiệm */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Giáo viên chủ nhiệm</span>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {currentGradeClasses.length}/{currentGradeClasses.length}
                </div>
                <div className="mt-1 text-xs text-slate-400">100% đã phân công</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
            </div>
          </div>

          {/* BEGIN: FilterAndSearchToolbar */}
          <section className="space-y-3.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setClassFilterTab('ALL')}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                  classFilterTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Tất cả ({getClassesForGrade(selectedGrade).length})
              </button>
              <button
                type="button"
                onClick={() => setClassFilterTab('ACTIVE')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                  classFilterTab === 'ACTIVE'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Đang hoạt động ({getClassesForGrade(selectedGrade).length})
              </button>
            </div>

            {/* Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined !text-[18px]">search</span>
                </span>
                <input
                  type="text"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  placeholder="Tìm kiếm lớp học, giáo viên phụ trách..."
                  className="w-full pl-9 pr-4 h-9 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400 text-slate-800 shadow-2xs transition"
                />
              </div>
            </div>
          </section>
          {/* END: FilterAndSearchToolbar */}

          {/* DATA TABLE CARD */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5 whitespace-nowrap">Lớp học</th>
                    <th className="py-3 px-5 whitespace-nowrap">Giáo viên chủ nhiệm</th>
                    <th className="py-3 px-5 whitespace-nowrap">Sĩ số</th>
                    <th className="py-3 px-5 whitespace-nowrap">BHYT &amp; Học phí</th>
                    <th className="py-3 px-5 whitespace-nowrap">Trạng thái</th>
                    <th className="py-3 px-5 whitespace-nowrap text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-normal">
                  {currentGradeClasses.map((item) => {
                    const targetClass: ClassMonitoringItem = {
                      class_id: `cls-${item.id.toLowerCase()}`,
                      name: item.name,
                      grade_level: selectedGrade,
                      homeroom_teacher: item.teacher,
                      student_count: item.studentsCount,
                      linked_parents_count: item.studentsCount,
                      insurance_paid_count: Math.round(item.studentsCount * (item.feePercent / 100)),
                      academic_year: '2026-2027',
                    };

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectClass(targetClass)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                              {item.name}
                            </span>
                            <div>
                              <span className="text-xs text-slate-900 font-semibold block leading-tight group-hover:text-black transition-colors">
                                {item.specialization}
                              </span>
                              <span className="text-slate-400 text-[11px]">{item.track}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="text-slate-800 font-medium">{item.teacher}</span>
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="text-slate-800 font-medium">{item.studentsCount} học sinh</span>
                          <span className="text-slate-400 text-[11px] block">
                            ({item.boys} Nam / {item.girls} Nữ)
                          </span>
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {item.feePercent === 100 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              100% Hoàn thành
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {item.feeText}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Đang hoạt động
                          </span>
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectClass(targetClass);
                            }}
                            className="inline-flex items-center text-xs font-semibold text-slate-900 hover:text-slate-700 hover:underline cursor-pointer"
                          >
                            <span>Danh sách học sinh</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {currentGradeClasses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined !text-[24px]">meeting_room</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">Khối {selectedGrade} chưa có lớp học nào</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Trường {selectedSchool?.name} chưa được thiết lập lớp cho khối này. Bấm để tạo lớp mới.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenAddClass}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined !text-[16px]">add</span>
                            <span>Tạo lớp học mới</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE PAGINATION FOOTER */}
            <div className="py-3.5 px-6 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  Hiển thị <span className="font-semibold text-slate-800">1-{currentGradeClasses.length}</span> trong{' '}
                  <span className="font-semibold text-slate-800">{currentGradeClasses.length}</span> lớp học
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Hiển thị:</span>
                  <select className="h-8 text-xs bg-white border border-slate-200 rounded-md px-2 py-0 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 cursor-pointer">
                    <option defaultValue="8">8 / trang</option>
                    <option value="16">16 / trang</option>
                    <option value="24">24 / trang</option>
                  </select>
                </div>
              </div>
              {/* Pagination Controls */}
              <div className="flex items-center gap-1 self-center sm:self-auto">
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed flex items-center justify-center transition-colors"
                  disabled
                >
                  <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded bg-slate-900 text-white font-medium flex items-center justify-center text-xs shadow-xs"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CẤP 4: DANH SÁCH HỌC SINH CỦA LỚP (FULL HORIZONTAL TABLE LIST) */}
      {/* ========================================================================= */}
      {currentLevel === 'STUDENTS' && selectedSchool && selectedGrade && selectedClass && (
        <div className="space-y-6">
          {/* Breadcrumb & Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Lớp {selectedClass.name} - Danh sách Học sinh
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                  {studentStats.total} Học sinh
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                GVCN: {selectedClass.homeroom_teacher} ({selectedClass.homeroom_teacher_phone || '0912 345 678'}) • {selectedSchool.name} • {selectedClass.room || 'Phòng học chính'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenAddStudent}
                className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[16px]">person_add</span>
                <span>Thêm học sinh</span>
              </button>
            </div>
          </div>

          {/* BEGIN: Minimalist KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Sĩ số lớp */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Sĩ số lớp</span>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {studentStats.total} <span className="text-sm font-normal text-slate-400">học sinh</span>
                </div>
                <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>100% chỉ tiêu niên khóa</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <span className="material-symbols-outlined text-[20px]">groups</span>
              </div>
            </div>

            {/* Card 2: Cơ cấu giới tính */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Cơ cấu giới tính</span>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {studentStats.boys} <span className="text-sm font-normal text-slate-500">Nam</span> • {studentStats.girls} <span className="text-sm font-normal text-slate-500">Nữ</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {studentStats.total ? Math.round((studentStats.boys / studentStats.total) * 100) : 0}% Nam • {studentStats.total ? Math.round((studentStats.girls / studentStats.total) * 100) : 0}% Nữ
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <span className="material-symbols-outlined text-[20px]">wc</span>
              </div>
            </div>

            {/* Card 3: BHYT & Học phí */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">BHYT &amp; Học phí</span>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {studentStats.insurancePaid} <span className="text-sm font-normal text-slate-400">/ {studentStats.total}</span>
                </div>
                <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>{studentStats.total ? Math.round((studentStats.insurancePaid / studentStats.total) * 100) : 0}% hoàn thành</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
            </div>

            {/* Card 4: Sổ liên lạc điện tử */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Sổ liên lạc App</span>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {studentStats.appConnected} <span className="text-sm font-normal text-slate-400">/ {studentStats.total}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {studentStats.total ? Math.round((studentStats.appConnected / studentStats.total) * 100) : 0}% kết nối phụ huynh
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <span className="material-symbols-outlined text-[20px]">devices</span>
              </div>
            </div>
          </div>
          {/* END: Minimalist KPI Cards Row */}

          {/* BEGIN: FilterAndSearchToolbar */}
          <section className="space-y-3.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setStudentGenderFilter('ALL');
                  setStudentInsuranceFilter('ALL');
                }}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                  studentGenderFilter === 'ALL' && studentInsuranceFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Tất cả ({studentStats.total})
              </button>

              <button
                type="button"
                onClick={() => setStudentGenderFilter('MALE')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                  studentGenderFilter === 'MALE'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Nam ({studentStats.boys})
              </button>

              <button
                type="button"
                onClick={() => setStudentGenderFilter('FEMALE')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                  studentGenderFilter === 'FEMALE'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Nữ ({studentStats.girls})
              </button>

              <button
                type="button"
                onClick={() => setStudentInsuranceFilter(studentInsuranceFilter === 'PAID' ? 'ALL' : 'PAID')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                  studentInsuranceFilter === 'PAID'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Đã nộp BHYT ({studentStats.insurancePaid})
              </button>

              <button
                type="button"
                onClick={() => setStudentInsuranceFilter(studentInsuranceFilter === 'UNPAID' ? 'ALL' : 'UNPAID')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                  studentInsuranceFilter === 'UNPAID'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Chưa nộp BHYT ({studentStats.total - studentStats.insurancePaid})
              </button>
            </div>

            {/* Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined !text-[18px]">search</span>
                </span>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tìm mã HS, họ tên, số điện thoại..."
                  className="w-full pl-9 pr-4 h-9 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400 text-slate-800 shadow-2xs transition"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
                <span>
                  Hiển thị <span className="font-semibold text-slate-800">{currentClassStudents.length}</span> /{' '}
                  <span className="font-semibold text-slate-800">{studentStats.total}</span> học sinh
                </span>
              </div>
            </div>
          </section>
          {/* END: FilterAndSearchToolbar */}

          {/* DATA TABLE CARD */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5 whitespace-nowrap w-12 text-center">STT</th>
                    <th className="py-3 px-5 whitespace-nowrap">Học sinh</th>
                    <th className="py-3 px-5 whitespace-nowrap">Giới tính</th>
                    <th className="py-3 px-5 whitespace-nowrap">Ngày sinh</th>
                    <th className="py-3 px-5 whitespace-nowrap">Phụ huynh liên hệ</th>
                    <th className="py-3 px-5 whitespace-nowrap">BHYT &amp; Học phí</th>
                    <th className="py-3 px-5 whitespace-nowrap">Sổ liên lạc App</th>
                    <th className="py-3 px-5 whitespace-nowrap text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-normal">
                  {currentClassStudents.map((st, index) => (
                    <tr
                      key={st.id}
                      onClick={() => setProfileStudent(st)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5 text-center text-slate-400 font-mono text-xs whitespace-nowrap">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {st.full_name.split(' ').slice(-1)[0][0]}
                          </span>
                          <div>
                            <span className="text-xs text-slate-900 font-semibold block leading-tight group-hover:text-black transition-colors">
                              {st.full_name}
                            </span>
                            <span className="text-slate-400 text-[11px] font-mono mt-0.5 block">
                              Mã HS: {st.student_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="text-slate-800 font-medium">
                          {st.gender === 'FEMALE' ? 'Nữ' : 'Nam'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="text-slate-700 font-mono text-xs">{st.dob}</span>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{st.parent_name}</div>
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5">{st.parent_phone}</div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {st.insurance_paid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Đã nộp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Chưa nộp
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {st.app_connected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900 text-white shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Đã kết nối
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Chưa kích hoạt
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setProfileStudent(st)}
                            className="inline-flex items-center text-xs font-semibold text-slate-900 hover:text-slate-700 hover:underline cursor-pointer mr-2"
                          >
                            Hồ sơ
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditStudent(st)}
                            title="Sửa thông tin học sinh"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(st.id, st.full_name)}
                            title="Xóa học sinh"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentClassStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mx-auto mb-2 text-slate-300">
                          person_search
                        </span>
                        <span>Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE PAGINATION FOOTER */}
            <div className="py-3.5 px-6 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  Hiển thị <span className="font-semibold text-slate-800">1-{currentClassStudents.length}</span> trong{' '}
                  <span className="font-semibold text-slate-800">{currentClassStudents.length}</span> học sinh
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Hiển thị:</span>
                  <select className="h-8 text-xs bg-white border border-slate-200 rounded-md px-2 py-0 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer">
                    <option defaultValue="40">40 / trang</option>
                    <option value="80">80 / trang</option>
                  </select>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1 self-center sm:self-auto">
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed flex items-center justify-center transition-colors"
                  disabled
                >
                  <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded bg-slate-900 text-white font-medium flex items-center justify-center text-xs shadow-xs"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed flex items-center justify-center transition-colors"
                  disabled
                >
                  <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: THÊM / SỬA LỚP HỌC */}
      {/* ========================================================================= */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingClass ? `Chỉnh sửa lớp ${editingClass.name}` : `Thêm lớp mới - Khối ${selectedGrade}`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trường {selectedSchool?.name}
                </p>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tên lớp học *
                </label>
                <input
                  type="text"
                  required
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="Ví dụ: 7A, 7B..."
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Phòng học
                </label>
                <input
                  type="text"
                  value={classRoomInput}
                  onChange={(e) => setClassRoomInput(e.target.value)}
                  placeholder="Ví dụ: Phòng A201"
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Giáo viên chủ nhiệm (GVCN)
                </label>
                <input
                  type="text"
                  value={classTeacherInput}
                  onChange={(e) => setClassTeacherInput(e.target.value)}
                  placeholder="Ví dụ: Cô Nguyễn Thị Mai Lan"
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Số điện thoại GVCN
                </label>
                <input
                  type="text"
                  value={classTeacherPhoneInput}
                  onChange={(e) => setClassTeacherPhoneInput(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-black text-xs font-semibold text-white cursor-pointer shadow-xs"
                >
                  {editingClass ? 'Lưu thay đổi' : 'Tạo lớp học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THÊM / SỬA HỌC SINH */}
      {/* ========================================================================= */}
      {isStudentModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingStudent ? `Chỉnh sửa học sinh` : `Thêm học sinh mới - Lớp ${selectedClass.name}`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nhập thông tin hồ sơ và người giám hộ
                </p>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Họ và tên học sinh *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentNameInput}
                    onChange={(e) => setStudentNameInput(e.target.value)}
                    placeholder="Ví dụ: Nguyễn An Bình"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mã học sinh *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentCodeInput}
                    onChange={(e) => setStudentCodeInput(e.target.value)}
                    placeholder="Ví dụ: HS-7A01"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={studentDobInput}
                    onChange={(e) => setStudentDobInput(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Giới tính
                  </label>
                  <select
                    value={studentGenderInput}
                    onChange={(e) => setStudentGenderInput(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Họ tên phụ huynh
                  </label>
                  <input
                    type="text"
                    value={parentNameInput}
                    onChange={(e) => setParentNameInput(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Tuấn"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Số điện thoại phụ huynh *
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhoneInput}
                    onChange={(e) => setParentPhoneInput(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={studentInsuranceInput}
                    onChange={(e) => setStudentInsuranceInput(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                  />
                  <span>Đã hoàn thành thu nộp BHYT &amp; Học phí kỳ này</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-black text-xs font-semibold text-white cursor-pointer shadow-xs"
                >
                  {editingStudent ? 'Lưu cập nhật' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: HỒ SƠ HỌC TẬP VÀ ĐIỂM DANH HỌC SINH (STUDENT PROFILE) */}
      {/* ========================================================================= */}
      {profileStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    profileStudent.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {profileStudent.full_name.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Hồ sơ: {profileStudent.full_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mã HS: {profileStudent.student_code} • Lớp: {profileStudent.class_name} • Sinh ngày: {profileStudent.dob}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Người giám hộ</span>
                  <span className="font-bold text-slate-800">{profileStudent.parent_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Số điện thoại</span>
                  <span className="font-mono font-bold text-slate-900">{profileStudent.parent_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tình trạng BHYT</span>
                  <span className={`font-semibold ${profileStudent.insurance_paid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {profileStudent.insurance_paid ? 'Đã hoàn thành' : 'Chưa đóng'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">grade</span>
                  <span>Kết quả học tập kỳ gần nhất (Học kỳ I 2026-2027)</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="py-2.5 px-3">Môn học</th>
                        <th className="py-2.5 px-3">Miệng</th>
                        <th className="py-2.5 px-3">15 Phút</th>
                        <th className="py-2.5 px-3">Giữa kỳ</th>
                        <th className="py-2.5 px-3 text-right">ĐTB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Toán học</td>
                        <td className="py-2.5 px-3">9.0</td>
                        <td className="py-2.5 px-3">8.5</td>
                        <td className="py-2.5 px-3">9.5</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">9.1</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Ngữ Văn</td>
                        <td className="py-2.5 px-3">8.0</td>
                        <td className="py-2.5 px-3">8.5</td>
                        <td className="py-2.5 px-3">8.0</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">8.1</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Tiếng Anh</td>
                        <td className="py-2.5 px-3">9.5</td>
                        <td className="py-2.5 px-3">9.0</td>
                        <td className="py-2.5 px-3">10.0</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">9.6</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">event_available</span>
                  <span>Nhật ký điểm danh thiết bị Smartboard</span>
                </h4>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Hôm nay (01/10/2026):</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Có mặt (07:15)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Hôm qua (30/09/2026):</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Có mặt (07:20)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setProfileStudent(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white cursor-pointer"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: THÊM MỚI / CHỈNH SỬA TRƯỜNG HỌC (SCHOOL CRUD MODAL) */}
      {/* ========================================================================= */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSchool ? 'Chỉnh sửa Trường học' : 'Thêm Trường học mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tên trường học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: THCS Lê Quý Đôn"
                  value={schoolNameInput}
                  onChange={(e) => setSchoolNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cấp đào tạo</label>
                  <select
                    value={schoolTypeInput}
                    onChange={(e) => handleSchoolTypeChange(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="PRIMARY">Cấp 1 (Tiểu học)</option>
                    <option value="SECONDARY">Cấp 2 (THCS)</option>
                    <option value="HIGH">Cấp 3 (THPT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    value={schoolCityInput}
                    onChange={(e) => setSchoolCityInput(e.target.value)}
                    placeholder="TP. Hà Nội"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Quận / Huyện</label>
                <input
                  type="text"
                  value={schoolDistrictInput}
                  onChange={(e) => setSchoolDistrictInput(e.target.value)}
                  placeholder="Ví dụ: Quận Cầu Giấy"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Các khối đào tạo ({schoolTypeInput === 'PRIMARY' ? 'Khối 1 - 5' : schoolTypeInput === 'SECONDARY' ? 'Khối 6 - 9' : 'Khối 10 - 12'})
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(schoolTypeInput === 'PRIMARY'
                    ? [1, 2, 3, 4, 5]
                    : schoolTypeInput === 'SECONDARY'
                    ? [6, 7, 8, 9]
                    : [10, 11, 12]
                  ).map((gr) => {
                    const isChecked = schoolGradesInput.includes(gr);
                    return (
                      <button
                        type="button"
                        key={gr}
                        onClick={() => toggleSchoolGrade(gr)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Khối {gr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schoolStandardInput}
                    onChange={(e) => setSchoolStandardInput(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 accent-slate-900 focus:ring-slate-900 border-slate-300"
                  />
                  <span className="text-slate-700 font-medium">Trường đạt chuẩn Quốc gia (Mức độ I hoặc II)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSchoolModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingSchool}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingSchool ? 'Đang lưu...' : editingSchool ? 'Cập nhật' : 'Khởi tạo trường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: XÁC NHẬN XÓA TRƯỜNG HỌC */}
      {/* ========================================================================= */}
      {deletingSchool && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Xóa trường học</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa trường <strong className="text-slate-800">{deletingSchool.name}</strong> ({deletingSchool.id})? Hành động này sẽ loại bỏ trường khỏi danh sách.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSchool(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeletingSchool}
                onClick={handleConfirmDeleteSchool}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeletingSchool ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
