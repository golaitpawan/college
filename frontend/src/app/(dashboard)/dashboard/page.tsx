'use client';
import { useAuth } from '@/hooks/useAuth';
import { useTimetables, useStudentTimetable, useTeacherTimetable } from '@/hooks/useTimetable';
import { isAdmin, isStudent, isTeacher, canManageTimetable } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-200 text-gray-500',
};

function DayName({ day }: { day: number }) {
  const names = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return <>{names[day] || day}</>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const adminView = canManageTimetable(user);

  const { data: timetables } = useTimetables(
    adminView ? { status: 'SUBMITTED' } : undefined,
  );
  const { data: studentTimetable } = useStudentTimetable();
  const { data: teacherEntries } = useTeacherTimetable();

  const todayDay = new Date().getDay() || 7;

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-8 space-y-6">
        {/* Welcome */}
        <div className="card">
          <h2 className="text-lg font-semibold">Welcome back, {user?.fullName} 👋</h2>
          <p className="text-gray-500 text-sm mt-1">
            {user?.roles.join(', ')} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Admin: pending approvals */}
        {adminView && (
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Pending Approvals ({(timetables as any[])?.length ?? 0})
            </h3>
            {!(timetables as any[])?.length ? (
              <div className="card text-gray-400 text-sm">No timetables awaiting approval.</div>
            ) : (
              <div className="space-y-2">
                {(timetables as any[]).map((t: any) => (
                  <Link key={t.id} href={`/timetable/${t.id}`}
                    className="card flex items-center justify-between hover:border-primary-300 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{t.section?.name} — {t.department?.name}</p>
                      <p className="text-xs text-gray-500">{t.academicSession?.name} · v{t.versionNumber}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student: today's classes */}
        {isStudent(user) && studentTimetable && (
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              Today's Classes
            </h3>
            {(() => {
              const today = (studentTimetable as any).entries?.filter((e: any) => e.dayOfWeek === todayDay) ?? [];
              return !today.length ? (
                <div className="card text-gray-400 text-sm">No classes today.</div>
              ) : (
                <div className="space-y-2">
                  {today.map((e: any) => (
                    <div key={e.id} className="card flex items-center gap-4">
                      <div className="text-center w-20">
                        <p className="font-mono text-sm font-semibold text-primary-600">{e.startTime}</p>
                        <p className="text-xs text-gray-400">{e.endTime}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{e.subject.name}</p>
                        <p className="text-xs text-gray-500">{e.teacher.fullName} · {e.classroom.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Teacher: today's classes */}
        {isTeacher(user) && teacherEntries && (
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              Today's Classes
            </h3>
            {(() => {
              const today = (teacherEntries as any[]).filter((e: any) => e.dayOfWeek === todayDay);
              return !today.length ? (
                <div className="card text-gray-400 text-sm">No classes today.</div>
              ) : (
                <div className="space-y-2">
                  {today.map((e: any) => (
                    <div key={e.id} className="card flex items-center gap-4">
                      <div className="text-center w-20">
                        <p className="font-mono text-sm font-semibold text-primary-600">{e.startTime}</p>
                        <p className="text-xs text-gray-400">{e.endTime}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{e.subject.name}</p>
                        <p className="text-xs text-gray-500">
                          {e.timetableVersion?.section?.name} · {e.classroom.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
