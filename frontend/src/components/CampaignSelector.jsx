import { useState, useRef, useEffect } from "react";
import { 
  FolderIcon, 
  FolderOpenIcon, 
  ChevronDownIcon, 
  CheckIcon, 
  TrashIcon 
} from "@heroicons/react/24/solid";

export default function CampaignSelector({ campaigns, selected, onSelect, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (camp) => {
    onSelect(camp);
    setIsOpen(false);
  };

  return (
    // CAMBIO 1: Quitamos 'md:w-72' para que se adapte al ancho de la tarjeta
    <div className="relative w-full" ref={containerRef}>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-200 bg-white shadow-sm hover:shadow-md
          ${isOpen 
            ? 'border-[#00C2CB] ring-2 ring-cyan-100 ring-opacity-50' 
            : 'border-slate-200 hover:border-slate-300'
          }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-cyan-50' : 'bg-slate-100'}`}>
            {isOpen ? <FolderOpenIcon className="w-5 h-5 text-[#00C2CB]" /> : <FolderIcon className="w-5 h-5 text-slate-500" />}
          </div>
          <div className="flex flex-col items-start truncate">
            {/* Texto más pequeño para adaptarse a tarjetas */}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaña</span>
            <span className="font-bold text-slate-800 truncate block w-full text-left text-sm">{selected}</span>
          </div>
        </div>
        
        <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00C2CB]' : ''}`} />
      </button>

      <div className={`absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {campaigns.map((camp) => (
                <div key={camp} onClick={() => handleSelect(camp)} className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${selected === camp ? 'bg-cyan-50' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                        <FolderIcon className={`w-4 h-4 ${selected === camp ? 'text-[#00C2CB]' : 'text-slate-300 group-hover:text-slate-400'}`}/>
                        <span className={`font-bold text-sm ${selected === camp ? 'text-[#00C2CB]' : 'text-slate-600'}`}>{camp}</span>
                    </div>
                    {selected === camp && <CheckIcon className="w-4 h-4 text-[#00C2CB]"/>}
                </div>
            ))}
        </div>

        {/* CAMBIO 2: Solo mostramos el botón eliminar SI nos pasaron la función onDelete */}
        {onDelete && selected !== 'Todas' && (
            <div className="border-t border-slate-100 p-2 bg-slate-50">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                        setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-red-500 hover:bg-red-100 font-bold text-xs transition-colors"
                >
                    <TrashIcon className="w-3 h-3"/> Eliminar
                </button>
            </div>
        )}
      </div>
    </div>
  );
}