import React from "react";
import emptyBoard from "@/public/emptyBoard.gif";
import Image from "next/image";

const LoadingBoard = () => {
  const boardstyle = {
    position: 'relative',
    left: 0,
    top: 0,
    width: '100%',
    height: 'same-as-width',
  } as React.CSSProperties;
  const overlayStyle = {
    position: 'relative',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    filter: 'blur(5px)'
  } as React.CSSProperties;
  let relativeStyle = {position: 'relative', left: 0, top: 0, width: '100%', height: '100%'} as React.CSSProperties;
  return <div style={relativeStyle}>
    <div style={overlayStyle}>
      <Image src={emptyBoard} alt="Loading board" style={boardstyle} priority={true} />
    </div>
  </div>
};

export default LoadingBoard;