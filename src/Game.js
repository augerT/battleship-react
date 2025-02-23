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
  { name: "Carrier", value:"CA", size: 5, placed: false, destroyed: false },
  { name: "Battleship", value: "B", size: 4, placed: false, destroyed: false },
  { name: "Cruiser", size: 3, value: "CR", placed: false, destroyed: false },
  { name: "Submarine", size: 3, value: "S", placed: false, destroyed: false },
  { name: "Destroyer", size: 2, value: "D", placed: false, destroyed: false },
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
  const [enemyAI, setEnemyAI] = useState({ 
    firstHit: null,
    hitStack: [],
    currentDirection: null,
    triedDirections: [],
    targetShipValue: null // Track which ship we're targeting
  });
  const [cheatMode, setCheatMode] = useState(false);

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
  }, [isVerticalPlacement]);

  // Event Handlers
  const handleRotateShip = (event) => {
    if (event.key.toLowerCase() === "r") {
      setIsVerticalPlacement((prev) => !prev);
    }
  };

  const isShipDestroyed = (shipValue, squares) => {
    // Find the ship to get its size
    const ship = SHIPS.find(s => s.value === shipValue);
    if (!ship) return false;
    
    // Count total hits on this ship
    const totalHits = squares.filter(square => 
      square === `X-${shipValue}` || square === `D-${shipValue}`
    ).length;
    
    // Ship is destroyed if hits equal ship size
    return totalHits === ship.size;
  };

  const markDestroyedShip = (shipValue, squares) => {
    // Convert all hits on this ship to destroyed status
    return squares.map(square => square === `X-${shipValue}` ? `D-${shipValue}` : square);
  };

  const handleClickEnemySquare = (i) => {
    if (gameState !== GAME_STATES.PLAYER_TURN) {
      return;
    }

    // Check if square was already hit
    if (enemySquares[i] === 'O' || enemySquares[i]?.includes('X-') || enemySquares[i]?.includes('D-')) {
      return;
    }

    const newEnemySquares = [...enemySquares];
    // Check if hit or miss
    if (enemySquares[i] !== null) {
      const shipValue = enemySquares[i];
      newEnemySquares[i] = `X-${shipValue}`;
      
      // Check if this hit destroyed the ship
      if (isShipDestroyed(shipValue, newEnemySquares)) {
        const updatedSquares = markDestroyedShip(shipValue, newEnemySquares);
        setEnemySquares(updatedSquares);
      } else {
        setEnemySquares(newEnemySquares);
      }
    } else {
      newEnemySquares[i] = 'O';
      setEnemySquares(newEnemySquares);
    }

    setGameState(GAME_STATES.ENEMY_TURN);

    // Enemy's turn
    setTimeout(() => {
      handleEnemyTurn();
    }, 1000);
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

    let previewSquareIndicies = [];
    // Add preview squares
    for (let j = 0; j < currentShip.size; j++) {
      const previewIndex = startIndex + (j * increment);
      if (
        !ships.find(
          (ship) => ship.placed && ship.value === newSquares[previewIndex]
        )
      ) {
        newSquares[previewIndex] = `${currentShip.value}-preview`;
        previewSquareIndicies.push(previewIndex);
      }
    }

    if(previewSquareIndicies.length != currentShip.size) {
      previewSquareIndicies.forEach(i => {
        newSquares[i] = `${currentShip.value}-preview-invalid`
      })
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
    const newEnemyAI = { ...enemyAI };
    let validMove = false;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    const isShipAtSquare = (index) => {
      const ship = ships.find(ship => ship.value === newPlayerSquares[index]);
      return ship ? { ...ship } : null;
    };

    const getOppositeDirection = (dir) => {
      switch (dir) {
        case 'right': return 'left';
        case 'left': return 'right';
        case 'down': return 'up';
        case 'up': return 'down';
        default: return null;
      }
    };

    const getNextIndex = (index, direction) => {
      const row = Math.floor(index / 10);
      const col = index % 10;
      
      switch (direction) {
        case 'right':
          return col < 9 ? index + 1 : -1;
        case 'left':
          return col > 0 ? index - 1 : -1;
        case 'down':
          return row < 9 ? index + 10 : -1;
        case 'up':
          return row > 0 ? index - 10 : -1;
        default:
          return -1;
      }
    };

    const isSquareHit = (index) => {
      return newPlayerSquares[index]?.includes('X-') || 
             newPlayerSquares[index]?.includes('D-') || 
             newPlayerSquares[index] === 'O';
    };

    while (!validMove && attempts < maxAttempts) {
      attempts++;
      // If we have a current direction, continue in that direction
      if (enemyAI.currentDirection && enemyAI.hitStack.length > 0) {
        const lastHit = enemyAI.hitStack[enemyAI.hitStack.length - 1];
        const nextIndex = getNextIndex(lastHit, enemyAI.currentDirection);

        // If we hit an edge or already hit square
        if (nextIndex === -1 || isSquareHit(nextIndex)) {
          // Try opposite direction from first hit
          const oppositeDir = getOppositeDirection(enemyAI.currentDirection);
          if (!enemyAI.triedDirections.includes(oppositeDir)) {
            newEnemyAI.currentDirection = oppositeDir;
            newEnemyAI.triedDirections.push(oppositeDir);
            newEnemyAI.hitStack = [enemyAI.firstHit];
            continue;
          } else {
            // If we've tried both directions but haven't destroyed the ship,
            // keep the hit stack and try new directions
            if (newEnemyAI.targetShipValue && 
                !isShipDestroyed(newEnemyAI.targetShipValue, newPlayerSquares)) {
              newEnemyAI.currentDirection = null;
              continue;
            }
            // Otherwise reset and start new search
            newEnemyAI.firstHit = null;
            newEnemyAI.hitStack = [];
            newEnemyAI.currentDirection = null;
            newEnemyAI.triedDirections = [];
            newEnemyAI.targetShipValue = null;
            continue;
          }
        }

        // Try the next square in current direction
        const shipAtSquare = isShipAtSquare(nextIndex);
        if (shipAtSquare) {
          const shipValue = shipAtSquare.value;
          newPlayerSquares[nextIndex] = `X-${shipValue}`;
          newEnemyAI.hitStack.push(nextIndex);
          
          // If we hit a different ship than we were targeting
          if (newEnemyAI.targetShipValue && shipValue !== newEnemyAI.targetShipValue) {
            // Save this hit for later
            newEnemyAI.currentDirection = null;
            newEnemyAI.triedDirections = [];
          } else {
            newEnemyAI.targetShipValue = shipValue;
          }
          
          // Check if ship is destroyed
          if (isShipDestroyed(shipValue, newPlayerSquares)) {
            // Mark all hits as destroyed
            for (let i = 0; i < newPlayerSquares.length; i++) {
              if (newPlayerSquares[i] === `X-${shipValue}`) {
                newPlayerSquares[i] = `D-${shipValue}`;
              }
            }
            // Only reset if this was our target ship
            if (shipValue === newEnemyAI.targetShipValue) {
              newEnemyAI.firstHit = null;
              newEnemyAI.hitStack = [];
              newEnemyAI.currentDirection = null;
              newEnemyAI.triedDirections = [];
              newEnemyAI.targetShipValue = null;
            }
          }
        } else {
          newPlayerSquares[nextIndex] = 'O';
          // Try opposite direction from first hit
          const oppositeDir = getOppositeDirection(enemyAI.currentDirection);
          if (!enemyAI.triedDirections.includes(oppositeDir)) {
            newEnemyAI.currentDirection = oppositeDir;
            newEnemyAI.triedDirections.push(oppositeDir);
            newEnemyAI.hitStack = [enemyAI.firstHit];
          } else {
            // If we've tried both directions but haven't destroyed the ship,
            // keep the hit stack and try new directions
            if (newEnemyAI.targetShipValue && 
                !isShipDestroyed(newEnemyAI.targetShipValue, newPlayerSquares)) {
              newEnemyAI.currentDirection = null;
            } else {
              // Otherwise reset and start new search
              newEnemyAI.firstHit = null;
              newEnemyAI.hitStack = [];
              newEnemyAI.currentDirection = null;
              newEnemyAI.triedDirections = [];
              newEnemyAI.targetShipValue = null;
            }
          }
        }
        validMove = true;
        continue;
      }

      // Try adjacent squares if we have a hit but no current direction
      if (enemyAI.hitStack.length > 0 && !enemyAI.currentDirection) {
        // Randomize direction order
        const allDirections = ['right', 'left', 'down', 'up'];
        const directions = allDirections
          .sort(() => Math.random() - 0.5) // Randomize order
          .filter(dir => !enemyAI.triedDirections.includes(dir));
        
        for (const direction of directions) {
          const nextIndex = getNextIndex(enemyAI.firstHit, direction);
          if (nextIndex >= 0 && !isSquareHit(nextIndex)) {
            const shipAtSquare = isShipAtSquare(nextIndex);
            if (shipAtSquare) {
              const shipValue = shipAtSquare.value;
              newPlayerSquares[nextIndex] = `X-${shipValue}`;
              newEnemyAI.hitStack.push(nextIndex);
              newEnemyAI.currentDirection = direction;
              newEnemyAI.triedDirections.push(direction);
              
              // If we hit a different ship than we were targeting
              if (newEnemyAI.targetShipValue && shipValue !== newEnemyAI.targetShipValue) {
                // Save this hit for later
                newEnemyAI.currentDirection = null;
                newEnemyAI.triedDirections = [];
              } else {
                newEnemyAI.targetShipValue = shipValue;
              }
              
              // Check if ship is destroyed
              if (isShipDestroyed(shipValue, newPlayerSquares)) {
                // Mark all hits as destroyed
                for (let i = 0; i < newPlayerSquares.length; i++) {
                  if (newPlayerSquares[i] === `X-${shipValue}`) {
                    newPlayerSquares[i] = `D-${shipValue}`;
                  }
                }
                // Only reset if this was our target ship
                if (shipValue === newEnemyAI.targetShipValue) {
                  newEnemyAI.firstHit = null;
                  newEnemyAI.hitStack = [];
                  newEnemyAI.currentDirection = null;
                  newEnemyAI.triedDirections = [];
                  newEnemyAI.targetShipValue = null;
                }
              }
            } else {
              newPlayerSquares[nextIndex] = 'O';
              newEnemyAI.triedDirections.push(direction);
            }
            validMove = true;
            break;
          }
        }
        
        if (validMove) continue;
        
        // If no valid directions left but haven't destroyed target ship,
        // try a different starting point from our hits
        if (newEnemyAI.targetShipValue && 
            !isShipDestroyed(newEnemyAI.targetShipValue, newPlayerSquares)) {
          newEnemyAI.firstHit = newEnemyAI.hitStack[0];
          newEnemyAI.triedDirections = [];
          continue;
        }
        
        // Otherwise reset and start new search
        newEnemyAI.firstHit = null;
        newEnemyAI.hitStack = [];
        newEnemyAI.currentDirection = null;
        newEnemyAI.triedDirections = [];
        newEnemyAI.targetShipValue = null;
      }

      // Random shot if no hits to follow up on
      if (!validMove) {
        // Try up to 10 times to find an unhit square
        let foundValidSquare = false;
        for (let i = 0; i < 10; i++) {
          const randomSquare = Math.floor(Math.random() * 100);
          if (!isSquareHit(randomSquare)) {
            foundValidSquare = true;
          const shipAtSquare = isShipAtSquare(randomSquare);
          if (shipAtSquare) {
            const shipValue = shipAtSquare.value;
            newPlayerSquares[randomSquare] = `X-${shipValue}`;
            newEnemyAI.firstHit = randomSquare;
            newEnemyAI.hitStack = [randomSquare];
            newEnemyAI.targetShipValue = shipValue;
            
            // Check if ship is destroyed
            if (isShipDestroyed(shipValue, newPlayerSquares)) {
              // Mark all hits as destroyed
              for (let i = 0; i < newPlayerSquares.length; i++) {
                if (newPlayerSquares[i] === `X-${shipValue}`) {
                  newPlayerSquares[i] = `D-${shipValue}`;
                }
              }
              // Reset AI state to look for new ships
              newEnemyAI.firstHit = null;
              newEnemyAI.hitStack = [];
              newEnemyAI.currentDirection = null;
              newEnemyAI.triedDirections = [];
              newEnemyAI.targetShipValue = null;
            }
          } else {
            newPlayerSquares[randomSquare] = 'O';
          }
            validMove = true;
            break;
          }
        }
        
        // If we couldn't find a valid square after 10 tries,
        // systematically search for the first unhit square
        if (!foundValidSquare) {
          for (let i = 0; i < 100; i++) {
            if (!isSquareHit(i)) {
              const shipAtSquare = isShipAtSquare(i);
              if (shipAtSquare) {
                const shipValue = shipAtSquare.value;
                newPlayerSquares[i] = `X-${shipValue}`;
                newEnemyAI.firstHit = i;
                newEnemyAI.hitStack = [i];
                newEnemyAI.targetShipValue = shipValue;
                
                if (isShipDestroyed(shipValue, newPlayerSquares)) {
                  for (let j = 0; j < newPlayerSquares.length; j++) {
                    if (newPlayerSquares[j] === `X-${shipValue}`) {
                      newPlayerSquares[j] = `D-${shipValue}`;
                    }
                  }
                  newEnemyAI.firstHit = null;
                  newEnemyAI.hitStack = [];
                  newEnemyAI.currentDirection = null;
                  newEnemyAI.triedDirections = [];
                  newEnemyAI.targetShipValue = null;
                }
              } else {
                newPlayerSquares[i] = 'O';
              }
              validMove = true;
              break;
            }
          }
        }
      }
    }

    setEnemyAI(newEnemyAI);
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
          <div>
            <button 
              className="mb-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() => setCheatMode(prev => !prev)}
            >
              {cheatMode ? "Hide Enemy Ships" : "Show Enemy Ships"}
            </button>
            <EnemyBoard
              squares={enemySquares}
              onSquareClick={handleClickEnemySquare}
              cheatMode={cheatMode}
            />
          </div>
        </div>
      </div>
      <div className="game-status">{getGameStatusText()}</div>
    </div>
  );
}
