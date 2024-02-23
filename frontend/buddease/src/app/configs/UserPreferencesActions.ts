// generators/UserPreferencesActions.ts
import { createAction } from "@reduxjs/toolkit";

// Communication Preferences
export const UserCommunicationPreferencesActions = {
  setTheme: createAction<string>("setTheme"),
  setThemeFailure: createAction<{ error: string }>("setThemeFailure"),
  // Actions for project phases
  setIdeationPhase: createAction<{
    ideaId: string;
    idea: { title: string; description: string };
  }>("setIdeationPhase"),
  setBrainstormingPhase: createAction("setBrainstormingPhase"),
  setLaunchPhase: createAction("setLaunchPhase"),
  setDataAnalysisPhase: createAction("setDataAnalysisPhase"),

  // Actions for communication features
  enableAudioCommunication: createAction("enableAudioCommunication"),
  enableVideoCommunication: createAction("enableVideoCommunication"),
  enableTextCommunication: createAction("enableTextCommunication"),
  enableRealTimeCollaboration: createAction("enableRealTimeCollaboration"),

  // Actions for community involvement
  joinCommunity: createAction("joinCommunity"),
  participateInGlobalProject: createAction("participateInGlobalProject"),
  contributeToUnity: createAction("contributeToUnity"),

  // Actions for monetization opportunities
  offerDevelopmentServices: createAction("offerDevelopmentServices"),
  leveragePlatformForClientProjects: createAction(
    "leveragePlatformForClientProjects"
  ),
  generateRevenueForSustainability: createAction(
    "generateRevenueForSustainability"
  ),

  setIdeationPhaseFailure: createAction<{ error: string }>(
    "setIdeationPhaseFailure"
  ),
  setLanguage: createAction<string>("setLanguage"),
  setNotificationPreferences: createAction<any>("setNotificationPreferences"),
  setEmailNotifications: createAction<boolean>("setEmailNotifications"),
  setPushNotifications: createAction<boolean>("setPushNotifications"),
  setSMSNotifications: createAction<boolean>("setSMSNotifications"),
  setDesktopNotifications: createAction<boolean>("setDesktopNotifications"),
  setCustomNotifications: createAction<any>("setCustomNotifications"),
};

export const UserBrandingPreferencesActions = {
  setTheme: createAction<string>("setTheme"),
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

// Visual Preferences
export const UserVisualPreferencesActions = {
  setTheme: createAction<string>("setTheme"),
  setDarkMode: createAction<boolean>("setDarkMode"),
  setFontSize: createAction<number>("setFontSize"),
  setColorScheme: createAction<string>("setColorScheme"),
  setLogoPreferences: createAction<any>("setLogoPreferences"),
  setIconPreferences: createAction<any>("setIconPreferences"),
  setBackgroundPreferences: createAction<any>("setBackgroundPreferences"),
  setAvatarPreferences: createAction<any>("setAvatarPreferences"),
};

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

// Collaboration Preferences
export const UserCollaborationPreferencesActions = {
  setAccessibilityOptions: createAction<any>("setAccessibilityOptions"),
  setPrivacySettings: createAction<any>("setPrivacySettings"),
  setSecurityPreferences: createAction<any>("setSecurityPreferences"),
  setCollaborationSettings: createAction<any>("setCollaborationSettings"),
  setIntegrationPreferences: createAction<any>("setIntegrationPreferences"),
};

// Task Management Preferences
export const UserTaskManagementPreferencesActions = {
  setTaskManagementSettings: createAction<any>("setTaskManagementSettings"),
};

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

// User Profile Preferences
export const UserProfilePreferencesActions = {
  setProfilePreferences: createAction<any>("setProfilePreferences"),
  setBioPreferences: createAction<any>("setBioPreferences"),
  setContactPreferences: createAction<any>("setContactPreferences"),
  setAddressPreferences: createAction<any>("setAddressPreferences"),
  setSocialMediaPreferences: createAction<any>("setSocialMediaPreferences"),
};

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
  ...UserBrandingPreferencesActions,
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

// exampe usage:

// Dispatch the action to set the theme
// dispatch(UserPreferencesActions.setTheme("dark"));
