import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CryptoState {
  bitcoinPrice: number;
  ethereumPrice: number;
  // Add more crypto-related state properties as needed
}

const initialState: CryptoState = {
  bitcoinPrice: 0,
  ethereumPrice: 0,
  // Initialize additional state properties here
};

export const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    updateBitcoinPrice: (state, action: PayloadAction<number>) => {
      state.bitcoinPrice = action.payload;
    },

    updateEthereumPrice: (state, action: PayloadAction<number>) => {
      state.ethereumPrice = action.payload;
    },
    // Add more crypto-related reducers here
  },
});

export const {
  updateBitcoinPrice,
  updateEthereumPrice,
  // Add more action creators here
} = cryptoSlice.actions;

export const selectBitcoinPrice = (state: { crypto: CryptoState }) =>
  state.crypto.bitcoinPrice;

export const selectEthereumPrice = (state: { crypto: CryptoState }) =>
  state.crypto.ethereumPrice;
// Add more selectors as needed

export default cryptoSlice.reducer;
