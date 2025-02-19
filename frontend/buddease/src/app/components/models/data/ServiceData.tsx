// ServiceData.tsx
// Define the extended interface for serviceData
interface ServiceData {
  serviceName: string;
  serviceDescription: string;
  developmentServices: string[];
  globalCollaborationFeatures: string[];
  communityInvolvement: string[];
  monetizationOpportunities: string[];
  cryptoIntegration: boolean;
  socialMediaIntegration: boolean;
  projectManagementProperties: {
    phases: string[];
    communicationTools: string[];
    dataAnalysisTools: string[];
  };
  // Add other properties as needed
}

// Create an object of type ServiceData
const serviceData: ServiceData = {
    serviceName: "Project Management App",
    serviceDescription:
      "A project management app with features for global collaboration and community involvement.",
    developmentServices: [
      "Access to individual developers and small project teams proficient in app/project development.",
      "Developers compensated based on the quality and complexity of projects completed.",
      "Selection of developers based on skills, experience, and performance metrics to ensure optimal project outcomes.",
    ],
    globalCollaborationFeatures: [
      "Comprehensive communication tools encompassing audio, video, text, and real-time collaboration capabilities.",
      "Phases-based project management framework facilitating seamless ideation, team formation, product brainstorming, and launch processes.",
      "Data analysis tools enabling in-depth insights and iterative improvements for enhanced project outcomes.",
    ],
    communityInvolvement: [
      "Active participation in a community-driven global project fostering collaboration among users worldwide.",
      "Emphasis on promoting unity and generating positive impact solutions with tangible benefits for humanity.",
      "Users rewarded for contributions, with a portion of earnings reinvested to bolster liquidity for the community coin and support ongoing initiatives.",
    ],
    monetizationOpportunities: [
      "Opportunities for developers to leverage the platform to build custom apps/projects for clients, with compensation commensurate with project scope and complexity.",
      "Developers incentivized to meet project metrics within connected teams, ensuring efficient project execution and delivery.",
      "Revenue generated from client projects contributes to the sustainability of the platform, supporting ongoing development efforts and enhancing overall value proposition.",
    ],
    cryptoIntegration: true, // Indicates whether crypto integration is available
    socialMediaIntegration: true, // Indicates whether social media integration is available
    projectManagementProperties: {
      phases: ['Ideation', 'Team Formation', 'Product Brainstorming', 'Product Launch', 'Data Analysis'],
      communicationTools: ['Audio', 'Video', 'Text', 'Real-time Collaboration'],
      dataAnalysisTools: ['Statistical Analysis', 'Predictive Modeling', 'Data Visualization'],
    },
    // Add values for other properties as needed
  };
  
