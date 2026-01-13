
import React, { useRef } from 'react';
import { ReferenceItem } from '../types';

interface ReferenceGridProps {
  items: ReferenceItem[];
  onUpdateItems: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
}

export const ReferenceGrid: React.FC<ReferenceGridProps> = ({ items, onUpdateItems }) => {
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
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="break-inside-avoid bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group border border-orange-50/50"
          onClick={() => !item.image && triggerUpload(item.id)}
        >
          <div className="relative">
            {item.image ? (
              <div className="relative">
                <img src={item.image} alt={item.title} className="w-full h-auto object-cover block" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button 
                    onClick={(e) => { e.stopPropagation(); triggerUpload(item.id); }}
                    className="p-3 bg-white rounded-full text-xs shadow-xl hover:scale-110 transition-transform"
                   >🔄</button>
                   <button 
                    onClick={(e) => removeImage(item.id, e)}
                    className="p-3 bg-white rounded-full text-xs shadow-xl hover:scale-110 transition-transform"
                   >🗑️</button>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] bg-[#FFFEEB] border-2 border-dashed border-orange-100 flex flex-col items-center justify-center gap-3 p-6 text-center group-hover:bg-white group-hover:border-[#ED3C3844] transition-all">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📸</div>
                <div>
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">点击上传实拍图</p>
                  <p className="text-[9px] text-gray-300 font-bold mt-1">支持 JPG, PNG (5MB以内)</p>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={el => { fileInputRefs.current[item.id] = el; }}
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleFileChange(item.id, e)}
            />

            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
              {item.tag}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-black line-clamp-2 text-gray-800 leading-snug tracking-tight">{item.title}</h3>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm">
                  <img src={`https://i.pravatar.cc/150?u=${item.id}`} alt={item.author} />
                </div>
                <span className="text-[10px] text-gray-400 font-black">{item.author}</span>
              </div>
              <div className="flex items-center gap-1 text-[#ED3C38]">
                <span className="text-[10px] font-black italic">❤️ {item.likes}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
