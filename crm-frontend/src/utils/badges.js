const statusBadge = (status) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize';
    if (status === 'pending') return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400`;
    if (status === 'approved') return `${base} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
    if (status === 'rejected') return `${base} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`;
    if (status === 'completed') return `${base} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
    if (status === 'in_progress') return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400`;
    if (status === 'active') return `${base} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
    if (status === 'inactive' || status === 'terminated') return `${base} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`;
    return `${base} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`;
};

const priorityBadge = (priority) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize';
    if (priority === 'urgent') return `${base} bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400`;
    if (priority === 'high') return `${base} bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400`;
    if (priority === 'medium') return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400`;
    return `${base} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`;
};

export { statusBadge, priorityBadge };
