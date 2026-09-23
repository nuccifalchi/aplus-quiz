# A+ Core 1 Quiz (220-1201)

A phone-friendly practice quiz for the CompTIA A+ Core 1 exam. It's plain HTML, CSS, and JavaScript, so there's nothing to install.

## Open it

- **On a computer:** double-click `index.html`.
- **On a phone:** use the GitHub Pages link (see below), then choose *Add to Home Screen* so it opens like an app.

## Modes

- **Quick 10**: 10 mixed questions, weighted like the real exam and favoring questions you've missed or haven't seen yet.
- **Practice by domain**: every question in one domain.
- **Review missed**: questions you got wrong last time. Answer one correctly and it leaves the list.
- **Your stats**: accuracy per domain, recent quizzes, and a reset button.

Progress is saved in your browser on each device. Your phone and computer keep separate progress.

On a computer you can answer with the keyboard: press `A`-`E` or `1`-`5`, then `Enter` for the next question.

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

If a question has a mistake (like a missing field or an `answer` that's out of range), the app skips it and shows a notice on the home screen saying which one.

To add a whole new file (for example, the Core 2 domains later), create it in `questions/` and add a matching `<script src="questions/...">` line in `index.html`.

## Files

```
index.html          the page
css/style.css       styles (light and dark mode)
js/app.js           screens and quiz logic
js/storage.js       saves progress in the browser
questions/          question bank, one file per domain
icons/, manifest.json   home-screen icon and app settings
220-1201-objectives.pdf CompTIA's official exam objectives
```

## Publishing with GitHub Pages

In the repository on GitHub, go to **Settings → Pages**. Under **Source**, choose **Deploy from a branch**, then pick the branch and the `/ (root)` folder, and click **Save**. The site will be at `https://nuccifalchi.github.io/aplus-quiz/` within a minute or two. It updates automatically on every push.
