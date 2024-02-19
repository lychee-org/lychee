import React from "react";
import { ReactNode, useContext, useEffect } from "react";
import { DoubleArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import "./control-button-bar.css"

interface ControlBarButtonProps {
  onClick: () => void;
  symbol: ReactNode;
  label: string;
  width?: string;
}

// INDIVIDUAL BUTTONS
const DEFAULT_CONTROL_BAR_BUTTON_WIDTH = '50px';

const ControlBarButton: React.FC<ControlBarButtonProps> = ({onClick, symbol, label, width}) => {
  return (
    <button className="control-bar-button bg-controller-dark hover:bg-controller-light" title={label} onClick={onClick}>
      <div className="control-bar-button-icon">{symbol}</div>
    </button>
  )
}

export const PlaybackControllerContext = React.createContext({
  firstMove: () => {},
  prevMove: () => {},
  nextMove: () => {},
  lastMove: () => {}
});

// CONTROL BUTTON BAR
const ControlButtonBar = () => {
  const {firstMove, prevMove, nextMove, lastMove} = useContext(PlaybackControllerContext);

  // EVENT EMITTERS
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      if (event.shiftKey) firstMove();
      else prevMove();
    } else if (event.key === "ArrowRight") {
      if (event.shiftKey) lastMove();
      else nextMove();
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [firstMove, prevMove, nextMove, lastMove]);

  let firstMoveIcon = (
    <DoubleArrowLeftIcon/>
  )
  let previousMoveIcon = (
    <ChevronLeftIcon/>
  )
  let nextMoveIcon = (
    <ChevronRightIcon/>
  )
  let lastMoveIcon = (
    <DoubleArrowRightIcon/>
  )

  return (
    <div className="control-button-bar">
      <ControlBarButton onClick={firstMove} symbol={firstMoveIcon} label="First move" />
      <ControlBarButton onClick={prevMove} symbol={previousMoveIcon} label="Previous move" />
      <ControlBarButton onClick={nextMove} symbol={nextMoveIcon} label="Next move" />
      <ControlBarButton onClick={lastMove} symbol={lastMoveIcon} label="Last move" />
    </div>
  );
};

export default ControlButtonBar;