import React, { ForwardedRef, Ref, useImperativeHandle } from 'react';
import { ReactNode, useContext, useEffect } from 'react';
import {
  DoubleArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowRightIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import './control-button-bar.css';
import { cn } from '@/lib/utils';
import { MoveNavigationContext } from './move-viewer';

export const ExtraMobileInfoContext = React.createContext({
  puzzleId: '',
  rating: 1500,
});

// INDIVIDUAL BUTTONS

const ControlBarButton = React.forwardRef(
  (props: any, ref: ForwardedRef<HTMLButtonElement>) => {
    return (
      <button
        {...props}
        className={cn(
          'control-bar-button bg-controller-dark hover:bg-controller-light',
          props.className
        )}
        title={props.label}
        onClick={props.onClick}
        ref={ref}
      >
        <div className='control-bar-button-icon'>{props.symbol}</div>
      </button>
    );
  }
);
ControlBarButton.displayName = 'ControlBarButton';

export const PlaybackControllerContext = React.createContext({
  firstMove: () => {},
  prevMove: () => {},
  nextMove: () => {},
  lastMove: () => {},
});

// Mobile Information Dialog
const MobileInformationDialog = () => {
  const { puzzleId, rating } = useContext(ExtraMobileInfoContext);
  return (
    <Dialog.Portal>
      <Dialog.Overlay className='DialogOverlay' />
      <Dialog.Content className='DialogContent'>
        {/* <Dialog.Title>Overview</Dialog.Title>
        <Dialog.Description>Description</Dialog.Description> */}
        Current Puzzle ID: #{puzzleId}
        <br />
        Your rating: {rating > 0 ? Math.round(rating) : '?'}
        <Dialog.Close className='DialogX'>
          <Cross2Icon />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

// CONTROL BUTTON BAR
const ControlButtonBar = () => {
  const { firstMove, prevMove, nextMove, lastMove } = useContext(
    PlaybackControllerContext
  );

  // EVENT EMITTERS
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      if (event.shiftKey) firstMove();
      else prevMove();
    } else if (event.key === 'ArrowRight') {
      if (event.shiftKey) lastMove();
      else nextMove();
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [firstMove, prevMove, nextMove, lastMove]);

  let firstMoveIcon = <DoubleArrowLeftIcon />;
  let previousMoveIcon = <ChevronLeftIcon />;
  let nextMoveIcon = <ChevronRightIcon />;
  let lastMoveIcon = <DoubleArrowRightIcon />;
  let informationIcon = (
    <b>
      <i>i</i>
    </b>
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className='control-button-bar'>
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <ControlBarButton
          onClick={firstMove}
          symbol={firstMoveIcon}
          label='First move'
        />
        <ControlBarButton
          onClick={prevMove}
          symbol={previousMoveIcon}
          label='Previous move'
        />
        <Dialog.Trigger asChild>
          <ControlBarButton
            symbol={informationIcon}
            label='Puzzle information'
            className='info-button'
          ></ControlBarButton>
        </Dialog.Trigger>
        <ControlBarButton
          onClick={nextMove}
          symbol={nextMoveIcon}
          label='Next move'
        />
        <ControlBarButton
          onClick={lastMove}
          symbol={lastMoveIcon}
          label='Last move'
        />
        <MobileInformationDialog />
      </Dialog.Root>
    </div>
  );
};

export default ControlButtonBar;
