import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  FileText,
  DollarSign,
  GitBranch,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';

const CATEGORIES = ['Smart Contract', 'Frontend', 'Backend', 'DeFi', 'Cryptography', 'Analytics', 'DevOps', 'Other'];

export default function CreateTask() {
  const { walletConnected, createTask, pendingTx, getTxUrl, connectWallet } = useBlockchain();
  
  const [title, setTitle] = useState('');
  const [spec, setSpec] = useState('');
  const [category, setCategory] = useState('');
  const [repoRequired, setRepoRequired] = useState(true);
  const [reward, setReward] = useState('');
  const [milestones, setMilestones] = useState<string[]>(['']);
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const isCreating = pendingTx === 'create_task';

  const addMilestone = () => {
    if (milestones.length < 10) {
      setMilestones([...milestones, '']);
    }
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, value: string) => {
    const updated = [...milestones];
    updated[index] = value;
    setMilestones(updated);
  };

  const handleSubmit = async () => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }
    
    const validMilestones = milestones.filter(m => m.trim());
    const hash = await createTask(title, spec, repoRequired, validMilestones);
    
    if (hash) {
      setTxHash(hash);
      setSubmitted(true);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setTxHash(null);
    setTitle('');
    setSpec('');
    setCategory('');
    setReward('');
    setMilestones(['']);
  };

  const isValid = title.trim() && spec.trim() && category && reward && milestones.some((m) => m.trim());

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-accent-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Created!</h2>
        <p className="text-gray-500 mb-6">
          Your task has been submitted to the GenLayer network. Workers can now browse and submit deliverables.
        </p>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Title</span>
              <span className="text-gray-700 font-medium">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Category</span>
              <span className="text-gray-700">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reward</span>
              <span className="text-primary-600 font-bold">${Number(reward).toLocaleString()} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Milestones</span>
              <span className="text-gray-700">{milestones.filter((m) => m.trim()).length}</span>
            </div>
            {txHash && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-400 block mb-1">Transaction</span>
                <a
                  href={getTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs font-mono"
                >
                  {txHash.slice(0, 16)}...{txHash.slice(-8)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={resetForm}
          className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          Create Another Task
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-sm text-gray-500 mt-1">Define your requirements and let AI judge submissions</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6"
      >
        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-primary-500" />
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Build a Decentralized Voting DApp"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </div>

        {/* Category & Reward row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white appearance-none cursor-pointer"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 text-primary-500" />
              Reward (USDC)
            </label>
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="2500"
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
        </div>

        {/* Specification */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Specification</label>
          <textarea
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            placeholder="Describe in detail what you want built. Be specific about requirements, tech stack, and acceptance criteria..."
            rows={6}
            maxLength={3000}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
          />
          <div className="text-xs text-gray-400 text-right mt-1">{spec.length}/3000</div>
        </div>

        {/* Repo toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRepoRequired(!repoRequired)}
            className={`relative w-11 h-6 rounded-full transition-colors ${repoRequired ? 'bg-primary-600' : 'bg-gray-300'}`}
          >
            <motion.div
              animate={{ x: repoRequired ? 20 : 2 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <GitBranch className="w-4 h-4 text-primary-500" />
              Repository Required
            </div>
            <span className="text-xs text-gray-400">Workers must submit a GitHub URL</span>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Sparkles className="w-4 h-4 text-primary-500" />
            Milestones
            <span className="text-xs text-gray-400 font-normal">AI will score each one individually</span>
          </label>
          <AnimatePresence mode="popLayout">
            {milestones.map((ms, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full text-xs flex items-center justify-center font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={ms}
                  onChange={(e) => updateMilestone(i, e.target.value)}
                  placeholder={`Milestone ${i + 1} (e.g., "Smart contract with access control")`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
                {milestones.length > 1 && (
                  <button
                    onClick={() => removeMilestone(i)}
                    className="p-1.5 text-gray-300 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {milestones.length < 10 && (
            <button
              onClick={addMilestone}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={!isValid || isCreating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating on GenLayer...
              </>
            ) : !walletConnected ? (
              'Connect Wallet to Create Task'
            ) : (
              <>
                Create Task
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
          
          {/* Gas info */}
          <p className="text-xs text-gray-400 text-center mt-3">
            This transaction will require GEN tokens for gas on GenLayer Bradbury Testnet
          </p>
        </div>
      </motion.div>
    </div>
  );
}
