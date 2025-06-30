from flask import Flask, jsonify, request
from flask_cors import CORS
from google_play_scraper import app as app_details
from google_play_scraper import reviews, Sort
import pandas as pd
import json
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

@app.route('/api/app/<app_id>', methods=['GET'])
def get_app_details(app_id):
    """Get app details from Google Play Store"""
    try:
        # Get country from query params or default to 'us'
        country = request.args.get('country', 'us')
        
        # Fetch app details
        result = app_details(
            app_id,
            lang='en',
            country=country
        )
        
        # Convert to serializable format
        app_data = {
            "id": app_id,
            "name": result.get('title', ''),
            "platform": "android",
            "icon": result.get('icon', ''),
            "averageRating": result.get('score', 0),
            "totalReviews": result.get('reviews', 0),
            "description": result.get('description', ''),
            "installs": result.get('installs', ''),
            "developer": result.get('developer', ''),
            "genre": result.get('genre', ''),
            "price": result.get('price', 0),
            "contentRating": result.get('contentRating', ''),
            "updated": result.get('updated', ''),
            "version": result.get('version', '')
        }
        
        return jsonify(app_data)
    except Exception as e:
        print(f"Error fetching app details for {app_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/reviews/<app_id>', methods=['GET'])
def get_app_reviews(app_id):
    """Get app reviews from Google Play Store"""
    try:
        # Get parameters from query string
        count = int(request.args.get('count', 50))
        country = request.args.get('country', 'us')
        sort_order = request.args.get('sort', 'newest')
        
        # Map sort parameter to Sort enum
        sort_map = {
            'newest': Sort.NEWEST,
            'rating': Sort.RATING,
            'relevance': Sort.RELEVANCE,
        }
        
        sort_type = sort_map.get(sort_order.lower(), Sort.NEWEST)
        
        # Fetch reviews
        result, continuation_token = reviews(
            app_id,
            lang='en',
            country=country,
            sort=sort_type,
            count=count
        )
        
        # Process reviews
        reviews_list = []
        for review in result:
            review_data = {
                "id": review.get('reviewId', ''),
                "userName": review.get('userName', 'Anonymous User'),
                "content": review.get('content', ''),
                "score": review.get('score', 0),
                "thumbsUp": review.get('thumbsUp', 0),
                "thumbsDown": 0,  # Not provided by API
                "date": review.get('at', ''),
                "platform": "android",
                "version": review.get('reviewCreatedVersion', '1.0.0'),
                "replyContent": review.get('replyContent', ''),
                "replyDate": review.get('repliedAt', '')
            }
            reviews_list.append(review_data)
            
        return jsonify(reviews_list)
    except Exception as e:
        print(f"Error fetching reviews for {app_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/top-apps/<category>', methods=['GET'])
def get_top_apps(category):
    """Get top apps in a category"""
    try:
        from google_play_scraper import search
        
        # Get parameters from query string
        count = int(request.args.get('count', 10))
        country = request.args.get('country', 'us')
        
        # Search for apps in the category
        results = search(
            category,
            lang='en',
            country=country,
            n_hits=count
        )
        
        # Process results
        apps_list = []
        for app in results:
            app_data = {
                "id": app.get('appId', ''),
                "name": app.get('title', ''),
                "platform": "android",
                "icon": app.get('icon', ''),
                "score": app.get('score', 0),
                "developer": app.get('developer', ''),
                "price": app.get('price', 0),
                "free": app.get('free', True),
            }
            apps_list.append(app_data)
            
        return jsonify(apps_list)
    except Exception as e:
        print(f"Error fetching top apps for {category}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-reviews/<app_id>', methods=['GET'])
def analyze_reviews(app_id):
    """Analyze app reviews to extract themes and sentiment"""
    try:
        # Get parameters from query string
        count = int(request.args.get('count', 100))
        country = request.args.get('country', 'us')
        
        # Fetch reviews
        result, _ = reviews(
            app_id,
            lang='en',
            country=country,
            sort=Sort.NEWEST,
            count=count
        )
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(result)
        
        # Basic analysis
        if 'score' in df.columns:
            avg_rating = df['score'].mean()
            rating_counts = df['score'].value_counts().to_dict()
            
            # Simple sentiment categorization
            df['sentiment'] = df['score'].apply(lambda x: 'positive' if x >= 4 else ('neutral' if x == 3 else 'negative'))
            sentiment_counts = df['sentiment'].value_counts().to_dict()
            
            # Extract common words from positive and negative reviews
            # This is a very basic approach - in a real app you'd use NLP
            if 'content' in df.columns:
                df['content'] = df['content'].fillna('')
                
                # Extract common themes (very simple approach)
                themes = []
                
                # Performance theme
                performance_keywords = ['slow', 'fast', 'crash', 'bug', 'freeze', 'loading']
                performance_reviews = df[df['content'].str.lower().str.contains('|'.join(performance_keywords), na=False)]
                if len(performance_reviews) > 0:
                    themes.append({
                        "id": "theme-performance",
                        "name": "Performance",
                        "type": "pain" if performance_reviews['score'].mean() < 3 else "wow",
                        "confidence": 0.8,
                        "reviewCount": len(performance_reviews),
                        "summary": f"Users are discussing app performance with average rating {performance_reviews['score'].mean():.1f}/5",
                        "reviews": performance_reviews['reviewId'].tolist()
                    })
                
                # UI theme
                ui_keywords = ['design', 'interface', 'ui', 'layout', 'look', 'beautiful', 'ugly']
                ui_reviews = df[df['content'].str.lower().str.contains('|'.join(ui_keywords), na=False)]
                if len(ui_reviews) > 0:
                    themes.append({
                        "id": "theme-ui",
                        "name": "User Interface",
                        "type": "pain" if ui_reviews['score'].mean() < 3 else "wow",
                        "confidence": 0.7,
                        "reviewCount": len(ui_reviews),
                        "summary": f"Users are commenting on the app's interface with average rating {ui_reviews['score'].mean():.1f}/5",
                        "reviews": ui_reviews['reviewId'].tolist()
                    })
                
                # Features theme
                feature_keywords = ['feature', 'functionality', 'option', 'missing', 'need', 'add']
                feature_reviews = df[df['content'].str.lower().str.contains('|'.join(feature_keywords), na=False)]
                if len(feature_reviews) > 0:
                    themes.append({
                        "id": "theme-features",
                        "name": "Features",
                        "type": "pain" if feature_reviews['score'].mean() < 3 else "wow",
                        "confidence": 0.75,
                        "reviewCount": len(feature_reviews),
                        "summary": f"Users are discussing app features with average rating {feature_reviews['score'].mean():.1f}/5",
                        "reviews": feature_reviews['reviewId'].tolist()
                    })
            
            analysis = {
                "averageRating": avg_rating,
                "ratingCounts": rating_counts,
                "sentimentCounts": sentiment_counts,
                "totalReviews": len(df),
                "themes": themes
            }
            
            return jsonify(analysis)
        else:
            return jsonify({"error": "No score data available in reviews"}), 500
    except Exception as e:
        print(f"Error analyzing reviews for {app_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
