"""Regression checks for the local release filter and redacted scanner."""

from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from release_audit import audit_tree, inspect_bytes, protected_name


class ReleaseAuditTests(unittest.TestCase):
    def test_private_filenames(self):
        for name in (".env", ".env.production", "private.pem", "client.key",
                     "credentials.json", "service-account-dev.json"):
            self.assertTrue(protected_name(name), name)
        for name in ("README.md",):
            self.assertFalse(protected_name(name), name)

    def test_credential_rules_are_redacted(self):
        # Synthetic values are assembled only in memory, never real credentials.
        samples = (
            b"gh" + b"p_" + b"A" * 30,
            b"gl" + b"pat-" + b"A" * 25,
            b"xo" + b"x" + b"b-" + b"A" * 25,
            b"np" + b"m_" + b"A" * 30,
            b"sk" + b"-proj-" + b"A" * 30,
            b"sk" + b"-ant-" + b"A" * 30,
            b"AI" + b"za" + b"A" * 32,
            b"sk" + b"_test_" + b"A" * 24,
            b"rk" + b"_live_" + b"A" * 24,
            b"AK" + b"IA" + b"A" * 16,
            b"SG." + b"A" * 25 + b"." + b"B" * 25,
            b"SK" + b"1" * 32,
            b"postgres" + b"ql://account:password" + b"@" + b"host.invalid",
            b"-----BE" + b"GIN PRIVATE KEY-----",
            b"const api" + b"Key = '" + b"A" * 30 + b"';",
        )
        for sample in samples:
            result = inspect_bytes(sample, "fixture", "test")
            self.assertTrue(any(f["level"] == "blocker" for f in result))
            self.assertNotIn(sample.decode(), str(result))
            self.assertEqual(set(result[0]), {"scope", "path", "rule", "level"})
            self.assertNotIn(sample.decode(), str(result))

    def test_environment_references_are_not_credentials(self):
        result = inspect_bytes(
            b"const apiKey = process.env.GEMINI_API_KEY;", "config.ts", "test",
        )
        self.assertEqual(result, [])

    def test_private_file_not_opened_and_internal_directory_skipped(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".agents").mkdir()
            (root / ".agents" / "private.md").write_text("Internal context")
            (root / ".slide-thumbnails").mkdir()
            (root / ".slide-thumbnails" / "preview.jpg").write_bytes(b"\0cached preview")
            (root / ".env.example").write_text("No real credentials")
            (root / "README.md").write_text("Public project")
            report = audit_tree(root)
            self.assertEqual(report["files_scanned"], 1)
            self.assertEqual(report["findings"], [{
                "scope": "tree", "path": ".env.example", "rule": "private_file", "level": "blocker",
            }])


if __name__ == "__main__":
    unittest.main()
