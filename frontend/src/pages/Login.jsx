import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearAuthError } from '../redux/authSlice';
import { Recycle, AlertTriangle, KeyRound, Mail, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Proactively clear historical authentication errors
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    // If already logged in, navigate straight to the dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Form inputs validation
    if (!email || !password) {
      setValidationError('Please specify both registered email and password credentials.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Security credentials must be a minimum of 6 characters.');
      return;
    }

    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background industrial grid visuals */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 z-0"></div>
      
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md z-10">
        {/* Core Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg border border-amber-500/20 mb-4 animate-pulse">
            <Recycle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-wider">
            SMART<span className="text-amber-500">-SCRAP</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 uppercase tracking-widest font-mono">
            AI-Integrated Command Center
          </p>
        </div>

        {/* Login Form Sheet */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>

          <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            Security Authentication
          </h2>

          {/* Validation Alert Boxes */}
          {(validationError || error) && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs animate-[fadeIn_0.2s_ease-out]">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Access Denied</p>
                <p className="mt-0.5 leading-relaxed">{validationError || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="email-input">
                Operation Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  placeholder="name@scrap.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full form-input form-input-pl-10 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/35"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="password-input">
                  Operator Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full form-input form-input-pl-10 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/35"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-100 disabled:text-slate-500 rounded-xl font-semibold text-sm shadow-md hover:shadow-neon-amber transition-all duration-300 border border-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 select-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-400" />
                  Verifying Authorization...
                </>
              ) : (
                'Access Control Panel'
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Helper Cheat-Sheet */}
        <div className="mt-6 p-4 bg-slate-900/40 border border-slate-800/40 rounded-xl text-center text-[10px] text-slate-500 leading-relaxed font-mono">
          <p className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">MSc Prototype Demo accounts</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-red-400 block font-semibold">Admin</span>
              admin@scrap.com
            </div>
            <div>
              <span className="text-emerald-400 block font-semibold">Manager</span>
              manager@scrap.com
            </div>
            <div>
              <span className="text-amber-400 block font-semibold">Worker</span>
              worker@scrap.com
            </div>
          </div>
          <p className="mt-2 text-slate-600">Password for all accounts: <span className="text-slate-400">Password123</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
