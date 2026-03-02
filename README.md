# SubText

**Your videos, your language, your machine.**

SubText is a desktop app that transcribes and translates subtitles using AI models running entirely on your computer. No cloud APIs, no subscriptions, no data leaving your device — ever.

## Why SubText?

Most subtitle tools send your audio to remote servers. That means upload waits, usage fees, and zero control over where your data ends up.

SubText takes a different approach:

- **Complete privacy** — Audio, transcripts, and translations stay on your machine. Nothing is uploaded anywhere.
- **No internet required** — Once models are downloaded, everything works offline.
- **No recurring costs** — One install, unlimited use. No API keys, no per-minute billing.
- **GPU-accelerated** — Automatically uses your NVIDIA GPU when available, falls back to CPU gracefully.

## What it does

**1. Transcribe** — Drop in a video or audio file. SubText generates timed subtitles using Whisper speech recognition.

**2. Translate** — Subtitles are translated segment-by-segment with a local LLM. Control the style (formal, casual, natural) and inject glossary terms for consistent translations.

**3. Edit** — Fine-tune results in a built-in subtitle editor with waveform visualization, split/merge tools, and audio playback.

**4. Export** — Save as SRT, VTT, ASS, or plain text.

## Key Features

| Feature | Description |
|---|---|
| **Drag-and-drop workflow** | Drop files → pick a preset → subtitles appear |
| **Translation presets** | Save combinations of language pair, style, and glossary for reuse |
| **Glossary / vocabulary** | Define how specific terms should always be translated |
| **Hardware profiles** | Lite / Balanced / Power — auto-recommended based on your RAM & GPU |
| **Model management** | Browse, download, and switch between AI models from the app |
| **Batch processing** | Queue multiple files and process them in sequence |
| **Subtitle editor** | Waveform view, split/merge, inline editing, keyboard navigation |
| **Bilingual UI** | English & Korean |
| **Dark / Light theme** | System-aware with manual override |

## System Requirements

| Spec | Minimum | Recommended |
|---|---|---|
| **OS** | Windows 10 (64-bit) | Windows 11 |
| **RAM** | 8 GB | 16 GB+ |
| **Disk** | 4 GB free | 10 GB+ (for larger models) |
| **GPU** | Not required | NVIDIA with 4 GB+ VRAM (CUDA) |

## Getting Started

Download the installer from the Releases page, run it, and follow the setup wizard. The wizard detects your hardware, recommends a profile, and downloads the right models for your system.

That's it — no Python, no command line, no manual configuration.

## How it Works

SubText bundles everything it needs:

- **Whisper** (via [faster-whisper](https://github.com/SYSTRAN/faster-whisper)) for speech-to-text
- **LLM** (via [llama-cpp-python](https://github.com/abetlen/llama-cpp-python)) for translation
- A **Python runtime** installed automatically on first launch
- **GGUF models** downloaded from HuggingFace with resume support and integrity checks

The app shell is built with [Tauri 2](https://v2.tauri.app/) (Rust), the UI with React + TypeScript, and the AI engines run in a local FastAPI server — all communicating over localhost.

## For Developers

```bash
# Prerequisites: Node.js 18+, Rust 1.70+
npm install
npm run tauri dev      # Development
npm run tauri build    # Production installer
```

<details>
<summary>Project structure</summary>

```
src/                     # React frontend
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── editor/          # Waveform, SubtitleList, EditPanel
│   ├── dashboard/       # Job table, NewJobDialog
│   ├── presets/          # PresetCard, VocabCard, CRUD dialogs
│   └── settings/        # 6-section settings panel
├── hooks/               # useConfig, useRuntime, usePipeline, ...
└── i18n/locales/        # en.json, ko.json

src-tauri/src/           # Rust backend
├── commands*.rs         # IPC command handlers
├── model_downloader.rs  # HuggingFace download with resume
├── hw_detector.rs       # CPU/GPU/RAM detection
├── config_manager.rs    # App configuration CRUD
├── preset_manager.rs    # Translation presets
└── python_manager.rs    # Python subprocess lifecycle

python-server/           # FastAPI backend
├── stt_engine.py        # faster-whisper wrapper
├── llm_engine.py        # llama-cpp-python wrapper
├── prompt_builder.py    # Context window & glossary injection
└── runtime_router.py    # Model load/unload, resource polling
```

</details>

## License

Private — All rights reserved.
