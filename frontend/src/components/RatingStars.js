import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

const RatingStars = ({ onRatingChange }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseMove = (e, starIndex) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    
    // If mouse is on the left half of the star
    if (percent <= 0.5) {
      setHoverRating(starIndex + 0.5);
    } else {
      setHoverRating(starIndex + 1);
    }
  };

  const handleStarClick = (starIndex, e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    let newRating;
    
    if (percent <= 0.5) {
      // Clicking on left half
      newRating = starIndex + 0.5;
      // If already at this rating, clear it
      if (rating === newRating) {
        newRating = 0;
      }
    } else {
      // Clicking on right half
      newRating = starIndex + 1;
      // If already at this rating, set to half star
      if (rating === newRating) {
        newRating = starIndex + 0.5;
      }
    }
    
    setRating(newRating);
    setHoverRating(0);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const renderStar = (index) => {
    const currentRating = hoverRating || rating;
    const starValue = index + 1;
    
    if (currentRating >= starValue) {
      return (
        <StarIcon 
          className="star filled"
          sx={{ 
            fontSize: '2.5rem',
            color: 'var(--neon-purple)',
            filter: 'drop-shadow(0 0 2px var(--neon-purple))',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.2)',
              filter: 'drop-shadow(0 0 4px var(--neon-purple))',
            }
          }}
        />
      );
    } else if (currentRating === starValue - 0.5) {
      return (
        <StarHalfIcon 
          className="star half-filled"
          sx={{ 
            fontSize: '2.5rem',
            color: 'var(--neon-purple)',
            filter: 'drop-shadow(0 0 2px var(--neon-purple))',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.2)',
              filter: 'drop-shadow(0 0 4px var(--neon-purple))',
            }
          }}
        />
      );
    } else {
      return (
        <StarOutlineIcon 
          className="star"
          sx={{ 
            fontSize: '2.5rem',
            color: 'rgba(255, 255, 255, 0.3)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.2)',
              color: 'var(--neon-purple)',
            }
          }}
        />
      );
    }
  };

  return (
    <Box 
      className="rating-container"
      sx={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid var(--neon-blue)',
        marginBottom: '24px'
      }}
    >
      <Typography 
        variant="h6" 
        className="neon-text" 
        sx={{ 
          mb: 1,
          fontFamily: 'Orbitron',
          letterSpacing: '1px',
          color: 'var(--neon-blue)',
          textAlign: 'center'
        }}
      >
        Find Movies by Rating
      </Typography>
      <Box 
        className="rating-stars"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '16px 0'
        }}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <Box
            key={index}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={(e) => handleStarClick(index, e)}
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {renderStar(index)}
          </Box>
        ))}
        <Typography 
          variant="h6" 
          sx={{ 
            ml: 2,
            fontFamily: 'Rajdhani',
            color: 'var(--neon-blue)',
            minWidth: '80px',
            textAlign: 'center',
            fontSize: '1.5rem'
          }}
        >
          {(hoverRating || rating || 0).toFixed(1)}/5.0
        </Typography>
      </Box>
      {rating > 0 && (
        <Typography
          sx={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'Rajdhani',
            mt: 1
          }}
        >
          Showing movies rated {rating.toFixed(1)} stars or higher
        </Typography>
      )}
    </Box>
  );
};

export default RatingStars; 