declare module 'app-store-scraper' {
  export function app(options: { id: string, country?: string, lang?: string }): Promise<{
    id: string;
    appId: string;
    title: string;
    url: string;
    description: string;
    icon: string;
    genres: string[];
    genreIds: string[];
    primaryGenre: string;
    primaryGenreId: number;
    contentRating: string;
    languages: string[];
    size: string;
    requiredOsVersion: string;
    released: string;
    updated: string;
    releaseNotes: string;
    version: string;
    price: number;
    currency: string;
    free: boolean;
    developerId: number;
    developer: string;
    developerUrl: string;
    developerWebsite: string;
    score: number;
    reviews: number;
    currentVersionScore: number;
    currentVersionReviews: number;
    screenshots: string[];
    ipadScreenshots: string[];
    appletvScreenshots: string[];
    supportedDevices: string[];
  }>;

  export function reviews(options: { 
    id: string, 
    country?: string, 
    page?: number, 
    sort?: any 
  }): Promise<Array<{
    id: string;
    userName: string;
    userUrl: string;
    version: string;
    score: number;
    title: string;
    text: string;
    url: string;
    date: string;
  }>>;

  export const sort: {
    RECENT: number;
    HELPFUL: number;
  };
}

declare module 'google-play-scraper' {
  export function app(options: { appId: string, lang?: string, country?: string }): Promise<{
    title: string;
    description: string;
    descriptionHTML: string;
    summary: string;
    installs: string;
    minInstalls: number;
    maxInstalls: number;
    score: number;
    scoreText: string;
    ratings: number;
    reviews: number;
    histogram: { '1': number, '2': number, '3': number, '4': number, '5': number };
    price: number;
    free: boolean;
    currency: string;
    priceText: string;
    offersIAP: boolean;
    IAPRange: string;
    androidVersion: string;
    androidVersionText: string;
    developer: string;
    developerId: string;
    developerEmail: string;
    developerWebsite: string;
    developerAddress: string;
    privacyPolicy: string;
    developerInternalID: string;
    genre: string;
    genreId: string;
    icon: string;
    headerImage: string;
    screenshots: string[];
    video: string;
    videoImage: string;
    contentRating: string;
    contentRatingDescription: string;
    adSupported: boolean;
    released: string;
    updated: number;
    version: string;
    recentChanges: string;
    comments: string[];
    appId: string;
    url: string;
  }>;

  export function reviews(options: { 
    appId: string, 
    lang?: string, 
    country?: string, 
    sort?: any, 
    num?: number,
    paginate?: boolean,
    nextPaginationToken?: string | null
  }): Promise<{
    data: Array<{
      id: string;
      userName: string;
      userImage: string;
      date: string;
      score: number;
      scoreText: string;
      url: string;
      title: string;
      text: string;
      replyDate: string;
      replyText: string;
      version: string;
      thumbsUp: number;
      criterias: Array<{
        criteria: string;
        rating: number;
      }>;
    }>;
    nextPaginationToken?: string;
  }>;

  export const sort: {
    NEWEST: number;
    RATING: number;
    HELPFULNESS: number;
  };
} 