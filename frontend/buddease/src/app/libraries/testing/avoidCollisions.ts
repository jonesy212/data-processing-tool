import { COLLISION_ADJUSTMENT, COLLISION_THRESHOLD } from "@/app/utils/constants";
import { Position, positionUtils } from "@/app/utils/positionUtils";

const avoidCollisions = (positions: Position[]) => {
    const adjustedPositions = [positions[0]];

    for (let i = 1; i < positions.length; i++) {
        let position = { ...positions[i] };
        let j = 0;

        // Check for collisions with previous positions
        while (j < i) {
            const distance = positionUtils.calculateDistance(positions[j], position);
            if (distance < COLLISION_THRESHOLD) {
                // Adjust the position to avoid collision
                position.x += COLLISION_ADJUSTMENT;
                position.y += COLLISION_ADJUSTMENT;
                j = 0; // Restart the check with adjusted position
            } else {
                j++;
            }
        }

        adjustedPositions.push(position);
    }

    return adjustedPositions;
};

export default avoidCollisions;