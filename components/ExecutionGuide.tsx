
import React, { useState, useRef } from 'react';
import { generateXHSNote, generateXHSImage, refineXHSNote } from '../services/geminiService';
import { IPAsset, DesignSuggestion, TaskStatus } from '../types';

interface ExecutionGuideProps {
  ipInfo: IPAsset;
  designResults: DesignSuggestion | null;
  persistedNoteData: { title: string; content: string; tags: string[] } | null;
  setPersistedNoteData: React.Dispatch<React.SetStateAction<{ title: string; content: string; tags: string[] } | null>>;
  persistedNoteImages: string[];
  setPersistedNoteImages: React.Dispatch<React.SetStateAction<string[]>>;
  noteTaskStatus: TaskStatus;
  setNoteTaskStatus: React.Dispatch<React.SetStateAction<TaskStatus>>;
  onNavigateToOrder?: (services: string[]) => void;
}

const BOOSTING_PRICES: Record<string, number> = {
  fans: 500,
  interaction: 300,
  location: 800,
  conversion: 1000
};

export const ExecutionGuide: React.FC<ExecutionGuideProps> = ({ 
  ipInfo, 
  designResults, 
  persistedNoteData,
  setPersistedNoteData,
  persistedNoteImages,
  setPersistedNoteImages,
  noteTaskStatus,
  setNoteTaskStatus,
  onNavigateToOrder 
}) => {
  const [showNoteCreator, setShowNoteCreator] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [refining, setRefining] = useState(false);
  const [loadingImages, setLoadingImages] = useState<boolean[]>([]);
  const [selectedBoosting, setSelectedBoosting] = useState<string[]>([]);
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const [generatingCustomImage, setGeneratingCustomImage] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [refineTarget, setRefineTarget] = useState<'title' | 'content' | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [currentMockupIdx, setCurrentMockupIdx] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNote = async () => {
    setNoteTaskStatus('doing');
    if (persistedNoteData) {
      setShowNoteCreator(true);
      return;
    }
    setLoadingNote(true);
    setShowNoteCreator(true);
    const data = await generateXHSNote(ipInfo, ipInfo.activityTheme || '');
    setPersistedNoteData(data);
    setLoadingNote(false);
    setLoadingImages([true, false, true]);
    const posterUrl = designResults?.materials[0]?.mockupUrl || `https://picsum.photos/seed/poster/600/800`;
    setPersistedNoteImages(['', posterUrl, '']);
    const [cover, info] = await Promise.all([
      generateXHSImage(`xhs aesthetic cover for ${ipInfo.name} ${ipInfo.activityTheme}, ${ipInfo.style}`, ipInfo),
      generateXHSImage(`xhs info graphics for ${ipInfo.name} event features: ${ipInfo.uxFeatures.join(', ')}`, ipInfo)
    ]);
    setPersistedNoteImages([cover, posterUrl, info]);
    setLoadingImages([false, false, false]);
  };

  const handleRefine = async () => {
    if (!persistedNoteData || !refineInstruction) return;
    setRefining(true);
    const updated = await refineXHSNote(persistedNoteData, refineInstruction);
    setPersistedNoteData(updated);
    setRefining(false);
    setRefineTarget(null);
    setRefineInstruction('');
  };

  const handleAddCustomImage = async () => {
    if (!customImagePrompt.trim()) return;
    setGeneratingCustomImage(true);
    const newImg = await generateXHSImage(`${customImagePrompt}, color scheme of ${ipInfo.name}`, ipInfo);
    setPersistedNoteImages(prev => [...prev, newImg]);
    setGeneratingCustomImage(false);
    setShowImagePrompt(false);
    setCustomImagePrompt('');
  };

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPersistedNoteImages(prev => [...prev, ev.target!.result as string]);
          setShowAddChoice(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinishNote = () => {
    if (noteTaskStatus !== 'done') {
      setNoteTaskStatus('done');
      alert('已成功发送至小红书待发布列表！');
    }
    setShowNoteCreator(false);
  };

  const settlementTotal = selectedBoosting.reduce((sum, id) => sum + (BOOSTING_PRICES[id] || 0), 0);

  const steps = [
    { title: '物流与履约', status: '进行中', desc: '您的模块化展具正在运输途中', date: '预计01-24到达', icon: '🚚' },
    { 
      title: '笔记创作与加热', 
      status: noteTaskStatus === 'todo' ? '待开始' : noteTaskStatus === 'doing' ? '进行中' : '已完成', 
      desc: '利用AI生成爆款小红书笔记并开启精准投流', 
      date: '建议开展前3天发布', 
      icon: '📱', 
      action: handleCreateNote 
    },
    { title: '搭建与布展', status: '待开始', desc: 'AI生成的5分钟极简搭建教程已就绪', date: '需2人完成', icon: '🛠️' },
    { title: '回收与循环', status: '待开始', desc: '活动结束后一键呼叫逆向物流', date: '预计贡献50kg减排', icon: '♻️' },
  ];

  if (showNoteCreator) {
    return (
      <div className="space-y-12 animate-fade-in pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNoteCreator(false)} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm hover:bg-gray-50 transition-all">←</button>
          <div>
            <h2 className="text-2xl font-black text-gray-900">AI 笔记创作与加热</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">赋能视觉与文字，引爆社交声量</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-orange-50 shadow-sm space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">笔记图片 (点击放大)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {persistedNoteImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group cursor-zoom-in">
                      {loadingImages[idx] ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[#ED3C38] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <>
                          <img src={img} className="w-full h-full object-cover" alt={`note-${idx}`} onClick={() => setZoomedImage(img)} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <button onClick={() => {
                               const next = persistedNoteImages.filter((_, i) => i !== idx);
                               setPersistedNoteImages(next);
                               if (currentMockupIdx >= next.length) setCurrentMockupIdx(Math.max(0, next.length - 1));
                             }} className="p-2 bg-white rounded-full text-xs">🗑️</button>
                          </div>
                          {idx === 0 && <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-[8px] font-black rounded uppercase">封面</span>}
                        </>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowAddChoice(true)}
                    className="aspect-[3/4] rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#ED3C38] hover:text-[#ED3C38] transition-all bg-gray-50/50"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">新增图片</span>
                  </button>
                </div>
              </div>

              {loadingNote ? (
                <div className="h-64 flex flex-col items-center justify-center gap-6 py-20">
                  <div className="w-16 h-16 border-4 border-[#ED3C38] border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-black text-gray-900 uppercase tracking-widest">正在构思爆款文案...</p>
                </div>
              ) : persistedNoteData ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">笔记标题</label>
                      <button onClick={() => setRefineTarget('title')} className="text-[10px] font-black text-[#ED3C38] hover:bg-red-50 px-2 py-1 rounded transition-colors">✨ 调整生成</button>
                    </div>
                    <input type="text" value={persistedNoteData.title} onChange={(e) => setPersistedNoteData({...persistedNoteData, title: e.target.value})} className="w-full bg-gray-50 p-6 rounded-[24px] font-black text-lg outline-none focus:ring-2 focus:ring-[#ED3C3822] transition-all" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">笔记正文</label>
                      <button onClick={() => setRefineTarget('content')} className="text-[10px] font-black text-[#ED3C38] hover:bg-red-50 px-2 py-1 rounded transition-colors">✨ 调整生成</button>
                    </div>
                    <textarea rows={10} value={persistedNoteData.content} onChange={(e) => setPersistedNoteData({...persistedNoteData, content: e.target.value})} className="w-full bg-gray-50 p-6 rounded-[32px] font-bold text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#ED3C3822] transition-all whitespace-pre-wrap" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">热门标签</label>
                    <div className="flex flex-wrap gap-2 px-2">
                      {persistedNoteData.tags.map(tag => (
                        <span key={tag} className="bg-blue-50 text-[#6AB2FF] px-4 py-2 rounded-full text-xs font-black border border-blue-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="bg-gray-900 text-white p-10 rounded-[48px] shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ED3C3822] rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-xl font-black italic tracking-tighter mb-2">投流加热服务 (流量加速器)</h4>
                    <p className="text-xs opacity-60 font-bold">选择您的加热目标，我们将通过小红书聚光平台进行精准分发</p>
                  </div>
                  {selectedBoosting.length > 0 && (
                    <button onClick={() => onNavigateToOrder?.(selectedBoosting)} className="bg-[#ED3C38] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.05] transition-all active:scale-95">
                      立即结算 ¥{settlementTotal}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'fans', label: '粉丝增长包', desc: '精准触达 IP 潜在粉丝', price: '¥500' },
                    { id: 'interaction', label: '互动提升包', desc: '提升点赞/收藏/评论', price: '¥300' },
                    { id: 'location', label: '同城引流包', desc: '向门店 5km 范围内推送', price: '¥800' },
                    { id: 'conversion', label: '销售转化包', desc: '引导直接进入预约/购买', price: '¥1000' }
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setSelectedBoosting(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])} className={`p-6 rounded-[32px] border-2 text-left transition-all ${selectedBoosting.includes(opt.id) ? 'border-[#ED3C38] bg-[#ED3C3811]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-sm">{opt.label}</span>
                        {selectedBoosting.includes(opt.id) && <span className="text-[#ED3C38]">●</span>}
                      </div>
                      <p className="text-[10px] opacity-50 font-bold">{opt.desc}</p>
                      <p className="text-xs font-black mt-4 text-[#ED3C38]">{opt.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="sticky top-28 space-y-8">
              <div className="bg-[#FF7A77] p-1.5 rounded-[56px] shadow-2xl border border-[#FF7A77]/20 relative w-[320px] mx-auto aspect-[9/19]">
                <div className="w-24 h-5 bg-[#FF7A77] absolute top-4 left-1/2 -translate-x-1/2 rounded-full z-20 border border-white/10 shadow-inner"></div>
                <div className="bg-white w-full h-full rounded-[48px] overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center px-8 pt-6 pb-2 text-[10px] font-black text-gray-800">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5"><span>📶</span><span>🔋 85%</span></div>
                  </div>
                  <div className="bg-gray-100 flex items-center justify-center relative overflow-hidden flex-shrink-0 aspect-[3/4]">
                    <div className="w-full h-full relative group">
                      {persistedNoteImages.length > 0 ? (
                        <div className="w-full h-full flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentMockupIdx * 100}%)` }}>
                          {persistedNoteImages.map((img, i) => <img key={i} src={img} className="w-full h-full object-cover flex-shrink-0" alt={`preview-${i}`} />)}
                        </div>
                      ) : <div className="w-full h-full flex items-center justify-center text-4xl">📸</div>}
                      {persistedNoteImages.length > 1 && (
                        <>
                          <button onClick={() => setCurrentMockupIdx(prev => Math.max(0, prev - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/20 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">‹</button>
                          <button onClick={() => setCurrentMockupIdx(prev => Math.min(persistedNoteImages.length - 1, prev + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/20 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">›</button>
                        </>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 px-2 py-1 rounded-full">
                      {persistedNoteImages.map((_, i) => <div key={i} onClick={() => setCurrentMockupIdx(i)} className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${i === currentMockupIdx ? 'bg-white scale-125' : 'bg-white/50'}`} />)}
                    </div>
                  </div>
                  <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scroll">
                    <p className="font-black text-sm leading-snug">{persistedNoteData?.title || '正在构思标题...'}</p>
                    <p className="text-[11px] text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{persistedNoteData?.content || '内容生成中...'}</p>
                    <div className="flex flex-wrap gap-1">{persistedNoteData?.tags.map(t => <span key={t} className="text-[10px] text-blue-500 font-bold">{t}</span>)}</div>
                  </div>
                </div>
              </div>
              <button onClick={handleFinishNote} className="w-full bg-[#ED3C38] text-white py-5 rounded-full font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                {noteTaskStatus === 'done' ? '再次编辑' : '确认并发送至小红书平台'}
              </button>
            </div>
          </div>
        </div>

        {showAddChoice && (
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-sm p-10 rounded-[48px] shadow-2xl space-y-6 animate-fade-in text-center">
              <h4 className="font-black text-xl mb-4">新增笔记图片</h4>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-50 py-5 rounded-3xl font-black text-gray-700 hover:bg-gray-100 border border-gray-100 transition-all flex items-center justify-center gap-3"
                >
                  <span className="text-xl">📁</span> 上传本地图片
                </button>
                <button 
                  onClick={() => { setShowAddChoice(false); setShowImagePrompt(true); }}
                  className="w-full bg-[#ED3C3811] py-5 rounded-3xl font-black text-[#ED3C38] hover:bg-[#ED3C3822] border border-[#ED3C3822] transition-all flex items-center justify-center gap-3"
                >
                  <span className="text-xl">✨</span> AI 辅助生成
                </button>
                <button onClick={() => setShowAddChoice(false)} className="text-xs font-black text-gray-400 mt-4">取消</button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLocalUpload} />
            </div>
          </div>
        )}

        {showImagePrompt && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-xl">AI 创意图片生成</h4>
                <button onClick={() => setShowImagePrompt(false)} className="text-gray-400 hover:text-black">✕</button>
              </div>
              <p className="text-xs text-gray-500 font-bold">请输入您想生成的图片描述，Gemini 将为您创作视觉素材。</p>
              <textarea className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#ED3C3822] font-bold text-sm" rows={4} placeholder="例如: IP 角色在快闪店门口..." value={customImagePrompt} onChange={(e) => setCustomImagePrompt(e.target.value)} />
              <button onClick={handleAddCustomImage} disabled={generatingCustomImage || !customImagePrompt.trim()} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {generatingCustomImage ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '开始生成'}
              </button>
            </div>
          </div>
        )}

        {zoomedImage && (
          <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-20" onClick={() => setZoomedImage(null)}>
            <div className="relative max-w-full max-h-full flex flex-col items-center">
              <img src={zoomedImage} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-fade-in" alt="zoom" />
              <button onClick={() => setZoomedImage(null)} className="mt-8 px-8 py-3 bg-white text-black rounded-full font-black text-sm">关闭预览</button>
            </div>
          </div>
        )}

        {refineTarget && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-xl">✨ 文案调整指令</h4>
                <button onClick={() => setRefineTarget(null)} className="text-gray-400 hover:text-black">✕</button>
              </div>
              <textarea className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#ED3C3822] font-bold text-sm" rows={4} placeholder="例如: 语气再活泼一点..." value={refineInstruction} onChange={(e) => setRefineInstruction(e.target.value)} />
              <button onClick={handleRefine} disabled={refining || !refineInstruction.trim()} className="w-full bg-[#ED3C38] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                {refining ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '更新文案'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {steps.map((step, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 text-6xl opacity-10 group-hover:scale-110 transition-transform">{step.icon}</div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${step.status === '进行中' ? 'bg-blue-100 text-blue-600' : step.status === '已完成' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{step.status}</span>
              <span className="text-2xl">{step.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{step.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{step.desc}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <span className="text-xs text-gray-400">{step.date}</span>
              <button onClick={() => step.action?.()} className="text-sm font-bold transition-colors text-[#ED3C38] hover:underline">
                {step.status === '已完成' ? '再次查看' : '查看详情'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
