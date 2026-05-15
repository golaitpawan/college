'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { departmentsApi, sessionsApi, sectionsApi, timetableApi } from '@/lib/api';
import Header from '@/components/layout/Header';
import { ArrowRight } from 'lucide-react';

export default function TimetableBuilderPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await departmentsApi.list()).data.data,
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => (await sessionsApi.list()).data.data,
  });

  const selectedDept = watch('departmentId');
  const selectedSession = watch('academicSessionId');

  const { data: sections } = useQuery({
    queryKey: ['sections', selectedSession],
    queryFn: async () => (await sectionsApi.list(undefined, selectedSession)).data.data,
    enabled: !!selectedSession,
  });

  const create = useMutation({
    mutationFn: (data: any) => timetableApi.create(data),
    onSuccess: (res) => router.push(`/timetable/${res.data.data.id}`),
  });

  return (
    <div>
      <Header title="New Timetable" />
      <div className="p-8 max-w-lg">
        <div className="card">
          <h2 className="text-base font-semibold mb-6">Create timetable draft</h2>
          <form onSubmit={handleSubmit((data) => create.mutate(data))} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select {...register('departmentId', { required: true })} className="input">
                <option value="">Select department…</option>
                {(departments as any[])?.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.departmentId && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
              <select {...register('academicSessionId', { required: true })} className="input">
                <option value="">Select session…</option>
                {(sessions as any[])?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.academicSessionId && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select {...register('sectionId', { required: true })} className="input" disabled={!selectedSession}>
                <option value="">Select section…</option>
                {(sections as any[])?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.course?.name} — {s.name} (Sem {s.semester})</option>
                ))}
              </select>
              {errors.sectionId && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>

            {create.error && (
              <p className="text-red-600 text-sm bg-red-50 rounded px-3 py-2">
                Failed to create timetable
              </p>
            )}

            <button type="submit" disabled={create.isPending} className="btn-primary">
              {create.isPending ? 'Creating…' : <>Create Draft <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
