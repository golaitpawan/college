export type RoleName =
  | 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'DEPT_HEAD'
  | 'COORDINATOR' | 'TEACHER' | 'STUDENT' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: RoleName[];
  phone?: string;
  avatarUrl?: string;
}

export interface Department {
  id: string; collegeId: string; name: string; code: string;
  headUserId?: string; head?: { id: string; fullName: string };
}

export interface Course {
  id: string; departmentId: string; name: string; code: string; durationYears: number;
}

export interface Subject {
  id: string; courseId: string; name: string; code: string;
  semester: number; credits: number; weeklyHours: number;
  type: 'THEORY' | 'PRACTICAL' | 'TUTORIAL' | 'SEMINAR' | 'LAB';
}

export interface Classroom {
  id: string; collegeId: string; name: string; capacity: number;
  type: 'CLASSROOM' | 'LAB' | 'SEMINAR_HALL' | 'AUDITORIUM';
}

export interface Section {
  id: string; courseId: string; academicSessionId: string; semester: number; name: string;
  course?: Course; academicSession?: AcademicSession;
}

export interface AcademicSession {
  id: string; collegeId: string; name: string;
  startDate: string; endDate: string; isActive: boolean;
}

export type TimetableStatus =
  | 'DRAFT' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface TimetableEntry {
  id: string; timetableVersionId: string;
  subjectId: string; subject: Subject;
  teacherId: string; teacher: { id: string; fullName: string };
  classroomId: string; classroom: Classroom;
  dayOfWeek: number; startTime: string; endTime: string;
  entryType: 'REGULAR' | 'EXTRA' | 'SUBSTITUTE' | 'CANCELLED';
}

export interface TimetableVersion {
  id: string; departmentId: string; academicSessionId: string; sectionId: string;
  versionNumber: number; status: TimetableStatus;
  createdById: string; publishedAt?: string;
  entries: TimetableEntry[];
  section?: Section; department?: Department; academicSession?: AcademicSession;
  approvals?: TimetableApproval[];
}

export interface TimetableApproval {
  id: string; action: TimetableStatus; comment?: string;
  actedAt: string; actor: { fullName: string };
}

export interface Notification {
  id: string; type: string; title: string; body: string;
  readAt?: string; createdAt: string; data?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T; error: any; meta: any;
}
