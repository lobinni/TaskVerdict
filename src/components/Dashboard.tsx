import { motion } from 'framer-motion';
import {
  TrendingUp,
  CheckCircle2,
  Users,
  DollarSign,
  BarChart3,
  Activity,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import type { Task } from '../types';
import { useBlockchain } from '../context/BlockchainContext';

interface DashboardProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard({ tasks, onViewTask }: DashboardProps) {
  const { stats, demoMode } = useBlockchain();
  
  // Calculate total rewards from tasks
  const totalRewards = tasks.reduce((sum, t) => sum + t.reward, 0);
  
  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total_tasks || tasks.length,
      icon: BarChart3,
      color: 'from-primary-500 to-primary-600',
      bg: 'bg-primary-50',
      textColor: 'text-primary-700',
      change: demoMode ? 'Demo' : '+3 this week',
    },
    {
      label: 'AI Judgments',
      value: stats.judgments_made || 0,
      icon: CheckCircle2,
      color: 'from-accent-500 to-accent-600',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      change: demoMode ? 'Demo' : '+2 today',
    },
    {
      label: 'Total Rewards',
      value: `$${(totalRewards / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      textColor: 'text-amber-700',
      change: demoMode ? 'Demo' : '+$4.2k',
    },
    {
      label: 'Active Workers',
      value: 12,
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      textColor: 'text-violet-700',
      change: demoMode ? 'Demo' : '+5 joined',
    },
  ];

  const recentTasks = tasks.slice(0, 4);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero section */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 sm:p-10 text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-sm font-medium text-primary-200">AI-Powered Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Trust-Free Task<br />Adjudication
          </h1>
          <p className="text-primary-200 max-w-lg text-sm sm:text-base leading-relaxed">
            Post tasks, submit deliverables, and let AI validators reach consensus on whether the work meets specifications — no human bias, fully on-chain.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm backdrop-blur-sm">
              <Activity className="w-4 h-4 text-accent-400" />
              GenLayer Consensus
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-accent-400" />
              Milestone Scoring
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 text-accent-400" />
              Escrow Payouts
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <span className="text-xs font-medium text-accent-600 bg-accent-500/10 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent tasks */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
          <span className="text-sm text-primary-600 font-medium cursor-pointer hover:text-primary-700">
            View all →
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentTasks.map((task) => (
            <motion.div
              key={task.id}
              variants={item}
              whileHover={{ y: -2 }}
              onClick={() => onViewTask(task)}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  task.status === 'open' ? 'bg-blue-50 text-blue-600' :
                  task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  task.status === 'judging' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-primary-600 transition-colors">
                {task.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.spec}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                    {task.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {task.milestone_count} milestones
                  </span>
                </div>
                <span className="text-sm font-bold text-primary-600">
                  ${task.reward.toLocaleString()}
                </span>
              </div>
              {/* Milestone progress bar */}
              <div className="mt-3 flex gap-1">
                {task.milestones.map((_, mi) => (
                  <div
                    key={mi}
                    className={`h-1.5 flex-1 rounded-full ${
                      task.status === 'completed' ? 'bg-accent-400' :
                      task.status === 'disputed' ? (mi < 2 ? 'bg-accent-400' : 'bg-danger-400') :
                      task.status === 'judging' ? 'bg-amber-300' :
                      'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How TaskVerdict Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Post Task', desc: 'Define requirements, milestones, and escrow reward amount.', color: 'bg-primary-500' },
            { step: '02', title: 'Submit Work', desc: 'Workers submit GitHub repo/PR with notes on completion.', color: 'bg-violet-500' },
            { step: '03', title: 'AI Judges', desc: 'GenLayer validators fetch code, score each milestone via LLM consensus.', color: 'bg-amber-500' },
            { step: '04', title: 'Payout', desc: 'Escrow releases funds proportional to score. Disputes trigger re-evaluation.', color: 'bg-accent-500' },
          ].map((s) => (
            <motion.div
              key={s.step}
              variants={item}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 text-5xl font-black text-gray-50">
                {s.step}
              </div>
              <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                <span className="text-white text-xs font-bold">{s.step}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
