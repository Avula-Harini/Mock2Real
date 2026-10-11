
from pathlib import Path
from resume_service import extract_resume_from_path

BASE_DIR = Path(__file__).resolve().parent

resume_path = BASE_DIR / "sample_resume.pdf"

try:
    resume_text = extract_resume_from_path(
        str(resume_path)
    )

    print("\nRESUME TEXT EXTRACTED SUCCESSFULLY\n")
    print("=" * 50)
    print(resume_text)
    print("=" * 50)

except Exception as error:
    print("Resume extraction failed:", error)
