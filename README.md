# 🛡️ TaskVerdict — AI-Powered Task Verification

<p align="center">
  <img src="https://img.shields.io/badge/GenLayer-Bradbury%20Testnet-6366f1?style=for-the-badge" alt="GenLayer" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity" alt="Solidity" />
</p>

<p align="center">
  <strong>On-chain task verification — AI validators fetch deliverables, score every milestone, and consensus determines fair payouts.</strong>
</p>

<p align="center">
  <a href="#-what-it-does">What it does</a> •
  <a href="#-why-genlayer">Why GenLayer</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 🎯 What it does

TaskVerdict eliminates the need for trusted human reviewers in task/bounty workflows. A **poster** writes a spec and milestone list; a **worker** submits a GitHub URL. **GenLayer validators** fetch the actual deliverable, compare it to the spec milestone-by-milestone, and reach consensus on a pass/fail verdict that an EVM escrow reads to release funds — **no maintainer playing favorites, no off-chain trust**.

### The Lifecycle: `post → submit → judge → (dispute) → pay`

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   POSTER    │     │   WORKER    │     │  AI JUDGE   │     │   ESCROW    │
│ create_task │ ──▶ │ submit_work │ ──▶ │   judge()   │ ──▶ │   payout    │
│ + milestones│     │ GitHub URL  │     │  consensus  │     │  released   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  dispute()  │
                                        │  re-judge   │
                                        └─────────────┘
```

| Step | Function | Description |
|------|----------|-------------|
| 1️⃣ | `create_task(title, spec, repo_required, milestones)` | Poster creates task with spec (max 3000 chars) and JSON milestones like `["Setup repo", "Core logic", "Tests pass"]` |
| 2️⃣ | `submit_work(task_key, github_url, notes)` | Worker submits deliverable (repo/PR URL + notes) |
| 3️⃣ | `judge(task_key, submitter)` | Triggers AI adjudication via GenLayer validators |
| 4️⃣ | `dispute(task_key, submitter)` | Either party can request re-judgment with fresh validator set |
| 5️⃣ | `read_payout(task_key)` | EVM escrow reads verdict to release funds proportional to score |

---

## 🧠 Why GenLayer

A deterministic EVM **cannot** judge whether code "meets the spec":

- ❌ Solidity cannot clone a repo or read a README
- ❌ Two nodes fetching GitHub at different times would diverge  
- ❌ The judgment itself is a natural-language comparison only an LLM can perform

**GenLayer's Optimistic Democracy** solves this:

1. A **leader validator** produces the verdict
2. Other validators **re-evaluate** it
3. Finalization happens when a **supermajority agrees** the result is _reasonable_ (not byte-identical)
4. Either party can **appeal via `dispute()`**

```python
# AI Judgment Core
result_str = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

# leader_fn: Fetches GitHub, runs LLM prompt, returns verdict JSON
# validator_fn: Validates verdict structure (bool, int 0-100, list of milestones)
```

### Use GenLayer when:
✅ Acceptance depends on **subjective, off-chain artifacts** (does this code satisfy this English spec?)  
✅ You need an **on-chain, appealable record**

### Use plain backend when:
✅ Payout is a pure function of **deterministic on-chain state**

---

## 🏗️ Architecture

| Layer | Component | Technology |
|-------|-----------|------------|
| **Intelligent Contract** | `genlayer/task_verdict.py` | GenVM Python — create_task, submit_work, judge, dispute, per-milestone scoring via `run_nondet_unsafe` |
| **Frontend** | `src/` | Vite + React 19 + TypeScript + Tailwind v4 + Framer Motion |
| **EVM Contracts** | `contracts/src/` | TaskEscrow.sol + TVToken.sol — escrow releases on read_payout |
| **Blockchain** | GenLayer Bradbury | Chain ID: 4221 (`0x107d`) |

### How AI Judgment Works

```python
def _run_judgment(self, task, submission):
    def leader_fn():
        # 1. Fetch deliverable from GitHub
        code = gl.nondet.web.get(raw_readme_url)  # or gl.nondet.web.render()
        
        # 2. Build prompt with spec + milestones + code
        prompt = f"""
        SPEC: {task['spec']}
        MILESTONES: {task['milestones']}
        CODE: {code}
        
        Judge each milestone: pass/fail with reason.
        Reply JSON: {{"score": 0-100, "milestones": [...]}}
        """
        
        # 3. Get LLM verdict
        verdict = gl.nondet.exec_prompt(prompt, response_format="json")
        return json.dumps(normalize_verdict(verdict))
    
    def validator_fn(leader_result):
        # Validate structure only (not exact match)
        data = json.loads(leader_result.calldata)
        return validate_verdict(data)  # bool, int 0-100, milestones list
    
    return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
```

---

## 📁 Project Structure

```
TaskVerdict/
├── 📂 genlayer/
│   └── task_verdict.py          # GenLayer Intelligent Contract
│
├── 📂 contracts/
│   └── src/
│       ├── TaskEscrow.sol       # EVM escrow — releases on verdict
│       └── TVToken.sol          # TaskVerdict ERC20 token
│
├── 📂 src/                      # Frontend (React + Vite + TS)
│   ├── 📂 components/
│   │   ├── Header.tsx           # Navigation + wallet connect
│   │   ├── Dashboard.tsx        # Hero + stats + how-it-works
│   │   ├── TaskBrowser.tsx      # Search + filter + task grid
│   │   ├── TaskDetail.tsx       # Milestone timeline + verdict + actions
│   │   ├── CreateTask.tsx       # Task creation form
│   │   ├── MyTasks.tsx          # User's posted/submitted tasks
│   │   └── Footer.tsx           # Footer links
│   ├── App.tsx                  # Main app component
│   ├── types.ts                 # TypeScript interfaces
│   ├── mockData.ts              # Demo data
│   ├── genlayer.ts              # GenLayer client wrapper
│   ├── index.css                # Tailwind + custom theme
│   └── main.tsx                 # Entry point
│
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- MetaMask wallet
- GEN tokens on Bradbury Testnet (for gas)

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

### Demo Mode vs On-Chain Mode

The app runs in **Demo Mode** by default (using mock data). To enable real on-chain transactions:

1. Deploy the contract to GenLayer Bradbury Testnet
2. Update `CONTRACT_ADDRESS` in `src/genlayer.ts`
3. Connect MetaMask and ensure you have GEN tokens for gas

---

## 🌐 Deployment

### Frontend (Cloudflare Pages)

1. Connect your GitHub repo to [Cloudflare Pages](https://pages.cloudflare.com)
2. Configure build settings:
   - **Root directory:** `/` (or `web/` if using monorepo)
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Environment:** `NODE_VERSION=20`

### GenLayer Intelligent Contract

1. Go to [GenLayer Studio](https://studio.genlayer.com)
2. Upload `genlayer/task_verdict.py`
3. Deploy to **Bradbury Testnet**
4. Copy contract address → update `src/genlayer.ts`

### EVM Contracts (Foundry)

```bash
cd contracts

# Deploy TVToken
forge create src/TVToken.sol:TVToken \
  --constructor-args 1000000000000000000000000 \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# Deploy TaskEscrow
forge create src/TaskEscrow.sol:TaskEscrow \
  --constructor-args <TOKEN_ADDRESS> <VERDICT_CONTRACT_ADDRESS> \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

---

## 🔧 Configuration

### Connect to GenLayer Bradbury Testnet

```typescript
// src/genlayer.ts
export const CONTRACT = '0xYOUR_CONTRACT_ADDRESS'
const BRADBURY_HEX = '0x107d'  // Chain ID: 4221

// Network config for MetaMask
{
  chainId: '0x107d',
  chainName: 'GenLayer Bradbury Testnet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://rpc-bradbury.genlayer.com'],
  blockExplorerUrls: ['https://explorer-bradbury.genlayer.com']
}
```

---

## 📝 Engineering Notes

| Principle | Implementation |
|-----------|----------------|
| **No floats** | Scores are `int` (0–100), counters are `u256`. Frontend calculates proportional payout from integer score. |
| **Validate structure, not exact match** | `validator_fn` checks verdict JSON is well-formed, never requires identical reasoning text. |
| **ACCEPTED ≠ executed** | Finalized judgment means validators agreed; funds don't move until escrow reads `read_payout`. |
| **Optimistic finality** | Writes need `FINALIZED` receipt (retries 60×5s). Judgment takes ~30-60s. |
| **Evidence is untrusted** | GitHub URL is attacker-controllable. Fetched content is capped. Prompt instructs judge to fail when no deliverable. |

---

## 🎨 UI/UX Features

- ☀️ **Light theme** with indigo/blue gradient accents
- 📊 **Dashboard** with hero section, stats cards, recent tasks
- 🔍 **Search & Filter** tasks by status, category
- 📋 **Milestone Timeline** with expand/collapse reasons
- 🎯 **Score Ring Chart** animated SVG visualization
- 📱 **Responsive** mobile-first with drawer navigation
- ✨ **Animations** via Framer Motion (stagger, spring physics)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + Vite 7 |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Smart Contract** | GenVM Python + Solidity 0.8.20 |
| **Blockchain** | GenLayer (Bradbury Testnet) |

---

## 📄 API Reference

### Intelligent Contract Methods

#### Write Methods

```python
create_task(title: str, spec: str, repo_required: bool, milestones: str) -> str
submit_work(task_key: str, github_url: str, notes: str) -> None
judge(task_key: str, submitter: str) -> None
dispute(task_key: str, submitter: str) -> None
```

#### View Methods

```python
get_task(key: str) -> dict
get_submission(task_key: str, submitter: str) -> dict
read_payout(task_key: str) -> dict  # {payable, winner, poster, task_key}
stats() -> dict  # {total_tasks, judgments_made}
```

### Verdict Response Format

```json
{
  "overall_pass": true,
  "score": 87,
  "reasoning": "All milestones completed successfully...",
  "milestones": [
    { "name": "Setup repo", "pass": true, "reason": "Repository properly initialized" },
    { "name": "Core logic", "pass": true, "reason": "Business logic implemented correctly" },
    { "name": "Tests pass", "pass": true, "reason": "92% test coverage achieved" }
  ]
}
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Demo:** [taskverdict.pages.dev](https://taskverdict.pages.dev) _(after deployment)_
- **GenLayer Docs:** [docs.genlayer.com](https://docs.genlayer.com)
- **Explorer:** [explorer-bradbury.genlayer.com](https://explorer-bradbury.genlayer.com)

---

<p align="center">
  Built with ❤️ using <a href="https://genlayer.com">GenLayer</a> Intelligent Contracts
</p>
