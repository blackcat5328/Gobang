window.initGame = (React, assetsUrl) => {
  const { useState, useEffect } = React;

  const Gobang = ({ assetsUrl }) => {
    const [board, setBoard] = useState(() => {
      const initialBoard = Array(15).fill().map(() => Array(15).fill(0));
      initialBoard[7][7] = 1;
      initialBoard[7][8] = 2;
      initialBoard[8][7] = 2;
      initialBoard[8][8] = 1;
      return initialBoard;
    });
    const [history, setHistory] = useState([board.map(row => row.slice())]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [winner, setWinner] = useState(0);
    const [timer, setTimer] = useState(60);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [moveRecords, setMoveRecords] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [aiMode, setAiMode] = useState(0); // 0: Off, 1: On
    const [aiPlayer, setAiPlayer] = useState(1); // AI player (Black or White)

    useEffect(() => {
      let interval;
      if (winner === 0) {
        interval = setInterval(() => {
          setTimer(prevTimer => prevTimer - 1);
          setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
      } else {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }, [winner]);

    useEffect(() => {
      if (timer === 0) {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setTimer(60);
      }
    }, [timer, currentPlayer]);

    // Add the function to change AI player
    const changeAiPlayer = () => {
      setAiPlayer(aiPlayer === 1 ? 2 : 1);
    };

    const checkWin = (row, col, player) => {
      let count = 0;
      // Check rows
      for (let i = 0; i < 15; i++) {
        if (row >= 0 && row < 15 && board[row][i] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
      }

      // Check columns
      count = 0;
      for (let i = 0; i < 15; i++) {
        if (col >= 0 && col < 15 && board[i][col] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
      }

      // Check diagonal (top-left to bottom-right)
      count = 0;
      let r = row, c = col;
      while (r >= 0 && c >= 0 && r < 15 && c < 15) {
        if (board[r][c] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
        r--;
        c--;
      }
      r = row + 1, c = col + 1;
      while (r >= 0 && c >= 0 && r < 15 && c < 15) {
        if (board[r][c] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
        r++;
        c++;
      }

      // Check diagonal (bottom-left to top-right)
      count = 0;
      r = row, c = col;
      while (r >= 0 && c >= 0 && r < 15 && c < 15) {
        if (board[r][c] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
        r++;
        c--;
      }
      r = row - 1, c = col + 1;
      while (r >= 0 && c >= 0 && r < 15 && c < 15) {
        if (board[r][c] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
        r--;
        c++;
      }

      // Check for consecutive pieces in all directions
      const directions = [
        [0, 1], // Right
        [1, 0], // Down
        [1, 1], // Diagonal (bottom-right)
        [1, -1], // Diagonal (bottom-left)
      ];

      for (const [dr, dc] of directions) {
        let count = 0;
        let r = row, c = col;
        while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === player) {
          count++;
          r += dr;
          c += dc;
        }
        r = row - dr, c = col - dc;
        while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === player) {
          count++;
          r -= dr;
          c -= dc;
        }
        if (count >= 4) {
          // Highlight consecutive pieces
          r = row, c = col;
          while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === player) {
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
              cell.classList.add('winning-piece');
            }
            r += dr;
            c += dc;
          }
          r = row - dr, c = col - dc;
          while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === player) {
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
              cell.classList.add('winning-piece');
            }
            r -= dr;
            c -= dc;
          }
          return true;
        }
      }

      return false;
    };

    const handleClick = (row, col) => {
      if (board[row][col] === 0 && winner === 0) {
        if (
          (row > 0 && board[row - 1][col] !== 0) ||
          (row < 14 && board[row + 1][col] !== 0) ||
          (col > 0 && board[row][col - 1] !== 0) ||
          (col < 14 && board[row][col + 1] !== 0)
        ) {
          const newBoard = board.map(row => row.slice());
          newBoard[row][col] = currentPlayer;
          setBoard(newBoard);

          setHistory([...history.slice(0, currentIndex + 1), newBoard]);
          setCurrentIndex(currentIndex + 1);

          setMoveRecords([...moveRecords, `Player ${currentPlayer}: (${row}, ${col})`]);

          if (checkWin(row, col, currentPlayer)) {
            setWinner(currentPlayer);
          } else {
            // Handle AI turn if AI mode is enabled
            if (aiMode === 1 && currentPlayer === aiPlayer) {
              findBestMove(); // Make the AI's move
            } else {
              setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
              setTimer(60);
            }
          }
        }
      }
    };

  const findBestMove = () => {
    // Easy AI logic:
    // 1. Prioritize placing pieces near existing pieces of the same color.
    // 2. If no valid moves near existing pieces, place randomly.
    // 3. Check if 3-link can be blocked

    let bestMove = [-1, -1]; // Default to no move
    let maxScore = -Infinity;

    // Check if 3-link can be blocked
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if (board[row][col] === 0) {
          // Check if placing a piece here blocks a 3-link of the opponent
          if (checkBlockThreeLink(row, col, aiPlayer === 1 ? 2 : 1)) {
            bestMove = [row, col];
            return bestMove; // Immediately return if a blocking move is found
          }
        }
      }
    }

    // If no blocking move is found, continue with the original logic
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if (board[row][col] === 0) {
          // Calculate score based on proximity to existing pieces
          let score = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (row + i >= 0 && row + i < 15 && col + j >= 0 && col + j < 15) {
                if (board[row + i][col + j] === aiPlayer) {
                  score += 2; // Higher score for closer pieces
                }
              }
            }
          }

          // Prioritize moves near existing pieces
          if (score > maxScore) {
            maxScore = score;
            bestMove = [row, col];
          } else if (score === maxScore && Math.random() < 0.5) {
            // If multiple moves with the same score, choose randomly
            bestMove = [row, col];
          }
        }
      }
    }

    // If no valid moves near existing pieces, place randomly
    if (bestMove[0] === -1 && bestMove[1] === -1) {
      let validMoves = [];
      for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
          if (board[row][col] === 0) {
            validMoves.push([row, col]);
          }
        }
      }
      if (validMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        bestMove = validMoves[randomIndex];
      }
    }

    // Update the board with the best move
    if (bestMove[0] !== -1 && bestMove[1] !== -1) {
      const newBoard = board.map(row => row.slice());
      newBoard[bestMove[0]][bestMove[1]] = aiPlayer;
      setBoard(newBoard);

      setHistory([...history.slice(0, currentIndex + 1), newBoard]);
      setCurrentIndex(currentIndex + 1);

      setMoveRecords([...moveRecords, `Player ${aiPlayer}: (${bestMove[0]}, ${bestMove[1]})`]);

      if (checkWin(bestMove[0], bestMove[1], aiPlayer)) {
        setWinner(aiPlayer);
      } else {
        setCurrentPlayer(aiPlayer === 1 ? 2 : 1);
        setTimer(60);
      }
    }

    return bestMove;
  };

   const checkBlockThreeLink = (row, col, opponentPlayer) => {
  const directions = [
    [0, 1], // Right
    [1, 0], // Down
    [1, 1], // Diagonal (bottom-right)
    [1, -1], // Diagonal (bottom-left)
  ];

  for (const [dr, dc] of directions) {
    let count = 0; // Count consecutive opponent pieces
    let r = row, c = col;

    // Count consecutive opponent pieces in the direction
    while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === opponentPlayer) {
      count++;
      r += dr;
      c += dc;
    }

    // Check if a 3-link is formed
    if (count === 3) {
      // Check if the move blocks the 3-link
      if (
        (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === 0) || // Check the end of the line
        (r - dr >= 0 && c - dc >= 0 && r - dr < 15 && c - dc < 15 && board[r - dr][c - dc] === 0) // Check the beginning of the line
      ) {
        return true; // Blocking move found
      }
    }
  }

  return false; // No blocking move found
};

const minimax = (board, player, depth, alpha, beta) => {
  if (checkWin(board, player)) {
    return player === aiPlayer ? Infinity : -Infinity;
  } else if (depth === 5) { // Adjust depth for performance
    return evaluateBoard(board);
  }

  let bestScore = player === aiPlayer ? -Infinity : Infinity;
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col] === 0) {
        const newBoard = board.map(r => r.slice());
        newBoard[row][col] = player;

        const score = minimax(newBoard, player === 1 ? 2 : 1, depth + 1, alpha, beta);

        if (player === aiPlayer) {
          bestScore = Math.max(bestScore, score);
          alpha = Math.max(alpha, bestScore);
        } else {
          bestScore = Math.min(bestScore, score);
          beta = Math.min(beta, bestScore);
        }

        if (beta <= alpha) {
          return bestScore; // Alpha-beta pruning
        }
      }
    }
  }

  return bestScore;
};

const evaluateBoard = (board) => {
  let score = 0;

  // Check for potential threats and winning lines in all directions
  const directions = [
    [0, 1], // Right
    [1, 0], // Down
    [1, 1], // Diagonal (bottom-right)
    [1, -1], // Diagonal (bottom-left)
  ];

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col] === aiPlayer) {
        // Score for AI pieces
        score += 1;

        // Bonus for center piece
        if (row === 7 && col === 7) {
          score += 2;
        }

        // Check potential threats and winning lines
        for (const [dr, dc] of directions) {
          let count = 0;
          let openEnds = 0;
          let r = row, c = col;

          // Count consecutive pieces in the direction
          while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === aiPlayer) {
            count++;
            r += dr;
            c += dc;
          }

          // Count open ends (empty cells at the ends of the line)
          r = row - dr, c = col - dc;
          while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === 0) {
            openEnds++;
            r -= dr;
            c -= dc;
          }
          r = row + dr, c = col + dc;
          while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === 0) {
            openEnds++;
            r += dr;
            c += dc;
          }

          // Assign score based on the number of consecutive pieces and open ends
          if (count === 4 && openEnds === 2) {
            score += 1000; // Winning move (4 in a row with 2 open ends)
          } else if (count === 4 && openEnds === 1) {
            score += 500; // Almost winning (4 in a row with 1 open end)
          } else if (count === 3 && openEnds === 2) {
            score += 100; // Strong threat (3 in a row with 2 open ends)
          } else if (count === 3 && openEnds === 1) {
            score += 50; // Medium threat (3 in a row with 1 open end)
          } else if (count === 2 && openEnds === 2) {
            score += 10; // Moderate threat (2 in a row with 2 open ends)
          } else if (count === 2 && openEnds === 1) {
            score += 5; // Small threat (2 in a row with 1 open end)
          }
        }
      } else if (board[row][col] !== 0) {
        // Penalty for opponent's piece
        score -= 1;

        // Check opponent's potential threats
        for (const [dr, dc] of directions) {
          let count = 0;
          let openEnds = 0;
          let r = row, c = col;

          // Count consecutive pieces in the direction
          while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === board[row][col]) {
            count++;
            r += dr;
            c += dc;
          }

          // Count open ends
          r = row - dr, c = col - dc;
          while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === 0) {
            openEnds++;
            r -= dr;
            c -= dc;
          }
          r = row + dr, c = col + dc;
          while (r >= 0 && c >= 0 && r < 15 && c < 15 && board[r][c] === 0) {
            openEnds++;
            r += dr;
            c += dc;
          }

          // Assign penalty based on the opponent's threat
          if (count === 4 && openEnds === 2) {
            score -= 1000; // Opponent winning
          } else if (count === 4 && openEnds === 1) {
            score -= 500; // Opponent almost winning
          } else if (count === 3 && openEnds === 2) {
            score -= 100; // Strong opponent threat
          } else if (count === 3 && openEnds === 1) {
            score -= 50; // Medium opponent threat
          } else if (count === 2 && openEnds === 2) {
            score -= 10; // Moderate opponent threat
          } else if (count === 2 && openEnds === 1) {
            score -= 5; // Small opponent threat
          }
        }
      }
    }
  }

  return score;
};

    const handleUndo = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setBoard(history[currentIndex - 1]);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setTimer(60);
        setMoveRecords(moveRecords.slice(0, -1));
      }
    };

    const handleRedo = () => {
      if (currentIndex < history.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setBoard(history[currentIndex + 1]);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setTimer(60);
      }
    };

    const handleReset = () => {
      const newBoard = Array(15).fill().map(() => Array(15).fill(0));
      newBoard[7][7] = 1;
      newBoard[7][8] = 2;
      newBoard[8][7] = 2;
      newBoard[8][8] = 1;
      setBoard(newBoard);
      setHistory([newBoard]);
      setCurrentIndex(0);
      setCurrentPlayer(1);
      setWinner(0);
      setTimer(60);
      setElapsedTime(0);
      setMoveRecords([]);
    };

    const toggleHistory = () => {
      setShowHistory(prev => !prev);
    };

    const handleAiSwitch = () => {
      setAiMode(prevAiMode => (prevAiMode + 1) % 2); // Toggle AI mode
      if (aiMode === 1) {
        changeAiPlayer(); // Call function to change AI player
      }
    };

    useEffect(() => {
      if (aiMode === 1 && currentPlayer === aiPlayer) {
        findBestMove();
      }
    }, [currentPlayer, aiMode, aiPlayer]);

    return React.createElement(
      'div',
      { className: "gobang" },
      React.createElement('h2', null, "Gobang"),
      React.createElement(
        'p',
        null,
        `Elapsed time: ${elapsedTime} seconds.`
      ),
      React.createElement(
        'div',
        { className: "game-board" },
        board.map((row, rowIndex) =>
          React.createElement(
            'div',
            { className: "row", key: rowIndex },
            row.map((cell, colIndex) =>
              React.createElement(
                'div',
                {
                  key: `${rowIndex}-${colIndex}`,
                  className: `cell ${cell === 1 ? 'player1' : cell === 2 ? 'player2' : ''}`,
                  style: {
                    backgroundImage: cell === 1
                      ? `url(${assetsUrl}/player1.png)`
                      : cell === 2
                        ? `url(${assetsUrl}/player2.png)`
                        : 'none'
                  },
                  onClick: () => handleClick(rowIndex, colIndex),
                  // Add data attributes for easy selection
                  'data-row': rowIndex,
                  'data-col': colIndex
                }
              )
            )
          )
        )
      ),
      React.createElement(
        'p',
        null,
        winner === 0
          ? `Current player: ${currentPlayer === 1 ? 'Player 1 BLACK' : 'Player 2 WHITE'} (${timer} seconds remaining).`
          : `Player ${winner} wins!`
      ),
      React.createElement(
        'div',
        { className: "controls" },
        React.createElement(
          'button',
          { onClick: handleUndo },
          'Undo'
        ),
        React.createElement(
          'button',
          { onClick: handleRedo },
          'Redo'
        ),
        React.createElement(
          'button',
          { onClick: handleReset },
          'Reset'
        ),
        React.createElement(
          'button',
          { onClick: toggleHistory },
          showHistory ? 'Hide Steps' : 'Show All Steps'
        ),
        React.createElement(
          'button',
          { onClick: handleAiSwitch },
          `AI Mode: ${aiMode === 0 ? 'Off' : `On (Player ${aiPlayer})`}`
        )
      ),
      showHistory && React.createElement(
        'div',
        { className: "move-history" },
        React.createElement('h3', null, "Move History:"),
        React.createElement(
          'ul',
          null,
          moveRecords.map((record, index) => 
            React.createElement('li', { key: index }, record)
          )
        )
      ),
      React.createElement(
        'div',
        { className: "move-records" },
        React.createElement('h3', null, "Recent Moves:"),
        React.createElement(
          'ul',
          null,
      // Pad with empty spaces if fewer than 5 moves
      [...moveRecords.slice(-5), ...(moveRecords.length < 5 ? Array(5 - moveRecords.length).fill('') : [])]
        .map((record, index) =>
          React.createElement('li', { key: index }, record)
        )
    )
  )
);
};

return () => React.createElement(Gobang, { assetsUrl: assetsUrl });
};
