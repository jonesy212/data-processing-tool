import RootLayout from "@/app/RootLayout";
import { ParticipantActions } from "@/app/components/actions/ParticipantActions";
import { ToolbarActions } from "@/app/components/actions/ToolbarActions";
import { MobXRootState} from "@/app/components/state/stores/RootStores";
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { User } from "@/app/components/users/User";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

interface ParticipantData {
  id: string;
  name: string;
  role: string;
  // Add more fields as needed, such as email, phone number, etc.
}


interface Participant {
  id: string;
  name: string;
  role: string;
  // Add more fields as needed, such as email, phone number, etc.
}

// Function to create a default User object

// Function to create a default User object
const getDefaultUser = (userId: string): User => ({
  id: userId,
  username: "default",
  firstName: "",
  lastName: "",
  email: "",
  tier: "",
  token: null,
  uploadQuota: 0,
  avatarUrl: null,
  createdAt: undefined,
  updatedAt: undefined,
  fullName: null,
  bio: null,
  userType: "",
  hasQuota: false,
  profilePicture: null,
  processingTasks: [],
  role: undefined,
  persona: undefined,
  friends: [],
  blockedUsers: [],
  settings: undefined,
  interests: [],
  privacySettings: undefined,
  notifications: undefined,
  activityLog: [],
  socialLinks: undefined,
  relationshipStatus: null,
  hobbies: [],
  skills: [],
  achievements: [],
  profileVisibility: "",
  profileAccessControl: undefined,
  activityStatus: "",
  isAuthorized: false,
});

const ParticipantManagementPage = () => {
  const dispatch = useDispatch();
  const { userId } = useParams<{ userId?: string }>() ?? {};
  const participantData: ParticipantData[] = useSelector(
    (state: MobXRootState) => state.collaborationManager.participantData
  );

  useEffect(() => {
    if (userId) {
      const defaultUser = getDefaultUser(userId);
      dispatch(
        ToolbarActions.fetchParticipantData({
          userId: defaultUser,
          participantData: participantData,
        })
      );
    }
  }, [dispatch, userId, participantData]);

  const handleAddParticipant = () => {
    if (!userId) {
      console.error("User ID is undefined.");
      return;
    }

    const id = UniqueIDGenerator.generateID(
      "participant",
      "notification",
      NotificationTypeEnum.ADD_PARTICIPANT
    );
    const defaultUser = getDefaultUser(userId);

    dispatch(
      ToolbarActions.addParticipant({
        userId: defaultUser,
        participant: {
          id,
          name: "New Participant",
          role: "Member",
        },
      })
    );
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (!userId) {
      console.error("User ID is undefined.");
      return;
    }

    dispatch(
      ToolbarActions.removeParticipant({
        userId: getDefaultUser(userId),
        participantId,
      })
    );
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
export type { Participant, ParticipantData };