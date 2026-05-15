'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTimetables, useStudentTimetable, useTeacherTimetable } from '@/hooks/useTimetable';
import { canManageTimetable, isStudent, isTeacher } from '@/lib/auth';
import Header from '@/components/layout/Header';
import TimetableGrid from '@/components/timetable/TimetableGrid';
import { Plus } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

export default function TimetablePage() {
  const { user } = useAuth();
  const canManage = canManageTimetable(user);

  const { data: timetables, isLoading: loadingList } = useTimetables();
  const { data: studentTimetable, isLoading: loadingStudent } = useStudentTimetable();
  const { data: teacherEntries, isLoading: loadingTeacher } = useTeacherTimetable();

  if (isStudent(user)) {
    return (
      <div>
        <Header title="My Timetable" />
        <div className="p-8">
          {loadingStudent ? (
            <div className="card text-gray-400 text-sm">Loading timetable…</div>
          ) : !studentTimetable ? (
            <div className="card text-gray-400 text-sm">No published timetable for your section yet.</div>
          ) : (
            <TimetableGrid entries={(studentTimetable as any).entries} readonly />
          )}
        </div>
      </div>
    );
  }

  if (isTeacher(user)) {
    return (
      <div>
        <Header title="My Schedule" />
        <div className="p-8">
          {loadingTeacher ? (
            <div className="card text-gray-400 text-sm">Loading schedule…</div>
          ) : !teacherEntries || !(teacherEntries as any[]).length ? (
            <div className="card text-gray-400 text-sm">No published classes assigned to you.</div>
          ) : (
            <TimetableGrid entries={teacherEntries as any[]} readonly showSection />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Timetables" />
      <div className="p-8 space-y-4">
        {canManage && (
          <div className="flex justify-end">
            <Link href="/dashboard/timetable/builder" className="btn-primary">
              <Plus className="w-4 h-4" /> New Timetable
            </Link>
          </div>
        )}

        {loadingList ? (
          <div className="card text-gray-400 text-sm">Loading…</div>
        ) : !(timetables as any[])?.length ? (
          <div className="card text-gray-400 text-sm">No timetables found.</div>
        ) : (
          <div className="space-y-2">
            {(timetables as any[]).map((t: any) => (
              <Link key={t.id} href={`/dashboard/timetable/${t.id}`}
                className="card flex items-center justify-between hover:border-primary-300 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium">{t.section?.name} — {t.department?.name}</p>
                  <p className="text-sm text-gray-500">{t.academicSession?.name} · Version {t.versionNumber}</p>
                  <p className="text-xs text-gray-400">Created by {t.createdBy?.fullName}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
