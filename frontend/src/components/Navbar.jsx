import { UserGroupIcon, ArrowUpTrayIcon } from "@heroicons/react/24/solid";

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export default function Navbar({ followers, onOpenUploadModal }) {
  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-2xl border-b-4 border-[#00C2CB]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
        
        {/* LOGO: En móvil solo el icono, en PC icono + texto */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="bg-white p-1.5 rounded-lg shrink-0">
             <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png" className="h-5 md:h-6" alt="Logo"/>
          </div>
          <span className="font-black text-lg md:text-2xl tracking-tight hidden sm:block">
            COMPIPRO <span className="text-[#00C2CB]">ADS</span>
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* SEGUIDORES: Oculto en móvil */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-900 px-5 py-2 rounded-full border border-slate-700">
            <UserGroupIcon className="w-5 h-5 text-[#00C2CB]"/>
            <span className="font-bold">{followers ? followers.toLocaleString() : '0'} Seguidores</span>
          </div>
          
          <a href="https://github.com/Royser-S" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#00C2CB] transition-colors">
            <GitHubIcon className="w-6 h-6 md:w-8 md:h-8" />
          </a>

          {/* BOTÓN SUBIR: Texto pequeño en móvil */}
          <button 
            onClick={onOpenUploadModal} 
            className="flex items-center gap-2 bg-[#FE2C55] hover:bg-[#d92045] text-white px-3 py-1.5 md:px-6 md:py-2 rounded-full font-bold transition-colors shadow-lg active:scale-95 transform text-xs md:text-base"
          >
            <ArrowUpTrayIcon className="w-4 h-4 md:w-5 md:h-5" /> 
            <span className="hidden sm:inline">Subir / Nueva Carpeta</span>
            <span className="sm:hidden">Subir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}