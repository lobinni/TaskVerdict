import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  GitBranch,
  Send,
  Gavel,
  RefreshCw,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Copy,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { Task, Submission } from '../types';
import { useBlockchain } from '../context/BlockchainContext';

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
}

export default function TaskDetail({ task, onBack }: TaskDetailProps) {
  const { 
    walletConnected, 
    walletAddress,
    submitWork, 
    judgeSubmission, 
    disputeVerdict,
    getTaskSubmission,
    pendingTx,
    formatAddr,
  } = useBlockchain();

  const [githubUrl, setGithubUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  // Load submission data
  useEffect(() => {
    async function loadSubmission() {
      if (task.winner || task.status !== 'open') {
        setLoadingSubmission(true);
        const submitter = task.winner || walletAddress;
        if (submitter) {
          const sub = await getTaskSubmission(task.id, submitter);
          setSubmission(sub);
        }
        setLoadingSubmission(false);
      }
    }
    loadSubmission();
  }, [task, walletAddress, getTaskSubmission]);

  const handleSubmit = async () => {
    if (!githubUrl.trim()) return;
    
    const txHash = await submitWork(task.id, githubUrl, notes);
    if (txHash) {
      setShowSubmitForm(false);
      setGithubUrl('');
      setNotes('');
    }
  };

  const handleJudge = async () => {
    if (!walletAddress) return;
    await judgeSubmission(task.id, walletAddress);
  };

  const handleDispute = async () => {
    if (!submission?.submitter) return;
    await disputeVerdict(task.id, submission.submitter);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-accent-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-danger-500';
  };

  const scoreRingColor = (score: number) => {
    if (score >= 80) return 'stroke-accent-500';
    if (score >= 50) return 'stroke-amber-500';
    return 'stroke-danger-500';
  };

  const isJudging = pendingTx === 'judge';
  const isSubmitting = pendingTx === 'submit_work';
  const isDisputing = pendingTx === 'dispute';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to tasks
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Task header */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  task.status === 'open' ? 'bg-blue-50 text-blue-600' :
                  task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  task.status === 'judging' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {task.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{task.category}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  ${task.reward.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">USDC Reward</div>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{task.title}</h1>
            
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Posted {task.created_at}
              </span>
              <span className="flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" />
                {task.repo_required ? 'Repository required' : 'Optional repo'}
              </span>
              <span className="flex items-center gap-1">
                By {formatAddr(task.poster)}
                <Copy 
                  className="w-3 h-3 cursor-pointer hover:text-primary-500" 
                  onClick={() => copyToClipboard(task.poster)}
                />
              </span>
            </div>

            {/* Spec */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specification</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.spec}</p>
            </div>
          </div>

          {/* Milestones timeline */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Milestones ({task.milestone_count})
            </h3>
            <div className="space-y-0">
              {task.milestones.map((ms, i) => {
                const result = submission?.milestone_results?.[i];
                const isExpanded = expandedMilestone === i;
                const isPass = result?.pass;
                const isPending = !result;
                
                return (
                  <div key={i} className="relative">
                    {/* Timeline connector */}
                    {i < task.milestones.length - 1 && (
                      <div className={`absolute left-[17px] top-10 w-0.5 h-[calc(100%-16px)] ${
                        isPending ? 'bg-gray-200' : isPass ? 'bg-accent-400' : 'bg-danger-400'
                      }`} />
                    )}
                    
                    <div
                      className={`relative flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                        isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                      }`}
                      onClick={() => setExpandedMilestone(isExpanded ? null : i)}
                    >
                      {/* Status icon */}
                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPending ? 'bg-gray-100 text-gray-400' :
                        isPass ? 'bg-accent-500/10 text-accent-600' :
                        'bg-danger-500/10 text-danger-500'
                      }`}>
                        {isPending ? (
                          <Clock className="w-4 h-4" />
                        ) : isPass ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isPending ? 'text-gray-600' : isPass ? 'text-gray-900' : 'text-danger-600'}`}>
                            {ms}
                          </span>
                          {result && (
                            isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {isPending && (
                          <span className="text-xs text-gray-400">Awaiting judgment</span>
                        )}
                      </div>
                    </div>

                    {/* Expanded reason */}
                    <AnimatePresence>
                      {isExpanded && result && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden ml-[52px]"
                        >
                          <div className={`p-3 rounded-lg text-sm mb-2 ${isPass ? 'bg-accent-500/5 text-accent-700 border border-accent-500/10' : 'bg-danger-500/5 text-danger-600 border border-danger-400/10'}`}>
                            {result.reason}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission section */}
          {loadingSubmission ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : submission && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary-500" />
                Submission
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-20">Submitter</span>
                  <span className="text-sm font-mono text-gray-700">{formatAddr(submission.submitter)}</span>
                  <Copy 
                    className="w-3.5 h-3.5 text-gray-300 cursor-pointer hover:text-primary-500" 
                    onClick={() => copyToClipboard(submission.submitter)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-20">Repository</span>
                  <a href={submission.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    {submission.github_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {submission.notes && (
                  <div>
                    <span className="text-xs text-gray-400">Notes</span>
                    <p className="text-sm text-gray-600 mt-1">{submission.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Score card */}
          {submission?.verdict && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">AI Verdict</h3>
              
              {/* Score circle */}
              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      className={scoreRingColor(submission.verdict.score)}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${submission.verdict.score * 2.64} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${scoreColor(submission.verdict.score)}`}>
                      {submission.verdict.score}
                    </span>
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Pass/Fail badge */}
              <div className="flex justify-center mb-4">
                {submission.verdict.overall_pass ? (
                  <span className="flex items-center gap-1.5 px-4 py-1.5 bg-accent-500/10 text-accent-600 text-sm font-semibold rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    PASSED
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-4 py-1.5 bg-danger-500/10 text-danger-500 text-sm font-semibold rounded-full">
                    <XCircle className="w-4 h-4" />
                    FAILED
                  </span>
                )}
              </div>

              {/* Reasoning */}
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-xs font-medium text-gray-500 mb-1 block">Reasoning</span>
                <p className="text-xs text-gray-600 leading-relaxed">{submission.verdict.reasoning}</p>
              </div>

              {/* Payout */}
              {submission.verdict.overall_pass && (
                <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-accent-500/5 rounded-xl border border-primary-100">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-semibold text-primary-700">
                      Payout: ${((submission.verdict.score / 100) * task.reward).toFixed(0)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {submission.verdict.score}% of ${task.reward.toLocaleString()} USDC
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Actions</h3>
            
            {task.status === 'open' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSubmitForm(!showSubmitForm)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/25 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Work
                </motion.button>

                <AnimatePresence>
                  {showSubmitForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">GitHub URL</label>
                          <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe what you've completed..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
                          />
                        </div>
                        <button
                          onClick={handleSubmit}
                          disabled={!walletConnected || isSubmitting || !githubUrl.trim()}
                          className="w-full px-4 py-2 bg-accent-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {!walletConnected ? 'Connect wallet first' : 'Submit Deliverable'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {submission && !submission.verdict && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJudge}
                disabled={isJudging || !walletConnected}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/25 disabled:opacity-70"
              >
                {isJudging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI Judging...
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    Trigger AI Judgment
                  </>
                )}
              </motion.button>
            )}

            {task.status === 'completed' && submission?.verdict?.overall_pass && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-accent-500/25"
              >
                <DollarSign className="w-4 h-4" />
                Release Payout
              </motion.button>
            )}

            {(task.status === 'completed' || task.status === 'disputed') && submission?.verdict && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDispute}
                disabled={isDisputing || !walletConnected}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-danger-500 border border-danger-200 text-sm font-semibold rounded-xl hover:bg-danger-50 transition-colors disabled:opacity-70"
              >
                {isDisputing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                Dispute Verdict
              </motion.button>
            )}
          </div>

          {/* Task info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Task Info</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Task ID</span>
                <span className="font-mono text-gray-700">#{task.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Poster</span>
                <span className="font-mono text-gray-700 text-xs">{formatAddr(task.poster)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category</span>
                <span className="text-gray-700">{task.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-700">{task.created_at}</span>
              </div>
              {task.winner && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Winner</span>
                  <span className="font-mono text-accent-600 text-xs">{formatAddr(task.winner)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
