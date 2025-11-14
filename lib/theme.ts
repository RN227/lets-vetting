'use client';

import { createTheme } from '@mui/material/styles';

// Brand colors matching current design
const brandColors = {
  primary: '#073F6C',
  primaryHover: '#256193',
  secondary: '#4ECDC4',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceHover: '#F8F8F8',
  textPrimary: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#737373',
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
};

// Create Material UI theme matching LetsVet brand
export const letsVetTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary,
      dark: brandColors.primaryHover,
      light: '#2D6A9F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.secondary,
      contrastText: '#FFFFFF',
    },
    background: {
      default: brandColors.background,
      paper: brandColors.surface,
    },
    text: {
      primary: brandColors.textPrimary,
      secondary: brandColors.textSecondary,
      disabled: brandColors.textTertiary,
    },
    divider: brandColors.border,
    action: {
      hover: brandColors.surfaceHover,
      selected: brandColors.surfaceHover,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.25rem', // 36px
      fontWeight: 400,
      letterSpacing: '-0.022em',
      lineHeight: 1.25,
      '@media (min-width:600px)': {
        fontSize: '2.5rem', // 40px
      },
    },
    h2: {
      fontSize: '1.875rem', // 30px
      fontWeight: 400,
      letterSpacing: '-0.022em',
      lineHeight: 1.25,
      '@media (min-width:600px)': {
        fontSize: '2.25rem', // 36px
      },
    },
    h3: {
      fontSize: '1.5rem', // 24px
      fontWeight: 500,
      letterSpacing: '-0.022em',
      lineHeight: 1.25,
      '@media (min-width:600px)': {
        fontSize: '1.875rem', // 30px
      },
    },
    body1: {
      fontSize: '1rem', // 16px
      lineHeight: 1.65,
      letterSpacing: '-0.011em',
      color: brandColors.textSecondary,
    },
    body2: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.65,
      letterSpacing: '-0.011em',
      color: brandColors.textSecondary,
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '-0.011em',
      fontSize: '0.875rem', // 14px
    },
  },
  shape: {
    borderRadius: 8, // Matches current rounded-xl (12px) but slightly more Material-like
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.02)', // shadow-sm
    '0 1px 3px 0 rgb(0 0 0 / 0.05)', // shadow
    '0 4px 6px -1px rgb(0 0 0 / 0.04)', // shadow-md
    '0 10px 15px -3px rgb(0 0 0 / 0.06)', // shadow-lg
    '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ] as any, // MUI expects specific shadow format
  components: {
    // Button customizations
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: '44px', // Touch target
          padding: '12px 24px',
          borderRadius: '12px', // rounded-xl
          textTransform: 'uppercase',
          fontWeight: 700,
          fontSize: '0.875rem',
          letterSpacing: '-0.011em',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.02)',
          '&:hover': {
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
            transform: 'scale(0.98)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: brandColors.primaryHover,
          },
        },
      },
    },
    // TextField customizations
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '& fieldset': {
              borderColor: brandColors.border,
            },
            '&:hover fieldset': {
              borderColor: brandColors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.primary,
              borderWidth: '1px',
            },
          },
        },
      },
    },
    // Card customizations
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.02)',
          border: `1px solid ${brandColors.border}`,
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.04)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease-out',
        },
      },
    },
    // Paper customizations
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

// Export brand colors for use in Tailwind or other contexts
export { brandColors };

