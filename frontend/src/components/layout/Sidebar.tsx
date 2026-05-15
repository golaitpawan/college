'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LayoutDashboard, Calendar, BookOpen, Users, Bell, LogOut, GraduationCap } from 'lucide-react';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { canManageTimetable, isAdmin } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', always: true },
  { href: '/timetable', icon: Calendar, label: 'Timetable', always: true },
  { href: '/academic', icon: BookOpen, label: 'Academic Setup', adminOnly: true },
  { href: '/users', icon: Users, label: 'Users', adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <aside className="flex flex-col w-64 bg-primary-900 text-white min-h-screen">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-700">
        <GraduationCap className="w-7 h-7 text-primary-200" />
        <span className="font-bold text-lg">College App</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label, adminOnly }) => {
          if (adminOnly && !isAdmin(user) && !canManageTimetable(user)) return null;
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white',
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-primary-700">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
          <p className="text-xs text-primary-300 truncate">{user?.email}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {user?.roles.map((r) => (
              <span key={r} className="badge bg-primary-700 text-primary-100 text-[10px]">{r}</span>
            ))}
          </div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-primary-200 hover:bg-primary-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
