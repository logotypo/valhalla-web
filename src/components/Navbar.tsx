
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { supabase } from '../supabase';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsLoggedIn(true);

        // Fetch profile to get name and role
        const { data: profile } = await supabase
          .from('profiles')
          .select('warrior_name, full_name, role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUserName(profile.warrior_name || profile.full_name || 'Guerrero');
          setIsAdmin(profile.role === 'admin' || profile.role === 'moderator');
        }
      } else {
        setIsLoggedIn(false);
        setUserName('');
        setIsAdmin(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const publicLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Donaciones', path: '/donations' },
    { name: 'Eventos', path: '/events' },
    { name: 'Reglas', path: '/rules' },
    { name: 'Ticket', path: '/tickets' },
    { name: 'Comunidad', path: '/community' },
  ];

  const adminLinks = [
    { name: 'Admin', path: '/admin' },
    { name: 'Ticket', path: '/admin/tickets' },
    { name: 'KitDonato', path: '/kit-claims' },
    { name: 'Clasificación', path: '/leaderboard' },
    { name: 'Calendario', path: '/calendar' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-primary/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Branding */}
          <Link to="/" className="group flex items-center shrink-0">
            <span className="text-white text-2xl md:text-3xl font-black tracking-[0.2em] uppercase font-display group-hover:text-primary transition-colors duration-500">
              VALHALLA
            </span>
          </Link>

          {/* Navegación y Acciones */}
          <div className="hidden xl:flex items-center flex-grow justify-end">

            {/* Links de navegación */}
            {/* Links de navegación */}
            <div className="flex items-center space-x-6 mr-10">
              {publicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all py-1 border-b-2 px-1 ${isActive(link.path)
                    ? 'text-primary border-primary'
                    : 'text-gray-500 border-transparent hover:text-white hover:border-white/20'
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Admin Dropdown */}
              {isAdmin && (
                <div className="relative group">
                  <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] py-1 text-red-500 border-b-2 border-transparent group-hover:border-red-500 transition-all cursor-pointer">
                    ADMIN
                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>
                  <div className="absolute top-full right-0 mt-0 pt-4 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-[#0a0a0a] border border-red-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden flex flex-col">
                      {adminLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-colors border-l-2 ${isActive(link.path)
                            ? 'text-white border-red-500 bg-red-500/10'
                            : 'text-gray-400 border-transparent hover:text-red-400'
                            }`}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Separador visual sutil */}
            <div className="h-8 w-[1px] bg-white/10 mr-10"></div>

            {/* Acciones de Usuario y Discord */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 pl-2 pr-4 py-1.5 border border-white/5 rounded-full transition-all hover:bg-white/5 group ${isActive('/profile') ? 'border-primary/40 bg-primary/5' : ''}`}
                >
                  <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Mi Prisionero</span>
                    <span className="text-white text-[11px] font-black uppercase tracking-wider leading-none truncate max-w-[100px]">{userName}</span>
                    <span className="text-[9px] text-accent-red font-mono uppercase">{isAdmin ? 'ADMIN/MOD' : ''}</span>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/join"
                  className="text-primary hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Entrar
                </Link>
              )}

              <a
                href="https://discord.gg/v5kJUtwYdw"
                target="_blank"
                rel="noreferrer"
                className="bg-accent-red text-white px-5 py-2 rounded-sm font-black text-[10px] transition-all uppercase tracking-[0.2em] hover:bg-red-700 shadow-lg shadow-red-900/20"
              >
                Discord
              </a>
            </div>
          </div>

          {/* Toggle Móvil */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden text-primary font-black text-[12px] uppercase tracking-[0.3em] px-4 py-2"
          >
            {isOpen ? 'CERRAR' : 'MENÚ'}
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      {isOpen && (
        <div className="xl:hidden bg-[#0a0a0a] border-t border-primary/20 px-8 py-10 space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="pb-6 border-b border-white/5">
            {isLoggedIn ? (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-4 p-4 border border-primary/20 bg-primary/5 rounded-sm"
              >
                <span className="material-symbols-outlined text-primary">account_circle</span>
                <span className="text-lg font-display font-black text-white uppercase tracking-widest">{userName}</span>
              </Link>
            ) : (
              <Link
                to="/join"
                onClick={() => setIsOpen(false)}
                className="block text-center text-primary font-black uppercase tracking-[0.2em] py-4 border border-primary/20 rounded-sm"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-xl font-display font-black uppercase tracking-widest text-center py-2 ${isActive(link.path) ? 'text-primary' : 'text-gray-600'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="mx-auto w-12 h-[1px] bg-red-500/30 my-2"></div>
                <div className="text-red-500 text-xs font-black uppercase tracking-[0.3em] text-center mb-2">Administración</div>
                {adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-display font-black uppercase tracking-widest text-center py-1 ${isActive(link.path) ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          <div className="pt-6 border-t border-white/5">
            <a href="https://discord.gg/v5kJUtwYdw" className="flex justify-center items-center bg-accent-red text-white py-4 font-black uppercase tracking-[0.2em] text-[10px] rounded-sm">
              Discord Oficial
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
