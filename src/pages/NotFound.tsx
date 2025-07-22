import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight as ChessKnight, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <ChessKnight className="h-24 w-24 text-purple-600" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold text-gray-900">404 - Page Not Found</h1>
        <p className="mt-2 text-lg text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;