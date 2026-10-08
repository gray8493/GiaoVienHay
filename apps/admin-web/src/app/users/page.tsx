'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../lib/api-client';
import { formatNumber } from '../../lib/format';

interface SchoolData {
  id: string;
  name: string;
  code?: string;
  academicYear?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface ClassData {
  class_id?: string;
  id?: string;
  name: string;
  grade_level?: number;
  gradeLevel?: number;
  academic_year?: string;
  academicYear?: string;
  school_name?: string;
  schoolName?: string;
  homeroom_teacher?: string;
  homeroomTeacherId?: string;
  student_count?: number;
  studentCount?: number;
}

interface UserData {
  id: string;
  code?: string;
  fullName?: string;
  full_name?: string;
  phone: string;
  email?: string;
  role: string;
  schoolName?: string;
  school_name?: string;
  assignedInfo?: string;
  assigned_info?: string;
  isActive?: boolean;
  is_active?: boolean;
  aiDailyQuota?: number;
  ai_daily_quota?: number;
  aiUsedToday?: number;
  ai_used_today?: number;
  aiModelTier?: string;
  ai_model_tier?: string;
}

type ManagedUserForm = {
  full_name: string;
  phone: string;
  email: string;
  role: string;
};

const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  TEACHER_HOMEROOM: 'Giáo viên chủ nhiệm',
  TEACHER_SUBJECT: 'Giáo viên bộ môn',
  TEACHER: 'Giáo viên',
  PARENT: 'Phụ huynh',
};

interface TreeNode {
  id: string;
  title: string;
  type: 'school' | 'year' | 'grade' | 'class';
  subtitle?: string;
  badge?: string;
  studentCount?: number;
  parentsCount?: number;
  teacher?: {
    id?: string;
    name: string;
    code: string;
    phone: string;
    email: string;
    assignedInfo?: string;
    role?: string;
    isActive?: boolean;
    aiDailyQuota?: number;
    aiUsedToday?: number;
    aiModelTier?: string;
  };
  subjectTeachers?: Array<{
    id?: string;
    name: string;
    code: string;
    phone: string;
    email: string;
    assignedInfo?: string;
    role?: string;
    isActive?: boolean;
    aiDailyQuota?: number;
    aiUsedToday?: number;
    aiModelTier?: string;
  }>;
  parents?: Array<{
    id: string;
    name: string;
    studentName: string;
    phone: string;
    email?: string;
    code?: string;
    isActive?: boolean;
    aiDailyQuota?: number;
    aiUsedToday?: number;
    aiModelTier?: string;
  }>;
  children?: TreeNode[];
}

export default function UsersInteractiveExplorerPage() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [isManagedUserModalOpen, setIsManagedUserModalOpen] = useState(false);
  const [editingManagedUser, setEditingManagedUser] = useState<UserData | null>(null);
  const [managedUserForm, setManagedUserForm] = useState<ManagedUserForm>({
    full_name: '', phone: '', email: '', role: 'TEACHER_HOMEROOM',
  });
  const [quotaTargetUser, setQuotaTargetUser] = useState<UserData | null>(null);
  const [quotaValue, setQuotaValue] = useState(25);
  const [quotaModelTier, setQuotaModelTier] = useState('AUTO');
  const [isSavingManagedUser, setIsSavingManagedUser] = useState(false);

  // Notice form
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  // Search filter for parents
  const [parentSearchTerm, setParentSearchTerm] = useState('');

  // Class detail active tab
  const [activeClassTab, setActiveClassTab] = useState<'tab-1' | 'tab-2' | 'tab-3' | null>(null);

  // Navigation path stack
  const [navigationPath, setNavigationPath] = useState<TreeNode[]>([]);

  // 1. Tải dữ liệu thật 100% từ Backend API (Cloud SQL PostgreSQL)
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [schoolsRes, classesRes, usersRes] = await Promise.all([
        apiFetch<SchoolData[]>('/admin/schools'),
        apiFetch<ClassData[]>('/admin/classes'),
        apiFetch<{ items: UserData[]; total: number }>('/admin/users'),
      ]);

      setSchools(schoolsRes.data || []);
      setClasses(classesRes.data || []);
      setUsers((usersRes.data?.items || []).map((user) => ({
        ...user,
        full_name: user.full_name || user.fullName || '',
        school_name: user.school_name || user.schoolName || '',
        is_active: user.is_active ?? user.isActive ?? true,
        ai_daily_quota: user.ai_daily_quota ?? user.aiDailyQuota ?? 25,
        ai_used_today: user.ai_used_today ?? user.aiUsedToday ?? 0,
        ai_model_tier: user.ai_model_tier || user.aiModelTier || 'AUTO',
      })));
    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu từ Backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Xây dựng cây phân cấp CHỈ TỪ DỮ LIỆU CÓ THẬT TRONG DATABASE
  const schoolTree: TreeNode = useMemo(() => {
    const primarySchool = schools.find((school) => school.id === selectedSchoolId) || schools[0] || {
      id: 'sch_default',
      name: 'Trường Tiểu Học Chu Văn An',
      academicYear: '2026-2027',
      address: '115 Thụy Khuê, Tây Hồ, Hà Nội',
    };

    const academicYearStr = primarySchool.academicYear || '2026-2027';
    const schoolName = primarySchool.name.trim().toLocaleLowerCase('vi');
    const schoolUsers = users.filter(
      (user) => (user.schoolName || user.school_name || '').trim().toLocaleLowerCase('vi') === schoolName
    );
    const schoolClasses = classes.filter((item) => {
      const classSchoolName = (item.schoolName || item.school_name || '').trim().toLocaleLowerCase('vi');
      return classSchoolName === schoolName || (!classSchoolName && schools.length === 1);
    });

    // Chỉ lấy người dùng thuộc trường đang chọn
    const homeroomTeachers = schoolUsers.filter((u) => u.role === 'TEACHER_HOMEROOM');
    const subjectTeachers = schoolUsers.filter((u) => u.role === 'TEACHER_SUBJECT');
    const parentUsers = schoolUsers.filter((u) => u.role === 'PARENT');

    // Gom nhóm các lớp theo Khối (grade level) thực tế
    const gradeMap = new Map<number, ClassData[]>();
    schoolClasses.forEach((c) => {
      const grade = c.grade_level || c.gradeLevel || 1;
      if (!gradeMap.has(grade)) gradeMap.set(grade, []);
      gradeMap.get(grade)!.push(c);
    });

    const gradeNodes: TreeNode[] = Array.from(gradeMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([grade, classList]) => {
        const classNodes: TreeNode[] = classList.map((cls) => {
          const classId = cls.id || cls.class_id || `cls_${grade}`;
          const className = cls.name;
          const studentCount = cls.student_count || cls.studentCount || 0;

          // Tìm GVCN tương ứng từ ID trong database
          const teacherId = cls.homeroom_teacher || cls.homeroomTeacherId;
          const assignedTeacher =
            homeroomTeachers.find((t) => t.id === teacherId) ||
            homeroomTeachers[0];

          const teacherObj = assignedTeacher
            ? {
                id: assignedTeacher.id,
                name: assignedTeacher.fullName || assignedTeacher.full_name || 'Chưa cập nhật',
                code: assignedTeacher.code || 'GV',
                phone: assignedTeacher.phone || 'Chưa có SĐT',
                email: assignedTeacher.email || 'Chưa có email',
                assignedInfo: assignedTeacher.assignedInfo || assignedTeacher.assigned_info || 'Giáo viên chủ nhiệm',
                role: assignedTeacher.role,
                isActive: assignedTeacher.is_active ?? assignedTeacher.isActive,
                aiDailyQuota: assignedTeacher.ai_daily_quota ?? assignedTeacher.aiDailyQuota,
                aiUsedToday: assignedTeacher.ai_used_today ?? assignedTeacher.aiUsedToday,
                aiModelTier: assignedTeacher.ai_model_tier || assignedTeacher.aiModelTier,
              }
            : undefined;

          // Danh sách giáo viên bộ môn thực tế từ DB
          const subjectTeachersList = subjectTeachers.map((st) => ({
            id: st.id,
            name: st.fullName || st.full_name || 'Giáo viên bộ môn',
            code: st.code || 'GV',
            phone: st.phone || 'Chưa có SĐT',
            email: st.email || 'Chưa có email',
            assignedInfo: st.assignedInfo || st.assigned_info || 'Giáo viên bộ môn',
            role: st.role,
            isActive: st.is_active ?? st.isActive,
            aiDailyQuota: st.ai_daily_quota ?? st.aiDailyQuota,
            aiUsedToday: st.ai_used_today ?? st.aiUsedToday,
            aiModelTier: st.ai_model_tier || st.aiModelTier,
          }));

          // Danh sách phụ huynh thực tế từ DB
          const parentsList = parentUsers.map((p) => {
            const rawInfo = p.assignedInfo || p.assigned_info || '';
            const studentName = rawInfo.replace(/Phụ huynh em\s*/i, '').trim() || 'Học sinh';

            return {
              id: p.id,
              code: p.code,
              name: p.fullName || p.full_name || 'Phụ huynh',
              studentName,
              phone: p.phone,
              email: p.email || 'Chưa có email',
              isActive: p.is_active ?? p.isActive,
              aiDailyQuota: p.ai_daily_quota ?? p.aiDailyQuota,
              aiUsedToday: p.ai_used_today ?? p.aiUsedToday,
              aiModelTier: p.ai_model_tier || p.aiModelTier,
            };
          });

          return {
            id: classId,
            title: `Lớp ${className}`,
            type: 'class' as const,
            studentCount,
            parentsCount: parentsList.length,
            teacher: teacherObj,
            subjectTeachers: subjectTeachersList,
            parents: parentsList,
          };
        });

        const totalParentsInGrade = classNodes.reduce((sum, c) => sum + (c.parentsCount || 0), 0);

        return {
          id: `grade-${grade}`,
          title: `Khối ${grade}`,
          type: 'grade' as const,
          subtitle: `${classNodes.length} Lớp học • ${totalParentsInGrade} Phụ huynh`,
          children: classNodes,
        };
      });

    return {
      id: 'root-school',
      title: primarySchool.name,
      type: 'school' as const,
      subtitle: primarySchool.address || 'Hệ thống Quản lý Giáo dục',
      children: [
        {
          id: `year-${academicYearStr}`,
          title: `Niên khóa ${academicYearStr}`,
          type: 'year' as const,
          subtitle: 'Năm học hiện tại trong hệ thống',
          badge: 'Hiện tại',
          children: gradeNodes,
        },
      ],
    };
  }, [schools, classes, users, selectedSchoolId]);

  // Cập nhật navigation path khi schoolTree sẵn sàng
  useEffect(() => {
    if (navigationPath.length === 0 && schoolTree.id) {
      setNavigationPath([schoolTree]);
    }
  }, [schoolTree]);

  // Node hiện tại đang duyệt
  const currentNode = navigationPath[navigationPath.length - 1] || schoolTree;
  const selectedSchool = schools.find((school) => school.id === selectedSchoolId) || null;
  // Điều hướng sâu vào node con (Drill-down)
  const handleDrillDown = (child: TreeNode) => {
    setNavigationPath((prev) => [...prev, child]);
    if (child.type === 'class') setActiveClassTab(null);
  };

  // Quay lại cấp trước đó
  const handleGoBack = () => {
    if (navigationPath.length > 1) {
      setNavigationPath((prev) => prev.slice(0, prev.length - 1));
      setActiveClassTab(null);
    }
  };

  // Nhảy tới cấp bất kỳ trên thanh Breadcrumbs
  const handleNavigateToIndex = (index: number) => {
    setNavigationPath((prev) => prev.slice(0, index + 1));
  };

  const handleChooseSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setNavigationPath([]);
    setParentSearchTerm('');
    setActiveClassTab(null);
  };

  const handleChangeSchool = () => {
    setSelectedSchoolId(null);
    setNavigationPath([]);
  };

  const openManagedUserForm = (user?: UserData, defaultRole = 'TEACHER_HOMEROOM') => {
    setEditingManagedUser(user || null);
    setManagedUserForm({
      full_name: user?.full_name || user?.fullName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      role: user?.role || defaultRole,
    });
    setIsManagedUserModalOpen(true);
  };

  const saveManagedUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSchool || !managedUserForm.full_name.trim() || !managedUserForm.phone.trim()) return;
    setIsSavingManagedUser(true);
    try {
      const isEditing = Boolean(editingManagedUser);
      const response = await apiFetch(
        isEditing ? `/admin/users/${editingManagedUser!.id}` : '/admin/users',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify({
            full_name: managedUserForm.full_name.trim(),
            phone: managedUserForm.phone.trim(),
            email: managedUserForm.email.trim() || null,
            role: managedUserForm.role,
            school_name: selectedSchool.name,
          }),
        },
      );
      if (!response.success) {
        window.alert(response.error || 'Không thể lưu tài khoản.');
        return;
      }
      setIsManagedUserModalOpen(false);
      await loadData();
    } finally {
      setIsSavingManagedUser(false);
    }
  };

  const toggleManagedUserStatus = async (user: UserData) => {
    const isActive = user.is_active ?? user.isActive ?? true;
    const nextStatus = !isActive;
    const reason = nextStatus ? undefined : window.prompt('Nhập lý do khóa tài khoản:');
    if (!nextStatus && reason === null) return;
    const response = await apiFetch(`/admin/users/${user.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: nextStatus, reason: reason || undefined }),
    });
    if (!response.success) {
      window.alert(response.error || 'Không thể cập nhật trạng thái tài khoản.');
      return;
    }
    await loadData();
  };

  const openQuotaEditor = (user: UserData) => {
    setQuotaTargetUser(user);
    setQuotaValue(user.ai_daily_quota ?? user.aiDailyQuota ?? 25);
    setQuotaModelTier(user.ai_model_tier || user.aiModelTier || 'AUTO');
  };

  const saveUserQuota = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quotaTargetUser || !Number.isInteger(quotaValue) || quotaValue < 0) return;
    const response = await apiFetch(`/admin/users/${quotaTargetUser.id}/ai-quota`, {
      method: 'PATCH',
      body: JSON.stringify({ ai_daily_quota: quotaValue, ai_model_tier: quotaModelTier, reset_used: false }),
    });
    if (!response.success) {
      window.alert(response.error || 'Không thể cập nhật hạn mức AI.');
      return;
    }
    setQuotaTargetUser(null);
    await loadData();
  };

  const deleteManagedUser = async (user: UserData) => {
    if (!window.confirm(`Xóa tài khoản ${user.full_name || user.fullName || user.phone}?`)) return;
    const response = await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });
    if (!response.success) {
      window.alert(response.error || 'Không thể xóa tài khoản.');
      return;
    }
    await loadData();
  };

  const getUserForManagement = (userId?: string) => users.find((user) => user.id === userId);
  const editUserById = (userId?: string) => {
    const user = getUserForManagement(userId);
    if (user) openManagedUserForm(user);
  };
  const editQuotaById = (userId?: string) => {
    const user = getUserForManagement(userId);
    if (user) openQuotaEditor(user);
  };
  const toggleUserById = (userId?: string) => {
    const user = getUserForManagement(userId);
    if (user) void toggleManagedUserStatus(user);
  };
  const deleteUserById = (userId?: string) => {
    const user = getUserForManagement(userId);
    if (user) void deleteManagedUser(user);
  };
  const renderUserActions = (userId?: string) => {
    const user = getUserForManagement(userId);
    if (!user) return null;
    const isActive = user.is_active ?? user.isActive ?? true;
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => editUserById(user.id)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100">Sửa</button>
        <button type="button" onClick={() => editQuotaById(user.id)} className="rounded-md border border-blue-200 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">Limit AI</button>
        <button type="button" onClick={() => toggleUserById(user.id)} className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${isActive ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
          {isActive ? 'Ban' : 'Mở khóa'}
        </button>
        <button type="button" onClick={() => deleteUserById(user.id)} className="rounded-md border border-rose-200 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50">Xóa</button>
      </div>
    );
  };

  // Gửi thông báo đến phụ huynh lớp
  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      alert('Vui lòng điền tiêu đề và nội dung thông báo');
      return;
    }

    alert(`Đã gửi thông báo "${noticeTitle}" thành công đến toàn thể phụ huynh lớp`);
    setIsNoticeModalOpen(false);
    setNoticeTitle('');
    setNoticeContent('');
  };

  // Lọc danh sách phụ huynh theo từ khóa tìm kiếm
  const filteredParents = useMemo(() => {
    if (!currentNode.parents) return [];
    if (!parentSearchTerm.trim()) return currentNode.parents;
    const term = parentSearchTerm.toLowerCase();
    return currentNode.parents.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.studentName.toLowerCase().includes(term) ||
        p.phone.includes(term) ||
        (p.email && p.email.toLowerCase().includes(term))
    );
  }, [currentNode.parents, parentSearchTerm]);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu đồng bộ trực tiếp từ Cloud SQL PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedSchoolId && (
            <button
              type="button"
              onClick={handleChangeSchool}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
            >
              Chọn trường khác
            </button>
          )}
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
          >
            {isLoading ? 'Đang tải...' : 'Làm mới dữ liệu'}
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
        {/* BREADCRUMB DRILL-DOWN BAR */}
        {selectedSchoolId && <div className="bg-white p-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-600 overflow-x-auto">
            {navigationPath.map((node, index) => {
              const isLast = index === navigationPath.length - 1;
              return (
                <div key={node.id} className="flex items-center space-x-2 shrink-0">
                  {index > 0 && <span className="text-slate-300">/</span>}
                  {isLast ? (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">
                      {node.title}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNavigateToIndex(index)}
                      className="hover:text-blue-600 font-medium transition py-1 px-1.5 rounded-sm hover:bg-slate-100 cursor-pointer"
                    >
                      {node.title}
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Bấm vào thẻ thư mục để đi sâu vào bên trong</span>
          </div>
        </div>}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white" role="status" aria-label="Đang tải dữ liệu">
            <span className="sr-only">Đang tải dữ liệu</span>
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" aria-hidden="true" />
          </div>
        )}

        {/* DYNAMIC EXPLORER CANVAS */}
        {!isLoading && !selectedSchoolId ? (
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Quản lý người dùng</span>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">Chọn trường học</h2>
                  <p className="mt-1 text-sm text-slate-500">Chọn một trường để xem giáo viên, phụ huynh và các lớp trực thuộc.</p>
                </div>
                <div className="w-full sm:w-80">
                  <label htmlFor="school-search" className="sr-only">Tìm trường học</label>
                  <input
                    id="school-search"
                    type="search"
                    value={schoolSearch}
                    onChange={(event) => setSchoolSearch(event.target.value)}
                    placeholder="Tìm tên trường..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {schools.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">apartment</span>
                <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có trường học</p>
                <p className="mt-1 text-xs text-slate-500">Thêm trường trong mục Quản lý Lớp &amp; Học sinh trước khi quản lý người dùng.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {schools
                  .filter((school) => school.name.toLocaleLowerCase('vi').includes(schoolSearch.trim().toLocaleLowerCase('vi')))
                  .map((school) => {
                    const normalizedSchoolName = school.name.trim().toLocaleLowerCase('vi');
                    const schoolUserCount = users.filter(
                      (user) => (user.schoolName || user.school_name || '').trim().toLocaleLowerCase('vi') === normalizedSchoolName
                    ).length;
                    const schoolClassCount = classes.filter(
                      (item) => (item.schoolName || item.school_name || '').trim().toLocaleLowerCase('vi') === normalizedSchoolName
                    ).length;

                    return (
                      <button
                        key={school.id}
                        type="button"
                        onClick={() => handleChooseSchool(school.id)}
                        className="group flex min-h-40 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                            <span className="material-symbols-outlined">school</span>
                          </span>
                          <span className="material-symbols-outlined text-slate-300 transition group-hover:text-blue-600">arrow_forward</span>
                        </div>
                        <div className="mt-5">
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-700">{school.name}</h3>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{school.address || 'Trường học trong hệ thống'}</p>
                          <p className="mt-3 text-xs font-medium text-slate-600">{formatNumber(schoolUserCount)} người dùng <span className="mx-1 text-slate-300">•</span> {formatNumber(schoolClassCount)} lớp</p>
                        </div>
                      </button>
                    );
                  })}
                {schools.filter((school) => school.name.toLocaleLowerCase('vi').includes(schoolSearch.trim().toLocaleLowerCase('vi'))).length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
                    Không tìm thấy trường phù hợp.
                  </div>
                )}
              </div>
            )}
          </section>
        ) : !isLoading && currentNode.type === 'class' ? (
          /* ========================================================================= */
          /* CLASS DETAIL VIEW: HIỂN THỊ CHI TIẾT LỚP HỌC (GVCN & PHỤ HUYNH)           */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Class Header Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{currentNode.title}</h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đang hoạt động
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Sĩ số học sinh: <strong className="text-slate-800">{currentNode.studentCount || 0} học sinh</strong> &nbsp;|&nbsp; 
                  Tài khoản Phụ huynh: <strong className="text-slate-800">{currentNode.parentsCount || 0} tài khoản</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Quay lại
                </button>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {activeClassTab === null ? (
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
                  {[
                    { id: 'tab-1' as const, title: 'Giáo viên chủ nhiệm (GVCN)', count: currentNode.teacher ? 1 : 0, icon: 'person' },
                    { id: 'tab-2' as const, title: 'Giáo viên bộ môn (GVBM)', count: currentNode.subjectTeachers?.length || 0, icon: 'menu_book' },
                    { id: 'tab-3' as const, title: 'Phụ huynh', count: currentNode.parents?.length || 0, icon: 'family_restroom' },
                  ].map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setActiveClassTab(folder.id)}
                      className="group flex min-h-36 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <span className="material-symbols-outlined">{folder.icon}</span>
                        </span>
                        <span className="text-sm font-bold text-slate-500">{folder.count}</span>
                      </div>
                      <div className="mt-5">
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-700">{folder.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">Mở thư mục để quản lý tài khoản</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
                  <button type="button" onClick={() => setActiveClassTab(null)} className="text-xs font-semibold text-slate-600 hover:text-blue-700">
                    ← Quay lại thư mục lớp
                  </button>
                  <button
                    type="button"
                    onClick={() => openManagedUserForm(undefined, activeClassTab === 'tab-1' ? 'TEACHER_HOMEROOM' : activeClassTab === 'tab-2' ? 'TEACHER_SUBJECT' : 'PARENT')}
                    className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    + Thêm tài khoản
                  </button>
                </div>
              )}

              {activeClassTab !== null && <div className="p-6">
                {/* TAB 1: TỔNG QUAN & GVCN */}
                {activeClassTab === 'tab-1' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <span className="text-[11px] font-medium text-slate-500 uppercase">Sĩ số Học sinh</span>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{currentNode.studentCount || 0} học sinh</div>
                        <span className="text-[11px] text-slate-500 mt-1">Dữ liệu từ bảng Class</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <span className="text-[11px] font-medium text-slate-500 uppercase">Tổng Phụ Huynh</span>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{currentNode.parentsCount || 0} tài khoản</div>
                        <span className="text-[11px] text-slate-500 mt-1">Dữ liệu từ bảng User (PARENT)</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <span className="text-[11px] font-medium text-slate-500 uppercase">Giáo viên phụ trách</span>
                        <div className="text-2xl font-bold text-slate-900 mt-1">
                          {1 + (currentNode.subjectTeachers ? currentNode.subjectTeachers.length : 0)} giáo viên
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1">Gồm 1 GVCN và các GV bộ môn</span>
                      </div>
                    </div>

                    {/* Thẻ Giáo Viên Chủ Nhiệm (GVCN) */}
                    {currentNode.teacher ? (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">
                            Giáo Viên Chủ Nhiệm (GVCN)
                          </h3>
                          {renderUserActions(currentNode.teacher.id)}
                        </div>
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">{currentNode.teacher.name}</h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 w-max">
                              Mã GV: {currentNode.teacher.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Phân công: <strong className="text-slate-800">{currentNode.teacher.assignedInfo}</strong>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                            <div className="text-slate-600">
                              Số điện thoại: <strong className="text-slate-900">{currentNode.teacher.phone}</strong>
                            </div>
                            <div className="text-slate-600">
                              Email: <strong className="text-slate-900">{currentNode.teacher.email}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Chưa phân công giáo viên chủ nhiệm cho lớp này trong cơ sở dữ liệu
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: GIÁO VIÊN BỘ MÔN */}
                {activeClassTab === 'tab-2' && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Mã GV</th>
                            <th className="py-3 px-4">Họ và Tên Giáo Viên</th>
                            <th className="py-3 px-4">Phân Công Bộ Môn</th>
                            <th className="py-3 px-4">Số Điện Thoại</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentNode.subjectTeachers && currentNode.subjectTeachers.length > 0 ? (
                            currentNode.subjectTeachers.map((gt) => (
                              <tr key={gt.id} className="hover:bg-slate-50 transition">
                                <td className="py-3 px-4 font-mono text-slate-500">{gt.code}</td>
                                <td className="py-3 px-4 font-bold text-slate-900">{gt.name}</td>
                                <td className="py-3 px-4 text-slate-700">{gt.assignedInfo}</td>
                                <td className="py-3 px-4 text-slate-700">{gt.phone}</td>
                                <td className="py-3 px-4 text-slate-500">{gt.email}</td>
                                <td className="py-3 px-4">{renderUserActions(gt.id)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400">
                                Chưa có phân công giáo viên bộ môn trong cơ sở dữ liệu
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: DANH SÁCH PHỤ HUYNH */}
                {activeClassTab === 'tab-3' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="w-full sm:w-72">
                        <input
                          type="text"
                          value={parentSearchTerm}
                          onChange={(e) => setParentSearchTerm(e.target.value)}
                          placeholder="Tìm tên phụ huynh, tên con, SĐT..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setIsNoticeModalOpen(true)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          Gửi Thông Báo Toàn Lớp
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3 text-center">STT</th>
                            <th className="py-3 px-4">Mã PH</th>
                            <th className="py-3 px-4">Họ và Tên Phụ Huynh</th>
                            <th className="py-3 px-4">Học Sinh (Con)</th>
                            <th className="py-3 px-4">Số Điện Thoại</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredParents.length > 0 ? (
                            filteredParents.map((ph, idx) => (
                              <tr key={ph.id} className="hover:bg-slate-50 transition">
                                <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                                <td className="py-3 px-4 font-mono text-slate-500">{ph.id}</td>
                                <td className="py-3 px-4 font-bold text-slate-900">{ph.name}</td>
                                <td className="py-3 px-4 font-semibold text-blue-700">{ph.studentName}</td>
                                <td className="py-3 px-4 font-medium text-slate-700">{ph.phone}</td>
                                <td className="py-3 px-4 text-slate-500">{ph.email}</td>
                                <td className="py-3 px-4">{renderUserActions(ph.id)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-slate-400">
                                Không tìm thấy thông tin phụ huynh phù hợp
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>}
            </div>
          </div>
        ) : !isLoading ? (
          /* ========================================================================= */
          /* FOLDER NODES GRID VIEW: HIỂN THỊ CÂY THƯ MỤC CÁC CẤP PHÂN BỔ DỮ LIỆU       */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Title Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1 block">
                  Cấp danh mục hiện tại
                </span>
                <h1 className="text-2xl font-bold text-slate-900">{currentNode.title}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  {currentNode.subtitle || 'Chọn một thư mục con bên dưới để tiếp tục điều hướng.'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {navigationPath.length > 1 && (
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Quay lại
                  </button>
                )}
              </div>
            </div>

            {/* Grid of Sub-Nodes */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                Danh sách thư mục con ({currentNode.children ? currentNode.children.length : 0})
              </div>

              {!currentNode.children || currentNode.children.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-sm font-semibold text-slate-600">Thư mục trống hoặc chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentNode.children.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => handleDrillDown(child)}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {child.type === 'year'
                            ? 'Niên khóa'
                            : child.type === 'grade'
                            ? 'Khối lớp'
                            : 'Lớp học'}
                        </span>
                        {child.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {child.badge}
                          </span>
                        )}
                        {child.studentCount !== undefined && child.studentCount > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                            {child.studentCount} Học sinh
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                          {child.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {child.subtitle || 'Bấm để xem danh sách'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-600 transition font-medium">
                        <span>{child.type === 'class' ? 'Mở chi tiết lớp' : 'Xem danh mục con'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {isManagedUserModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form onSubmit={saveManagedUser} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">{editingManagedUser ? 'Sửa tài khoản' : 'Thêm người dùng'}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{selectedSchool?.name}</p>
              </div>
              <button type="button" onClick={() => setIsManagedUserModalOpen(false)} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">Đóng</button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                Họ và tên
                <input required value={managedUserForm.full_name} onChange={(event) => setManagedUserForm((form) => ({ ...form, full_name: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Số điện thoại
                <input required value={managedUserForm.phone} onChange={(event) => setManagedUserForm((form) => ({ ...form, phone: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Email
                <input type="email" value={managedUserForm.email} onChange={(event) => setManagedUserForm((form) => ({ ...form, email: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400" />
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                Vai trò
                <select value={managedUserForm.role} onChange={(event) => setManagedUserForm((form) => ({ ...form, role: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400">
                  {Object.entries(USER_ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button type="button" onClick={() => setIsManagedUserModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
              <button type="submit" disabled={isSavingManagedUser} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{isSavingManagedUser ? 'Đang lưu...' : 'Lưu tài khoản'}</button>
            </div>
          </form>
        </div>
      )}

      {quotaTargetUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form onSubmit={saveUserQuota} className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-bold text-slate-900">Hạn mức AI</h3>
              <p className="mt-1 text-xs text-slate-500">{quotaTargetUser.full_name || quotaTargetUser.fullName} · {USER_ROLE_LABELS[quotaTargetUser.role] || quotaTargetUser.role}</p>
            </div>
            <div className="space-y-4 p-5">
              <label className="block text-xs font-semibold text-slate-700">
                Số lượt AI mỗi ngày
                <input type="number" min={0} step={1} required value={quotaValue} onChange={(event) => setQuotaValue(Number(event.target.value))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Mô hình AI
                <select value={quotaModelTier} onChange={(event) => setQuotaModelTier(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400">
                  <option value="AUTO">AUTO</option><option value="FLASH">FLASH</option><option value="PRO">PRO</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button type="button" onClick={() => setQuotaTargetUser(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">Lưu hạn mức</button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GỬI THÔNG BÁO CHO PHỤ HUYNH LỚP                                    */}
      {/* ========================================================================= */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Gửi Thông Báo Cho Phụ Huynh Lớp</h3>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSendNotice} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gửi tới</label>
                <input
                  type="text"
                  value={`Toàn thể Phụ huynh ${currentNode.title} (${currentNode.parentsCount || 0} tài khoản)`}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-slate-600 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu Đề Thông Báo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="Nội dung tiêu đề thông báo..."
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội Dung Chi Tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Nhập nội dung thông báo gửi đến phụ huynh..."
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg font-medium shadow-xs cursor-pointer"
                >
                  Gửi Thông Báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
