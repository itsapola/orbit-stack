# Orbit Stack

Mid-century-modern / space-age tap-to-stack game. React Native + Expo.

## Run it

```bash
npm install
npm start
```

Then scan the QR code with Expo Go (iOS/Android) or press `i` / `a` for a simulator.

## How it plays

Classic "moving block, tap to lock, overhang gets trimmed" mechanic (Stack-style):

- A block slides left-right at a fixed height on screen.
- Tap anywhere to drop it onto the block below.
- Only the overlapping portion survives — miss the alignment and the block narrows.
- Overlap within a small tolerance counts as **PERFECT** and builds a combo multiplier.
- Miss completely (zero overlap) or narrow the block past a minimum width → game over.
- High score persists locally via AsyncStorage.

## Project structure

```
App.js                     — screen state machine (menu / playing / gameover)
src/theme.js                — shared color palette (matches the locked MCM mockups)
src/screens/MenuScreen.js
src/screens/GameScreen.js   — core game loop, drop logic, scoring, camera scroll
src/screens/GameOverScreen.js
```

## Art status

Real illustrated art is now wired in throughout:

- `assets/objects/` — 14 individual object sprites now in rotation: the
  original 9 (toaster ×2, starburst clock, boomerang table ×2, UFO, pedestal,
  satellite ×2) plus 5 new ones extracted from a second tower composition
  (new toaster variant, new starburst clock variant, record turntable,
  console TV, round two-tier pedestal). The second batch was band-cropped out
  of a single fused illustration (the objects were drawn already connected
  into one tower, not as separate sprites), so there may be a small stray
  connector nub at a top/bottom edge on a couple of these — worth a visual
  pass before shipping.
- `assets/ui/score_badge_frame_empty.png` — a real empty 9-slice-style score
  frame (no baked-in number), now used for the score badge, high score badge,
  and game-over score card, replacing the coded rounded-rectangle box in all
  three places.
- `assets/ui/` also has TOPPLED lockup, NEW BEST badge, PLAY AGAIN button,
  MENU button (from the previous pass).

**One tradeoff worth knowing about:** the drop mechanic trims a block's
*width* based on overlap accuracy, down to a sliver if you're off-center.
`GameScreen.js` currently handles this by stretching each illustrated sprite
to fit the surviving width (`resizeMode="stretch"`) rather than cropping into
it — cropping into a hand-illustrated toaster or UFO face looks broken, but
stretching means a badly-placed drop will visibly squish the object rather
than slicing it. This is a reasonable placeholder-to-real-art step, not a
final answer. The cleaner long-term fix, per the original flag before art was
commissioned: flatten each object to a simpler silhouette that can be cropped
(not stretched) without losing readability, or cap the visual to 2-3 discrete
width states (full/half/sliver) with separate art for each.

**Not yet extracted / still needed:**
- Moon, stars, skyline strip, ground texture — exist as clean isolated art on
  a background/environment reference sheet you generated, not pulled into the
  project yet (currently coded as flat shapes/colors).
- ORBIT STACK wordmark and TAP TO PLAY button — same situation, exist on a
  title-screen sheet, not yet extracted.
- PERFECT pop badge and pause icon — exist on a UI element sheet; the pause
  icon in particular has no button wired into gameplay at all yet.
- A full-bleed 1024×1024 app icon and Android adaptive icon foreground —
  what you have has other sheet elements close to the edges, risky to crop
  cleanly; likely needs a fresh isolated generation rather than extraction.

## Known simplifications worth revisiting

- **No overhang "falling chunk" animation.** The trimmed-off piece just
  disappears. A falling/fading sliver would sell the "cut" moment better.
- **No sound/haptics.** Tap feedback (haptic on drop, distinct pitch per
  perfect streak) is a cheap addictiveness lever worth adding early.
- **Difficulty curve is linear** (speed ramps a fixed amount per block). Worth
  tuning against real playtesting rather than guessing.
- **Ad/IAP hooks aren't wired in.** Given the original goal was "high revenue
  from the start," the next real priority after art is likely a rewarded-ad
  continue ("watch an ad to keep your stack") and a cosmetic IAP hook (unlock
  alternate object sets — e.g. a "Tiki" or "Diner" skin) rather than more
  mechanic work.
