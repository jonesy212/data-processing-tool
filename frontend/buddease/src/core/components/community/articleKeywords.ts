// articleKeywords.ts

// Example function to categorize news articles
const categorizeNews = (newsFeedData: any): string[] => {
  const categories: Set<string> = new Set();

  newsFeedData.forEach((article: any) => {
    const { title, content } = article;

    if (containsKeywordsForProjectManagement(title, content)) {
      categories.add("Project Management");
    }
    if (containsKeywordsForTechnology(title, content)) {
      categories.add("Technology");
    }
    if (containsKeywordsForCryptocurrency(title, content)) {
      categories.add("Cryptocurrency");
    }
    if (containsKeywordsForBlockchain(title, content)) {
      categories.add("Blockchain");
    }
    if (containsKeywordsForDigitalTransformation(title, content)) {
      categories.add("Digital Transformation");
    }
    if (containsKeywordsForRemoteWork(title, content)) {
      categories.add("Remote Work");
    }
    if (containsKeywordsForAgileMethodology(title, content)) {
      categories.add("Agile Methodology");
    }
    if (containsKeywordsForTechIndustryInsights(title, content)) {
      categories.add("Tech Industry Insights");
    }
    if (containsKeywordsForHealthcareTechnology(title, content)) {
      categories.add("Healthcare Technology");
    }
    if (containsKeywordsForEcommerceStrategies(title, content)) {
      categories.add("E-commerce Strategies");
    }
    if (containsKeywordsForRegulatoryUpdates(title, content)) {
      categories.add("Regulatory Updates");
    }
  });

  return Array.from(categories);
};

// Example specific keyword functions (replace with your actual implementations)
const containsKeywordsForProjectManagement = (
  title: string,
  content: string
): boolean => {
  const projectManagementKeywords = [
    "project management",
    "task management",
    "team collaboration",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return projectManagementKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForTechnology = (
  title: string,
  content: string
): boolean => {
  const technologyKeywords = [
    "technology",
    "software development",
    "innovation",
    "digital transformation",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return technologyKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForCryptocurrency = (
  title: string,
  content: string
): boolean => {
  const cryptocurrencyKeywords = [
    "cryptocurrency",
    "bitcoin",
    "ethereum",
    "blockchain",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return cryptocurrencyKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForBlockchain = (
  title: string,
  content: string
): boolean => {
  const blockchainKeywords = [
    "blockchain",
    "decentralized applications",
    "smart contracts",
    "crypto tokens",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return blockchainKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForDigitalTransformation = (
  title: string,
  content: string
): boolean => {
  const digitalTransformationKeywords = [
    "digital transformation",
    "automation",
    "cloud computing",
    "artificial intelligence",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return digitalTransformationKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForRemoteWork = (
  title: string,
  content: string
): boolean => {
  const remoteWorkKeywords = [
    "remote work",
    "virtual collaboration",
    "distributed teams",
    "telecommuting",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return remoteWorkKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForAgileMethodology = (
  title: string,
  content: string
): boolean => {
  const agileKeywords = [
    "agile methodology",
    "scrum framework",
    "sprint planning",
    "iterative development",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return agileKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForTechIndustryInsights = (
  title: string,
  content: string
): boolean => {
  const techIndustryKeywords = [
    "tech industry insights",
    "fintech innovations",
    "cybersecurity trends",
    "AI advancements",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return techIndustryKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForHealthcareTechnology = (
  title: string,
  content: string
): boolean => {
  const healthTechKeywords = [
    "healthcare technology",
    "telemedicine trends",
    "data privacy in healthcare",
    "medical innovation",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return healthTechKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForEcommerceStrategies = (
  title: string,
  content: string
): boolean => {
  const ecommerceKeywords = [
    "e-commerce strategies",
    "customer engagement",
    "digital marketing tactics",
    "online retail trends",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return ecommerceKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

const containsKeywordsForRegulatoryUpdates = (
  title: string,
  content: string
): boolean => {
  const regulatoryUpdatesKeywords = [
    "regulatory updates",
    "cryptocurrency regulations",
    "compliance frameworks",
    "legal implications",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return regulatoryUpdatesKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains project management keywords
const containsProjectManagementKeywords = (
  title: string,
  content: string
): boolean => {
  const projectManagementKeywords = [
    "project",
    "management",
    "task",
    "phase",
    "team",
    "collaboration",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return projectManagementKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains technology-related keywords
const containsTechnologyKeywords = (
  title: string,
  content: string
): boolean => {
  const technologyKeywords = [
    "technology",
    "innovation",
    "software",
    "development",
    "digital",
    "product",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return technologyKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains cryptocurrency-related keywords
const containsCryptoKeywords = (title: string, content: string): boolean => {
  const cryptoKeywords = [
    "cryptocurrency",
    "crypto",
    "blockchain",
    "bitcoin",
    "ethereum",
    "trading",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return cryptoKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains blockchain-related keywords
const containsBlockchainKeywords = (
  title: string,
  content: string
): boolean => {
  const blockchainKeywords = [
    "blockchain",
    "decentralized applications",
    "smart contracts",
    "crypto tokens",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return blockchainKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains digital transformation-related keywords
const containsDigitalTransformationKeywords = (
  title: string,
  content: string
): boolean => {
  const digitalTransformationKeywords = [
    "digital transformation",
    "automation",
    "cloud computing",
    "artificial intelligence",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return digitalTransformationKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains remote work-related keywords
const containsRemoteWorkKeywords = (
  title: string,
  content: string
): boolean => {
  const remoteWorkKeywords = [
    "remote work",
    "virtual collaboration",
    "distributed teams",
    "telecommuting",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return remoteWorkKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains agile methodology-related keywords
const containsAgileKeywords = (title: string, content: string): boolean => {
  const agileKeywords = [
    "agile methodology",
    "scrum framework",
    "sprint planning",
    "iterative development",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return agileKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains cryptocurrency trends-related keywords
const containsCryptocurrencyKeywords = (
  title: string,
  content: string
): boolean => {
  const cryptocurrencyKeywords = [
    "cryptocurrency trends",
    "digital asset management",
    "tokenomics",
    "decentralized finance",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return cryptocurrencyKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains tech industry insights-related keywords
const containsTechIndustryKeywords = (
  title: string,
  content: string
): boolean => {
  const techIndustryKeywords = [
    "tech industry insights",
    "fintech innovations",
    "cybersecurity trends",
    "AI advancements",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return techIndustryKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains healthcare technology-related keywords
const containsHealthTechKeywords = (
  title: string,
  content: string
): boolean => {
  const healthTechKeywords = [
    "healthcare technology",
    "telemedicine trends",
    "data privacy in healthcare",
    "medical innovation",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return healthTechKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains e-commerce strategies-related keywords
const containsEcommerceKeywords = (title: string, content: string): boolean => {
  const ecommerceKeywords = [
    "e-commerce strategies",
    "customer engagement",
    "digital marketing tactics",
    "online retail trends",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return ecommerceKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains regulatory updates-related keywords
const containsRegulatoryUpdatesKeywords = (
  title: string,
  content: string
): boolean => {
  const regulatoryUpdatesKeywords = [
    "regulatory updates",
    "cryptocurrency regulations",
    "compliance frameworks",
    "legal implications",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return regulatoryUpdatesKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Example function to identify trending topics
const identifyTrendingTopics = (newsFeedData: any): string[] => {
  // Example: Identify trending topics from news feed
  const trendingTopics: string[] = [];

  // Simulated trending topics identification logic based on news content
  newsFeedData.forEach((article: any) => {
    const { title, content } = article;
    if (containsClimateChangeKeywords(title, content)) {
      trendingTopics.push("Climate Change");
    }
    if (containsEconomyKeywords(title, content)) {
      trendingTopics.push("Economy");
    }
    if (containsCOVID19Keywords(title, content)) {
      trendingTopics.push("COVID-19");
    }
  });

  // Remove duplicates using Set and convert back to array
  return Array.from(new Set(trendingTopics));
};

// Function to check if the article contains climate change-related keywords
const containsClimateChangeKeywords = (
  title: string,
  content: string
): boolean => {
  const climateChangeKeywords = [
    "climate change",
    "global warming",
    "environment",
    "carbon emissions",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return climateChangeKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains economy-related keywords
const containsEconomyKeywords = (title: string, content: string): boolean => {
  const economyKeywords = [
    "economy",
    "financial crisis",
    "economic growth",
    "inflation",
  ];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return economyKeywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};

// Function to check if the article contains COVID-19-related keywords
const containsCOVID19Keywords = (title: string, content: string): boolean => {
  const covid19Keywords = ["covid-19", "coronavirus", "pandemic", "vaccine"];
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  return covid19Keywords.some(
    (keyword) =>
      normalizedTitle.includes(keyword) || normalizedContent.includes(keyword)
  );
};




export {
  categorizeNews,
  identifyTrendingTopics,
  containsBlockchainKeywords,
  containsDigitalTransformationKeywords,
  containsRemoteWorkKeywords,
  containsAgileKeywords,
  containsCryptocurrencyKeywords,
  containsTechIndustryKeywords,
  containsHealthTechKeywords,
  containsEcommerceKeywords,
  containsRegulatoryUpdatesKeywords,
  containsProjectManagementKeywords,
  containsTechnologyKeywords,
  containsCryptoKeywords,
};
