// TokenUtils.ts

import { useNotification } from "../components/support/NotificationContext";
import { Message } from "../generators/GenerateChatInterfaces";

// Utility function to check if a user has a certain amount of tokens
export const hasEnoughTokens = (
  userTokens: number,
  requiredTokens: number
): boolean => {
  const notify = useNotification(); // Move context access inside the function
  const hasEnough = userTokens >= requiredTokens;

  if (!hasEnough) {
    // Notify the user about insufficient funds
    notify.showErrorNotification(
      "INSUFFICIENT_FUNDS",
      "Insufficient funds for the operation",
      null
    );
  }

  return hasEnough;
};

// Utility function to stake tokens and earn rewards
export const stakeTokens = (
  userTokens: number,
  stakedTokens: number
): number => {
  const notify = useNotification(); // Move context access inside the function
  const newStakedTokens = userTokens + stakedTokens;

  // Create a message object with title and description
  const message: Message = {
    text: "Your tokens have been successfully staked.",
    description: "Tokens Staked",
  } as Message;
  // Notify the user about successful staking
  notify.showSuccessNotification(
    "TOKEN_STAKED",
    message,
    null
  );

  return newStakedTokens;
};

// Utility function to check if the token supply has reached its cap
export const isTokenSupplyCapped = (
  currentSupply: number,
  maxSupply: number
): boolean => {
  const notify = useNotification(); // Move context access inside the function
  const isCapped = currentSupply >= maxSupply;

  if (isCapped) {
    // Notify the user about capped token supply
    notify.showErrorNotification(
      "TOKEN_SUPPLY_CAPPED",
      "Token supply has reached its cap",
      null
    );
  }

  return isCapped;
};

// Utility function to transfer tokens between users
export const transferTokens = (
  senderTokens: number,
  receiverTokens: number,
  amount: number
): [number, number] => {
  const notify = useNotification(); // Move context access inside the function
  const newSenderTokens = senderTokens - amount;
  const newReceiverTokens = receiverTokens + amount;

  const message: Message = {
    text: "Tokens successfully transferred",
    description:"Token Transferred",
  } as Message
  
  // Notify the user about successful token transfer
  notify.showSuccessNotification(
    "TOKEN_TRANSFERRED",
    message,
    null
  );

  return [newSenderTokens, newReceiverTokens];
};

// Add more utility functions based on your specific token-related requirements
