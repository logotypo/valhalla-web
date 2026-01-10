
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServerMetrics, BattleMetricsData } from '../services/battleMetricsService';

const Home: React.FC = () => {
  const [realMetrics, setRealMetrics] = useState<BattleMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generar brasas (embers)
  const [embers, setEmbers] = useState<{ id: number, left: string, size: string, delay: string, duration: string }[]>([]);
  // Sistema de flechas realistas
  const [arrowVolley, setArrowVolley] = useState<{ id: number, startDelay: string, offsetTop: string }[]>([]);

  const fetchStats = async () => {
    const data = await getServerMetrics();
    if (data) {
      setRealMetrics(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Carga inicial de métricas
    fetchStats();

    // Actualizar cada 60 segundos
    const metricsInterval = setInterval(fetchStats, 60000);

    // Inicializar brasas
    const newEmbers = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      size: `${2 + Math.random() * 4}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${4 + Math.random() * 4}s`
    }));
    setEmbers(newEmbers);

    // Bucle de ráfaga de flechas
    const triggerVolley = () => {
      const arrowCount = 3 + Math.floor(Math.random() * 2);
      const newArrows = Array.from({ length: arrowCount }).map((_, i) => ({
        id: Date.now() + i,
        startDelay: `${i * 0.25}s`,
        offsetTop: `${-50 + Math.random() * 100}px`
      }));
      setArrowVolley(newArrows);
      setTimeout(() => setArrowVolley([]), 3000);
      const nextTime = 12000 + Math.random() * 10000;
      setTimeout(triggerVolley, nextTime);
    };

    const initialTimeout = setTimeout(triggerVolley, 4000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(metricsInterval);
    };
  }, []);

  const stats = [
    { 
      label: 'Jugadores', 
      value: isLoading ? '...' : `${realMetrics?.players || 0}/${realMetrics?.maxPlayers || 64}`, 
      icon: 'groups', 
      color: 'text-primary' 
    },
    { 
      label: 'Estado', 
      value: isLoading ? '...' : (realMetrics?.status === 'online' ? 'Online' : 'Offline'), 
      icon: 'bolt', 
      color: realMetrics?.status === 'online' ? 'text-green-500' : 'text-red-500' 
    },
    { label: 'Latencia', value: '28ms', icon: 'speed', color: 'text-blue-400' },
    { label: 'Reinicio', value: '04:00', subValue: 'CET', icon: 'restart_alt', color: 'text-orange-400' },
  ];

  const isServerOnline = realMetrics?.status === 'online';

  return (
    <div className="bg-background-dark">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-[#0a0a0a]/80 to-[#0a0a0a] z-10"></div>
          <img 
            alt="Viking SCUM Background" 
            className="w-full h-full object-cover opacity-30 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
            src="https://picsum.photos/seed/viking/1920/1080"
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-5xl space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/40 bg-black/60 backdrop-blur shadow-[0_0_20px_rgba(242,185,13,0.15)] animate-in fade-in slide-in-from-top-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isServerOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isServerOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-200">
              {isLoading ? 'Conectando...' : isServerOnline ? 'Reino Activo' : 'Reino en Sombras'}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="fire-wrapper">
              <div className="arrow-volley-container">
                {arrowVolley.map(arrow => (
                  <div key={arrow.id} className="realistic-arrow arrow-fly-arc" style={{ animationDelay: arrow.startDelay, marginTop: arrow.offsetTop }}>
                    <div className="arrow-feathers"><div className="feather"></div><div className="feather"></div></div>
                    <div className="arrow-shaft"></div>
                    <div className="arrow-head"></div>
                  </div>
                ))}
              </div>
              <div className="flame-layer flame-red text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none font-display" aria-hidden="true">VALHALLA</div>
              <div className="flame-layer flame-orange text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none font-display" aria-hidden="true">VALHALLA</div>
              <div className="flame-layer flame-yellow text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none font-display" aria-hidden="true">VALHALLA</div>
              <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none font-display fire-text-main relative">VALHALLA</h1>
              <div className="absolute inset-x-0 -bottom-10 h-40 pointer-events-none">
                {embers.map(e => (
                  <div key={e.id} className="ember" style={{ left: e.left, width: e.size, height: e.size, animationDelay: e.delay, animationDuration: e.duration }} />
                ))}
              </div>
            </div>
            <span className="text-3xl md:text-5xl block mt-4 text-primary tracking-[0.4em] opacity-90 font-display font-bold drop-shadow-lg uppercase">
              SCUM REALM
            </span>
          </div>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-body font-light italic leading-relaxed">
            "Donde el acero se encuentra con la carne y solo el más fuerte asciende al salón de los dioses."
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/join" className="w-full sm:w-auto px-10 py-4 bg-primary text-black font-black uppercase tracking-widest hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(242,185,13,0.3)]">
              Unirse al Clan
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-surface-dark border border-white/5 p-6 rounded-sm hover:border-primary/20 transition-all group">
                <div className={`p-2 rounded inline-block bg-black/40 mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                </div>
                <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h4>
                <p className="text-2xl md:text-3xl font-black text-white font-mono">
                  {stat.value} {stat.subValue && <span className="text-xs text-gray-600 font-sans">{stat.subValue}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IP Copy CTA */}
      <section className="py-12 bg-surface-accent border-b border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-viking opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Dirección de Conexión</h3>
            <p className="text-gray-400 text-sm">Copia la IP para entrar directamente al servidor.</p>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText('79.127.241.203:7182');
              alert('¡IP Copiada, Prisionero!');
            }}
            className="flex items-center gap-4 bg-black/40 border-2 border-primary/40 px-6 py-4 rounded-sm hover:border-primary transition-all group"
          >
            <span className="text-2xl font-mono font-bold text-white">79.127.241.203:7182</span>
            <span className="material-symbols-outlined text-primary group-active:scale-90">content_copy</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
