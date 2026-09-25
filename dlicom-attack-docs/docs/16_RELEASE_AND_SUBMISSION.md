# Release and Submission

## 1. Hosting

Recommended:
Vercel.

Build:
```bash
npm run build
```

Output:
`dist/`

---

## 2. Browser requirements

Verify:
- Chrome desktop
- Edge desktop
- Android Chrome
- Safari mobile if possible

---

## 3. First-load performance

Targets:
- initial bundle reasonable
- lazy load later chapter assets
- preload only current chapter
- compressed MP3 music and SFX, generated from reproducible WAV masters
- WebP/AVIF backgrounds where practical

---

## 4. Jam compliance

Final game must:

- be a new project
- work in browser
- contain no plagiarism
- contain no wallet connection
- request no seed phrase
- perform no transaction/payment
- collect no private data

Keep these rules in README.

---

## 5. Submission package

Prepare:

- game URL
- GitHub URL if public
- title
- one-sentence hook
- 3 screenshots
- 20–40 second gameplay clip
- feature list
- controls
- known limitations
- version number

The current media set is checked in under `artifacts/`: desktop home, mobile home, mobile battle, desktop skill draft, and a 26-second gameplay WebM with the existing Feed soundtrack. Start Vite and run `npm run capture:release` to refresh it from the current UI with a fixed demo seed; FFmpeg must be available via `PATH` or `FFMPEG_PATH` to mux the soundtrack. Review the clip manually before submission; the deployed game URL is also pending.

---

## 6. Suggested submission copy

### Title
**Dlicom Attack**

### Hook
Build an overpowered Dili, chain absurd Dlicom-themed skills, and fight through a corrupted social network in a fast browser roguelite.

### Short description
Dlicom Attack is an auto-battle roguelite built for the Dlicom AI Game Jam. Each run lets you create a different build using Packet attacks, Ban Hammer, Firewall, Viral chains, Moderation tools, Encryption, Crit, Combo and Rage. Defeat corrupted bots, survive elite encounters and take down the network bosses.

No wallet. No transactions. Just chaos.

---

## 7. Trailer structure

0–3 sec:
Dili + title.

3–8:
basic battle.

8–15:
skill selection.

15–25:
late-run crazy build.

25–32:
boss.

32–38:
victory/results.

End:
PLAY DLICOM ATTACK.

---

## 8. Final release checklist

- [ ] production build deployed
- [x] no uncaught app exceptions or unexpected console errors in automated Chromium, Firefox and WebKit flows (Firefox logs a filtered `Navigated away from page` cancellation on explicit test reloads)
- [x] save works (settings and upgraded equipment survive page reload)
- [x] fresh isolated browser-context test (equivalent storage isolation; physical incognito check remains useful)
- [x] chapter progression unlock behavior passes deterministic unit tests; all four chapter battle screens, chapter art, boss art and soundtracks load when unlocked
- [x] all four bosses are killable in deterministic simulations; CI now checks each chapter's median winning TTK target
- [x] runtime asset validator finds no missing or disallowed production assets; browser tests load each chapter's battle assets
- [x] music and SFX settings controls are present; music-volume setting persists across reload
- [x] mobile layouts fit documented phone viewports without page overflow
- [x] result screen and text/seed copy action work in the browser flow (clipboard is isolated by the test harness)
- [x] version `v0.2.0` is displayed in the game UI
- [ ] submission posted before deadline

The automated checks above verify the repository build and browser contexts. They do not substitute for production URL smoke testing, physical Android/iOS checks, human readability and pacing playtests, or posting the submission package.
