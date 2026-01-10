
export interface ServerStat {
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  color?: string;
}

export interface DonationTier {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: string;
  color: string;
  isPopular?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  image: string;
  date?: string;
}
