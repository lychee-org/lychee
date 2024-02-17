import { ReactNode, useEffect } from "react";

interface ControlBarButtonProps {
  onClick: () => void;
  symbol: ReactNode;
  label: string;
  width?: string;
}

const DEFAULT_CONTROL_BAR_BUTTON_WIDTH = '20px';

const ControlBarButton: React.FC<ControlBarButtonProps> = ({onClick, symbol, label, width}) => {
  let style = {
    width: width ? width : DEFAULT_CONTROL_BAR_BUTTON_WIDTH
  };
  return (
    <button className="control-bar-button" title={label} onClick={onClick} style={style}>
      {symbol}
    </button>
  )
}

interface ControlButtonBarProps {
  firstMove: () => void;
  prevMove: () => void;
  nextMove: () => void;
  lastMove: () => void;
}

const ControlButtonBar: React.FC<ControlButtonBarProps> = ({
  firstMove,
  prevMove,
  nextMove,
  lastMove,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (event.shiftKey) firstMove();
        else prevMove();
      } else if (event.key === "ArrowRight") {
        if (event.shiftKey) lastMove();
        else nextMove();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [prevMove, nextMove, firstMove, lastMove]);

  return (
    <div className="control-button-bar">
      <ControlBarButton onClick={firstMove} symbol="|&lt;" label="First move" />
      <ControlBarButton onClick={prevMove} symbol="&lt;" label="Previous move" />
      <ControlBarButton onClick={nextMove} symbol="&gt;" label="Next move" />
      <ControlBarButton onClick={lastMove} symbol="&gt;|" label="Last move" />
    </div>
  );
};

export default ControlButtonBar;