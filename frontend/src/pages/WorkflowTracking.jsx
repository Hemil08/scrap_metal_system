import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScrapRecords, editScrapRecord } from '../redux/scrapSlice';
import { fetchInventory } from '../redux/inventorySlice';
import {
  Boxes,
  Loader2,
  MapPin,
  Scale,
  ArrowRight,
  Route,
  Activity,
  ShoppingBag
} from 'lucide-react';

const WorkflowTracking = () => {

  const dispatch = useDispatch()
  const { records, loading } = useSelector((state) => state.scrap);

  useEffect(() => {
    dispatch(fetchScrapRecords());
  }, [dispatch]);

  const stages = [
    { id: 'Collected', name: 'Collected', icon: MapPin, color: 'border-blue-500/30 text-blue-400 bg-blue-500/5', iconColor: 'text-blue-400' },
    { id: 'Processing', name: 'Processing', icon: Activity, color: 'border-amber-500/30 text-amber-400 bg-amber-500/5', iconColor: 'text-amber-400' },
    { id: 'Refined', name: 'Refined', icon: Boxes, color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', iconColor: 'text-emerald-400' },
    { id: 'Sold', name: 'Sold', icon: ShoppingBag, color: 'border-slate-700/60 text-slate-400 bg-slate-800/10', iconColor: 'text-slate-500' },
  ];

  const handleStageChange = async (record, newStage) => {
    if (record.status === newStage) return 

    // Create a multipart formdata container to patch status
    const formData = new FormData();
    formData.append('status', newStage);
    formData.append('weight', record.weight);
    formData.append('supplier', record.supplier);
    formData.append('metalType', record.metalType);

    try {
      await dispatch(editScrapRecord({ id: record._id, formData })).unwrap();
      // Instantly sync inventory aggregates
      dispatch(fetchInventory());
    } catch (err) {
      console.error('Failed to shift record stage:', err);
    }
  }

  const getMetalColor = (type) => {
    switch (type) {
      case 'Copper': return 'bg-amber-600/10 text-amber-500 border border-amber-500/20';
      case 'Steel': return 'bg-slate-500/10 text-slate-400 border border-slate-700/50';
      case 'Aluminium': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'Brass': return 'bg-yellow-700/10 text-yellow-500 border border-yellow-700/20';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">Process Pipeline Tracking</h2>
        <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">
          Intake Flow Bays // Collected to Sold Lifecycle
        </p>
      </div>

      {/* OPERATIONAL PIPELINE COLUMNS BOARD */}
      {loading && records.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-500 text-sm font-mono glass-panel">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
          Synchronizing operational pipeline columns...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const IconComponent = stage.icon;
            const stageRecords = records.filter((r) => r.status === stage.id);
            const totalStageWeight = stageRecords.reduce((sum, r) => sum + r.weight, 0);

            return (
              <div key={stage.id} className="flex flex-col min-h-[500px] bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
                {/* Column Header */}
                <div className={`p-4 border-b border-slate-800 flex items-center justify-between font-mono ${stage.color}`}>
                  <div className="flex items-center gap-2.5">
                    <IconComponent className={`w-4 h-4 ${stage.iconColor}`} />
                    <span className="font-extrabold uppercase text-xs tracking-wider">{stage.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-800/80 text-slate-300 font-bold">
                    {stageRecords.length}
                  </span>
                </div>

                {/* Total Column Weight */}
                <div className="p-3 bg-slate-950/30 border-b border-slate-800/30 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>BAY LOAD:</span>
                  <span className="font-bold text-slate-300">{totalStageWeight.toLocaleString()} kg</span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[55vh] scrollbar-thin">
                  {stageRecords.map((record) => (
                    <div
                      key={record._id}
                      className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-4 hover:border-slate-700/80 transition-all duration-300 relative shadow-md group overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-slate-800 group-hover:bg-amber-600 transition-colors"></div>

                      {/* Header details */}
                      <div className="flex justify-between items-start font-mono text-[10px]">
                        <span className={`px-2 py-0.5 mt-0.5 rounded font-extrabold uppercase ${getMetalColor(record.metalType)}`}>
                          {record.metalType}
                        </span>
                        <span className="text-slate-500 font-bold">
                          ID: #{record._id.slice(-4).toUpperCase()}
                        </span>
                      </div>

                      {/* Supplier & Bay Location */}
                      <div className="space-y-1 text-xs">
                        <h4 className="font-extrabold text-slate-200 truncate">{record.supplier}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <MapPin className="w-3 h-3" />
                          <span>{record.location}</span>
                        </div>
                      </div>

                      {/* Weight volume indicators */}
                      <div className="flex justify-between items-center border-t border-slate-800/60 pt-3">
                        <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-300">
                          <Scale className="w-3.5 h-3.5 text-slate-500" />
                          <span>{record.weight.toLocaleString()} kg</span>
                        </div>
                        
                        {/* Selector control to switch bays */}
                        <div className="relative">
                          <select
                            value={record.status}
                            onChange={(e) => handleStageChange(record, e.target.value)}
                            className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg pl-2 pr-6 py-1 text-[9px] outline-none transition-all font-mono appearance-none uppercase cursor-pointer"
                          >
                            <option value="Collected">MOVE: INT</option>
                            <option value="Processing">MOVE: PRO</option>
                            <option value="Refined">MOVE: REF</option>
                            <option value="Sold">MOVE: SLD</option>
                          </select>
                          <ArrowRight className="w-3 h-3 text-slate-600 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageRecords.length === 0 && (
                    <div className="h-44 flex flex-col items-center justify-center text-center text-slate-600 text-[10px] border border-dashed border-slate-800/80 rounded-xl">
                      <Route className="w-6 h-6 text-slate-800 mb-2" />
                      No active cargo
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default WorkflowTracking