
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../supabase';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Datos del prisionero (Estado inicial vacío)
  const [warrior, setWarrior] = useState({
    name: "",
    rank: "",
    clan: "",
    honor: 0,
    kills: 0,
    deaths: 0,
    survivalTime: "",
    joinDate: "",
    steamId: "",
    whitelistStatus: ""
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    steamId: '',
    clan: ''
  });

  const [userDonations, setUserDonations] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/join');
        return;
      }

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setWarrior({
          name: profile.warrior_name || profile.full_name || 'Guerrero Sin Nombre',
          rank: profile.rank || "Thrall",
          clan: profile.clan || "Nómada",
          honor: profile.honor || 0,
          kills: profile.kills || 0,
          deaths: profile.deaths || 0,
          survivalTime: profile.survival_time || "0 horas",
          joinDate: profile.join_date || "Fecha desconocida",
          steamId: profile.steam_id || "No vinculado",
          whitelistStatus: profile.whitelist_status || "Pendiente"
        });

        setEditFormData({
          name: profile.warrior_name || profile.full_name || '',
          steamId: profile.steam_id || '',
          clan: profile.clan || ''
        });
      }

      // 2. Fetch Donations
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (donations) {
        setUserDonations(donations);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  // Determine active kits
  const isKitActive = (kitName: string) => {
    // Find the latest donation for this package
    const latestDonation = userDonations.find(d => d.package_name === kitName);
    if (!latestDonation) return false;

    // Check if expired (30 days)
    const donationDate = new Date(latestDonation.created_at);
    const expirationDate = new Date(donationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    return now < expirationDate;
  };


  const [userClaims, setUserClaims] = useState<any[]>([]);

  useEffect(() => {
    const fetchClaims = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('kit_claims')
        .select('*')
        .eq('user_id', user.id);

      if (data) setUserClaims(data);
    };
    fetchClaims();
  }, []);

  const handleClaim = async (kitName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!confirm(`¿Estás seguro de que quieres solicitar la entrega del kit ${kitName}? Un administrador revisará tu petición.`)) return;

    try {
      const { error } = await supabase
        .from('kit_claims')
        .insert({
          user_id: user.id,
          kit_name: kitName
        });

      if (error) throw error;

      alert("¡Solicitud enviada! Un administrador revisará tu petición pronto.");
      // Refresh claims
      const { data } = await supabase.from('kit_claims').select('*').eq('user_id', user.id);
      if (data) setUserClaims(data);

    } catch (error: any) {
      alert("Error al solicitar kit: " + error.message);
    }
  };

  const getKitStatus = (kitName: string) => {
    // 1. Get active donations (last 30 days)
    const activeDonations = userDonations.filter(d => {
      if (d.package_name !== kitName) return false;
      const donationDate = new Date(d.created_at);
      const expirationDate = new Date(donationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      return new Date() < expirationDate;
    });

    const activeDonationsCount = activeDonations.length;

    // 2. Get valid claims (not rejected)
    const validClaims = userClaims.filter(c => c.kit_name === kitName && c.status !== 'rejected');
    const validClaimsCount = validClaims.length;

    const isPending = validClaims.some(c => c.status === 'pending');

    // 3. Determine status
    if (activeDonationsCount === 0) return { status: 'cooldown', label: 'En enfriamiento' };

    // Enforce one pending claim at a time
    if (isPending) return { status: 'pending', label: 'Solicitado' };

    if (validClaimsCount >= activeDonationsCount) {
      return { status: 'delivered', label: 'Reclamado' };
    }

    return { status: 'available', label: 'Reclamar' };
  };

  const kits = [
    { name: "Thrall", icon: "agriculture", status: getKitStatus("Thrall") },
    { name: "Huskarl", icon: "shield", status: getKitStatus("Huskarl") },
    { name: "Jarl", icon: "swords", status: getKitStatus("Jarl") },
  ];

  const [uploads, setUploads] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');

  // Fetch user uploads
  useEffect(() => {
    const fetchUploads = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('community_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setUploads(data);
    }
    fetchUploads();
  }, []);


  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('profiles').update({
        warrior_name: editFormData.name,
        steam_id: editFormData.steamId,
        clan: editFormData.clan,
        // If steam ID changes, reset whitelist status
        whitelist_status: editFormData.steamId !== warrior.steamId ? 'Pendiente' : warrior.whitelistStatus
      }).eq('id', user.id);

      if (error) {
        alert("Error al guardar: " + error.message);
        return;
      }

      setWarrior(prev => ({
        ...prev,
        name: editFormData.name,
        steamId: editFormData.steamId,
        clan: editFormData.clan,
        whitelistStatus: editFormData.steamId !== warrior.steamId ? 'Pendiente' : prev.whitelistStatus
      }));

      setIsEditing(false);
      alert("¡Tus datos han sido grabados en las runas!");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('community-uploads')
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community-uploads')
        .getPublicUrl(fileName);

      // 2. Insert into DB
      const type = uploadFile.type.startsWith('video/') ? 'video' : 'image';
      const { error: dbError, data: newUpload } = await supabase
        .from('community_uploads')
        .insert({
          user_id: user.id,
          url: publicUrl,
          type: type,
          title: uploadTitle || 'Sin título',
          status: 'pending'
        })
        .select() // Select to get the new row
        .single();

      if (dbError) throw dbError;

      // 3. Update local state using functional update to ensure we have the latest state
      if (newUpload) {
        setUploads(prev => [newUpload, ...prev]);
      }

      setUploadFile(null);
      setUploadTitle('');
      alert("Contenido subido para revisión de los dioses.");

    } catch (error: any) {
      console.error("Error upload:", error); // Log full error for debugging
      alert('Error al subir: ' + (error.message || "Error desconocido"));
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-primary font-black uppercase tracking-widest text-xs animate-pulse">Consultando a los dioses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark py-24 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 h-full w-full pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/40 to-[#0a0a0a] z-10"></div>
        <img
          alt="Prison Cell View"
          className="w-full h-full object-cover opacity-100"
          src="/images/backgrounds/profile-bg.png"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Modal de Edición */}
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
            <div className="relative bg-surface-dark border-2 border-primary shadow-2xl rounded-sm p-8 md:p-10 max-w-lg w-full animate-in zoom-in-95">
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-widest mb-8 border-b border-white/10 pb-4">
                Editar Prisionero
              </h2>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Nombre en el Reino</label>
                  <input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest flex justify-between">
                    Steam ID 64
                    <span className="text-[8px] text-gray-500">NECESARIO PARA WHITELIST</span>
                  </label>
                  <input
                    value={editFormData.steamId}
                    onChange={(e) => setEditFormData({ ...editFormData, steamId: e.target.value })}
                    placeholder="7656119xxxxxxxxxx"
                    className="w-full bg-black/50 border border-white/10 p-3 text-white font-mono focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                  {editFormData.steamId !== warrior.steamId && (
                    <p className="text-[9px] text-accent-red-bright uppercase font-bold animate-pulse">
                      Cambiar el ID activará una nueva revisión de Whitelist.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Clan</label>
                  <input
                    value={editFormData.clan}
                    onChange={(e) => setEditFormData({ ...editFormData, clan: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-grow bg-primary py-4 text-black font-black uppercase tracking-widest text-xs hover:bg-primary-hover transition-all"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-4 border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
        }

        {/* Profile Header */}
        <div className="relative bg-surface-dark/95 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center gap-10 shadow-2xl">
          <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[80px] -z-0"></div>

          {/* Avatar Area */}
          <div className="relative shrink-0">
            <div className="size-32 md:size-48 bg-black/60 border-4 border-primary rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(242,185,13,0.2)]">
              <span className="material-symbols-outlined text-7xl md:text-9xl text-primary/80">person</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-accent-red text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/20">
              NIVEL 14
            </div>
          </div>

          {/* Info Area */}
          <div className="text-center md:text-left space-y-4 flex-grow relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:gap-6">
              <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter leading-none">
                {warrior.name}
              </h1>
              <div className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest border mb-2 md:mb-1 ${warrior.whitelistStatus === 'Aprobado' || warrior.whitelistStatus === 'Validado' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                }`}>
                {warrior.whitelistStatus === 'Aprobado' ? 'Validado' : warrior.whitelistStatus}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
              <span className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">military_tech</span>
                {warrior.rank}
              </span>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest border-l border-white/10 pl-4">
                CLAN: <span className="text-white">{warrior.clan}</span>
              </span>
              <span className="text-gray-500 text-[10px] font-mono tracking-widest border-l border-white/10 pl-4">
                ID: {warrior.steamId}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5 justify-center md:justify-start">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary text-black px-6 py-2.5 font-black uppercase tracking-widest text-[10px] hover:bg-primary-hover transition-all"
              >
                Editar Prisionero
              </button>
              <button
                onClick={handleLogout}
                className="border border-white/10 text-gray-400 px-6 py-2.5 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>



        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Honor", value: warrior.honor, icon: "verified" },
            { label: "Bajas", value: warrior.kills, icon: "skull" },
            { label: "Muertes", value: warrior.deaths, icon: "heart_broken" },
            { label: "K/D Ratio", value: warrior.deaths > 0 ? (warrior.kills / warrior.deaths).toFixed(2) : warrior.kills, icon: "analytics" },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-dark/90 backdrop-blur-sm border border-white/5 p-6 rounded-sm group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3 mb-4 text-primary/60">
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
              </div>
              <div className="text-3xl font-display font-black text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Dashboard Column */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-6 border-b border-primary/20 pb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                Tus Suministros (Kits) Donaciones
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {kits.map((kit, i) => (
                  <div key={i} className={`p-6 border flex items-center justify-between rounded-sm ${kit.status.status === 'available' ? 'bg-surface-dark/95 backdrop-blur-md border-white/5' : 'bg-black/90 border-white/5 opacity-50'}`}>
                    <div className="flex items-center gap-4">
                      <span className={`material-symbols-outlined text-3xl ${kit.status.status === 'available' ? 'text-primary' : 'text-gray-600'}`}>{kit.icon}</span>

                      <div>
                        <h4 className="font-bold text-white text-sm uppercase">{kit.name}</h4>
                        <p className="text-[10px] text-gray-500 uppercase">{kit.status.status === 'available' ? 'Disponible' : kit.status.label}</p>
                      </div>
                    </div>
                    {kit.status.status !== 'cooldown' && (
                      <button
                        onClick={() => handleClaim(kit.name)}
                        disabled={kit.status.status !== 'available'}
                        className={`bg-primary/10 text-primary border border-primary/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all ${kit.status.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {kit.status.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="bg-surface-dark/95 backdrop-blur-md border border-primary/20 p-8 rounded-sm">
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                  Estatus de Acceso (Whitelist)
                </h3>
                <div className="flex items-center gap-6">
                  <div className={`size-16 rounded-full flex items-center justify-center border-2 ${warrior.whitelistStatus === 'Aprobado' || warrior.whitelistStatus === 'Validado' ? 'border-green-500 text-green-500' : 'border-orange-500 text-orange-500'}`}>
                    <span className="material-symbols-outlined text-3xl">
                      {warrior.whitelistStatus === 'Aprobado' || warrior.whitelistStatus === 'Validado' ? 'check_circle' : 'pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold uppercase">Estado: {warrior.whitelistStatus}</p>
                    <p className="text-gray-500 text-xs font-body mt-1">
                      {warrior.whitelistStatus === 'Aprobado' || warrior.whitelistStatus === 'Validado'
                        ? "Tu acceso está garantizado por los dioses. ¡A las armas!"
                        : "Tu Steam ID está siendo revisado por los guardianes. Regresa en 24 lunas."}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-12">
            <div className="bg-surface-accent/90 backdrop-blur-md border border-primary/10 p-8 rounded-sm">
              <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-6 text-center flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
                Ofrendas a la Comunidad
              </h4>

              <div className="space-y-6">
                <div className="bg-black/40 p-4 border border-white/5 rounded-sm">
                  <p className="text-gray-400 text-[10px] uppercase font-bold text-center mb-4">Sube tus clips (max 1min) o capturas épicas.</p>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Título de la hazaña..."
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full bg-surface-dark border border-white/10 px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                      required
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,video/mp4,video/webm"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Basic validation
                            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                              alert("El archivo es demasiado grande (Max 50MB)");
                              return;
                            }
                            setUploadFile(file);
                          }
                        }}
                        className="w-full text-[10px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-[10px] file:font-black file:bg-primary file:text-black hover:file:bg-primary-hover cursor-pointer"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploading}
                      className={`w-full py-3 text-[10px] font-black uppercase tracking-widest transition-all ${uploading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-primary text-black hover:bg-primary-hover'}`}
                    >
                      {uploading ? 'Subiendo...' : 'Enviar Ofrenda'}
                    </button>
                  </form>
                </div>

                <div className="space-y-2">
                  <h5 className="text-white font-bold text-[10px] uppercase tracking-widest border-b border-white/10 pb-2">Tus Envíos Recientes</h5>
                  {uploads.length === 0 ? (
                    <p className="text-gray-600 text-[10px] italic text-center py-4">Aún no has enviado ofrendas.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {uploads.map((up) => (
                        <div key={up.id} className="flex items-center gap-3 bg-black/40 p-2 border border-white/5">
                          <div className="size-10 bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {up.type === 'image' ? (
                              <img src={up.url} alt="thumb" className="w-full h-full object-cover opacity-50" />
                            ) : (
                              <span className="material-symbols-outlined text-gray-500 text-sm">movie</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-[10px] font-bold truncate">{up.title}</p>
                            <p className={`text-[8px] uppercase font-black tracking-wider ${up.status === 'approved' ? 'text-green-500' :
                              up.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                              }`}>
                              {up.status === 'approved' ? 'Aprobado' :
                                up.status === 'rejected' ? 'Rechazado' : 'En Revisión'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Profile;
