import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, ExternalLink, X } from 'lucide-react';
import { getExplorerTxUrl } from '../genlayer';

interface TransactionToastProps {
  pendingTx: string | null;
  lastTxHash: string | null;
  error: string | null;
  onClearError: () => void;
}

export default function TransactionToast({
  pendingTx,
  lastTxHash,
  error,
  onClearError,
}: TransactionToastProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success toast when transaction completes
  useEffect(() => {
    if (lastTxHash && !pendingTx) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastTxHash, pendingTx]);

  // Auto-dismiss error after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(onClearError, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  const getTxLabel = (tx: string) => {
    switch (tx) {
      case 'create_task': return 'Creating task...';
      case 'submit_work': return 'Submitting work...';
      case 'judge': return 'AI judging in progress...';
      case 'dispute': return 'Filing dispute...';
      default: return 'Processing transaction...';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="sync">
        {/* Pending transaction */}
        {pendingTx && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-primary-100"
          >
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            <div>
              <div className="text-sm font-medium text-gray-900">{getTxLabel(pendingTx)}</div>
              <div className="text-xs text-gray-500">Waiting for confirmation on GenLayer</div>
            </div>
          </motion.div>
        )}

        {/* Success toast */}
        {showSuccess && lastTxHash && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-accent-200"
          >
            <CheckCircle2 className="w-5 h-5 text-accent-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Transaction confirmed!</div>
              <a
                href={getExplorerTxUrl(lastTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View on explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Error toast */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-danger-200 max-w-sm"
          >
            <XCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">Transaction failed</div>
              <div className="text-xs text-danger-600 truncate">{error}</div>
            </div>
            <button
              onClick={onClearError}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
