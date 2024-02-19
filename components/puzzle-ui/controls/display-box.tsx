import { CrossCircledIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import { ResetPuzzleButtonContext } from "./reset-puzzle-button"
import ResetPuzzleButton from "./reset-puzzle-button"
import { useContext } from "react"
import { PuzzleContext } from "../puzzle-mode"
import './display-box.css'

const DisplayBox = ({solved, lastMoveWrong, linePos, side, viewSolution}: {solved: Boolean, lastMoveWrong: Boolean, linePos: number, side: string, viewSolution: ()=>void}) => {
    let wrongIcon = <CrossCircledIcon className="radix-icon"/>
    let correctIcon = <CheckCircledIcon className="radix-icon" />
    const { getNextPuzzle } = useContext(PuzzleContext);
    const { solved: _, reloadPuzzle } = useContext(ResetPuzzleButtonContext);

    let wrongDiv = (<div className="icon-container"> 
                        {wrongIcon}
                        Sorry, that's not it...
                    <button className="buttonstyle" onClick={viewSolution}>Show Solutions</button>    
                    </div>)
    let correctDiv = (<div className="icon-container">
                        {correctIcon}
                        Good job! Keep it going... 
                      </div>)
    let solvedDiv = (<div className="icon-container">
                        {correctIcon}
                        Amazing! You solved it
                    <button className="buttonstyle" onClick={getNextPuzzle}>Next Puzzle</button>
                    </div>)
    let sideInfo = (<div className="icon-container"> You are playing as {side === "w" ? "white" : "black"} </div>) 

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