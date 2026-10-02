import React from 'react';
import { X, Download, Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('User installed AskMe WebAPK');
        onClose();
      }
    } else {
      // Fallback instruction for Android Chrome
      alert('Android Chrome లో పైన ఉన్న 3 చుక్కలు (⋮) నొక్కి "Install app" లేదా "Add to Home screen" క్లిక్ చేయండి. వెంటనే రియల్ యాప్ మీ ఫోన్‌లో ఇన్‌స్టాల్ అవుతుంది!');
    }
  };

  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/AskMe-AI-Mobile-App.zip';
    link.download = 'AskMe-AI-Mobile-App.zip';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AskMe Android App</h3>
              <p className="text-[11px] text-neutral-400">Mobile Installation & APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>ఆండ్రాయిడ్ ఫోన్‌లో రియల్ యాప్‌లా వాడండి</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              మీ ఆండ్రాయిడ్ మొబైల్‌లో క్రోమ్ బ్రౌజర్ ద్వారా నేరుగా హోమ్ స్క్రీన్ మరియు యాప్ డ్రాయర్‌లోకి రియల్ యాప్‌గా ఇన్‌స్టాల్ చేసుకోవచ్చు.
            </p>
          </div>

          {/* Primary Action: Direct WebAPK Install */}
          <button
            onClick={handleInstallPwa}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium rounded-2xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Smartphone className="w-4 h-4" />
            <span className="font-semibold">📲 Install Real App on Android (1-Tap)</span>
          </button>

          {/* Secondary Action: Download Project Bundle / APK Package */}
          <button
            onClick={handleDownloadZip}
            className="w-full py-3 px-4 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 font-medium rounded-2xl text-xs transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Project Package (.zip)</span>
          </button>

          {/* Simple 3-step Instructions */}
          <div className="pt-2 text-left space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              ఫోన్‌లో ఇన్‌స్టాల్ చేసుకునే 3 స్టెప్స్:
            </div>
            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>మొబైల్ Chrome లో <strong>http://192.168.1.35:5173/</strong> ఓపెన్ చేయండి.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>పైనున్న "Install Real App" నొక్కండి (లేదా Chrome లో 3 dots ⋮ నొక్కి "Install App" సెలెక్ట్ చేయండి).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>వెంటనే మీ మొబైల్ హోమ్ స్క్రీన్‌పై **AskMe** రియల్ యాప్ ఐకాన్ యాడ్ అయిపోతుంది!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950/60 border-t border-neutral-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
