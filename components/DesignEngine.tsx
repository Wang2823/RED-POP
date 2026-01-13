
import React, { useState, useEffect } from 'react';
import { DesignSuggestion, IPAsset } from '../types';
import { refineProjectLayout, generateMaterialImage } from '../services/geminiService';

interface DesignEngineProps {
  suggestion: DesignSuggestion | null;
  materialUrls: Record<string, string>;
  setMaterialUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  materialQuantities: Record<string, number>;
  setMaterialQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  materialZoneAssignments: Record<string, string>;
  setMaterialZoneAssignments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  ipInfo: IPAsset;
  currentZones: any[];
  setProjectZones: (zones: any[]) => void;
  onBack: () => void;
  onProceed: () => void;
}

const FIXED_CATEGORIES = [
  { id: 'poster', name: '海报', spec: '60*90cm', material: '环保纸张/PVC', suggestion: '用于空间导视或核心视觉输出' },
  { id: 'ktboard', name: 'KT板', spec: '120*180cm', material: '高密度KT板', suggestion: 'IP形象立体剪裁，适合打卡互动' },
  { id: 'cloth', name: '挂布', spec: '200*300cm', material: '热升华绸缎布', suggestion: '大面积氛围营造，可循环折叠' },
  { id: 'wall', name: '留言墙', spec: '150*150cm', material: '磁吸背板+不干胶', suggestion: '粉丝留言互动区，提升情感共鸣' },
];

export const DesignEngine: React.FC<DesignEngineProps> = ({ 
  suggestion, 
  materialUrls, 
  setMaterialUrls, 
  materialQuantities,
  setMaterialQuantities,
  materialZoneAssignments,
  setMaterialZoneAssignments,
  ipInfo,
  currentZones,
  setProjectZones,
  onBack, 
  onProceed 
}) => {
  const [globalRefining, setGlobalRefining] = useState(false);
  const [globalInstruction, setGlobalInstruction] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [refineTarget, setRefineTarget] = useState<string | null>(null);
  const [localInstruction, setLocalInstruction] = useState('');

  // Initial generation for each category if it doesn't have a URL yet
  useEffect(() => {
    if (suggestion) {
      FIXED_CATEGORIES.forEach(m => {
        const instanceKey = `${m.id}-instance-0`;
        if (!materialUrls[instanceKey]) {
          handleGenerate(m.id, 0);
        }
      });
    }
  }, [suggestion]);

  const handleGenerate = async (id: string, idx: number, customPrompt?: string) => {
    const category = FIXED_CATEGORIES.find(c => c.id === id);
    if (!category) return;
    
    const instanceKey = `${id}-instance-${idx}`;
    const zoneName = materialZoneAssignments[id] || '默认区域';

    setLoadingMap(prev => ({ ...prev, [instanceKey]: true }));
    try {
      const url = await generateMaterialImage(category.name, zoneName, ipInfo, customPrompt);
      setMaterialUrls(prev => ({ ...prev, [instanceKey]: url }));
    } catch (e) {
      console.error("Material generation failed", e);
    } finally {
      setLoadingMap(prev => ({ ...prev, [instanceKey]: false }));
      setRefineTarget(null);
      setLocalInstruction('');
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const currentQty = materialQuantities[id] || 0;
    const nextQty = Math.max(0, currentQty + delta);
    setMaterialQuantities(prev => ({ ...prev, [id]: nextQty }));

    // If increasing, trigger generation for the new instance
    if (delta > 0) {
      handleGenerate(id, currentQty);
    }
  };

  const handleZoneChange = (id: string, zoneName: string) => {
    setMaterialZoneAssignments(prev => ({ ...prev, [id]: zoneName }));
  };

  const handleGlobalRefine = async () => {
    if (!globalInstruction.trim()) return;
    setGlobalRefining(true);
    try {
      const updatedZones = await refineProjectLayout(currentZones, globalInstruction);
      setProjectZones(updatedZones);
      setGlobalInstruction('');
    } catch (e) {
      console.error(e);
    } finally {
      setGlobalRefining(false);
    }
  };

  const previewInstances = FIXED_CATEGORIES.flatMap(m => {
    const qty = materialQuantities[m.id] || 0;
    const zoneName = materialZoneAssignments[m.id];
    return Array.from({ length: qty }).map((_, idx) => {
      const instanceKey = `${m.id}-instance-${idx}`;
      const displayName = qty > 1 ? `${m.name}${idx + 1}` : m.name;
      return {
        ...m,
        id: m.id,
        index: idx,
        name: displayName,
        zoneName,
        instanceKey,
        currentUrl: materialUrls[instanceKey] || null
      };
    });
  });

  if (!suggestion) return null;

  return (
    <div className="space-y-16 animate-fade-in pb-32 relative">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-white/70 backdrop-blur-2xl p-8 rounded-[40px] border border-orange-100 shadow-xl space-y-8 flex flex-col h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-3 text-[#ED3C38]">
             <span className="text-3xl">🧠</span>
             <h4 className="font-black text-xs uppercase tracking-[0.1em]">Gemini 思考逻辑</h4>
          </div>
          <div className="space-y-8 divide-y divide-gray-100">
            <div className="space-y-2 pt-0">
               <p className="text-[10px] font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#ED3C38]"></span> 目标拆解</p>
               <p className="text-xs text-gray-500 leading-relaxed font-bold">{suggestion.reasoning.objective}</p>
            </div>
            <div className="space-y-2 pt-6">
               <p className="text-[10px] font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#6AB2FF]"></span> 心理触发</p>
               <p className="text-xs text-gray-500 leading-relaxed font-bold">{suggestion.reasoning.psychology}</p>
            </div>
            <div className="space-y-2 pt-6">
               <p className="text-[10px] font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 可持续考量</p>
               <p className="text-xs text-gray-500 leading-relaxed font-bold">{suggestion.reasoning.sustainability}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-orange-50">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-black text-gray-900 text-lg">定制物料清单 (非租赁资产)</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">固定的4大物料品类，可自由分配至您的功能区</p>
                </div>
                <span className="text-[10px] font-black text-[#6AB2FF] bg-[#6AB2FF11] px-3 py-1.5 rounded-full border border-[#6AB2FF22]">物料池</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-auto border-separate border-spacing-x-[24px]">
                  <thead>
                    <tr className="border-b-2 border-gray-50">
                      <th className="pb-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-nowrap">分配功能区</th>
                      <th className="pb-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-nowrap">物料品类</th>
                      <th className="pb-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-nowrap">标准规格</th>
                      <th className="pb-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-nowrap">材质建议</th>
                      <th className="pb-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-nowrap">功能建议</th>
                      <th className="pb-5 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center text-nowrap">数量调整</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {FIXED_CATEGORIES.map((m) => {
                      const qty = materialQuantities[m.id] || 0;
                      return (
                        <tr key={m.id} className={`group transition-all duration-300 ${qty === 0 ? 'opacity-40 bg-gray-50/50' : 'hover:bg-gray-50/50'}`}>
                          <td className="py-6 whitespace-nowrap">
                             <select 
                               className="text-[10px] font-black text-[#6AB2FF] bg-[#6AB2FF08] px-2 py-1 rounded border border-[#6AB2FF22] outline-none focus:ring-1 focus:ring-[#6AB2FF]"
                               value={materialZoneAssignments[m.id]}
                               onChange={(e) => handleZoneChange(m.id, e.target.value)}
                             >
                               {currentZones.length > 0 ? (
                                 currentZones.map(z => <option key={z.instanceId} value={z.name}>{z.name}</option>)
                               ) : (
                                 <option>未定义功能区</option>
                               )}
                             </select>
                          </td>
                          <td className="py-6 whitespace-nowrap">
                             <span className="font-black text-gray-800 text-xs">{m.name}</span>
                          </td>
                          <td className="py-6 text-gray-500 font-bold text-[11px] whitespace-nowrap">{m.spec}</td>
                          <td className="py-6 min-w-[120px]">
                             <p className="text-[10px] text-gray-500 font-bold leading-tight break-words">{m.material}</p>
                          </td>
                          <td className="py-6 min-w-[160px]">
                             <p className="text-[10px] text-gray-400 font-bold leading-snug break-words">{m.suggestion}</p>
                          </td>
                          <td className="py-6">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleUpdateQuantity(m.id, -1)}
                                className="w-6 h-6 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:border-[#ED3C38] hover:text-[#ED3C38] transition-all font-black text-xs"
                              >-</button>
                              <span className="font-black text-gray-800 w-4 text-center text-xs">{qty}</span>
                              <button 
                                onClick={() => handleUpdateQuantity(m.id, 1)}
                                className="w-6 h-6 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:border-[#ED3C38] hover:text-[#ED3C38] transition-all font-black text-xs"
                              >+</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>

      <section className="bg-white p-12 rounded-[64px] shadow-sm border border-orange-50 space-y-10">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-2xl font-black text-gray-900 tracking-tight">AI 辅助生成物料预览</h3>
             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">由 Gemini 3.0 & Nano Banana 驱动视觉设计 | 已参考您提交的 IP 资产</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           {previewInstances.map((m) => (
             <div key={m.instanceKey} className="flex flex-col gap-4 group animate-fade-in">
                <div 
                  className="relative rounded-[36px] overflow-hidden border border-gray-100 shadow-lg ring-offset-4 group-hover:ring-2 group-hover:ring-[#ED3C38] transition-all cursor-pointer min-h-[300px] flex items-center justify-center bg-gray-50"
                >
                  {loadingMap[m.instanceKey] ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20">
                       <div className="w-12 h-12 border-4 border-[#ED3C38] border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">设计稿构思中...</p>
                    </div>
                  ) : m.currentUrl ? (
                    <img src={m.currentUrl} alt={m.name} className="w-full h-auto object-contain block group-hover:scale-[1.02] transition-transform duration-700" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
                       <span className="text-4xl opacity-20">🎨</span>
                       <p className="text-[10px] font-black text-gray-300 uppercase">等待生成...</p>
                    </div>
                  )}
                  
                  {m.currentUrl && !loadingMap[m.instanceKey] && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform flex flex-col justify-end">
                       <p className="text-[10px] font-black text-[#ED3C38] uppercase mb-1">{m.zoneName}</p>
                       <p className="text-sm font-black uppercase tracking-wider">{m.name}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 px-2">
                   {m.currentUrl && (
                     <button 
                      onClick={() => setZoomedImage(m.currentUrl!)}
                      className="flex-1 py-2.5 rounded-xl bg-[#FFFEEB] border border-[#ED3C3822] text-[#ED3C38] text-[10px] font-black hover:bg-[#ED3C38] hover:text-white transition-all shadow-sm"
                     >预览放大</button>
                   )}
                   <button 
                    onClick={() => handleGenerate(m.id, m.index)}
                    disabled={loadingMap[m.instanceKey]}
                    className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-black hover:bg-gray-100 transition-all shadow-sm disabled:opacity-50"
                   >重新生成</button>
                   <button 
                    onClick={() => setRefineTarget(m.instanceKey)}
                    className="flex-1 py-2.5 rounded-xl bg-[#6AB2FF11] border border-[#6AB2FF22] text-[#6AB2FF] text-[10px] font-black hover:bg-[#6AB2FF] hover:text-white transition-all shadow-sm"
                   >局部调整</button>
                   <a 
                    href={m.currentUrl || '#'} 
                    download={`${m.name}_design.png`}
                    className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-[10px] font-black hover:bg-black transition-all shadow-sm text-center flex items-center justify-center"
                   >下载文件</a>
                </div>

                {refineTarget === m.instanceKey && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                     <textarea 
                      placeholder="描述调整需求 (如：颜色再深一点，增加IP Logo...)"
                      className="w-full bg-white p-3 rounded-xl text-xs font-bold border-none outline-none focus:ring-1 focus:ring-[#ED3C38] mb-3"
                      value={localInstruction}
                      onChange={(e) => setLocalInstruction(e.target.value)}
                     />
                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleGenerate(m.id, m.index, localInstruction)}
                          className="flex-1 bg-[#ED3C38] text-white py-2 rounded-lg text-[10px] font-black"
                        >开始重绘 (Nano Banana)</button>
                        <button 
                          onClick={() => setRefineTarget(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-[10px] font-black"
                        >取消</button>
                     </div>
                  </div>
                )}
             </div>
           ))}
        </div>
      </section>

      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-20" onClick={() => setZoomedImage(null)}>
           <div className="relative max-w-full max-h-full bg-white p-2 rounded-[48px] shadow-2xl overflow-hidden animate-fade-in">
              <img src={zoomedImage} className="max-w-full max-h-[85vh] rounded-[40px] object-contain" alt="zoom" />
              <button onClick={() => setZoomedImage(null)} className="absolute top-8 right-8 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center font-black hover:bg-black transition-all">✕</button>
           </div>
        </div>
      )}

      <div className="bg-gray-900 p-12 rounded-[50px] flex flex-col lg:flex-row items-center justify-between text-white shadow-2xl space-y-8 lg:space-y-0 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-80 h-80 bg-[#ED3C3822] rounded-full blur-[100px]"></div>
         <div className="space-y-3 relative z-10 text-center lg:text-left">
            <h3 className="text-2xl font-black italic tracking-tighter">全案视觉不满意？</h3>
            <p className="text-sm opacity-60 font-bold">试试输入：“整体方案再活泼一点”或“所有展台高度降低20%”</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
            <input 
              type="text" 
              placeholder="输入您的全案重绘指令..." 
              className="bg-white/10 border-white/20 border-2 rounded-2xl px-6 py-5 w-full lg:w-96 outline-none text-white placeholder:text-white/40 focus:border-[#ED3C38] focus:bg-white/15 transition-all font-bold text-sm"
              value={globalInstruction}
              onChange={(e) => setGlobalInstruction(e.target.value)}
            />
            <button 
              onClick={handleGlobalRefine}
              disabled={globalRefining || !globalInstruction.trim()}
              className="bg-[#ED3C38] text-white px-10 py-5 rounded-2xl font-black shadow-lg hover:scale-[1.05] active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
            >
              {globalRefining ? '重绘中...' : '全案重绘'}
            </button>
         </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="bg-white/90 backdrop-blur-2xl p-4 rounded-[32px] border border-orange-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex gap-4">
          <button 
            onClick={onBack}
            className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >← 修改需求</button>
          <button 
            onClick={onProceed}
            className="flex-[1.5] bg-[#ED3C38] text-white py-4 px-8 rounded-2xl font-black text-sm shadow-xl shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >确认物料并前往租赁 ➔</button>
        </div>
      </div>
    </div>
  );
};
