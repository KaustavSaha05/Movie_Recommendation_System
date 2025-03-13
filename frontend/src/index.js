import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './styles/theme.css';
import './index.css';
import App from './App';

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f3ff', // neon blue
    },
    secondary: {
      main: '#ff00ff', // neon pink
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(10, 10, 10, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    }
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: 'Orbitron',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Orbitron',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Orbitron',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'Rajdhani',
    },
    body2: {
      fontFamily: 'Rajdhani',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --neon-blue: #00f3ff;
          --neon-pink: #ff00ff;
          --neon-purple: #bc13fe;
          --dark-bg: #0a0a0a;
          --darker-bg: #050505;
        }
        
        body {
          background-color: var(--dark-bg);
          color: #ffffff;
          min-height: 100vh;
        }

        ::-webkit-scrollbar {
          width: 8px;
          background-color: var(--darker-bg);
        }

        ::-webkit-scrollbar-thumb {
          background-color: var(--neon-purple);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-track {
          background-color: var(--darker-bg);
        }
      `
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Orbitron',
          borderRadius: 4,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 243, 255, 0.1)',
        },
      },
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 