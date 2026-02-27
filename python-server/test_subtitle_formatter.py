"""Tests for subtitle_formatter.py — pure function tests."""

from subtitle_formatter import (
    _ts_srt,
    _ts_vtt,
    _ts_ass,
    segments_to_srt,
    segments_to_vtt,
    segments_to_ass,
    format_subtitles,
)


# ── Timestamp helpers ─────────────────────────────────────────────


def test_ts_srt_zero():
    assert _ts_srt(0.0) == "00:00:00,000"


def test_ts_srt_milliseconds():
    assert _ts_srt(83.456) == "00:01:23,456"


def test_ts_srt_over_hour():
    assert _ts_srt(3661.1) == "01:01:01,100"


def test_ts_vtt_format():
    assert _ts_vtt(83.456) == "00:01:23.456"


def test_ts_ass_centiseconds():
    # ASS uses centiseconds and single-digit hour
    assert _ts_ass(0.0) == "0:00:00.00"
    assert _ts_ass(83.456) == "0:01:23.46"
    assert _ts_ass(3661.1) == "1:01:01.10"


# ── SRT formatter ─────────────────────────────────────────────────


def test_srt_basic():
    segments = [{"start": 1.0, "end": 3.5, "text": "Hello world"}]
    result = segments_to_srt(segments)
    assert "1\n" in result
    assert "00:00:01,000 --> 00:00:03,500" in result
    assert "Hello world" in result


def test_srt_dual_subtitle():
    segments = [{"start": 0.0, "end": 2.0, "text": "Hello", "translated": "안녕"}]
    result = segments_to_srt(segments)
    assert "Hello\n안녕" in result


# ── VTT formatter ─────────────────────────────────────────────────


def test_vtt_header():
    segments = [{"start": 0.0, "end": 1.0, "text": "Hi"}]
    result = segments_to_vtt(segments)
    assert result.startswith("WEBVTT")


# ── ASS formatter ─────────────────────────────────────────────────


def test_ass_structure():
    segments = [{"start": 0.0, "end": 1.0, "text": "Hi"}]
    result = segments_to_ass(segments)
    assert "[Script Info]" in result
    assert "[Events]" in result
    assert "Dialogue:" in result


# ── Dispatch ──────────────────────────────────────────────────────


def test_format_subtitles_dispatch_srt():
    segments = [{"start": 0.0, "end": 1.0, "text": "A"}]
    result = format_subtitles(segments, "srt")
    assert "00:00:00,000" in result


def test_format_subtitles_dispatch_vtt():
    segments = [{"start": 0.0, "end": 1.0, "text": "A"}]
    result = format_subtitles(segments, "vtt")
    assert "WEBVTT" in result


def test_format_subtitles_dispatch_ass():
    segments = [{"start": 0.0, "end": 1.0, "text": "A"}]
    result = format_subtitles(segments, "ass")
    assert "[Script Info]" in result


def test_format_subtitles_default_is_srt():
    segments = [{"start": 0.0, "end": 1.0, "text": "A"}]
    result = format_subtitles(segments, "unknown")
    # Unknown format falls through to SRT
    assert "00:00:00,000" in result


# ── Edge cases ────────────────────────────────────────────────────


def test_empty_segments():
    assert segments_to_srt([]) == ""
    assert segments_to_vtt([]) == "WEBVTT\n"
    assert "[Events]" in segments_to_ass([])
