import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';

interface DemoModeBannerProps {
  onSetupContract?: () => void;
}

export default function DemoModeBanner({ onSetupContract }: DemoModeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>⚠️ Demo Mode:</strong> Để submit lên GenLayer Portal, bạn cần deploy contract thật!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors"
            >
              Deploy Now
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onSetupContract}
              className="flex items-center gap-1 px-3 py-1 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-colors"
            >
              <Settings className="w-3 h-3" />
              Set Contract Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
