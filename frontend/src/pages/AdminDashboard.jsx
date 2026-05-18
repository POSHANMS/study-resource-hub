import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, resRes, usersRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/resources'),
        axios.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setResources(resRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm('Permanently delete this resource?')) return;
    try {
      await axios.delete(`/admin/resources/${id}`);
      setResources((prev) => prev.filter((r) => r._id !== id));
      setStats((s) => ({ ...s, totalResources: s.totalResources - 1 }));
    } catch { alert('Failed to delete'); }
  };

  const handleToggleApprove = async (id) => {
    try {
      const { data } = await axios.put(`/admin/resources/${id}/approve`);
      setResources((prev) => prev.map((r) => r._id === id ? data.resource : r));
    } catch { alert('Failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch { alert('Failed'); }
  };

  const handleToggleRole = async (id) => {
    try {
      const { data } = await axios.put(`/admin/users/${id}/role`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role: data.user.role } : u));
    } catch { alert('Failed'); }
  };

  if (!user || user.role !== 'admin') return null;

  const StatCard = ({ label, value, color }) => (
    <div className="card p-6">
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );

  return (
    <div className="page-enter min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-gray-500">Manage resources, users, and platform activity</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1a24] rounded-xl p-1 mb-8 w-fit border border-[#2a2a3a]">
          {['overview', 'resources', 'users'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === 'overview' && stats && (
              <div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <StatCard label="Total Users" value={stats.totalUsers} color="text-indigo-400" />
                  <StatCard label="Total Resources" value={stats.totalResources} color="text-emerald-400" />
                  <StatCard label="Total Downloads" value={stats.totalDownloads} color="text-blue-400" />
                  <StatCard label="Hidden Resources" value={stats.pendingApproval} color="text-yellow-400" />
                </div>

                {stats.resourcesByType?.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-white font-semibold mb-4">Resources by Type</h3>
                    <div className="flex gap-6">
                      {stats.resourcesByType.map((item) => (
                        <div key={item._id} className="text-center">
                          <div className="text-2xl font-bold text-white">{item.count}</div>
                          <div className="text-sm text-gray-500 capitalize">{item._id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resources */}
            {tab === 'resources' && (
              <div className="card overflow-hidden">
                <div className="p-5 border-b border-[#2a2a3a] flex items-center justify-between">
                  <h2 className="text-white font-semibold">All Resources ({resources.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2a2a3a] text-gray-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-5 py-3">Title</th>
                        <th className="text-left px-5 py-3">Subject</th>
                        <th className="text-left px-5 py-3">Type</th>
                        <th className="text-left px-5 py-3">Uploader</th>
                        <th className="text-left px-5 py-3">Downloads</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a3a]">
                      {resources.map((r) => (
                        <tr key={r._id} className="hover:bg-[#2a2a3a]/30 transition-colors">
                          <td className="px-5 py-3 text-white max-w-[200px] truncate">{r.title}</td>
                          <td className="px-5 py-3 text-gray-400">{r.subject}</td>
                          <td className="px-5 py-3 capitalize text-gray-400">{r.type}</td>
                          <td className="px-5 py-3 text-gray-400">{r.uploadedBy?.name || 'N/A'}</td>
                          <td className="px-5 py-3 text-gray-400">{r.downloads}</td>
                          <td className="px-5 py-3">
                            <span className={`badge border text-xs ${
                              r.isApproved
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {r.isApproved ? 'Visible' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleApprove(r._id)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                {r.isApproved ? 'Hide' : 'Show'}
                              </button>
                              <button
                                onClick={() => handleDeleteResource(r._id)}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div className="card overflow-hidden">
                <div className="p-5 border-b border-[#2a2a3a]">
                  <h2 className="text-white font-semibold">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2a2a3a] text-gray-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-5 py-3">Name</th>
                        <th className="text-left px-5 py-3">Email</th>
                        <th className="text-left px-5 py-3">Role</th>
                        <th className="text-left px-5 py-3">Joined</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a3a]">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-[#2a2a3a]/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-400">{u.email}</td>
                          <td className="px-5 py-3">
                            <span className={`badge border text-xs ${
                              u.role === 'admin'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-400">
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {u._id !== user._id && (
                                <>
                                  <button
                                    onClick={() => handleToggleRole(u._id)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                  >
                                    {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u._id)}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              {u._id === user._id && (
                                <span className="text-xs text-gray-600">You</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
