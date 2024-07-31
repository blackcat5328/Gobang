window.initGame = (React, assetsUrl) => {
  const { useState, useEffect } = React;

  const Gobang = ({ assetsUrl }) => {
    const [board, setBoard] = useState(Array(15).fill().map(() => Array(15).fill(0)));
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [winner, setWinner] = useState(0);
    const [timer, setTimer] = useState(60);
    const [timerInterval, setTimerInterval] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    useEffect(() => {
      if (winner === 0 && timer > 0) {
        const interval = setInterval(() => {
          setTimer(prevTimer => prevTimer - 1);
        }, 1000);
        setTimerInterval(interval);
        return () => clearInterval(interval);
      }
    }, [winner, timer]);

    const handleClick = (row, col) => {
      if (board[row][col] === 0 && winner === 0 && timer > 0) {
        const newBoard = [...board];
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        // Add the current move to the history
        setMoveHistory([...moveHistory.slice(0, historyIndex + 1), { row, col, player: currentPlayer }]);
        setHistoryIndex(historyIndex + 1);

        if (checkWin(row, col, currentPlayer)) {
          setWinner(currentPlayer);
        } else {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          setTimer(60);
        }
      }
    };

    const handleUndo = () => {
      if (historyIndex >= 0) {
        const { row, col, player } = moveHistory[historyIndex];
        const newBoard = [...board];
        newBoard[row][col] = 0;
        setBoard(newBoard);
        setCurrentPlayer(player === 1 ? 2 : 1);
        setHistoryIndex(historyIndex - 1);
        setWinner(0);
        setTimer(60);
      }
    };

    const handleRedo = () => {
      if (historyIndex < moveHistory.length - 1) {
        const { row, col, player } = moveHistory[historyIndex + 1];
        const newBoard = [...board];
        newBoard[row][col] = player;
        setBoard(newBoard);
        setCurrentPlayer(player === 1 ? 2 : 1);
        setHistoryIndex(historyIndex + 1);
        if (checkWin(row, col, player)) {
          setWinner(player);
        }
        setTimer(60);
      }
    };

    const handleReset = () => {
      setBoard(Array(15).fill().map(() => Array(15).fill(0)));
      setCurrentPlayer(1);
      setWinner(0);
      setTimer(60);
      setMoveHistory([]);
      setHistoryIndex(-1);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
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
          ? `Current player: ${currentPlayer === 1 ? 'Player 1' : 'Player 2'} (Time left: ${timer}s)`
          : `Player ${winner} wins!`
      ),
      React.createElement(
        'div',
        null,
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
