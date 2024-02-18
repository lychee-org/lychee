const DisplayBox = ({solved, lastMoveWrong, linePos, side}: {solved: Boolean, lastMoveWrong: Boolean, linePos: number, side: string}) => {
    let wrongDiv = (<div className="boxMessages"> Sorry, that's not it... </div>)
    let correctDiv = (<div className="boxMessages"> Good job! Keep it going... </div>)
    let solvedDiv = (<div className="boxMessages">Amazing! You solved it</div>)
    let sideInfo = (<div> You are playing as {side} </div>)
    
    let guideText;
    if (solved) {
        guideText = solvedDiv;
    } else if (lastMoveWrong) {
        guideText = wrongDiv
    } else if (linePos < 3)
    	guideText = sideInfo
    else guideText = correctDiv
    
    return guideText
}

export default DisplayBox;