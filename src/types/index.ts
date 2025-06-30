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
  text: string;
  rating?: number;
  date: string;
  author?: string;
  platform?: 'ios' | 'android';
  appVersion?: string;
  helpful?: number;
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