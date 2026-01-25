<!-- CourseBuilderSystemDocumentation.md -->
# CourseBuilder System Documentation

Welcome to the official CourseBuilder Developer Documentation.
This guide explains how to use the CourseBuilder system to create structured courses, multi-phase learning paths, crypto-integrated programs, and advanced project workflows.

## The CourseBuilder supports:

- Complex phase-driven course structures

- Custom metadata and hooks

- Crypto-integrated programs (trading, portfolios, DAOs)

- Flexible generics for entity/metadata/attachment types

# System Architecture Overview

src/app/models/phases/
├── Phase.ts                      # Phase model, hooks, metadata
├── PhaseEntity.ts                # Raw phase entity definitions

src/app/documents/
├── RelatedProps.ts               # Shared identifiers, timestamps, flags

src/app/config/
├── BaseConfig.ts                 # Base entities and metadata
├── metadata/MetadataHooks.ts     # createMeta()
├── useMetadata.ts                # Unified metadata builder

src/app/generators/
├── GenerateUniqueIds.ts          # UniqueIDGenerator

# Core Concepts

## The CourseBuilder system provides:

- Dynamic course generation — courses with phases, lessons, attachments, instructors, and metadata.

- Metadata integration — helpers like createMeta and useMetadata.

- Crypto-compatible extensions — portfolio, trading, blockchain, DAO features.

## Type-safe generics — override entity types, metadata types, attachment types, included/excluded fields.

1. Basic CourseBuilder Usage

Use Basic mode for standard project phases, team collaboration, and general course content.

Example — Basic Project Workflow
```ts
// Basic project management phases
const projectBuilder = new CourseBuilder("Product Launch 2024");

// Standard project phases
projectBuilder.addPhase("Ideation & Planning");
projectBuilder.addPhase("Team Formation");
projectBuilder.addPhase("Development Sprint");
projectBuilder.addPhase("Testing & QA");
projectBuilder.addPhase("Launch Preparation");

// Add collaborative lessons
projectBuilder.addLesson(0, {
  title: "Brainstorming Session",
  content: "Team ideation workshop using video conferencing"
});

projectBuilder.addLesson(0, {
  title: "Market Research",
  content: "Analyze target audience and competitors"
});
```

# Best for:

Team workflows

Planning sessions

Standard software/product development phases

Text/video lessons and internal collaboration

2. Advanced CourseBuilder Usage

## Use Advanced mode for crypto, blockchain, trading, portfolio tracking, and real-time integrations.

# Example — Advanced Crypto-Integrated Course

```ts
const cryptoBuilder = new CourseBuilder<
  CourseEntity,
  CourseK,
  CourseMeta & {
    cryptoIntegration: boolean;
    tradingLevel: 'beginner' | 'advanced';
    portfolioTracking: boolean;
  }
>("Crypto Trading Masterclass");

Advanced Metadata-Driven Phases
Video Phase with Trading Data
cryptoBuilder.addVideoPhase<
  CourseEntity,
  CourseK,
  CourseMeta & { videoType: string; tradingPairs: string[] }
>(
  "Advanced Chart Analysis",
  "https://platform.com/crypto-charts"
);

```

## Quiz Phase with Risk Analysis

```ts 
cryptoBuilder.addQuizPhase<
  CourseEntity,
  CourseK,
  CourseMeta & { quizConfig: any; riskAssessment: boolean }
>(
  "Risk Management Assessment",
  15
);
```
## Live Data Phase
```ts
cryptoBuilder.addPhase<
  CourseEntity,
  CourseK,
  CourseMeta & {
    liveData: boolean;
    apiIntegration: string[];
    portfolioSync: boolean;
  }
>("Live Portfolio Management");
```

## Community Engagement Phase
```ts
cryptoBuilder.addPhase<
  CourseEntity,
  CourseK,
  CourseMeta & {
    communityFeatures: string[];
    discussionForums: boolean;
    expertAccess: boolean;
  }
>("Community Strategy Session");
```

```ts
3. Specific Use Cases

Use BASIC When:

Standard team collaboration

Text/video communication-focused lessons

Project management workflows

Generic product development stages

Use ADVANCED When:

Crypto portfolio management

Live trading education

Blockchain development & smart-contract work

DAO/community governance and token economics

API integrations and real-time data flows
```

## Examples

# Crypto Portfolio Management

```ts

const portfolioCourse = new CourseBuilder<
  CourseEntity,
  CourseK,
  CourseMeta & {
    walletIntegration: boolean;
    portfolioAnalytics: boolean;
    realTimePricing: boolean;
  }
>("Crypto Portfolio Management");
```

# Trading & Market Analysis
```ts

const tradingCourse = new CourseBuilder<
  CourseEntity,
  CourseK,
  CourseMeta & {
    tradingPairs: string[];
    technicalIndicators: boolean;
    orderTypes: string[];
    riskParameters: any;
  }
>("Advanced Crypto Trading");
```

# Blockchain Development Bootcamp

```ts
const devCourse = new CourseBuilder<
  CourseEntity,
  CourseK,
  CourseMeta & {
    blockchainPlatform: string;
    smartContracts: boolean;
    testnetAccess: boolean;
    deploymentTools: string[];
  }
>("Blockchain Development Bootcamp");
```

# DAO / Community Governance

```ts
const communityCourse = new CourseBuilder<
  CourseEntity,
  CourseK,
  CourseMeta & {
    daoIntegration: boolean;
    governanceFeatures: boolean;
    tokenEconomics: boolean;
    communityVoting: boolean;
  }
>("DAO Community Management");
```

# Hybrid Project–Crypto Workflows

```ts
const hybridCourse = new CourseBuilder<
  CourseEntity,
  CourseK,
  CourseMeta & {
    projectCryptoSync: boolean;
    paymentIntegration: boolean;
    tokenRewards: boolean;
    nftCreation: boolean;
  }
>("Web3 Product Launch");
```

4. Decision Matrix

        Scenario	                                    Use Basic	    Use Advanced
Team meetings & collaboration	                        ✅	            ❌
Project planning sessions	                            ✅	            ❌
Video conferencing setup	                            ✅	            ❌
Crypto portfolio tracking	                            ❌	            ✅
Live trading education	                                ❌	            ✅
Blockchain development	                                ❌	            ✅
DAO community management	                            ❌	            ✅
NFT project creation	                                ❌	            ✅
Token economics planning	                            ❌	            ✅
Hybrid project-crypto workflows	                        ❌	            ✅

5. Key Differentiators

## Basic = Standard project management, team collaboration, communication features.

Advanced = Crypto integration, real-time data, specialized metadata, blockchain features, financial tracking.

Use Advanced when you need:

- Crypto-specific metadata

- Real-time market data integration

- Trading functionality & risk parameters

- Portfolio tracking and wallet integration

- Blockchain development & testnet access

- Community governance & DAO tooling

- API integrations with exchanges and data providers

6. Implementation Notes & Helpers

createMeta<PT, PK>({...}): helper to build phase metadata.

useMetadata<PT, PK, PMeta>(...): hook for unified metadata.

UniqueIDGenerator.generateID(...): deterministic unique ID generator using area and thread info.

fetchUserAreaDimensions(options?): helper to obtain and listen to UI area dimensions.

CustomPhaseHooks<...>: provide hooks for phase lifecycle events when building UI components.

7. Example — Minimal Working Flow

```ts
// basic usage
const courseBuilder = new CourseBuilder("Cryptocurrency Workshop");

courseBuilder.addPhase("Month 1 - Intro To Cryptocurrency");
courseBuilder.addLesson(0, {
  title: "Lesson 1: Overview of Cryptocurrency",
  content: "...",
});

courseBuilder.addPhase("Month 2 - How To Trade");
courseBuilder.addLesson(1, {
  title: "Lesson 1: Introduction to Trading",
  content: "...",
});

const cryptocurrencyCourse = courseBuilder.generateCourse();
console.log(cryptocurrencyCourse);
```

8. Recommended Best Practices

Keep metadata small and descriptive per phase.

Use advanced generics only where needed — prefer simple types for team/collaboration courses.

When integrating live crypto data, isolate API/network logic in services and keep phases responsible for presentation + metadata only.

Use addVideoPhase and addQuizPhase helpers to centralize phase-specific metadata creation.

Ensure createMeta and useMetadata are called with matching generic constraints to avoid TypeScript mismatches.