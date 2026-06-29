# 🚀 HƯỚNG DẪN DEPLOY TASKVERDICT LÊN GENLAYER (THẬT)

## ⚠️ QUAN TRỌNG: Để được chấp nhận trên GenLayer Portal, bạn CẦN:
1. ✅ Deploy Intelligent Contract **thật** lên Bradbury Testnet
2. ✅ Có **giao dịch on-chain** với gas (create_task, submit_work, judge)
3. ✅ Screenshot/video chứng minh hoạt động thật

---

## 📋 BƯỚC 1: LẤY GEN TOKENS (5 phút)

### 1.1 Thêm Bradbury Network vào MetaMask
Mở MetaMask → Settings → Networks → Add Network:

| Field | Value |
|-------|-------|
| Network Name | `GenLayer Bradbury Testnet` |
| RPC URL | `https://rpc-bradbury.genlayer.com` |
| Chain ID | `4221` |
| Currency | `GEN` |
| Explorer | `https://explorer-bradbury.genlayer.com` |

### 1.2 Lấy GEN từ Faucet
1. Vào Discord GenLayer: https://discord.gg/genlayer
2. Tìm channel `#faucet` hoặc `#testnet-faucet`
3. Gõ lệnh: `/faucet <YOUR_WALLET_ADDRESS>`
4. Chờ nhận GEN tokens (~10-50 GEN)

**Hoặc** dùng web faucet:
- https://faucet.genlayer.com (nếu có)
- Kiểm tra trong GenLayer Portal

---

## 📋 BƯỚC 2: DEPLOY CONTRACT (10 phút)

### 2.1 Mở GenLayer Studio
URL: **https://studio.genlayer.com**

### 2.2 Kết nối Wallet
1. Click "Connect Wallet"
2. Chọn MetaMask
3. Approve connection
4. Đảm bảo đang ở **Bradbury Testnet**

### 2.3 Tạo Contract Mới
1. Click **"New Contract"** hoặc **"+"**
2. Xóa code mẫu

### 2.4 Paste Contract Code
Copy TOÀN BỘ code dưới đây và paste vào editor:

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

### 2.5 Deploy
1. Click nút **"Deploy"** (hoặc Ctrl+Shift+D)
2. MetaMask popup → **Confirm** transaction
3. Chờ ~30-60 giây
4. ✅ Copy **Contract Address** khi deploy thành công!

**Lưu contract address, ví dụ:** `0x1234567890abcdef1234567890abcdef12345678`

---

## 📋 BƯỚC 3: CẬP NHẬT FRONTEND (2 phút)

### 3.1 Mở App
Chạy local hoặc mở deployed app

### 3.2 Cấu hình Contract
1. Click nút **⚙️ Settings** trên header
2. Paste **Contract Address** vào input
3. Click **"Save & Connect"**
4. App sẽ reload

---

## 📋 BƯỚC 4: TẠO GIAO DỊCH THẬT (5 phút)

### 4.1 Connect Wallet
1. Click **"Connect Wallet"**
2. Approve trong MetaMask
3. Đảm bảo có GEN tokens

### 4.2 Create Task (Transaction 1)
1. Vào tab **"Create Task"**
2. Điền:
   - **Title:** "Build a Simple Calculator"
   - **Category:** Frontend
   - **Reward:** 100
   - **Spec:** "Create a web calculator with add, subtract, multiply, divide operations. Must have clean UI."
   - **Milestones:**
     - "Basic arithmetic operations"
     - "Clean user interface"
     - "Error handling"
3. Click **"Create Task"**
4. **Confirm** trong MetaMask (tốn gas)
5. Chờ transaction confirm (~30-60s)
6. ✅ **Screenshot** transaction success

### 4.3 Submit Work (Transaction 2)
1. Click vào task vừa tạo
2. Click **"Submit Work"**
3. Điền:
   - **GitHub URL:** `https://github.com/example/calculator` (hoặc repo thật của bạn)
   - **Notes:** "Implemented all features. Check README for demo."
4. Click **"Submit Deliverable"**
5. **Confirm** trong MetaMask
6. ✅ **Screenshot** transaction success

### 4.4 AI Judgment (Transaction 3)
1. Click **"Trigger AI Judgment"**
2. **Confirm** trong MetaMask
3. Chờ AI xử lý (~1-2 phút)
4. ✅ **Screenshot** verdict result

---

## 📋 BƯỚC 5: CHUẨN BỊ EVIDENCE CHO PORTAL

### Evidence cần có:
1. **Contract Address** trên Bradbury
2. **Explorer links** cho các transactions
3. **Screenshots:**
   - Contract deployed
   - Task created
   - Work submitted
   - AI judgment result
4. **GitHub repo link** của dự án

### Links quan trọng:
- Contract: `https://explorer-bradbury.genlayer.com/contract/YOUR_ADDRESS`
- Transaction: `https://explorer-bradbury.genlayer.com/tx/TX_HASH`

---

## 📋 BƯỚC 6: SUBMIT LẠI TRÊN PORTAL

1. Vào: https://portal.genlayer.foundation/builders/contributions
2. Chọn **"Projects & Milestones"**
3. Điền thông tin:
   - **Project Name:** TaskVerdict
   - **Description:** AI-Powered Task Verification Platform using GenLayer Intelligent Contracts
   - **Contract Address:** (paste địa chỉ thật)
   - **Evidence:** 
     - Link Explorer contract
     - Link các transactions
     - Screenshots
     - GitHub repo
4. Submit!

---

## ✅ CHECKLIST TRƯỚC KHI SUBMIT

- [ ] Contract deployed trên Bradbury Testnet
- [ ] Có contract address thật (không phải 0x000...)
- [ ] Ít nhất 1 transaction `create_task`
- [ ] Ít nhất 1 transaction `submit_work`  
- [ ] Ít nhất 1 transaction `judge` (AI processed)
- [ ] Screenshots tất cả các bước
- [ ] Links Explorer hoạt động
- [ ] GitHub repo có code

---

## 🆘 TROUBLESHOOTING

### "Insufficient funds"
→ Lấy thêm GEN từ Discord faucet

### "Transaction failed"
→ Kiểm tra contract đã deploy chưa, address đúng chưa

### "AI Judgment timeout"
→ Thử lại, GenLayer validators có thể busy

### "Contract not found"
→ Đảm bảo đang ở Bradbury Testnet, không phải Asimov

---

## 📞 SUPPORT

- GenLayer Discord: https://discord.gg/genlayer
- GenLayer Docs: https://docs.genlayer.com
- Explorer: https://explorer-bradbury.genlayer.com
