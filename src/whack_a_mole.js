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

      let bestMove = [-1, -1]; // Default to no move
      let maxScore = -Infinity;

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
        // Set AI player to the *opposite* of the current player
        setAiPlayer(currentPlayer === 1 ? 2 : 1);
      }
    };

    // Trigger AI move only when it's the AI's turn
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
};

return () => React.createElement(Gobang, { assetsUrl: assetsUrl });
};
