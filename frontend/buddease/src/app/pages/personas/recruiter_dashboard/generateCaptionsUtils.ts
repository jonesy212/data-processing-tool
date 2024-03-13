// generateCaptionsUtils.ts

import { Video } from "@/app/components/state/stores/VideoStore";
// Function to generate captions for the video

// Function to generate captions from spaCy extracted entities
const generateCaptionsFromEntities = (entities: any): string => {
    // Your logic to generate captions based on the extracted entities using spaCy
    // This could involve analyzing the entities, extracting relevant information, and composing captions

    // Example: Construct captions based on the extracted entities
    let captions = "Captions based on spaCy extracted entities:\n";

    // Loop through the entities and include them in the captions
    for (const entity of entities) {
        captions += `- ${entity.text} (${entity.label_})\n`;
    }

    return captions;
};