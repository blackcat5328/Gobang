// This would be stored in the 'src' folder of the GitHub repository
// whack-a-mole.js
window.initGame = (React, assetsUrl) => {
  const { useState, useEffect } = React;

  const WhackAMole = ({ assetsUrl }) => {
    const [score, setScore] = useState(0);
    const [activeMole, setActiveMole] = useState(null);

    useEffect(() => {
      const interval = setInterval(() => {
        setActiveMole(Math.floor(Math.random() * 9));
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    const whackMole = (index) => {
      if (index === activeMole) {
        setScore(score + 1);
        setActiveMole(null);
      }
    };

    return React.createElement(
      'div',
      { className: "whack-a-mole" },
      React.createElement('h2', null, "Whack-a-Mole"),
      React.createElement('p', null, `Score: ${score}`),
      React.createElement(
        'div',
        { className: "game-board" },
        Array(9).fill().map((_, index) =>
          React.createElement(
            'div',
            {
              key: index,
              className: `mole ${index === activeMole ? 'active' : ''}`,
              onClick: () => whackMole(index)
            },
            index === activeMole && React.createElement('img', { src: `${assetsUrl}/mole.png`, alt: "Mole" })
          )
        )
      )
    );
  };

  return () => React.createElement(WhackAMole, { assetsUrl: assetsUrl });
};

console.log('Whack-a-Mole game script loaded');