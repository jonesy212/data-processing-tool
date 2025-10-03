import avoidCollisions from "./avoidCollisions";

const generateRandomWalkPositions = (steps = 100) => {
  const positions = [{ x: 0, y: 0 }];

  for (let i = 0; i < steps; i++) {
    let position = { ...positions[positions.length - 1] };
    let dice = Math.floor(Math.random() * 6) + 1;

    if (dice <= 2) {
      position.x = Math.max(0, position.x - 1);
    } else if (dice <= 5) {
      position.x = position.x + 1;
    } else {
      position.x = position.x + Math.floor(Math.random() * 6) + 1;
    }

    // Ensure non-negative y-coordinate
    position.y = Math.max(0, position.y + Math.floor(Math.random() * 6) + 1);

    positions.push(position);
  }

  const adjustedPositions = avoidCollisions(positions);

  return adjustedPositions;
};

export default generateRandomWalkPositions