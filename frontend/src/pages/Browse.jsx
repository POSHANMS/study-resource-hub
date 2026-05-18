import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import ResourceCard from '../components/ResourceCard';
import SearchBar from '../components/SearchBar';

const TYPES = ['All', 'pdf', 'note', 'link'];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const currentSearch = searchParams.get('search') || '';
  const currentSubject = searchParams.get('subject') || 'All';
  const currentType = searchParams.get('type') || 'All';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    axios.get('/resources/subjects').then((r) => setSubjects(['All', ...r.data]));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentSearch) params.set('search', currentSearch);
        if (currentSubject !== 'All') params.set('subject', currentSubject);
        if (currentType !== 'All') params.set('type', currentType);
        params.set('page', currentPage);
        params.set('limit', '12');

        const { data } = await axios.get(`/resources?${params.toString()}`);
        setResources(data.resources);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentSearch, currentSubject, currentType, currentPage]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value && value !== 'All') p.set(key, value);
    else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const setPage = (page) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', page);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-enter min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Resources</h1>
          <p className="text-gray-500">{total} resource{total !== 1 ? 's' : ''} available</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            onSearch={(val) => updateParam('search', val)}
            placeholder="Search by title, subject, or keyword..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Subject filter */}
          <div className="flex-1">
            <label className="label">Subject</label>
            <select
              value={currentSubject}
              onChange={(e) => updateParam('subject', e.target.value)}
              className="input"
            >
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => updateParam('type', t)}
                  className={`badge text-sm px-3 py-2 border transition-all duration-200 capitalize ${
                    currentType === t
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-[#1a1a24] border-[#2a2a3a] text-gray-400 hover:border-indigo-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 h-52 animate-pulse">
                <div className="h-4 bg-[#2a2a3a] rounded w-1/4 mb-4" />
                <div className="h-5 bg-[#2a2a3a] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#2a2a3a] rounded w-full mb-1" />
                <div className="h-4 bg-[#2a2a3a] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="card p-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">No resources found</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  currentPage === i + 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#1a1a24] border border-[#2a2a3a] text-gray-400 hover:border-indigo-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
