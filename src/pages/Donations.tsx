import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

declare global {
  interface Window {
    paypal: any;
  }
}

const DonationTier: React.FC<{ tier: any; onImageClick: (index: number) => void }> = ({ tier, onImageClick }) => {
  useEffect(() => {
    if (tier.paypalPlanId && window.paypal) {
      const containerId = `paypal-button-container-${tier.paypalPlanId}`;
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';

      window.paypal.Buttons({
        style: {
          shape: 'pill',
          color: 'black',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function (data: any, actions: any) {
          return actions.subscription.create({
            plan_id: tier.paypalPlanId
          });
        },
        onApprove: async function (data: any, actions: any) {
          // Record donation in Supabase
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            await supabase.from('donations').insert({
              user_id: user.id,
              package_name: tier.name,
              amount: parseFloat(tier.price.replace('€', '').trim()),
              paypal_subscription_id: data.subscriptionID,
              status: 'active'
            });
            alert('¡Suscripción exitosa! Tu donación ha sido registrada en el Valhalla.');
          } else {
            alert('Suscripción exitosa! Por favor inicia sesión para vincularla a tu cuenta.');
          }
        }
      }).render(`#${containerId}`);

      return () => {
        if (container) container.innerHTML = '';
      };
    }
  }, [tier.paypalPlanId, tier.name, tier.price]);

  return (
    <div className={`relative flex flex-col bg-surface-dark border ${tier.isPopular ? 'border-primary scale-105 z-10 shadow-2xl' : 'border-white/10 opacity-90'} p-8 rounded-sm hover:translate-y-[-4px] transition-all group overflow-hidden`}>
      {tier.isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-black font-black text-[10px] px-4 py-1.5 uppercase tracking-widest">
          Más Popular
        </div>
      )}
      <div className={`mb-6 ${tier.color}`}>
        <span className="material-symbols-outlined text-5xl">{tier.icon}</span>
      </div>
      <h3 className="text-2xl font-display font-bold text-white mb-2 uppercase">{tier.name}</h3>
      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-4xl font-black text-white">{tier.price}</span>
        <span className="text-gray-500 text-sm uppercase">/ mes</span>
      </div>

      {/* Image Gallery Preview */}
      {tier.images && tier.images.length > 0 && (
        <div className="mb-6 grid grid-cols-4 gap-2">
          {tier.images.map((img: string, idx: number) => (
            <div
              key={idx}
              className="aspect-square bg-black/50 overflow-hidden rounded-sm cursor-pointer border border-white/5 hover:border-primary transition-colors"
              onClick={() => onImageClick(idx)}
            >
              <img src={img} alt={`${tier.name} preview ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}

      <ul className="space-y-4 mb-10 flex-grow">
        {tier.features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
            {f}
          </li>
        ))}
      </ul>

      {tier.paypalPlanId ? (
        <div id={`paypal-button-container-${tier.paypalPlanId}`} className="w-full z-10 relative"></div>
      ) : (
        <button className={`w-full py-4 font-black uppercase tracking-widest transition-all ${tier.isPopular ? 'bg-primary text-black hover:bg-primary-hover shadow-lg shadow-primary/20' : 'border border-primary text-primary hover:bg-primary/10'
          }`}>
          Contribuir
        </button>
      )}
    </div>
  );
};

const Donations: React.FC = () => {
  const [lightboxState, setLightboxState] = useState<{ images: string[]; index: number } | null>(null);

  const tiers = [
    {
      name: 'Thrall',
      price: '€5.99',
      icon: 'agriculture',
      color: 'text-gray-400',
      paypalPlanId: 'P-6NV45472E2491771ANFOAU5I',
      images: [
        '/images/thrall/img1.jpg',
        '/images/thrall/img2.jpg',
        '/images/thrall/img3.jpg',
        '/images/thrall/img4.jpg',
      ],
      features: [
        'Estatus VIP en la web',
        'Acceso WhiteList',
        'Badge en Discord',
        'Kit de inicio básico 1 Paquete',
        'Acceso a eventos exclusivos',
        'No se puede reclamar el paquete en zona PVP, a no ser que seas @RaidersPVP y lo pidas en tu base.'
      ]
    },
    {
      name: 'Huskarl',
      price: '€10.99',
      icon: 'shield',
      color: 'text-blue-400',
      paypalPlanId: 'P-4VT56348VR1479811NFOAYDA',
      images: [
        '/images/huskarl/img1.png',
        '/images/huskarl/img2.png',
        '/images/huskarl/img3.jpg',
        '/images/huskarl/img4.jpg',
      ],
      isPopular: true,
      features: [
        'Estatus VIP en la web',
        'Acceso WhiteList',
        'Badge VIP en Discord',
        'Kit de inicio básico 2 Paquete + DirtBike',
        'Acceso a eventos exclusivos VIP',
        'No se puede reclamar el paquete en zona PVP, a no ser que seas @RaidersPVP y lo pidas en tu base.',
        'Los vehículos del paquete están sujetos a la normativa.'
      ]
    },
    {
      name: 'Jarl',
      price: '€15.99',
      icon: 'swords',
      color: 'text-primary',
      paypalPlanId: 'P-6ER95648G8374144FNFOA2NQ',
      images: [
        '/images/jarl/img1.jpg',
        '/images/jarl/img2.jpg',
        '/images/jarl/img3.jpg',
        '/images/jarl/img4.jpg',
      ],
      features: [
        'Estatus VIP en la web',
        'Acceso WhiteList',
        'Rango Jarl en Discord',
        'Kit de inicio básico 2 Paquete + RIS mensual.',
        'Acceso a eventos exclusivos VIP',
        'No se puede reclamar el paquete en zona PVP, a no ser que seas @RaidersPVP y lo pidas en tu base.',
        'Los vehículos del paquete están sujetos a la normativa.'
      ]
    }
  ];

  const openLightbox = (images: string[], index: number) => {
    setLightboxState({ images, index });
  };

  const closeLightbox = () => setLightboxState(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxState) {
      setLightboxState(prev => prev ? ({ ...prev, index: (prev.index + 1) % prev.images.length }) : null);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxState) {
      setLightboxState(prev => prev ? ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }) : null);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark py-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/20 to-[#0a0a0a] z-10"></div>
        <img
          alt="Apocalyptic Ruins"
          className="w-full h-full object-cover opacity-100"
          src="/images/backgrounds/donations-bg.png"
        />
      </div>

      {/* Global Lightbox */}
      {lightboxState && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-0 backdrop-blur-md" onClick={closeLightbox}>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 z-[10000] hover:bg-white/10 rounded-full"
            onClick={prevImage}
          >
            <span className="material-symbols-outlined text-5xl">chevron_left</span>
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 z-[10000] hover:bg-white/10 rounded-full"
            onClick={nextImage}
          >
            <span className="material-symbols-outlined text-5xl">chevron_right</span>
          </button>

          <img
            src={lightboxState.images[lightboxState.index]}
            alt="Full size"
            className="max-w-[100vw] max-h-[100vh] w-auto h-auto object-contain select-none relative z-[9999]"
            onClick={(e) => e.stopPropagation()}
          />

          <button className="absolute top-4 right-4 text-white/80 hover:text-primary transition-colors bg-black/50 rounded-full p-2 z-[10000]" onClick={closeLightbox}>
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 text-center mb-20 space-y-6 relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-widest">EL TESORO DEL CLAN</h1>
        <p className="bg-primary text-black inline-block px-4 py-2 font-bold text-lg shadow-lg">
          Tus ofrendas mantienen las hogueras encendidas. Apoya la longevidad del servidor y obtén beneficios para tu supervivencia.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {tiers.map((t, idx) => (
          <DonationTier
            key={idx}
            tier={t}
            onImageClick={(imgIndex) => t.images && openLightbox(t.images, imgIndex)}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-20 text-center relative z-10">
        <div className="p-8 border border-accent-red/30 bg-accent-red/5 rounded-sm">
          <span className="material-symbols-outlined text-accent-red-bright text-4xl mb-4">warning</span>
          <p className="text-sm text-gray-500 leading-relaxed italic">
            "Las donaciones son voluntarias y se utilizan exclusivamente para el mantenimiento del hardware y licencias del servidor. Ningún beneficio garantiza la inmortalidad en el campo de batalla."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Donations;
