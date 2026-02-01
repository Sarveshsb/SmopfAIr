import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Upload, Package, Search, X, CheckCircle2, Download } from 'lucide-react';

interface Product {
  id: string;
  product_name: string;
  category?: string;
  quantity_on_hand: number;
  quantity_unit: string;
  selling_price: number;
  discount_percentage?: number;
  current_cost_price: number;
  reorder_level: number;
}

interface ProductManagementProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  onProductsChange?: () => void;
}

export default function ProductManagement({ shopData, onProductsChange }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'good'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    category: 'General',
    quantity_on_hand: 0,
    quantity_unit: 'pieces',
    selling_price: 0,
    discount_percentage: 0,
    current_cost_price: 0,
    reorder_level: 10,
  });

  const categories = ['General', 'Electronics', 'Clothing', 'Food & Beverages', 'Health & Beauty', 'Home & Garden', 'Sports', 'Toys', 'Books', 'Other'];
  const uniqueCategories = ['all', ...Array.from(new Set(products.map(p => p.category || 'General')))];


  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const savedProducts = localStorage.getItem(`products_${shopData.shop_name}`);
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  };

  const saveProducts = (updatedProducts: Product[]) => {
    localStorage.setItem(`products_${shopData.shop_name}`, JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    onProductsChange?.();
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedProducts = [...products];
    if (editingId) {
      updatedProducts = products.map(product =>
        product.id === editingId ? { ...formData, id: editingId } : product
      );
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
      };
      updatedProducts = [...products, newProduct];
    }
    saveProducts(updatedProducts);
    resetForm();
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      product_name: product.product_name,
      category: product.category || 'General',
      quantity_on_hand: product.quantity_on_hand,
      quantity_unit: product.quantity_unit,
      selling_price: product.selling_price,
      discount_percentage: product.discount_percentage || 0,
      current_cost_price: product.current_cost_price,
      reorder_level: product.reorder_level,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      category: 'General',
      quantity_on_hand: 0,
      quantity_unit: 'pieces',
      selling_price: 0,
      discount_percentage: 0,
      current_cost_price: 0,
      reorder_level: 10,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // --- Bulk Upload Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Processing...');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) throw new Error('Invalid format');

        // Simple CSV parsing (Name, Quantity, Price)
        const newProducts: Product[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 2) {
            newProducts.push({
              id: Date.now().toString() + i,
              product_name: values[0],
              quantity_on_hand: parseFloat(values[1]) || 0,
              quantity_unit: 'pieces',
              selling_price: parseFloat(values[2]) || 0,
              current_cost_price: (parseFloat(values[2]) || 0) * 0.7, // Estimate cost
              reorder_level: 10
            });
          }
        }

        if (newProducts.length > 0) {
          saveProducts([...products, ...newProducts]);
          setUploadStatus(`Success! Added ${newProducts.length} items.`);
        } else {
          setUploadStatus('No valid items found.');
        }
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (err) {
        setUploadStatus('Error parsing file.');
        setTimeout(() => setUploadStatus(''), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Product Name,Quantity,Selling Price\nApple,50,25\nBanana,100,5";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Filtering ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = stockFilter === 'all'
      ? true
      : stockFilter === 'low'
        ? p.quantity_on_hand <= p.reorder_level
        : p.quantity_on_hand > p.reorder_level;
    const matchesCategory = categoryFilter === 'all' || (p.category || 'General') === categoryFilter;
    return matchesSearch && matchesStock && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-gray-500">Manage your {shopData.shop_name} products</p>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          {products.length > 0 && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* 2. Bulk Actions & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search & Filter */}
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="good">Good Stock</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>

        {/* Bulk Tools */}
        <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" /> Template
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${uploadStatus.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {uploadStatus.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {uploadStatus}
        </div>
      )}

      {/* 3. Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or add a new product.</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-200 active:scale-95 mx-auto"
            >
              <Plus className="w-5 h-5" /> Add First Product
            </button>
          </div>
        ) : (
          filteredProducts.map(product => {
            const isLowStock = product.quantity_on_hand <= product.reorder_level;
            const stockPercent = Math.min(100, (product.quantity_on_hand / (product.reorder_level * 3)) * 100);

            return (
              <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{product.product_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category || 'General'} • {product.quantity_unit}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${isLowStock ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {isLowStock ? 'Low Stock' : 'In Stock'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Available</span>
                      <span className="font-medium text-gray-900">{product.quantity_on_hand}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-400">Price</p>
                      {product.discount_percentage && product.discount_percentage > 0 ? (
                        <div>
                          <p className="text-xs text-gray-400 line-through">₹{product.selling_price}</p>
                          <p className="font-bold text-green-600">₹{(product.selling_price * (1 - product.discount_percentage / 100)).toFixed(2)}</p>
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{product.discount_percentage}% OFF</span>
                        </div>
                      ) : (
                        <p className="font-bold text-gray-900">₹{product.selling_price}</p>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditProduct(product)} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-gray-100 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Slide-over Form (Modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required type="text" value={formData.product_name} onChange={e => setFormData({ ...formData, product_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Wireless Mouse" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input required type="number" min="0" value={formData.quantity_on_hand} onChange={e => setFormData({ ...formData, quantity_on_hand: Math.max(0, parseFloat(e.target.value)) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={formData.quantity_unit} onChange={e => setFormData({ ...formData, quantity_unit: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="pieces">Pieces</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="ltr">Ltr</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                  <input required type="number" min="0" step="0.01" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: Math.max(0, parseFloat(e.target.value)) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={formData.current_cost_price} onChange={e => setFormData({ ...formData, current_cost_price: Math.max(0, parseFloat(e.target.value)) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input type="number" min="0" max="100" step="1" value={formData.discount_percentage} onChange={e => setFormData({ ...formData, discount_percentage: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
                <p className="text-xs text-gray-400 mt-1">Optional: Set a discount percentage for this product</p>
                {formData.discount_percentage > 0 && (
                  <p className="text-sm text-green-600 mt-2 font-medium">Final Price: ₹{(formData.selling_price * (1 - formData.discount_percentage / 100)).toFixed(2)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                <input type="number" value={formData.reorder_level} onChange={e => setFormData({ ...formData, reorder_level: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                <p className="text-xs text-gray-400 mt-1">Stock below this level will be marked as 'Low Stock'</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">{editingId ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
