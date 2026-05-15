import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create all roles
  const roles = Object.values(RoleName);
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create default college
  const college = await prisma.college.upsert({
    where: { id: 'default-college' },
    update: {},
    create: { id: 'default-college', name: 'Demo College', domain: 'demo.edu' },
  });

  // Create super admin
  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.SUPER_ADMIN } });
  const hash = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.edu' },
    update: {},
    create: {
      email: 'admin@demo.edu',
      passwordHash: hash,
      fullName: 'Super Admin',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId_departmentId: { userId: admin.id, roleId: adminRole!.id, departmentId: null } },
    update: {},
    create: { userId: admin.id, roleId: adminRole!.id },
  });

  // Create a department
  const dept = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: college.id, code: 'CSE' } },
    update: {},
    create: { collegeId: college.id, name: 'Computer Science & Engineering', code: 'CSE' },
  });

  // Create a department head
  const deptHeadRole = await prisma.role.findUnique({ where: { name: RoleName.DEPT_HEAD } });
  const deptHeadHash = await bcrypt.hash('Head@123', 10);
  const deptHead = await prisma.user.upsert({
    where: { email: 'head.cse@demo.edu' },
    update: {},
    create: { email: 'head.cse@demo.edu', passwordHash: deptHeadHash, fullName: 'Dr. Sarah Johnson' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId_departmentId: { userId: deptHead.id, roleId: deptHeadRole!.id, departmentId: dept.id } },
    update: {},
    create: { userId: deptHead.id, roleId: deptHeadRole!.id, departmentId: dept.id },
  });
  await prisma.department.update({ where: { id: dept.id }, data: { headUserId: deptHead.id } });

  // Create a teacher
  const teacherRole = await prisma.role.findUnique({ where: { name: RoleName.TEACHER } });
  const teacherHash = await bcrypt.hash('Teacher@123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'prof.smith@demo.edu' },
    update: {},
    create: { email: 'prof.smith@demo.edu', passwordHash: teacherHash, fullName: 'Prof. John Smith' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId_departmentId: { userId: teacher.id, roleId: teacherRole!.id, departmentId: dept.id } },
    update: {},
    create: { userId: teacher.id, roleId: teacherRole!.id, departmentId: dept.id },
  });
  await prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    update: {},
    create: { userId: teacher.id, departmentId: dept.id, maxWeeklyHours: 20 },
  });

  // Create academic session
  const session = await prisma.academicSession.create({
    data: {
      collegeId: college.id,
      name: '2024-25 Odd Semester',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-11-30'),
    },
  });

  // Create course and subjects
  const course = await prisma.course.upsert({
    where: { departmentId_code: { departmentId: dept.id, code: 'BTECH-CS' } },
    update: {},
    create: { departmentId: dept.id, name: 'B.Tech Computer Science', code: 'BTECH-CS' },
  });

  const subjects = [
    { code: 'CS301', name: 'Data Structures', semester: 3, credits: 4, weeklyHours: 4 },
    { code: 'CS302', name: 'Algorithms', semester: 3, credits: 3, weeklyHours: 3 },
    { code: 'CS303', name: 'Database Systems', semester: 3, credits: 3, weeklyHours: 3 },
    { code: 'CS304', name: 'OS Lab', semester: 3, credits: 2, weeklyHours: 4, type: 'LAB' as const },
  ];
  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { courseId_code: { courseId: course.id, code: s.code } },
      update: {},
      create: { courseId: course.id, ...s },
    });
  }

  // Create section
  const section = await prisma.section.create({
    data: { courseId: course.id, academicSessionId: session.id, semester: 3, name: 'Section A' },
  });

  // Create classrooms
  const classrooms = [
    { name: 'Room 101', capacity: 60, type: 'CLASSROOM' as const },
    { name: 'Room 102', capacity: 60, type: 'CLASSROOM' as const },
    { name: 'CS Lab 1', capacity: 30, type: 'LAB' as const },
  ];
  for (const c of classrooms) {
    await prisma.classroom.create({ data: { collegeId: college.id, ...c } });
  }

  // Create a student
  const studentRole = await prisma.role.findUnique({ where: { name: RoleName.STUDENT } });
  const studentHash = await bcrypt.hash('Student@123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'alice@demo.edu' },
    update: {},
    create: { email: 'alice@demo.edu', passwordHash: studentHash, fullName: 'Alice Brown' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId_departmentId: { userId: student.id, roleId: studentRole!.id, departmentId: null } },
    update: {},
    create: { userId: student.id, roleId: studentRole!.id },
  });
  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id, sectionId: section.id, rollNumber: 'CS21001' },
  });

  console.log('Seed complete. Demo accounts:');
  console.log('  admin@demo.edu    / Admin@123    (Super Admin)');
  console.log('  head.cse@demo.edu / Head@123     (Dept Head)');
  console.log('  prof.smith@demo.edu / Teacher@123 (Teacher)');
  console.log('  alice@demo.edu    / Student@123  (Student)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
