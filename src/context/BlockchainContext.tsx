import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Task, Submission } from '../types';
import {
  connectWallet as connectWalletFn,
  disconnectWallet as disconnectWalletFn,
  getAccount,
  getTask,
  getContractAddress,
  setContractAddress as setContractAddressFn,
  getSubmission,
  getStats,
  createTask as createTaskFn,
  submitWork as submitWorkFn,
  judge as judgeFn,
  dispute as disputeFn,
  formatAddress,
  getExplorerTxUrl,
  isContractDeployed,
  setupWalletListeners,
} from '../genlayer';
import { MOCK_TASKS, MOCK_SUBMISSIONS, STATS as MOCK_STATS } from '../mockData';

// ============================================================================
// TYPES
// ============================================================================

interface BlockchainState {
  // Wallet
  walletConnected: boolean;
  walletAddress: string;
  connecting: boolean;
  
  // Data
  tasks: Task[];
  stats: { total_tasks: number; judgments_made: number };
  loading: boolean;
  
  // Transaction state
  pendingTx: string | null;
  lastTxHash: string | null;
  error: string | null;
  
  // Demo mode (khi chưa deploy contract)
  demoMode: boolean;
}

interface BlockchainActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshData: () => Promise<void>;
  
  // Contract setup
  contractAddress: string;
  setContractAddress: (address: string) => void;
  
  // Contract interactions
  createTask: (title: string, spec: string, repoRequired: boolean, milestones: string[]) => Promise<string | null>;
  submitWork: (taskKey: string, githubUrl: string, notes: string) => Promise<string | null>;
  judgeSubmission: (taskKey: string, submitter: string) => Promise<string | null>;
  disputeVerdict: (taskKey: string, submitter: string) => Promise<string | null>;
  
  // Helpers
  getTaskSubmission: (taskKey: string, submitter: string) => Promise<Submission | null>;
  formatAddr: (addr: string) => string;
  getTxUrl: (hash: string) => string;
  clearError: () => void;
}

interface BlockchainContextType extends BlockchainState, BlockchainActions {}

// ============================================================================
// CONTEXT
// ============================================================================

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export function useBlockchain(): BlockchainContextType {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within BlockchainProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface BlockchainProviderProps {
  children: ReactNode;
}

export function BlockchainProvider({ children }: BlockchainProviderProps) {
  // State
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [connecting, setConnecting] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total_tasks: 0, judgments_made: 0 });
  const [loading, setLoading] = useState(false);
  
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Contract address state
  const [contractAddress, setContractAddressState] = useState(() => getContractAddress());
  
  // Kiểm tra contract đã deploy chưa
  const demoMode = !isContractDeployed();

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  useEffect(() => {
    // Check initial wallet state
    const account = getAccount();
    if (account) {
      setWalletConnected(true);
      setWalletAddress(account);
    }
    
    // Setup MetaMask listeners
    setupWalletListeners(
      (accounts) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress('');
        } else {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      },
      (chainId) => {
        // Reload page on chain change
        if (chainId !== '0x107d') {
          console.log('⚠️ Not on Bradbury Testnet');
        }
      }
    );
    
    // Load initial data
    if (demoMode) {
      // Demo mode - use mock data
      setTasks(MOCK_TASKS);
      setStats(MOCK_STATS);
    } else {
      refreshData();
    }
  }, [demoMode]);

  // ============================================================================
  // WALLET FUNCTIONS
  // ============================================================================
  
  const connectWallet = useCallback(async () => {
    setConnecting(true);
    setError(null);
    
    try {
      const address = await connectWalletFn();
      setWalletConnected(true);
      setWalletAddress(address);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Connect wallet error:', err);
    } finally {
      setConnecting(false);
    }
  }, []);
  
  const disconnectWallet = useCallback(() => {
    disconnectWalletFn();
    setWalletConnected(false);
    setWalletAddress('');
  }, []);

  // ============================================================================
  // DATA FUNCTIONS
  // ============================================================================
  
  const refreshData = useCallback(async () => {
    if (demoMode) {
      setTasks(MOCK_TASKS);
      setStats(MOCK_STATS);
      return;
    }
    
    setLoading(true);
    try {
      // Get stats
      const statsData = await getStats();
      setStats(statsData);
      
      // Get all tasks
      const taskList: Task[] = [];
      for (let i = 0; i < statsData.total_tasks; i++) {
        const taskData = await getTask(i.toString());
        if (taskData && taskData.exists !== false) {
          taskList.push({
            id: i.toString(),
            ...taskData,
            reward: 1000, // Default reward (would come from escrow)
            created_at: new Date().toISOString().split('T')[0],
            category: 'General',
          });
        }
      }
      setTasks(taskList);
    } catch (err: any) {
      console.error('Refresh data error:', err);
      setError('Failed to load data from contract');
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  // ============================================================================
  // CONTRACT WRITE FUNCTIONS
  // ============================================================================
  
  const createTask = useCallback(async (
    title: string,
    spec: string,
    repoRequired: boolean,
    milestones: string[]
  ): Promise<string | null> => {
    if (demoMode) {
      // Demo mode - simulate
      const newTask: Task = {
        id: tasks.length.toString(),
        poster: walletAddress || '0xDemo...',
        title,
        spec,
        repo_required: repoRequired,
        milestones,
        milestone_count: milestones.length,
        status: 'open',
        winner: '',
        reward: 1000,
        created_at: new Date().toISOString().split('T')[0],
        category: 'General',
      };
      setTasks(prev => [...prev, newTask]);
      return 'demo_tx_' + Date.now();
    }
    
    setPendingTx('create_task');
    setError(null);
    
    try {
      const txHash = await createTaskFn(title, spec, repoRequired, milestones);
      setLastTxHash(txHash);
      await refreshData();
      return txHash;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      return null;
    } finally {
      setPendingTx(null);
    }
  }, [demoMode, tasks, walletAddress, refreshData]);
  
  const submitWork = useCallback(async (
    taskKey: string,
    githubUrl: string,
    notes: string
  ): Promise<string | null> => {
    if (demoMode) {
      return 'demo_tx_' + Date.now();
    }
    
    setPendingTx('submit_work');
    setError(null);
    
    try {
      const txHash = await submitWorkFn(taskKey, githubUrl, notes);
      setLastTxHash(txHash);
      return txHash;
    } catch (err: any) {
      setError(err.message || 'Failed to submit work');
      return null;
    } finally {
      setPendingTx(null);
    }
  }, [demoMode]);
  
  const judgeSubmission = useCallback(async (
    taskKey: string,
    submitter: string
  ): Promise<string | null> => {
    if (demoMode) {
      // Simulate judging delay
      await new Promise(r => setTimeout(r, 3000));
      return 'demo_tx_' + Date.now();
    }
    
    setPendingTx('judge');
    setError(null);
    
    try {
      const txHash = await judgeFn(taskKey, submitter);
      setLastTxHash(txHash);
      await refreshData();
      return txHash;
    } catch (err: any) {
      setError(err.message || 'Failed to trigger judgment');
      return null;
    } finally {
      setPendingTx(null);
    }
  }, [demoMode, refreshData]);
  
  const disputeVerdict = useCallback(async (
    taskKey: string,
    submitter: string
  ): Promise<string | null> => {
    if (demoMode) {
      return 'demo_tx_' + Date.now();
    }
    
    setPendingTx('dispute');
    setError(null);
    
    try {
      const txHash = await disputeFn(taskKey, submitter);
      setLastTxHash(txHash);
      await refreshData();
      return txHash;
    } catch (err: any) {
      setError(err.message || 'Failed to dispute');
      return null;
    } finally {
      setPendingTx(null);
    }
  }, [demoMode, refreshData]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const getTaskSubmission = useCallback(async (
    taskKey: string,
    submitter: string
  ): Promise<Submission | null> => {
    if (demoMode) {
      const key = `${taskKey}:${submitter}`;
      return MOCK_SUBMISSIONS[key] || null;
    }
    
    try {
      const data = await getSubmission(taskKey, submitter);
      if (data && data.exists !== false) {
        return data as Submission;
      }
      return null;
    } catch {
      return null;
    }
  }, [demoMode]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setContractAddress = useCallback((address: string) => {
    setContractAddressFn(address);
    setContractAddressState(address);
    // Reload data with new contract
    window.location.reload();
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value: BlockchainContextType = {
    // State
    walletConnected,
    walletAddress,
    connecting,
    tasks,
    stats,
    loading,
    pendingTx,
    lastTxHash,
    error,
    demoMode,
    
    // Contract setup
    contractAddress,
    setContractAddress,
    
    // Actions
    connectWallet,
    disconnectWallet,
    refreshData,
    createTask,
    submitWork,
    judgeSubmission,
    disputeVerdict,
    getTaskSubmission,
    formatAddr: formatAddress,
    getTxUrl: getExplorerTxUrl,
    clearError,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}
