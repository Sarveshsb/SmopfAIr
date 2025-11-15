import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

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
  shopOwnerId: string;
}

export default function ProductManagement({ shopOwnerId }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
  }, [shopOwnerId]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_owner_id', shopOwnerId)
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...formData, shop_owner_id: shopOwnerId }]);
        if (error) throw error;
      }
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
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

  const lowStockProducts = products.filter(
    (p) => p.quantity_on_hand <= p.reorder_level
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products & Inventory</h1>
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
      </div>

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
        <div className="bg-white rounded-lg shadow p-6">
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
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No products yet. Add your first product to get started.</p>
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
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
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
