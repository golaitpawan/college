'use client';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import Header from '@/components/layout/Header';
import { User, Shield } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  COLLEGE_ADMIN: 'bg-orange-100 text-orange-700',
  DEPT_HEAD: 'bg-purple-100 text-purple-700',
  COORDINATOR: 'bg-blue-100 text-blue-700',
  TEACHER: 'bg-green-100 text-green-700',
  STUDENT: 'bg-gray-100 text-gray-700',
  MODERATOR: 'bg-yellow-100 text-yellow-700',
};

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await usersApi.list()).data.data,
  });

  return (
    <div>
      <Header title="Users" />
      <div className="p-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold">All Users ({(users as any[])?.length ?? 0})</h2>
          </div>

          {isLoading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {(users as any[])?.map((u: any) => (
                <div key={u.id} className="py-4 flex items-center gap-4">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {u.userRoles.map((ur: any) => (
                      <span key={ur.id} className={`badge text-[11px] ${ROLE_COLORS[ur.role.name] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ur.role.name}
                        {ur.department && ` · ${ur.department.code}`}
                      </span>
                    ))}
                  </div>
                  <span className={`badge text-xs ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
