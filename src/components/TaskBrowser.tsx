import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  ArrowUpRight,
  GitBranch,
  Clock,
  Tag,
} from 'lucide-react';
import type { Task, TaskFilter } from '../types';

interface TaskBrowserProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
}

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'judging', label: 'Judging' },
  { key: 'completed', label: 'Completed' },
  { key: 'disputed', label: 'Disputed' },
];

const statusStyles: Record<string, string> = {
  open: 'bg-blue-50 text-blue-600 border-blue-200',
  judging: 'bg-amber-50 text-amber-600 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  disputed: 'bg-red-50 text-red-600 border-red-200',
};

export default function TaskBrowser({ tasks, onViewTask }: TaskBrowserProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.spec.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">Find tasks to work on and earn rewards through AI-verified completion</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === f.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -3 }}
              onClick={() => onViewTask(task)}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[task.status]}`}>
                    {task.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {task.category}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                {task.title}
              </h3>

              {/* Spec preview */}
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                {task.spec}
              </p>

              {/* Milestones progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">Milestones</span>
                  <span className="text-xs font-medium text-gray-600">{task.milestone_count}</span>
                </div>
                <div className="flex gap-1">
                  {task.milestones.map((_, mi) => (
                    <div
                      key={mi}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        task.status === 'completed' ? 'bg-accent-400' :
                        task.status === 'disputed' ? (mi < Math.ceil(task.milestones.length / 2) ? 'bg-accent-400' : 'bg-danger-400') :
                        task.status === 'judging' ? 'bg-amber-300 shimmer' :
                        'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {task.repo_required ? 'Repo required' : 'Optional'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.created_at}
                  </span>
                </div>
                <span className="text-base font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  ${task.reward.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No tasks found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
        </motion.div>
      )}
    </div>
  );
}
