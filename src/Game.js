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

  // Setup enemy squares, choose ship position randomly
  const [enemySquares, setEnemySquares] = useState(() => {
    const squares = Array(100).fill(null);

    const placeEnemyShip = (ship) => {
      let placed = false;
      while (!placed) {
        // Randomly choose orientation
        const isVertical = Math.random() < 0.5;
        // Get random starting position
        const start = Math.floor(Math.random() * 100);
        const row = Math.floor(start / 10);
        const col = start % 10;

        // Check if ship can be placed here
        let canPlace = true;
        const positions = [];

        for (let i = 0; i < ship.size; i++) {
          let pos;
          if (isVertical) {
            if (row + i >= 10) {
              canPlace = false;
              break;
            }
            pos = start + i * 10;
          } else {
            if (col + i >= 10) {
              canPlace = false;
              break;
            }
            pos = start + i;
          }

          // Check if position is already occupied
          if (squares[pos] !== null) {
            canPlace = false;
            break;
          }
          positions.push(pos);
        }

        if (canPlace) {
          // Place the ship
          positions.forEach((pos) => {
            squares[pos] = ship.value;
          });
          placed = true;
        }
      }
    };

    // Place each ship
    SHIPS.forEach((ship) => placeEnemyShip(ship));
    return squares;
  });

  // Other States
  const [gameState, setGameState] = useState(GAME_STATES.PLACING_SHIPS);
  const [playerSquares, setPlayerSquares] = useState(Array(100).fill(null));
  const [ships, setShips] = useState(SHIPS);
  const [currentHoverIndex, setCurrentHoverIndex] = useState(null);
  const [isVerticalPlacement, setIsVerticalPlacement] = useState(false);
  const [currentShip, setCurrentShip] = useState(ships[0]);

  // useEffects
  useEffect(() => {
    if (gameState !== GAME_STATES.PLACING_SHIPS) {
      return;
    }

    window.addEventListener("keydown", handleRotateShip);
    return () => window.removeEventListener("keydown", handleRotateShip);
  }, [gameState]);

  useEffect(() => {
    if (currentHoverIndex && gameState === GAME_STATES.PLACING_SHIPS) {
      previewPlayerShip(currentHoverIndex);
    }
  }, [isVerticalPlacement])

  // Event Handlers
  const handleRotateShip = (event) => {
    if (event.key.toLowerCase() === "r") {
      setIsVerticalPlacement((prev) => !prev);
    }
  };

  const handleClickEnemySquare = (i) => {
    if (gameState !== GAME_STATES.PLAYER_TURN) {
      return;
    }

    // Check if square was already hit
    if (enemySquares[i] === 'X' || enemySquares[i] === 'O') {
      return;
    }

    const newEnemySquares = [...enemySquares];
    // Check if hit or miss
    if (enemySquares[i] !== null) {
      newEnemySquares[i] = 'X';
    } else {
      newEnemySquares[i] = 'O';
    }

    setEnemySquares(newEnemySquares);
    setGameState(GAME_STATES.ENEMY_TURN);

    // Enemy's turn
    setTimeout(() => {
      handleEnemyTurn();
    }, 2000);
  };

  const placePlayerShip = () => {
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
    if (previewSquares.length !== currentShip.size) {
      return;
    }

    // Check if any preview square overlaps with a placed ship
    if (
      previewSquares.some((index) =>
        ships.find((ship) => ship.placed && ship.value === playerSquares[index])
      )
    ) {
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

  const previewPlayerShip = (squareIndex) => {
    if (gameState !== GAME_STATES.PLACING_SHIPS) {
      return;
    } 

    const newSquares = [...playerSquares];

    // Clear any existing previews
    for (let i = 0; i < newSquares.length; i++) {
      if (!ships.find((ship) => ship.placed && ship.value === newSquares[i])) {
        newSquares[i] = null;
      }
    }

    const increment = isVerticalPlacement ? 10 : 1;
    let startIndex = squareIndex;
    const row = Math.floor(squareIndex / 10);
    const col = squareIndex % 10;

    if (isVerticalPlacement) {
      // Vertical placement: Check if ship goes past bottom
      if (row + currentShip.size > 10) {
        startIndex = squareIndex - ((row + currentShip.size - 10) * 10);
      }
    } else {
      // Horizontal placement: Check if ship goes past right edge
      if (col + currentShip.size > 10) {
        startIndex = squareIndex - (col + currentShip.size - 10);
      }
    }

    // Add preview squares
    for (let j = 0; j < currentShip.size; j++) {
      const previewIndex = startIndex + (j * increment);
      if (
        !ships.find(
          (ship) => ship.placed && ship.value === newSquares[previewIndex]
        )
      ) {
        newSquares[previewIndex] = `${currentShip.value}-preview`;
      }
    }

    setCurrentHoverIndex(squareIndex);
    setPlayerSquares(newSquares);
  };

  const clearPlayerShipPreviews = () => {
    if (gameState !== GAME_STATES.PLACING_SHIPS) {
      return;
    }
    
    // Clear any temporary ship placement previews, keeping only placed ships
    const newSquares = [...playerSquares];
    for (let i = 0; i < newSquares.length; i++) {
      // Only clear squares that don't belong to already placed ships
      if (!ships.find((ship) => ship.placed && ship.value === newSquares[i])) {
        newSquares[i] = null;
      }
    }

    setCurrentHoverIndex(null);
    setPlayerSquares(newSquares);
  };

  // UI Helper Functions
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

  // Game Helper Functions
  const handleEnemyTurn = () => {
    const newPlayerSquares = [...playerSquares];
    let validMove = false;
    let hit = false;

    while (!validMove) {
      const randomSquare = Math.floor(Math.random() * 100);
      if (
        newPlayerSquares[randomSquare] !== "X" &&
        newPlayerSquares[randomSquare] !== "O"
      ) {
        if (
          ships.find((ship) => ship.value === newPlayerSquares[randomSquare])
        ) {
          newPlayerSquares[randomSquare] = "X";
          hit = true;
        } else {
          newPlayerSquares[randomSquare] = "O";
        }
        validMove = true;
      }
    }

    setPlayerSquares(newPlayerSquares);
    setGameState(GAME_STATES.PLAYER_TURN);
  };

  return (
    <div className="game-container">
      <div className="boards-container">
        {/* Player Board Section */}
        <div className="board-container">
          <h2 className="player-text">Player</h2>
          <PlayerBoard
            squares={playerSquares}
            onSquareClick={placePlayerShip}
            onSquareMouseEnter={previewPlayerShip}
            onBoardMouseLeave={clearPlayerShipPreviews}
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
            onSquareClick={handleClickEnemySquare}
          />
        </div>
      </div>
      <div className="game-status">{getGameStatusText()}</div>
    </div>
  );
}
