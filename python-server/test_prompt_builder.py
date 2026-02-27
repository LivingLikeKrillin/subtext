"""Tests for prompt_builder.py — pure function tests."""

from prompt_builder import (
    build_system_prompt,
    _format_timestamp,
    _match_glossary,
    build_user_prompt,
    build_messages,
)


# ── build_system_prompt ───────────────────────────────────────────


def test_build_system_prompt_natural():
    prompt = build_system_prompt("natural", "en", "ko")
    assert "naturally" in prompt.lower() or "idiomatically" in prompt.lower()
    assert "en" in prompt
    assert "ko" in prompt


def test_build_system_prompt_formal():
    prompt = build_system_prompt("formal", "en", "ko")
    assert "formal" in prompt.lower() or "honorific" in prompt.lower()


def test_build_system_prompt_unknown_style():
    prompt = build_system_prompt("nonexistent_style", "en", "ko")
    # Falls back to "natural"
    assert "naturally" in prompt.lower() or "idiomatically" in prompt.lower()


# ── _format_timestamp ─────────────────────────────────────────────


def test_format_timestamp_zero():
    assert _format_timestamp(0.0) == "00:00:00"


def test_format_timestamp_complex():
    assert _format_timestamp(3661.0) == "01:01:01"


# ── _match_glossary ───────────────────────────────────────────────


def test_match_glossary_found():
    glossary = [{"source": "AI", "target": "인공지능"}]
    result = _match_glossary("AI is great", glossary)
    assert len(result) == 1
    assert result[0]["target"] == "인공지능"


def test_match_glossary_case_insensitive():
    glossary = [{"source": "Hello", "target": "안녕"}]
    result = _match_glossary("hello world", glossary)
    assert len(result) == 1


def test_match_glossary_not_found():
    glossary = [{"source": "AI", "target": "인공지능"}]
    result = _match_glossary("no match here", glossary)
    assert len(result) == 0


# ── build_user_prompt ─────────────────────────────────────────────


def _make_segments(n: int = 5):
    return [
        {"start": float(i * 10), "end": float(i * 10 + 9), "text": f"Segment {i}"}
        for i in range(n)
    ]


def test_build_user_prompt_with_context():
    segs = _make_segments(5)
    prompt = build_user_prompt(segs, current_index=2, context_window=2, glossary=[])
    assert ">>>" in prompt
    assert "Segment 2" in prompt
    # Context window=2 means segments 0..4 visible
    assert "Segment 0" in prompt
    assert "Segment 4" in prompt


def test_build_user_prompt_with_glossary():
    segs = [{"start": 0.0, "end": 5.0, "text": "AI is great"}]
    glossary = [{"source": "AI", "target": "인공지능"}]
    prompt = build_user_prompt(segs, current_index=0, context_window=2, glossary=glossary)
    assert "[Glossary]" in prompt
    assert "AI" in prompt
    assert "인공지능" in prompt


def test_build_user_prompt_first_segment():
    segs = _make_segments(5)
    prompt = build_user_prompt(segs, current_index=0, context_window=2, glossary=[])
    assert ">>> " in prompt
    assert "Segment 0" in prompt
    # start is max(0, 0-2)=0, so no negative index
    assert "[Context]" in prompt


def test_build_user_prompt_no_glossary_section_when_empty():
    segs = _make_segments(3)
    prompt = build_user_prompt(segs, current_index=1, context_window=1, glossary=[])
    assert "[Glossary]" not in prompt


# ── build_messages ────────────────────────────────────────────────


def test_build_messages_structure():
    segs = [{"start": 0.0, "end": 5.0, "text": "Hello"}]
    messages = build_messages(segs, current_index=0, source_lang="en", target_lang="ko")
    assert len(messages) == 2
    assert messages[0]["role"] == "system"
    assert messages[1]["role"] == "user"
    assert ">>>" in messages[1]["content"]
