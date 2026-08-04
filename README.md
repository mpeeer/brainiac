# Brainiac

Brainiac is a calm, local-first homework workspace. Download classwork from Google Docs, upload the `.docx` or `.pdf` here, review the extracted text, organize it by class and due date, open a focused assignment view, and mark work complete as you go.

## Run locally

```bash
bun install
bun run dev
```

The Vite server binds to `0.0.0.0` and uses the `PORT` value supplied by the preview environment.

## Build

```bash
bun run build
```

## Import format

Paste one assignment per line. Separate the title, class, and due date with `|`, commas, or semicolons:

```text
Read chapter 4 | English | 2025-10-24
Practice set 1-20 | Mathematics | 2025-10-25
```

TXT and CSV files are supported by the importer. Google Docs downloads work through **File → Download → Microsoft Word (.docx)** or **PDF document (.pdf)**. Brainiac extracts selectable text in the browser, shows it for review, and does not upload the document. Scanned/image-only PDFs need OCR or a text-based download. Imported assignments and status changes are stored in the browser's local storage on the current device.

## Customize the workspace

Open **Settings** in the sidebar or the gear button in the top bar to personalize Brainiac. You can choose a light, dark, or warm paper theme; change the accent color; switch between comfortable and compact density; collapse the sidebar; and hide the homework stats when you want a calmer view. These preferences are saved locally alongside your assignments.

## Environment

No environment variables or external services are required for this frontend-only MVP. It intentionally keeps classwork local and private in the browser. A backend, authentication provider, LMS integration, or cloud file storage can be connected later for multi-device sync and direct imports from school platforms.
