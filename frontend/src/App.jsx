import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  CloudArrowUpIcon, UserGroupIcon, CurrencyDollarIcon, 
  ShoppingCartIcon, ArrowPathIcon, PlusIcon, MinusIcon, 
  TrophyIcon, ChartBarIcon, CalendarIcon, FunnelIcon, ChevronUpIcon, ChevronDownIcon,
  CursorArrowRaysIcon, PresentationChartLineIcon, ArrowUpTrayIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  EyeIcon // Icono para Vistas
} from "@heroicons/react/24/solid";

const COLORS = ['#FE2C55', '#00C2CB', '#111827', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('evolucion');
  const fileInputRef = useRef(null);

  const [followersBase, setFollowersBase] = useState(10000); 

  const [selectedVideosChart, setSelectedVideosChart] = useState([]); 
  const [selectedAges, setSelectedAges] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'conversiones', direction: 'descending' });
  const [metricToChart, setMetricToChart] = useState('conversiones');

  const [campaignGroups, setCampaignGroups] = useState([
    { id: 1, selectedVideos: [] },
    { id: 2, selectedVideos: [] }
  ]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    setError(null);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('files[]', files[i]);
    formData.append('username', '@compipro');

    try {
      // Usamos la ruta relativa para que funcione el Proxy y Vercel
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const responseData = response.data;
      setData(responseData);

      // Auto-seleccionar todos los videos al inicio
      const allVideos = [...new Set(responseData.chart_data.map(item => item.nombre_anuncio))];
      if (selectedVideosChart.length === 0 || selectedVideosChart.length !== allVideos.length) {
         setSelectedVideosChart(allVideos);
      }
      
      // Auto-seleccionar TODAS las edades al inicio (para vista "general")
      if (responseData.audience_data) {
        const allAges = [...new Set(responseData.audience_data.map(item => item.Edad))].sort();
        setSelectedAges(allAges);
      }
    } catch (err) {
      console.error(err);
      setError("Error al procesar. Asegúrate de seleccionar archivos válidos y que Python esté corriendo.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const { 
    kpis = { gasto: 0, conversiones: 0, clics: 0, impresiones: 0 }, 
    followers, 
    chart_data: chartData = [], 
    audience_data: audienceData = [] 
  } = data || {};
  
  const followersNow = followers || 0;
  const growth = followersNow - followersBase;
  const growthPct = followersBase > 0 ? (growth / followersBase) * 100 : 0;

  const uniqueVideos = useMemo(() => [...new Set(chartData.map(item => item.nombre_anuncio))], [chartData]);

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

  const comparisonChartData = useMemo(() => {
    const dates = [...new Set(chartData.map(item => item.fecha))].sort();
    return dates.map(date => {
      const entry = { fecha: date };
      campaignGroups.forEach((group, idx) => {
        const groupData = chartData.filter(d => d.fecha === date && group.selectedVideos.includes(d.nombre_anuncio));
        const total = groupData.reduce((acc, curr) => acc + (curr[metricToChart] || 0), 0);
        entry[`Campaña ${idx + 1}`] = total;
      });
      return entry;
    });
  }, [chartData, campaignGroups, metricToChart]);

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

  // Agrupamos la data de audiencia para que si hay varias filas con la misma edad, se sumen
  const filteredAudienceData = useMemo(() => {
    const filtered = audienceData.filter(item => selectedAges.includes(item.Edad));
    
    // Agrupar por edad (sumar valores si hay duplicados)
    const grouped = filtered.reduce((acc, curr) => {
      const existing = acc.find(i => i.Edad === curr.Edad);
      if (existing) {
        existing.Impresiones += (curr.Impresiones || 0);
        existing.Conversiones += (curr.Conversiones || 0);
        existing.Coste += (curr.Coste || 0);
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

    // Ordenar por Edad (asumiendo formato "18-24", "25-34", etc.)
    return grouped.sort((a, b) => a.Edad.localeCompare(b.Edad));
  }, [audienceData, selectedAges]);

  const moneyFormatter = (number) => `S/ ${Intl.NumberFormat('pe').format(Number(number || 0).toFixed(2))}`;
  const numberFormatter = (number) => Intl.NumberFormat('pe').format(Number(number || 0).toFixed(0));

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };
  const toggleVideoFilter = (v) => setSelectedVideosChart(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v]);
  const toggleAgeFilter = (a) => setSelectedAges(prev => prev.includes(a) ? prev.filter(i => i !== a) : [...prev, a]);
  const addCampaign = () => { if (campaignGroups.length < 6) setCampaignGroups([...campaignGroups, { id: Date.now(), selectedVideos: [] }]); };
  const removeCampaign = () => { if (campaignGroups.length > 2) setCampaignGroups(campaignGroups.slice(0, -1)); };
  const handleCampaignVideoSelect = (groupId, videoName) => {
    setCampaignGroups(groups => groups.map(g => g.id === groupId ? { ...g, selectedVideos: g.selectedVideos.includes(videoName) ? g.selectedVideos.filter(v => v !== videoName) : [...g.selectedVideos, videoName] } : g));
  };

  // --- VISTA INICIAL ---
  if (!data && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center max-w-2xl w-full">
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png" className="h-16 mx-auto mb-6" alt="TikTok"/>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Compipro <span className="text-[#FE2C55]">Analytics</span></h1>
          <p className="text-slate-500 mb-10 text-lg">Sube tus reportes para comenzar.</p>
          <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#00C2CB] bg-cyan-50/10 hover:bg-cyan-50 rounded-2xl cursor-pointer transition-all hover:border-[#FE2C55]">
            <CloudArrowUpIcon className="w-16 h-16 text-[#00C2CB] mb-4"/>
            <span className="text-xl font-bold text-slate-700">Clic para subir Excel</span>
            <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".xlsx,.csv" ref={fileInputRef}/>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900 relative">
      
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
          <ArrowPathIcon className="w-16 h-16 animate-spin text-[#FE2C55] mb-4"/>
          <h2 className="text-2xl font-bold text-slate-800">Actualizando Dashboard...</h2>
          <p className="text-slate-500">Procesando nuevos archivos</p>
        </div>
      )}

      <nav className="bg-black text-white sticky top-0 z-50 shadow-2xl border-b-4 border-[#00C2CB]">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1.5 rounded-lg"><img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png" className="h-6" alt="Logo"/></div>
            <span className="font-black text-2xl tracking-tight">COMPIPRO <span className="text-[#00C2CB]">ADS</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-slate-900 px-5 py-2 rounded-full border border-slate-700">
              <UserGroupIcon className="w-5 h-5 text-[#00C2CB]"/>
              <span className="font-bold">{followers ? followers.toLocaleString() : '0'} Seguidores</span>
            </div>
            
            <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".xlsx,.csv" ref={fileInputRef}/>
            <button 
              onClick={triggerFileUpload} 
              className="flex items-center gap-2 bg-[#FE2C55] hover:bg-[#d92045] text-white px-6 py-2 rounded-full font-bold transition-colors shadow-lg active:scale-95 transform"
            >
              <ArrowUpTrayIcon className="w-5 h-5" /> 
              {data ? "Subir / Agregar Más" : "Cargar Datos"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto mt-10 px-6 space-y-10">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
                <UserGroupIcon className="w-8 h-8 text-indigo-600"/>
                <label className="text-sm font-bold text-slate-600">Seguidores Base (Ayer/Inicio de Campaña):</label>
                <input
                    type="number"
                    value={followersBase}
                    onChange={(e) => setFollowersBase(Number(e.target.value))}
                    className="border border-slate-300 p-2 rounded-lg font-mono text-lg focus:border-indigo-500 w-40"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard icon={<CurrencyDollarIcon className="w-8 h-8 text-[#FE2C55]" />} title="Inversión" value={moneyFormatter(kpis.gasto)} subtitle="Gasto Total" bg="bg-red-50" />
          <KpiCard icon={<ShoppingCartIcon className="w-8 h-8 text-[#00C2CB]" />} title="Conversiones" value={kpis.conversiones.toLocaleString()} subtitle="Ventas Totales" bg="bg-cyan-50" />
          <KpiCard icon={<CursorArrowRaysIcon className="w-8 h-8 text-blue-600" />} title="Clics Totales" value={(kpis.clics || 0).toLocaleString()} subtitle="Tráfico Generado" bg="bg-blue-50" />
          
          <KpiCard 
            icon={<UserGroupIcon className="w-8 h-8 text-indigo-600" />} 
            title="Seguidores HOY" 
            value={followersNow.toLocaleString()} 
            subtitle={`Crecimiento: ${growth.toLocaleString()} (${growthPct.toFixed(1)}%)`}
            bg="bg-indigo-50"
            isGrowth={true}
            growthValue={growth}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100 p-2 bg-slate-50">
            <TabButton active={activeTab === 'evolucion'} onClick={() => setActiveTab('evolucion')} icon={<ChartBarIcon className="w-5 h-5"/>}>Evolución & Tabla</TabButton>
            <TabButton active={activeTab === 'comparador'} onClick={() => setActiveTab('comparador')} icon={<TrophyIcon className="w-5 h-5"/>}>Comparador Versus</TabButton>
            <TabButton active={activeTab === 'audiencia'} onClick={() => setActiveTab('audiencia')} icon={<UserGroupIcon className="w-5 h-5"/>}>Audiencia (Edad)</TabButton>
          </div>

          <div className="p-8">
            
            {activeTab === 'evolucion' && (
              <div className="space-y-10">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex flex-col xl:flex-row justify-between items-start mb-6 gap-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-[#00C2CB]"/> Evolución Diaria
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">Analiza el rendimiento en el tiempo.</p>
                      
                      <div className="flex gap-2 mt-4 bg-slate-100 p-1 rounded-lg w-fit">
                          {['conversiones', 'clics', 'gasto', 'impresiones'].map(m => (
                            <button key={m} onClick={() => setMetricToChart(m)} className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${metricToChart === m ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>{m}</button>
                          ))}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full xl:max-w-2xl">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><FunnelIcon className="w-3 h-3"/> Filtrar Videos:</div>
                      <div className="flex flex-wrap gap-2">
                        {uniqueVideos.map((video, idx) => (
                          <button key={video} onClick={() => toggleVideoFilter(video)} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border ${selectedVideosChart.includes(video) ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                            <span className="w-2 h-2 rounded-full inline-block mr-1" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>{video}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: '600' }}/>
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

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-slate-50"><h3 className="text-xl font-extrabold text-slate-900">📊 Tabla Detallada</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
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

            {activeTab === 'comparador' && (
              <div className="space-y-8">
                <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center">
                  <div><h3 className="text-2xl font-black text-white">Batalla de Campañas</h3><p className="text-gray-400">Analiza el rendimiento global.</p></div>
                  <div className="flex gap-3"><button onClick={addCampaign} disabled={campaignGroups.length >= 5} className="flex items-center gap-2 bg-[#00C2CB] text-black px-5 py-2.5 rounded-xl font-bold hover:bg-cyan-300 disabled:opacity-50 transition-all"><PlusIcon className="w-5 h-5"/> Agregar</button><button onClick={removeCampaign} disabled={campaignGroups.length <= 2} className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold hover:bg-white/20 disabled:opacity-50 transition-all"><MinusIcon className="w-5 h-5"/> Quitar</button></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                     <h4 className="font-bold text-slate-800 flex items-center gap-2"><PresentationChartLineIcon className="w-5 h-5 text-indigo-500"/> Evolución Comparada</h4>
                     <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                         {['conversiones', 'clics', 'gasto'].map(m => (
                           <button key={m} onClick={() => setMetricToChart(m)} className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${metricToChart === m ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>{m}</button>
                         ))}
                      </div>
                   </div>
                   <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={comparisonChartData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="fecha" tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af"/>
                         <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af"/>
                         <Tooltip contentStyle={{borderRadius:'10px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                         <Legend />
                         {campaignGroups.map((group, idx) => (
                           <Area key={idx} type="monotone" dataKey={`Campaña ${idx + 1}`} stackId="1" stroke={COLORS[idx]} fill={COLORS[idx]} fillOpacity={0.6} />
                         ))}
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                <div className={`grid gap-6 ${campaignGroups.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                  {campaignGroups.map((group, idx) => {
                    const groupData = chartData.filter(d => group.selectedVideos.includes(d.nombre_anuncio));
                    const totalVentas = groupData.reduce((acc, curr) => acc + (curr.conversiones || 0), 0);
                    const totalGasto = groupData.reduce((acc, curr) => acc + (curr.gasto || 0), 0);
                    const totalClics = groupData.reduce((acc, curr) => acc + (curr.clics || 0), 0);
                    const cpa = totalVentas > 0 ? totalGasto / totalVentas : 0;
                    const color = COLORS[idx % COLORS.length];
                    return (
                      <div key={group.id} className="bg-white rounded-3xl p-6 border-t-[8px] shadow-lg flex flex-col h-full" style={{borderColor: color}}>
                        <div className="flex justify-between items-center mb-6"><span className="font-black text-lg uppercase tracking-wider px-3 py-1 rounded-lg text-white" style={{backgroundColor: color}}>Campaña {idx + 1}</span><TrophyIcon className="w-8 h-8 text-yellow-400"/></div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100"><div className="text-xs font-bold text-slate-400 uppercase">Ventas</div><div className="text-3xl font-black text-slate-800">{totalVentas}</div></div>
                          <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100"><div className="text-xs font-bold text-slate-400 uppercase">Clics</div><div className="text-xl font-bold text-blue-600">{numberFormatter(totalClics)}</div></div>
                          <div className="col-span-2 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100 flex justify-between px-8"><div className="text-left"><div className="text-xs font-bold text-slate-400 uppercase">Gasto</div><div className="font-bold text-slate-700">{moneyFormatter(totalGasto)}</div></div><div className="text-right"><div className="text-xs font-bold text-slate-400 uppercase">CPA</div><div className="font-bold text-[#FE2C55]">{moneyFormatter(cpa)}</div></div></div>
                        </div>
                        <div className="mb-2 font-bold text-sm text-slate-400 uppercase">Seleccionar Videos:</div>
                        <div className="flex-1 overflow-y-auto max-h-60 bg-slate-50 rounded-xl border border-slate-200 p-2 custom-scrollbar">
                          {uniqueVideos.map(video => (
                            <label key={video} className="flex items-center p-3 hover:bg-white rounded-lg cursor-pointer transition-colors border-b border-slate-100 last:border-0"><input type="checkbox" checked={group.selectedVideos.includes(video)} onChange={() => handleCampaignVideoSelect(group.id, video)} className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"/><span className={`ml-3 text-sm ${group.selectedVideos.includes(video) ? 'font-bold text-slate-900' : 'text-slate-500'}`}>{video}</span></label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'audiencia' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h3 className="text-xl font-extrabold text-slate-900">Demografía (Edad)</h3>
                    {/* Botones de filtro por si se quiere ver uno especifico, pero por defecto salen todos */}
                    <div className="flex flex-wrap gap-2">
                      {audienceData.map(d => d.Edad).filter((v, i, a) => a.indexOf(v) === i).sort().map(age => (
                        <button key={age} onClick={() => toggleAgeFilter(age)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${selectedAges.includes(age) ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{age}</button>
                      ))}
                    </div>
                  </div>
                  
                  {/* GRID DE 3 GRÁFICAS GENERALES */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Gráfico 1: VISTAS (IMPRESIONES) - NUEVO */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 text-center flex justify-center items-center gap-2">
                        <EyeIcon className="w-5 h-5 text-purple-500"/> Vistas (Impresiones)
                      </h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredAudienceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="Edad" tick={{fontSize: 12, fontWeight: 'bold'}} />
                            <YAxis hide />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} formatter={(val) => numberFormatter(val)} />
                            <Bar dataKey="Impresiones" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Gráfico 2: VENTAS (CONVERSIONES) */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 text-center flex justify-center items-center gap-2">
                         <ShoppingCartIcon className="w-5 h-5 text-cyan-500"/> Ventas
                      </h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredAudienceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="Edad" tick={{fontSize: 12, fontWeight: 'bold'}} />
                            <YAxis hide />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="Conversiones" fill="#00C2CB" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Gráfico 3: GASTO (INVERSIÓN) */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 text-center flex justify-center items-center gap-2">
                         <CurrencyDollarIcon className="w-5 h-5 text-red-500"/> Inversión
                      </h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredAudienceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="Edad" tick={{fontSize: 12, fontWeight: 'bold'}} />
                            <YAxis hide />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} formatter={(val) => moneyFormatter(val)}/>
                            <Bar dataKey="Coste" fill="#FE2C55" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ icon, title, value, subtitle, bg, isGrowth, growthValue }) {
  const isPositive = growthValue > 0;
  const growthColor = isPositive ? 'text-emerald-600' : growthValue < 0 ? 'text-red-600' : 'text-slate-600';
  const GrowthIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1 group-hover:scale-105 transition-transform">{value}</h3>
            
            {isGrowth && (
                <div className={`flex items-center gap-1 text-sm font-bold ${growthColor}`}>
                    <GrowthIcon className="w-4 h-4" />
                    <p>{subtitle}</p>
                </div>
            )}
            {!isGrowth && <p className="text-xs font-medium text-slate-500">{subtitle}</p>}

        </div>
        <div className={`p-4 rounded-2xl ${bg}`}>{icon}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children, icon }) {
  return <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${active ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>{icon} {children}</button>;
}

function SortableHeader({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey;
  return (
    <th className="p-4 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none group" onClick={() => onSort(sortKey)}>
      <div className="flex items-center justify-end gap-1">{label} <div className="flex flex-col"><ChevronUpIcon className={`w-3 h-3 ${isActive && currentSort.direction === 'ascending' ? 'text-slate-800' : 'text-slate-300'}`}/> <ChevronDownIcon className={`w-3 h-3 -mt-1 ${isActive && currentSort.direction === 'descending' ? 'text-slate-800' : 'text-slate-300'}`}/></div></div>
    </th>
  );
}

export default App;