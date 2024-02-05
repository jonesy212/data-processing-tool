// generators/UserPreferencesActions.ts
import { createAction } from "@reduxjs/toolkit";

// Communication Preferences
export const UserCommunicationPreferences = {
  setTheme: createAction<string>("setTheme"),
  // Actions for project phases
  setIdeationPhase: createAction("setIdeationPhase"),
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

  setLanguage: createAction<string>("setLanguage"),
  setNotificationPreferences: createAction<any>("setNotificationPreferences"),
  setEmailNotifications: createAction<boolean>("setEmailNotifications"),
  setPushNotifications: createAction<boolean>("setPushNotifications"),
  setSMSNotifications: createAction<boolean>("setSMSNotifications"),
  setDesktopNotifications: createAction<boolean>("setDesktopNotifications"),
  setCustomNotifications: createAction<any>("setCustomNotifications"),
};

// Visual Preferences
export const UserVisualPreferences = {
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
export const UserDataManagementPreferences = {
  setTimeZone: createAction<string>("setTimeZone"),
  setCurrency: createAction<string>("setCurrency"),
  setPreferredUnits: createAction<string>("setPreferredUnits"),
  setAutoSavePreferences: createAction<boolean>("setAutoSavePreferences"),
  setBackupPreferences: createAction<any>("setBackupPreferences"),
  setSyncPreferences: createAction<any>("setSyncPreferences"),
  setOfflineMode: createAction<boolean>("setOfflineMode"),
};

// Collaboration Preferences
export const UserCollaborationPreferences = {
  setAccessibilityOptions: createAction<any>("setAccessibilityOptions"),
  setPrivacySettings: createAction<any>("setPrivacySettings"),
  setSecurityPreferences: createAction<any>("setSecurityPreferences"),
  setCollaborationSettings: createAction<any>("setCollaborationSettings"),
  setIntegrationPreferences: createAction<any>("setIntegrationPreferences"),
};

// Task Management Preferences
export const UserTaskManagementPreferences = {
  setTaskManagementSettings: createAction<any>("setTaskManagementSettings"),
};

// Event Management Preferences
export const UserEventManagementPreferences = {
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
export const UserProfilePreferences = {
  setProfilePreferences: createAction<any>("setProfilePreferences"),
  setBioPreferences: createAction<any>("setBioPreferences"),
  setContactPreferences: createAction<any>("setContactPreferences"),
  setAddressPreferences: createAction<any>("setAddressPreferences"),
  setSocialMediaPreferences: createAction<any>("setSocialMediaPreferences"),
};

// Support and Feedback Preferences
export const UserSupportFeedbackPreferences = {
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
export const UserTrainingEducationPreferences = {
  setTrainingPreferences: createAction<any>("setTrainingPreferences"),
  setTutorialPreferences: createAction<any>("setTutorialPreferences"),
  setDemoPreferences: createAction<any>("setDemoPreferences"),
  setWebinarPreferences: createAction<any>("setWebinarPreferences"),
  setWorkshopPreferences: createAction<any>("setWorkshopPreferences"),
  setSeminarPreferences: createAction<any>("setSeminarPreferences"),
  setConferencePreferences: createAction<any>("setConferencePreferences"),
};

// Event Preferences
export const UserEventPreferences = {
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
export const UserTeamRolePreferences = {
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
export const UserMiscellaneousPreferences = {
  setMiscellaneousPreferences: createAction<any>("setMiscellaneousPreferences"),
};

// exampe usage:

// Dispatch the action to set the theme
// dispatch(UserPreferencesActions.setTheme("dark"));
