
import React, { useState, useEffect, useRef } from 'react';

interface AssetDetail {
  id: string;
  name: string;
  price: number;
  ecoScore: number;
  size: string;
  icon: string;
}

interface AssignedAsset extends AssetDetail {
  count: number;
}

interface ZoneInstance {
  instanceId: string;
  name: string;
  icon: string;
  assets: AssignedAsset[];
}

interface SandboxProps {
  onUpdateProject: (zones: ZoneInstance[]) => void;
  initialZones?: ZoneInstance[];
}

const AVAILABLE_ZONES = [
  { name: '核心打卡区', icon: '📸' },
  { name: '产品陈列区', icon: '🛒' },
  { name: 'IP互动区', icon: '✨' },
  { name: 'DIY活动区', icon: '🎨' },
  { name: '前台收银区', icon: '💰' },
  { name: '粉丝留言墙', icon: '📝' },
];

const AVAILABLE_ASSETS: AssetDetail[] = [
  { id: 'module', name: '搭建模块', price: 30, ecoScore: 15, size: '50*50*50', icon: '📦' },
  { id: 'rack_s', name: '小展架', price: 15, ecoScore: 10, size: '30*20*45', icon: '🪜' },
  { id: 'rack_l', name: '大展架', price: 15, ecoScore: 10, size: '40*10*40', icon: '🪜' },
  { id: 'cabinet', name: '展柜', price: 20, ecoScore: 5, size: '50*40*80', icon: '🗄️' },
  { id: 'table', name: '桌子', price: 30, ecoScore: 10, size: '100*100*80', icon: '🪑' },
  { id: 'screen', name: '电子显示屏', price: 50, ecoScore: 5, size: '32英寸', icon: '🖥️' },
  { id: 'chair', name: '椅子', price: 20, ecoScore: 10, size: '标准', icon: '💺' },
  { id: 'spotlight', name: '射灯', price: 20, ecoScore: 5, size: '标准', icon: '💡' },
  { id: 'counter', name: '收银台', price: 50, ecoScore: 5, size: '标准', icon: '🏧' },
];

const AI_TIPS = [
  "用户动线建议：将打卡区设在入口45度角，可有效引导客流自发向内扩散，提升空间利用率。",
  "体验优化：DIY互动区旁预留 1.5m 缓冲带，防止高峰期动线发生交叉拥堵，保证主轴畅通。",
  "转化逻辑：收银台与陈列区形成 U 型闭环，利用视觉心理暗示增加二次购买率，缩短结账等待感。",
  "交互增强：在打卡墙侧面设置 1.7m 高度光源，模拟自然黄金分割位，提供最佳拍照补光效果。",
  "空间平衡：陈列架高度建议错落分布，避免形成压抑的视觉墙，保持整体通透感与呼吸感。"
];

export const ThreeDSandbox: React.FC<SandboxProps> = ({ onUpdateProject, initialZones }) => {
  const [zones, setZones] = useState<ZoneInstance[]>(initialZones || []);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(initialZones && initialZones.length > 0 ? initialZones[0].instanceId : null);
  const [rotation, setRotation] = useState({ x: 15, y: -20 });
  const [aiTipIndex, setAiTipIndex] = useState(0);
  const [isTouring, setIsTouring] = useState(false);
  const tourIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    onUpdateProject(zones);
    const interval = setInterval(() => {
      setAiTipIndex(prev => (prev + 1) % AI_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [zones]);

  const addZone = (zoneTemplate: { name: string; icon: string }) => {
    const newId = `zone-${Date.now()}`;
    const newZone: ZoneInstance = {
      instanceId: newId,
      name: zoneTemplate.name,
      icon: zoneTemplate.icon,
      assets: []
    };
    setZones([...zones, newZone]);
    setActiveZoneId(newId);
  };

  const addAssetToActiveZone = (asset: AssetDetail) => {
    if (!activeZoneId) return;
    setZones(prev => prev.map(z => {
      if (z.instanceId === activeZoneId) {
        const existingAsset = z.assets.find(a => a.id === asset.id);
        if (existingAsset) {
          return {
            ...z,
            assets: z.assets.map(a => a.id === asset.id ? { ...a, count: a.count + 1 } : a)
          };
        }
        return { ...z, assets: [...z.assets, { ...asset, count: 1 }] };
      }
      return z;
    }));
  };

  const removeAssetFromZone = (zoneId: string, assetId: string) => {
    setZones(prev => prev.map(z => {
      if (z.instanceId === zoneId) {
        return {
          ...z,
          assets: z.assets.map(a => a.id === assetId ? { ...a, count: Math.max(0, a.count - 1) } : a).filter(a => a.count > 0)
        };
      }
      return z;
    }));
  };

  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(z => z.instanceId !== id));
    if (activeZoneId === id) setActiveZoneId(null);
  };

  const calculateZoneTotal = (zone: ZoneInstance) => {
    return zone.assets.reduce((sum, a) => sum + (a.price * a.count), 0);
  };

  const calculateTotal = () => {
    const price = zones.reduce((sum, z) => sum + calculateZoneTotal(z), 0);
    const score = zones.reduce((sum, z) => sum + z.assets.reduce((zSum, a) => zSum + (a.ecoScore * a.count), 0), 0);
    return { price, score };
  };

  const totals = calculateTotal();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTouring) stopTour();
    const startX = e.clientX;
    const startY = e.clientY;
    const startRotX = rotation.x;
    const startRotY = rotation.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setRotation({
        x: Math.max(0, Math.min(60, startRotX - deltaY * 0.2)),
        y: startRotY + deltaX * 0.2
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startTour = () => {
    if (isTouring) {
      stopTour();
      return;
    }
    setIsTouring(true);
    setRotation(prev => ({ ...prev, x: 10 }));
    const intervalId = window.setInterval(() => {
      setRotation(prev => ({ ...prev, y: prev.y + 0.5, x: 10 }));
    }, 16);
    tourIntervalRef.current = intervalId;
  };

  const stopTour = () => {
    if (tourIntervalRef.current !== null) {
      window.clearInterval(tourIntervalRef.current);
      tourIntervalRef.current = null;
      setIsTouring(false);
    }
  };

  const resetView = () => {
    stopTour();
    setRotation({ x: 15, y: -20 });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[160px]">
        <div className="bg-white p-5 rounded-[40px] shadow-sm border border-orange-50 flex flex-col overflow-hidden">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ED3C38]"></span> 1. 所需功能区
          </h3>
          <div className="flex flex-wrap gap-2 overflow-y-auto custom-scroll content-start h-full pb-2">
            {AVAILABLE_ZONES.map(z => (
              <button
                key={z.name}
                onClick={() => addZone(z)}
                className="h-[40px] flex-shrink-0 flex items-center gap-2 px-5 rounded-full bg-gray-50 hover:bg-[#ED3C3810] transition-all border border-transparent hover:border-[#ED3C3833] whitespace-nowrap"
              >
                <span className="text-xl leading-none">{z.icon}</span>
                <span className="text-[11px] font-black text-gray-700 leading-none">{z.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-[40px] shadow-sm border border-orange-50 flex flex-col overflow-hidden">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6AB2FF]"></span> 2. 所需资产
          </h3>
          <div className="flex flex-wrap gap-2 overflow-y-auto custom-scroll content-start h-full pb-2">
            {AVAILABLE_ASSETS.map(a => (
              <button
                key={a.id}
                onClick={() => addAssetToActiveZone(a)}
                disabled={!activeZoneId}
                className={`h-[45px] flex-shrink-0 px-4 rounded-xl transition-all border flex flex-col justify-center gap-0.5 ${
                  !activeZoneId 
                    ? 'bg-gray-50 opacity-50 cursor-not-allowed border-transparent' 
                    : 'bg-white border-gray-100 hover:border-[#6AB2FF] hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 leading-none">
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-[11px] font-black text-gray-800 whitespace-nowrap">{a.name}</span>
                </div>
                <div className="flex items-center gap-3 leading-none">
                  <span className="text-[9px] text-gray-400 font-bold italic whitespace-nowrap">{a.size}</span>
                  <span className="text-[10px] font-black text-[#6AB2FF] whitespace-nowrap">¥{a.price}/天</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[650px]">
        <div className="w-full lg:w-[380px] bg-white p-6 rounded-[48px] shadow-sm border border-orange-50 flex flex-col overflow-hidden h-full">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">3. 项目资产清单</h3>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">项目总计</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-green-500">{totals.score} <span className="text-[9px] font-bold">环保积分</span></span>
                <span className="text-xl font-black text-[#ED3C38] tracking-tighter leading-none">¥{totals.price} <span className="text-[10px] font-bold text-gray-400">元/天</span></span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scroll space-y-4">
            {zones.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-40">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl">🧩</div>
                <p className="text-xs text-gray-500 font-bold leading-relaxed tracking-wide">请在顶部面板选择功能区<br/>开始构建您的商业空间</p>
              </div>
            ) : (
              zones.map(z => (
                <div 
                  key={z.instanceId}
                  onClick={() => setActiveZoneId(z.instanceId)}
                  className={`p-5 rounded-[36px] border-2 transition-all cursor-pointer ${
                    activeZoneId === z.instanceId 
                      ? 'border-[#ED3C38] bg-[#ED3C3805] shadow-xl translate-x-1' 
                      : 'border-gray-50 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{z.icon}</span>
                      <span className="font-black text-[13px] text-gray-800 tracking-tight">{z.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-[#ED3C38] bg-white px-3 py-1 rounded-full border border-[#ED3C3815] shadow-sm">
                        ¥{calculateZoneTotal(z)}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteZone(z.instanceId); }}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-[#ED3C38] hover:bg-red-50 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {z.assets.length === 0 ? (
                      <p className="text-[10px] text-gray-300 italic pl-1">等待添加所需资产...</p>
                    ) : (
                      z.assets.map(a => (
                        <div key={a.id} className="flex items-center justify-between bg-white/60 backdrop-blur p-2.5 rounded-2xl text-[11px] border border-gray-50 shadow-sm group">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-base">{a.icon}</span>
                            <span className="font-bold text-gray-700">{a.name}</span>
                            <span className="font-black text-gray-400 text-[10px] ml-1">x{a.count}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-green-500">+{a.ecoScore * a.count}</span>
                            <span className="font-black text-[#6AB2FF] tracking-tight">¥{a.price * a.count}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeAssetFromZone(z.instanceId, a.id); }}
                                className="w-5 h-5 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
                              >-</button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); addAssetToActiveZone(a); }}
                                className="w-5 h-5 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
                              >+</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div 
          className="flex-1 bg-gradient-to-br from-white via-[#FFFEEB] to-white rounded-[64px] shadow-inner border border-gray-100 relative overflow-hidden flex items-center justify-center perspective-[2000px] cursor-grab active:cursor-grabbing select-none h-full"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); startTour(); }}
                className={`p-3 rounded-2xl border transition-all shadow-md flex items-center gap-2 group ${isTouring ? 'bg-[#ED3C38] text-white border-transparent' : 'bg-white text-gray-800 border-gray-100 hover:border-[#ED3C38]'}`}
              >
                <span className="text-sm">{isTouring ? '⏹' : '🔭'}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{isTouring ? '停止巡视' : '用户视角巡视'}</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); resetView(); }}
                className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-800 shadow-md hover:border-[#6AB2FF] transition-all"
                title="重置视角"
              >
                <span className="text-sm">🔄</span>
              </button>
            </div>
          </div>

          <div className="absolute top-8 right-8 z-10 max-w-[280px]">
             <div className="bg-gray-900/95 backdrop-blur-md p-5 rounded-[28px] shadow-2xl border border-white/10 min-h-[100px] flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-xl">💡</span>
                   <p className="text-[10px] font-black text-[#ED3C38] uppercase tracking-[0.15em]">AI 动线优化建议</p>
                </div>
                <p className="text-[11px] text-white/90 leading-relaxed font-bold">
                  {AI_TIPS[aiTipIndex]}
                </p>
                <div className="mt-2 flex gap-1 h-0.5 w-full">
                   {AI_TIPS.map((_, i) => (
                     <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i === aiTipIndex ? 'bg-[#ED3C38]' : 'bg-white/10'}`}></div>
                   ))}
                </div>
             </div>
          </div>

          <div 
            className="relative w-[700px] h-[500px] transition-all duration-700 preserve-3d"
            style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
          >
            <div className="absolute inset-0 bg-white/40 border-4 border-dashed border-gray-100 rounded-[120px] transform rotateX(90deg) translateZ(-150px) shadow-2xl flex items-center justify-center">
              <div className="grid grid-cols-12 grid-rows-12 w-full h-full opacity-5">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-gray-400"></div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-12 p-16 h-full items-center">
              {zones.map((z, i) => {
                const totalAssets = z.assets.reduce((sum, a) => sum + a.count, 0);
                const height = 50 + (totalAssets * 18);
                
                return (
                  <div
                    key={z.instanceId}
                    className={`relative flex flex-col items-center justify-end transition-all duration-500 transform-gpu ${
                      activeZoneId === z.instanceId ? 'scale-115 z-20' : 'opacity-70 grayscale-[20%]'
                    }`}
                    style={{ transform: `translateZ(${i * 8}px)` }}
                  >
                    <div 
                      className={`w-28 rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center transition-all duration-700 border-4 ${
                        activeZoneId === z.instanceId 
                          ? 'bg-[#ED3C38] text-white border-white/30' 
                          : 'bg-white text-gray-800 border-transparent'
                      }`}
                      style={{ height: `${height}px` }}
                    >
                      <span className="text-4xl mb-2">{z.icon}</span>
                      <p className="text-[9px] font-black uppercase text-center px-3 leading-tight tracking-tight">{z.name}</p>
                      
                      {totalAssets > 0 && (
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#6AB2FF] rounded-full flex items-center justify-center text-xs font-black border-4 border-white shadow-2xl animate-bounce">
                          {totalAssets}
                        </div>
                      )}
                    </div>
                    <div className="w-24 h-6 bg-black/10 rounded-full mt-6 blur-md transform rotateX(60deg) transition-all duration-500"></div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="absolute bottom-8 px-8 py-3 bg-white/50 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shadow-sm">
            左键拖拽旋转空间 | 滚轮缩放预览
          </div>
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #ED3C3822; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #ED3C3844; }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};
