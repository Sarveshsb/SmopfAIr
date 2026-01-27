import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function MetricCard({ label, value, icon, color, description }: MetricCardProps) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300 group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium group-hover:text-opacity-100 transition">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-opacity-30 group-hover:opacity-50 transition p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <p className="text-white text-opacity-70 text-sm mt-3">{description}</p>
    </div>
  );
}