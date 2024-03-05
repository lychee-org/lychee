import './rating.css';

const RatingComponent = ({ rating }: { rating: number }) => {
  // const rating = useContext(UserContext)?.rating;
  return (
    <div className='rating-container'>
      <div className='RatingMessage'> Your Rating</div>
      <h1 className='Rating'> {rating > 0 ? Math.round(rating) : '?'} </h1>
      {/* <div className="MobileRating">Your Rating: { rating > 0 ? Math.round(rating) : "?" } </div> */}
    </div>
  );
};

export default RatingComponent;
