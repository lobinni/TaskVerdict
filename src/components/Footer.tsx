import { Shield, ExternalLink, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/60 bg-white/40 backdrop-blur-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900">TaskVerdict</span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              AI-powered task verification built on GenLayer. Post tasks, submit deliverables, and let validator consensus determine fair payouts — no trusted intermediary required.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-primary-600 cursor-pointer transition-colors">Browse Tasks</li>
              <li className="hover:text-primary-600 cursor-pointer transition-colors">Create Task</li>
              <li className="hover:text-primary-600 cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-primary-600 cursor-pointer transition-colors">API Reference</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-1 hover:text-primary-600 cursor-pointer transition-colors">
                <Code2 className="w-3.5 h-3.5" />
                GitHub
              </li>
              <li className="flex items-center gap-1 hover:text-primary-600 cursor-pointer transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                GenLayer Docs
              </li>
              <li className="hover:text-primary-600 cursor-pointer transition-colors">Smart Contract</li>
              <li className="hover:text-primary-600 cursor-pointer transition-colors">Explorer</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-gray-400">
            © 2025 TaskVerdict. Built with GenLayer Intelligent Contracts.
          </span>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="hover:text-primary-500 cursor-pointer">Privacy</span>
            <span className="hover:text-primary-500 cursor-pointer">Terms</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-accent-500 rounded-full" />
              Bradbury Testnet
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
