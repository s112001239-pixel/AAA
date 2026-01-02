
import React, { useState, useRef, useMemo } from 'react';
import { Upload, Trash2, List, Play, Info, Database, UserCheck, AlertCircle } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantInputProps {
  participants: Participant[];
  onUpdate: (names: string[]) => void;
  onClear: () => void;
  onNext: () => void;
}

const MOCK_NAMES = [
  "王小明", "李大華", "張美麗", "陳志強", "林佩芬", 
  "周杰倫", "蔡依林", "林俊傑", "蕭敬騰", "楊丞琳",
  "王大錘", "趙鐵柱", "李翠花", "張三", "李四",
  "James Bond", "Sherlock Holmes", "Tony Stark", "Bruce Wayne", "Diana Prince"
];

const ParticipantInput: React.FC<ParticipantInputProps> = ({ participants, onUpdate, onClear, onNext }) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute duplicate names for visual feedback
  const duplicateNames = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return new Set(Object.keys(counts).filter(name => counts[name] > 1));
  }, [participants]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const processNames = () => {
    const lines = inputText.split('\n');
    const names = lines.map(l => l.trim()).filter(l => l !== '');
    if (names.length === 0) {
      alert('請先輸入或上傳名單');
      return;
    }
    onUpdate(names);
    setInputText('');
  };

  const loadMockData = () => {
    setInputText(MOCK_NAMES.join('\n'));
  };

  const removeDuplicates = () => {
    const uniqueNames = Array.from(new Set(participants.map(p => p.name)));
    onUpdate(uniqueNames);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const names = text.split(/\r?\n/).map(line => line.split(',')[0].trim()).filter(n => n !== '');
      onUpdate(names);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Input area */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <List className="text-indigo-600" /> 名單導入
            </h2>
            <div className="flex gap-2">
              <button
                onClick={loadMockData}
                className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Database size={16} /> 模擬名單
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Upload size={16} /> 上傳 CSV
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv,.txt" 
                className="hidden" 
              />
            </div>
          </div>
          
          <p className="text-sm text-slate-500">
            請輸入姓名，每行一個。您也可以直接貼上 CSV 內容、上傳檔案或點擊「模擬名單」快速測試。
          </p>

          <textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="王小明&#10;李大華&#10;張三..."
            className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm leading-relaxed"
          ></textarea>

          <div className="flex justify-end gap-3">
            <button
              onClick={processNames}
              disabled={!inputText.trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              更新名單
            </button>
          </div>
        </div>

        {/* Right Side: Preview & Status */}
        <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">預覽名單 ({participants.length})</h3>
            <div className="flex gap-1">
              {duplicateNames.size > 0 && (
                <button 
                  onClick={removeDuplicates}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                  title="移除重複姓名"
                >
                  <UserCheck size={16} /> 淨化
                </button>
              )}
              {participants.length > 0 && (
                <button 
                  onClick={onClear}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="清空名單"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {participants.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center h-48 text-slate-400">
              <Info size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
              <p className="text-sm">尚未加入任何成員</p>
            </div>
          ) : (
            <>
              {duplicateNames.size > 0 && (
                <div className="mb-3 px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2 text-rose-600">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <p className="text-[10px] leading-tight font-medium">偵測到重複姓名！點擊上方「淨化」按鈕可一鍵清除。</p>
                </div>
              )}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {participants.map((p, idx) => {
                  const isDuplicate = duplicateNames.has(p.name);
                  return (
                    <div 
                      key={p.id} 
                      className={`
                        px-3 py-2 rounded-lg border text-sm flex justify-between items-center group transition-all
                        ${isDuplicate 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-700'}
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`text-xs font-mono ${isDuplicate ? 'text-rose-300' : 'text-slate-300'}`}>{idx + 1}.</span>
                        {p.name}
                      </span>
                      {isDuplicate && <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-100 px-1.5 py-0.5 rounded">重複</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {participants.length > 0 && (
            <div className="mt-6">
              <button
                onClick={onNext}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all active:translate-y-[0px]"
              >
                準備開始 <Play size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantInput;
