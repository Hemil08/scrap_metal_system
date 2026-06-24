import React, {useState, useEffect, useRef} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchScrapRecords,
  addScrapRecord,
  editScrapRecord,
  removeScrapRecord
} from '../redux/scrapSlice';
import { fetchInventory } from '../redux/inventorySlice'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Upload,
  Cpu,
  Loader2,
  X,
  MapPin,
  Scale,
  Truck,
  Image as ImageIcon
} from 'lucide-react';
import { FILES_BASE_URL } from '../services/api';

const ScrapManagement = () => {
  const dispatch = useDispatch();
  
  // Redux States
  const { records, loading, error } = useSelector((state) => state.scrap);
  const { user } = useSelector((state) => state.auth);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal controls
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Form states
  const [weight, setWeight] = useState('');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('Bay 1');
  const [status, setStatus] = useState('Collected');
  const [metalType, setMetalType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initial data fetch
    dispatch(fetchScrapRecords());
  }, [dispatch]);

  // Handle Search & Filter trigger
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const filters = {};
    if (search) filters.search = search;
    if (metalFilter) filters.metalType = metalFilter;
    if (statusFilter) filters.status = statusFilter;

    dispatch(fetchScrapRecords(filters));
  }, [search, metalFilter, statusFilter, dispatch]);

  // Image Upload Preview Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Close Modals & Flush States
  const resetFormStates = () => {
    setWeight('');
    setSupplier('');
    setLocation('Bay 1');
    setStatus('Collected');
    setMetalType('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingRecord(null);
    setAiAnalyzing(false);
  };

  // CREATE ACTION
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !supplier) return;

    const formData = new FormData();
    formData.append('weight', weight);
    formData.append('supplier', supplier);
    formData.append('location', location);
    formData.append('status', status);
    
    if (metalType) {
      formData.append('metalType', metalType);
    }
    
    if (selectedFile) {
      formData.append('image', selectedFile);
      setAiAnalyzing(true);
    }

    try {
      await dispatch(addScrapRecord(formData)).unwrap();
      dispatch(fetchInventory()); // Keep aggregates sync'd
      setIsAddOpen(false);
      resetFormStates();
    } catch (err) {
      console.error('Failed to create record:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // EDIT ACTION INITIALIZER
  const openEditModal = (record) => {
    setEditingRecord(record);
    setWeight(record.weight);
    setSupplier(record.supplier);
    setLocation(record.location);
    setStatus(record.status);
    setMetalType(record.metalType);
    if (record.image) {
      setPreviewUrl(`${FILES_BASE_URL}${record.image}`);
    }
    setIsEditOpen(true);
  };

  // UPDATE ACTION
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !supplier) return;

    const formData = new FormData();
    formData.append('weight', weight);
    formData.append('supplier', supplier);
    formData.append('location', location);
    formData.append('status', status);
    formData.append('metalType', metalType);

    if (selectedFile) {
      formData.append('image', selectedFile);
      setAiAnalyzing(true);
    }

    try {
      await dispatch(editScrapRecord({ id: editingRecord._id, formData })).unwrap();
      dispatch(fetchInventory()); // Keep aggregates sync'd
      setIsEditOpen(false);
      resetFormStates();
    } catch (err) {
      console.error('Failed to edit record:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // DELETE ACTION
  const handleDeleteRecord = async (id) => {
    if (window.confirm('Confirm scrap ledger entry deletion? This adjusts inventory totals.')) {
      try {
        await dispatch(removeScrapRecord(id)).unwrap();
        dispatch(fetchInventory()); // Refresh inventory aggregates
      } catch (err) {
        console.error('Deletion failure:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Collected': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Processing': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Refined': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Sold': return 'bg-slate-500/10 text-slate-400 border border-slate-700/50';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const getMetalColor = (type) => {
    switch (type) {
      case 'Copper': return 'text-amber-500';
      case 'Steel': return 'text-slate-400';
      case 'Aluminium': return 'text-sky-300';
      case 'Brass': return 'text-yellow-600';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">Scrap Intake Records</h2>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">Digital intake log & visual classifications</p>
        </div>
        
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all duration-300 shadow-neon-amber select-none cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log New Intake
        </button>
      </div>

      {/* FILTER SHEET BAR */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input field */}
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search Supplier / Bay Location..."
            value={search}
            onChange={handleSearchChange}
            className="w-full form-input form-input-pl-10 focus:border-amber-500/80"
          />
        </div>

        {/* Dynamic filter selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Metal type filter pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            <span className="px-2 text-slate-500 font-bold uppercase">Metal:</span>
            {['', 'Copper', 'Steel', 'Aluminium', 'Brass'].map((m) => (
              <button
                key={m || 'all'}
                onClick={() => setMetalFilter(m)}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                  metalFilter === m
                    ? 'bg-amber-600 text-white shadow-neon-amber'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m || 'ALL'}
              </button>
            ))}
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-500 transition-all font-mono"
            >
              <option value="">ALL STATUSES</option>
              <option value="Collected">COLLECTED</option>
              <option value="Processing">PROCESSING</option>
              <option value="Refined">REFINED</option>
              <option value="Sold">SOLD</option>
            </select>
          </div>
        </div>
      </div>

      {/* CORE DATA RECORDS TABLE */}
      <div className="glass-panel overflow-hidden">
        {loading && !aiAnalyzing ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 text-sm font-mono">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
            Synchronizing operational grids...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold bg-slate-900/30">
                  <th className="py-4 pl-4">Intake Preview</th>
                  <th className="py-4">Metal Spec</th>
                  <th className="py-4">Supplier & Bay</th>
                  <th className="py-4 text-right">Net Weight</th>
                  <th className="py-4 text-center">AI Predicted</th>
                  <th className="py-4 text-center">Status</th>
                  <th className="py-4 text-right pr-4">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-900/40 transition-colors group">
                    {/* Visual thumbnail preview */}
                    <td className="py-3 pl-4">
                      {record.image ? (
                        <div className="w-12 h-12 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden relative">
                          <img
                            src={`${FILES_BASE_URL}${record.image}`}
                            alt="scrap thumbnail"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-slate-800/80 bg-slate-950/60 flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>

                    {/* Metal Name details */}
                    <td className="py-3 font-bold">
                      <span className={`text-sm ${getMetalColor(record.metalType)} block`}>
                        {record.metalType}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ID: {record._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    {/* Supplier details */}
                    <td className="py-3 space-y-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-200">
                        <Truck className="w-3.5 h-3.5 text-slate-500" />
                        {record.supplier}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-600" />
                        {record.location}
                      </span>
                    </td>

                    {/* Weight */}
                    <td className="py-3 text-right font-black text-slate-100 text-sm">
                      {record.weight.toLocaleString('en-GB', { minimumFractionDigits: 1 })}
                      <span className="text-[10px] text-slate-500 font-semibold ml-1">kg</span>
                    </td>

                    {/* AI Prediction category tag */}
                    <td className="py-3 text-center">
                      {record.predictedType && record.predictedType !== 'Not Classified' ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase">
                          <Cpu className="w-3 h-3" />
                          {record.predictedType}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-normal italic">
                          No Scan
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 text-center">
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>

                    {/* Options / Action operations buttons */}
                    <td className="py-3 text-right pr-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(record)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded border border-transparent hover:border-slate-700 transition-all duration-200 cursor-pointer"
                          title="Modify Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        {user && user.role !== 'Worker' && (
                          <button
                            onClick={() => handleDeleteRecord(record._id)}
                            className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded border border-transparent hover:border-slate-700 transition-all duration-200 cursor-pointer"
                            title="Purge Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {records.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-500 font-normal">
                      No operational scrap entries matching filters found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD MODAL SHEET --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => { if (!aiAnalyzing) setIsAddOpen(false); resetFormStates(); }} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 text-xs font-mono animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                Intake Log Entry
              </h3>
              <button onClick={() => { if (!aiAnalyzing) setIsAddOpen(false); resetFormStates(); }} className="text-slate-500 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Image upload widget */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Intake Visual Scan (AI Enabled)</span>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-4 bg-slate-950/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  {previewUrl ? (
                    <div className="w-full flex flex-col items-center gap-2">
                      <img src={previewUrl} alt="Visual preview" className="max-h-32 object-cover rounded-lg border border-slate-800" />
                      <span className="text-[9px] text-slate-500">Click preview block to switch images</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-600" />
                      <span className="text-slate-500 text-[10px]">Select camera capture or visual record</span>
                    </>
                  )}
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 1420.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full form-input form-input-pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Warehouse Bay</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full form-input px-3"
                  >
                    <option value="Bay 1">BAY 1 // INTAKE</option>
                    <option value="Bay 2">BAY 2 // SMELTING</option>
                    <option value="Bay 3">BAY 3 // SHREDDING</option>
                    <option value="Bay 4">BAY 4 // COLD STORAGE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Supplier Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Demolition Ltd"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Metal Override</label>
                  <select
                    value={metalType}
                    onChange={(e) => setMetalType(e.target.value)}
                    className="w-full form-input px-3"
                  >
                    <option value="">AUTO CLASSIFY (RECOMMENDED)</option>
                    <option value="Copper">COPPER</option>
                    <option value="Steel">STEEL</option>
                    <option value="Aluminium">ALUMINIUM</option>
                    <option value="Brass">BRASS</option>
                  </select>
                  <span className="text-[8px] text-slate-500 block leading-tight mt-1">If left blank, backend MobileNetV2 fills this field automatically!</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Intake Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full form-input px-3"
                  >
                    <option value="Collected">COLLECTED</option>
                    <option value="Processing">PROCESSING</option>
                    <option value="Refined">REFINED</option>
                    <option value="Sold">SOLD</option>
                  </select>
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg leading-relaxed">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  disabled={aiAnalyzing}
                  onClick={() => { setIsAddOpen(false); resetFormStates(); }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiAnalyzing}
                  className="flex items-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold transition-all duration-200"
                >
                  {aiAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      AI Analyzing Image...
                    </>
                  ) : (
                    'Log Records'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL SHEET --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => { if (!aiAnalyzing) setIsEditOpen(false); resetFormStates(); }} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 text-xs font-mono animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" />
                Modify Scrap Record
              </h3>
              <button onClick={() => { if (!aiAnalyzing) setIsEditOpen(false); resetFormStates(); }} className="text-slate-500 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* Optional replacement Image upload widget */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Intake Image (Replace Optional)</span>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-4 bg-slate-950/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  {previewUrl ? (
                    <div className="w-full flex flex-col items-center gap-2">
                      <img src={previewUrl} alt="Visual preview" className="max-h-32 object-cover rounded-lg border border-slate-800" />
                      <span className="text-[9px] text-slate-500">Click block to replace photo</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-600" />
                      <span className="text-slate-500 text-[10px]">Select camera capture or visual record</span>
                    </>
                  )}
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 1420.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full form-input form-input-pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Warehouse Bay</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full form-input px-3"
                  >
                    <option value="Bay 1">BAY 1 // INTAKE</option>
                    <option value="Bay 2">BAY 2 // SMELTING</option>
                    <option value="Bay 3">BAY 3 // SHREDDING</option>
                    <option value="Bay 4">BAY 4 // COLD STORAGE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Supplier Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Demolition Ltd"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Metal Classification</label>
                  <select
                    value={metalType}
                    onChange={(e) => setMetalType(e.target.value)}
                    className="w-full form-input px-3"
                    required
                  >
                    <option value="Copper">COPPER</option>
                    <option value="Steel">STEEL</option>
                    <option value="Aluminium">ALUMINIUM</option>
                    <option value="Brass">BRASS</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Intake Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full form-input px-3"
                  >
                    <option value="Collected">COLLECTED</option>
                    <option value="Processing">PROCESSING</option>
                    <option value="Refined">REFINED</option>
                    <option value="Sold">SOLD</option>
                  </select>
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg leading-relaxed">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  disabled={aiAnalyzing}
                  onClick={() => { setIsEditOpen(false); resetFormStates(); }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiAnalyzing}
                  className="flex items-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold transition-all duration-200"
                >
                  {aiAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Analyzing Photo...
                    </>
                  ) : (
                    'Save Adjustments'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapManagement;