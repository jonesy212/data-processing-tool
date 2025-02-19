// generateCryptoWatchlistJSON.ts
import { CryptoWatchlist } from "./CryptoWatchlist";

// Function to generate JSON from a CryptoWatchlist object
function generateCryptoWatchlistJSON(cryptoWatchlist: CryptoWatchlist): string {
  try {
    // Convert the CryptoWatchlist object into a JSON string
    const watchlistJSON = JSON.stringify(cryptoWatchlist);
    return watchlistJSON;
  } catch (error) {
    console.error("Error generating crypto watchlist JSON:", error);
    return ""; // Return empty string in case of error
  }
}

export { generateCryptoWatchlistJSON };
