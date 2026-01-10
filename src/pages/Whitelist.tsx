
import React, { useState } from 'react';

const Whitelist: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background-dark p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="size-24 bg-primary rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(242,185,13,0.3)]">
            <span className="material-symbols-outlined text-black text-5xl">done_all</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-black text-white uppercase tracking-widest">Destino Enviado</h2>
            <p className="text-gray-400 leading-relaxed">
              Tus hazañas han sido presentadas ante los dioses. Un heraldo del staff revisará tu solicitud en las próximas 24 lunas. Mantente atento a Discord.
            </p>
          </div>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-primary font-bold uppercase tracking-widest text-xs hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          {/* Instructions */}
          <div className="md:w-1/3 space-y-8">
            <h1 className="text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
              RECLAMA TU <span className="text-primary">LUGAR</span>
            </h1>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="size-8 bg-surface-accent border border-primary/40 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                <p className="text-sm text-gray-400">Debes tener al menos 18 años de edad para entrar al reino.</p>
              </div>
              <div className="flex gap-4">
                <div className="size-8 bg-surface-accent border border-primary/40 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                <p className="text-sm text-gray-400">Es obligatorio estar en nuestro servidor de Discord oficial.</p>
              </div>
              <div className="flex gap-4">
                <div className="size-8 bg-surface-accent border border-primary/40 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                <p className="text-sm text-gray-400">Aceptas las leyes del Valhalla y el código de honor PvP.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex-grow w-full">
            <form onSubmit={handleSubmit} className="bg-surface-dark border border-white/5 p-8 md:p-12 space-y-8 shadow-2xl">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Nombre de Prisionero</label>
                    <input required className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Ej. Ragnar Lothbrok" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Edad</label>
                    <input required type="number" min="18" className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="18+" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Steam ID 64</label>
                  <input required className="w-full bg-black/50 border border-white/10 p-3 text-white font-mono focus:outline-none focus:border-primary transition-colors" placeholder="7656119xxxxxxxxxx" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">¿Por qué VALHALLA?</label>
                  <textarea required rows={4} className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-primary transition-colors resize-none" placeholder="Cuéntanos tu historia en SCUM..." />
                </div>
              </div>

              <button type="submit" className="w-full bg-primary py-5 text-black font-black uppercase tracking-[0.2em] hover:bg-primary-hover transition-all flex items-center justify-center gap-4">
                <span>Presentar Solicitud</span>
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whitelist;
