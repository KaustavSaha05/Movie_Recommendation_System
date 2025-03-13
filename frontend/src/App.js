import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Pagination,
  Box,
  Drawer,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import RatingStars from './components/RatingStars';
import Chatbot from './components/Chatbot';
import './styles/theme.css';
import './styles/fonts.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const ITEMS_PER_PAGE = 12;
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  const fetchMovies = async (query = searchQuery, rating = selectedRating) => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = '/movies';
      let params = {
        page: currentPage,
        per_page: ITEMS_PER_PAGE
      };

      if (query) {
        endpoint = '/search';
        params.q = query;
      }

      if (rating > 0) {
        endpoint = '/recommendations/rating';
        params.genre = query;
        params.min_rating = rating;
      }

      const method = rating > 0 ? 'post' : 'get';
      const requestConfig = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        ...(method === 'get' ? { params } : { data: params })
      };

      const response = await axios(requestConfig);

      if (response.data) {
        const movieData = response.data.recommendations || response.data.movies || response.data.results;
        setMovies(movieData);
        setTotalPages(query || rating > 0 ? 1 : Math.ceil(response.data.total / ITEMS_PER_PAGE));
        
        if (rating > 0) {
          showNotification(`Showing ${query ? query + ' movies' : 'movies'} rated ${rating} stars or higher`, 'success');
        }
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to fetch movies. Please try again later.');
      showNotification('Error fetching movies. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    await fetchMovies(searchQuery, selectedRating);
  };

  const handleRatingChange = async (rating) => {
    try {
      setSelectedRating(rating);
      setLoading(true);
      setError(null);
      await fetchMovies(searchQuery, rating);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch recommendations. Please try again.');
      showNotification('Error fetching recommendations. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="app-container">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography 
          variant="h2" 
          className="neon-text main-title"
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontFamily: 'Orbitron',
            letterSpacing: '2px'
          }}
        >
          Movie Recommendations
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSearch} className="search-section">
              <TextField
                fullWidth
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies..."
                className="search-input"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'var(--neon-blue)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--neon-purple)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--neon-pink)',
                    },
                  },
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                className="neon-button"
                sx={{ ml: 2 }}
              >
                Search
              </Button>
            </form>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              className="neon-button chat-button"
              onClick={() => setChatOpen(true)}
              fullWidth
            >
              Open Movie Chatbot
            </Button>
          </Grid>

          <Grid item xs={12}>
            <RatingStars onRatingChange={handleRatingChange} />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            </Grid>
          )}

          {loading ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: 'var(--neon-blue)' }} />
            </Grid>
          ) : (
            <>
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {movies.map((movie) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={movie.movieId}>
                      <Card 
                        className="movie-card"
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid var(--neon-blue)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 0 20px var(--neon-purple)',
                          }
                        }}
                      >
                        <CardContent>
                          <Typography 
                            variant="h6" 
                            className="movie-title"
                            sx={{
                              color: 'var(--neon-pink)',
                              fontFamily: 'Orbitron',
                              mb: 1
                            }}
                          >
                            {movie.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="textSecondary"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontFamily: 'Rajdhani'
                            }}
                          >
                            {Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}
                          </Typography>
                          {movie.rating && (
                            <Typography 
                              variant="body1"
                              sx={{
                                mt: 1,
                                color: 'var(--neon-blue)',
                                fontFamily: 'Rajdhani'
                              }}
                            >
                              Rating: {movie.rating.toFixed(1)}/5
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {totalPages > 1 && (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'white',
                        '&.Mui-selected': {
                          backgroundColor: 'var(--neon-purple)',
                        },
                      },
                    }}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Container>

      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            backgroundColor: '#000',
            borderLeft: '1px solid var(--neon-blue)',
          },
        }}
      >
        <Chatbot onClose={() => setChatOpen(false)} />
      </Drawer>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App; 