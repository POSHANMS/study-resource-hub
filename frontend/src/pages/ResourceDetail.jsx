import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ResourceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    axios.get(`/resources/${id}`)
      .then((r) => setResource(r.data))
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!user) return navigate('/login');
    setDownloading(true);
    try {
      if (resource.type === 'link') {
        await axios.get(`/resources/${id}/download`);
        window.open(resource.link, '_blank');
      } else {
        const response = await axios.get(`/resources/${id}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', resource.fileName || 'download');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      setResource((prev) => ({ ...prev, downloads: prev.downloads + 1 }));
    } catch (err) {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axios.delete(`/resources/${id}`);
      navigate('/browse');
    } catch (err) {
      alert('Delete failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!resource) return null;

  const canDelete = user && (user._id === resource.uploadedBy?._id || user.role === 'admin');
  const date = new Date(resource.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const typeColor = { pdf: 'text-red-400', note: 'text-emerald-400', link: 'text-blue-400' };

  return (
    <div className="page-enter min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link to="/browse" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Browse
        </Link>

        <div className="card p-8">
          {/* Type badge */}
          <div className={`text-xs font-bold uppercase tracking-widest mb-4 ${typeColor[resource.type]}`}>
            {resource.type === 'pdf' ? '📄' : resource.type === 'note' ? '📝' : '🔗'} {resource.type}
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 leading-snug">{resource.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {resource.subject}
            </span>
            {resource.tags?.map((tag) => (
              <span key={tag} className="badge bg-[#2a2a3a] text-gray-400">#{tag}</span>
            ))}
            {!resource.isApproved && (
              <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Hidden by Admin</span>
            )}
          </div>

          <p className="text-gray-400 leading-relaxed mb-8">{resource.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-[#0f0f13] rounded-xl mb-8">
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Uploaded by</div>
              <div className="text-sm text-gray-300 font-medium">{resource.uploadedBy?.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Downloads</div>
              <div className="text-sm text-gray-300 font-medium">{resource.downloads}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Added on</div>
              <div className="text-sm text-gray-300 font-medium">{date}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              {downloading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {resource.type === 'link' ? 'Open Link' : 'Download'}
            </button>

            {canDelete && (
              <button onClick={handleDelete} className="btn-danger flex items-center gap-2 px-5 py-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
