import re
from dataclasses import dataclass

from cryptography.fernet import Fernet


@dataclass(frozen=True)
class ProtectedTaxId:
    encrypted: str
    last4: str
    masked: str


class TaxIdProtector:
    def __init__(self, key: str) -> None:
        """Prepare Fernet encryption for tax identifier protection."""
        self._fernet = Fernet(key.encode())

    def protect(self, raw_tax_id: str) -> ProtectedTaxId:
        """Encrypt a tax ID and derive safe display metadata."""
        last4 = self._last4(raw_tax_id)
        encrypted = self._fernet.encrypt(raw_tax_id.encode()).decode()
        return ProtectedTaxId(
            encrypted=encrypted,
            last4=last4,
            masked=f"****{last4}",
        )

    def decrypt(self, encrypted_tax_id: str) -> str:
        """Recover a tax ID for trusted backend-only workflows."""
        return self._fernet.decrypt(encrypted_tax_id.encode()).decode()

    @staticmethod
    def _last4(raw_tax_id: str) -> str:
        """Extract the last four alphanumeric characters for masking."""
        normalized = re.sub(r"[^A-Za-z0-9]", "", raw_tax_id)
        return normalized[-4:]
