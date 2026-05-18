import { Link } from 'react-router-dom';

const typeColors = {
  pdf: 'bg-red-500/10 text-red-400 border-red-500/20',
  note: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  link: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const typeIcons = {
  pdf: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  note: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  link: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
};

export default function ResourceCard({ resource, onDelete, showDelete }) {
  const date = new Date(resource.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="card p-5 flex flex-col gap-4 hover:border-indigo-500/40 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className={`flex items-center gap-1.5 badge border ${typeColors[resource.type]}`}>
          {typeIcons[resource.type]}
          <span className="uppercase tracking-wider">{resource.type}</span>
        </div>
        {!resource.isApproved && (
          <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            Hidden
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="font-semibold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors duration-200 line-clamp-2">
          {resource.title}
        </h3>
        <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">{resource.description}</p>
      </div>

      {/* Subject & Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {resource.subject}
        </span>
        {resource.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="badge bg-[#2a2a3a] text-gray-400">
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#2a2a3a]">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {resource.uploadedBy?.name || 'Unknown'}
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {resource.downloads}
          </div>
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-2">
          {showDelete && (
            <button
              onClick={() => onDelete(resource._id)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          )}
          <Link
            to={`/resource/${resource._id}`}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            View
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
