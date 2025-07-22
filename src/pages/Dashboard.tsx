import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { RotateCcw, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number | null>(null);

  function makeAMove(move: any) {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        setGame(gameCopy);
        
        // Update move history
        const pgn = gameCopy.history();
        setMoveHistory(pgn);
        setCurrentMoveIndex(pgn.length - 1);
        
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for simplicity
    });

    return move;
  }

  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    stopAutoPlay();
  };

  const flipBoard = () => {
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
  };

  const navigateToMove = (index: number) => {
    stopAutoPlay();
    
    if (index < -1 || index >= moveHistory.length) return;
    
    const newGame = new Chess();
    
    try {
      // Replay all moves up to the selected index
      for (let i = 0; i <= index; i++) {
        newGame.move(moveHistory[i]);
      }
      
      setGame(newGame);
      setCurrentMoveIndex(index);
    } catch (error) {
      console.error("Error navigating to move:", error);
      // If there's an error, reset to the beginning
      setGame(new Chess());
      setCurrentMoveIndex(-1);
    }
  };

  const startAutoPlay = () => {
    if (autoPlayInterval) return;
    
    const interval = window.setInterval(() => {
      setCurrentMoveIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= moveHistory.length) {
          stopAutoPlay();
          return prevIndex;
        }
        
        navigateToMove(nextIndex);
        return nextIndex;
      });
    }, 1000);
    
    setAutoPlayInterval(interval);
  };

  const stopAutoPlay = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  };

  const goToStart = () => navigateToMove(-1);
  const goToPrevious = () => navigateToMove(currentMoveIndex - 1);
  const goToNext = () => navigateToMove(currentMoveIndex + 1);
  const goToEnd = () => navigateToMove(moveHistory.length - 1);

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}!</h1>
            <p className="text-gray-600">Play a game or analyze your moves.</p>
          </div>
          
          <div className="md:flex">
            <div className="md:w-2/3 p-6">
              <div className="w-full max-w-[600px] mx-auto">
                <Chessboard 
                  position={game.fen()} 
                  onPieceDrop={onDrop} 
                  boardOrientation={boardOrientation}
                  customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#9333ea' }}
                  customLightSquareStyle={{ backgroundColor: '#f3e8ff' }}
                />
              </div>
              
              <div className="flex justify-center mt-4 space-x-2">
                <button 
                  onClick={resetGame}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </button>
                <button 
                  onClick={flipBoard}
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  Flip Board
                </button>
              </div>
            </div>
            
            <div className="md:w-1/3 p-6 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Move History</h2>
              
              <div className="flex justify-between mb-4">
                <button 
                  onClick={goToStart}
                  disabled={moveHistory.length === 0 || currentMoveIndex === -1}
                  className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </button>
                <button 
                  onClick={goToPrevious}
                  disabled={moveHistory.length === 0 || currentMoveIndex === -1}
                  className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {autoPlayInterval ? (
                  <button 
                    onClick={stopAutoPlay}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                ) : (
                  <button 
                    onClick={startAutoPlay}
                    disabled={currentMoveIndex >= moveHistory.length - 1 || moveHistory.length === 0}
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={goToNext}
                  disabled={moveHistory.length === 0 || currentMoveIndex >= moveHistory.length - 1}
                  className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={goToEnd}
                  disabled={moveHistory.length === 0 || currentMoveIndex >= moveHistory.length - 1}
                  className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </button>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm h-[400px] overflow-y-auto">
                {moveHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">No moves yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {moveHistory.map((move, index) => (
                      <div 
                        key={index}
                        onClick={() => navigateToMove(index)}
                        className={`p-2 rounded cursor-pointer ${
                          index === currentMoveIndex 
                            ? 'bg-purple-600 text-white' 
                            : 'hover:bg-purple-100'
                        }`}
                      >
                        {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '...'} {move}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Game status: {game.isCheckmate() ? 'Checkmate!' : game.isDraw() ? 'Draw' : game.isCheck() ? 'Check' : 'Ongoing'}
                </p>
                {game.isGameOver() && (
                  <p className="text-sm font-semibold mt-2">
                    {game.isCheckmate() ? `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!` : 
                     game.isDraw() ? `Game ended in a draw: ${
                       game.isStalemate() ? 'Stalemate' : 
                       game.isThreefoldRepetition() ? 'Threefold repetition' : 
                       game.isInsufficientMaterial() ? 'Insufficient material' : 
                       'Fifty-move rule'
                     }` : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;