import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { ArrowPathIcon, FolderIcon, TrashIcon } from "@heroicons/react/24/solid";
import capyLogo from './assets/Capy-removebg-preview.png';

import Navbar from './components/Navbar';
import KpiGrid from './components/KpiGrid';
import ChartsSection from './components/ChartsSection';
import UploadModal from './components/UploadModal';
import Login from './components/Login'; // <--- IMPORTAR LOGIN
import { useDashboardData } from './hooks/useDashboardData';
import CampaignSelector from './components/CampaignSelector'; // <--- 1. IMPORTAR

function App() {
  // --- 1. LÓGICA DE AUTENTICACIÓN ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Revisar si ya inició sesión antes
    const auth = localStorage.getItem('compipro_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('compipro_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('compipro_auth');
    setIsAuthenticated(false);
  };

  // --- 2. HOOKS Y ESTADOS DE DATOS ---
  // Solo cargamos datos si está autenticado
  const { data, loading, error, uploadFiles, refresh } = useDashboardData(); // Asume que refresh viene del hook
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('Todas');
  const [deleting, setDeleting] = useState(false);

  // --- 3. LÓGICA DE BORRADO ---
  const handleDeleteCampaign = async () => {
    if (selectedCampaign === 'Todas') return;
    if (!window.confirm(`¿Estás SEGURO de eliminar toda la carpeta "${selectedCampaign}"? Esta acción no se puede deshacer.`)) return;

    setDeleting(true);
    try {
        await axios.post('/api/delete_campaign', { campaign: selectedCampaign });
        alert(`Campaña ${selectedCampaign} eliminada.`);
        setSelectedCampaign('Todas');
        refresh(); // Recargar datos
    } catch (err) {
        alert("Error al eliminar campaña.");
    } finally {
        setDeleting(false);
    }
  };

  // --- 4. FILTRADO DE DATOS ---
  const filteredData = useMemo(() => {
    if (!data) return null;
    if (selectedCampaign === 'Todas') return data;

    const filteredChartData = data.chart_data.filter(item => item.campana === selectedCampaign);
    const filteredAudience = data.audience_data.filter(item => item.campana === selectedCampaign);

    const kpis = {
        gasto: filteredChartData.reduce((acc, curr) => acc + (curr.gasto || 0), 0),
        impresiones: filteredChartData.reduce((acc, curr) => acc + (curr.impresiones || 0), 0),
        conversiones: filteredChartData.reduce((acc, curr) => acc + (curr.conversiones || 0), 0),
        clics: filteredChartData.reduce((acc, curr) => acc + (curr.clics || 0), 0),
    };

    return { ...data, kpis, chart_data: filteredChartData, audience_data: filteredAudience };
  }, [data, selectedCampaign]);

  const campaigns = useMemo(() => {
    if (!data) return [];
    const allCampaigns = data.chart_data.map(d => d.campana || 'General');
    return ['Todas', ...new Set(allCampaigns)];
  }, [data]);

  const handleUpload = async (files, campaignName) => {
    await uploadFiles(files, campaignName);
    setIsUploadModalOpen(false);
    refresh(); // Asegura recarga
  };

  // --- RENDERIZADO CONDICIONAL ---
  
  // A. Si no está logueado, muestra Login
  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // B. Si está logueado, muestra la App
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900 relative">
      
      {(loading || deleting) && (
        <div className="fixed inset-0 bg-white/90 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
          <ArrowPathIcon className="w-16 h-16 animate-spin text-[#FE2C55] mb-4"/>
          <h2 className="text-2xl font-bold text-slate-800">{deleting ? "Eliminando..." : "Cargando Dashboard..."}</h2>
        </div>
      )}

      {isUploadModalOpen && (
          <UploadModal onUpload={handleUpload} onClose={() => setIsUploadModalOpen(false)} isOverlay={true} />
      )}

      <Navbar followers={data?.followers} onOpenUploadModal={() => setIsUploadModalOpen(true)} />
      
      {/* Botón Salir (Temporal o en el Navbar si prefieres) */}
      <button onClick={handleLogout} className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold z-50 hover:bg-black">Cerrar Sesión</button>

      <main className="max-w-[1600px] mx-auto mt-8 px-6">
        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">Error: {error}</div>}

        {/* SELECTOR DE CARPETAS Y ELIMINAR */}
{/* --- AQUÍ ESTÁ EL CAMBIO "CHEVERE" --- */}
        {data && (
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                
                {/* Usamos el nuevo componente */}
                <CampaignSelector 
                    campaigns={campaigns}
                    selected={selectedCampaign}
                    onSelect={(val) => setSelectedCampaign(val)}
                    onDelete={handleDeleteCampaign}
                />

                {/* Si quieres poner algo más a la derecha, como un resumen rápido */}
                <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400 font-bold uppercase">Última actualización</p>
                    <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString()}</p>
                </div>
            </div>
        )}

        {!loading && !data && !error && <UploadModal onUpload={handleUpload} isOverlay={false} />}

        {filteredData && (
            <>
                <KpiGrid kpis={filteredData.kpis} followersNow={filteredData.followers} />
               <ChartsSection 
                    chartData={filteredData.chart_data}      // Datos filtrados (para Evolución/Tablas)
                    fullChartData={data.chart_data}          // <--- NUEVO: Datos CRUDOS (para el Versus)
                    audienceData={filteredData.audience_data} 
                />
            </>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-200 py-8 bg-white text-center">
        <p className="flex items-center justify-center gap-2 font-bold text-slate-700">
          Desarrollado vía <img src={capyLogo} alt="Capy" className="w-10 h-10 hover:scale-110 transition-transform" /> por <span className="text-[#00C2CB]">Royser</span>
        </p>
      </footer>
    </div>
  );
}

export default App;