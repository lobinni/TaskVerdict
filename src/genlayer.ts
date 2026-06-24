import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import type { Address, TransactionStatus } from 'genlayer-js/types';

// ============================================================================
// CONTRACT CONFIGURATION
// ============================================================================

// Default contract address (zero = demo mode)
const DEFAULT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
const STORAGE_KEY = 'taskverdict_contract_address';

// Get contract address from localStorage or use default
function getStoredContractAddress(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CONTRACT_ADDRESS;
  }
  return DEFAULT_CONTRACT_ADDRESS;
}

// Save contract address to localStorage
export function setContractAddress(address: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, address);
  }
}

// Get current contract address
export function getContractAddress(): string {
  return getStoredContractAddress();
}

// Check if contract is deployed (not zero address)
export function isContractDeployed(): boolean {
  const addr = getStoredContractAddress();
  return addr !== DEFAULT_CONTRACT_ADDRESS && addr !== '';
}

// Chain configuration
const BRADBURY_CHAIN_ID = '0x107d'; // 4221 in hex

// ============================================================================
// CLIENT STATE
// ============================================================================

let client = createClient({ chain: testnetBradbury });
let walletAddress: string | null = null;

// ============================================================================
// WALLET FUNCTIONS
// ============================================================================

/**
 * Lấy địa chỉ wallet hiện tại
 */
export function getAccount(): string | null {
  return walletAddress;
}

/**
 * Kiểm tra wallet đã kết nối chưa
 */
export function isWalletConnected(): boolean {
  return walletAddress !== null;
}

/**
 * Đảm bảo MetaMask đang ở đúng chain (Bradbury Testnet)
 */
async function ensureCorrectChain(ethereum: any): Promise<void> {
  const currentChainId: string = await ethereum.request({ method: 'eth_chainId' });
  
  if (currentChainId?.toLowerCase() !== BRADBURY_CHAIN_ID) {
    try {
      // Thử switch sang Bradbury
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BRADBURY_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Chain chưa tồn tại trong MetaMask - thêm mới
      if (switchError.code === 4902 || /Unrecognized chain/i.test(switchError?.message ?? '')) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: BRADBURY_CHAIN_ID,
            chainName: 'GenLayer Bradbury Testnet',
            nativeCurrency: {
              name: 'GEN',
              symbol: 'GEN',
              decimals: 18,
            },
            rpcUrls: ['https://rpc-bradbury.genlayer.com'],
            blockExplorerUrls: ['https://explorer-bradbury.genlayer.com'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  }
}

/**
 * Kết nối MetaMask wallet
 * @returns Địa chỉ wallet đã kết nối
 */
export async function connectWallet(): Promise<string> {
  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask extension to continue.');
  }
  
  // Request account access
  const accounts: string[] = await ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found. Please unlock MetaMask.');
  }
  
  // Switch to Bradbury Testnet
  await ensureCorrectChain(ethereum);
  
  walletAddress = accounts[0];
  
  // Reinitialize client with wallet address
  client = createClient({
    chain: testnetBradbury,
    account: walletAddress as Address,
  });
  
  console.log('✅ Wallet connected:', walletAddress);
  return walletAddress;
}

/**
 * Ngắt kết nối wallet
 */
export function disconnectWallet(): void {
  walletAddress = null;
  client = createClient({ chain: testnetBradbury });
  console.log('🔌 Wallet disconnected');
}

// ============================================================================
// CONTRACT READ FUNCTIONS (View - không tốn gas)
// ============================================================================

/**
 * Đọc dữ liệu từ contract (view function)
 */
export async function readContract(functionName: string, args: any[] = []): Promise<any> {
  const contractAddress = getContractAddress();
  
  if (!isContractDeployed()) {
    throw new Error('Contract not deployed. Please set contract address first.');
  }

  try {
    const result = await client.readContract({
      address: contractAddress as Address,
      functionName,
      args,
    });
    console.log(`📖 Read ${functionName}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error reading ${functionName}:`, error);
    throw error;
  }
}

/**
 * Lấy thông tin task theo key
 */
export async function getTask(taskKey: string): Promise<any> {
  return readContract('get_task', [taskKey]);
}

/**
 * Lấy thông tin submission
 */
export async function getSubmission(taskKey: string, submitter: string): Promise<any> {
  return readContract('get_submission', [taskKey, submitter]);
}

/**
 * Lấy thông tin payout
 */
export async function readPayout(taskKey: string): Promise<any> {
  return readContract('read_payout', [taskKey]);
}

/**
 * Lấy thống kê platform
 */
export async function getStats(): Promise<{ total_tasks: number; judgments_made: number }> {
  return readContract('stats', []);
}

// ============================================================================
// CONTRACT WRITE FUNCTIONS (Tốn gas, cần wallet)
// ============================================================================

/**
 * Ghi dữ liệu vào contract (write function)
 * Cần kết nối wallet trước
 */
export async function writeContract(
  functionName: string, 
  args: any[] = [],
  waitForFinalized: boolean = true
): Promise<string> {
  const contractAddress = getContractAddress();
  
  if (!isContractDeployed()) {
    throw new Error('Contract not deployed. Please set contract address first.');
  }

  if (!walletAddress) {
    await connectWallet();
  }
  
  try {
    console.log(`📝 Writing ${functionName} with args:`, args);
    
    // Send transaction
    const txHash = await client.writeContract({
      address: contractAddress as Address,
      functionName,
      args,
      value: 0n,
    });
    
    console.log(`📤 Transaction sent: ${txHash}`);
    
    if (waitForFinalized) {
      // Wait for transaction to be finalized
      console.log('⏳ Waiting for transaction to be finalized...');
      
      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        status: 'FINALIZED' as TransactionStatus,
        retries: 60,
        interval: 5000, // Check every 5 seconds
      });
      
      console.log('✅ Transaction finalized:', receipt);
    }
    
    return txHash;
  } catch (error) {
    console.error(`❌ Error writing ${functionName}:`, error);
    throw error;
  }
}

/**
 * Tạo task mới
 * @param title Tiêu đề task
 * @param spec Mô tả chi tiết
 * @param repoRequired Yêu cầu GitHub repo
 * @param milestones Mảng các milestone (sẽ được JSON.stringify)
 */
export async function createTask(
  title: string,
  spec: string,
  repoRequired: boolean,
  milestones: string[]
): Promise<string> {
  const milestonesJson = JSON.stringify(milestones);
  return writeContract('create_task', [title, spec, repoRequired, milestonesJson]);
}

/**
 * Submit công việc
 * @param taskKey Key của task
 * @param githubUrl URL GitHub repo/PR
 * @param notes Ghi chú
 */
export async function submitWork(
  taskKey: string,
  githubUrl: string,
  notes: string
): Promise<string> {
  return writeContract('submit_work', [taskKey, githubUrl, notes]);
}

/**
 * Trigger AI judgment
 * @param taskKey Key của task
 * @param submitter Địa chỉ người submit
 */
export async function judge(taskKey: string, submitter: string): Promise<string> {
  return writeContract('judge', [taskKey, submitter]);
}

/**
 * Dispute verdict (yêu cầu đánh giá lại)
 * @param taskKey Key của task
 * @param submitter Địa chỉ người submit
 */
export async function dispute(taskKey: string, submitter: string): Promise<string> {
  return writeContract('dispute', [taskKey, submitter]);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format địa chỉ wallet ngắn gọn
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Lấy link explorer cho transaction
 */
export function getExplorerTxUrl(txHash: string): string {
  return `https://explorer-bradbury.genlayer.com/tx/${txHash}`;
}

/**
 * Lấy link explorer cho contract
 */
export function getExplorerContractUrl(): string {
  return `https://explorer-bradbury.genlayer.com/contract/${getContractAddress()}`;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Lắng nghe thay đổi account trong MetaMask
 */
export function setupWalletListeners(
  onAccountChange: (accounts: string[]) => void,
  onChainChange: (chainId: string) => void
): void {
  const ethereum = (window as any).ethereum;
  
  if (ethereum) {
    ethereum.on('accountsChanged', (accounts: string[]) => {
      console.log('🔄 Account changed:', accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        walletAddress = accounts[0];
        client = createClient({
          chain: testnetBradbury,
          account: walletAddress as Address,
        });
      }
      onAccountChange(accounts);
    });
    
    ethereum.on('chainChanged', (chainId: string) => {
      console.log('🔄 Chain changed:', chainId);
      onChainChange(chainId);
    });
  }
}
