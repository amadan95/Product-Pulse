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
  userName: string;
  content: string;
  score: number;
  date: string;
  platform: 'ios' | 'android';
  version: string;
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
  performanceRating: number;
  uiRating: number;
  stabilityRating: number;
  featuresRating: number;
  customerSupportRating: number;
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