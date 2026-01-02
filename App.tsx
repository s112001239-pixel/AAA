
import React, { useState, useCallback, useMemo } from 'react';
import { Users, Gift, LayoutGrid, FileText, ChevronRight } from 'lucide-react';
import ParticipantInput from './components/ParticipantInput';
import LuckyDraw from './components/LuckyDraw';
import Grouping from './components/Grouping';
import { Participant, AppTab } from './types';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('input');

  const handleUpdateParticipants = useCallback((newNames: string[]) => {
    const formatted = newNames
      .filter(n => n.trim() !== '')
      .map((name, index) => ({
        id: `p-${Date.now()}-${index}`,
        name: name.trim()
      }));
    setParticipants(formatted);
  }, []);

  const clearParticipants = () => {
    if (confirm('確定要清空名單嗎？')) {
      setParticipants([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Users size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              HR Event Pro
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-4">
            <nav className="flex p-1 bg-slate-100 rounded-lg">
              <TabButton 
                active={activeTab === 'input'} 
                onClick={() => setActiveTab('input')}
                icon={<FileText size={18} />}
                label="名單導入"
              />
              <TabButton 
                active={activeTab === 'draw'} 
                onClick={() => setActiveTab('draw')}
                icon={<Gift size={18} />}
                label="獎品抽籤"
              />
              <TabButton 
                active={activeTab === 'grouping'} 
                onClick={() => setActiveTab('grouping')}
                icon={<LayoutGrid size={18} />}
                label="自動分組"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === 'input' && (
            <ParticipantInput 
              participants={participants} 
              onUpdate={handleUpdateParticipants} 
              onClear={clearParticipants}
              onNext={() => setActiveTab('draw')}
            />
          )}
          {activeTab === 'draw' && (
            <LuckyDraw participants={participants} />
          )}
          {activeTab === 'grouping' && (
            <Grouping participants={participants} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-100">
        &copy; 2024 HR Event Management Tools. All Rights Reserved.
      </footer>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
      active 
        ? 'bg-white text-indigo-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
