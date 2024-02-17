import React from "react";
import './rating.css';

const Rating = () => {
    const rating = 1000;
    return (
        <div> 
            <div className="RatingMessage"> Your rating: </div> 
            <h1 className="Rating"> {rating} </h1>
        </div> 
    )
}
export default Rating; 
