import { NestedEndpoints }  from "./ApiEndpoints";

//endpointPreferences.ts
const BASE_URL = "https://your-api-base-url";

export const endpointPreferences: {
  [key: string]: string | NestedEndpoints;
} = {
  userMiscellaneousPreferences: {
    setMiscellaneousPreferences: `${BASE_URL}/api/user/preferences/miscellaneous/set`, // Define the setMiscellaneousPreferences endpoint
  },

  userPreferences: {
    fetchUserPreferences: `${BASE_URL}/api/user/preferences`, // GET request for fetching user preferences
    updateUserPreferences: `${BASE_URL}/api/user/preferences`, // PUT request for updating user preferences
    deleteUserPreferences: `${BASE_URL}/api/user/preferences`, // DELETE request for deleting user preferences
    setTheme: `${BASE_URL}/api/user/preferences/theme`, // Define the setTheme endpoint
    setIdeationPhase: `${BASE_URL}/api/user/preferences/ideation-phase`, // Define the setIdeationPhase endpoint
    setBrainstormingPhase: `${BASE_URL}/api/user/preferences/brainstorming-phase`, // Define the setBrainstormingPhase endpoint
    setLaunchPhase: `${BASE_URL}/api/user/preferences/launch-phase`, // Define the setLaunchPhase endpoint
    setDataAnalysisPhase: `${BASE_URL}/api/user/preferences/data-analysis-phase`, // Define the setDataAnalysisPhase endpoint
  },

  communicationPreferences: {
    setTheme: `${BASE_URL}/api/communication/preferences/theme`, // Define the setTheme endpoint
    setThemeFailure: `${BASE_URL}/api/communication/preferences/theme/failure`, // Define the setThemeFailure endpoint
    setIdeationPhase: `${BASE_URL}/api/communication/preferences/ideation-phase`, // Define the setIdeationPhase endpoint
    setBrainstormingPhase: `${BASE_URL}/api/communication/preferences/brainstorming-phase`, // Define the setBrainstormingPhase endpoint
    setLaunchPhase: `${BASE_URL}/api/communication/preferences/launch-phase`, // Define the setLaunchPhase endpoint
    setDataAnalysisPhase: `${BASE_URL}/api/communication/preferences/data-analysis-phase`, // Define the setDataAnalysisPhase endpoint
    enableAudioCommunication: `${BASE_URL}/api/communication/preferences/audio/enable`, // Define the enableAudioCommunication endpoint
    enableAudioCommunicationFailure: `${BASE_URL}/api/communication/preferences/audio/enable/failure`, // Define the enableAudioCommunicationFailure endpoint
    enableAudioCommunicationSuccess: `${BASE_URL}/api/communication/preferences/audio/enable/success`, // Define the enableAudioCommunicationSuccess endpoint
    enableVideoCommunication: `${BASE_URL}/api/communication/preferences/video/enable`, // Define the enableVideoCommunication endpoint
    enableTextCommunication: `${BASE_URL}/api/communication/preferences/text/enable`, // Define the enableTextCommunication endpoint
    enableRealTimeCollaboration: `${BASE_URL}/api/communication/preferences/real-time-collaboration/enable`, // Define the enableRealTimeCollaboration endpoint
    joinCommunity: `${BASE_URL}/api/communication/preferences/community/join`, // Define the joinCommunity endpoint
    participateInGlobalProject: `${BASE_URL}/api/communication/preferences/global-project/participate`, // Define the participateInGlobalProject endpoint
    contributeToUnity: `${BASE_URL}/api/communication/preferences/unity/contribute`, // Define the contributeToUnity endpoint
    offerDevelopmentServices: `${BASE_URL}/api/communication/preferences/development-services/offer`, // Define the offerDevelopmentServices endpoint
    leveragePlatformForClientProjects: `${BASE_URL}/api/communication/preferences/platform-leverage/client-projects`, // Define the leveragePlatformForClientProjects endpoint
    generateRevenueForSustainability: `${BASE_URL}/api/communication/preferences/revenue/generate`, // Define the generateRevenueForSustainability endpoint
    setIdeationPhaseFailure: `${BASE_URL}/api/communication/preferences/ideation-phase/failure`, // Define the setIdeationPhaseFailure endpoint
    setLanguage: `${BASE_URL}/api/communication/preferences/language/set`, // Define the setLanguage endpoint
    setNotificationPreferences: `${BASE_URL}/api/communication/preferences/notifications/set`, // Define the setNotificationPreferences endpoint
    setEmailNotifications: `${BASE_URL}/api/communication/preferences/notifications/email/set`, // Define the setEmailNotifications endpoint
    setPushNotifications: `${BASE_URL}/api/communication/preferences/notifications/push/set`, // Define the setPushNotifications endpoint
    setSMSNotifications: `${BASE_URL}/api/communication/preferences/notifications/sms/set`, // Define the setSMSNotifications endpoint
    setDesktopNotifications: `${BASE_URL}/api/communication/preferences/notifications/desktop/set`, // Define the setDesktopNotifications endpoint
    setCustomNotifications: `${BASE_URL}/api/communication/preferences/notifications/custom/set`, // Define the setCustomNotifications endpoint
  },

  userBrandingPreferences: {
    setUserBrandColors: `${BASE_URL}/api/user/preferences/branding/colors/set`, // Define the setUserBrandColors endpoint
    setUserLogo: `${BASE_URL}/api/user/preferences/branding/logo/set`, // Define the setUserLogo endpoint
    setFontStyles: `${BASE_URL}/api/user/preferences/branding/font-styles/set`, // Define the setFontStyles endpoint
    setBackgroundImage: `${BASE_URL}/api/user/preferences/branding/background-image/set`, // Define the setBackgroundImage endpoint
    setIconography: `${BASE_URL}/api/user/preferences/branding/iconography/set`, // Define the setIconography endpoint
    setButtonStyles: `${BASE_URL}/api/user/preferences/branding/button-styles/set`, // Define the setButtonStyles endpoint
    setTypography: `${BASE_URL}/api/user/preferences/branding/typography/set`, // Define the setTypography endpoint
    setColors: `${BASE_URL}/api/user/preferences/branding/colors/set`, // Define the setColors endpoint
    setShadows: `${BASE_URL}/api/user/preferences/branding/shadows/set`, // Define the setShadows endpoint
    setSpacing: `${BASE_URL}/api/user/preferences/branding/spacing/set`, // Define the setSpacing endpoint
    setHeaderColor: `${BASE_URL}/api/user/preferences/branding/header-color/set`, // Define the setHeaderColor endpoint
    setBorderColor: `${BASE_URL}/api/user/preferences/branding/border-color/set`, // Define the setBorderColor endpoint
    setBackgroundColor: `${BASE_URL}/api/user/preferences/branding/background-color/set`, // Define the setBackgroundColor endpoint
    setHoverColor: `${BASE_URL}/api/user/preferences/branding/hover-color/set`, // Define the setHoverColor endpoint
    setHoverTextColor: `${BASE_URL}/api/user/preferences/branding/hover-text-color/set`, // Define the setHoverTextColor endpoint
    setHoverBackgroundColor: `${BASE_URL}/api/user/preferences/branding/hover-background-color/set`, // Define the setHoverBackgroundColor endpoint
    setLinkColor: `${BASE_URL}/api/user/preferences/branding/link-color/set`, // Define the setLinkColor endpoint
    setLinkHoverColor: `${BASE_URL}/api/user/preferences/branding/link-hover-color/set`, // Define the setLinkHoverColor endpoint
    setLinkVisitedColor: `${BASE_URL}/api/user/preferences/branding/link-visited-color/set`, // Define the setLinkVisitedColor endpoint
    setLinkActiveColor: `${BASE_URL}/api/user/preferences/branding/link-active-color/set`, // Define the setLinkActiveColor endpoint
    setLinkVisitedHoverColor: `${BASE_URL}/api/user/preferences/branding/link-visited-hover-color/set`, // Define the setLinkVisitedHoverColor endpoint
    setLinkActiveHoverColor: `${BASE_URL}/api/user/preferences/branding/link-active-hover-color/set`, // Define the setLinkActiveHoverColor endpoint
    setLinkDisabledColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-color/set`, // Define the setLinkDisabledColor endpoint
    setLinkDisabledHoverColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-hover-color/set`, // Define the setLinkDisabledHoverColor endpoint
    setLinkDisabledVisitedColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-visited-color/set`, // Define the setLinkDisabledVisitedColor endpoint
    setLinkDisabledActiveColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-active-color/set`, // Define the setLinkDisabledActiveColor endpoint
    setLinkDisabledVisitedHoverColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-visited-hover-color/set`, // Define the setLinkDisabledVisitedHoverColor endpoint
    setLinkDisabledActiveHoverColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-active-hover-color/set`, // Define the setLinkDisabledActiveHoverColor endpoint
    setLinkDisabledBackgroundColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-background-color/set`, // Define the setLinkDisabledBackgroundColor endpoint
    setLinkDisabledHoverBackgroundColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-hover-background-color/set`, // Define the setLinkDisabledHoverBackgroundColor endpoint
    setLinkDisabledVisitedBackgroundColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-visited-background-color/set`, // Define the setLinkDisabledVisitedBackgroundColor endpoint
    setLinkDisabledActiveBackgroundColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-active-background-color/set`, // Define the setLinkDisabledActiveBackgroundColor endpoint
    setLinkDisabledVisitedHoverBackgroundColor: `${BASE_URL}/api/user/preferences/branding/link-disabled-visited-hover-background-color/set`, // Define the setLinkDisabledVisitedHoverBackgroundColor endpoint
    // Define other branding preferences endpointPreferences as needed...
  },

  userEventPreferences: {
    setGatheringPreferences: `${BASE_URL}/api/user/preferences/event/gathering/set`, // Define the setGatheringPreferences endpoint
    setSummitPreferences: `${BASE_URL}/api/user/preferences/event/summit/set`, // Define the setSummitPreferences endpoint
    setSymposiumPreferences: `${BASE_URL}/api/user/preferences/event/symposium/set`, // Define the setSymposiumPreferences endpoint
    setConventionPreferences: `${BASE_URL}/api/user/preferences/event/convention/set`, // Define the setConventionPreferences endpoint
    setExhibitionPreferences: `${BASE_URL}/api/user/preferences/event/exhibition/set`, // Define the setExhibitionPreferences endpoint
    setFairPreferences: `${BASE_URL}/api/user/preferences/event/fair/set`, // Define the setFairPreferences endpoint
    setShowPreferences: `${BASE_URL}/api/user/preferences/event/show/set`, // Define the setShowPreferences endpoint
    setExpoPreferences: `${BASE_URL}/api/user/preferences/event/expo/set`, // Define the setExpoPreferences endpoint
    setMarketPreferences: `${BASE_URL}/api/user/preferences/event/market/set`, // Define the setMarketPreferences endpoint
    setFestivalPreferences: `${BASE_URL}/api/user/preferences/event/festival/set`, // Define the setFestivalPreferences endpoint
    setCelebrationPreferences: `${BASE_URL}/api/user/preferences/event/celebration/set`, // Define the setCelebrationPreferences endpoint
    setPartyPreferences: `${BASE_URL}/api/user/preferences/event/party/set`, // Define the setPartyPreferences endpoint
    setGalaPreferences: `${BASE_URL}/api/user/preferences/event/gala/set`, // Define the setGalaPreferences endpoint
    setAwardsPreferences: `${BASE_URL}/api/user/preferences/event/awards/set`, // Define the setAwardsPreferences endpoint
    setContestPreferences: `${BASE_URL}/api/user/preferences/event/contest/set`, // Define the setContestPreferences endpoint
    setCompetitionPreferences: `${BASE_URL}/api/user/preferences/event/competition/set`, // Define the setCompetitionPreferences endpoint
    setChallengePreferences: `${BASE_URL}/api/user/preferences/event/challenge/set`, // Define the setChallengePreferences endpoint
    setHackathonPreferences: `${BASE_URL}/api/user/preferences/event/hackathon/set`, // Define the setHackathonPreferences endpoint
    setGameJamPreferences: `${BASE_URL}/api/user/preferences/event/game-jam/set`, // Define the setGameJamPreferences endpoint
    setPitchPreferences: `${BASE_URL}/api/user/preferences/event/pitch/set`, // Define the setPitchPreferences endpoint
    setDemoDayPreferences: `${BASE_URL}/api/user/preferences/event/demo-day/set`, // Define the setDemoDayPreferences endpoint
    setShowcasePreferences: `${BASE_URL}/api/user/preferences/event/showcase/set`, // Define the setShowcasePreferences endpoint
    setExhibitionHallPreferences: `${BASE_URL}/api/user/preferences/event/exhibition-hall/set`, // Define the setExhibitionHallPreferences endpoint
    setVirtualEventPreferences: `${BASE_URL}/api/user/preferences/event/virtual-event/set`, // Define the setVirtualEventPreferences endpoint
    setHybridEventPreferences: `${BASE_URL}/api/user/preferences/event/hybrid-event/set`, // Define the setHybridEventPreferences endpoint
    setPhysicalEventPreferences: `${BASE_URL}/api/user/preferences/event/physical-event/set`, // Define the setPhysicalEventPreferences endpoint
    setOnlineEventPreferences: `${BASE_URL}/api/user/preferences/event/online-event/set`, // Define the setOnlineEventPreferences endpoint
    setOfflineEventPreferences: `${BASE_URL}/api/user/preferences/event/offline-event/set`, // Define the setOfflineEventPreferences endpoint
    // Add more event preferences endpointPreferences as needed...
  },

  userProfilePreferences: {
    setProfilePreferences: `${BASE_URL}/api/user/preferences/profile/set`, // Define the setProfilePreferences endpoint
    setBioPreferences: `${BASE_URL}/api/user/preferences/bio/set`, // Define the setBioPreferences endpoint
    setContactPreferences: `${BASE_URL}/api/user/preferences/contact/set`, // Define the setContactPreferences endpoint
    setAddressPreferences: `${BASE_URL}/api/user/preferences/address/set`, // Define the setAddressPreferences endpoint
    setSocialMediaPreferences: `${BASE_URL}/api/user/preferences/social-media/set`, // Define the setSocialMediaPreferences endpoint
    // Add more user profile preferences endpointPreferences as needed...
  },

  visualPreferences: {
    setTheme: `${BASE_URL}/api/user/preferences/visual/theme/set`, // Define the setTheme endpoint
    setDarkMode: `${BASE_URL}/api/user/preferences/visual/dark-mode/set`, // Define the setDarkMode endpoint
    setFontSize: `${BASE_URL}/api/user/preferences/visual/font-size/set`, // Define the setFontSize endpoint
    setColorScheme: `${BASE_URL}/api/user/preferences/visual/color-scheme/set`, // Define the setColorScheme endpoint
    setLogoPreferences: `${BASE_URL}/api/user/preferences/visual/logo-preferences/set`, // Define the setLogoPreferences endpoint
    setIconPreferences: `${BASE_URL}/api/user/preferences/visual/icon-preferences/set`, // Define the setIconPreferences endpoint
    setBackgroundPreferences: `${BASE_URL}/api/user/preferences/visual/background-preferences/set`, // Define the setBackgroundPreferences endpoint
    setAvatarPreferences: `${BASE_URL}/api/user/preferences/visual/avatar-preferences/set`, // Define the setAvatarPreferences endpoint
    // Add more visual preferences endpointPreferences as needed...
  },

  dataManagementPreferences: {
    setTimeZone: `${BASE_URL}/api/user/preferences/data-management/time-zone/set`, // Define the setTimeZone endpoint
    setCurrency: `${BASE_URL}/api/user/preferences/data-management/currency/set`, // Define the setCurrency endpoint
    setPreferredUnits: `${BASE_URL}/api/user/preferences/data-management/preferred-units/set`, // Define the setPreferredUnits endpoint
    setAutoSavePreferences: `${BASE_URL}/api/user/preferences/data-management/auto-save/set`, // Define the setAutoSavePreferences endpoint
    setBackupPreferences: `${BASE_URL}/api/user/preferences/data-management/backup-preferences/set`, // Define the setBackupPreferences endpoint
    setSyncPreferences: `${BASE_URL}/api/user/preferences/data-management/sync-preferences/set`, // Define the setSyncPreferences endpoint
    setOfflineMode: `${BASE_URL}/api/user/preferences/data-management/offline-mode/set`, // Define the setOfflineMode endpoint
    // Add more data management preferences endpointPreferences as needed...
  },

  collaborationPreferences: {
    setAccessibilityOptions: `${BASE_URL}/api/user/preferences/collaboration/accessibility-options/set`, // Define the setAccessibilityOptions endpoint
    setPrivacySettings: `${BASE_URL}/api/user/preferences/collaboration/privacy-settings/set`, // Define the setPrivacySettings endpoint
    setSecurityPreferences: `${BASE_URL}/api/user/preferences/collaboration/security-preferences/set`, // Define the setSecurityPreferences endpoint
    setCollaborationSettings: `${BASE_URL}/api/user/preferences/collaboration/collaboration-settings/set`, // Define the setCollaborationSettings endpoint
    setIntegrationPreferences: `${BASE_URL}/api/user/preferences/collaboration/integration-preferences/set`, // Define the setIntegrationPreferences endpoint
    // Add more collaboration preferences endpointPreferences as needed...
  },

  taskManagementPreferences: {
    setTaskManagementSettings: `${BASE_URL}/api/user/preferences/task-management/settings/set`, // Define the setTaskManagementSettings endpoint
    // Add more task management preferences endpointPreferences as needed...
  },

  eventManagementPreferences: {
    setCalendarPreferences: `${BASE_URL}/api/user/preferences/event-management/calendar-preferences/set`, // Define the setCalendarPreferences endpoint
    setEventRegistrationPreferences: `${BASE_URL}/api/user/preferences/event-management/registration-preferences/set`, // Define the setEventRegistrationPreferences endpoint
    setEventTicketPreferences: `${BASE_URL}/api/user/preferences/event-management/ticket-preferences/set`, // Define the setEventTicketPreferences endpoint
    setEventSchedulePreferences: `${BASE_URL}/api/user/preferences/event-management/schedule-preferences/set`, // Define the setEventSchedulePreferences endpoint
    setEventVenuePreferences: `${BASE_URL}/api/user/preferences/event-management/venue-preferences/set`, // Define the setEventVenuePreferences endpoint
    setEventSpeakerPreferences: `${BASE_URL}/api/user/preferences/event-management/speaker-preferences/set`, // Define the setEventSpeakerPreferences endpoint
    setEventSponsorPreferences: `${BASE_URL}/api/user/preferences/event-management/sponsor-preferences/set`, // Define the setEventSponsorPreferences endpoint
    setEventExhibitorPreferences: `${BASE_URL}/api/user/preferences/event-management/exhibitor-preferences/set`, // Define the setEventExhibitorPreferences endpoint
    setEventParticipantPreferences: `${BASE_URL}/api/user/preferences/event-management/participant-preferences/set`, // Define the setEventParticipantPreferences endpoint
    setEventAttendeePreferences: `${BASE_URL}/api/user/preferences/event-management/attendee-preferences/set`, // Define the setEventAttendeePreferences endpoint
    setEventOrganizerPreferences: `${BASE_URL}/api/user/preferences/event-management/organizer-preferences/set`, // Define the setEventOrganizerPreferences endpoint
    setEventCoordinatorPreferences: `${BASE_URL}/api/user/preferences/event-management/coordinator-preferences/set`, // Define the setEventCoordinatorPreferences endpoint
    // Add more event management preferences endpointPreferences as needed...
  },

  supportFeedbackPreferences: {
    setFeedbackPreferences: `${BASE_URL}/api/user/preferences/feedback/set`, // Define the setFeedbackPreferences endpoint
    setRatingPreferences: `${BASE_URL}/api/user/preferences/rating/set`, // Define the setRatingPreferences endpoint
    setReviewPreferences: `${BASE_URL}/api/user/preferences/review/set`, // Define the setReviewPreferences endpoint
    setSurveyPreferences: `${BASE_URL}/api/user/preferences/survey/set`, // Define the setSurveyPreferences endpoint
    setPollPreferences: `${BASE_URL}/api/user/preferences/poll/set`, // Define the setPollPreferences endpoint
    setFeedbackFormPreferences: `${BASE_URL}/api/user/preferences/feedback-form/set`, // Define the setFeedbackFormPreferences endpoint
    setSupportPreferences: `${BASE_URL}/api/user/preferences/support/set`, // Define the setSupportPreferences endpoint
    setHelpPreferences: `${BASE_URL}/api/user/preferences/help/set`, // Define the setHelpPreferences endpoint
    setDocumentationPreferences: `${BASE_URL}/api/user/preferences/documentation/set`, // Define the setDocumentationPreferences endpoint
    setFAQPreferences: `${BASE_URL}/api/user/preferences/faq/set`, // Define the setFAQPreferences endpoint
    setContactSupportPreferences: `${BASE_URL}/api/user/preferences/contact-support/set`, // Define the setContactSupportPreferences endpoint
    setChatSupportPreferences: `${BASE_URL}/api/user/preferences/chat-support/set`, // Define the setChatSupportPreferences endpoint
    setEmailSupportPreferences: `${BASE_URL}/api/user/preferences/email-support/set`, // Define the setEmailSupportPreferences endpoint
    setPhoneSupportPreferences: `${BASE_URL}/api/user/preferences/phone-support/set`, // Define the setPhoneSupportPreferences endpoint
    setTicketSupportPreferences: `${BASE_URL}/api/user/preferences/ticket-support/set`, // Define the setTicketSupportPreferences endpoint
    // Add more support and feedback preferences endpointPreferences as needed...
  },

  trainingEducationPreferences: {
    setTrainingPreferences: `${BASE_URL}/api/user/preferences/training/set`, // Define the setTrainingPreferences endpoint
    setTutorialPreferences: `${BASE_URL}/api/user/preferences/tutorial/set`, // Define the setTutorialPreferences endpoint
    setDemoPreferences: `${BASE_URL}/api/user/preferences/demo/set`, // Define the setDemoPreferences endpoint
    setWebinarPreferences: `${BASE_URL}/api/user/preferences/webinar/set`, // Define the setWebinarPreferences endpoint
    setWorkshopPreferences: `${BASE_URL}/api/user/preferences/workshop/set`, // Define the setWorkshopPreferences endpoint
    setSeminarPreferences: `${BASE_URL}/api/user/preferences/seminar/set`, // Define the setSeminarPreferences endpoint
    setConferencePreferences: `${BASE_URL}/api/user/preferences/conference/set`, // Define the setConferencePreferences endpoint
    // Add more training and education preferences endpointPreferences as needed...
  },

  userTeamRolePreferences: {
    setTeamFormationPhase: `${BASE_URL}/api/user/preferences/team/formation-phase/set`, // Define the setTeamFormationPhase endpoint
    setEventManagerialPreferences: `${BASE_URL}/api/user/preferences/team/event-managerial/set`, // Define the setEventManagerialPreferences endpoint
    setEventSupervisoryPreferences: `${BASE_URL}/api/user/preferences/team/event-supervisory/set`, // Define the setEventSupervisoryPreferences endpoint
    setEventTeamLeaderPreferences: `${BASE_URL}/api/user/preferences/team/event-team-leader/set`, // Define the setEventTeamLeaderPreferences endpoint
    setEventCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-coordinator/set`, // Define the setEventCoordinatorPreferences endpoint
    setEventProjectCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-project-coordinator/set`, // Define the setEventProjectCoordinatorPreferences endpoint
    setEventProgramCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-program-coordinator/set`, // Define the setEventProgramCoordinatorPreferences endpoint
    setEventPortfolioCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-portfolio-coordinator/set`, // Define the setEventPortfolioCoordinatorPreferences endpoint
    setEventOperationsCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-operations-coordinator/set`, // Define the setEventOperationsCoordinatorPreferences endpoint
    setEventAdministrationCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-administration-coordinator/set`, // Define the setEventAdministrationCoordinatorPreferences endpoint
    setEventExecutiveCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-executive-coordinator/set`, // Define the setEventExecutiveCoordinatorPreferences endpoint
    setEventLeaderCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-leader-coordinator/set`, // Define the setEventLeaderCoordinatorPreferences endpoint
    setEventManagerialCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-managerial-coordinator/set`, // Define the setEventManagerialCoordinatorPreferences endpoint
    setEventSupervisoryCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-supervisory-coordinator/set`, // Define the setEventSupervisoryCoordinatorPreferences endpoint
    setEventTeamLeaderCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-team-leader-coordinator/set`, // Define the setEventTeamLeaderCoordinatorPreferences endpoint
    setEventSupportCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-support-coordinator/set`, // Define the setEventSupportCoordinatorPreferences endpoint
    setEventCustomerServiceCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-customer-service-coordinator/set`, // Define the setEventCustomerServiceCoordinatorPreferences endpoint
    setEventQualityAssuranceCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-quality-assurance-coordinator/set`, // Define the setEventQualityAssuranceCoordinatorPreferences endpoint
    setEventHealthSafetyCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-health-safety-coordinator/set`, // Define the setEventHealthSafetyCoordinatorPreferences endpoint
    setEventComplianceCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-compliance-coordinator/set`, // Define the setEventComplianceCoordinatorPreferences endpoint
    setEventRiskCoordinatorPreferences: `${BASE_URL}/api/user/preferences/team/event-risk-coordinator/set`, // Define the setEventRiskCoordinatorPreferences endpoint
    // Add more team role preferences endpointPreferences as needed...
  },
};
