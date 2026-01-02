
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gift, RefreshCcw, History, Trophy, Settings, Users } from 'lucide-react';
import { Participant, Winner } from '../types';

interface LuckyDrawProps {
  participants: Participant[];
}

const LuckyDraw: React.FC<LuckyDrawProps> = ({ participants }) => {
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentDisplay, setCurrentDisplay] = useState<string>('等待開獎...');
  const [latestWinner, setLatestWinner] = useState<Winner | null>(null);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setAvailableParticipants([...participants]);
  }, [participants]);

  const startDraw = useCallback(() => {
    if (availableParticipants.length === 0 && !allowDuplicates) {
      alert('所有參與者都已中獎！');
      return;
    }

    if (isDrawing) return;

    setIsDrawing(true);
    setLatestWinner(null);
    
    let duration = 0;
    const maxDuration = 2500; // 2.5 seconds
    let speed = 50;

    const animate = () => {
      duration += speed;
      
      // Randomly pick from ALL if allowed, or only from available
      const pool = allowDuplicates ? participants : availableParticipants;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const randomParticipant = pool[randomIndex];
      
      setCurrentDisplay(randomParticipant?.name || '...');

      if (duration < maxDuration) {
        // Slow down as we reach the end
        if (duration > maxDuration * 0.7) speed += 15;
        timerRef.current = window.setTimeout(animate, speed);
      } else {
        // Final Selection
        const finalWinner = pool[randomIndex];
        const winnerObj: Winner = {
          ...finalWinner,
          timestamp: Date.now()
        };

        setWinners(prev => [winnerObj, ...prev]);
        setLatestWinner(winnerObj);
        
        if (!allowDuplicates) {
          setAvailableParticipants(prev => prev.filter(p => p.id !== finalWinner.id));
        }

        setIsDrawing(false);
      }
    };

    animate();
  }, [availableParticipants, allowDuplicates, isDrawing, participants]);

  const resetDraw = () => {
    if (confirm('確定要重設抽籤狀態與中獎名單嗎？')) {
      setAvailableParticipants([...participants]);
      setWinners([]);
      setLatestWinner(null);
      setCurrentDisplay('等待開獎...');
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Configuration & Main Draw */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Gift className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">抽籤大廳</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Users size={14} /> 參與人數: {participants.length} | 
                剩餘名額: {allowDuplicates ? '不限' : availableParticipants.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input 
                type="checkbox" 
                checked={allowDuplicates} 
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">重複中獎</span>
            </label>
            <div className="w-px h-4 bg-slate-200"></div>
            <button 
              onClick={resetDraw}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="重設抽籤"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        {/* Display Box */}
        <div className="relative group">
          <div className={`
            aspect-video rounded-3xl flex flex-col items-center justify-center p-8 transition-all duration-500
            ${isDrawing ? 'bg-indigo-600 shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50' : 'bg-slate-900 shadow-xl'}
          `}>
            {/* Animated Background effects */}
            {isDrawing && (
              <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-20">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/20 blur-[100px] animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/20 blur-[100px] animate-pulse delay-700"></div>
              </div>
            )}
            
            <div className={`text-center transition-all duration-300 ${isDrawing ? 'scale-110' : ''}`}>
              <div className="text-indigo-400 font-medium tracking-widest text-xs uppercase mb-4 opacity-70">
                {isDrawing ? '正在隨機挑選...' : 'LUCKY WINNER'}
              </div>
              <div className={`
                font-bold transition-all duration-75
                ${isDrawing ? 'text-white text-5xl md:text-7xl drop-shadow-lg' : 'text-indigo-500 text-4xl md:text-6xl'}
              `}>
                {currentDisplay}
              </div>
            </div>

            {latestWinner && !isDrawing && (
              <div className="absolute bottom-6 animate-bounce text-emerald-400 flex items-center gap-2 font-bold bg-emerald-950/50 px-4 py-1.5 rounded-full border border-emerald-800">
                <Trophy size={20} /> 恭喜中獎！
              </div>
            )}
          </div>
          
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs">
            <button
              onClick={startDraw}
              disabled={isDrawing || (availableParticipants.length === 0 && !allowDuplicates)}
              className={`
                w-full py-4 rounded-2xl font-bold text-xl shadow-xl transition-all flex items-center justify-center gap-3
                ${isDrawing 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed translate-y-2' 
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white hover:scale-105 active:scale-95 bg-[length:200%_auto] hover:bg-right'}
              `}
            >
              {isDrawing ? (
                <>
                  <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                  開獎中...
                </>
              ) : (
                <>
                  <Gift size={24} /> 立即抽籤
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-700 mb-2">
          <History size={18} /> 中獎紀錄
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl h-[450px] overflow-hidden flex flex-col">
          {winners.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 px-8 text-center">
              <Trophy size={32} className="mb-4 opacity-20" />
              <p className="text-sm">尚未產生中獎者<br/>點擊抽籤按鈕開始吧！</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {winners.map((winner, index) => (
                <div 
                  key={`${winner.id}-${winner.timestamp}`}
                  className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group animate-in slide-in-from-right duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs border border-amber-100">
                      {winners.length - index}
                    </div>
                    <span className="font-semibold text-slate-800">{winner.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(winner.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
          {winners.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-100">
              <button 
                onClick={() => {
                  const text = winners.map((w, i) => `${winners.length - i}. ${w.name}`).join('\n');
                  navigator.clipboard.writeText(text);
                  alert('中獎清單已複製到剪貼簿');
                }}
                className="w-full text-xs text-indigo-600 font-medium hover:underline text-center"
              >
                複製所有名單
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuckyDraw;
