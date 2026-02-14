import React from 'react';
import { ArrowRight, TrendingUp, Clock } from 'lucide-react';

// --- Types ---
interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    color: 'emerald' | 'blue' | 'violet' | 'orange';
}

interface QuickActionProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: 'emerald' | 'blue' | 'violet' | 'orange';
    description: string;
}

interface ActivityItemProps {
    title: string;
    subtitle: string;
    amount: string;
    time: string;
    icon: React.ReactNode;
    color: 'emerald' | 'blue' | 'violet' | 'orange';
}

interface WelcomeHeroProps {
    shopName: string;
    ownerName?: string;
}

// --- Style Maps ---
// Fix for dynamic Tailwind classes to ensure they are included in the build
const COLORS = {
    emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        hoverBg: 'group-hover:bg-emerald-100',
        iconBg: 'bg-emerald-100',
        border: 'hover:border-emerald-200'
    },
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hoverBg: 'group-hover:bg-blue-100',
        iconBg: 'bg-blue-100',
        border: 'hover:border-blue-200'
    },
    violet: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        hoverBg: 'group-hover:bg-violet-100',
        iconBg: 'bg-violet-100',
        border: 'hover:border-violet-200'
    },
    orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        hoverBg: 'group-hover:bg-orange-100',
        iconBg: 'bg-orange-100',
        border: 'hover:border-orange-200'
    }
};

// --- Components ---

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ shopName }) => {
    const date = new Date();
    const hours = date.getHours();
    let greeting = 'Good Morning';
    if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
    else if (hours >= 17) greeting = 'Good Evening';

    const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="relative overflow-hidden rounded-3xl bg-[#1E293B] p-8 text-white shadow-xl mb-8 border border-slate-700">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500 blur-3xl opacity-10 mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-emerald-500 blur-3xl opacity-10 mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2 font-medium">
                        <Clock className="w-4 h-4" />
                        <span>{dateString}</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                        {greeting}, <span className="text-white">{shopName}</span> 👋
                    </h1>
                    <p className="text-slate-300 text-lg max-w-xl">
                        Here's what's happening in your business today. You have new insights waiting for you.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color }) => {
    const styles = COLORS[color] || COLORS.blue;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group`}>
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500`}>
                <div className={`${styles.text} transform scale-150`}>{icon}</div>
            </div>

            <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl ${styles.bg} ${styles.text} mb-4 ${styles.hoverBg} transition-colors`}>
                    {icon}
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                    {trend && (
                        <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mb-1">
                            <TrendingUp className="w-3 h-3 mr-1" /> {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export const QuickActionCard: React.FC<QuickActionProps> = ({ label, icon, onClick, color, description }) => {
    const styles = COLORS[color] || COLORS.blue;

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md ${styles.border} transition-all duration-300 text-left group w-full`}
        >
            <div className={`p-3 rounded-xl ${styles.bg} ${styles.text} mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                {label}
            </h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {description}
            </p>
            <div className="mt-auto flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                Action <ArrowRight className="w-4 h-4 ml-1" />
            </div>
        </button>
    );
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ title, subtitle, amount, time, icon, color }) => {
    const styles = COLORS[color] || COLORS.blue;

    return (
        <div className="flex items-center gap-4 p-4 hover:bg-slate-50/50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} ${styles.text} flex items-center justify-center`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{title}</p>
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{amount}</p>
                <p className="text-xs text-slate-400">{time}</p>
            </div>
        </div>
    );
};
