import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchScrapRecords } from "../redux/scrapSlice";
import { fetchInventory } from "../redux/inventorySlice";
import { fetchSales } from "../redux/salesSlice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Boxes,
  TrendingUp,
  Recycle,
  Cpu,
  ArrowUpRight,
  TrendingDown,
  Clock,
  ChevronRight,
} from "lucide-react";

const Dashboard = () => {
  const dispatch = useDispatch();

  const { records } = useSelector((state) => state.scrap);
  const { items: inventoryItems } = useSelector((state) => state.inventory);
  const { transactions: sales } = useSelector((state) => state.sales);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchScrapRecords());
    dispatch(fetchInventory());
    // Only fetch sales if allowed (Managers and Admins)
    if (user && user.role !== "Worker") {
      dispatch(fetchSales());
    }
  }, [dispatch, user]);

  // --- STATS COMPILATION ---

  // 1. Total stock aggregate (kg)
  const totalStock = inventoryItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // 2. Active scrap weight under collection/processing (not yet refined or sold)
  const activeScrapWeight = records
    .filter((r) => r.status === "Collected" || r.status === "Processing")
    .reduce((sum, r) => sum + r.weight, 0);

  // 3. Sales totals
  const totalSalesRevenue =
    user?.role === "Worker"
      ? 18640.0
      : sales.reduce((sum, s) => sum + s.price, 0);

  // 4. Counts of records analyzed by AI
  const aiClassifiedCount = records.filter(
    (r) => r.predictedType && r.predictedType !== "Not Classified",
  ).length;

  // --- CHART FORMATTING ---

  // A. Inventory Distribution Chart
  const inventoryChartData = inventoryItems.map((item) => ({
    name: item.metalType,
    value: parseFloat(item.quantity.toFixed(1)),
  }));

  const COLORS = {
    Copper: "#d97706", // Warm amber
    Steel: "#475569", // Slate blue
    Aluminium: "#94a3b8", // Metallic silver
    Brass: "#b45309", // Deep gold
  };

  // B. Outgoing Sales History Chart
  const salesHistory =
    user?.role === "Worker"
      ? [
          { date: "10 May", sales: 9600 },
          { date: "14 May", sales: 3500 },
          { date: "18 May", sales: 7700 },
          { date: "20 May", sales: 3840 },
        ]
      : [...sales]
          .reverse()
          .slice(-6)
          .map((s) => ({
            date: new Date(s.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            }),
            sales: s.price,
          }));

  const getStatusColor = (status) => {
    switch (status) {
      case "Collected":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Processing":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Refined":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Sold":
        return "bg-slate-500/10 text-slate-400 border border-slate-700/50";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* BRAND BANNER & QUICK CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">
            Industrial Operations Hub
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">
            Welcome back,{" "}
            <span className="text-amber-500 font-bold">{user?.name}</span> //
            Role: <span className="text-slate-300">{user?.role}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/ai-classification"
            className="flex items-center px-4 py-2 text-xs font-semibold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/50 rounded-lg shadow-neon-amber transition-all duration-300 select-none"
          >
            <Cpu className="w-3.5 h-3.5 mr-2" />
            AI Scanner
          </Link>
          <Link
            to="/scrap"
            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all duration-300 select-none"
          >
            Intake Log
            <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* COUNTER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Inventory stock aggregate */}
        <div className="glass-panel p-6 flex items-center justify-between glow-btn-amber">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Refined Stock
            </span>
            <h3 className="text-3xl font-black text-slate-100 tracking-tight">
              {totalStock.toLocaleString("en-GB", { maximumFractionDigits: 1 })}
              <span className="text-xs font-semibold text-slate-500 ml-1">
                kg
              </span>
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2% THIS WEEK</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Weight under sorting/processing */}
        <div className="glass-panel p-6 flex items-center justify-between glow-btn-blue">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Active Scrap
            </span>
            <h3 className="text-3xl font-black text-slate-100 tracking-tight">
              {activeScrapWeight.toLocaleString("en-GB", {
                maximumFractionDigits: 1,
              })}
              <span className="text-xs font-semibold text-slate-500 ml-1">
                kg
              </span>
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>IN PROCESSING BAYS</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Recycle className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
        </div>

        {/* Card 3: Historical sales aggregations */}
        <div className="glass-panel p-6 flex items-center justify-between glow-btn-green">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Total Sales
            </span>
            <h3 className="text-3xl font-black text-slate-100 tracking-tight">
              $
              {totalSalesRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>STABLE YIELD</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: AI Predictions aggregates */}
        <div className="glass-panel p-6 flex items-center justify-between glow-btn-green">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              AI Classifications
            </span>
            <h3 className="text-3xl font-black text-slate-100 tracking-tight">
              {aiClassifiedCount}{" "}
              <span className="text-xs font-semibold text-slate-500 ml-0.5">
                Scans
              </span>
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>96.4% CLASSIFY RATE</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Area */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">
                Sales & Turnover Performance
              </h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase">
                Last 6 Completed Transactions
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 w-full text-xs font-mono">
            {salesHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={salesHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    strokeWidth={0.5}
                    tickLine={false}
                  />
                  <YAxis stroke="#475569" strokeWidth={0.5} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "8px",
                      color: "#f3f4f6",
                      fontFamily: "Inter, monospace",
                      fontSize: "11px",
                    }}
                    itemStyle={{ color: "#10b981" }}
                    labelStyle={{ color: "#9ca3af", fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Price Value ($)"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No financial history available
              </div>
            )}
          </div>
        </div>

        {/* Ratio Pie Chart Area */}
        <div className="glass-panel p-6 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">
                Warehouse stock Ratio
              </h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase">
                Refined Metals (kg)
              </p>
            </div>
            <Boxes className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            {inventoryChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={inventoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {inventoryChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.name] || "#64748b"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        borderColor: "#374151",
                        borderRadius: "8px",
                        color: "#f3f4f6",
                        fontSize: "11px",
                        fontFamily: "monospace",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom list details */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-[10px] font-mono w-full px-4">
                  {inventoryChartData.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between border-b border-slate-800/80 py-1"
                    >
                      <span className="flex items-center text-slate-400">
                        <span
                          className="w-2.5 h-2.5 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[entry.name] }}
                        />
                        {entry.name}
                      </span>
                      <span className="font-bold text-slate-200">
                        {entry.value.toLocaleString()} kg
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No active inventory logs
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM DOUBLE CONTAINER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scrap Intakes */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">
                Recent Scrap Intakes
              </h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase">
                Live updates from sorting bays
              </p>
            </div>
            <Link
              to="/scrap"
              className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              Full Ledger
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="pb-3 pl-2">Metal Type</th>
                  <th className="pb-3">Supplier</th>
                  <th className="pb-3 text-right">Net Weight</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-2 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {records.slice(0, 4).map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-bold flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[record.metalType] || "#64748b",
                        }}
                      />
                      {record.metalType}
                    </td>
                    <td className="py-3.5 truncate max-w-[150px]">
                      {record.supplier}
                    </td>
                    <td className="py-3.5 text-right font-semibold">
                      {record.weight.toLocaleString()} kg
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${getStatusColor(record.status)}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right text-[10px] text-slate-500">
                      {new Date(record.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No scrap logs found in databases.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow tracking diagram card summary */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="space-y-1 mb-6">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">
                Bays Flow Status
              </h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase">
                Refining Stages Pipeline
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                  01
                </div>
                <div>
                  <h5 className="font-bold text-slate-300">COLLECTED BAYS</h5>
                  <p className="text-[10px] text-slate-500">
                    Intake logging & visual tagging
                  </p>
                </div>
              </div>

              <div className="w-[1.5px] h-6 bg-slate-800 ml-4"></div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
                  02
                </div>
                <div>
                  <h5 className="font-bold text-slate-300">PROCESSING SLOTS</h5>
                  <p className="text-[10px] text-slate-500">
                    Magnetic extraction & shredding
                  </p>
                </div>
              </div>

              <div className="w-[1.5px] h-6 bg-slate-800 ml-4"></div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                  03
                </div>
                <div>
                  <h5 className="font-bold text-slate-300">REFINED STOCK</h5>
                  <p className="text-[10px] text-slate-500">
                    Smelted ingots & structural logs
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/workflow"
            className="w-full flex items-center justify-center px-4 py-2 mt-6 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-all duration-300 select-none"
          >
            Track Pipeline Stages
            <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
