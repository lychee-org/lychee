import { useContext } from 'react';
import { PuzzleContext } from '../puzzle-mode';
import React from 'react';

export const ResetPuzzleButtonContext = React.createContext({
  solved: false,
  reloadPuzzle: () => {},
});

export const buttonStyle = {
  cursor: 'pointer',
  padding: '10px 20px',
  margin: '10px 10px 0px 0px',
  borderRadius: '6px',
  backgroundColor: '#f0d9b5',
  border: 'none',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
};

const ResetPuzzleButton = () => {
  const { solved, reloadPuzzle } = useContext(ResetPuzzleButtonContext);
  const { getNextPuzzle } = useContext(PuzzleContext);
  return (
    <button style={buttonStyle} onClick={solved ? getNextPuzzle : reloadPuzzle}>
      {solved ? 'Next Puzzle' : 'View Solution'}
    </button>
  );
};

export default ResetPuzzleButton;
