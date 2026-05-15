import { User, RoleName } from '@/types';

export function hasRole(user: User | null, ...roles: RoleName[]): boolean {
  if (!user) return false;
  return user.roles.some((r) => roles.includes(r));
}

export function isAdmin(user: User | null) {
  return hasRole(user, 'SUPER_ADMIN', 'COLLEGE_ADMIN');
}

export function canManageTimetable(user: User | null) {
  return hasRole(user, 'SUPER_ADMIN', 'COLLEGE_ADMIN', 'DEPT_HEAD', 'COORDINATOR');
}

export function isTeacher(user: User | null) {
  return hasRole(user, 'TEACHER');
}

export function isStudent(user: User | null) {
  return hasRole(user, 'STUDENT');
}
