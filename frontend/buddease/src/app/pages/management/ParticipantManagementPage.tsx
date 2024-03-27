import RootLayout from "@/app/RootLayout";
import { ToolbarActions } from "@/app/components/actions/ToolbarActions";
import ParticipantData from "@/app/components/hooks/dataHooks/RealtimeUpdatesComponent";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const ParticipantManagementPage = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const participantData = useSelector(selectParticipantData);

  useEffect(() => {
    // Dispatch action to fetch participant data when the component mounts
    dispatch(
      ToolbarActions.fetchParticipantData({
        participantData: {} as ParticipantData,
      })
    );
  }, [dispatch, userId]);

  const handleAddParticipant = () => {
    // Dispatch action to add a new participant
    dispatch(
      ToolbarActions.addParticipant({
        userId,
        participant: { name: "New Participant", role: "Member" },
      })
    );
  };

  const handleRemoveParticipant = (participantId) => {
    // Dispatch action to remove a participant
    dispatch(ToolbarActions.removeParticipant({ userId, participantId }));
  };

  return (
    <RootLayout>
      <div>
        <h1>Participant Management</h1>
        <button onClick={handleAddParticipant}>Add Participant</button>
        <ul>
          {participantData.map((participant) => (
            <li key={participant.id}>
              {participant.name} - {participant.role}
              <button onClick={() => handleRemoveParticipant(participant.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </RootLayout>
  );
};

export default ParticipantManagementPage;
