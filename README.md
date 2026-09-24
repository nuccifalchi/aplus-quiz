# A+ Core 1 Quiz (220-1201)

A phone-friendly practice quiz for the CompTIA A+ Core 1 exam. It's plain HTML, CSS, and JavaScript, so there's nothing to install.

## Open it

- **On a computer:** double-click `index.html`.
- **On a phone:** use the GitHub Pages link (see below), then choose *Add to Home Screen* so it opens like an app.

## How to use the board

The home screen is a motherboard. Every part does something:

| On the board | What it does |
|---|---|
| **A part** (network jack, CPU, RAM, 24-pin power plug, coin battery) | Flies into that exam domain's page: a close-up of the part, your stats, and a datasheet of its objectives. Tap an objective to study it, or practice the whole domain |
| **Debug LED** next to each part | Blinks amber on your weakest domain and glows white once you've mastered 70% of a domain |
| **PWR** (orange button) | Starts a Quick 10: mixed questions weighted like the real exam, favoring ones you missed or haven't seen |
| **RST** | Reviews the questions you got wrong last time |
| **Q-code display** | Your overall accuracy. Tap it for the full POST report and to reset progress |
| **MODE switch** | STUDY gives instant feedback. EXAM turns PWR into a timed practice exam |
| **Masking tape** | Your exam date and countdown. Tap it to change the date |

Questions appear on a paper **inspection card**. Tap an answer to check it: you get a PASS or FAIL stamp, the right answer is circled, and a note explains why. The phone's Back gesture works everywhere.

**Exam Mode** looks like a plain testing screen on purpose. Choose 10 questions in 10 minutes or a full 90 questions in 90 minutes. You can flag questions and change answers, and you only see results after you submit (or when time runs out).

Progress is saved in your browser on each device. Your phone and computer keep separate progress.

On a computer you can answer with the keyboard: press `A`–`E` or `1`–`5`. Press `Enter` for "choose two" questions and `Esc` to go back.

## Adding questions

Questions live in `questions/`, one file per exam domain. Each file is JSON wrapped in `QUIZ.register(...)`. To add a question, copy an existing block and edit it:

```js
{
  "id": "net-023",
  "objective": "2.1",
  "question": "Which port does SSH use?",
  "choices": ["21", "22", "23", "25"],
  "answer": 1,
  "explanation": "SSH uses TCP 22."
}
```

- **`id`** must be unique and must never change, because your saved progress is linked to it. Continue the numbering in the file.
- **`answer`** is the position of the correct choice, **counting from 0** (the first choice is 0, the second is 1, and so on). For "choose two" questions, use a list like `[1, 2]`.
- Choices are shuffled when shown, so write them in any order.
- Put a comma between question blocks, but not after the last one.

If a question has a mistake (like a missing field or an `answer` that's out of range), the app skips it. A strip of tape appears on the board, and the POST report lists which question to fix.

To add a whole new file (for example, the Core 2 domains later), create it in `questions/` and add a matching `<script src="questions/...">` line in `index.html`.

## Files

```
index.html             the page
css/                   style.css (base), board.css, part.css, card.css, exam.css, fonts.css
js/engine.js           question data, picking, and stats
js/board.js            the motherboard home screen, boot sequence, and fly-in
js/part.js             a part's page: close-up and objectives datasheet
js/card.js             inspection cards, the report, and the POST receipt
js/exam.js             Exam Mode
js/app.js              screen routing and keyboard shortcuts
js/storage.js          saves progress in the browser
questions/             question bank, one file per domain
fonts/                 bundled fonts (see fonts/LICENSE.md)
icons/, manifest.json  home-screen icon and app settings
CLAUDE.md              project notes and the design rules
220-1201-objectives.pdf  CompTIA's official exam objectives
```

## Publishing with GitHub Pages

In the repository on GitHub, go to **Settings → Pages**. Under **Source**, choose **Deploy from a branch**, then pick the branch and the `/ (root)` folder, and click **Save**. The site will be at `https://nuccifalchi.github.io/aplus-quiz/` within a minute or two. It updates automatically on every push to that branch. If your phone shows an old version, refresh the page (or remove and re-add the home-screen icon).
