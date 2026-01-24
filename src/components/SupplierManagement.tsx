import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Users } from 'lucide-react';

interface Supplier {
  id: string;
  supplier_name: string;
  contact_person: string | null;
  phone_number: string | null;
  email: string | null;
  location: string | null;
  reliability_score: number;
  quality_rating: number;
  average_delivery_days: number | null;
  notes: string | null;
}

interface SupplierManagementProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
}

export default function SupplierManagement({ shopData }: SupplierManagementProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_person: '',
    phone_number: '',
    email: '',
    location: '',
    reliability_score: 5,
    quality_rating: 5,
    average_delivery_days: 3,
    notes: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    const savedSuppliers = localStorage.getItem(`suppliers_${shopData.shop_name}`);
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    }
  };

  const saveSuppliers = (updatedSuppliers: Supplier[]) => {
    localStorage.setItem(`suppliers_${shopData.shop_name}`, JSON.stringify(updatedSuppliers));
    setSuppliers(updatedSuppliers);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedSuppliers = [...suppliers];
    
    if (editingId) {
      // Update existing supplier
      updatedSuppliers = suppliers.map(supplier =>
        supplier.id === editingId ? { ...formData, id: editingId } : supplier
      );
    } else {
      // Add new supplier
      const newSupplier: Supplier = {
        ...formData,
        id: Date.now().toString(),
        contact_person: formData.contact_person || null,
        phone_number: formData.phone_number || null,
        email: formData.email || null,
        location: formData.location || null,
        average_delivery_days: formData.average_delivery_days || null,
        notes: formData.notes || null,
      };
      updatedSuppliers = [...suppliers, newSupplier];
    }
    
    saveSuppliers(updatedSuppliers);
    resetForm();
  };

  const handleDeleteSupplier = (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
    saveSuppliers(updatedSuppliers);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setFormData({
      supplier_name: supplier.supplier_name,
      contact_person: supplier.contact_person || '',
      phone_number: supplier.phone_number || '',
      email: supplier.email || '',
      location: supplier.location || '',
      reliability_score: supplier.reliability_score,
      quality_rating: supplier.quality_rating,
      average_delivery_days: supplier.average_delivery_days || 3,
      notes: supplier.notes || '',
    });
    setEditingId(supplier.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      supplier_name: '',
      contact_person: '',
      phone_number: '',
      email: '',
      location: '',
      reliability_score: 5,
      quality_rating: 5,
      average_delivery_days: 3,
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const topSuppliers = suppliers
    .sort((a, b) => b.reliability_score - a.reliability_score)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {topSuppliers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{supplier.supplier_name}</p>
                  <p className="text-xs text-gray-600">{supplier.location}</p>
                </div>
                <div className="flex items-center bg-yellow-400 px-2 py-1 rounded text-xs font-semibold text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {supplier.reliability_score}/10
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Avg delivery: {supplier.average_delivery_days} days | Quality: {supplier.quality_rating}/10
              </p>
              {supplier.phone_number && (
                <p className="text-xs text-gray-600">{supplier.phone_number}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/50">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <form onSubmit={handleAddSupplier} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={formData.supplier_name}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avg Delivery Days
                </label>
                <input
                  type="number"
                  value={formData.average_delivery_days}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      average_delivery_days: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reliability Score (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.reliability_score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reliability_score: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Rating (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.quality_rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quality_rating: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Update Supplier' : 'Add Supplier'}
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
        {suppliers.length === 0 ? (
          <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-xl border border-white/50">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Suppliers Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Track your suppliers to manage relationships, ratings, and ensure reliable supply chains for your {shopData.business_type.toLowerCase()}.
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Supplier</span>
            </button>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-green-200 transform hover:-translate-y-1"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-semibold text-gray-900">{supplier.supplier_name}</p>
                  {supplier.contact_person && (
                    <p className="text-xs text-gray-600 mt-1">{supplier.contact_person}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  {supplier.phone_number && (
                    <p className="font-semibold text-gray-900">{supplier.phone_number}</p>
                  )}
                  {supplier.email && (
                    <p className="text-xs text-gray-600">{supplier.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery & Quality</p>
                  <p className="font-semibold text-gray-900">
                    {supplier.average_delivery_days} days | Quality: {supplier.quality_rating}/10
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reliability</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900">{supplier.reliability_score}/10</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEditSupplier(supplier)}
                  className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteSupplier(supplier.id)}
                  className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
