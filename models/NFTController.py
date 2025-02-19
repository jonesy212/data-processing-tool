# NFTController.py
from models.NFTModels import NFT


class NFTController:
    def __init__(self):
        self.nfts = []

    def create_nft(self, id, owner, metadata):
        nft = NFT(id, owner, metadata)
        self.nfts.append(nft)
        return nft

    def get_nft_by_id(self, id):
        for nft in self.nfts:
            if nft.id == id:
                return nft
        return None

    def get_nfts_by_owner(self, owner):
        return [nft for nft in self.nfts if nft.owner == owner]

    def update_nft_metadata(self, id, new_metadata):
        nft = self.get_nft_by_id(id)
        if nft:
            nft.metadata = new_metadata
            return True
        return False

    def delete_nft(self, id):
        nft = self.get_nft_by_id(id)
        if nft:
            self.nfts.remove(nft)
            return True
        return False
