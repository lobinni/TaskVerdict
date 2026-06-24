export interface Milestone {
  name: string;
  pass: boolean | null;
  reason: string;
}

export interface Task {
  id: string;
  poster: string;
  title: string;
  spec: string;
  repo_required: boolean;
  milestones: string[];
  milestone_count: number;
  status: 'open' | 'judging' | 'completed' | 'disputed';
  winner: string;
  reward: number;
  created_at: string;
  category: string;
}

export interface Submission {
  submitter: string;
  github_url: string;
  notes: string;
  verdict: Verdict | null;
  milestone_results: MilestoneResult[];
}

export interface MilestoneResult {
  name: string;
  pass: boolean;
  reason: string;
}

export interface Verdict {
  overall_pass: boolean;
  score: number;
  reasoning: string;
  milestones: MilestoneResult[];
}

export type TabType = 'dashboard' | 'create' | 'browse' | 'my-tasks';
export type TaskFilter = 'all' | 'open' | 'judging' | 'completed' | 'disputed';
