import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Inbox,
  Wallet,
} from 'lucide-react';
import type { Task } from '../types';
import { useBlockchain } from '../context/BlockchainContext';

interface MyTasksProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
}

export default function MyTasks({ tasks, onViewTask }: MyTasksProps) {
  const { walletConnected, walletAddress, connectWallet, formatAddr } = useBlockchain();

  if (!walletConnected) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-primary-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Connect Your Wallet</h3>
        <p className="text-sm text-gray-400 mb-6">Connect your wallet to see tasks you've posted or submitted work for</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={connectWallet}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/25"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </motion.button>
      </div>
    );
  }

  // Filter tasks by current wallet
  const myPosted = tasks.filter(t => 
    t.poster.toLowerCase() === walletAddress.toLowerCase() ||
    t.poster.toLowerCase().includes(walletAddress.slice(0, 6).toLowerCase())
  );
  
  const mySubmissions = tasks.filter(t => 
    t.winner && (
      t.winner.toLowerCase() === walletAddress.toLowerCase() ||
      t.winner.toLowerCase().includes(walletAddress.slice(0, 6).toLowerCase())
    )
  );

  // If no real matches, show demo tasks
  const displayPosted = myPosted.length > 0 ? myPosted : tasks.slice(0, 2);
  const displaySubmissions = mySubmissions.length > 0 ? mySubmissions : tasks.slice(2, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connected as <span className="font-mono text-primary-600">{formatAddr(walletAddress)}</span>
        </p>
      </div>

      {/* Posted tasks */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-500" />
          Tasks I've Posted
        </h2>
        {displayPosted.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <p className="text-gray-400 text-sm">You haven't posted any tasks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayPosted.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ x: 4 }}
                onClick={() => onViewTask(task)}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  task.status === 'completed' ? 'bg-accent-500/10' :
                  task.status === 'open' ? 'bg-blue-50' :
                  task.status === 'judging' ? 'bg-amber-50' :
                  'bg-red-50'
                }`}>
                  {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-accent-500" /> :
                   task.status === 'judging' ? <Clock className="w-5 h-5 text-amber-500" /> :
                   task.status === 'disputed' ? <AlertTriangle className="w-5 h-5 text-danger-500" /> :
                   <FileText className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span>{task.category}</span>
                    <span>{task.milestone_count} milestones</span>
                    <span className={`font-medium ${
                      task.status === 'completed' ? 'text-accent-500' :
                      task.status === 'disputed' ? 'text-danger-500' :
                      task.status === 'judging' ? 'text-amber-500' :
                      'text-blue-500'
                    }`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-primary-600">${task.reward.toLocaleString()}</div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Submissions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent-500" />
          My Submissions
        </h2>
        {displaySubmissions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <p className="text-gray-400 text-sm">You haven't submitted work to any tasks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displaySubmissions.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ x: 4 }}
                onClick={() => onViewTask(task)}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  task.status === 'completed' ? 'bg-accent-500/10' :
                  task.status === 'judging' ? 'bg-amber-50' :
                  task.status === 'disputed' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                  {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-accent-500" /> :
                   task.status === 'judging' ? <Clock className="w-5 h-5 text-amber-500" /> :
                   task.status === 'disputed' ? <AlertTriangle className="w-5 h-5 text-danger-500" /> :
                   <FileText className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span>{task.category}</span>
                    <span>{task.milestone_count} milestones</span>
                    <span className="text-primary-500">Submitted</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-primary-600">${task.reward.toLocaleString()}</div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
