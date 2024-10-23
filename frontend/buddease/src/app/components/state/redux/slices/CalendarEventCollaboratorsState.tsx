import { CollaborationActions } from "@/app/components/actions/CollaborationActions";
import CalendarEventCollaborator from "@/app/components/calendar/CalendarEventCollaborator";
import { SearchCriteria } from "@/app/components/routing/SearchCriteria";
import SortCriteria from "@/app/components/settings/SortCriteria";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import { FilterCriteria } from "@/app/pages/searchs/FilterCriteria";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import InvitationData from "./InvitationData";

interface CalendarEventCollaboratorsState {
  collaborators: CalendarEventCollaborator[];
  loading: boolean;
  error: string | null;
}

interface AssignmentData {
  collaboratorId: string;
  role: string;
}

const initialState: CalendarEventCollaboratorsState = {
  collaborators: [],
  loading: false,
  error: null,
};


const dispatch = useDispatch();
const calendarEventCollaboratorsSlice = createSlice({
  name: "calendarEventCollaborators",
  initialState,
  reducers: {
    fetchCollaboratorsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCollaboratorsSuccess: (
      state,
      action: PayloadAction<CalendarEventCollaborator[]>
    ) => {
      state.loading = false;
      state.error = null;
      state.collaborators = action.payload;
    },
    fetchCollaboratorsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addCollaborator: (
      state,
      action: PayloadAction<CalendarEventCollaborator>
    ) => {
      state.collaborators.push(action.payload);
    },
    updateCollaborator: (
      state,
      action: PayloadAction<CalendarEventCollaborator>
    ) => {
      const { id } = action.payload;
      const index = state.collaborators.findIndex((c) => c.id === id);
      if (index !== -1) {
        state.collaborators[index] = action.payload;
      }
    },
    removeCollaborator: (
      state,
      action: PayloadAction<string> // Assuming the payload is the ID of the collaborator to remove
    ) => {
      const idToRemove = action.payload;
      state.collaborators = state.collaborators.filter(
        (c) => c.id !== idToRemove
      );
      },
    
      inviteCollaborator: (
        state,
        action: PayloadAction<InvitationData>
      ) => {
          const { eventId, invitee } = action.payload;

          // Call API to invite collaborator
          try {
               inviteCollaboratorAPI(eventId, invitee);
              dispatch(CollaborationActions.inviteCollaboratorSuccess(
                "Collaborator invitation sent successfully!"
            ));
          } catch (error: any) {
            dispatch(CollaborationActions.inviteCollaboratorFailure(error));
          }
          // dispatch success/failure actions based on response
          state.loading = false;
          // Implement logic to send collaboration invitation
          
        // dispatch success action
      },
      acceptCollaborationRequest: (
        state,
        action: PayloadAction<string>
      ) => {
        const requestId = action.payload;
        // Implement logic to accept collaboration request
        // dispatch success action
      },
      rejectCollaborationRequest: (
        state,
        action: PayloadAction<string>
      ) => {
        const requestId = action.payload;
        // Implement logic to reject collaboration request
        // dispatch success action
      },
      assignRoleToCollaborator: (
        state,
        action: PayloadAction<AssignmentData>
      ) => {
        const { collaboratorId, role } = action.payload;
        // Implement logic to assign role to collaborator
        // dispatch success action
      },
      viewCollaboratorProfile: (
        state,
        action: PayloadAction<string>
      ) => {
        const collaboratorId = action.payload;
        // Implement logic to view collaborator profile
      },
      searchCollaborators: (
        state,
        action: PayloadAction<SearchCriteria>
      ) => {
        const criteria = action.payload;
        // Implement logic to search for collaborators
      },
      filterCollaborators: (
        state,
        action: PayloadAction<FilterCriteria>
      ) => {
        const filter = action.payload;
        // Implement logic to filter collaborators
      },
      sortCollaborators: (
        state,
        action: PayloadAction<SortCriteria>
      ) => {
        const sort = action.payload;
        // Implement logic to sort collaborators
      },
      notifyCollaborator: (
        state,
        action: PayloadAction<NotificationData>
      ) => {
        const { collaboratorId, message } = action.payload;
        // Implement logic to send notification to collaborator

        // dispatch success action
      },
      trackCollaboratorActivity: (
        state,
        action: PayloadAction<string>
      ) => {
        const collaboratorId = action.payload;
        // Implement logic to track collaborator activity
      },
  },
});

export const {
    fetchCollaboratorsStart,
    fetchCollaboratorsSuccess,
    fetchCollaboratorsFailure,
    addCollaborator,
    updateCollaborator,
    removeCollaborator,
    inviteCollaborator,
    acceptCollaborationRequest,
    rejectCollaborationRequest,
    assignRoleToCollaborator,
    viewCollaboratorProfile,
    searchCollaborators,
    filterCollaborators,
    sortCollaborators,
    notifyCollaborator,
    trackCollaboratorActivity,








    
  } = calendarEventCollaboratorsSlice.actions;
  

export default calendarEventCollaboratorsSlice.reducer;
