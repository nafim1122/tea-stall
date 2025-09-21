import React, { useReducer, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { authAPI } from '../services/api';
import { toast } from 'sonner';
import { AuthContext, AuthContextType, authReducer } from './auth-context';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user, token } 
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Save auth data to localStorage whenever state changes
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.token) {
      localStorage.setItem('authToken', state.token);
      localStorage.setItem('userData', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }, [state.isAuthenticated, state.user, state.token]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.login(credentials);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      });
      
      toast.success(response.message || 'Login successful!');
      return true;
    } catch (error) {
      // Fallback for when backend is not available - check for admin credentials
      if (credentials.email === 'admin@teatime.com' && credentials.password === 'admin123') {
        const mockAdminUser = {
          id: 'admin-1',
          name: 'Tea Stall Admin',
          email: 'admin@teatime.com',
          phone: '+8801742236623',
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const mockToken = 'mock-admin-token-' + Date.now();
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user: mockAdminUser, token: mockToken } 
        });
        
        toast.success('Admin login successful! (Offline mode)');
        return true;
      }
      
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login failed. Please try again.'
        : 'Login failed. Please try again.';
      toast.error(message);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.register(data);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      });
      
      toast.success(response.message || 'Registration successful!');
      return true;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Registration failed. Please try again.'
        : 'Registration failed. Please try again.';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    // Clear any other user-related data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    toast.info('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!state.user) return false;
      
      const updatedUser = await authAPI.updateProfile(state.user.id, data);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      const message = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to update profile'
        : 'Failed to update profile';
      toast.error(message);
      return false;
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      if (!state.token) return;
      
      const user = await authAPI.getProfile();
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}