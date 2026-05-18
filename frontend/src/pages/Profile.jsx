import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [myResources, setMyResources] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [form, setForm] = useState({ name: '', bio: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('uploads');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({ name: user.name, bio: user.bio || '', password: '' });
    axios.get('/resources/my-uploads')
      .then((r) => setMyResources(r.data))
      .finally(() => setLoadingRes(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { name: form.name, bio: form.bio };
      if (form.password) payload.password = form.password;
      const { data } = await axios.put('/auth/profile', payload);
      updateUser(data);
      setMessage('Profile updated successfully!');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await axios.delete(`/resources/${id}`);
      setMyResources((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  if (!user) return null;

  return (
    <div className="page-enter min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <span className={`badge border text-xs ${
                user.role === 'admin'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
            {user.bio && <p className="text-gray-400 text-sm mt-2">{user.bio}</p>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{myResources.length}</div>
            <div className="text-xs text-gray-500">uploads</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1a24] rounded-xl p-1 mb-8 w-fit border border-[#2a2a3a]">
          {['uploads', 'settings'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'uploads' ? `My Uploads (${myResources.length})` : 'Settings'}
            </button>
          ))}
        </div>

        {/* Uploads Tab */}
        {tab === 'uploads' && (
          <div>
            {loadingRes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card p-5 h-52 animate-pulse">
                    <div className="h-4 bg-[#2a2a3a] rounded w-1/4 mb-4" />
                    <div className="h-5 bg-[#2a2a3a] rounded w-3/4 mb-2" />
                    <div className="h-4 bg-[#2a2a3a] rounded w-full" />
                  </div>
                ))}
              </div>
            ) : myResources.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-400">You haven't uploaded anything yet.</p>
                <button onClick={() => navigate('/upload')} className="btn-primary mt-4">
                  Upload Your First Resource
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myResources.map((r) => (
                  <ResourceCard key={r._id} resource={r} showDelete onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="card p-8 max-w-lg">
            <h2 className="text-xl font-semibold text-white mb-6">Edit Profile</h2>

            {message && (
              <div className={`text-sm px-4 py-3 rounded-xl mb-6 border ${
                message.includes('success')
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="label">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell others about yourself..."
                  className="input resize-none"
                />
              </div>
              <div>
                <label className="label">New Password <span className="text-gray-600">(leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { logout(); navigate('/login'); }}
                  className="btn-secondary text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/40"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
