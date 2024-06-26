// CategoryManager.tsx
// CategoryManager.ts
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { allCategories } from '../../models/data/DataStructureCategories';

function getCategoryProperties(category: keyof typeof allCategories): CategoryProperties {
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
    if (!subCategories) {
        throw new Error(`Invalid category: ${category}`);
    }

    return propertiesMap[subCategories[0]]; // Assuming the first sub-category dictates the main properties
}
