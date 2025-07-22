import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Navbar from '../components/Navbar';
import { RotateCcw, Play, Pause, ChevronLeft, ChevronRight, Zap, Loader } from 'lucide-react';
import { analyzeChessGame } from '../services/geminiService';

const Analysis: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pgn, setPgn] = useState('');

  useEffect(() => {
    // Clean up auto play interval on component unmount
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [autoPlayInterval]);

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
    setAnalysis('');
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

  const loadPgn = () => {
    try {
      const newGame = new Chess();
      if (newGame.loadPgn(pgn)) {
        setGame(newGame);
        const history = newGame.history();
        setMoveHistory(history);
        setCurrentMoveIndex(history.length - 1);
        setAnalysis('');
        return true;
      }
    } catch (error) {
      console.error("Invalid PGN format:", error);
      return false;
    }
    return false;
  };

  const analyzeGame = async () => {
    setIsAnalyzing(true);
    
    try {
      // Get the PGN from the current game
      const currentPgn = game.pgn();
      
      if (!currentPgn) {
        setAnalysis("No game to analyze. Please make some moves or load a game first.");
        setIsAnalyzing(false);
        return;
      }
      
      // Call the Gemini API through our service
      const analysisResult = await analyzeChessGame(currentPgn);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error("Error during analysis:", error);
      setAnalysis("An error occurred during analysis. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Game Analysis</h1>
            <p className="text-gray-600">Analyze your chess games with AI assistance and improve your skills.</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label htmlFor="pgn" className="block text-sm font-medium text-gray-700 mb-2">
                Enter PGN (Portable Game Notation)
              </label>
              <div className="flex">
                <textarea
                  id="pgn"
                  rows={4}
                  value={pgn}
                  onChange={(e) => setPgn(e.target.value)}
                  placeholder="Paste your PGN here..."
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={loadPgn}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  Load Game
                </button>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Clear
                </button>
              </div>
            </div>
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
                  onClick={flipBoard}
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  Flip Board
                </button>
                <button 
                  onClick={analyzeGame}
                  disabled={moveHistory.length === 0 || isAnalyzing}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-1" />
                      Analyze with AI
                    </>
                  )}
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
              
              <div className="bg-white p-4 rounded-md shadow-sm h-[200px] overflow-y-auto mb-4">
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
              
              <h2 className="text-xl font-semibold mb-2">AI Analysis</h2>
              <div className="bg-white p-4 rounded-md shadow-sm max-h-[400px] overflow-y-auto">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex flex-col items-center">
                      <Loader className="h-8 w-8 text-purple-600 animate-spin mb-2" />
                      <p className="text-purple-600">Analyzing your chess game with AI...</p>
                    </div>
                  </div>
                ) : analysis ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line">{analysis}</div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    No analysis available. Click "Analyze with AI" to get insights from Gemini AI.
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

export default Analysis;