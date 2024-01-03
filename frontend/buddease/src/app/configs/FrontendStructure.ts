// config/frontendStructure.ts
export const frontendStructure = {

    components: [],
    actions: [],
    auth: {
      routers: [],
      components: [],
      context: "",
    },
    cards: {
      types: [],
      actions: [],
      containers: [],
      init: {
        types: [],
        actions: [],
      },
      todo: [],
    },
    communications: {
      chat: "",
      email: [],
    },
    dashboards: {
      types: [],
      loaders: [],
    },
    documents: {
      attachment: "",
      builder: "",
      editor: "",
      screenFunctionality: {
        keys: "",
        tooltips: "",
      },
    },
    hooks: {
      generators: [],
      usage: [],
    },
    lists: [],
    onboarding: [],
    prompts: [],
    routing: {
      protectedRoute: "",
      search: "",
    },
    state: {
      mobxReact: "",
      redux: {
        actions: [],
        reducers: [],
        slices: [],
      },
      stores: {
          iconStore: "",
          // todo verify correct type for both rootStores and generators.
        rootStores: [],
        generators: [],
        storeProvider: "",
        userPreferences: {
          modules: {
              appearance: {
                  actions: ["CHANGE_THEME", "CHANGE_LANGUAGE", "ADJUST_FONT_SIZE"],
                  reducers: ["themeReducer", "languageReducer", "fontSizeReducer"],
              },
              communication: {
                  actions: ["ENABLE_REAL_TIME_CHAT", "ENABLE_NOTIFICATION_EMAIL"],
                  reducers: ["realTimeChatReducer", "notificationEmailReducer"],
              },
              collaboration: {
                  actions: ["ENABLE_TASK_MANAGEMENT", "ENABLE_PROJECT_MANAGEMENT"],
                  reducers: ["taskManagementReducer", "projectManagementReducer"],
              },
              collaborationPreferences: {
                  teamBuilding: {
                      enableTeamBuilding: true,
                      teamBuildingSettings: {}
                  },
                  projectManagement: {
                      enableProjectManagement: true,
                      projectManagementSettings: {}
                  },
                  meetings: {
                      enableMeetings: true,
                      meetingsSettings: {}
                  },
                  brainstorming: {
                      enableBrainstorming: true,
                      brainstormingSettings: {}

                  }
              }
          },
          actions: [],
          reducers: [],
        },
      },
    },
    styling: {
      accessibility: "",
      animationsAndTransitions: "",
      colorPalette: "",
      colorPicker: "",
      documentation: "",
      dynamicColorPalette: "",
      dynamicComponents: "",
      dynamicIconsAndImages: "",
      dynamicSpacingAndLayout: "",
      dynamicTypography: "",
      palette: "",
      paletteManager: "",
      responsiveDesign: "",
    },
    support: {
      userSupport: "",
    },
    todos: {
      fetchTodos: "",
      todoActions: "",
      todoList: "",
      todoReducer: "",
      tasks: {
        dataProcessingTask: "",
        user: "",
      },
    },
    tooltips: {
      todo: "",
    },
    versions: {
      versioning: "",
    },
    css: {
      search: "",
      stylesheet: "",
    },
    images: [],
    layout: "",
    pageModule: "",
    page: "",
    pages: {
      supportResponse: "",
      app: "",
      dashboards: {
        dashboard: "",
        dashboardLoader: "",
        recruiterSeekerDashboard: "",
        index: "",
      },
      forms: {
        changePasswordForm: "",
        emailVerificationForm: "",
        forgotPasswordForm: "",
        loginForm: "",
        utils: {
          commonLoginLogic: "",
        },
      },
      index: "",
      layouts: {
        commonLayout: "",
        dashboardLayout: "",
        layouts: "",
      },
      onboarding: {
        gettingToKnowYouPage: "",
        offerLandingPage: "",
        questionnairePage: "",
      },
      recruiterDashboard: "",
      searchs: {
        search: "",
        userSearch: "",
        todo: "",
      },
      upload: "",
    },
    todo: {
      todos: "",
    },
    ts: {
      clipboard: "",
      events: "",
    },
  }


export default frontendStructure;
