# 🛡️ TaskVerdict — AI-Powered Task Verification

<p align="center">
  <img src="https://img.shields.io/badge/GenLayer-Bradbury%20Testnet-6366f1?style=for-the-badge" alt="GenLayer" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>On-chain task verification — AI validators fetch deliverables, score every milestone, and consensus determines fair payouts.</strong>
</p>

---

## 🔗 Live Contract

| Network | Contract Address | Explorer |
|---------|------------------|----------|
| **Bradbury Testnet** | `0x704A17d0f4C3CAd37354f3c94A7F6e230dcC9996` | [View on Explorer](https://explorer-bradbury.genlayer.com/contract/0x704A17d0f4C3CAd37354f3c94A7F6e230dcC9996) |

---

## 🎯 What it does

TaskVerdict eliminates the need for trusted human reviewers in task/bounty workflows. A **poster** writes a spec and milestone list; a **worker** submits a GitHub URL. **GenLayer validators** fetch the actual deliverable, compare it to the spec milestone-by-milestone, and reach consensus on a pass/fail verdict that releases funds — **no maintainer playing favorites, no off-chain trust**.

### The Lifecycle: `post → submit → judge → (dispute) → pay`

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   POSTER    │     │   WORKER    │     │  AI JUDGE   │     │   ESCROW    │
│ create_task │ ──▶ │ submit_work │ ──▶ │   judge()   │ ──▶ │   payout    │
│ + milestones│     │ GitHub URL  │     │  consensus  │     │  released   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

| Step | Function | Description |
|------|----------|-------------|
| 1️⃣ | `create_task(title, spec, repo_required, milestones)` | Poster creates task with spec and milestones |
| 2️⃣ | `submit_work(task_key, github_url, notes)` | Worker submits deliverable |
| 3️⃣ | `judge(task_key, submitter)` | Triggers AI adjudication via GenLayer validators |
| 4️⃣ | `dispute(task_key, submitter)` | Request re-judgment with fresh validator set |
| 5️⃣ | `read_payout(task_key)` | Read verdict to release funds proportional to score |

---

## 🧠 Why GenLayer

A deterministic EVM **cannot** judge whether code "meets the spec":

- ❌ Solidity cannot clone a repo or read a README
- ❌ Two nodes fetching GitHub at different times would diverge  
- ❌ The judgment itself requires natural-language understanding

**GenLayer's Optimistic Democracy** solves this:

1. A **leader validator** produces the verdict
2. Other validators **re-evaluate** it
3. Finalization happens when a **supermajority agrees** the result is _reasonable_
4. Either party can **appeal via `dispute()`**

---

## 🏗️ Architecture

| Layer | Component | Technology |
|-------|-----------|------------|
| **Intelligent Contract** | `genlayer/task_verdict.py` | GenVM Python |
| **Frontend** | `src/` | Vite + React 19 + TypeScript + Tailwind v4 |
| **Blockchain** | GenLayer Bradbury | Chain ID: 4221 |

---

## 📁 Project Structure

```
TaskVerdict/
├── 📂 genlayer/
│   └── task_verdict.py          # GenLayer Intelligent Contract
├── 📂 contracts/
│   └── src/
│       ├── TaskEscrow.sol       # EVM escrow contract
│       └── TVToken.sol          # ERC20 token
├── 📂 src/                      # Frontend
│   ├── 📂 components/
│   │   ├── Header.tsx
│   │   ├── Dashboard.tsx
│   │   ├── TaskBrowser.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── CreateTask.tsx
│   │   ├── MyTasks.tsx
│   │   ├── ContractSetup.tsx
│   │   └── Footer.tsx
│   ├── 📂 context/
│   │   └── BlockchainContext.tsx
│   ├── App.tsx
│   ├── genlayer.ts              # GenLayer SDK wrapper
│   ├── types.ts
│   └── mockData.ts
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
└── LICENSE
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MetaMask wallet
- GEN tokens on Bradbury Testnet

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/TaskVerdict.git
cd TaskVerdict

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build    # Output: dist/
npm run preview  # Preview production build
```

---

## 🔧 Configuration

### MetaMask Network Setup

Add GenLayer Bradbury Testnet to MetaMask:

| Field | Value |
|-------|-------|
| Network Name | `GenLayer Bradbury Testnet` |
| RPC URL | `https://rpc-bradbury.genlayer.com` |
| Chain ID | `4221` |
| Currency | `GEN` |
| Explorer | `https://explorer-bradbury.genlayer.com` |

### Get Testnet Tokens

1. Join [GenLayer Discord](https://discord.gg/genlayer)
2. Go to `#faucet` channel
3. Request tokens: `/faucet YOUR_WALLET_ADDRESS`

---

## 📝 Contract Methods

### Write Methods (require gas)

```python
create_task(title: str, spec: str, repo_required: bool, milestones: str) -> str
submit_work(task_key: str, github_url: str, notes: str) -> None
judge(task_key: str, submitter: str) -> None
dispute(task_key: str, submitter: str) -> None
```

### View Methods (free)

```python
get_task(key: str) -> dict
get_submission(task_key: str, submitter: str) -> dict
read_payout(task_key: str) -> dict
stats() -> dict
```

### Verdict Response Format

```json
{
  "overall_pass": true,
  "score": 87,
  "reasoning": "All milestones completed successfully...",
  "milestones": [
    { "name": "Setup repo", "pass": true, "reason": "Repository properly initialized" },
    { "name": "Core logic", "pass": true, "reason": "Business logic implemented correctly" }
  ]
}
```

---

## 🎨 Features

- ☀️ **Light theme** with indigo/blue gradient
- 📊 **Dashboard** with stats and recent tasks
- 🔍 **Search & Filter** tasks
- 📋 **Milestone Timeline** with expand/collapse
- 🎯 **Score Ring Chart** visualization
- 📱 **Responsive** design
- ⚡ **Real-time** transaction status
- 🔗 **On-chain** integration with GenLayer

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + Vite 7 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Blockchain | GenLayer SDK |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Contract:** [`0x704A17d0f4C3CAd37354f3c94A7F6e230dcC9996`](https://explorer-bradbury.genlayer.com/contract/0x704A17d0f4C3CAd37354f3c94A7F6e230dcC9996)
- **GenLayer Docs:** [docs.genlayer.com](https://docs.genlayer.com)
- **GenLayer Studio:** [studio.genlayer.com](https://studio.genlayer.com)
- **Explorer:** [explorer-bradbury.genlayer.com](https://explorer-bradbury.genlayer.com)

---

<p align="center">
  Built with ❤️ using <a href="https://genlayer.com">GenLayer</a> Intelligent Contracts
</p>
