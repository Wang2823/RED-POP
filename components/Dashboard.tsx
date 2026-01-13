
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Sector } from 'recharts';

const trafficData = [
  { time: '10:00', traffic: 120, interaction: 45, consumption: 12 },
  { time: '12:00', traffic: 450, interaction: 210, consumption: 45 },
  { time: '14:00', traffic: 380, interaction: 180, consumption: 38 },
  { time: '16:00', traffic: 620, interaction: 340, consumption: 82 },
  { time: '18:00', traffic: 890, interaction: 510, consumption: 145 },
  { time: '20:00', traffic: 430, interaction: 200, consumption: 52 },
];

const ageData = [
  { name: '18-24岁 (Z世代)', value: 45 },
  { name: '25-30岁 (职场新锐)', value: 35 },
  { name: '31-35岁 (精致中产)', value: 15 },
  { name: '35岁+ (资深买手)', value: 5 },
];

const segmentData = [
  { 
    name: 'Z世代二次元同好', 
    desc: '深受IP文化影响，热衷打卡分享，消费决策快，平均停留15分钟。', 
    count: 1240, 
    sales: '¥4.2w', 
    isHighPotential: true 
  },
  { 
    name: '职场减压派', 
    desc: '午休或周末到访，偏好办公解压周边，客单价高，注重实用性。', 
    count: 850, 
    sales: '¥3.8w', 
    isHighPotential: false 
  },
  { 
    name: '精致生活收藏家', 
    desc: '对限量版、盲盒有极高忠诚度，复购频率高，倾向深度互动。', 
    count: 420, 
    sales: '¥2.1w', 
    isHighPotential: true 
  },
  { 
    name: '亲子奇遇派', 
    desc: '家庭式出行，在DIY区停留最久，关注环保材质，消费力稳定。', 
    count: 380, 
    sales: '¥1.5w', 
    isHighPotential: false 
  }
];

const inventoryData = [
  { spu: '文具', model: 'LP-D01', sku: '治愈手写板', img: 'https://picsum.photos/seed/inv1/100/100', price: 128, current: 42, sold: 158 },
  { spu: '贴纸', model: 'LP-S22', sku: '多巴胺系列', img: 'https://picsum.photos/seed/inv2/100/100', price: 15, current: 850, sold: 150 },
  { spu: '潮玩', model: 'LP-F09', sku: 'DanDan联名款', img: 'https://picsum.photos/seed/inv3/100/100', price: 158, current: 15, sold: 185 },
  { spu: '数码', model: 'LP-A04', sku: '磁吸手机支架', img: 'https://picsum.photos/seed/inv4/100/100', price: 39, current: 45, sold: 255 },
  { spu: '出版', model: 'LP-C26', sku: '2026内在日历', img: 'https://picsum.photos/seed/inv5/100/100', price: 89, current: 120, sold: 30 },
];

const COLORS = ['#ED3C38', '#6AB2FF', '#FFBB28', '#00C49F'];

// 自定义饼图悬停突出效果
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visual' | 'persona' | 'inventory' | 'report'>('visual');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showInventoryActions, setShowInventoryActions] = useState(false);

  const funnelItems = [
    { label: '门口停留人数', val: 4280, pct: 100, color: 'bg-gray-100' },
    { label: '进店人数', val: 1540, pct: 36.0, color: 'bg-blue-50' },
    { label: '打卡人数', val: 890, pct: 20.8, color: 'bg-yellow-50' },
    { label: '消费人数', val: 218, pct: 5.1, color: 'bg-red-50' },
  ];

  // 总转化率计算 (消费人数/门口停留人数)
  const totalConversionRate = ((218 / 4280) * 100).toFixed(2);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '累计到店人数', value: '2,894', change: '+12.5%', color: 'text-blue-600', icon: '👥' },
          { label: '平均互动率', value: '42.8%', change: '+5.2%', color: 'text-green-600', icon: '✨' },
          { label: '支付转化率', value: '14.2%', change: '+2.1%', color: 'text-orange-600', icon: '💰' },
          { label: '碳减排贡献', value: '124kg', change: '环保标杆', color: 'text-[#ED3C38]', icon: '♻️' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-orange-50 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 text-4xl opacity-5 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-3xl font-black mt-2 text-gray-900 tracking-tighter">{stat.value}</h4>
            <p className={`text-[10px] font-black mt-2 flex items-center gap-1 ${stat.color}`}>
              {stat.change} <span className="opacity-50">较昨日</span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-2xl border border-orange-50 shadow-sm flex flex-wrap justify-center gap-1">
          {[
            { id: 'visual', label: '实时监控看板' },
            { id: 'persona', label: '用户画像预测' },
            { id: 'inventory', label: '智能库存管理' },
            { id: 'report', label: 'AI洞察报告' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-[#ED3C38] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {activeTab === 'visual' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-orange-50 h-[450px]">
              <h3 className="font-black text-gray-800 flex items-center gap-2 mb-8"><span className="w-2 h-2 rounded-full bg-[#ED3C38] animate-pulse"></span> 实时客流动态</h3>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={trafficData}>
                  <defs><linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ED3C38" stopOpacity={0.2}/><stop offset="95%" stopColor="#ED3C38" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="traffic" stroke="#ED3C38" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-orange-50 space-y-6 flex flex-col">
              <div className="flex justify-between items-center">
                 <h3 className="font-black text-gray-800">转化漏斗分布</h3>
                 <div className="bg-[#ED3C3811] text-[#ED3C38] px-3 py-1 rounded-full text-[10px] font-black">人均停留时长: 18.5min</div>
              </div>
              <div className="space-y-4 flex-1">
                {funnelItems.map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest">
                       <span>{item.label}</span>
                       <span>{item.val}人 / {item.pct}%</span>
                    </div>
                    <div className="w-full h-8 rounded-2xl overflow-hidden relative border border-gray-50 shadow-inner">
                       <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                       <div className="absolute inset-0 flex items-center px-4">
                          <div className="w-1 h-3 bg-[#ED3C38] rounded-full mr-3"></div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">总转化率 (停留 -> 消费)</span>
                 <span className="text-2xl font-black text-[#ED3C38] tracking-tighter">{totalConversionRate}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-orange-50">
              <h3 className="font-black text-gray-800 mb-6">引流笔记数据 (Traffic Notes)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                 <div className="text-center p-5 bg-gray-50 rounded-[32px] border border-gray-100 group hover:border-[#ED3C3822] transition-colors">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">累计点赞</p>
                    <p className="text-xl font-black text-[#ED3C38]">1.4w</p>
                 </div>
                 <div className="text-center p-5 bg-gray-50 rounded-[32px] border border-gray-100 group hover:border-[#6AB2FF22] transition-colors">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">累计收藏</p>
                    <p className="text-xl font-black text-[#6AB2FF]">8,520</p>
                 </div>
                 <div className="text-center p-5 bg-gray-50 rounded-[32px] border border-gray-100 group hover:border-gray-200 transition-colors">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">累计评论</p>
                    <p className="text-xl font-black text-gray-800">1,245</p>
                 </div>
                 <div className="text-center p-5 bg-gray-50 rounded-[32px] border border-gray-100 group hover:border-orange-200 transition-colors">
                    <p className="text-[9px] font-black text-orange-400 uppercase mb-2">品牌话题热度</p>
                    <p className="text-xl font-black text-orange-500">98.2w</p>
                 </div>
                 <div className="text-center p-5 bg-gray-50 rounded-[32px] border border-gray-100 group hover:border-blue-200 transition-colors">
                    <p className="text-[9px] font-black text-blue-400 uppercase mb-2">话题笔记数</p>
                    <p className="text-xl font-black text-blue-500">5,420</p>
                 </div>
                 <div className="text-center p-5 bg-gray-50 rounded-[32px] border border-gray-100 group hover:border-green-200 transition-colors">
                    <p className="text-[9px] font-black text-green-400 uppercase mb-2">UGC笔记数</p>
                    <p className="text-xl font-black text-green-500">3,890</p>
                 </div>
              </div>
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#ED3C3822] blur-3xl"></div>
              <h3 className="font-black mb-6 relative z-10">账号新增粉丝 (Growth)</h3>
              <div className="grid grid-cols-2 gap-6 relative z-10">
                 <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[32px] border border-white/10">
                    <div className="w-12 h-12 bg-[#ED3C38] rounded-2xl flex items-center justify-center text-xl">👤</div>
                    <div>
                       <p className="text-[10px] font-black opacity-50 uppercase">今日新增关注</p>
                       <p className="text-2xl font-black">+428</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[32px] border border-white/10">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-xl">💬</div>
                    <div>
                       <p className="text-[10px] font-black opacity-50 uppercase">社群新增人数</p>
                       <p className="text-2xl font-black">+85</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'persona' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-orange-50 min-h-[500px] flex flex-col">
            <h3 className="font-black text-gray-800 mb-6">年龄分布与行为标签</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Cast Pie to any to fix TypeScript error regarding activeIndex and activeShape props missing in some recharts versions or definitions */}
                  <Pie 
                    {...({
                      activeIndex: activeIndex,
                      activeShape: renderActiveShape,
                      data: ageData,
                      cx: "50%",
                      cy: "45%",
                      innerRadius: 70,
                      outerRadius: 100,
                      paddingAngle: 8,
                      dataKey: "value",
                      onMouseEnter: (_: any, index: number) => setActiveIndex(index)
                    } as any)}
                  >
                    {ageData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-8 rounded-[40px] shadow-sm border border-orange-50 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-gray-800">用户群体细分画像 (Segments)</h3>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">基于消费与行为维度</span>
            </div>
            <div className="space-y-4">
              {segmentData.map((segment, i) => (
                <div 
                  key={i} 
                  className={`p-6 rounded-[32px] border-2 transition-all relative group overflow-hidden ${
                    segment.isHighPotential 
                    ? 'border-[#ED3C38] bg-[#ED3C3805] shadow-lg scale-[1.02]' 
                    : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'
                  }`}
                >
                  {segment.isHighPotential && (
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#ED3C38] text-white text-[9px] font-black rounded-bl-2xl uppercase tracking-tighter shadow-md">
                      高潜力转化群体
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-black text-gray-900 text-sm">{segment.name}</h4>
                    <div className="flex gap-4">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase">人数</p>
                          <p className="text-xs font-black text-gray-800">{segment.count}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase">累计销售</p>
                          <p className={`text-xs font-black ${segment.isHighPotential ? 'text-[#ED3C38]' : 'text-gray-800'}`}>{segment.sales}</p>
                       </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold leading-relaxed pr-20">{segment.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-10 rounded-[48px] shadow-sm border border-orange-50">
             <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-gray-900 text-lg">实时库存 (Live Inventory)</h3>
                <div className="flex gap-4 relative">
                   <button 
                    onClick={() => setShowInventoryActions(!showInventoryActions)}
                    className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                   >
                    +
                   </button>
                   {showInventoryActions && (
                     <div className="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-[11px] font-black text-gray-600 flex items-center gap-2"><span>➕</span> 新增单款 SKU</button>
                        <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-[11px] font-black text-gray-600 flex items-center gap-2"><span>📊</span> 批量导入 Excel</button>
                        <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-[11px] font-black text-gray-600 flex items-center gap-2"><span>✏️</span> 修改现有库存</button>
                     </div>
                   )}
                   <button className="px-5 py-2 rounded-xl bg-gray-50 text-gray-400 text-xs font-black border border-gray-100">导出明细</button>
                </div>
             </div>
             <div className="overflow-x-visible">
                <table className="w-full text-left table-auto border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-gray-400 font-black text-[10px] uppercase tracking-[0.15em] border-b border-gray-50">
                      <th className="pb-4 px-6">类型/SPU</th>
                      <th className="pb-4">款号</th>
                      <th className="pb-4">产品名称/SKU</th>
                      <th className="pb-4">图片</th>
                      <th className="pb-4">价格</th>
                      <th className="pb-4">当前库存</th>
                      <th className="pb-4 text-center">已售库存</th>
                      <th className="pb-4 pl-6">销售进度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map(item => (
                      <tr key={item.sku} className="group bg-gray-50/40 hover:bg-white transition-all shadow-sm rounded-3xl">
                        <td className="py-5 px-6 rounded-l-3xl">
                           <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black">{item.spu}</span>
                        </td>
                        <td className="py-5 font-black text-gray-400 text-xs tracking-tighter pl-[20px]">{item.model}</td>
                        <td className="py-5">
                           <p className="font-black text-gray-800 text-xs">{item.sku}</p>
                        </td>
                        <td className="py-5">
                           <div className="w-10 h-10 rounded-xl border border-gray-100 bg-white relative group/img">
                              <img 
                                src={item.img} 
                                className="w-full h-full object-cover rounded-xl transition-all duration-300 group-hover/img:scale-[2.5] group-hover/img:z-50 group-hover/img:shadow-2xl group-hover/img:fixed group-hover/img:origin-center" 
                                style={{ transformOrigin: 'center center' }}
                                alt="sku" 
                              />
                           </div>
                        </td>
                        <td className="py-5 font-black text-gray-800 text-xs">¥{item.price}</td>
                        <td className="py-5">
                           <span className={`text-xs font-black ${item.current < 20 ? 'text-[#ED3C38]' : 'text-gray-800'}`}>{item.current}</span>
                        </td>
                        <td className="py-5 text-center">
                           <span className="font-black text-green-500 text-xs">{item.sold}</span>
                        </td>
                        <td className="py-5 pl-6 rounded-r-3xl pr-6 min-w-[140px]">
                           <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                 <div className={`h-full rounded-full ${item.current < 20 ? 'bg-[#ED3C38]' : 'bg-[#6AB2FF]'}`} style={{ width: `${Math.min(100, item.sold / (item.current + item.sold) * 100)}%` }} />
                              </div>
                              <span className="text-[9px] font-bold text-gray-400">{Math.round(item.sold / (item.current + item.sold) * 100)}%</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="bg-gray-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                   <h3 className="text-3xl font-black italic tracking-tighter">AI实时诊断报告</h3>
                   <p className="text-sm opacity-60 font-medium">更新时间：今日 20:15 | 数据范围：全天</p>
                </div>
                <div className="flex items-center gap-4 bg-white/10 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur">
                   <div className="text-center"><p className="text-[10px] font-black opacity-60">环境得分</p><p className="text-2xl font-black text-green-400">94</p></div>
                   <div className="w-px h-10 bg-white/10"></div>
                   <div className="text-center"><p className="text-[10px] font-black opacity-60">健康指数</p><p className="text-2xl font-black text-orange-400">A</p></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[40px] border border-orange-50 shadow-sm space-y-6">
                <div className="flex items-center gap-3"><span className="text-2xl">⚡</span><h4 className="font-black text-gray-800">实时调整建议</h4></div>
                <div className="space-y-4">{[{ type: '动线调整', content: '核心打卡位出现局部拥堵。' }].map((item, i) => <div key={i} className="bg-gray-50 p-5 rounded-2xl border border-gray-100"><p className="text-xs text-gray-600 font-bold">{item.content}</p></div>)}</div>
             </div>
             <div className="bg-white p-8 rounded-[40px] border border-orange-50 shadow-sm space-y-6">
                <div className="flex items-center gap-3"><span className="text-2xl">📈</span><h4 className="font-black text-gray-800">明日趋势预测</h4></div>
                <div className="space-y-4">
                   {[
                     { label: '预计到店人数', value: '3,200 - 3,500' },
                     { label: '预计客流高峰', value: '14:00 - 16:00' },
                     { label: '预计销售额', value: '¥2.4w - ¥3.1w' },
                     { label: '预计爆款产品', value: 'Loopy 手机壳' },
                     { label: '预计碳减排贡献', value: '15.2kg' },
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-end pb-4 border-b border-gray-50 last:border-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-black text-gray-800">{item.value}</p>
                     </div>
                   ))}
                </div>
                <button className="w-full py-4 rounded-2xl bg-gray-900 text-white font-black text-xs">下载全案报告 (PDF)</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
