# 🚀 Hướng Dẫn Deploy TaskVerdict Lên GenLayer (On-Chain)

## Mục Lục
1. [Chuẩn bị](#1-chuẩn-bị)
2. [Deploy Intelligent Contract](#2-deploy-intelligent-contract)
3. [Cấu hình Frontend](#3-cấu-hình-frontend)
4. [Test On-Chain](#4-test-on-chain)
5. [Deploy Frontend](#5-deploy-frontend)

---

## 1. Chuẩn Bị

### 1.1 Cài đặt MetaMask
1. Cài đặt [MetaMask extension](https://metamask.io/download/)
2. Tạo hoặc import wallet

### 1.2 Thêm GenLayer Bradbury Testnet vào MetaMask
Mở MetaMask → Settings → Networks → Add Network → Add Network Manually:

| Field | Value |
|-------|-------|
| Network Name | GenLayer Bradbury Testnet |
| RPC URL | `https://rpc-bradbury.genlayer.com` |
| Chain ID | `4221` |
| Currency Symbol | `GEN` |
| Block Explorer | `https://explorer-bradbury.genlayer.com` |

### 1.3 Lấy GEN Testnet Tokens
1. Truy cập [GenLayer Discord](https://discord.gg/genlayer)
2. Vào channel `#faucet`
3. Gõ lệnh: `/faucet <your_wallet_address>`
4. Nhận GEN tokens để trả gas fees

---

## 2. Deploy Intelligent Contract

### 2.1 Mở GenLayer Studio
1. Truy cập: https://studio.genlayer.com
2. Kết nối MetaMask wallet
3. Chọn network: **Bradbury Testnet**

### 2.2 Upload Contract Code
1. Click **"New Contract"**
2. Copy toàn bộ nội dung file `genlayer/task_verdict.py`
3. Paste vào editor

### 2.3 Deploy Contract
1. Click **"Deploy"**
2. MetaMask sẽ popup yêu cầu confirm transaction
3. Approve transaction và chờ confirmation (~30-60 giây)
4. **Copy contract address** sau khi deploy thành công

### 2.4 Verify Contract (Optional)
1. Mở [GenLayer Explorer](https://explorer-bradbury.genlayer.com)
2. Search contract address vừa deploy
3. Verify code nếu cần

---

## 3. Cấu Hình Frontend

### 3.1 Cập nhật Contract Address
Mở file `src/genlayer.ts` và thay đổi:

```typescript
// TRƯỚC (Demo mode)
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

// SAU (On-chain mode) - thay bằng address thật
export const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS' as Address;
```

### 3.2 Build lại Frontend
```bash
npm run build
```

---

## 4. Test On-Chain

### 4.1 Chạy Local Server
```bash
npm run dev
```

### 4.2 Test Flow Đầy Đủ

#### Bước 1: Connect Wallet
1. Click "Connect Wallet"
2. MetaMask popup → Approve connection
3. Nếu chưa ở Bradbury network, app sẽ tự động switch

#### Bước 2: Create Task (Tốn Gas)
1. Vào tab "Create Task"
2. Điền thông tin:
   - **Title**: "Build a Todo App"
   - **Category**: "Frontend"
   - **Reward**: 1000
   - **Spec**: "Create a React Todo app with add, delete, mark complete features"
   - **Milestones**: 
     - "Add todo functionality"
     - "Delete todo functionality"  
     - "Mark complete feature"
3. Click "Create Task"
4. MetaMask popup → Confirm transaction
5. Chờ transaction finalize (~30-60s)

#### Bước 3: Submit Work (Tốn Gas)
1. Click vào task vừa tạo
2. Click "Submit Work"
3. Điền:
   - **GitHub URL**: `https://github.com/example/todo-app`
   - **Notes**: "All features implemented. See README for demo."
4. Click "Submit Deliverable"
5. Confirm transaction

#### Bước 4: Trigger AI Judgment (Tốn Gas + AI Processing)
1. Trong task detail, click "Trigger AI Judgment"
2. Confirm transaction
3. **Chờ AI xử lý** (~1-2 phút)
   - GenLayer validators sẽ:
     - Fetch GitHub repo
     - Đọc README và code
     - So sánh với spec
     - Chấm điểm từng milestone
     - Đạt consensus
4. Sau khi finalize, verdict sẽ hiển thị:
   - Score (0-100)
   - Pass/Fail cho từng milestone
   - Reasoning

#### Bước 5: Dispute (Optional)
1. Nếu không đồng ý với verdict
2. Click "Dispute Verdict"
3. AI sẽ re-evaluate với validator set mới

---

## 5. Deploy Frontend

### 5.1 Cloudflare Pages (Recommended)

1. Push code lên GitHub
2. Vào [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Pages → Create a project → Connect to Git
4. Chọn repo
5. Cấu hình:
   - **Root directory**: `/` 
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Environment variables**:
     - `NODE_VERSION`: `20`
6. Deploy!

### 5.2 Vercel

```bash
npm install -g vercel
vercel
```

### 5.3 Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 📊 Transaction Costs (Estimated)

| Action | Gas (GEN) | Notes |
|--------|-----------|-------|
| create_task | ~0.001 GEN | Lưu task vào state |
| submit_work | ~0.0005 GEN | Lưu submission |
| judge | ~0.01-0.05 GEN | AI processing + consensus |
| dispute | ~0.01-0.05 GEN | Re-run AI judgment |

---

## 🔍 Troubleshooting

### "MetaMask not found"
→ Cài đặt MetaMask extension

### "Wrong network"  
→ App sẽ tự động switch sang Bradbury. Nếu không, thêm network thủ công.

### "Insufficient funds for gas"
→ Lấy thêm GEN từ faucet trên Discord

### "Transaction pending quá lâu"
→ GenLayer consensus mất ~30-60s. Judgment có thể mất 1-2 phút do AI processing.

### "Contract not deployed"
→ Kiểm tra CONTRACT_ADDRESS trong `src/genlayer.ts` có đúng không

---

## 📱 Explorer Links

- **Contract**: `https://explorer-bradbury.genlayer.com/contract/{ADDRESS}`
- **Transaction**: `https://explorer-bradbury.genlayer.com/tx/{HASH}`
- **Account**: `https://explorer-bradbury.genlayer.com/address/{ADDRESS}`

---

## ✅ Checklist Deploy

- [ ] MetaMask installed
- [ ] Bradbury network added
- [ ] GEN tokens từ faucet
- [ ] Contract deployed via Studio
- [ ] CONTRACT_ADDRESS updated
- [ ] Frontend built
- [ ] Test on local
- [ ] Deploy frontend (Cloudflare/Vercel/Netlify)

---

## 🎉 Xong!

Sau khi hoàn thành, bạn có:
- ✅ Intelligent Contract on GenLayer Bradbury
- ✅ Frontend kết nối on-chain
- ✅ Real transactions với gas
- ✅ AI-powered judging với validator consensus
