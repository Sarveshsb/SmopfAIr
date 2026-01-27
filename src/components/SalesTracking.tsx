import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Package, Trash2, ShoppingBag, Calendar, CheckCircle, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SalesTrackingProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
}

export default function SalesTracking({ shopData }: SalesTrackingProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantitySold, setQuantitySold] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadProducts();
    loadTransactions();
  }, [shopData.shop_name]);

  const loadProducts = () => {
    const savedProducts = localStorage.getItem(`products_${shopData.shop_name}`);
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  };

  const loadTransactions = () => {
    const savedTransactions = localStorage.getItem(`transactions_${shopData.shop_name}`);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setSellingPrice(product ? product.selling_price : 0);
  };

  const handleRecordSale = () => {
    if (!selectedProduct || quantitySold <= 0 || sellingPrice <= 0) {
      alert('Please fill in all sale details correctly.');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.product_name,
      quantity: quantitySold,
      unitPrice: sellingPrice,
      revenue: quantitySold * sellingPrice,
      date: saleDate.toISOString(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${shopData.shop_name}`, JSON.stringify(updatedTransactions));

    // Update product quantity on hand
    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id
        ? { ...p, quantity_on_hand: p.quantity_on_hand - quantitySold }
        : p
    );
    setProducts(updatedProducts);
    localStorage.setItem(`products_${shopData.shop_name}`, JSON.stringify(updatedProducts));

    // Success Animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    setSelectedProduct(null);
    setQuantitySold(1);
    setSellingPrice(0);
    setSaleDate(new Date());
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${shopData.shop_name}`, JSON.stringify(updatedTransactions));
  };

  const todaysSalesValue = transactions
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.revenue, 0);

  const totalTransactionsToday = transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).length;
  const totalProductsSoldToday = transactions
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Terminal</h1>
        <p className="text-gray-500">Record transactions and track daily revenue</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-200 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee className="w-16 h-16" /></div>
          <p className="text-blue-100 text-sm font-medium mb-1">Today's Revenue</p>
          <p className="text-4xl font-bold tracking-tight">₹{todaysSalesValue.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-xs text-blue-100 bg-white/10 w-fit px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3 mr-1" /> Best performance
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ShoppingBag className="w-5 h-5" /></div>
            <p className="text-gray-500 text-sm font-medium">Sales Count</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalTransactionsToday}</p>
          <p className="text-xs text-gray-400 mt-1">Transactions today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Package className="w-5 h-5" /></div>
            <p className="text-gray-500 text-sm font-medium">Units Sold</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalProductsSoldToday}</p>
          <p className="text-xs text-gray-400 mt-1">Total items moved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sales Terminal Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative">
          {showSuccess && (
            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center rounded-2xl animate-in fade-in duration-300">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-900">Sale Recorded!</h3>
            </div>
          )}

          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-600 rounded-full" /> New Transaction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none font-medium"
                  onChange={handleProductSelect}
                  value={selectedProduct?.id || ''}
                >
                  <option value="" disabled>Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.product_name} - ₹{product.selling_price}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center">
                <button onClick={() => setQuantitySold(Math.max(1, quantitySold - 1))} className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-l-xl hover:bg-gray-200 active:scale-95 transition text-gray-600 font-bold text-lg">-</button>
                <input
                  type="number"
                  value={quantitySold}
                  onChange={(e) => setQuantitySold(Math.max(1, Number(e.target.value)))}
                  className="w-full h-12 text-center border-y border-gray-200 focus:ring-0 outline-none font-bold text-lg text-gray-900"
                />
                <button onClick={() => setQuantitySold(quantitySold + 1)} className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-r-xl hover:bg-gray-200 active:scale-95 transition text-gray-600 font-bold text-lg">+</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Price (₹)</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <DatePicker
                  selected={saleDate}
                  onChange={(date: Date | null) => date && setSaleDate(date)}
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t border-gray-100 pt-6">
            <div className="flex-1">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-3xl font-bold text-blue-600">₹{(quantitySold * sellingPrice).toFixed(2)}</p>
            </div>
            <button
              onClick={handleRecordSale}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> Confirm Sale
            </button>
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 h-fit max-h-[600px] overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4 sticky top-0 bg-gray-50 pb-2 z-10 flex justify-between items-center">
            Recent Sales
            <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200">{transactions.length} total</span>
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2" />
              <p>No sales today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice().reverse().map(transaction => (
                <div key={transaction.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group relative">
                  <button onClick={() => deleteTransaction(transaction.id)} className="absolute top-2 right-2 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-start mb-1 pr-6">
                    <p className="font-bold text-gray-900">{transaction.productName}</p>
                    <p className="font-bold text-blue-600">₹{transaction.revenue.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{transaction.quantity} units @ ₹{transaction.unitPrice}</span>
                    <span>{new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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