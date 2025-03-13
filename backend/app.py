from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Load and preprocess data
def load_data():
    try:
        movies = pd.read_csv(r'C:\Movie_recommendation_2\ml-25m\ml-25m\movies.csv')
        ratings = pd.read_csv(r'C:\Movie_recommendation_2\ml-25m\ml-25m\ratings.csv')
        # Convert movieId to integer type explicitly
        movies['movieId'] = movies['movieId'].astype(int)
        ratings['movieId'] = ratings['movieId'].astype(int)
        return movies, ratings
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        raise

# Create feature matrix
def create_feature_matrix(movies):
    # Ensure genres is string type
    movies['genres'] = movies['genres'].fillna('')
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(movies['genres'])
    return tfidf_matrix

# Initialize data
try:
    print("Loading movie data...")
    movies_df, ratings_df = load_data()
    print(f"Loaded {len(movies_df)} movies and {len(ratings_df)} ratings")
    print("Creating feature matrix...")
    feature_matrix = create_feature_matrix(movies_df)
    print("Feature matrix created successfully")
except Exception as e:
    print(f"Error during initialization: {str(e)}")
    movies_df = pd.DataFrame()
    ratings_df = pd.DataFrame()
    feature_matrix = None

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        movie_id = int(data.get('movieId'))  # Convert to int explicitly
        n_recommendations = int(data.get('n', 5))

        if not movie_id:
            return jsonify({'error': 'Invalid movie ID'}), 400

        # Get movie index
        movie_idx = movies_df[movies_df['movieId'] == movie_id].index
        if len(movie_idx) == 0:
            return jsonify({'error': 'Movie not found'}), 404
        movie_idx = movie_idx[0]

        # Calculate similarity scores
        sim_scores = cosine_similarity(feature_matrix[movie_idx:movie_idx+1], feature_matrix).flatten()
        similar_indices = sim_scores.argsort()[::-1][1:n_recommendations+1]

        # Get recommended movies
        recommendations = movies_df.iloc[similar_indices][['movieId', 'title', 'genres']].to_dict('records')
        
        return jsonify({
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"Error in recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/movies', methods=['GET'])
def get_movies():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # Convert genres string to list and handle the data
        movies_page = movies_df.iloc[start_idx:end_idx].apply(
            lambda x: {
                'movieId': int(x['movieId']),
                'title': x['title'],
                'genres': x['genres'].split('|') if isinstance(x['genres'], str) else []
            },
            axis=1
        ).tolist()
        
        total_movies = len(movies_df)
        
        return jsonify({
            'movies': movies_page,
            'total': total_movies,
            'page': page,
            'per_page': per_page
        })
    
    except Exception as e:
        print(f"Error in get_movies: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_movies():
    try:
        query = request.args.get('q', '').lower()
        if not query:
            return jsonify({'movies': []}), 200

        filtered_movies = movies_df[movies_df['title'].str.lower().str.contains(query, na=False)]
        results = filtered_movies.head(10).apply(
            lambda x: {
                'movieId': int(x['movieId']),
                'title': x['title'],
                'genres': x['genres'].split('|') if isinstance(x['genres'], str) else []
            },
            axis=1
        ).tolist()
        
        return jsonify({'movies': results})
    
    except Exception as e:
        print(f"Error in search: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/mood', methods=['POST'])
def get_mood_recommendations():
    try:
        data = request.json
        mood = data.get('mood', '')
        
        if not mood:
            return jsonify({'error': 'Mood parameter is required'}), 400

        if mood == 'popular':
            # Get popular movies with good ratings
            avg_ratings = ratings_df.groupby('movieId')['rating'].agg(['mean', 'count']).reset_index()
            popular_movies = avg_ratings[
                (avg_ratings['count'] >= 1000) &  # Increased minimum ratings
                (avg_ratings['mean'] >= 3.5)      # Added minimum rating threshold
            ].sort_values(['mean', 'count'], ascending=[False, False])
            
            recommended_movies = movies_df[movies_df['movieId'].isin(popular_movies['movieId'].head(10))]
            
            # Merge with ratings data
            recommended_movies = recommended_movies.merge(
                popular_movies,
                on='movieId',
                how='left'
            )
        else:
            # Split genres and create pattern
            genres = mood.split('|')
            genre_pattern = '|'.join(genres)
            
            # Filter movies by genre
            mask = movies_df['genres'].str.contains(genre_pattern, case=False, na=False)
            filtered_movies = movies_df[mask]
            
            if len(filtered_movies) == 0:
                return jsonify({'error': 'No movies found for these genres'}), 404
            
            # Get average ratings for filtered movies
            avg_ratings = ratings_df[ratings_df['movieId'].isin(filtered_movies['movieId'])] \
                .groupby('movieId')['rating'] \
                .agg(['mean', 'count']) \
                .reset_index()
            
            # Filter for movies with sufficient ratings and good average
            good_movies = avg_ratings[
                (avg_ratings['count'] >= 100) &   # Minimum number of ratings
                (avg_ratings['mean'] >= 3.0)      # Minimum average rating
            ].sort_values(['mean', 'count'], ascending=[False, False])
            
            # Merge movies with their ratings
            recommended_movies = filtered_movies.merge(
                good_movies,
                on='movieId',
                how='inner'
            ).head(10)  # Increased to 10 recommendations

        # Prepare response
        recommendations = []
        for _, movie in recommended_movies.iterrows():
            recommendations.append({
                'movieId': int(movie['movieId']),
                'title': movie['title'],
                'genres': movie['genres'].split('|') if isinstance(movie['genres'], str) else [],
                'rating': round(float(movie['mean']), 1),
                'numRatings': int(movie['count'])
            })
        
        return jsonify({
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"Error in mood recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/rating', methods=['POST'])
def get_rating_recommendations():
    try:
        data = request.json
        min_rating = float(data.get('min_rating', 0))
        genre_query = data.get('genre', '').lower()
        
        if min_rating < 0 or min_rating > 5:
            return jsonify({'error': 'Rating must be between 0 and 5'}), 400

        # Calculate average ratings for all movies
        avg_ratings = ratings_df.groupby('movieId').agg({
            'rating': ['mean', 'count']
        }).reset_index()
        
        avg_ratings.columns = ['movieId', 'mean_rating', 'rating_count']
        
        # Filter by minimum rating and rating count
        filtered_ratings = avg_ratings[
            (avg_ratings['mean_rating'] >= min_rating) & 
            (avg_ratings['rating_count'] >= 100)
        ]
        
        # Get the movies that match these ratings
        recommended_movies = movies_df[movies_df['movieId'].isin(filtered_ratings['movieId'])]
        
        # If genre is specified, filter by genre
        if genre_query:
            recommended_movies = recommended_movies[
                recommended_movies['genres'].str.lower().str.contains(genre_query, na=False)
            ]
        
        # Sort by rating and count
        movie_ratings = filtered_ratings[filtered_ratings['movieId'].isin(recommended_movies['movieId'])]
        sorted_movies = recommended_movies.merge(movie_ratings, on='movieId')
        sorted_movies = sorted_movies.sort_values(
            ['mean_rating', 'rating_count'], 
            ascending=[False, False]
        )
        
        # Take top 20 movies
        top_movies = sorted_movies.head(20)
        
        recommendations = []
        for _, movie in top_movies.iterrows():
            recommendations.append({
                'movieId': int(movie['movieId']),
                'title': movie['title'],
                'genres': movie['genres'].split('|') if isinstance(movie['genres'], str) else [],
                'rating': round(float(movie['mean_rating']), 1),
                'numRatings': int(movie['rating_count'])
            })
        
        return jsonify({
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"Error in rating recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0') 