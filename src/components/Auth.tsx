
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Store, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [shopName, setShopName] = useState('');
    const [businessType, setBusinessType] = useState('Retail');
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            shop_name: shopName,
                            business_type: businessType,
                        },
                    },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Signup successful! Please check your email for verification.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/10 z-0"></div>
                    <div className="relative z-10">
                        <div className="h-16 w-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 border border-slate-700">
                            <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">SmopfAIr</h2>
                        <p className="text-slate-400 text-sm">AI-Powered Shop Management</p>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">
                        {mode === 'login' ? 'Welcome Back' : 'Create Your Shop'}
                    </h3>

                    {message && (
                        <div className={`p-4 rounded-lg mb-6 text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {mode === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name</label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={shopName}
                                            onChange={(e) => setShopName(e.target.value)}
                                            className="pl-10 w-full rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 py-2.5"
                                            placeholder="My Awesome Shop"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                                    <select
                                        value={businessType}
                                        onChange={(e) => setBusinessType(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 bg-white"
                                    >
                                        <option value="Retail">Retail Store</option>
                                        <option value="Grocery">Grocery / Kirana</option>
                                        <option value="Textile">Textile / Fashion</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Restaurant">Restaurant / Cafe</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 w-full rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 py-2.5"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 w-full rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 py-2.5"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setMessage(null);
                            }}
                            className="text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors"
                        >
                            {mode === 'login'
                                ? "Don't have an account? Create one"
                                : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
