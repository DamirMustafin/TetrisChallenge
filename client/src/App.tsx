import { useEffect, useState } from "react";
import TetrisGame from "./components/TetrisGame";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Small delay to ensure everything is mounted
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-xl">Loading Tetris...</div>
      </div>
    );
  }

  return <TetrisGame />;
}

export default App;
