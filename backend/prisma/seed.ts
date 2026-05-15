import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUserRole(userId: string, roleId: string, departmentId?: string) {
  const existing = await prisma.userRole.findFirst({
    where: { userId, roleId, departmentId: departmentId ?? null },
  });
  if (!existing) {
    await prisma.userRole.create({ data: { userId, roleId, departmentId } });
  }
}

async function main() {
  // Roles
  for (const name of Object.values(RoleName)) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Default college
  const college = await prisma.college.upsert({
    where: { id: 'default-college' },
    update: {},
    create: { id: 'default-college', name: 'Demo College', domain: 'demo.edu' },
  });

  // Super admin
  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.SUPER_ADMIN } });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.edu' },
    update: {},
    create: { email: 'admin@demo.edu', passwordHash: await bcrypt.hash('Admin@123', 10), fullName: 'Super Admin' },
  });
  await upsertUserRole(admin.id, adminRole!.id);

  // Department
  const dept = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: college.id, code: 'CSE' } },
    update: {},
    create: { collegeId: college.id, name: 'Computer Science & Engineering', code: 'CSE' },
  });

  // Dept head
  const deptHeadRole = await prisma.role.findUnique({ where: { name: RoleName.DEPT_HEAD } });
  const deptHead = await prisma.user.upsert({
    where: { email: 'head.cse@demo.edu' },
    update: {},
    create: { email: 'head.cse@demo.edu', passwordHash: await bcrypt.hash('Head@123', 10), fullName: 'Dr. Sarah Johnson' },
  });
  await upsertUserRole(deptHead.id, deptHeadRole!.id, dept.id);
  await prisma.department.update({ where: { id: dept.id }, data: { headUserId: deptHead.id } });

  // Teacher
  const teacherRole = await prisma.role.findUnique({ where: { name: RoleName.TEACHER } });
  const teacher = await prisma.user.upsert({
    where: { email: 'prof.smith@demo.edu' },
    update: {},
    create: { email: 'prof.smith@demo.edu', passwordHash: await bcrypt.hash('Teacher@123', 10), fullName: 'Prof. John Smith' },
  });
  await upsertUserRole(teacher.id, teacherRole!.id, dept.id);
  await prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    update: {},
    create: { userId: teacher.id, departmentId: dept.id, maxWeeklyHours: 20 },
  });

  // Academic session
  const session = await prisma.academicSession.create({
    data: { collegeId: college.id, name: '2024-25 Odd Semester', startDate: new Date('2024-07-01'), endDate: new Date('2024-11-30') },
  });

  // Course + subjects
  const course = await prisma.course.upsert({
    where: { departmentId_code: { departmentId: dept.id, code: 'BTECH-CS' } },
    update: {},
    create: { departmentId: dept.id, name: 'B.Tech Computer Science', code: 'BTECH-CS' },
  });

  const subjectData = [
    { code: 'CS301', name: 'Data Structures', semester: 3, credits: 4, weeklyHours: 4 },
    { code: 'CS302', name: 'Algorithms', semester: 3, credits: 3, weeklyHours: 3 },
    { code: 'CS303', name: 'Database Systems', semester: 3, credits: 3, weeklyHours: 3 },
    { code: 'CS304', name: 'OS Lab', semester: 3, credits: 2, weeklyHours: 4, type: 'LAB' as const },
  ];
  for (const s of subjectData) {
    await prisma.subject.upsert({
      where: { courseId_code: { courseId: course.id, code: s.code } },
      update: {},
      create: { courseId: course.id, ...s },
    });
  }

  // Section
  const section = await prisma.section.create({
    data: { courseId: course.id, academicSessionId: session.id, semester: 3, name: 'Section A' },
  });

  // Classrooms
  for (const c of [
    { name: 'Room 101', capacity: 60, type: 'CLASSROOM' as const },
    { name: 'Room 102', capacity: 60, type: 'CLASSROOM' as const },
    { name: 'CS Lab 1', capacity: 30, type: 'LAB' as const },
  ]) {
    await prisma.classroom.create({ data: { collegeId: college.id, ...c } });
  }

  // Student
  const studentRole = await prisma.role.findUnique({ where: { name: RoleName.STUDENT } });
  const student = await prisma.user.upsert({
    where: { email: 'alice@demo.edu' },
    update: {},
    create: { email: 'alice@demo.edu', passwordHash: await bcrypt.hash('Student@123', 10), fullName: 'Alice Brown' },
  });
  await upsertUserRole(student.id, studentRole!.id);
  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id, sectionId: section.id, rollNumber: 'CS21001' },
  });

  console.log('Seed complete. Demo accounts:');
  console.log('  admin@demo.edu      / Admin@123    (Super Admin)');
  console.log('  head.cse@demo.edu   / Head@123     (Dept Head)');
  console.log('  prof.smith@demo.edu / Teacher@123  (Teacher)');
  console.log('  alice@demo.edu      / Student@123  (Student)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
