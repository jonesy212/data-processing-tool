// CriteriaEnums.ts
enum CommunicationTypeEnum {
    AUDIO = "Audio",            // Communication through voice calls
    VIDEO = "Video",            // Communication through video conferencing
    TEXT = "Text",              // Communication through instant messaging or chat
    EMAIL = "Email",            // Communication through email
    FORUM = "Forum",            // Communication through online discussion boards or forums
    WHITEBOARD = "Whiteboard",  // Communication using collaborative whiteboarding tools
}


enum CollaborationPhaseEnum {
    IDEATION = "Ideation",       // The initial phase where ideas are generated
    PLANNING = "Planning",       // The phase where strategies and plans are developed
    EXECUTION = "Execution",     // The phase where tasks are carried out
    REVIEW = "Review",           // The phase where the work is evaluated and feedback is provided
    CLOSURE = "Closure",         // The final phase where the project is concluded and documented
}


enum CollaborationToolEnum {
    SLACK = "Slack",            // Instant messaging and collaboration platform
    ZOOM = "Zoom",              // Video conferencing tool for remote meetings
    TRELLO = "Trello",          // Project management tool using boards and cards
    MURAL = "Mural",            // Visual collaboration tool for brainstorming
    GOOGLE_DRIVE = "Google Drive", // Cloud storage and file sharing platform
    JIRA = "JIRA",              // Project management tool for agile teams
}


enum PhaseDurationEnum {
    SHORT_TERM = "Short Term",     // Phases lasting less than a week
    MEDIUM_TERM = "Medium Term",   // Phases lasting from one week to one month
    LONG_TERM = "Long Term",       // Phases lasting over a month
    ONGOING = "Ongoing",           // Phases that are continuous without a specific end
}


enum MilestoneStatusEnum {
    NOT_STARTED = "Not Started",      // Milestone has not yet begun
    IN_PROGRESS = "In Progress",      // Milestone is currently being worked on
    COMPLETED = "Completed",          // Milestone has been finished
    ON_HOLD = "On Hold",              // Milestone is paused for some reason
    CANCELLED = "Cancelled",          // Milestone has been cancelled and will not be completed
}


enum CryptoAssetTypeEnum {
    BITCOIN = "Bitcoin",                  // The first and most widely recognized cryptocurrency
    ALTCOIN = "Altcoin",                  // Any cryptocurrency other than Bitcoin
    TOKEN = "Token",                       // A digital asset created on an existing blockchain
    STABLECOIN = "Stablecoin",             // Cryptocurrencies pegged to stable assets like fiat currencies
    NFT = "Non-Fungible Token",            // Unique digital assets representing ownership of a specific item
    DEFI = "Decentralized Finance Asset",  // Assets related to DeFi platforms
}




enum InvestmentStrategyEnum {
    HODL = "HODL",                       // Long-term holding of assets
    DAY_TRADING = "Day Trading",         // Buying and selling assets within the same trading day
    SWING_TRADING = "Swing Trading",     // Taking advantage of price fluctuations over days or weeks
    DOLLAR_COST_AVERAGING = "DCA",       // Regularly investing a fixed amount regardless of price
    VALUE_INVESTING = "Value Investing", // Investing in undervalued assets for long-term gains
    DIVIDEND_INVESTING = "Dividend Investing", // Investing in assets that pay regular dividends
}




enum MarketTrendEnum {
    BULLISH = "Bullish",           // A market condition where prices are rising
    BEARISH = "Bearish",           // A market condition where prices are falling
    SIDEWAYS = "Sideways",         // A market condition where prices are stable without significant movement
    VOLATILE = "Volatile",         // A market characterized by rapid price fluctuations
}



enum PerformanceStatusEnum {
    UNDER_PERFORMING = "Under Performing",  // Asset performance is below expectations
    ON_TRACK = "On Track",                  // Asset performance is in line with expectations
    OUTPERFORMING = "Out Performing",        // Asset performance is exceeding expectations
    STAGNANT = "Stagnant",                  // Asset performance is flat without significant change
}


enum ActivityLevelEnum {
    LOW = "Low",               // Minimal activity, few interactions
    MEDIUM = "Medium",         // Moderate activity with regular interactions
    HIGH = "High",             // Frequent activity and significant user engagement
    VERY_HIGH = "Very High",   // Constant activity with continuous engagement
}


enum EngagementTypeEnum {
    DIRECT_MESSAGE = "Direct Message", // One-on-one communication
    GROUP_CHAT = "Group Chat",         // Communication within a group setting
    VIDEO_CALL = "Video Call",         // Real-time video communication
    AUDIO_CALL = "Audio Call",         // Real-time audio communication
    SCREEN_SHARING = "Screen Sharing", // Sharing screens during meetings
    POLL = "Poll",                     // Engaging users through surveys or polls
}



enum FeedbackTypeEnum {
    POSITIVE = "Positive",          // Encouraging feedback highlighting strengths
    NEGATIVE = "Negative",          // Constructive criticism pointing out areas for improvement
    SUGGESTION = "Suggestion",      // Ideas for improvement or new features
    QUESTION = "Question",          // Inquiries seeking clarification or more information
    TESTIMONIAL = "Testimonial",    // Personal accounts or experiences shared by users
}

enum InnovationTypeEnum {
    DISRUPTIVE = "Disruptive",       // Innovations that significantly alter the market or industry
    INCREMENTAL = "Incremental",     // Gradual improvements or upgrades to existing products or services
    RADICAL = "Radical",             // Breakthrough innovations that create entirely new markets or capabilities
    ARCHITECTURAL = "Architectural", // Innovations that change the way components are integrated within existing systems
}


enum CreativityLevelEnum {
    LOW = "Low",                  // Minimal creative output, limited idea generation
    MEDIUM = "Medium",            // Moderate creativity with some original ideas and contributions
    HIGH = "High",                // Strong creative capabilities, producing numerous innovative concepts
    EXCEPTIONAL = "Exceptional",  // Extraordinary creativity, consistently delivering groundbreaking ideas
}


enum TechnologyEnum {
    ARTIFICIAL_INTELLIGENCE = "Artificial Intelligence", // Technologies that simulate human intelligence
    BLOCKCHAIN = "Blockchain",                           // Decentralized digital ledger technologies
    CLOUD_COMPUTING = "Cloud Computing",                 // Online services for data storage and processing
    INTERNET_OF_THINGS = "Internet of Things",          // Network of interconnected devices that communicate and exchange data
    MACHINE_LEARNING = "Machine Learning",               // Subset of AI focused on learning from data
    VIRTUAL_REALITY = "Virtual Reality",                 // Immersive technologies creating simulated environments
}


export {
    CollaborationPhaseEnum,
    CollaborationToolEnum, CommunicationTypeEnum,
    PhaseDurationEnum, MilestoneStatusEnum,
    CryptoAssetTypeEnum,
    InvestmentStrategyEnum,
    MarketTrendEnum,
    PerformanceStatusEnum,
    ActivityLevelEnum,
    EngagementTypeEnum,
    FeedbackTypeEnum,
    InnovationTypeEnum,
    CreativityLevelEnum,
    TechnologyEnum,
};
