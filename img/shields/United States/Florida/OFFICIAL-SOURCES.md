# Florida official shield sources

The FDOT SVGs in `FDOT/` reconstruct the Florida State, Toll, and Florida's
Turnpike markers from the current FY 2026-27 FDOT Standard Plans, Index
700-102, sheets 15 and 16. The source is the errata-incorporated edition
currently served by FDOT as of August 2026. Newly created FDOT-specific U.S.,
Interstate, and County variants were intentionally removed; the app's existing
families remain unchanged.

- Current FDOT Standard Plans: https://www.fdot.gov/design/standardplans/current
- Current FDOT CADD files: https://www.fdot.gov/design/standardplans/current/dgns
- Current Index 700-102 with errata: https://fdotwww.blob.core.windows.net/sitefinity/docs/default-source/design/standardplans/2027/idx/700-102ee.pdf?sfvrsn=6c73990a_1
- FY 2026-27 revisions log: https://fdotwww.blob.core.windows.net/sitefinity/docs/default-source/design/standardplans/2027/fy2026-27revisionlog.pdf?sfvrsn=9a9c25fb_1
- Index 700-102 origination/FHWA review package: https://fdotwww.blob.core.windows.net/sitefinity/docs/default-source/design/standardplans/irr/2027/700-102fhwareviewpkg.pdf?sfvrsn=e0b83e60_1
- FY 2026-27 Industry Review package: https://fdotwww.blob.core.windows.net/sitefinity/docs/default-source/design/standardplans/irr/2027/700-102indreviewpkg.pdf?sfvrsn=998527d8_1

The fixed FDOT lettering, Florida ribbons, and Turnpike silhouettes come from
the plan's authored vector paths. Published inch dimensions control view boxes,
corner radii, ribbon widths, dividers, cap heights, and placement. The 40x48
FDOT Toll illustration contains 36-inch-wide authored content; it is centered
with 2-inch side margins instead of being stretched to 40 inches.

FDOT State live numerals use the specified Series C or D, physical cap height,
and dimensioned cap top. Guide-marker ink edges use the published `A-G` or `E`
location, measured from the rendered glyph bounds rather than the CSS text box.
Natural Roadgeek advances are retained with zero added tracking and kerning.
The official Series D spacing intentionally leaves a wider left space on the
digit `3`; these FDOT/CFX markers therefore do not use SignMaker's legacy
noninitial-`3` tightening rule.
The 3-or-more-digit guide width is published as variable from 48 to 58 inches;
FDOT does not assign 53- and 58-inch widths to the 30- and 36-inch-high
markers. SignMaker therefore starts with a 48-inch-wide construction and uses
the sheet's dimension scheme for each numeral combination:
`width = clamp(48, 58, E + natural numeral ink width + G)`, where `E` is 1.25
inches and `G` is 8.25, 8.75, or 11 inches for the 24-, 30-, or 36-inch-high
marker. The Florida outline remains anchored to the right-hand edge as the
panel changes width.

The 24x24 3-digit-cluster choice is also retained separately. It follows the
sheet's exception for a 3-digit route used in a sign cluster with other 24x24
panels and uses an 8-inch Series D numeral.

The current errata deliberately distinguishes the guide constructions. The
fixed 1-2-digit marker retains its physical black border; the immediately
preceding FY 2026-27 FDOT Industry Review sheet and the issued FY 2025-26 sheet
both specify that border as 5/8 inch. For the revised 3-or-more-digit marker,
FDOT removed both the border note and the thick CADD border while adding the
48-58-inch width rule. SignMaker therefore leaves the variable-width marker
borderless; the final detail's hairline rectangle is its drafting/cut edge, not
physical black ink. The final sheet does not separately dimension the fixed
marker's border inset, so its placement inside the cut edge is recorded as a
reconstruction rather than a new callout.

The current sheet retains physical borders on the independent-use State
markers but does not restate their width. SignMaker uses the last explicit FDOT
value of 5/8 inch for those borders as a continuity inference; it is not claimed
as a new FY 2026-27 callout. The dimensioned Florida ribbon widths remain exact:
1 inch for independent/freeway and 1.75 inches for guide markers. The state
centerlines are derived from the authored vector ribbon rails, then restroked
to those published widths; they are not claimed to be literal copies of a
single centerline path.

The sheet also leaves a few exemplar placements without independent numeric
callouts. The freeway horizontal anchor and independent-use centering follow
the current authored vectors; the four-digit freeway cap top extrapolates the
published seven-inch lower clearance; and the optional 24x24 three-digit
cluster uses the 30x24 row's eight-inch Series D treatment. These are recorded
as current-source reconstructions, not separately published dimensions.

The CFX SVGs in `CFX/` implement the 2026 Toll Route Shield TM and TM-ALT
details on sheets 5 and 6. The shell is built as a 0.75-inch white inset followed
by a 1-inch black border. The divider occupies y=11-12 inches on 36x48 shields
and y=13-14 inches on 48x60 shields. Each Florida ribbon is the exact authored
closed polygon; the 48x60 ribbon is approximately 1.25 inches wide rather than
being forced to the 36x48 shield's 1-inch width. The Series E `TOLL` outlines
are fitted to the published 6/8-inch cap heights and 21.8/29.0-inch widths.

- Current CFX design guidelines: https://www.cfxway.com/cfx-design-guidelines/
- 2026 CFX details: https://www.cfxway.com/wp-content/uploads/2026/03/2026-CFX-SPM-Design-Details.pdf

FDOT and CFX specify sign-film colors rather than RGB or hex values. CFX calls
for its designated orange film (3M EC Film Series 1174, or approved equal, with
Series 1170 clear). The SVG green, yellow, and orange values are therefore
screen approximations, not certified colorimetric values.

All fixed lettering is stored as paths. Live route numerals remain editable in
SignMaker. CFX numerals begin at standard Series D spacing and are optically
tightened only when the natural ink width exceeds the sheet's safe span, as
required by Note 1. The restored `Toll` variant under Florida's Turnpike is the
app's pre-existing legacy raster-backed composite; it is not presented as a new
sheet-15 FDOT construction and has no assigned official physical dimensions.
