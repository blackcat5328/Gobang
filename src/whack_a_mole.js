window.initGame = (React, assetsUrl) => {
  const { useState, useEffect } = React;

  const Timer = () => {
    const [time, setTime] = useState(60);

    useEffect(() => {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="timer">
        <h3>Time: {time}</h3>
      </div>
    );
  };

  const Gobang = ({ assetsUrl }) => {
    const [board, setBoard] = useState(Array(15).fill().map(() => Array(15).fill(0)));
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [winner, setWinner] = useState(0);

    const checkWin = (row, col, player) => {
      // ... (existing checkWin function)
    };

    const handleClick = (row, col) => {
      if (board[row][col] === 0 && winner === 0) {
        const newBoard = [...board];
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        if (checkWin(row, col, currentPlayer)) {
          setWinner(currentPlayer);
        } else {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        }
      }
    };

    const handleReset = () => {
      setBoard(Array(15).fill().map(() => Array(15).fill(0)));
      setCurrentPlayer(1);
      setWinner(0);
    };

    return React.createElement(
      'div',
      { className: "gobang" },
      React.createElement('h2', null, "Gobang"),
      React.createElement(Timer, null),
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
          ? `Current player: ${currentPlayer === 1 ? 'Player 1' : 'Player 2'}`
          : `Player ${winner} wins!`
      ),
      React.createElement(
        'button',
        { onClick: handleReset },
        'Reset'
      )
    );
  };

  return () => React.createElement(Gobang, { assetsUrl: assetsUrl });
};

console.log('Gobang game script loaded');
