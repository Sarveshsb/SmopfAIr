import { useState, useEffect } from 'react';
import { Wallet, TrendingDown, Trash2, Calendar, CheckCircle, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ExpenseTrackingProps {
    shopData: {
        shop_name: string;
        business_type: string;
    };
}

const EXPENSE_CATEGORIES = [
    'Rent',
    'Electricity',
    'Staff Wages',
    'Transport',
    'Miscellaneous'
] as const;

type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

interface Expense {
    id: string;
    category: ExpenseCategory;
    amount: number;
    description?: string;
    date: string;
}

export default function ExpenseTracking({ shopData }: ExpenseTrackingProps) {
    const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | ''>('');
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState<string>('');
    const [expenseDate, setExpenseDate] = useState<Date>(new Date());
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadExpenses();
    }, [shopData.shop_name]);

    const loadExpenses = () => {
        const savedExpenses = localStorage.getItem(`expenses_${shopData.shop_name}`);
        if (savedExpenses) {
            setExpenses(JSON.parse(savedExpenses));
        }
    };

    const handleRecordExpense = () => {
        if (!selectedCategory || amount <= 0) {
            alert('Please select a category and enter a valid amount.');
            return;
        }

        const newExpense: Expense = {
            id: Date.now().toString(),
            category: selectedCategory as ExpenseCategory,
            amount,
            description: description.trim() || undefined,
            date: expenseDate.toISOString(),
        };

        const updatedExpenses = [...expenses, newExpense];
        setExpenses(updatedExpenses);
        localStorage.setItem(`expenses_${shopData.shop_name}`, JSON.stringify(updatedExpenses));

        // Success Animation
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Reset form
        setSelectedCategory('');
        setAmount(0);
        setDescription('');
        setExpenseDate(new Date());
    };

    const deleteExpense = (id: string) => {
        const updatedExpenses = expenses.filter(e => e.id !== id);
        setExpenses(updatedExpenses);
        localStorage.setItem(`expenses_${shopData.shop_name}`, JSON.stringify(updatedExpenses));
    };

    const todaysExpenses = expenses
        .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
        .reduce((sum, e) => sum + e.amount, 0);

    const totalExpensesCount = expenses.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length;

    const thisMonthExpenses = expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            const now = new Date();
            return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const getCategoryIcon = (category: ExpenseCategory) => {
        const icons: Record<ExpenseCategory, string> = {
            'Rent': '🏠',
            'Electricity': '⚡',
            'Staff Wages': '👥',
            'Transport': '🚗',
            'Miscellaneous': '📦'
        };
        return icons[category];
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Expense Tracker</h1>
                <p className="text-gray-500">Record your daily business expenses for better profit insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-200 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-16 h-16" /></div>
                    <p className="text-orange-100 text-sm font-medium mb-1">You Spent Today</p>
                    <p className="text-4xl font-bold tracking-tight">₹{todaysExpenses.toLocaleString()}</p>
                    <div className="mt-4 flex items-center text-xs text-orange-100 bg-white/10 w-fit px-2 py-1 rounded-lg">
                        <TrendingDown className="w-3 h-3 mr-1" /> Daily expenses
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
                        <p className="text-gray-500 text-sm font-medium">Expense Count</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalExpensesCount}</p>
                    <p className="text-xs text-gray-400 mt-1">Recorded today</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
                        <p className="text-gray-500 text-sm font-medium">This Month</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">₹{thisMonthExpenses.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Total spent</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Expense Entry Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative">
                    {showSuccess && (
                        <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center rounded-2xl animate-in fade-in duration-300">
                            <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
                            <h3 className="text-2xl font-bold text-gray-900">Expense Recorded!</h3>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-6 bg-orange-600 rounded-full" /> New Expense
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <div className="relative">
                                <select
                                    className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none appearance-none font-medium"
                                    onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory)}
                                    value={selectedCategory}
                                >
                                    <option value="" disabled>Choose a category...</option>
                                    {EXPENSE_CATEGORIES.map(category => (
                                        <option key={category} value={category}>
                                            {getCategoryIcon(category)} {category}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                value={amount || ''}
                                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                                placeholder="0"
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                <DatePicker
                                    selected={expenseDate}
                                    onChange={(date: Date | null) => date && setExpenseDate(date)}
                                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-medium"
                                    dateFormat="MMMM d, yyyy"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief note about this expense..."
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 border-t border-gray-100 pt-6">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="text-3xl font-bold text-orange-600">₹{amount.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={handleRecordExpense}
                            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" /> Record Expense
                        </button>
                    </div>
                </div>

                {/* Recent Expenses Feed */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 h-fit max-h-[600px] overflow-y-auto">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 sticky top-0 bg-gray-50 pb-2 z-10 flex justify-between items-center">
                        Recent Expenses
                        <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200">{expenses.length} total</span>
                    </h2>

                    {expenses.length === 0 ? (
                        <div className="text-center py-10">
                            <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500 font-medium mb-2">No expenses tracked yet</p>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                Start recording your daily expenses to get better profit insights and AI recommendations!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {expenses.slice().reverse().map(expense => (
                                <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors group relative">
                                    <button onClick={() => deleteExpense(expense.id)} className="absolute top-2 right-2 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="flex justify-between items-start mb-1 pr-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                                            <p className="font-bold text-gray-900">{expense.category}</p>
                                        </div>
                                        <p className="font-bold text-orange-600">₹{expense.amount.toLocaleString()}</p>
                                    </div>
                                    {expense.description && (
                                        <p className="text-xs text-gray-500 mb-1 pl-7">{expense.description}</p>
                                    )}
                                    <div className="flex justify-between text-xs text-gray-400 pl-7">
                                        <span>{new Date(expense.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span>{new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
