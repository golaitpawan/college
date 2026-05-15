'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { subjectsApi, usersApi, classroomsApi } from '@/lib/api';
import { useTimetable, useAddEntry, useRemoveEntry, useTimetableAction } from '@/hooks/useTimetable';
import { useAuth } from '@/hooks/useAuth';
import { canManageTimetable } from '@/lib/auth';
import Header from '@/components/layout/Header';
import TimetableGrid from '@/components/timetable/TimetableGrid';
import { CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canManage = canManageTimetable(user);

  const { data: version, isLoading } = useTimetable(id);
  const addEntry = useAddEntry(id);
  const removeEntry = useRemoveEntry(id);
  const actions = useTimetableAction(id);

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryForm, setEntryForm] = useState({
    subjectId: '', teacherId: '', classroomId: '',
    dayOfWeek: 1, startTime: '09:00', endTime: '10:00',
  });
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [comment, setComment] = useState('');

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await subjectsApi.list()).data.data,
  });
  const { data: teachers } = useQuery({
    queryKey: ['users', 'TEACHER'],
    queryFn: async () => (await usersApi.list({ role: 'TEACHER' })).data.data,
  });
  const { data: classrooms } = useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => (await classroomsApi.list()).data.data,
  });

  if (isLoading) return <div className="p-8 text-gray-400">Loading…</div>;
  if (!version) return <div className="p-8 text-red-500">Timetable not found</div>;

  const v = version as any;
  const editable = ['DRAFT', 'CHANGES_REQUESTED'].includes(v.status) && canManage;

  const handleValidate = async () => {
    const res = await actions.validate.mutateAsync();
    setConflicts(res.data.data ?? []);
  };

  const handleAddEntry = () => {
    addEntry.mutate(entryForm, {
      onSuccess: () => {
        setShowEntryForm(false);
        setEntryForm({ subjectId: '', teacherId: '', classroomId: '', dayOfWeek: 1, startTime: '09:00', endTime: '10:00' });
      },
    });
  };

  return (
    <div>
      <Header title={`Timetable — ${v.section?.name}`} />
      <div className="p-8 space-y-6">
        {/* Meta */}
        <div className="card flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold">{v.section?.name}</h2>
              <span className={`badge ${STATUS_COLORS[v.status]}`}>{v.status}</span>
            </div>
            <p className="text-sm text-gray-500">{v.department?.name} · {v.academicSession?.name} · Version {v.versionNumber}</p>
            <p className="text-xs text-gray-400 mt-1">Created by {v.createdBy?.fullName}</p>
          </div>

          {canManage && (
            <div className="flex flex-wrap gap-2">
              {editable && (
                <>
                  <button onClick={handleValidate} className="btn-secondary text-xs">
                    Validate Conflicts
                  </button>
                  <button
                    onClick={() => actions.submit.mutate()}
                    disabled={actions.submit.isPending}
                    className="btn-primary text-xs"
                  >
                    Submit for Review
                  </button>
                </>
              )}
              {v.status === 'SUBMITTED' && (
                <>
                  <button
                    onClick={() => actions.approve.mutate(comment || undefined)}
                    disabled={actions.approve.isPending}
                    className="btn-primary text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <div className="flex gap-2">
                    <input
                      className="input text-xs py-1 px-2 w-40"
                      placeholder="Change request comment…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                      onClick={() => actions.requestChanges.mutate(comment)}
                      disabled={!comment || actions.requestChanges.isPending}
                      className="btn-secondary text-xs"
                    >
                      Request Changes
                    </button>
                  </div>
                </>
              )}
              {v.status === 'APPROVED' && (
                <button
                  onClick={() => actions.publish.mutate()}
                  disabled={actions.publish.isPending}
                  className="btn-primary text-xs"
                >
                  Publish Timetable
                </button>
              )}
            </div>
          )}
        </div>

        {/* Conflict results */}
        {conflicts.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
            <p className="font-semibold text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {conflicts.length} conflict(s) detected
            </p>
            {conflicts.map((c, i) => (
              <p key={i} className="text-xs text-red-600">• [{c.type}] {c.message}</p>
            ))}
          </div>
        )}
        {actions.validate.isSuccess && conflicts.length === 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> No conflicts found
          </div>
        )}

        {/* Grid */}
        <div className="card">
          <TimetableGrid
            entries={v.entries}
            readonly={!editable}
            onRemove={editable ? (entryId) => removeEntry.mutate(entryId) : undefined}
          />
        </div>

        {/* Add entry form */}
        {editable && (
          <div className="card">
            <button
              onClick={() => setShowEntryForm((s) => !s)}
              className="flex items-center gap-2 font-medium text-sm text-primary-600"
            >
              {showEntryForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Add Class Entry
            </button>

            {showEntryForm && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                  <select
                    className="input text-sm"
                    value={entryForm.subjectId}
                    onChange={(e) => setEntryForm((f) => ({ ...f, subjectId: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {(subjects as any[])?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
                  <select
                    className="input text-sm"
                    value={entryForm.teacherId}
                    onChange={(e) => setEntryForm((f) => ({ ...f, teacherId: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {(teachers as any[])?.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Classroom</label>
                  <select
                    className="input text-sm"
                    value={entryForm.classroomId}
                    onChange={(e) => setEntryForm((f) => ({ ...f, classroomId: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {(classrooms as any[])?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                  <select
                    className="input text-sm"
                    value={entryForm.dayOfWeek}
                    onChange={(e) => setEntryForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                  >
                    {[1,2,3,4,5,6].map((d) => (
                      <option key={d} value={d}>{DAYS[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    className="input text-sm"
                    value={entryForm.startTime}
                    onChange={(e) => setEntryForm((f) => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                  <input
                    type="time"
                    className="input text-sm"
                    value={entryForm.endTime}
                    onChange={(e) => setEntryForm((f) => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  <button
                    onClick={handleAddEntry}
                    disabled={!entryForm.subjectId || !entryForm.teacherId || !entryForm.classroomId || addEntry.isPending}
                    className="btn-primary text-sm"
                  >
                    {addEntry.isPending ? 'Adding…' : 'Add Entry'}
                  </button>
                  <button onClick={() => setShowEntryForm(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
                {addEntry.error && (
                  <p className="col-span-2 text-red-600 text-xs">
                    {(addEntry.error as any)?.response?.data?.error?.message || 'Failed to add entry'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Approval history */}
        {v.approvals?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Approval History
            </h3>
            <div className="space-y-3">
              {v.approvals.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <span className={`badge mt-0.5 ${STATUS_COLORS[a.action]}`}>{a.action}</span>
                  <div>
                    <p className="text-gray-700">{a.actor?.fullName}</p>
                    {a.comment && <p className="text-gray-500 text-xs">{a.comment}</p>}
                    <p className="text-gray-400 text-xs">{new Date(a.actedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
