# Inventory - Adam Zuzo Profile v4 (Phase 0)

Source: `_source/design/Adam Zuzo Profile v4.dc.html` (1213 lines). All refs `v4:Lnnn`. No code written.
Breakpoint shorthand used below: **phone** = `isPhone` (<600), **mid** = `heroMid` (600-939), **navWide** (>=860), **desktop** = >=940. See section 2; these are NOT the brief's 860/1200.

## 1. Template syntax cheat-sheet

- `{{ path }}` - text hole or attribute value, resolved against `renderVals()` return merged over props. Whole-attribute hole passes the raw value (function -> event handler, ref object). `null`/boolean in text renders nothing. -> Astro `{expr}` (static) or vanilla-TS DOM update (dynamic).
- `<sc-if value="{{ x }}">` - children rendered only if truthy. -> `{x && ...}` for build-time values; for breakpoint flags use CSS media queries / `hidden` toggles; for state use a class toggle in TS.
- `<sc-for list="{{ arr }}" as="v">` - repeat children per item (`v`, `$index` in scope). -> `arr.map(v => ...)`.
- `hint-placeholder-val` / `hint-placeholder-count` - streaming-preview hints only. Ignore.
- `<image-slot id shape fit placeholder>` - user-fillable image; content comes from `design/.image-slots.state.json` keyed by `id` (`{u: dataURL, s, x, y}`). `shape="rect"` = no radius; `fit` default `cover` (`contain` on movephysiq-shot). -> plain `<img>`/Astro `<Image>` with `object-fit`, absolutely filling its wrapper.
- `style-hover="css"` - runtime emits `.cls:hover{css !important}`. Compiled once, statically: `{{ }}` inside it is NOT resolved (see 9).
- `ref="{{ name }}"` - React ref (`React.createRef()`), used for imperative `style.width/height/transform` writes in `onScroll`.
- `onClick` / `onMouseEnter` / `onMouseLeave="{{ fn }}"` - event handlers.
- `<helmet>` - goes into `<head>` (fonts, title, global `<style>`, v4:L10-34).
- `class Component extends DCLogic` (v4:L778) = React class component: `state`, `setState`, `componentDidMount/DidUpdate/WillUnmount`; `renderVals()` (v4:L920) returns every hole. Props: `data-props` on the script tag (v4:L777) declares `showGithub` (boolean, default `false`).
- `data-reveal`, `data-delay`, `data-screen-label` - plain attributes; first two drive reveal-on-scroll (v4:L862-871), the third is editor-only.

## 2. Breakpoints & state flags

### State (v4:L779)
| key | init | meaning |
|---|---|---|
| `work` | `{}` | map of per-card open flags: `mp`,`fd`,`pl`,`kb` (work), `e0`,`e1` (earlier), `c0`,`c1` (communities), `talk`, `s0`,`s1`,`s2` (stack groups) |
| `heroMid` | `false` | 600 <= innerWidth < 940 |
| `openOffer` | `-1` | accordion offer index (non-scrollMode) |
| `active` | `'top'` | active chapter id |
| `video` | `false` | YouTube facade replaced by iframe |
| `copied` | `false` | copy-email feedback (2200 ms) |
| `wide` | `false` | innerWidth >= 1340 (side rail) |
| `offer` | `0` | current offer in scroll slider |
| `scrollMode` | `false` | innerWidth >= 900 AND innerHeight >= 720 |
| `gh` | `null` | computed GitHub stats (null -> fallback) |
| `techTick` | `0` | +1 every 2200 ms |
| `archTick` | `0` | +1 every 400 ms |
| `navWide` | `true` | innerWidth >= 860 |
| `stackFilter` | `'all'` | DEAD (never rendered) |
| `stackOpen` | `null` | hovered stack tool id (`gkey+name`) |
| `stackPinned` | `null` | clicked stack tool id |
| `menu` (not in init) | undefined | phone/tablet section menu open (v4:L974-976) |
| `archPaused` (not in init) | undefined | set `true` by Prev/Next, never cleared (v4:L789, L1002) |

### Flags computed in `onResize` (v4:L848) - exact thresholds
- `wide` = `innerWidth >= 1340` -> side rail (v4:L38).
- `navWide` = `innerWidth >= 860`.
- `heroMid` = `innerWidth >= 600 && innerWidth < 940`.
- `scrollMode` = `innerWidth >= 900 && innerHeight >= 720`. Change triggers `onScroll`.

### Derived in `renderVals`
- `isPhone` / `ph` = `!navWide && !heroMid` -> **< 600 px** (v4:L1100, L1001, L1096, L1105, L1163, L1168).
- `notPhone` = `navWide || heroMid` -> >= 600 (v4:L1127).
- `heroWide` = `!heroMid` (phone OR >= 940) (v4:L1139).
- `showNavLinks` = `navWide`; `showMenuBtn` = `!navWide` (v4:L964, L974).
- `stackCompact` = `!navWide`; `stackWide` = `navWide` (v4:L1192).
- `compact` = `!scrollMode` (v4:L1089).
- Pause factor `k` in `applyPauses`: phone (<600) `0.12`, else `0.18` (v4:L875-876).

Effective bands (width): `<600` phone | `600-859` mid, menu button | `860-899` mid + navWide, accordion offers | `900-939` mid + navWide (+ slider if h>=720) | `940-1339` desktop | `>=1340` desktop + rail. Mobile Preview iframes: 390x844 (phone), 768x1024 (mid, menu button, accordion offers, stack accordion, desktop diagram in horizontal scroller).

### What each flag changes
| flag | markup effect |
|---|---|
| `wide` | side progress rail rendered (v4:L38-53) |
| `navWide` | nav pill links + 3 social icon buttons vs. `≡` menu button + dropdown (v4:L58-78); `navSub` shows `NN \| Label` when !navWide and active>0 (v4:L973); about photo min-height 520px / 260px(mid) / 130px(phone) (v4:L1094); MovePhysiQ shot 420/300/260px (v4:L1100); community `commFlex` `1 1 420px` vs `1 1 260px`, `commMinH` 340px vs 0, `commH3Mt` auto vs 0 (v4:L1102-1104); stack grid vs accordion (v4:L1192) |
| `heroMid` | hero two-column block with intro p + labelled socials + 4:5 photo at 40% (v4:L106-126) instead of top-row photo + bottom row (v4:L100-104, L127-148) |
| `isPhone` | hero: photo full width 21/9, slot top -30% (v4:L1131-1136), full-width CTA + 3-col labelled social grid (v4:L128-137), intro p left-aligned; work cards collapsed with short line + Show/Hide button; Fandom diagram -> mobile single-card + Prev/Next; communities/talk tap-to-expand; trusted-by rotates single logo; contact compact grid + short paragraph; pause k 0.12 |
| `notPhone` | "Specialized in" label (L92), tech-group row (L151-170), desktop social row + "What I offer ↓" (L138-145), about "IN SHORT" (L274), cert subtitle (L293), dark-card sublines (L312, L320), work category pills (L348, L370), "DATA FLOW ↓" (L371), desktop diagram (L400-481), community icon/role header + h3 (L557-560, L574), contact long paragraph + rows (L740, L754-765), footer tagline (L769). Also stats layout `statsDir` column vs row + divider direction (L1121-1125), `certBadge` `IN PROGRESS \| 2026` vs `IN PROGRESS` (L1120), `darkFlex` `1 1 260px` vs `1 1 100px` (L1126), `talkLbl`/`commLbl` full text vs `→` (L1128-1129), `aboutLinkDisp` (L1118), `commAlign` right vs left (L1106), `trustFlex` `1 1 0` vs `1 1 100%` (L1107) |
| `scrollMode` | services: section height `240vh`, inner `position: sticky; top: 84px` (L1091-1093); left card shows offer tablist + "SCROLL TO EXPLORE ↓" (L186-201) else "TAP AN OFFER TO SEE DETAILS ↓" (L183-185); right panel dark `#111111`, overflow hidden, track `row`, articles `0 0 100%`, full content; else transparent panel, column track gap 12px, accordion articles (`artPad` `14px 18px`) (L1076, L1084-1088) |

## 3. Sections in order

Page wrapper `<div style="min-height:100vh; position:relative">` v4:L36-775. Containers: `max-width: 1180px; margin: 0 auto; padding: 0 clamp(20px,4vw,40px) clamp(72px,9vw,120px)` (standard section).

### 3.0 Side rail (progress) - v4:L38-53
- `<aside aria-label="Page progress">` fixed `left: 26px; top: 50%`, z 40. Only when `wide` (>=1340).
- Track 1px `#DDD4C4`; fill ref `railFill` 1px `#111111`, `height: <scroll%>`, `transition: height .12s linear`.
- Per chapter (`chapters`, v4:L966-969): `<a href="#id">`, dot 9px (active/past fill+ring `#111111`, future fill `#FBF6EE` ring `#BDB6AA`), num `00..` Geist Mono 12px (active `#111111` else `#77716A`), label 13px opacity 1 only on active (`transition .3s`).

### 3.1 Header / nav + top progress bar - v4:L55-79
- `<header>` sticky `top: 14px`, z 50. `<nav>` pill: `rgba(245,238,226,0.82)` + `backdrop-filter: blur(14px)`, border `#E4DACA`, radius 999px, padding `8px 8px 8px 20px`.
- Logo link `#top`: `AZ` 32px tile (`#111111`, radius 10px) + "Adam Zuzo" + `navSub` 11px `#5C5850`.
- navWide: 4 pill links (`navItems`, v4:L955, L979): active bg `#111111` fg `#FBF6EE`, inactive transparent / `#4E4A44`; LinkedIn / Instagram / GitHub 38px round icon buttons.
- !navWide: menu button 40px (`≡` / `×`, `aria-label="Sections"`, `aria-expanded`), dropdown v4:L72-78 (all chapters, active row `#111111`, click closes menu).
- Always: "Book a call" CTA (Calendly) with `#7FC7A0` dot.
- Top progress bar: ref `barFill`, absolute bottom of nav, 2px `#111111`, `width: <scroll%>`, no transition (v4:L70).

### 3.2 Hero `#top` - v4:L82-171 (`scroll-margin-top: 0`)
- Status pill "Open to new projects" with pulsing `#2F7A55` dot (azPulse 2.6s) (L88).
- `<h1>` "Data & AI<br>Engineer", `clamp(46px,11vw,156px)`, lh .9, ls -.055em (L90).
- Specialty pills (L91-98): first filled `#111111`, others border `#CFC5B3`.
- Desktop (>=940) / phone: top-row photo (L100-104) `image-slot#hero-headshot`, grayscale(1) contrast(1.05), radius 14px. Desktop `flex 0 1 300px; max-width 320px; aspect 4/5`. Phone `flex 1 1 100%; aspect 21/9`, slot `top:-30%; height:auto; aspect 4/5`.
- Mid (600-939): L106-126 two columns: intro p 20px + CTA + 3-col labelled socials + "What I offer ↓"; photo `flex 0 0 40%` 4/5 (second `image-slot#hero-headshot`, mutually exclusive branch).
- Bottom row (phone / >=940) L127-148: phone CTA + 3-col social grid (min-height 48px); >=940 CTA + icon-only social pills (`liLabel`/`igLabel` = `''`, `socPad` 15px) + "What I offer ↓"; intro paragraph `max-width: 30ch`, right-aligned (left on phone).
- Tech-group row (notPhone) L151-170: 3 cards (`techGroups`), each `num | LABEL`, rotating active tool name, 5 icon circles (active: ring `#111111`, scale 1.12, opacity 1; others ring `#E4DACA`, opacity .75; `transition: transform .45s cubic-bezier(.2,.7,.2,1)`). Radius 28px.

### 3.3 Services / offers `#services` - v4:L174-253
- Left card (L177-202): "(01)", h2 "How I can<br>help you.", subline; compact hint or scrollMode tablist (3 `role="tab"` buttons with progress bars `barRefs[i]`, 3px).
- Right panel (L203-250): track `trackRef` holding 3 `<article role="tabpanel">` (`offers`).
  - scrollMode (full): FOR-pill (`#7FC7A0`, inner `#111111`/`#7FC7A0` "FOR"), `NN / 03`, h3 title, pitch + `<strong>` value, points list (32px white icon tiles, mono fallback), PROOF line, "Best way to reach me" + channel buttons (first filled cream, rest outlined `#3A3A3A`).
  - Accordion (!scrollMode): toggle button (num, `cTitle`, `cWho` green pill, 40px +/− circle); open -> `valueCap` p (17px 600), points, channels. Closed card `#FBF6EE` / border `#E4DACA`; open `#111111`.
- No image slots.

### 3.4 About `#about` - v4:L256-326
- Photo card (L259-270): `image-slot#about-photo`, grayscale(1), gradient overlay, "(02)", h2 "About me.", location pill, "Full experience" LinkedIn link (hidden on phone). min-height 520/260/130px.
- "IN SHORT" card (L273-276).
- Stats card (L279-288): "~50 TB /day" + "PB scale". Column w/ top divider (notPhone) or row w/ left divider (phone).
- Certifications (L289-302): AWS (devicon wordmark) solid card; Claude dashed `#D97757` card with pulsing badge `certBadge`.
- Two dark link cards -> `#community` (L306-321): "Active speaker" (mic icon) and "2 tech communities led" (Claude + AWS icons).

### 3.5 Work `#work` - v4:L329-534
- Header "(03)" / "Selected work." / "Real systems, real users, real scale." (L331-337).
- MovePhysiQ dark article (L339-365): `image-slot#movephysiq-shot` `fit="contain"` (L342) in `#222222` frame inset 14px; order 2 on phone; pills, h3, desc, `mpFeatures`, `mpStack`; phone toggle `wk.mp`.
- Fandom article (L368-501, border 1.5px `#111111`): pills, h3, desc, 3 metric chips, **data-flow diagram `<figure>`** (L381-494), `fandomStack` chips; phone toggle `wk.fd`.
  - Diagram desktop/mid (L400-481): horizontal, `min-width: 1040px` inside `overflow-x: auto`. Steps 01-02 (`archPre`), Airflow box with 03-05 (`archAir`), fork connector (L461-470), outputs 06a/06b (`archOutputs`). Step 05 carries the "Data Catalog / ALWAYS IN SYNC" glue box (always visible, dashed line azDash).
  - Diagram phone (L386-399): Airflow pill + one dark card showing current step (`archMob`).
  - Footer (L482-493): `archNow`, `archCaption`, 6 dot buttons; phone Prev/Next.
- Plugins card (L502-509, h4) and KB card (L510-517, h4, `#D97757` pulsing "In progress"); phone toggles `wk.pl`/`wk.kb`.
- Earlier cards (L518-531, `earlier`): label "Earlier | Onwelo" + FOR pill, h4, hook (phone collapsed), body + logo chips; phone toggles `e0`/`e1`.

### 3.6 Community `#community` - v4:L537-616 (Talk lives here)
- Header "(04)" / "Community." / two-line p (L539-545), right-aligned notPhone.
- Two community articles (`communities`, L548-583): phone header button (44px icon, name, hook, 38px +/−); notPhone icon tile + role pill + h3 name. Open content: photo (Claude: `assets/claude-community-poznan.jpeg` `<img>` `object-position: center 62%`, 16/9; AWS: `image-slot#aws-community-day` 16/9), body, links "Meetup ↗"/"Luma ↗".
- **Talk** article (L585-612): phone header (sodo.png, "SysOps/DevOps Polska", "Speaker | DataOps and costs"); YouTube facade 16/9 `flex 0 1 300px` (L594-605); meta "TALK | SYSOPS/DEVOPS POLSKA #659 | 2026", h3, description.

### 3.7 Stack `#stack` - v4:L619-691
- Header "(05)" / "Main tech stack." + "Currently exploring" dark pills (`exploring`).
- <860 (`stackCompact`, L633-665): 3 accordion groups (label, `06 tools`, peek of 6 icons, +/−); open -> rows (icon, name, sub, `+`/`−` mark), tap pins and shows "WHERE I USED IT".
- >=860 (`stackWide`, L666-689): 3-col grid; rows hover/click show "WHERE I USED IT" inline (dark row); hint "Hover or click a tool to see where I used it".

### 3.8 GitHub / Activity `#github` - v4:L694-721 - HIDDEN BY DEFAULT
- Rendered only when prop `showGithub` (default `false`, v4:L777, L965). Also removed from chapters (v4:L898).
- "(06)" / "Activity." / privacy note; contribution chart `<img src="https://ghchart.rshah.org/111111/azuzo99">`; `ghStats` cards (2 cards: dark total, light avg/day).

### 3.9 Trusted by (no id) - v4:L723-730
- `<section data-screen-label="Trusted by">`, bottom padding 12px only. Card `#FBF6EE` border `#E4DACA` radius 16. Label "WORKED WITH & TRUSTED BY"; masked container (`mask-image` 6%/94% fade) holding `trustMarquee` (React element built in JS, v4:L1108-1117).
- >=600: marquee row (list x2, gap 36px, `azMarquee 38s linear infinite`, pause on hover). Phone: single logo rotating with `techTick`, `azFadeUp .5s`.

### 3.10 Contact `#contact` + footer - v4:L733-773
- Dark card radius 20px, padding `clamp(24px,5vw,64px)`. "(07)", h2 "Let's talk." `clamp(56px,8vw,120px)`, paragraph (long notPhone / short phone), cream CTA "Book a free 45-min intro ↗".
- notPhone: 3 contact rows (`contacts`, label + sub + ↗) + copy-email row (`emailHint`, `emailAction`). Phone: 3-col icon grid + compact copy-email button.
- Footer row inside the card (L767-770): "© 2026 Adam Zuzo | Poznan / Warsaw, Poland" + tagline (notPhone). There is no separate `<footer>` element.

### Image-slot ids (`design/.image-slots.state.json`)
| slot id | used at | state file -> image | s / x / y | identical file |
|---|---|---|---|---|
| `hero-headshot` | v4:L102, L122 | webp 400x400, 7358 B | 1 / 0 / 0 | `site-assets/photos/hero-headshot.webp` (md5 match) |
| `about-photo` | v4:L261 | webp 946x1050, 17022 B | 1 / 0 / 0 | `site-assets/photos/about-photo.webp` |
| `movephysiq-shot` | v4:L342 (`fit="contain"`) | webp 1136x1070, 47444 B | 1 / 0 / 0 | `site-assets/photos/movephysiq-shot.webp` |
| `aws-community-day` | v4:L570 | webp 800x533, 56988 B | 1 / 0 / 0 | `site-assets/photos/aws-community-day.webp` |
All `s=1,x=0,y=0` -> no custom crop/zoom: centered `cover` (or `contain`). Only layout crops: hero phone 21/9 box with slot `top:-30%`; Claude jpeg `object-position: center 62%` (not a slot).

## 4. Interactions

| # | interaction | trigger | logic (lines) | timings / easing | reduced-motion in design |
|---|---|---|---|---|---|
| 1 | Offer scroll-pinning slider | scroll inside `#services` when `scrollMode` | `onScroll` v4:L823-838. `total = rect.height - innerHeight`; `p = clamp(-rect.top/total)`; `seg = min(2, floor(p*3))`; `s = min(1, p*3-seg)`; `t = clamp((s-.25)/.25)`; `e = t*t*(3-2t)` (smoothstep); `pos = seg<2 ? seg+e : 2`; `trackRef.style.transform = translateX(-pos*100%)`; `offer = seg<2 && s>=.5 ? seg+1 : seg`. Section 240vh, sticky top 84px | per third: hold 0-25%, slide 25-50%, hold 50-100%. No CSS transition (`trackTr: 'none'`) | none |
| 2 | Offer progress bars | same | v4:L835: bar i = 100% if i<seg; if i==seg: 100% when idx>seg else `s*100%`; else 0. Colour current `#7FC7A0`, others `#111111` (v4:L1077). Fallback L844 runs only outside scrollMode (bars not rendered there) | immediate | none |
| 3 | `selectOffer(i)` | click offer tab | v4:L900-911. scrollMode: `scrollTo(sectionTop + total*(i/3) + 4, smooth)`. Else: scroll to track child i minus 148px (unreachable: tabs only render in scrollMode) | `behavior: 'smooth'` | none |
| 4 | `openOffer` accordion | click offer card toggle (!scrollMode) | v4:L1076 `toggle`: `openOffer = openOffer===i ? -1 : i` (one open at a time); icon `+`/`−` | colour transition .3s | n/a |
| 5 | Active-section tracking | scroll (rAF-throttled) | v4:L815-822: line = `min(innerHeight*0.4, 360)`; last chapter whose `getBoundingClientRect().top <= line`; at bottom (`scrollTop >= max-2`) -> last chapter (contact). IntersectionObserver `this.io` (L856-859) is a no-op | - | n/a |
| 6 | Side rail + top bar fill | scroll | v4:L810-814: `pct = clamp(scrollTop/(scrollHeight-innerHeight))*100` (2 decimals) -> rail fill `height`, nav bar `width` | rail `height .12s linear`; dots/labels `.3s` | none |
| 7 | Sticky pauses `applyPauses` | mount+300 ms, ResizeObserver on section children, window resize, state changes (rAF + 400 ms) (v4:L852-854, L889-893) | v4:L873-888 for `about`,`work`,`community`,`stack`: `c = section.firstElementChild`; `content = c.offsetHeight - paddingBottom`; `avail = innerHeight - 96`; section `height = c.offsetHeight + round(innerHeight*k)`; `c` sticky, `top = content<=avail ? 90 + (avail-content)/2 : innerHeight - content - 16`. `k` = 0.12 phone (<600) else 0.18 | - | none |
| 8 | Reveal-on-scroll | mount | v4:L861-871: every `[data-reveal]` whose top >= 92% viewport gets `opacity:0; translate: 0 32px` and `transition: opacity .9s cubic-bezier(.2,.7,.2,1) <delay>ms, translate .9s <same> <delay>ms, transform .3s ease`; IO `rootMargin '0px 0px -8% 0px'`, `threshold .08` -> `opacity 1; translate 0 0`, unobserve. Only elements present at mount | .9s, delays from `data-delay` (0-300 ms) | none |
| 9 | Stack hover / pin / "Where I used it" (>=860) | mouseenter/leave, click on row | v4:L1193: id = `gkey+name`; enter -> `stackOpen=id`, leave -> null; click toggles `stackPinned`. Row open if `(stackPinned \|\| stackOpen) === id` (pinned wins: hover inert while something pinned). Open row bg `#111111`, sub `#BDB6AA` | `background .25s ease, color .25s ease` | n/a |
| 10 | Stack filter (`stackFilter`, `stackTabs`, `stackTiles`) | - | v4:L1187-1194 computed but NOT rendered; `techGroups[].go` (v4:L984) also unwired. **No filter exists in the visible design** | - | - |
| 11 | Stack phone/tablet accordion (<860) | tap group, tap tool | group: `work['s'+gi]` toggle (multi-open); tool: toggles `stackPinned` -> shows WHERE I USED IT; mark `+`/`−` | `background .3s, color .3s` | n/a |
| 12 | Phone tap-to-expand (<600) | tap toggle buttons | `work.mp/fd/pl/kb` (v4:L1096-1100) - collapsed shows short line `wkS`; labels "Show details"/"Hide details", icon `+`/`−`. `e0/e1` (L1163), `c0/c1` (L1168, `aria-expanded`), `talk` (L1105). Multiple can be open | instant | n/a |
| 13 | Section menu (<860) | tap `≡` | `menu` toggle (L975); item click closes (L976); `aria-expanded` = `menuOpenStr` | instant | n/a |
| 14 | Data-flow diagram loop | `setInterval` 400 ms (L789), skipped when `document.hidden` or `archPaused` | v4:L995-1041. `PER=10`, `N=6`: `st = floor(tick/10) % 6` (4 s per step, **24 s loop, 6 steps**), `sub = tick % 10`. Active step: scale 1.08, bg `#111111`, fg `#FBF6EE`, sub `#BDB6AA`, num `#111111`, shadow `0 18px 36px -18px rgba(17,17,17,0.55)`; idle: scale 1, `#FFFFFF`, border `#E4DACA`, sub `#5C5850`, num `#77716A`. Connector before active: green `#2F7A55` lines for `i < st`, else `#CFC5B3`; moving dot on connector `i === st-1` (`azDot 1.1s ease-in-out infinite`). Connectors exist after steps 01,02,03,04 (`hasNext`, L1018-1019). Airflow box active for st 2-4: border+pill `#7FC7A0`, fill `rgba(127,199,160,0.10)`; else border `#CFC5B3`, pill `#FBF6EE`. Step 06 (st 5): fork lines green, dots `azDotUp/azDotDown 1.3s`, outputs scale 1.06 and dark. Counter badge on 03: st<2 `00/24`; st==2 `pad(min(24, sub*3))/24` + ` ✓` when sub*3>=24; st>2 `24/24 ✓`. Version badge on 05: `v42` until st==4 && sub>=5, then `v43 ✓`. `archNow` = `NN / 06`. Dots: active width 26px `#111111`, else 8px `#CFC5B3`. Click step/dot/outputs -> `archTick = i*10` (no pause). Catalog dash `azDash .9s linear infinite` always running | transforms `.5s cubic-bezier(.2,.7,.2,1)`; bg/border/shadow `.5s ease`; dots `width .4s, background .4s` | none |
| 15 | Diagram mobile variant (<600) | same loop; Prev/Next buttons | L386-399, L487-492. Card shows `archMob` = current step (st<5) or the synthetic step 06 object (L1034). Pill text "Orchestrated by Apache Airflow" (st 2-4) else "Apache Airflow". Prev/Next `jump(±1)` (L1002): step wraps mod 6, sets `archPaused: true` (permanent) | - | none |
| 16 | `techTick` rotation | `setInterval` 2200 ms (L788) | hero tech groups: active index `(techTick + gi*2) % 5` (L984); phone trusted-by: `L[techTick % 8]` (L1114) | `.45s cubic-bezier(.2,.7,.2,1)` (icons), `opacity .3s` (name), `azFadeUp .5s ease both` (phone logo) | none |
| 17 | Trusted-by marquee (>=600) | always | L1115-1116: items duplicated once (`L.concat(L)`), `display:flex; gap:36; width:max-content; paddingRight:36`, `animation: azMarquee 38s linear infinite` (translateX 0 -> -50%); mouseenter pauses, mouseleave resumes | 38 s linear | none |
| 18 | Video facade | click "Play talk" | `playVideo` -> `video: true` (L1204); replaces button (bg `i.ytimg.com/vi/SE4vJdIIbGM/hqdefault.jpg`, grayscale, play disc, "51 MIN") with `<iframe src="https://www.youtube-nocookie.com/embed/SE4vJdIIbGM?autoplay=1">` (L596) | - | n/a |
| 19 | Copy email | click email row/button | `copyEmail` L913-918: `navigator.clipboard.writeText('zuzoadam@gmail.com')` -> `copied:true` for 2200 ms; on rejection or no Clipboard API -> `location.href = 'mailto:...'`. Labels: action `Copy` / `Copied ✓`, hint `Direct email` / `Copied to clipboard` (L1206-1207) | 2200 ms | n/a |
| 20 | Live GitHub stats | mount fetch (L791-804) | `GET https://github-contributions-api.jogruber.de/v4/azuzo99?y=last`; days with `date <= today`; `total` = sum; `cur` = trailing streak (today may be 0); `best` longest run; `week` = last 7; `avg` = (last 30 sum / 30).toFixed(1); `top` weekday by sum; `active` = days with count>0; `ytd` current-year sum. Errors swallowed. Only `total`, `active`, `avg` are rendered (L991-992) | - | n/a |
| 21 | Pulse dots | always | `azPulse` 2.6s (L88, L347, L511), 1.6s (cert badge L299) | ease-in-out infinite | none |

`prefers-reduced-motion`: **the design has no handling at all** (no media query, no `matchMedia`). `html { scroll-behavior: smooth; }` (L17) and all `behavior: 'smooth'` scrolls are unconditional. All reduced-motion behaviour must be added by us.

### GitHub fallback values (v4:L986, verbatim)
```js
const g = this.state.gh || { total: 1856, ytd: null, yr: String(new Date().getFullYear()), cur: 4, best: null, week: 68, avg: '5.1', top: 'Monday', active: null };
```
Rendered with fallback: card 1 `CONTRIBUTIONS | 12 MONTHS` value `1,856` (`toLocaleString('en-US')`), sub `incl. private work` (because `active` null; live: `<n> active days`); card 2 `AVG / DAY` value `5.1`, sub `last 30 days`.
`showGithub` prop default: `false` (v4:L777 `data-props`, L898, L965).

## 5. Data arrays (verbatim)

### `src/data/icons.ts` - icon map `I` + URL helpers (v4:L921-951)
```js
const si = (s) => 'https://cdn.simpleicons.org/' + s;
const dv = (p) => 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/' + p;
const I = {
  snowflake: { name: 'Snowflake', icon: si('snowflake'), mono: 'Sf' },
  dbt: { name: 'dbt', icon: 'assets/icons/dbt.svg', mono: 'dbt' },
  iceberg: { name: 'Iceberg', icon: 'assets/icons/iceberg.png', mono: 'Ib' },
  datahub: { name: 'DataHub', icon: 'assets/icons/datahub.svg', mono: 'Dh' },
  agents: { name: 'Agents', icon: 'assets/icons/agents.svg', mono: 'Ag' },
  rag: { name: 'RAG', icon: 'assets/icons/rag.svg', mono: 'Rg' },
  kb: { name: 'Knowledge bases', icon: 'assets/icons/knowledge.svg', mono: 'Kb' },
  aws: { name: 'AWS', icon: dv('amazonwebservices/amazonwebservices-original-wordmark.svg'), mono: 'aws' },
  spark: { name: 'Spark', icon: si('apachespark'), mono: 'Sp' },
  airflow: { name: 'Airflow', icon: 'assets/icons/airflow.png', mono: 'Af' },
  docker: { name: 'Docker', icon: si('docker'), mono: 'Dk' },
  claude: { name: 'Claude', icon: si('claude'), mono: 'Cl' },
  anthropic: { name: 'Anthropic', icon: si('anthropic'), mono: 'A\\' },
  mcp: { name: 'MCP', icon: si('modelcontextprotocol'), mono: 'mcp' },
  supabase: { name: 'Supabase', icon: si('supabase'), mono: 'Sb' },
  vercel: { name: 'Vercel', icon: si('vercel'), mono: '▲' },
  terraform: { name: 'Terraform', icon: si('terraform'), mono: 'Tf' },
  gha: { name: 'CI/CD', icon: si('githubactions'), mono: 'CI' },
  next: { name: 'Next.js', icon: si('nextdotjs'), mono: 'N' },
  ts: { name: 'TypeScript', icon: si('typescript'), mono: 'TS' },
  playwright: { name: 'Playwright', icon: dv('playwright/playwright-original.svg'), mono: 'Pw' },
  s3: { name: 'S3', icon: 'assets/icons/s3.svg', mono: 'S3' },
  emr: { name: 'EMR', icon: 'assets/icons/emr.svg', mono: 'EMR' },
  glue: { name: 'Glue', icon: 'assets/icons/glue.svg', mono: 'Gl' },
  redshift: { name: 'Redshift', icon: 'assets/icons/redshift.svg', mono: 'Rs' },
  lambda: { name: 'Lambda', icon: 'assets/icons/lambda.svg', mono: 'λ' }
};
const blank = (name, mono) => ({ name, icon: null, mono });
```

### `src/data/nav.ts` - chapters + nav items (v4:L897-898, L955)
```js
const all = [['top', 'Intro'], ['services', 'Services'], ['about', 'About'], ['work', 'Work'], ['community', 'Community'], ['stack', 'Tech stack'], ['github', 'Activity'], ['contact', 'Contact']];
return (this.props.showGithub ?? false) ? all : all.filter((c) => c[0] !== 'github');
const navIds = [['services', 'Services'], ['about', 'About'], ['work', 'Work'], ['community', 'Community']];
```
Chapter label strings (menu/rail): numbering `pad(i)` -> with `showGithub=false` Contact is `06`.

### `src/data/hero.ts` - tech groups (v4:L980-983)
```js
techGroups: [
  { num: '01', label: 'DATA', items: [I.snowflake, I.dbt, I.iceberg, I.spark, I.airflow] },
  { num: '02', label: 'AI', items: [I.claude, I.mcp, I.agents, I.rag, I.kb] },
  { num: '03', label: 'SYSTEM DESIGN', items: [I.aws, I.terraform, I.docker, I.supabase, I.vercel] }
```
Specialty pills (template L93-97): `Monetization`, `Ads data`, `Revenue analytics`, `Cloud costs`, `AI`.

### `src/data/offers.ts` - offers, channels (v4:L1048-1072 + fragments of L1076-1077)
```js
const CH = {
  cal: { label: 'Book a call', icon: 'assets/icons/calendly.svg', href: 'https://calendly.com/adam-zuzo' },
  li: { label: 'LinkedIn', icon: 'assets/icons/linkedin.svg', href: 'https://www.linkedin.com/in/adam-zuzo/' },
  ig: { label: 'Instagram', icon: 'assets/icons/instagram.svg', href: 'https://www.instagram.com/zuzo_adam/' },
  mu: { label: 'Meetups', icon: 'assets/icons/meetup.svg', href: 'https://www.meetup.com/claude_community_poznan/' }
};
const dark = { bg: '#111111', fg: '#FBF6EE', bd: '#111111', muted: '#BDB6AA', line: '#2E2E2E', tagBg: '#FBF6EE', tagFg: '#111111', tagBd: '#FBF6EE' };
const light = { bg: '#F1EADF', fg: '#111111', bd: '#E4DACA', muted: '#4E4A44', line: '#E4DACA', tagBg: '#FBF6EE', tagFg: '#111111', tagBd: '#E4DACA' };
const chans = (list, onDark) => list.map((c, i) => ({ ...c, bg: i === 0 ? (onDark ? '#FBF6EE' : '#111111') : 'transparent', fg: i === 0 ? (onDark ? '#111111' : '#FBF6EE') : (onDark ? '#FBF6EE' : '#111111'), bd: i === 0 ? 'transparent' : (onDark ? '#3A3A3A' : '#CFC5B3') }));
const apps = { ...dark, delay: '100', flex: '1.7 1 520px', num: '01', tag: 'Small businesses & solo founders', title: 'Personalized apps & automations that grow your business', pitch: 'You run the business, I build the software it runs on - from a client portal to a personalized app -', value: 'saving your time and letting you scale.', points: [
  { ...I.claude, t: 'AI-powered apps, assistants and automations' },
  { ...I.next, t: 'Web apps and client panels, installable on the phone' },
  { ...I.supabase, t: 'Backend, data and booking flows that just work' }
], proof: 'MovePhysiQ - a premium patient platform for a physiotherapy practice.', channels: chans([CH.cal, CH.ig, CH.li], true) };
const consult = { ...light, delay: '0', flex: '1.3 1 460px', num: '02', tag: 'Companies & data teams', title: 'Consulting', pitch: 'Senior help on the data behind your revenue - architecture, audits and hands-on delivery', value: 'that save you money and reduce technical debt.', points: [
  { ...I.snowflake, t: 'Monetization data: ads performance & revenue analytics' },
  { ...I.s3, t: 'Cloud cost optimization across storage and compute' },
  { ...I.agents, t: 'AI improvements: agents, knowledge bases, Claude rollouts' }
], proof: 'Brand-safety data for Fandom\u2019s dynamic ads | Enterprise migration to AWS Redshift', channels: chans([CH.li, CH.mu, CH.cal], true) };
const teach = { ...light, delay: '150', flex: '1 1 380px', num: '03', tag: 'Teams & individuals', title: 'Training & mentoring', pitch: 'I teach what I ship - real production experience', value: 'that gives you solid foundations and hands-on expertise.', points: [
  { ...I.claude, t: 'AWS + Claude workshops for engineering teams' },
  { ...I.aws, t: '1:1 mentoring for data engineers' },
  { ...I.kb, t: 'Career, architecture and certification prep' },
  { name: 'Talks', icon: 'assets/icons/presentation.svg', mono: 'Tk', t: 'Speaker & panelist at meetups and conferences' }
], proof: 'Led 18-person academy teams | Mentoring at Fandom | SysOps/DevOps Polska | AWS Community Day', channels: chans([CH.ig, CH.li], true) };
const list = [apps, consult, teach];
// v4:L1076 fragments
cTitle: ['Apps & automations', 'Consulting', 'Training & mentoring'][i]
cWho: ['Small business', 'Companies', 'Teams | people'][i]
valueCap: o.value ? o.value.charAt(0).toUpperCase() + o.value.slice(1) : ''
tgLabel: this.state.openOffer === i ? 'Hide details' : 'See what you get', tgIcon: this.state.openOffer === i ? '−' : '+'
// v4:L1077 fragments
title: ['Personalized apps & automations', 'Consulting', 'Training & mentoring'][i]
who: ['Small business', 'Companies', 'Teams | people'][i]
short: ['Apps', 'Consulting', 'Training'][i]
```
`dark`/`light` themes, `delay`, `flex` on offers are unused by the template.

### `src/data/work.ts` - MovePhysiQ features/stack, Fandom stack, earlier (v4:L1147-1162)
```js
mpFeatures: [
  { n: '01', t: 'Training plans imported straight from the therapist\u2019s Excel / Google Sheets' },
  { n: '02', t: 'Progress roadmap, curated knowledge library, guided onboarding' },
  { n: '03', t: 'Separate therapist and patient panels with role-based access' },
  { n: '04', t: 'Installable on the phone (PWA), Calendly booking, E2E-tested' }
],
mpStack: [I.next, I.ts, I.supabase, I.vercel, I.playwright],
fandomStack: [{ ...I.aws, name: 'EMR' }, I.spark, I.iceberg, I.dbt, I.snowflake, I.airflow],
earlier: [
  { delay: '0', title: 'Teradata \u2192 Redshift migration', hook: 'Client warehouse moved to AWS, validated table by table.', body: 'Moved a client warehouse to Redshift with tuned distribution and sort keys, plus Python data-quality tooling to validate every table.', logos: [
    { name: 'Teradata', icon: 'assets/icons/teradata.svg' }, { name: 'Informatica', icon: 'assets/icons/informatica.svg' },
    { name: 'AWS', icon: I.aws.icon }, { name: 'Redshift', icon: 'assets/icons/redshift-aws.svg' }
  ] },
  { delay: '100', title: 'Automated serverless data warehouse', hook: 'Serverless ETL that recovers from errors on its own.', body: 'Step Functions and Lambda orchestration with error-catching strategies and a lock that prevents concurrent ETL runs.', logos: [
    { name: 'AWS', icon: I.aws.icon }, { name: 'Lambda', icon: 'assets/icons/lambda-aws.svg' }, { name: 'Step Functions', icon: 'assets/icons/stepfunctions.svg' }
  ] }
```
Phone toggle labels (L1098): `'Hide details'` / `'Show details'`, icons `'−'` / `'+'`.

### `src/data/dataflow.ts` - diagram (v4:L996-1017, L1028-1036)
```js
const PER = 10, N = 6, st = Math.floor(this.state.archTick / PER) % N, sub = this.state.archTick % PER;
const icon = { gam: 'assets/icons/gam.png', gcloud: 'assets/icons/gcloud.png', s3: 'assets/icons/s3.svg', spark: 'https://cdn.simpleicons.org/apachespark', emr: 'assets/icons/emr.svg', ice: 'assets/icons/iceberg.png', athena: 'assets/icons/athena.svg', snow: 'https://cdn.simpleicons.org/snowflake', dbt: 'assets/icons/dbt.svg' };
const counter = st < 2 ? '00/24' : st === 2 ? String(Math.min(24, sub * 3)).padStart(2, '0') + '/24' + (sub * 3 >= 24 ? ' ✓' : '') : '24/24 ✓';
const ver = st < 4 || (st === 4 && sub < 5) ? 'v42' : 'v43 ✓';
const steps = [
  { num: '01', label: 'GAM ads data', icons: [icon.gam], sub: 'hourly logs' },
  { num: '02', label: 'Google Cloud Ads Data', icons: [icon.gcloud], sub: 'export' },
  { num: '03', label: 'Raw data storage', icons: [icon.s3], sub: 'Amazon S3', badge: counter },
  { num: '04', label: 'Big data processing', icons: [icon.spark, icon.emr], sub: 'Spark on EMR' },
  { num: '05', label: 'Data lakehouse', icons: [icon.s3, icon.ice], sub: 'Apache Iceberg', badge: ver, catalog: true }
];
const caps = [
  'Ad data lands every hour from Google Ad Manager.',
  'Hourly logs are exported to Google Cloud.',
  'Files are copied to S3 - the pipeline waits until all 24 hours are in.',
  'All 24 in: Airflow triggers Spark on EMR - ~50 TB a day, in parallel.',
  'Iceberg commits a new table version. Late fixes rewrite only what changed.',
  'Fresh data served to SQL analytics and revenue models in Snowflake + dbt.'
];
archOutputs: [
  { num: '06a', label: 'SQL queries & analytics', icons: [icon.athena] },
  { num: '06b', label: 'Revenue data models', icons: [icon.snow, icon.dbt] }
archNow: String(st + 1).padStart(2, '0') + ' / 06',
archMob: st < 5 ? mapped[st] : { num: '06', label: 'Analytics & revenue models', sub: 'Athena | Snowflake + dbt', icons: [icon.athena, icon.snow, icon.dbt] },
archMobAir: inAir ? 'Orchestrated by Apache Airflow' : 'Apache Airflow',
archHint: ph ? 'Tap Next to follow the data' : 'Click any step to jump to it',
```

### `src/data/community.ts` (v4:L1165-1167)
```js
communities: [
  { delay: '100', bg: '#F1EADF', fg: '#111111', bd: '#E4DACA', bd2: '#CFC5B3', muted: '#4E4A44', icon: I.claude.icon, role: 'Co-leader', hook: 'Co-leader | meetups for teams building with Claude', name: 'Claude Community Poznan', photo: 'assets/claude-community-poznan.jpeg', photoLabel: 'Claude Community Poznan meetup', body: 'Meetups for engineers building with Claude - agents, MCP, Claude Code in real teams.', links: [{ label: 'Meetup', href: 'https://www.meetup.com/claude_community_poznan/' }, { label: 'Luma', href: 'https://luma.com/claude-community-poznan' }] },
  { delay: '200', bg: '#F1EADF', fg: '#111111', bd: '#E4DACA', bd2: '#CFC5B3', muted: '#4E4A44', icon: I.aws.icon, role: 'Co-leader', hook: 'Co-leader | cloud meetups + AWS Community Day', name: 'AWS Poznan & Poland Community', hasPhoto: true, body: 'Bringing the local cloud ecosystem together to swap architecture horror stories and share cloud wins. I also co-organized AWS Community Day - a full-day conference for the Polish AWS community.', links: [{ label: 'Meetup', href: 'https://www.meetup.com/pl-pl/awsugpl/' }] }
```

### `src/data/stack.ts` - groups, items, "Where I used it" (v4:L1169-1184)
```js
stack: (this.__stack = [
  { name: 'Data', count: '06', delay: '0', flex: '1.5 1 520px', items: [
    { ...I.snowflake, sub: 'Warehouse' }, { ...I.dbt, sub: 'Modelling' }, { ...I.iceberg, sub: 'Lakehouse tables' },
    { ...I.aws, sub: 'EMR | Glue | Batch | Redshift | Lambda' }, { ...I.spark, sub: 'Distributed compute' }, { ...I.airflow, sub: 'Orchestration' }
  ] },
  { name: 'AI', count: '06', delay: '100', flex: '1 1 340px', items: [
    { ...I.claude, sub: 'API | Claude Code' }, { ...I.mcp, sub: 'Model Context Protocol' }, { ...I.agents, sub: 'Harnesses | swarms | plugins' },
    { ...I.rag, sub: 'Retrieval' }, { ...I.kb, sub: 'Semantic layers' }, { ...I.datahub, sub: 'Metadata catalog' }
  ] },
  { name: 'Apps & system design', count: '06', delay: '0', flex: '1 1 100%', items: [
    { ...I.aws, sub: 'Cloud architecture' }, { ...I.docker, sub: 'Containers' }, { ...I.supabase, sub: 'Backend | auth' }, { ...I.vercel, sub: 'Hosting' }, { ...I.terraform, sub: 'Infrastructure as code' }, { ...I.gha, sub: 'Pipelines' }
  ] }
]),
const W = {"Snowflake":"Revenue data models with dbt at Fandom","dbt":"Warehouse modelling for ads & revenue","Iceberg":"PB-scale lakehouse with versioned tables","AWS|data":"Literally everywhere - from migrations, through data platforms, up to hosting Docker apps","Spark":"~50 TB/day of ads data processed on EMR","Airflow":"Orchestrates multiple data pipelines - from hourly ads ingestion to daily revenue models","Docker":"Hosting containerized apps and batch jobs on AWS","Claude":"Almost everywhere - the core of my AI transformation work, from plugins to agents","MCP":"Own-built MCP servers plus tool integrations for agents","Agents":"Agent workflows and infrastructure at Fandom, plus my own ASDLC process","RAG":"Retrieval over company knowledge","Knowledge bases":"LLM knowledge base and semantic layer (in progress)","DataHub":"Metadata catalog for data discovery","AWS|apps":"Literally everywhere - from migrations, through data platforms, up to hosting Docker apps","Supabase":"MovePhysiQ backend, auth and storage","Vercel":"MovePhysiQ hosting and deploys","Terraform":"Infrastructure as code for data platforms","CI/CD":"Automated tests and deploys (Playwright E2E)"};
const groups = [['data', 'Data', 'DATA'], ['ai', 'AI', 'AI'], ['apps', 'System design', 'SYSTEM']];
```
Displayed group labels come from `groups[gi][1]` (`Data`, `AI`, `System design`); `this.__stack[].name`/`count`/`delay`/`flex` are unused. Lookup: `W[name + '|' + gkey] || W[name]`.
```js
exploring: ['Chatbots', 'ASDLC', 'Semantic layers'],
```

### `src/data/trusted.ts` - trusted-by logos (v4:L1109-1112)
```js
const e = React.createElement; const aws = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg';
const L = [['Fandom', 'https://cdn.simpleicons.org/fandom', 0], ['Fanatical', 'assets/icons/fanatical.png', 2], ['Onwelo', 'assets/icons/onwelo.png', 1], ['GE HealthCare', 'assets/icons/ge-healthcare.png', 2], ['Claude Community Poznan', 'assets/icons/claude-community-poznan.png', 3], ['AWS Poznan & Poland Community', aws, 0], ['AWS Community Day', 'assets/icons/aws-community-day.png', 4], ['SysOps/DevOps Polska', 'assets/icons/sodo.png', 1]];
```
Mode `m` (L1112): 0 -> img 22x22 contain; 1 -> img cover 100%; 2/3 -> 28x28 contain; 4 -> tile 96px wide, img contain 100%. Tile bg: m4 `#252D3D`, m3 `#F0F0F0`, else `#FFFFFF`; all tiles 36px high, radius 10, border `#E4DACA`. Name 16px / 600 / -.02em.

### `src/data/contact.ts` (v4:L1198-1202, L1206-1207)
```js
contacts: [
  { label: 'LinkedIn', icon: 'assets/icons/linkedin.svg', sub: 'Projects, consulting, recruiting', href: 'https://www.linkedin.com/in/adam-zuzo/' },
  { label: 'Instagram', icon: 'assets/icons/instagram.svg', sub: '1:1 mentoring & small-business projects', href: 'https://www.instagram.com/zuzo_adam/' },
  { label: 'GitHub', icon: 'https://cdn.simpleicons.org/github/111111', sub: '@azuzo99', href: 'https://github.com/azuzo99' }
],
emailAction: this.state.copied ? 'Copied \u2713' : 'Copy',
emailHint: this.state.copied ? 'Copied to clipboard' : 'Direct email'
```

### `src/data/github.ts` - stat card labels (v4:L988-992)
```js
const L = { bg: '#F1EADF', fg: '#111111', bd: '#E4DACA', muted: '#5C5850' };
const D = { bg: '#111111', fg: '#FBF6EE', bd: '#111111', muted: '#BDB6AA' };
return [
  { ...D, delay: '0', flex: '1.4 1 260px', label: 'CONTRIBUTIONS | 12 MONTHS', value: fmt(g.total), sub: g.active ? fmt(g.active) + ' active days' : 'incl. private work' },
  { ...L, delay: '160', flex: '1 1 180px', label: 'AVG / DAY', value: g.avg, sub: 'last 30 days' },          
```

### Dead data (computed, never rendered) - keep out of the build unless asked
```js
// v4:L957-961 mqRows (local const, unused)
const mqRows = [
  { num: '01', label: 'Data', items: [I.snowflake, I.dbt, I.iceberg, I.spark, I.airflow, I.emr, I.glue, I.s3, I.redshift], dur: 46, dir: 'azMarquee' },
  { num: '02', label: 'AI', items: [I.claude, I.anthropic, I.mcp, I.agents, I.rag, I.kb, I.datahub], dur: 40, dir: 'azMarqueeR' },
  { num: '03', label: 'System design', items: [I.aws, I.lambda, I.docker, I.terraform, I.gha, I.supabase, I.vercel, I.next, I.ts], dur: 52, dir: 'azMarquee' }
];
// v4:L1042-1046
aboutTags: ['Monetization', 'Ads performance', 'Revenue analytics', 'Cloud costs', 'AI'],
statsTop: [
  { n: '~50 TB', l: 'of data processed per day', delay: '150' },
  { n: 'AWS ×3', l: 'certifications', delay: '250' }
],
// v4:L1142-1146 services
services: [
  { delay: '0', bg: '#111111', fg: '#FBF6EE', bd: '#111111', muted: '#BDB6AA', line: '#2E2E2E', title: 'Monetization data platforms', body: 'Ads performance and revenue analytics on AWS - pipelines and lakehouses at TB/day that show where revenue comes from and how to grow it.', metric: 'PB-scale', proof: 'Iceberg lakehouse for ads & revenue data - EMR, Spark, dbt, Snowflake', logos: [I.aws, I.spark, I.snowflake] },
  { delay: '100', bg: '#F1EADF', fg: '#111111', bd: '#E4DACA', muted: '#4E4A44', line: '#E4DACA', title: 'Cloud cost optimization', body: 'I find where the money escapes - storage layout, file formats, compute, warehouse tuning - and cut it without slowing anything down.', metric: 'Less waste', proof: 'Redshift optimization for Fanatical; public talk on cloud costs', logos: [I.aws, I.s3, I.emr, I.glue] },
  { delay: '200', bg: '#F1EADF', fg: '#111111', bd: '#E4DACA', muted: '#4E4A44', line: '#E4DACA', title: 'AI applications & agents', body: 'Production AI apps, agent workflows and knowledge bases that move business metrics - plus Claude rollouts for your whole team.', metric: 'Shipped', proof: 'MovePhysiQ; company-wide Claude plugin marketplace at Fandom', logos: [I.claude, I.mcp, I.supabase] }
],
// v4:L1164
trainLogos: [I.claude, I.mcp, I.aws, I.anthropic],
```

### Static template copy (decoded text nodes + alt/aria-label/title; `{{ }}` holes omitted; `&` must be written `&amp;` in HTML)
Whitespace inside each node is collapsed here; one node is split across tags per line. Watch leading spaces at tag boundaries in the source, e.g. `~50 TB<span> /day</span>` (L281), `PB<span> scale</span>` (L285), `{{ o.pitch }} <strong>` (L224), `<span>↗</span>` after "Book a free 45-min intro " (L111, L130, L139).
```text
v4:L39  [aria-label] Page progress
v4:L57  AZ
v4:L57  Adam Zuzo
v4:L64  [aria-label] LinkedIn
v4:L65  [aria-label] Instagram
v4:L66  [aria-label] GitHub
v4:L67  [aria-label] Sections
v4:L68  Book a call
v4:L88  Open to new projects
v4:L90  Data & AI
v4:L90  Engineer
v4:L92  Specialized in
v4:L93  Monetization
v4:L94  Ads data
v4:L95  Revenue analytics
v4:L96  Cloud costs
v4:L97  AI
v4:L109  Hi, I'm Adam - a monetization data engineer. I turn ads and revenue data into platforms that help companies grow monetization, and build AI apps on top - without a scary cloud bill.
v4:L111  Book a free 45-min intro
v4:L111  ↗
v4:L113  LinkedIn
v4:L114  Instagram
v4:L115  GitHub
v4:L117  What I offer ↓
v4:L130  Book a free 45-min intro
v4:L130  ↗
v4:L132  LinkedIn
v4:L133  Instagram
v4:L134  GitHub
v4:L139  Book a free 45-min intro
v4:L139  ↗
v4:L141  [aria-label] LinkedIn
v4:L142  [aria-label] Instagram
v4:L143  [aria-label] GitHub
v4:L144  What I offer ↓
v4:L146  Hi, I'm Adam - a monetization data engineer. I turn ads and revenue data into platforms that help companies grow monetization, and build AI apps on top - without a scary cloud bill.
v4:L179  (01)
v4:L180  How I can
v4:L180  help you.
v4:L181  Three ways to work together. Pick the one that fits.
v4:L184  TAP AN OFFER TO SEE DETAILS ↓
v4:L188  [aria-label] Offers
v4:L198  SCROLL TO EXPLORE ↓
v4:L220  FOR
v4:L236  PROOF
v4:L238  Best way to reach me
v4:L264  (02)
v4:L265  About me.
v4:L267  Poznan / Warsaw | remote-friendly
v4:L268  Full experience
v4:L274  IN SHORT
v4:L275  I work on the ads and revenue data that tell a business where its money comes from - then make it faster, cheaper and AI-ready.
v4:L281  ~50 TB
v4:L281  /day
v4:L282  of data processed
v4:L285  PB
v4:L285  scale
v4:L286  of lakehouse data stored
v4:L290  CERTIFICATIONS
v4:L292  [alt] AWS
v4:L293  AWS Certified Architect
v4:L293  with Data Analytics - Specialty
v4:L296  [alt] Claude
v4:L298  Claude Certified Architect
v4:L311  Active speaker
v4:L312  SysOps/DevOps Polska | AWS Community Day | community meetups
v4:L319  2
v4:L319  tech communities led
v4:L320  Claude Community Poznan | AWS Poznan & Poland Community
v4:L333  (03)
v4:L334  Selected work.
v4:L336  Real systems, real users, real scale.
v4:L347  In progress
v4:L348  AI application | HealthTech
v4:L349  FOR
v4:L349  Small businesses & solo founders
v4:L351  MovePhysiQ
v4:L352  Patient platform for a physiotherapy practice.
v4:L352  A premium patient platform for a physiotherapy practice. One calm system replaces spreadsheets for the patient - and gives the therapist a single place to run the whole collaboration.
v4:L370  Data platform | AdTech
v4:L370  FOR
v4:L370  Enterprises & consulting
v4:L371  DATA FLOW ↓
v4:L373  Ads & Revenue Data Platform @ Fandom
v4:L374  The ads & revenue data monetization teams run on.
v4:L375  Ads performance and revenue data at TB/day scale for one of the world's largest entertainment platforms - the numbers monetization teams run on. Brand-safety data feeds dynamic ads that grow ad revenue - with monitoring that keeps the reporting stack healthy.
v4:L377  ~50 TB/day
v4:L377  ads & revenue data
v4:L378  PB scale
v4:L378  lakehouse storage
v4:L379  Brand safety
v4:L379  data for dynamic ads
v4:L383  HOW THE DATA FLOWS
v4:L417  Data Catalog
v4:L417  ALWAYS IN SYNC
v4:L431  Orchestrated by Apache Airflow
v4:L447  Data Catalog
v4:L447  ALWAYS IN SYNC
v4:L471  [aria-label] Go to step 06
v4:L489  ← Previous
v4:L490  Next →
v4:L503  AI platform | Internal tooling
v4:L503  FOR
v4:L503  Small businesses & solo founders
v4:L503  FOR
v4:L503  Enterprises & consulting
v4:L504  Claude Plugins Marketplace @ Fandom
v4:L505  Same AI tooling and guardrails for every engineer.
v4:L506  A company-wide marketplace of Claude Code plugins - skills, hooks and MCP servers that any team installs in one command.
v4:L506  Every engineer gets the same AI tooling and guardrails.
v4:L507  Claude Code
v4:L507  MCP
v4:L507  Plugins & skills
v4:L511  AI | Knowledge
v4:L511  In progress
v4:L511  FOR
v4:L511  Small businesses & solo founders
v4:L511  FOR
v4:L511  Enterprises & consulting
v4:L512  AI Knowledge Base @ Fandom
v4:L513  Business context, ready for AI.
v4:L514  An LLM knowledge base and semantic layer over company data, so agents and people get the same trusted answers.
v4:L514  Business context, ready for AI.
v4:L515  Claude
v4:L515  Semantic layer
v4:L515  RAG
v4:L520  Earlier | Onwelo
v4:L520  FOR
v4:L520  Enterprises & consulting
v4:L541  (04)
v4:L542  Community.
v4:L544  Bringing Poznan's cloud & AI builders together.
v4:L544  Where I learn & teach - the same people skills I bring to your team.
v4:L564  [alt] Claude Community Poznan meetup group photo
v4:L571  AWS Community Day
v4:L588  [alt] SysOps/DevOps Polska
v4:L589  SysOps/DevOps Polska
v4:L589  Speaker | DataOps and costs
v4:L596  [title] DataOps and costs: operational data challenges
v4:L599  [aria-label] Play talk
v4:L602  51 MIN
v4:L607  TALK | SYSOPS/DEVOPS POLSKA #659 | 2026
v4:L608  DataOps and costs: operational data challenges
v4:L609  Where money escapes in AWS data systems - and the architecture decisions that actually move the bill: S3 layout, file formats, Iceberg, and compute choices.
v4:L623  (05)
v4:L624  Main tech stack.
v4:L627  Currently exploring
v4:L657  WHERE I USED IT
v4:L681  WHERE I USED IT
v4:L688  Hover or click a tool to see where I used it
v4:L699  (06)
v4:L700  Activity.
v4:L702  Most of my work lives in private repositories - client privacy is my standard.
v4:L706  CONTRIBUTIONS | LAST 12 MONTHS
v4:L707  [alt] azuzo99 contribution graph
v4:L726  WORKED WITH & TRUSTED BY
v4:L738  (07)
v4:L739  Let's talk.
v4:L740  45 minutes, free, no slides. Bring your idea or challenge - an app for your business, a slow pipeline, a scary AWS bill, a team to train - and leave with a clear next step.
v4:L741  45 minutes, free, no slides. Bring your challenge - leave with a clear next step.
v4:L742  Book a free 45-min intro ↗
v4:L751  zuzoadam@gmail.com
v4:L758  ↗
v4:L762  zuzoadam@gmail.com
v4:L768  © 2026 Adam Zuzo | Poznan / Warsaw, Poland
v4:L769  One part data engineer, one part cloud cost-cutter, full-time problem solver.
```

## 6. Design tokens actually used

### Colours (occurrence counts across the whole file, template + logic)
| value | count | role |
|---|---|---|
| `#111111` | 155 | ink, dark surfaces, primary buttons, active states |
| `#FBF6EE` | 103 | page bg (body), text on dark, light pills |
| `#E4DACA` | 71 | default border |
| `#FFFFFF` | 36 | icon tiles, white diagram nodes, cert card |
| `#5C5850` | 35 | secondary muted (mono labels, sublines) |
| `#F1EADF` | 29 | card bg |
| `#7FC7A0` | 28 | accent green: FOR pills, active bar, Airflow active, "Where I used it" label |
| `#4E4A44` | 24 | body muted, inactive nav text |
| `#BDB6AA` | 19 | muted text on dark, rail future ring |
| `#CFC5B3` | 16 | strong border, inactive diagram lines/dots, phone toggles |
| `#2F7A55` | 16 | deep green: status dots, diagram flow, catalog |
| `#77716A` | 10 | tertiary muted: rail nums, `NN / 03`, contact subs, footer |
| `#E9E1D3` | 9 | hover bg (social pills, contact CTA), photo placeholder bg |
| `#2E2E2E` | 6 | dividers on dark |
| `#2A2A2A` | 6 | borders on dark (contact), about photo bg |
| `#1C1C1C` | 6 | contact rows on dark, dark card hover |
| `#262626` | 5 | icon tile on dark, contact hover, Claude photo bg |
| `#D97757` | 3 | Claude orange: cert dashed border + badge, KB "In progress" dot |
| `#CFC8BC` | 3 | body text on dark (MovePhysiQ, contact) |
| `#3A3A3A` | 3 | outlines on dark |
| `#333333` | 3 | dark button hover |
| `#DDD4C4` | 1 | rail track |
| `#EAE2D4` | 1 | Claude cert icon tile |
| `#E6DDCE` | 1 | AWS photo placeholder |
| `#F0F0F0` | 1 | trusted tile (m3) |
| `#252D3D` | 1 | trusted tile (AWS Community Day) |
| `#222222` | 1 | MovePhysiQ shot frame |
| `#000` | 4 | mask gradient stops only |
| `8C857A` | 1 | inside simpleicons URL (`claude/8C857A`), not CSS |
| `rgba(17,17,17,0.55)` | 3 | active node shadow (x2 in JS), about overlay top |
| `rgba(17,17,17,0)` | 3 | gradient stops |
| `rgba(17,17,17,0.7)` | 2 | gradient bottoms (about, video) |
| `rgba(17,17,17,0.35)` | 1 | menu dropdown shadow |
| `rgba(245,238,226,0.82)` | 1 | nav bg (= `#F5EEE2`, off-palette) |
| `rgba(251,246,238,0.7)` | 1 | nav links pill bg |
| `rgba(251,246,238,0.97)` | 1 | menu dropdown bg |
| `rgba(127,199,160,0.10)` | 1 | Airflow box active fill |
(`#659` in "POLSKA #659" is copy, not a colour.)

**vs brief (CLAUDE_CODE_PROMPT.md:L25-29):** all brief tokens exist and roles match. Missing from brief but used: `#FFFFFF`, `#77716A`, `#E9E1D3`, `#D97757`, `#CFC8BC`, dark greys `#1C1C1C #222222 #262626 #2A2A2A #2E2E2E #333333 #3A3A3A`, one-offs `#DDD4C4 #EAE2D4 #E6DDCE #F0F0F0 #252D3D`, nav `rgba(245,238,226,.82)`. Brief radii "20-24px large panels": only 20px used (contact, Airflow box, menu); no 24px; 28px used on hero tech-group cards.

### Typography
- Families: `'Schibsted Grotesk', system-ui, sans-serif` (body); `'Geist Mono', monospace` (labels/nums). Google Fonts URL loads Schibsted 400/500/600/700 + italic 400/500, Geist Mono 400/500 (L13).
- Weights used: 400 (default + 1 explicit), 500 (100x), 600 (11x). **700 and italics are loaded but never used.**
- Fixed sizes (count): 12px (77), 13px (29), 16px (28), 14px (25), 15px (9), 17/20/22px (5 each), 11px (5), 9px (4), 10px (3), 28px (3), 18/19px (2), 21px (1), `.45em` unit suffix (2), JS 16 (trusted names).
- `clamp()` sizes: h1 `clamp(46px,11vw,156px)`; contact h2 `clamp(56px,8vw,120px)`; work/community/stack h2 `clamp(48px,6vw,88px)` x3; services h2 `clamp(38px,5.4vw,72px)`; about h2 `clamp(40px,5.4vw,72px)`; activity h2 `clamp(40px,4.6vw,64px)`; MovePhysiQ h3 `clamp(40px,4.4vw,60px)`; Fandom h3 `clamp(36px,4.4vw,60px)`; offer h3 `clamp(28px,4vw,54px)`; stat numbers `clamp(26px,4vw,54px)` x2; gh value `clamp(34px,3.4vw,48px)`; "2" `clamp(28px,4vw,40px)`; h4 `clamp(24px,2.4vw,30px)` x2; community h3 `clamp(22px,3vw,48px)`; dark-card titles `clamp(19px,2.4vw,24px)` x2; about p `clamp(16px,1.8vw,22px)`; hero p `clamp(16px,1.5vw,20px)`; caption `clamp(16px,1.5vw,19px)`; FOR tag `clamp(15px,1.4vw,18px)`; cert titles `clamp(15px,1.6vw,16px)` x2; pitch `clamp(15px,1.4vw,16px)`; community body `clamp(14px,1.5vw,16px)`; points `clamp(14px,1.3vw,15px)`; pills/stat labels `clamp(13px,1.4vw,14px)` x7. Spacing also uses clamp widely (paddings, gaps).
- Letter-spacing: headings -.045/-.05/-.055em; mono labels .06em. Line-heights from .9 to 1.6.

### Radii
999px pills (71), 50% circles (23), 16px cards (22), 12px (20), 14px (13), 10px (9 + JS 10), 3px (7, icon imgs), 20px (3), 8px (2), 4px (2), 28px (1), 9px (1), 6px (1), 0 (1).

### Shadows
`0 18px 36px -18px rgba(17,17,17,0.55)` (active diagram node/output, JS L1018/L1031); `0 18px 40px -20px rgba(17,17,17,0.35)` (menu dropdown L73). Mobile Preview frame only: `0 30px 60px rgba(17,17,17,.25)`.

### Widths / layout
Container `max-width: 1180px` (12x). Text measures: 30ch (hero p), 32ch x2, 36ch x2, 40ch, 44ch x2, 52ch, 64ch, 18ch (Fandom h3). Icon max-widths 44/56/60px. Diagram `min-width: 1040px`. Sticky header top 14px; section `scroll-margin-top: 96px` (L22); offers article `scroll-margin-top: 150px`.

### Keyframes (L23-32)
`azMarquee` (defined twice, L23 and L32, identical), `azPulse`, `azPopIn` (unused), `azDash`, `azDot`, `azDotUp`, `azDotDown`, `azFill` (unused), `azFadeUp`, `azMarqueeR` (only dead `mqRows`).

## 7. External URLs

### (a) Download into the repo at build time
- Fonts: `https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Geist+Mono:wght@400;500&display=swap` (+ preconnects `https://fonts.googleapis.com`, `https://fonts.gstatic.com`) -> replace by `@fontsource` (brief).
- simpleicons (`https://cdn.simpleicons.org/<slug>[/<hex>]`), rendered: `claude` (L316, L507, L515, L565, I.claude), `claude/8C857A` (L296), `github/111111` (L66, L115, L134, L143, L1201), `modelcontextprotocol` (L507, I.mcp), `snowflake` (I.snowflake, diagram L997), `apachespark` (I.spark, diagram L997), `docker`, `supabase`, `vercel`, `terraform`, `githubactions`, `nextdotjs`, `typescript` (I map), `fandom` (trusted L1110). Only in dead code: `anthropic`.
- jsDelivr devicon: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg` (L292, L316, L571, L931, L1109) and `.../playwright/playwright-original.svg` (L944). **Uses `@latest` - pin an exact devicon version when downloading.**
- YouTube thumbnail `https://i.ytimg.com/vi/SE4vJdIIbGM/hqdefault.jpg` (L599) - brief forbids third-party runtime requests -> download/optimize at build.
- `https://ghchart.rshah.org/111111/azuzo99` (L707, Activity section only) - either snapshot at build (stale) or allow at runtime; decide (see 9).

### (b) Runtime requests allowed
- `https://github-contributions-api.jogruber.de/v4/azuzo99?y=last` (L791) - live stats, fallback values in section 4.
- `https://www.youtube-nocookie.com/embed/SE4vJdIIbGM?autoplay=1` (L596) - only after click.

### (c) Plain links
- Calendly `https://calendly.com/adam-zuzo` (6x: L68, L111, L130, L139, L742, L1049)
- LinkedIn `https://www.linkedin.com/in/adam-zuzo/` (7x)
- Instagram `https://www.instagram.com/zuzo_adam/` (6x)
- GitHub `https://github.com/azuzo99` (5x)
- Meetup `https://www.meetup.com/claude_community_poznan/` (L1052, L1166), `https://www.meetup.com/pl-pl/awsugpl/` (L1167)
- Luma `https://luma.com/claude-community-poznan` (L1166)
- `mailto:zuzoadam@gmail.com` (fallback in copyEmail, L916-917)

## 8. Local assets

### Referenced from v4 (all exist, none missing)
| file | where |
|---|---|
| `assets/claude-community-poznan.jpeg` (2048x1536, 442 KB) | communities[0].photo L1166 |
| `assets/icons/linkedin.svg` | L64, L113, L132, L141, L268, L1050, L1199 |
| `assets/icons/instagram.svg` | L65, L114, L133, L142, L1051, L1200 |
| `assets/icons/airflow.png` | L388, L431, I.airflow L933 |
| `assets/icons/glue.svg` | L416, L446 (catalog), I.glue L947 (dead uses only) |
| `assets/icons/agents.svg` | L507, I.agents L928 |
| `assets/icons/knowledge.svg` | L515, I.kb L930 |
| `assets/icons/rag.svg` | L515, I.rag L929 |
| `assets/icons/dbt.svg` | I.dbt L925, diagram L997 |
| `assets/icons/iceberg.png` | I.iceberg L926, diagram L997 |
| `assets/icons/s3.svg` | I.s3 L945 (consult points), diagram L997 |
| `assets/icons/emr.svg` | diagram L997 (I.emr L946 only in dead arrays) |
| `assets/icons/datahub.svg` | I.datahub L927 (stack) |
| `assets/icons/athena.svg` | diagram L997 |
| `assets/icons/gam.png`, `assets/icons/gcloud.png` | diagram L997 |
| `assets/icons/mic.svg` | L308 |
| `assets/icons/sodo.png` | L588, trusted L1110 |
| `assets/icons/calendly.svg`, `assets/icons/meetup.svg` | channels L1049, L1052 |
| `assets/icons/presentation.svg` | teach points L1071 |
| `assets/icons/teradata.svg`, `informatica.svg`, `redshift-aws.svg`, `lambda-aws.svg`, `stepfunctions.svg` | earlier logos L1157-1161 |
| `assets/icons/fanatical.png`, `onwelo.png`, `ge-healthcare.png`, `claude-community-poznan.png`, `aws-community-day.png` | trusted L1110 |
| `assets/icons/redshift.svg`, `assets/icons/lambda.svg` | referenced only via I.redshift / I.lambda, used only in dead `mqRows` -> effectively unused |

### Photos (`site-assets/photos/`) - all used via image slots (byte-identical to state file)
`hero-headshot.webp` 400x400, `about-photo.webp` 946x1050, `movephysiq-shot.webp` 1136x1070, `aws-community-day.webp` 800x533. Low resolution (hero 400 px wide shown at up to 320 px CSS; retina needs ~2x) - brief already says to ask for originals.

### Present but unused
`assets/fandom-architecture.svg`, `assets/icons/gcs.svg`, `assets/icons/hourglass.svg` (not referenced by v4 or any other design file); plus effectively-unused `redshift.svg`, `lambda.svg` above.

## 9. Open questions / anomalies

1. **Breakpoints differ from the brief.** Brief: phone <860, tablet 860-1199, desktop >=1200. Code: phone `<600` (`isPhone`), `heroMid` 600-939, `navWide` >=860, `scrollMode` >=900w AND >=720h, rail >=1340; no 1200 threshold anywhere (v4:L848, L1001). Community/talk/work tap-to-expand and the mobile diagram are `<600` only; stack accordion and menu are `<860`. Which wins? (Inventory assumes code.)
2. **Activity section hidden by default.** `showGithub` default `false` (v4:L777) -> no `#github` section, no live jogruber stats, no ghchart, and it is dropped from the chapter list. Brief + plan require live stats. Side effect: with it hidden, the rail/menu numbers Contact `06` while its heading says `(07)` (v4:L738). Also ghchart (L707) is a third-party runtime image the brief does not allow.
3. **Stack filter does not exist visually.** `stackFilter`/`stackTabs`/`stackTiles` (v4:L1187-1194) and `techGroups[].go` (L984) are computed but never rendered. Brief/plan ask for "tabs/filter". Build it or drop it? Other dead code: `if (false)` block v4:L839-843; no-op IntersectionObserver `this.io` L856-858; `archRef` L782; `const on = true` branch L874/L879; unused `mqRows` L957, `aboutTags`/`statsTop` L1042-1046, `services` L1142, `trainLogos` L1164, `tgLabel`, offer `short`/`dotW`, `trackTf`; unused keyframes `azPopIn`, `azFill`; `azMarquee` defined twice (L23, L32).
4. **Diagram loop facts vs plan.** Loop is 6 steps x 4 s = 24 s (PER=10 x 400 ms, v4:L996), not "5-step caption loop (12 s)" (EXECUTION_PLAN.md:L32). Prev/Next set `archPaused: true` (L1002), never reset and not in initial state, so the phone loop stops for good after one tap; step/dot clicks on desktop do not pause. Keep as-is?
5. **Hover rules with holes never apply.** `style-hover` is compiled statically, so `style-hover="color: {{ n.hover }};"` (v4:L60) and the `color: {{ ch.fg }}` part of L241 are invalid CSS in the design (no hover colour). Intended values: `n.hover` = `#111111` inactive / `#FBF6EE` active (L979). Reproduce the intent or the actual (no change)?
6. **No accessibility/motion handling in the design.** No `prefers-reduced-motion` anywhere; `scroll-behavior: smooth` unconditional (L17). Diagram steps are `<div role="button">` with no `tabindex`/key handlers (L403, L433, L471). Offer accordion has `aria-expanded` but the work/earlier toggles do not. Headings: offers' h3 only exist in scrollMode; community h3 only notPhone. Trusted-by section has no id. All of this has to be added without changing visuals.
7. **Copy to confirm (not fixed).** Mixed apostrophes: curly `’` in `Fandom’s` (v4:L1066) and `therapist’s` (L1148) vs straight `'` in `world's` (L375), `I'm` (L109, L146), `Poznan's` (L544), `Let's` (L739). "Poznan" without "ń" everywhere. Cert names "AWS Certified Architect" + "with Data Analytics - Specialty" (L293) are not official AWS titles (Solutions Architect - Associate/Professional; Data Analytics - Specialty was retired in 2024). "Earlier | Onwelo" is hard-coded on both earlier cards (L520). `Plugins & skills` uses a raw `&` (L507), harmless. No clear spelling typos found.
8. **Asset/token gaps.** Unused files: `fandom-architecture.svg`, `icons/gcs.svg`, `icons/hourglass.svg` (and `redshift.svg`, `lambda.svg` only via dead code). Photos are small (hero 400x400). Fonts load 700 + italics that are never used. Brief token list misses `#77716A`, `#FFFFFF`, `#E9E1D3`, `#D97757`, `#CFC8BC` and the dark greys; nav bg `rgba(245,238,226,.82)` is off-palette; radii include 28px, no 24px. devicon `@latest` needs a pinned version.

## 10. Decisions (CP0, 2026-10-19, user)

| # | Question | Decision |
|---|---|---|
| 1 | Breakpoints | **Code wins**: 600 / 860 / 900x720 / 940 / 1340. No 1200 threshold. |
| 2 | Activity section | **Hidden, as in design.** No `#github` section, no jogruber fetch, no ghchart. Contact heading `(07)` -> `(06)` so it matches rail/menu numbering. |
| 3 | Stack filter | **Not built** (not in the approved visual). Dead code is dropped. |
| 4 | Diagram loop | 6 steps x 4 s = 24 s, as coded. |
| 4b/5 | Design bugs | **Intended behaviour**: hover colours apply (`#111111` inactive / `#FBF6EE` active nav; `ch.fg` on channels). Prev/Next (phone) and step/dot click (all) pause the loop; it resumes after 8 s without interaction. |
| 6 | a11y / motion | Added by us without visual change (brief hard requirement). |
| 7 | Copy | **All apostrophes -> `’`** (U+2019). Everything else byte-identical (Poznan, cert names, "Earlier \| Onwelo" stay). |
| 8 | Assets | Unused files not shipped. Photos used as-is (low-res) until originals arrive - open item. devicon pinned at download time. |
