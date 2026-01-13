
import React, { useRef } from 'react';
import { CaseItem } from '../types';

interface CaseStudyProps {
  items: CaseItem[];
  onUpdateItems: React.Dispatch<React.SetStateAction<CaseItem[]>>;
}

export const CaseStudy: React.FC<CaseStudyProps> = ({ items, onUpdateItems }) => {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onUpdateItems(prev => prev.map(item => 
            item.id === id ? { ...item, image: ev.target!.result as string } : item
          ));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (id: number) => {
    fileInputRefs.current[id]?.click();
  };

  const removeImage = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateItems(prev => prev.map(item => 
      item.id === id ? { ...item, image: null } : item
    ));
  };

  return (
    <div className="space-y-16 animate-fade-in pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">成功案例库</h2>
        <p className="text-gray-500 max-w-xl mx-auto font-medium">见证创意落地，数据驱动商业与环境的双重成功。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-orange-50 hover:shadow-xl transition-all group flex flex-col">
            <div 
              className="h-56 relative overflow-hidden cursor-pointer"
              onClick={() => !c.image && triggerUpload(c.id)}
            >
              {c.image ? (
                <div className="w-full h-full relative">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button 
                      onClick={(e) => { e.stopPropagation(); triggerUpload(c.id); }}
                      className="p-3 bg-white rounded-full text-xs shadow-xl hover:scale-110 transition-transform"
                     >🔄</button>
                     <button 
                      onClick={(e) => removeImage(c.id, e)}
                      className="p-3 bg-white rounded-full text-xs shadow-xl hover:scale-110 transition-transform"
                     >🗑️</button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-[#FFFEEB] border-2 border-dashed border-orange-100 flex flex-col items-center justify-center gap-3 p-6 text-center group-hover:bg-white group-hover:border-[#ED3C3844] transition-all">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📸</div>
                  <div>
                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">点击上传案例图</p>
                    <p className="text-[9px] text-gray-300 font-bold mt-1">支持图片文件 (5MB以内)</p>
                  </div>
                </div>
              )}
              
              <input 
                type="file" 
                ref={el => { fileInputRefs.current[c.id] = el; }}
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileChange(c.id, e)}
              />

              <div className="absolute top-4 left-4 flex gap-2">
                {c.tags.map(t => (
                  <span key={t} className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-[#ED3C38]">{t}</span>
                ))}
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <h3 className="text-xl font-black text-gray-800 tracking-tight">{c.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium flex-1">{c.story}</p>
              
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase">预估 ROI</p>
                  <p className="font-black text-[#ED3C38]">{c.metrics.roi}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase">碳减排</p>
                  <p className="font-black text-[#6AB2FF]">{c.metrics.carbon}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase">总客流</p>
                  <p className="font-black text-gray-800">{c.metrics.traffic}</p>
                </div>
              </div>
              
              <button className="w-full py-4 bg-[#FFFEEB] text-[#ED3C38] rounded-2xl font-black text-sm border border-[#ED3C3822] hover:bg-[#ED3C38] hover:text-white transition-all">
                查看全案细节
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="text-center py-20 bg-white rounded-[64px] border border-orange-50 shadow-sm space-y-6">
        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl mx-auto">👋</div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-gray-900">想要加入我们的可持续计划？</h3>
          <p className="text-gray-400 font-bold max-w-md mx-auto">与450+位顶尖IP主理人共同探讨快闪商业的未来，获取最新的行业报告与设计资源。</p>
        </div>
        <button className="px-12 py-5 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200">
          联系主理人社群
        </button>
      </section>
    </div>
  );
};
