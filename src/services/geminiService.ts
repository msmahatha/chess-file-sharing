import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI("AIzaSyAUNX0gJyu0aP6bSWf1zwYjJ7KeGtHJX2w");

export async function analyzeChessGame(pgn: string): Promise<string> {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Analyze this chess game in PGN format:
      
      ${pgn}
      
      Please provide:
      1. An overview of the game
      2. Key turning points
      3. Notable tactics or strategies
      4. Suggestions for improvement
      5. Overall evaluation
      
      Format your analysis in a clear, concise way that would be helpful for a chess player looking to improve.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error analyzing chess game with Gemini:", error);
    return "Sorry, there was an error analyzing your chess game. Please try again later.";
  }
}