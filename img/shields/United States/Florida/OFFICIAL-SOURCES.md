# Florida official shield sources

The FDOT SVGs in `FDOT/` reconstruct the Florida State guide, Toll, and
Florida's Turnpike markers from the current FY 2026-27 FDOT Standard Plans,
Index 700-102, sheets 15 and 16. The source is the errata-incorporated edition
currently served by FDOT as of August 2026. The FDOT State catalogue contains
only guide-sign constructions; Freeway and Independent variants are excluded
because FDOT designates those two groups for independent use outside
SignMaker's overhead-sign scope. FDOT-specific U.S., Interstate, and County
variants are likewise excluded; the app's existing families remain unchanged.

- Current FDOT Standard Plans: https://www.fdot.gov/design/standardplans/current
- Current FDOT CADD files: https://www.fdot.gov/design/standardplans/current/dgns
- Current Index 700-102 with errata: https://fdotwww.blob.core.windows.net/sitefinity/docs/default-source/design/standardplans/2027/idx/700-102ee.pdf?sfvrsn=6c73990a_1
- FY 2026-27 revisions log: https://fdotwww.blob.core.windows.net/sitefinity/docs/default-source/design/standardplans/2027/fy2026-27revisionlog.pdf?sfvrsn=9a9c25fb_1
- Index 700-102 origination/FHWA review package: https://fdotwww.blob.core.windows.net/sitefinity/docs/default-source/design/standardplans/irr/2027/700-102fhwareviewpkg.pdf?sfvrsn=e0b83e60_1
- FY 2026-27 Industry Review package: https://fdotwww.blob.core.windows.net/sitefinity/docs/default-source/design/standardplans/irr/2027/700-102indreviewpkg.pdf?sfvrsn=998527d8_1

The fixed FDOT lettering, Florida ribbons, and Turnpike silhouettes come from
the plan's authored vector paths. The guide Florida ribbons are closed filled
compounds reconstructed from the distinct fixed and variable CADD polygons,
not browser strokes around an approximate centerline. Their CADD rail geometry
is retained while the 1.75-inch physical band and dimensioned 1.25-inch outer
clearance remain fixed for all three panel heights. Published inch dimensions
control view boxes, corner radii, ribbon widths, dividers, cap heights, and
placement. The 40x48 FDOT Toll illustration contains 36-inch-wide authored
content; it is centered with 2-inch side margins instead of being stretched to
40 inches.

FDOT State guide numerals use the specified Series D, physical cap height,
and dimensioned cap top. Guide-marker ink edges use the published `A-G` or `E`
location, measured from the rendered glyph bounds rather than the CSS text box.
Natural Roadgeek advances are retained with zero added tracking and kerning.
The official Series D spacing intentionally leaves a wider left space on the
digit `3`; these FDOT/CFX markers therefore do not use SignMaker's legacy
noninitial-`3` tightening rule.
FDOT publishes the 3-or-more-digit guide width as variable from 48 to 58
inches; it does not assign 53- and 58-inch widths to the 30- and 36-inch-high
markers. SignMaker intentionally limits this family to three-character route
legends because four-digit Florida routes are outside the app's scope. It still
starts with the official 48-inch-wide construction and uses the sheet's
dimension scheme for each supported numeral combination:
`width = clamp(48, 58, E + natural numeral ink width + G)`, where `E` is 1.25
inches and `G` is 8.25, 8.75, or 11 inches for the 24-, 30-, or 36-inch-high
marker. With the bundled Series D metrics, numeric three-character legends
remain 48 inches wide at 24-inch height, range from 48 to 50.2 inches at
30-inch height, and range from 48 to 52.45 inches at 36-inch height. The
published 58-inch ceiling is consequently retained as source geometry but is
unreachable for a numeric three-character legend. The Florida outline remains
anchored to the right-hand edge as the panel changes width.

All six guide constructions retain the rounded outer CADD contour. Its plotted
lineweight converts to approximately 1/8 inch using the dimensioned 1.25-inch
corner-radius scale; this is a CADD-display reconstruction, not a separately
published fabrication callout. The fixed 1-2-digit construction additionally
places a 5/8-inch physical black border on a centerline 5/8 inch inside the cut
edge. Its ink therefore spans 5/16 to 15/16 inch, leaving 5/16 inch of white
before the Florida ribbon begins at the dimensioned 1.25-inch outer rail. The
current final sheet does not restate the 5/8-inch width; that value is retained
from the issued FY 2025-26 sheet and the FY 2026-27 Industry Review detail. The
current 3-or-more-digit CADD construction has only the common outer contour and
no heavy inner border. At SignMaker's editor scale the physical 1/8-inch contour
is less than one CSS pixel, so the variable-width preview adds a one-pixel
display hairline above the seam cover. Export clones suppress that preview
hairline and retain the dimensioned 1/8-inch inline SVG contour as the
authoritative geometry.

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
