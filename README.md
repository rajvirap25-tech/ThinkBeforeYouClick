# Think Before You Click

A responsive educational website about AI, social media, digital safety, and healthy digital habits. Built with HTML, CSS, and vanilla JavaScript.

## Open the website

Open `index.html` in Chrome, Edge, Firefox, or another modern browser. For a local server, open this folder in VS Code and use Live Server, or run `python -m http.server 8080` and visit `http://localhost:8080`.

## Files

- `index.html` contains the page structure and educational content.
- `css/style.css` contains styling and responsive layouts.
- `js/script.js` handles navigation, the simulated feed, daily checklist, self-assessment, quiz, and challenge.
- `assets/images/students.jpg` is the locally stored hero photograph.
- `ASSETS.md` records the photograph and font sources.

Checklist and challenge progress use browser localStorage. The daily checklist can be cleared with “Start a new day”. The challenge persists until reset. Private browsing or blocked storage may prevent persistence. Quiz and assessment answers last for the current page visit. No personal information is requested.

The website works without a build process. Google Fonts requires an internet connection. System fallback fonts work offline. The photo and all interactive code are local.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this project folder so `index.html` is in the repository root. Include the `css`, `js`, and `assets` folders.
3. Open the repository Settings, then Pages.
4. Choose “Deploy from a branch”, select your main branch and the root folder, and save.
5. Wait for GitHub to finish deployment, then open the URL shown in Pages.

All local asset paths are relative and support a GitHub Pages project URL. This delivered project has not been deployed.
