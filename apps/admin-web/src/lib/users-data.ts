export interface TeacherUser {
  id: string;
  code: string;
  full_name: string;
  phone: string;
  email: string;
  role: 'TEACHER_HOMEROOM' | 'TEACHER_SUBJECT';
  school_name: string;
  subject: string;
  assigned_class: string;
  is_active: boolean;
  status_reason?: string;
  created_at: string;
}

export interface LinkedStudent {
  student_code: string;
  full_name: string;
  class_name: string;
}

export interface ParentUser {
  id: string;
  code: string;
  full_name: string;
  phone: string;
  email: string;
  school_name: string;
  students: LinkedStudent[];
  is_active: boolean;
  status_reason?: string;
  created_at: string;
}

// Clean Slate: Empty initial lists (Zero mock data)
export const INITIAL_TEACHERS: TeacherUser[] = [];
export const INITIAL_PARENTS: ParentUser[] = [];
