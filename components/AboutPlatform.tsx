
import React, { useState } from 'react';

interface PastProject {
  id: string;
  name: string;
  date: string;
  location: string;
  status: '已完成' | '进行中';
  image: string;
  roi: string;
  carbonSaving: string;
  fullDesign: {
    theme: string;
    description: string;
    visualTags: string[];
    materials: string[];
  };
}

const mockProjects: PastProject[] = [
  {
    id: 'PRJ-2024-001',
    name: '奶龙“治愈工坊”',
    date: '2024.10.15',
    location: '上海 静安大悦城',
    status: '已完成',
    image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=800&auto=format&fit=crop',
    roi: '340%',
    carbonSaving: '124kg',
    fullDesign: {
      theme: '多巴胺治愈空间',
      description: '针对奶龙IP的软萌属性，利用模块化发光背板打造高亮视觉中心，配合互动DIY区提升留存。',
      visualTags: ['奶油色系', '高光补足', '模块化背景'],
      materials: ['IP定制立牌 x4', '互动扭蛋机 x1', '环保纸板展架 x12', '柔光射灯 x8']
    }
  },
  {
    id: 'PRJ-2024-002',
    name: 'Loopy“小情绪”快闪',
    date: '2024.11.02',
    location: '杭州 湖滨银泰IN77',
    status: '进行中',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    roi: '预计210%',
    carbonSaving: '85kg',
    fullDesign: {
      theme: '粉色解压站',
      description: '利用粉色系情绪经济学，通过“吐槽墙”与IP互动区结合，引发用户自主发帖。',
      visualTags: ['多巴胺粉', '沉浸式音效', '互动墙'],
      materials: ['粉色KT板背景 x2', '发声装置 x4', '租赁展示柜 x6']
    }
  }
];

interface AboutPlatformProps {
  onNewProject?: () => void;
}

export const AboutPlatform: React.FC<AboutPlatformProps> = ({ onNewProject }) => {
  const [selectedProject, setSelectedProject] = useState<PastProject | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-white pb-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">我的项目工作台</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">管理您的全量快闪项目与AI资产</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl border border-orange-50 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">累计项目</p>
              <p className="text-xl font-black text-gray-900">{mockProjects.length}</p>
           </div>
           <div className="bg-white px-6 py-3 rounded-2xl border border-orange-50 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">总减排贡献</p>
              <p className="text-xl font-black text-green-500">209kg</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockProjects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => setSelectedProject(project)}
            className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-orange-50 hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="h-48 relative overflow-hidden">
              <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${project.status === '已完成' ? 'bg-green-500 text-white' : 'bg-[#6AB2FF] text-white'}`}>
                  {project.status}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                 <p className="text-[10px] font-black text-white">{project.date}</p>
                 <p className="text-[10px] font-black text-white">{project.location}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">{project.name}</h3>
                <span className="text-[10px] font-black text-gray-300">ID: {project.id}</span>
              </div>
              <div className="flex gap-6 py-4 border-y border-gray-50">
                 <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase">ROI</p>
                    <p className="font-black text-gray-800">{project.roi}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase">碳减排</p>
                    <p className="font-black text-green-500">{project.carbonSaving}</p>
                 </div>
              </div>
              <p className="text-xs font-black text-[#ED3C38] flex items-center gap-1 group-hover:gap-2 transition-all">
                点开查看全案设计详情 <span>→</span>
              </p>
            </div>
          </div>
        ))}
        
        {/* 新建项目占位卡片 */}
        <div 
          onClick={onNewProject}
          className="bg-[#FFFEEB] rounded-[40px] border-2 border-dashed border-orange-100 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:bg-white hover:border-[#ED3C38] transition-all"
        >
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">➕</div>
           <p className="font-black text-gray-500">开启新项目</p>
           <p className="text-[10px] text-gray-300 font-bold mt-1 uppercase">利用Gemini 3.0构建爆款方案</p>
        </div>
      </div>

      {/* 项目全案详情弹窗 */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
           <div 
            className="relative w-full max-w-4xl bg-white rounded-[64px] shadow-2xl overflow-hidden animate-fade-in flex flex-col lg:flex-row h-[90vh] lg:h-auto max-h-[800px]" 
            onClick={(e) => e.stopPropagation()}
           >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-8 right-8 z-20 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-black shadow-lg hover:bg-black transition-all"
              >✕</button>

              <div className="w-full lg:w-[400px] h-[300px] lg:h-auto relative overflow-hidden">
                 <img src={selectedProject.image} className="w-full h-full object-cover" alt="design" />
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent p-10 flex flex-col justify-end">
                    <p className="text-[#ED3C38] font-black uppercase text-xs tracking-widest mb-2">项目概览</p>
                    <h4 className="text-3xl font-black text-white leading-tight">{selectedProject.name}</h4>
                    <p className="text-white/60 text-sm font-medium mt-2">{selectedProject.location} | {selectedProject.date}</p>
                 </div>
              </div>

              <div className="flex-1 p-12 overflow-y-auto custom-scroll space-y-10 bg-[#FFFEEB]/30">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="text-3xl">🎨</span>
                       <h5 className="text-xl font-black text-gray-900">设计主题：{selectedProject.fullDesign.theme}</h5>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed bg-white p-6 rounded-3xl border border-orange-50 shadow-sm italic">
                      “{selectedProject.fullDesign.description}”
                    </p>
                 </div>

                 <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">视觉关键词</p>
                    <div className="flex flex-wrap gap-2">
                       {selectedProject.fullDesign.visualTags.map(tag => (
                         <span key={tag} className="px-4 py-2 bg-white border border-orange-50 rounded-full text-xs font-black text-gray-600 shadow-sm">{tag}</span>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">全案物料清单</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {selectedProject.fullDesign.materials.map((m, i) => (
                         <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-orange-50 shadow-sm">
                            <div className="w-10 h-10 bg-[#ED3C3811] rounded-xl flex items-center justify-center text-lg">📦</div>
                            <p className="text-xs font-black text-gray-800">{m}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-10 flex gap-4">
                    <button className="flex-1 bg-gray-900 text-white py-5 rounded-3xl font-black text-sm hover:bg-black transition-all shadow-xl">下载全套工程文件</button>
                    <button className="flex-1 bg-white border-2 border-orange-100 text-gray-600 py-5 rounded-3xl font-black text-sm hover:border-[#ED3C38] hover:text-[#ED3C38] transition-all">再次基于此模版创作</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
