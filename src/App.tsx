import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BlockchainProvider, useBlockchain } from './context/BlockchainContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskBrowser from './components/TaskBrowser';
import TaskDetail from './components/TaskDetail';
import CreateTask from './components/CreateTask';
import MyTasks from './components/MyTasks';
import Footer from './components/Footer';
import DemoModeBanner from './components/DemoModeBanner';
import TransactionToast from './components/TransactionToast';
import ContractSetup from './components/ContractSetup';
import type { TabType, Task } from './types';

function AppContent() {
  const {
    walletConnected,
    walletAddress,
    connecting,
    connectWallet,
    tasks,
    demoMode,
    error,
    clearError,
    lastTxHash,
    pendingTx,
    contractAddress,
    setContractAddress,
  } = useBlockchain();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showContractSetup, setShowContractSetup] = useState(false);

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleBackFromTask = () => {
    setSelectedTask(null);
  };

  const handleSetTab = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Demo mode banner */}
      {demoMode && <DemoModeBanner onSetupContract={() => setShowContractSetup(true)} />}
      
      {/* Contract setup modal */}
      <ContractSetup
        isOpen={showContractSetup}
        onClose={() => setShowContractSetup(false)}
        onSave={setContractAddress}
        currentAddress={contractAddress}
      />
      
      {/* Transaction toast */}
      <TransactionToast 
        pendingTx={pendingTx}
        lastTxHash={lastTxHash}
        error={error}
        onClearError={clearError}
      />
      
      <Header
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        walletConnected={walletConnected}
        walletConnecting={connecting}
        onConnectWallet={handleConnectWallet}
        walletAddress={walletAddress}
        onOpenContractSetup={() => setShowContractSetup(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedTask ? (
            <motion.div
              key="task-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TaskDetail
                task={selectedTask}
                onBack={handleBackFromTask}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard tasks={tasks} onViewTask={handleViewTask} />
              )}
              {activeTab === 'browse' && (
                <TaskBrowser tasks={tasks} onViewTask={handleViewTask} />
              )}
              {activeTab === 'create' && <CreateTask />}
              {activeTab === 'my-tasks' && (
                <MyTasks tasks={tasks} onViewTask={handleViewTask} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BlockchainProvider>
      <AppContent />
    </BlockchainProvider>
  );
}
