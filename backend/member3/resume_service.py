
import pymupdf as fitz
from pathlib import Path


def extract_resume_text(pdf_bytes: bytes) -> str:
    """
    Extract readable text from an uploaded PDF resume.
    The PDF is processed in memory, not saved to disk.
    """

    if not pdf_bytes:
        raise ValueError("The uploaded PDF is empty.")

    if not pdf_bytes.startswith(b"%PDF-"):
        raise ValueError("The uploaded file is not a valid PDF.")

    try:
        with fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        ) as document:

            if document.page_count == 0:
                raise ValueError("The PDF has no pages.")

            pages = []

            for page in document:
                text = page.get_text("text").strip()

                if text:
                    pages.append(text)

        resume_text = "\n\n".join(pages).strip()

        if not resume_text:
            raise ValueError(
                "No readable text found. "
                "This PDF may be scanned or image-based."
            )

        return resume_text

    except (fitz.FileDataError, fitz.EmptyFileError) as error:
        raise ValueError(
            "Could not read this PDF. It may be damaged."
        ) from error


def extract_resume_from_path(file_path: str) -> str:
    """
    Read a local PDF file for testing.
    """

    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError(
            f"Resume file not found: {path}"
        )

    pdf_bytes = path.read_bytes()

    return extract_resume_text(pdf_bytes)
