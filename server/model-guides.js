// Video prompt engineering skill — per-model prompting guides.
// Sumber: Square-Zero-Labs/video-prompting-skill + praktik terbaik internal.
// Tambah model baru di sini, lalu daftarkan di MODEL_OPTIONS.

export const MODEL_OPTIONS = [
  { id: 'seedance', label: 'Seedance' },
  { id: 'kling', label: 'Kling' },
  { id: 'veo', label: 'Veo' },
  { id: 'wan', label: 'Wan' },
  { id: 'minimax', label: 'MiniMax' },
  { id: 'ltx', label: 'LTX' },
  { id: 'generic', label: 'Generic' },
]

export const MODEL_GUIDES = {
  seedance: `TARGET MODEL: Seedance. Prefer director-style scene descriptions with explicit temporal beats. Use standard film verbs (slow push-in, fast pan, tracking shot, orbit, low-angle follow, close-up). Describe concrete visible behavior over abstract mood words. Call out visible physical outcomes (balance shifts, fabric movement, sweat). If audio matters, specify ambience or foley directly in the scene (e.g. "sneakers squeak softly"). Keep action readable; do not stack too many simultaneous beats into one short scene.`,

  kling: `TARGET MODEL: Kling. Use detailed, step-by-step motion description with clear spatial relationships and explicit timing per beat (e.g. "lifts the dumbbell (2 sec), holds (1 sec), lowers (2 sec)"). Describe realistic motion physics and how the body and props interact with the environment.`,

  veo: `TARGET MODEL: Veo 3. Structure each scene as [Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]. Be explicit about camera and optics (dolly, tracking, crane, slow pan, POV, wide shot, close-up, low angle, shallow depth of field). If no dialogue, say so directly in the scene. For negative constraints, prefer describing the desired absence concretely (e.g. "clean frame with no text") over abstract "no X" lists.`,

  wan: `TARGET MODEL: Wan 2.2. Follow the prompt literally — describe exactly what should appear and happen, in order. Strong physics and complex motion are its strengths: describe how objects/body interact with gravity and contact (fabric drag, sweat, impact). Use sequential action description with clear cause-effect. Prefer longer, complete sentences over keyword fragments.`,

  minimax: `TARGET MODEL: MiniMax H3. Use structured multiline format with explicit field labels per shot (Setting / Subject / Action / Camera / Audio) and shot timestamps where timing matters. Preserve exact field names and order. Distinguish alignment requirements: if the shot must match a first/last frame or full reference, state what must remain identical. Keep dialogue brief and precisely written if present.`,

  ltx: `TARGET MODEL: LTX-2.x. Keep the scene simple and single-focused — LTX performs best with one main subject and one main action per shot, not busy multi-subject scenes. Use plain, literal descriptions of motion. Avoid stacking many simultaneous beats; short duration means fewer beats. If dialogue exists, write it exactly as spoken.`,

  generic: '',
}