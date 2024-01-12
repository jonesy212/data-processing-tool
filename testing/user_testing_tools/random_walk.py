import matplotlib.pyplot as plt
import numpy as np


# Function to generate a random walk
def generate_random_walk(steps=100):
    random_walk = [0]

    for _ in range(steps):
        step = random_walk[-1]
        dice = np.random.randint(1, 7)

        if dice <= 2:
            step = max(0, step - 1)
        elif dice <= 5:
            step = step + 1
        else:
            step = step + np.random.randint(1, 7)

        random_walk.append(step)

    return random_walk

# Function to visualize the random walk
def visualize_random_walk(random_walk):
    plt.plot(random_walk)
    plt.title("Random Walk Visualization")
    plt.xlabel("Steps")
    plt.ylabel("Position")
    plt.show()

# Function to connect with the prompting system
def suggest_based_on_random_walk(random_walk):
    # Implement your logic to suggest based on the random walk
    # You can use the values in the random walk to generate suggestions
    suggestions = []

    # Example: Suggest based on the final position of the random walk
    final_position = random_walk[-1]
    if final_position > 50:
        suggestions.append("You reached a high position in the random walk!")

    return suggestions

# Generate a random walk
generated_random_walk = generate_random_walk()

# Visualize the random walk
visualize_random_walk(generated_random_walk)

# Get suggestions based on the random walk
suggestions = suggest_based_on_random_walk(generated_random_walk)
print("Suggestions:", suggestions)
