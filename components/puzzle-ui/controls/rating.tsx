import './rating.css';

const RatingComponent = ({ rating }: { rating: number }) => (
  <div>
    <div className='RatingMessage'>Your Rating</div>
    <h1 className='Rating'>{Math.round(rating)}</h1>
  </div>
);

export default RatingComponent;
