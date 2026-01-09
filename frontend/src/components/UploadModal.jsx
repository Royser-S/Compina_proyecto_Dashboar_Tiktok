import { useRef, useState } from 'react';
import { CloudArrowUpIcon, XMarkIcon, FolderIcon } from "@heroicons/react/24/solid";

export default function UploadModal({ onUpload, onClose, isOverlay }) {
  const fileInputRef = useRef(null);
  const [campaignName, setCampaignName] = useState("Campaña 1"); // Nombre por defecto

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onUpload(files, campaignName); // Enviamos el nombre de la carpeta
    }
  };

  return (
    <div className={`${isOverlay ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center' : 'flex flex-col items-center justify-center p-6 mt-10'}`}>
      
      <div className={`bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-center max-w-xl w-full relative transform transition-all ${isOverlay ? 'scale-100' : ''}`}>
        
        {/* Botón cerrar solo si es overlay */}
        {isOverlay && (
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <XMarkIcon className="w-6 h-6 text-slate-500"/>
            </button>
        )}
        
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png" className="h-12 mx-auto mb-4" alt="TikTok"/>
        
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Subir Reportes</h2>
        <p className="text-slate-500 mb-6">Organiza tus archivos en una carpeta.</p>

        {/* INPUT DE CARPETA / CAMPAÑA */}
        <div className="mb-6 text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FolderIcon className="w-5 h-5 text-[#FE2C55]"/> Nombre de la Carpeta (Campaña)
            </label>
            <input 
                type="text" 
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-cyan-50"
                placeholder="Ej: Navidad 2025"
            />
        </div>

        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#00C2CB] bg-cyan-50/10 hover:bg-cyan-50 rounded-2xl cursor-pointer transition-all hover:border-[#FE2C55] group">
          <div className="transform group-hover:scale-110 transition-transform duration-300">
            <CloudArrowUpIcon className="w-12 h-12 text-[#00C2CB] mb-3 mx-auto"/>
          </div>
          <span className="text-lg font-bold text-slate-700">Seleccionar Archivos Excel</span>
          <span className="text-xs text-slate-400 mt-1">Los archivos se guardarán en: <strong>{campaignName}</strong></span>
          
          <input 
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".xlsx,.csv" 
            ref={fileInputRef}
          />
        </label>
      </div>
    </div>
  );
}