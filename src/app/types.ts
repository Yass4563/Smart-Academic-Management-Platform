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
}

export interface Module {
  id: number;
  name: string;
  code: string;
  branchId: number;
  branchName?: string | null;
}

export interface Teacher {
  teacherId: number;
  userId: number;
  fullName: string;
  email: string;
  branchId: number | null;
  isActive: number;
  title?: string | null;
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
