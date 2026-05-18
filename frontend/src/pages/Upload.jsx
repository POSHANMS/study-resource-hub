import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'English', 'History', 'Geography', 'Economics', 'Accounts',
  'Business Studies', 'Psychology', 'Sociology', 'Political Science', 'Other'
];

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', subject: '', type: 'pdf', link: '', tags: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.type !== 'link' && !file) {
      return setError('Please select a file to upload');
    }
    if (form.type === 'link' && !form.link) {
      return setError('Please enter a valid URL');
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (file) formData.append('file', file);

    setLoading(true);
    try {
      const { data } = await axios.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Resource uploaded successfully!');
      setTimeout(() => navigate(`/resource/${data._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Resource</h1>
          <p className="text-gray-500">Share your study materials with everyone</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type selector */}
            <div>
              <label className="label">Resource Type</label>
              <div className="grid grid-cols-3 gap-3">
                {['pdf', 'note', 'link'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all capitalize ${
                      form.type === t
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-[#0f0f13] border-[#2a2a3a] text-gray-400 hover:border-indigo-500'
                    }`}
                  >
                    {t === 'pdf' ? '📄 PDF' : t === 'note' ? '📝 Note' : '🔗 Link'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Chapter 5 - Thermodynamics Notes"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Subject *</label>
              <select name="subject" value={form.subject} onChange={handleChange} className="input" required>
                <option value="">Select a subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Briefly describe what this resource covers..."
                rows={3}
                className="input resize-none"
                required
              />
            </div>

            {form.type === 'link' ? (
              <div>
                <label className="label">URL *</label>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="input"
                  type="url"
                />
              </div>
            ) : (
              <div>
                <label className="label">File *</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    file ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#2a2a3a] hover:border-indigo-500/50'
                  }`}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  {file ? (
                    <div>
                      <div className="text-indigo-400 font-medium">{file.name}</div>
                      <div className="text-gray-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-4m0 0V8m0 4H8m4 0h4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 12V7a3 3 0 013-3h10a3 3 0 013 3v5" />
                      </svg>
                      <p className="text-gray-500 text-sm">Click to upload or drag and drop</p>
                      <p className="text-gray-600 text-xs mt-1">PDF, DOC, TXT, PPT, XLS, PNG — max 20MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="label">Tags <span className="text-gray-600">(optional, comma separated)</span></label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="e.g. thermodynamics, heat, entropy"
                className="input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading...
                </span>
              ) : 'Upload Resource'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
