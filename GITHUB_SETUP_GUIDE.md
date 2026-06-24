# 📋 Hướng Dẫn Tạo Dự Án TaskVerdict Trên GitHub - Chi Tiết Từng Bước

## 🔍 Phân Tích Dự Án Gốc (BountyJudge)

### BountyJudge là gì?
BountyJudge là một nền tảng phân xử bounty (tiền thưởng) on-chain sử dụng AI. Luồng hoạt động:
1. **Poster** tạo bounty với spec + milestones
2. **Worker** submit công việc (GitHub URL)
3. **AI Validators** (GenLayer) crawl deliverable, so sánh với spec, chấm điểm từng milestone
4. **Consensus** - validators đồng thuận về kết quả (pass/fail)
5. **Payout** - escrow contract release tiền dựa trên điểm số

### Công nghệ sử dụng:
- **Smart Contract**: GenVM Python (Intelligent Contract)
- **Frontend**: Vite + React 19 + TypeScript + Tailwind v4
- **UI Theme**: Dark mode, amber accent, bounty board layout
- **Blockchain**: GenLayer Bradbury Testnet (chain 4221)
- **Libraries**: framer-motion, sonner, genlayer-js

### Dự án TaskVerdict (dự án mới) khác gì?
| Tiêu chí | BountyJudge | TaskVerdict |
|-----------|------------|-------------|
| **Theme** | Dark mode, amber accent | Light mode, indigo/blue accent |
| **Layout** | Left sidebar + detail pane | Full-width card grid + dashboard |
| **Brand** | BountyJudge | TaskVerdict |
| **Navigation** | Minimal header | Tab-based navigation + mobile drawer |
| **Milestones** | Progress strips | Timeline-based với expand/collapse |
| **Score Display** | Text-based | SVG ring chart |
| **Dashboard** | Không có | Hero section + stats cards + how-it-works |
| **Search** | Không có | Search bar + filter pills |
| **Color Scheme** | Dark bg + amber | Light bg + indigo gradient |
| **Animations** | Cơ bản | Stagger animations, layout transitions |

---

## 🚀 BƯỚC 1: Tạo Repository Trên GitHub

### 1.1 Tạo repo mới
1. Truy cập https://github.com/new
2. Điền thông tin:
   - **Repository name**: `TaskVerdict`
   - **Description**: `AI-Powered Task Verification & Bounty Adjudication Platform — built on GenLayer`
   - **Visibility**: Public
   - **Initialize**: Tick ✅ "Add a README file"
   - **Add .gitignore**: Chọn `Node`
   - **License**: MIT
3. Click **"Create repository"**

### 1.2 Clone repo về máy
```bash
git clone https://github.com/YOUR_USERNAME/TaskVerdict.git
cd TaskVerdict
```

---

## 🚀 BƯỚC 2: Thiết Lập Cấu Trúc Dự Án

### 2.1 Cấu trúc thư mục đầy đủ
```
TaskVerdict/
├── genlayer/
│   └── task_verdict.py         # GenLayer Intelligent Contract
├── contracts/
│   ├── src/
│   │   ├── TaskEscrow.sol      # EVM escrow contract
│   │   └── TVToken.sol         # Task Verdict token
│   └── test/
│       └── TaskEscrow.t.sol    # Tests
├── web/                        # Frontend (React + Vite + TS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TaskBrowser.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   ├── CreateTask.tsx
│   │   │   ├── MyTasks.tsx
│   │   │   └── Footer.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── types.ts
│   │   ├── mockData.ts
│   │   ├── genlayer.ts         # GenLayer client wrapper
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── .gitignore
├── README.md
└── LICENSE
```

### 2.2 Tạo thư mục
```bash
mkdir -p genlayer contracts/src contracts/test web/src/components
```

---

## 🚀 BƯỚC 3: Tạo Frontend (web/)

### 3.1 Khởi tạo Vite project
```bash
cd web
npm create vite@latest . -- --template react-ts
npm install
npm install framer-motion lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

### 3.2 Cấu hình vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3.3 Tạo các file frontend
Tất cả code frontend đã có sẵn trong thư mục `web/src/` của dự án demo này. Copy các file sau:

- `index.html` - Entry HTML
- `src/index.css` - Tailwind imports + custom theme
- `src/types.ts` - TypeScript interfaces
- `src/mockData.ts` - Demo data
- `src/App.tsx` - Main app component
- `src/components/Header.tsx` - Navigation header
- `src/components/Dashboard.tsx` - Dashboard view
- `src/components/TaskBrowser.tsx` - Task browsing/search
- `src/components/TaskDetail.tsx` - Task detail + verdicts
- `src/components/CreateTask.tsx` - Create new task form
- `src/components/MyTasks.tsx` - User's tasks view
- `src/components/Footer.tsx` - Footer

---

## 🚀 BƯỚC 4: Tạo GenLayer Intelligent Contract

### 4.1 Tạo file `genlayer/task_verdict.py`

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
import json
from genlayer import *

MAX_SPEC_CHARS = 3000
MAX_CODE_CHARS = 5000


def validate_milestone(m) -> bool:
    if not isinstance(m, dict):
        return False
    name = m.get("name")
    reason = m.get("reason")
    passed = m.get("pass")
    if not isinstance(name, str) or not name.strip():
        return False
    if not isinstance(reason, str) or not reason.strip():
        return False
    if not isinstance(passed, bool):
        return False
    return True


def derive_overall_pass(milestones, fallback):
    if milestones:
        return all(bool(m.get("pass")) for m in milestones)
    return bool(fallback)


def validate_verdict(data) -> bool:
    if not isinstance(data, dict):
        return False
    overall_pass = data.get("overall_pass")
    if not isinstance(overall_pass, bool):
        return False
    score = data.get("score")
    if not isinstance(score, int) or isinstance(score, bool):
        return False
    if score < 0 or score > 100:
        return False
    reasoning = data.get("reasoning")
    if not isinstance(reasoning, str) or not reasoning.strip():
        return False
    milestones = data.get("milestones")
    if not isinstance(milestones, list):
        return False
    for m in milestones:
        if not validate_milestone(m):
            return False
    if milestones:
        if overall_pass != all(bool(m["pass"]) for m in milestones):
            return False
    return True


def normalize_verdict(raw) -> dict:
    if not isinstance(raw, dict):
        raw = {}
    milestones = []
    raw_ms = raw.get("milestones")
    if isinstance(raw_ms, list):
        for m in raw_ms:
            if not isinstance(m, dict):
                continue
            name = m.get("name")
            reason = m.get("reason")
            name = name.strip() if isinstance(name, str) and name.strip() else "milestone"
            reason = reason.strip() if isinstance(reason, str) and reason.strip() else "no reason provided"
            milestones.append({"name": name, "pass": bool(m.get("pass")), "reason": reason})
    score = raw.get("score")
    if not isinstance(score, int) or isinstance(score, bool):
        score = 0
    score = max(0, min(100, score))
    reasoning = raw.get("reasoning")
    if not isinstance(reasoning, str) or not reasoning.strip():
        reasoning = "no reasoning provided"
    overall_pass = derive_overall_pass(milestones, raw.get("overall_pass", False))
    return {
        "overall_pass": overall_pass,
        "score": score,
        "reasoning": reasoning,
        "milestones": milestones,
    }


class TaskVerdict(gl.Contract):
    owner: str
    tasks: TreeMap[str, str]
    submissions: TreeMap[str, str]
    task_count: u256
    judgments_made: u256

    def __init__(self):
        self.owner = str(gl.message.sender_address)
        self.task_count = u256(0)
        self.judgments_made = u256(0)

    @gl.public.write
    def create_task(self, title: str, spec: str, repo_required: bool, milestones: str) -> str:
        title = str(title).strip()
        spec = str(spec).strip()
        if not title or not spec:
            raise Exception("title and spec required")
        if len(spec) > MAX_SPEC_CHARS:
            raise Exception(f"spec too long (max {MAX_SPEC_CHARS})")
        try:
            ms = json.loads(str(milestones)) if milestones else []
        except Exception:
            ms = []
        if not isinstance(ms, list):
            ms = []
        key = str(int(self.task_count))
        task = {
            "poster": str(gl.message.sender_address),
            "title": title,
            "spec": spec,
            "repo_required": bool(repo_required),
            "milestones": ms,
            "milestone_count": len(ms),
            "status": "open",
            "winner": "",
        }
        self.tasks[key] = json.dumps(task)
        self.task_count += u256(1)
        return key

    @gl.public.write
    def submit_work(self, task_key: str, github_url: str, notes: str) -> None:
        task_key = str(task_key)
        if task_key not in self.tasks:
            raise Exception("unknown task")
        task = json.loads(self.tasks[task_key])
        if task["status"] != "open":
            raise Exception("task not open")
        submitter = str(gl.message.sender_address)
        sub_key = f"{task_key}:{submitter}"
        submission = {
            "submitter": submitter,
            "github_url": str(github_url).strip(),
            "notes": str(notes).strip()[:1000],
            "verdict": None,
            "milestone_results": [],
        }
        self.submissions[sub_key] = json.dumps(submission)

    @gl.public.write
    def judge(self, task_key: str, submitter: str) -> None:
        task_key = str(task_key)
        submitter = str(submitter)
        if task_key not in self.tasks:
            raise Exception("unknown task")
        task = json.loads(self.tasks[task_key])
        sub_key = f"{task_key}:{submitter}"
        if sub_key not in self.submissions:
            raise Exception("no submission from this address")
        submission = json.loads(self.submissions[sub_key])
        verdict = self._run_judgment(task, submission)
        submission["verdict"] = verdict
        submission["milestone_results"] = verdict.get("milestones", [])
        self.submissions[sub_key] = json.dumps(submission)
        if verdict["overall_pass"]:
            task["status"] = "completed"
            task["winner"] = submitter
            self.tasks[task_key] = json.dumps(task)
        self.judgments_made += u256(1)

    def _run_judgment(self, task: dict, submission: dict) -> dict:
        spec = task["spec"]
        milestones = task["milestones"]
        github_url = submission["github_url"]
        notes = submission["notes"]

        def leader_fn() -> str:
            code_content = "(no code fetched)"
            if github_url and github_url.startswith("http"):
                try:
                    fetch_url = github_url
                    if "github.com" in github_url and "/blob/" not in github_url:
                        fetch_url = github_url.rstrip("/") + "/raw/main/README.md"
                        if "/raw/" not in fetch_url:
                            fetch_url = github_url.replace(
                                "github.com", "raw.githubusercontent.com"
                            ) + "/main/README.md"
                    raw = gl.nondet.web.get(fetch_url)
                    code_content = raw.body.decode("utf-8")[:MAX_CODE_CHARS]
                except Exception:
                    try:
                        rendered = gl.nondet.web.render(github_url, mode="text")
                        code_content = rendered[:MAX_CODE_CHARS]
                    except Exception:
                        code_content = "(GitHub fetch failed)"

            milestone_block = ""
            if milestones:
                milestone_block = "MILESTONES TO EVALUATE (judge each individually):\n"
                for i, ms in enumerate(milestones):
                    milestone_block += f"  {i+1}. {ms}\n"

            prompt = f"""You are a task verification judge. A poster created a task with a specification.
A worker submitted deliverables. Your job: determine if the work meets the spec.

TASK SPECIFICATION:
{spec[:MAX_SPEC_CHARS]}

{milestone_block}

WORKER'S NOTES:
{notes[:500]}

DELIVERABLE CODE/README (fetched from GitHub):
{code_content}

JUDGMENT RULES:
1. Compare deliverable against EACH requirement in the spec.
2. If milestones exist, score each one: pass/fail with reason.
3. Be strict but fair. Partial work = fail unless spec allows it.
4. If code fetch failed, judge based on available notes only (likely fail).

Reply ONLY valid JSON:
{{"score": <0-100>, "reasoning": "<summary>", "milestones": [{{"name": "<name>", "pass": true/false, "reason": "<why>"}}]}}
No markdown, no code fences."""

            raw = gl.nondet.exec_prompt(prompt, response_format="json")
            if not isinstance(raw, dict):
                try:
                    raw = json.loads(str(raw))
                except Exception:
                    raw = {}
            return json.dumps(normalize_verdict(raw))

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            try:
                data = json.loads(leader_result.calldata)
            except Exception:
                return False
            return validate_verdict(data)

        result_str = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        return json.loads(result_str)

    @gl.public.write
    def dispute(self, task_key: str, submitter: str) -> None:
        task_key = str(task_key)
        sub_key = f"{task_key}:{submitter}"
        if sub_key not in self.submissions:
            raise Exception("no submission found")
        task = json.loads(self.tasks[task_key])
        submission = json.loads(self.submissions[sub_key])
        caller = str(gl.message.sender_address)
        if caller != task["poster"] and caller != submitter:
            raise Exception("only poster or submitter can dispute")
        verdict = self._run_judgment(task, submission)
        submission["verdict"] = verdict
        submission["milestone_results"] = verdict.get("milestones", [])
        self.submissions[sub_key] = json.dumps(submission)
        if verdict["overall_pass"]:
            task["status"] = "completed"
            task["winner"] = submitter
        else:
            task["status"] = "disputed"
            task["winner"] = ""
        self.tasks[task_key] = json.dumps(task)
        self.judgments_made += u256(1)

    @gl.public.view
    def get_task(self, key: str) -> dict:
        key = str(key)
        if key not in self.tasks:
            return {"exists": False}
        return json.loads(self.tasks[key])

    @gl.public.view
    def get_submission(self, task_key: str, submitter: str) -> dict:
        sub_key = f"{str(task_key)}:{str(submitter)}"
        if sub_key not in self.submissions:
            return {"exists": False}
        return json.loads(self.submissions[sub_key])

    @gl.public.view
    def read_payout(self, task_key: str) -> dict:
        task_key = str(task_key)
        if task_key not in self.tasks:
            return {"payable": False}
        task = json.loads(self.tasks[task_key])
        return {
            "payable": task["status"] == "completed",
            "winner": task["winner"],
            "poster": task["poster"],
            "task_key": task_key,
        }

    @gl.public.view
    def stats(self) -> dict:
        return {
            "total_tasks": int(self.task_count),
            "judgments_made": int(self.judgments_made),
        }
```

---

## 🚀 BƯỚC 5: Tạo GenLayer Client Wrapper

### 5.1 Tạo file `web/src/genlayer.ts`

```typescript
// Uncomment khi cài genlayer-js: npm install genlayer-js
// import { createClient } from 'genlayer-js'
// import { testnetBradbury } from 'genlayer-js/chains'
// import type { Address } from 'genlayer-js/types'

export const CONTRACT = '0xYOUR_CONTRACT_ADDRESS_HERE'
const BRADBURY_HEX = '0x107d'

let walletAddress: string | null = null

export function account(): string | null {
  return walletAddress
}

export function isWalletConnected(): boolean {
  return walletAddress !== null
}

async function ensureChain(eth: any) {
  const id: string = await eth.request({ method: 'eth_chainId' })
  if (id?.toLowerCase() !== BRADBURY_HEX) {
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BRADBURY_HEX }],
      })
    } catch (e: any) {
      if (e?.code === 4902 || /Unrecognized chain/i.test(e?.message ?? '')) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BRADBURY_HEX,
              chainName: 'GenLayer Bradbury Testnet',
              nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
              rpcUrls: ['https://rpc-bradbury.genlayer.com'],
              blockExplorerUrls: ['https://explorer-bradbury.genlayer.com'],
            },
          ],
        })
      } else throw e
    }
  }
}

export async function connectWallet(): Promise<string> {
  const eth = (globalThis as any).window?.ethereum
  if (!eth) throw new Error('MetaMask not found — install it to sign transactions.')
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
  await ensureChain(eth)
  walletAddress = accounts[0]
  return walletAddress
}

// Uncomment khi deploy contract và cài genlayer-js:
// export async function read(fn: string, args: any[] = []) {
//   const client = createClient({ chain: testnetBradbury })
//   return client.readContract({
//     address: CONTRACT as Address,
//     functionName: fn,
//     args,
//   })
// }
//
// export async function write(fn: string, args: any[] = []) {
//   if (!walletAddress) await connectWallet()
//   const client = createClient({
//     chain: testnetBradbury,
//     account: walletAddress as Address,
//   })
//   const txHash = await client.writeContract({
//     address: CONTRACT as Address,
//     functionName: fn,
//     args,
//     value: 0n,
//   })
//   await client.waitForTransactionReceipt({
//     hash: txHash,
//     status: 'FINALIZED',
//     retries: 60,
//     interval: 5000,
//   })
//   return txHash
// }
```

---

## 🚀 BƯỚC 6: Tạo EVM Smart Contracts

### 6.1 Tạo file `contracts/src/TaskEscrow.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TVToken.sol";

contract TaskEscrow {
    TVToken public token;
    address public verdictOracle; // GenLayer contract address

    struct Escrow {
        address poster;
        uint256 amount;
        bool released;
    }

    mapping(string => Escrow) public escrows;

    event EscrowCreated(string taskKey, address poster, uint256 amount);
    event EscrowReleased(string taskKey, address winner, uint256 amount);

    constructor(address _token, address _verdictOracle) {
        token = TVToken(_token);
        verdictOracle = _verdictOracle;
    }

    function createEscrow(string memory taskKey, uint256 amount) external {
        require(amount > 0, "amount must be > 0");
        require(escrows[taskKey].amount == 0, "escrow already exists");
        token.transferFrom(msg.sender, address(this), amount);
        escrows[taskKey] = Escrow(msg.sender, amount, false);
        emit EscrowCreated(taskKey, msg.sender, amount);
    }

    function releaseEscrow(string memory taskKey, address winner, uint256 score) external {
        Escrow storage e = escrows[taskKey];
        require(!e.released, "already released");
        require(score <= 100, "invalid score");
        uint256 payout = (e.amount * score) / 100;
        token.transfer(winner, payout);
        if (payout < e.amount) {
            token.transfer(e.poster, e.amount - payout);
        }
        e.released = true;
        emit EscrowReleased(taskKey, winner, payout);
    }
}
```

### 6.2 Tạo file `contracts/src/TVToken.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TVToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("TaskVerdict Token", "TVT") {
        _mint(msg.sender, initialSupply);
    }
}
```

---

## 🚀 BƯỚC 7: Tạo README.md

```markdown
# TaskVerdict — AI-Powered Task Verification

**On-chain task verification — AI validators fetch deliverables, score every milestone,
and consensus determines fair payouts.**

TaskVerdict eliminates the need for trusted human reviewers in task/bounty workflows.
A poster writes a spec and milestone list; a worker submits a GitHub URL.
GenLayer validators fetch the actual deliverable, compare it to the spec
milestone-by-milestone, and reach consensus on a pass/fail verdict that an EVM
escrow reads to release funds.

## What it does

The lifecycle is **post → submit → judge → (dispute) → pay**:

1. **`create_task`** — poster creates a task with spec + milestones
2. **`submit_work`** — worker submits GitHub URL + notes
3. **`judge`** — AI evaluation via GenLayer validators
4. **`dispute`** — either party can request re-judgment
5. **Payout** — escrow releases funds proportional to score

## Architecture

| Component | Technology |
|-----------|-----------|
| Intelligent Contract | GenVM Python (task_verdict.py) |
| Frontend | Vite + React 19 + TypeScript + Tailwind v4 |
| EVM Contracts | TaskEscrow.sol + TVToken.sol |
| Blockchain | GenLayer Bradbury Testnet (chain 4221) |

## Develop

```bash
cd web
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

## License

MIT
```

---

## 🚀 BƯỚC 8: Tạo .gitignore

```gitignore
node_modules/
dist/
.env
.DS_Store
*.log
```

---

## 🚀 BƯỚC 9: Push Lên GitHub

```bash
# Từ thư mục gốc của dự án
git add .
git commit -m "feat: initial TaskVerdict - AI-powered task verification platform"
git push origin main
```

---

## 🚀 BƯỚC 10: Deploy Frontend (Cloudflare Pages)

1. Truy cập https://dash.cloudflare.com → Pages → Create a project
2. Connect GitHub repo `TaskVerdict`
3. Cấu hình:
   - **Root directory**: `web`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Environment variable**: `NODE_VERSION=20`
4. Click **"Save and Deploy"**

---

## 🚀 BƯỚC 11: Deploy Smart Contract

### Deploy GenLayer Contract:
1. Truy cập https://studio.genlayer.com
2. Upload file `genlayer/task_verdict.py`
3. Deploy lên Bradbury Testnet
4. Copy contract address → cập nhật `web/src/genlayer.ts`

### Deploy EVM Contracts:
```bash
# Sử dụng Foundry
cd contracts
forge create src/TVToken.sol:TVToken --constructor-args 1000000000000000000000000
forge create src/TaskEscrow.sol:TaskEscrow --constructor-args <TOKEN_ADDR> <VERDICT_CONTRACT>
```

---

## 📝 Tổng Kết

Dự án TaskVerdict có các điểm khác biệt chính so với BountyJudge:

1. **UI/UX hoàn toàn mới**: Light theme, indigo gradient, card-based dashboard
2. **Branding khác**: TaskVerdict vs BountyJudge
3. **Layout khác**: Tab navigation + hero section + stats vs sidebar bounty board
4. **Milestone display**: Timeline với expand/collapse vs progress strips
5. **Score display**: SVG ring chart vs text-based
6. **Dashboard**: Full dashboard view với stats, how-it-works
7. **Search/Filter**: Có search bar + filter pills
8. **Responsive**: Mobile-first với drawer navigation

Cùng concept (AI-powered bounty judging trên GenLayer) nhưng implementation và giao diện hoàn toàn khác biệt.
