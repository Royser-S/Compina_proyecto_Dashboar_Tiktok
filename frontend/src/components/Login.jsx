import { useState } from 'react';
import { LockClosedIcon } from "@heroicons/react/24/solid";
import capyLogo from '../assets/Capy-removebg-preview.png'; // Ajusta la ruta si es necesario

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            onLogin();
        } else {
            setError(true);
        }
    } catch (err) {
        setError(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full text-center">
        <img src={capyLogo} alt="Logo" className="w-24 h-24 mx-auto mb-6 hover:rotate-12 transition-transform"/>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Acceso Restringido</h1>
        <p className="text-slate-500 mb-8">Ingresa la clave maestra para continuar.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <LockClosedIcon className="w-6 h-6 text-slate-400 absolute left-3 top-3"/>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2CB] transition-all"
                    placeholder="Contraseña..."
                />
            </div>
            
            {error && <p className="text-red-500 text-sm font-bold">Contraseña incorrecta</p>}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#FE2C55] hover:bg-[#d92045] text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50"
            >
                {loading ? "Verificando..." : "Ingresar"}
            </button>
        </form>
      </div>
      <p className="mt-8 text-slate-400 text-sm font-bold">Compipro Analytics Security</p>
    </div>
  );
}