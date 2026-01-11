
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Auth: React.FC = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState('');
  const [steamId, setSteamId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              warrior_name: name,
              steam_id: steamId
            },
            emailRedirectTo: 'https://valhallascum.com/'
          }
        });

        if (error) throw error;
        if (data.user) {
          alert('¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta antes de entrar.');
          setIsRegister(false); // Switch to login view
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        if (data.user) {
          navigate('/profile');
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Ha ocurrido un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark py-24 flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-primary/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-md w-full px-4">
        <div className="bg-surface-dark border-2 border-border-gold/40 shadow-2xl rounded-sm p-8 md:p-12 relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 size-20 border-t-2 border-r-2 border-primary/20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 size-20 border-b-2 border-l-2 border-primary/20 pointer-events-none"></div>

          <div className="text-center mb-10 space-y-4">
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest">
              {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">
              {isRegister ? 'Únete al clan hoy mismo' : 'Accede a tus dominios'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-xs text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Nombre de Prisionero
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    person
                  </span>
                  <input
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 p-3 pl-10 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder="Ragnar..."
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Steam ID (64 bits)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    gamepad
                  </span>
                  <input
                    required
                    value={steamId}
                    onChange={(e) => setSteamId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 p-3 pl-10 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder="76561198..."
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">Correo Electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">mail</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 p-3 pl-10 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="guerrero@valhalla.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">lock</span>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 p-3 pl-10 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary py-4 text-black font-black uppercase tracking-[0.2em] hover:bg-primary-hover transition-all flex items-center justify-center gap-3 mt-4 text-sm shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Cargando...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Registrarse' : 'Entrar'}</span>
                  <span className="material-symbols-outlined text-sm">{isRegister ? 'how_to_reg' : 'login'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-4">
              {isRegister ? '¿Ya eres un veterano?' : '¿Nuevo en estas tierras?'}
            </p>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg(null);
              }}
              className="text-primary font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
            >
              {isRegister ? 'Iniciar Sesión' : 'Crea tu Cuenta'}
            </button>
          </div>
        </div>

        {/* Info footer */}
        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-widest leading-relaxed">
          Al entrar, aceptas el código de honor de Valhalla.<br />
          La traición se paga con el destierro.
        </p>
      </div>
    </div>
  );
};

export default Auth;
