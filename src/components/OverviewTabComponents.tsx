import React from 'react';
import { ArrowRight, TrendingUp, Clock } from 'lucide-react';

// --- Types ---
interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    color: string;
}

interface QuickActionProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
    description: string;
}

interface ActivityItemProps {
    title: string;
    subtitle: string;
    amount: string;
    time: string;
    icon: React.ReactNode;
    color: string;
}

interface WelcomeHeroProps {
    shopName: string;
    ownerName?: string;
}

// --- Components ---

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ shopName }) => {
    const date = new Date();
    const hours = date.getHours();
    let greeting = 'Good Morning';
    if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
    else if (hours >= 17) greeting = 'Good Evening';

    const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 p-8 text-white shadow-2xl mb-8">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500 blur-3xl opacity-20 mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-purple-500 blur-3xl opacity-20 mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-300 mb-2 font-medium">
                        <Clock className="w-4 h-4" />
                        <span>{dateString}</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">{shopName}</span> 👋
                    </h1>
                    <p className="text-blue-100/80 text-lg max-w-xl">
                        Here's what's happening in your business today. You have new insights waiting for you.
                    </p>
                </div>
                {/* Optional: Add a subtle CTA or summary here if needed/requested later */}
            </div>
        </div>
    );
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color }) => {
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                <div className={`text-${color}-500 transform scale-150`}>{icon}</div>
            </div>

            <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-${color}-50 text-${color}-600 mb-4 group-hover:bg-${color}-100 transition-colors`}>
                    {icon}
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
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
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-start p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 text-left group w-full"
        >
            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                {label}
            </h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {description}
            </p>
            <div className="mt-auto flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                Action <ArrowRight className="w-4 h-4 ml-1" />
            </div>
        </button>
    );
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ title, subtitle, amount, time, icon, color }) => {
    return (
        <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${color}-100 text-${color}-600 flex items-center justify-center`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
                <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{amount}</p>
                <p className="text-xs text-gray-400">{time}</p>
            </div>
        </div>
    );
};
