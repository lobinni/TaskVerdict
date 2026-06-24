import { AlertTriangle, Settings } from 'lucide-react';

interface DemoModeBannerProps {
  onSetupContract?: () => void;
}

export default function DemoModeBanner({ onSetupContract }: DemoModeBannerProps) {
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Demo Mode:</strong> Contract chưa được deploy. Dữ liệu hiển thị là mock data.
          </span>
          <button
            onClick={onSetupContract}
            className="flex items-center gap-1 text-amber-600 hover:text-amber-700 underline font-medium"
          >
            <Settings className="w-3 h-3" />
            Setup Contract
          </button>
        </div>
      </div>
    </div>
  );
}
