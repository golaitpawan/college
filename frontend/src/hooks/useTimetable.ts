'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi } from '@/lib/api';

export function useTimetables(params?: any) {
  return useQuery({
    queryKey: ['timetables', params],
    queryFn: async () => {
      const res = await timetableApi.list(params);
      return res.data.data;
    },
  });
}

export function useTimetable(id: string) {
  return useQuery({
    queryKey: ['timetable', id],
    queryFn: async () => {
      const res = await timetableApi.get(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useStudentTimetable() {
  return useQuery({
    queryKey: ['timetable', 'student'],
    queryFn: async () => {
      const res = await timetableApi.forStudent();
      return res.data.data;
    },
  });
}

export function useTeacherTimetable() {
  return useQuery({
    queryKey: ['timetable', 'teacher'],
    queryFn: async () => {
      const res = await timetableApi.forTeacher();
      return res.data.data;
    },
  });
}

export function useAddEntry(versionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => timetableApi.addEntry(versionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timetable', versionId] }),
  });
}

export function useRemoveEntry(versionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => timetableApi.removeEntry(versionId, entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timetable', versionId] }),
  });
}

export function useTimetableAction(versionId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['timetable', versionId] });
    qc.invalidateQueries({ queryKey: ['timetables'] });
  };

  const submit = useMutation({ mutationFn: () => timetableApi.submit(versionId), onSuccess: invalidate });
  const approve = useMutation({
    mutationFn: (comment?: string) => timetableApi.approve(versionId, comment),
    onSuccess: invalidate,
  });
  const requestChanges = useMutation({
    mutationFn: (comment: string) => timetableApi.requestChanges(versionId, comment),
    onSuccess: invalidate,
  });
  const publish = useMutation({ mutationFn: () => timetableApi.publish(versionId), onSuccess: invalidate });
  const validate = useMutation({ mutationFn: () => timetableApi.validate(versionId) });

  return { submit, approve, requestChanges, publish, validate };
}
