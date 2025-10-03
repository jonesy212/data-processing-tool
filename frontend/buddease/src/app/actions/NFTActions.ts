// nft/NFTActions.ts
import { createAction } from "@reduxjs/toolkit";

export const NFTActions = {
  // NFT Management Actions
  mintNFTRequest: createAction<{ tokenId: number, metadata: any }>("mintNFTRequest"),
  mintNFTSuccess: createAction<{ tokenId: number }>("mintNFTSuccess"),
  mintNFTFailure: createAction<{ error: string }>("mintNFTFailure"),

  transferNFTRequest: createAction<{ tokenId: number, recipient: string }>("transferNFTRequest"),
  transferNFTSuccess: createAction<{ tokenId: number, recipient: string }>("transferNFTSuccess"),
  transferNFTFailure: createAction<{ error: string }>("transferNFTFailure"),

  burnNFTRequest: createAction<number>("burnNFTRequest"),
  burnNFTSuccess: createAction<number>("burnNFTSuccess"),
  burnNFTFailure: createAction<{ error: string }>("burnNFTFailure"),

  // Additional NFT Actions
  customNFTAction: createAction<any>("customNFTAction"),
};
