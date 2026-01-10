import React from 'react';

const Rules: React.FC = () => {
  const sections = [
    {
      title: 'Normativa General',
      icon: 'gavel',
      rules: [
        'En caso de incidencia y no haber ningún Admin. disponible se deberá comunicar mediante ticket y aportando informacion sobre la misma. (ID´s, pantallazos etc.)',
        'La administración no se responsabiliza de bugs o fallos ocasionados por el juego.',
        'En los drops que caigan en zona PvE se respetará el orden de llegada.',
        'Cheats, hacks, bugs o gliches = Baneo permanente.',
        'Cualquier falta de respeto o acto tóxico hacia otros jugadores o miembros de la administración será sancionada en función de la gravedad.',
        'Spamear en el chat global puede ser motivo de sanción administrativa.',
        'Prohibido cerrar u obstaculizar zonas de loteo o carreteras "cualquier casa vanilla se puede cerrar siempre que esté dentro del rango de la bandera" tampoco abarcar loot militar con el radio de la bandera.',
        'Está terminantemente prohibido cualquier acto delictivo en los traders, siendo así una sanción administrativa.',
        'La administración no se hace responsable por los daños ocasionados por la negligencia del jugador "pérdida de vehículos u objetos"',
        'Está terminantemente prohibido poner minas o cualquier tipo de trampa fuera del radio de la bandera y dentro del radio de la bandera deberán estar dentro de las murallas.'
      ]
    },
    {
      title: 'Normativa General de Vehículos',
      icon: 'directions_car',
      rules: [
        'Máximo de vehículos por squad: 1 coche + 1 vehículo no coche por miembro, siendo el máximo de 2 avionetas por squad (barcas 3max no cuentan).',
        'Si cierras un vehículo con candado deberá estar operativo (3ruedas+motor+bateria+asiento conductor) y sacarlo de la zona de respawn y sus inmediaciones.',
        'Cualquier vehículo que no se mueva en 7 días desaparecerá por inactividad. La administración no se hace responsable y no hay reclamación posible.',
        'Un vehículo que permanezca más de 2 horas dentro del radio verde del outpost será eliminado automáticamente. La administración no se hace responsable y no hay reclamación posible.',
        'Es imprescindible disponer del ID del vehículo para poder reclamar a la administración, para ello usen ⁠📝🚘registro-vehiculos-pve',
        'Está prohibido ocasionar daños a otros vehículos en zonas PvE.',
        'Queda terminantemente prohibido remolcar, empujar o desplazar vehículos de otros jugadores sin su consentimiento cuando dicha acción implique moverlos de la zona en la que estaban dentro de áreas PvE.'
      ]
    },
    {
      title: 'Normativa Especial sobre Candados',
      icon: 'lock',
      rules: [
        'Solo se permite poner candado a vehículos operativos (3ruedas+motor+bateria+asiento de conductor).',
        'Si estás remolcando un vehículo al trader puedes ponerle el candado sólo mientras lo remolcas y estás con el.',
        'Los vehículos que no cumplan estas condiciones solo podrán llevar candado si están registrados en ⁠🚗concesionario-oficial-valhalla…',
        'Sólo puede registrar un vehículo por persona en ⁠🚗concesionario-oficial-valhalla… hasta cobrar la recompensa.',
        'El uso de candados para bloquear o acaparar vehículos inoperativos será sancionable según lo que determine la administración del Valhalla.'
      ]
    },
    {
      title: 'Normativa PVP/RAIDS',
      icon: 'swords',
      rules: [
        'Se deberá registrar en el canal especificando nombre en juego y nombre en discord para asignarle el rol de pvp y acceder a los canales PVP.',
        'El horario de raideo será todos los días de 18:00 a 00:00 debiendo escribir en el canal raids : RAID @RaidersPVP',
        'Todo aquél que viva en PVP sólo puede ser raideado por otro equipo registrado en PVP con una antelación mínima de 5 días.',
        'El que viva en PVP está expuesto a ser campeado o encontrarse ocasionalmente por otros players de PVE.',
        'Los players PVE no podrán hacer daño excesivo o romper alguna construcción de la base PVP.',
        'No se podrá meter miembros al SQUAD PVP sin estar previamente registrados.',
        'Las minas, defensas o torretas de la base PVP deberán estar dentro del radio de la bandera y de las murallas, en el caso de torretas no podrán disparar fuera de ellas.',
        'Los vehículos deberán dormir siempre dentro de zona PVP incumpliendo esto por motivos de necesidad deberá justificarla aparte de ser avisado y como sea reiterado la próxima vez que se vea el vehículo fuera de PVP será eliminado.',
        'Las bases PVP no podrán abarcar zonas de loot, tampoco edificaciones cómo en el caso de PVE.',
        'En los raideos se tratará de hacer el menor daño posible a la casa raideada, entras... robas... y te vas...',
        'El radio de la bandera deberá de estar completamente en PVP.',
        'Mientras se esté realizando un raideo, nadie podrá participar de ninguna manera excepto los equipos registrados.',
        'Todo el loot de los squad PVP se guarda en el radio de la bandera de PVP.',
        'Estando registrado en PVP el equipo se compromete a no hacer ningún tipo de pacto o alianza con gente PVE si afecta al raideo.',
        'Para reclamar cualquier cosa en relación a algún raideo es necesario aportar un video con pruebas claras.',
        'Los vehículos deberán de ser registrados en el canal de PVP vehículos en todo momento manteniéndolo actualizado, siendo responsable el propietario de que desaparezca por no esta registrado.',
        'Toda persona registrada en PVP deberá estar mínimo 14 días en ese mismo squad y seguir la normativa PVP.',
        'La administración podrá modificar dichas normas en cualquier momento para mejorar la experiencia de juego de los jugadores.'
      ]
    },
    {
      title: 'Características del Servidor',
      icon: 'dns',
      rules: [
        'La administración podrá cambiar las normas u configuraciones del servidor sin previo aviso.',
        'La configuración del servidor será modificada según necesidad de la administración para eventos etc.',
        'La administración no tolerará discriminación alguna de tipo racial, sexual o de genero entre usuarios.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background-dark py-24 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 h-full w-full pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/30 to-[#0a0a0a] z-10"></div>
        <img
          alt="Prison Battle"
          className="w-full h-full object-cover opacity-100"
          src="/images/backgrounds/rules-bg.png"
        />
      </div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-display font-black text-white uppercase tracking-widest bg-black/80 backdrop-blur-md inline-block px-8 py-4 rounded-sm shadow-2xl border border-white/5">LEYES DEL SERVIDOR</h1>
          <br />
          <p className="text-gray-300 uppercase tracking-widest text-xs font-bold bg-black/80 inline-block px-4 py-2 mt-2 rounded-full border border-white/5">Respetad las normas para evitar el destierro</p>
        </div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-surface-dark/95 backdrop-blur-sm border-l-4 border-primary p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-white">{section.icon}</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-primary mb-8 uppercase tracking-widest">{section.title}</h3>
              <ul className="space-y-6">
                {section.rules.map((rule, ridx) => (
                  <li key={ridx} className="flex items-start gap-4">
                    <span className="text-primary font-mono font-bold mt-1">[{ridx + 1}]</span>
                    <p className="text-gray-300 leading-relaxed font-body">{rule}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 border-2 border-accent-red-bright text-center bg-accent-red/20 backdrop-blur-md shadow-[0_0_50px_rgba(255,0,0,0.2)] rounded-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none"></div>
          <h4 className="text-3xl text-accent-red-bright font-black uppercase mb-6 tracking-widest drop-shadow-md relative z-10">
            <span className="material-symbols-outlined align-middle mr-2 text-4xl">warning</span>
            Sentencia de los Dioses
            <span className="material-symbols-outlined align-middle ml-2 text-4xl">warning</span>
          </h4>
          <p className="text-white text-lg leading-relaxed italic font-bold relative z-10">
            "El desconocimiento de la ley no exime de su cumplimiento. Aquellos que traicionen el código serán desterrados al Helheim (Baneo Permanente)."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rules;
