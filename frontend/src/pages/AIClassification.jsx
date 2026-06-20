import React, { useState, useRef } from 'react';
import { aiAPI } from '../services/api';
import {
  Cpu,
  Upload,
  Loader2,
  Sparkles,
  Scale,
  Activity,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

const AIClassification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      setError(null);
    }
  };

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await aiAPI.predict(formData);
      setResult(response.data.data);
    } catch (err) {
      console.error('Classification Failure:', err);
      setError(err.response?.data?.message || 'AI Classification failed. Ensure backend has connection permissions.');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score) => {
    if (score > 90) return 'bg-emerald-500 text-emerald-400 border-emerald-500/20 shadow-neon-green';
    if (score > 75) return 'bg-amber-500 text-amber-400 border-amber-500/20 shadow-neon-amber';
    return 'bg-red-500 text-red-400 border-red-500/20';
  };

  const getMetalDescription = (metal) => {
    switch (metal) {
      case 'Copper':
        return 'Characterized by high electrical conductivity and red-orange metallic luster. Often sourced from wiring, copper tubing, or electrical components. Reclaims highest resale margins.';
      case 'Steel':
        return 'High-strength structural iron alloy. Highly magnetic. Sourced commonly from structural beams, rebar, machinery components, and automotive frames. Standard base industrial grade.';
      case 'Aluminium':
        return 'Lightweight, silver-metallic non-ferrous element. Sourced from extrusion profiles, automotive casings, sheets, and beverage containers. Highly recyclable with low smelting loss.';
      case 'Brass':
        return 'Copper-zinc alloy. Characterized by muted yellow-gold hue, lower magnetic signature, and excellent friction traits. Commonly sourced from plumbing fixtures, valves, and shell casings.';
      default:
        return 'Standard metallic scrap profile. Run secondary visual verification to validate specific metal categories before storage.';
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">AI Classification Console</h2>
        <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">
          MobileNetV2 neural classification engine
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: UPLOAD CONSOLE */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" />
              Scrap visual scanner
            </h3>
            <Cpu className="w-4 h-4 text-slate-600" />
          </div>

          <form onSubmit={handlePredictSubmit} className="space-y-6 text-xs font-mono">
            {/* Drag & Drop Visual Upload Target */}
            <div
              onClick={() => { if (!loading) fileInputRef.current.click(); }}
              className="border border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-8 bg-slate-950/60 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden min-h-[180px]"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              
              {previewUrl ? (
                <div className="w-full flex flex-col items-center gap-3 z-10">
                  <img
                    src={previewUrl}
                    alt="Visual file intake preview"
                    className="max-h-48 object-cover rounded-lg border border-slate-800 shadow-md"
                  />
                  <span className="text-[9px] text-slate-500">Intake photo loaded. Click block to swap files.</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 z-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-slate-400 font-bold">Upload Scrap Metal Image</span>
                  <span className="text-[9px] text-slate-600">Supports JPG, PNG formats up to 5MB</span>
                </div>
              )}
            </div>

            {/* Run Button */}
            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-100 disabled:text-slate-500 rounded-xl font-bold uppercase transition-all duration-300 shadow-neon-amber select-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-400" />
                  AI Scanning Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Trigger Neural Classification
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] leading-relaxed rounded-xl font-mono">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI REPORT RESULTS */}
        <div className="space-y-6">
          {result ? (
            <div className="glass-panel p-6 space-y-6 relative overflow-hidden animate-[fadeIn_0.3s_ease-out]">
              {/* Glowing top line */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                  <Activity className="w-4 h-4" />
                  AI Classification Report
                </h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>

              {/* Classification Category Block */}
              <div className="flex items-center justify-between font-mono bg-slate-950 p-4 rounded-xl border border-slate-900">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Predicted Metal</span>
                  <p className="text-2xl font-black text-slate-100 tracking-tight">{result.predictedType}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Confidence</span>
                  <p className="text-2xl font-black text-slate-100">{result.confidence}%</p>
                </div>
              </div>

              {/* Progress bar of confidence score */}
              <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>Model Confidence Weight</span>
                  <span>{result.confidence}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden">
                  <div
                    className={`h-full ${
                      result.confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'
                    } rounded-sm`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Metal Specs Description */}
              <div className="space-y-2 font-mono text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Characteristics Spec</span>
                <p>{getMetalDescription(result.predictedType)}</p>
              </div>

              {/* Technical Audit Trace */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 text-[9px] font-mono text-slate-500 space-y-1.5 leading-relaxed">
                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Model Telemetry Audit Trace</p>
                <p>Classifier: <span className="text-slate-300">TensorFlow.js MobileNetV2</span></p>
                <p>Core Model Input Resolution: <span className="text-slate-300">224 x 224 x 3 Tensors</span></p>
                <p>Telemetry: <span className="text-slate-300">{result.rawLabel}</span></p>
                <p>Prediction Hash: <span className="text-slate-300">Deterministically mapped via pixel characteristics</span></p>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 min-h-[300px] flex flex-col items-center justify-center text-center text-slate-500 text-xs font-mono border border-dashed border-slate-800">
              <Cpu className="w-10 h-10 text-slate-700 mb-4 animate-[pulse_3s_infinite]" />
              <p className="font-bold text-slate-400 uppercase tracking-widest mb-1.5">Awaiting Intake Scan</p>
              <p className="max-w-xs leading-relaxed text-slate-600">
                Upload a photo in the scanner console and trigger classification to view real-time neural audits.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIClassification;
