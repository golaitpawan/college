'use client';
import clsx from 'clsx';
import { TimetableEntry } from '@/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NUMS = [1, 2, 3, 4, 5, 6];

const TYPE_COLORS: Record<string, string> = {
  THEORY: 'bg-blue-50 border-blue-200 text-blue-800',
  PRACTICAL: 'bg-green-50 border-green-200 text-green-800',
  LAB: 'bg-purple-50 border-purple-200 text-purple-800',
  TUTORIAL: 'bg-orange-50 border-orange-200 text-orange-800',
  SEMINAR: 'bg-pink-50 border-pink-200 text-pink-800',
};

interface Props {
  entries: TimetableEntry[];
  readonly?: boolean;
  showSection?: boolean;
  onRemove?: (entryId: string) => void;
}

export default function TimetableGrid({ entries, readonly, showSection, onRemove }: Props) {
  const grouped: Record<number, TimetableEntry[]> = {};
  for (const e of entries) {
    if (!grouped[e.dayOfWeek]) grouped[e.dayOfWeek] = [];
    grouped[e.dayOfWeek].push(e);
  }
  for (const day of DAY_NUMS) {
    grouped[day]?.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-6 gap-3 min-w-[700px]">
        {DAY_NUMS.map((day, i) => (
          <div key={day} className="space-y-2">
            <div className="text-center font-semibold text-sm text-gray-500 uppercase tracking-wide py-2
                            border-b border-gray-200">
              {DAYS[i]}
            </div>
            {grouped[day]?.length ? (
              grouped[day].map((entry) => {
                const subjectType = (entry as any).subject?.type ?? 'THEORY';
                return (
                  <div
                    key={entry.id}
                    className={clsx(
                      'rounded-lg border p-2.5 text-xs relative group',
                      TYPE_COLORS[subjectType] ?? TYPE_COLORS.THEORY,
                    )}
                  >
                    <p className="font-semibold truncate">{entry.subject.name}</p>
                    <p className="text-[11px] mt-0.5 opacity-80">
                      {entry.startTime} – {entry.endTime}
                    </p>
                    <p className="text-[11px] opacity-70 truncate">{entry.teacher?.fullName}</p>
                    <p className="text-[11px] opacity-70 truncate">{entry.classroom?.name}</p>
                    {showSection && (entry as any).timetableVersion?.section && (
                      <p className="text-[11px] opacity-70 truncate">
                        {(entry as any).timetableVersion.section.name}
                      </p>
                    )}
                    {!readonly && onRemove && (
                      <button
                        onClick={() => onRemove(entry.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100
                                   text-red-500 hover:text-red-700 text-xs font-bold leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center text-xs text-gray-300">
                Free
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
