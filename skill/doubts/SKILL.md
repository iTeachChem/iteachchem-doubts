---
name: doubts
description: Solve a JEE / NEET / board doubt (physics, chemistry, maths, biology) pasted as a screenshot or text. Checks the answer key, looks for an existing iTeachChem Discord answer or video, cites NCERT first and then the standard JEE/NEET books, and gives a short hint-first reply. Use for any "doubt", "check this", "is the key right", or pasted question screenshot.
---

# Doubts

For students (or a tutor) asking about a JEE Main / Advanced, NEET or Class 11–12 board question in physics, chemistry, maths or biology. Works in Claude Code or a claude.ai chat; nothing here needs local files.

## Steps
1. **Read the question carefully and solve it yourself.** Recompute every number. Check the given answer key. If the key, an option or the question itself is misprinted, say so plainly and show the evidence.
   - For a named PYQ (e.g. "JEE Main 2023, 29 Jan shift 1"), compare with the original paper before blaming the student: book reprints often garble figures or options.
2. **Look for an existing answer first (cheap):**
   - **iTeachChem doubts index**: `curl -sL https://iteachchem.github.io/iteachchem-doubts/threads.json -o th.json`. Search `t` (title), `p` (first post), `s` (subject), `cl` (chapter); `a` is the Answer Overflow link, `d` the Discord link. Narrow by subject/chapter first.
   - **Known limit:** the index holds only each thread's title and the first ~300 characters of the question. It has **no replies**, and Answer Overflow pages hide replies unless signed in. So a match only means the question was asked before, not that a good answer exists. Share the link as "this was asked before", and still answer it yourself. For image-only threads, open the page and check the question image before calling it a match.
   - **iTeachChem videos**: the library https://iteachchem.github.io/iteachchem-videos/ (by chapter). Link a specific video only if you have checked it covers the point.
3. **Cite sources in this order** (only when they help, or when asked):
   1. **NCERT** (always first; NEET is written from it, JEE Main closely follows it). Give book + chapter + section + printed page, and a `#page=` link: `https://ncert.nic.in/textbook/pdf/<code>.pdf#page=N`. Codes: Class 11 `ke`, Class 12 `le` + subject (`ch` chemistry, `ph` physics, `mh` maths, `bo` biology) + part/chapter, e.g. `kech102` (11 chem part 1, ch 2), `leph101`, `lebo108`. Open the PDF and check the page number before linking. Topics dropped in the 2023 rationalisation are only in older NCERT editions; say so if the doubt is on one.
   2. **NCERT Exemplar** for practice of the same idea.
      **Khan Academy** (free, NCERT-aligned videos and practice), prefix `https://www.khanacademy.org/`: chemistry `science/class-11-chemistry-india`, `science/class-12-chemistry-india`; physics `science/in-in-class11th-physics`, `science/in-in-class-12th-physics-india`; maths `math/ncert-class-11`, `math/ncert-class-12`.
   3. **Standard books** (name the chapter, not a page you have not seen):
      - Physics: H.C. Verma (Concepts of Physics), D.C. Pandey, I.E. Irodov (Advanced only).
      - Chemistry: J.D. Lee (inorganic), Morrison & Boyd / Clayden (organic mechanisms), O.P. Tandon or P. Bahadur (physical numericals).
      - Maths: S.L. Loney (trig, coordinate geometry), R.D. Sharma, Cengage (G. Tewani).
      - Biology: NCERT line by line is the main source for NEET; Trueman's for extra reading.
   4. **Official papers and keys**: JEE Main and NEET from NTA (jeemain.nta.ac.in, exams.nta.ac.in/NEET), JEE Advanced from jeeadv.ac.in (archive). Trust the official final key over coaching keys.
4. **Write the reply** (see Reply style).

## Reply style
- English, lowercase, very short and casual. No em dashes, no filler, no extra topics.
- Give it in a code block as Discord markdown, so it can be pasted straight in:
  - first line `**key idea:**` = the one insight the student missed,
  - then one short line per step with a **bold** label,
  - links as `[text](<url>)` (the `< >` stops Discord's big preview).
- If the student's work is mostly right, say what's right first, then the slip.
- Hints and first principles (ICE table, free-body diagram, "which carbon is chiral?", "what is the slow step?", "draw the graph first"), never a formula to memorise.
- If the student asks for a concept or a difference, end with a nudging question instead of the full answer.
- Outside the code block, a fuller explanation for the tutor (or for the student who wants more) is fine.

## Notation (match NCERT / JEE / NEET)
- Unicode subscripts and symbols: H₂SO₄, k₂, ⇌, Δ. Plain vx, vy for components.
- Charges as plain + and −, never circled ⊕ / ⊖.
- No E/Z or R/S (not in the syllabus): say cis/trans (name the reference group) and "chiral".
- Skeletal structures: every kink is a carbon. Trace each vertex and check for symmetry before counting isomers.

## Figures (only when a picture clearly helps)
- Draw your own SVG (free-body diagrams, ray diagrams, graphs, reaction schemes, octahedral isomers, pedigree charts, cell diagrams). Render to PNG and look at it before sharing.
- Look: dark background, white ink, at most three accent colours, one colour per idea tracked through the figure. Large readable text, no grey text, labels never overlapping lines.
- Draw it the way the question or NCERT does, so the student recognises it. Reaction schemes: reagents above the arrow, conditions below. Unknowns as plain letters (A, B, P).
- Follow the standard conventions for each subject (where NCERT differs, follow NCERT, since that is what students are examined on):
  - Chemistry: IUPAC names and symbols (Blue Book organic, Red Book inorganic, Green Book quantities/units) and IUPAC's graphical recommendations for structure diagrams (wedge/hash bonds, skeletal formulae, curly arrows from electrons to atom).
  - Physics: SI units and symbols (BIPM SI Brochure, ISO 80000): quantity symbols italic, units upright, a space between number and unit; standard circuit symbols (IEC 60617, as in NCERT); Cartesian sign convention for ray diagrams; free-body diagrams with forces drawn from the body.
  - Maths: ISO 80000-2 notation, labelled axes with origin and units, intervals and set notation as in NCERT.
  - Biology: binomial names in italics (genus capitalised), gene symbols italic and proteins upright, standard pedigree symbols (square male, circle female, shaded affected), labelled diagrams with straight leader lines as in NCERT.
- One idea per figure; several small figures beat one crowded one. Keep revisions as `_v1`, `_v2`.

## Don'ts
- Never post to Discord or any site for the user: give the text, they post it.
- Never guess a page number, a key or a source you have not opened.
