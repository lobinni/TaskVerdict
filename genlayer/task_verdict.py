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
