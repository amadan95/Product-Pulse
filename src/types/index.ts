export interface App {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  icon: string;
  score: number;
  developer: string;
}

export interface Review {
  id: string;
  text?: string;
  content?: string;
  rating?: number;
  score?: number;
  date: string;
  author?: string;
  userName?: string;
  platform?: 'ios' | 'android';
  appVersion?: string;
  version?: string;
  helpful?: number;
  appName?: string;
  appId?: string;
}

export interface AppDetails {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  icon: string;
  description: string;
  developer: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  ratingCounts: Record<string, number>;
  themes: Theme[];
}

export interface Theme {
  id: string;
  name: string;
  type: 'wow' | 'pain';
  confidence: number;
  reviewCount: number;
  summary: string;
  reviews: string[];
  sentiment: {
    score: number; // -1 to 1 range, where -1 is very negative, 0 is neutral, and 1 is very positive
    label: 'negative' | 'neutral' | 'positive';
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
} 