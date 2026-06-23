import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSales, recordSale } from "../redux/salesSlice";
import { fetchInventory } from "../redux/inventorySlice";
import {
  DollarSign,
  Plus,
  Loader2,
  Trash2,
  TrendingUp,
  UserCheck,
  Scale,
  Building,
  AlertTriangle,
  X,
  FileCheck2,
} from "lucide-react";

const SalesManagement = () => {
  const dispatch = useDispatch();

  // Redux States
  const { transactions, loading, error } = useSelector((state) => state.sales);
  const { items: inventoryItems } = useSelector((state) => state.inventory);
  const { user } = useSelector((state) => state.auth);

  // Modal controls
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Form states
  const [buyerName, setBuyerName] = useState("");
  const [metalType, setMetalType] = useState("Copper");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    dispatch(fetchSales());
    dispatch(fetchInventory());
  }, [dispatch]);

  // Standard scrap metal pricing estimates ($ / kg)
  const PRICING_ESTIMATES = {
    Copper: 8.0, // $8/kg
    Steel: 0.35, // $0.35/kg
    Aluminium: 2.2, // $2.20/kg
    Brass: 4.8, // $4.80/kg
  };

  // Get current stock available in inventory for the selected metal
  const getSelectedMetalStock = () => {
    const inv = inventoryItems.find((item) => item.metalType === metalType);
    return inv ? inv.quantity : 0;
  };

  // Dynamically update suggested price when quantity or metalType shifts
  useEffect(() => {
    if (quantity && !isNaN(quantity)) {
      const rate = PRICING_ESTIMATES[metalType] || 1;
      const calculated = parseFloat(quantity) * rate;
      setPrice(calculated.toFixed(2));
    } else {
      setPrice("");
    }
  }, [quantity, metalType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    const activeStock = getSelectedMetalStock();
    const qtyValue = parseFloat(quantity);

    // 1. Validation checks
    if (!buyerName || !quantity || !price) {
      setValidationError("All fields are required.");
      return;
    }

    if (qtyValue > activeStock) {
      setValidationError(
        `Insufficient Stock: Cannot sell ${qtyValue}kg of ${metalType}. Warehouse inventory is only ${activeStock.toLocaleString()}kg.`,
      );
      return;
    }

    try {
      await dispatch(
        recordSale({
          buyerName,
          metalType,
          quantity: qtyValue,
          price: parseFloat(price),
        }),
      ).unwrap();

      // Close modal and reset states
      setIsOpen(false);
      setBuyerName("");
      setQuantity("");
      setPrice("");
      setValidationError("");
    } catch (err) {
      console.error("Failed to log sale:", err);
    }
  };

  const getMetalColor = (type) => {
    switch (type) {
      case "Copper":
        return "text-amber-500";
      case "Steel":
        return "text-slate-400";
      case "Aluminium":
        return "text-sky-300";
      case "Brass":
        return "text-yellow-600";
      default:
        return "text-slate-300";
    }
  };

  const totalSalesVolume = transactions.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">
            Sales Ledger Registry
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">
            Audit history & contract logs
          </p>
        </div>

        <button
          onClick={() => {
            setIsOpen(true);
            setValidationError("");
          }}
          className="flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all duration-300 shadow-neon-amber select-none cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Sale Transaction
        </button>
      </div>

      {/* DYNAMIC METRICS BOX CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center justify-between">
          <div className="space-y-1.5 font-mono">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Gross Revenue Yield
            </span>
            <h3 className="text-3xl font-black text-slate-100 tracking-tight">
              ${totalSalesVolume.toLocaleString()}
            </h3>
            <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              STABLE SALES YIELD
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div className="space-y-1.5 font-mono">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Completed Contracts
            </span>
            <h3 className="text-3xl font-black text-slate-100 tracking-tight">
              {transactions.length}{" "}
              <span className="text-xs text-slate-500 font-semibold">
                Ledgers
              </span>
            </h3>
            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
              100% RECONCILED AUDIT
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div className="space-y-1.5 font-mono">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Resale benchmark rates
            </span>
            <div className="grid grid-cols-2 gap-x-3 text-[9px] text-slate-400">
              <div>
                Copper:{" "}
                <span className="text-amber-500 font-bold">$8.0/kg</span>
              </div>
              <div>
                Steel:{" "}
                <span className="text-slate-400 font-bold">$0.35/kg</span>
              </div>
              <div>
                Alum: <span className="text-sky-300 font-bold">$2.2/kg</span>
              </div>
              <div>
                Brass:{" "}
                <span className="text-yellow-600 font-bold">$4.8/kg</span>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CORE HISTORICAL SALES TABLE */}
      <div className="glass-panel overflow-hidden">
        {loading && !isOpen ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 text-sm font-mono">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
            Loading transaction registers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold bg-slate-900/30">
                  <th className="py-4 pl-6">Buyer Corporate</th>
                  <th className="py-4">Metal Sold</th>
                  <th className="py-4 text-right">Quantity Weight</th>
                  <th className="py-4 text-right">Contract Value ($)</th>
                  <th className="py-4">Authorized By</th>
                  <th className="py-4 text-right pr-6">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-900/40 transition-colors"
                  >
                    {/* Buyer */}
                    <td className="py-4 pl-6 font-bold flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-200">{t.buyerName}</span>
                    </td>

                    {/* Metal Type */}
                    <td className="py-4">
                      <span
                        className={`font-bold ${getMetalColor(t.metalType)}`}
                      >
                        {t.metalType}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="py-4 text-right font-black text-slate-300 text-sm">
                      {t.quantity.toLocaleString()}
                      <span className="text-[10px] text-slate-500 font-semibold ml-1">
                        kg
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 text-right font-black text-emerald-400 text-sm">
                      $
                      {t.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Sold By */}
                    <td className="py-4 space-y-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-300 text-[10px]">
                        <UserCheck className="w-3 h-3 text-amber-500" />
                        {t.soldBy?.name || "Authorized Lead"}
                      </span>
                      <span className="text-[9px] text-slate-500 block leading-tight">
                        {t.soldBy?.role || "Admin"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 text-right pr-6 text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-16 text-center text-slate-500 font-normal"
                    >
                      No sales transactions recorded in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD TRANSACTION MODAL SHEET --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false);
              setValidationError("");
            }}
          />

          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 text-xs font-mono animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                Record Outgoing Sale
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setValidationError("");
                }}
                className="text-slate-500 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Validation errors alert box */}
              {(validationError || error) && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{validationError || error}</span>
                </div>
              )}

              {/* Metal select & stock feedback box */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Metal Commodity
                  </label>
                  <select
                    value={metalType}
                    onChange={(e) => {
                      setMetalType(e.target.value);
                      setValidationError("");
                    }}
                    className="w-full form-input px-3"
                  >
                    <option value="Copper">COPPER</option>
                    <option value="Steel">STEEL</option>
                    <option value="Aluminium">ALUMINIUM</option>
                    <option value="Brass">BRASS</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Available Stock
                  </span>
                  <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-slate-300 font-bold flex justify-between items-center h-[38px]">
                    <span>{getSelectedMetalStock().toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Buyer Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Buyer Organization
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Global Smelting Corp"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full form-input form-input-pl-9"
                    required
                  />
                </div>
              </div>

              {/* Quantity & price calculator */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Sale weight (kg)
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 2400.0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full form-input form-input-pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Contract Total ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 19200.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full form-input form-input-pl-9 font-bold text-emerald-400 focus:border-amber-500"
                      required
                    />
                  </div>
                  <span className="text-[8px] text-slate-500 block leading-tight pt-1">
                    Suggested price rate auto-filled
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setValidationError("");
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {loading ? "Processing..." : "Execute Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
