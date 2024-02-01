// Communication.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { CommunicationActions } from './CommunicationActions';

const Communication: React.FC = () => {
  const dispatch = useDispatch();

  const handleStartCommunication = (id: string) => {
    dispatch(CommunicationActions.startCommunicationRequest(id));
  };

  const handleBatchCommunication = (ids: string[]) => {
    dispatch(CommunicationActions.batchStartCommunication(ids));
  };

  return (
    <div>
      <button onClick={() => handleStartCommunication('1')}>
        Start Communication
      </button>
      <button onClick={() => handleBatchCommunication(['2', '3'])}>
        Batch Start Communication
      </button>
    </div>
  );
};

export default Communication;
