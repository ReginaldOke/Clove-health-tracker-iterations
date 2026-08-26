# Clove — Health tracker iterations

Three live concepts for the Clove health goals screen, built as a shareable
prototype deck. Open the site and browse with the arrows (or arrow keys);
on a phone, swipe vertically. Every screen is a working prototype: swipe
the plates between goals, tick dinners off, add dinners from the recipe
picker, change the goal from the pencil.

**Live preview:** https://reginaldoke.github.io/Clove-health-tracker-iterations/

## The three concepts

1. **The dressed plate** — every goal is an illustrated plate (spinach and
   pepitas for iron, eggs for protein, citrus for energy) wearing its
   progress ring. Swipe the plate carousel to change goal; the whole page
   follows.
2. **The clean plate** — the calmest dial: the number rests on an empty
   plate between a set of cutlery, with the week chart front and centre.
3. **Fill your plate** — the concept that answers the feedback most
   directly. One clear focus with memory provenance ("Added from your
   voice note"), no numbers anywhere: the plate fills with food as
   dinners are cooked, and the other goals wait quietly as chips.

## The feedback these respond to

> How could we make the concept of a primary goal clearer? In your example
> the primary goal is iron, but that's not easy to see with the other
> measurements like protein and energy being reflected.

> The dial graphic is functional, but would there be a way to make the
> health goals screen feel more "on brand" for Clove, which isn't
> inherently a diet app? Possibly with a pinch more illustration.

## Running locally

Static site, no build. Serve the folder with anything, e.g.:

```
python3 -m http.server 4175
```

then open http://localhost:4175/. The full first-mile prototype this grew
out of lives at https://reginaldoke.github.io/Reg-Clove-Design-Challenge/.
