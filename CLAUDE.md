# A+ Core 1 Quiz

Phone-first practice quiz for CompTIA A+ Core 1 (220-1201). Plain HTML, CSS, and JavaScript with no build step and no dependencies. It opens by double-clicking `index.html` and is also served with GitHub Pages.

- `js/engine.js`: question data, picking, and stats. `js/board.js`: motherboard home and zoom camera. `js/card.js`: inspection cards, report, and POST receipt. `js/exam.js`: Exam Mode. `js/app.js`: hash router and keys. `js/storage.js`: progress and settings in localStorage (`aplusQuiz.v1`).
- `questions/*.js`: one file per exam domain, JSON wrapped in `QUIZ.register(...)` because browsers block reading `.json` from `file://`. `answer` counts from 0. Question `id`s must never change, because saved progress is keyed on them.
- Scripts are classic (no ES modules, which `file://` blocks) and load in order: `storage`, `questions/*`, `engine`, `board`, `card`, `exam`, `app`. Each exposes one global (`Store`, `Engine`, `Board`, `Card`, `Exam`).
- Routes live in the URL hash so the phone's Back gesture works: `#/` board, `#/part/<mob|net|hw|virt|ts>` zoomed on a part, `#/card` study card, `#/report` POST receipt, `#/exam` Exam Mode.
- The board is a fixed 390×960 design scaled to the screen width (max 480px). Part zoom centers live in `Engine.PARTS`.
- Fonts are bundled in `fonts/` (no network needed).
- Exam weights: 1.0 Mobile 13%, 2.0 Networking 23%, 3.0 Hardware 25%, 4.0 Virtualization & Cloud 11%, 5.0 Troubleshooting 28%.

## Design System: "Inside the Case"

The app is a real motherboard photographed from above, as if the side panel just came off a PC. Every screen follows these rules.

### Camera and light
- One camera, looking straight down like a macro photo. No perspective, tilt, or isometric views.
- One light source, from the upper left. Highlights sit on top and left edges. Shadows fall down and to the right at the same angle everywhere (e.g. `box-shadow: 3px 5px 8px rgba(0,0,0,.55)`), and get longer only for taller parts.
- Nothing floats. Every element is something that physically exists on a board: parts, silkscreen, stickers, tape. No cards, modals, badges, glows, or UI chrome.

### Materials
- Board: one continuous matte black PCB with visible solder mask texture (fine noise, never glossy).
- Copper traces run under the solder mask and connect the parts. Exposed pads, vias, and edge contacts are gold (ENIG).
- Metals: brushed aluminum (CPU lid, heatsinks), steel (I/O shield), tin solder joints.
- Plastics: black connector housings, a cream ATX power connector, white slot latches.

### Type
- All labels are silkscreen: white, condensed sans, uppercase (Barlow Semi Condensed). Reference designators (C21, R7, U1) may be tiny because they're texture. Anything the user must read is 12px or larger.
- Handwriting appears only on masking tape (Permanent Marker).
- Laser etching (dark on aluminum) appears only on metal lids.

### Color
- Neutrals come from the materials. There is one accent: amber/orange LED light (#FF7A1A family). Use it only for the POST code digits, the weakest domain's debug LED, and the PWR button cap.
- No neon, no terminal green, no gradients except real lighting falloff.

### Real hardware as UI
| Hardware | Meaning |
|---|---|
| Debug LEDs: CPU, DRAM, LAN, BATT, BOOT | One per domain; the weakest blinks amber |
| Two-digit POST code display | Overall score, in % (flashes the last run's score); tap for the POST report |
| Onboard PWR button | Quick 10 (in EXAM mode: the timed exam) |
| Onboard RST button | Review missed |
| Slide switch STUDY / EXAM | Exam Mode |
| CPU = 3.0 Hardware, DIMMs = 4.0 Virtualization & Cloud, RJ45 = 2.0 Networking, CMOS battery = 1.0 Mobile, 24-pin ATX = 5.0 Troubleshooting | Domain parts (tap to inspect or practice) |

### Paper on the board
- Questions are printed on a paper **inspection card** lying on the blurred board: print type (IBM Plex Sans, IBM Plex Mono for headers), printed tick boxes, and a perforated tear-off tab for the next action.
- Feedback is physical: a pencil tick for your choice, a black-ink stamp (round **PASS**, rectangular **FAIL**) kept clear of the question text, and a pencil circle around the right answer on a miss.
- Results are an **inspection report** card. Stats are a **thermal receipt** ("POST report") in mono type with torn edges.
- Ink and pencil are neutral (black and graphite). The one accent stays amber LED light.

### Signs of use
- Subtle only: light dust (more on heatsink fins), a warranty sticker, and a strip of masking tape with the handwritten exam date and countdown ("Core 1 · Nov 7", days remaining).

### Motion
- Tapping a part pulls the camera in to a macro close-up. The board scales toward the part, depth of field goes shallow (everything outside the focal plane blurs), and the part's fine print (etching, stickers, silkscreen) becomes readable as that domain's stats. Tapping the blurred board steps back.
- Motion lasts about 0.6s with ease-out and never blocks input. With `prefers-reduced-motion`, cut straight to the result: no zoom, no blinking.

### Readability
- Anything the user must read sits on flat, even-toned material with at least 4.5:1 contrast. Decorative texture never runs behind readable text.
- Tap targets are at least 44px, even when the part drawn is smaller (the hit area extends past the part).
- Exam Mode drops all of this for a plain, neutral testing screen.

### Exam Mode
- Switch on EXAM, then press PWR: choose 10 questions in 10 minutes or 90 in 90. Questions are drawn by domain weight with no repeats.
- Neutral gray-and-white UI: timer, "Question n of N", Flag for review, Previous/Review/Next, and a review grid (answered, unanswered, flagged). No feedback until you submit, and it auto-submits at 0:00.
- Results show the score, a per-domain breakdown, and the misses. Say that CompTIA's 100–900 scaled score (675 passes) isn't a straight percentage.
