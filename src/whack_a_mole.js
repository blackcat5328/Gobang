window.initGame = (React, assetsUrl) => {
  const { useState, useEffect } = React;

  const Gobang = ({ assetsUrl }) => {
    const [board, setBoard] = useState(() => {
      const initialBoard = Array(15).fill().map(() => Array(15).fill(0));
      // Place initial chess pieces
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

    useEffect(() => {
      let interval;
      if (winner === 0) {
        interval = setInterval(() => {
          setTimer((prevTimer) => prevTimer - 1);
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
  // Check horizontal
  let count = 0;
  for (let i = 0; i < 15; i++) {
    if (board[row][i] === player) {
      count++;
      if (count === 4) {
        return true;
      }
    } else {
      count = 0;
    }
  }

  // Check vertical
  count = 0;
  for (let i = 0; i < 15; i++) {
    if (board[i][col] === player) {
      count++;
      if (count === 4) {
        return true;
      }
    } else {
      count = 0;
    }
  }

  // Check diagonal (top-left to bottom-right)
  count = 0;
  let r = row, c = col;
  while (r >= 0 && c >= 0) {
    if (board[r][c] === player) {
      count++;
      if (count === 4) {
        return true;
      }
    } else {
      count = 0;
    }
    r--;
    c--;
  }
  r = row + 1, c = col + 1;
  while (r < 15 && c < 15) {
    if (board[r][c] === player) {
      count++;
      if (count === 4) {
        return true;
      }
    } else {
      count = 0;
    }
    r++;
    c++;
  }

  // Check diagonal (bottom-left to top-right)
  count = 0;
  r = row, c = col;
  while (r < 15 && c >= 0) {
    if (board[r][c] === player) {
      count++;
      if (count === 4) {
        return true;
      }
    } else {
      count = 0;
    }
    r++;
    c--;
  }
  r = row - 1, c = col + 1;
  while (r >= 0 && c < 15) {
    if (board[r][c] === player) {
      count++;
      if (count === 4) {
        return true;
      }
    } else {
      count = 0;
    }
    r--;
    c++;
  }

  return false;
};

    const handleClick = (row, col) => {
      if (board[row][col] === 0 && winner === 0) {
        const newBoard = board.map(row => row.slice());
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        setHistory([...history.slice(0, currentIndex + 1), newBoard]);
        setCurrentIndex(currentIndex + 1);

        if (checkWin(row, col, currentPlayer)) {
          setWinner(currentPlayer);
        } else {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          setTimer(60);
        }
      }
    };

    const handleUndo = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setBoard(history[currentIndex - 1]);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setTimer(60);
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
      // Place initial chess pieces
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
    };

    return React.createElement(
      'div',
      { className: "gobang" },
      React.createElement('h2', null, "Gobang"),
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
                  onClick: () => handleClick(rowIndex, colIndex)
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
          ? `Current player: ${currentPlayer === 1 ? 'Player 1' : 'Player 2'} (${timer} seconds remaining)`
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
        )
      )
    );
  };

  return () => React.createElement(Gobang, { assetsUrl: assetsUrl });
};

console.log('Gobang game script loaded');
