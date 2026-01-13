
import React, { useState, useRef } from 'react';
import { IPAsset, PopUpObjective } from '../types';

interface InspirationFormProps {
  ipInfo: IPAsset;
  setIpInfo: React.Dispatch<React.SetStateAction<IPAsset>>;
  onStart: () => void;
  loading: boolean;
}

export const InspirationForm: React.FC<InspirationFormProps> = ({ ipInfo, setIpInfo, onStart, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleObjective = (obj: PopUpObjective) => {
    const current = ipInfo.purpose;
    const next = current.includes(obj) ? current.filter(o => o !== obj) : [...current, obj];
    setIpInfo({ ...ipInfo, purpose: next });
  };

  const toggleFeature = (feat: string) => {
    const current = ipInfo.uxFeatures;
    const next = current.includes(feat) ? current.filter(f => f !== feat) : [...current, feat];
    setIpInfo({ ...ipInfo, uxFeatures: next });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles: File[] = [];
    const newAssets: { data: string; mimeType: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].size <= maxSize) {
        validFiles.push(files[i]);
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(files[i]);
        });
        newAssets.push({ data: base64Data, mimeType: files[i].type });
      } else {
        alert(`${files[i].name} 超过了 50MB 限制。`);
      }
    }

    setUploadedFilesCount(prev => prev + validFiles.length);
    setIpInfo(prev => ({
      ...prev,
      fileAssets: [...(prev.fileAssets || []), ...newAssets]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 rounded-[64px] shadow-sm border border-orange-50 space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-black text-gray-900">定义你的奇遇空间</h3>
        <p className="text-sm text-gray-400 font-medium">Gemini将根据以下需求深度定制您的快闪方案</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
        <div className="flex flex-col h-full">
          <div className="space-y-8 flex-1">
            <section>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">1.基础信息</label>
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="IP名称 (如: 奶龙)"
                  className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-[#ED3C3822] font-bold outline-none transition-all"
                  value={ipInfo.name}
                  onChange={(e) => setIpInfo({ ...ipInfo, name: e.target.value })}
                />
                <input 
                  type="text"
                  placeholder="品牌小红书号"
                  className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-[#ED3C3822] font-bold outline-none transition-all"
                  value={ipInfo.xhsAccount}
                  onChange={(e) => setIpInfo({ ...ipInfo, xhsAccount: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                      <span className="text-[10px] font-black text-gray-300 ml-4 uppercase">活动开始日期</span>
                      <input 
                        type="date"
                        className="w-full px-6 py-4 rounded-full bg-gray-50 border-none font-bold outline-none transition-all"
                        value={ipInfo.startDate}
                        onChange={(e) => setIpInfo({ ...ipInfo, startDate: e.target.value })}
                      />
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-black text-gray-300 ml-4 uppercase">持续天数</span>
                      <input 
                        type="text"
                        placeholder="如: 7天"
                        className="w-full px-6 py-4 rounded-full bg-gray-50 border-none font-bold outline-none transition-all"
                        value={ipInfo.duration}
                        onChange={(e) => setIpInfo({ ...ipInfo, duration: e.target.value })}
                      />
                   </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 px-6 py-4 rounded-full bg-gray-50 border-none font-bold outline-none appearance-none"
                    value={ipInfo.locationType}
                    onChange={(e) => setIpInfo({ ...ipInfo, locationType: e.target.value as any })}
                  >
                    <option>室内场地</option>
                    <option>户外市集</option>
                    <option>沿街店铺</option>
                  </select>
                  <input 
                    type="text"
                    placeholder="20m²"
                    className="w-28 px-6 py-4 rounded-full bg-gray-50 border-none font-bold outline-none"
                    value={ipInfo.size}
                    onChange={(e) => setIpInfo({ ...ipInfo, size: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">2.IP资产上传 (50MB以内)</label>
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  setDragActive(false); 
                  handleFileUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[48px] py-16 px-8 text-center transition-all cursor-pointer ${
                  dragActive ? 'border-[#ED3C38] bg-[#ED3C3805]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <span className="text-3xl block mb-2">📁</span>
                <p className="text-xs font-bold text-gray-500 leading-relaxed px-4">
                  {uploadedFilesCount > 0 ? `已选择 ${uploadedFilesCount} 个文件` : '点击或拖拽上传品牌与IP视觉规范素材'}
                </p>
              </div>
            </section>

            <section>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">3.活动主题 (如有)</label>
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="输入本次活动的主题 (如: 开启奇遇之旅)"
                  className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-[#ED3C3822] font-bold outline-none transition-all"
                  value={ipInfo.activityTheme}
                  onChange={(e) => setIpInfo({ ...ipInfo, activityTheme: e.target.value })}
                />
              </div>
            </section>
          </div>

          <section className="mt-8">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">4.风格偏好</label>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="风格关键词 (如: 治愈森林, 多巴胺)"
                className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-[#ED3C3822] font-bold outline-none"
                value={ipInfo.style}
                onChange={(e) => setIpInfo({ ...ipInfo, style: e.target.value })}
              />
              <div className="h-[58px] invisible"></div> 
            </div>
          </section>
        </div>

        <div className="flex flex-col h-full">
          <div className="space-y-8 flex-1">
            <section>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">5.商业目的</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: '品牌宣传', desc: '侧重视觉冲击与打卡点设计' },
                  { id: '快速清库存', desc: '侧重动线末端售卖与促销互动' },
                  { id: '市场试水', desc: '侧重用户反馈收集与调研' }
                ].map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => toggleObjective(p.id as PopUpObjective)} 
                    className={`py-4 px-6 rounded-full font-bold text-sm border-2 text-left flex justify-between items-center transition-all ${
                      ipInfo.purpose.includes(p.id as PopUpObjective) ? 'border-[#ED3C38] text-[#ED3C38] bg-[#ED3C3808]' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <p>{p.id}</p>
                      <p className="text-[10px] opacity-60 font-normal">{p.desc}</p>
                    </div>
                    {ipInfo.purpose.includes(p.id as PopUpObjective) && <span className="text-xl">●</span>}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">6.功能区体验</label>
              <div className="grid grid-cols-2 gap-2">
                {['打卡拍照位', 'IP互动区', 'DIY工作坊', '私域关注引导', '线下盲盒/游戏', '产品体验区', '用户留言墙', '核销点'].map(f => (
                  <button 
                    key={f} 
                    onClick={() => toggleFeature(f)} 
                    className={`py-3 rounded-full font-bold text-[11px] border-2 transition-all ${
                      ipInfo.uxFeatures.includes(f) ? 'border-[#6AB2FF] text-[#6AB2FF] bg-[#6AB2FF08]' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-8 relative -top-[130px]">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">7.活动预算</label>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="活动总预算 (如: ¥10,000)"
                className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-[#ED3C3822] font-bold outline-none transition-all"
                value={ipInfo.budget}
                onChange={(e) => setIpInfo({ ...ipInfo, budget: e.target.value })}
              />
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-full border border-gray-100">
                <input type="checkbox" id="eco" className="w-5 h-5 rounded-full accent-[#6AB2FF]" defaultChecked />
                <label htmlFor="eco" className="text-xs font-bold text-gray-500 cursor-pointer">优先使用高性价比环保模块</label>
              </div>
            </div>
          </section>
        </div>
      </div>

      <button 
        onClick={onStart}
        disabled={loading}
        className="w-full bg-[#ED3C38] text-white py-6 rounded-full font-black text-xl hover:shadow-2xl shadow-red-200 transition-all flex items-center justify-center gap-3 active:scale-95 relative -top-[60px]"
      >
        {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : '开启AI设计引擎 (Gemini3.0)'}
      </button>
    </div>
  );
};
