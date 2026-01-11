
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-border-gold/30 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h2 className="text-3xl font-display font-black text-white tracking-widest">VALHALLA</h2>
            <p className="text-gray-500 max-w-sm font-body text-sm leading-relaxed border-l-2 border-primary/30 pl-4">
              La experiencia definitiva de supervivencia nórdica en SCUM. Forja tu destino, reclama tu territorio y asciende entre los prisioneros.
            </p>
          </div>
          <div>
            <h4 className="text-primary font-bold uppercase tracking-widest text-xs mb-6">Navegación</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/whitelist" className="hover:text-white transition-colors">Solicitar Whitelist</Link></li>
              <li><Link to="/donations" className="hover:text-white transition-colors">Tienda de Supervivencia</Link></li>
              <li><Link to="/rules" className="hover:text-white transition-colors">Código de Honor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-primary font-bold uppercase tracking-widest text-xs mb-6">Redes</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="https://discord.gg/v5kJUtwYdw" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord Oficial</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Steam Group</a></li>
              <li><a href="https://www.youtube.com/@EspValhallaSCUM" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          <p>© 2024 Valhalla SCUM Project. Diseñado para Prisioneros.</p>
          <div className="flex gap-6">
            <Link to="/rules" className="hover:text-primary transition-colors">Privacidad</Link>
            <Link to="/rules" className="hover:text-primary transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
