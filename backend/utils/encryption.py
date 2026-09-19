import os
import base64
from cryptography.fernet import Fernet

def get_encryption_key() -> bytes:
    key = os.environ.get('MAIL_CREDENTIALS_ENCRYPTION_KEY')
    if not key:
        raise ValueError('MAIL_CREDENTIALS_ENCRYPTION_KEY is not set in environment variables.')
    return key.encode('utf-8')

def encrypt_password(password: str) -> str:
    if not password:
        return ''
    key = get_encryption_key()
    f = Fernet(key)
    encrypted_bytes = f.encrypt(password.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')

def decrypt_password(encrypted_password: str) -> str:
    if not encrypted_password:
        return ''
    key = get_encryption_key()
    f = Fernet(key)
    decrypted_bytes = f.decrypt(encrypted_password.encode('utf-8'))
    return decrypted_bytes.decode('utf-8')
