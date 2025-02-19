// generators/UserPreferencesActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Audio } from "openai/resources/index.mjs";

// Communication Preferences
export const UserCommunicationPreferencesActions = {
   // Actions for project phases
  setIdeationPhase: createAction<{
    ideaId: string;
    idea: { title: string; description: string };
  }>("setIdeationPhase"),
  setBrainstormingPhase: createAction<undefined>("setBrainstormingPhase"), // Assuming no payload needed
  setLaunchPhase: createAction<undefined>("setLaunchPhase"), // Assuming no payload needed
  setDataAnalysisPhase: createAction<undefined>("setDataAnalysisPhase"), // Assuming no payload needed
  setCommunicationPreferences: createAction<undefined>("setCommunicationPreferences"), // Assuming no payload needed
  // Actions for communication features
  enableAudioCommunication: createAction<undefined>("enableAudioCommunication"), // Assuming no payload needed>
  enableAudioCommunicationSuccess: createAction<{payload: string}>("enableAudioCommunicationSuccess"), // Assuming no
  enableVideoCommunicationRequest: createAction<{ userId: string; audio: Audio, audioId: string }>("enableVideoCommunicationRequest"), // Adjusted payload types
  enableAudioCommunicationFailure: createAction <{error: string}>("enableAudioCommunicationFailure"),
  

  enableVideoCommunication: createAction<undefined>("enableVideoCommunication"), // Assuming no payload needed
  enableTextCommunication: createAction<undefined>("enableTextCommunication"), // Assuming no payload needed
  enableRealTimeCollaboration: createAction<undefined>("enableRealTimeCollaboration"), // Assuming no payload needed

  // Actions for community involvement
  joinCommunity: createAction<undefined>("joinCommunity"), // Assuming no payload needed
  participateInGlobalProject: createAction<undefined>("participateInGlobalProject"), // Assuming no payload needed
  contributeToUnity: createAction<undefined>("contributeToUnity"), // Assuming no payload needed

  // Actions for monetization opportunities
  offerDevelopmentServices: createAction<undefined>("offerDevelopmentServices"), // Assuming no payload needed
  leveragePlatformForClientProjects: createAction<undefined>("leveragePlatformForClientProjects"), // Assuming no payload needed
  generateRevenueForSustainability: createAction<undefined>("generateRevenueForSustainability"), // Assuming no payload needed

  setIdeationPhaseFailure: createAction<{ error: string }>("setIdeationPhaseFailure"),
  setLanguage: createAction<string>("setLanguage"),
  setNotificationPreferences: createAction<any>("setNotificationPreferences"), // Adjusted payload type to 'any'
  setEmailNotifications: createAction<boolean>("setEmailNotifications"),
  setPushNotifications: createAction<boolean>("setPushNotifications"),
  setSMSNotifications: createAction<boolean>("setSMSNotifications"),
  setDesktopNotifications: createAction<boolean>("setDesktopNotifications"),
  setCustomNotifications: createAction<any>("setCustomNotifications"), // Adjusted payload type to 'any'
};

export type UserCommunicationPreferencesActionsTypes = 
  | ReturnType<typeof UserCommunicationPreferencesActions.setIdeationPhase>
  | ReturnType<typeof UserCommunicationPreferencesActions.setBrainstormingPhase>
  | ReturnType<typeof UserCommunicationPreferencesActions.setLaunchPhase>
  | ReturnType<typeof UserCommunicationPreferencesActions.setDataAnalysisPhase>
  | ReturnType<typeof UserCommunicationPreferencesActions.setLaunchPhase>
  | ReturnType<typeof UserCommunicationPreferencesActions.setDataAnalysisPhase>
  | ReturnType<typeof UserCommunicationPreferencesActions.enableAudioCommunication>
  | ReturnType<typeof UserCommunicationPreferencesActions.enableAudioCommunicationSuccess>
  | ReturnType<typeof UserCommunicationPreferencesActions.enableVideoCommunicationRequest>
  | ReturnType<typeof UserCommunicationPreferencesActions.enableVideoCommunication>
  | ReturnType<typeof UserCommunicationPreferencesActions.enableTextCommunication>
  | ReturnType<typeof UserCommunicationPreferencesActions.enableRealTimeCollaboration>
  | ReturnType<typeof UserCommunicationPreferencesActions.joinCommunity>
  | ReturnType<typeof UserCommunicationPreferencesActions.participateInGlobalProject>
  | ReturnType<typeof UserCommunicationPreferencesActions.contributeToUnity>
  | ReturnType<typeof UserCommunicationPreferencesActions.offerDevelopmentServices>
  | ReturnType<typeof UserCommunicationPreferencesActions.leveragePlatformForClientProjects>
  | ReturnType<typeof UserCommunicationPreferencesActions.generateRevenueForSustainability>
  | ReturnType<typeof UserCommunicationPreferencesActions.setIdeationPhaseFailure>
  | ReturnType<typeof UserCommunicationPreferencesActions.setLanguage>
  | ReturnType<typeof UserCommunicationPreferencesActions.setNotificationPreferences>
  | ReturnType<typeof UserCommunicationPreferencesActions.setEmailNotifications>
  | ReturnType<typeof UserCommunicationPreferencesActions.setPushNotifications>
  | ReturnType<typeof UserCommunicationPreferencesActions.setSMSNotifications>
  | ReturnType<typeof UserCommunicationPreferencesActions.setDesktopNotifications>
  | ReturnType<typeof UserCommunicationPreferencesActions.setCustomNotifications>

export const UserBrandingPreferencesActions = {
  setTheme: createAction<string>("setTheme"),
  setBrandingPreferences: createAction<string>("setBrandingPreferences"),
  setThemeFailure: createAction<{ error: string }>("setThemeFailure"),
   setUserBrandColors: createAction<string[]>(
    "userPreferences/setUserBrandColors"
  ),
  setUserLogo: createAction<string>("userPreferences/setUserLogo"),
  setFontStyles: createAction<string>("userPreferences/setFontStyles"),
  setBackgroundImage: createAction<string>(
    "userPreferences/setBackgroundImage"
  ),
  setIconography: createAction<string>("userPreferences/setIconography"),
  setButtonStyles: createAction<string>("userPreferences/setButtonStyles"),
  setTypography: createAction<string>("userPreferences/setTypography"),
  setColors: createAction<string>("userPreferences/setColors"),
  setShadows: createAction<string>("userPreferences/setShadows"),
  setSpacing: createAction<string>("userPreferences/setSpacing"),
  setHeaderColor: createAction<string>("userPreferences/setHeaderColor"), // New action for setting header color
  setBorderColor: createAction<string>("userPreferences/setBorderColor"),
  setBackgroundColor: createAction<string>(
    "userPreferences/setBackgroundColor"
  ), // New action for setting background color
  setHoverColor: createAction<string>("userPreferences/setHoverColor"), // New action for setting hover color
  setHoverTextColor: createAction<string>("userPreferences/setHoverTextColor"), // New action for setting hover text color
  setHoverBackgroundColor: createAction<string>(
    "userPreferences/setHoverBackgroundColor"
  ), // New action for setting hover background color
  setLinkColor: createAction<string>("userPreferences/setLinkColor"), // New action for setting link color
  setLinkHoverColor: createAction<string>("userPreferences/setLinkHoverColor"), // New action for setting link hover color
  setLinkVisitedColor: createAction<string>(
    "userPreferences/setLinkVisitedColor"
  ), // New action for setting link visited color
  setLinkActiveColor: createAction<string>(
    "userPreferences/setLinkActiveColor"
  ), // New action for setting link active color
  setLinkVisitedHoverColor: createAction<string>(
    "userPreferences/setLinkVisitedHoverColor"
  ), // New action for setting link visited hover
  setLinkActiveHoverColor: createAction<string>(
    "userPreferences/setLinkActiveHoverColor"
  ), // New action for setting link active hover color
  setLinkDisabledColor: createAction<string>(
    "userPreferences/setLinkDisabledColor"
  ), // New action for setting link disabled color
  setLinkDisabledHoverColor: createAction<string>(
    "userPreferences/setLinkDisabledHoverColor"
  ), // New action for setting link disabled hover color
  setLinkDisabledVisitedColor: createAction<string>(
    "userPreferences/setLinkDisabledVisitedColor"
  ), // New action for setting link disabled visited
  setLinkDisabledActiveColor: createAction<string>(
    "userPreferences/setLinkDisabledActiveColor"
  ), // New action for setting link disabled active color
  setLinkDisabledVisitedHoverColor: createAction<string>(
    "userPreferences/setLinkDisabledVisitedHoverColor"
  ), // New action for setting link
  setLinkDisabledActiveHoverColor: createAction<string>(
    "userPreferences/setLinkDisabledActiveHoverColor"
  ), // New action for setting link disabled active
  setLinkDisabledBackgroundColor: createAction<string>(
    "userPreferences/setLinkDisabledBackgroundColor"
  ), // New action for setting link disabled background color
  setLinkDisabledHoverBackgroundColor: createAction<string>(
    "userPreferences/setLinkDisabledHoverBackgroundColor"
  ), // New action for setting link disabled hover background color
  setLinkDisabledVisitedBackgroundColor: createAction<string>(
    "userPreferences/setLinkDisabledVisitedBackgroundColor"
  ), // New action for setting link disabled visited
  setLinkDisabledActiveBackgroundColor: createAction<string>(
    "userPreferences/setLinkDisabledActiveBackgroundColor"
  ), // New action for setting link disabled active background color
  setLinkDisabledVisitedHoverBackgroundColor: createAction<string>(
    "userPreferences/setLinkDisabledVisitedHoverBackgroundColor"
  ), // New action for setting link

  setButtonColor: createAction<string>("userPreferences/setButtonColor"), // New action for setting button color
  setButtonTextColor: createAction<string>(
    "userPreferences/setButtonTextColor"
  ), // New action for setting button text color
  setButtonBackgroundColor: createAction<string>(
    "userPreferences/setButtonBackgroundColor"
  ), // New action for setting button background color
  setButtonHoverColor: createAction<string>(
    "userPreferences/setButtonHoverColor"
  ), // New action for setting button hover color
  setButtonHoverTextColor: createAction<string>(
    "userPreferences/setButtonHoverTextColor"
  ), // New action for setting button hover text color
  setButtonHoverBackgroundColor: createAction<string>(
    "userPreferences/setButtonHoverBackgroundColor"
  ), // New action for setting button hover background color
  setButtonActiveColor: createAction<string>(
    "userPreferences/setButtonActiveColor"
  ), // New action for setting button active color
  setButtonActiveTextColor: createAction<string>(
    "userPreferences/setButtonActiveTextColor"
  ), // New action for setting button active text color
  setButtonActiveBackgroundColor: createAction<string>(
    "userPreferences/setButtonActiveBackgroundColor"
  ), // New action for setting button active background color
  setButtonDisabledColor: createAction<string>(
    "userPreferences/setButtonDisabledColor"
  ), // New action for setting button disabled color
  setButtonDisabledTextColor: createAction<string>(
    "userPreferences/setButtonDisabledTextColor"
  ), // New action for setting button disabled text color
  setButtonDisabledBackgroundColor: createAction<string>(
    "userPreferences/setButtonDisabledBackgroundColor"
  ), // New action for setting button disabled background color
  setButtonFocusColor: createAction<string>(
    "userPreferences/setButtonFocusColor"
  ), // New action for setting button focus color
  setButtonFocusTextColor: createAction<string>(
    "userPreferences/setButtonFocusTextColor"
  ), // New action for setting button focus text color
  setButtonFocusBackgroundColor: createAction<string>(
    "userPreferences/setButtonFocusBackgroundColor"
  ), // New action for setting button focus background color
  setButtonBorderColor: createAction<string>(
    "userPreferences/setButtonBorderColor"
  ), // New action for setting button border color
  setButtonBorderRadius: createAction<string>(
    "userPreferences/setButtonBorderRadius"
  ), // New action for setting button border radius
  setButtonBorderWidth: createAction<string>(
    "userPreferences/setButtonBorderWidth"
  ), // New action for setting button border width
  setButtonShadow: createAction<string>("userPreferences/setButtonShadow"), // New action for setting button shadow
  setButtonPadding: createAction<string>("userPreferences/setButtonPadding"), // New action for setting button padding
  setButtonTransition: createAction<string>(
    "userPreferences/setButtonTransition"
  ), // New action for setting button transition
  setButtonFontFamily: createAction<string>(
    "userPreferences/setButtonFontFamily"
  ), // New action for setting button font family
  setButtonFontSize: createAction<string>("userPreferences/setButtonFontSize"), // New action for setting button font size
  setButtonFontWeight: createAction<string>(
    "userPreferences/setButtonFontWeight"
  ), // New action for setting button font weight
  setButtonLineHeight: createAction<string>(
    "userPreferences/setButtonLineHeight"
  ), // New action for setting button line height
  setButtonLetterSpacing: createAction<string>(
    "userPreferences/setButtonLetterSpacing"
  ), // New action for setting button letter spacing
  setButtonTextTransform: createAction<string>(
    "userPreferences/setButtonTextTransform"
  ), // New action for setting button text transform
  setButtonTextDecoration: createAction<string>(
    "userPreferences/setButtonTextDecoration"
  ), // New action for setting button text decoration
  setButtonTextShadow: createAction<string>(
    "userPreferences/setButtonTextShadow"
  ), // New action for setting button text shadow
  setButtonOpacity: createAction<string>("userPreferences/setButtonOpacity"), // New action for setting button opacity
  setButtonCursor: createAction<string>("userPreferences/setButtonCursor"), // New action for setting button cursor
  setButtonOutline: createAction<string>("userPreferences/setButtonOutline"), // New action for setting button outline
};


export type UserBrandingPreferencesActionTypes = 
  | ReturnType<typeof UserBrandingPreferencesActions.setTheme>
  | ReturnType<typeof UserBrandingPreferencesActions.setThemeFailure>
  | ReturnType<typeof UserBrandingPreferencesActions.setUserBrandColors>
  | ReturnType<typeof UserBrandingPreferencesActions.setUserLogo>
  | ReturnType<typeof UserBrandingPreferencesActions.setFontStyles>
  | ReturnType<typeof UserBrandingPreferencesActions.setBackgroundImage>
  | ReturnType<typeof UserBrandingPreferencesActions.setIconography>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonStyles>
  | ReturnType<typeof UserBrandingPreferencesActions.setTypography>
  | ReturnType<typeof UserBrandingPreferencesActions.setColors>
  | ReturnType<typeof UserBrandingPreferencesActions.setShadows>
  | ReturnType<typeof UserBrandingPreferencesActions.setSpacing>
  | ReturnType<typeof UserBrandingPreferencesActions.setHeaderColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setBorderColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setHoverColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setHoverTextColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setHoverBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkHoverColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkVisitedColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkActiveColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkVisitedHoverColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkActiveHoverColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledHoverColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledVisitedColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledActiveColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledVisitedHoverColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledActiveHoverColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledHoverBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledVisitedBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledActiveBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setLinkDisabledVisitedHoverBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonTextColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonHoverColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonHoverTextColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonHoverBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonActiveColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonActiveTextColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonActiveBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonDisabledColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonDisabledTextColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonDisabledBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonFocusColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonFocusTextColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonFocusBackgroundColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonBorderColor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonBorderRadius>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonBorderWidth>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonShadow>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonPadding>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonTransition>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonFontFamily>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonFontSize>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonFontWeight>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonLineHeight>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonLetterSpacing>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonTextTransform>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonTextDecoration>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonTextShadow>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonOpacity>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonCursor>
  | ReturnType<typeof UserBrandingPreferencesActions.setButtonOutline>;



export const UserVisualPreferencesActions = {
    setTheme: createAction<string>("setTheme"),
    setDarkMode: createAction<boolean>("setDarkMode"),
    setFontSize: createAction<string>("setFontSize"),
    setColorScheme: createAction<string>("setColorScheme"),
    setLogoPreferences: createAction<any>("setLogoPreferences"),
    setIconPreferences: createAction<any>("setIconPreferences"),
    setBackgroundPreferences: createAction<any>("setBackgroundPreferences"),
    setAvatarPreferences: createAction<any>("setAvatarPreferences"),
}

export type UserVisualPreferencesActionTypes =
  | ReturnType<typeof UserVisualPreferencesActions.setTheme>
  | ReturnType<typeof UserVisualPreferencesActions.setDarkMode>
  | ReturnType<typeof UserVisualPreferencesActions.setFontSize>
  | ReturnType<typeof UserVisualPreferencesActions.setColorScheme>
  | ReturnType<typeof UserVisualPreferencesActions.setLogoPreferences>
  | ReturnType<typeof UserVisualPreferencesActions.setIconPreferences>
  | ReturnType<typeof UserVisualPreferencesActions.setBackgroundPreferences>
  | ReturnType<typeof UserVisualPreferencesActions.setAvatarPreferences>;

// Data Management Preferences
export const UserDataManagementPreferencesActions = {
  setTimeZone: createAction<string>("setTimeZone"),
  setCurrency: createAction<string>("setCurrency"),
  setPreferredUnits: createAction<string>("setPreferredUnits"),
  setAutoSavePreferences: createAction<boolean>("setAutoSavePreferences"),
  setBackupPreferences: createAction<any>("setBackupPreferences"),
  setSyncPreferences: createAction<any>("setSyncPreferences"),
  setOfflineMode: createAction<boolean>("setOfflineMode"),
};


// Define action types for data management preferences
export type UserDataManagementPreferencesActionTypes =
  | ReturnType<typeof UserDataManagementPreferencesActions.setTimeZone>
  | ReturnType<typeof UserDataManagementPreferencesActions.setCurrency>
  | ReturnType<typeof UserDataManagementPreferencesActions.setPreferredUnits>
  | ReturnType<typeof UserDataManagementPreferencesActions.setAutoSavePreferences>
  | ReturnType<typeof UserDataManagementPreferencesActions.setBackupPreferences>
  | ReturnType<typeof UserDataManagementPreferencesActions.setSyncPreferences>
  | ReturnType<typeof UserDataManagementPreferencesActions.setOfflineMode>;


// Collaboration Preferences
export const UserCollaborationPreferencesActions = {
  setAccessibilityOptions: createAction<any>("setAccessibilityOptions"),
  setPrivacySettings: createAction<any>("setPrivacySettings"),
  setSecurityPreferences: createAction<any>("setSecurityPreferences"),
  setCollaborationSettings: createAction<any>("setCollaborationSettings"),
  setIntegrationPreferences: createAction<any>("setIntegrationPreferences"),
};

export type UserCollaborationPreferencesActionTypes =
| ReturnType<typeof UserCollaborationPreferencesActions.setAccessibilityOptions>
| ReturnType<typeof UserCollaborationPreferencesActions.setPrivacySettings>
| ReturnType<typeof UserCollaborationPreferencesActions.setSecurityPreferences>
| ReturnType<typeof UserCollaborationPreferencesActions.setCollaborationSettings>
| ReturnType<typeof UserCollaborationPreferencesActions.setIntegrationPreferences>;


// Task Management Preferences
export const UserTaskManagementPreferencesActions = {
  setTaskManagementSettings: createAction<any>("setTaskManagementSettings"),
};

export type UserTaskManagementPreferencesActionTypes =
| ReturnType<typeof UserTaskManagementPreferencesActions.setTaskManagementSettings>;

// Event Management Preferences
export const UserEventManagementPreferencesActions = {
  setCalendarPreferences: createAction<any>("setCalendarPreferences"),
  setEventRegistrationPreferences: createAction<any>(
    "setEventRegistrationPreferences"
  ),
  setEventTicketPreferences: createAction<any>("setEventTicketPreferences"),
  setEventSchedulePreferences: createAction<any>("setEventSchedulePreferences"),
  setEventVenuePreferences: createAction<any>("setEventVenuePreferences"),
  setEventSpeakerPreferences: createAction<any>("setEventSpeakerPreferences"),
  setEventSponsorPreferences: createAction<any>("setEventSponsorPreferences"),
  setEventExhibitorPreferences: createAction<any>(
    "setEventExhibitorPreferences"
  ),
  setEventParticipantPreferences: createAction<any>(
    "setEventParticipantPreferences"
  ),
  setEventAttendeePreferences: createAction<any>("setEventAttendeePreferences"),
  setEventOrganizerPreferences: createAction<any>(
    "setEventOrganizerPreferences"
  ),
  setEventCoordinatorPreferences: createAction<any>(
    "setEventCoordinatorPreferences"
  ),
};


export type  UserEventManagementPreferencesActionTypes =
| ReturnType<typeof UserEventManagementPreferencesActions.setCalendarPreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventRegistrationPreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventTicketPreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventSchedulePreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventVenuePreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventSpeakerPreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventSponsorPreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventExhibitorPreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventParticipantPreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventAttendeePreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventOrganizerPreferences>
| ReturnType<typeof UserEventManagementPreferencesActions.setEventCoordinatorPreferences>;

// User Profile Preferences
export const UserProfilePreferencesActions = {
  setProfilePreferences: createAction<any>("setProfilePreferences"),
  setBioPreferences: createAction<any>("setBioPreferences"),
  setContactPreferences: createAction<any>("setContactPreferences"),
  setAddressPreferences: createAction<any>("setAddressPreferences"),
  setSocialMediaPreferences: createAction<any>("setSocialMediaPreferences"),
};


// Define action types for user profile preferences
export type UserProfilePreferencesActionTypes =
  | ReturnType<typeof UserProfilePreferencesActions.setProfilePreferences>
  | ReturnType<typeof UserProfilePreferencesActions.setBioPreferences>
  | ReturnType<typeof UserProfilePreferencesActions.setContactPreferences>
  | ReturnType<typeof UserProfilePreferencesActions.setAddressPreferences>
  | ReturnType<typeof UserProfilePreferencesActions.setSocialMediaPreferences>;

// Support and Feedback Preferences
export const UserSupportFeedbackPreferencesActions = {
  setFeedbackPreferences: createAction<any>("setFeedbackPreferences"),
  setRatingPreferences: createAction<any>("setRatingPreferences"),
  setReviewPreferences: createAction<any>("setReviewPreferences"),
  setSurveyPreferences: createAction<any>("setSurveyPreferences"),
  setPollPreferences: createAction<any>("setPollPreferences"),
  setFeedbackFormPreferences: createAction<any>("setFeedbackFormPreferences"),
  setSupportPreferences: createAction<any>("setSupportPreferences"),
  setHelpPreferences: createAction<any>("setHelpPreferences"),
  setDocumentationPreferences: createAction<any>("setDocumentationPreferences"),
  setFAQPreferences: createAction<any>("setFAQPreferences"),
  setContactSupportPreferences: createAction<any>(
    "setContactSupportPreferences"
  ),
  setChatSupportPreferences: createAction<any>("setChatSupportPreferences"),
  setEmailSupportPreferences: createAction<any>("setEmailSupportPreferences"),
  setPhoneSupportPreferences: createAction<any>("setPhoneSupportPreferences"),
  setTicketSupportPreferences: createAction<any>("setTicketSupportPreferences"),
};

export type UserSupportFeedbackPreferencesActionTypes =
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setFeedbackPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setRatingPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setReviewPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setSurveyPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setPollPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setFeedbackFormPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setSupportPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setHelpPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setDocumentationPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setFAQPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setContactSupportPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setChatSupportPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setEmailSupportPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setPhoneSupportPreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setTicketSupportPreferences>;


// Training and Education Preferences
export const UserTrainingEducationPreferencesActions = {
  setTrainingPreferences: createAction<any>("setTrainingPreferences"),
  setTutorialPreferences: createAction<any>("setTutorialPreferences"),
  setDemoPreferences: createAction<any>("setDemoPreferences"),
  setWebinarPreferences: createAction<any>("setWebinarPreferences"),
  setWorkshopPreferences: createAction<any>("setWorkshopPreferences"),
  setSeminarPreferences: createAction<any>("setSeminarPreferences"),
  setConferencePreferences: createAction<any>("setConferencePreferences"),
};



// Define action types for training and education preferences
export type UserTrainingEducationPreferencesActionTypes =
  | ReturnType<typeof UserTrainingEducationPreferencesActions.setTrainingPreferences>
  | ReturnType<typeof UserTrainingEducationPreferencesActions.setTutorialPreferences>
  | ReturnType<typeof UserTrainingEducationPreferencesActions.setDemoPreferences>
  | ReturnType<typeof UserTrainingEducationPreferencesActions.setWebinarPreferences>
  | ReturnType<typeof UserTrainingEducationPreferencesActions.setWorkshopPreferences>
  | ReturnType<typeof UserTrainingEducationPreferencesActions.setSeminarPreferences>
  | ReturnType<typeof UserTrainingEducationPreferencesActions.setConferencePreferences>;

// Event Preferences

export const UserEventPreferencesActions = {
  setGatheringPreferences: createAction<any>("setGatheringPreferences"),
  setSummitPreferences: createAction<any>("setSummitPreferences"),
  setSymposiumPreferences: createAction<any>("setSymposiumPreferences"),
  setConventionPreferences: createAction<any>("setConventionPreferences"),
  setExhibitionPreferences: createAction<any>("setExhibitionPreferences"),
  setFairPreferences: createAction<any>("setFairPreferences"),
  setShowPreferences: createAction<any>("setShowPreferences"),
  setExpoPreferences: createAction<any>("setExpoPreferences"),
  setMarketPreferences: createAction<any>("setMarketPreferences"),
  setFestivalPreferences: createAction<any>("setFestivalPreferences"),
  setCelebrationPreferences: createAction<any>("setCelebrationPreferences"),
  setPartyPreferences: createAction<any>("setPartyPreferences"),
  setGalaPreferences: createAction<any>("setGalaPreferences"),
  setAwardsPreferences: createAction<any>("setAwardsPreferences"),
  setContestPreferences: createAction<any>("setContestPreferences"),
  setCompetitionPreferences: createAction<any>("setCompetitionPreferences"),
  setChallengePreferences: createAction<any>("setChallengePreferences"),
  setHackathonPreferences: createAction<any>("setHackathonPreferences"),
  setGameJamPreferences: createAction<any>("setGameJamPreferences"),
  setPitchPreferences: createAction<any>("setPitchPreferences"),
  setDemoDayPreferences: createAction<any>("setDemoDayPreferences"),
  setShowcasePreferences: createAction<any>("setShowcasePreferences"),
  setExhibitionHallPreferences: createAction<any>(
    "setExhibitionHallPreferences"
  ),

  setVirtualEventPreferences: createAction<any>("setVirtualEventPreferences"),
  setHybridEventPreferences: createAction<any>("setHybridEventPreferences"),
  setPhysicalEventPreferences: createAction<any>("setPhysicalEventPreferences"),
  setOnlineEventPreferences: createAction<any>("setOnlineEventPreferences"),
  setOfflineEventPreferences: createAction<any>("setOfflineEventPreferences"),
};



// Define action types for user event preferences
export type UserEventPreferencesActionTypes =
  | ReturnType<typeof UserEventPreferencesActions.setGatheringPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setSummitPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setSymposiumPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setConventionPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setExhibitionPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setFairPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setShowPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setExpoPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setMarketPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setFestivalPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setCelebrationPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setPartyPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setGalaPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setAwardsPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setContestPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setCompetitionPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setChallengePreferences>
  | ReturnType<typeof UserEventPreferencesActions.setHackathonPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setGameJamPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setPitchPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setDemoDayPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setShowcasePreferences>
  | ReturnType<typeof UserEventPreferencesActions.setExhibitionHallPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setVirtualEventPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setHybridEventPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setPhysicalEventPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setOnlineEventPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setOfflineEventPreferences>;


// Team Role Preferences
export const UserTeamRolePreferencesActions = {
  setTeamFormationPhase: createAction("setTeamFormationPhase"),
  setEventManagerialPreferences: createAction<any>(
    "setEventManagerialPreferences"
  ),

  setEventSupervisoryPreferences: createAction<any>(
    "setEventSupervisoryPreferences"
  ),
  setEventTeamLeaderPreferences: createAction<any>(
    "setEventTeamLeaderPreferences"
  ),
  setEventCoordinatorPreferences: createAction<any>(
    "setEventCoordinatorPreferences"
  ),
  setEventProjectCoordinatorPreferences: createAction<any>(
    "setEventProjectCoordinatorPreferences"
  ),
  setEventProgramCoordinatorPreferences: createAction<any>(
    "setEventProgramCoordinatorPreferences"
  ),
  setEventPortfolioCoordinatorPreferences: createAction<any>(
    "setEventPortfolioCoordinatorPreferences"
  ),
  setEventOperationsCoordinatorPreferences: createAction<any>(
    "setEventOperationsCoordinatorPreferences"
  ),
  setEventAdministrationCoordinatorPreferences: createAction<any>(
    "setEventAdministrationCoordinatorPreferences"
  ),
  setEventExecutiveCoordinatorPreferences: createAction<any>(
    "setEventExecutiveCoordinatorPreferences"
  ),
  setEventLeaderCoordinatorPreferences: createAction<any>(
    "setEventLeaderCoordinatorPreferences"
  ),
  setEventManagerialCoordinatorPreferences: createAction<any>(
    "setEventManagerialCoordinatorPreferences"
  ),
  setEventSupervisoryCoordinatorPreferences: createAction<any>(
    "setEventSupervisoryCoordinatorPreferences"
  ),
  setEventTeamLeaderCoordinatorPreferences: createAction<any>(
    "setEventTeamLeaderCoordinatorPreferences"
  ),
  setEventSupportCoordinatorPreferences: createAction<any>(
    "setEventSupportCoordinatorPreferences"
  ),
  setEventCustomerServiceCoordinatorPreferences: createAction<any>(
    "setEventCustomerServiceCoordinatorPreferences"
  ),
  setEventQualityAssuranceCoordinatorPreferences: createAction<any>(
    "setEventQualityAssuranceCoordinatorPreferences"
  ),
  setEventHealthSafetyCoordinatorPreferences: createAction<any>(
    "setEventHealthSafetyCoordinatorPreferences"
  ),
  setEventComplianceCoordinatorPreferences: createAction<any>(
    "setEventComplianceCoordinatorPreferences"
  ),
  setEventRiskCoordinatorPreferences: createAction<any>(
    "setEventRiskCoordinatorPreferences"
  ),
};


// Define action types for user team role preferences
export type UserTeamRolePreferencesActionTypes =
  | ReturnType<typeof UserTeamRolePreferencesActions.setTeamFormationPhase>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventManagerialPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventSupervisoryPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventTeamLeaderPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventProjectCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventProgramCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventPortfolioCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventOperationsCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventAdministrationCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventExecutiveCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventLeaderCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventManagerialCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventSupervisoryCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventTeamLeaderCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventSupportCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventCustomerServiceCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventQualityAssuranceCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventHealthSafetyCoordinatorPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setEventComplianceCoordinatorPreferences>
 

// Miscellaneous Preferences
export const UserMiscellaneousPreferencesActions = {
  setMiscellaneousPreferences: createAction<any>("setMiscellaneousPreferences"),
};

export const UserPreferencesActions = {
  fetchUserPreferencesRequest: createAction("fetchUserPreferencesRequest"),
  fetchUserPreferencesSuccess: createAction<{ userPreferences: any }>(
    "fetchUserPreferencesSuccess"
  ),
  fetchUserPreferencesFailure: createAction<{ error: string }>(
    "fetchUserPreferencesFailure"
  ),
  ...UserBrandingPreferencesActions,
  ...UserCommunicationPreferencesActions,
  ...UserVisualPreferencesActions,
  ...UserDataManagementPreferencesActions,
  ...UserCollaborationPreferencesActions,
  ...UserTaskManagementPreferencesActions,
  ...UserEventManagementPreferencesActions,
  ...UserProfilePreferencesActions,
  ...UserSupportFeedbackPreferencesActions,
  ...UserTrainingEducationPreferencesActions,
  ...UserEventPreferencesActions,
  ...UserMiscellaneousPreferencesActions,
  ...UserTeamRolePreferencesActions,
  //todo check to see if we need it
  // ...UserNotificationPreferencesActions,
  // ...UserGeneralPreferencesActions
};


// Define action types for UserPreferencesActions
export type UserPreferencesActionTypes =
  | ReturnType<typeof UserPreferencesActions.fetchUserPreferencesRequest>
  | ReturnType<typeof UserPreferencesActions.fetchUserPreferencesSuccess>
  | ReturnType<typeof UserPreferencesActions.fetchUserPreferencesFailure>
  // Include action types from all imported actions
  | ReturnType<typeof UserBrandingPreferencesActions.setBrandingPreferences>
  | ReturnType<typeof UserCommunicationPreferencesActions.setCommunicationPreferences>
  | ReturnType<typeof UserVisualPreferencesActions.setTheme>
  | ReturnType<typeof UserVisualPreferencesActions.setDarkMode>
  | ReturnType<typeof UserDataManagementPreferencesActions.setTimeZone>
  | ReturnType<typeof UserCollaborationPreferencesActions.setAccessibilityOptions>
  | ReturnType<typeof UserTaskManagementPreferencesActions.setTaskManagementSettings>
  | ReturnType<typeof UserEventManagementPreferencesActions.setCalendarPreferences>
  | ReturnType<typeof UserProfilePreferencesActions.setProfilePreferences>
  | ReturnType<typeof UserSupportFeedbackPreferencesActions.setFeedbackPreferences>
  | ReturnType<typeof UserTrainingEducationPreferencesActions.setTrainingPreferences>
  | ReturnType<typeof UserEventPreferencesActions.setGatheringPreferences>
  | ReturnType<typeof UserTeamRolePreferencesActions.setTeamFormationPhase>
  // Include other necessary action types


// exampe usage:

// Dispatch the action to set the theme
// dispatch(UserPreferencesActions.setTheme("dark"));
