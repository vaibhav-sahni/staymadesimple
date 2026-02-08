"""
Simple script to generate a PBKDF2 hash for a password of your choice.
Usage: python gen_single_hash.py
Then copy the output hash and paste it into update_hashes.py
"""
import sys
sys.path.insert(0, '..')

from auth import get_password_hash

password = input("Enter the password you want to hash: ")
hashed = get_password_hash(password)
print("\nGenerated hash:")
print(hashed)
print("\nCopy the hash above and add it to update_hashes.py with the corresponding user_id")
