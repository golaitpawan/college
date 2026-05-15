'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import Header from '@/components/layout/Header';
import { Bell, CheckCheck } from 'lucide-react';
import clsx from 'clsx';

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await notificationsApi.list()).data.data,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const items = (notifications as any[]) ?? [];
  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div>
      <Header title="Notifications" />
      <div className="p-8 max-w-2xl space-y-4">
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => markAllRead.mutate()}
              className="btn-secondary text-sm"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          </div>
        )}

        <div className="card divide-y divide-gray-100">
          {isLoading ? (
            <p className="text-gray-400 text-sm py-4">Loading…</p>
          ) : !items.length ? (
            <div className="py-8 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No notifications yet.</p>
            </div>
          ) : (
            items.map((n: any) => (
              <div
                key={n.id}
                onClick={() => !n.readAt && markRead.mutate(n.id)}
                className={clsx(
                  'py-4 px-2 flex items-start gap-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors',
                  !n.readAt && 'bg-primary-50',
                )}
              >
                <div className={clsx('w-2 h-2 rounded-full mt-2 shrink-0', !n.readAt ? 'bg-primary-500' : 'bg-transparent')} />
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-medium', !n.readAt ? 'text-gray-900' : 'text-gray-600')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
