import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Users, Phone, Mail, MapPin, Search, X, Clock, Trophy } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

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
      updatedSuppliers = suppliers.map(supplier =>
        supplier.id === editingId ? { ...formData, id: editingId } : supplier
      );
    } else {
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

  const filteredSuppliers = suppliers.filter(s =>
    s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Suppliers</h1>
          <p className="text-gray-500">Manage vendor relationships & ratings</p>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>
          {suppliers.length > 0 && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* Top Suppliers Leaderboard */}
      {suppliers.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Top Rated Suppliers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...suppliers]
              .sort((a, b) => (b.reliability_score + b.quality_rating) - (a.reliability_score + a.quality_rating))
              .slice(0, 3)
              .map((supplier, index) => (
                <div key={supplier.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-100 to-transparent opacity-50 rounded-bl-full -mr-8 -mt-8`} />
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{supplier.supplier_name}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-gray-900 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          {((supplier.reliability_score + supplier.quality_rating) / 2).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">• Average</span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span className="bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Rel: <b>{supplier.reliability_score}</b></span>
                        <span className="bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Qual: <b>{supplier.quality_rating}</b></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No suppliers found</h3>
            <p className="text-gray-500 mb-6">Add a supplier to track your supply chain.</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-200 active:scale-95 mx-auto"
            >
              <Plus className="w-5 h-5" /> Add First Supplier
            </button>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-green-200 transition-all duration-300 relative">
              {/* Action Buttons (Absolute) */}
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditSupplier(supplier)} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteSupplier(supplier.id)} className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                  {supplier.supplier_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{supplier.supplier_name}</h3>
                  {supplier.location && <div className="flex items-center text-xs text-gray-500 mt-1"><MapPin className="w-3 h-3 mr-1" /> {supplier.location}</div>}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Reliability</span>
                  <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-lg">{supplier.reliability_score}/10</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Delivery Time</span>
                  <span className="font-medium text-gray-900">{supplier.average_delivery_days} days avg</span>
                </div>
              </div>

              <div className="flex gap-2">
                {supplier.phone_number ? (
                  <a href={`tel:${supplier.phone_number}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                ) : (
                  <button disabled className="flex-1 py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-300 cursor-not-allowed">No Phone</button>
                )}
                {supplier.email ? (
                  <a href={`mailto:${supplier.email}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                ) : (
                  <button disabled className="flex-1 py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-300 cursor-not-allowed">No Email</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-in Form (Modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Supplier' : 'New Supplier'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input required type="text" value={formData.supplier_name} onChange={e => setFormData({ ...formData, supplier_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input type="text" value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reliability (1-10)</label>
                  <input type="number" min="1" max="10" value={formData.reliability_score} onChange={e => setFormData({ ...formData, reliability_score: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Delivery (Days)</label>
                  <input type="number" value={formData.average_delivery_days} onChange={e => setFormData({ ...formData, average_delivery_days: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">{editingId ? 'Save Supplier' : 'Add Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

