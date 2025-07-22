import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight as ChessKnight, LogOut, BarChart2, Upload, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-purple-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <ChessKnight className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">ChessMaster</span>
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center px-3 py-2 rounded-md hover:bg-purple-700 transition">
                <Home className="h-5 w-5 mr-1" />
                <span>Home</span>
              </Link>
              <Link to="/analysis" className="flex items-center px-3 py-2 rounded-md hover:bg-purple-700 transition">
                <BarChart2 className="h-5 w-5 mr-1" />
                <span>Analysis</span>
              </Link>
              <Link to="/upload" className="flex items-center px-3 py-2 rounded-md hover:bg-purple-700 transition">
                <Upload className="h-5 w-5 mr-1" />
                <span>Upload</span>
              </Link>
              <div className="border-l border-purple-600 h-6 mx-2"></div>
              <div className="text-sm font-medium mr-2">
                {user.username}
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md hover:bg-purple-700 transition"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;