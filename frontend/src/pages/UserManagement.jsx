import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Mail,
  KeyRound,
  ShieldAlert,
  Loader2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { useSelector } from 'react-redux';

const UserManagement = () => {
  const currentUser = useSelector((state) => state.auth.user);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Worker'
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await usersAPI.getUsers();
      if (response.data && response.data.success) {
        setUsers(response.data.data);
      } else {
        setError('Failed to extract users directory.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server connection error during user fetch.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Worker'
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // blank to indicate no password update unless written
      role: user.role
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const { name, email, password, role } = formData;
    if (!name || !email || !password || !role) {
      setFormError('All registration fields are required.');
      setFormLoading(false);
      return;
    }

    if (password.length < 6) {
      setFormError('Temporary password must be at least 6 characters.');
      setFormLoading(false);
      return;
    }

    try {
      const response = await usersAPI.createUser(formData);
      if (response.data && response.data.success) {
        setSuccess(`User Account '${name}' registered successfully!`);
        setIsCreateOpen(false);
        fetchUsers();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to create user record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const { name, email, role } = formData;
    if (!name || !email || !role) {
      setFormError('Name, email, and role assignments are mandatory.');
      setFormLoading(false);
      return;
    }

    try {
      const response = await usersAPI.updateUser(selectedUser._id, formData);
      if (response.data && response.data.success) {
        setSuccess(`Operator profile '${name}' adjusted successfully.`);
        setIsEditOpen(false);
        fetchUsers();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to update user record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === currentUser?._id) {
      setError('Operational Guard: You cannot delete your own active administrative session.');
      return;
    }

    if (!window.confirm(`Are you absolutely sure you want to permanently revoke system access for operator: ${name}?`)) {
      return;
    }

    try {
      const response = await usersAPI.deleteUser(id);
      if (response.data && response.data.success) {
        setSuccess(`User system credentials for '${name}' have been purged.`);
        fetchUsers();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to execute record deletion.');
    }
  };

  // Filter & Search users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500/10 text-red-400 border border-red-500/25';
      case 'Manager':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 'Worker':
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-slate-100 flex items-center gap-3">
            <Users className="w-7 h-7 text-amber-500" />
            USER DIRECTORY & ACCESS CONTROL
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mt-1">
            System Administration Panel • Identity and Access Governance
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-100 rounded-lg font-bold text-xs shadow-md glow-btn-amber hover:shadow-neon-amber transition-all duration-300 border border-amber-500/20 select-none cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          PROVISION NEW OPERATOR
        </button>
      </div>

      {/* 2. Global Feedback Alerts */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-xs tracking-wide animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold uppercase tracking-widest text-[10px]">Operation Verified</p>
            <p className="mt-0.5 leading-relaxed font-mono">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs tracking-wide animate-[fadeIn_0.2s_ease-out]">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold uppercase tracking-widest text-[10px]">Administrative Intercept</p>
            <p className="mt-0.5 leading-relaxed font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* 3. Search and Filters ledger bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search operators by name or credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full form-input form-input-pl-10 focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Role Filter:</span>
          <div className="flex gap-1.5 flex-1 md:flex-initial">
            {['All', 'Admin', 'Manager', 'Worker'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  roleFilter === role
                    ? 'bg-amber-600/10 border-amber-500/40 text-amber-500 shadow-neon-amber'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Users Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Replicating directory indices...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No operational personnel matched query criteria.</p>
            <p className="text-xs mt-1">Adjust search parameters or registers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  <th className="px-6 py-4">Operator Name</th>
                  <th className="px-6 py-4">Security ID / Email</th>
                  <th className="px-6 py-4">Privilege Role</th>
                  <th className="px-6 py-4">Provision Date</th>
                  <th className="px-6 py-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                          {user.name.substring(0, 2)}
                        </div>
                        <div>
                          <span>{user.name}</span>
                          {user._id === currentUser?._id && (
                            <span className="ml-2 inline-block text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded px-1 font-mono uppercase font-bold">
                              Current Session
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 select-all">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded font-extrabold uppercase ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:border-amber-500/40 hover:text-amber-500 transition-all cursor-pointer text-slate-400"
                          title="Modify Account Privileges"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={user._id === currentUser?._id}
                          className={`p-1.5 bg-slate-950 border border-slate-800 rounded-lg transition-all text-slate-400 ${
                            user._id === currentUser?._id
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:border-red-500/40 hover:text-red-400 cursor-pointer'
                          }`}
                          title={user._id === currentUser?._id ? 'Self-deletion restricted' : 'Revoke System Access'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-100 tracking-wider flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-amber-500" />
              PROVISION OPERATOR
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-6">
              Create credentials for secure terminal logins
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-red-400 text-xs animate-[fadeIn_0.15s_ease-out]">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed font-mono">{formError}</p>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="create-name">
                  Full Operator Name
                </label>
                <input
                  id="create-name"
                  name="name"
                  type="text"
                  placeholder="e.g. Marcus Aurelius"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="create-email">
                  Operational Email (Login ID)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="create-email"
                    name="email"
                    type="email"
                    placeholder="operator@scrap.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full form-input form-input-pl-10 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="create-password">
                  Temporary Terminal Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    id="create-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full form-input form-input-pl-10 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="create-role">
                  Privilege Assignment Group
                </label>
                <select
                  id="create-role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-input focus:border-amber-500 cursor-pointer appearance-none bg-slate-900"
                >
                  <option value="Worker">Worker (Intake/Processing Operations)</option>
                  <option value="Manager">Manager (Sales & Adjustments)</option>
                  <option value="Admin">Admin (Full Identity/Access Controls)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-100 disabled:text-slate-500 rounded-lg font-bold text-xs glow-btn-amber hover:shadow-neon-amber border border-amber-500/20 cursor-pointer"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      Provisioning...
                    </>
                  ) : (
                    'Finalize Registration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT USER MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-100 tracking-wider flex items-center gap-2 mb-2">
              <Edit2 className="w-5 h-5 text-amber-500" />
              MODIFY OPERATOR PROFILE
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-6">
              Update roles and credentials for: <span className="text-amber-500 font-bold">{selectedUser?.name}</span>
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-red-400 text-xs animate-[fadeIn_0.15s_ease-out]">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed font-mono">{formError}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="edit-name">
                  Full Operator Name
                </label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="edit-email">
                  Operational Email (Login ID)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full form-input form-input-pl-10 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="edit-password">
                  Terminal Password Override (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    id="edit-password"
                    name="password"
                    type="password"
                    placeholder="Leave blank to retain original password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full form-input form-input-pl-10 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="edit-role">
                  Privilege Assignment Group
                </label>
                {selectedUser?._id === currentUser?._id ? (
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-500 text-xs font-semibold leading-relaxed font-mono">
                    Operational Guard: You cannot alter your own administrative role. Let another Admin execute this role shift if required.
                  </div>
                ) : (
                  <select
                    id="edit-role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-input focus:border-amber-500 cursor-pointer appearance-none bg-slate-900"
                  >
                    <option value="Worker">Worker (Intake/Processing Operations)</option>
                    <option value="Manager">Manager (Sales & Adjustments)</option>
                    <option value="Admin">Admin (Full Identity/Access Controls)</option>
                  </select>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-100 disabled:text-slate-500 rounded-lg font-bold text-xs glow-btn-amber hover:shadow-neon-amber border border-amber-500/20 cursor-pointer"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      Saving changes...
                    </>
                  ) : (
                    'Apply Modifications'
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

export default UserManagement;
