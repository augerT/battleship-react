import { useState, useEffect } from "react";
import PlayerBoard  from './PlayerBoard.js'
import EnemyBoard from "./EnemyBoard.js";

const GAME_STATES = {
  PLACING_SHIPS: "PLACING_SHIPS",
  PLAYER_TURN: "PLAYER_TURN",
  ENEMY_TURN: "ENEMY_TURN",
  GAME_OVER: "GAME_OVER",
};

const SHIPS = [
  { name: "Carrier", value:"CA", size: 5, placed: false },
  { name: "Battleship", value: "B", size: 4, placed: false },
  { name: "Cruiser", size: 3, value: "CR", placed: false },
  { name: "Submarine", size: 3, value: "S", placed: false },
  { name: "Destroyer", size: 2, value: "D", placed: false },
];

export default function Game() {
  // Board states
  const [enemySquares, setEnemySquares] = useState(Array(100).fill(null));
  const [playerSquares, setPlayerSquares] = useState(Array(100).fill(null));

  // Add in Game State here (picking ship locations, isPlayerTurn, etc. );
  const [gameState, setGameState] = useState(GAME_STATES.PLACING_SHIPS);
  const [ships, setShips] = useState(SHIPS);
  const [isVerticalPlacement, setIsVerticalPlacement] = useState(false);
  const [currentShip, setCurrentShip] = useState(ships[0]);

  // Add the useEffect here, after states but before handlers
  useEffect(() => {
    if (gameState !== GAME_STATES.PLACING_SHIPS){ 
      return;
    } 

    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === "r") {
        setIsVerticalPlacement((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState]);

  // Event Handlers
  const handleEnemySquareClick = (i) => {};

  // Handles ship placement during PLACING_SHIPS gameState
  const handlePlayerSquareClick = () => {
    console.log("handling player square click");
    if (gameState !== GAME_STATES.PLACING_SHIPS) {
      return;
    }

    const newSquares = [...playerSquares];
    const previewSquares = [];

    // Find all preview squares
    newSquares.forEach((square, index) => {
      if (square === `${currentShip.value}-preview`) {
        previewSquares.push(index);
      }
    });

    // If no preview squares or invalid number of squares, return
    if (previewSquares.length !== currentShip.size) return;

    // Check if any preview square overlaps with a placed ship
    if (
      previewSquares.some((index) =>
        ships.find((ship) => ship.placed && ship.value === playerSquares[index])
      )
    ) {
      console.log("overlapped");
      return;
    }

    // Place the ship in all preview positions
    previewSquares.forEach((index) => {
      newSquares[index] = currentShip.value;
    });

    // Update ships state
    const newShips = ships.map((ship) =>
      ship.name === currentShip.name ? { ...ship, placed: true } : ship
    );

    // Update states
    setShips(newShips);
    setPlayerSquares(newSquares);

    // Find next ship or change game state
    const nextUnplacedShip = newShips.find((ship) => !ship.placed);
    if (nextUnplacedShip) {
      setCurrentShip(nextUnplacedShip);
    } else {
      setGameState(GAME_STATES.PLAYER_TURN);
    }
  };

  // Handles ship preview during PLACING_SHIPS gameState
  const handlePlayerSquareMouseHover = (squareIndex) => {
    if (gameState !== GAME_STATES.PLACING_SHIPS) return;

    const newSquares = [...playerSquares];

    // Clear any existing previews
    for (let i = 0; i < newSquares.length; i++) {
      if (!ships.find((ship) => ship.placed && ship.value === newSquares[i])) {
        newSquares[i] = null;
      }
    }

    // Calculate indices and adjustments based on orientation
    const increment = isVerticalPlacement ? 10 : 1; // Move down vs move right
    const boundary = isVerticalPlacement ? 100 : (Math.floor(i / 10) + 1) * 10; // Bottom of board vs end of row

    // Check if ship would go past boundary
    let startIndex = squareIndex;
    const endIndex = startIndex + (currentShip.size - 1) * increment;

    if (endIndex >= boundary) {
      // Move start position back to fit within boundary
      startIndex = boundary - currentShip.size * increment;
    }

    // Add preview squares
    for (let j = 0; j < currentShip.size; j++) {
      const squareIndex = startIndex + j * increment;
      if (!ships.find((ship) => ship.placed && ship.value === newSquares[squareIndex])) {
        newSquares[squareIndex] = `${currentShip.value}-preview`;
      }
    }

    setPlayerSquares(newSquares);
  };

  const handlePlayerBoardMouseLeave = () => {
    if (gameState !== GAME_STATES.PLACING_SHIPS) return;

    // Clear any temporary ship placement previews, keeping only placed ships
    const newSquares = [...playerSquares];
    for (let i = 0; i < newSquares.length; i++) {
      // Only clear squares that don't belong to already placed ships
      if (!ships.find((ship) => ship.placed && ship.value === newSquares[i])) {
        newSquares[i] = null;
      }
    }

    setPlayerSquares(newSquares);
  };

  // UI Helper Function
  const getGameStatusText = () => {
    switch (gameState) {
      case GAME_STATES.PLACING_SHIPS:
        return `Place your ${currentShip.name}! Press R to rotate the ship!`;
      case GAME_STATES.PLAYER_TURN:
        return "Your turn";
      case GAME_STATES.ENEMY_TURN:
        return "Enemy's turn";
      case GAME_STATES.GAME_OVER:
        return "Game Over!";
      default:
        return "";
    }
  };

  return (
    <div className="game-container">
      <div className="boards-container">
        {/* Player Board Section */}
        <div className="board-container">
          <h2 className="player-text">Player</h2>
          <PlayerBoard
            squares={playerSquares}
            onSquareClick={handlePlayerSquareClick}
            onSquareMouseEnter={handlePlayerSquareMouseHover}
            onBoardMouseLeave={handlePlayerBoardMouseLeave}
          />
        </div>

        {/* Separator */}
        <div className="separator">
          <div className="separator-line" />
          <span className="separator-text">VS</span>
          <div className="separator-line" />
        </div>

        {/* Enemy Board Section */}
        <div className="board-container">
          <h2 className="player-text">Enemy</h2>
          <EnemyBoard
            squares={enemySquares}
            onSquareClick={handleEnemySquareClick}
          />
        </div>
      </div>
      <div className="game-status">Place your {currentShip.name}! Press R to rotate the ship!</div>
    </div>
  );
}
