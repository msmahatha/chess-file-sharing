import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('chessUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login if credentials match any registered user
      const users = JSON.parse(localStorage.getItem('chessUsers') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('chessUser', JSON.stringify(userWithoutPassword));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll store users in localStorage
      const users = JSON.parse(localStorage.getItem('chessUsers') || '[]');
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // In a real app, this would be hashed
      };
      
      users.push(newUser);
      localStorage.setItem('chessUsers', JSON.stringify(users));
      
      // Auto login after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('chessUser', JSON.stringify(userWithoutPassword));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chessUser');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};