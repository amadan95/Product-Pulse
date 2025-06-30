# Product Pulse

A full-stack web application designed to capture and analyze user reviews from the Apple App Store and Google Play Store. This tool provides insights into user feedback through AI-powered theme extraction and sentiment analysis.

## Features

- **Home Page**: List and filter apps by platform, rating, and pain points
- **App Detail Page**: 
  - Aggregate scores across multiple dimensions (Performance, UI, Stability, Features, Support)
  - Interactive charts showing rating trends over time
  - AI-powered theme analysis that extracts common topics from reviews
  - Detailed review browser with filtering capabilities
- **Submit Review**: Internal tool to manually submit reviews with detailed ratings

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Charts**: Chart.js with react-chartjs-2
- **AI**: OpenAI API (GPT-3.5 Turbo) for theme extraction
- **Data Sources**:
  - google-play-scraper for Android app reviews
  - app-store-scraper for iOS app reviews

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/product-pulse.git
cd product-pulse
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file based on the example
```bash
cp env.local.example .env.local
```

4. Add your OpenAI API key to the `.env.local` file
```
OPENAI_API_KEY=your_api_key_here
```

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Routes

- `/api/apps` - Get all apps
- `/api/apps/[id]` - Get details for a specific app
- `/api/reviews/[platform]/[appId]` - Get reviews for a specific app
- `/api/reviews` - Submit a new review
- `/api/analyze` - Analyze reviews and extract themes

## Future Enhancements

- Database storage for long-term review tracking
- Periodic background fetching with cron jobs
- User authentication for internal teams
- Custom theme training for specific product categories
- Competitor comparison views

## License

MIT
