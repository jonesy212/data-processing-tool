// ParticipantComponent.tsx
import { Participant } from "@/core/pages/management/ParticipantManagementPage";
import {
    addParticipant,
    removeParticipant,
    selectParticipants,
    updateParticipant,
} from "@/core/store/participantSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const ParticipantComponent = () => {
  const dispatch = useDispatch();
  const participants = useSelector(selectParticipants);

  useEffect(() => {
    // Example dispatch usage
    dispatch(addParticipant({ id: "1", name: "John Doe", role: "Admin" }));
  }, [dispatch]);

  const handleRemoveParticipant = (participantId: string) => {
    dispatch(removeParticipant(participantId));
  };

  const handleUpdateParticipant = (updatedParticipant: Participant) => {
    dispatch(updateParticipant(updatedParticipant));
  };

  return (
    <div>
      <h2>Participants</h2>
      <ul>
        {participants.map(participant => (
          <li key={participant.id}>
            {participant.name} - {participant.role}
            <button onClick={() => handleRemoveParticipant(participant.id)}>
              Remove
            </button>
            <button onClick={() => handleUpdateParticipant({ ...participant, role: "Updated Role" })}>
              Update Role
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantComponent;
