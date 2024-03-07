import './rating.css';

const RatingComponent = ({ rating }: { rating: number }) => {
  return (
    <div className='hidden md:block p-4 text-center tracking-tighter'>
      <div className='text-md text-secondary-foreground'>Your Rating</div>
      <h1 className='text-2xl font-bold'>
        {' '}
        {rating > 0 ? Math.round(rating) : '?'}{' '}
      </h1>
    </div>
  );
};

export default RatingComponent;
