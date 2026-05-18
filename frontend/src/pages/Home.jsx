import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ResourceCard from '../components/ResourceCard';

export default function Home() {
  const [recentResources, setRecentResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, subjRes] = await Promise.all([
          axios.get('/resources?limit=6'),
          axios.get('/resources/subjects'),
        ]);
        setRecentResources(resRes.data.resources);
        setSubjects(subjRes.data.slice(0, 8));
        setStats({ total: resRes.data.total });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="page-enter min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6 text-sm px-4 py-1.5">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            {stats.total}+ study resources available
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Share Knowledge,
            <span className="text-indigo-400"> Ace Together</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload notes, PDFs, and useful links. Browse resources from your peers.
            Study smarter, not harder.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/browse" className="btn-primary text-base px-8 py-3">
              Browse Resources
            </Link>
            <Link to="/upload" className="btn-secondary text-base px-8 py-3">
              Upload Material
            </Link>
          </div>
        </div>
      </section>

      {/* Subjects */}
      {subjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-xl font-semibold text-white mb-5">Browse by Subject</h2>
          <div className="flex flex-wrap gap-3">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => navigate(`/browse?subject=${subject}`)}
                className="badge bg-[#1a1a24] border border-[#2a2a3a] text-gray-300 hover:border-indigo-500 hover:text-indigo-300 transition-all duration-200 text-sm px-4 py-2"
              >
                {subject}
              </button>
            ))}
            <Link
              to="/browse"
              className="badge bg-transparent border border-dashed border-[#2a2a3a] text-gray-500 hover:text-gray-300 transition-colors text-sm px-4 py-2"
            >
              View all →
            </Link>
          </div>
        </section>
      )}

      {/* Recent Resources */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recently Added</h2>
          <Link to="/browse" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View all →
          </Link>
        </div>

        {recentResources.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-gray-600 text-5xl mb-4">📚</div>
            <p className="text-gray-400">No resources yet. Be the first to upload!</p>
            <Link to="/upload" className="btn-primary mt-4 inline-block">Upload Now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentResources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        )}
      </section>

      {/* Stats Bar */}
      <section className="border-t border-[#2a2a3a] bg-[#1a1a24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Resources Shared', value: stats.total + '+' },
            { label: 'Subjects Covered', value: subjects.length + '+' },
            { label: 'Free to Use', value: '100%' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-indigo-400">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
