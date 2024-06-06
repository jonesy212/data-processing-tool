import { SubscriberTypeEnum } from "../models/data/StatusType";

// SubscriptionLevel
interface SubscriptionLevel {
    name: string;
    description: string;
    price: number;
    features: string[];
}


// Function to determine the subscriber type based on subscription level
function determineSubscriberType(subscriptionLevel: SubscriptionLevel): SubscriberTypeEnum {
    if (subscriptionLevel.name === "Basic") {
        return SubscriberTypeEnum.Free;
    } else if (subscriptionLevel.name === "Premium") {
        return SubscriberTypeEnum.Premium;
    } else {
        return SubscriberTypeEnum.Trial;
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
];




// Function to determine the subscription level based on price
function getSubscriptionLevel(price: number): SubscriptionLevel | undefined {
    return subscriptionLevels.find((level: SubscriptionLevel) => level.price === price);
}

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