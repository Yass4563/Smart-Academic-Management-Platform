export interface User {
  id: number;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  fullName?: string;
  branchId?: number | null;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  student_count?: number;
  module_count?: number;
}

export interface Module {
  id: number;
  name: string;
  code: string;
  branchId: number;
  branchName?: string | null;
  studentCount?: number | null;
  teacherName?: string | null;
}

export interface Teacher {
  teacherId: number;
  userId: number;
  fullName: string;
  email: string;
  branchId: number | null;
  isActive: number;
  title?: string | null;
  modules?: string[];
}

export interface Student {
  studentId: number;
  userId: number;
  fullName: string;
  email: string;
  branchId: number | null;
  isActive: number;
  studentNumber?: string | null;
}
