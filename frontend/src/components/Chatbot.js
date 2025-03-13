import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// Add these CSS variables at the top of your component
const styles = {
  chatContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: '#000',
    color: '#fff',
    backgroundImage: 'linear-gradient(to bottom right, #000000, #1a1a2e)',
  },
  header: {
    p: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '2px solid var(--neon-purple)',
    background: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    fontFamily: 'Cyberpunk',
    color: 'var(--neon-pink)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '0 0 10px var(--neon-pink)',
  },
  closeButton: {
    color: 'var(--neon-purple)',
    '&:hover': {
      color: 'var(--neon-pink)',
    },
  },
  messageContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(26, 26, 46, 0.3)',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'var(--neon-purple)',
      borderRadius: '4px',
    },
  },
  botMessage: {
    p: 2,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    bgcolor: 'rgba(147, 51, 234, 0.1)',
    border: '1px solid var(--neon-purple)',
    borderRadius: '10px 10px 10px 0',
    color: '#fff',
    whiteSpace: 'pre-line',
    boxShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
  },
  userMessage: {
    p: 2,
    maxWidth: '80%',
    alignSelf: 'flex-end',
    bgcolor: 'rgba(236, 72, 153, 0.1)',
    border: '1px solid var(--neon-pink)',
    borderRadius: '10px 10px 0 10px',
    color: '#fff',
    whiteSpace: 'pre-line',
    boxShadow: '0 0 10px rgba(236, 72, 153, 0.2)',
  },
  messageText: {
    fontFamily: 'Exo 2',
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  inputContainer: {
    p: 2,
    borderTop: '2px solid var(--neon-purple)',
    display: 'flex',
    gap: 1,
    background: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      fontFamily: 'Exo 2',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      '& fieldset': {
        borderColor: 'var(--neon-purple)',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: 'var(--neon-pink)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--neon-pink)',
      },
    },
  },
  sendButton: {
    backgroundColor: 'var(--neon-purple)',
    color: '#fff',
    fontFamily: 'Cyberpunk',
    letterSpacing: '1px',
    '&:hover': {
      backgroundColor: 'var(--neon-pink)',
    },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(147, 51, 234, 0.3)',
    },
  },
};

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      text: 'Hi! I can help you find movies based on your mood or preferences. Try saying things like:\n• "I want to watch something funny"\n• "Show me action movies"\n• "I\'m feeling sad"\n• "Recommend some sci-fi movies"\n\nWhat kind of movies would you like to watch?',
      isBot: true 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const analyzeMoodAndGenre = (text) => {
    const moodAndGenreMap = {
      'happy': {
        keywords: ['happy', 'joy', 'cheerful', 'good', 'great', 'wonderful', 'fantastic', 'uplifting'],
        genres: 'Comedy|Animation|Family'
      },
      'sad': {
        keywords: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'gloomy', 'melancholy'],
        genres: 'Drama|Romance'
      },
      'excited': {
        keywords: ['excited', 'thrilled', 'energetic', 'pumped', 'adventure', 'action', 'epic'],
        genres: 'Action|Adventure'
      },
      'scared': {
        keywords: ['scared', 'frightened', 'horror', 'spooky', 'thriller', 'creepy', 'terrifying'],
        genres: 'Horror|Thriller'
      },
      'relaxed': {
        keywords: ['relaxed', 'calm', 'peaceful', 'chill', 'quiet', 'soothing'],
        genres: 'Documentary|Drama'
      },
      'romantic': {
        keywords: ['love', 'romance', 'romantic', 'relationship', 'date', 'couples'],
        genres: 'Romance|Drama'
      },
      // Direct genre matches
      'action': {
        keywords: ['action', 'fighting', 'explosive', 'combat', 'battle'],
        genres: 'Action'
      },
      'comedy': {
        keywords: ['comedy', 'funny', 'laugh', 'humorous', 'hilarious'],
        genres: 'Comedy'
      },
      'drama': {
        keywords: ['drama', 'dramatic', 'serious', 'intense', 'emotional'],
        genres: 'Drama'
      },
      'scifi': {
        keywords: ['sci-fi', 'science fiction', 'space', 'future', 'technology', 'alien'],
        genres: 'Sci-Fi'
      },
      'fantasy': {
        keywords: ['fantasy', 'magical', 'magic', 'mythical', 'supernatural'],
        genres: 'Fantasy'
      },
      'thriller': {
        keywords: ['thriller', 'suspense', 'mysterious', 'intense', 'suspenseful'],
        genres: 'Thriller'
      },
      'horror': {
        keywords: ['horror', 'scary', 'frightening', 'terror', 'creepy'],
        genres: 'Horror'
      },
      'adventure': {
        keywords: ['adventure', 'quest', 'journey', 'exploration'],
        genres: 'Adventure'
      },
      'animation': {
        keywords: ['animation', 'animated', 'cartoon', 'pixar', 'disney'],
        genres: 'Animation'
      },
      'documentary': {
        keywords: ['documentary', 'educational', 'real', 'true story', 'historical'],
        genres: 'Documentary'
      }
    };

    const userTextLower = text.toLowerCase();
    
    // First try to find direct genre mentions or mood matches
    for (const [category, data] of Object.entries(moodAndGenreMap)) {
      if (data.keywords.some(keyword => userTextLower.includes(keyword))) {
        return {
          mood: category,
          genres: data.genres,
          isGenre: !['happy', 'sad', 'excited', 'scared', 'relaxed', 'romantic'].includes(category)
        };
      }
    }

    // If no specific match is found, return popular
    return {
      mood: 'general',
      genres: 'popular',
      isGenre: false
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsTyping(true);

    try {
      const analysis = analyzeMoodAndGenre(userMessage);
      let botResponse = '';

      if (analysis.genres === 'popular') {
        botResponse = "I'll show you some popular movies that many people enjoy!";
      } else {
        botResponse = analysis.isGenre
          ? `I'll find some great ${analysis.mood} movies for you!`
          : `Based on your ${analysis.mood} mood, I think you might enjoy these movies:`;
      }

      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
      
      const response = await axios.post('http://localhost:5000/api/recommendations/mood', {
        mood: analysis.genres
      });

      if (response.data && response.data.recommendations) {
        const movieList = response.data.recommendations
          .map(movie => `• ${movie.title} (${Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres})`)
          .join('\n');

        setMessages(prev => [...prev, { 
          text: `Here are some movies you might enjoy:\n${movieList}\n\nWould you like more recommendations? You can ask for a different genre or tell me how you're feeling!`, 
          isBot: true 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I had trouble finding recommendations. Please try describing what kind of movies you're looking for differently.",
        isBot: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={styles.chatContainer}>
      <Box sx={styles.header}>
        <Typography variant="h6" sx={styles.headerTitle}>
          Movie Oracle
        </Typography>
        <IconButton onClick={onClose} sx={styles.closeButton}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={styles.messageContainer}>
        {messages.map((message, index) => (
          <Paper
            key={index}
            sx={message.isBot ? styles.botMessage : styles.userMessage}
          >
            <Typography sx={styles.messageText}>
              {message.text}
            </Typography>
          </Paper>
        ))}
        {isTyping && (
          <Paper sx={styles.botMessage}>
            <Typography sx={styles.messageText}>
              Thinking...
            </Typography>
          </Paper>
        )}
      </Box>

      <Box sx={styles.inputContainer}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          sx={styles.inputField}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!input.trim()}
          sx={styles.sendButton}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chatbot; 