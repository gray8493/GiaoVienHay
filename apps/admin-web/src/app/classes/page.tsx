'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ClassMonitoringItem,
  SEED_CLASSES_MONITORING,
  SEED_STUDENTS_BY_CLASS,
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

  // Master Data States
  const [classesList, setClassesList] = useState<ClassMonitoringItem[]>(SEED_CLASSES_MONITORING);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, StudentItem[]>>(generateInitialStudents);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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

  const handleSaveClass = (e: React.FormEvent) => {
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

  const handleSaveStudent = (e: React.FormEvent) => {
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

      showToast(`Đã thêm học sinh ${newSt.full_name} vào lớp ${selectedClass.name}`);
    }
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
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
      showToast(`Đã xóa học sinh ${studentName}`);
    }
  };

  const handleExportExcel = () => {
    showToast(`Đang xuất danh sách lớp ${selectedClass?.name || ''} sang tệp Excel...`);
    setTimeout(() => {
      showToast(`Tệp Excel danh sách học sinh đã được tải xuống thành công.`);
    }, 1000);
  };

  const handleImportExcel = () => {
    showToast(`Đã sẵn sàng tải lên danh sách lớp. Hãy chọn tệp .xlsx hoặc .csv.`);
  };

  // Filtered Lists
  const filteredSchools = useMemo(() => {
    return SYSTEM_SCHOOLS.filter((sch) => {
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
  }, [schoolSearch, schoolTypeFilter]);

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
    const baseClasses = getClassesForGrade(selectedGrade);
    return baseClasses.filter((c) => {
      if (classFilterTab === 'ACTIVE' && !c.isActive) return false;
      if (classSearch.trim()) {
        const q = classSearch.toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.specialization.toLowerCase().includes(q) ||
          c.teacher.toLowerCase().includes(q) ||
          c.track.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedGrade, classFilterTab, classSearch]);

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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                  38 Đơn vị
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Hệ thống quản lý 38 trường học và cơ sở giáo dục trực thuộc nền tảng.
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => showToast('Mở cửa sổ thêm trường học mới')}
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
                  <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">38</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600">
                    <span className="material-symbols-outlined !text-[14px]">trending_up</span>
                    <span>+12.5%</span>
                    <span className="text-slate-400 font-normal ml-0.5">vs quý trước</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">apartment</span>
                </div>
              </div>
            </div>

            {/* Card 2: Quy mô khối */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Quy mô khối</span>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">152</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600">
                    <span className="material-symbols-outlined !text-[14px]">trending_up</span>
                    <span>+8.2%</span>
                    <span className="text-slate-400 font-normal ml-0.5">K6 - K12</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">layers</span>
                </div>
              </div>
            </div>

            {/* Card 3: Tổng số lớp */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng số lớp</span>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">1,280</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-rose-500">
                    <span className="material-symbols-outlined !text-[14px]">trending_down</span>
                    <span>-1.4%</span>
                    <span className="text-slate-400 font-normal ml-0.5">~33 lớp/trường</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">meeting_room</span>
                </div>
              </div>
            </div>

            {/* Card 4: Tổng học sinh */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng học sinh</span>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">51,240</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600">
                    <span className="material-symbols-outlined !text-[14px]">trending_up</span>
                    <span>+24.7%</span>
                    <span className="text-slate-400 font-normal ml-0.5">100% active</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
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
                  {filteredSchools.map((school) => {
                    const initials = school.name.includes('Lê Quý Đôn')
                      ? 'LQ'
                      : school.name.includes('Chu Văn An')
                      ? 'CV'
                      : school.name.includes('Nguyễn Huệ')
                      ? 'NH'
                      : school.name.includes('Phan Đình Phùng')
                      ? 'PD'
                      : school.name.includes('Vinschool')
                      ? 'VC'
                      : school.name.includes('Lương Thế Vinh')
                      ? 'LT'
                      : school.name.slice(0, 2).toUpperCase();

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
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {school.name}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {school.district}, {school.city}
                              </div>
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
                        <td className="py-3.5 px-6 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSchool(school);
                            }}
                            className="inline-flex items-center text-xs font-semibold text-slate-900 hover:text-slate-700 hover:underline cursor-pointer"
                          >
                            <span>Danh sách khối học</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredSchools.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mx-auto mb-2 text-slate-300">
                          search_off
                        </span>
                        <span>Không tìm thấy trường học nào khớp với bộ lọc.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching approved design */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 bg-white">
              <div className="text-xs text-slate-500 font-normal">
                Hiển thị <span className="font-semibold text-slate-800">1-{filteredSchools.length}</span> trong{' '}
                <span className="font-semibold text-slate-800">38</span> trường học
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
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
                  onClick={handleImportExcel}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined !text-[16px] text-slate-500">file_upload</span>
                  <span>Nhập Excel</span>
                </button>
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
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">apartment</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined !text-[14px]">trending_flat</span>
                  +0%
                </span>
                <span>Cố định (K{selectedSchool.grades[0]} - K{selectedSchool.grades[selectedSchool.grades.length - 1]})</span>
              </div>
            </div>

            {/* Card 2: Tổng số lớp */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng số lớp</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{selectedSchool.totalClasses}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">layers</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined !text-[14px]">equalizer</span>
                  Trung bình
                </span>
                <span>{Math.round(selectedSchool.totalClasses / selectedSchool.grades.length)} lớp/khối</span>
              </div>
            </div>

            {/* Card 3: Tổng học sinh */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tổng học sinh</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{selectedSchool.totalStudents.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
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
                  <div className="text-2xl font-bold text-slate-900 mt-1">54</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
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
                              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                K{grade}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
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
                onClick={handleImportExcel}
                className="h-9 px-3.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">upload_file</span>
                <span>Nhập Excel</span>
              </button>
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
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
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
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
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
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
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
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
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
                            <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {item.name}
                            </span>
                            <div>
                              <span className="text-xs text-slate-900 font-semibold block leading-tight group-hover:text-blue-600 transition-colors">
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
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Không tìm thấy lớp học nào phù hợp với điều kiện tìm kiếm.
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
                  <select className="h-8 text-xs bg-white border border-slate-200 rounded-md px-2 py-0 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer">
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
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
                onClick={handleImportExcel}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[16px] text-slate-500">file_upload</span>
                <span>Nhập Excel</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[16px] text-slate-500">download</span>
                <span>Xuất Excel</span>
              </button>

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
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
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
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
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
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
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
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
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
                            <span className="text-xs text-slate-900 font-semibold block leading-tight group-hover:text-blue-600 transition-colors">
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
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
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
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white cursor-pointer shadow-xs"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Giới tính
                  </label>
                  <select
                    value={studentGenderInput}
                    onChange={(e) => setStudentGenderInput(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white cursor-pointer shadow-xs"
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
                    profileStudent.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
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
                  <span className="font-mono font-bold text-blue-600">{profileStudent.parent_phone}</span>
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
                  <span className="material-symbols-outlined text-[16px] text-blue-600">grade</span>
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
                        <td className="py-2.5 px-3 text-right font-bold text-blue-600">9.1</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Ngữ Văn</td>
                        <td className="py-2.5 px-3">8.0</td>
                        <td className="py-2.5 px-3">8.5</td>
                        <td className="py-2.5 px-3">8.0</td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-600">8.1</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">Tiếng Anh</td>
                        <td className="py-2.5 px-3">9.5</td>
                        <td className="py-2.5 px-3">9.0</td>
                        <td className="py-2.5 px-3">10.0</td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-600">9.6</td>
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
    </main>
  );
}
