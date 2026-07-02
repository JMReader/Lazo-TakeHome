from cryptography.fernet import Fernet

from app.infrastructure.security.tax_id import TaxIdProtector


def test_tax_id_last4_ignores_separators():
    protector = TaxIdProtector(Fernet.generate_key().decode())

    protected = protector.protect("12-3456789")

    assert protected.last4 == "6789"
    assert protected.masked == "****6789"
    assert protected.encrypted != "12-3456789"


def test_tax_id_can_be_decrypted_for_internal_use_only():
    key = Fernet.generate_key().decode()
    protector = TaxIdProtector(key)

    protected = protector.protect("12-3456789")

    assert protector.decrypt(protected.encrypted) == "12-3456789"
