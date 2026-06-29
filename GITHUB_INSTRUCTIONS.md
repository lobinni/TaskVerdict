# 📤 Hướng Dẫn Push Code Lên GitHub

## Bước 1: Tạo Repository trên GitHub

1. Truy cập: https://github.com/new
2. Điền thông tin:
   - **Repository name:** `TaskVerdict`
   - **Description:** `AI-Powered Task Verification Platform built on GenLayer`
   - **Visibility:** Public
   - ⚠️ **KHÔNG tick** "Add a README file" (đã có sẵn)
   - ⚠️ **KHÔNG tick** "Add .gitignore" (đã có sẵn)
3. Click **"Create repository"**

## Bước 2: Push Code

Sau khi tạo repo, GitHub sẽ hiển thị hướng dẫn. Chạy các lệnh sau trong terminal:

```bash
# Di chuyển vào thư mục project
cd /path/to/your/project

# Khởi tạo Git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "feat: TaskVerdict - AI-Powered Task Verification on GenLayer

- Intelligent Contract deployed on Bradbury Testnet
- Contract: 0x704A17d0f4C3CAd37354f3c94A7F6e230dcC9996
- React 19 + TypeScript + Tailwind CSS frontend
- Real on-chain transactions with gas
- AI-powered milestone judging"

# Thêm remote (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/TaskVerdict.git

# Đổi branch sang main (nếu cần)
git branch -M main

# Push lên GitHub
git push -u origin main
```

## Bước 3: Verify

1. Refresh trang GitHub repository
2. Kiểm tra tất cả files đã được upload
3. Kiểm tra README hiển thị đúng

## 📁 Files Quan Trọng

Đảm bảo các files sau đã được push:

```
✅ README.md                 - Documentation
✅ LICENSE                   - MIT License
✅ .gitignore               - Git ignore rules
✅ package.json             - Dependencies
✅ vite.config.ts           - Vite config
✅ tsconfig.json            - TypeScript config
✅ index.html               - Entry HTML
✅ src/                     - Source code
✅ genlayer/task_verdict.py - Intelligent Contract
✅ contracts/               - Solidity contracts
```

## 🔗 Links Sau Khi Push

Sau khi push, bạn sẽ có:
- **GitHub Repo:** `https://github.com/YOUR_USERNAME/TaskVerdict`
- **Contract:** `https://explorer-bradbury.genlayer.com/contract/0x704A17d0f4C3CAd37354f3c94A7F6e230dcC9996`

## 📝 Submit Lên GenLayer Portal

Khi submit trên https://portal.genlayer.foundation/builders/contributions:

1. **Project Name:** TaskVerdict
2. **Description:** AI-Powered Task Verification Platform using GenLayer Intelligent Contracts. Features include task creation, work submission, AI-powered judging with milestone scoring, and dispute resolution.
3. **Contract Address:** `0x704A17d0f4C3CAd37354f3c94A7F6e230dcC9996`
4. **GitHub URL:** `https://github.com/YOUR_USERNAME/TaskVerdict`
5. **Evidence:**
   - Contract Explorer link
   - Transaction hashes
   - Screenshots

---

Good luck! 🚀
