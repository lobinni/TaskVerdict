import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Wallet,
  ChevronDown,
  Zap,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import type { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  walletConnected: boolean;
  walletConnecting?: boolean;
  onConnectWallet: () => void;
  walletAddress: string;
  onOpenContractSetup?: () => void;
}

const NAV_ITEMS: { key: TabType; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'browse', label: 'Browse Tasks' },
  { key: 'create', label: 'Create Task' },
  { key: 'my-tasks', label: 'My Tasks' },
];

export default function Header({
  activeTab,
  setActiveTab,
  walletConnected,
  walletConnecting = false,
  onConnectWallet,
  walletAddress,
  onOpenContractSetup,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-primary-100/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="relative w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Shield className="w-5 h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                TaskVerdict
              </span>
              <span className="hidden sm:inline text-[10px] ml-1.5 px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded-full font-medium">
                AI Judge
              </span>
            </div>
          </motion.div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === item.key
                    ? 'text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/60'
                }`}
              >
                {item.label}
                {activeTab === item.key && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary-50 border border-primary-200/50 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Wallet & Settings */}
          <div className="flex items-center gap-2">
            {/* Settings button */}
            {onOpenContractSetup && (
              <button
                onClick={onOpenContractSetup}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Contract Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            
            {walletConnected ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent-500/10 border border-accent-500/20 rounded-full"
              >
                <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-accent-600">
                  {walletAddress}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-accent-500" />
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onConnectWallet}
                disabled={walletConnecting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow disabled:opacity-70 disabled:cursor-wait"
              >
                {walletConnecting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{walletConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                <span className="sm:hidden">Connect</span>
              </motion.button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-primary-100/40"
          >
            <div className="px-4 py-3 space-y-1 bg-white/90">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                    activeTab === item.key
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
