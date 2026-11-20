import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Boxes,
  Plus,
  Search,
  Check,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Tag
} from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [availableMaster, setAvailableMaster] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Item Modal Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/seller/inventory');
      setInventory(res.data.inventory || []);
      setAvailableMaster(res.data.availableMasterProducts || []);
      if (res.data.availableMasterProducts?.length > 0) {
        setSelectedProductId(res.data.availableMasterProducts[0]._id);
        setPrice(res.data.availableMasterProducts[0].defaultPrice);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleToggleAvailability = async (item) => {
    try {
      await api.put(`/seller/inventory/${item._id}`, {
        isAvailable: !item.isAvailable,
      });
      fetchInventory();
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleQuickStockUpdate = async (item, delta) => {
    const newStock = Math.max(0, item.stock + delta);
    try {
      await api.put(`/seller/inventory/${item._id}`, {
        stock: newStock,
        isAvailable: newStock > 0,
      });
      fetchInventory();
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handlePriceEdit = async (item) => {
    const newPrice = prompt(`Enter new selling price for ${item.product.name}:`, item.price);
    if (!newPrice) return;
    const num = parseFloat(newPrice);
    if (isNaN(num) || num <= 0) return alert('Invalid price');

    try {
      await api.put(`/seller/inventory/${item._id}`, { price: num });
      fetchInventory();
    } catch (err) {
      alert('Failed to update price');
    }
  };

  const handleAddToInventory = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setSubmitting(true);
    try {
      await api.post('/seller/inventory', {
        productId: selectedProductId,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock) || 10,
        isAvailable: true,
      });
      setShowAddModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to inventory');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = inventory.filter((item) =>
    item.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    item.product?.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Inventory & Pricing Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control live shelf availability, custom store prices, and stock counts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Stock Items from Master Catalog ({availableMaster.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search products in your store..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* Inventory Table / Cards */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-sm">No items in your store yet</h4>
          <p className="text-xs text-slate-400 mt-1">Import items from the Master Catalog to start selling.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Product Item</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Selling Price</th>
                  <th className="py-4 px-4">Stock Units</th>
                  <th className="py-4 px-4">Availability</th>
                  <th className="py-4 px-6 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 flex-shrink-0"
                        />
                        <div>
                          <div className="font-black text-slate-900 text-sm line-clamp-1">{item.product?.name}</div>
                          <div className="text-[11px] text-slate-400 font-semibold">{item.product?.unit} • {item.product?.brand}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {item.product?.category?.name || 'General'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-black text-slate-900 text-sm">₹{item.price}</span>
                          {item.discountPrice && (
                            <span className="text-[11px] text-emerald-600 font-bold ml-1.5">(₹{item.discountPrice})</span>
                          )}
                        </div>
                        <button
                          onClick={() => handlePriceEdit(item)}
                          className="text-[10px] text-emerald-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickStockUpdate(item, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className={`font-black text-sm px-2 ${item.stock < 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {item.stock}
                        </span>
                        <button
                          onClick={() => handleQuickStockUpdate(item, +5)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center text-xs"
                        >
                          +5
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase transition-all ${
                          item.isAvailable && item.stock > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable && item.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{item.isAvailable && item.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 hover:underline"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Item From Master Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Add Product from Master Catalog</h3>
            <p className="text-xs text-slate-500 mb-6">Select a standard product and customize your selling price</p>

            {availableMaster.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                All master products are already stocked in your shop!
              </div>
            ) : (
              <form onSubmit={handleAddToInventory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      const prodId = e.target.value;
                      setSelectedProductId(prodId);
                      const found = availableMaster.find(m => m._id === prodId);
                      if (found) setPrice(found.defaultPrice);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    {availableMaster.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.unit}) - MRP ₹{m.defaultPrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Stock Units</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Price (₹) (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty if no discount"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Stocking...' : 'Add to Shelf'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
