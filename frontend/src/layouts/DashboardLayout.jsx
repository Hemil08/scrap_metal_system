import React, {useState} from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/authSlice'
import {
    LayoutDashboard,
    Recycle,
    Boxes,
    Cpu,
    Route,
    DollarSign,
    Users,
    LogOut,
    Menu,
    X,
    UserCheck
} from 'lucide-react'

const DashboardLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Sidebar Links based on Roles
  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Worker'] },
    { name: 'Scrap Records', path: '/scrap', icon: Recycle, roles: ['Admin', 'Manager', 'Worker'] },
    { name: 'Stock Inventory', path: '/inventory', icon: Boxes, roles: ['Admin', 'Manager', 'Worker'] },
    { name: 'AI Classifier', path: '/ai-classification', icon: Cpu, roles: ['Admin', 'Manager', 'Worker'] },
    { name: 'Workflow Tracker', path: '/workflow', icon: Route, roles: ['Admin', 'Manager', 'Worker'] },
    { name: 'Sales Registry', path: '/sales', icon: DollarSign, roles: ['Admin', 'Manager'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['Admin'] },
  ];

  const activeLinkClass = "flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-amber-600/10 text-amber-500 border border-amber-500/20 shadow-neon-amber transition-all duration-300";
  const inactiveLinkClass = "flex items-center px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg border border-transparent transition-all duration-300";

  // Role Badge Styling Helper
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'Manager':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Worker':
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800/80 flex-shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-wider text-slate-100">
            SMART<span className="text-amber-500">-SCRAP</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={isActive ? activeLinkClass : inactiveLinkClass}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
        </nav>

        {/* User Footer Panel */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 rounded font-bold ${getRoleBadge(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all duration-300"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION DRAWER */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between px-6 lg:px-8 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-slate-400 hover:text-slate-100 focus:outline-none"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-sm lg:text-base font-semibold text-slate-300">
              Operations Control Panel
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-300">{user?.name}</span>
              <span className="text-[10px] text-slate-500">{user?.email}</span>
            </div>
            <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded font-extrabold uppercase ${getRoleBadge(user?.role)}`}>
              {user?.role}
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30 flex">
            {/* Overlay */}
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            
            {/* Drawer */}
            <div className="relative w-64 max-w-xs bg-slate-900 border-r border-slate-800 flex flex-col">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                    <Recycle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-extrabold text-lg tracking-wider text-slate-100">SMART-SCRAP</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navigationItems
                  .filter((item) => item.roles.includes(user?.role))
                  .map((item) => {
                    const IconComponent = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={isActive ? activeLinkClass : inactiveLinkClass}
                      >
                        <IconComponent className="w-4 h-4 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
              </nav>

              <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all duration-300"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;