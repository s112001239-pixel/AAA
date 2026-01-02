
import React, { useState, useCallback } from 'react';
import { LayoutGrid, Users, RefreshCw, Share2, Download, Info } from 'lucide-react';
import { Participant, Group } from '../types';

interface GroupingProps {
  participants: Participant[];
}

const COLORS = [
  'bg-blue-50 border-blue-200 text-blue-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-purple-50 border-purple-200 text-purple-700',
  'bg-rose-50 border-rose-200 text-rose-700',
  'bg-indigo-50 border-indigo-200 text-indigo-700',
  'bg-cyan-50 border-cyan-200 text-cyan-700',
  'bg-orange-50 border-orange-200 text-orange-700'
];

const Grouping: React.FC<GroupingProps> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState<number>(3);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper to shuffle array with generic type
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const handleGroup = useCallback(() => {
    if (participants.length === 0) {
      alert('請先在「名單導入」頁面加入參與者');
      return;
    }
    
    setIsAnimating(true);
    
    // Artificial delay for animation feel
    setTimeout(() => {
      const shuffled = shuffleArray<Participant>(participants);
      const result: Group[] = [];
      const totalGroups = Math.ceil(shuffled.length / groupSize);
      
      for (let i = 0; i < totalGroups; i++) {
        result.push({
          id: i + 1,
          name: `第 ${i + 1} 組`,
          members: shuffled.slice(i * groupSize, (i + 1) * groupSize)
        });
      }
      
      setGroups(result);
      setIsAnimating(false);
    }, 600);
  }, [participants, groupSize]);

  const copyResults = () => {
    const text = groups.map(g => `[${g.name}]\n${g.members.map(m => ` - ${m.name}`).join('\n')}`).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('分組結果已複製到剪貼簿');
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;
    
    let csvContent = "組別,姓名\n";
    groups.forEach(group => {
      group.members.forEach(member => {
        csvContent += `"${group.name}","${member.name}"\n`;
      });
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `grouping_result_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Configuration Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <LayoutGrid className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">自動分組</h2>
              <p className="text-sm text-slate-500">輸入每組人數，系統將為您公平隨機分配。</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">每組人數</label>
              <div className="flex items-center">
                <input 
                  type="number" 
                  min="2" 
                  max={participants.length}
                  value={groupSize} 
                  onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-l-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-lg"
                />
                <div className="bg-slate-100 border-y border-r border-slate-200 px-4 py-3 rounded-r-xl text-slate-500 font-medium">人/組</div>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={handleGroup}
                disabled={isAnimating || participants.length === 0}
                className={`
                  flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-200 transition-all active:scale-95
                  ${isAnimating ? 'opacity-70 cursor-wait' : 'hover:bg-emerald-700'}
                `}
              >
                {isAnimating ? <RefreshCw className="animate-spin" /> : <Users size={20} />}
                {isAnimating ? '分組中...' : '開始分組'}
              </button>
            </div>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={copyResults}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Share2 size={16} /> 複製文字
            </button>
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <Download size={16} /> 下載 CSV
            </button>
          </div>
        )}
      </div>

      {/* Group Grid Visualization */}
      <div className="min-h-[400px]">
        {groups.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-slate-300">
            <Users size={64} strokeWidth={1} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">輸入人數並點擊開始分組</p>
            <p className="text-sm opacity-60">目前參與總人數：{participants.length} 人</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groups.map((group, index) => {
              const colorClass = COLORS[index % COLORS.length];
              return (
                <div 
                  key={group.id} 
                  className={`border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md animate-in zoom-in-95 duration-300`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`px-4 py-3 font-bold border-b flex items-center justify-between ${colorClass}`}>
                    <span>{group.name}</span>
                    <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full">{group.members.length} 人</span>
                  </div>
                  <div className="p-4 bg-white space-y-2 min-h-[120px]">
                    {group.members.map((member, mIdx) => (
                      <div key={member.id} className="flex items-center gap-2 text-slate-700 group">
                        <span className="text-slate-300 text-xs font-mono">{mIdx + 1}.</span>
                        <span className="text-sm font-medium group-hover:text-indigo-600 transition-colors">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend / Tips */}
      {groups.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3 border border-slate-100 mt-8">
          <Info className="text-indigo-500 mt-0.5" size={18} />
          <div className="text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 mb-1">提示：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>若總人數無法整除，系統會自動在最後一組分配剩餘成員。</li>
              <li>點擊「重新分組」可進行另一次隨機分配。</li>
              <li>您可以點擊「下載 CSV」將結果儲存以便後續追蹤。</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grouping;
