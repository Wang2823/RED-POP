
export enum AppStep {
  Inspiration = '灵感与规划',
  Simulation = '模拟与预算',
  Checkout = '一键下单',
  Logistics = '物流与履约',
  Setup = '搭建与布展',
  Monitoring = '实时监测',
  Recycling = '回收与循环',
  Reporting = '数据复盘'
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export type PopUpObjective = '品牌宣传' | '快速清库存' | '市场试水';

export interface IPAsset {
  name: string;
  xhsAccount?: string;
  purpose: PopUpObjective[];
  style: string;
  activityTheme?: string;
  startDate?: string;
  duration?: string;
  locationType: '室内' | '市集' | '临街';
  size: string;
  assets: string[]; // ['KT板', '挂布', '海报']
  uxFeatures: string[]; // ['打卡点', 'IP互动', 'DIY工作坊', '扫码关注']
  budget?: string;
  fileAssets?: { data: string; mimeType: string }[]; // Base64 encoded IP assets
}

export interface DesignMaterial {
  id: string;
  name: string;
  zoneName: string;
  spec: string;
  material: string;
  functionalSuggestion: string; 
  mockupUrl: string;
}

export interface DesignSuggestion {
  reasoning: {
    objective: string;
    layout: string;
    sustainability: string;
    psychology: string;
  };
  materials: DesignMaterial[];
}

export interface ReferenceItem {
  id: number;
  title: string;
  author: string;
  likes: string;
  image: string | null;
  tag: string;
}

export interface CaseItem {
  id: number;
  title: string;
  tags: string[];
  metrics: { roi: string; carbon: string; traffic: string };
  image: string | null;
  story: string;
}
