// CategoryManager.ts
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { allCategories } from '../../models/data/DataStructureCategories';


type CategoryKeys = keyof typeof allCategories; 

function getCategoryProperties(category: CategoryKeys): CategoryProperties {
    const propertiesMap: { [key: string]: CategoryProperties } = {
        assignedNotes: {
            name: "Notes",
            description: "Notes related to the user",
            icon: "fa-notes",
            color: "#FFD700",
            iconColor: "#000",
            isActive: true,
            isPublic: false,
            isSystem: false,
            isDefault: false,
            isHidden: false,
            isHiddenInList: false,
            UserInterface: ["componentName", "componentDescription"],
            DataVisualization: [],
            Forms: {},
            Analysis: [],
            Communication: [],
            TaskManagement: [],
            Crypto: [],
            brandName: "MyNotes",
            brandLogo: "path/to/notes_logo.png",
            brandColor: "#FFD700",
            brandMessage: "Manage your notes efficiently"
        },
        // Add mappings for other categories...
    };

    const subCategories = allCategories[category];
    if (!subCategories || subCategories.length === 0) {
        throw new Error(`Invalid or empty subcategory for category: ${category}`);
    }

    // Map the first sub-category to the properties
    const subCategory = subCategories[0];
    const properties = propertiesMap[subCategory];

    if (!properties) {
        throw new Error(`No properties found for subcategory: ${subCategory}`);
    }

    return properties;
}


export {getCategoryProperties}
export type {CategoryKeys}