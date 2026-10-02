import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { AuthView } from './components/Auth/AuthView';
import { ChatView } from './components/Chat/ChatView';
import { MobileFrame } from './components/MobileFrame';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // By default, show mobile mockup on wide desktop screens (>= 768px)
  const [isMobileMockup, setIsMobileMockup] = useState(() => {
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileMockup(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-xs text-neutral-400 font-mono">Loading ChatGPT Mobile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <MobileFrame isMockup={isMobileMockup}>
        <AuthView />
      </MobileFrame>
    );
  }

  return (
    <MobileFrame isMockup={isMobileMockup}>
      <ChatView
        isMobileMockup={isMobileMockup}
        onToggleMobileMockup={() => setIsMobileMockup((prev) => !prev)}
      />
    </MobileFrame>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <MainApp />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
