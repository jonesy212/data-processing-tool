from umbral import config, keys, pre
from umbral.crypto import umbral

# Set up Umbral
config.set_default_curve()

# Generate Alice's and Bob's key pairs
alice_private_key = keys.UmbralPrivateKey.gen_key()
alice_public_key = alice_private_key.get_pubkey()

bob_private_key = keys.UmbralPrivateKey.gen_key()
bob_public_key = bob_private_key.get_pubkey()

# Alice encrypts some data
data_to_encrypt = b"Sensitive information"
ciphertext, capsule = pre.encrypt(alice_public_key, data_to_encrypt)

# Alice generates a re-encryption key to grant access to Bob
rekeying_key = pre.rekey(alice_private_key, bob_public_key)

# Bob re-encrypts the data using the re-encryption key
bob_ciphertext = pre.decrypt(ciphertext, rekeying_key, bob_private_key, capsule)

# Bob can now decrypt the data
decrypted_data = umbral.decrypt(bob_ciphertext, bob_private_key, capsule)

print(f"Original data: {data_to_encrypt.decode()}")
print(f"Decrypted data by Bob: {decrypted_data.decode()}")
