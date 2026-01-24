import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Upload, FileText } from 'lucide-react';

interface Product {
  id: string;
  product_name: string;
  quantity_on_hand: number;
  quantity_unit: string;
  selling_price: number;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    quantity_on_hand: 0,
    quantity_unit: 'kg',
    selling_price: 0,
    current_cost_price: 0,
    reorder_level: 10,
  });

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
      // Update existing product
      updatedProducts = products.map(product =>
        product.id === editingId ? { ...formData, id: editingId } : product
      );
    } else {
      // Add new product
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(), // Simple ID generation
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
      quantity_on_hand: product.quantity_on_hand,
      quantity_unit: product.quantity_unit,
      selling_price: product.selling_price,
      current_cost_price: product.current_cost_price,
      reorder_level: product.reorder_level,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      quantity_on_hand: 0,
      quantity_unit: 'kg',
      selling_price: 0,
      current_cost_price: 0,
      reorder_level: 10,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Processing file...');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setUploadStatus('Error: File must have at least a header and one data row');
          return;
        }

        // Parse CSV data
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const newProducts: Product[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length < 3) continue; // Skip incomplete rows
          
          // Try to map common column names
          const nameIndex = headers.findIndex(h => 
            h.includes('name') || h.includes('product') || h.includes('item')
          );
          const quantityIndex = headers.findIndex(h => 
            h.includes('quantity') || h.includes('stock') || h.includes('qty')
          );
          const priceIndex = headers.findIndex(h => 
            h.includes('price') || h.includes('cost') || h.includes('amount')
          );

          // If headers don't match, assume order: name, quantity, price
          const productName = values[nameIndex !== -1 ? nameIndex : 0];
          const quantity = parseFloat(values[quantityIndex !== -1 ? quantityIndex : 1]) || 0;
          const price = parseFloat(values[priceIndex !== -1 ? priceIndex : 2]) || 0;

          if (productName && quantity >= 0 && price >= 0) {
            newProducts.push({
              id: Date.now().toString() + i,
              product_name: productName,
              quantity_on_hand: quantity,
              quantity_unit: 'pieces',
              selling_price: price,
              current_cost_price: price * 0.8, // Assume 20% margin
              reorder_level: 10,
            });
          }
        }

        if (newProducts.length > 0) {
          const updatedProducts = [...products, ...newProducts];
          saveProducts(updatedProducts);
          setUploadStatus(`Success! Added ${newProducts.length} products.`);
        } else {
          setUploadStatus('Error: No valid products found in file');
        }

        // Clear status after 3 seconds
        setTimeout(() => setUploadStatus(''), 3000);
        
      } catch (error) {
        setUploadStatus('Error: Failed to parse file. Please check format.');
        setTimeout(() => setUploadStatus(''), 3000);
      }
    };

    reader.readAsText(file);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = 'Product Name,Quantity,Price\nRice,50,25.50\nWheat,30,22.00\nSugar,25,45.00';
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const lowStockProducts = products.filter(
    (p) => p.quantity_on_hand <= p.reorder_level
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products & Inventory</h1>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              title="Upload CSV/Excel file"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Upload</span>
            </button>
          </div>
          
          <button
            onClick={downloadSampleCSV}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            title="Download sample CSV format"
          >
            <FileText className="w-4 h-4" />
            <span>Sample CSV</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className={`border rounded-lg p-4 flex gap-3 ${
          uploadStatus.includes('Success') 
            ? 'bg-green-50 border-green-200' 
            : uploadStatus.includes('Error')
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <Upload className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            uploadStatus.includes('Success') 
              ? 'text-green-600' 
              : uploadStatus.includes('Error')
              ? 'text-red-600'
              : 'text-blue-600'
          }`} />
          <div>
            <p className={`text-sm ${
              uploadStatus.includes('Success') 
                ? 'text-green-800' 
                : uploadStatus.includes('Error')
                ? 'text-red-800'
                : 'text-blue-800'
            }`}>
              {uploadStatus}
            </p>
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Low Stock Alert</h3>
            <p className="text-sm text-amber-800">
              {lowStockProducts.length} product(s) below reorder level: {lowStockProducts.map((p) => p.product_name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/50">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Unit
                </label>
                <select
                  value={formData.quantity_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity_unit: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="l">Liter (L)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="pieces">Pieces</option>
                  <option value="dozen">Dozen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity_on_hand}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_on_hand: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.reorder_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorder_level: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      selling_price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_cost_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_cost_price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-xl border border-white/50">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start building your {shopData.business_type.toLowerCase()} inventory by adding your first product.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Product</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
              >
                <Upload className="w-5 h-5" />
                <span>Import from File</span>
              </button>
            </div>
          </div>
        ) : (
          products.map((product) => {
            const profit = product.selling_price - product.current_cost_price;
            const profitMargin =
              product.current_cost_price > 0
                ? ((profit / product.current_cost_price) * 100).toFixed(1)
                : 0;

            return (
              <div
                key={product.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-blue-200 transform hover:-translate-y-1"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="font-semibold text-gray-900">{product.product_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-semibold text-gray-900">
                      {product.quantity_on_hand} {product.quantity_unit}
                    </p>
                    {product.quantity_on_hand <= product.reorder_level && (
                      <p className="text-xs text-red-600 mt-1">Low stock!</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Selling Price</p>
                    <p className="font-semibold text-gray-900">₹{product.selling_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cost Price</p>
                    <p className="font-semibold text-gray-900">₹{product.current_cost_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Margin</p>
                    <p className="font-semibold text-green-600">{profitMargin}%</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
