import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory, adjustInventory } from '../redux/inventorySlice';
import {
  Boxes,
  Loader2,
  Lock,
  Edit2,
  ArrowUpRight,
  TrendingUp,
  Scale,
  X,
  FileCheck2
} from 'lucide-react';

const Inventory = () => {
  const dispatch = useDispatch();
  
  const { items, loading, error } = useSelector((state) => state.inventory);
  const { user } = useSelector((state) => state.auth);

  // Edit states
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  // Capacity thresholds for industrial aesthetics
  const CAPACITIES = {
    Copper: 10000,     // 10 Tonnes max
    Steel: 50000,      // 50 Tonnes max
    Aluminium: 25000,  // 25 Tonnes max
    Brass: 10000       // 10 Tonnes max
  };

  const getCapacityPercent = (type, qty) => {
    const cap = CAPACITIES[type] || 10000;
    return Math.min(100, Math.max(0, (qty / cap) * 100));
  };

  const COLORS = {
    Copper: 'bg-amber-600 border-amber-500/30',
    Steel: 'bg-slate-500 border-slate-400/30',
    Aluminium: 'bg-sky-400 border-sky-300/30',
    Brass: 'bg-yellow-700 border-yellow-600/30',
  };

  const getCapacityColor = (percent) => {
    if (percent > 90) return 'bg-red-500';
    if (percent > 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity.toFixed(1));
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || newQuantity === '') return;

    try {
      await dispatch(adjustInventory({ id: selectedItem._id, quantity: parseFloat(newQuantity) })).unwrap();
      setIsAdjustOpen(false);
      setSelectedItem(null);
      setNewQuantity('');
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">Warehouse Stock Ledger</h2>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">Real-Time Refined metals aggregates</p>
        </div>

        <div className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400">
          <FileCheck2 className="w-4 h-4 text-emerald-500" />
          <span>CAPACITIES CALCULATED BY BAY VOLUME</span>
        </div>
      </div>

      {/* METALS CAPACITY OVERVIEW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          const percent = getCapacityPercent(item.metalType, item.quantity);
          const maxCap = CAPACITIES[item.metalType] || 10000;
          return (
            <div key={item._id} className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">{item.metalType}</span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">CAP: {(maxCap / 1000).toFixed(0)}T</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-100">
                  {item.quantity.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  <span className="text-xs text-slate-500 font-semibold ml-1">kg</span>
                </h3>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Capacity Used</span>
                  <span className="font-bold text-slate-300">{percent.toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress volume bar */}
              <div className="w-full h-2 bg-slate-950 border border-slate-800/80 rounded overflow-hidden">
                <div
                  className={`h-full ${getCapacityColor(percent)} rounded transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* STOCK INVENTORY TABLE SPREADSHEET */}
      <div className="glass-panel overflow-hidden">
        {loading && !isAdjustOpen ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 text-sm font-mono">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
            Loading warehouse stock ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold bg-slate-900/30">
                  <th className="py-4 pl-6">Bay Metal Type</th>
                  <th className="py-4">Stock Level (kg)</th>
                  <th className="py-4">Max Capacity Level</th>
                  <th className="py-4">Last Stock Reconcile</th>
                  <th className="py-4 text-right pr-6">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {items.map((item) => {
                  const percent = getCapacityPercent(item.metalType, item.quantity);
                  const isWorker = user?.role === 'Worker';
                  return (
                    <tr key={item._id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Name */}
                      <td className="py-4 pl-6 font-bold flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full border ${COLORS[item.metalType]}`} />
                        <span className="text-sm text-slate-200">{item.metalType}</span>
                      </td>

                      {/* Stock quantity */}
                      <td className="py-4 text-sm font-black text-slate-100">
                        {item.quantity.toLocaleString('en-GB', { minimumFractionDigits: 1 })}
                        <span className="text-[10px] text-slate-500 font-semibold ml-1">kg</span>
                      </td>

                      {/* Max level indicator bar */}
                      <td className="py-4">
                        <div className="flex items-center gap-3 w-40">
                          <div className="flex-1 h-1.5 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden">
                            <div className="h-full bg-slate-400" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500">{percent.toFixed(0)}%</span>
                        </div>
                      </td>

                      {/* Last updated timestamp */}
                      <td className="py-4 text-slate-500">
                        {new Date(item.updatedAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Option operations */}
                      <td className="py-4 text-right pr-6">
                        {isWorker ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-1 rounded bg-slate-950 text-slate-600 border border-slate-800/80 font-bold uppercase cursor-not-allowed">
                            <Lock className="w-3 h-3" />
                            Lock View
                          </span>
                        ) : (
                          <button
                            onClick={() => openAdjustModal(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Adjust Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500 font-normal">
                      No stock aggregates recorded. Refine scrap logs to populate automatically.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADJUST QUANTITY MODAL SHEET --- */}
      {isAdjustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => { setIsAdjustOpen(false); setSelectedItem(null); }} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 text-xs font-mono animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                Override stock: {selectedItem?.metalType}
              </h3>
              <button onClick={() => { setIsAdjustOpen(false); setSelectedItem(null); }} className="text-slate-500 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Current Volume</span>
                  <p className="text-sm font-black text-slate-300">{selectedItem?.quantity.toLocaleString()} kg</p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-amber-500/40" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Corrected Weight Volume (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 5200.0"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full form-input form-input-pl-9"
                    required
                  />
                </div>
                <span className="text-[8.5px] text-slate-500 leading-tight block pt-1 font-sans">
                  * Warning: Adjusting stock aggregates manually creates audits and affects transaction margins. Confirm figures are accurate.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsAdjustOpen(false); setSelectedItem(null); }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all"
                >
                  Confirm Overrides
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
