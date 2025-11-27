export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // Decode JWT token (without verification, just to check expiration)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const clearInvalidAuth = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    // Skip validation if we're in the middle of login process
    const isLoggingIn = sessionStorage.getItem('isLoggingIn');
    if (isLoggingIn) return;
    
    if (token && !isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('logout'));
    }
  }
};
