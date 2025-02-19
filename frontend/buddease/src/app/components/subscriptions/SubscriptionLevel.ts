import { SubscriberTypeEnum } from "../models/data/StatusType";


interface SubscriptionLevel {
    name: string;
    description: string;
    price: number;
    features: string[];
    
}
// Function to determine the subscriber type based on subscription level
function determineSubscriberType(subscriptionLevel: SubscriptionLevel): SubscriberTypeEnum {
    switch (subscriptionLevel.name.toLowerCase()) {
        case "basic":
            return SubscriberTypeEnum.FREE;
        case "standard":
            return SubscriberTypeEnum.STANDARD;
        case "premium":
            return SubscriberTypeEnum.PREMIUM;
        case "enterprise":
            return SubscriberTypeEnum.ENTERPRISE;
        case "trial":
            return SubscriberTypeEnum.TRIAL;
        case "portfolio updates":
            return SubscriberTypeEnum.PortfolioUpdates;
        case "individual":
            return SubscriberTypeEnum.Individual;
        default:
            throw new Error(`Unknown subscription level: ${subscriptionLevel.name}`);
    }
}

// Define your subscription levels
const subscriptionLevels: SubscriptionLevel[] = [
    {
        name: "Basic",
        description: "Access to basic features",
        price: 10,
        features: ["Feature 1", "Feature 2"],
    },
    {
        name: "Standard",
        description: "Access to standard features",
        price: 20,
        features: ["Feature 1", "Feature 2", "Feature 3"],
    },
    {
        name: "Premium",
        description: "Access to premium features",
        price: 30,
        features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    },
    {
        name: "Trial",
        description: "Access to limited features during the trial period",
        price: 0, // Assuming trial is free
        features: ["Feature 1", "Feature 2 (limited)"],
    },
];



// Function to determine the subscription level based on price
function getSubscriptionLevel(price: number): SubscriptionLevel | undefined {
    return subscriptionLevels.find((level: SubscriptionLevel) => level.price === price);
}



// Usage determination function based on subscriber type
const determineUsage = (subscriptionLevel: SubscriptionLevel | undefined): string => {
    if (!subscriptionLevel) return "defaultUsage";

    const subscriberType = determineSubscriberType(subscriptionLevel);

    switch (subscriberType) {
        case SubscriberTypeEnum.PREMIUM:
            return "premiumUsage";
        case SubscriberTypeEnum.TRIAL:
            return "trialUsage";
        case SubscriberTypeEnum.FREE:
            return "basicUsage";
        default:
            return "defaultUsage";
    }
};

// Example usage
const price = 20; // Adjust the price as needed
const subscriptionLevel = getSubscriptionLevel(price);

if (subscriptionLevel) {
    console.log(`You have subscribed to ${subscriptionLevel.name} level.`);
    console.log(`Description: ${subscriptionLevel.description}`);
    console.log(`Features: ${subscriptionLevel.features.join(", ")}`);
} else {
    console.log("Invalid subscription level.");
}




export type {SubscriptionLevel}
export {getSubscriptionLevel, determineSubscriberType, determineUsage, subscriptionLevels}