import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import axiosInstance from '../api/authPromise';

// Theme types and interfaces
export interface ThemeColors {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    light: string;
    dark: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
}

export interface Theme {
    id: string;
    name: string;
    colors: ThemeColors;
    isDark: boolean;
}

// Predefined themes
export const themes: Record<string, Theme> = {
    default: {
        id: 'default',
        name: 'SDA Default',
        colors: {
            primary: '#411b6b',
            secondary: '#6b581b',
            success: '#680909b2',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            light: '#f8f9fa',
            dark: '#343a40',
            background: 'rgba(142, 85, 153, 0.61)',
            surface: '#ffffff',
            text: '#212529',
            textSecondary: '#6c757d',
        },
        isDark: false,
    },
    dark: {
        id: 'dark',
        name: 'Dark Mode',
        colors: {
            primary: '#7c3aed',
            secondary: '#a855f7',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4',
            light: '#374151',
            dark: '#111827',
            background: '#1f2937',
            surface: '#374151',
            text: '#f9fafb',
            textSecondary: '#d1d5db',
        },
        isDark: true,
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean Blue',
        colors: {
            primary: '#0ea5e9',
            secondary: '#06b6d4',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            light: '#f0f9ff',
            dark: '#0c4a6e',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
            surface: '#ffffff',
            text: '#0f172a',
            textSecondary: '#475569',
        },
        isDark: false,
    },
    forest: {
        id: 'forest',
        name: 'Forest Green',
        colors: {
            primary: '#059669',
            secondary: '#10b981',
            success: '#22c55e',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4',
            light: '#f0fdf4',
            dark: '#064e3b',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            surface: '#ffffff',
            text: '#0f172a',
            textSecondary: '#475569',
        },
        isDark: false,
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset Orange',
        colors: {
            primary: '#ea580c',
            secondary: '#f97316',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4',
            light: '#fff7ed',
            dark: '#9a3412',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            surface: '#ffffff',
            text: '#0f172a',
            textSecondary: '#475569',
        },
        isDark: false,
    },
    royal: {
        id: 'royal',
        name: 'Royal Purple',
        colors: {
            primary: '#7c2d92',
            secondary: '#a855f7',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4',
            light: '#faf5ff',
            dark: '#581c87',
            background: 'linear-gradient(135deg, #7c2d92 0%, #a855f7 100%)',
            surface: '#ffffff',
            text: '#0f172a',
            textSecondary: '#475569',
        },
        isDark: false,
    },
};

export interface ThemeState {
    currentTheme: Theme;
    availableThemes: Theme[];
}

// Theme actions
type ThemeAction =
    | { type: 'SET_THEME'; payload: string }
    | { type: 'TOGGLE_DARK_MODE' }
    | { type: 'RESET_THEME' };

// Initial state
const initialState: ThemeState = {
    currentTheme: themes.default,
    availableThemes: Object.values(themes),
};

// Theme reducer
function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
    switch (action.type) {
        case 'SET_THEME':
            const newTheme = themes[action.payload];
            if (newTheme) {
                return {
                    ...state,
                    currentTheme: newTheme,
                };
            }
            return state;
        case 'TOGGLE_DARK_MODE':
            const darkTheme = state.currentTheme.isDark ? themes.default : themes.dark;
            return {
                ...state,
                currentTheme: darkTheme,
            };
        case 'RESET_THEME':
            return {
                ...state,
                currentTheme: themes.default,
            };
        default:
            return state;
    }
}

// Context interface
interface ThemeContextType {
    state: ThemeState;
    setTheme: (themeId: string) => void;
    toggleDarkMode: () => void;
    resetTheme: () => void;
    applyThemeToDOM: () => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [state, dispatch] = useReducer(themeReducer, initialState);

    // Apply theme to DOM
    const applyThemeToDOM = () => {
        const root = document.documentElement;
        const { colors } = state.currentTheme;

        // Set CSS custom properties
        root.style.setProperty('--bs-primary', colors.primary);
        root.style.setProperty('--bs-secondary', colors.secondary);
        root.style.setProperty('--bs-success', colors.success);
        root.style.setProperty('--bs-danger', colors.danger);
        root.style.setProperty('--bs-warning', colors.warning);
        root.style.setProperty('--bs-info', colors.info);
        root.style.setProperty('--bs-light', colors.light);
        root.style.setProperty('--bs-dark', colors.dark);

        // Custom properties
        root.style.setProperty('--theme-background', colors.background);
        root.style.setProperty('--theme-surface', colors.surface);
        root.style.setProperty('--theme-text', colors.text);
        root.style.setProperty('--theme-text-secondary', colors.textSecondary);

        // Add theme class to body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${state.currentTheme.id}`);

        if (state.currentTheme.isDark) {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
        }
    };

    // Load saved theme on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme && themes[savedTheme]) {
            dispatch({ type: 'SET_THEME', payload: savedTheme });
        }
    }, []);

    // Apply theme whenever it changes
    useEffect(() => {
        applyThemeToDOM();
        localStorage.setItem('selectedTheme', state.currentTheme.id);
    }, [state.currentTheme]);

    // Set theme function
    const setTheme = async (themeId: string) => {
        dispatch({ type: 'SET_THEME', payload: themeId });

        // Save theme preference to user profile
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await axiosInstance.put('/api/user/preferences', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                    data: JSON.stringify({
                        theme: themeId,
                    }),
                });
            }
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    };

    // Toggle dark mode function
    const toggleDarkMode = () => {
        dispatch({ type: 'TOGGLE_DARK_MODE' });
    };

    // Reset theme function
    const resetTheme = () => {
        dispatch({ type: 'RESET_THEME' });
    };

    const contextValue: ThemeContextType = {
        state,
        setTheme,
        toggleDarkMode,
        resetTheme,
        applyThemeToDOM,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook to use theme context
export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
