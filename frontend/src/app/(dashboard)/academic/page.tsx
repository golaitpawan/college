'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, coursesApi, subjectsApi, classroomsApi, sectionsApi, sessionsApi } from '@/lib/api';
import Header from '@/components/layout/Header';
import { Plus, ChevronRight } from 'lucide-react';

type Tab = 'departments' | 'courses' | 'subjects' | 'classrooms' | 'sections' | 'sessions';

const TABS: { id: Tab; label: string }[] = [
  { id: 'departments', label: 'Departments' },
  { id: 'courses', label: 'Courses' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'classrooms', label: 'Classrooms' },
  { id: 'sections', label: 'Sections' },
  { id: 'sessions', label: 'Sessions' },
];

export default function AcademicPage() {
  const [tab, setTab] = useState<Tab>('departments');
  const qc = useQueryClient();

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: async () => (await departmentsApi.list()).data.data });
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => (await coursesApi.list()).data.data });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: async () => (await subjectsApi.list()).data.data });
  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: async () => (await classroomsApi.list()).data.data });
  const { data: sections } = useQuery({ queryKey: ['sections'], queryFn: async () => (await sectionsApi.list()).data.data });
  const { data: sessions } = useQuery({ queryKey: ['sessions'], queryFn: async () => (await sessionsApi.list()).data.data });

  const dataMap: Record<Tab, any[]> = {
    departments: departments as any[] ?? [],
    courses: courses as any[] ?? [],
    subjects: subjects as any[] ?? [],
    classrooms: classrooms as any[] ?? [],
    sections: sections as any[] ?? [],
    sessions: sessions as any[] ?? [],
  };

  const renderRow = (item: any): string => {
    if (tab === 'departments') return `${item.name} (${item.code}) — ${item.college?.name ?? ''}`;
    if (tab === 'courses') return `${item.name} (${item.code}) — ${item.department?.name ?? ''}`;
    if (tab === 'subjects') return `${item.name} (${item.code}) — Sem ${item.semester} · ${item.type}`;
    if (tab === 'classrooms') return `${item.name} — ${item.type} · capacity ${item.capacity}`;
    if (tab === 'sections') return `${item.course?.name ?? ''} › ${item.name} (Sem ${item.semester})`;
    if (tab === 'sessions') return `${item.name} (${item.isActive ? 'Active' : 'Inactive'})`;
    return JSON.stringify(item);
  };

  const items = dataMap[tab];

  return (
    <div>
      <Header title="Academic Setup" />
      <div className="p-8 space-y-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
                tab === id ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold capitalize">{tab} ({items.length})</h3>
          </div>
          {!items.length ? (
            <p className="text-gray-400 text-sm">No {tab} found. Seed the database to get started.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                  <span className="text-gray-700">{renderRow(item)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
