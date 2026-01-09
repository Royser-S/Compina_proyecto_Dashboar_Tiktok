import { 
  UserGroupIcon, CurrencyDollarIcon, ShoppingCartIcon, 
  CursorArrowRaysIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon 
} from "@heroicons/react/24/solid";
import { useState } from "react";

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

export default function KpiGrid({ kpis, followersNow }) {
    const [followersBase, setFollowersBase] = useState(10000);
    const growth = followersNow - followersBase;
    const growthPct = followersBase > 0 ? (growth / followersBase) * 100 : 0;
    
    const moneyFormatter = (number) => `S/ ${Intl.NumberFormat('pe').format(Number(number || 0).toFixed(2))}`;

    return (
        <div className="space-y-6">
             <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm w-fit">
                <div className="flex items-center gap-4">
                    <UserGroupIcon className="w-6 h-6 text-indigo-600"/>
                    <label className="text-xs font-bold text-slate-600 uppercase">Seguidores Base (Objetivo):</label>
                    <input
                        type="number"
                        value={followersBase}
                        onChange={(e) => setFollowersBase(Number(e.target.value))}
                        className="border border-slate-300 p-1 rounded-lg font-mono text-sm focus:border-indigo-500 w-32"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard icon={<CurrencyDollarIcon className="w-8 h-8 text-[#FE2C55]" />} title="Inversión Total" value={moneyFormatter(kpis.gasto)} subtitle="Acumulado histórico" bg="bg-red-50" />
                <KpiCard icon={<ShoppingCartIcon className="w-8 h-8 text-[#00C2CB]" />} title="Conversiones" value={kpis.conversiones?.toLocaleString()} subtitle="Ventas Totales" bg="bg-cyan-50" />
                <KpiCard icon={<CursorArrowRaysIcon className="w-8 h-8 text-blue-600" />} title="Clics" value={(kpis.clics || 0).toLocaleString()} subtitle="Tráfico Generado" bg="bg-blue-50" />
                
                <KpiCard 
                    icon={<UserGroupIcon className="w-8 h-8 text-indigo-600" />} 
                    title="Seguidores HOY" 
                    value={followersNow?.toLocaleString()} 
                    subtitle={`Crecimiento: ${growth.toLocaleString()} (${growthPct.toFixed(1)}%)`}
                    bg="bg-indigo-50"
                    isGrowth={true}
                    growthValue={growth}
                />
            </div>
        </div>
    );
}