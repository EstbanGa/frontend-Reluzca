import type { ReactNode } from "react";

export interface StatItem {
  label: string;
  value: string | number;
  color?: string;
  icon?: ReactNode;
}

interface ListStatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
}

const COL_CLASSES: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-6",
};

export default function ListStatsGrid({ stats, columns }: ListStatsGridProps) {
  const cols = columns ?? Math.min(stats.length, 4);
  return (
    <div className={`grid ${COL_CLASSES[cols] ?? COL_CLASSES[4]} gap-3`}>
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {stat.icon}
            <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: stat.color }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
