'use client';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import Link from 'next/link';

export default function Header({ title }: { title: string }) {
  const { data } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const res = await notificationsApi.unreadCount();
      return res.data.data as number;
    },
    refetchInterval: 30_000,
  });

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/notifications" className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
          {!!data && data > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {data > 9 ? '9+' : data}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
