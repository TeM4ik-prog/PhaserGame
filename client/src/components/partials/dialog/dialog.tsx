import React from 'react';
import './Dialog.css';

interface DialogProps {
  winner?: string;
  onStart: () => void;
  onRestart: () => void;
}

const Dialog: React.FC<DialogProps> = ({ winner, onStart, onRestart }) => {
  return (
    <div className="dialog-overlay">
      {!winner && (
        <div className="dialog">
          <h1>Добро пожаловать в игру</h1>
          <button className="dialog-button" onClick={onStart}>
            Начать игру
          </button>
        </div>
      )}

      {winner && (
        <div className="dialog">
          <h1>{winner} победил!</h1>
          <button className="dialog-button" onClick={onRestart}>
            Играть заново
          </button>
        </div>
      )}
    </div>
  );
};

export default Dialog;
