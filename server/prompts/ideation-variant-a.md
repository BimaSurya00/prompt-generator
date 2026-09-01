Create ONE complete storyboard prompt using the STRUCTURED FORM-FILL format (Variant A).

FORMAT:
{{templateA}}

STORYBOARD TEMPLATE LIBRARY:
{{templatesList}}

RULES:
- LANGUAGE: ALL fields and descriptions MUST be written in {{langName}} — this variant is the team-facing planning document, not the raw AI video prompt.
- Follows the STRUCTURED FORM-FILL format: metadata fields → scenes → visual prompts. 5 scenes, 30-40 seconds total. If POV: include POV rules in metadata. If non-POV: skip POV rules.
- TEMPLATE SELECTION: The idea has angle_category "{{angleCategory}}". Select the ONE template_id from the STORYBOARD TEMPLATE LIBRARY whose best_for best matches this angle_category. Then fill each element of that template's "structure" array as one concrete scene (PERAN ADEGAN of each scene = the structure element name). Scene count = structure length, PLUS extra scenes if a beat must be split to respect the duration constraint below.
- ACTIVITY SEQUENCE RULES (ONLY when template_id = activity_sequence is selected): ZERO dialogue — DIALOG / VOICE OVER field is "—" in EVERY scene, no narration, no voiceover, no on-screen text, no subtitles. Every scene is ONE concrete activity by the SAME character (e.g. eating, working out, drinking milk). SUBJEK must repeat the FULL character description verbatim in every scene — character consistency is the only thread connecting scenes. Product appears naturally: at minimum in Product Moment, may appear subtly in other activities. CTA Visual = clean product close-up only, NO text overlay, NO voice. Each scene is an independent visual unit ready to be copied one-by-one into an AI video generator.
- DURATION CONSTRAINT: Every scene (ADEGAN) MUST be {{maxClipDuration}} seconds or less. If a beat naturally needs more time, SPLIT it into 2+ consecutive scenes (each an independent visual unit, ready to generate one-by-one in a video AI generator). Each split scene keeps: duration, dialog (if any), visual prompt, and a short continuity note (e.g. "lanjutan adegan sebelumnya, posisi & pencahayaan sama"). Total duration of ALL scenes MAY exceed {{maxClipDuration}}; only per-scene must not.
- Fill ALL fields. Leave nothing empty.

Output EXACTLY in this format, starting immediately with the first line — no preamble, no markdown fences:
TEMPLATE_USED: <selected template_id>
[Variant A storyboard following structured format]
