# KRALİ - ALTYAZI — PROJECT CONTEXT

> **Purpose:** Read this file before changing KRALİ. It is the handoff/source-of-truth for ChatGPT Work/Codex-style sessions.
> **Last updated:** 2026-09-17
> **Repository:** `izmirli-ali/krali-altyazi`
> **Current installed/tested OTA version:** `v6.6.1`

## 1. Product goal

KRALİ - ALTYAZI is a Turkish Adobe Premiere Pro CEP subtitle extension. Product direction: **CapCut-level ease of use + Premiere integration + detailed KRALİ styling/editing**.

Primary workflow:

`Premiere Sequence -> Audio Track -> local Speech-to-Text -> word timestamps -> transcript editor -> live caption preview -> KRALI ALTYAZI timeline track`

User wants practical working builds, compact Turkish UI, and minimal dependencies. Do not turn this into a conceptual/demo project.

## 2. Environment and hard constraints

- Premiere Pro: 26.5 on macOS Apple Silicon.
- Extension architecture: **CEP + ExtendScript + CEP Node.js**.
- Development install path: `~/Library/Application Support/Adobe/CEP/extensions/Krali_Altyazi_DEV`.
- Debug keys CSXS 9-14 use `PlayerDebugMode=1`.
- Avoid Python, Xcode, Adobe Media Encoder, Homebrew and FFmpeg when possible.
- No After Effects/MOGRT dependency as the main architecture.
- No cloud transcription requirement.
- No animations for now.
- UI explanations/user-facing labels should be Turkish.
- Do not reintroduce aggressive/continuous MutationObserver DOM cleanup.
- Static checks are not Premiere runtime verification. Never claim runtime success until tested in Premiere.

## 3. Stable ASR architecture — preserve unless necessary

The transcription base was stabilized around v0.7.2.1 and should not be casually rewritten.

Pipeline:

`Premiere Sequence -> exportAsMediaDirect with Waveform Audio preset -> WAV -> Node PCM16 streaming/downsample -> local whisper.cpp -> word timestamps/captions`

Persistent engine/models live under:

`~/Library/Application Support/KRALI/Altyazi`

Known model setup:
- Fast/default: `ggml-small-q5_1.bin`
- Quality option: `ggml-large-v3-turbo-q5_0.bin`
- whisper.cpp Apple Silicon binary

No Python/Homebrew/Xcode/AME/cloud is required for the intended path.

## 4. Timeline output architecture — IMPORTANT

Native Premiere CaptionTrack experiments were abandoned because repeated export created C1/C2/C3... tracks and the public API did not provide the rich styling/update behavior required.

Current architecture uses **one normal video track named exactly `KRALI ALTYAZI`**.

Each cue is rendered as a transparent full-sequence PNG using the same Canvas2D renderer used by preview. On refresh:

1. Existing clips on `KRALI ALTYAZI` are removed.
2. Fresh uniquely named PNGs are imported.
3. They are written to the same KRALI video track at cue start/end.
4. Old KRALI render ProjectItems are cleaned where possible.

Stable writer lineage: v3.4 import fix -> v5 writer `writeKraliTextTrackV50(payloadJSON)`.

Important: PNG subtitles are **not editable as native Premiere text in Properties**. Do not claim this limitation is solved.

### Writer details

`writeKraliTextTrackV50(payloadJSON)`:
- gets/creates `KRALI ALTYAZI`
- removes all old clips in reverse order
- uses/creates root Project bin `KRALI_RENDER_CACHE`
- imports unique fresh PNGs
- `overwriteClip` at cue start
- trims inserted clip end
- cleans old generation ProjectItems where possible

`_v30EnsureGraphicsTrack(seq)` scans for exact `KRALI ALTYAZI`; if missing it uses QE `addTracks` and avoids intentionally overwriting a user track.

Do not replace this writer unless a concrete bug requires it.

## 5. Shared preview/export renderer

The shared renderer is `k31draw(ctx,W,H,text)` and should remain the source of visual parity between panel preview and exported PNG overlays.

Style state lineage includes:
- font / size / alignment / bold / italic
- fill + opacity
- stroke + width + opacity
- background + opacity + radius + horizontal/vertical padding + block/line mode
- shadow + opacity + blur + X/Y
- zone / X / Y / width

Do not create separate visual logic for preview and export.

## 6. Transcript/editor behavior to preserve

- All transcript text visible/editable in panel.
- Enter inside caption = split at caret.
- Backspace/Delete at start = merge with previous.
- Keep only the explicit manual merge button `Sonrakiyle Birleştir`.
- `KELİMEYE GİT` is useful and should stay.
- Word timestamp editor/speech navigation exists.
- Smart Split / `AKILLI BÖL` is useful and must stay always visible.
- Profiles: `Kısa / Dengeli / Uzun`.
- Search/Replace is low priority and should stay collapsed under text tools.
- Caption Timeline feature was judged not useful; keep removed/hidden.

## 7. UI product decisions — treat as locked direction

User wants:
- Entire UI Turkish.
- Compact, responsive, Premiere-like.
- Preview + inspector side-by-side even when panel is roughly one-third of screen.
- Current responsive breakpoint around **620px** worked well.
- Preview must not become excessively large.
- Inspector is exclusive accordion: opening METİN closes GÖRÜNÜM/KONUM/PRESET, etc.
- `Önizlemeyi Gizle/Göster` may remain but should be visually secondary.
- `Tüm Metinler`, `KELİMEYE GİT`, `AKILLI BÖL`, transcript area and footer layout should not be redesigned casually.
- `AKILLI BÖL` stays outside accordion and always visible.
- `KRALİ TRACK'İ GÜNCELLE` footer stays fixed and must not be clipped.
- Remove/avoid Leading and Tracking controls.
- Remove/avoid manual split lock.
- Remove/avoid `metin sonlarını göster`.
- Remove/avoid Social/Sade style choices.
- No animation work for now.

Known successful layout lineage: v6.3.3 compact split -> v6.4 focus inspector. Do not return to the v6.3 aggressive DOM-cleanup approach.

## 8. CURRENT BUG — highest priority

Current OTA-installed version is **v6.6.1**. OTA itself succeeded from v6.6 -> v6.6.1 without manual ZIP installation.

However, the `GÖRÜNÜM` main section is still broken in Premiere runtime.

### What the user currently sees in v6.6.1

The labels appear:
- Dolgu
- Kontur
- Arka Plan
- Gölge

But the expected checkbox/color/value controls are missing after the v6.6.1 authoritative DOM rebuild.

### Intended final layout

```text
☑  Dolgu          [color]
☑  Kontur         [color]  [3]
☐  Arka Plan      [color]  [75]
☐  Gölge          [color]  [8]
--------------------------------
GELİŞMİŞ                    >
```

Rules:
- NO sliders in these four main rows.
- Sliders belong only in `GELİŞMİŞ`.
- `GELİŞMİŞ` currently looks good; do not redesign it.
- Preserve the original input IDs/event bindings/render state.
- Do not alter preview/inspector proportions, Kelimeye Git, Akıllı Böl, transcript or footer while fixing this.

Likely cause: layered legacy/additive controllers move/reparent or hide the existing inputs after the authoritative container rebuild. Inspect actual controller timing/DOM ownership rather than adding another blind CSS patch.

**Preferred fix:** consolidate/own these four controls deterministically. Avoid heuristic text scanning of arbitrary parent DIVs. Avoid continuous MutationObserver cleanup.

## 9. Technical debt to keep in mind

The extension accumulated additive IIFEs across v5.2-v6.x. This caused startup/UI races. A future major cleanup should physically consolidate UI into one static HTML/controller, but **do not combine that large refactor with the immediate v6.6.2 appearance bug fix**.

Other known debt:
- filler/repeated-word cleanup may leave stale `words` timestamps
- project dictionary scope may not truly be project-specific
- some direct operations may not fully integrate with undo history
- reset defaults may miss newer appearance fields
- runtime localization can miss dynamically created text
- CTI polling overhead
- ProjectItem cleanup `.deleteBin()` behavior not fully runtime-proven
- ASR context hook may be a no-op
- responsive Auto safe area is not truly sequence-aware
- incremental render was only a fingerprint foundation; do not claim a real incremental writer unless source inspection proves one exists
- robust system/Premiere font list is not yet considered solved

## 10. OTA updater — working and important

Repository update manifest:

`update/latest.json`

Public raw channel is used so the extension does not embed a personal GitHub token.

The v6.6 updater implements:
- semantic-ish version comparison
- manifest check
- ZIP download
- SHA-256 verification
- local backup
- extraction/copy
- panel reload

Backups/update working area is under:

`~/Library/Application Support/KRALI/Altyazi/updater`

**Runtime proof:** v6.6 automatically downloaded/applied v6.6.1 and the Premiere panel reopened showing `KRALİ - ALTYAZI v6.6.1`.

Current stable manifest points to the v6.6.8 release candidate package. v6.6.8 keeps the prior repairs and hides the entire legacy appearance body until authoritative rows are ready, preventing first-load flicker. Premiere runtime acceptance is still pending.

Do not break the OTA mechanism while fixing UI. Future releases should update package + SHA-256 + `update/latest.json`.

## 11. Release discipline

For every new build:
1. Start from the current working source, not an unrelated old branch.
2. Make the smallest necessary change.
3. Run `node --check` on JS.
4. Perform static assertions for preserved ASR/writer/renderer/editor functions.
5. Package ZIP.
6. Compute SHA-256.
7. Publish package to repo/update distribution.
8. Update `update/latest.json` only when package is ready.
9. Let Premiere OTA install it.
10. Treat user screenshot/runtime test as the actual acceptance test.

Do not say “fixed” based only on static checks.

## 12. Immediate next task

**v6.6.2 appearance repair, v6.6.3 source-DOM cleanup, v6.6.4 OTA cache-busting, v6.6.5 duplicate-row/toggle cleanup, v6.6.6 nested-row cleanup, v6.6.7 CSS legacy-row suppression and v6.6.8 first-load suppression are implementation/package/OTA-ready; Premiere runtime acceptance is pending.**

Root cause: the v6.6.1 authoritative appearance `rebuild()` cleared `#krali661main` on its delayed second pass after the original controls had been moved into that container. This deleted the controls, so only newly created labels remained.

v6.6.2 builds replacement rows in a `DocumentFragment` first, moving the original inputs to safety before clearing/replacing the container. Repeated rebuilds therefore preserve the same input nodes, IDs and event bindings.

Runtime verification checklist:

1. Confirm OTA installs and panel header shows v6.6.8.
2. Confirm all four GÖRÜNÜM rows show checkbox + color, and values `3 / 75 / 8` where applicable.
3. Confirm there are no sliders in the four main rows.
4. Confirm `GELİŞMİŞ` remains unchanged.
5. Confirm changing each main-row control updates preview and `KRALI ALTYAZI` output as before.

After v6.6.2 passes runtime UI verification, freeze this UI and move to functional improvements rather than more visual redesign.

## 13. Working style for autonomous agents

When operating in ChatGPT Work/Codex-like mode:
- Continue through implementation, static validation, packaging and GitHub preparation without asking for approval at every small step.
- Ask only before genuinely destructive/irreversible actions or when essential information is missing.
- Prefer concrete code/build output over long explanations.
- Never silently change stable ASR/timeline architecture while solving an unrelated UI issue.
- Keep a rollback path.
- Update this `KRALI_PROJECT_CONTEXT.md` whenever architecture, current stable version, OTA state, or the highest-priority bug materially changes.
