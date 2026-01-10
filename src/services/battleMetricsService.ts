
export interface BattleMetricsData {
  players: number;
  maxPlayers: number;
  status: string;
  name: string;
}

const SERVER_ID = '37133917';
const API_URL = `https://api.battlemetrics.com/servers/${SERVER_ID}`;

export const getServerMetrics = async (): Promise<BattleMetricsData | null> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al conectar con BattleMetrics');
    
    const json = await response.json();
    const attr = json.data.attributes;
    
    return {
      players: attr.players,
      maxPlayers: attr.maxPlayers,
      status: attr.status,
      name: attr.name
    };
  } catch (error) {
    console.error('Error fetching BattleMetrics:', error);
    return null;
  }
};
