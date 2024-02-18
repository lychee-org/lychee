import React, { useContext } from "react";
import './rating.css';
// import UserContext from "@/components/auth/usercontext";

const RatingComponent = ({ rating }: {rating: number}) => {
    // const rating = useContext(UserContext)?.rating;
    return (
        <div> 
            <div className="RatingMessage"> Your Rating: </div> 
            <h1 className="Rating"> { rating > 0 ? Math.round(rating) : "?" } </h1>
        </div> 
    )
}

export default RatingComponent; 
