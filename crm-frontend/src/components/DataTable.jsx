import React from 'react';
import Spinner from './Spinner';

export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    searchQuery = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
    meta = {},
    page = 1,
    onPageChange,
    emptyMessage = 'No records found.'
}) {
    return (
        <div className="space-y-4">
            {/* Search filter bar if onSearchChange is provided */}
            {onSearchChange !== undefined && (
                <div className="relative max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>
            )}

            {/* Table wrapper */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-16">
                            <Spinner size="md" />
                            <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-2">Loading data...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="text-gray-300 text-3xl mb-2">📂</div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{emptyMessage}</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                            <thead className="bg-gray-50 dark:bg-slate-800/40">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th
                                            key={col.key || idx}
                                            className={`px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left ${col.className || ''}`}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm">
                                {data.map((row, rowIdx) => (
                                    <tr
                                        key={row.id || rowIdx}
                                        className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 text-gray-700 dark:text-slate-300 transition-colors"
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={col.key || colIdx}
                                                className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}
                                            >
                                                {col.render ? col.render(row) : row[col.key] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination footer */}
                {!loading && meta && meta.last_page > 1 && onPageChange && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Showing page <strong>{meta.current_page || page}</strong> of <strong>{meta.last_page}</strong> ({meta.total || data.length} records)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-300 dark:border-slate-700 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => onPageChange(Math.min(meta.last_page, page + 1))}
                                disabled={page === meta.last_page}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-300 dark:border-slate-700 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
