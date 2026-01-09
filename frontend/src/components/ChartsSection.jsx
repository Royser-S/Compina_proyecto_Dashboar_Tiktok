import { useState, useMemo, useEffect } from 'react';
import CampaignSelector from './CampaignSelector'; // <--- AGREGAR ESTO ARRIBA
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  ChartBarIcon, TrophyIcon, UserGroupIcon, CalendarIcon, FunnelIcon, 
  PresentationChartLineIcon, PlusIcon, MinusIcon, EyeIcon, 
  ShoppingCartIcon, CurrencyDollarIcon, ChevronUpIcon, ChevronDownIcon,
  FolderIcon
} from "@heroicons/react/24/solid";

const COLORS = ['#FE2C55', '#00C2CB', '#111827', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

const moneyFormatter = (number) => `S/ ${Intl.NumberFormat('pe').format(Number(number || 0).toFixed(2))}`;
const numberFormatter = (number) => Intl.NumberFormat('pe').format(Number(number || 0).toFixed(0));

// --- COMPONENTE INTERNO: TARJETA DE EQUIPO (VERSUS) ---
// OJO: Ahora recibe "allData" para poder buscar en OTRAS campañas
// --- COMPONENTE INTERNO: TARJETA DE EQUIPO (VERSUS) ---
function VersusCard({ group, allData, color, onVideoSelect, idx }) {
    const [filterCampaign, setFilterCampaign] = useState('Todas');

    const campaigns = useMemo(() => {
        const camps = allData.map(d => d.campana || 'General');
        return ['Todas', ...new Set(camps)];
    }, [allData]);

    const availableVideos = useMemo(() => {
        let filteredData = allData;
        if (filterCampaign !== 'Todas') {
            filteredData = allData.filter(d => d.campana === filterCampaign);
        }
        return [...new Set(filteredData.map(item => item.nombre_anuncio))];
    }, [allData, filterCampaign]);

    const groupData = allData.filter(d => group.selectedVideos.includes(d.nombre_anuncio));
    const totalVentas = groupData.reduce((acc, curr) => acc + (curr.conversiones || 0), 0);
    const totalGasto = groupData.reduce((acc, curr) => acc + (curr.gasto || 0), 0);
    const totalClics = groupData.reduce((acc, curr) => acc + (curr.clics || 0), 0);
    const cpa = totalVentas > 0 ? totalGasto / totalVentas : 0;

    return (
        <div className="bg-white rounded-3xl p-6 border-t-[8px] shadow-lg flex flex-col h-full relative z-0" style={{borderColor: color}}>
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-4">
                <span className="font-black text-lg uppercase tracking-wider px-3 py-1 rounded-lg text-white shadow-sm" style={{backgroundColor: color}}>
                    Equipo {idx + 1}
                </span>
                <TrophyIcon className="w-8 h-8 text-yellow-400 drop-shadow-sm"/>
            </div>

            {/* --- AQUÍ ESTÁ EL CAMBIO: Selector Bonito --- */}
            <div className="mb-4 relative z-20"> 
                {/* z-20 para que el menú flote por encima de los KPIs */}
                <CampaignSelector 
                    campaigns={campaigns}
                    selected={filterCampaign}
                    onSelect={setFilterCampaign}
                    // NO pasamos onDelete, así que no sale el botón de borrar. ¡Perfecto!
                />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 mb-4 relative z-0">
                <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Ventas</div>
                    <div className="text-2xl font-black text-slate-800">{totalVentas}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Clics</div>
                    <div className="text-xl font-bold text-blue-600">{numberFormatter(totalClics)}</div>
                </div>
                <div className="col-span-2 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100 flex justify-between px-4 items-center">
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Gasto</div>
                        <div className="font-bold text-slate-700">{moneyFormatter(totalGasto)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">CPA</div>
                        <div className="font-bold text-[#FE2C55]">{moneyFormatter(cpa)}</div>
                    </div>
                </div>
            </div>

            {/* Lista de Videos */}
            <div className="mb-2 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Seleccionar Videos ({filterCampaign}):
            </div>
            <div className="flex-1 overflow-y-auto max-h-60 bg-slate-50 rounded-xl border border-slate-200 p-2 custom-scrollbar">
                {availableVideos.length > 0 ? (
                    availableVideos.map(video => (
                        <label key={video} className="flex items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border-b border-slate-100 last:border-0 group">
                            <input 
                                type="checkbox" 
                                checked={group.selectedVideos.includes(video)} 
                                onChange={() => onVideoSelect(group.id, video)} 
                                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                            />
                            <span className={`ml-3 text-xs leading-snug transition-colors ${group.selectedVideos.includes(video) ? 'font-bold text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                {video}
                            </span>
                        </label>
                    ))
                ) : (
                    <p className="text-center text-xs text-slate-400 py-4">No hay videos disponibles.</p>
                )}
            </div>
        </div>
    );
}

function SortableHeader({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey;
  return (
    <th className="p-4 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none group" onClick={() => onSort(sortKey)}>
      <div className="flex items-center justify-end gap-1">{label} <div className="flex flex-col"><ChevronUpIcon className={`w-3 h-3 ${isActive && currentSort.direction === 'ascending' ? 'text-slate-800' : 'text-slate-300'}`}/> <ChevronDownIcon className={`w-3 h-3 -mt-1 ${isActive && currentSort.direction === 'descending' ? 'text-slate-800' : 'text-slate-300'}`}/></div></div>
    </th>
  );
}

function TabButton({ active, onClick, children, icon }) {
    return <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${active ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>{icon} {children}</button>;
}

// --- COMPONENTE PRINCIPAL (ACTUALIZADO) ---
export default function ChartsSection({ chartData = [], fullChartData = [], audienceData = [] }) {
  const [activeTab, setActiveTab] = useState('evolucion');
  const [metricToChart, setMetricToChart] = useState('conversiones');
  
  const [selectedVideosChart, setSelectedVideosChart] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'conversiones', direction: 'descending' });

  const [campaignGroups, setCampaignGroups] = useState([
    { id: 1, selectedVideos: [] },
    { id: 2, selectedVideos: [] }
  ]);

  // Si no llega fullChartData (porque es la primera carga), usamos chartData
  const safeFullData = fullChartData.length > 0 ? fullChartData : chartData;

  const uniqueVideos = useMemo(() => [...new Set(chartData.map(item => item.nombre_anuncio))], [chartData]);

  useEffect(() => {
     if (selectedVideosChart.length === 0 && uniqueVideos.length > 0) setSelectedVideosChart(uniqueVideos);
  }, [uniqueVideos]);

  useEffect(() => {
     if (audienceData && audienceData.length > 0) {
        const allAges = [...new Set(audienceData.map(item => item.edad))].filter(Boolean).sort();
        setSelectedAges(prev => prev.length === 0 ? allAges : prev);
     }
  }, [audienceData]);

  // --- DATOS EVOLUCIÓN (Siguen usando 'chartData' para respetar el filtro global) ---
  const evolutionChartData = useMemo(() => {
    const dates = [...new Set(chartData.map(item => item.fecha))].sort();
    return dates.map(date => {
      const entry = { fecha: date };
      uniqueVideos.forEach(video => {
        const record = chartData.find(d => d.fecha === date && d.nombre_anuncio === video);
        entry[video] = record ? (record[metricToChart] || 0) : 0;
      });
      return entry;
    });
  }, [chartData, uniqueVideos, metricToChart]);

  // --- DATOS TABLA (Respetan filtro global) ---
  const tableData = useMemo(() => {
    const aggregated = uniqueVideos.map(video => {
      const videoItems = chartData.filter(item => item.nombre_anuncio === video);
      const imp = videoItems.reduce((sum, item) => sum + (item.impresiones || 0), 0);
      const conv = videoItems.reduce((sum, item) => sum + (item.conversiones || 0), 0);
      const cost = videoItems.reduce((sum, item) => sum + (item.gasto || 0), 0);
      const clics = videoItems.reduce((sum, item) => sum + (item.clics || 0), 0);
      
      return {
        nombre_anuncio: video,
        impresiones: imp,
        conversiones: conv,
        gasto: cost,
        clics: clics,
        cpa: conv > 0 ? cost / conv : 0,
        ctr: imp > 0 ? (clics / imp) * 100 : 0,
        cpc: clics > 0 ? cost / clics : 0,
      };
    });

    if (sortConfig.key) {
      aggregated.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return aggregated;
  }, [chartData, uniqueVideos, sortConfig]);

  // --- DATOS COMPARADOR (¡AHORA USAN safeFullData!) ---
  const comparisonChartData = useMemo(() => {
    // Usamos TODAS las fechas disponibles en el historial completo
    const dates = [...new Set(safeFullData.map(item => item.fecha))].sort();
    
    return dates.map(date => {
      const entry = { fecha: date };
      campaignGroups.forEach((group, idx) => {
        // Buscamos en TODOS los datos, no solo en los filtrados
        const groupData = safeFullData.filter(d => d.fecha === date && group.selectedVideos.includes(d.nombre_anuncio));
        const total = groupData.reduce((acc, curr) => acc + (curr[metricToChart] || 0), 0);
        entry[`Equipo ${idx + 1}`] = total;
      });
      return entry;
    });
  }, [safeFullData, campaignGroups, metricToChart]);

  // --- AUDIENCIA (Respeta filtro global) ---
  const filteredAudienceData = useMemo(() => {
    const filtered = audienceData.filter(item => selectedAges.includes(item.edad));
    const grouped = filtered.reduce((acc, curr) => {
      const existing = acc.find(i => i.edad === curr.edad);
      if (existing) {
        existing.impresiones = (existing.impresiones || 0) + (curr.impresiones || 0);
        existing.conversiones = (existing.conversiones || 0) + (curr.conversiones || 0);
        existing.gasto = (existing.gasto || 0) + (curr.gasto || 0);
      } else {
        acc.push({ 
            edad: curr.edad,
            impresiones: curr.impresiones || 0,
            conversiones: curr.conversiones || 0,
            gasto: curr.gasto || 0
        });
      }
      return acc;
    }, []);
    return grouped.sort((a, b) => a.edad.localeCompare(b.edad));
  }, [audienceData, selectedAges]);


  // HANDLERS
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };
  
  const toggleVideoFilter = (v) => setSelectedVideosChart(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v]);
  const toggleAgeFilter = (a) => setSelectedAges(prev => prev.includes(a) ? prev.filter(i => i !== a) : [...prev, a]);
  
  const addCampaign = () => { if (campaignGroups.length < 4) setCampaignGroups([...campaignGroups, { id: Date.now(), selectedVideos: [] }]); };
  const removeCampaign = () => { if (campaignGroups.length > 2) setCampaignGroups(campaignGroups.slice(0, -1)); };
  
  const handleCampaignVideoSelect = (groupId, videoName) => {
    setCampaignGroups(groups => groups.map(g => g.id === groupId ? { ...g, selectedVideos: g.selectedVideos.includes(videoName) ? g.selectedVideos.filter(v => v !== videoName) : [...g.selectedVideos, videoName] } : g));
  };


  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
<div className="flex border-b border-slate-100 p-2 bg-slate-50 overflow-x-auto whitespace-nowrap custom-scrollbar">            <TabButton active={activeTab === 'evolucion'} onClick={() => setActiveTab('evolucion')} icon={<ChartBarIcon className="w-5 h-5"/>}>Evolución & Tabla</TabButton>
            <TabButton active={activeTab === 'comparador'} onClick={() => setActiveTab('comparador')} icon={<TrophyIcon className="w-5 h-5"/>}>Comparador Versus</TabButton>
            <TabButton active={activeTab === 'audiencia'} onClick={() => setActiveTab('audiencia')} icon={<UserGroupIcon className="w-5 h-5"/>}>Audiencia (Edad)</TabButton>
        </div>

        <div className="p-4 md:p-8">
            {/* 1. EVOLUCIÓN (Se mantiene igual) */}
            {activeTab === 'evolucion' && (
              <div className="space-y-10">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex flex-col xl:flex-row justify-between items-start mb-6 gap-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-[#00C2CB]"/> Evolución Diaria
                      </h3>
                      <div className="flex gap-2 mt-4 bg-slate-100 p-1 rounded-lg w-fit">
                          {['conversiones', 'clics', 'gasto', 'impresiones'].map(m => (
                            <button key={m} onClick={() => setMetricToChart(m)} className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${metricToChart === m ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>{m}</button>
                          ))}
                      </div>
                    </div>
                    
<div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full">                      
    <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><FunnelIcon className="w-3 h-3"/> Filtrar Videos (De la carpeta actual):</div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {uniqueVideos.map((video, idx) => (
                          <button key={video} onClick={() => toggleVideoFilter(video)} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border ${selectedVideosChart.includes(video) ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                            <span className="w-2 h-2 rounded-full inline-block mr-1" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>{video}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="h-[300px] md:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        {uniqueVideos.map((video, idx) => (
                          selectedVideosChart.includes(video) && (
                            <Line key={video} type="monotone" dataKey={video} stroke={COLORS[idx % COLORS.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                          )
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* TABLA ... */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-slate-50"><h3 className="text-xl font-extrabold text-slate-900">📊 Tabla Detallada</h3></div>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left min-w-[600px]">
                      <thead className="bg-white text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                        <tr>
                          <th className="p-4">Video</th>
                          <SortableHeader label="Impresiones" sortKey="impresiones" currentSort={sortConfig} onSort={requestSort} />
                          <SortableHeader label="Clics" sortKey="clics" currentSort={sortConfig} onSort={requestSort} />
                          <SortableHeader label="CTR %" sortKey="ctr" currentSort={sortConfig} onSort={requestSort} />
                          <SortableHeader label="CPC (S/)" sortKey="cpc" currentSort={sortConfig} onSort={requestSort} />
                          <SortableHeader label="Ventas" sortKey="conversiones" currentSort={sortConfig} onSort={requestSort} />
                          <SortableHeader label="Gasto" sortKey="gasto" currentSort={sortConfig} onSort={requestSort} />
                          <SortableHeader label="CPA" sortKey="cpa" currentSort={sortConfig} onSort={requestSort} />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tableData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50 transition-colors">
                            <td className="p-4 font-bold text-slate-700">{row.nombre_anuncio}</td>
                            <td className="p-4 text-right text-slate-500">{numberFormatter(row.impresiones)}</td>
                            <td className="p-4 text-right text-slate-600 font-semibold">{numberFormatter(row.clics)}</td>
                            <td className="p-4 text-right"><span className={`px-2 py-1 rounded-md font-bold text-xs ${row.ctr > 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{row.ctr.toFixed(2)}%</span></td>
                            <td className="p-4 text-right text-slate-600">{moneyFormatter(row.cpc)}</td>
                            <td className="p-4 text-right font-bold text-emerald-600 bg-emerald-50/30 rounded-lg">{row.conversiones}</td>
                            <td className="p-4 text-right text-slate-700">{moneyFormatter(row.gasto)}</td>
                            <td className="p-4 text-right font-bold text-[#FE2C55]">{moneyFormatter(row.cpa)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. COMPARADOR VERSUS (ACTUALIZADO PARA USAR allData) */}
            {activeTab === 'comparador' && (
              <div className="space-y-8">
                <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center flex-wrap gap-4">
                  <div>
                      <h3 className="text-2xl font-black text-white">Batalla de Campañas</h3>
                      <p className="text-gray-400 text-sm">Elige videos de diferentes campañas en cada equipo.</p>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={addCampaign} disabled={campaignGroups.length >= 4} className="flex items-center gap-2 bg-[#00C2CB] text-black px-4 py-2 rounded-xl font-bold hover:bg-cyan-300 disabled:opacity-50 transition-all text-sm"><PlusIcon className="w-4 h-4"/> Equipo</button>
                      <button onClick={removeCampaign} disabled={campaignGroups.length <= 2} className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-4 py-2 rounded-xl font-bold hover:bg-white/20 disabled:opacity-50 transition-all text-sm"><MinusIcon className="w-4 h-4"/> Quitar</button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                     <h4 className="font-bold text-slate-800 flex items-center gap-2"><PresentationChartLineIcon className="w-5 h-5 text-indigo-500"/> Tendencia de Equipos</h4>
                     <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                         {['conversiones', 'clics', 'gasto'].map(m => (
                           <button key={m} onClick={() => setMetricToChart(m)} className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${metricToChart === m ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>{m}</button>
                         ))}
                      </div>
                   </div>
                   <div className="h-[300px] md:h-[400px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={comparisonChartData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="fecha" tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af"/>
                         <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af"/>
                         <Tooltip contentStyle={{borderRadius:'10px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                         <Legend />
                         {campaignGroups.map((group, idx) => (
                           <Area key={idx} type="monotone" dataKey={`Equipo ${idx + 1}`} stackId="1" stroke={COLORS[idx]} fill={COLORS[idx]} fillOpacity={0.6} />
                         ))}
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                {/* AQUÍ PASAMOS safeFullData (ALL DATA) AL VERSUS CARD */}
                <div className={`grid gap-6 ${campaignGroups.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'}`}>
                  {campaignGroups.map((group, idx) => (
                      <VersusCard 
                        key={group.id}
                        idx={idx}
                        group={group}
                        allData={safeFullData} // <--- ¡AQUÍ ESTÁ LA SOLUCIÓN!
                        chartData={safeFullData} 
                        color={COLORS[idx % COLORS.length]}
                        onVideoSelect={handleCampaignVideoSelect}
                      />
                  ))}
                </div>
              </div>
            )}

            {/* 3. AUDIENCIA (Se mantiene igual) */}
            {activeTab === 'audiencia' && (
              <div className="space-y-8">
                {/* ... (código audiencia igual que antes) ... */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h3 className="text-xl font-extrabold text-slate-900">Demografía (Edad)</h3>
                    {audienceData.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {[...new Set(audienceData.map(d => d.edad))].filter(Boolean).sort().map(age => (
                            <button key={age} onClick={() => toggleAgeFilter(age)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${selectedAges.includes(age) ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{age}</button>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-red-500 font-bold">No hay datos de audiencia cargados.</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 text-center flex justify-center items-center gap-2"><EyeIcon className="w-5 h-5 text-purple-500"/> Vistas</h4>
                      <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={filteredAudienceData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="edad" tick={{fontSize: 12, fontWeight: 'bold'}} /><YAxis hide /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} formatter={(val) => numberFormatter(val)} /><Bar dataKey="impresiones" fill="#8b5cf6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 text-center flex justify-center items-center gap-2"><ShoppingCartIcon className="w-5 h-5 text-cyan-500"/> Ventas</h4>
                      <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={filteredAudienceData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="edad" tick={{fontSize: 12, fontWeight: 'bold'}} /><YAxis hide /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} /><Bar dataKey="conversiones" fill="#00C2CB" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 text-center flex justify-center items-center gap-2"><CurrencyDollarIcon className="w-5 h-5 text-red-500"/> Inversión</h4>
                      <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={filteredAudienceData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="edad" tick={{fontSize: 12, fontWeight: 'bold'}} /><YAxis hide /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} formatter={(val) => moneyFormatter(val)}/><Bar dataKey="gasto" fill="#FE2C55" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
    </div>
  );
}