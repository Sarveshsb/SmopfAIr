import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function MetricCard({ label, value, icon, description }: MetricCardProps) {
  // We ignore the passed 'color' prop now to enforce the strict White/Yellow technical theme
  // or we can use it for subtle accents if needed, but the user requested "all ui/ux in white and yellow".

  return (
    <div className="relative overflow-hidden bg-white rounded-xl border-l-4 border-yellow-400 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="text-yellow-500 transform scale-150 rotate-12">{icon}</div>
      </div>

      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1 font-mono tracking-tight">{value}</p>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-600">
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 w-2/3"></div>
            {/* Note: The width above is a placeholder visual; for real data representation we'd need a percentage prop */}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
          {description}
        </p>
      </div>

      {/* Technical highlight line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400/50 to-yellow-400/0"></div>
    </div>
  );
}