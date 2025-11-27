'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import ChatButton from './ChatButton';
import { isTokenValid, clearInvalidAuth } from '../../utils/auth';

interface ChatContextType {
  currentUserId: number | null;
  token: string | null;
  isAdmin: boolean;
  setUserData: (userId: number, token: string, isAdmin: boolean) => void;
  clearUserData: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const updateUserData = () => {
      if (typeof window !== 'undefined') {
        // Clear invalid auth first
        clearInvalidAuth();
        
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser && isTokenValid(storedToken)) {
          try {
            const user = JSON.parse(storedUser);
            setCurrentUserId(user.Id || user.id);
            setToken(storedToken);
            setIsAdmin(user.Role === 'Admin' || user.role === 'Admin');
          } catch (error) {
            console.error('Error parsing user data:', error);
            clearUserData();
          }
        } else {
          clearUserData();
        }
      }
    };

    // Load user data from localStorage on mount
    updateUserData();

    // Listen for localStorage changes (when user logs in/out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        // Immediate update for login, delayed for other changes
        if (e.newValue && !currentUserId) {
          // This is likely a login event - update immediately
          updateUserData();
        } else {
          // Other changes - add delay to avoid conflicts
          setTimeout(updateUserData, 200);
        }
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      clearUserData();
    };

    // Listen for custom login event for immediate updates
    const handleLogin = (e: CustomEvent) => {
      const { token, user } = e.detail;
      setCurrentUserId(user.Id || user.id);
      setToken(token);
      setIsAdmin(user.Role === 'Admin' || user.role === 'Admin');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogout);
    window.addEventListener('userLogin', handleLogin as EventListener);

    // Periodic token validation (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      updateUserData();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('userLogin', handleLogin as EventListener);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const setUserData = (userId: number, userToken: string, userIsAdmin: boolean) => {
    setCurrentUserId(userId);
    setToken(userToken);
    setIsAdmin(userIsAdmin);
  };

  const clearUserData = () => {
    setCurrentUserId(null);
    setToken(null);
    setIsAdmin(false);
    
    // Stop chat connection when user logs out
    import('../../services/chatService').then(module => {
      module.default.stopConnection();
    });
  };

  const value = {
    currentUserId,
    token,
    isAdmin,
    setUserData,
    clearUserData,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
      {/* Chat Button will be shown globally */}
      <ChatButton 
        currentUserId={currentUserId || undefined}
        token={token || undefined}
        isAdmin={isAdmin}
      />
    </ChatContext.Provider>
  );
};

export default ChatProvider;
