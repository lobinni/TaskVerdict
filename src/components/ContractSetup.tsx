import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Rocket,
  X,
} from 'lucide-react';

interface ContractSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
  currentAddress: string;
}

export default function ContractSetup({ isOpen, onClose, onSave, currentAddress }: ContractSetupProps) {
  const [address, setAddress] = useState(currentAddress);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAddress(currentAddress);
  }, [currentAddress]);

  const handleSave = () => {
    // Validate address format
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid address format. Must be 0x followed by 40 hex characters.');
      return;
    }
    
    if (address === '0x0000000000000000000000000000000000000000') {
      setError('Please enter a valid deployed contract address.');
      return;
    }

    setError('');
    onSave(address);
    onClose();
  };

  const copyContractCode = () => {
    // Copy contract file path
    navigator.clipboard.writeText('genlayer/task_verdict.py');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isZeroAddress = currentAddress === '0x0000000000000000000000000000000000000000';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Contract Setup</h2>
                  <p className="text-sm text-primary-100">Configure GenLayer contract</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current status */}
              <div className={`p-4 rounded-xl ${isZeroAddress ? 'bg-amber-50 border border-amber-200' : 'bg-accent-50 border border-accent-200'}`}>
                <div className="flex items-start gap-3">
                  {isZeroAddress ? (
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Check className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${isZeroAddress ? 'text-amber-800' : 'text-accent-800'}`}>
                      {isZeroAddress ? 'Demo Mode Active' : 'On-Chain Mode Active'}
                    </p>
                    <p className={`text-xs mt-0.5 ${isZeroAddress ? 'text-amber-600' : 'text-accent-600'}`}>
                      {isZeroAddress 
                        ? 'Using mock data. Deploy contract to enable real transactions.'
                        : `Connected to: ${currentAddress.slice(0, 10)}...${currentAddress.slice(-8)}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Deploy instructions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Deploy Contract</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-semibold">1</span>
                    <span>Open <a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">GenLayer Studio</a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-semibold">2</span>
                    <div className="flex-1">
                      <span>Upload contract code: </span>
                      <button
                        onClick={copyContractCode}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono hover:bg-gray-200"
                      >
                        genlayer/task_verdict.py
                        {copied ? <Check className="w-3 h-3 text-accent-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-semibold">3</span>
                    <span>Select <strong>Bradbury Testnet</strong> and click Deploy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-semibold">4</span>
                    <span>Copy the deployed contract address below</span>
                  </li>
                </ol>
              </div>

              {/* Address input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contract Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setError('');
                  }}
                  placeholder="0x..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                    error 
                      ? 'border-danger-300 focus:ring-danger-500/20 focus:border-danger-400' 
                      : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-400'
                  }`}
                />
                {error && (
                  <p className="mt-1.5 text-xs text-danger-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://studio.genlayer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  GenLayer Studio
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://explorer-bradbury.genlayer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://discord.gg/genlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Discord (Faucet)
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
