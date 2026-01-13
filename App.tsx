
import React, { useState, useEffect } from 'react';
import { AppStep, IPAsset, DesignSuggestion, TaskStatus, ReferenceItem, CaseItem } from './types';
import { ThreeDSandbox } from './components/ThreeDSandbox';
import { Dashboard } from './components/Dashboard';
import { ReferenceGrid } from './components/ReferenceGrid';
import { ExecutionGuide } from './components/ExecutionGuide';
import { CaseStudy } from './components/CaseStudy';
import { AboutPlatform as ProjectHistory } from './components/AboutPlatform';
import { InspirationForm } from './components/InspirationForm';
import { DesignEngine } from './components/DesignEngine';
import { getDesignSuggestions } from './services/geminiService';

type ViewMode = 'HOME' | 'WORKBENCH' | 'CASES' | 'PROJECTS';
type WorkbenchPhase = 'CREATE' | 'ORDER' | 'EXECUTE' | 'INSIGHT';

const ASSET_WEIGHTS: Record<string, number> = {
  module: 3,
  rack_s: 0.5,
  rack_l: 1,
  cabinet: 7.5,
  table: 3,
  screen: 3.5,
  chair: 2,
  spotlight: 1,
  counter: 5
};

const AVAILABLE_ASSETS_FULL = [
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

const INITIAL_REFERENCES: ReferenceItem[] = [
  { id: 1, title: '奶龙快闪店：上海静安大悦城落地实拍', author: '文创小能手', likes: '1.2w', image: null, tag: '人气爆棚' },
  { id: 2, title: '可持续快闪：如何用模块化展架搭建出高级感？', author: 'RED-POP 官方', likes: '2.4w', image: null, tag: '环保先锋' },
  { id: 3, title: 'IP 粉丝见面会：从 0 到 1 策划一场 IP 粉丝见面会', author: 'IP 主理人小王', likes: '5.6k', image: null, tag: '干货分享' },
  { id: 4, title: 'Loopy 露比：粉色情绪经济学空间设计', author: '空间设计师阿强', likes: '8.5k', image: null, tag: '潮流设计' },
  { id: 5, title: '清仓活动也能很有趣！互动设计分享', author: '快闪运营官', likes: '3.1k', image: null, tag: '高转化' },
  { id: 6, title: '全球最美 10 个快闪店设计赏析', author: '环球设计', likes: '12w', image: null, tag: '灵感集锦' },
];

const INITIAL_CASES: CaseItem[] = [
  {
    id: 1,
    title: '“多巴胺”奶龙快闪店 - 上海站',
    tags: ['IP联名', '高热度'],
    metrics: { roi: '340%', carbon: '120kg', traffic: '5.2w' },
    image: null,
    story: '通过模块化亮色灯箱与环保纸板陈列架，在3天内完成了低成本搭建，物料回收率达98%。'
  },
  {
    id: 2,
    title: 'Loopy 露比“情绪诊所”',
    tags: ['情绪经济', '爆款'],
    metrics: { roi: '210%', carbon: '85kg', traffic: '3.8w' },
    image: null,
    story: '利用RED-POP标准互动展柜，实现了粉丝深度参与的“药方”扭蛋互动，大幅提升了周边转化率。'
  },
  {
    id: 3,
    title: '可持续生活方式：森林系快闪',
    tags: ['环保', '自然风'],
    metrics: { roi: '180%', carbon: '240kg', traffic: '2.1w' },
    image: null,
    story: '完全采用租赁框架，活动结束后仅产生3kg不可回收垃圾，成为年度环保快闪标杆。'
  }
];

const FIXED_CATEGORIES = [
  { id: 'poster', name: '海报' },
  { id: 'ktboard', name: 'KT板' },
  { id: 'cloth', name: '挂布' },
  { id: 'wall', name: '留言墙' },
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('HOME');
  const [workbenchPhase, setWorkbenchPhase] = useState<WorkbenchPhase>('CREATE');
  const [rentalDays, setRentalDays] = useState<number>(14);
  const [isBoostingCheckout, setIsBoostingCheckout] = useState(false);
  const [selectedBoostingServices, setSelectedBoostingServices] = useState<string[]>([]);
  const [noteTaskStatus, setNoteTaskStatus] = useState<TaskStatus>('todo');
  
  // Persisted state across phases
  const [ipInfo, setIpInfo] = useState<IPAsset>({ 
    name: '', 
    xhsAccount: '',
    purpose: ['品牌宣传'], 
    style: '', 
    activityTheme: '',
    duration: '',
    locationType: '室内', 
    size: '20m²', 
    assets: [], 
    uxFeatures: ['打卡拍照位'],
    budget: '',
    fileAssets: []
  });
  const [designResults, setDesignResults] = useState<DesignSuggestion | null>(null);
  const [materialRefinements, setMaterialRefinements] = useState<Record<string, string>>({});
  const [materialQuantities, setMaterialQuantities] = useState<Record<string, number>>(
    FIXED_CATEGORIES.reduce((acc, m) => ({ ...acc, [m.id]: 1 }), {})
  );
  const [materialZoneAssignments, setMaterialZoneAssignments] = useState<Record<string, string>>({});

  const [persistedNoteData, setPersistedNoteData] = useState<{ title: string; content: string; tags: string[] } | null>(null);
  const [persistedNoteImages, setPersistedNoteImages] = useState<string[]>([]);
  
  // Persistence for Inspiration & Cases
  const [inspirationItems, setInspirationItems] = useState<ReferenceItem[]>(INITIAL_REFERENCES);
  const [caseItems, setCaseItems] = useState<CaseItem[]>(INITIAL_CASES);
  
  const [loading, setLoading] = useState(false);
  const [projectZones, setProjectZones] = useState<any[]>([]);

  useEffect(() => {
    if (ipInfo.duration) {
      const match = ipInfo.duration.match(/\d+/);
      if (match) {
        setRentalDays(parseInt(match[0]));
      }
    }
  }, [ipInfo.duration]);

  const handleStartNewProject = () => {
    setIpInfo({ 
      name: '', 
      xhsAccount: '',
      purpose: ['品牌宣传'], 
      style: '', 
      activityTheme: '',
      duration: '',
      locationType: '室内', 
      size: '20m²', 
      assets: [], 
      uxFeatures: ['打卡拍照位'],
      budget: '',
      fileAssets: []
    });
    setDesignResults(null);
    setProjectZones([]);
    setMaterialRefinements({});
    setMaterialQuantities(FIXED_CATEGORIES.reduce((acc, m) => ({ ...acc, [m.id]: 1 }), {}));
    setMaterialZoneAssignments({});
    setWorkbenchPhase('CREATE');
    setViewMode('WORKBENCH');
  };

  const generateInitialSandboxScheme = () => {
    const zones: any[] = [];
    const featureMap: Record<string, { name: string, icon: string, assets: string[] }> = {
      '打卡拍照位': { name: '核心打卡区', icon: '📸', assets: ['module', 'spotlight', 'screen'] },
      'IP互动区': { name: 'IP互动区', icon: '✨', assets: ['cabinet', 'table'] },
      'DIY工作坊': { name: 'DIY活动区', icon: '🎨', assets: ['table', 'chair'] },
      '私域关注引导': { name: '前台收银区', icon: '💰', assets: ['counter', 'screen'] },
      '核销点': { name: '前台收银区', icon: '💰', assets: ['counter'] },
      '用户留言墙': { name: '粉丝留言墙', icon: '📝', assets: ['module'] },
    };

    ipInfo.uxFeatures.forEach((feat, index) => {
      const config = featureMap[feat];
      if (config) {
        const existing = zones.find(z => z.name === config.name);
        if (existing) {
          config.assets.forEach(assetId => {
            const asset = AVAILABLE_ASSETS_FULL.find(a => a.id === assetId);
            if (asset) {
              const zoneAsset = existing.assets.find((za: any) => za.id === assetId);
              if (zoneAsset) zoneAsset.count++;
              else existing.assets.push({ ...asset, count: 1 });
            }
          });
        } else {
          zones.push({
            instanceId: `initial-zone-${index}`,
            name: config.name,
            icon: config.icon,
            assets: config.assets.map(assetId => {
              const asset = AVAILABLE_ASSETS_FULL.find(a => a.id === assetId);
              return asset ? { ...asset, count: 1 } : null;
            }).filter(Boolean)
          });
        }
      }
    });
    return zones;
  };

  const handleGenerateDesign = async () => {
    setLoading(true);
    const result = await getDesignSuggestions(ipInfo);
    setDesignResults(result);
    const newZones = generateInitialSandboxScheme();
    setProjectZones(newZones);
    
    // 初始化物料区域分配
    const initialAssignments: Record<string, string> = {};
    FIXED_CATEGORIES.forEach((m, idx) => {
      initialAssignments[m.id] = newZones[idx % newZones.length]?.name || '未选功能区';
    });
    setMaterialZoneAssignments(initialAssignments);
    
    setLoading(false);
  };

  const handleBackToDefinition = () => {
    setDesignResults(null);
  };

  const handleProceedToOrder = () => {
    setIsBoostingCheckout(false);
    setWorkbenchPhase('ORDER');
  };

  const calculateDailyRental = () => {
    return projectZones.reduce((sum, z) => 
      sum + z.assets.reduce((zSum: number, a: any) => zSum + (a.price * a.count), 0), 0
    );
  };

  const calculateLogistics = () => {
    let weightFee = 0;
    projectZones.forEach(z => {
      z.assets.forEach((a: any) => {
        const weight = ASSET_WEIGHTS[a.id] || 5;
        weightFee += (weight * 3) * a.count;
      });
    });
    return Math.max(50, 30 + weightFee);
  };

  const BOOSTING_PRICES: Record<string, number> = {
    fans: 500,
    interaction: 300,
    location: 800,
    conversion: 1000
  };

  const totalLogistics = calculateLogistics();
  const dailyRental = calculateDailyRental();
  const totalRental = dailyRental * rentalDays;
  const ecoPointsDiscount = 300;
  const totalPayable = Math.max(0, totalRental + totalLogistics - ecoPointsDiscount);
  const boostingTotal = selectedBoostingServices.reduce((sum, id) => sum + (BOOSTING_PRICES[id] || 0), 0);

  const renderWorkbench = () => {
    return (
      <div className="space-y-12 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter">项目工作台</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">RED-POP全链路AI赋能中心</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-full border border-orange-50 shadow-sm overflow-hidden">
            {[
              { id: 'CREATE', label: '🎨创意' },
              { id: 'ORDER', label: '🛍️订单' },
              { id: 'EXECUTE', label: '🛠️执行' },
              { id: 'INSIGHT', label: '📊洞察' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setWorkbenchPhase(p.id as WorkbenchPhase);
                  setIsBoostingCheckout(false);
                }}
                className={`px-8 py-3 rounded-full text-xs font-black transition-all ${
                  workbenchPhase === p.id ? 'bg-[#ED3C38] text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[700px]">
          {workbenchPhase === 'CREATE' && (
            <div className="space-y-16">
              {!designResults ? (
                <InspirationForm 
                  ipInfo={ipInfo} 
                  setIpInfo={setIpInfo} 
                  onStart={handleGenerateDesign} 
                  loading={loading} 
                />
              ) : (
                <>
                  <ThreeDSandbox 
                    initialZones={projectZones}
                    onUpdateProject={(zones) => setProjectZones(zones)} 
                  />
                  <DesignEngine 
                    suggestion={designResults} 
                    materialUrls={materialRefinements}
                    setMaterialUrls={setMaterialRefinements}
                    materialQuantities={materialQuantities}
                    setMaterialQuantities={setMaterialQuantities}
                    materialZoneAssignments={materialZoneAssignments}
                    setMaterialZoneAssignments={setMaterialZoneAssignments}
                    ipInfo={ipInfo}
                    currentZones={projectZones}
                    setProjectZones={setProjectZones}
                    onBack={handleBackToDefinition} 
                    onProceed={handleProceedToOrder}
                  />
                </>
              )}
            </div>
          )}

          {workbenchPhase === 'ORDER' && (
             <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-10 rounded-[48px] border border-orange-50 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black">{isBoostingCheckout ? '投流加热服务清单' : '租赁服务清单'}</h3>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                      {!isBoostingCheckout && '物流计费标准: 3元/kg + 30元服务费\n(最低50元起)'}
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    {isBoostingCheckout ? (
                      <div className="space-y-4">
                        {selectedBoostingServices.map(sid => (
                          <div key={sid} className="flex items-center justify-between py-4 border-b border-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-xl">🔥</div>
                              <div>
                                <p className="font-black text-gray-800 text-sm">
                                  {sid === 'fans' ? '粉丝增长包' : sid === 'interaction' ? '互动提升包' : sid === 'location' ? '同城引流包' : '销售转化包'}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">聚光平台精准分发</p>
                              </div>
                            </div>
                            <span className="font-black text-gray-900 text-sm">¥{BOOSTING_PRICES[sid]}.00</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      projectZones.length > 0 ? projectZones.map((z) => (
                        <div key={z.instanceId} className="space-y-4">
                          <div className="flex items-center gap-2 border-b-2 border-gray-50 pb-2">
                             <span className="text-xl">{z.icon}</span>
                             <h4 className="font-black text-gray-800 uppercase tracking-widest text-xs">{z.name}</h4>
                          </div>
                          <div className="space-y-4">
                            {z.assets.map((a: any) => {
                              const weight = ASSET_WEIGHTS[a.id] || 5;
                              const itemLogistics = (weight * 3) * a.count;
                              return (
                                <div key={a.id} className="flex items-center justify-between py-2 group">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-[#ED3C3811] transition-colors">{a.icon}</div>
                                     <div>
                                        <p className="font-bold text-gray-800 text-sm">{a.name} <span className="text-gray-400 ml-1">x{a.count}</span></p>
                                        <div className="flex gap-3 mt-0.5">
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">单体重量: {weight}kg | 总重: {weight * a.count}kg</p>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-gray-900 text-sm">租赁: ¥{a.price * a.count}/日</p>
                                    <p className="text-[10px] text-gray-400 font-bold">物流费用: ¥{itemLogistics}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10 space-y-4">
                          <p className="text-gray-400 italic">您还没有在“创意”阶段配置任何功能区与资产</p>
                          <button onClick={() => setWorkbenchPhase('CREATE')} className="text-[#ED3C38] text-sm font-bold underline">返回创意阶段配置</button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-[48px] border border-orange-50 shadow-xl h-fit sticky top-28 space-y-8">
                <div className="flex justify-between items-center">
                   <h4 className="font-black text-gray-500 uppercase text-xs tracking-widest">结算确认</h4>
                   <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold">
                    {isBoostingCheckout ? '流量加热' : '租赁模式'}
                   </span>
                </div>

                {!isBoostingCheckout && (
                  <div className="space-y-4 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">设置租赁天数</label>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setRentalDays(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black hover:border-[#ED3C38] transition-colors"
                      >-</button>
                      <div className="flex-1 flex items-center justify-center">
                        <input 
                          type="number"
                          min="1"
                          value={rentalDays}
                          onChange={(e) => setRentalDays(Math.max(1, parseInt(e.target.value) || 1))}
                          className="text-2xl font-black text-gray-900 bg-transparent border-none outline-none w-16 text-center focus:ring-0 p-0"
                        />
                        <span className="text-xs font-bold text-gray-400 ml-1">天</span>
                      </div>
                      <button 
                        onClick={() => setRentalDays(prev => prev + 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black hover:border-[#ED3C38] transition-colors"
                      >+</button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 px-2">
                  {isBoostingCheckout ? (
                    <div className="flex justify-between text-sm font-bold text-gray-600">
                      <span>投流包合计</span>
                      <span>¥{boostingTotal}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm font-bold text-gray-600">
                        <span>单日租金</span>
                        <span>¥{dailyRental}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">租期总额 ({rentalDays}天)</span>
                        <span className="font-bold">¥{totalRental}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">物流履约</span>
                        <span className="font-bold">¥{totalLogistics}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#6AB2FF] font-bold">
                        <span>环保积分抵扣</span>
                        <span>-¥{ecoPointsDiscount}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-6 border-t border-dashed flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="font-black text-xs text-gray-400 uppercase block">应付总计</span>
                      <span className="text-[10px] text-green-500 font-bold">含基础保障服务</span>
                    </div>
                    <span className="text-4xl font-black text-[#ED3C38] tracking-tighter">
                      ¥{isBoostingCheckout ? boostingTotal : totalPayable}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setWorkbenchPhase('EXECUTE')} 
                  disabled={!isBoostingCheckout && projectZones.length === 0}
                  className="w-full bg-[#ED3C38] text-white py-5 rounded-full font-black text-lg shadow-2xl shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认并支付
                </button>
                <p className="text-[9px] text-center text-gray-400 font-bold px-4">
                  点击确认即代表您同意《RED-POP相关服务协议》
                </p>
              </div>
            </div>
          )}

          {workbenchPhase === 'EXECUTE' && (
            <ExecutionGuide 
              ipInfo={ipInfo} 
              designResults={designResults} 
              persistedNoteData={persistedNoteData}
              setPersistedNoteData={setPersistedNoteData}
              persistedNoteImages={persistedNoteImages}
              setPersistedNoteImages={setPersistedNoteImages}
              noteTaskStatus={noteTaskStatus}
              setNoteTaskStatus={setNoteTaskStatus}
              onNavigateToOrder={(services) => {
                setSelectedBoostingServices(services);
                setIsBoostingCheckout(true);
                setWorkbenchPhase('ORDER');
              }} 
            />
          )}
          {workbenchPhase === 'INSIGHT' && <Dashboard />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFEEB]">
      <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-50 border-b border-orange-50 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer w-44 group" onClick={() => setViewMode('HOME')}>
            <div className="w-10 h-10 bg-[#ED3C38] rounded-full flex items-center justify-center text-white font-black italic text-xl shadow-lg transition-transform group-hover:rotate-3">R</div>
            <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase">RED-POP</span>
          </div>
          
          <nav className="flex items-center gap-14 h-full">
            {[
              { id: 'HOME', label: '灵感探索' },
              { id: 'WORKBENCH', label: '项目工作台' },
              { id: 'CASES', label: '成功案例' },
              { id: 'PROJECTS', label: '我的项目' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setViewMode(nav.id as ViewMode)}
                className={`text-sm font-black transition-all relative h-full flex items-center ${
                  viewMode === nav.id ? 'text-[#ED3C38]' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {nav.label}
                {viewMode === nav.id && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-[#ED3C38] rounded-full"></span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 w-44 justify-end">
            <button className="text-sm font-bold text-gray-500 hover:text-[#ED3C38] transition-colors">登录控制台</button>
            <div className="w-10 h-10 rounded-full bg-[#6AB2FF] border-2 border-white shadow-md flex items-center justify-center text-white font-black overflow-hidden ring-2 ring-orange-50">
               <img src="https://i.pravatar.cc/100?u=redpop_creator" alt="User" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        {viewMode === 'HOME' && (
          <div className="animate-fade-in space-y-24">
            <section className="bg-white rounded-[64px] p-16 md:p-32 shadow-sm border border-orange-50 relative overflow-hidden flex flex-col items-center justify-center text-center">
               <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#ED3C38]/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#6AB2FF]/[0.03] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
               
               <div className="space-y-10 relative z-10 max-w-4xl">
                  <span className="inline-block bg-[#ED3C3811] text-[#ED3C38] px-6 py-2.5 rounded-full text-sm md:text-base font-black tracking-widest uppercase border border-[#ED3C3822]">AI创意引擎v3.0</span>
                  <h1 className="text-4xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                    让每一次快闪<br/>
                    都成为 <span className="text-[#ED3C38] italic">数字资产</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
                    专为小红书IP主理人打造的「创意设计-循环租赁-智能监测」一站式可持续商业化平台。
                  </p>
                  <div className="pt-10 flex flex-col sm:flex-row gap-6 justify-center">
                    <button onClick={() => { setViewMode('WORKBENCH'); setWorkbenchPhase('CREATE'); }} className="bg-[#ED3C38] text-white px-16 py-6 rounded-full font-black text-xl shadow-2xl shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all">立即开启我的设计</button>
                    <button onClick={() => setViewMode('CASES')} className="bg-white border-2 border-orange-50 px-16 py-6 rounded-full font-black text-xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm">查看爆款案例</button>
                  </div>
               </div>
            </section>

            {/* Platform Introduction Sections */}
            <div className="space-y-24">
              <section className="text-center space-y-6">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">让创意不再“一次性”</h2>
                <p className="text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
                  RED-POP是国内首家专注于小红书文创IP的<strong>可持续快闪</strong>商业化赋能平台。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 text-left">
                  {[
                    { title: '环境可持续', desc: '全标准化模块化组件租赁，减少90%的搭建废弃物。', color: 'bg-green-50', icon: '🌱' },
                    { title: '商业可持续', desc: 'AI驱动的ROI预测与精准选址，降低主理人试错成本。', color: 'bg-red-50', icon: '📈' },
                    { title: '用户价值可持续', desc: '通过数据驱动的动线优化，提升粉丝深度参与感与复购。', color: 'bg-blue-50', icon: '🤝' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.color} p-8 rounded-3xl space-y-4 border border-white shadow-sm`}>
                      <div className="text-4xl">{item.icon}</div>
                      <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-16 rounded-[64px] border border-orange-50 shadow-sm space-y-12">
                <h3 className="text-3xl font-black text-center text-gray-900">8大闭环阶段，1站式搞定</h3>
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
                    {['规划', '采购', '执行', '复盘'].map((step, i) => (
                      <div key={i} className="bg-white flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-[#ED3C38] text-white flex items-center justify-center font-black text-xl shadow-lg">{i + 1}</div>
                        <div>
                          <p className="font-black text-lg text-gray-800">{step}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase mt-1">全流程AI监测</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Inspiration Sections Moved to Last */}
            <div className="space-y-10">
              <div className="flex items-end justify-between border-b-2 border-white pb-6">
                <div className="space-y-1">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter">灵感探索</h2>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">基于小红书爆款内容趋势</p>
                </div>
                <div className="flex gap-2">
                   {['全部灵感', '人气爆棚', '环保标杆', '极致性价比'].map(t => (
                     <button key={t} className="px-6 py-3 rounded-full text-xs font-black border border-orange-50 hover:border-[#ED3C38] hover:text-[#ED3C38] transition-all bg-white shadow-sm">
                       {t}
                     </button>
                   ))}
                </div>
              </div>
              <ReferenceGrid items={inspirationItems} onUpdateItems={setInspirationItems} />
            </div>
          </div>
        )}

        {viewMode === 'WORKBENCH' && renderWorkbench()}
        {viewMode === 'CASES' && <CaseStudy items={caseItems} onUpdateItems={setCaseItems} />}
        {viewMode === 'PROJECTS' && <ProjectHistory onNewProject={handleStartNewProject} />}
      </main>

      <footer className="bg-white border-t border-orange-50 py-24 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20">
           <div className="md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ED3C38] rounded-full flex items-center justify-center text-white font-black italic shadow-lg shadow-red-100">R</div>
                <span className="text-3xl font-black tracking-tighter uppercase">RED-POP</span>
              </div>
              <p className="text-gray-400 font-bold leading-relaxed max-w-sm">
                让快闪商业不再是昂贵的“一次性装修”。通过数字化设计与标准化循环租赁，重构轻量级商业生态。
              </p>
              <div className="flex gap-8">
                 <div>
                    <p className="text-2xl font-black text-gray-900">450+</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">活跃主理人</p>
                 </div>
                 <div>
                    <p className="text-2xl font-black text-[#6AB2FF]">12.4t</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">累计碳减排贡献</p>
                 </div>
              </div>
           </div>
           <div>
              <h5 className="font-black text-gray-900 mb-10 uppercase text-xs tracking-[0.2em]">赋能与规范</h5>
              <ul className="space-y-5 text-sm font-bold text-gray-400">
                 <li className="hover:text-[#ED3C38] cursor-pointer transition-colors">快闪店设计规范PDF下载</li>
                 <li className="hover:text-[#ED3C38] cursor-pointer transition-colors">标准化租赁模块清单</li>
                 <li className="hover:text-[#ED3C38] cursor-pointer transition-colors">IoT传感器接入技术文档</li>
                 <li className="hover:text-[#ED3C38] cursor-pointer transition-colors">小红书笔记转化监测指南</li>
              </ul>
           </div>
           <div>
              <h5 className="font-black text-gray-900 mb-10 uppercase text-xs tracking-[0.2em]">社群连接</h5>
              <div className="grid grid-cols-2 gap-3">
                 <div className="aspect-square bg-gray-50 rounded-[32px] flex items-center justify-center hover:bg-[#ED3C38] hover:text-white transition-all cursor-pointer text-xl shadow-sm">小</div>
                 <div className="aspect-square bg-gray-50 rounded-[32px] flex items-center justify-center hover:bg-[#ED3C38] hover:text-white transition-all cursor-pointer text-xl shadow-sm">信</div>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-12 border-t border-gray-50 text-center">
           <p className="text-xs text-gray-300 font-black uppercase tracking-[0.3em]">© 2024 RED-POP PLATFORM. EMPOWERING CREATORS FOR A SUSTAINABLE FUTURE.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default App;
