'use client';

import { useEffect } from 'react';
import { useChatContext } from '../components/chat/ChatProvider';

export const useAuth = () => {
  const { setUserData, clearUserData } = useChatContext();

  useEffect(() => {
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        updateChatContext();
      }
    };

    const updateChatContext = () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setUserData(
              user.Id || user.id, 
              storedToken, 
              user.Role === 'Admin' || user.role === 'Admin'
            );
          } catch (error) {
            console.error('Error parsing user data:', error);
            clearUserData();
          }
        } else {
          clearUserData();
        }
      }
    };

    // Initial update
    updateChatContext();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setUserData, clearUserData]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      clearUserData();
    }
  };

  return { logout };
};
