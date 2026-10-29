const { useState, useEffect, useRef, Component } = React;
const _jsxFileName = "/tmp/jsx-src/app.jsx"; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// BUILD v3.2

const RWC_DATE = new Date("2027-10-04T00:00:00");

// ── Match calendar ────────────────────────────────────────────────────────────
// Pre-loaded with RWC 2027 Pool D fixtures. User can add club/test matches too.
const RWC_MATCHES = [
  { date:"2027-10-04", opponent:"Ireland",  flag:"🇮🇪", venue:"Sydney",    competition:"RWC Pool D" },
  { date:"2027-10-11", opponent:"Uruguay",  flag:"🇺🇾", venue:"Newcastle", competition:"RWC Pool D" },
  { date:"2027-10-17", opponent:"Scotland", flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", venue:"Brisbane",  competition:"RWC Pool D" },
];

// How many days before/after a match are protected
const MATCH_TAPER_DAYS   = 0; // match day only — captain's run day before still has full skills
const MATCH_RECOVERY_DAYS = 1; // 24h after  → recovery only

function getMatchStatus(todayK, allMatches=[]) {
  for (const m of allMatches) {
    const diffDays = Math.round((new Date(m.date+"T12:00:00") - new Date(todayK+"T12:00:00")) / 86400000);
    if (diffDays === 0) return { type:"matchday",  match:m, daysUntil:0 };
    if (diffDays < 0 && diffDays >= -MATCH_RECOVERY_DAYS) return { type:"recovery", match:m, daysAgo:-diffDays };
  }
  // Next upcoming match
  const upcoming = allMatches
    .map(m => ({ m, d: Math.round((new Date(m.date+"T12:00:00") - new Date(todayK+"T12:00:00")) / 86400000) }))
    .filter(x => x.d > 0)
    .sort((a,b) => a.d - b.d)[0];
  if (upcoming) return { type:"normal", match:upcoming.m, daysUntil:upcoming.d };
  return { type:"normal", match:null, daysUntil:null };
}
const APP_VERSION = "2.1.0"; // bump this to force Safari cache refresh
const WEIGHT_MIN = 83, WEIGHT_MAX = 86;

// ── Apple × Portugal design system ───────────────────────────────────────────
// Apple HIG: -apple-system font, 8pt grid, 44pt tap targets, single accent,
// grouped inset lists, true blacks, semantic colour roles.
// Portugal identity: crimson accent (flag), crest gold (highlights), kit green.

// Backgrounds — true Apple dark (not warm-tinted)
const BG   = "#000000";   // true black — Apple's systemBackground in dark mode
const S1   = "#1c1c1e";   // Apple secondarySystemBackground
const S2   = "#2c2c2e";   // Apple tertiarySystemBackground
const S3   = "#3a3a3c";   // Apple systemFill (elevated surfaces)

// Separators — Apple hairline
const BD   = "rgba(255,255,255,0.08)";
const BDH  = "rgba(201,168,76,0.25)";

// Portugal brand — single accent philosophy (Apple uses one accent)
// Primary interactive: Portugal crimson (flag colour, strong identity)
const RED  = "#c41e3a";   // Portugal crimson — primary accent
const REDA = "#ff375f";   // lighter crimson — Apple-style tinted variant
const REDDIM = "rgba(196,30,58,0.15)";

// Secondary: crest gold — used sparingly for highlights only
const GOLD    = "#c9a84c";
const GOLDDIM = "rgba(201,168,76,0.12)";

// Tertiary: kit green — success states, streaks, positive data
const GRN  = "#2e7d4f";
const GRNA = "#30d158";   // Apple systemGreen in dark — vibrant, legible
const GDIM = "rgba(48,209,88,0.12)";

// Text hierarchy — Apple semantic colours
const T1 = "#ffffff";             // label (primary)
const T2 = "rgba(235,235,245,0.6)"; // secondaryLabel
const T3 = "rgba(235,235,245,0.3)"; // tertiaryLabel

// Supporting
const AMB = "#ff9f0a";   // Apple systemOrange
const BLU = "#0a84ff";   // Apple systemBlue
const PRP = "#bf5af2";   // Apple systemPurple

// Apple-style grouped list card
// Inset from screen edges, rounded, no heavy border
const card = {
  background: S1,
  borderRadius: 12,
  overflow: "hidden",
};

// Section label — Apple style: small, tracked caps, secondaryLabel colour
// Rule 15: uppercase labels at small size get +0.08em; larger text gets negative tracking
const lbl = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",  // positive tracking for small uppercase — Rule 15
  color: T3,
};

// Apple compliance CSS — injected once at app root
// Rule 1: pointer-down feedback, Rule 14: reduced-motion/transparency, Rule 4: specific transitions
const APPLE_CSS = `
  /* Rule 1 — respond on press, not release */
  button { -webkit-tap-highlight-color: transparent; }
  button:active { opacity: 0.7; transform: scale(0.97); transition: transform 80ms ease-out, opacity 80ms ease-out; }

  /* Rule 14 — reduced motion: replace slides with cross-fades */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 150ms !important;
      transition-property: opacity !important;
    }
  }

  /* Rule 14 — reduced transparency: solid surfaces */
  @media (prefers-reduced-transparency: reduce) {
    [data-surface] { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background: #1c1c1e !important; }
  }

  /* Rule 15 — optical sizing */
  * { font-optical-sizing: auto; }

  /* Smooth tab content transitions — Rule 4 */
  .tab-content { transition: opacity 120ms ease; }
`;

// ── safe storage (localStorage unavailable in some environments) ──────────────
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch (e2) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e3) {} },
  keys: () => { try { return Object.keys(localStorage).filter(k=>k.startsWith("rwc_ci_")); } catch (e4) { return []; } },
};
function daysUntil(d) { const n = new Date(); n.setHours(0,0,0,0); return Math.ceil((d-n)/86400000); }
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
// Convert any Date object to local YYYY-MM-DD string (not UTC)
function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dayOfYear()  { const n=new Date(); return Math.floor((n-new Date(n.getFullYear(),0,0))/86400000); }
function fmtDate(k)   { return new Date(k+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}); }

// ── HRV baseline (rolling average, not fixed thresholds) ──────────────────────
// Methodologically correct HRV use compares today's reading to the player's OWN
// rolling baseline, not an absolute number — HRV is highly individual.
// Rolling mean of personal HRV — the methodologically correct approach.
// Compares today's reading to YOUR own baseline, not arbitrary fixed numbers.
// HRV is highly individual — a value of 42 is excellent for one person and low
// for another. We need at least 1 prior reading; baseline stabilises after ~7.
function getHrvBaseline(history, excludeToday) {
  const vals = Object.entries(history)
    .filter(([k]) => k !== excludeToday)
    .sort((a,b) => b[0].localeCompare(a[0]))
    .slice(0, 14) // use up to 14 days for a more stable mean
    .map(([,v]) => parseFloat(v.hrv))
    .filter(v => !isNaN(v) && v > 0);
  if (vals.length === 0) return null;
  return vals.reduce((a,b) => a+b, 0) / vals.length;
}

// HRV readiness — % deviation from personal rolling baseline
function hrvReadiness(todayHrv, baseline) {
  if (!baseline || !todayHrv) return null;
  return (parseFloat(todayHrv) / baseline); // >1.0 = above baseline (good), <0.8 = suppressed
}

function microcycleLoadHint(dow) {
  // 0=Sun(peak day) 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  const MAP = {
    0: { label:"Peak day",      note:"Treat today like a match — sharp, not exhausting." },
    1: { label:"Light/recover", note:"Day after your peak effort — research shows this is when injury risk rises if loaded too hard. Keep it light." },
    2: { label:"Build",         note:"Load can increase from here — good day for a harder technical session." },
    3: { label:"Light/skill",   note:"A lighter day between your two hardest sessions aids recovery without losing the week's rhythm." },
    4: { label:"Hardest day",   note:"Furthest from your next peak day — the safest day to push the hardest." },
    5: { label:"Taper begins",  note:"Start easing intensity down — sharpness over volume from here." },
    6: { label:"Sharpen",       note:"Final taper day — short, fast, precise. Save your legs." },
  };
  return MAP[dow];
}


function getPhase(days) {
  if (days>400) return { name:"Foundation",  accent: GRNA,  bg:"#0d1f13" };
  if (days>250) return { name:"Development", accent: GOLD,  bg:"#1a1508" };
  if (days>100) return { name:"Sharpening",  accent: REDA,  bg:"#1a0610" };
  return               { name:"Tournament",  accent: "#f0c060", bg:"#1a1000" };
}

// Each skill has: name, icon, color, why, and progression (ordered warm-up → advanced stages)
const SKILLS = {
  shortBoxKick:{ name:"Short box kick",   icon:"🦵", color: GRNA, trackOnly:true,
    why:"Data from Sportable shows contested box kicks require 4.4s+ hang time to win 50%+ in the air. Distance of 20-30m with 4s+ hang beats 50m in 2s. Ambipedal kicking (both feet) doubles your options and halves opponent preparation.",
    progression:[
      { stage:"Drop mechanics", duration:"10 min", text:"Solo. Drop the ball onto your foot — don't toss it up. Ball contacts foot below the knee, toes pointed down. Strike under the ball for height not distance. 20 reps each foot. AFL coaching cue: connect with the sweet spot every time before adding power." },
      { stage:"Hang time counting", duration:"10 min", text:"Kick 10 balls counting hang time aloud. Target: 4+ seconds. A kick that lands 25m with 4.5s hang beats 45m in 2s. Use phone timer if needed. Log your average — this is the metric that matters, not distance." },
      { stage:"Channel targeting", duration:"15 min", text:"Cones marking a 5m wide channel, 20-30m away. 15 kicks into the channel. Strong foot then weak foot. Elite 9s hit their channel 60%+ of the time. Track your percentage each session." },
      { stage:"Sprint-to-kick", duration:"15 min", text:"Sprint 10m to simulate ruck arrival, receive pass, immediately box kick. The transition from sprinting to kicking is where technique breaks down. 15 reps. Target: pass-to-boot in under 1.5s." },
      { stage:"Defender closing", duration:"15 min", text:"Partner charges from 10m. You must kick before they arrive. Decision: kick or hold — make it before the pass reaches you. 15 reps. This replicates the blindside flanker closing on your box kick." },
    ]},

  longBoxKick:{ name:"Long/high box kick", icon:"🚀", color: GRNA, trackOnly:true,
    why:"Territory gain is the key metric. Elite box kicks achieve 10-32m of territory gain. A long box kick forcing the fullback to field under pressure in their own half is worth more than a short kick with a bad chase angle.",
    progression:[
      { stage:"Technique — height first", duration:"10 min", text:"Strike the lower quarter of the ball. Follow through straight toward target — feet must not cross over at finish (AFL kicking principle: plant foot points at target). 15 reps solo, both feet." },
      { stage:"Distance building", duration:"15 min", text:"5 kicks at 25m, 5 at 35m, 5 at 45m+. Maintain 4s+ hang time at every distance. If hang time drops below 3.5s at longer range, you're sacrificing contest quality for distance. Know your ceiling." },
      { stage:"Weak foot isolation", duration:"15 min", text:"20 reps weak foot only. Ben Meehan (Gloucester) kicked 41/109 contestable box kicks off his left foot — ambipedal kicking doubles your threat. This is a competitive advantage most 9s don't have." },
      { stage:"Decision — kick or pass", duration:"15 min", text:"Partner calls 'kick' or 'pass' as they feed the ball. Commit to kick before you receive it when called. Decision speed is the separator at elite level — like an NFL QB committing pre-snap, not post-catch." },
    ]},

  grubber:    { name:"Grubber kick",      icon:"⚽", color: GRNA, trackOnly:true,
    why:"The grubber forces the defender to turn and chase — one of the hardest defensive adjustments in rugby. The key is ankle lock at contact — the same technical point AFL coaches call fundamental to kicking accuracy.",
    progression:[
      { stage:"Contact point", duration:"10 min", text:"Strike the bottom third of the ball with laces, ankle locked, knee over the ball. Ball should tumble end over end at 30-40cm height. No spin — tumbling ball is harder to pick up at pace. 20 reps short range." },
      { stage:"Pace control", duration:"10 min", text:"5 grubbers at 8m, 5 at 12m, 5 at 18m. Pace matching is everything — too hard and it bounces into touch. Learn your distances by feel. This is a golf short-game skill: calibration, not power." },
      { stage:"Angle targeting", duration:"15 min", text:"Kick into corner channel at 45-degree angle. Target: between 5m line and touchline. If ball goes dead, too much pace. If it stops short, too soft. 15 reps from 15m." },
      { stage:"Pressure release", duration:"15 min", text:"Ball arrives fast and low — you have 1s to execute. Grubber into coned zone while partner closes. 12 reps. Soccer players call this 'playing through pressure' — it requires a pre-set ankle, not a decision in the moment." },
    ]},

  crossKick:  { name:"Cross-field kick",  icon:"↗️", color: GRNA, trackOnly:true,
    why:"The cross-field exploits defensive line speed. AFL players execute this under full sprint. The disguise — looking away from target — is what makes it lethal. The technique: open hips early, plant foot toward target, follow through to 3 o'clock while body faces 12.",
    progression:[
      { stage:"Hip opening", duration:"10 min", text:"Feet parallel, simulate receiving pass going left. Before receiving, open hips 90 degrees to face right. The hip turn must precede ball arrival — this is the disguise. 15 slow reps without ball." },
      { stage:"Technique solo", duration:"15 min", text:"20 cross-field kicks to cone 20m away. Plant foot points at target even as body faces forward. AFL cue: 'run toward 12 o'clock, kick toward 3 o'clock.' Follow-through goes to 3, not straight ahead." },
      { stage:"Moving target", duration:"15 min", text:"Partner runs flat line at 20m. Kick to land 2m in front of them so they run onto it. Timing to a moving target is harder than accuracy. 10 reps each side. Ball must lead them — not land at their feet." },
      { stage:"Under pressure", duration:"15 min", text:"Defender at 10m closing. Execute cross-field while reading their commitment direction. Commit to your kick before receiving the ball — last-second decisions produce poor technique every time." },
    ]},

  fiftyTwo:   { name:"50-22 kicking",     icon:"🎯", color: GRNA, trackOnly:true,
    why:"The 50-22 rule changed rugby. A kick from your half that bounces into touch in the opponent's 22 wins a lineout. The skill is landing in a precise zone from distance — the same challenge as a PGA golfer reading a long putt. Repeatable setup beats power.",
    progression:[
      { stage:"Setup ritual", duration:"5 min", text:"Every 50-22 starts identically. Identify target zone (5m from touchline, inside 22). Plant foot aimed at target. Look at target, not ball at contact. PGA golfers read the putt, then commit — same here. 10 setup reps without kicking." },
      { stage:"Landing zone drill", duration:"15 min", text:"Cones marking 3m × 3m landing zone inside 22, near touchline. 15 kicks from your own 40m aiming to land in zone. Track hits. Target: 4/15 to start, build to 8/15. Optimal angle: 45 degrees toward touchline." },
      { stage:"Decision-making", duration:"15 min", text:"Partner arm up ('winger defending flat') or arm down ('winger deep'). Only kick when arm is up — it signals space. 15 reps. Elite #9s read the winger position in 0.3 seconds and commit." },
      { stage:"Moving execution", duration:"15 min", text:"Receive pass at walking, jogging, then sprint pace. The 50-22 often comes from quick ball when the defense is still moving. Technique under pace is what separates good from wasted possession." },
    ]},

  clearingKick:{ name:"Clearing kick",    icon:"👣", color: GRNA, trackOnly:true,
    why:"Under your own posts, clearing is a survival skill. Soccer goalkeepers and AFL players train this under pressure constantly. Key metric: time from ball receipt to boot. Target: under 1.5 seconds. It does not need to be perfect — it needs to be safe.",
    progression:[
      { stage:"Quick release", duration:"10 min", text:"Partner feeds pass. Timer starts at catch. Kick must leave boot within 1.5s. No adjustment steps — receive and kick. 15 reps. Soccer GKs drill the 'catch-to-clearance' speed. AFL coaches call it 'first-motion commitment.'"},
      { stage:"Direction under pressure", duration:"15 min", text:"Three targets: left touchline, right touchline, centre. Partner calls direction as they feed the pass. Pre-set hips — you cannot adjust after the call. 15 reps, random direction." },
      { stage:"Defender closing", duration:"15 min", text:"Defender charges from 8m. Kick before they arrive. Kick over the defender's head — height beats accuracy here. 15 reps. Soccer keepers face this from pressing forwards every match." },
      { stage:"Fatigue clearing", duration:"10 min", text:"10 shuttle sprints (5m each). Immediately clear from pre-positioned ball. The kick at the end of a 5-phase move is the most important to train — because that's when technique breaks down." },
    ]},


  agility:    { name:"Agility",           icon:"⚡", color: AMB, trackOnly:true,
    why:"Rugby science defines agility as two components: change-of-direction ability (physical) and perceptual decision-making (cognitive). Reactive agility — responding to a moving cue — is 3x more game-relevant than pre-planned cone drills.",
    progression:[
      { stage:"Pro shuttle (5-10-5)", duration:"10 min", text:"Cones at 0m, 5m, 10m. Sprint 0 to 5m (touch), back to 0m (touch), to 10m. NFL combine standard for lateral burst. Target: under 4.5s. 6 reps, full recovery between each. World Rugby passport recommends this specifically for backs." },
      { stage:"T-drill", duration:"10 min", text:"4 cones in T shape: base, 5m ahead, 2.5m left and right. Sprint to top, shuffle right, across to left, back to top, backpedal to base. Aaron Smith's Highlanders coaches use this for scrum-half footwork at the ruck. 6 reps." },
      { stage:"Reactive agility", duration:"15 min", text:"Partner holds arm left or right. Sprint toward them — arm drops at 3m indicating direction to cut. React and cut. This replicates open-play agility — you don't know the outcome until the stimulus fires. MMA fighters train reaction time this exact way. 15 reps." },
      { stage:"1v1 stepping", duration:"15 min", text:"Face defender 5m apart. Attack with ball, use footwork to beat them: jab step, side-step, or double-step. Rotate roles every 5 reps. Key: commit the defender with your eyes and shoulders before your feet move — the step is the last thing, not the first. 20 reps each." },
      { stage:"1v1 pressure decision", duration:"15 min", text:"Attacker starts 10m from defender. On 'go', attacker must decide inside 2 steps: step off left foot to go right, step off right foot to go left, or straight acceleration if defender is flat-footed. Defender tries to mirror. Scrum-halves use this for break-from-ruck reads — the decision fires before the body moves. 20 reps." },
      { stage:"Ball-in-hand speed", duration:"15 min", text:"All drills above, but carrying rugby ball. World Rugby guidance: integrate ball skills into all agility work — isolated foot speed doesn't transfer to game-speed agility with ball in hand." },
    ]},

  passing:    { name:"Passing",           icon:"🏉", color: GRNA, trackOnly:true,
    why:"Aaron Smith's pass releases in under 0.4s from receipt — zero backswing, wrist-driven, early release. NFL QB coaches teach the same: quick release beats arm strength. Weak hand isolation is the fastest improvement method because bad technique produces obvious errors.",
    progression:[
      { stage:"No-backswing drill", duration:"10 min", text:"20 passes each hand with zero backswing. Start from chin height, drive through with wrists. Bag pass: use tackle bag as receiver. Feels unnatural — that means it's working. Aaron Smith credits no-backswing isolation for his release speed." },
      { stage:"Weak hand isolation", duration:"15 min", text:"40 reps weak hand only. Close range first, extend as accuracy improves. NFL QB coaches isolate non-dominant hand weekly — forces correct grip, wrist snap, and release point without compensating with the strong side." },
      { stage:"Long ball accuracy", duration:"15 min", text:"Pass to cones at 8m, 12m, 16m. Must arrive below waist height — flat pass is faster and harder to intercept than a looping one. Baseball pitchers train flat release mechanics. 10 reps at each distance." },
      { stage:"Fatigue pass", duration:"15 min", text:"Sprint 22m, immediately pass 5 balls to target. Your pass at minute 78 of a World Cup match must look like minute 1. Fatigue exposes every flaw. NFL QBs train this in pads at end-of-practice — never fresh-only." },
      { stage:"One-touch rhythm", duration:"10 min", text:"Ball arrives, passes out in under 0.5s. No grip time, no adjustment. Touch-pass: arrives and leaves. Basketball point guards train this as 'catch-and-release' — Steph Curry's shooting consistency comes from the same muscle memory principle." },
    ]},

  edgeDefense:{ name:"Defence",      icon:"🛡️", color: REDA, trackOnly:true,
    why:"MMA research shows commitment outperforms hesitation — the tackle you hesitate on hurts most. Sports psychology: 'approach motivation' (attacking the situation) produces better performance than 'avoidance motivation' (trying not to get hurt). Commit early, arrive low.",
    progression:[
      { stage:"Approach angle", duration:"10 min", text:"Cones at 45-degree angles from central point. Arrive at each with outside shoulder leading, head up, forcing carrier infield. Shadow movement — 20 reps. Australian defensive coaches call this 'funnelling' — every tackle angle funnels infield." },
      { stage:"Low body position hold", duration:"10 min", text:"Drop to tackling height (hips below carrier's hips), hold 5 seconds. 10 reps. Same position MMA fighters hold before takedowns — uncomfortable but stable. If you can't hold 5s, your tackle position under match fatigue is compromised." },
      { stage:"Footwork mirror", duration:"15 min", text:"Face partner 3m apart. They move laterally — you mirror exactly, maintaining gap. 30 seconds each rep, 8 reps. NBA defender footwork drill: 'stay in front.' Never cross feet; shuffle only. Transfers directly to edge defense footwork." },
      { stage:"Commitment drill", duration:"15 min", text:"Partner runs at 50%, then 70%, then 80%. Commit to tackle before they reach 1m. MMA coaches: 'the punch you hesitate on hurts most.' Make the decision at 3m, execute at 1m. 15 reps at increasing speed." },
    ]},

  highBall:   { name:"High ball",         icon:"☝️",  color: BLU, trackOnly:true,
    why:"AFL players are the world's best at contested aerial catches — it's their primary skill. Their methodology: call it early, set under it early, elbows high, catch above head. The mental component is as important as physical — train the decision to compete, not just the catch.",
    progression:[
      { stage:"Call and set", duration:"10 min", text:"Self-throw: toss ball 10m high. Call 'MINE' aloud at peak height. Set feet under drop zone before it descends. 15 reps. AFL players call every contested ball — it commits mentally and signals teammates. Calling aloud engages motor patterns silent rehearsal doesn't." },
      { stage:"Tracking", duration:"10 min", text:"Partner throws from 20m at various angles. Track ball from release — watch entire flight. Catch at highest point, elbows up. 15 reps. Soccer keepers train 'ball-flight reading': eyes on the flight path, not the destination." },
      { stage:"Angled approach", duration:"15 min", text:"Ball arrives at 30-45 degree angle to your running line. Redirect without breaking stride. 15 reps. AFL marks are most often taken while moving — never static. Catch-while-redirecting is what breaks down under pressure." },
      { stage:"Contested", duration:"15 min", text:"Partner closes as ball descends. Decision: catch cleanly or knock dead — make it at peak height, not on descent. Elite AFL players decide at top of ball's arc. If unsure: knock dead. A 50/50 decision conceded beats a knock-on every time." },
    ]},

  breakdown:  { name:"Breakdown speed",   icon:"💨", color: BLU, trackOnly:true,
    why:"GPS data shows elite #9s make 30+ breakdown arrivals per match. Speed is 60% technique and 40% fitness. MMA fighters train first-step explosion from standing — the same 0-3m burst that gets you to the breakdown first.",
    progression:[
      { stage:"Low gate figure-8", duration:"10 min", text:"Two cones 2m apart. Sprint around each in figure-8, staying below 1m height throughout. Forces low body position for safe, legal ruck arrival. 10 reps of 30 seconds. Research: low arrival position reduces injury risk 40% in contact situations." },
      { stage:"Cone rush circuit", duration:"15 min", text:"Cones for 5 rucks in 20m grid. Sprint to each, arrive low, clear, sprint to next. Time the circuit. Target: 5 rucks in under 10 seconds. Aaron Smith's training model — cones simulate a forward pack recycling at pace." },
      { stage:"Jackalling hold", duration:"10 min", text:"Hold jackalling position (low, weight over ball, hips below knees) for 30 seconds. 5 reps. BJJ fighters hold this position before a guard pass — requires core and posterior chain strength under fatigue. If you can't hold it, you'll be penalised when tired." },
      { stage:"Arrival from sprint", duration:"15 min", text:"Sprint 15m flat. Arrive at pad or partner in jackalling position without overrunning. Controlled deceleration into low position. MMA coaches train 'explosion into hold' — maximum acceleration then immediate position control. 10 reps." },
    ]},

  mental:     { name:"Mental prep",       icon:"🧘", color: PRP, trackOnly:true,
    why:"Neuroscience: the brain cannot distinguish vividly imagined action from real experience. GSP lived every UFC fight thousands of times before the octagon. MMA fighters, Olympic athletes and elite rugby players use the same tools: controlled breathing, visualisation, and pre-performance routines that reduce uncertainty.",
    progression:[
      { stage:"Box breathing", duration:"5 min", text:"4-count inhale through nose, 2-count hold, 6-count exhale through mouth. 10 cycles. Used by US Navy SEALs and cited by UFC fighters for pre-fight regulation. The extended exhale activates the parasympathetic system — your nervous system physically cannot stay anxious on a long exhale." },
      { stage:"Visualisation — match speed", duration:"10 min", text:"Eyes closed. Run your last match at full speed. Not slow-motion — real pace. Every decision, every kick, every pass. GSP's mental rehearsal was always at match speed. Slow-motion visualisation creates slow-motion execution." },
      { stage:"Pre-match routine", duration:"10 min", text:"Go through your exact pre-match routine step by step. Same order, same cues, same state every time. MMA fighters design pre-fight routines to eliminate uncertainty — when everything feels familiar, the brain operates in execution mode not survival mode." },
      { stage:"Contact confidence", duration:"10 min", text:"Eyes closed. 5 dominant tackles — low, powerful, driving through. See yourself arriving first at every breakdown. Feel physicality as strength not threat. MMA research: mental rehearsal of successful contact builds the same neural pathways as physical repetition." },
      { stage:"Tackling aggression", duration:"10 min", text:"Replay 3 hesitant tackles in your mind. Then replay each — but you commit early, drop low, drive through. The hesitation is a decision. Retrain it. UFC sports psychologists call this 'response substitution' — replace hesitation with the committed pattern." },
      { stage:"Fear reframing", duration:"5 min", text:"Write: what would it look like if you attacked every contact moment? Worst realistic outcome vs the upside? MMA fighters reframe fear as data: 'fear means this matters, and I've prepared for things that matter.' Fear examined shrinks. Fear avoided grows." },
      { stage:"Cue word", duration:"5 min", text:"Choose one word that represents your best performance. One word only. Use it before every rep today. Michael Jordan's was 'attack.' Find yours. Repeat it before every contact situation in training until the word and the action are inseparable." },
    ]},

  gameStudy:  { name:"Game study",        icon:"📹", color: GOLD, trackOnly:true,
    why:"Elite NFL QBs use stopwatches to time routes during film study — not just watching, but quantifying. Portugal face Ireland (#9 Gibson-Park), Uruguay, and Scotland at RWC 2027. Knowing the opposition #9's tendencies before the match starts is a competitive advantage you can build today.",
    progression:[
      { stage:"Opposition #9 tendencies", duration:"15 min", text:"Watch 10 minutes of target #9. Count: kick vs pass vs run ratio from ruck base. Write the number — don't trust memory. NFL coaches time routes with stopwatches; you count tendencies with numbers. Numbers are facts. Impressions are biased." },
      { stage:"Kicking patterns", duration:"10 min", text:"Same footage. Track: which foot under pressure? Which zones? Box kick landing area? What's their tell before they kick? Body position, head movement, weight shift. You're looking for patterns that become predictions." },
      { stage:"Defensive shape", duration:"10 min", text:"How quickly do they defend off the ruck edge? What line? Do they blitz? NBA point guards study defensive tendencies this way — anticipate the play before it happens. Gibson-Park's defensive line speed will create pressure you must plan for." },
      { stage:"Self-analysis", duration:"10 min", text:"Watch 10 minutes of your own footage. One thing you'd do differently. Not two — one. Use it as your technical cue for tomorrow. NFL QBs who self-analyse after every game improve 2x faster than those who only take coach feedback." },
    ]},

  prehab:     { name:"Prehab",            icon:"🛠️", color: GOLD,
    why:"You cover 7km per match crouched at ruck level. Nordic curl negatives reduce hamstring injury risk by 51% (Petersen et al.) — the single highest-efficacy injury prevention intervention in sports science. Copenhagen planks reduce adductor injury by 41%. Lumbar stability is critical for scrum-halves who rotate and load under fatigue. This is not optional.",
    progression:[
      { stage:"Hip flexor", duration:"10 min", text:"Half-kneeling lunge: back knee down, drive hips forward, squeeze glute of back leg. 90 seconds each side. A tight hip flexor reduces stride length, kicking power, and sprint acceleration. Rugby 9s have chronically short hip flexors from ruck crouching." },
      { stage:"Nordic curl negatives", duration:"10 min", text:"Kneel, partner holds ankles. Lower yourself as slowly as possible — target 5+ seconds down. Catch with hands, push back up. 3 sets of 5. 51% hamstring injury reduction in research. Most clubs don't do this. You should." },
      { stage:"Ankle stability", duration:"10 min", text:"Single leg stand, eyes closed, 30 seconds each side. Then 10 small hops landing silently. Loud landing = absorbing with bone, not muscle. Ankle instability is the most common non-contact rugby injury. 10 minutes daily prevents weeks of rehabilitation." },
      { stage:"Copenhagen plank", duration:"10 min", text:"Side plank, top leg on bench, bottom leg free. 3 × 20 seconds each side. Research: 4 weeks reduced adductor injury by 41% (Harøy et al.). Rugby puts massive adductor load. This is your protection." },
      { stage:"Lumbar stability — dead bug", duration:"10 min", timer:"90 sec", text:"Lie on your back, arms up, knees at 90°. Lower opposite arm and leg simultaneously, keeping lower back glued to the floor. 3 sets of 8 each side. Scrum-halves rotate and load under fatigue — the dead bug builds anti-rotation stiffness that protects the lumbar spine." },
      { stage:"Lumbar stability — bird dog", duration:"8 min", timer:"60 sec", text:"On hands and knees, extend opposite arm and leg, hold 3 seconds at full extension, return without touching the floor. 3 sets of 10 each side. Trains the multifidus and erector spinae in the position closest to your ruck posture. Do it slow — the pause is what builds stability." },
      { stage:"Glute bridge — single leg", duration:"8 min", text:"Lie on back, one foot flat, other leg extended. Drive hips up through the heel, hold 2 seconds at top. 3 sets of 12 each side. Weak glutes force the lower back to compensate. This is the most direct lumbar protection exercise available without equipment." },
      { stage:"90/90 hip stretch", duration:"6 min", timer:"2 min", text:"Sit with front leg at 90° and back leg at 90° behind you. Lean forward over the front shin. 2 minutes each side. The 90/90 addresses hip internal rotation — the most commonly restricted range for rugby players who spend time crouched at ruck level. Restrictions here feed directly into lumbar load." },
      { stage:"Plank progression", duration:"3 min", text:"PROGRESSIVE_PLANK" },
      { stage:"Hollow body hold", duration:"6 min", timer:"30 sec", text:"Lie on your back. Press lower back into floor, lift shoulders and legs slightly — find the lowest point you can hold without lower back losing contact. Hold 3 × 30 seconds. The foundation of all anti-extension core work. Harder than it looks. If your back arches, raise your legs higher." },
      { stage:"Pallof press", duration:"6 min", text:"Band or cable at chest height, stand side-on. Press straight out and hold 2 seconds, return. 3 × 10 each side. The premier anti-rotation exercise — exactly what a 9 needs when absorbing contact at the ruck and spinning to pass under pressure. Can be done with a resistance band around a post." },
      { stage:"Suitcase carry", duration:"5 min", text:"Single dumbbell or heavy bag in one hand, walk 30m without leaning. 3 × 30m each side. Trains lateral core stiffness — your ability to stay upright when carrying the ball one-handed or breaking tackles off balance. The asymmetry is the point: your core resists the lean." },
    ]},

  recovery:   { name:"Recovery",          icon:"🔄", color: BLU,
    why:"Elite athletes treat recovery as training. Your body adapts during rest, not during load. A deliberate recovery protocol reduces next-session soreness by up to 30%, improves sleep quality, and accelerates tissue repair. These methods compound: done consistently, they add 15–20% to your effective training capacity over a season.",
    progression:[
      { stage:"Ice bath", duration:"12 min", text:"Cold immersion 10–15°C for 10–12 minutes. Reduces muscle soreness and inflammation by constricting blood vessels and flushing metabolic waste. Research shows 12-minute sessions provide maximum benefit without overdoing the inflammatory response. Used by elite rugby squads post-match. Get in, breathe, stay still — movement increases perceived cold." },
      { stage:"Hot bath", duration:"20 min", text:"Hot bath 38–40°C for 15–20 minutes. Promotes vasodilation, improves blood flow and muscle relaxation. Best used 4+ hours after cold immersion or on non-ice-bath days. The heat-induced increase in core temperature also improves sleep quality when taken 90 minutes before bed. Add Epsom salts (magnesium sulfate) — absorption through skin helps muscle relaxation." },
      { stage:"Sauna", duration:"20 min", text:"Sauna session 70–90°C for 15–20 minutes. Heat stress triggers heat shock proteins, increases growth hormone 2–5× baseline, and promotes deep muscle relaxation. Finnish research: 4× per week reduces cardiovascular risk by 40%. For recovery: use 24–48h post-match when acute inflammation has subsided. Exit if heart rate exceeds 150 bpm or you feel dizzy. Drink 500ml water before entering, replace 1L per 20 min session. Finish with a cool shower to close pores and reduce core temperature before sleep." },
      { stage:"Compression boots", duration:"30 min", text:"Sequential compression at pressure 60–80 mmHg for 20–30 minutes per session. Mimics the muscle pump action to flush lactic acid and reduce oedema. Used by every Premiership and Top 14 club. Lie flat, elevate legs at 30°, breathe slowly — parasympathetic activation combines with mechanical flush for maximum effect. Work while doing visualisation or film study." },
      { stage:"Foam roller", duration:"15 min", text:"Slow rolling — 2 seconds per inch — on quads, hamstrings, IT band, calves, thoracic spine. Pause on tender spots for 20–30 seconds until they release. Not about pain — about pressure and time. Spend 3 minutes per major muscle group. Research shows 15-minute sessions post-training reduce next-day soreness by 13%. Always roll toward the heart for lymphatic drainage." },
      { stage:"Massage gun", duration:"10 min", text:"Percussive therapy at medium speed (2000–2400 RPM) on major muscle groups for 90–120 seconds each. Do not use directly on joints, spine, or bony prominences. Move slowly across the muscle belly. Effective for increasing local blood flow and breaking up adhesions before stretching. Combine with slow breathing — the nervous system relaxes when breathing rate drops below 6 breaths per minute." },
      { stage:"Massage", duration:"60 min", text:"Professional soft-tissue work. Prioritise areas of chronic tightness: hip flexors, hamstrings, thoracic erectors, forearms (scrum-half passing load). Communicate pressure preference and any sharp pain. Studies show deep-tissue massage 48 hours post-match reduces DOMS markers by up to 25%. Book consistently — the benefits are cumulative, not one-off." },
      { stage:"Electrostimulation (EMS)", duration:"20 min", text:"Electrical muscle stimulation at recovery mode (low frequency 1–10 Hz, medium intensity — you feel a gentle contraction, not pain). Place pads on quads, hamstrings, or calves — the major load-bearing groups from match play. EMS at low frequency promotes blood flow and reduces lactic acid accumulation without creating new fatigue. Used by French and South African squads in post-match recovery. Keep intensity below threshold of voluntary contraction. 20 minutes per muscle group is optimal." },
      { stage:"Contrast baths", duration:"20 min", text:"Alternate hot (38–42°C) and cold (10–15°C) immersion. Protocol: 3 min hot → 1 min cold × 4 cycles, finishing cold. The hot-cold alternation creates a 'pump' effect — blood vessels dilate and constrict repeatedly, flushing metabolic waste more effectively than either alone. Research shows 20% greater reduction in DOMS vs. cold only. Most effective 1–4 hours post-match. If no cold tub: hot shower → cold shower, same timing." },
    ]},

};

// picks the right how-text based on available minutes per skill
// Builds a multi-stage session from a skill's progression array, fitting the
// available time budget. Always includes the warm-up first, then adds stages
// in order until the time budget for this skill is used up.
function buildProgressionSession(skillKey, perSkillMins, extraStagesForSkill=[]) {
  const s = SKILLS[skillKey];
  if (!s || !s.progression) return null;
  let customProg = {};
  try { const st = JSON.parse(store.get("rwc_settings")||"null"); customProg = _optionalChain([st, 'optionalAccess', _2 => _2.customProgressions, 'optionalAccess', _3 => _3[skillKey]])||{}; } catch (e5) {}

  const steps = [];
  let used = 0;

  // built-in stages — apply any custom overrides (name, text, duration, deleted)
  for (let idx = 0; idx < s.progression.length; idx++) {
    const stage = s.progression[idx];
    const customEntry = customProg[idx];

    // Never skip built-in stages (stale deleted flags from old versions are ignored)
    // Only custom-added stages (idx >= progression.length) can be skipped if deleted

    // apply overrides
    const mergedStage = customEntry && typeof customEntry === "object" ? {
      stage:      customEntry.name     || stage.stage,
      text:       customEntry.text     || stage.text,
      duration:   customEntry.duration && customEntry.duration !== "0 min" ? customEntry.duration : stage.duration,
      timer:      customEntry.timer !== undefined ? customEntry.timer : (stage.timer || ""),
      lastWeight: customEntry.lastWeight || "",
      _cpIdx:     idx,
    } : customEntry ? {...stage, text: customEntry, timer: stage.timer||"", lastWeight:"", _cpIdx: idx} : {...stage, timer: stage.timer||"", lastWeight:"", _cpIdx: idx};

    const stageMins = parseInt(mergedStage.duration) || 10;

    // ── PREHAB special logic: always exactly 2 stages ──────────────────────
    // 1. The plank — always included, handled separately below
    // 2. One rotating non-plank stage, chosen by day index
    if (skillKey === "prehab") {
      if (mergedStage.text === "PROGRESSIVE_PLANK") continue; // add at end
      // Only add the one stage selected by rotation (skip rest)
      // We collect all non-plank stages first, then pick one
      steps.push(mergedStage);
      continue;
    }

    // ── Recovery: collect all stages (post-processing picks 1 rotating stage) ──
    if (skillKey === "recovery") {
      steps.push(mergedStage);
      continue;
    }

    // ── Non-prehab: respect time budget for built-in stages ────────────────
    if (used + stageMins > perSkillMins && steps.length > 0) break;
    steps.push(mergedStage);
    used += stageMins;
    if (used >= perSkillMins) break;
  }

  // ── RECOVERY post-processing: pick 1 rotating stage, rest go in add-stages ──
  if (skillKey === "recovery") {
    const dayIdx = Math.floor(new Date(todayKey()).getTime() / 86400000);
    const chosen = steps.length > 0 ? [steps[dayIdx % steps.length]] : [];
    const recoveryExtra = extraStagesForSkill.map(extra => ({
      stage: extra.name, duration: extra.duration||"10 min",
      text: extra.text, timer: extra.timer||"", lastWeight: extra.lastWeight||"", isExtra: true
    }));
    const finalSteps = [...recoveryExtra, ...chosen];
    return {
      skillKey,
      steps: finalSteps,
      totalMins: finalSteps.reduce((a,st)=>a+(parseInt(st.duration)||10),0),
    };
  }

  // ── PREHAB post-processing: pick 1 rotating non-plank stage + plank ──────
  if (skillKey === "prehab") {
    const nonPlank = steps;
    const dayIdx = Math.floor(new Date(todayKey()).getTime() / 86400000);
    const chosen = nonPlank.length > 0 ? [nonPlank[dayIdx % nonPlank.length]] : [];
    const plankStage = s.progression.find(st => st.text === "PROGRESSIVE_PLANK");
    const plankMerged = plankStage ? { stage:"Plank progression", text:"PROGRESSIVE_PLANK", duration:"3 min", timer:"" } : null;
    // Extra stages (from Settings or day additions) go at the TOP
    const prehabExtra = [];
    for (const extra of extraStagesForSkill) {
      prehabExtra.push({ stage: extra.name, duration: extra.duration||"10 min", text: extra.text, timer: extra.timer||"", lastWeight: extra.lastWeight||"", isExtra: true });
    }
    const finalSteps = [...prehabExtra, ...chosen, ...(plankMerged ? [plankMerged] : [])];
    return {
      skillKey,
      steps: finalSteps,
      totalMins: finalSteps.reduce((a,st)=>a+(parseInt(st.duration)||10),0),
    };
  }

  const baseMins = used;

  // custom added stages (indices beyond built-in progression length)
  // Added stages appear at the TOP of the session
  const addedSteps = [];
  const addedStages = Object.entries(customProg)
    .filter(([k,v]) => parseInt(k) >= s.progression.length && !_optionalChain([v, 'optionalAccess', _4 => _4.deleted]))
    .sort((a,b) => parseInt(a[0])-parseInt(b[0]));
  for (const [idx, entry] of addedStages) {
    const dur = (typeof entry==="object" ? entry.duration : null) || "10 min";
    if (dur === "0 min") continue;
    const name = typeof entry==="object" ? entry.name : "Custom";
    const text = typeof entry==="object" ? entry.text : entry;
    const timer = typeof entry==="object" ? (entry.timer||"") : "";
    const lastWeight = typeof entry==="object" ? (entry.lastWeight||"") : "";
    addedSteps.push({ stage: name, duration: dur, text, timer, lastWeight, isExtra: true, _cpIdx: parseInt(idx) });
    used += parseInt(dur) || 10;
  }

  // today's extra stages added from the session detail (temporary, per-day)
  for (const extra of extraStagesForSkill) {
    const dur = extra.duration || "10 min";
    addedSteps.push({ stage: extra.name, duration: dur, text: extra.text, timer: extra.timer||"", lastWeight: extra.lastWeight||"", isExtra: true });
    used += parseInt(dur) || 10;
  }

  // Prepend added steps so they appear first
  steps.unshift(...addedSteps);

  return { steps, totalMins: used, baseMins };
}

function getSkillHow(skillKey, totalMins, skillCount, partners=0) {
  const perSkill = skillCount > 0 ? Math.floor(totalMins / skillCount) : 30;
  if (!SKILLS[skillKey]) return "";
  const session = buildProgressionSession(skillKey, Math.max(perSkill, 8));
  if (!session) return "";
  return session.steps.map(st => `${st.stage} (${st.duration}): ${st.text}`).join("\n\n");
}

// returns the structured progression (used by the detail view to render
// numbered, expandable stages rather than a flat paragraph)
function getSkillProgression(skillKey, totalMins, skillCount) {
  const perSkill = skillCount > 0 ? Math.floor(totalMins / skillCount) : 30;
  return buildProgressionSession(skillKey, Math.max(perSkill, 8));
}

// ── skill rotation history ─────────────────────────────────────────────────────
// Reads every day's "done" record from storage and returns, for each skill,
// how many days ago it was last actually completed. Skills never done get
// a very high number so they're prioritised first.
function calcStreak(todayK) {
  let s = 0;
  const today = todayK || todayKey();
  const trainedDates = new Set();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("rwc_done_")) continue;
      const date = k.replace("rwc_done_", "");
      let record;
      try { record = JSON.parse(store.get(k) || "{}"); } catch (e6) { continue; }
      if (Object.values(record).some(v => v === true) || record["__retro_trained__"]) trainedDates.add(date);
    }
  } catch (e7) {}
  for (let i = 0; i < 500; i++) {
    const d = new Date(today+"T12:00:00");
    d.setDate(d.getDate() - i);
    const dateStr = localDateStr(d);
    if (trainedDates.has(dateStr)) s++;
    else break;
  }
  return s;
}

function getSkillLastTrained(todayKey) {
  const lastTrained = {};
  const allKeys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("rwc_done_")) allKeys.push(k);
    }
  } catch (e8) {}
  const today = new Date(todayKey+"T12:00:00");
  allKeys.forEach(k => {
    const dateStr = k.replace("rwc_done_", "");
    const d = new Date(dateStr+"T12:00:00");
    const daysAgo = Math.round((today - d) / 86400000);
    if (daysAgo < 0) return; // ignore future/invalid
    let record;
    try { record = JSON.parse(store.get(k) || "{}"); } catch (e9) { return; }
    Object.entries(record).forEach(([rawKey, wasDone]) => {
      if (!wasDone) return;
      // retro entries: __retro__<skillKey>__<id>
      if (rawKey.startsWith("__retro__") && !rawKey.endsWith("trained__")) {
        const sk = rawKey.split("__")[2];
        if (sk && SKILLS[sk]) {
          if (lastTrained[sk] === undefined || daysAgo < lastTrained[sk]) lastTrained[sk] = daysAgo;
        }
        return;
      }
      const cleanKey = rawKey.replace(/^__extra__/, '').replace(/__[a-z0-9]+$/, '').replace(/_pos\d+$/, '').replace(/_extra_[a-z0-9]+$/, '').replace(/_\d+$/, '');
      if (!cleanKey || !SKILLS[cleanKey]) return; // skip unknown skill keys
      if (lastTrained[cleanKey] === undefined || daysAgo < lastTrained[cleanKey]) {
        lastTrained[cleanKey] = daysAgo;
      }
    });
  });
  return lastTrained;
}

// ── CSV export / import — full data backup ─────────────────────────────────────
function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function exportAllDataToCsv(history, scores, reflections, customDrills) {
  const rows = [["type","date","field","value"]];

  // check-ins — one row per field per day
  Object.entries(history).forEach(([date, ci]) => {
    Object.entries(ci || {}).forEach(([field, value]) => {
      if (value === "" || value === null || value === undefined) return;
      rows.push(["checkin", date, field, typeof value === "object" ? JSON.stringify(value) : value]);
    });
  });

  // done/ticked skills per day
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("rwc_done_")) {
        const date = k.replace("rwc_done_", "");
        let record;
        try { record = JSON.parse(store.get(k) || "{}"); } catch (e10) { return; }
        Object.entries(record).forEach(([skillKey, wasDone]) => {
          if (wasDone) rows.push(["done", date, "skill", skillKey]);
        });
      }
    }
  } catch (e11) {}

  // scores
  (scores||[]).forEach(s => {
    rows.push(["score", s.date, s.skillKey, s.rating]);
  });

  // reflections
  (reflections||[]).forEach(r => {
    rows.push(["reflection", r.date, r.skillKey, r.text + (r.rating?` (rated ${r.rating}/5)`:"")]);
  });

  // custom drills
  Object.entries(customDrills||{}).forEach(([category, drills]) => {
    (drills||[]).forEach(d => {
      rows.push(["custom_drill", "", category, `${d.name}: ${d.execution}`]);
    });
  });

  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  return csv;
}

// ── pattern detection ──────────────────────────────────────────────────────────
// Scans all reflection notes and finds recurring themes, technical issues,
// and patterns across sessions. Returns coaching-grade insights.
const PATTERN_LIBRARY = [
  { key:"hesitate",
    words:["hesitat","too slow at the ruck","late to the ruck","arrived late","slow decision","couldn't decide","took too long","waited too long","not quick enough at the base"],
    label:"Hesitation at the ruck",
    coaching:"You're reading the defence on arrival, not on approach. The decision must be made 2 steps before you get there — call it out loud before the cone in every drill rep." },
  { key:"weakside",
    words:["left foot","left hand","weak side","weak hand","weak foot","off my left","weaker side","non-dominant","right to left","left to right"],
    label:"Weak side reliability",
    coaching:"Defenders are reading your preference. Start every session with your weaker side only — don't touch your strong side until the last third of the session." },
  { key:"height",
    words:["too flat","hang time","not high enough","low kick","kicking flat","ball too low","trajectory","not getting height","no height"],
    label:"Kicking trajectory",
    coaching:"Strike through the bottom third of the ball and follow through skyward. Count seconds of hang time on every kick — target 4.4s minimum." },
  { key:"pressure",
    words:["under pressure","when pressured","defender close","chased","rushed my kick","rushed the pass","got rushed","defender on me","pressure changed"],
    label:"Technique breaking under pressure",
    coaching:"The technique must be identical defended or undefended. Add a chaser to every drill rep — if the technique changes when someone is closing, you haven't grooved it yet." },
  { key:"scanning",
    words:["didn't see","not scanning","head down","missed the read","didn't look up","failed to scan","scan before","head was down","wrong read"],
    label:"Pre-ruck scanning",
    coaching:"Head must come up before the ruck clears. Narrate the defence out loud every rep in training — if you can't describe it, you didn't see it." },
  { key:"fatigue",
    words:["last few reps","end of session","tired at the end","quality dropped","faded","running out of energy","heavy legs","lost sharpness later","quality went"],
    label:"Quality dropping under fatigue",
    coaching:"Do your key technical set immediately after warm-up, not at the end. Fatigue is revealing the real technique — use it as diagnostic data, not an excuse." },
  { key:"passing",
    words:["pass was off","slow pass","pass under pressure","missed the target","pass went","delivery off","delivery was","slow ball","clean ball","quick ball"],
    label:"Passing consistency",
    coaching:"Film two sessions back to back. If the pattern repeats, it's technical. If it's random, it's attentional — you're not fully focused on the pass mechanics." },
  { key:"positive",
    words:["felt great","best session","clicked","really sharp","everything clicked","felt natural","best i've","on fire","nailed it","much better","big improvement"],
    label:"Breakthrough moments",
    coaching:"Record exactly what you did differently today — warm-up, mindset, cue you used. Replicate the conditions next session before you try to progress further." },
  { key:"kicking",
    words:["box kick","short kick","long kick","grubber","cross kick","fifty","clearing kick","kick off","kicking session","kick accuracy","land in"],
    label:"Kicking work in progress",
    coaching:"Track accuracy across sessions — cones hit vs attempts. Without a number you can't know if you're improving. Set a target each session before you start." },
];

function detectPatterns(reflections) {
  const patterns = [];
  PATTERN_LIBRARY.forEach(p => {
    const matchingNotes = reflections.filter(r => {
      const text = r.text.toLowerCase();
      return p.words.some(w => text.includes(w));
    });
    if (matchingNotes.length >= 2) {
      patterns.push({
        ...p,
        count: matchingNotes.length,
        recentDates: matchingNotes.slice(0,3).map(r=>r.date),
        recentSkills: [...new Set(matchingNotes.slice(0,4).map(r=>r.skillName||r.skillKey))],
        matchedTexts: matchingNotes.slice(0,2).map(r=>({
          text: r.text.slice(0,120),
          date: r.date,
          skillName: r.skillName||r.skillKey,
        })),
      });
    }
  });
  return patterns.sort((a,b) => b.count - a.count);
}

// ── monthly PDF export ─────────────────────────────────────────────────────────

function downloadCsv(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parses a CSV previously exported by this app and restores it into storage.
// Returns a summary of what was imported.
function parseCsvLine(line) {
  const out = [];
  let cur = "", inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cur += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function importCsvData(csvText) {
  const lines = csvText.split("\n").filter(l => l.trim());
  if (lines.length < 2) return { error: "Empty or invalid file" };
  const rows = lines.slice(1).map(parseCsvLine);

  const checkins = {};
  const doneRecords = {};
  const scores = [];
  const reflections = [];

  rows.forEach(([type, date, field, value]) => {
    if (type === "checkin") {
      if (!checkins[date]) checkins[date] = {};
      let v = value;
      // try to restore numeric fields
      if (["weight","timeMins","partners"].includes(field)) {
        const n = parseFloat(v); if (!isNaN(n)) v = n;
      }
      checkins[date][field] = v;
    } else if (type === "done") {
      if (!doneRecords[date]) doneRecords[date] = {};
      doneRecords[date][value] = true;
    } else if (type === "score") {
      scores.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2), date, skillKey: field, rating: parseInt(value) });
    } else if (type === "reflection") {
      reflections.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2), date, skillKey: field, skillName: _optionalChain([SKILLS, 'access', _5 => _5[field], 'optionalAccess', _6 => _6.name])||field, text: value });
    }
  });

  Object.entries(checkins).forEach(([date, data]) => {
    store.set("rwc_ci_"+date, JSON.stringify(data));
  });
  Object.entries(doneRecords).forEach(([date, data]) => {
    store.set("rwc_done_"+date, JSON.stringify(data));
  });
  if (scores.length) {
    const existing = JSON.parse(store.get("rwc_scores")||"[]");
    store.set("rwc_scores", JSON.stringify([...scores, ...existing]));
  }
  if (reflections.length) {
    const existing = JSON.parse(store.get("rwc_reflections")||"[]");
    store.set("rwc_reflections", JSON.stringify([...reflections, ...existing]));
  }

  return {
    checkins: Object.keys(checkins).length,
    done: Object.keys(doneRecords).length,
    scores: scores.length,
    reflections: reflections.length,
  };
}

// ── skill score average reader (for algorithm use outside React state) ──────────
function getSkillScoreAvg(skillKey) {
  try {
    const scores = JSON.parse(store.get("rwc_scores") || "[]");
    const relevant = scores
      .filter(s => s.skillKey === skillKey)
      .sort((a,b) => b.date.localeCompare(a.date)) // newest first
      .slice(0, 10); // last 10 sessions
    if (relevant.length === 0) return null;
    return relevant.reduce((a,b) => a + b.rating, 0) / relevant.length;
  } catch (e12) { return null; }
}

// ── Evidence-based supplement schedule for rugby union ────────────────────────
// Sources: PMC systematic review (2024), IRFU dietitian guidelines, NSCA position stand
// All doses are conservative and evidence-backed. Always choose Informed Sport-certified
// products — tested against WADA prohibited list. Consult your team doctor before starting.
const SKILL_TO_LIBRARY = {
  shortBoxKick:"kicking", longBoxKick:"kicking", grubber:"kicking",
  crossKick:"kicking", fiftyTwo:"kicking", clearingKick:"kicking",
  passing:"passing", agility:"agility",
  edgeDefense:"edgeDefense", highBall:"highBall", breakdown:"breakdown",
  mental:"mental", gameStudy:"gameStudy",
  prehab:"prehab",
  recovery:"recovery",
};

// Build DRILL_LIBRARY from SKILLS progressions so swap picks from real session stages
function buildDrillLibrary() {
  const lib = {};
  Object.entries(SKILLS).forEach(([sk, s]) => {
    const cat = SKILL_TO_LIBRARY[sk];
    if (!cat) return;
    if (!lib[cat]) lib[cat] = { label: s.name, icon: s.icon, color: s.color, drills: [] };
    (s.progression || []).forEach(stage => {
      lib[cat].drills.push({ name: stage.stage, execution: stage.text, solo: true, space: "park" });
    });
  });
  return lib;
}
const DRILL_LIBRARY = buildDrillLibrary();

const SUPPLEMENT_SCHEDULE = [
  {
    name: "Creatine monohydrate",
    dose: "3–5g",
    timing: "With breakfast",
    when: "morning",
    why: "Most researched performance supplement in sport. Increases explosive power and sprint capacity — directly relevant for a SH's 30+ high-speed efforts per match. Monohydrate is the only form with consistent evidence. No loading phase needed.",
    icon: "💊",
  },
  {
    name: "Omega-3 (EPA+DHA)",
    dose: "2–3g",
    timing: "With a fat-containing meal",
    when: "morning",
    why: "Reduces exercise-induced inflammation, supports brain function, and aids muscle recovery. Take with food containing fat for absorption. Look for products specifying EPA+DHA content — not just 'fish oil'.",
    icon: "🐟",
  },
  {
    name: "Vitamin D3",
    dose: "2000 IU",
    timing: "Morning — with breakfast",
    when: "morning",
    why: "Most athletes are deficient, especially in winter or low-sunlight environments. Supports bone density, immune function, muscle function, and testosterone regulation. D3 preferred over D2. Get blood levels tested to confirm you're in range.",
    icon: "☀️",
  },
  {
    name: "Magnesium glycinate",
    dose: "200–400mg",
    timing: "30–60 min before sleep",
    when: "night",
    why: "Supports sleep quality, muscle recovery, and nervous system function. Glycinate form is best absorbed and easiest on the stomach. Evening dosing is when the evidence is strongest. Especially important in high-volume training weeks.",
    icon: "🌙",
  },
  {
    name: "Beta-alanine",
    dose: "3.2g",
    timing: "Daily with food — any meal",
    when: "morning",
    why: "Take every day consistently — benefits are cumulative, not acute. Reduces muscular fatigue during repeated high-intensity efforts. The tingling (paraesthesia) is harmless — split across two doses if it bothers you. 4–6 weeks to see full benefit.",
    icon: "⚡",
  },
  {
    name: "Multivitamin",
    dose: "1 tablet",
    timing: "With breakfast",
    when: "morning",
    why: "Insurance against micronutrient gaps common in high-training-load athletes. Choose a sport-specific multivitamin tested for banned substances (Informed Sport logo). Not a replacement for a good diet — fills the gaps that training stress creates.",
    icon: "🌈",
  },
];


// GPS data (Cahill et al.): SH covers 7,098m/match — most of any position.
// Highest high-velocity running of all backs. Needs repeated sprint capacity.
// Injury profile: hamstrings #1 non-contact (Nordic curl prevents), groin #2
// (Copenhagen prevents), ankle most common joint injury (single-leg stability).
// Repeated ruck positions stress hip flexors and lumbar spine daily.
// Recovery: CWI 10°C/10min most evidence-supported. 8h+ sleep non-negotiable.
// Prehab must appear 2-3x/week for this injury profile — it's not optional.

const PHASE_WEIGHTS = {
  // Foundation: aerobic base + movement quality + technical fundamentals
  // SH needs high aerobic capacity (7km/match). Prehab load highest here.
  Foundation:  {
    passing:2.5, agility:2.5, breakdown:2,
    gameStudy:2, prehab:3, mental:1.5, recovery:2,
  },
  // Development: match-specific skills, power conversion, decision under fatigue
  Development: { shortBoxKick:2.5, edgeDefense:2, highBall:2, prehab:2.5, recovery:1.5,
  },
  // Sharpening: pressure work, match-pace only, opponent-specific prep
  Sharpening:  { shortBoxKick:3, longBoxKick:2, edgeDefense:2.5,
    clearingKick:2, fiftyTwo:2, prehab:2.5, mental:2, recovery:2,
  },
  // Tournament: sharp and familiar only. Protect freshness. Prehab never stops.
  Tournament:  { shortBoxKick:3, mental:3, clearingKick:2, prehab:3, recovery:2.5 },
};

// Pairs reflect real match-scenario connections so skills train as systems
const SKILL_PAIRS = {
  shortBoxKick:   "longBoxKick",
  longBoxKick:   "highBall",
  crossKick:      "highBall",
  fiftyTwo:      "clearingKick",
  clearingKick:  "shortBoxKick",
  passing:       "breakdown",
  breakdown:     "passing",
  edgeDefense:   "agility",
  highBall:      "longBoxKick",
  gameStudy:      "mental",
  mental:         "gameStudy",
};

// ── pre-session reflection helpers ────────────────────────────────────────────
function getPastReflections(reflections, skillKey, limit=3) {
  return (reflections||[])
    .filter(r => r.skillKey === skillKey)
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

function getBuildOnCue(lastReflection) {
  if (!_optionalChain([lastReflection, 'optionalAccess', _7 => _7.text])) return null;
  const t = lastReflection.text.toLowerCase();
  if (t.includes("lean forward") || t.includes("leaning forward"))
    return "Today: catch yourself the moment your weight shifts forward. Feel your lean before you strike.";
  if (t.includes("left foot") || t.includes("weak foot") || t.includes("left hand") || t.includes("weak hand"))
    return "Today: lead with your weaker side. Do the first full set left-only before touching the right.";
  if (t.includes("hesitat") || t.includes("slow") || t.includes("late"))
    return "Today: decide 2 steps earlier than feels comfortable. Commit before you feel ready.";
  if (t.includes("height") || t.includes("hang time") || t.includes("flat"))
    return "Today: count hang time aloud after every kick. If you stop counting before 3, it wasn't high enough.";
  if (t.includes("technique") || t.includes("mechanic") || t.includes("form") || t.includes("break down"))
    return "Today: slow it down to 70% until the movement feels clean, then build back to full pace.";
  if (t.includes("pressure") || t.includes("rushed") || t.includes("defender"))
    return "Today: add a cone 2m away as a simulated defender on every rep. Train in the discomfort.";
  if (t.includes("inconsist") || t.includes("some good"))
    return "Today: score yourself out of 10 on each set explicitly — write the number, don't just feel it.";
  if (t.includes("tired") || t.includes("fatigue") || t.includes("last few"))
    return "Today: do your hardest set first while you're fresh. Don't save the key work for when you're tired.";
  if (t.includes("right foot") || t.includes("strong side") || t.includes("dominant"))
    return "Today: deliberately start with the opposite side to your natural preference.";
  return "Today: focus on the one thing you wrote last time. That's where your growth is.";
}


function getTodaySkills(hrv, dow, notes, availableMins, space, partners=0, matchStatus=null) {
  // ── Constants ─────────────────────────────────────────────────────────────────
  const KICKING_SKILLS   = ["shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick"];
  const NEEDS_PITCH      = ["crossKick","fiftyTwo","edgeDefense","breakdown","highBall"];
  const NEEDS_OUTDOOR    = ["shortBoxKick","longBoxKick","grubber","clearingKick","passing","agility","highBall"];
  const HOME_OK          = ["mental","gameStudy","prehab","recovery"];
  const PARK_ONLY        = ["longBoxKick","clearingKick"];
  const MIN_GAP          = { prehab:2, mental:1, gameStudy:1, recovery:1 };
  const MIN_SKILL_MINS   = 10;

  const ALL_SKILLS = [
    "shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick",
    "agility","passing","breakdown","edgeDefense","highBall",
    "gameStudy","mental","prehab","recovery",
  ];

  // ── Settings ──────────────────────────────────────────────────────────────────
  let userSettings = { weaknesses:["shortBoxKick","longBoxKick"], excluded:[] };
  try { const s = JSON.parse(store.get("rwc_settings")||"null"); if (s) userSettings = s; } catch (e13) {}

  // Merge custom skills into algorithm
  const customSkills = userSettings.customSkills || [];
  customSkills.forEach(cs => {
    if (!ALL_SKILLS.includes(cs.key)) ALL_SKILLS.push(cs.key);
    if (cs.type === "kicking") KICKING_SKILLS.push(cs.key);
    if (cs.spaceNeeded === "pitch") NEEDS_PITCH.push(cs.key);
    if (cs.spaceNeeded === "outdoor") NEEDS_OUTDOOR.push(cs.key);
    if (cs.spaceNeeded === "home") HOME_OK.push(cs.key);
  });

  const EXCLUDED_SKILLS = userSettings.excluded || [];
  const WEAKNESSES      = new Set(userSettings.weaknesses || []);

  // ── Game feedback boost: skills flagged after last match get +5 for 3 days ──
  let GAME_FEEDBACK_BOOST = new Set();
  try {
    const feedbacks = JSON.parse(store.get("rwc_game_feedback")||"[]");
    if (feedbacks.length > 0) {
      const last = feedbacks[feedbacks.length - 1];
      const daysSince = (Date.now() - new Date(last.date).getTime()) / 86400000;
      if (daysSince < 3 && last.skills && last.skills.length > 0) {
        GAME_FEEDBACK_BOOST = new Set(last.skills);
      }
    }
  } catch (e14) {}
  let ACTIVE_SKILLS     = ALL_SKILLS.filter(sk => !EXCLUDED_SKILLS.includes(sk));

  // ── Match window overrides ────────────────────────────────────────────────
  if (_optionalChain([matchStatus, 'optionalAccess', _8 => _8.type]) === "recovery") {
    // 48h after match: prehab + mental only
    ACTIVE_SKILLS = ACTIVE_SKILLS.filter(sk =>
      ["prehab","mental","gameStudy","recovery"].includes(sk) ||
      customSkills.find(cs=>cs.key===sk&&(cs.type==="mental"||cs.type==="study"))
    );
  } else if (_optionalChain([matchStatus, 'optionalAccess', _9 => _9.type]) === "matchday") {
    // Match day: cognitive prime + mental + prehab only
    ACTIVE_SKILLS = ACTIVE_SKILLS.filter(sk =>
      ["prehab","mental"].includes(sk)
    );
  }

  // ── Phase ─────────────────────────────────────────────────────────────────────
  const currentDays = daysUntil(RWC_DATE);
  const phaseName = currentDays > 400 ? "Foundation"
    : currentDays > 250 ? "Development"
    : currentDays > 100 ? "Sharpening"
    : "Tournament";
  const phaseWeights = PHASE_WEIGHTS[phaseName] || {};

  // ── History ───────────────────────────────────────────────────────────────────
  const lastTrained = getSkillLastTrained(todayKey());  // {skillKey: daysAgo}
  const dayIndex    = Math.floor(new Date(todayKey()).getTime() / 86400000);

  // ── Context overrides ─────────────────────────────────────────────────────────
  const ctx = notes.context || {};
  const attachMeta = (arr, retry=[], opp=null, mandatory=false) => {
    arr._retrySkills       = retry;
    arr._opponentFocus     = opp;
    arr._opponentMandatory = mandatory;
    return arr;
  };

  if (ctx.matchDay)     return attachMeta([], [], null, false);
  if (ctx.preMatch)     return attachMeta(["prehab","mental"].filter(sk=>!EXCLUDED_SKILLS.includes(sk)));
  if (ctx.squadTraining) {
    const comp = ["prehab","mental","gameStudy","shortBoxKick"].filter(sk=>!EXCLUDED_SKILLS.includes(sk));
    return attachMeta(comp);
  }

  // ── Retry skills (poor recent performance) ────────────────────────────────────
  // Skills rated ≤2 in the last 48 hours — need re-exposure before motor pattern fades
  // Skills rated ≤2 three+ times in the last 7 days — chronic weakness, front of queue
  const retrySkills = [];
  try {
    const allScores  = JSON.parse(store.get("rwc_scores") || "[]")
      .sort((a,b) => b.date.localeCompare(a.date));
    const today7     = new Date(todayKey()); today7.setDate(today7.getDate()-7);
    const today2     = new Date(todayKey()); today2.setDate(today2.getDate()-2);
    const cut7       = localDateStr(today7);
    const cut2       = localDateStr(today2);

    const seen = new Set();
    const urgent = allScores.filter(s => s.date >= cut2 && s.rating <= 2);
    urgent.forEach(s => {
      if (!seen.has(s.skillKey) && ACTIVE_SKILLS.includes(s.skillKey)) {
        seen.add(s.skillKey); retrySkills.push(s.skillKey);
      }
    });

    // Chronically poor: ≤2 rating at least 3 times in last 7 days
    const week = allScores.filter(s => s.date >= cut7);
    const bySkill = {};
    week.forEach(s => { (bySkill[s.skillKey] = bySkill[s.skillKey]||[]).push(s.rating); });
    Object.entries(bySkill).forEach(([sk, ratings]) => {
      if (!seen.has(sk) && ACTIVE_SKILLS.includes(sk) && ratings.filter(r=>r<=2).length >= 3) {
        seen.add(sk); retrySkills.push(sk);
      }
    });
  } catch (e15) {}

  // ── Opponent focus ────────────────────────────────────────────────────────────
  const POOL_MATCHES = [
    { opponent:"Ireland",  date:new Date("2027-10-04") },
    { opponent:"Uruguay",  date:new Date("2027-10-11") },
    { opponent:"Scotland", date:new Date("2027-10-17") },
  ];
  const todayDate = new Date(todayKey());
  const upcoming  = POOL_MATCHES.filter(m => m.date > todayDate);
  let opponentFocus = null, opponentMandatory = false;
  if (upcoming.length > 0) {
    const nearest = upcoming[0];
    const daysTo  = Math.ceil((nearest.date - todayDate) / 86400000);
    if (daysTo <= 21) {
      opponentFocus = nearest.opponent; opponentMandatory = true;
    } else {
      // weighted pool: closer match gets more entries
      const pool = [];
      upcoming.forEach(m => {
        const d = Math.ceil((m.date - todayDate) / 86400000);
        const weight = d <= 90 ? 3 : d <= 180 ? 2 : 1;
        for (let i=0; i<weight; i++) pool.push(m.opponent);
      });
      opponentFocus = pool[dayIndex % pool.length];
    }
  }

  // ── Skill scoring function ─────────────────────────────────────────────────────
  // Returns a "virtual days since trained" score — higher = more urgent
  // Combines recency, quality history, phase priority and weakness status
  function skillScore(sk) {
    const days    = _nullishCoalesce(lastTrained[sk], () => ( 999));    // days since last session (999 = never)
    const avgRt   = getSkillScoreAvg(sk);      // recent average rating (null = no data)

    // Quality adjustment: poor ratings make skill MORE urgent, great ratings less
    // Scale: ≤2 avg = +4 days urgency, ≤3 = +2, ≥4.5 = -1
    const qualityBonus = avgRt === null ? 0
      : avgRt <= 2   ? 4
      : avgRt <= 3   ? 2
      : avgRt >= 4.5 ? -1
      : 0;

    // Phase weight: skills prioritised in this training phase get bonus
    // phaseWeights value is 2–3, subtract 1 to get 1–2 bonus days
    const phaseBonus = phaseWeights[sk] ? phaseWeights[sk] - 1 : 0;

    // Weakness bonus: user-identified weaknesses are always higher priority
    const weaknessBonus = WEAKNESSES.has(sk) ? 3 : 0;

    // Game feedback boost: skills flagged after last match get priority for 3 days
    const gameBonus = GAME_FEEDBACK_BOOST.has(sk) ? 5 : 0;

    return days + qualityBonus + phaseBonus + weaknessBonus + gameBonus;
  }

  // ── Build candidate pool ──────────────────────────────────────────────────────
  // Start from all active skills, excluding:
  //   - Skills trained too recently (respecting minimum gap per skill type)
  //   - Unless they're in retrySkills (poor rating overrides rest)
  const candidatePool = ACTIVE_SKILLS.filter(sk => {
    if (retrySkills.includes(sk)) return true;           // always include retries
    const days = _nullishCoalesce(lastTrained[sk], () => ( 999));
    const minGap = _nullishCoalesce(MIN_GAP[sk], () => ( 1));                    // default: don't repeat same day
    return days >= minGap;
  });

  // ── Space filtering ───────────────────────────────────────────────────────────
  let spaceFiltered = [...candidatePool];
  if (space === "none") {
    spaceFiltered = spaceFiltered.filter(sk => sk === "mental" || sk === "gameStudy");
  } else if (space === "home") {
    spaceFiltered = spaceFiltered.filter(sk =>
      HOME_OK.includes(sk) || (!NEEDS_PITCH.includes(sk) && !NEEDS_OUTDOOR.includes(sk))
    );
  } else if (space === "park") {
    spaceFiltered = spaceFiltered.filter(sk =>
      !NEEDS_PITCH.includes(sk) && !PARK_ONLY.includes(sk)
    );
  } else if (space === "gym") {
    spaceFiltered = spaceFiltered.filter(sk =>
      HOME_OK.includes(sk) || sk === "agility" ||
      (!NEEDS_PITCH.includes(sk) && !NEEDS_OUTDOOR.includes(sk))
    );
  }
  // pitch or both: no filtering

  // ── Injury filtering from body map zones ─────────────────────────────────────
  const injuryZones = new Set(notes.injuryZones||[]);
  if (injuryZones.size > 0) {
    const legZones   = ["lHamstring","rHamstring","lQuad","rQuad","lKnee","rKnee","lAnkle","rAnkle","lAchilles","rAchilles","lShin","rShin","lCalf","rCalf","lGlute","rGlute"];
    const upperZones = ["lShoulder","rShoulder","lElbow","rElbow","lWrist","rWrist","chest"];
    const backZones  = ["upperBack","lowerBack","neck"];

    const hasLeg   = legZones.some(z=>injuryZones.has(z));
    const hasUpper = upperZones.some(z=>injuryZones.has(z));
    const hasBack  = backZones.some(z=>injuryZones.has(z));
    const hasHead  = injuryZones.has("head");

    if (hasHead) {
      spaceFiltered = spaceFiltered.filter(sk => sk==="mental" || sk==="gameStudy");
    } else {
      if (hasLeg)   spaceFiltered = spaceFiltered.filter(sk => !["shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick","agility","highBall"].includes(sk));
      if (hasUpper) spaceFiltered = spaceFiltered.filter(sk => !["passing","breakdown","highBall"].includes(sk));
      if (hasBack)  spaceFiltered = spaceFiltered.filter(sk => !["breakdown","shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick"].includes(sk));
      // Always keep prehab when injured
      if (!spaceFiltered.includes("prehab") && !EXCLUDED_SKILLS.includes("prehab")) spaceFiltered.push("prehab");
    }
  } else if (notes.injury) {
    // legacy text-based injury flags
    const inj = notes.injury;
    if (!inj.kickOk)  spaceFiltered = spaceFiltered.filter(sk => !["shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick"].includes(sk));
    if (!inj.pitchOk) spaceFiltered = spaceFiltered.filter(sk => !["breakdown","passing","edgeDefense","highBall"].includes(sk));
    if (!inj.gymOk)   spaceFiltered = spaceFiltered.filter(sk => !["agility","breakdown"].includes(sk));
    if (!spaceFiltered.includes("prehab") && !EXCLUDED_SKILLS.includes("prehab")) spaceFiltered.push("prehab");
    if (!spaceFiltered.includes("mental") && !EXCLUDED_SKILLS.includes("mental")) spaceFiltered.push("mental");
  }

  // ── Rank by urgency score ─────────────────────────────────────────────────────
  let ranked = [...spaceFiltered].sort((a, b) => {
    const diff = skillScore(b) - skillScore(a);
    if (diff !== 0) return diff;
    // Tiebreak: deterministic daily rotation (not random, not fixed)
    return ((spaceFiltered.indexOf(a) + dayIndex) % spaceFiltered.length)
         - ((spaceFiltered.indexOf(b) + dayIndex) % spaceFiltered.length);
  });

  // ── Structural injections ────────────────────────────────────────────────────
  // Retry skills always at front
  retrySkills.forEach(sk => {
    ranked = ranked.filter(s => s !== sk);
    ranked.unshift(sk);
  });

  // Opponent gameStudy mandatory in final 21 days
  if (opponentMandatory && !ranked.slice(0,3).includes("gameStudy")) {
    ranked = ranked.filter(s => s !== "gameStudy");
    ranked.splice(1, 0, "gameStudy");
  }

  // Focus flags from check-in (player said "I want to work on X today")
  // Only inject if space allows it and skill isn't excluded
  const focusMap = [
    [notes.focusKick,      KICKING_SKILLS.find(k=>spaceFiltered.includes(k)) || "shortBoxKick"],
    [notes.focusGrubber,   "grubber"],
    [notes.focusCrossKick, "crossKick"],
    [notes.focus5022,      "fiftyTwo"],
    [notes.focusClearing,  "clearingKick"],
    [notes.focusPass,      "passing"],
    [notes.focusBreakdown, "breakdown"],
    [notes.focusRunning,   ],
    [notes.focusDefense,   "edgeDefense"],
    [notes.focusHighBall,  "highBall"],
    [notes.focusWeakHand,  "passing"],
  ];
  focusMap.forEach(([flag, sk]) => {
    if (flag && sk && !EXCLUDED_SKILLS.includes(sk) && spaceFiltered.includes(sk) && !ranked.includes(sk)) {
      ranked.unshift(sk);
    } else if (flag && sk && ranked.includes(sk) && ranked.indexOf(sk) > 0) {
      ranked = ranked.filter(s => s !== sk);
      ranked.unshift(sk);
    }
  });

  // ── Time fitting ──────────────────────────────────────────────────────────────
  const totalMins = availableMins > 0 ? availableMins : 15;
  let minsLeft = totalMins;
  const finalSkills = [];

  // For 90+ min sessions: target more skills with a per-skill cap
  // Aim for variety: at least 1 kicking, 1 physical, 1 mental/study, 1 prehab
  const isLongSession = totalMins >= 90;
  const targetSkillCount = isLongSession
    ? Math.min(ranked.length, Math.floor(totalMins / 20)) // ~20 min per skill minimum
    : 999; // no cap for shorter sessions

  // Per-skill time budget: cap at ~45min per skill for long sessions for variety
  const perSkillCap = isLongSession ? Math.min(45, Math.floor(totalMins / 3)) : totalMins;

  for (const sk of [...new Set(ranked)]) {
    if (minsLeft < MIN_SKILL_MINS) break;
    if (finalSkills.length >= targetSkillCount) break;
    const allocatedMins = Math.min(minsLeft, perSkillCap);
    const session = buildProgressionSession(sk, allocatedMins);
    if (!session) continue;
    if (session.totalMins >= MIN_SKILL_MINS || finalSkills.length === 0) {
      finalSkills.push(sk);
      minsLeft -= Math.min(session.totalMins, perSkillCap);
    }
    if (minsLeft <= 0) break;
  }

  if (finalSkills.length === 0 && ranked.length > 0) finalSkills.push(ranked[0]);

  return attachMeta(finalSkills, retrySkills, opponentFocus, opponentMandatory);
}

// ── notes parser ──────────────────────────────────────────────────────────────
const BODY_MAP = [
  { words:["hand","finger","wrist","thumb","knuckle","broken hand","fractured"],
    part:"hand/wrist", kickOk:true, pitchOk:false, gymOk:false,
    note:"No grip work. Kicking is fine." },
  { words:["shoulder","rotator","cuff","collarbone"],
    part:"shoulder", kickOk:true, pitchOk:false, gymOk:false,
    note:"No pressing or pulling. Kicking and lower body fine." },
  { words:["hamstring","back of leg"],
    part:"hamstring", kickOk:false, pitchOk:false, gymOk:false,
    note:"No sprinting, kicking or leg work. Upper body and mental only." },
  { words:["knee","patella","acl","mcl"],
    part:"knee", kickOk:false, pitchOk:false, gymOk:false,
    note:"No loading the knee. Upper body and mental only." },
  { words:["calf","achilles","shin"],
    part:"calf/shin", kickOk:false, pitchOk:false, gymOk:false,
    note:"No sprinting or jumping. Upper body only." },
  { words:["ankle","sprain"],
    part:"ankle", kickOk:false, pitchOk:false, gymOk:false,
    note:"No weight-bearing movement. Rest and upper body only." },
  { words:["back","spine","lumbar","disc"],
    part:"back", kickOk:false, pitchOk:false, gymOk:false,
    note:"No loading. Mobility and mental work only." },
  { words:["rib","ribs","chest"],
    part:"ribs/chest", kickOk:true, pitchOk:false, gymOk:false,
    note:"No contact or heavy breathing. Kicking and lower body only." },
  { words:["groin","hip flexor","hip","adductor"],
    part:"groin/hip", kickOk:false, pitchOk:false, gymOk:false,
    note:"No sprinting or kicking. Upper body only." },
];

function parseNotes(notes) {
  if (!notes || !notes.trim()) return {};
  const t = notes.toLowerCase();
  const flags = {};
  for (const p of BODY_MAP) {
    if (p.words.some(w => t.includes(w))) { flags.injury = p; break; }
  }
  if (!flags.injury && (t.includes("tight")||t.includes("sore")||t.includes("pain")||t.includes("stiff")))
    flags.tightness = notes.trim();
  if (t.includes("grubber"))                               flags.focusGrubber = true;
  else if (t.includes("cross kick")||t.includes("cross-kick")||t.includes("crosskick")) flags.focusCrossKick = true;
  else if (t.includes("50-22")||t.includes("50:22")||t.includes("5022"))                flags.focus5022 = true;
  else if (t.includes("clearing")||t.includes("clear out")||t.includes("clearout"))     flags.focusClearing = true;
  else if (t.includes("kick"))                             flags.focusKick = true;
  if (t.includes("decision")||t.includes("hesit"))        flags.focusDecision = true;
  if (t.includes("left hand")||t.includes("weak hand"))   flags.focusWeakHand = true;
  if (t.includes("pass")&&!t.includes("kick"))            flags.focusPass = true;
  if (t.includes("breakdown")||t.includes("ruck"))        flags.focusBreakdown = true;
  if (t.includes("running")||t.includes("first step"))    flags.focusRunning = true;
  if (t.includes("defense")||t.includes("defence")||t.includes("tackl")||t.includes("edge")) flags.focusDefense = true;
  if (t.includes("high ball")||t.includes("highball")||t.includes("aerial")||t.includes("kick chase")||t.includes("catching")) flags.focusHighBall = true;
  flags.raw = notes.trim();
  return flags;
}


// Based on Athlete's Mindset pillars: confidence, focus, self-talk,
// visualisation, pre-performance routines, adversity, reset under pressure

// ── Daily mental performance tasks (Athlete's Mindset style) ─────────────────
const MENTAL_TASKS = [
  { pillar:"Visualisation", icon:"🎬", duration:"5 min", title:"Full ruck sequence visualisation",
    task:"Close your eyes. You're arriving at a ruck 10 metres out. See the defensive line — count them. The ball is out. Scan left, scan right, make the call and execute in under 0.5 seconds. Run through this exact sequence 10 times. See your hands, feel the ball, hear the contact. Make it real." },
  { pillar:"Visualisation", icon:"🎬", duration:"5 min", title:"Pressure moment rehearsal",
    task:"Pick one high-pressure moment from your last game. Replay it. This time you arrive early, communicate clearly, execute cleanly. Repeat it 5 times until the successful version feels more real than what actually happened." },
  { pillar:"Visualisation", icon:"🎬", duration:"4 min", title:"Perfect box kick — 10 reps",
    task:"Visualise arriving at the ruck with the blitz on. Feel the ball in your hands, your feet setting, the arc of the kick spiralling over the defence and landing inside the 22. Same technique every time. 10 reps. Build the groove." },
  { pillar:"Visualisation", icon:"🎬", duration:"5 min", title:"RWC — Ireland, 4 Oct 2027",
    task:"You're running out. 80,000 people. Ireland. World Cup. Feel the ground, the noise, the adrenaline. Now breathe. You are completely ready — the best shape of your career, the sharpest your decision-making has ever been. That moment is being built in sessions exactly like today." },
  { pillar:"Confidence", icon:"💪", duration:"5 min", title:"Evidence log — prove it",
    task:"Write 5 specific moments from the last 30 days where you performed well under pressure. Time, place, what happened, what you did. 'Tuesday session — box kick under pressure, three in a row, all landed in the 22.' Confidence is built on proof. Read them back slowly." },
  { pillar:"Confidence", icon:"💪", duration:"4 min", title:"Identity statement",
    task:"Say this out loud, 3 times, slowly: 'I am a composed, decisive #9. I read the game fast. I back my first decision.' Then add one specific strength a coach or teammate has acknowledged. Repetition is how your brain stores identity. Out loud — not in your head." },
  { pillar:"Confidence", icon:"💪", duration:"6 min", title:"Best performance audit",
    task:"Think of your best ever performance. Write: what was your mindset before? What did your warm-up look like? What were you thinking in the first 5 minutes? You did it once — the conditions that made it possible are replicable. Map them. Use them again." },
  { pillar:"Focus", icon:"🎯", duration:"5 min", title:"Three controllables for today",
    task:"Write exactly three things you will focus on today that are 100% within your control. Not outcomes — behaviours. 'Scan both sides before every pick-up.' 'Call the play before the ball is out.' 'Reset posture after every error.' Check them at half-time." },
  { pillar:"Focus", icon:"🎯", duration:"4 min", title:"Attention reset drill",
    task:"Set a timer for 90 seconds. Breathe slowly. Focus only on the sensation of your exhale. When your mind drifts, notice it and return. This is the exact skill you use to reset after a mistake on the field. Train it here first." },
  { pillar:"Focus", icon:"🎯", duration:"4 min", title:"Cue word for today",
    task:"Pick one word that represents how you want to compete today — sharp, decisive, composed, relentless. Write it on your wrist. Every time you feel pressure today, say that word internally. One word. One breath. Then act." },
  { pillar:"Self-talk", icon:"🗣️", duration:"5 min", title:"Reframe your inner critic",
    task:"Write the harshest thing you say to yourself after a mistake. Now rewrite it as a coach who believes in you would say it — honest but forward-looking. 'That was slow' becomes 'Scan earlier, trust the first read.' Use the reframe the next time the critic shows up." },
  { pillar:"Self-talk", icon:"🗣️", duration:"4 min", title:"Ruck ball script",
    task:"Write a 10-word internal script for every ruck today. Something that primes your best state. 'Ball's out — scan, decide, go.' Memorise it. Use it at every single ruck in training. By rep 20 it becomes automatic." },
  { pillar:"Self-talk", icon:"🗣️", duration:"5 min", title:"Error response protocol",
    task:"Design your post-mistake routine: a physical reset (one clap) + one phrase ('next play') + a breath. Write it. Practise it 5 times right now. Having a fixed protocol stops the spiral. The best 9s recover in under 3 seconds." },
  { pillar:"Routine", icon:"⚡", duration:"6 min", title:"Build your activation sequence",
    task:"Map your pre-training sequence: what movement, what music, what breathing, what self-talk brings you to your best state. Write the order. Time it. Use it before every session this week and track whether it works." },
  { pillar:"Routine", icon:"⚡", duration:"4 min", title:"4-7-8 activation breathing",
    task:"Do 4 cycles: inhale 4 counts, hold 7, exhale 8. Then 10 sharp exhales through the nose. This activates the parasympathetic system and sharpens attention within 90 seconds. Do it now, then again before training." },
  { pillar:"Routine", icon:"⚡", duration:"4 min", title:"Set your intention",
    task:"Write one sentence that captures how you intend to compete today — not a goal, an intention. 'Today I train like the player I am becoming.' Read it out loud before you leave. Mean it." },
  { pillar:"Adversity", icon:"🔥", duration:"5 min", title:"Pressure inoculation",
    task:"Imagine the worst realistic scenario in your next match. See it happen. Now see yourself: one breath, clap hands, communicate, focus on the next play. You respond, not react. Run through it 5 times until the calm response feels natural." },
  { pillar:"Adversity", icon:"🔥", duration:"5 min", title:"Opposition plan — one threat",
    task:"Pick one specific thing your next opponent does that could disrupt your game. Write your exact counter. 'If they rush: blindside pick early before they set.' Solutions, not anxiety." },
  { pillar:"Adversity", icon:"🔥", duration:"4 min", title:"3-question error debrief",
    task:"Think of the last mistake you made in a game. Answer: What exactly happened? What does it tell me technically? What will I do differently? No emotion, no punishment — just analysis. Elite players process errors fast and move forward." },
  { pillar:"Competition", icon:"🏆", duration:"5 min", title:"Competitive standards — your metrics",
    task:"Write what 'excellent' looks like in three specific areas. Not 'play well' — '90% accuracy at ruck ball. Communicate every lineout call 5 seconds early. Scan both sides at every breakdown.' Score yourself from the last session. That gap is today's target." },
  { pillar:"Competition", icon:"🏆", duration:"5 min", title:"Intelligent comparison",
    task:"Think of the best #9 in your competition. Write one thing they do consistently that you don't yet. Then write one thing you do that they don't. Own both. Use the gap as a training target — not self-criticism, competitive intelligence." },
];

const JOURNAL_PROMPTS = [
  "What was the sharpest moment in training today — and why did it work?",
  "What decision did you make under pressure today? Would you make the same one again?",
  "What did you avoid today that you should have attacked?",
  "Where did your attention go when it shouldn't have?",
  "What's one thing you did today that your future self will thank you for?",
  "What did a teammate or opponent do today that you can learn from?",
  "What's the gap between how you trained today and how you want to play in October 2027?",
  "What physical feeling do you want to carry into your next session?",
  "Where did you slow down when you should have accelerated?",
  "What would your best ever performance say about today's session?",
  "What's the one thing you need to fix before the next game?",
  "Did you compete today or just train? What's the difference in how it felt?",
  "What pattern are you repeating that you need to break?",
  "What were you thinking at the ruck before the best decision you made today?",
  "What's the conversation you need to have with a coach or teammate this week?",
  "If Ireland's coaching staff watched today's session, what would they say?",
  "What did fatigue reveal about your game today?",
  "What are you most proud of from the last 7 days?",
  "What's the thing you've been putting off that would make the biggest difference?",
  "How did your body feel today — and what is it telling you?",
  "What would you do differently if you could replay today's session from the start?",
];

function CustomSkillForm({onSave, onCancel, BD, S1, S2, T1, T2, T3, GOLD, GRNA, REDA, PRP, AMB, BLU}) {
  const [name, setName]   = useState("");
  const [icon, setIcon]   = useState("⭐");
  const [color, setColor] = useState(GOLD);
  const [why, setWhy]     = useState("");
  const [type, setType]   = useState("physical");
  const [space, setSpace] = useState("home");
  const [stages, setStages] = useState([{name:"",text:"",duration:"10 min",timer:""}]);

  const COLORS = [GOLD,"#0a84ff","#30d158","#ff9f0a","#ff375f","#bf5af2","#64d2ff","#ff6b6b"];
  const key = name.trim().toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,20) || "custom"+Date.now().toString(36);

  const inp = (val,set,ph,multiline=false) => multiline
    ? React.createElement('textarea', { value: val, onChange: e=>set(e.target.value), placeholder: ph,
        style: {width:"100%",minHeight:60,padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,lineHeight:1.6,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1386}})
    : React.createElement('input', { value: val, onChange: e=>set(e.target.value), placeholder: ph,
        style: {width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1388}});

  return (
    React.createElement('div', { style: {borderRadius:12,border:`1px solid ${GOLD}44`,padding:"14px",background:S1+"88"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1392}}
      , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:GOLD,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1393}}, "New skill" )

      /* icon + name */
      , React.createElement('div', { style: {display:"flex",gap:8,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1396}}
        , React.createElement('input', { value: icon, onChange: e=>setIcon(e.target.value), placeholder: "⭐",
          style: {width:44,padding:"8px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:20,outline:"none",textAlign:"center",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1397}})
        , inp(name,setName,"Skill name (e.g. Lineout throw)")
      )

      /* color picker */
      , React.createElement('div', { style: {marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1403}}
        , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1404}}, "Colour")
        , React.createElement('div', { style: {display:"flex",gap:6,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1405}}
          , COLORS.map(c=>(
            React.createElement('button', { key: c, onClick: ()=>setColor(c), style: {width:28,height:28,borderRadius:"50%",background:c,border:color===c?"2.5px solid #fff":"2px solid transparent",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1407}})
          ))
        )
      )

      /* type */
      , React.createElement('div', { style: {marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1413}}
        , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1414}}, "Type (affects readiness scoring)"   )
        , React.createElement('div', { style: {display:"flex",gap:5,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1415}}
          , [["kicking","⚽ Kicking"],["passing","🏉 Passing"],["physical","💪 Physical"],["defence","🛡️ Defence"],["mental","🧠 Mental"],["study","📖 Study"]].map(([v,l])=>(
            React.createElement('button', { key: v, onClick: ()=>setType(v), style: {padding:"7px 10px",borderRadius:8,border:`1px solid ${type===v?GOLD:BD}`,background:type===v?GOLD+"22":"transparent",color:type===v?GOLD:T3,fontSize:11,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1417}}, l)
          ))
        )
      )

      /* space needed */
      , React.createElement('div', { style: {marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1423}}
        , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1424}}, "Space needed" )
        , React.createElement('div', { style: {display:"flex",gap:5,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1425}}
          , [["home","🏠 Home"],["outdoor","🌳 Outdoor"],["pitch","🏟️ Pitch"],["gym","🏋️ Gym"]].map(([v,l])=>(
            React.createElement('button', { key: v, onClick: ()=>setSpace(v), style: {padding:"6px 10px",borderRadius:8,border:`1px solid ${space===v?GOLD:BD}`,background:space===v?GOLD+"22":"transparent",color:space===v?GOLD:T3,fontSize:11,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1427}}, l)
          ))
        )
      )

      /* why */
      , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1433}}, "Why this skill matters"   )
      , inp(why,setWhy,"Why is this important for your game?",true)

      /* stages */
      , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1437}}, "Exercise stages" )
      , stages.map((st,i)=>(
        React.createElement('div', { key: i, style: {background:S2,borderRadius:10,padding:"10px 12px",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1439}}
          , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1440}}, "Stage " , i+1)
          , React.createElement('input', { value: st.name, onChange: e=>setStages(s=>s.map((x,j)=>j===i?{...x,name:e.target.value}:x)),
            placeholder: "Stage name" ,
            style: {width:"100%",padding:"7px 10px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1441}})
          , React.createElement('textarea', { value: st.text, onChange: e=>setStages(s=>s.map((x,j)=>j===i?{...x,text:e.target.value}:x)),
            placeholder: "What to do, how many reps, coaching cues..."       ,
            style: {width:"100%",minHeight:52,padding:"7px 10px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:12,lineHeight:1.5,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1444}})
          , React.createElement('div', { style: {display:"flex",gap:6,boxSizing:"border-box"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1447}}
            , React.createElement('input', { value: st.duration, onChange: e=>setStages(s=>s.map((x,j)=>j===i?{...x,duration:e.target.value}:x)),
              placeholder: "10 min" ,
              style: {flex:1,minWidth:0,padding:"6px 8px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1448}})
            , React.createElement('input', { value: st.timer, onChange: e=>setStages(s=>s.map((x,j)=>j===i?{...x,timer:e.target.value}:x)),
              placeholder: "e.g. 30 sec"  ,
              style: {flex:1,minWidth:0,padding:"6px 8px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1451}})
            , stages.length>1&&React.createElement('button', { onClick: ()=>setStages(s=>s.filter((_,j)=>j!==i)),
              style: {flexShrink:0,padding:"6px 10px",borderRadius:7,border:"none",background:"transparent",color:REDA,fontSize:12,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1454}}, "✕")
          )
        )
      ))
      , React.createElement('button', { onClick: ()=>setStages(s=>[...s,{name:"",text:"",duration:"10 min",timer:""}]),
        style: {width:"100%",padding:"8px",borderRadius:8,border:`1px dashed ${BD}`,background:"transparent",color:T3,fontSize:12,cursor:"pointer",marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1459}}, "+ Add stage"  )

      , React.createElement('div', { style: {display:"flex",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1462}}
        , React.createElement('button', { onClick: ()=>{
          if (!name.trim()) return;
          onSave({ key, name:name.trim(), icon, color, why, type, spaceNeeded:space, stages });
        }, style: {flex:1,padding:"10px",borderRadius:10,border:"none",background:GRNA,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1463}}, "Save skill" )
        , React.createElement('button', { onClick: onCancel, style: {padding:"10px 14px",borderRadius:10,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:12,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1467}}, "Cancel")
      )
    )
  );
}

function PlankProgressionCard({store, todayK, haptic, GOLD, GRNA, BG, T1, T2, T3, S1, S2, BD, REDA}) {
  const plankKey = "rwc_plank_pb";
  const [pb, setPb] = useState(() => { try { return JSON.parse(store.get(plankKey)||"null"); } catch (e16) { return null; } });
  const sessionsDone = _optionalChain([pb, 'optionalAccess', _10 => _10.sessions]) || 0;
  const alreadyDoneToday = _optionalChain([pb, 'optionalAccess', _11 => _11.lastDate]) === todayK;

  // Progression design:
  // Each level goes from its START_SECS to 60s in 5s steps
  // Start time decreases as weight increases (harder to hold longer)
  // but never resets to 20s — carries over effort from previous level
  const LEVELS = [
    { kg: 0,  startSecs: 40 }, // bodyweight: 40→60s = 5 sessions
    { kg: 10, startSecs: 45 }, // 10kg: 45→60s = 4 sessions  (feels close to BW 60s)
    { kg: 20, startSecs: 40 }, // 20kg: 40→60s = 5 sessions
    { kg: 30, startSecs: 35 }, // 30kg: 35→60s = 6 sessions
    { kg: 40, startSecs: 30 }, // 40kg: 30→60s = 7 sessions
    { kg: 50, startSecs: 25 }, // 50kg: 25→60s = 8 sessions (elite)
  ];

  // Compute which level and position we're at from sessionsDone
  function getProgressionState(sessions) {
    let remaining = sessions;
    for (let lvl = 0; lvl < LEVELS.length; lvl++) {
      const { kg, startSecs } = LEVELS[lvl];
      const steps = Math.round((60 - startSecs) / 5) + 1; // number of sessions at this level
      if (remaining < steps || lvl === LEVELS.length - 1) {
        const secs = Math.min(60, startSecs + remaining * 5);
        const nextLevel = LEVELS[lvl + 1];
        return {
          weightKg: kg,
          targetSecs: secs,
          isLastLevel: lvl === LEVELS.length - 1,
          nextKg: _nullishCoalesce(_optionalChain([nextLevel, 'optionalAccess', _12 => _12.kg]), () => ( null)),
          nextSecs: remaining + 1 < steps
            ? Math.min(60, startSecs + (remaining + 1) * 5)
            : _nullishCoalesce(_optionalChain([nextLevel, 'optionalAccess', _13 => _13.startSecs]), () => ( null)),
          levelUp: remaining + 1 >= steps && !!nextLevel,
          sessionsInLevel: remaining,
          totalStepsInLevel: steps,
        };
      }
      remaining -= steps;
    }
  }

  const state = getProgressionState(sessionsDone);
  const { weightKg, targetSecs, nextKg, nextSecs, levelUp, isLastLevel } = state;
  const weightLabel = kg => kg === 0 ? "Bodyweight" : `${kg}kg plate`;
  const fmt = s => s >= 60 ? `${Math.floor(s/60)}m${s%60>0?` ${s%60}s`:""}` : `${s}s`;
  const nextLabel = levelUp
    ? `↑ ${nextKg}kg plate · start at ${fmt(_nullishCoalesce(nextSecs, () => (20)))}`
    : nextSecs ? fmt(nextSecs) + (weightKg>0?` @ ${weightKg}kg`:"") : "Max reached!";

  const [timerState, setTimerState] = useState(alreadyDoneToday ? "logged" : "idle");
  const [remaining, setRemaining]   = useState(targetSecs);
  const [showManual, setShowManual] = useState(false);
  const [manualKg, setManualKg]     = useState("");
  const [manualSecs, setManualSecs] = useState("");
  const intervalRef = useRef(null);
  const startRef    = useRef(null);
  const remainAtStart = useRef(targetSecs);

  useEffect(() => () => clearInterval(intervalRef.current), []);
  useEffect(() => {
    if (timerState !== "running") { clearInterval(intervalRef.current); return; }
    startRef.current = Date.now();
    remainAtStart.current = remaining;
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const left = Math.max(0, remainAtStart.current - elapsed);
      setRemaining(left);
      if (left === 0) { clearInterval(intervalRef.current); setTimerState("done"); haptic && haptic("heavy"); }
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [timerState]);

  function startTimer() { setTimerState("running"); }
  function pauseTimer() { clearInterval(intervalRef.current); remainAtStart.current = remaining; setTimerState("idle"); }
  function resetTimer() { clearInterval(intervalRef.current); setRemaining(targetSecs); setTimerState("idle"); }

  function logDone() {
    // Log activeSecs as what was done. Always keep weightKg as the actual progression level
    // (noWeight is just a convenience mode — it doesn't change where you are in the progression)
    const newPb = { sessions: sessionsDone+1, lastTarget: activeSecs, weightKg, lastDate: todayK };
    store.set(plankKey, JSON.stringify(newPb));
    setPb(newPb);
    haptic && haptic("medium");
    setTimerState("logged");
  }

  function applyManual() {
    const kg = parseInt(manualKg) || 0;
    const secs = Math.min(60, Math.max(20, Math.round((parseInt(manualSecs)||20)/5)*5));
    // Find which level this kg belongs to
    const LEVELS_REF = [{kg:0,startSecs:40},{kg:10,startSecs:45},{kg:20,startSecs:40},{kg:30,startSecs:35},{kg:40,startSecs:30},{kg:50,startSecs:25}];
    const lvlIdx = LEVELS_REF.findIndex((l,i)=> kg < (_nullishCoalesce(_optionalChain([LEVELS_REF, 'access', _14 => _14[i+1], 'optionalAccess', _15 => _15.kg]), () => ( Infinity))));
    const lvl = LEVELS_REF[Math.max(0, lvlIdx)];
    // Count sessions before this level
    let sessionsBeforeLevel = 0;
    for (let i = 0; i < Math.max(0, lvlIdx); i++) {
      sessionsBeforeLevel += Math.round((60 - LEVELS_REF[i].startSecs)/5) + 1;
    }
    const sessionInLvl = Math.round((Math.max(lvl.startSecs, secs) - lvl.startSecs) / 5);
    const sessions = sessionsBeforeLevel + sessionInLvl;
    const newPb = { sessions, lastTarget: secs, weightKg: kg, lastDate: todayK };
    store.set(plankKey, JSON.stringify(newPb));
    setPb(newPb);
    setShowManual(false);
    setManualKg(""); setManualSecs("");
    haptic && haptic("medium");
  }

  const [noWeight, setNoWeight] = useState(false);
  // BW-equivalent time: always increasing with total sessions done.
  // 40s base (BW level 1) + 5s per session completed, rounded to nearest 5s, capped at 5 min.
  // This means the time only goes UP — it never drops when you level up to a heavier plate.
  const noWeightSecs = noWeight && weightKg > 0
    ? Math.min(300, Math.round((40 + sessionsDone * 5) / 5) * 5)
    : null;
  const activeSecs = _nullishCoalesce(noWeightSecs, () => ( targetSecs));
  // Track which activeSecs was set when timer started — log that, not the current value
  const activeSecsAtStart = useRef(activeSecs);
  const pct = Math.round(((activeSecs - remaining) / activeSecs) * 100);
  const cue = noWeight && weightKg > 0
    ? `No plate? Hold ${fmt(noWeightSecs)} bodyweight instead — equivalent load to ${fmt(targetSecs)} @ ${weightKg}kg.`
    : weightKg === 0
      ? sessionsDone === 0 ? "Baseline. 40s solid form — breathe slowly, hips level."
      : sessionsDone < 3  ? "Building base. Every 5 seconds earned brings a plate closer."
      : "Final bodyweight sessions. Almost at the plate."
    : `${weightKg}kg on your back. Keep hips level — loaded planks beat long holds every time.`;
  const researchNote = noWeight && weightKg > 0
    ? null // cue already explains it
    : weightKg === 0 && targetSecs >= 55
      ? "Next session adds a 10kg plate."
      : levelUp ? `Next: ${nextKg}kg plate · start at ${fmt(_nullishCoalesce(nextSecs, () => (20)))}` : null;

  if (timerState === "logged") return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1610}}
      , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:GRNA,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1611}}, "✓ "
         , fmt(activeSecs), noWeightSecs ? " bodyweight" : weightKg>0?` @ ${weightKg}kg`:"", " — logged"
      )
      , React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1614}}, "Next: " , nextLabel)
      , levelUp&&React.createElement('div', { style: {fontSize:11,color:GOLD,marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1615}}, "🏋️ Next session: first "    , nextKg, "kg plate!" )
    )
  );

  return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1620}}
      , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1621}}
        , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1622}}
          , noWeightSecs ? `${fmt(noWeightSecs)} bodyweight` : `${fmt(targetSecs)} — ${weightLabel(weightKg)}`
        )
        , weightKg>0&&(
          React.createElement('button', { onClick: ()=>{
            const next = !noWeight;
            setNoWeight(next);
            // Reset timer to correct duration for the new mode
            const nextSecs = next
              ? Math.min(300, Math.round(targetSecs * weightMultiplier / 5) * 5)
              : targetSecs;
            clearInterval(intervalRef.current);
            setRemaining(nextSecs);
            setTimerState("idle");
          },
            style: {fontSize:10,padding:"4px 10px",borderRadius:8,border:`1px solid ${noWeight?GOLD:BD}`,
              background:noWeight?GOLD+"22":"transparent",color:noWeight?GOLD:T3,cursor:"pointer",fontWeight:noWeight?700:400}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1626}}
            , noWeight?"🏋️ have weight":"🏠 no weight"
          )
        )
      )
      , weightKg>0&&!noWeight&&React.createElement('div', { style: {fontSize:11,color:GOLD,marginBottom:6,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1643}}, "Place " , weightKg, "kg plate on lower back"    )
      , React.createElement('div', { style: {fontSize:12,color:T2,lineHeight:1.6,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1644}}, cue)
      , researchNote&&React.createElement('div', { style: {fontSize:11,color:GOLD+"bb",marginBottom:10,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1645}}, researchNote)
      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:16,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1646}}
        , React.createElement('svg', { width: 80, height: 80, viewBox: "0 0 80 80"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1647}}
          , React.createElement('circle', { cx: 40, cy: 40, r: 34, fill: "none", stroke: S2, strokeWidth: 7, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1648}})
          , React.createElement('circle', { cx: 40, cy: 40, r: 34, fill: "none",
            stroke: timerState==="done"?GRNA:GOLD, strokeWidth: 7,
            strokeDasharray: `${2*Math.PI*34}`,
            strokeDashoffset: `${2*Math.PI*34*(1-pct/100)}`,
            strokeLinecap: "round", transform: "rotate(-90 40 40)"  ,
            style: {transition:"stroke-dashoffset 0.5s linear"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1649}})
          , React.createElement('text', { x: 40, y: 45, textAnchor: "middle", fontSize: "18",
            fontWeight: "700", fill: timerState==="done"?GRNA:GOLD, fontFamily: "system-ui", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1655}}
            , fmt(remaining)
          )
        )
        , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8,flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1660}}
          , timerState==="idle"&&React.createElement('button', { onClick: ()=>{setRemaining(activeSecs);activeSecsAtStart.current=activeSecs;startTimer();}, style: {padding:"10px",borderRadius:10,border:"none",background:GOLD,color:BG,fontSize:13,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1661}}, "▶ Start" )
          , timerState==="running"&&React.createElement('button', { onClick: pauseTimer, style: {padding:"10px",borderRadius:10,border:"none",background:S2,color:GOLD,fontSize:13,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1662}}, "⏸ Pause" )
          , timerState==="idle"&&remaining<activeSecs&&React.createElement('button', { onClick: ()=>{clearInterval(intervalRef.current);setRemaining(activeSecs);setTimerState("idle");}, style: {padding:"8px",borderRadius:9,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:11,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1663}}, "↺ Reset" )
          , timerState==="done"&&React.createElement('div', { style: {fontSize:13,fontWeight:700,color:GRNA}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1664}}, "Done! 💪" )
        )
      )
      , React.createElement('div', { style: {display:"flex",gap:8,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1667}}
        , React.createElement('button', { onClick: logDone, style: {
          flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",
          background:timerState==="done"?GRNA:GOLD+"88",
          color:timerState==="done"?"#000":BG,fontSize:13,fontWeight:700,
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1668}}, "✓ Log "  , fmt(activeSecs), noWeightSecs?" bodyweight":weightKg>0?` @ ${weightKg}kg`:"")
        , timerState==="running"&&React.createElement('button', { onClick: ()=>{pauseTimer();logDone();}, style: {padding:"10px 12px",borderRadius:10,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:11,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1673}}, "Stop & log"  )
      )
      , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1675}}, "Session " , sessionsDone+1, " · Next: "   , nextLabel)

      /* Manual position override */
      , React.createElement('button', { onClick: ()=>setShowManual(m=>!m), style: {
        fontSize:10,color:T3,background:"transparent",border:"none",cursor:"pointer",
        padding:0,textDecoration:"underline",
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1678}}
        , showManual ? "cancel" : "I already know my level — set manually"
      )
      , showManual&&(
        React.createElement('div', { style: {marginTop:10,background:S2,borderRadius:10,padding:"12px 14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1685}}
          , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:T1,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1686}}, "Jump to your current level"    )
          , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:10,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1687}}, "e.g. if you know you can do 30s with 20kg, enter that — the progression will update to match."

          )
          , React.createElement('div', { style: {display:"flex",gap:8,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1690}}
            , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1691}}
              , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1692}}, "Weight (kg)" )
              , React.createElement('input', {
                value: manualKg,
                onChange: e=>setManualKg(e.target.value),
                placeholder: "0 = bodyweight"  ,
                type: "number", min: "0", step: "10",
                style: {width:"100%",padding:"9px 10px",borderRadius:8,border:`1px solid ${BD}`,
                  background:S1,color:T1,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1693}})
            )
            , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1701}}
              , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1702}}, "Time (seconds)" )
              , React.createElement('input', {
                value: manualSecs,
                onChange: e=>setManualSecs(e.target.value),
                placeholder: "20–60",
                type: "number", min: "20", max: "60", step: "5",
                style: {width:"100%",padding:"9px 10px",borderRadius:8,border:`1px solid ${BD}`,
                  background:S1,color:T1,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1703}})
            )
          )
          , manualKg!==""&&manualSecs!==""&&(()=>{
            const kg = parseInt(manualKg)||0;
            const secs = Math.min(60,Math.max(20,Math.round((parseInt(manualSecs)||20)/5)*5));
            const LEVELS_REF = [{kg:0,startSecs:40},{kg:10,startSecs:45},{kg:20,startSecs:40},{kg:30,startSecs:35},{kg:40,startSecs:30},{kg:50,startSecs:25}];
            const lvl = LEVELS_REF.find((l,i)=>kg < (_nullishCoalesce(_optionalChain([LEVELS_REF, 'access', _16 => _16[i+1], 'optionalAccess', _17 => _17.kg]), () => ( Infinity)))) || LEVELS_REF[0];
            return (
              React.createElement('div', { style: {fontSize:11,color:GOLD,marginBottom:10,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1718}}, "Will set to: "
                   , React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1719}}, fmt(secs)), " @ "  , React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1719}}, kg===0?"bodyweight":`${kg}kg`)
                , " · ", lvl.startSecs, "→60s range at this weight"
              )
            );
          })()
          , React.createElement('button', { onClick: applyManual,
            disabled: manualSecs==="",
            style: {width:"100%",padding:"10px",borderRadius:9,border:"none",cursor:"pointer",
              background:manualSecs?GOLD:"rgba(201,168,76,0.3)",
              color:manualSecs?BG:T3,fontSize:13,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1724}}, "Apply"

          )
        )
      )
    )
  );
}

function SuppEditor({supp, isCustom, onSave, onCancel, BD, S1, S2, T1, T2, T3, GOLD, GRNA, REDA}) {
  const [name, setName]   = useState(supp.name||"");
  const [dose, setDose]   = useState(supp.dose||"");
  const [icon, setIcon]   = useState(supp.icon||"💊");
  const [when, setWhen]   = useState(supp.when||"morning");
  const [why, setWhy]     = useState(supp.why||"");
  const inp = (val, set, ph) => (
    React.createElement('input', { value: val, onChange: e=>set(e.target.value), placeholder: ph,
      style: {width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1744}})
  );
  return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1748}}
      , React.createElement('div', { style: {fontSize:10,color:GOLD,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1749}}, "Edit supplement" )
      , React.createElement('div', { style: {display:"flex",gap:6,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1750}}
        , React.createElement('input', { value: icon, onChange: e=>setIcon(e.target.value), placeholder: "💊",
          style: {width:44,padding:"8px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:18,outline:"none",textAlign:"center",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1751}})
        , React.createElement('input', { value: name, onChange: e=>setName(e.target.value), placeholder: "Supplement name" ,
          style: {flex:1,padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:14,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1753}})
      )
      , inp(dose, setDose, "Dose (e.g. 5g, 2000 IU)")
      , React.createElement('select', { value: when, onChange: e=>setWhen(e.target.value), style: {width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",fontFamily:"inherit",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1757}}
        , React.createElement('option', { value: "morning", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1758}}, "🌅 Morning" )
        , React.createElement('option', { value: "pre", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1759}}, "⚡ Pre-training" )
        , React.createElement('option', { value: "night", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1760}}, "🌙 Night" )
      )
      , React.createElement('textarea', { value: why, onChange: e=>setWhy(e.target.value), placeholder: "Why you take it (optional)"    ,
        style: {width:"100%",minHeight:52,padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,lineHeight:1.5,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1762}})
      , React.createElement('div', { style: {display:"flex",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1764}}
        , React.createElement('button', { onClick: ()=>{if(!name.trim()) return; onSave({name:name.trim(),dose,icon,when,why});}, style: {flex:1,padding:"9px",borderRadius:9,border:"none",background:GRNA,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1765}}, "Save")
        , React.createElement('button', { onClick: onCancel, style: {padding:"9px 14px",borderRadius:9,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:12,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1766}}, "Cancel")
      )
    )
  );
}

function LogExtraWork({todayK, reflections, setReflections, scores, setScores, extraWork=[], setExtraWork=()=>{}, onSaved=()=>{}, card, BD, S1, S2, S3, T1, T2, T3, GOLD, GRNA, REDA, PRP, AMB, BG, store}) {
  const [open, setOpen] = useState(false);
  const [skillKey, setSkillKey] = useState("");
  const [customName, setCustomName] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);
  const [saved, setSaved] = useState(false);

  const allSkillOptions = Object.entries(SKILLS).map(([k,s])=>({key:k, label:`${s.icon} ${s.name}`}));

  function save() {
    const name = skillKey === "__custom__" ? customName.trim() : (_optionalChain([SKILLS, 'access', _18 => _18[skillKey], 'optionalAccess', _19 => _19.name]) || skillKey);
    const key = skillKey === "__custom__" ? "extra_"+customName.trim().toLowerCase().replace(/\s+/g,"_").slice(0,20) : skillKey;
    if (!name) return;

    // Save reflection note
    if (note.trim()) {
      const durationNote = duration ? ` [${duration}]` : "";
      const entry = {
        id: Date.now().toString(36)+"ex",
        date: todayK,
        skillKey: key,
        skillName: name + durationNote,
        text: note.trim(),
        rating: rating||0,
        extra: "extraWork",
      };
      const updated = [entry, ...reflections];
      setReflections(updated);
      store.set("rwc_reflections", JSON.stringify(updated));
    }

    // Save rating to scores if given
    if (rating) {
      const scoreEntry = { id: Date.now().toString(36)+"exs", date: todayK, skillKey: key, rating };
      const updatedScores = [scoreEntry, ...scores];
      setScores(updatedScores);
      store.set("rwc_scores", JSON.stringify(updatedScores));
    }

    // Save to extraWork state so it appears as a done card in Today tab
    const newEntry = { skillKey: key, skillName: name, duration, note: note.trim(), rating: rating||0 };
    const updatedExtra = [...extraWork, newEntry];
    setExtraWork(updatedExtra);
    store.set("rwc_extra_done_"+todayK, JSON.stringify(updatedExtra));

    // Write to rwc_done_ so charts pick it up — use __extra prefix so it doesn't
    // trigger the regular skill session card in Today tab
    try {
      const doneKey = "rwc_done_"+todayK;
      const existing = JSON.parse(store.get(doneKey)||"{}");
      existing["__extra__"+key+"__"+Date.now().toString(36)] = true;
      store.set(doneKey, JSON.stringify(existing));
    } catch (e17) {}

    // Add duration to today's check-in timeMins so readiness score reflects the extra work
    if (duration) {
      try {
        const mins = parseInt(duration);
        if (mins > 0) {
          const ciKey = "rwc_ci_"+todayK;
          const ci = JSON.parse(store.get(ciKey)||"{}");
          ci.timeMins = (ci.timeMins||0) + mins;
          store.set(ciKey, JSON.stringify(ci));
        }
      } catch (e18) {}
    }

    setSaved(true);
    onSaved();
    setTimeout(() => {
      setOpen(false); setSaved(false);
      setSkillKey(""); setCustomName(""); setDuration(""); setNote(""); setRating(0);
    }, 1200);
  }

  if (!open) return (
    React.createElement('button', { onClick: ()=>setOpen(true), style: {
      ...card, width:"100%", padding:"12px 16px", marginBottom:10,
      border:`1px dashed ${BD}`, background:"transparent", cursor:"pointer",
      display:"flex", alignItems:"center", gap:12, textAlign:"left",
    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1850}}
      , React.createElement('span', { style: {fontSize:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1855}}, "➕")
      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1856}}
        , React.createElement('div', { style: {fontSize:13,fontWeight:600,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1857}}, "Log extra work"  )
        , React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1858}}, "Extra reps with your coaches? Log it here."       )
      )
    )
  );

  return (
    React.createElement('div', { style: {...card, padding:"16px", marginBottom:10, border:`1px solid ${GOLD}44`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1864}}
      , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:GOLD,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1865}}, "➕ Log extra work"   )

      /* skill picker */
      , React.createElement('select', { value: skillKey, onChange: e=>setSkillKey(e.target.value),
        style: {width:"100%",padding:"9px 10px",borderRadius:9,border:`1px solid ${BD}`,background:S1,color:skillKey?T1:T3,fontSize:13,outline:"none",fontFamily:"inherit",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1868}}
        , React.createElement('option', { value: "", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1870}}, "Select skill..." )
        , allSkillOptions.map(o=>React.createElement('option', { key: o.key, value: o.key, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1871}}, o.label))
        , React.createElement('option', { value: "__custom__", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1872}}, "✏️ Other (type name)"   )
      )

      , skillKey==="__custom__"&&(
        React.createElement('input', { value: customName, onChange: e=>setCustomName(e.target.value),
          placeholder: "What did you work on?"    ,
          style: {width:"100%",padding:"9px 10px",borderRadius:9,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1876}})
      )

      /* duration */
      , React.createElement('input', { value: duration, onChange: e=>setDuration(e.target.value),
        placeholder: "How long? (e.g. 20 min)"    ,
        style: {width:"100%",padding:"9px 10px",borderRadius:9,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1882}})

      /* rating */
      , React.createElement('div', { style: {display:"flex",gap:6,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1887}}
        , [1,2,3,4,5].map(n=>(
          React.createElement('button', { key: n, onClick: ()=>setRating(r=>r===n?0:n), style: {
            flex:1,padding:"7px 0",borderRadius:8,cursor:"pointer",
            border:`1.5px solid ${rating>=n?PRP:BD}`,
            background:rating>=n?PRP+"33":"transparent",
            color:rating>=n?PRP:T3,fontSize:13,fontWeight:700,
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1889}}, n)
        ))
      )

      /* note */
      , React.createElement('textarea', { value: note, onChange: e=>setNote(e.target.value),
        placeholder: "Notes — what you worked on, what clicked, what to fix..."          ,
        style: {width:"100%",minHeight:72,background:S1,border:`1px solid ${BD}`,borderRadius:9,
          padding:"10px 12px",color:T1,fontSize:14,lineHeight:1.6,resize:"none",
          boxSizing:"border-box",fontFamily:"inherit",outline:"none",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1899}})

      , React.createElement('div', { style: {display:"flex",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1905}}
        , React.createElement('button', { onClick: save,
          disabled: !skillKey||(skillKey==="__custom__"&&!customName.trim()),
          style: {
            flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",
            background:saved?GRNA:(skillKey?(skillKey==="__custom__"?customName.trim():true)?GOLD:"rgba(201,168,76,0.3)":"rgba(201,168,76,0.3)"),
            color:saved?"#000":BG,fontSize:13,fontWeight:700,
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1906}}, saved?"✓ Saved":"Save")
        , React.createElement('button', { onClick: ()=>{setOpen(false);setSkillKey("");setCustomName("");setDuration("");setNote("");setRating(0);},
          style: {padding:"10px 14px",borderRadius:10,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:12,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1913}}, "Cancel")
      )
    )
  );
}

function PastDaySkillCard({sk, s, wasDone: initialDone, existingRef, viewingDate, onSave, onToggleDone, card, BD, S1, S2, T1, T2, T3, GOLD, GRNA, PRP, REDA, REDDIM}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(_optionalChain([existingRef, 'optionalAccess', _20 => _20.rating])||0);
  const [note, setNote] = useState(_optionalChain([existingRef, 'optionalAccess', _21 => _21.text])||"");
  const [saved, setSaved] = useState(!!existingRef);
  const [done, setDone] = useState(initialDone);

  function toggleDone() {
    const next = !done;
    setDone(next);
    onToggleDone && onToggleDone(next);
    if (!next) setOpen(false);
  }

  return (
    React.createElement('div', { style: {...card, padding:"13px 15px", borderLeft:`3px solid ${done?GRNA:_optionalChain([s, 'optionalAccess', _22 => _22.color])||GOLD}`, opacity:done?1:0.7}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1935}}
      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1936}}
        , React.createElement('span', { style: {fontSize:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1937}}, _optionalChain([s, 'optionalAccess', _23 => _23.icon])||"🏉")
        , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1938}}
          , React.createElement('span', { style: {fontSize:14,fontWeight:600,color:done?T1:T3,
            textDecoration:done?"none":"line-through"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1939}}, _optionalChain([s, 'optionalAccess', _24 => _24.name])||sk)
          , _optionalChain([existingRef, 'optionalAccess', _25 => _25.rating])>0&&(
            React.createElement('div', { style: {fontSize:10,color:T3,marginTop:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1942}}
              , "★".repeat(existingRef.rating), "☆".repeat(5-existingRef.rating), " · "  , _optionalChain([existingRef, 'access', _26 => _26.text, 'optionalAccess', _27 => _27.slice, 'call', _28 => _28(0,40)])||(existingRef.text?"...":"")
            )
          )
        )
        , React.createElement('div', { style: {display:"flex",gap:6,alignItems:"center",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1947}}
          , React.createElement('button', { onClick: toggleDone, style: {
            fontSize:11,background:"transparent",cursor:"pointer",flexShrink:0,
            border:`1px solid ${done?GRNA:BD}`,borderRadius:7,padding:"4px 9px",
            color:done?GRNA:T3,
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1948}}, done?"✓ Done":"Mark done")
          , done&&(
            React.createElement('button', { onClick: ()=>setOpen(o=>!o), style: {
              fontSize:11,color:open?GOLD:T3,background:"transparent",
              border:`1px solid ${open?GOLD:BD}`,borderRadius:7,padding:"4px 10px",cursor:"pointer",
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1954}}, existingRef?"edit note":"add note")
          )
        )
      )
      , open&&(
        React.createElement('div', { style: {marginTop:10,borderTop:`1px solid ${BD}`,paddingTop:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1962}}
          , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1963}}, "How did it go?"   )
          , React.createElement('div', { style: {display:"flex",gap:6,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1964}}
            , [1,2,3,4,5].map(n=>(
              React.createElement('button', { key: n, onClick: ()=>setRating(n), style: {
                flex:1,padding:"8px 0",borderRadius:8,
                border:`1.5px solid ${rating>=n?PRP:BD}`,
                background:rating>=n?PRP+"33":"transparent",
                color:rating>=n?PRP:T3,fontSize:13,fontWeight:700,cursor:"pointer",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1966}}, n)
            ))
          )
          , React.createElement('textarea', { value: note, onChange: e=>{setNote(e.target.value);setSaved(false);},
            placeholder: "What did you work on? What clicked? What needs more work?"          ,
            style: {width:"100%",minHeight:72,background:S2,border:`1px solid ${BD}`,borderRadius:10,
              padding:"10px 12px",color:T1,fontSize:16,lineHeight:1.6,resize:"vertical",
              boxSizing:"border-box",fontFamily:"inherit",outline:"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1974}})
          , React.createElement('button', { onClick: ()=>{
            if(!rating&&!note.trim()) return;
            onSave(rating||3, note);
            setSaved(true);
            setOpen(false);
          }, style: {
            width:"100%",marginTop:8,padding:"10px",borderRadius:10,border:"none",
            background:saved?GRNA+"44":GOLD,color:saved?GRNA:"#000",
            fontSize:13,fontWeight:700,cursor:"pointer",
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1979}}, saved?"✓ Saved":"Save note")
        )
      )
    )
  );
}

function DailyJournalEntry({todayK, existing="", onSave, BD, S2, T1, T2, T3, GOLD, GRNA, AMB}) {
  const [text, setText] = useState(existing);
  const [saved, setSaved] = useState(!!existing);
  return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1999}}
      , React.createElement('textarea', {
        value: text,
        onChange: e=>{setText(e.target.value);setSaved(false);},
        placeholder: "Write about today..."  ,
        style: {width:"100%",minHeight:120,background:S2,border:`1px solid ${BD}`,borderRadius:10,
          padding:"10px 12px",color:T1,fontSize:16,lineHeight:1.65,resize:"vertical",
          boxSizing:"border-box",fontFamily:"inherit",outline:"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2000}}
      )
      , React.createElement('button', { onClick: ()=>{onSave(text);setSaved(true);}, style: {
        marginTop:8,width:"100%",padding:"10px",borderRadius:10,border:"none",
        background:saved?GRNA+"33":GOLD,color:saved?GRNA:"#000",
        fontSize:13,fontWeight:700,cursor:"pointer",
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2008}}, saved?"✓ Saved":"Save entry")
    )
  );
}

function MentalTaskPage({task, todayK, mentalDone, onClose, onComplete, onUncomplete, onSaveReflection, store, card, BD, S1, S2, BG, T1, T2, T3, GOLD, GRNA, PRP, AMB, GOLDDIM, GRN, RED}) {
  const [note, setNote] = useState(()=>{ try{return store.get("rwc_mental_note_"+todayK)||"";}catch (e19){return "";} });
  const alreadySaved = mentalDone && !!store.get("rwc_mental_rating_"+todayK);

  return (
    React.createElement('div', { style: {position:"fixed",inset:0,background:BG,zIndex:250,display:"flex",flexDirection:"column",overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2022}}
      /* back button */
      , React.createElement('div', { style: {padding:"14px 16px 0",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2024}}
        , React.createElement('button', { onClick: onClose, style: {fontSize:11,color:T3,background:"transparent",
          border:`1px solid ${BD}`,borderRadius:8,padding:"5px 11px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2025}}, "← back" )
      )

      , React.createElement('div', { style: {flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 16px 100px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2029}}

        /* header card — same as skill detail */
        , React.createElement('div', { style: {...card,padding:"18px 18px",borderLeft:`3px solid ${PRP}`,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2032}}
          , React.createElement('div', { style: {fontSize:22,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2033}}, task.icon)
          , React.createElement('div', { style: {fontSize:20,fontWeight:800,color:T1,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2034}}, task.title)
          , React.createElement('div', { style: {display:"flex",gap:6,alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2035}}
            , React.createElement('span', { style: {fontSize:9,color:PRP,background:PRP+"22",borderRadius:6,padding:"2px 7px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2036}}, task.pillar)
            , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2037}}, "⏱ " , task.duration)
          )
        )

        /* task content — shown as a single "stage" */
        , React.createElement('div', { style: {...card,padding:"16px 16px",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2042}}
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2043}}
            , React.createElement('span', { style: {fontSize:13,fontWeight:700,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2044}}, "Task")
            , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2045}}, task.duration)
          )
          , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.65}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2047}}, task.task)
        )

        /* inline reflection — write before ticking, same as InlineReflection */
        , alreadySaved ? (
          React.createElement('div', { style: {...card,padding:"13px 15px",marginTop:14,borderLeft:`3px solid ${GOLD}`,background:GOLDDIM}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2052}}
            , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:GOLD,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2053}}, "✓ Saved" )
            , React.createElement('div', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2054}}, "Your note is in the Notes tab."      )
          )
        ) : (
          React.createElement('div', { style: {...card,padding:"14px 15px",marginTop:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2057}}
            , React.createElement('div', { style: {fontSize:10,fontWeight:700,color:T3,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2058}}, "Write your thoughts — saved when you tick done"

            )
            , React.createElement('textarea', {
              value: note,
              onChange: e=>{
                setNote(e.target.value);
                try{store.set("rwc_mental_note_"+todayK,e.target.value);}catch (e20){}
              },
              placeholder: "Anything from this mental session worth remembering..."      ,
              style: {width:"100%",minHeight:90,padding:12,borderRadius:10,
                border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13.5,
                lineHeight:1.65,resize:"none",outline:"none",boxSizing:"border-box",
                fontFamily:"inherit",caretColor:GRN}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2061}}
            )
            , _optionalChain([note, 'optionalAccess', _29 => _29.trim, 'call', _30 => _30()])&&(
              React.createElement('div', { style: {fontSize:11,color:T3,marginTop:8,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2074}}, "Tick the box when done — this will be included in your debrief"

              )
            )
          )
        )

        /* done / untick button — same as skill detail */
        , React.createElement('div', { style: {marginTop:16,paddingTop:16,borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2082}}
          , !mentalDone ? (
            React.createElement('button', { onClick: ()=>{ onComplete(note); onClose(); }, style: {
              width:"100%",padding:"15px",borderRadius:12,border:"none",
              background:GRNA,color:BG,fontSize:16,fontWeight:700,cursor:"pointer",
              letterSpacing:"-0.01em",
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2084}}, "✓ Mark as done"   )
          ) : (
            React.createElement('div', { style: {textAlign:"center",fontSize:14,fontWeight:600,color:GRNA,padding:"12px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2090}}, "✓ Done" )
          )
        )

      )
    )
  );
}

function MentalExpandedContent({task, todayK, mentalDone, initNote, initRating, onComplete, saveReflection, store, BD, S2, T1, T2, T3, GRNA, PRP}) {
  const [rating, setRating] = useState(initRating);
  const [note, setNote] = useState(initNote);
  return (
    React.createElement('div', { style: {width:"100%",marginTop:12,borderTop:`1px solid ${BD}`,paddingTop:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2103}}
      , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.65,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2104}}, task.task)
      , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2105}}, "How did this land?"   )
      , React.createElement('div', { style: {display:"flex",gap:6,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2106}}
        , [1,2,3,4,5].map(n=>(
          React.createElement('button', { key: n, onClick: ()=>{
            setRating(n);
            try { store.set("rwc_mental_rating_"+todayK, String(n)); } catch (e21) {}
          }, style: {flex:1,padding:"8px 0",borderRadius:8,border:`1.5px solid ${rating>=n?PRP:BD}`,background:rating>=n?PRP+"33":"transparent",color:rating>=n?PRP:T3,fontSize:13,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2108}}, n)
        ))
      )
      , React.createElement('textarea', { value: note, onChange: e=>{
        setNote(e.target.value);
        try { store.set("rwc_mental_note_"+todayK, e.target.value); } catch (e22) {}
      },
        placeholder: "Write your reflection..."  ,
        style: {width:"100%",minHeight:68,background:S2,border:`1px solid ${BD}`,borderRadius:10,padding:"10px 12px",color:T1,fontSize:16,lineHeight:1.6,resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",outline:"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2114}}
      )
      , !mentalDone
        ? React.createElement('button', { onClick: ()=>{onComplete();if(rating>0||note.trim())saveReflection("mental",rating||3,note);}, style: {width:"100%",marginTop:10,padding:"11px",borderRadius:12,border:"none",background:PRP,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2122}}, "Mark done · +5pts"   )
        : React.createElement('div', { style: {fontSize:11,color:GRNA,textAlign:"center",marginTop:8,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2123}}, "✓ Completed · +5pts added"    )
      
    )
  );
}

function MentalTaskCard() { return null; } // legacy stub — replaced by inline card in renderSkillCards

function StageEditor({stage, onSave, onDelete, onRestore, isPlank, BD, S1, S2, BG, T1, T2, T3, GOLD, GRNA, REDA, REDDIM, AMB}) {
  const [editing, setEditing]       = useState(false);
  const [name, setName]             = useState(stage.name);
  const [text, setText]             = useState(stage.text);
  const [dur,  setDur]              = useState(stage.duration||"10 min");
  const [timer, setTimer]           = useState(stage.timer||"");
  const [hasTimer, setHasTimer]     = useState(!!stage.timer);
  const [lastWeight, setLastWeight] = useState(stage.lastWeight||"");

  // Sync from prop when stage is saved externally (e.g. timer cleared by parent)
  useEffect(() => {
    if (!editing) {
      setName(stage.name);
      setText(stage.text);
      setDur(stage.duration||"10 min");
      setTimer(stage.timer||"");
      setHasTimer(!!stage.timer);
      setLastWeight(stage.lastWeight||"");
    }
  }, [stage.name, stage.text, stage.duration, stage.timer, stage.lastWeight]);

  const save = () => {
    onSave({ name: name.trim(), text: text.trim(), duration: dur||"10 min", timer: timer.trim(), lastWeight: lastWeight.trim() });
    setEditing(false);
  };

  if (!editing) return (
    React.createElement('div', { style: {background:S1,borderRadius:9,padding:"9px 12px",border:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2158}}
      , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2159}}
        , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2160}}
          , React.createElement('div', { style: {fontSize:12,fontWeight:700,color:stage.isBuiltIn?T2:GOLD,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2161}}
            , stage.name
            , React.createElement('span', { style: {fontSize:10,color:T3,marginLeft:6,fontWeight:400}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2163}}, "⏳ " , stage.duration)
            , stage.timer&&React.createElement('span', { style: {fontSize:10,color:AMB,marginLeft:6,fontWeight:400}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2164}}, "⏱ " , stage.timer)
            , !isPlank&&stage.lastWeight&&React.createElement('span', { style: {fontSize:10,color:GOLD,marginLeft:6,fontWeight:400}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2165}}, "🏋 " , stage.lastWeight)
          )
          , React.createElement('div', { style: {fontSize:11,color:T3,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2167}}, stage.text)
        )
        , React.createElement('div', { style: {display:"flex",gap:6,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2169}}
          , React.createElement('button', { onClick: ()=>setEditing(true), style: {fontSize:10,color:T3,background:"transparent",border:`1px solid ${BD}`,borderRadius:6,padding:"3px 8px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2170}}, "edit")
          , React.createElement('button', { onClick: onDelete, style: {fontSize:10,color:REDA,background:REDDIM,border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2171}}, "✕")
        )
      )
    )
  );

  return (
    React.createElement('div', { style: {background:S2,borderRadius:9,padding:"10px 12px",border:`1px solid ${GOLD}44`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2178}}
      , React.createElement('input', { value: name, onChange: e=>setName(e.target.value), placeholder: "Stage name" ,
        style: {width:"100%",padding:"7px 10px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2179}})
      , React.createElement('textarea', { value: text, onChange: e=>setText(e.target.value), placeholder: "Description...",
        style: {width:"100%",minHeight:60,padding:"8px 10px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:12,lineHeight:1.6,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2181}})
      /* duration — how long this stage takes (for time math) */
      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2184}}
        , React.createElement('span', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2185}}, "⏳ Duration" )
        , React.createElement('input', { value: dur, onChange: e=>setDur(e.target.value), placeholder: "e.g. 10 min"  ,
          style: {flex:1,padding:"5px 9px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:12,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2186}})
      )
      /* timer — optional countdown during the stage */
      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:isPlank?10:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2190}}
        , React.createElement('span', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2191}}, "⏱ Timer" )
        , React.createElement('input', { value: timer, onChange: e=>setTimer(e.target.value), placeholder: "optional, e.g. 30 sec"   ,
          style: {flex:1,padding:"5px 9px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:timer?T1:T3,fontSize:12,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2192}})
      )
      /* last weight used — only for non-plank stages */
      , !isPlank&&(
        React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2197}}
          , React.createElement('span', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2198}}, "🏋 Last weight"  )
          , React.createElement('input', { value: lastWeight, onChange: e=>setLastWeight(e.target.value), placeholder: "optional, e.g. 20 kg"   ,
            style: {flex:1,padding:"5px 9px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:lastWeight?T1:T3,fontSize:12,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2199}})
        )
      )
      , React.createElement('div', { style: {display:"flex",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2203}}
        , React.createElement('button', { onClick: save, style: {flex:1,padding:"8px",borderRadius:8,border:"none",background:GRNA,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2204}}, "Save")
        , onRestore&&React.createElement('button', { onClick: ()=>{onRestore();setEditing(false);}, style: {padding:"8px 12px",borderRadius:8,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:11,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2205}}, "Restore")
        , React.createElement('button', { onClick: ()=>setEditing(false), style: {padding:"8px 12px",borderRadius:8,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:11,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2206}}, "Cancel")
      )
    )
  );
}

function AddStageForm({sk, onAdd, BD, S1, S2, BG, T1, T2, T3, GOLD, GRNA}) {
  const [open, setOpen]             = useState(false);
  const [name, setName]             = useState("");
  const [text, setText]             = useState("");
  const [dur,  setDur]              = useState("10 min");
  const [timer, setTimer]           = useState("");
  const [hasTimer, setHasTimer]     = useState(false);
  const [lastWeight, setLastWeight] = useState("");

  if (!open) return (
    React.createElement('button', { onClick: ()=>setOpen(true), style: {
      width:"100%",padding:"8px",borderRadius:9,border:`1px dashed ${BD}`,
      background:"transparent",color:T3,fontSize:12,cursor:"pointer",marginTop:2,
    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2222}}, "+ Add stage"  )
  );

  return (
    React.createElement('div', { style: {background:S2,borderRadius:9,padding:"10px 12px",border:`1px solid ${GOLD}44`,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2229}}
      , React.createElement('div', { style: {fontSize:10,color:GOLD,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2230}}, "New stage" )
      , React.createElement('input', { value: name, onChange: e=>setName(e.target.value), placeholder: "Stage name" ,
        style: {width:"100%",padding:"7px 10px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2231}})
      , React.createElement('textarea', { value: text, onChange: e=>setText(e.target.value), placeholder: "What to do..."  ,
        style: {width:"100%",minHeight:60,padding:"8px 10px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:12,lineHeight:1.6,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2233}})
      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2235}}
        , React.createElement('span', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2236}}, "⏳ Duration" )
        , React.createElement('input', { value: dur, onChange: e=>setDur(e.target.value), placeholder: "e.g. 10 min"  ,
          style: {flex:1,padding:"5px 9px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:12,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2237}})
      )
      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2240}}
        , React.createElement('span', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2241}}, "⏱ Timer" )
        , React.createElement('input', { value: timer, onChange: e=>setTimer(e.target.value), placeholder: "optional, e.g. 30 sec"   ,
          style: {flex:1,padding:"5px 9px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:timer?T1:T3,fontSize:12,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2242}})
      )
      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2245}}
        , React.createElement('span', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2246}}, "🏋 Last weight"  )
        , React.createElement('input', { value: lastWeight, onChange: e=>setLastWeight(e.target.value), placeholder: "optional, e.g. 20 kg"   ,
          style: {flex:1,padding:"5px 9px",borderRadius:7,border:`1px solid ${BD}`,background:S1,color:lastWeight?T1:T3,fontSize:12,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2247}})
      )
      , React.createElement('div', { style: {display:"flex",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2250}}
        , React.createElement('button', { onClick: ()=>{
          if(!name.trim()||!text.trim()) return;
          onAdd(name.trim(), text.trim(), dur||"10 min", timer.trim(), lastWeight.trim());
          setName(""); setText(""); setDur("10 min"); setTimer(""); setLastWeight(""); setOpen(false);
        }, disabled: !name.trim()||!text.trim(),
          style: {flex:1,padding:"8px",borderRadius:8,border:"none",
            background:name.trim()&&text.trim()?GRNA:T3,
            color:name.trim()&&text.trim()?"#000":S1,fontSize:12,fontWeight:700,
            cursor:name.trim()&&text.trim()?"pointer":"default"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2251}}, "Add")
        , React.createElement('button', { onClick: ()=>setOpen(false), style: {padding:"8px 12px",borderRadius:8,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:11,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2260}}, "Cancel")
      )
    )
  );
}

function FreeNoteForm({onSave, BD, S1, S2, T1, T2, T3, GOLD, GRNA}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  if (!open) return (
    React.createElement('button', { onClick: ()=>setOpen(true), style: {
      width:"100%",padding:"10px 14px",borderRadius:10,border:`1px dashed ${BD}`,
      background:"transparent",color:T3,fontSize:12,cursor:"pointer",
      textAlign:"left",marginBottom:6,
    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2271}}, "✏️ Add a general note — something you saw, read, or thought of..."            )
  );

  return (
    React.createElement('div', { style: {borderRadius:12,border:`1px solid ${GOLD}44`,overflow:"hidden",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2279}}
      , React.createElement('div', { style: {padding:"12px 14px",background:S2,borderBottom:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2280}}
        , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:GOLD,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2281}}, "✏️ General note"  )
        , React.createElement('textarea', { value: text, onChange: e=>setText(e.target.value),
          placeholder: "Something you saw online, a cue you want to remember, a coaching point..."            ,
          autoFocus: true,
          style: {width:"100%",minHeight:80,background:S1,border:`1px solid ${BD}`,borderRadius:9,
            padding:"10px 12px",color:T1,fontSize:14,lineHeight:1.6,resize:"none",outline:"none",
            boxSizing:"border-box",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2282}})
        , React.createElement('div', { style: {display:"flex",gap:8,marginTop:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2288}}
          , React.createElement('button', { onClick: ()=>{onSave(text);setText("");setOpen(false);}, disabled: !text.trim(),
            style: {flex:1,padding:"9px",borderRadius:9,border:"none",
              background:text.trim()?GRNA:T3,color:text.trim()?"#000":S1,
              fontSize:13,fontWeight:700,cursor:text.trim()?"pointer":"default"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2289}}, "Save")
          , React.createElement('button', { onClick: ()=>{setText("");setOpen(false);},
            style: {padding:"9px 14px",borderRadius:9,border:`1px solid ${BD}`,
              background:"transparent",color:T3,fontSize:12,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2293}}, "Cancel")
        )
      )
    )
  );
}

function JournalEntryCard({entry, onDelete, BD, S1, S2, T1, T2, T3, GOLD, REDA, REDDIM}) {
  const [open, setOpen] = useState(false);
  const dateLabel = new Date(entry.date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
  // show first line as preview
  const preview = entry.text.split("\n")[0].slice(0,80) + (entry.text.length>80?"…":"");
  return (
    React.createElement('div', { style: {borderRadius:12,border:`1px solid ${BD}`,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2308}}
      , React.createElement('button', { onClick: ()=>setOpen(o=>!o), style: {
        width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
        background:open?S2:S1,border:"none",cursor:"pointer",textAlign:"left",
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2309}}
        , React.createElement('div', { style: {flex:1,minWidth:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2313}}
          , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:GOLD,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2314}}, dateLabel)
          , !open&&React.createElement('div', { style: {fontSize:12,color:T3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2315}}, preview)
        )
        , React.createElement('span', { style: {fontSize:13,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2317}}, open?"↑":"↓")
      )
      , open&&(
        React.createElement('div', { style: {padding:"0 14px 14px",background:S2,borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2320}}
          , React.createElement('div', { style: {fontSize:13,color:T1,lineHeight:1.65,whiteSpace:"pre-wrap",paddingTop:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2321}}, entry.text)
          , React.createElement('button', { onClick: ()=>onDelete(entry.date), style: {
            marginTop:10,fontSize:10,color:REDA,background:REDDIM,border:"none",
            borderRadius:6,padding:"3px 9px",cursor:"pointer",
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2322}}, "delete")
        )
      )
    )
  );
}

// ── coach words ───────────────────────────────────────────────────────────────
const COACH_WORDS = [
  d => `${d} days. Gibson-Park has been preparing his whole career. You have ${Math.floor(d/7)} weeks.`,
  d => `The gap between tier 1 and tier 2 is closed in training, not on match day.`,
  d => `Ireland run 65+ rucks a game. Your clearance speed is tested every minute.`,
  d => `The best 9s in the world make the decision 2 steps before the ruck. Train that habit today.`,
  d => `${d} days is a long time to get better. It's also a short time to waste.`,
  d => `Tier 1 pace is 15% faster than what you play now. Every session at speed is a deposit.`,
  d => `One historic win against Uruguay changes everything. Prepare like it's the only game.`,
];

// ── corrective drills ─────────────────────────────────────────────────────────
const CORRECTIVE = {
  "box-flat": {
    title:"Box kick goes flat",
    diagnosis:"You're striking through the centre of the ball. You need to contact the bottom quarter to get height before distance.",
    drill:"Undercut box kick", location:"Pitch", duration:"15 min", reps:"5×6 each foot",
    setup:"10 balls at the 5m line. One cone at 22m.",
    execution:"1. Place ball upright — don't tilt forward\n2. Non-kick foot points at target\n3. Strike the BOTTOM of the ball — aim for the sky\n4. Follow through to your chest, not the horizon\n5. Lean slightly back at contact",
    cue:"Kick UP first. Height comes before distance.",
    mistake:"Leaning forward at contact — the single most common cause of flat kicks",
    progression:"Week 2: same drill from a 10m sprint",
  },
  "hesitate": {
    title:"Hesitation at the ruck",
    diagnosis:"You're deciding ON arrival instead of before it. The habit to build: make the call at 3 steps out.",
    drill:"Scan & commit", location:"Pitch", duration:"12 min", reps:"4×5 cones",
    setup:"5 cones in a line, 5m apart. Start 10m back.",
    execution:"1. Sprint to cone 1\n2. At 3 steps out — call your decision aloud: LEFT / RIGHT / KICK\n3. Execute that action as you arrive\n4. Sprint immediately to cone 2\n5. The rule: call before you reach the cone. Never on arrival.",
    cue:"3 steps out. Call it. Commit. No editing.",
    mistake:"Waiting until you're at the cone to decide — that's exactly the habit to break",
    progression:"Add music/noise to simulate crowd pressure",
  },
  "slow-pass": {
    title:"Pass has no zip",
    diagnosis:"Too much backswing, power from the arms not the wrist. The release is late.",
    drill:"Bag snap pass", location:"Pitch or gym", duration:"15 min", reps:"3×15 each hand",
    setup:"Tackle bag or wall, stand 1m away.",
    execution:"1. Press ball flat against the bag — zero backswing allowed\n2. Fire it away: elbow forward → wrist snap → fingers rip\n3. Three clicks in one motion\n4. Alternate hands every 5 reps",
    cue:"Elbow. Wrist. Fingers. Three clicks, one motion.",
    mistake:"Any backswing — even 5cm breaks the drill",
    progression:"Move to 5m, maintain same snap mechanics",
  },
  "slow-breakdown": {
    title:"Slow to the breakdown",
    diagnosis:"Arriving upright and reading on arrival. You need to scan on approach and land already low.",
    drill:"Low arrival circuit", location:"Pitch", duration:"12 min", reps:"8 circuits, target <11s",
    setup:"5 cones in a 10m square.",
    execution:"1. Sprint to cone 1\n2. Arrive LOW — hips below chest, head up\n3. Simulate clearance\n4. Sprint to cone 2\n5. Never fully stand up between cones",
    cue:"Arrive low. Clear low. Leave fast.",
    mistake:"Standing up between cones — this resets your height every time",
    progression:"Add a ball: pick up at each cone, pass in your scanned direction",
  },
  "weak-hand": {
    title:"Weak left-hand pass",
    diagnosis:"Your dominant hand compensates every drill. The weak hand never gets enough isolated reps.",
    drill:"Weak hand wall isolation", location:"Pitch or wall", duration:"20 min", reps:"4×30 left hand only",
    setup:"Target on wall at chest height, 6m away.",
    execution:"1. Left hand only — right hand in pocket or behind back\n2. Hit the target 30 times in a row\n3. Elbow drives, wrist snaps, fingers rip\n4. Rest 30s, repeat",
    cue:"Pretend your right hand doesn't exist.",
    mistake:"Letting the right hand 'help' on harder passes",
    progression:"Week 2: increase to 8m. Week 3: sprint before each set",
  },
  "second-half": {
    title:"First-step explosiveness drops under fatigue",
    diagnosis:"First-step explosiveness drops under fatigue. This is reactive power under metabolic stress — a specific quality.",
    drill:"Fatigue burst", location:"Pitch", duration:"20 min", reps:"12 reps",
    setup:"Base cone, defender cone 4m away.",
    execution:"1. Sprint 22m and back at full pace\n2. Immediately: 3 explosive steps from base to beat the 4m cone\n3. Walk back — that's one rep\n4. The burst MUST be maximum effort even while breathing hard",
    cue:"The burst after the sprint is the whole drill. Easy bursts don't count.",
    mistake:"Slowing the sprint to save energy — defeats the purpose",
    progression:"Add a pass motion after beating the cone",
  },
  "clearing-pressure": {
    title:"Clearing kick inconsistent under pressure",
    diagnosis:"When a defender is close, your body shape changes — you rush and lean forward.",
    drill:"Sprint-to-kick", location:"Pitch", duration:"15 min", reps:"10 reps each foot",
    setup:"Ball on ground at 5m. Start at try line.",
    execution:"1. Full sprint from try line to ball\n2. Without slowing significantly, strike the clearing kick\n3. Target: land between 22m and 40m",
    cue:"Approach at an angle. Never dead straight.",
    mistake:"Jogging to the ball — that's not pressure. Keep the sprint.",
    progression:"Add a cone 2m away to route around before kicking",
  },  prehab: {
    label: "Prehab", icon: "🛠️", color: GOLD,
    drills: [
      { name:"Nordic curl negative", level:"Advanced", solo:false, space:"home",
        setup:"Anchor ankles under a sofa/partner, kneel on a cushioned surface.",
        execution:"Lower your body as slowly as possible (5 sec down), push back up with hands. 3 sets of 5–8 reps.",
        cue:"Resist the fall the whole way down — the slow eccentric is what builds hamstring strength.",
        why:"The single most evidence-backed hamstring injury prevention exercise in field sports." },
      { name:"Copenhagen adduction", level:"Intermediate", solo:false, space:"home",
        setup:"Side plank with top leg on a bench or partner's hands.",
        execution:"Lift bottom leg to touch the top one, slowly lower. 3×8 each side.",
        cue:"Keep hips level — don't let the bottom hip drop.",
        why:"Directly prevents groin/adductor injuries, the #2 rugby injury." },
      { name:"Single-leg ankle stability", level:"Foundation", solo:true, space:"home",
        setup:"Open floor space.",
        execution:"Stand on one foot, eyes closed, 30 seconds each side. Then 10 small silent hops each foot.",
        cue:"Land silently — if you hear a thud, you're not absorbing properly.",
        why:"Ankle sprains are the most common joint injury in rugby — this is your defence." },
      { name:"Hip flexor release", level:"Foundation", solo:true, space:"home",
        setup:"Open floor space.",
        execution:"Half-kneeling lunge stretch, 90 seconds each side. Press back knee into ground, drive hips forward gently.",
        cue:"Feel the stretch in the front of the back hip, not the knee.",
        why:"Counters every hour spent crouched at rucks — essential for kicking range." },
      { name:"Thoracic rotation", level:"Foundation", solo:true, space:"home",
        setup:"All-fours position.",
        execution:"Thread the needle — slide one arm under body, rotate spine. 10 reps each side.",
        cue:"Keep the hips still — only the upper back rotates.",
        why:"Your kicking mechanics live in thoracic rotation range." },
      { name:"Glute bridge single-leg", level:"Foundation", solo:true, space:"home",
        setup:"Lying on back, one knee bent.",
        execution:"Drive through the heel, lift hips until body is straight. 3×12 each leg.",
        cue:"Squeeze the glute hard at the top — don't let the other hip drop.",
        why:"Builds posterior chain strength with zero equipment." },
    ]
  },

};

// ── slider ────────────────────────────────────────────────────────────────────
function Slider({value,min,max,step,display,note,color,onChange}) {
  return (
    React.createElement('div', { style: {textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2455}}
      , React.createElement('div', { style: {fontSize:52,fontWeight:900,color,lineHeight:1,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2456}}, display(value))
      , React.createElement('input', { type: "range", min: min, max: max, step: step, value: value,
        onChange: e=>onChange(parseFloat(e.target.value)),
        style: {width:"100%",accentColor:color,cursor:"pointer",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2457}})
      , React.createElement('div', { style: {fontSize:13,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2460}}, note)
    )
  );
}

// ── reflection prompt modal ────────────────────────────────────────────────────
// ── inline reflection box — draft input at bottom of skill/drill pages ─────────
// This is a DRAFT only — text is saved when you tick the skill as done and
// rate the session in the modal. This prevents double-saving.
function InlineReflection({ skillKey, skillName, draft, onDraftChange, alreadySaved, savedText="" }) {
  const [editing, setEditing] = useState(false);

  if (alreadySaved && !editing) return (
    React.createElement('div', { style: {...card,padding:"13px 15px",marginTop:14,borderLeft:`3px solid ${GOLD}`,background:GOLDDIM}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2473}}
      , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2474}}
        , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2475}}, "✓ Note saved"  )
        , React.createElement('button', { onClick: ()=>setEditing(true), style: {fontSize:11,color:GOLD,background:"transparent",border:`1px solid ${GOLD}44`,borderRadius:6,padding:"3px 9px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2476}}, "Edit")
      )
      , savedText&&React.createElement('div', { style: {fontSize:12,color:T2,marginTop:4,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2478}}, savedText)
      , !savedText&&React.createElement('div', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2479}}, "Your note is in the Notes tab."      )
    )
  );

  return (
    React.createElement('div', { style: {...card,padding:"14px 15px",marginTop:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2484}}
      , React.createElement('div', { style: {fontSize:10,fontWeight:700,color:T3,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2485}}
        , alreadySaved ? "Edit your note" : "Write your thoughts — saved when you tick done"
      )
      , React.createElement('textarea', {
        value: draft||savedText||"",
        onChange: e=>onDraftChange(skillKey, e.target.value),
        placeholder: `Anything from this ${skillName} session worth remembering...`,
        style: {width:"100%",minHeight:90,padding:12,borderRadius:10,
          border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13.5,
          lineHeight:1.65,resize:"none",outline:"none",boxSizing:"border-box",
          fontFamily:"inherit",caretColor:GRN}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2488}})
      , alreadySaved&&(
        React.createElement('button', { onClick: ()=>setEditing(false), style: {marginTop:8,fontSize:11,color:T3,background:"transparent",border:`1px solid ${BD}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2497}}, "Cancel")
      )
      , !alreadySaved&&_optionalChain([draft, 'optionalAccess', _31 => _31.trim, 'call', _32 => _32()])&&(
        React.createElement('div', { style: {fontSize:11,color:T3,marginTop:8,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2500}}, "Tick the box when done — this will be included in your debrief"

        )
      )
    )
  );
}

function ReflectionModal({ skillKey, initialText="", onSave, onSkip }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState(initialText);
  const skill = SKILLS[skillKey];
  const placeholders = {
    gameStudy: "e.g. Gibson-Park scans left 3 times before every box kick — I never noticed that pattern before...",
    mental: "e.g. The visualisation felt slow today — I think I need to picture the crowd noise more vividly...",
    shortBoxKick: "e.g. Hang time was better off my right foot today, struggled to get height off my left...",
    longBoxKick: "e.g. Distance was good but I'm leaning forward too early, losing height...",
    grubber: "e.g. Ball kept skidding sideways instead of bouncing true — need to check my contact point...",
    crossKick: "e.g. Getting more consistent at the 25m mark but accuracy drops past 30m...",
    fiftyTwo: "e.g. Diagonal angle worked much better than straight — landed 6/10 in the corner zone...",
    clearingKick: "e.g. Under simulated pressure my technique broke down — rushed the strike...",
    passing: "e.g. Left hand release is still noticeably slower — need more isolated reps...",
    agility: "e.g. T-drill time improved by 0.3s — the lateral shuffle felt much sharper today...",
    breakdown: "e.g. Arrival speed felt good but I'm still standing up too early between cones...",
      edgeDefense: "e.g. Closing speed was good but I'm tackling too high on bigger runners...",
    highBall: "e.g. Tracking the ball at an angle is still awkward — need more angled reps...",
  };
  const RATING_LABELS = { 1:"Rough", 2:"Below par", 3:"Solid", 4:"Good", 5:"Excellent" };
  const RATING_COLORS = { 1:RED, 2:AMB, 3:T2, 4:GRN, 5:GRN };
  return (
    React.createElement('div', { 'data-surface': "1", style: { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex",
      alignItems:"flex-end", justifyContent:"center", zIndex:100, backdropFilter:"blur(20px)",
      WebkitBackdropFilter:"blur(20px)" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2530}}
      , React.createElement('div', { style: { width:"100%", maxWidth:560, background:"#1c1c1e",
        borderRadius:"16px 16px 0 0", padding:"8px 20px 40px",
        boxShadow:"0 -4px 40px rgba(0,0,0,0.5)" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2533}}
        /* drag indicator */
        , React.createElement('div', { style: {width:36,height:4,background:"rgba(255,255,255,0.2)",borderRadius:2,margin:"0 auto 20px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2537}})
        , React.createElement('div', { style: { fontSize:28, textAlign:"center", marginBottom:8 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2538}}, _optionalChain([skill, 'optionalAccess', _33 => _33.icon]) || "📝")
        , React.createElement('div', { style: { fontSize:19, fontWeight:800, color:T1, textAlign:"center", marginBottom:4 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2539}}, "How did it land?"

        )
        , React.createElement('div', { style: { fontSize:12, color:T3, textAlign:"center", marginBottom:18, lineHeight:1.5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2542}}
          , skillKey==="mentalTask" ? "Athlete's Mindset — rate the session" : `${_optionalChain([skill, 'optionalAccess', _34 => _34.name])} — rate the session`
        )

        , React.createElement('div', { style: { display:"flex", gap:8, justifyContent:"center", marginBottom:10 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2546}}
          , [1,2,3,4,5].map(n => (
            React.createElement('button', { key: n, onClick: ()=>setRating(n), style: {
              width:48, height:48, borderRadius:12, fontSize:18, fontWeight:800,
              border:`1.5px solid ${rating===n?RATING_COLORS[n]:BD}`,
              background:rating===n?RATING_COLORS[n]+"22":"transparent",
              color:rating===n?RATING_COLORS[n]:T2, cursor:"pointer", transition:"background-color 0.12s,border-color 0.12s,color 0.12s",
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2548}}, n)
          ))
        )
        , React.createElement('div', { style: { fontSize:12, color:rating?RATING_COLORS[rating]:T3, textAlign:"center",
          fontWeight:600, marginBottom:20, minHeight:16 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2556}}
          , rating ? RATING_LABELS[rating] : "Tap a number"
        )

        , React.createElement('textarea', {
          value: text,
          onChange: e=>setText(e.target.value),
          placeholder: placeholders[skillKey] || "Anything to note? Optional...",
          style: { width:"100%", minHeight:100, padding:14, borderRadius:12, border:`1px solid ${BD}`,
          background:S1, color:T1, fontSize:14, lineHeight:1.65, resize:"none", outline:"none",
          boxSizing:"border-box", fontFamily:"inherit", caretColor:GRN, marginBottom:18 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2561}}
        )
        , React.createElement('div', { style: { display:"flex", gap:10 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2569}}
          , React.createElement('button', { onClick: onSkip, style: { flex:1, padding:13, borderRadius:12,
            border:`1px solid ${BD}`, background:"transparent", color:T2, fontSize:14, cursor:"pointer" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2570}}, "Skip"

          )
          , React.createElement('button', { onClick: ()=>onSave(rating, text), disabled: !rating, style: {
            flex:2, padding:13, borderRadius:12, border:"none", fontSize:15, fontWeight:800,
            cursor:rating?"pointer":"default",
            background:rating?GOLD:T3, color:rating?BG:S1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2574}}, "Save →"

          )
        )
      )
    )
  );
}


// ── morning check-in ──────────────────────────────────────────────────────────
function Checkin({onDone, existing}) {
  const [step,setStep] = useState(0);
  const [d,setD] = useState(() => ({
    weight:"",
    timeMins: 15,
    space: "both",
    partners: 0,
    notes:"",
    injuryZones: [],
    ...(existing || {}),
  }));

  const wNum = parseFloat(d.weight);
  const wColor = !d.weight?T3 : wNum<WEIGHT_MIN?AMB : wNum>WEIGHT_MAX?RED : GRN;
  const wNote  = !d.weight?"" : wNum<WEIGHT_MIN?`${(WEIGHT_MIN-wNum).toFixed(1)}kg below range`:wNum>WEIGHT_MAX?`${(wNum-WEIGHT_MAX).toFixed(1)}kg above range`:"On target ✓";

  const toggleZone = (zone) => {
    setD(x => ({...x, injuryZones: _optionalChain([x, 'access', _35 => _35.injuryZones, 'optionalAccess', _36 => _36.includes, 'call', _37 => _37(zone)])
      ? x.injuryZones.filter(z=>z!==zone)
      : [...(x.injuryZones||[]), zone]
    }));
  };

  // Body zones with SVG hit areas (front + back)
  const ZONES = [
    {id:"head",       label:"Head/neck",     side:"front", cx:60,  cy:18,  r:13},
    {id:"lShoulder",  label:"L shoulder",    side:"front", cx:87,  cy:50,  r:9},
    {id:"rShoulder",  label:"R shoulder",    side:"front", cx:33,  cy:50,  r:9},
    {id:"chest",      label:"Chest",         side:"front", cx:60,  cy:72,  r:13},
    {id:"abdomen",    label:"Abdomen",       side:"front", cx:60,  cy:100, r:11},
    {id:"lElbow",     label:"L arm",         side:"front", cx:100, cy:90,  r:8},
    {id:"rElbow",     label:"R arm",         side:"front", cx:20,  cy:90,  r:8},
    {id:"lWrist",     label:"L wrist",       side:"front", cx:107, cy:130, r:7},
    {id:"rWrist",     label:"R wrist",       side:"front", cx:13,  cy:130, r:7},
    {id:"lQuad",      label:"L quad",        side:"front", cx:75,  cy:172, r:10},
    {id:"rQuad",      label:"R quad",        side:"front", cx:45,  cy:172, r:10},
    {id:"lKnee",      label:"L knee",        side:"front", cx:75,  cy:213, r:8},
    {id:"rKnee",      label:"R knee",        side:"front", cx:45,  cy:213, r:8},
    {id:"lShin",      label:"L shin",        side:"front", cx:75,  cy:240, r:8},
    {id:"rShin",      label:"R shin",        side:"front", cx:45,  cy:240, r:8},
    {id:"lAnkle",     label:"L ankle",       side:"front", cx:75,  cy:266, r:7},
    {id:"rAnkle",     label:"R ankle",       side:"front", cx:45,  cy:266, r:7},
    {id:"head",       label:"Head/neck",     side:"back",  cx:60,  cy:18,  r:13},
    {id:"neck",       label:"Neck/trap",     side:"back",  cx:60,  cy:42,  r:9},
    {id:"upperBack",  label:"Upper back",    side:"back",  cx:60,  cy:72,  r:13},
    {id:"lowerBack",  label:"Lower back",    side:"back",  cx:60,  cy:106, r:11},
    {id:"lGlute",     label:"L glute",       side:"back",  cx:75,  cy:130, r:10},
    {id:"rGlute",     label:"R glute",       side:"back",  cx:45,  cy:130, r:10},
    {id:"lHamstring", label:"L hamstring",   side:"back",  cx:75,  cy:175, r:10},
    {id:"rHamstring", label:"R hamstring",   side:"back",  cx:45,  cy:175, r:10},
    {id:"lCalf",      label:"L calf",        side:"back",  cx:75,  cy:238, r:8},
    {id:"rCalf",      label:"R calf",        side:"back",  cx:45,  cy:238, r:8},
    {id:"lAchilles",  label:"L achilles",    side:"back",  cx:75,  cy:260, r:7},
    {id:"rAchilles",  label:"R achilles",    side:"back",  cx:45,  cy:260, r:7},
  ];

  const BodySVG = ({side}) => {
    const zones = ZONES.filter(z=>z.side===side);
    const bc = "#2a2a2e", sc = "rgba(255,255,255,0.2)";
    return (
      React.createElement('svg', { viewBox: "0 0 120 290"   , style: {width:"100%",maxWidth:130,userSelect:"none",touchAction:"manipulation"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2648}}
        , React.createElement('ellipse', { cx: "60", cy: "18", rx: "14", ry: "16", fill: bc, stroke: sc, strokeWidth: "1.2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2649}})
        , React.createElement('rect', { x: "55", y: "32", width: "10", height: "9", rx: "2", fill: bc, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2650}})
        , React.createElement('path', { d: "M38,40 C30,43 26,50 26,62 L26,112 C26,120 31,124 38,124 L82,124 C89,124 94,120 94,112 L94,62 C94,50 90,43 82,40 C76,37 68,35 60,35 C52,35 44,37 38,40Z"                     , fill: bc, stroke: sc, strokeWidth: "1.2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2651}})
        , React.createElement('path', { d: "M82,42 C90,44 98,52 100,62 L105,90 C106,95 104,100 100,100 L98,100 C94,100 92,95 91,90 L86,62 C85,55 84,48 82,42Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2652}})
        , React.createElement('path', { d: "M100,100 C103,103 106,108 107,116 L110,136 C111,141 109,145 105,145 L103,145 C99,145 97,141 96,136 L93,116 C92,109 95,103 100,100Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2653}})
        , React.createElement('path', { d: "M38,42 C30,44 22,52 20,62 L15,90 C14,95 16,100 20,100 L22,100 C26,100 28,95 29,90 L34,62 C35,55 36,48 38,42Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2654}})
        , React.createElement('path', { d: "M20,100 C17,103 14,108 13,116 L10,136 C9,141 11,145 15,145 L17,145 C21,145 23,141 24,136 L27,116 C28,109 25,103 20,100Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2655}})
        , React.createElement('path', { d: "M38,124 C32,126 28,130 28,136 L29,144 C29,148 33,150 38,150 L82,150 C87,150 91,148 91,144 L92,136 C92,130 88,126 82,124Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2656}})
        , React.createElement('path', { d: "M60,150 C68,150 80,152 82,156 L84,206 C84,212 81,216 77,216 L73,216 C69,216 66,212 66,206 L65,156 C64,152 62,150 60,150Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2657}})
        , React.createElement('path', { d: "M60,150 C52,150 40,152 38,156 L36,206 C36,212 39,216 43,216 L47,216 C51,216 54,212 54,206 L55,156 C56,152 58,150 60,150Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2658}})
        , React.createElement('path', { d: "M68,220 C67,222 66,228 66,234 L66,260 C66,265 69,268 73,268 L77,268 C81,268 84,265 84,260 L83,234 C83,228 82,222 81,220Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2659}})
        , React.createElement('path', { d: "M52,220 C53,222 54,228 54,234 L54,260 C54,265 51,268 47,268 L43,268 C39,268 36,265 36,260 L37,234 C37,228 38,222 39,220Z"               , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2660}})
        , React.createElement('path', { d: "M66,266 C64,268 62,272 64,275 L84,275 C86,272 86,268 83,266Z"       , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2661}})
        , React.createElement('path', { d: "M54,266 C56,268 58,272 56,275 L36,275 C34,272 34,268 37,266Z"       , fill: bc, stroke: sc, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2662}})
        , zones.map(z => {
          const on = injured.has(z.id);
          return (
            React.createElement('circle', { key: z.id+z.side+z.cy, cx: z.cx, cy: z.cy, r: z.r,
              fill: on ? "rgba(196,30,58,0.65)" : "rgba(255,255,255,0.05)",
              stroke: on ? "#ff375f" : "rgba(255,255,255,0.2)",
              strokeWidth: on ? 1.5 : 1,
              strokeDasharray: on ? "none" : "2,2",
              style: {cursor:"pointer"},
              onClick: ()=>toggleZone(z.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2666}}
            )
          );
        })
      )
    );
  };

  const injured = new Set(d.injuryZones||[]);
  const injuredLabels = [...new Set(ZONES.filter(z=>injured.has(z.id)).map(z=>z.label))];

  const STEPS = [
    // Step 1 — Weight
    { icon:"⚖️", title:"Morning weight", sub:"", ok:true,
      body:(
        React.createElement('div', { style: {display:"flex",flexDirection:"column",alignItems:"center",gap:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2687}}
          , React.createElement('div', { style: {display:"flex",alignItems:"baseline",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2688}}
            , React.createElement('input', { type: "number", value: d.weight, onChange: e=>setD(x=>({...x,weight:e.target.value})),
              placeholder: "84", style: {fontSize:64,fontWeight:900,width:120,textAlign:"center",
              background:"transparent",border:"none",outline:"none",color:wColor,caretColor:GOLD,fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2689}})
            , React.createElement('span', { style: {fontSize:22,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2692}}, "kg")
          )
          , d.weight&&React.createElement('div', { style: {fontSize:13,color:wColor,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2694}}, wNote)
          , !d.weight&&React.createElement('div', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2695}}, "Skip if you haven't weighed in"     )
        )
      )},

    // Step 2 — Time available
    { icon:"⏱️", title:"How much time today?", sub:"", ok:true,
      body:(
        React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2702}}
          , [[15,"15 min","Quick activation"],[30,"30 min","Focused session"],[45,"45 min","Good session"],[60,"60 min","Full session"],[90,"90 min+","Extended block"]].map(([v,l,sub])=>{
            const sel=(_nullishCoalesce(d.timeMins, () => (30)))===v;
            return (
              React.createElement('button', { key: v, onClick: ()=>setD(x=>({...x,timeMins:v})), style: {
                padding:"14px 18px",borderRadius:12,fontSize:14,fontWeight:sel?700:400,
                border:`1px solid ${sel?GOLD:BD}`,background:sel?GOLDDIM:"transparent",
                color:sel?GOLD:T2,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2706}}
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2711}}, l)
                , React.createElement('span', { style: {fontSize:11,color:sel?GOLD:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2712}}, sub)
              )
            );
          })
        )
      )},

    // Step 3 — Location
    { icon:"📍", title:"Where are you training?", sub:"", ok:!!d.space,
      body:(
        React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2722}}
          , [
            {key:"pitch", label:"🏟️ Pitch",    sub:"Full field available"},
            {key:"both",  label:"🏟️+🏋️ Both",  sub:"Pitch and gym access"},
            {key:"gym",   label:"🏋️ Gym",       sub:"Weights + agility"},
            {key:"park",  label:"🌳 Park/grass", sub:"Open space, no posts"},
            {key:"home",  label:"🏠 Home",       sub:"Limited space"},
            {key:"none",  label:"📵 No space",   sub:"Travelling / rest day"},
          ].map(o=>{
            const sel=d.space===o.key;
            return (
              React.createElement('button', { key: o.key, onClick: ()=>setD(x=>({...x,space:o.key})), style: {
                padding:"14px 18px",borderRadius:12,fontSize:14,fontWeight:sel?700:400,
                border:`1px solid ${sel?GOLD:BD}`,background:sel?GOLDDIM:"transparent",
                color:sel?GOLD:T2,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2733}}
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2738}}, o.label)
                , React.createElement('span', { style: {fontSize:11,color:sel?GOLD:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2739}}, o.sub)
              )
            );
          })
        )
      )},

    // Step 4 — Partners
    { icon:"🤝", title:"Training with anyone?", sub:"", ok:true,
      body:(
        React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2749}}
          , [[0,"Solo","Just me"],[1,"1 partner","Pair work possible"],[2,"2 people","Small group"],[3,"3+ people","Full group session"]].map(([v,l,sub])=>{
            const sel=(_nullishCoalesce(d.partners, () => (0)))===v;
            return (
              React.createElement('button', { key: v, onClick: ()=>setD(x=>({...x,partners:v})), style: {
                padding:"14px 18px",borderRadius:12,fontSize:14,fontWeight:sel?700:400,
                border:`1px solid ${sel?GRNA:BD}`,background:sel?GDIM:"transparent",
                color:sel?GRNA:T2,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2753}}
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2758}}, l)
                , React.createElement('span', { style: {fontSize:11,color:sel?GRNA:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2759}}, sub)
              )
            );
          })
        )
      )},

    // Step 5 — Body map
    { icon:"🩺", title:"Any pain or tightness?", sub:"Tap where it hurts — the plan adjusts", ok:true,
      body:(
        React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2769}}
          , React.createElement('div', { style: {display:"flex",gap:12,justifyContent:"center",marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2770}}
            , React.createElement('div', { style: {textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2771}}
              , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2772}}, "Front")
              , React.createElement(BodySVG, { side: "front", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2773}})
            )
            , React.createElement('div', { style: {textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2775}}
              , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2776}}, "Back")
              , React.createElement(BodySVG, { side: "back", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2777}})
            )
          )
          , injuredLabels.length>0 ? (
            React.createElement('div', { style: {background:"rgba(196,30,58,0.1)",border:"1px solid rgba(196,30,58,0.3)",borderRadius:12,padding:"10px 14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2781}}
              , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:REDA,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2782}}, "⚠️ Flagged" )
              , React.createElement('div', { style: {display:"flex",flexWrap:"wrap",gap:5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2783}}
                , injuredLabels.map(l=>(
                  React.createElement('span', { key: l, style: {fontSize:11,color:REDA,background:"rgba(196,30,58,0.15)",borderRadius:6,padding:"3px 8px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2785}}, l)
                ))
              )
              , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2788}}, "Exercises that stress these areas will be removed."       )
            )
          ):(
            React.createElement('div', { style: {textAlign:"center",padding:"8px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2791}}
              , React.createElement('div', { style: {fontSize:13,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2792}}, "All clear — no restrictions"    )
            )
          )
        )
      )},

    // Step 6 — Focus + notes
    { icon:"🎯", title:"One focus for today", sub:"Optional — helps personalise the session", ok:true,
      body:(
        React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2801}}
          , React.createElement('input', { value: d.focus||"", onChange: e=>setD(x=>({...x,focus:e.target.value})),
            placeholder: "e.g. weak foot box kick, stay low at breakdown..."        ,
            style: {width:"100%",padding:"14px",borderRadius:12,border:`1px solid ${BD}`,
            background:S1,color:T1,fontSize:15,outline:"none",
            boxSizing:"border-box",fontFamily:"inherit",caretColor:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2802}})
          , React.createElement('textarea', { value: d.notes||"", onChange: e=>setD(x=>({...x,notes:e.target.value})),
            placeholder: "Anything else — tired, tight, travelling?"     ,
            style: {width:"100%",minHeight:80,padding:14,borderRadius:12,border:`1px solid ${BD}`,
            background:S1,color:T1,fontSize:14,lineHeight:1.6,resize:"none",outline:"none",
            boxSizing:"border-box",fontFamily:"inherit",caretColor:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2807}})
        )
      )},
  ];
  const cur=STEPS[step];
  const isLast=step===STEPS.length-1;
  const skipToEnd = false;
  return (
    React.createElement('div', { 'data-surface': "1", style: {position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",
      alignItems:"flex-end",justifyContent:"center",zIndex:100,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2819}}
      , React.createElement('div', { style: {width:"100%",maxWidth:560,background:"#1c1c1e",borderRadius:"16px 16px 0 0",
        boxShadow:"0 -4px 40px rgba(0,0,0,0.5)",padding:"8px 20px 44px",maxHeight:"92vh",overflowY:"auto"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2821}}
        , React.createElement('div', { style: {width:36,height:4,background:"rgba(255,255,255,0.2)",borderRadius:2,margin:"0 auto 20px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2823}})
        , React.createElement('div', { style: {display:"flex",gap:5,justifyContent:"center",marginBottom:26}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2824}}
          , STEPS.map((_,i)=>React.createElement('div', { key: i, style: {height:3,borderRadius:2,transition:"background-color 0.25s,width 0.25s",
            width:i===step?26:6,background:i<step?REDA:i===step?REDA:S3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2825}}))
        )
        , React.createElement('div', { style: {fontSize:28,textAlign:"center",marginBottom:5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2828}}, cur.icon)
        , React.createElement('div', { style: {fontSize:19,fontWeight:800,color:T1,textAlign:"center",marginBottom:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2829}}, cur.title)
        , React.createElement('div', { style: {fontSize:12,color:T3,textAlign:"center",marginBottom:24,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2830}}, cur.sub)
        , cur.body
        , React.createElement('div', { style: {display:"flex",gap:10,marginTop:24}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2832}}
          , step>0&&React.createElement('button', { onClick: ()=>setStep(s=>s-1), style: {flex:1,padding:13,borderRadius:12,
            border:`1px solid ${BD}`,background:"transparent",color:T2,fontSize:14,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2833}}, "Back")
          , React.createElement('button', { onClick: ()=> skipToEnd ? onDone(d) : isLast ? onDone(d) : setStep(s=>s+1), disabled: !cur.ok, style: {
            flex:2,padding:13,borderRadius:12,border:"none",fontSize:15,fontWeight:800,
            cursor:cur.ok?"pointer":"default",background:cur.ok?GOLD:T3,color:cur.ok?BG:S1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2835}}
            , isLast||skipToEnd?"Start my day →":"Next"
          )
        )
      )
    )
  );
}

// ── stat ──────────────────────────────────────────────────────────────────────
function Stat({label,value,sub,color}) {
  return (
    React.createElement('div', { style: {background:S1,borderRadius:12,flex:"1 1 80px",minWidth:75,padding:"12px 14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2849}}
      , React.createElement('div', { style: {fontSize:12,fontWeight:500,color:T3,marginBottom:4,letterSpacing:"0.01em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2850}}, label)
      , React.createElement('div', { style: {fontSize:24,fontWeight:700,color:color||T1,lineHeight:1,letterSpacing:"-0.02em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2851}}, value)
      , sub&&React.createElement('div', { style: {fontSize:11,color:T3,marginTop:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2852}}, sub)
    )
  );
}

// ── sparkline ─────────────────────────────────────────────────────────────────
// ── speak session — reads progression steps aloud so eyes can stay closed ─────
function SpeakSession({ steps, skillColor }) {
  const [phase, setPhase] = useState("idle"); // idle | speaking | waiting | done
  const [currentStep, setCurrentStep] = useState(-1);
  const [countdown, setCountdown] = useState(0);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const wakeLockRef = useRef(null);
  const audioRef = useRef(null);

  // keep the screen awake during the session
  async function acquireWakeLock() {
    // try the modern Wake Lock API first (Chrome/Safari 16.4+)
    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        return;
      } catch (e23) {}
    }
    // fallback: play a silent looping audio file — tricks the OS into thinking
    // media is playing so it won't lock the screen
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(ctx.destination);
      src.start(0);
      audioRef.current = { src, ctx };
    } catch (e24) {}
  }

  function releaseWakeLock() {
    try { _optionalChain([wakeLockRef, 'access', _38 => _38.current, 'optionalAccess', _39 => _39.release, 'call', _40 => _40()]); wakeLockRef.current = null; } catch (e25) {}
    try { _optionalChain([audioRef, 'access', _41 => _41.current, 'optionalAccess', _42 => _42.src, 'optionalAccess', _43 => _43.stop, 'call', _44 => _44()]); _optionalChain([audioRef, 'access', _45 => _45.current, 'optionalAccess', _46 => _46.ctx, 'optionalAccess', _47 => _47.close, 'call', _48 => _48()]); audioRef.current = null; } catch (e26) {}
  }

  // always show mm:ss — never raw seconds
  const formatTime = (s) => {
    const total = Math.round(s); // remove any floating point
    const m = Math.floor(total / 60);
    const sec = total % 60;
    return `${m}:${String(sec).padStart(2,"0")}`;
  };

  // parse "5 min" or "10 min" from the step duration field into seconds
  function parseDurationSecs(dur) {
    if (!dur) return 60;
    const n = parseInt(dur);
    if (isNaN(n)) return 60;
    if (dur.includes("min")) return n * 60;
    return n;
  }

  const timerRef = useRef(null);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  function clearTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function stop() {
    clearTimer();
    releaseWakeLock();
    try { window.speechSynthesis.cancel(); } catch (e27) {}
    setPhase("idle");
    setCurrentStep(-1);
    setCountdown(0);
  }

  function start() {
    if (!supported) return;
    try { window.speechSynthesis.cancel(); } catch (e28) {}
    clearTimer();
    acquireWakeLock();
    speakStep(steps, 0);
  }

  // cleanup on unmount
  useEffect(() => () => { clearTimer(); releaseWakeLock(); try { window.speechSynthesis.cancel(); } catch (e29) {} }, []);

  // after the voice finishes speaking, run the silence countdown for the step's full allocated time
  function startSilence(steps, index, speechDuration) {
    const totalSecs = parseDurationSecs(steps[index].duration);
    const silenceSecs = Math.max(10, Math.round(totalSecs - speechDuration)); // always integer
    setCountdown(silenceSecs);
    setPhase("waiting");

    let remaining = silenceSecs;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearTimer();
        if (index < stepsRef.current.length - 1) {
          speakStep(stepsRef.current, index + 1);
        } else {
          // finished — final message
          setPhase("speaking");
          const done = new SpeechSynthesisUtterance(
            "Session complete. Stay where you are for a moment. Take three slow breaths before you open your eyes."
          );
          done.rate = 0.82;
          done.onend = () => { releaseWakeLock(); setPhase("done"); setCurrentStep(-1); };
          try { window.speechSynthesis.speak(done); } catch (e30) { setPhase("done"); }
        }
      }
    }, 1000);
  }

  function speakStep(steps, index) {
    clearTimer();
    if (index >= steps.length) { setPhase("done"); return; }

    setCurrentStep(index);
    setPhase("speaking");
    setCountdown(0);

    const step = steps[index];

    // For the first step of a visualisation, add a settling instruction
    const isFirstStep = index === 0;
    const preamble = isFirstStep ? "Close your eyes. " : "";
    const text = `${preamble}${step.stage}. ${step.text}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;   // slow and clear — easy to absorb eyes-closed
    utterance.pitch = 0.95;  // slightly lower = calmer, more coach-like
    utterance.volume = 1.0;

    const speakStart = Date.now();
    utterance.onend = () => {
      const speechDuration = (Date.now() - speakStart) / 1000;
      startSilence(steps, index, speechDuration);
    };
    utterance.onerror = () => stop();

    try { window.speechSynthesis.speak(utterance); } catch (e31) { stop(); }
  }

  if (!supported) return null;

  if (phase === "idle") return (
    React.createElement('div', { style: {marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3002}}
      , React.createElement('button', { onClick: start, style: {
        width:"100%", padding:"14px", borderRadius:12,
        border:`1.5px solid ${skillColor}44`,
        background:`${skillColor}11`,
        color:skillColor, fontSize:14, fontWeight:700, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:10,
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3003}}
        , React.createElement('span', { style: {fontSize:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3010}}, "🎧"), "Read this aloud — close your eyes and listen"

      )
    )
  );

  if (phase === "done") return (
    React.createElement('div', { style: {...card,padding:"16px",marginBottom:14,borderLeft:`3px solid ${skillColor}`,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3017}}
      , React.createElement('div', { style: {fontSize:24,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3018}}, "✓")
      , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:skillColor,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3019}}, "Session complete" )
      , React.createElement('div', { style: {fontSize:12,color:T3,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3020}}, "Take your time before opening your eyes."      )
      , React.createElement('button', { onClick: ()=>{setPhase("idle");setCurrentStep(-1);}, style: {
        fontSize:12,color:T3,background:"transparent",border:`1px solid ${BD}`,
        borderRadius:8,padding:"5px 14px",cursor:"pointer",
      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3021}}, "Start again" )
    )
  );

  return (
    React.createElement('div', { style: {...card,padding:"16px",marginBottom:14,borderLeft:`3px solid ${skillColor}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3029}}
      , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3030}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3031}}
          , React.createElement('div', { style: {fontSize:12,fontWeight:700,color:skillColor,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3032}}
            , phase==="speaking" ? "🗣 Reading…" : "🤫 Your time to think"
          )
          , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3035}}, "Step "
             , currentStep+1, " of "  , steps.length, " — "  , _optionalChain([steps, 'access', _49 => _49[currentStep], 'optionalAccess', _50 => _50.stage])
          )
        )
        , React.createElement('button', { onClick: stop, style: {
          fontSize:11,color:T3,background:"transparent",
          border:`1px solid ${BD}`,borderRadius:8,padding:"4px 11px",cursor:"pointer",
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3039}}, "Stop")
      )

      /* countdown bar — only shown during silence phase */
      , phase==="waiting" && (
        React.createElement('div', { style: {marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3047}}
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3048}}
            , React.createElement('span', { style: {fontSize:12,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3049}}, "Silence — take your time"    )
            , React.createElement('span', { style: {fontSize:14,fontWeight:800,color:skillColor}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3050}}, formatTime(countdown))
          )
              , React.createElement('div', { style: {height:4,borderRadius:2,background:S2,overflow:"hidden",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3052}}
                , React.createElement('div', { style: {
                  height:"100%", borderRadius:2, background:skillColor,
                  width:`${Math.max(0, (1 - countdown/Math.max(1,parseDurationSecs(_optionalChain([steps, 'access', _51 => _51[currentStep], 'optionalAccess', _52 => _52.duration])||"60s")))*100)}%`,
                  transition:"width 1s linear",
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3053}})
          )
          , React.createElement('button', { onClick: ()=>{
            clearTimer();
            if (currentStep < steps.length - 1) speakStep(stepsRef.current, currentStep + 1);
            else {
              setPhase("speaking");
              const done = new SpeechSynthesisUtterance("Session complete. Stay where you are for a moment. Take three slow breaths before you open your eyes.");
              done.rate = 0.82;
              done.onend = () => { releaseWakeLock(); setPhase("done"); setCurrentStep(-1); };
              try { window.speechSynthesis.speak(done); } catch (e32) { setPhase("done"); }
            }
          }, style: {
            width:"100%", padding:"10px", borderRadius:10,
            border:`1px solid ${skillColor}44`, background:`${skillColor}11`,
            color:skillColor, fontSize:13, fontWeight:600, cursor:"pointer",
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3059}}, "Next step →"

          )
        )
      )

      /* skip during reading phase too */
      , phase==="speaking" && currentStep >= 0 && (
        React.createElement('div', { style: {marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3081}}
          , React.createElement('button', { onClick: ()=>{
            try { window.speechSynthesis.cancel(); } catch (e33) {}
            if (currentStep < steps.length - 1) speakStep(stepsRef.current, currentStep + 1);
            else setPhase("done");
          }, style: {
            width:"100%", padding:"10px", borderRadius:10,
            border:`1px solid ${BD}`, background:"transparent",
            color:T3, fontSize:12, cursor:"pointer",
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3082}}, "Skip reading →"

          )
        )
      )

      /* step list */
      , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3097}}
        , steps.map((st,i)=>(
          React.createElement('div', { key: i, style: {
            display:"flex",alignItems:"center",gap:10,padding:"7px 10px",
            borderRadius:8,
            background:i===currentStep?skillColor+"22":i<currentStep?"#0f170f":"transparent",
            transition:"background 0.4s",
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3099}}
            , React.createElement('span', { style: {fontSize:11,fontWeight:800,width:18,textAlign:"center",flexShrink:0,
              color:i===currentStep?skillColor:i<currentStep?GRN+"88":T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3105}}
              , i<currentStep?"✓":i===currentStep?"▶":i+1
            )
            , React.createElement('span', { style: {fontSize:12,
              color:i===currentStep?T1:i<currentStep?T3:T3,
              fontWeight:i===currentStep?600:400,
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3109}}, st.stage)
            , React.createElement('span', { style: {fontSize:10,color:T3,marginLeft:"auto",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3113}}, st.duration)
          )
        ))
      )
    )
  );
}

function Sparkline({data,color,targetMin,targetMax,height=44}) {
  if (!data||data.length<2) return React.createElement('div', { style: {height,display:"flex",alignItems:"center",justifyContent:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3122}}, React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3122}}, "Need 2+ days of data"    ));
  const W=280,H=height;
  const mn=Math.min(...data.map(d=>d.v))*0.97;
  const mx=Math.max(...data.map(d=>d.v))*1.03;
  const px=i=>(i/(data.length-1))*W;
  const py=v=>H-((v-mn)/(mx-mn))*H;
  const pts=data.map((d,i)=>`${px(i)},${py(d.v)}`).join(" ");
  return (
    React.createElement('svg', { width: "100%", viewBox: `0 0 ${W} ${H}`, style: {overflow:"visible"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3130}}
      , targetMin&&targetMax&&React.createElement('rect', { x: 0, y: py(targetMax), width: W, height: py(targetMin)-py(targetMax), fill: color, fillOpacity: 0.07, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3131}})
      , React.createElement('polyline', { points: pts, fill: "none", stroke: color, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3132}})
      , data.map((d,i)=>React.createElement('circle', { key: i, cx: px(i), cy: py(d.v), r: 3, fill: color, fillOpacity: i===data.length-1?1:0.5, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3133}}))
    )
  );
}

// ── progress ──────────────────────────────────────────────────────────────────

function Progress({history, scores, reflections, customDrills, streak, wMin=83, wMax=86, doneKey=0, gamePtsV=0, todayK=todayKey(), customSkills=[], suppV=0}) {
  const [progressView, setProgressView] = useState("momentum");
  const [scrubDate, setScrubDate] = useState(null);
  const entries = Object.entries(history).sort((a,b)=>a[0].localeCompare(b[0]));

  const [scoreSkillFilter, setScoreSkillFilter] = useState(null);
  const [chartView, setChartView] = useState("week");
  const [perfectWeekOpen, setPerfectWeekOpen] = useState(false);
  const [chartRange, setChartRange] = useState(30);
  const [balanceRange, setBalanceRange] = useState(30);

  // filter entries by chartRange
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - chartRange);
  const cutoffStr = localDateStr(cutoff);
  const rangedEntries = entries.filter(([k])=>k>=cutoffStr);
  const wData = rangedEntries.filter(([,v])=>v.weight).map(([k,v])=>({k,v:parseFloat(v.weight)}));

  const rangeButtons = () => (
    React.createElement('div', { style: {display:"flex",gap:4,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3159}}
      , [7,14,30,365].map(r=>(
        React.createElement('button', { key: r, onClick: ()=>setChartRange(r), style: {
          flex:1,padding:"5px 0",borderRadius:8,border:"none",fontSize:11,fontWeight:chartRange===r?700:400,
          cursor:"pointer",background:chartRange===r?GOLD:S2,color:chartRange===r?BG:T3,
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3161}}, r===365?"1y":`${r}d`)
      ))
    )
  );
  const balanceRangeButtons = () => (
    React.createElement('div', { style: {display:"flex",gap:4,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3169}}
      , [7,14,30,365].map(r=>(
        React.createElement('button', { key: r, onClick: ()=>setBalanceRange(r), style: {
          flex:1,padding:"5px 0",borderRadius:8,border:"none",fontSize:11,fontWeight:balanceRange===r?700:400,
          cursor:"pointer",background:balanceRange===r?GOLD:S2,color:balanceRange===r?BG:T3,
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3171}}, r===365?"1y":`${r}d`)
      ))
    )
  );
  const scoredSkills = [...new Set((scores||[]).map(s=>s.skillKey))]
    .sort((a,b)=>(scores.filter(s=>s.skillKey===b).length)-(scores.filter(s=>s.skillKey===a).length));

  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  function handleExport() {
    const csv = exportAllDataToCsv(history, scores, reflections, customDrills);
    const filename = `portugal-9-data-${todayK}.csv`;
    downloadCsv(csv, filename);
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importCsvData(ev.target.result);
      if (result.error) {
        setImportStatus({ ok:false, msg: result.error });
      } else {
        setImportStatus({ ok:true, msg:
          `Imported ${result.checkins} check-ins, ${result.done} training days, ${result.scores} scores, ${result.reflections} notes. Reload to see it.` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const exportImportCard = (
    React.createElement('div', { style: {...card,padding:"12px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3208}}
      , React.createElement('div', { style: {...lbl,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3209}}, "Backup")
      , React.createElement('div', { style: {display:"flex",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3210}}
        , React.createElement('button', { onClick: handleExport, style: {
          flex:1, padding:"11px", borderRadius:10, border:`1px solid ${BD}`,
          background:"transparent", color:T2, fontWeight:600, fontSize:13, cursor:"pointer",
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3211}}, "↓ CSV" )
        , React.createElement('button', { onClick: ()=>_optionalChain([fileInputRef, 'access', _53 => _53.current, 'optionalAccess', _54 => _54.click, 'call', _55 => _55()]), style: {
          flex:1, padding:"11px", borderRadius:10, border:`1px solid ${BD}`,
          background:"transparent", color:T2, fontWeight:600, fontSize:13, cursor:"pointer",
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3215}}, "↑ Import" )
        , React.createElement('input', { ref: fileInputRef, type: "file", accept: ".csv", onChange: handleImportFile, style: {display:"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3219}})
      )
      , importStatus && (
        React.createElement('div', { style: { marginTop:10, fontSize:12, color: importStatus.ok?GRNA:REDA, lineHeight:1.5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3222}}
          , importStatus.msg
        )
      )
    )
  );

  if (entries.length===0) return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3230}}
      , React.createElement('div', { style: {...card,padding:"36px 20px",textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3231}}
        , React.createElement('div', { style: {fontSize:32,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3232}}, "📊")
        , React.createElement('div', { style: {fontSize:15,fontWeight:700,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3233}}, "No data yet"  )
        , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3234}}, "Complete your morning check-in each day and your trends appear here."          )
      )
    )
  );

  const renderPerfectWeek = () => {
    const phase = getPhase(daysUntil(RWC_DATE));
    const phaseName = phase.name;

    const WEEK = {
      Foundation: [
        { day:"Mon", sessions:[
          {icon:"🏉", name:"Box kick technique", detail:"Zone targeting, hang time count, both feet"},
          {icon:"🏉", name:"Passing technique", detail:"Bag pass, weak hand isolation, one-touch rhythm"},
          {icon:"🛠️", name:"Prehab", detail:"Nordic, Copenhagen, ankle stability, hip flexor"},
        ]},
        { day:"Tue", sessions:[
          {icon:"🧠", name:"Decision making", detail:"Pre-arrival scan, film prediction, traffic lights"},
          {icon:"🏉", name:"Agility", detail:"T-drill, 5-10-5 shuttle, reactive footwork"},
          {icon:"🛠️", name:"Prehab", detail:"Hip flexor, thoracic rotation, glute bridge"},
        ]},
        { day:"Wed", sessions:[
          {icon:"🏉", name:"Passing", detail:"Weak hand emphasis, fatigue passing, long pass accuracy"},
          {icon:"🏉", name:"Breakdown speed", detail:"Low arrival, figure-8, cone rush circuit"},
          {icon:"🛠️", name:"Prehab", detail:"Full circuit"},
        ]},
        { day:"Thu", sessions:[
          {icon:"🏉", name:"Agility & footwork", detail:"Ladder, direction change, acceleration from ruck"},
          {icon:"📹", name:"Game study", detail:"Elite 9 technical analysis — one focused element"},
        ]},
        { day:"Fri", sessions:[
          {icon:"🏉", name:"Kicking range", detail:"All kick types — accuracy and variation"},
                    {icon:"🛠️", name:"Prehab", detail:"Nordic, Copenhagen, single-leg ankle"},
        ]},
        { day:"Sat", sessions:[
          {icon:"🧠", name:"Mental prep", detail:"Breathing protocol, visualisation, pre-match routine rehearsal"},
          {icon:"📹", name:"Game study", detail:"Opponent tendencies — kicking, defensive reads"},
        ]},
        { day:"Sun", sessions:[
          {icon:"🧘", name:"Mental", detail:"Breathing, visualisation, game study"},
        ]},
      ],
      Development: [
        { day:"Mon", sessions:[
          {icon:"🏉", name:"Short box kick — pressure", detail:"Sprint-to-kick, chaser drill, zone accuracy"},
          {icon:"🧠", name:"Decision making", detail:"Noise distraction, traffic lights, film pause"},
          {icon:"🛠️", name:"Prehab", detail:"Full circuit"},
        ]},
        { day:"Tue", sessions:[
          {icon:"🏉", name:"Passing under fatigue", detail:"Fatigue pass, bag pass, long pass accuracy"},
          {icon:"🏉", name:"Defence", detail:"Angle tackle, footwork mirror, 1v1"},
          {icon:"🛠️", name:"Prehab", detail:"Nordic, Copenhagen, hip flexor"},
        ]},
        { day:"Wed", sessions:[
                    {icon:"🏉", name:"Agility", detail:"Reactive drills, change of direction, acceleration"},
          {icon:"🛠️", name:"Prehab", detail:"Full circuit"},
        ]},
        { day:"Thu", sessions:[
          {icon:"📹", name:"Game study", detail:"Opponent 9 tendency tracking — write numbers down"},
          {icon:"🧠", name:"Mental", detail:"Visualisation + breathing protocol"},
        ]},
        { day:"Fri", sessions:[
          {icon:"🏉", name:"Kicking — all types", detail:"Box kick, grubber, cross kick, clearing kick"},
          {icon:"🏉", name:"High ball", detail:"Self-throw, angled tracking, contested catch"},
          {icon:"🛠️", name:"Prehab", detail:"Full circuit"},
        ]},
        { day:"Sat", sessions:[
          {icon:"🏉", name:"Decisions + passing combo", detail:"Decision triggers into immediate pass — game speed"},
          {icon:"📹", name:"Game study", detail:"Self-analysis or opponent film"},
        ]},
        { day:"Sun", sessions:[
          {icon:"🧘", name:"Mental + light movement", detail:"Breathing, visualisation, easy walk"},
        ]},
      ],
      Sharpening: [
        { day:"Mon", sessions:[
          {icon:"🏉", name:"Box kick — match pressure", detail:"Sprint-to-clear, contested reps, chaser drill"},
          {icon:"🧠", name:"Decisions under pressure", detail:"Noise, distraction, film pause drill"},
          {icon:"🛠️", name:"Prehab", detail:"Non-negotiable this close to RWC"},
        ]},
        { day:"Tue", sessions:[
          {icon:"🏉", name:"Passing sharpness", detail:"Quick ball, all ranges, fatigue reps"},
          {icon:"🏉", name:"Breakdown", detail:"Arrive fast, hit low, clear quickly"},
          {icon:"🛠️", name:"Prehab", detail:"Full circuit"},
        ]},
        { day:"Wed", sessions:[
          {icon:"🏉", name:"Kicking sharpness", detail:"All kick types — 10 each, pure accuracy focus"},
          {icon:"🏉", name:"Agility", detail:"Short, sharp — explosive first 3 steps"},
          {icon:"🛠️", name:"Prehab", detail:"Full circuit"},
        ]},
        { day:"Thu", sessions:[
          {icon:"📹", name:"Opponent study", detail:"Specific tactical patterns — detailed analysis"},
          {icon:"🧠", name:"Mental", detail:"Full pre-match routine rehearsal"},
        ]},
        { day:"Fri", sessions:[
          {icon:"🏉", name:"Light technical", detail:"Stay sharp — half pace, quality over quantity"},
          {icon:"🛠️", name:"Prehab", detail:"Full circuit"},
        ]},
        { day:"Sat", sessions:[
          {icon:"🧘", name:"Mental prep", detail:"Pre-match routine + visualisation — trust the work"},
        ]},
        { day:"Sun", sessions:[
          {icon:"🧘", name:"Rest + mental", detail:"Easy walk, breathing protocol"},
        ]},
      ],
      Tournament: [
        { day:"Mon", sessions:[
          {icon:"🏉", name:"Technical sharpness", detail:"Light kicking and passing — stay sharp, not tired"},
          {icon:"🛠️", name:"Prehab", detail:"Full circuit — never stops"},
        ]},
        { day:"Tue", sessions:[
          {icon:"🧠", name:"Decisions + kicking", detail:"Light technical — 70% effort only"},
          {icon:"📹", name:"Opponent study", detail:"Final opponent analysis before match week"},
        ]},
        { day:"Wed", sessions:[
          {icon:"🧘", name:"Mental prep", detail:"Visualisation + breathing — arrive ready"},
        ]},
        { day:"Thu", sessions:[{icon:"🧘", name:"Rest", detail:"Trust the preparation. Stay fresh."}]},
        { day:"Fri", sessions:[
          {icon:"🛠️", name:"Prehab", detail:"Stay loose. Contrast shower."},
          {icon:"🧘", name:"Mental", detail:"Pre-match routine rehearsal"},
        ]},
        { day:"Sat", sessions:[{icon:"🔴", name:"Match day", detail:"Go play. Good luck. Portugal 🇵🇹"}]},
        { day:"Sun", sessions:[{icon:"🧘", name:"Post-match", detail:"Easy movement + mobility only"}]},
      ],
    };

    const typeColor = {skill:GRNA, prehab:GOLD, mental:PRP, study:BLU, match:REDA};
    const getType = s => s.name.includes("Prehab")?"prehab":s.name.includes("study")||s.name.includes("Game")?"study":s.name.includes("Mental")||s.name.includes("mental")||s.name.includes("Match")||s.name.includes("Rest")?"mental":"skill";
    const week = WEEK[phaseName] || WEEK.Foundation;

    return (
      React.createElement('div', { style: {...card,overflow:"hidden",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3366}}
        , React.createElement('button', { onClick: ()=>setPerfectWeekOpen(o=>!o), style: {
          width:"100%",display:"flex",alignItems:"center",gap:10,
          padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3367}}
          , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3371}}
            , React.createElement('div', { style: {...lbl,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3372}}, "Perfect week — "   , phaseName, " phase" )
            , React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3373}}, "Ideal structure with full time available every day."       )
          )
          , React.createElement('span', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3375}}, perfectWeekOpen?"▲":"▼")
        )
        , perfectWeekOpen&&(
          React.createElement('div', { style: {borderTop:`1px solid ${BD}`,padding:"12px 16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3378}}
            , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3379}}
              , week.map(({day,sessions})=>(
                React.createElement('div', { key: day, style: {background:S2,borderRadius:10,padding:"10px 13px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3381}}
                  , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:GOLD,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3382}}, day)
                  , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3383}}
                    , sessions.map((s,i)=>{
                      const t = getType(s);
                      return (
                        React.createElement('div', { key: i, style: {display:"flex",gap:10,alignItems:"flex-start"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3387}}
                          , React.createElement('span', { style: {fontSize:16,flexShrink:0,marginTop:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3388}}, s.icon)
                          , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3389}}
                            , React.createElement('div', { style: {fontSize:12,fontWeight:600,color:typeColor[t]||T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3390}}, s.name)
                            , React.createElement('div', { style: {fontSize:11,color:T3,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3391}}, s.detail)
                          )
                        )
                      );
                    })
                  )
                )
              ))
            )
            , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:10,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3400}}, "Prehab 3–4×/week · Decisions + kicking daily · Mental prep every session"

            )
          )
        )
      )
    );
  };


  const renderColdChart = () => {
    const today = new Date(todayK+"T12:00:00");
    const points = [];

    const KICKING_SKILLS_S = new Set(["shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick"]);
    const PASSING_SKILLS  = new Set(["passing"]);
    const PHYSICAL_SKILLS = new Set(["agility","breakdown","highBall","prehab","recovery"]);
    const DEFENCE_SKILLS  = new Set(["edgeDefense"]);
    const MENTAL_SKILLS   = new Set(["mental"]);
    const STUDY_SKILLS    = new Set(["gameStudy"]);
    // custom skills
    (customSkills||[]).forEach(cs => {
      if (cs.type==="kicking")       KICKING_SKILLS_S.add(cs.key);
      else if (cs.type==="passing")  PASSING_SKILLS.add(cs.key);
      else if (cs.type==="physical") PHYSICAL_SKILLS.add(cs.key);
      else if (cs.type==="defence")  DEFENCE_SKILLS.add(cs.key);
      else if (cs.type==="mental")   MENTAL_SKILLS.add(cs.key);
      else if (cs.type==="study")    STUDY_SKILLS.add(cs.key);
      else PHYSICAL_SKILLS.add(cs.key);
    });
    const SPACE_FACTOR    = {pitch:1.2, both:1.15, gym:1.1, park:1.05, home:0.9, none:0.85};

    // First build raw daily scores for entire range + 7 day lookback
    const lookback = chartRange + 7;
    const rawScores = {};
    const breakdownByDate = {};
    for (let d = lookback - 1; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = localDateStr(date);

      let ciData = {};
      try { ciData = JSON.parse(localStorage.getItem("rwc_ci_"+dateStr)||"{}"); } catch (e34) {}
      const timeMins  = _nullishCoalesce(ciData.timeMins, () => ( 30));
      const space     = _nullishCoalesce(ciData.space, () => ( "home"));
      const spaceMult = _nullishCoalesce(SPACE_FACTOR[space], () => ( 1.0));

      const trainedToday = new Set();
      const trainedRaw = new Set(); // includes unrecognised keys
      try {
        const rec = JSON.parse(localStorage.getItem("rwc_done_"+dateStr)||"{}");
        Object.entries(rec).forEach(([rawKey, val]) => {
          if (!val) return;
          // retro-logged entries: __retro__<skillKey>__<timestamp36>
          const sk = rawKey.startsWith("__retro__")
            ? rawKey.split("__")[2]
            : rawKey.replace(/^__extra__/, '').replace(/__[a-z0-9]+$/, '').replace(/_pos\d+$/, '').replace(/_extra_[a-z0-9]+$/, '').replace(/_\d+$/, '');
          trainedRaw.add(sk);
          if (SKILLS[sk]) trainedToday.add(sk);
        });
      } catch (e35) {}
      // use trainedRaw size for time division so unknown skills still affect pacing
      const effectiveCount = Math.max(trainedRaw.size, trainedToday.size);

      let gameBonus = 0;
      try {
        const gpts = JSON.parse(localStorage.getItem("rwc_game_pts_"+dateStr)||"{}");
        const mentalBonus = gpts["mental_task"] ? 4 : 0;
        const gameOnly = {...gpts}; delete gameOnly["mental_task"];
        gameBonus = Math.min(Object.values(gameOnly).reduce((a,b)=>a+b,0), 5) + mentalBonus;
      } catch (e36) {}

      // build retro mins map: sk -> actual logged minutes
      const retroMinsMap = {};
      try {
        const rec2 = JSON.parse(localStorage.getItem("rwc_done_"+dateStr)||"{}");
        Object.entries(rec2).forEach(([rk,rv])=>{
          if(rk.startsWith("__retro__")&&!rk.endsWith("trained__")){
            const sk=rk.split("__")[2]; if(SKILLS[sk]) retroMinsMap[sk]=(retroMinsMap[sk]||0)+(_optionalChain([rv, 'optionalAccess', _56 => _56.mins])||0);
          }
        });
      } catch (e37) {}
      const hasRetroMins = Object.keys(retroMinsMap).length > 0;

      if (trainedToday.size === 0) {
        rawScores[dateStr] = gameBonus;
        if (gameBonus > 0) breakdownByDate[dateStr] = { skills:[], timeMins:0, space, spaceMult, gameBonus:Math.round(gameBonus), rawScore:Math.round(gameBonus) };
        continue;
      }

      const minsPerSkill = timeMins / Math.max(effectiveCount, 1);
      let total = 0;
      const skillContribs = [];
      trainedToday.forEach(sk => {
        const typeMult = KICKING_SKILLS_S.has(sk) ? 1.2
          : PASSING_SKILLS.has(sk)  ? 1.15
          : DEFENCE_SKILLS.has(sk)  ? 1.1
          : PHYSICAL_SKILLS.has(sk) ? 1.0
          : STUDY_SKILLS.has(sk)    ? 0.8
          : MENTAL_SKILLS.has(sk)   ? 0.6
          : 0.9;
        const skMins = hasRetroMins ? (retroMinsMap[sk]||minsPerSkill) : minsPerSkill;
        const effectiveMins = (STUDY_SKILLS.has(sk) || MENTAL_SKILLS.has(sk))
          ? Math.max(skMins, 20)
          : skMins;
        const contrib = Math.round(Math.sqrt(effectiveMins) * typeMult * spaceMult * 5);
        total += contrib;
        skillContribs.push({ sk, contrib, mins: Math.round(effectiveMins) });
      });
      rawScores[dateStr] = Math.round(total + gameBonus);
      breakdownByDate[dateStr] = {
        skills: skillContribs,
        timeMins,
        space,
        spaceMult,
        gameBonus: Math.round(gameBonus),
        rawScore: Math.round(total + gameBonus),
      };
    }

    // Smooth with 7-day exponentially weighted moving average
    // Recent days matter more: weights [0.30, 0.20, 0.15, 0.13, 0.10, 0.07, 0.05]
    const WEIGHTS = [0.30, 0.20, 0.15, 0.13, 0.10, 0.07, 0.05];
    const wSum = WEIGHTS.reduce((a,b)=>a+b,0);

    for (let d = chartRange - 1; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = localDateStr(date);

      let smoothed = 0;
      for (let w = 0; w < WEIGHTS.length; w++) {
        const past = new Date(date);
        past.setDate(date.getDate() - w);
        const pastStr = localDateStr(past);
        smoothed += WEIGHTS[w] * (rawScores[pastStr] || 0);
      }
      points.push({ dateStr, avg: Math.round(smoothed / wSum) });
    }

    const W = 320, H = 80, PAD = 8;
    const maxVal = Math.max(...points.map(p=>p.avg), 50);
    const activeScrubDate = scrubDate || todayK;
    const scrubBreakdown = breakdownByDate[activeScrubDate] || null;
    const todayVal = _optionalChain([points, 'access', _57 => _57[points.length-1], 'optionalAccess', _58 => _58.avg]) || 0;
    const weekAgo  = _optionalChain([points, 'access', _59 => _59[points.length-8], 'optionalAccess', _60 => _60.avg]) || 0;
    const trending  = todayVal > weekAgo + 2 ? "up" : todayVal < weekAgo - 2 ? "down" : "flat";
    const lineColor = todayVal >= 80 ? GRNA : todayVal >= 40 ? AMB : REDA;

    // 1y: weekly average line chart — 52 points, one per week
    if (chartRange === 365) {
      const weekPoints = [];
      for (let w = 51; w >= 0; w--) {
        const weekEnd = new Date(todayK+"T12:00:00");
        weekEnd.setDate(weekEnd.getDate() - w * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);
        const startStr = localDateStr(weekStart);
        const endStr   = localDateStr(weekEnd);
        const weekPts  = points.filter(p => p.dateStr >= startStr && p.dateStr <= endStr);
        const avg = weekPts.length ? Math.round(weekPts.reduce((a,p)=>a+p.avg,0)/weekPts.length) : 0;
        const monthLabel = weekStart.getDate() <= 7 ? weekStart.toLocaleDateString("en-GB",{month:"short"}) : "";
        weekPoints.push({avg, monthLabel, isCurrent: w===0});
      }
      const VW=340, VH=80, VPAD=8;
      const maxW = Math.max(...weekPoints.map(p=>p.avg), 50);
      const wxs = weekPoints.map((_,i) => VPAD + (i/51)*(VW-VPAD*2));
      const wys = weekPoints.map(p => VH - VPAD - (p.avg/maxW)*(VH-VPAD*2));
      const wPath = wxs.map((x,i)=>`${i===0?'M':'L'}${x.toFixed(1)},${wys[i].toFixed(1)}`).join(' ');
      const wArea = `${wPath} L${wxs[51].toFixed(1)},${VH} L${wxs[0].toFixed(1)},${VH} Z`;
      return (
        React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3571}}
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3572}}
            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3573}}
              , React.createElement('div', { style: {...lbl,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3574}}, "Training readiness" )
              , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3575}}, "weekly averages · 1 year"    )
            )
            , React.createElement('div', { style: {textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3577}}
              , React.createElement('div', { style: {fontSize:28,fontWeight:800,letterSpacing:"-0.02em",color:lineColor,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3578}}, todayVal)
              , React.createElement('div', { style: {fontSize:10,marginTop:2,color:trending==="up"?GRNA:trending==="down"?REDA:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3579}}
                , trending==="up"?"↑ rising":trending==="down"?"↓ dropping":"→ stable"
              )
            )
          )
          , rangeButtons()
          , React.createElement(ChartScrubber, {
            points: weekPoints.map((p,i)=>({x:parseFloat(wxs[i].toFixed(1)),y:parseFloat(wys[i].toFixed(1)),label:`Week ${52-i}`,value:p.avg>0?String(p.avg):"—"})),
            viewBoxW: VW, viewBoxH: VH+14, pad: VPAD, lineColor: lineColor, T1: T1, T3: T3, S2: S2, GOLD: GOLD, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3585}}

            , [25,50,75].map(pct=>{
              const y = VH - VPAD - (pct/100)*(VH-VPAD*2);
              return React.createElement('g', { key: pct, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3591}}
                , React.createElement('line', { x1: VPAD, y1: y, x2: VW-VPAD, y2: y, stroke: BD, strokeWidth: "0.5", strokeDasharray: "3,4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3592}})
                , React.createElement('text', { x: VPAD-1, y: y+3, fontSize: "5.5", fill: T3, textAnchor: "end", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3593}}, pct)
              );
            })
            , React.createElement('line', { x1: VPAD, y1: VH-VPAD, x2: VW-VPAD, y2: VH-VPAD, stroke: BD, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3596}})
            , React.createElement('path', { d: wArea, fill: lineColor, opacity: "0.12", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3597}})
            , React.createElement('path', { d: wPath, fill: "none", stroke: lineColor, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3598}})
            , weekPoints.map((p,i)=>p.monthLabel?(
              React.createElement('text', { key: i, x: wxs[i].toFixed(1), y: VH+11, fontSize: "6", fill: T3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3600}}, p.monthLabel)
            ):null)
            , React.createElement('circle', { cx: wxs[51].toFixed(1), cy: wys[51].toFixed(1), r: "3.5", fill: lineColor, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3602}})
          )
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3604}}
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3605}}, "1 year ago"  ), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3605}}, "Now")
          )
        )
      );
    }

    const xs = points.map((_,i) => PAD + (i/Math.max(points.length-1,1)) * (W - PAD*2));
    const ys = points.map(p => H - PAD - (p.avg/maxVal) * (H - PAD*2));
    const pathD = xs.map((x,i) => `${i===0?'M':'L'}${x},${ys[i]}`).join(' ');
    const areaD = `${pathD} L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`;

    return (
      React.createElement('div', { style: {...card, padding:"14px 16px", marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3617}}
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3618}}
          , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3619}}
            , React.createElement('div', { style: {...lbl, marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3620}}, "Training readiness" )
            , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3621}}, "drops at start of day · rises as you train"         )
          )
          , React.createElement('div', { style: {textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3623}}
            , React.createElement('div', { style: {fontSize:28,fontWeight:800,letterSpacing:"-0.02em",color:lineColor,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3624}}, todayVal)
            , React.createElement('div', { style: {fontSize:10,marginTop:2,color:trending==="up"?GRNA:trending==="down"?REDA:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3625}}
              , trending==="up"?"↑ rising":trending==="down"?"↓ dropping":"→ stable"
            )
          )
        )
        , rangeButtons()
        , React.createElement(ChartScrubber, {
          points: points.map((p,i)=>({x:xs[i],y:ys[i],label:fmtDate(p.dateStr),value:String(p.avg),dateStr:p.dateStr})),
          viewBoxW: W, viewBoxH: H, pad: PAD, lineColor: lineColor, T1: T1, T3: T3, S2: S2, GOLD: GOLD,
          onScrub: dateStr=>setScrubDate(dateStr),
          pointsData: points, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3631}}

          , React.createElement('line', { x1: PAD, y1: PAD, x2: W-PAD, y2: PAD, stroke: GOLD, strokeWidth: "0.5", strokeDasharray: "3,3", opacity: "0.4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3637}})
          , React.createElement('path', { d: areaD, fill: lineColor, opacity: "0.1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3638}})
          , React.createElement('path', { d: pathD, fill: "none", stroke: lineColor, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3639}})
          , React.createElement('circle', { cx: xs[xs.length-1], cy: ys[ys.length-1], r: "4", fill: lineColor, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3640}})
          , React.createElement('line', { x1: PAD, y1: H-PAD, x2: W-PAD, y2: H-PAD, stroke: BD, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3641}})
        )
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3643}}
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3644}}, chartRange === 365 ? "1 year ago" : `${chartRange} days ago`)
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3645}}, "Today")
        )
        /* Breakdown panel — always visible, updates as you scrub */
        , React.createElement('div', { style: {marginTop:10,background:S2,borderRadius:10,padding:"11px 13px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3648}}
          , scrubBreakdown ? (
            React.createElement(React.Fragment, null
              , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3651}}
                , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3652}}, fmtDate(activeScrubDate), " — score "   , scrubBreakdown.rawScore)
                , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3653}}, scrubBreakdown.timeMins>0?`${scrubBreakdown.timeMins} min · ${scrubBreakdown.space}`:"")
              )
              , scrubBreakdown.skills.length>0&&(
                React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:5,marginBottom:scrubBreakdown.gameBonus>0?8:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3656}}
                  , scrubBreakdown.skills.map(({sk,contrib})=>{
                    const s = SKILLS[sk];
                    const maxContrib = Math.max(...scrubBreakdown.skills.map(x=>x.contrib),1);
                    return (
                      React.createElement('div', { key: sk, style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3661}}
                        , React.createElement('span', { style: {fontSize:13,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3662}}, _optionalChain([s, 'optionalAccess', _61 => _61.icon])||"⭐")
                        , React.createElement('span', { style: {fontSize:11,color:T2,flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3663}}, _optionalChain([s, 'optionalAccess', _62 => _62.name])||sk)
                        , React.createElement('div', { style: {width:60,height:4,background:S3,borderRadius:2,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3664}}
                          , React.createElement('div', { style: {height:"100%",width:`${Math.round(contrib/maxContrib*100)}%`,background:_optionalChain([s, 'optionalAccess', _63 => _63.color])||GOLD,borderRadius:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3665}})
                        )
                        , React.createElement('span', { style: {fontSize:10,fontWeight:700,color:_optionalChain([s, 'optionalAccess', _64 => _64.color])||GOLD,width:24,textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3667}}, contrib)
                      )
                    );
                  })
                )
              )
              , scrubBreakdown.gameBonus>0&&(
                React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,borderTop:scrubBreakdown.skills.length?`1px solid ${BD}`:"none",paddingTop:scrubBreakdown.skills.length?6:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3674}}
                  , React.createElement('span', { style: {fontSize:13}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3675}}, "🎮")
                  , React.createElement('span', { style: {fontSize:11,color:T2,flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3676}}, "Games / mental task"   )
                  , React.createElement('span', { style: {fontSize:10,fontWeight:700,color:PRP}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3677}}, "+", scrubBreakdown.gameBonus)
                )
              )
              , !scrubBreakdown.skills.length&&!scrubBreakdown.gameBonus&&(
                React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3681}}, "No training logged this day"    )
              )
              , scrubBreakdown.spaceMult<1&&(
                React.createElement('div', { style: {fontSize:10,color:T3,marginTop:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3684}}, "🏠 Home session — ×"    , scrubBreakdown.spaceMult, " space" )
              )
            )
          ) : (
            React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3688}}
              , fmtDate(activeScrubDate), " — no training logged · drag the chart to explore other days"
            )
          )
        )
      )
    );
  };

  const renderWeightProjection = () => {
    if (wData.length === 0) return null;
    const latest = wData[wData.length-1].v;
    const oldest = wData[0].v;
    const wColor2 = latest>=wMin&&latest<=wMax?GRNA:GOLD;
    const weeklyGain = wData.length>1 ? ((latest-oldest)/wData.length)*7 : 0;
    const daysToTarget = weeklyGain>0.05 ? Math.round((wMin-latest)/(weeklyGain/7)) : null;
    const targetDate = daysToTarget!=null&&daysToTarget>0 ? new Date(Date.now()+daysToTarget*86400000) : null;

    // SVG line chart
    const W = 320, H = 80, PAD = 8;
    const vals = wData.map(d=>d.v);
    const minV = Math.min(...vals) - 1;
    const maxV = Math.max(...vals) + 1;
    const xs = wData.map((_,i) => PAD + (i/Math.max(wData.length-1,1)) * (W-PAD*2));
    const ys = wData.map(d => H - PAD - ((d.v-minV)/(maxV-minV)) * (H-PAD*2));
    const pathD = xs.map((x,i)=>`${i===0?'M':'L'}${x},${ys[i]}`).join(' ');
    const areaD = `${pathD} L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`;

    // target band Y positions
    const targetMinY = H - PAD - ((wMin-minV)/(maxV-minV)) * (H-PAD*2);
    const targetMaxY = H - PAD - ((wMax-minV)/(maxV-minV)) * (H-PAD*2);

    return (
      React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3721}}
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3722}}
          , React.createElement('div', { style: {...lbl}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3723}}, "Weight")
          , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:wColor2,letterSpacing:"-0.02em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3724}}, latest, "kg")
        )
        , rangeButtons()
        , React.createElement(ChartScrubber, {
          points: wData.map((d,i)=>({x:xs[i],y:ys[i],label:fmtDate(d.k),value:`${d.v}kg`})),
          viewBoxW: W, viewBoxH: H, pad: PAD, lineColor: wColor2, T1: T1, T3: T3, S2: S2, GOLD: GOLD, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3727}}

          , targetMinY>PAD&&targetMaxY<H&&(
            React.createElement('rect', { x: PAD, y: targetMaxY, width: W-PAD*2, height: targetMinY-targetMaxY,
              fill: GRNA, opacity: "0.08", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3732}})
          )
          , React.createElement('path', { d: areaD, fill: wColor2, opacity: "0.08", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3735}})
          , React.createElement('path', { d: pathD, fill: "none", stroke: wColor2, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3736}})
          , wData.map((d,i)=>(
            React.createElement('circle', { key: i, cx: xs[i], cy: ys[i], r: "3", fill: d.v>=wMin&&d.v<=wMax?GRNA:GOLD, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3738}})
          ))
          , React.createElement('line', { x1: PAD, y1: H-PAD, x2: W-PAD, y2: H-PAD, stroke: BD, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3740}})
        )
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3742}}
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3743}}, fmtDate(wData[0].k))
          , React.createElement('span', { style: {color:wColor2,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3744}}, "Target " , wMin, "–", wMax, "kg")
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3745}}, fmtDate(wData[wData.length-1].k))
        )
        , latest<wMin&&weeklyGain>0.05&&targetDate&&(
          React.createElement('div', { style: {background:S2,borderRadius:8,padding:"9px 12px",fontSize:12,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3748}}
            , React.createElement('span', { style: {color:GOLD,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3749}}, (wMin-latest).toFixed(1), "kg to go"  )
            , " · ", weeklyGain.toFixed(2), "kg/week → "  , React.createElement('span', { style: {color:daysToTarget<200?GRNA:AMB,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3750}}
              , targetDate.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"})
            )
          )
        )
        , latest<wMin&&weeklyGain<=-0.05&&React.createElement('div', { style: {fontSize:12,color:REDA,padding:"6px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3755}}, "⚠️ Losing weight — "    , Math.abs(weeklyGain).toFixed(2), "kg/week drop. Increase calorie intake."    )
        , latest<wMin&&weeklyGain>-0.05&&weeklyGain<=0.05&&React.createElement('div', { style: {fontSize:12,color:AMB,padding:"6px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3756}}, "Weight stable — increase intake to reach "       , wMin, "kg target." )
        , latest>=wMin&&latest<=wMax&&React.createElement('div', { style: {fontSize:12,color:GRNA,padding:"6px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3757}}, "✓ In target range"   )
        , latest>wMax&&React.createElement('div', { style: {fontSize:12,color:AMB,padding:"6px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3758}}, "Above target range — "    , (latest-wMax).toFixed(1), "kg over." )
        /* RWC projection — only show if trend is meaningful and positive or negative */
        , wData.length>=2&&Math.abs(weeklyGain)>=0.05&&(()=>{
          const rwcDays = daysUntil(RWC_DATE);
          const projectedAtRWC = latest + weeklyGain * (rwcDays/7);
          if (weeklyGain < 0) {
            return (
              React.createElement('div', { style: {marginTop:8,fontSize:11,color:REDA,borderTop:`1px solid ${BD}`,paddingTop:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3765}}, "⚠️ At this rate you'll be "
                      , React.createElement('span', { style: {fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3766}}, projectedAtRWC.toFixed(1), "kg"), " by RWC — well below target. Eat more."
              )
            );
          }
          const onTrack = projectedAtRWC>=wMin&&projectedAtRWC<=wMax;
          if (projectedAtRWC >= wMin) return null; // only show if below target
          return (
            React.createElement('div', { style: {marginTop:8,fontSize:11,color:T3,borderTop:`1px solid ${BD}`,paddingTop:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3773}}, "At this rate: "
                 , React.createElement('span', { style: {color:onTrack?GRNA:AMB,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3774}}, projectedAtRWC.toFixed(1), "kg"), " by RWC"
              , projectedAtRWC<wMin&&React.createElement('span', { style: {color:AMB}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3775}}, " — "  , (wMin-projectedAtRWC).toFixed(1), "kg short of target"   )
            )
          );
        })()
      )
    );
  }

  const renderThisWeek = () => {
        if (entries.length < 1) return null;
        // use the same Mon-Sun week boundaries as the bar chart
        const today = new Date(todayK+"T12:00:00");
        const dayOfWeek = today.getDay(); // 0=Sun
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - daysToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const monStr = localDateStr(monday);
        const sunStr = localDateStr(sunday);

        const weekEntries = entries.filter(([k])=>k>=monStr&&k<=sunStr);
        let trainedThisWeek = 0;
        try {
          for (let i=0;i<localStorage.length;i++){
            const k=localStorage.key(i);
            if (!k||!k.startsWith("rwc_done_")) continue;
            const date=k.replace("rwc_done_","");
            if (date<monStr||date>sunStr) continue;
            const rec = JSON.parse(store.get(k)||"{}");
            if (Object.values(rec).some(v=>v===true) || rec["__retro_trained__"]) trainedThisWeek++;
          }
        } catch (e38) {}
        const weekScores = (scores||[]).filter(s=>s.date>=monStr&&s.date<=sunStr);
        const avgScore = weekScores.length
          ? (weekScores.reduce((a,b)=>a+b.rating,0)/weekScores.length).toFixed(1) : null;
        const skillCounts = {};
        weekScores.forEach(s=>{ skillCounts[s.skillKey]=(skillCounts[s.skillKey]||0)+1; });
        const topSkills = Object.entries(skillCounts).sort((a,b)=>b[1]-a[1]).slice(0,3);

        return (
          React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3816}}
            , React.createElement('div', { style: {...lbl,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3817}}, "This week" )
            , React.createElement('div', { style: {display:"flex",gap:7,marginBottom:topSkills.length?14:0,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3818}}
              , React.createElement(Stat, { label: "Trained", value: `${trainedThisWeek}/7`, sub: "days", color: trainedThisWeek>=5?GRNA:trainedThisWeek>=3?AMB:REDA, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3819}})
              , avgScore&&React.createElement(Stat, { label: "Avg score" , value: `${avgScore}/5`, sub: `${weekScores.length} sessions`, color: parseFloat(avgScore)>=4?GRNA:parseFloat(avgScore)>=3?AMB:REDA, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3820}})
            )
            , topSkills.length>0&&(
              React.createElement('div', { style: {display:"flex",gap:6,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3823}}
                , topSkills.map(([sk,n])=>{
                  const s=SKILLS[sk];
                  return React.createElement('span', { key: sk, style: {fontSize:11,color:_optionalChain([s, 'optionalAccess', _65 => _65.color])||T2,background:S2,
                    borderRadius:8,padding:"3px 9px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3826}}, _optionalChain([s, 'optionalAccess', _66 => _66.icon]), " " , _optionalChain([s, 'optionalAccess', _67 => _67.name])||sk, " ×" , n);
                })
              )
            )
          )
        );
  }

  const renderWeightChart = () => {
    const todayStr = todayK;

    // build daily bars for chartRange days
    const bars = [];
    for (let d = chartRange-1; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = localDateStr(date);
      let count = 0;
      try {
        const rec = JSON.parse(store.get("rwc_done_"+dateStr)||"{}");
        count = Object.values(rec).filter(v=>v===true).length
              + Object.keys(rec).filter(k=>k.startsWith("__retro__")&&!k.endsWith("trained__")).length;
      } catch (e39) {}
      const isToday = dateStr === todayStr;
      const label = d===0?"today":d===chartRange-1?fmtDate(dateStr):
        date.getDate()===1?fmtDate(dateStr):"";
      bars.push({dateStr, count, isToday, label, d});
    }

    const maxCount = Math.max(...bars.map(b=>b.count), 1);
    const H = 60;
    const VW = 340;

    // 1y: weekly bars — 52 bars each representing one week's total tasks
    if (chartRange === 365) {
      const weekBars = [];
      for (let w = 51; w >= 0; w--) {
        const weekEnd = new Date(todayK+"T12:00:00");
        weekEnd.setDate(weekEnd.getDate() - w * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);
        let total = 0;
        const isCurrentWeek = w === 0;
        for (let d = 0; d < 7; d++) {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + d);
          const ds = localDateStr(day);
          try {
            const rec = JSON.parse(store.get("rwc_done_"+ds)||"{}");
            total += Object.values(rec).filter(v=>v===true).length
                   + Object.keys(rec).filter(k=>k.startsWith("__retro__")&&!k.endsWith("trained__")).length;
          } catch (e40) {}
        }
        const monthLabel = weekStart.getDate() <= 7
          ? weekStart.toLocaleDateString("en-GB",{month:"short"})
          : "";
        weekBars.push({total, isCurrentWeek, monthLabel});
      }
      const maxTotal = Math.max(...weekBars.map(b=>b.total), 1);
      const gap = 2;
      const barW = (VW - gap * 51) / 52;
      return (
        React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3889}}
          , React.createElement('div', { style: {...lbl,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3890}}, "Tasks completed" )
          , rangeButtons()
          , React.createElement('svg', { viewBox: `0 0 ${VW} ${H+14}`, style: {width:"100%",display:"block"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3892}}
            , weekBars.map((b,i)=>{
              const x = i*(barW+gap);
              const barHeight = b.total>0 ? Math.max(3, Math.round((b.total/maxTotal)*H)) : 0;
              const y = H - barHeight;
              const color = b.total>=20?GRNA:b.total>=12?GOLD:b.total>=4?AMB:S2;
              return (
                React.createElement('g', { key: i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3899}}
                  , b.total===0&&React.createElement('rect', { x: x, y: H-1, width: barW, height: 1, fill: S3, rx: 0.5, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3900}})
                  , b.total>0&&React.createElement('rect', { x: x, y: y, width: barW, height: barHeight, fill: color, rx: 1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3901}})
                  , b.isCurrentWeek&&React.createElement('rect', { x: x, y: H, width: barW, height: 2, fill: GOLD, rx: 0.5, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3902}})
                  , b.monthLabel&&React.createElement('text', { x: x, y: H+11, fontSize: "6", fill: T3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3903}}, b.monthLabel)
                )
              );
            })
          )
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3908}}
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3909}}, "1 year ago"  ), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3909}}, "This week" )
          )
        )
      );
    }

    // 7d / 14d: fixed-width centered bars with day labels
    if (chartRange <= 14) {
      const barW = chartRange === 7 ? 28 : 18;
      const totalW = bars.length * (barW + 4);
      const offsetX = (VW - totalW) / 2;
      return (
        React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3921}}
          , React.createElement('div', { style: {...lbl,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3922}}, "Tasks completed" )
          , rangeButtons()
          , React.createElement('svg', { viewBox: `0 0 ${VW} ${H+20}`, style: {width:"100%",display:"block"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3924}}
            , bars.map((b,i)=>{
              const x = offsetX + i*(barW+4);
              const barHeight = b.count>0 ? Math.max(4, Math.round((b.count/maxCount)*H)) : 0;
              const y = H - barHeight;
              const color = b.count>=5?GRNA:b.count>=3?GOLD:b.count>=1?AMB:S2;
              const dayLabel = new Date(b.dateStr+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short"});
              return (
                React.createElement('g', { key: i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3932}}
                  , React.createElement('rect', { x: x, y: b.count>0?y:H-1, width: barW, height: b.count>0?barHeight:1,
                    fill: color, rx: 3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3933}})
                  , b.isToday&&React.createElement('rect', { x: x, y: H+1, width: barW, height: 2, fill: GOLD, rx: 1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3935}})
                  , React.createElement('text', { x: x+barW/2, y: H+13, textAnchor: "middle", fontSize: "7",
                    fill: b.isToday?GOLD:T3, fontWeight: b.isToday?"700":"400", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3936}}, dayLabel)
                  , b.count>0&&React.createElement('text', { x: x+barW/2, y: y-3, textAnchor: "middle", fontSize: "7",
                    fill: color, fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3938}}, b.count)
                )
              );
            })
          )
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3944}}
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3945}}, chartRange, " days ago"  ), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3945}}, "Today")
          )
        )
      );
    }

    // 30d: regular bar chart
    const gap = 1;
    const barW = Math.max(1, (VW - gap * (bars.length-1)) / bars.length);

    return (
      React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3956}}
        , React.createElement('div', { style: {...lbl,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3957}}, "Tasks completed" )
        , rangeButtons()
        , React.createElement('svg', { viewBox: `0 0 ${VW} ${H+16}`, style: {width:"100%",display:"block"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3959}}
          , bars.map((b,i)=>{
            const x = i*(barW+gap);
            const barHeight = b.count>0 ? Math.max(2, Math.round((b.count/maxCount)*H)) : 0;
            const y = H - barHeight;
            const color = b.count>=5?GRNA:b.count>=3?GOLD:b.count>=1?AMB:S2;
            return (
              React.createElement('g', { key: i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3966}}
                , b.count===0&&React.createElement('rect', { x: x, y: H-1, width: barW, height: 1, fill: S3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3967}})
                , b.count>0&&React.createElement('rect', { x: x, y: y, width: barW, height: barHeight, fill: color, rx: 1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3968}})
                , b.isToday&&React.createElement('rect', { x: x, y: H, width: barW, height: 2, fill: GOLD, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3969}})
                , barW>=8&&b.label&&React.createElement('text', { x: x+barW/2, y: H+10, textAnchor: "middle", fontSize: "6",
                  fill: b.isToday?GOLD:T3, fontWeight: b.isToday?"700":"400", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3970}}, b.label)
              )
            );
          })
        )
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3976}}
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3977}}, chartRange, " days ago"  ), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 3977}}, "Today")
        )
      )
    );
  }

  const renderRadarChart = (range=chartRange) => {
    // ── Heatmap calendar (last 16 weeks) ─────────────────────────────────────
    const WEEKS = 26; // always ~6 months
    const today = new Date(todayK+"T12:00:00");
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (WEEKS * 7 - 1));

    // build intensity per day
    const dayIntensity = {};
    try {
      for (let i=0; i<localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!_optionalChain([k, 'optionalAccess', _68 => _68.startsWith, 'call', _69 => _69("rwc_done_")])) continue;
        const dateStr = k.replace("rwc_done_","");
        const rec = JSON.parse(localStorage.getItem(k)||"{}");
        const trained = Object.entries(rec).filter(([,v])=>v)
          .map(([rk])=> rk.startsWith("__retro__") ? rk.split("__")[2] :
            rk.replace(/^__extra__/,'').replace(/__[a-z0-9]+$/,'').replace(/_pos\d+$/,'').replace(/_extra_[a-z0-9]+$/,'').replace(/_\d+$/,''))
          .filter(sk=>SKILLS[sk]);
        dayIntensity[dateStr] = [...new Set(trained)].length;
      }
    } catch (e41) {}

    // build grid: rows=7 days of week, cols=weeks
    const cells = [];
    for (let w=0; w<WEEKS; w++) {
      for (let d=0; d<7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w*7 + d);
        const dateStr = localDateStr(date);
        const count = dayIntensity[dateStr]||0;
        const isToday = dateStr === todayK;
        cells.push({dateStr, count, w, d, isToday});
      }
    }

    // Fixed cell size in viewBox units — SVG scales to fill card width
    const gap = 2;
    const cellSize = 11;
    const W = WEEKS*(cellSize+gap);
    const H = 7*(cellSize+gap);
    const needsScroll = false; // always fits via viewBox
    const colorFor = n => n===0?S2:n===1?"#1a4a2e":n===2?"#2e7d4f":n===3?GRNA:GRNA;
    const opacFor  = n => n===0?1:n===1?1:n===2?1:n===3?1:1;

    // ── Balance donut ─────────────────────────────────────────────────────────
    const KICKING_S  = new Set(["shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick"]);
    const PASSING_S  = new Set(["passing"]);
    const PHYSICAL_S = new Set(["agility","breakdown","highBall","prehab","recovery"]);
    const DEFENCE_S  = new Set(["edgeDefense"]);
    const MENTAL_S   = new Set(["mental","gameStudy"]);
    // add custom skills to their category
    (range && range > 0) && (customSkills||[]).forEach(cs => {
      if (cs.type==="kicking")  KICKING_S.add(cs.key);
      else if (cs.type==="passing")  PASSING_S.add(cs.key);
      else if (cs.type==="defence")  DEFENCE_S.add(cs.key);
      else if (cs.type==="mental")   MENTAL_S.add(cs.key);
      else PHYSICAL_S.add(cs.key);
    });
    // Shared category colours — same in donut and time-per-skill bars
    const CAT_COLORS = {
      kicking:  "#ff9f0a",  // amber
      passing:  "#0a84ff",  // blue
      physical: "#30d158",  // green
      defence:  "#ff375f",  // red
      mental:   PRP,         // purple
    };
    const cats = {
      kicking:  {label:"Kicking",  color:CAT_COLORS.kicking,  mins:0},
      passing:  {label:"Passing",  color:CAT_COLORS.passing,  mins:0},
      physical: {label:"Physical", color:CAT_COLORS.physical, mins:0},
      defence:  {label:"Defence",  color:CAT_COLORS.defence,  mins:0},
      mental:   {label:"Mental",   color:CAT_COLORS.mental,   mins:0},
    };

    try {
      const cutoffDate = new Date(todayK+"T12:00:00"); cutoffDate.setDate(cutoffDate.getDate()-range);
      const cutoffStr = localDateStr(cutoffDate);
      for (let i=0; i<localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!_optionalChain([k, 'optionalAccess', _70 => _70.startsWith, 'call', _71 => _71("rwc_done_")])) continue;
        const dateStr = k.replace("rwc_done_","");
        if (dateStr < cutoffStr) continue;
        const ciData = JSON.parse(localStorage.getItem("rwc_ci_"+dateStr)||"{}");
        const timeMins = _nullishCoalesce(ciData.timeMins, () => ( 30));
        const rec = JSON.parse(localStorage.getItem(k)||"{}");
        const retroMins = {};
        Object.entries(rec).forEach(([rk,rv])=>{ if(rk.startsWith("__retro__")&&!rk.endsWith("trained__")){const sk=rk.split("__")[2];if(SKILLS[sk])retroMins[sk]=(retroMins[sk]||0)+(_optionalChain([rv, 'optionalAccess', _72 => _72.mins])||0);} });
        const trained = [...new Set(Object.entries(rec).filter(([,v])=>v)
          .map(([rk])=> rk.startsWith("__retro__") ? rk.split("__")[2] :
            rk.replace(/^__extra__/,'').replace(/__[a-z0-9]+$/,'').replace(/_pos\d+$/,'').replace(/_extra_[a-z0-9]+$/,'').replace(/_\d+$/,''))
          .filter(sk=>SKILLS[sk]))];
        if (!trained.length) continue;
        const hasRetro = Object.keys(retroMins).length > 0;
        const regularMins = timeMins;
        const each = hasRetro ? 0 : regularMins / trained.length;
        trained.forEach(sk => {
          const m = hasRetro ? (retroMins[sk]||0) : each;
          if (KICKING_S.has(sk))       cats.kicking.mins  += m;
          else if (PASSING_S.has(sk))  cats.passing.mins  += m;
          else if (PHYSICAL_S.has(sk)) cats.physical.mins += m;
          else if (DEFENCE_S.has(sk))  cats.defence.mins  += m;
          else if (MENTAL_S.has(sk))   cats.mental.mins   += m;
          else                         cats.physical.mins += m;
        });
      }
    } catch (e42) {}

    const totalMins = Object.values(cats).reduce((a,c)=>a+c.mins,0);
    const hasCats = totalMins > 0;

    // SVG donut
    const DR = 54, DW = 16, DCX = 75, DCY = 75;
    let donutAngle = -Math.PI/2;
    const donutSlices = hasCats ? Object.values(cats).filter(c=>c.mins>0).map(c => {
      const pct = c.mins / totalMins;
      const startA = donutAngle;
      donutAngle += pct * 2 * Math.PI;
      const endA = donutAngle;
      const x1 = DCX + DR * Math.cos(startA), y1 = DCY + DR * Math.sin(startA);
      const x2 = DCX + DR * Math.cos(endA),   y2 = DCY + DR * Math.sin(endA);
      const large = pct > 0.5 ? 1 : 0;
      return { ...c, pct, path:`M${DCX},${DCY} L${x1.toFixed(1)},${y1.toFixed(1)} A${DR},${DR} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z` };
    }) : [];

    const fmtMins = m => m>=60 ? `${(m/60).toFixed(1)}h` : `${Math.round(m)}m`;
    const monthLabels = [];
    for (let w=0; w<WEEKS; w+=4) {
      const d = new Date(startDate); d.setDate(startDate.getDate()+w*7);
      monthLabels.push({w, label:d.toLocaleDateString("en-GB",{month:"short"})});
    }

    return (
      React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4116}}

        /* Heatmap */
        , React.createElement('div', { style: {...card,padding:"14px 16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4119}}
          , React.createElement('div', { style: {...lbl,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4120}}, "Training heatmap" )
          , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4121}}, "Last 6 months · darker = more skills trained"        )
          , React.createElement('svg', { width: "100%", viewBox: `0 0 ${W} ${H+14}`, style: {display:"block",overflow:"visible"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4122}}
            , monthLabels.map(({w,label})=>(
              React.createElement('text', { key: w, x: (w*(cellSize+gap)).toFixed(1), y: H+12,
                fontSize: "7", fill: T3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4124}}, label)
            ))
            , cells.map(({dateStr,count,w,d,isToday})=>(
              React.createElement('rect', { key: dateStr,
                x: (w*(cellSize+gap)).toFixed(1), y: (d*(cellSize+gap)).toFixed(1),
                width: cellSize, height: cellSize, rx: 2,
                fill: colorFor(count),
                opacity: count===0?0.35:1,
                stroke: isToday?GOLD:"none", strokeWidth: isToday?1.5:0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4128}}
              )
            ))
          )
          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:4,marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4137}}
            , React.createElement('span', { style: {fontSize:9,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4138}}, "Less")
            , [0,1,2,3,4].map(n=>(
              React.createElement('rect', { key: n, width: 9, height: 9, rx: 1, style: {display:"inline-block",width:9,height:9,borderRadius:2,background:colorFor(n),opacity:n===0?0.35:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4140}})
            ))
            , React.createElement('span', { style: {fontSize:9,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4142}}, "More")
          )
        )

        /* Balance donut */
        , hasCats&&(
          React.createElement('div', { style: {...card,padding:"14px 16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4148}}
            , React.createElement('div', { style: {...lbl,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4149}}, "Training balance" )
            , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4150}}, "Time split by category · all time"      )
            , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4151}}
              , React.createElement('svg', { width: "150", height: "150", viewBox: "0 0 150 150"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 4152}}
                , donutSlices.map((s,i)=>(
                  React.createElement('path', { key: i, d: s.path, fill: s.color, opacity: "0.85", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4154}})
                ))
                /* inner ring */
                , React.createElement('circle', { cx: DCX, cy: DCY, r: DR-DW, fill: S1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4157}})
                , React.createElement('text', { x: DCX, y: DCY-6, textAnchor: "middle", fontSize: "11", fill: T1, fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4158}}
                  , fmtMins(totalMins)
                )
                , React.createElement('text', { x: DCX, y: DCY+8, textAnchor: "middle", fontSize: "8", fill: T3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4161}}, "total")
              )
              , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8,flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4163}}
                , Object.values(cats).filter(c=>c.mins>0).map(c=>(
                  React.createElement('div', { key: c.label, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4165}}
                    , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4166}}
                      , React.createElement('span', { style: {fontSize:11,color:T1,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4167}}, c.label)
                      , React.createElement('span', { style: {fontSize:11,color:c.color,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4168}}, Math.round(c.mins/totalMins*100), "%")
                    )
                    , React.createElement('div', { style: {height:4,borderRadius:2,background:S2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4170}}
                      , React.createElement('div', { style: {height:"100%",borderRadius:2,background:c.color,width:`${c.mins/totalMins*100}%`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4171}})
                    )
                    , React.createElement('div', { style: {fontSize:9,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4173}}, fmtMins(c.mins))
                  )
                ))
              )
            )
          )
        )

      )
    );
  };

  const renderTimePerSkillChart = (range=chartRange) => {
    // build time per skill from check-in timeMins + skills done each day
    const timePerSkill = {};
    try {
      for (let i=0;i<localStorage.length;i++) {
        const k=localStorage.key(i);
        if (!_optionalChain([k, 'optionalAccess', _73 => _73.startsWith, 'call', _74 => _74("rwc_done_")])) continue;
        const dateStr=k.replace("rwc_done_","");
        const cutoff = new Date(todayK+"T12:00:00");
        cutoff.setDate(cutoff.getDate()-range);
        if (dateStr < localDateStr(cutoff)) continue;
        const done=JSON.parse(localStorage.getItem(k)||"{}");
        const ci=JSON.parse(localStorage.getItem("rwc_ci_"+dateStr)||"{}");
        const timeMins=ci.timeMins||30;
        const retroM={};
        Object.entries(done).forEach(([rk,rv])=>{ if(rk.startsWith("__retro__")&&!rk.endsWith("trained__")){const sk=rk.split("__")[2];if(SKILLS[sk])retroM[sk]=(retroM[sk]||0)+(_optionalChain([rv, 'optionalAccess', _75 => _75.mins])||0);} });
        const hasRetroM=Object.keys(retroM).length>0;
        const trainedKeys=Object.entries(done).filter(([,v])=>v).map(([key])=> key.startsWith("__retro__")?key.split("__")[2]:key.replace(/^__extra__/,'').replace(/__[a-z0-9]+$/,'').replace(/_pos\d+$/,'').replace(/_extra_[a-z0-9]+$/,'').replace(/_\d+$/,''));
        const uniq=[...new Set(trainedKeys)].filter(sk=>SKILLS[sk]);
        if (!uniq.length) continue;
        const perSkill=hasRetroM?0:timeMins/uniq.length;
        uniq.forEach(sk=>{timePerSkill[sk]=(timePerSkill[sk]||0)+(hasRetroM?(retroM[sk]||0):perSkill);});
      }
    } catch (e43) {}

    const entries=Object.entries(timePerSkill).sort((a,b)=>b[1]-a[1]);
    if (!entries.length) return null;

    const maxMins=entries[0][1];

    return (
      React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4216}}
        , React.createElement('div', { style: {...lbl,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4217}}, "Time per skill"  )
        , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4218}}, "Total minutes invested · last "     , range===365?"year":`${range} days`)
        , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4219}}
          , entries.slice(0,12).map(([sk,mins])=>{
            const s=SKILLS[sk];
            const pct=mins/maxMins;
            const hrs=(mins/60).toFixed(1);
            // Use same category colour as donut
            const CAT_COLORS = {kicking:"#ff9f0a",passing:"#0a84ff",physical:"#30d158",defence:"#ff375f",mental:PRP};
            const KICKING_S2=new Set(["shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick"]);
            const PASSING_S2=new Set(["passing"]);
            const DEFENCE_S2=new Set(["edgeDefense"]);
            const MENTAL_S2=new Set(["mental","gameStudy"]);
            const catColor = KICKING_S2.has(sk)?CAT_COLORS.kicking
              :PASSING_S2.has(sk)?CAT_COLORS.passing
              :DEFENCE_S2.has(sk)?CAT_COLORS.defence
              :MENTAL_S2.has(sk)?CAT_COLORS.mental
              :CAT_COLORS.physical;
            const color = catColor;
            return (
              React.createElement('div', { key: sk, style: {display:"flex",alignItems:"center",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4237}}
                , React.createElement('span', { style: {fontSize:16,flexShrink:0,width:22,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4238}}, _optionalChain([s, 'optionalAccess', _76 => _76.icon]))
                , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4239}}
                  , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4240}}
                    , React.createElement('span', { style: {fontSize:11,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4241}}, _optionalChain([s, 'optionalAccess', _77 => _77.name])||sk)
                    , React.createElement('span', { style: {fontSize:10,color,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4242}}, hrs, "h")
                  )
                  , React.createElement('div', { style: {height:5,background:S2,borderRadius:3,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4244}}
                    , React.createElement('div', { style: {height:"100%",width:`${pct*100}%`,background:color,borderRadius:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4245}})
                  )
                )
              )
            );
          })
        )
      )
    );
  };

  const renderSuppAdherenceChart = () => {
    const mySupps = JSON.parse(store.get("rwc_settings")||"{}").mySupplements || [];
    if (mySupps.length === 0) return null;

    // build daily adherence % for chartRange days
    const today = new Date(todayK+"T12:00:00");
    const bars = [];
    for (let d = chartRange-1; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = localDateStr(date);
      let taken = 0;
      try {
        const rec = JSON.parse(localStorage.getItem("rwc_supps_"+dateStr)||"{}");
        taken = Object.keys(rec).filter(n=>mySupps.includes(n)).length;
      } catch (e44) {}
      const pct = mySupps.length > 0 ? taken/mySupps.length : 0;
      bars.push({dateStr, pct, taken, total:mySupps.length, isToday:d===0});
    }

    const hasSuppData = bars.some(b=>b.taken>0);
    if (!hasSuppData) return null;

    const todayPct = Math.round((_optionalChain([bars, 'access', _78 => _78[bars.length-1], 'optionalAccess', _79 => _79.pct])||0)*100);
    const avgPct = Math.round(bars.filter(b=>b.taken>0).reduce((a,b)=>a+b.pct,0)/Math.max(bars.filter(b=>b.taken>0).length,1)*100);
    const color = avgPct>=80?GRNA:avgPct>=50?GOLD:REDA;

    // 1y: weekly average line chart
    if (chartRange === 365) {
      const weekPts = [];
      for (let w = 51; w >= 0; w--) {
        const weekEnd = new Date(today); weekEnd.setDate(today.getDate() - w*7);
        const weekStart = new Date(weekEnd); weekStart.setDate(weekEnd.getDate() - 6);
        const startStr = localDateStr(weekStart), endStr = localDateStr(weekEnd);
        const wBars = bars.filter(b=>b.dateStr>=startStr&&b.dateStr<=endStr&&b.taken>0);
        const avg = wBars.length ? wBars.reduce((a,b)=>a+b.pct,0)/wBars.length : 0;
        const monthLabel = weekStart.getDate()<=7 ? weekStart.toLocaleDateString("en-GB",{month:"short"}) : "";
        weekPts.push({avg, monthLabel});
      }
      const VW=320, VH=60, VPAD=8;
      const wxs = weekPts.map((_,i)=>VPAD+(i/51)*(VW-VPAD*2));
      const wys = weekPts.map(p=>VH-VPAD-(p.avg)*(VH-VPAD*2));
      const wPath = wxs.map((x,i)=>`${i===0?'M':'L'}${x.toFixed(1)},${wys[i].toFixed(1)}`).join(' ');
      const wArea = `${wPath} L${wxs[51].toFixed(1)},${VH} L${wxs[0].toFixed(1)},${VH} Z`;
      return (
        React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4301}}
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4302}}
            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4303}}
              , React.createElement('div', { style: {...lbl,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4304}}, "Supplement adherence" )
              , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4305}}, "weekly averages · 1 year"    )
            )
            , React.createElement('div', { style: {textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4307}}
              , React.createElement('div', { style: {fontSize:26,fontWeight:800,color,letterSpacing:"-0.02em",lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4308}}, avgPct, "%")
              , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4309}}, "avg · 1y"  )
            )
          )
          , rangeButtons()
          , React.createElement(ChartScrubber, {
            points: weekPts.map((p,i)=>({x:parseFloat(wxs[i].toFixed(1)),y:parseFloat(wys[i].toFixed(1)),label:`Week ${52-i}`,value:p.avg>0?`${Math.round(p.avg*100)}%`:"—"})),
            viewBoxW: VW, viewBoxH: VH+14, pad: VPAD, lineColor: color, T1: T1, T3: T3, S2: S2, GOLD: GOLD, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4313}}

            , [25,50,75,100].map(pct=>{
              const y = VH-VPAD-(pct/100)*(VH-VPAD*2);
              return React.createElement('g', { key: pct, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4319}}
                , React.createElement('line', { x1: VPAD, y1: y, x2: VW-VPAD, y2: y, stroke: BD, strokeWidth: "0.5", strokeDasharray: "3,4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4320}})
                , React.createElement('text', { x: VPAD-1, y: y+3, fontSize: "5.5", fill: T3, textAnchor: "end", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4321}}, pct, "%")
              );
            })
            , React.createElement('line', { x1: VPAD, y1: VH-VPAD, x2: VW-VPAD, y2: VH-VPAD, stroke: BD, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4324}})
            , React.createElement('path', { d: wArea, fill: color, opacity: "0.12", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4325}})
            , React.createElement('path', { d: wPath, fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4326}})
            , weekPts.map((p,i)=>p.monthLabel?React.createElement('text', { key: i, x: wxs[i].toFixed(1), y: VH+11, fontSize: "6", fill: T3, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4327}}, p.monthLabel):null)
            , React.createElement('circle', { cx: wxs[51].toFixed(1), cy: wys[51].toFixed(1), r: "3.5", fill: color, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4328}})
          )
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4330}}
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4331}}, "1 year ago"  ), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4331}}, "Now")
          )
          /* per-supplement breakdown */
          , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:5,marginTop:10,borderTop:`1px solid ${BD}`,paddingTop:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4334}}
            , mySupps.map(name=>{
              const s = [...SUPPLEMENT_SCHEDULE,...(JSON.parse(store.get("rwc_settings")||"{}").customSupplements||[])].find(s=>s.name===name);
              const daysTaken = bars.filter(b=>{
                try { const rec=JSON.parse(localStorage.getItem("rwc_supps_"+b.dateStr)||"{}"); return !!rec[name]; } catch (e45) { return false; }
              }).length;
              const pct = chartRange>0?Math.round(daysTaken/chartRange*100):0;
              const c = pct>=80?GRNA:pct>=50?GOLD:pct>0?AMB:T3;
              return (
                React.createElement('div', { key: name, style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4343}}
                  , React.createElement('span', { style: {fontSize:14,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4344}}, _optionalChain([s, 'optionalAccess', _80 => _80.icon])||"💊")
                  , React.createElement('span', { style: {flex:1,fontSize:11,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4345}}, name)
                  , React.createElement('div', { style: {width:60,height:4,background:S2,borderRadius:2,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4346}}
                    , React.createElement('div', { style: {height:"100%",width:`${pct}%`,background:c,borderRadius:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4347}})
                  )
                  , React.createElement('span', { style: {fontSize:10,fontWeight:700,color:c,width:32,textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4349}}, pct, "%")
                )
              );
            })
          )
        )
      );
    }

    const W = 320, H = 60, PAD = 8;
    const xs = bars.map((_,i)=>PAD+(i/Math.max(bars.length-1,1))*(W-PAD*2));
    const ys = bars.map(b=>H-PAD-(b.pct)*(H-PAD*2));
    const pathD = xs.map((x,i)=>`${i===0?'M':'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    const areaD = `${pathD} L${xs[xs.length-1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`;

    return (
      React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4365}}
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4366}}
          , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4367}}
            , React.createElement('div', { style: {...lbl,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4368}}, "Supplement adherence" )
            , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4369}}, "% of your supplements taken each day"      )
          )
          , React.createElement('div', { style: {textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4371}}
            , React.createElement('div', { style: {fontSize:26,fontWeight:800,color,letterSpacing:"-0.02em",lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4372}}, avgPct, "%")
            , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4373}}, "avg · "  , chartRange===365?"1y":`${chartRange}d`)
          )
        )
        , rangeButtons()
        , React.createElement(ChartScrubber, {
          points: bars.map((b,i)=>({x:xs[i],y:ys[i],label:fmtDate(b.dateStr),value:`${Math.round(b.pct*100)}%`})),
          viewBoxW: W, viewBoxH: H, pad: PAD, lineColor: color, T1: T1, T3: T3, S2: S2, GOLD: GOLD, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4377}}

          , React.createElement('path', { d: areaD, fill: color, opacity: "0.12", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4381}})
          , React.createElement('path', { d: pathD, fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4382}})
          , React.createElement('circle', { cx: xs[xs.length-1].toFixed(1), cy: ys[ys.length-1].toFixed(1), r: "4", fill: color, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4383}})
          , React.createElement('line', { x1: PAD, y1: H-PAD, x2: W-PAD, y2: H-PAD, stroke: BD, strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4384}})
          , React.createElement('line', { x1: PAD, y1: PAD, x2: W-PAD, y2: PAD, stroke: BD, strokeWidth: "0.5", strokeDasharray: "3,3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4385}})
        )
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4387}}
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4388}}, chartRange===365?"1 year ago":`${chartRange}d ago`)
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4389}}, "Today: " , todayPct, "%")
        )
        /* per-supplement breakdown */
        , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:5,marginTop:10,borderTop:`1px solid ${BD}`,paddingTop:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4392}}
          , mySupps.map(name=>{
            const s = [...SUPPLEMENT_SCHEDULE,...(JSON.parse(store.get("rwc_settings")||"{}").customSupplements||[])].find(s=>s.name===name);
            const daysTaken = bars.filter(b=>{
              try { const rec=JSON.parse(localStorage.getItem("rwc_supps_"+b.dateStr)||"{}"); return !!rec[name]; } catch (e46) { return false; }
            }).length;
            const pct = chartRange>0?Math.round(daysTaken/chartRange*100):0;
            const c = pct>=80?GRNA:pct>=50?GOLD:pct>0?AMB:T3;
            return (
              React.createElement('div', { key: name, style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4401}}
                , React.createElement('span', { style: {fontSize:14,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4402}}, _optionalChain([s, 'optionalAccess', _81 => _81.icon])||"💊")
                , React.createElement('span', { style: {flex:1,fontSize:11,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4403}}, name)
                , React.createElement('div', { style: {width:60,height:4,background:S2,borderRadius:2,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4404}}
                  , React.createElement('div', { style: {height:"100%",width:`${pct}%`,background:c,borderRadius:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4405}})
                )
                , React.createElement('span', { style: {fontSize:10,fontWeight:700,color:c,width:32,textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4407}}, pct, "%")
              )
            );
          })
        )
      )
    );
  };

  const tabBtn = (key, label) => (
    React.createElement('button', { key: key, onClick: ()=>setProgressView(key), style: {
      flex:1, padding:"7px 0", borderRadius:9, border:"none", fontSize:11,
      fontWeight:progressView===key?700:400, cursor:"pointer",
      background:progressView===key?GOLD:S2,
      color:progressView===key?BG:T3,
    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4417}}, label)
  );

  return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4426}}
      /* sub-tab bar */
      , React.createElement('div', { style: {display:"flex",gap:4,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4428}}
        , tabBtn("momentum","Momentum")
        , tabBtn("body","Body")
        , tabBtn("balance","Balance")
      )

      /* ── MOMENTUM ── */
      , progressView==="momentum"&&(
        React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4436}}
          , renderColdChart()
          , renderThisWeek()
          , React.createElement('div', { style: {display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4439}}
            , React.createElement(Stat, { label: "Streak",    value: `${streak}d`,    sub: "days trained" , color: streak>=7?GOLD:streak>=3?AMB:T2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4440}})
            , React.createElement(Stat, { label: "Check-ins", value: entries.length,  sub: "days logged" ,  color: T1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4441}})
          )
        )
      )

      /* ── BODY ── */
      , progressView==="body"&&(
        React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4448}}
          , wData.length>0&&(
            React.createElement('div', { style: {display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4450}}
              , React.createElement(Stat, { label: "Weight", value: `${wData[wData.length-1].v}kg`,
                sub: wData[wData.length-1].v>=wMin&&wData[wData.length-1].v<=wMax?"on target":"off range",
                color: wData[wData.length-1].v>=wMin&&wData[wData.length-1].v<=wMax?GRN:AMB, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4451}})
              , React.createElement(Stat, { label: "Target", value: `${wMin}–${wMax}kg`, sub: "range", color: T2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4454}})
            )
          )
          , wData.length>=1 ? renderWeightProjection() : null
          , renderWeightChart()
          , renderSuppAdherenceChart()
        )
      )

      /* ── BALANCE ── */
      , progressView==="balance"&&(
        React.createElement('div', { key: "balance-tab", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4465}}
          , balanceRangeButtons()
          , renderRadarChart(balanceRange)
          , renderTimePerSkillChart(balanceRange)
        )
      )

    )
  );
}


// ── main app ──────────────────────────────────────────────────────────────────
// ── Reaction Game: Passing Direction ─────────────────────────────────────────
// Read the signal and tap the correct side. Trains ruck-base read speed.
// ── Game PB storage ──────────────────────────────────────────────────────────
const GAME_KEYS = {
  passing:  "rwc_pb_passing",
  kickpass: "rwc_pb_kickpass",
  defence:  "rwc_pb_defence",
  numtrack: "rwc_pb_numtrack",
  ruckscan: "rwc_pb_ruckscan",
  cogprime: "rwc_pb_cogprime",
};

function loadPB(gameKey) {
  try { return JSON.parse(localStorage.getItem(GAME_KEYS[gameKey])||"null"); } catch (e47) { return null; }
}

function savePB(gameKey, result) {
  const prev = loadPB(gameKey);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  // Always overwrite "last attempt" fields
  let updated = {
    ...(prev||{}),
    lastPlayed: today,
    lastTime: time,
    lastTimestamp: now,
  };

  // Save last attempt metrics (always current run)
  if (result.avgRt     !== undefined) updated.lastAvgRt     = result.avgRt;
  if (result.accuracy  !== undefined) updated.lastAccuracy  = result.accuracy;
  if (result.score     !== undefined) updated.lastScore     = result.score;
  if (result.total     !== undefined) updated.lastTotal     = result.total;

  // Keep personal bests (only improve, never worsen)
  if (result.accuracy  !== undefined) updated.accuracy  = Math.max(_optionalChain([prev, 'optionalAccess', _82 => _82.accuracy])||0,  result.accuracy);
  if (result.avgRt     !== undefined) updated.avgRt     = _optionalChain([prev, 'optionalAccess', _83 => _83.avgRt]) ? Math.min(prev.avgRt, result.avgRt) : result.avgRt;
  if (result.score     !== undefined) updated.score     = Math.max(_optionalChain([prev, 'optionalAccess', _84 => _84.score])||0,     result.score);
  if (result.total     !== undefined) updated.total     = result.total;

  // Pass through other fields (streaks, bestFlashMs, gamesPlayed etc)
  Object.keys(result).forEach(k => {
    if (!['avgRt','accuracy','score','total'].includes(k)) {
      updated[k] = result[k];
    }
  });

  try { localStorage.setItem(GAME_KEYS[gameKey], JSON.stringify(updated)); } catch (e48) {}
  return updated;
}

function saveGamePoints(gameKey, onUpdate, dateOverride=null) {
  const pts = gameKey==="passing" ? 2 : 1;
  // Use local date string to match readiness chart, or override (for after-midnight sessions)
  const now = new Date();
  const today = dateOverride || `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const key = "rwc_game_pts_"+today;
  const CAP = 5;
  try {
    const existing = JSON.parse(localStorage.getItem(key)||"{}");
    const gameOnly = {...existing}; delete gameOnly["mental_task"];
    const currentTotal = Object.values(gameOnly).reduce((a,b)=>a+b,0);
    const alreadyHasThis = !!existing[gameKey]; // already awarded for this game today
    const remaining = CAP - currentTotal;
    const awarded = Math.max(0, Math.min(pts, remaining));
    const hitCap = currentTotal >= CAP;
    if (!alreadyHasThis && awarded > 0) {
      existing[gameKey] = awarded;
      localStorage.setItem(key, JSON.stringify(existing));
      if (_optionalChain([window, 'access', _85 => _85.navigator, 'optionalAccess', _86 => _86.vibrate])) window.navigator.vibrate(10);
      if (onUpdate) onUpdate();
    }
    return { awarded: alreadyHasThis ? 0 : awarded, hitCap, alreadyPlayed: alreadyHasThis, cap: CAP, currentTotal };
  } catch (e49) { return { awarded: 0, hitCap: false, alreadyPlayed: false, cap: CAP, currentTotal: 0 }; }
}

// ─── CHART SCRUBBER ───────────────────────────────────────────────────────────
// Wrap any SVG line chart. Pass points [{x (viewBox px), y (viewBox px), label, value}]
// and it overlays a draggable vertical line with a tooltip.
function ChartScrubber({points=[], viewBoxW=320, viewBoxH=80, pad=8, lineColor="#c9a84c", T1="#fff", T3="rgba(235,235,245,0.3)", S2="#2c2c2e", GOLD="#c9a84c", onScrub=null, children}) {
  const [scrubX, setScrubX] = useState(null);
  const svgRef = useRef(null);

  function getRelX(clientX) {
    const rect = _optionalChain([svgRef, 'access', _87 => _87.current, 'optionalAccess', _88 => _88.getBoundingClientRect, 'call', _89 => _89()]);
    if (!rect) return null;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.max(pad, Math.min(viewBoxW - pad, ratio * viewBoxW));
  }

  function onMove(clientX) {
    const vx = getRelX(clientX);
    if (vx !== null) {
      setScrubX(vx);
      if (onScrub && points.length > 0) {
        const closest = points.reduce((best, p) => Math.abs(p.x - vx) < Math.abs(best.x - vx) ? p : best);
        onScrub(closest.dateStr || null);
      }
    }
  }

  function onEnd() {
    setScrubX(null);
    // keep last scrubDate shown — don't clear on lift
  }

  // Find closest point to scrubX
  const active = scrubX !== null && points.length > 0
    ? points.reduce((best, p) => Math.abs(p.x - scrubX) < Math.abs(best.x - scrubX) ? p : best)
    : null;

  return (
    React.createElement('div', { style: {position:"relative",userSelect:"none",WebkitUserSelect:"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4592}}
      , React.createElement('svg', {
        ref: svgRef,
        viewBox: `0 0 ${viewBoxW} ${viewBoxH}`,
        width: "100%",
        style: {display:"block",overflow:"visible",touchAction:"none"},
        onMouseMove: e=>onMove(e.clientX),
        onMouseLeave: onEnd,
        onTouchStart: e=>{e.preventDefault();onMove(e.touches[0].clientX);},
        onTouchMove: e=>{e.preventDefault();onMove(e.touches[0].clientX);},
        onTouchEnd: onEnd, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4593}}

        , children
        , active&&(
          React.createElement('g', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4606}}
            /* vertical scrub line */
            , React.createElement('line', { x1: active.x, y1: pad, x2: active.x, y2: viewBoxH-pad,
              stroke: lineColor, strokeWidth: "1", strokeDasharray: "3,3", opacity: "0.8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4608}})
            /* dot on line */
            , React.createElement('circle', { cx: active.x, cy: active.y, r: "4", fill: lineColor, stroke: S2, strokeWidth: "1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4611}})
            /* tooltip box */
            , (()=>{
              const boxW = 72, boxH = 28;
              const bx = Math.min(viewBoxW - boxW - 2, Math.max(2, active.x - boxW/2));
              const by = active.y - boxH - 6 < pad ? active.y + 8 : active.y - boxH - 6;
              return (
                React.createElement('g', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4618}}
                  , React.createElement('rect', { x: bx, y: by, width: boxW, height: boxH, rx: "5", fill: S2, opacity: "0.95", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4619}})
                  , React.createElement('text', { x: bx+boxW/2, y: by+11, textAnchor: "middle", fontSize: "7.5", fill: T3, fontFamily: "system-ui", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4620}}, active.label)
                  , React.createElement('text', { x: bx+boxW/2, y: by+22, textAnchor: "middle", fontSize: "10", fontWeight: "700", fill: lineColor, fontFamily: "system-ui", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4621}}, active.value)
                )
              );
            })()
          )
        )
      )
    )
  );
}

function PassingGame({onClose, onPointsScored=()=>{}, todayK=todayKey()}) {
  const ROUNDS = 10;
  const SIGNALS = ["LEFT","RIGHT","LEFT","RIGHT","KICK","HOLD","LEFT","RIGHT","KICK","RIGHT"];
  const shuffled = useRef([...SIGNALS].sort(()=>Math.random()-0.5));
  const COLORS = {LEFT:BLU, RIGHT:GRNA, KICK:GOLD, HOLD:REDA};
  const ICONS  = {LEFT:"← L", RIGHT:"R →", KICK:"🦵", HOLD:"✋"};

  const [phase, setPhase]     = useState("intro");
  const [round, setRound]     = useState(0);
  const [signal, setSignal]   = useState(null);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef(null);

  const [ptsResult, setPtsResult] = useState(null);

  useEffect(() => {
    if (phase === "done" && accuracy === 100 && ptsResult === null) {
      savePB("passing", {avgRt, accuracy, total: ROUNDS});
      const res = saveGamePoints("passing", onPointsScored, todayK);
      setPtsResult(res);
    }
  }, [phase]);

  function startCountdown() {
    setPhase("countdown"); setCountdown(3);
    timerRef.current = setTimeout(()=>{ setCountdown(2);
      timerRef.current = setTimeout(()=>{ setCountdown(1);
        timerRef.current = setTimeout(()=>beginRound(0), 1000);
      }, 1000);
    }, 1000);
  }

  function beginRound(rnd) {
    if (rnd >= ROUNDS) { setPhase("done"); return; }
    setSignal(null); setFeedback(null); setPhase("ready");
    const delay = 800 + Math.random() * 1000;
    timerRef.current = setTimeout(() => {
      setSignal(shuffled.current[rnd]);
      setStartTime(Date.now());
      setPhase("signal");
    }, delay);
  }

  function answer(choice) {
    if (phase !== "signal") return;
    clearTimeout(timerRef.current);
    const rt = Date.now() - startTime;
    const correct = choice === signal;
    const newResults = [...results, {signal, choice, rt, correct}];
    setResults(newResults);
    setFeedback({correct, rt});
    setPhase("result");
    const nextRnd = round + 1;
    setRound(nextRnd);
    timerRef.current = setTimeout(() => beginRound(nextRnd), 700);
  }

  const avgRt = results.length ? Math.round(results.reduce((a,r)=>a+r.rt,0)/results.length) : 0;
  const accuracy = results.length ? Math.round(results.filter(r=>r.correct).length/results.length*100) : 0;

  return (
    React.createElement('div', { style: {position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 16px",overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4696}}

      , phase==="intro"&&(
        React.createElement('div', { style: {textAlign:"center",maxWidth:340}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4699}}
          , React.createElement('div', { style: {fontSize:40,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4700}}, "⚡")
          , React.createElement('div', { style: {fontSize:20,fontWeight:800,color:T1,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4701}}, "Passing direction" )
          , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.65,marginBottom:24}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4702}}, "A signal appears. Tap the correct action as fast as possible. 10 rounds. Trains your ruck-base read speed."                 )
          , React.createElement('div', { style: {display:"flex",gap:10,justifyContent:"center",marginBottom:24,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4703}}
            , Object.entries(ICONS).map(([k,v])=>(
              React.createElement('div', { key: k, style: {background:COLORS[k]+"22",borderRadius:10,padding:"8px 14px",border:`1px solid ${COLORS[k]}44`,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4705}}
                , React.createElement('div', { style: {fontSize:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4706}}, v)
                , React.createElement('div', { style: {fontSize:10,color:COLORS[k],fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4707}}, k)
              )
            ))
          )
          , React.createElement('button', { onClick: startCountdown, style: {width:"100%",padding:14,borderRadius:12,border:"none",background:GOLD,color:BG,fontSize:15,fontWeight:800,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4711}}, "Start →" )
          , React.createElement('button', { onClick: onClose, style: {marginTop:10,width:"100%",padding:10,borderRadius:12,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:13,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4712}}, "Cancel")
        )
      )

      , phase==="countdown"&&(
        React.createElement('div', { style: {textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4717}}
          , React.createElement('div', { style: {fontSize:120,fontWeight:900,color:GOLD,lineHeight:1,transition:"background-color 0.15s,border-color 0.15s,color 0.15s"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4718}}, countdown)
          , React.createElement('div', { style: {fontSize:14,color:T3,marginTop:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4719}}, "Get ready..." )
        )
      )

      , (phase==="ready"||phase==="signal"||phase==="result")&&(
        React.createElement('div', { style: {textAlign:"center",width:"100%",maxWidth:360}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4724}}
          , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:24}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4725}}, round+1, " / "  , ROUNDS)
          , React.createElement('div', { style: {height:160,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4726}}
            , phase==="ready"&&React.createElement('div', { style: {fontSize:48,color:T3,letterSpacing:"0.1em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4727}}, "···")
            , (phase==="signal"||phase==="result")&&signal&&(
              React.createElement('div', { style: {fontSize:80,fontWeight:900,color:COLORS[signal],lineHeight:1,letterSpacing:"-0.03em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4729}}
                , ICONS[signal]
              )
            )
          )
          , phase==="result"&&feedback&&(
            React.createElement('div', { style: {fontSize:14,fontWeight:700,color:feedback.correct?GRNA:REDA,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4735}}
              , feedback.correct?`✓ ${feedback.rt}ms`:`✗ wrong`
            )
          )
          , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4739}}
            , [["LEFT","←",BLU],["RIGHT","→",GRNA]].map(([k,icon,color])=>(
              React.createElement('button', { key: k, onClick: ()=>answer(k), style: {
                padding:"24px 0",borderRadius:14,border:`2px solid ${color}44`,
                background:color+"18",color,fontSize:32,fontWeight:900,cursor:"pointer",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4741}}, icon)
            ))
          )
          , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4747}}
            , [["KICK","🦵",GOLD],["HOLD","✋",REDA]].map(([k,icon,color])=>(
              React.createElement('button', { key: k, onClick: ()=>answer(k), style: {
                padding:"16px 0",borderRadius:14,border:`2px solid ${color}44`,
                background:color+"18",color,fontSize:24,cursor:"pointer",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4749}}, icon)
            ))
          )
        )
      )

      , phase==="done"&&(()=>{
        const prevPB = loadPB("passing");
        const isFastPB = accuracy===100 && ptsResult && (!_optionalChain([prevPB, 'optionalAccess', _90 => _90.lastPlayed]) || avgRt < (prevPB.avgRt||9999));
        return (
          React.createElement('div', { style: {textAlign:"center",maxWidth:340}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4762}}
            , React.createElement('div', { style: {fontSize:40,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4763}}, "✓")
            , React.createElement('div', { style: {fontSize:20,fontWeight:800,color:T1,marginBottom:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4764}}, "Done")
            , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4765}}
              , React.createElement('div', { style: {background:S2,borderRadius:12,padding:"14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4766}}
                , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4767}}, "THIS RUN" )
                , React.createElement('div', { style: {fontSize:28,fontWeight:800,letterSpacing:"-0.02em",color:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4768}}, avgRt, React.createElement('span', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4768}}, "ms"))
                , React.createElement('div', { style: {fontSize:10,color:accuracy>=80?GRNA:accuracy>=60?GOLD:REDA,marginTop:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4769}}, accuracy, "% accuracy" )
              )
              , React.createElement('div', { style: {background:S2,borderRadius:12,padding:"14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4771}}
                , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4772}}, "BEST TIME" )
                , React.createElement('div', { style: {fontSize:28,fontWeight:800,letterSpacing:"-0.02em",color:isFastPB?GRNA:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4773}}, _optionalChain([loadPB, 'call', _91 => _91("passing"), 'optionalAccess', _92 => _92.avgRt])||avgRt, React.createElement('span', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4773}}, "ms"))
                , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4774}}, "lower = better"  )
              )
            )
            , isFastPB&&avgRt>0&&React.createElement('div', { style: {fontSize:13,color:GRNA,fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4777}}, "🏆 New best time!"   )
            , _optionalChain([ptsResult, 'optionalAccess', _93 => _93.awarded])>0&&React.createElement('div', { style: {fontSize:13,color:GOLD,fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4778}}, "+", ptsResult.awarded, "pt", ptsResult.awarded>1?"s":"", " added to training readiness ✓"     )
            , _optionalChain([ptsResult, 'optionalAccess', _94 => _94.hitCap])&&React.createElement('div', { style: {fontSize:12,color:T3,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4779}}, "Daily game cap reached ("    , ptsResult.cap, "pts)")
            , _optionalChain([ptsResult, 'optionalAccess', _95 => _95.alreadyPlayed])&&React.createElement('div', { style: {fontSize:12,color:T3,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4780}}, "Already earned points today — play tomorrow"      )
            , accuracy<100&&React.createElement('div', { style: {fontSize:12,color:T3,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4781}}, "100% accuracy needed to earn points"     )
            , React.createElement('div', { style: {fontSize:12,color:T3,lineHeight:1.65,marginBottom:20,background:S2,borderRadius:10,padding:"12px 14px",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4782}}
              , avgRt<350?"Elite level — sub-350ms is world class.":avgRt<500?"Good — under 500ms is competitive.":"Keep training — aim for under 400ms."
            )
            , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:13,borderRadius:12,border:"none",background:GOLD,color:BG,fontSize:14,fontWeight:800,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4785}}, "Done")
          )
        );
      })()
    )
  );
}

function PitchSVG({defRuck=[],defenders=[],def9=null,backfield=[],atkRuck=[],attackers=[],customArrows=[],gaps=[],showArrows=true,showGaps=false,ruckY=0.52}) {
  const W=360, H=220;
  const rx = x => x*W;
  const ry = y => y*H;

  return (
    React.createElement('svg', { viewBox: `0 0 ${W} ${H}`, style: {width:"100%",display:"block",background:"#1a4a1a"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4799}}
      /* ── PITCH MARKINGS ── */
      /* outer border */
      , React.createElement('rect', { x: 1, y: 1, width: W-2, height: H-2, fill: "none", stroke: "rgba(255,255,255,0.25)", strokeWidth: "1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4802}})
      /* halfway line */
      , React.createElement('line', { x1: rx(0.5), y1: 0, x2: rx(0.5), y2: H, stroke: "rgba(255,255,255,0.2)", strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4804}})
      /* 22m lines */
      , React.createElement('line', { x1: rx(0.22), y1: 0, x2: rx(0.22), y2: H, stroke: "rgba(255,255,255,0.12)", strokeWidth: "1", strokeDasharray: "4,3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4806}})
      , React.createElement('line', { x1: rx(0.78), y1: 0, x2: rx(0.78), y2: H, stroke: "rgba(255,255,255,0.12)", strokeWidth: "1", strokeDasharray: "4,3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4807}})
      /* try lines */
      , React.createElement('line', { x1: rx(0.04), y1: 0, x2: rx(0.04), y2: H, stroke: "rgba(255,255,255,0.15)", strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4809}})
      , React.createElement('line', { x1: rx(0.96), y1: 0, x2: rx(0.96), y2: H, stroke: "rgba(255,255,255,0.15)", strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4810}})
      /* 5m lines */
      , React.createElement('line', { x1: rx(0.08), y1: 0, x2: rx(0.08), y2: H, stroke: "rgba(255,255,255,0.07)", strokeWidth: "0.5", strokeDasharray: "2,4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4812}})
      , React.createElement('line', { x1: rx(0.92), y1: 0, x2: rx(0.92), y2: H, stroke: "rgba(255,255,255,0.07)", strokeWidth: "0.5", strokeDasharray: "2,4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4813}})
      /* 10m lines */
      , React.createElement('line', { x1: rx(0.11), y1: 0, x2: rx(0.11), y2: H, stroke: "rgba(255,255,255,0.09)", strokeWidth: "0.5", strokeDasharray: "3,3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4815}})
      , React.createElement('line', { x1: rx(0.89), y1: 0, x2: rx(0.89), y2: H, stroke: "rgba(255,255,255,0.09)", strokeWidth: "0.5", strokeDasharray: "3,3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4816}})
      /* ruck line */
      , React.createElement('line', { x1: 0, y1: ry(ruckY), x2: W, y2: ry(ruckY), stroke: "rgba(255,255,255,0.18)", strokeWidth: "1.2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4818}})
      /* grass stripes */
      , [0,1,2,3,4,5,6].map(i=>(
        React.createElement('rect', { key: i, x: rx(i/7), y: 0, width: rx(1/7), height: H,
          fill: i%2===0?"rgba(0,0,0,0.06)":"transparent", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4821}})
      ))

      /* ── RUCK MARKER ── */
      , React.createElement('ellipse', { cx: rx(0.5), cy: ry(ruckY), rx: 14, ry: 8, fill: "#8B6914", opacity: 0.9, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4826}})
      , React.createElement('text', { x: rx(0.5), y: ry(ruckY)+4, textAnchor: "middle", fontSize: "8", fill: "#fff", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4827}}, "RUCK")

      /* ── DEF RUCK PLAYERS (dark red, near ruck) ── */
      , defRuck.map((p,i)=>(
        React.createElement('g', { key: "dr"+i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4831}}
          , React.createElement('circle', { cx: rx(p.x), cy: ry(p.y), r: 9, fill: "#7a0d1e", stroke: "#ff375f", strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4832}})
          , React.createElement('text', { x: rx(p.x), y: ry(p.y)+4, textAnchor: "middle", fontSize: "8", fill: "#ffaaaa", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4833}}, "D")
        )
      ))

      /* ── DEFENDERS (red) ── */
      , defenders.map((p,i)=>(
        React.createElement('g', { key: "d"+i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4839}}
          , React.createElement('circle', { cx: rx(p.x), cy: ry(p.y), r: 10, fill: "#c41e3a", stroke: "#ff375f", strokeWidth: "1.2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4840}})
          , React.createElement('text', { x: rx(p.x), y: ry(p.y)+4, textAnchor: "middle", fontSize: "9", fill: "#fff", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4841}}, "D")
          , showArrows&&customArrows[i]&&(()=>{
            const dx = customArrows[i].dx||0;
            const dy = customArrows[i].dy||0;
            if (!dx && !dy) return null;
            const x1=rx(p.x), y1=ry(p.y), x2=rx(p.x+dx), y2=ry(p.y+dy);
            return React.createElement('line', { x1: x1, y1: y1-10, x2: x2, y2: y2, stroke: "#ff6b6b", strokeWidth: "1.5", strokeDasharray: "3,2", markerEnd: "url(#darr)", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4847}});
          })()
        )
      ))

      /* ── DEF 9 (small red circle) ── */
      , def9&&React.createElement('g', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4853}}
        , React.createElement('circle', { cx: rx(def9.x), cy: ry(def9.y), r: 8, fill: "#a01020", stroke: "#ff375f", strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4854}})
        , React.createElement('text', { x: rx(def9.x), y: ry(def9.y)+4, textAnchor: "middle", fontSize: "8", fill: "#ffcccc", fontWeight: "800", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4855}}, "9")
      )

      /* ── BACKFIELD defenders (smaller, further back) ── */
      , backfield.map((p,i)=>(
        React.createElement('g', { key: "bf"+i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4860}}
          , React.createElement('circle', { cx: rx(p.x), cy: ry(p.y), r: 8, fill: "#8B1020", stroke: "#ff375f", strokeWidth: "0.8", opacity: 0.85, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4861}})
          , React.createElement('text', { x: rx(p.x), y: ry(p.y)+3, textAnchor: "middle", fontSize: "7", fill: "#ffcccc", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4862}}, p.label||"D")
        )
      ))

      /* ── ATK RUCK (gold, at ruck) ── */
      , atkRuck.map((p,i)=>(
        React.createElement('g', { key: "ar"+i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4868}}
          , React.createElement('circle', { cx: rx(p.x), cy: ry(p.y), r: 9, fill: "#6B5000", stroke: "#c9a84c", strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4869}})
          , React.createElement('text', { x: rx(p.x), y: ry(p.y)+4, textAnchor: "middle", fontSize: "8", fill: "#ffe080", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4870}}, "F")
        )
      ))

      /* ── ATTACKERS (blue) ── */
      , attackers.map((p,i)=>(
        React.createElement('g', { key: "a"+i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4876}}
          , React.createElement('circle', { cx: rx(p.x), cy: ry(p.y), r: 10, fill: "#0a4a8f", stroke: "#0a84ff", strokeWidth: "1.2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4877}})
          , React.createElement('text', { x: rx(p.x), y: ry(p.y)+4, textAnchor: "middle", fontSize: "9", fill: "#fff", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4878}}, "A")
        )
      ))

      /* ── GAPS (green halos when showing feedback) ── */
      , showGaps&&gaps.map((g,i)=>(
        React.createElement('g', { key: "g"+i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 4884}}
          , React.createElement('ellipse', { cx: rx(g.x), cy: ry(g.y), rx: 22, ry: 14, fill: "rgba(48,209,88,0.15)", stroke: "#30d158", strokeWidth: "1.5", strokeDasharray: "4,2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4885}})
          , g.label&&React.createElement('text', { x: rx(g.x), y: ry(g.y)+4, textAnchor: "middle", fontSize: "9", fill: "#30d158", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4886}}, g.label)
        )
      ))

      , React.createElement('defs', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 4890}}
        , React.createElement('marker', { id: "darr", markerWidth: "5", markerHeight: "5", refX: "3", refY: "2.5", orient: "auto", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4891}}
          , React.createElement('path', { d: "M0,0 L5,2.5 L0,5 Z"   , fill: "#ff6b6b", __self: this, __source: {fileName: _jsxFileName, lineNumber: 4892}})
        )
      )
    )
  );
}

function ReadAndDecideGame({onClose, onPointsScored=()=>{}, todayK=todayKey()}) {
  const FLASH_MS_BASE = 2500;

  const SCENARIOS = [
    // ─── 1. BLITZ — whole defensive line rushing up, space behind ───
    {
      id:"blitz",
      ruckY:0.52,
      // Defenders in ruck (near ruck position)
      defRuck:[{x:0.40,y:0.50},{x:0.46,y:0.50},{x:0.54,y:0.50},{x:0.60,y:0.50}],
      // Defensive line rushing up (6 backs)
      defenders:[
        {x:0.08,y:0.36},{x:0.20,y:0.34},{x:0.32,y:0.33},{x:0.50,y:0.33},
        {x:0.68,y:0.33},{x:0.80,y:0.34},{x:0.92,y:0.36}
      ],
      // Def 9 behind ruck
      def9:{x:0.50,y:0.56},
      // Backfield (wingers pushed up flat in blitz)
      backfield:[{x:0.20,y:0.22,label:"W"},{x:0.80,y:0.22,label:"W"},{x:0.50,y:0.18,label:"FB"}],
      // Attacking forwards at ruck
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      // Attacking backline
      attackers:[
        {x:0.10,y:0.72},{x:0.22,y:0.72},{x:0.36,y:0.72},{x:0.52,y:0.72},
        {x:0.68,y:0.72},{x:0.80,y:0.72},{x:0.90,y:0.72}
      ],
      customArrows:[
        {dy:0.22},{dy:0.22},{dy:0.22},{dy:0.22},{dy:0.22},{dy:0.22},{dy:0.22}
      ],
      gaps:[{x:0.50,y:0.14,label:"SPACE"}],
      options:[
        {key:"boxkick",   label:"📦 Box kick",     sub:"Over the rushing line"},
        {key:"grubber",   label:"⚽ Grubber",       sub:"Through low"},
        {key:"pass",      label:"🏉 Pass wide",     sub:"Into the rush"},
        {key:"run",       label:"🏃 Pick & go",     sub:"Into 7 rushing"},
      ],
      correct:"boxkick",
      explanation:"Blitz — whole line rushing, wingers up flat, space behind. Box kick over the top. Passing or running goes straight into the rush.",
    },

    // ─── 2. DRIFT RIGHT — line sliding right, blindside open ───
    {
      id:"drift",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      defenders:[
        {x:0.36,y:0.30},{x:0.48,y:0.30},{x:0.60,y:0.30},{x:0.70,y:0.30},
        {x:0.80,y:0.30},{x:0.90,y:0.31}
      ],
      def9:{x:0.34,y:0.56},
      backfield:[{x:0.70,y:0.18,label:"W"},{x:0.92,y:0.20,label:"W"},{x:0.80,y:0.12,label:"FB"}],
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      attackers:[
        {x:0.08,y:0.72},{x:0.18,y:0.72},{x:0.30,y:0.72},{x:0.44,y:0.72},
        {x:0.60,y:0.72},{x:0.74,y:0.72},{x:0.88,y:0.72}
      ],
      customArrows:[
        {dx:0.14,dy:0.02},{dx:0.14,dy:0.02},{dx:0.14,dy:0.02},
        {dx:0.14,dy:0.02},{dx:0.12,dy:0.02},{dx:0.10,dy:0.02}
      ],
      gaps:[{x:0.14,y:0.42,label:"OPEN"}],
      options:[
        {key:"run",       label:"🏃 9-channel",    sub:"Blindside is open"},
        {key:"pass",      label:"🏉 Pass right",   sub:"Into the drift"},
        {key:"fiftytwo",  label:"🎯 50/22",        sub:"Kick wide right"},
        {key:"boxkick",   label:"📦 Box kick",     sub:"High away"},
      ],
      correct:"run",
      explanation:"Drift right — entire line sliding away, blindside channel open. Pick and go left. Def 9 also drifted, so the channel is unguarded.",
    },

    // ─── 3. 50/22 — winger flat, FB central, corner exposed ───
    {
      id:"fiftytwo",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      defenders:[
        {x:0.10,y:0.30},{x:0.22,y:0.30},{x:0.34,y:0.30},{x:0.46,y:0.30},
        {x:0.58,y:0.30},{x:0.70,y:0.30},{x:0.82,y:0.30}
      ],
      def9:{x:0.50,y:0.56},
      // Wingers both up in line (blitz wingersup), FB central — corner exposed
      backfield:[
        {x:0.10,y:0.22,label:"W"},
        {x:0.50,y:0.14,label:"FB"},
        // Winger flat in line (not back)
      ],
      // Right winger is already IN the defensive line (x:0.82) — shown as D
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      attackers:[
        {x:0.10,y:0.72},{x:0.22,y:0.72},{x:0.36,y:0.72},{x:0.52,y:0.72},
        {x:0.66,y:0.72},{x:0.78,y:0.72},{x:0.90,y:0.72}
      ],
      customArrows:[
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}
      ],
      gaps:[{x:0.90,y:0.14,label:"CORNER"}],
      options:[
        {key:"fiftytwo",     label:"🎯 50/22",         sub:"Kick to open corner"},
        {key:"boxkick",      label:"📦 Box kick",      sub:"FB has to chase"},
        {key:"pass",         label:"🏉 Pass wide",     sub:"Into the set line"},
        {key:"anotherphase", label:"♻️ Recycle",       sub:"Reset"},
      ],
      correct:"fiftytwo",
      explanation:"Right winger up in defensive line, FB central — right corner exposed. 50/22 into the corner. FB can't cover in time.",
    },

    // ─── 4. OVERLAP — 3 attackers vs 1 defender on left ───
    {
      id:"overlap_left",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      defenders:[
        {x:0.52,y:0.30},{x:0.64,y:0.30},{x:0.76,y:0.30},
        {x:0.86,y:0.30},{x:0.92,y:0.31}
      ],
      def9:{x:0.50,y:0.56},
      backfield:[{x:0.20,y:0.18,label:"W"},{x:0.80,y:0.15,label:"W"},{x:0.50,y:0.10,label:"FB"}],
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      attackers:[
        {x:0.06,y:0.72},{x:0.16,y:0.72},{x:0.28,y:0.72},
        {x:0.48,y:0.72},{x:0.62,y:0.72},{x:0.76,y:0.72},{x:0.88,y:0.72}
      ],
      customArrows:[
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}
      ],
      gaps:[{x:0.20,y:0.18,label:"3v0"}],
      options:[
        {key:"pass",      label:"🏉 Pass left",    sub:"3 attackers, 0 defenders"},
        {key:"run",       label:"🏃 Pick & go",    sub:"Into open channel"},
        {key:"crossfield",label:"↗ Cross-field",   sub:"Switch to right"},
        {key:"boxkick",   label:"📦 Box kick",     sub:"Kick instead"},
      ],
      correct:"pass",
      explanation:"3 attackers vs 0 defenders on the left — pass immediately. Winger and FB are too deep to cover. Don't think, just go.",
    },

    // ─── 5. WINGER INSIDE — right winger drifted in, corner exposed ───
    {
      id:"winger_in",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      defenders:[
        {x:0.10,y:0.30},{x:0.22,y:0.30},{x:0.34,y:0.30},{x:0.46,y:0.30},
        {x:0.58,y:0.30},{x:0.68,y:0.30}
        // right winger came in — only 6 in line instead of 7
      ],
      def9:{x:0.50,y:0.56},
      backfield:[{x:0.10,y:0.18,label:"W"},{x:0.50,y:0.14,label:"FB"}],
      // Right winger shown drifting inside via arrow
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      attackers:[
        {x:0.10,y:0.72},{x:0.22,y:0.72},{x:0.36,y:0.72},{x:0.52,y:0.72},
        {x:0.68,y:0.72},{x:0.80,y:0.72},{x:0.92,y:0.72}
      ],
      customArrows:[
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}
      ],
      gaps:[{x:0.90,y:0.20,label:"CORNER"}],
      options:[
        {key:"crossfield", label:"↗ Cross-field",  sub:"Right corner open"},
        {key:"fiftytwo",   label:"🎯 50/22",        sub:"Kick to their 22"},
        {key:"pass",       label:"🏉 Pass wide",    sub:"Right into bunched line"},
        {key:"boxkick",    label:"📦 Box kick",     sub:"High and chase"},
      ],
      correct:"crossfield",
      explanation:"Right winger came inside — right corner is open. Cross-field kick into that space. FB alone can't cover a well-placed cross-field.",
    },

    // ─── 6. SCRAMBLE — defenders not set, rushing back ───
    {
      id:"scramble",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      // Defenders scattered at different depths — not in a line
      defenders:[
        {x:0.12,y:0.44},{x:0.26,y:0.50},{x:0.40,y:0.46},{x:0.56,y:0.52},
        {x:0.70,y:0.45},{x:0.84,y:0.50}
      ],
      def9:{x:0.50,y:0.58},
      backfield:[{x:0.20,y:0.30,label:"W"},{x:0.80,y:0.30,label:"W"},{x:0.50,y:0.24,label:"FB"}],
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      attackers:[
        {x:0.10,y:0.72},{x:0.22,y:0.72},{x:0.36,y:0.72},{x:0.52,y:0.72},
        {x:0.68,y:0.72},{x:0.80,y:0.72},{x:0.90,y:0.72}
      ],
      // Defenders scrambling back (arrows pointing up/backward)
      customArrows:[
        {dy:-0.16},{dy:-0.18},{dy:-0.16},{dy:-0.18},{dy:-0.16},{dy:-0.18}
      ],
      gaps:[{x:0.50,y:0.30,label:"GO NOW"}],
      options:[
        {key:"pass",      label:"🏉 Pass wide",    sub:"Before they reset"},
        {key:"run",       label:"🏃 Pick & go",    sub:"Through the gap"},
        {key:"boxkick",   label:"📦 Box kick",     sub:"Kick away"},
        {key:"anotherphase",label:"♻️ Wait",        sub:"Let them reset"},
      ],
      correct:"pass",
      explanation:"Defenders scrambling back to position — move the ball now before they set. Fast hands to backs. This is when tries are scored.",
    },

    // ─── 7. OWN 22 — under your own posts ───
    {
      id:"own22",
      ruckY:0.76,
      defRuck:[{x:0.42,y:0.74},{x:0.48,y:0.74},{x:0.56,y:0.74},{x:0.62,y:0.74}],
      defenders:[
        {x:0.10,y:0.58},{x:0.22,y:0.56},{x:0.36,y:0.55},{x:0.50,y:0.55},
        {x:0.64,y:0.55},{x:0.78,y:0.56},{x:0.90,y:0.58}
      ],
      def9:{x:0.50,y:0.68},
      backfield:[{x:0.20,y:0.40,label:"W"},{x:0.80,y:0.40,label:"W"},{x:0.50,y:0.34,label:"FB"}],
      atkRuck:[{x:0.38,y:0.82},{x:0.44,y:0.82},{x:0.56,y:0.82},{x:0.62,y:0.82}],
      attackers:[
        {x:0.12,y:0.88},{x:0.26,y:0.88},{x:0.42,y:0.88},
        {x:0.60,y:0.88},{x:0.74,y:0.88},{x:0.88,y:0.88}
      ],
      customArrows:[
        {dy:0.16},{dy:0.16},{dy:0.16},{dy:0.16},{dy:0.16},{dy:0.16},{dy:0.16}
      ],
      gaps:[],
      options:[
        {key:"clear",     label:"👣 Clear kick",   sub:"Touch far side"},
        {key:"fiftytwo",  label:"🎯 50/22",        sub:"Try it from here"},
        {key:"run",       label:"🏃 Pick & go",    sub:"Carry out yourself"},
        {key:"pass",      label:"🏉 Pass wide",    sub:"Risk infield"},
      ],
      correct:"clear",
      explanation:"Your own 22, 7 defenders pressing. Clear it immediately — height and distance. Touch on the far side. No 50/22 attempts under your own posts.",
    },

    // ─── 8. DEFENCE OUTNUMBERS ATTACK ───
    {
      id:"overload",
      ruckY:0.52,
      defRuck:[{x:0.40,y:0.50},{x:0.46,y:0.50},{x:0.54,y:0.50},{x:0.60,y:0.50},{x:0.66,y:0.50}],
      defenders:[
        {x:0.08,y:0.30},{x:0.20,y:0.30},{x:0.32,y:0.30},{x:0.44,y:0.30},
        {x:0.56,y:0.30},{x:0.68,y:0.30},{x:0.80,y:0.30},{x:0.92,y:0.31}
      ],
      def9:{x:0.50,y:0.56},
      backfield:[{x:0.20,y:0.18,label:"W"},{x:0.80,y:0.18,label:"W"},{x:0.50,y:0.12,label:"FB"}],
      atkRuck:[{x:0.40,y:0.62},{x:0.46,y:0.62},{x:0.54,y:0.62},{x:0.60,y:0.62}],
      attackers:[
        {x:0.22,y:0.72},{x:0.38,y:0.72},{x:0.62,y:0.72},{x:0.78,y:0.72}
      ],
      customArrows:[
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}
      ],
      gaps:[],
      options:[
        {key:"anotherphase", label:"♻️ Recycle",      sub:"Wait for numbers"},
        {key:"pass",         label:"🏉 Pass wide",    sub:"4 vs 8+3 backfield"},
        {key:"boxkick",      label:"📦 Box kick",     sub:"Win territory"},
        {key:"run",          label:"🏃 Pick & go",    sub:"Into the wall"},
      ],
      correct:"anotherphase",
      explanation:"8 defenders + def 9 vs 4 attackers. You're badly outnumbered. Recycle and wait for your forwards to come back. Don't force it.",
    },

    // ─── 9. SHORT SIDE OPEN — defence overloads wide side ───
    {
      id:"shortside",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      // All defenders crowded on right (wide) side
      defenders:[
        {x:0.38,y:0.30},{x:0.50,y:0.30},{x:0.62,y:0.30},{x:0.72,y:0.30},
        {x:0.82,y:0.30},{x:0.90,y:0.31}
      ],
      def9:{x:0.36,y:0.56},
      backfield:[{x:0.20,y:0.18,label:"W"},{x:0.85,y:0.16,label:"W"},{x:0.65,y:0.12,label:"FB"}],
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      // Attackers also spread right — but short side (left) has 2 vs 0
      attackers:[
        {x:0.08,y:0.72},{x:0.18,y:0.72},
        {x:0.38,y:0.72},{x:0.52,y:0.72},{x:0.66,y:0.72},{x:0.80,y:0.72},{x:0.92,y:0.72}
      ],
      customArrows:[
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},
        {dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}
      ],
      gaps:[{x:0.13,y:0.40,label:"2v0"}],
      options:[
        {key:"run",       label:"🏃 Pick short",   sub:"2v0 on the left"},
        {key:"pass",      label:"🏉 Pass right",   sub:"Into the crowd"},
        {key:"boxkick",   label:"📦 Box kick",     sub:"High away"},
        {key:"fiftytwo",  label:"🎯 50/22",        sub:"Kick wide right"},
      ],
      correct:"run",
      explanation:"Defence overloaded the wide side — 2v0 on the short side. Pick and go left. It's a guaranteed gain, possible try.",
    },

    // ─── 10. FLAT RUSH, DEEP FB — grubber opportunity ───
    {
      id:"grubber_opp",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      // Line very flat and up, very close to ruck
      defenders:[
        {x:0.10,y:0.40},{x:0.22,y:0.39},{x:0.36,y:0.38},{x:0.50,y:0.38},
        {x:0.64,y:0.38},{x:0.78,y:0.39},{x:0.90,y:0.40}
      ],
      def9:{x:0.50,y:0.56},
      // FB very deep — can't chase grubber
      backfield:[{x:0.22,y:0.10,label:"W"},{x:0.78,y:0.10,label:"W"},{x:0.50,y:0.06,label:"FB"}],
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      attackers:[
        {x:0.12,y:0.72},{x:0.24,y:0.72},{x:0.38,y:0.72},{x:0.52,y:0.72},
        {x:0.66,y:0.72},{x:0.80,y:0.72},{x:0.90,y:0.72}
      ],
      customArrows:[
        {dy:0.16},{dy:0.16},{dy:0.16},{dy:0.16},{dy:0.16},{dy:0.16},{dy:0.16}
      ],
      gaps:[{x:0.50,y:0.22,label:"FB DEEP"}],
      options:[
        {key:"grubber",   label:"⚽ Grubber",       sub:"Through, FB is deep"},
        {key:"boxkick",   label:"📦 Box kick",      sub:"Over the line"},
        {key:"pass",      label:"🏉 Pass wide",     sub:"Into the rush"},
        {key:"run",       label:"🏃 Pick & go",     sub:"Into flat line"},
      ],
      correct:"grubber",
      explanation:"Line flat and up, FB very deep — grubber through the gap. FB has too much ground to cover. A well-weighted grubber wins this.",
    },

    // ─── 11. FAST BALL, BACKS MISALIGNED ───
    {
      id:"misaligned",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      // Defenders at uneven depths — some haven't reset yet
      defenders:[
        {x:0.12,y:0.30},{x:0.26,y:0.36},{x:0.40,y:0.30},{x:0.54,y:0.36},
        {x:0.68,y:0.30},{x:0.82,y:0.36},{x:0.92,y:0.30}
      ],
      def9:{x:0.50,y:0.56},
      backfield:[{x:0.18,y:0.18,label:"W"},{x:0.82,y:0.18,label:"W"},{x:0.50,y:0.12,label:"FB"}],
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      attackers:[
        {x:0.10,y:0.72},{x:0.22,y:0.72},{x:0.36,y:0.72},{x:0.52,y:0.72},
        {x:0.68,y:0.72},{x:0.80,y:0.72},{x:0.90,y:0.72}
      ],
      customArrows:[
        {dy:-0.08},{dy:0.08},{dy:-0.08},{dy:0.08},{dy:-0.08},{dy:0.08},{dy:-0.08}
      ],
      gaps:[{x:0.33,y:0.33,label:"GAP"},{x:0.61,y:0.33,label:"GAP"}],
      options:[
        {key:"pass",      label:"🏉 Pass wide",    sub:"Find the flat defender"},
        {key:"run",       label:"🏃 Pick & go",    sub:"Hit the gap at 9-channel"},
        {key:"boxkick",   label:"📦 Box kick",     sub:"High away"},
        {key:"fiftytwo",  label:"🎯 50/22",        sub:"Kick to their 22"},
      ],
      correct:"pass",
      explanation:"Defensive line misaligned — some defenders deep, gaps between them. Pass quickly before they level up. Attack through the flat defenders.",
    },

    // ─── 12. MAUL OPPORTUNITY — pick & drive ───
    {
      id:"maul",
      ruckY:0.52,
      defRuck:[{x:0.40,y:0.50},{x:0.46,y:0.50},{x:0.54,y:0.50},{x:0.60,y:0.50}],
      // Loose forwards not back yet — only backs in defensive line
      defenders:[
        {x:0.24,y:0.32},{x:0.38,y:0.32},{x:0.52,y:0.32},
        {x:0.66,y:0.32},{x:0.80,y:0.32}
      ],
      def9:{x:0.22,y:0.56},
      backfield:[{x:0.12,y:0.20,label:"W"},{x:0.88,y:0.20,label:"W"},{x:0.50,y:0.14,label:"FB"}],
      // Your forwards arriving in numbers
      atkRuck:[
        {x:0.34,y:0.62},{x:0.40,y:0.62},{x:0.46,y:0.62},
        {x:0.54,y:0.62},{x:0.60,y:0.62},{x:0.66,y:0.62}
      ],
      attackers:[
        {x:0.16,y:0.74},{x:0.28,y:0.74},{x:0.50,y:0.74},
        {x:0.72,y:0.74},{x:0.84,y:0.74}
      ],
      customArrows:[{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}],
      gaps:[],
      options:[
        {key:"run",          label:"🏃 Pick & drive",  sub:"Your 6 vs their 5 backs"},
        {key:"pass",         label:"🏉 Pass wide",     sub:"Backs vs backs"},
        {key:"boxkick",      label:"📦 Box kick",      sub:"Kick for territory"},
        {key:"anotherphase", label:"♻️ Recycle",       sub:"Wait for overlap"},
      ],
      correct:"run",
      explanation:"Their loose forwards not back yet — only backs in the line. Your 6 forwards vs their 5 backs is a mismatch. Pick and drive through them.",
    },

    // ─── 13. DEFENDING OWN LINE — short side box kick ───
    {
      id:"defend_line",
      ruckY:0.88,
      defRuck:[{x:0.42,y:0.86},{x:0.48,y:0.86},{x:0.56,y:0.86},{x:0.62,y:0.86}],
      // Defenders pressing on your try line
      defenders:[
        {x:0.10,y:0.72},{x:0.22,y:0.70},{x:0.36,y:0.70},{x:0.50,y:0.70},
        {x:0.64,y:0.70},{x:0.78,y:0.70},{x:0.90,y:0.72}
      ],
      def9:{x:0.50,y:0.80},
      backfield:[{x:0.20,y:0.56,label:"W"},{x:0.80,y:0.56,label:"W"},{x:0.50,y:0.50,label:"FB"}],
      atkRuck:[{x:0.38,y:0.93},{x:0.44,y:0.93},{x:0.56,y:0.93},{x:0.62,y:0.93}],
      attackers:[
        {x:0.14,y:0.96},{x:0.28,y:0.96},{x:0.50,y:0.96},
        {x:0.72,y:0.96},{x:0.86,y:0.96}
      ],
      customArrows:[
        {dy:0.12},{dy:0.12},{dy:0.12},{dy:0.12},{dy:0.12},{dy:0.12},{dy:0.12}
      ],
      gaps:[],
      options:[
        {key:"clear",     label:"👣 Box kick out",  sub:"Clear to safety"},
        {key:"run",       label:"🏃 Pick & go",     sub:"Carry over line"},
        {key:"pass",      label:"🏉 Pass wide",     sub:"Risk across goal line"},
        {key:"fiftytwo",  label:"🎯 50/22",         sub:"From own goal line"},
      ],
      correct:"clear",
      explanation:"On your own line with 7 defenders pressing — box kick to safety. Carrying or passing across your own goal line risks a 7-pointer. Get it out.",
    },

    // ─── 14. NUMBERS EVEN, FAST RECYCLED BALL ───
    {
      id:"quickball",
      ruckY:0.52,
      defRuck:[{x:0.42,y:0.50},{x:0.48,y:0.50},{x:0.56,y:0.50},{x:0.62,y:0.50}],
      // Defence reset but one defender still coming around ruck
      defenders:[
        {x:0.10,y:0.30},{x:0.24,y:0.30},{x:0.38,y:0.30},{x:0.52,y:0.30},
        {x:0.66,y:0.30},{x:0.80,y:0.30},{x:0.92,y:0.30}
      ],
      def9:{x:0.40,y:0.44},  // def 9 caught out of position
      backfield:[{x:0.18,y:0.18,label:"W"},{x:0.82,y:0.18,label:"W"},{x:0.50,y:0.12,label:"FB"}],
      atkRuck:[{x:0.38,y:0.62},{x:0.44,y:0.62},{x:0.56,y:0.62},{x:0.62,y:0.62}],
      attackers:[
        {x:0.10,y:0.72},{x:0.22,y:0.72},{x:0.36,y:0.72},{x:0.52,y:0.72},
        {x:0.68,y:0.72},{x:0.80,y:0.72},{x:0.90,y:0.72}
      ],
      customArrows:[{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}],
      gaps:[{x:0.40,y:0.44,label:"DEF 9 OUT"}],
      options:[
        {key:"run",       label:"🏃 Pick & go",    sub:"Def 9 caught out"},
        {key:"pass",      label:"🏉 Pass wide",    sub:"Equal numbers wide"},
        {key:"fiftytwo",  label:"🎯 50/22",        sub:"Kick for territory"},
        {key:"boxkick",   label:"📦 Box kick",     sub:"High and away"},
      ],
      correct:"run",
      explanation:"Defensive 9 is caught out of position — pick and go into that gap before they recover. This is exactly the hole the 9-channel targets.",
    },
  ];


  const pb = loadPB("kickpass");
  // Progression: more correct answers over time = less time to decide
  // Level 1 (< 5 games): 5s, Level 2 (5-10 games, avg ≥ 6/14): 4s, Level 3 (avg ≥ 10/14): 3s
  const gamesPlayed = _optionalChain([pb, 'optionalAccess', _96 => _96.gamesPlayed]) || 0;
  const avgScore = _optionalChain([pb, 'optionalAccess', _97 => _97.avgScore]) || 0;
  const decisionTime = gamesPlayed < 5 ? 5 : avgScore >= 10 ? 3 : avgScore >= 6 ? 4 : 5;
  const level = decisionTime === 5 ? 1 : decisionTime === 4 ? 2 : 3;

  const [round, setRound] = useState(0);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState("intro");
  const [timeLeft, setTimeLeft] = useState(decisionTime);
  const [answered, setAnswered] = useState(null);
  const [finalPB, setFinalPB] = useState(null);
  const [ptsResult, setPtsResult] = useState(null);
  const timerRef = useRef(null);
  const shuffled = useRef([...SCENARIOS].sort(()=>Math.random()-0.5).slice(0,8));
  const ROUNDS = shuffled.current.length;

  useEffect(()=>{
    if (phase!=="play") return;
    if (timeLeft<=0) { handleAnswer(null); return; }
    timerRef.current = setTimeout(()=>setTimeLeft(t=>t-1), 1000);
    return ()=>clearTimeout(timerRef.current);
  }, [phase, timeLeft]);
  useEffect(()=>()=>clearTimeout(timerRef.current),[]);

  function startRound() { setAnswered(null); setTimeLeft(decisionTime); setPhase("play"); }

  function handleAnswer(choice) {
    clearTimeout(timerRef.current);
    const s = shuffled.current[round];
    const correct = choice !== null && choice === s.correct;
    setAnswered({choice, correct, explanation:s.explanation, correct_answer:s.correct,
      options:s.options});
    setResults(r=>[...r,{correct}]);
    setPhase("feedback");
  }

  function next() {
    if (round+1>=ROUNDS) {
      const finalScore = results.filter(r=>r.correct).length + (_optionalChain([answered, 'optionalAccess', _98 => _98.correct])?1:0);
      const newAvg = (finalScore===ROUNDS && pb) ? Math.round(((pb.avgScore||0) * gamesPlayed + finalScore) / (gamesPlayed + 1)) : _optionalChain([pb, 'optionalAccess', _99 => _99.avgScore])||0;
      const newPB = finalScore===ROUNDS ? savePB("kickpass",{score:finalScore,total:ROUNDS,gamesPlayed:gamesPlayed+1,avgScore:newAvg}) : (loadPB("kickpass")||{});
      const ptsRes = finalScore===ROUNDS ? saveGamePoints("kickpass", onPointsScored, todayK) : null;
      setPtsResult(ptsRes);
      setFinalPB(newPB);
      setPhase("done");
      return;
    }
    setRound(r=>r+1); startRound();
  }

  const score = results.filter(r=>r.correct).length;
  const s = shuffled.current[round];

  const C_MAP = {
    boxkick:"#c9a84c", run:"#0a84ff", pass:"#30d158",
    grubber:"#ff9f0a", fiftytwo:"#ff375f", crossfield:"#bf5af2",
    recycle:"#64d2ff", pickup:"#30d158", clear:"#ff9f0a", anotherphase:"#6b6b6b",
  };

  return (
    React.createElement('div', { style: {position:"fixed",inset:0,background:"#000",zIndex:300,display:"flex",flexDirection:"column",overflow:"hidden",WebkitOverflowScrolling:"touch"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5416}}
      , React.createElement('div', { style: {maxWidth:420,margin:"0 auto",width:"100%",padding:"12px 16px",display:"flex",flexDirection:"column",height:"100%",overflowY:"auto",boxSizing:"border-box"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5417}}

        , phase==="intro"&&(
          React.createElement(React.Fragment, null
            , React.createElement('div', { style: {textAlign:"center",marginBottom:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5421}}
              , React.createElement('div', { style: {fontSize:36,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5422}}, "🧠")
              , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:"#fff",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5423}}, "Read & Decide"  )
              , React.createElement('div', { style: {fontSize:13,color:"rgba(235,235,245,0.6)",lineHeight:1.65,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5424}}, "A defensive shape appears on the pitch. Read it and choose the best action. Options vary with each scenario."

              )
              , React.createElement('div', { style: {display:"flex",gap:8,justifyContent:"center",marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5427}}
                , [{l:1,t:"5s",label:"Beginner"},{l:2,t:"4s",label:"Developing"},{l:3,t:"3s",label:"Elite"}].map(lv=>(
                  React.createElement('div', { key: lv.l, style: {flex:1,padding:"8px",borderRadius:10,textAlign:"center",
                    background:level===lv.l?"#c9a84c22":"#1c1c1e",
                    border:`1px solid ${level===lv.l?"#c9a84c44":"rgba(255,255,255,0.06)"}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5429}}
                    , React.createElement('div', { style: {fontSize:14,fontWeight:800,color:level===lv.l?"#c9a84c":"rgba(255,255,255,0.3)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5432}}, lv.t)
                    , React.createElement('div', { style: {fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5433}}, lv.label)
                  )
                ))
              )
              , pb&&React.createElement('div', { style: {background:"#1c1c1e",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5437}}
                , React.createElement('span', { style: {fontSize:12,color:"rgba(235,235,245,0.4)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5438}}, "Best score · "   , gamesPlayed, " games" )
                , React.createElement('span', { style: {fontSize:12,fontWeight:700,color:"#c9a84c"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5439}}, pb.score, "/", pb.total)
              )
            )
            , React.createElement('button', { onClick: startRound, style: {width:"100%",padding:14,borderRadius:12,border:"none",background:"#c9a84c",color:"#000",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5442}}, "Start →" )
            , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:10,borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(235,235,245,0.4)",fontSize:13,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5443}}, "Cancel")
          )
        )

        , (phase==="play"||phase==="feedback")&&s&&(
          React.createElement(React.Fragment, null
            , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5449}}
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 5450}}
                , React.createElement('div', { style: {fontSize:10,color:"rgba(235,235,245,0.3)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5451}}, round+1, " / "  , ROUNDS)
                , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:"#fff"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5452}}, s.label)
                , React.createElement('div', { style: {fontSize:11,color:"rgba(235,235,245,0.5)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5453}}, s.context)
              )
              , phase==="play"&&React.createElement('div', { style: {fontSize:26,fontWeight:900,color:timeLeft<=1?"#ff375f":timeLeft<=2?"#ff9f0a":"#30d158",minWidth:36,textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5455}}, timeLeft)
              , phase==="feedback"&&React.createElement('div', { style: {fontSize:15,fontWeight:800,color:_optionalChain([answered, 'optionalAccess', _100 => _100.correct])?"#30d158":"#ff375f"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5456}}, _optionalChain([answered, 'optionalAccess', _101 => _101.correct])?"✓":"✗")
            )

            , React.createElement('div', { style: {borderRadius:12,overflow:"hidden",marginBottom:10,
              boxShadow:`0 0 0 2px ${phase==="feedback"?(_optionalChain([answered, 'optionalAccess', _102 => _102.correct])?"#30d158":"#ff375f"):"rgba(255,255,255,0.15)"}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5459}}
              , React.createElement(PitchSVG, {
                defRuck: s.defRuck,
                defenders: s.defenders,
                def9: s.def9,
                backfield: s.backfield,
                atkRuck: s.atkRuck,
                attackers: s.attackers,
                customArrows: s.customArrows,
                gaps: s.gaps,
                showArrows: phase==="play",
                showGaps: phase==="feedback",
                ruckY: s.ruckY||0.52, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5461}}
              )
            )

            , phase==="play"&&(
              React.createElement('div', { style: {height:3,background:"#2c2c2e",borderRadius:2,overflow:"hidden",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5477}}
                , React.createElement('div', { style: {height:"100%",background:timeLeft<=1?"#ff375f":timeLeft<=2?"#ff9f0a":"#30d158",width:`${(timeLeft/5)*100}%`,transition:"width 1s linear",borderRadius:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5478}})
              )
            )

            , phase==="feedback"&&(
              React.createElement('div', { style: {background:"#1c1c1e",borderRadius:10,padding:"11px 14px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5483}}
                , React.createElement('div', { style: {fontSize:11,color:"rgba(235,235,245,0.4)",marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5484}}, "Best: "
                   , React.createElement('span', { style: {color:C_MAP[_optionalChain([answered, 'optionalAccess', _103 => _103.correct_answer])]||"#c9a84c",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5485}}
                    , _optionalChain([s, 'access', _104 => _104.options, 'access', _105 => _105.find, 'call', _106 => _106(o=>o.key===_optionalChain([answered, 'optionalAccess', _107 => _107.correct_answer])), 'optionalAccess', _108 => _108.label])
                  )
                  , _optionalChain([answered, 'optionalAccess', _109 => _109.choice])===null&&React.createElement('span', { style: {color:"#ff375f",marginLeft:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5488}}, "— too slow"  )
                )
                , React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.7)",lineHeight:1.65}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5490}}, _optionalChain([answered, 'optionalAccess', _110 => _110.explanation]))
              )
            )

            /* Fixed 6-button grid — always same, always tappable */
            , (phase==="play"||phase==="feedback")&&(()=>{
              const ALL_OPTIONS = [
                {key:"boxkick",      label:"📦 Box kick"},
                {key:"run",          label:"🏃 Pick & go"},
                {key:"pass",         label:"🏉 Pass wide"},
                {key:"grubber",      label:"⚽ Grubber"},
                {key:"fiftytwo",     label:"🎯 50/22"},
                {key:"crossfield",   label:"↗️ Crossfield"},
                {key:"clear",        label:"🦵 Clear kick"},
                {key:"anotherphase", label:"♻️ Recycle"},
              ];
              return (
                React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5507}}
                  , ALL_OPTIONS.map(opt=>{
                    const isCorrect = opt.key===s.correct;
                    const isChosen = _optionalChain([answered, 'optionalAccess', _111 => _111.choice])===opt.key;
                    return (
                      React.createElement('button', { key: opt.key,
                        onClick: ()=>phase==="play"&&handleAnswer(opt.key),
                        style: {
                          padding:"10px 4px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",
                          background: phase==="feedback"
                            ? isCorrect?"rgba(48,209,88,0.25)":isChosen&&!isCorrect?"rgba(255,55,95,0.25)":"rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.05)",
                          cursor:phase==="play"?"pointer":"default",
                          textAlign:"center",
                          outline: phase==="feedback"&&isCorrect?"2px solid #30d158":phase==="feedback"&&isChosen&&!isCorrect?"2px solid #ff375f":"none",
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5512}}
                        , React.createElement('div', { style: {fontSize:16,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5523}}, opt.label.split(" ")[0])
                        , React.createElement('div', { style: {fontSize:9,fontWeight:600,color:"#fff",lineHeight:1.2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5524}}, opt.label.split(" ").slice(1).join(" "))
                      )
                    );
                  })
                )
              );
            })()

            , phase==="feedback"&&(
              React.createElement('button', { onClick: next, style: {width:"100%",marginTop:10,padding:13,borderRadius:12,border:"none",background:"#c9a84c",color:"#000",fontSize:14,fontWeight:800,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5533}}
                , round+1>=ROUNDS?"Results →":"Next →"
              )
            )
          )
        )

        , phase==="done"&&finalPB&&(
          React.createElement('div', { style: {textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5541}}
            , React.createElement('div', { style: {fontSize:36,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5542}}, "🎯")
            , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:"#fff",marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5543}}, "Done")
            , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5544}}
              , React.createElement('div', { style: {background:"#1c1c1e",borderRadius:12,padding:"16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5545}}
                , React.createElement('div', { style: {fontSize:36,fontWeight:900,letterSpacing:"-0.02em",color:score>=6?"#30d158":score>=4?"#c9a84c":"#ff375f"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5546}}, score+1)
                , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5547}}, "this run" )
              )
              , React.createElement('div', { style: {background:"#1c1c1e",borderRadius:12,padding:"16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5549}}
                , React.createElement('div', { style: {fontSize:36,fontWeight:900,letterSpacing:"-0.02em",color:"#c9a84c"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5550}}, finalPB.score)
                , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5551}}, "PB of "  , finalPB.total)
              )
            )
            , (score+1) >= finalPB.score&&score>0&&React.createElement('div', { style: {fontSize:12,color:"#30d158",fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5554}}, "🏆 New personal best!"   )
            , _optionalChain([ptsResult, 'optionalAccess', _112 => _112.awarded])>0&&React.createElement('div', { style: {fontSize:13,color:"#c9a84c",fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5555}}, "+", ptsResult.awarded, "pt added to training readiness ✓"     )
            , _optionalChain([ptsResult, 'optionalAccess', _113 => _113.hitCap])&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5556}}, "Daily game cap reached (5pts)"    )
            , _optionalChain([ptsResult, 'optionalAccess', _114 => _114.alreadyPlayed])&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5557}}, "Already earned points today"   )
            , (score+1)<ROUNDS&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5558}}, "100% accuracy needed to earn points"     )
            , React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.6)",lineHeight:1.65,marginBottom:20,background:"#1c1c1e",borderRadius:10,padding:"12px 14px",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5559}}
              , score>=6?"Strong decision making — you're reading defensive systems correctly under pressure.":score>=4?"Developing — focus on counting numbers and checking if the line is moving.":"Keep at it. The reads become automatic with repetition."
            )
            , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:13,borderRadius:12,border:"none",background:"#c9a84c",color:"#000",fontSize:14,fontWeight:800,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5562}}, "Done")
          )
        )
      )
    )
  );
}

// ── Number Tracker (fixed) ────────────────────────────────────────────────────
function NumberTrackerGame({onClose, onPointsScored=()=>{}, todayK=todayKey()}) {
   const FLASH_MS_BASE = 1600;

  // Players positioned well clear of pitch lines (avoid x=0.35, x=0.50, x=0.65)
  // and avoid y=0.50 (halfway), y=0.22 (22m)
  const SCENARIOS = [
    // ── 1 in zone ──
    {defenders:[{x:0.12,y:0.30,n:4},{x:0.26,y:0.28,n:7},{x:0.46,y:0.30,n:6},{x:0.56,y:0.28,n:9},{x:0.78,y:0.30,n:11}],            zone:"right",  answer:1, question:"Defenders on the RIGHT?"},
    {defenders:[{x:0.14,y:0.28,n:8},{x:0.50,y:0.30,n:6},{x:0.70,y:0.28,n:12},{x:0.82,y:0.30,n:11}],                                  zone:"left",   answer:1, question:"Defenders on the LEFT?"},
    {defenders:[{x:0.12,y:0.30,n:4},{x:0.27,y:0.28,n:7},{x:0.50,y:0.30,n:9},{x:0.70,y:0.28,n:12},{x:0.86,y:0.30,n:3}],             zone:"centre", answer:1, question:"Defenders in the CENTRE?"},
    {defenders:[{x:0.14,y:0.28,n:2},{x:0.27,y:0.30,n:7},{x:0.43,y:0.28,n:4},{x:0.56,y:0.30,n:8},{x:0.80,y:0.28,n:11}],             zone:"right",  answer:1, question:"Defenders on the RIGHT?"},
    {defenders:[{x:0.20,y:0.30,n:8},{x:0.43,y:0.28,n:7},{x:0.70,y:0.30,n:4},{x:0.84,y:0.28,n:6}],                                    zone:"left",   answer:1, question:"Defenders on the LEFT?"},
    // ── 2 in zone ──
    {defenders:[{x:0.11,y:0.28,n:8},{x:0.22,y:0.30,n:7},{x:0.50,y:0.28,n:6},{x:0.74,y:0.30,n:12}],                                   zone:"left",   answer:2, question:"Defenders on the LEFT?"},
    {defenders:[{x:0.11,y:0.30,n:4},{x:0.25,y:0.28,n:7},{x:0.41,y:0.30,n:6},{x:0.57,y:0.28,n:12},{x:0.80,y:0.30,n:11},{x:0.90,y:0.28,n:3}], zone:"centre", answer:2, question:"Defenders in the CENTRE?"},
    {defenders:[{x:0.11,y:0.28,n:8},{x:0.25,y:0.30,n:7},{x:0.43,y:0.28,n:4},{x:0.70,y:0.30,n:6},{x:0.82,y:0.28,n:12}],             zone:"right",  answer:2, question:"Defenders on the RIGHT?"},
    {defenders:[{x:0.12,y:0.30,n:4},{x:0.27,y:0.28,n:7},{x:0.41,y:0.30,n:6},{x:0.58,y:0.28,n:12},{x:0.80,y:0.30,n:11}],            zone:"centre", answer:2, question:"Defenders in the CENTRE?"},
    {defenders:[{x:0.11,y:0.28,n:2},{x:0.22,y:0.30,n:6},{x:0.50,y:0.28,n:7},{x:0.72,y:0.30,n:4},{x:0.86,y:0.28,n:11}],             zone:"left",   answer:2, question:"Defenders on the LEFT?"},
    {defenders:[{x:0.12,y:0.30,n:4},{x:0.25,y:0.28,n:7},{x:0.45,y:0.30,n:8},{x:0.70,y:0.28,n:6},{x:0.82,y:0.30,n:12}],             zone:"right",  answer:2, question:"Defenders on the RIGHT?"},
    {defenders:[{x:0.14,y:0.28,n:8},{x:0.26,y:0.30,n:3},{x:0.40,y:0.28,n:7},{x:0.56,y:0.30,n:4},{x:0.72,y:0.28,n:6},{x:0.88,y:0.30,n:12}], zone:"centre", answer:2, question:"Defenders in the CENTRE?"},
    // ── 3 in zone ──
    {defenders:[{x:0.11,y:0.28,n:4},{x:0.21,y:0.30,n:7},{x:0.31,y:0.28,n:8},{x:0.70,y:0.30,n:6},{x:0.83,y:0.28,n:12},{x:0.92,y:0.30,n:11}], zone:"left",  answer:3, question:"Defenders on the LEFT?"},
    {defenders:[{x:0.14,y:0.30,n:2},{x:0.26,y:0.28,n:3},{x:0.68,y:0.30,n:7},{x:0.76,y:0.28,n:4},{x:0.86,y:0.30,n:11}],            zone:"right",  answer:3, question:"Defenders on the RIGHT?"},
    {defenders:[{x:0.12,y:0.28,n:8},{x:0.20,y:0.30,n:3},{x:0.41,y:0.28,n:7},{x:0.50,y:0.30,n:4},{x:0.59,y:0.28,n:6},{x:0.76,y:0.30,n:12}], zone:"centre", answer:3, question:"Defenders in the CENTRE?"},
    {defenders:[{x:0.14,y:0.30,n:4},{x:0.26,y:0.28,n:7},{x:0.44,y:0.30,n:2},{x:0.68,y:0.28,n:6},{x:0.78,y:0.30,n:12},{x:0.88,y:0.28,n:8}], zone:"right",  answer:3, question:"Defenders on the RIGHT?"},
    {defenders:[{x:0.11,y:0.28,n:11},{x:0.22,y:0.30,n:7},{x:0.32,y:0.28,n:6},{x:0.68,y:0.30,n:4},{x:0.80,y:0.28,n:3},{x:0.90,y:0.30,n:8}], zone:"left",  answer:3, question:"Defenders on the LEFT?"},
    {defenders:[{x:0.13,y:0.30,n:4},{x:0.27,y:0.28,n:7},{x:0.40,y:0.30,n:6},{x:0.52,y:0.28,n:2},{x:0.60,y:0.30,n:12}],            zone:"centre", answer:3, question:"Defenders in the CENTRE?"},
    // ── 4 in zone ──
    {defenders:[{x:0.10,y:0.28,n:4},{x:0.18,y:0.30,n:7},{x:0.26,y:0.28,n:8},{x:0.30,y:0.30,n:2},{x:0.76,y:0.28,n:6},{x:0.88,y:0.30,n:12}], zone:"left",  answer:4, question:"Defenders on the LEFT?"},
    {defenders:[{x:0.14,y:0.30,n:2},{x:0.26,y:0.28,n:3},{x:0.68,y:0.30,n:7},{x:0.75,y:0.28,n:9},{x:0.82,y:0.30,n:6},{x:0.89,y:0.28,n:11}], zone:"right", answer:4, question:"Defenders on the RIGHT?"},
    {defenders:[{x:0.12,y:0.28,n:8},{x:0.22,y:0.30,n:3},{x:0.40,y:0.28,n:7},{x:0.48,y:0.30,n:4},{x:0.56,y:0.28,n:6},{x:0.60,y:0.30,n:9}], zone:"centre", answer:4, question:"Defenders in the CENTRE?"},
    {defenders:[{x:0.11,y:0.30,n:4},{x:0.18,y:0.28,n:7},{x:0.25,y:0.30,n:11},{x:0.32,y:0.28,n:2},{x:0.74,y:0.30,n:6},{x:0.86,y:0.28,n:12}], zone:"left", answer:4, question:"Defenders on the LEFT?"},
    {defenders:[{x:0.14,y:0.28,n:8},{x:0.26,y:0.30,n:3},{x:0.68,y:0.28,n:5},{x:0.75,y:0.30,n:7},{x:0.82,y:0.28,n:4},{x:0.89,y:0.30,n:11}], zone:"right", answer:4, question:"Defenders on the RIGHT?"},
    {defenders:[{x:0.13,y:0.30,n:2},{x:0.22,y:0.28,n:6},{x:0.39,y:0.30,n:7},{x:0.47,y:0.28,n:4},{x:0.55,y:0.30,n:9},{x:0.60,y:0.28,n:8}], zone:"centre", answer:4, question:"Defenders in the CENTRE?"},
  ];
  const ROUNDS = 10;

  const pb = loadPB("numtrack");
  // Flash time only decreases with perfect streaks — wrong answers don't increase it beyond base
  const perfectStreak = _optionalChain([pb, 'optionalAccess', _115 => _115.perfectStreak]) || 0;
  const flashMs = Math.max(400, FLASH_MS_BASE - (perfectStreak * 200));

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [results, setResults] = useState([]);
  const [flashProgress, setFlashProgress] = useState(0);
  const [finalPB, setFinalPB] = useState(null);
  const [ptsResult, setPtsResult] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const shuffled = useRef([...SCENARIOS].sort(()=>Math.random()-0.5));
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(()=>()=>{clearTimeout(timerRef.current);clearInterval(intervalRef.current);},[]);

  function startCountdown() {
    setPhase("countdown"); setCountdown(3);
    timerRef.current = setTimeout(()=>{ setCountdown(2);
      timerRef.current = setTimeout(()=>{ setCountdown(1);
        timerRef.current = setTimeout(()=>startRound(), 1000);
      }, 1000);
    }, 1000);
  }

  function startRound() {
    setFlashProgress(0); setPhase("flash");
    intervalRef.current = setInterval(()=>setFlashProgress(p=>p+100/(flashMs/100)), 100);
    timerRef.current = setTimeout(()=>{ clearInterval(intervalRef.current); setPhase("answer"); }, flashMs);
  }

  function handleAnswer(n) {
    if (phase!=="answer") return;
    const s = shuffled.current[round];
    const correct = n === s.answer;
    const isLast = round+1 >= ROUNDS;
    const newResults = [...results, {correct, chosen:n, answer:s.answer}];
    const newScore = newResults.filter(r=>r.correct).length;
    setResults(newResults);
    setPhase("feedback_quick");
    if (isLast) {
      const accuracy = Math.round(newScore/ROUNDS*100);
      const perfect = newScore === ROUNDS;
      timerRef.current = setTimeout(()=>{
        const prevPB = loadPB("numtrack");
        const newPerfectStreak = perfect ? (_optionalChain([prevPB, 'optionalAccess', _116 => _116.perfectStreak])||0) + 1 : (_optionalChain([prevPB, 'optionalAccess', _117 => _117.perfectStreak])||0);
        // PB = minimum flash time at which 100% was achieved
        const bestFlashMs = perfect
          ? (_optionalChain([prevPB, 'optionalAccess', _118 => _118.bestFlashMs]) ? Math.min(prevPB.bestFlashMs, flashMs) : flashMs)
          : (_optionalChain([prevPB, 'optionalAccess', _119 => _119.bestFlashMs]) || null);
        const newPB = savePB("numtrack",{
          accuracy, score:newScore, total:ROUNDS,
          perfectStreak: newPerfectStreak,
          bestFlashMs,
        });
        if (perfect) {
          const ptsRes = saveGamePoints("numtrack", onPointsScored, todayK);
          setPtsResult(ptsRes);
        }
        setFinalPB(newPB);
        setPhase("done");
      }, 900);
    } else {
      timerRef.current = setTimeout(()=>{ setRound(r=>r+1); startRound(); }, 900);
    }
  }

  const score = results.filter(r=>r.correct).length;
  const s = shuffled.current[round];
  const W=340,H=240,PL=20,PR=20,PT=16,PB=16,PW=W-PL-PR,PH=H-PT-PB;
  const cx=x=>PL+x*PW, cy=y=>PT+y*PH;

  // Zone boundaries — used for highlighting and for determining which players are in zone
  const ZONES = { left:[0,0.36], centre:[0.36,0.64], right:[0.64,1] };

  function PitchWithNumbers({showNumbers}) {
    const zone = _optionalChain([s, 'optionalAccess', _120 => _120.zone]);
    const zBounds = ZONES[zone]||[0,0];
    return (
      React.createElement('svg', { width: "100%", viewBox: `0 0 ${W} ${H}`, style: {display:"block"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5689}}
        , React.createElement('rect', { x: PL, y: PT, width: PW, height: PH, fill: "#2d5a1b", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5690}})
        , [0,1,2,3,4].map(i=>React.createElement('rect', { key: i, x: PL, y: PT+i*(PH/5), width: PW, height: PH/5, fill: i%2===0?"#2d5a1b":"#325f1e", opacity: "0.8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5691}}))
        , React.createElement('rect', { x: PL, y: PT, width: PW, height: PH, fill: "none", stroke: "white", strokeWidth: "2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5692}})
        , React.createElement('line', { x1: PL, y1: cy(0.5), x2: PL+PW, y2: cy(0.5), stroke: "white", strokeWidth: "1", opacity: "0.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5693}})
        , React.createElement('line', { x1: PL, y1: cy(0.22), x2: PL+PW, y2: cy(0.22), stroke: "white", strokeWidth: "0.8", strokeDasharray: "5,4", opacity: "0.3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5694}})

        /* zone dividers */
        , React.createElement('line', { x1: cx(0.36), y1: PT, x2: cx(0.36), y2: PT+PH, stroke: "white", strokeWidth: "0.8", strokeDasharray: "3,5", opacity: "0.3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5697}})
        , React.createElement('line', { x1: cx(0.64), y1: PT, x2: cx(0.64), y2: PT+PH, stroke: "white", strokeWidth: "0.8", strokeDasharray: "3,5", opacity: "0.3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5698}})

        /* zone highlight during answer */
        , !showNumbers && zone && (
          React.createElement('rect', { x: cx(zBounds[0]), y: PT, width: (zBounds[1]-zBounds[0])*PW, height: PH,
            fill: "#c9a84c", opacity: "0.12", stroke: "#c9a84c", strokeWidth: "1.5", strokeDasharray: "5,3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5702}})
        )

        /* ruck */
        , React.createElement('rect', { x: cx(0.5)-14, y: cy(0.52)-8, width: 28, height: 16, rx: 4, fill: "#c9a84c33", stroke: "#c9a84c", strokeWidth: "1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5707}})
        , React.createElement('text', { x: cx(0.5), y: cy(0.52)+4, textAnchor: "middle", fontSize: "7", fill: "#c9a84c", fontWeight: "800", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5708}}, "RUCK")

        , showNumbers && _optionalChain([s, 'optionalAccess', _121 => _121.defenders, 'access', _122 => _122.map, 'call', _123 => _123((d,i)=>(
          React.createElement('g', { key: i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5711}}
            , React.createElement('circle', { cx: cx(d.x), cy: cy(d.y), r: 13, fill: "#c41e3a", stroke: "#ff6b6b", strokeWidth: "1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5712}})
            , React.createElement('text', { x: cx(d.x), y: cy(d.y)+5, textAnchor: "middle", fontSize: "11", fill: "white", fontWeight: "900", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5713}}, d.n)
          )
        ))])

        /* #9 */
        , React.createElement('circle', { cx: cx(0.5), cy: cy(0.63), r: 12, fill: "#c9a84c", stroke: "#f0d060", strokeWidth: "2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5718}})
        , React.createElement('text', { x: cx(0.5), y: cy(0.63)+4, textAnchor: "middle", fontSize: "9", fill: "#000", fontWeight: "800", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5719}}, "#9")

        , React.createElement('text', { x: cx(0.18), y: PT+PH-6, textAnchor: "middle", fontSize: "8", fill: "white", opacity: "0.3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5721}}, "LEFT")
        , React.createElement('text', { x: cx(0.5),  y: PT+PH-6, textAnchor: "middle", fontSize: "8", fill: "white", opacity: "0.3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5722}}, "CENTRE")
        , React.createElement('text', { x: cx(0.82), y: PT+PH-6, textAnchor: "middle", fontSize: "8", fill: "white", opacity: "0.3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5723}}, "RIGHT")
      )
    );
  }

  return (
    React.createElement('div', { style: {position:"fixed",inset:0,background:"#000",zIndex:300,display:"flex",flexDirection:"column",overflow:"hidden",WebkitOverflowScrolling:"touch"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5729}}
      , React.createElement('div', { style: {maxWidth:420,margin:"0 auto",width:"100%",padding:"12px 16px",display:"flex",flexDirection:"column",height:"100%",overflowY:"auto",boxSizing:"border-box"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5730}}

        , phase==="intro"&&(
          React.createElement(React.Fragment, null
            , React.createElement('div', { style: {textAlign:"center",marginBottom:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5734}}
              , React.createElement('div', { style: {fontSize:36,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5735}}, "🔢")
              , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:"#fff",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5736}}, "Number tracker" )
              , React.createElement('div', { style: {fontSize:13,color:"rgba(235,235,245,0.6)",lineHeight:1.65,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5737}}, "Defenders flash with jersey numbers for "
                      , (flashMs/1000).toFixed(1), "s. They disappear. Count how many were in the highlighted zone."
                , pb&&pb.accuracy>=80&&React.createElement('span', { style: {color:"#30d158"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5739}}, " Your accuracy is high — flash time shortened."        )
              )
              , pb&&React.createElement('div', { style: {background:"#1c1c1e",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5741}}
                , React.createElement('span', { style: {fontSize:12,color:"rgba(235,235,245,0.4)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5742}}, "Personal best" )
                , React.createElement('span', { style: {fontSize:12,fontWeight:700,color:"#c9a84c"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5743}}, pb.accuracy, "% accuracy" )
              )
            )
            , React.createElement('button', { onClick: startCountdown, style: {width:"100%",padding:14,borderRadius:12,border:"none",background:"#c9a84c",color:"#000",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5746}}, "Start →" )
            , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:10,borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(235,235,245,0.4)",fontSize:13,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5747}}, "Cancel")
          )
        )

        , phase==="countdown"&&(
          React.createElement('div', { style: {textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5752}}
            , React.createElement('div', { style: {fontSize:120,fontWeight:900,color:"#c9a84c",lineHeight:1,letterSpacing:"-0.04em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5753}}, countdown)
            , React.createElement('div', { style: {fontSize:14,color:"rgba(235,235,245,0.4)",marginTop:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5754}}, "Get ready..." )
          )
        )

        , (phase==="flash"||phase==="answer"||phase==="feedback_quick")&&s&&(
          React.createElement(React.Fragment, null
            , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5760}}
              , React.createElement('div', { style: {fontSize:10,color:"rgba(235,235,245,0.3)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5761}}, round+1, " / "  , ROUNDS)
              , phase==="flash"&&React.createElement('div', { style: {fontSize:11,fontWeight:700,color:"#c9a84c"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5762}}, "SCAN")
              , phase==="answer"&&React.createElement('div', { style: {fontSize:12,fontWeight:700,color:"#ff9f0a"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5763}}, s.question)
              , phase==="feedback_quick"&&(()=>{
                const last = results[results.length-1];
                return React.createElement('div', { style: {fontSize:13,fontWeight:800,color:_optionalChain([last, 'optionalAccess', _124 => _124.correct])?"#30d158":"#ff375f"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5766}}
                  , _optionalChain([last, 'optionalAccess', _125 => _125.correct]) ? "✓ Correct" : `✗ Was ${_optionalChain([last, 'optionalAccess', _126 => _126.answer])}`
                );
              })()
            )
            , phase==="flash"&&(
              React.createElement('div', { style: {height:3,background:"#2c2c2e",borderRadius:2,overflow:"hidden",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5772}}
                , React.createElement('div', { style: {height:"100%",background:"#c9a84c",width:`${Math.min(flashProgress,100)}%`,transition:"width 0.1s linear",borderRadius:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5773}})
              )
            )
            , React.createElement('div', { style: {borderRadius:12,overflow:"hidden",marginBottom:12,
              boxShadow:`0 0 0 2px ${phase==="flash"?"#c9a84c":phase==="feedback_quick"?(_optionalChain([results, 'access', _127 => _127[results.length-1], 'optionalAccess', _128 => _128.correct])?"#30d158":"#ff375f"):"#ff9f0a"}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5776}}
              , React.createElement(PitchWithNumbers, { showNumbers: phase==="flash", __self: this, __source: {fileName: _jsxFileName, lineNumber: 5778}})
            )
            , phase==="answer"&&(
              React.createElement('div', { style: {display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5781}}
                , [0,1,2,3,4].map(n=>(
                  React.createElement('button', { key: n, onClick: ()=>handleAnswer(n), style: {
                    padding:"18px 0",borderRadius:12,border:"2px solid rgba(255,255,255,0.12)",
                    background:"#1c1c1e",color:"#fff",fontSize:22,fontWeight:800,cursor:"pointer",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5783}}, n)
                ))
              )
            )
            , phase==="feedback_quick"&&(()=>{
              const last = results[results.length-1];
              return (
                React.createElement('div', { style: {display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5793}}
                  , [0,1,2,3,4].map(n=>{
                    const isCorrect = n===_optionalChain([last, 'optionalAccess', _129 => _129.answer]);
                    const isChosen = n===_optionalChain([last, 'optionalAccess', _130 => _130.chosen]);
                    return (
                      React.createElement('div', { key: n, style: {
                        padding:"18px 0",borderRadius:12,textAlign:"center",
                        background:isCorrect?"#30d15822":isChosen&&!isCorrect?"#ff375f22":"#1c1c1e",
                        border:`2px solid ${isCorrect?"#30d158":isChosen&&!isCorrect?"#ff375f":"rgba(255,255,255,0.08)"}`,
                        color:isCorrect?"#30d158":isChosen&&!isCorrect?"#ff375f":"rgba(255,255,255,0.2)",
                        fontSize:22,fontWeight:800,
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5798}}, n)
                    );
                  })
                )
              );
            })()
          )
        )

        , phase==="done"&&finalPB&&(
          React.createElement('div', { style: {textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5814}}
            , React.createElement('div', { style: {fontSize:36,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5815}}, "🔢")
            , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:"#fff",marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5816}}, "Done")
            , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5817}}
              , React.createElement('div', { style: {background:"#1c1c1e",borderRadius:12,padding:"16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5818}}
                , React.createElement('div', { style: {fontSize:36,fontWeight:900,color:score>=ROUNDS?"#30d158":score>=Math.floor(ROUNDS*0.75)?"#c9a84c":"#ff375f"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5819}}, score, "/", ROUNDS)
                , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5820}}, "this run · "   , (flashMs/1000).toFixed(1), "s flash" )
              )
              , React.createElement('div', { style: {background:"#1c1c1e",borderRadius:12,padding:"16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5822}}
                , finalPB.bestFlashMs ? (
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { style: {fontSize:28,fontWeight:900,color:"#c9a84c"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5825}}, (finalPB.bestFlashMs/1000).toFixed(1), React.createElement('span', { style: {fontSize:12,color:"rgba(255,255,255,0.4)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5825}}, "s"))
                    , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5826}}, "best at 100%"  )
                  )
                ) : (
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { style: {fontSize:28,fontWeight:900,color:"rgba(255,255,255,0.3)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5830}}, "—")
                    , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5831}}, "get 100% to set PB"    )
                  )
                )
              )
            )
            , score===ROUNDS&&flashMs<=finalPB.bestFlashMs&&React.createElement('div', { style: {fontSize:12,color:"#30d158",fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5836}}, "🏆 New best time at 100%!"     )
            , _optionalChain([ptsResult, 'optionalAccess', _131 => _131.awarded])>0&&React.createElement('div', { style: {fontSize:13,color:"#c9a84c",fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5837}}, "+", ptsResult.awarded, "pt added to training readiness ✓"     )
            , _optionalChain([ptsResult, 'optionalAccess', _132 => _132.hitCap])&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5838}}, "Daily game cap reached (5pts)"    )
            , _optionalChain([ptsResult, 'optionalAccess', _133 => _133.alreadyPlayed])&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5839}}, "Already earned points today"   )
            , score===ROUNDS&&React.createElement('div', { style: {fontSize:12,color:"#30d158",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5840}}, "Perfect! Flash time drops next game → "       , Math.max(100,flashMs-200)/1000, "s")
            , score<ROUNDS&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5841}}, "100% accuracy needed to earn points"     )
            , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:13,borderRadius:12,border:"none",background:"#c9a84c",color:"#000",fontSize:14,fontWeight:800,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5842}}, "Done")
          )
        )
      )
    )
  );
}


// ── Ruck Scan ──────────────────────────────────────────────────────────────────
// 2 defenders on each side of the ruck. Each has a body cue (looking at you,
// looking away, stepping in, stepping out). Read the cues and decide: attack
// the left, attack the right, or pick and go.
// This trains the jackal/breakdown read that #9 makes in under 0.5 seconds.
function CognitivePrimeGame({onClose, onPointsScored=()=>{}, todayK=todayKey()}) {
  const NBACK_ROUNDS = 12; // answerable rounds (after the first N)
  const N = 2;
  const LETTERS = ["A","B","C","D","E","F","G","H"];
  const SHOW_MS = 1500;  // letter visible
  const BLANK_MS = 400;  // gap between letters

  const [phase, setPhase] = useState("intro");
  const [seq, setSeq] = useState([]);          // full letter sequence
  const [seqIdx, setSeqIdx] = useState(-1);    // current position shown (-1 = blank)
  const [answered, setAnswered] = useState({}); // {idx: true/false} user answers
  const [feedback, setFeedback] = useState(null);
  const [intentionText, setIntentionText] = useState("");
  const [ptsResult, setPtsResult] = useState(null);
  const timerRef = useRef(null);
  const seqRef = useRef([]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (phase === "done" && ptsResult === null) {
      const res = saveGamePoints("cogprime", onPointsScored, todayK);
      setPtsResult(res);
    }
  }, [phase]);

  function buildSeq() {
    const s = [];
    for (let i = 0; i < NBACK_ROUNDS + N; i++) {
      if (i >= N && Math.random() < 0.3) {
        s.push(s[i - N]); // match
      } else {
        let l;
        do { l = LETTERS[Math.floor(Math.random()*LETTERS.length)]; }
        while (i >= N && l === s[i - N]);
        s.push(l);
      }
    }
    return s;
  }

  function startNBack() {
    const s = buildSeq();
    seqRef.current = s;
    setSeq(s);
    setAnswered({});
    setFeedback(null);
    setPhase("nback");
    showAt(s, 0);
  }

  function showAt(s, idx) {
    if (idx >= s.length) {
      setSeqIdx(-1);
      setPhase("intentions");
      return;
    }
    setSeqIdx(idx);
    timerRef.current = setTimeout(() => {
      setSeqIdx(-1);
      timerRef.current = setTimeout(() => showAt(s, idx + 1), BLANK_MS);
    }, SHOW_MS);
  }

  function answer(isMatch) {
    const idx = seqIdx;
    if (idx < N || phase !== "nback") return; // can't answer yet or wrong phase
    if (answered[idx] !== undefined) return;   // already answered this position
    const actual = seqRef.current[idx] === seqRef.current[idx - N];
    const correct = isMatch === actual;
    setAnswered(a => ({...a, [idx]: isMatch}));
    setFeedback({correct, idx});
    setTimeout(() => setFeedback(f => _optionalChain([f, 'optionalAccess', _134 => _134.idx])===idx ? null : f), 500);
  }

  const answerableCount = seq.length - N;
  const answeredCount = Object.keys(answered).length;
  const correctCount = Object.entries(answered).filter(([idx, v]) => {
    const i = parseInt(idx);
    return (v === (seqRef.current[i] === seqRef.current[i - N]));
  }).length;
  const pct = answeredCount > 0 ? Math.round(correctCount/answeredCount*100) : 0;
  const currentLetter = seqIdx >= 0 ? seq[seqIdx] : null;
  const canAnswer = seqIdx >= N && phase === "nback" && answered[seqIdx] === undefined;

  return (
    React.createElement('div', { style: {position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 16px",overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5942}}

      , phase==="intro"&&(
        React.createElement('div', { style: {textAlign:"center",maxWidth:340}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5945}}
          , React.createElement('div', { style: {fontSize:40,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5946}}, "🧩")
          , React.createElement('div', { style: {fontSize:20,fontWeight:800,color:T1,marginBottom:8,letterSpacing:"-0.02em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5947}}, "Cognitive Prime" )
          , React.createElement('div', { style: {fontSize:12,color:T2,lineHeight:1.7,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5948}}, "4-minute pre-training protocol. Research shows brief cognitive activation before exercise improves decision-making speed in the first 15 minutes on the pitch."

          )
          , React.createElement('div', { style: {background:S2,borderRadius:12,padding:"12px 14px",marginBottom:20,textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5951}}
            , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:PRP,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5952}}, "HOW IT WORKS"  )
            , React.createElement('div', { style: {fontSize:12,color:T2,lineHeight:1.8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5953}}
              , React.createElement('b', { style: {color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5954}}, "Step 1 — 2-back:"   ), " A letter flashes. Tap ✓ if it matches the letter from 2 steps ago. Tap ✗ if not."                  , "\n\n"
              , React.createElement('b', { style: {color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5955}}, "Step 2 — Intent:"   ), " Write one specific if-then plan for today."
            )
          )
          , React.createElement('button', { onClick: startNBack, style: {width:"100%",padding:14,borderRadius:12,border:"none",background:PRP,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5958}}, "Start →" )
          , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:10,borderRadius:12,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:13,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5959}}, "Cancel")
        )
      )

      , phase==="nback"&&(
        React.createElement('div', { style: {textAlign:"center",width:"100%",maxWidth:320}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5964}}
          , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5965}}, "Step 1 — 2-back memory · "      , answeredCount, "/", Math.max(0, Math.min(answeredCount+1, answerableCount)))
          , React.createElement('div', { style: {fontSize:11,color:PRP,fontWeight:700,marginBottom:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5966}}, "Match the letter from 2 steps ago?"      )

          /* letter display */
          , React.createElement('div', { style: {height:140,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5969}}
            , currentLetter
              ? React.createElement('div', { style: {fontSize:100,fontWeight:900,color:PRP,lineHeight:1,letterSpacing:"-0.03em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5971}}, currentLetter)
              : React.createElement('div', { style: {width:60,height:60,borderRadius:"50%",background:S2,margin:"0 auto"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5972}})
          )

          /* feedback flash */
          , React.createElement('div', { style: {height:20,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5976}}
            , feedback&&React.createElement('div', { style: {fontSize:14,fontWeight:700,color:feedback.correct?GRNA:REDA}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5977}}
              , feedback.correct?"✓ correct":"✗ wrong"
            )
          )

          /* answer buttons */
          , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5983}}
            , React.createElement('button', { onClick: ()=>answer(true), style: {
              padding:"20px 0",borderRadius:14,fontSize:24,fontWeight:800,cursor:"pointer",
              border:`2px solid ${canAnswer?GRNA+"66":"rgba(255,255,255,0.08)"}`,
              background:canAnswer?GRNA+"18":"rgba(255,255,255,0.03)",
              color:canAnswer?GRNA:T3,
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5984}}, "✓ YES" )
            , React.createElement('button', { onClick: ()=>answer(false), style: {
              padding:"20px 0",borderRadius:14,fontSize:24,fontWeight:800,cursor:"pointer",
              border:`2px solid ${canAnswer?REDA+"66":"rgba(255,255,255,0.08)"}`,
              background:canAnswer?REDA+"18":"rgba(255,255,255,0.03)",
              color:canAnswer?REDA:T3,
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5990}}, "✗ NO" )
          )
          , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 5997}}, "Buttons light up when a letter appears and you can answer"

          )
        )
      )

      , phase==="intentions"&&(
        React.createElement('div', { style: {textAlign:"center",width:"100%",maxWidth:340}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6004}}
          , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6005}}, "Step 2 — Implementation intention"    )
          , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:T1,marginBottom:8,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6006}}, "Write your if-then plan"   )
          , React.createElement('div', { style: {fontSize:12,color:T2,lineHeight:1.65,marginBottom:16,textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6007}}, "Writing a specific plan primes the brain to execute automatically under pressure."
                       , "\n"
            , React.createElement('span', { style: {color:PRP,fontStyle:"italic"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6009}}, "\"If I receive at the ruck, then I scan right first.\""          )
          )
          , React.createElement('textarea', { value: intentionText, onChange: e=>setIntentionText(e.target.value),
            placeholder: "If ____________,\nthen I will ____________.",
            style: {width:"100%",minHeight:100,background:S2,border:`1px solid ${PRP}44`,borderRadius:10,
              padding:"12px 14px",color:T1,fontSize:15,lineHeight:1.7,resize:"none",outline:"none",
              boxSizing:"border-box",fontFamily:"inherit",marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6011}})
          , React.createElement('button', { onClick: ()=>{if(intentionText.trim()) setPhase("done");},
            disabled: !intentionText.trim(),
            style: {width:"100%",padding:13,borderRadius:12,border:"none",
              background:intentionText.trim()?PRP:"rgba(191,90,242,0.3)",
              color:"#fff",fontSize:14,fontWeight:800,cursor:intentionText.trim()?"pointer":"default"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6016}}, "Done — I'm primed ✓"

          )
        )
      )

      , phase==="done"&&(
        React.createElement('div', { style: {textAlign:"center",maxWidth:340}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6027}}
          , React.createElement('div', { style: {fontSize:48,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6028}}, "🧠")
          , React.createElement('div', { style: {fontSize:20,fontWeight:800,color:T1,marginBottom:8,letterSpacing:"-0.02em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6029}}, "Brain primed" )
          , React.createElement('div', { style: {fontSize:12,color:T2,lineHeight:1.65,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6030}}, "Prefrontal cortex activated. You have a ~15-minute window of enhanced decision speed. Get on the pitch."

          )
          , React.createElement('div', { style: {background:S2,borderRadius:12,padding:"12px 14px",marginBottom:16,textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6033}}
            , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6034}}, "YOUR PLAN" )
            , React.createElement('div', { style: {fontSize:13,color:PRP,lineHeight:1.6,fontStyle:"italic"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6035}}, intentionText)
          )
          , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6037}}
            , React.createElement('div', { style: {background:S2,borderRadius:10,padding:"10px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6038}}
              , React.createElement('div', { style: {fontSize:9,color:T3,marginBottom:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6039}}, "2-BACK ACCURACY" )
              , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:pct>=70?GRNA:pct>=50?GOLD:REDA,letterSpacing:"-0.02em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6040}}, pct, "%")
            )
            , React.createElement('div', { style: {background:S2,borderRadius:10,padding:"10px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6042}}
              , React.createElement('div', { style: {fontSize:9,color:T3,marginBottom:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6043}}, "POINTS")
              , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:GOLD,letterSpacing:"-0.02em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6044}}
                , _optionalChain([ptsResult, 'optionalAccess', _135 => _135.awarded])>0?`+${ptsResult.awarded}`:_optionalChain([ptsResult, 'optionalAccess', _136 => _136.alreadyPlayed])?"done":"…"
              )
            )
          )
          , _optionalChain([ptsResult, 'optionalAccess', _137 => _137.awarded])>0&&React.createElement('div', { style: {fontSize:12,color:GOLD,fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6049}}, "+", ptsResult.awarded, "pt added to training readiness ✓"     )
          , _optionalChain([ptsResult, 'optionalAccess', _138 => _138.alreadyPlayed])&&React.createElement('div', { style: {fontSize:12,color:T3,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6050}}, "Already earned points today"   )
          , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:13,borderRadius:12,border:"none",background:PRP,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6051}}, "Go train 🏉"  )
        )
      )
    )
  );
}

function RuckScanGame({onClose, onPointsScored=()=>{}, todayK=todayKey()}) {
  // Cues each defender can show
  // "in" = stepping toward ruck (committed, can't make tackle)
  // "out" = stepping away (backing off, there's space)
  // "watch" = watching you, ready to react
  // "away" = looking at the ball, not tracking you
  // Cue system — simplified:
  // shoulders: "in" = facing you/ruck (covering), "out" = facing away (not covering)
  // eyes: "you" = watching you | "ten" = watching 10/backline | "ruck" = watching ball
  // Pick ONLY when a defender has eyes off you AND shoulders out, or is out of position
  // Default = pass
  const SCENARIOS = [
    // 1. Both sides watching you — pass
    {
      left:  [{shoulders:"in",eyes:"you"}, {shoulders:"in",eyes:"you"}],
      right: [{shoulders:"in",eyes:"you"}, {shoulders:"in",eyes:"you"}],
      correct:"pass",
      explanation:"All four defenders watching you, shoulders in — set for the pick. Pass to 10. Your backs have space.",
    },
    // 2. Left: both watching 10 — pick left
    {
      left:  [{shoulders:"out",eyes:"ten"}, {shoulders:"out",eyes:"ten"}],
      right: [{shoulders:"in",eyes:"you"},  {shoulders:"in",eyes:"you"}],
      correct:"left",
      explanation:"Both left defenders watching 10, shoulders out — they're set for the pass. Pick left, they can't react.",
    },
    // 3. Right: both watching 10 — pick right
    {
      left:  [{shoulders:"in",eyes:"you"},   {shoulders:"in",eyes:"you"}],
      right: [{shoulders:"out",eyes:"ten"},  {shoulders:"out",eyes:"ten"}],
      correct:"right",
      explanation:"Both right defenders watching 10, shoulders out — pick right. They're expecting pass, not a pick.",
    },
    // 4. Left inner watching 10, left outer watching you — pass (one still covers)
    {
      left:  [{shoulders:"out",eyes:"ten"}, {shoulders:"in",eyes:"you"}],
      right: [{shoulders:"in",eyes:"you"},  {shoulders:"in",eyes:"you"}],
      correct:"pass",
      explanation:"Left inner watching 10 but left outer is watching you — still covered. Right side set. Pass.",
    },
    // 5. Right inner watching 10, right outer watching you — pass
    {
      left:  [{shoulders:"in",eyes:"you"},  {shoulders:"in",eyes:"you"}],
      right: [{shoulders:"out",eyes:"ten"}, {shoulders:"in",eyes:"you"}],
      correct:"pass",
      explanation:"Right inner watching 10 but outer is watching you. One cover is enough — pass.",
    },
    // 6. Left: inner watching 10, outer watching ruck — BOTH off you, pick left
    {
      left:  [{shoulders:"out",eyes:"ten"}, {shoulders:"out",eyes:"ruck"}],
      right: [{shoulders:"in",eyes:"you"},  {shoulders:"in",eyes:"you"}],
      correct:"left",
      explanation:"Left inner on 10, left outer on ball — neither tracking you. Both shoulders out. Pick left immediately.",
    },
    // 7. Right: inner watching 10, outer watching ruck — pick right
    {
      left:  [{shoulders:"in",eyes:"you"},   {shoulders:"in",eyes:"you"}],
      right: [{shoulders:"out",eyes:"ten"},  {shoulders:"out",eyes:"ruck"}],
      correct:"right",
      explanation:"Right inner watching 10, outer watching ball — nobody tracking you on the right. Pick right.",
    },
    // 8. Left: both watching ruck — pick left
    {
      left:  [{shoulders:"out",eyes:"ruck"}, {shoulders:"out",eyes:"ruck"}],
      right: [{shoulders:"in",eyes:"you"},   {shoulders:"in",eyes:"you"}],
      correct:"left",
      explanation:"Left side both watching ball, shoulders out — not tracking you at all. Pick left, maximum surprise.",
    },
    // 9. Right: one out of position, one watching 10 — pick right
    {
      left:  [{shoulders:"in",eyes:"you"},   {shoulders:"in",eyes:"you"}],
      right: [{shoulders:"out",eyes:"ten"},  {shoulders:"out",eyes:"ten"}],
      correct:"right",
      explanation:"Both right defenders on 10 and shoulders out — they've both given up the pick channel. Go right.",
    },
    // 10. Both sides mixed — left inner on 10, but left outer watching you, right set — pass
    {
      left:  [{shoulders:"out",eyes:"ten"},  {shoulders:"in",eyes:"you"}],
      right: [{shoulders:"out",eyes:"ten"},  {shoulders:"in",eyes:"you"}],
      correct:"pass",
      explanation:"Both sides have one defender on 10 but one watching you. You're covered both sides. Pass to 10.",
    },
    // 11. Left: inner on you, outer watching ruck with shoulders out — pick left
    {
      left:  [{shoulders:"in",eyes:"you"},   {shoulders:"out",eyes:"ruck"}],
      right: [{shoulders:"in",eyes:"you"},   {shoulders:"in",eyes:"you"}],
      correct:"pass",
      explanation:"Left outer is distracted but left inner has you covered — they'll make the tackle. Right set. Pass.",
    },
    // 12. Right: both on 10, left: both on you — pick right
    {
      left:  [{shoulders:"in",eyes:"you"},   {shoulders:"in",eyes:"you"}],
      right: [{shoulders:"out",eyes:"ten"},  {shoulders:"out",eyes:"ten"}],
      correct:"right",
      explanation:"Right side both watching 10 with shoulders out. Left side has you. Pick right into the unguarded channel.",
    },
    // 13. Mixed: left inner in+you, left outer out+10 — one still covers, pass
    {
      left:  [{shoulders:"in",  eyes:"you"}, {shoulders:"out", eyes:"ten"}],
      right: [{shoulders:"in",  eyes:"you"}, {shoulders:"in",  eyes:"you"}],
      correct:"pass",
      explanation:"Left inner has you covered despite outer watching 10. Right set. One defender tracking you is enough — pass.",
    },
    // 14. Right inner out+10, right outer in+you — still covered, pass
    {
      left:  [{shoulders:"in",  eyes:"you"}, {shoulders:"in",  eyes:"you"}],
      right: [{shoulders:"out", eyes:"ten"}, {shoulders:"in",  eyes:"you"}],
      correct:"pass",
      explanation:"Right inner watching 10 but outer has shoulders in watching you — still covered. Left set. Pass.",
    },
    // 15. Left: inner out+10, outer out+ruck — both off you, pick left
    {
      left:  [{shoulders:"out", eyes:"ten"}, {shoulders:"out", eyes:"ruck"}],
      right: [{shoulders:"in",  eyes:"you"}, {shoulders:"out", eyes:"ten"}],
      correct:"left",
      explanation:"Left: both defenders off you — inner on 10, outer on ball. Right inner has you. Pick left where nobody is tracking you.",
    },
    // 16. Right: inner in+10, outer out+ruck — inner has wrong priority, pick right
    {
      left:  [{shoulders:"in",  eyes:"you"}, {shoulders:"in",  eyes:"you"}],
      right: [{shoulders:"in",  eyes:"ten"}, {shoulders:"out", eyes:"ruck"}],
      correct:"right",
      explanation:"Right inner: shoulders in but watching 10 — thinking pass not pick. Outer: out and watching ball. Pick right before inner refocuses.",
    },
    // 17. Left: inner out+10, outer in+you. Right: both out — pick right
    {
      left:  [{shoulders:"out", eyes:"ten"}, {shoulders:"in",  eyes:"you"}],
      right: [{shoulders:"out", eyes:"ten"}, {shoulders:"out", eyes:"ruck"}],
      correct:"right",
      explanation:"Right: both defenders off you — one on 10, one on ball, both shoulders out. Left outer is watching you. Pick right.",
    },
    // 18. Both sides: inner in+you, outer out+ten — covered both sides, pass
    {
      left:  [{shoulders:"in",  eyes:"you"}, {shoulders:"out", eyes:"ten"}],
      right: [{shoulders:"in",  eyes:"you"}, {shoulders:"out", eyes:"ten"}],
      correct:"pass",
      explanation:"Both sides identical — inner watching you on each side. Even with outers on 10, you're covered both sides. Pass to 10.",
    },
  ];
  const CUE_COLORS = {
    in:    "#ff375f", // red — committed/dangerous
    watch: "#ff9f0a", // amber — alert
    away:  "#30d158", // green — distracted = opportunity
    out:   "#30d158", // green — stepping out = space
  };
  const CUE_ICONS = {
    in:    "→",  // arrow toward ruck
    watch: "👁",  // eye
    away:  "↩",  // looking away
    out:   "←",  // stepping away
  };

  const pb = loadPB("ruckscan");
  const perfectStreak = _optionalChain([pb, 'optionalAccess', _139 => _139.perfectStreak]) || 0;
  const wrongStreak = _optionalChain([pb, 'optionalAccess', _140 => _140.wrongStreak]) || 0;
  // Flash time — how long cues are shown before hidden
  const FLASH_MS_BASE = 2000;
  const flashMs = Math.max(400, FLASH_MS_BASE - perfectStreak * 150);

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro|flash|decide|feedback|done
  const [results, setResults] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [flashProgress, setFlashProgress] = useState(0);
  const [finalPB, setFinalPB] = useState(null);
  const [ptsResult, setPtsResult] = useState(null);
  const shuffled = useRef([...SCENARIOS].sort(()=>Math.random()-0.5).slice(0,10));
  const ROUNDS = shuffled.current.length;
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(()=>()=>{clearTimeout(timerRef.current);clearInterval(intervalRef.current);},[]);

  function startRound() {
    setChosen(null); setFlashProgress(0); setPhase("flash");
    intervalRef.current = setInterval(()=>setFlashProgress(p=>p+100/(flashMs/80)),80);
    timerRef.current = setTimeout(()=>{ clearInterval(intervalRef.current); setPhase("decide"); }, flashMs);
  }

  function handleAnswer(choice) {
    if (phase!=="decide") return;
    const s = shuffled.current[round];
    // correct can be a string or array of valid answers
    const correct = Array.isArray(s.correct)
      ? s.correct.includes(choice)
      : choice === s.correct;
    setChosen(choice);
    const newResults = [...results, {correct, chosen:choice}];
    setResults(newResults);
    const isLast = round+1 >= ROUNDS;
    setPhase("feedback");
    if (isLast) {
      const score = newResults.filter(r=>r.correct).length;
      const perf = score === ROUNDS;
      timerRef.current = setTimeout(()=>{
        const prev = loadPB("ruckscan");
        const newPerfect = perf ? (_optionalChain([prev, 'optionalAccess', _141 => _141.perfectStreak])||0)+1 : (_optionalChain([prev, 'optionalAccess', _142 => _142.perfectStreak])||0);
        const bestFlashMs = perf ? (_optionalChain([prev, 'optionalAccess', _143 => _143.bestFlashMs]) ? Math.min(prev.bestFlashMs,flashMs) : flashMs) : _optionalChain([prev, 'optionalAccess', _144 => _144.bestFlashMs])||null;
        const newPB = savePB("ruckscan",{score,total:ROUNDS,perfectStreak:newPerfect,bestFlashMs});
        if (perf) {
          const ptsRes = saveGamePoints("ruckscan", onPointsScored, todayK);
          setPtsResult(ptsRes);
        }
        setFinalPB(newPB);
        setPhase("done");
      }, 1000);
    }
  }

  function next() {
    setRound(r=>r+1); startRound();
  }

  const s = shuffled.current[round];
  const score = results.filter(r=>r.correct).length;

  // SVG ruck scan pitch — close-up view of the ruck area
  function RuckView({showCues}) {
    const W=340, H=240;
    const ruckCX = W/2, ruckCY = H/2 - 10;
    const nineCY = H - 32;

    // Draw one defender square
    // cue: "in" = turned toward ruck (rotated toward centre), "out" = turned away
    // "watch" = watching you (eye shown), "away" = not watching (no eye)
    // Position: side "left" or "right", index 0=closer to ruck, 1=further out
    function Defender({px, py, d, side, sc}) {
      if (!sc) {
        return (
          React.createElement('g', { transform: `translate(${px},${py})`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6287}}
            , React.createElement('rect', { x: -8, y: 2, width: 16, height: 24, rx: 4,
              fill: "#b91c3a", stroke: "#ff4060", strokeWidth: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6288}})
            , React.createElement('circle', { cx: 0, cy: -8, r: 9, fill: "#b91c3a", stroke: "#ff4060", strokeWidth: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6290}})
          )
        );
      }
      // All players upright. Shoulder orientation = small tilt of the body only.
      // "in" = body angled slightly toward ruck (±15°)
      // "out" = body angled away from ruck (±40°)
      // Head stays upright always — only body tilts
      const tiltDir = side === "left" ? -1 : 1;
      const bodyAngle = d.shoulders === "out" ? tiltDir * 40 : tiltDir * 15;
      return (
        React.createElement('g', { transform: `translate(${px},${py})`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6301}}
          /* body tilts to show shoulder orientation */
          , React.createElement('rect', { x: -8, y: 2, width: 16, height: 24, rx: 4,
            fill: "#b91c3a", stroke: "#ff4060", strokeWidth: 2,
            transform: `rotate(${bodyAngle})`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6303}})
          /* head always upright */
          , React.createElement('circle', { cx: 0, cy: -8, r: 9, fill: "#b91c3a", stroke: "#ff4060", strokeWidth: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6307}})
          , d.eyes==="you"  && React.createElement('text', { x: 0, y: -4, textAnchor: "middle", fontSize: "12", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6308}}, "👁")
          , d.eyes==="ten"  && React.createElement('text', { x: 0, y: -4, textAnchor: "middle", fontSize: "9", fill: "white", fontWeight: "800", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6309}}, "10")
          , d.eyes==="ruck" && React.createElement('text', { x: 0, y: -4, textAnchor: "middle", fontSize: "10", fill: "rgba(255,255,255,0.6)", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6310}}, "◉")
        )
      );
    }


    return (
      React.createElement('svg', { width: "100%", viewBox: `0 0 ${W} ${H}`, style: {display:"block"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6317}}
        /* grass */
        , React.createElement('rect', { width: W, height: H, fill: "#2a5216", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6319}})
        , [0,1,2,3].map(i=>React.createElement('rect', { key: i, x: 0, y: i*(H/4), width: W, height: H/4, fill: i%2===0?"#2a5216":"#2f5c1a", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6320}}))

        /* ruck */
        , React.createElement('rect', { x: ruckCX-36, y: ruckCY-18, width: 72, height: 36, rx: 8,
          fill: "#c9a84c44", stroke: "#c9a84c", strokeWidth: "2.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6323}})
        , React.createElement('text', { x: ruckCX, y: ruckCY+6, textAnchor: "middle", fontSize: "10", fill: "#c9a84c", fontWeight: "900", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6325}}, "RUCK")

        /* #9 */
        , React.createElement('circle', { cx: ruckCX, cy: nineCY, r: 17, fill: "#c9a84c", stroke: "#f0d060", strokeWidth: "2.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6328}})
        , React.createElement('text', { x: ruckCX, y: nineCY+6, textAnchor: "middle", fontSize: "11", fill: "#000", fontWeight: "900", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6329}}, "#9")

        /* LEFT side — 2 defenders: closer at x=110, further at x=60 */
        , _optionalChain([s, 'optionalAccess', _145 => _145.left, 'access', _146 => _146.map, 'call', _147 => _147((d,i)=>{
          const px = 110 - i*52;
          const py = ruckCY + 10 + i*10;
          return React.createElement(Defender, { key: "L"+i, px: px, py: py, d: d, side: "left", sc: showCues, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6335}});
        })])

        /* RIGHT side — 2 defenders: closer at x=230, further at x=280 */
        , _optionalChain([s, 'optionalAccess', _148 => _148.right, 'access', _149 => _149.map, 'call', _150 => _150((d,i)=>{
          const px = 230 + i*52;
          const py = ruckCY + 10 + i*10;
          return React.createElement(Defender, { key: "R"+i, px: px, py: py, d: d, side: "right", sc: showCues, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6342}});
        })])

        /* side labels */
        , React.createElement('text', { x: 85,   y: H-8, textAnchor: "middle", fontSize: "9", fill: "rgba(255,255,255,0.45)", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6346}}, "← LEFT" )
        , React.createElement('text', { x: W-85, y: H-8, textAnchor: "middle", fontSize: "9", fill: "rgba(255,255,255,0.45)", fontWeight: "700", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6347}}, "RIGHT →" )

        /* legend when showing cues */
        , showCues&&(
          React.createElement(React.Fragment, null
            , React.createElement('rect', { x: 8, y: 8, width: 10, height: 10, rx: 2, fill: "#c41e3a", stroke: "#ff4060", strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6352}})
            , React.createElement('text', { x: 22, y: 18, fontSize: "8", fill: "rgba(255,255,255,0.5)", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6353}}, "threat")
            , React.createElement('rect', { x: 70, y: 8, width: 10, height: 10, rx: 2, fill: "#2d6a2d", stroke: "#30d158", strokeWidth: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6354}})
            , React.createElement('text', { x: 84, y: 18, fontSize: "8", fill: "rgba(255,255,255,0.5)", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6355}}, "opportunity")
          )
        )
      )
    );
  }

  return (
    React.createElement('div', { style: {position:"fixed",inset:0,background:"#000",zIndex:300,display:"flex",flexDirection:"column",overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6363}}
      , React.createElement('div', { style: {maxWidth:420,margin:"0 auto",width:"100%",padding:"12px 16px",display:"flex",flexDirection:"column",height:"100%",overflowY:"auto",boxSizing:"border-box"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6364}}

        , phase==="intro"&&(
          React.createElement(React.Fragment, null
            , React.createElement('div', { style: {textAlign:"center",marginBottom:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6368}}
              , React.createElement('div', { style: {fontSize:36,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6369}}, "👀")
              , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:"#fff",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6370}}, "Ruck scan" )
              , React.createElement('div', { style: {fontSize:13,color:"rgba(235,235,245,0.6)",lineHeight:1.65,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6371}}, "2 defenders on each side of the ruck flash their body cues for "
                             , (flashMs/1000).toFixed(1), "s. Read them and decide: attack left, attack right, or pick and go."
              )
              , React.createElement('div', { style: {marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6374}}
                , React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.6)",marginBottom:10,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6375}}, "Body facing you = covering. Body sideways = turned away. Eye shows where they're looking."

                )
                , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6378}}
                  , [
                    {bodyAngle:15,  eye:"👁",  desc:"Turned in, watching you — covered"},
                    {bodyAngle:40,  eye:"10",  desc:"Turned out, watching 10 — pick"},
                    {bodyAngle:15,  eye:"10",  desc:"Turned in, watching 10 — still covered"},
                    {bodyAngle:-40, eye:"◉",   desc:"Turned out, watching ball — pick"},
                  ].map((item,i)=>(
                    React.createElement('div', { key: i, style: {background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"8px 10px",display:"flex",alignItems:"center",gap:10,border:"1px solid rgba(255,255,255,0.08)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6385}}
                      , React.createElement('svg', { width: "36", height: "44", viewBox: "-18 -20 36 44"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 6386}}
                        , React.createElement('rect', { x: -7, y: 2, width: 14, height: 20, rx: 3,
                          fill: "#b91c3a", stroke: "#ff4060", strokeWidth: "1.5",
                          transform: `rotate(${item.bodyAngle})`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6387}})
                        , React.createElement('circle', { cx: 0, cy: -8, r: 8, fill: "#b91c3a", stroke: "#ff4060", strokeWidth: "1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6390}})
                        , React.createElement('text', { x: 0, y: -4, textAnchor: "middle", fontSize: item.eye==="👁"?"11":"8", fill: "white", fontWeight: "800", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6391}}, item.eye)
                      )
                      , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.5)",lineHeight:1.4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6393}}, item.desc)
                    )
                  ))
                )
              )
              , _optionalChain([pb, 'optionalAccess', _151 => _151.bestFlashMs])&&React.createElement('div', { style: {background:"#1c1c1e",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6398}}
                , React.createElement('span', { style: {fontSize:12,color:"rgba(235,235,245,0.4)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6399}}, "Best at 100%"  )
                , React.createElement('span', { style: {fontSize:12,fontWeight:700,color:"#c9a84c"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6400}}, (pb.bestFlashMs/1000).toFixed(1), "s flash" )
              )
            )
            , React.createElement('button', { onClick: startRound, style: {width:"100%",padding:14,borderRadius:12,border:"none",background:"#c9a84c",color:"#000",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6403}}, "Start →" )
            , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:10,borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(235,235,245,0.4)",fontSize:13,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6404}}, "Cancel")
          )
        )

        , (phase==="flash"||phase==="decide"||phase==="feedback")&&s&&(
          React.createElement(React.Fragment, null
            , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6410}}
              , React.createElement('div', { style: {fontSize:10,color:"rgba(235,235,245,0.3)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6411}}, round+1, " / "  , ROUNDS)
              , phase==="flash"&&React.createElement('div', { style: {fontSize:11,fontWeight:700,color:"#c9a84c"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6412}}, "READ THE CUES"  )
              , phase==="decide"&&React.createElement('div', { style: {fontSize:11,fontWeight:700,color:"#ff9f0a"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6413}}, "ATTACK WHERE?" )
              , phase==="feedback"&&React.createElement('div', { style: {fontSize:14,fontWeight:800,color:_optionalChain([results, 'access', _152 => _152[results.length-1], 'optionalAccess', _153 => _153.correct])?"#30d158":"#ff375f"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6414}}, _optionalChain([results, 'access', _154 => _154[results.length-1], 'optionalAccess', _155 => _155.correct])?"✓ Correct":"✗ Wrong")
            )

            , phase==="flash"&&(
              React.createElement('div', { style: {height:3,background:"#2c2c2e",borderRadius:2,overflow:"hidden",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6418}}
                , React.createElement('div', { style: {height:"100%",background:"#c9a84c",width:`${Math.min(flashProgress,100)}%`,transition:"width 0.08s linear",borderRadius:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6419}})
              )
            )

            , React.createElement('div', { style: {borderRadius:12,overflow:"hidden",marginBottom:12,
              boxShadow:`0 0 0 2px ${phase==="feedback"?(_optionalChain([results, 'access', _156 => _156[results.length-1], 'optionalAccess', _157 => _157.correct])?"#30d158":"#ff375f"):phase==="flash"?"#c9a84c":"#ff9f0a"}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6423}}
              , React.createElement(RuckView, { showCues: phase==="flash"||phase==="feedback", __self: this, __source: {fileName: _jsxFileName, lineNumber: 6425}})
            )

            , phase==="feedback"&&(
              React.createElement('div', { style: {background:"#1c1c1e",borderRadius:10,padding:"11px 14px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6429}}
                , React.createElement('div', { style: {fontSize:11,color:"rgba(235,235,245,0.4)",marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6430}}, "Best: "
                   , React.createElement('span', { style: {color:"#c9a84c",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6431}}
                    , Array.isArray(s.correct)
                      ? s.correct.map(c=>c==="left"?"← Pick left":c==="right"?"→ Pick right":"🏉 Pass").join(" or ")
                      : s.correct==="left"?"← Pick left":s.correct==="right"?"→ Pick right":"🏉 Pass"
                    
                  )
                )
                , React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.7)",lineHeight:1.65}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6438}}, s.explanation)
              )
            )

            , phase==="decide"&&(
              React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6443}}
                , [
                  {key:"left",  label:"← Pick left",  color:"#0a84ff"},
                  {key:"pass",  label:"🏉 Pass",       color:"#30d158"},
                  {key:"right", label:"→ Pick right",  color:"#c9a84c"},
                ].map(o=>(
                  React.createElement('button', { key: o.key, onClick: ()=>handleAnswer(o.key), style: {
                    padding:"18px 0",borderRadius:14,border:`2px solid ${o.color}44`,
                    background:o.color+"18",color:o.color,fontSize:12,fontWeight:700,cursor:"pointer",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6449}}, o.label)
                ))
              )
            )

            , phase==="feedback"&&round+1<ROUNDS&&(
              React.createElement('button', { onClick: next, style: {width:"100%",marginTop:8,padding:13,borderRadius:12,border:"none",background:"#c9a84c",color:"#000",fontSize:14,fontWeight:800,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6458}}, "Next →"

              )
            )
            , phase==="feedback"&&round+1>=ROUNDS&&(
              React.createElement('div', { style: {padding:12,textAlign:"center",color:"rgba(235,235,245,0.4)",fontSize:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6463}}, "Calculating results..." )
            )
          )
        )

        , phase==="done"&&finalPB&&(
          React.createElement('div', { style: {textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6469}}
            , React.createElement('div', { style: {fontSize:36,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6470}}, "👀")
            , React.createElement('div', { style: {fontSize:22,fontWeight:800,color:"#fff",marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6471}}, "Done")
            , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6472}}
              , React.createElement('div', { style: {background:"#1c1c1e",borderRadius:12,padding:"16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6473}}
                , React.createElement('div', { style: {fontSize:36,fontWeight:900,color:score>=ROUNDS?"#30d158":score>=(ROUNDS*0.7)?"#c9a84c":"#ff375f"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6474}}, score, "/", ROUNDS)
                , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6475}}, "this run · "   , (flashMs/1000).toFixed(1), "s")
              )
              , React.createElement('div', { style: {background:"#1c1c1e",borderRadius:12,padding:"16px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6477}}
                , finalPB.bestFlashMs ? (
                  React.createElement(React.Fragment, null, React.createElement('div', { style: {fontSize:28,fontWeight:900,color:"#c9a84c"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6479}}, (finalPB.bestFlashMs/1000).toFixed(1), React.createElement('span', { style: {fontSize:12,color:"rgba(255,255,255,0.4)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6479}}, "s"))
                  , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6480}}, "best at 100%"  ))
                ) : (
                  React.createElement(React.Fragment, null, React.createElement('div', { style: {fontSize:24,fontWeight:900,color:"rgba(255,255,255,0.3)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6482}}, "—")
                  , React.createElement('div', { style: {fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6483}}, "get 100% to set PB"    ))
                )
              )
            )
            , score===ROUNDS&&React.createElement('div', { style: {fontSize:12,color:"#30d158",fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6487}}, "🏆 Perfect! Flash time → "     , Math.max(100,flashMs-150)/1000, "s next game"  )
            , _optionalChain([ptsResult, 'optionalAccess', _158 => _158.awarded])>0&&React.createElement('div', { style: {fontSize:13,color:"#c9a84c",fontWeight:700,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6488}}, "+", ptsResult.awarded, "pt added to training readiness ✓"     )
            , _optionalChain([ptsResult, 'optionalAccess', _159 => _159.hitCap])&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6489}}, "Daily game cap reached (5pts)"    )
            , _optionalChain([ptsResult, 'optionalAccess', _160 => _160.alreadyPlayed])&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6490}}, "Already earned points today"   )
            , score<ROUNDS&&React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.4)",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6491}}, "100% accuracy needed to earn points"     )
            , React.createElement('div', { style: {fontSize:12,color:"rgba(235,235,245,0.6)",lineHeight:1.65,marginBottom:20,background:"#1c1c1e",borderRadius:10,padding:"12px 14px",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6492}}
              , score>=ROUNDS?"Elite read speed — you're processing ruck cues before the ball is out.":score>=(ROUNDS*0.7)?"Good. Focus on the 'stepping in' cue first — committed defenders can't tackle.":"Keep at it. The key read: green = opportunity, red = committed, amber = watching."
            )
            , React.createElement('button', { onClick: onClose, style: {width:"100%",padding:13,borderRadius:12,border:"none",background:"#c9a84c",color:"#000",fontSize:14,fontWeight:800,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6495}}, "Done")
          )
        )
      )
    )
  );
}


function readDoneEntries(dateStr) {
  try {
    const rec = JSON.parse(store.get("rwc_done_"+dateStr)||"{}");
    return Object.entries(rec)
      .filter(([k]) => k.startsWith("__retro__") && !k.endsWith("trained__"))
      .map(([k, val]) => ({ key: k, sk: k.split("__")[2], mins: _optionalChain([val, 'optionalAccess', _161 => _161.mins])||0, note: _optionalChain([val, 'optionalAccess', _162 => _162.note])||"", rating: _optionalChain([val, 'optionalAccess', _163 => _163.rating])||0 }));
  } catch (e50) { return []; }
}
function readSuppRec(dateStr) {
  try { return JSON.parse(store.get("rwc_supps_"+dateStr)||"{}"); } catch (e51) { return {}; }
}

function PastDayView({ viewingDate, viewCi, settings }) {
  const [entries, setEntries] = useState(() => readDoneEntries(viewingDate));
  const [suppRec, setSuppRec] = useState(() => readSuppRec(viewingDate));
  const [picking, setPicking] = useState(false);
  const [selSk, setSelSk] = useState(null);
  const [retroNote, setRetroNote] = useState("");
  const [retroRating, setRetroRating] = useState(0);
  const [suppOpen, setSuppOpen] = useState(false);

  const reload = () => {
    setEntries(readDoneEntries(viewingDate));
    setSuppRec(readSuppRec(viewingDate));
  };

  const allSupps = [...SUPPLEMENT_SCHEDULE, ...(settings.customSupplements||[])].filter(s => s.have !== false);
  const takenCount = allSupps.filter(s => !!suppRec[s.name]).length;

  return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 6534}}
      /* header */
      , React.createElement('div', { style: {background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6536}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 6537}}
          , React.createElement('div', { style: {fontSize:12,color:GOLD,fontWeight:700,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6538}}
            , new Date(viewingDate+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})
          )
          , React.createElement('div', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6541}}, (_optionalChain([viewCi, 'optionalAccess', _164 => _164.timeMins])||0) + entries.reduce((s,e)=>s+e.mins,0), " min · "   , _optionalChain([viewCi, 'optionalAccess', _165 => _165.space])||"—")
        )
        , React.createElement('button', { onClick: reload, style: {fontSize:11,color:T3,background:S3,border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6543}}, "↻ Refresh" )
      )

      /* logged entries */
      , React.createElement('div', { style: {marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6547}}
        , entries.map(e => {
          const s = SKILLS[e.sk];
          return (
            React.createElement('div', { key: e.key, style: {background:S1,border:"1px solid rgba(255,255,255,0.08)",borderLeft:"3px solid "+(_optionalChain([s, 'optionalAccess', _166 => _166.color])||GRNA),borderRadius:12,padding:"11px 14px",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6551}}
              , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6552}}
              , React.createElement('span', { style: {fontSize:18}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6553}}, _optionalChain([s, 'optionalAccess', _167 => _167.icon])||"🏉")
              , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6554}}
                , React.createElement('div', { style: {fontSize:13,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6555}}, _optionalChain([s, 'optionalAccess', _168 => _168.name])||e.sk, e.rating?React.createElement('span', { style: {marginLeft:6,fontSize:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6555}}, [,"😴","💪","🔥","⚡"][e.rating]||""):null)
                , React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6556}}, e.mins, " min" )
              )
              , React.createElement('button', { onClick: () => {
                const rec = JSON.parse(store.get("rwc_done_"+viewingDate)||"{}");
                delete rec[e.key];
                if (!Object.keys(rec).some(k => k.startsWith("__retro__") && !k.endsWith("trained__"))) delete rec["__retro_trained__"];
                store.set("rwc_done_"+viewingDate, JSON.stringify(rec));
                reload();
              }, style: {fontSize:13,color:REDA,background:"transparent",border:"none",cursor:"pointer",padding:"2px 8px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6558}}, "✕")
            )
            , e.note ? React.createElement('div', { style: {fontSize:11,color:T2,marginTop:6,paddingLeft:28,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6566}}, e.note) : null
            )
          );
        })

        /* add button / picker */
        , !picking ? (
          React.createElement('button', { onClick: () => { setPicking(true); setSelSk(null); }, style: {width:"100%",padding:"12px",borderRadius:12,border:"1px dashed rgba(255,255,255,0.08)",background:"transparent",color:T3,fontSize:13,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6573}}, "+ Log an activity"

          )
        ) : (
          React.createElement('div', { style: {background:S1,border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6577}}
            , React.createElement('div', { style: {fontSize:11,color:T3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6578}}, "What did you do?"   )
            , Object.keys(SKILLS).map(sk => {
              const s = SKILLS[sk];
              const sel = selSk === sk;
              return (
                React.createElement('div', { key: sk, style: {marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6583}}
                  , React.createElement('div', { onClick: () => { setSelSk(sel ? null : sk); setRetroNote(""); setRetroRating(0); }, style: {width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:"1.5px solid "+(sel?(_optionalChain([s, 'optionalAccess', _169 => _169.color])||GRNA):"rgba(255,255,255,0.08)"),background:sel?(_optionalChain([s, 'optionalAccess', _170 => _170.color])||GRNA)+"22":"transparent",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6584}}
                    , React.createElement('span', { style: {fontSize:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6585}}, _optionalChain([s, 'optionalAccess', _171 => _171.icon])||"🏉")
                    , React.createElement('span', { style: {fontSize:13,fontWeight:sel?700:400,color:sel?(_optionalChain([s, 'optionalAccess', _172 => _172.color])||GRNA):T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6586}}, _optionalChain([s, 'optionalAccess', _173 => _173.name])||sk)
                  )
                  , sel && (
                    React.createElement('div', { style: {padding:"12px 4px 4px",display:"flex",flexDirection:"column",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6589}}
                      /* Duration */
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 6591}}
                        , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6592}}, "How long?" )
                        , React.createElement('div', { style: {display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6593}}
                          , [15,20,30,45,60,90].map(m => (
                            React.createElement('button', { key: m, onClick: () => {
                              const mins = m;
                              // Save note/rating to reflections store if provided
                              if (retroNote.trim() || retroRating) {
                                try {
                                  const existing = JSON.parse(store.get("rwc_reflections")||"[]");
                                  const entry = {
                                    id: Date.now().toString(36)+"rtr",
                                    date: viewingDate,
                                    skillKey: sk,
                                    skillName: (_optionalChain([SKILLS, 'access', _174 => _174[sk], 'optionalAccess', _175 => _175.name])||sk) + ` [${mins} min]`,
                                    text: retroNote.trim(),
                                    rating: retroRating||0,
                                    extra: "retro",
                                  };
                                  store.set("rwc_reflections", JSON.stringify([entry, ...existing]));
                                } catch (e52) {}
                              }
                              const retroKey = "__retro__"+sk+"__"+Date.now().toString(36);
                              const rec = JSON.parse(store.get("rwc_done_"+viewingDate)||"{}");
                              rec[retroKey] = { mins, ts: Date.now(), note: retroNote.trim(), rating: retroRating||0 };
                              rec["__retro_trained__"] = true;
                              store.set("rwc_done_"+viewingDate, JSON.stringify(rec));
                              setPicking(false);
                              setSelSk(null);
                              setRetroNote("");
                              setRetroRating(0);
                              reload();
                            }, style: {padding:"7px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:S2,color:T1,fontSize:12,fontWeight:600,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6595}}, m, "m")
                          ))
                        )
                      )
                      /* Rating */
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 6628}}
                        , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6629}}, "Rating (optional)" )
                        , React.createElement('div', { style: {display:"flex",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6630}}
                          , [{e:"😴",v:1,label:"Bad"},{e:"💪",v:2,label:"Avg"},{e:"🔥",v:3,label:"Good"},{e:"⚡",v:4,label:"Elite"}].map(({e,v,label})=>(
                            React.createElement('button', { key: v, onClick: ()=>setRetroRating(retroRating===v?0:v),
                              style: {display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 8px",borderRadius:9,
                                border:`1px solid ${retroRating===v?(_optionalChain([s, 'optionalAccess', _176 => _176.color])||GRNA):"rgba(255,255,255,0.08)"}`,
                                background:retroRating===v?"rgba(255,255,255,0.06)":"transparent",
                                cursor:"pointer",flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6632}}
                              , React.createElement('span', { style: {fontSize:18}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6637}}, e)
                              , React.createElement('span', { style: {fontSize:9,color:retroRating===v?T1:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6638}}, label)
                            )
                          ))
                        )
                      )
                      /* Note */
                      , React.createElement('textarea', { value: retroNote, onChange: e=>setRetroNote(e.target.value),
                        placeholder: "Notes (optional)" ,
                        style: {width:"100%",minHeight:56,padding:"8px 10px",borderRadius:9,border:"1px solid rgba(255,255,255,0.08)",
                          background:S2,color:T1,fontSize:12,lineHeight:1.5,resize:"none",outline:"none",
                          boxSizing:"border-box",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6644}})
                    )
                  )
                )
              );
            })
            , React.createElement('button', { onClick: () => { setPicking(false); setSelSk(null); }, style: {fontSize:11,color:T3,background:"transparent",border:"none",cursor:"pointer",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6654}}, "Cancel")
          )
        )
      )

      /* supplements */
      , allSupps.length > 0 && (
        React.createElement('div', { style: {borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6661}}
          , React.createElement('button', { onClick: () => setSuppOpen(o => !o), style: {width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 15px",background:S2,border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6662}}
            , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6663}}
              , React.createElement('span', { style: {fontSize:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6664}}, "💊")
              , React.createElement('span', { style: {fontSize:12,fontWeight:600,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6665}}, "Supplements")
              , React.createElement('span', { style: {fontSize:11,color:takenCount===allSupps.length?GRNA:takenCount>0?AMB:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6666}}, takenCount, "/", allSupps.length, " taken" )
            )
            , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6668}}, suppOpen?"▲":"▼")
          )
          , suppOpen && (
            React.createElement('div', { style: {background:S1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:6,borderTop:"1px solid rgba(255,255,255,0.08)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6671}}
              , allSupps.map(s => {
                const taken = !!suppRec[s.name];
                return (
                  React.createElement('button', { key: s.name, onClick: () => {
                    const updated = {...suppRec, [s.name]: taken ? null : new Date(viewingDate+"T12:00:00").toISOString()};
                    const clean = Object.fromEntries(Object.entries(updated).filter(([,val]) => val));
                    store.set("rwc_supps_"+viewingDate, JSON.stringify(clean));
                    setSuppRec(clean);
                  }, style: {display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,border:"1px solid "+(taken?GRNA:"rgba(255,255,255,0.08)"),background:taken?GRNA+"18":"transparent",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6675}}
                    , React.createElement('span', { style: {fontSize:16,width:22,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6681}}, taken?"✅":"⬜")
                    , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6682}}
                      , React.createElement('div', { style: {fontSize:12,fontWeight:600,color:taken?GRNA:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6683}}, s.name)
                      , s.timing && React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6684}}, s.timing)
                    )
                  )
                );
              })
            )
          )
        )
      )
    )
  );
}

function AppInner() { // v3.1
  const days   = daysUntil(RWC_DATE);
  const phase  = getPhase(days);
  // "today" = the day the check-in was saved, not necessarily the current calendar date.
  // This means finishing a session at 1am still counts for yesterday.
  // We look for the most recent check-in — if it was within the last 20 hours, use that date.
  const todayK = (() => {
    const now = new Date();
    const calendar = todayKey(); // current calendar date
    // check if there's a check-in for yesterday that's still recent (within 20h)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = localDateStr(yesterday);
    const hoursSinceMidnight = now.getHours() + now.getMinutes()/60;
    // if it's before 4am, treat as still "yesterday"
    if (hoursSinceMidnight < 4 && store.get("rwc_ci_"+yKey)) return yKey;
    return calendar;
  })();
  const dow    = new Date().getDay();

  // force dark background on the page itself
  useEffect(() => {
    document.body.style.background = BG;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  const [history,setHistory] = useState(function(){
    const h={};
    store.keys().forEach(k => {
      try { h[k.replace("rwc_ci_","")] = JSON.parse(store.get(k)); } catch (e53) {}
    });
    return h;
  });

  const ci         = history[todayK]||null;
  const microHint  = microcycleLoadHint(dow);
  const notes      = ci?parseNotes(ci.notes):{};
  const freeTimeMins = _nullishCoalesce(_optionalChain([ci, 'optionalAccess', _177 => _177.timeMins]), () => ( 30));
  const space      = _nullishCoalesce(_optionalChain([ci, 'optionalAccess', _178 => _178.space]), () => ( "both"));
  const noField    = space==="none" || space==="home";
  const partners   = _nullishCoalesce(_optionalChain([ci, 'optionalAccess', _179 => _179.partners]), () => ( 0));
  const wNum       = ci?parseFloat(ci.weight):null;

  // Today's skill list is generated ONCE (when the check-in is saved) and then
  // frozen for the rest of the day — otherwise ticking a skill as done would
  // change its "last trained" ranking instantly and bump it out of the list
  // mid-session, which looks like a bug (items disappearing as you tick them).
  const [frozenSkills, setFrozenSkills] = useState(() => {
    try { return JSON.parse(store.get("rwc_skills_"+todayK) || "null"); } catch (e54) { return null; }
  });
  const skills = frozenSkills || [];

  // live algorithm signals — computed fresh each render (lightweight, no frozen list side effects)
  const algoMeta = (() => {
    try {
      const meta = { retrySkills: [], opponentFocus: null, opponentMandatory: false };
      // 48-hour retry
      const scores = JSON.parse(store.get("rwc_scores") || "[]");
      const twoDaysAgo = new Date(todayK+"T12:00:00");
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const cutoff = localDateStr(twoDaysAgo);
      const seen = new Set();
      scores.filter(s=>s.date>=cutoff&&s.rating<=2)
        .sort((a,b)=>b.date.localeCompare(a.date))
        .forEach(s=>{ if(!seen.has(s.skillKey)){seen.add(s.skillKey);meta.retrySkills.push(s.skillKey);} });
      // opponent rotation — weighted by proximity
      const POOL_MATCHES2 = [
        { opponent:"Ireland",  date:new Date("2027-10-04") },
        { opponent:"Uruguay",  date:new Date("2027-10-11") },
        { opponent:"Scotland", date:new Date("2027-10-17") },
      ];
      const today2 = new Date(todayK+"T12:00:00");
      const di = Math.floor(new Date(todayK+"T12:00:00").getTime()/86400000);
      const upcoming = POOL_MATCHES2.filter(m=>m.date>today2);
      if (upcoming.length>0) {
        const nearest = upcoming[0];
        const daysToNearest = Math.ceil((nearest.date-today2)/86400000);
        if (daysToNearest<=21) {
          meta.opponentFocus = nearest.opponent;
          meta.opponentMandatory = true;
        } else {
          const pool = [];
          upcoming.forEach(m=>{
            const d=Math.ceil((m.date-today2)/86400000);
            if(d<=90){pool.push(m.opponent);pool.push(m.opponent);}
            else if(d<=180){pool.push(m.opponent);}
            else if(pool.length===0){pool.push(m.opponent);}
          });
          if(pool.length>0){ meta.opponentFocus=pool[di%pool.length]; meta.opponentMandatory=false; }
        }
      }
      return meta;
    } catch (e55) { return { retrySkills:[], opponentFocus:null, opponentMandatory:false }; }
  })();

  const [viewingDate, setViewingDate] = useState(todayK);
  const [showCI,setShowCI]       = useState(()=>!store.get("rwc_ci_"+todayK));  const [tab,setTab]             = useState("today");
  const [reactionGame, setReactionGame] = useState(null);
  // always prevent iOS zoom — games use small touch targets
  useEffect(()=>{
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement('meta'); meta.name="viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
  }, []);
  const [selectedSkill,setSkill] = useState(null);
  const [selectedSkillIdx,setSkillIdx] = useState(0);
  const [showMentalTask, setShowMentalTask] = useState(false);
  const [swapReason, setSwapReason] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false); // reason picker open for which skill
  const [done, setDone] = useState(() => {
    try { return JSON.parse(store.get("rwc_done_"+todayK) || "{}"); } catch (e56) { return {}; }
  });
  const [skipped, setSkipped] = useState(() => {
    try { return JSON.parse(store.get("rwc_skipped_"+todayK) || "{}"); } catch (e57) { return {}; }
  });
  const [customDrills, setCustomDrills] = useState(() => {
    try { return JSON.parse(store.get("rwc_custom_drills") || "{}"); } catch (e58) { return {}; }
  });

  // merges built-in library drills with any user-added custom drills per category

  // reflection notes — persisted record of what was learned from study/mental sessions
  const [reflections, setReflections] = useState(() => {
    try { return JSON.parse(store.get("rwc_reflections") || "[]"); } catch (e59) { return []; }
  });

  // Journal entries stored separately — one per day, own key
  function loadJournalEntries() {
    const entries = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (_optionalChain([k, 'optionalAccess', _180 => _180.startsWith, 'call', _181 => _181("rwc_journal_")])) {
          const date = k.replace("rwc_journal_", "");
          const text = store.get(k) || "";
          if (text.trim()) entries.push({ date, text: text.trim() });
        }
      }
    } catch (e60) {}
    return entries.sort((a,b) => b.date.localeCompare(a.date));
  }
  const [journalEntries, setJournalEntries] = useState(()=>loadJournalEntries());

  function saveJournalEntry(date, text) {
    if (!text.trim()) return;
    store.set("rwc_journal_"+date, text.trim());
    setJournalEntries(loadJournalEntries());
  }
  function deleteJournalEntry(date) {
    localStorage.removeItem("rwc_journal_"+date);
    setJournalEntries(loadJournalEntries());
  }
  // skill scores — 1-5 rating per completed session, used for trend charts
  const [scores, setScores] = useState(() => {
    try { return JSON.parse(store.get("rwc_scores") || "[]"); } catch (e61) { return []; }
  });
  const [reflectPrompt, setReflectPrompt] = useState(null);
  const [notesFilter, setNotesFilter] = useState(null);
  const [notesQuery, setNotesQuery] = useState("");
  const [notesViewMode, setNotesViewMode] = useState("skills");

  // session-level stage swaps — "I want a different exercise for this stage today"
  const [addedTasks, setAddedTasks] = useState(() => {
    try { return JSON.parse(store.get("rwc_added_"+todayK)||"[]"); } catch (e62) { return []; }
  });
  const [stageSwaps, setStageSwaps] = useState(() => {
    try { return JSON.parse(store.get("rwc_swaps_"+todayK)||"{}"); } catch (e63) { return {}; }
  });

  useEffect(() => {
    try {
      const dateKey = isViewingToday ? todayK : viewingDate;
      const saved = JSON.parse(store.get("rwc_swaps_"+dateKey)||"{}");
      setStageSwaps(saved);
      const savedStages = JSON.parse(store.get("rwc_stages_"+dateKey)||"{}");
      setStagesDone(savedStages);
      const savedSkipped = JSON.parse(store.get("rwc_stages_skip_"+dateKey)||"{}");
      setStagesSkipped(savedSkipped);
    } catch (e64) {}
  }, [selectedSkill, viewingDate]);
  const [stageSwapOpen, setStageSwapOpen] = useState(null);
  const [stagesDone, setStagesDone] = useState(() => {
    try { return JSON.parse(store.get("rwc_stages_"+todayK)||"{}"); } catch (e65) { return {}; }
  });
  const [stagesSkipped, setStagesSkipped] = useState(() => {
    try { return JSON.parse(store.get("rwc_stages_skip_"+todayK)||"{}"); } catch (e66) { return {}; }
  });
  const [extraStages, setExtraStages] = useState(() => {
    try { return JSON.parse(store.get("rwc_stages_extra_"+todayK)||"{}"); } catch (e67) { return {}; }
  });
  const [extraWork, setExtraWork] = useState(() => {
    try { return JSON.parse(store.get("rwc_extra_done_"+todayK)||"[]"); } catch (e68) { return []; }
  });
  const [suppLog, setSuppLog] = useState(() => {
    try { return JSON.parse(store.get("rwc_supps_"+todayK)||"{}"); } catch (e69) { return {}; }
  });
  const [suppVersion, setSuppVersion] = useState(0);
  const [activeTimer, setActiveTimer] = useState(null);
  const [customExerciseDraft, setCustomExerciseDraft] = useState({});
  const [expandedSkills, setExpandedSkills] = useState(new Set());
  const [trackNote, setTrackNote] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackRating, setTrackRating] = useState(0);
  const [trackSaved, setTrackSaved] = useState(false);
  const [iceBathTemp, setIceBathTemp] = useState(10);
  const [iceBathTimerSecs, setIceBathTimerSecs] = useState(null);
  const [iceBathRunning, setIceBathRunning] = useState(false);
  const [iceBathRound, setIceBathRound] = useState(1);
  const [iceBathTargetRounds, setIceBathTargetRounds] = useState(1);
  const [showIceBathTimer, setShowIceBathTimer] = useState(false);
  const iceBathIntervalRef = React.useRef(null);
  const [hotBathTemp, setHotBathTemp] = useState(40);
  const [saunaTimerSecs, setSaunaTimerSecs] = useState(null);
  const [saunaRunning, setSaunaRunning] = useState(false);
  const [hotBathRound, setHotBathRound] = useState(1);
  const [hotBathTargetRounds, setHotBathTargetRounds] = useState(1);
  const [showSaunaTimer, setShowSaunaTimer] = useState(false);
  const saunaIntervalRef = React.useRef(null);
  const [saunaTemp, setSaunaTemp] = useState(80);
  const [saunaCabineTimerSecs, setSaunaCabineTimerSecs] = useState(null);
  const [saunaCabineRunning, setSaunaCabineRunning] = useState(false);
  const [saunaRound, setSaunaRound] = useState(1);
  const [saunaTargetRounds, setSaunaTargetRounds] = useState(3);
  const saunaCabineIntervalRef = React.useRef(null);
  const [emsRound, setEmsRound] = useState(1);
  const [emsTargetRounds, setEmsTargetRounds] = useState(1);
  const [contrastPhase, setContrastPhase] = useState("hot"); // "hot"|"cold"
  const [contrastCycle, setContrastCycle] = useState(1); // 1–4
  const [contrastSecs, setContrastSecs] = useState(null);
  const [contrastRunning, setContrastRunning] = useState(false);
  const [showContrastTimer, setShowContrastTimer] = useState(false);
  const contrastIntervalRef = React.useRef(null);
  const [emsTimerSecs, setEmsTimerSecs] = useState(null);
  const [emsRunning, setEmsRunning] = useState(false);
  const [showEmsTimer, setShowEmsTimer] = useState(false);
  const emsIntervalRef = React.useRef(null);
  const [expandedStages, setExpandedStages] = useState({});
  const [gameFeedbackText, setGameFeedbackText] = useState("");
  const [gameFeedbackSkills, setGameFeedbackSkills] = useState([]);
  const [gameFeedbackSaved, setGameFeedbackSaved] = useState(false);
  const [showGameFeedback, setShowGameFeedback] = useState(false);

  // permanent custom progressions saved in settings
  // settings.customProgressions = {skillKey: {stageIndex: {stage, duration, text}}}

  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(store.get("rwc_settings") || "null") || {
        weaknesses: ["shortBoxKick","longBoxKick"],
        excluded: [],
        weightMin: 83,
        weightMax: 86,
        mySupplements: ["Creatine monohydrate","Omega-3 (EPA+DHA)","Vitamin D3","Magnesium glycinate"],
      };
    } catch (e70) {
      return { weaknesses:["shortBoxKick","longBoxKick"], excluded:[], weightMin:83, weightMax:86 };
    }
  });

  // Seed known matches on first load (won't overwrite if already saved)
  useEffect(() => {
    const SEEDED_KEY = "rwc_matches_seeded_v1";
    if (store.get(SEEDED_KEY)) return;
    const seeded = [
      // 🦁 Lusitanos
      { date:"2026-09-24", opponent:"Cheetahs",     flag:"🐆", competition:"Lusitanos · Tbilisi Cup" },
      { date:"2026-09-29", opponent:"Griquas",       flag:"🏉", competition:"Lusitanos · Tbilisi Cup" },
      { date:"2026-10-04", opponent:"Pumas",         flag:"🐆", competition:"Lusitanos · Tbilisi Cup" },
      { date:"2026-10-17", opponent:"Iron Warriors", flag:"⚔️", competition:"Lusitanos · Super Cup" },
      { date:"2026-10-24", opponent:"Wolves",        flag:"🐺", competition:"Lusitanos · Super Cup" },
      { date:"2026-12-05", opponent:"Devils",        flag:"😈", competition:"Lusitanos · Super Cup" },
      // 🇵🇹 Portugal
      { date:"2026-11-07", opponent:"Chile",         flag:"🇨🇱", competition:"Portugal · Test Match" },
      { date:"2026-11-14", opponent:"Samoa",         flag:"🇼🇸", competition:"Portugal · Test Match" },
      { date:"2026-11-21", opponent:"Uruguay",       flag:"🇺🇾", competition:"Portugal · Test Match" },
    ];
    const existing = settings.customMatches||[];
    const merged = [...existing, ...seeded.filter(s=>!existing.some(e=>e.date===s.date&&e.opponent===s.opponent))];
    const updated = {...settings, customMatches: merged};
    setSettings(updated);
    store.set("rwc_settings", JSON.stringify(updated));
    store.set(SEEDED_KEY, "1");
  }, []);

  const _deletedRwc  = settings.deletedRwcMatches||[];
  const _overrides   = (settings.customMatches||[]).filter(c=>c._rwcOverride);
  const _resolvedRwc = RWC_MATCHES.filter(r=>!_deletedRwc.includes(r.opponent)).map(r=>_overrides.find(o=>o.opponent===r.opponent)||r);
  const _userMatches = (settings.customMatches||[]).filter(c=>!c._rwcOverride);
  const _allResolved = [..._resolvedRwc, ..._userMatches];
  const matchStatus  = getMatchStatus(todayK, _allResolved);

  function saveSettings(updated) {
    setSettings(updated);
    store.set("rwc_settings", JSON.stringify(updated));
    // If custom skills changed and we have a check-in today, regenerate skill list
    const prevCustomKeys = (settings.customSkills||[]).map(c=>c.key).join(",");
    const newCustomKeys  = (updated.customSkills||[]).map(c=>c.key).join(",");
    if (prevCustomKeys !== newCustomKeys && ci) {
      const newNotes = parseNotes(ci.notes||"");
      const newSkills = getTodaySkills(
        50, dow, {...newNotes, injuryZones: ci.injuryZones||[]},
        _nullishCoalesce(ci.timeMins, () => ( 30)), _nullishCoalesce(ci.space, () => ( "home")), _nullishCoalesce(ci.partners, () => ( 0)), matchStatus);
      store.set("rwc_skills_"+todayK, JSON.stringify(newSkills));
      setFrozenSkills(newSkills);
    }
  }

  // Merge custom skills into SKILLS at runtime
  (settings.customSkills||[]).forEach(cs => {
    if (!SKILLS[cs.key]) {
      SKILLS[cs.key] = {
        name: cs.name,
        icon: cs.icon || "⭐",
        color: cs.color || GOLD,
        why: cs.why || "",
        progression: (cs.stages||[]).map((st,i)=>({
          stage: st.name || `Stage ${i+1}`,
          duration: st.duration || "10 min",
          text: st.text || "",
          timer: st.timer || "",
        })),
      };
      if (!SKILLS[cs.key].progression.length) {
        // Custom skill with no stages gets one placeholder so session card renders
        SKILLS[cs.key].progression = [{ stage:"Work", duration:"15 min", text: cs.why || "Complete your planned work for this skill.", timer:"" }];
      }
    }
  });

  const wMin = settings.weightMin || WEIGHT_MIN;
  const wMax = settings.weightMax || WEIGHT_MAX;
  // shared draft — bottom text box writes here, tick modal reads from here
  const [draftNotes, setDraftNotes] = useState({});

  function setDraft(skillKey, text) {
    setDraftNotes(d => ({ ...d, [skillKey]: text }));
  }

  function toggleDone(cardKey, sk, instanceIdx=0) {
    const willBeDone = !done[cardKey];
    setDone(d => {
      const updated = { ...d, [cardKey]: willBeDone };
      store.set("rwc_done_"+todayK, JSON.stringify(updated));
      return updated;
    });
    if (willBeDone) {
      haptic("medium");
      playTaskDone();
      setReflectPrompt({ skillKey: sk, instanceIdx });
    } else {
      haptic("light");
    }
  }

  function saveReflection(skillKey, rating, text, instanceIdx=0) {
    if (!rating) { setReflectPrompt(null); return; }
    // Deduplicate scores — only one score entry per skill per day
    const existingScoreIdx = scores.findIndex(s => s.skillKey===skillKey && s.date===todayK);
    const scoreEntry = { id: existingScoreIdx>=0 ? scores[existingScoreIdx].id : Date.now().toString(36), date: todayK, skillKey, rating };
    const updatedScores = existingScoreIdx>=0
      ? scores.map((s,i)=>i===existingScoreIdx?scoreEntry:s)
      : [scoreEntry, ...scores];
    setScores(updatedScores);
    store.set("rwc_scores", JSON.stringify(updatedScores));

    if (text && text.trim()) {
      let storedText = text.trim();
      if (skillKey === "mentalTask" && todayMentalTask) {
        storedText = `${todayMentalTask.title}\n"${todayMentalTask.task.slice(0,120)}..."\n\n${storedText}`;
      }
      // overwrite existing note for this skill+instance today
      const existingIdx = reflections.findIndex(r =>
        r.skillKey===skillKey && r.date===todayK &&
        (instanceIdx===0 ? !r.extra : r.extra===instanceIdx)
      );
      const entry = {
        id: existingIdx >= 0 ? reflections[existingIdx].id : Date.now().toString(36)+"n",
        date: todayK, skillKey,
        skillName: skillKey === "mentalTask" ? "Athlete's Mindset" : (_optionalChain([SKILLS, 'access', _182 => _182[skillKey], 'optionalAccess', _183 => _183.name]) || skillKey),
        text: storedText, rating,
        extra: instanceIdx > 0 ? instanceIdx : undefined,
      };
      const updated = existingIdx >= 0
        ? reflections.map((r,i) => i===existingIdx ? entry : r)
        : [entry, ...reflections];
      setReflections(updated);
      store.set("rwc_reflections", JSON.stringify(updated));
    }
    setDraftNotes(d => ({ ...d, [`${skillKey}_${instanceIdx}`]: "", [skillKey]: "" }));
    setReflectPrompt(null);
  }

  function deleteReflection(id) {
    const updated = reflections.filter(r => r.id !== id);
    setReflections(updated);
    store.set("rwc_reflections", JSON.stringify(updated));
  }

  const [openCount, setOpenCount] = useState(0);

  function openCI() { setOpenCount(c=>c+1); setShowCI(true); }

  function saveCi(data) {
    store.set("rwc_ci_"+todayK, JSON.stringify(data));
    setHistory(h=>({...h,[todayK]:data}));
    setShowCI(false);
    setSkill(null);
    setTab("today");
    playCheckinSaved();

    // Generate skill list — always regenerate on check-in UNLESS
    // the player has already started ticking tasks today (don't wipe progress)
    const existingFrozen = store.get("rwc_skills_"+todayK);
    const existingDone = store.get("rwc_done_"+todayK);
    const hasStarted = existingDone && Object.values(JSON.parse(existingDone||"{}")).some(v=>v===true);

    if (!existingFrozen || !hasStarted) {
      const newNotes = parseNotes(data.notes);
      const ctx = {};

      // injury detection — use body map zones if available, else parse text notes
      const notesLower = (data.notes||"").toLowerCase();
      const injured = _optionalChain([data, 'access', _184 => _184.injuryZones, 'optionalAccess', _185 => _185.length]) > 0 ? null : {
        kickOk:  !["hamstring","hip","groin","quad","knee","ankle","calf","foot"].some(b=>notesLower.includes(b)),
        pitchOk: !["back","shoulder","wrist","thumb","neck"].some(b=>notesLower.includes(b)),
        gymOk:   !["back","shoulder","wrist","elbow","thumb"].some(b=>notesLower.includes(b)),
      };

      const newSkills = getTodaySkills(
        50, dow, {...newNotes, context: ctx, injury: injured, injuryZones: data.injuryZones||[]},
        _nullishCoalesce(data.timeMins, () => ( 30)), _nullishCoalesce(data.space, () => ( "home")), _nullishCoalesce(data.partners, () => ( 0)), matchStatus);
      store.set("rwc_skills_"+todayK, JSON.stringify(newSkills));
      setFrozenSkills(newSkills);
    }
  }

  const isViewingToday = viewingDate === todayK;
  const coachWord = COACH_WORDS[(new Date().getDate()+new Date().getMonth())%COACH_WORDS.length](days);

  // Daily mental task — rotates through library, one per day

  // daily mental task (Athlete's Mindset style)
  const todayMentalTask = MENTAL_TASKS[dayOfYear() % MENTAL_TASKS.length];
  const [mentalDone, setMentalDone] = useState(() => {
    try { return !!store.get("rwc_mental_done_"+todayK); } catch (e71) { return false; }
  });
  const [gamePtsVersion, setGamePtsVersion] = useState(0);

  function completeMentalTask(note) {
    setMentalDone(true);
    store.set("rwc_mental_done_"+todayK, "1");
    haptic("medium");
    // put note into draftNotes so ReflectionModal picks it up
    if (_optionalChain([note, 'optionalAccess', _186 => _186.trim, 'call', _187 => _187()])) setDraftNotes(d => ({...d, mentalTask: note.trim()}));
    setReflectPrompt({ skillKey: "mentalTask", instanceIdx: 0 });
    try {
      const key = "rwc_game_pts_"+todayK;
      const existing = JSON.parse(localStorage.getItem(key)||"{}");
      existing["mental_task"] = 4;
      localStorage.setItem(key, JSON.stringify(existing));
      setGamePtsVersion(v => v+1);
    } catch (e72) {}
  }

  function uncompleteMentalTask() {
    setMentalDone(false);
    store.set("rwc_mental_done_"+todayK, "");
    haptic("light");
    try {
      const key = "rwc_game_pts_"+todayK;
      const existing = JSON.parse(localStorage.getItem(key)||"{}");
      delete existing["mental_task"];
      localStorage.setItem(key, JSON.stringify(existing));
      setGamePtsVersion(v => v+1);
    } catch (e73) {}
  }
  const viewDone = isViewingToday ? done : (() => {
    try { return JSON.parse(store.get("rwc_done_"+viewingDate)||"{}"); } catch (e74) { return {}; }
  })();
  const viewSkills = isViewingToday ? skills : (() => {
    try { return JSON.parse(store.get("rwc_skills_"+viewingDate)||"[]"); } catch (e75) { return []; }
  })();
  const viewCi = isViewingToday ? ci : (() => {
    try { return JSON.parse(store.get("rwc_ci_"+viewingDate)||"null"); } catch (e76) { return null; }
  })();

  // ── timer for timed exercises ──────────────────────────────────────────────
  // ── haptics ──────────────────────────────────────────────────────────────────
  function haptic(style="medium") {
    try {
      if (_optionalChain([window, 'access', _188 => _188.navigator, 'optionalAccess', _189 => _189.vibrate])) {
        const ms = style==="light"?8:style==="medium"?15:25;
        window.navigator.vibrate(ms);
      }
    } catch (e77) {}
  }

  // ── audio ─────────────────────────────────────────────────────────────────────
  const audioCtxRef = useRef(null);

  // Call this synchronously inside a user gesture to unlock iOS audio
  function unlockAudio() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        // resume() is async but calling it inside the gesture is enough to unlock
        audioCtxRef.current.resume();
      }
    } catch (e78) {}
    return audioCtxRef.current;
  }

  // Pre-unlock on first touch anywhere
  useEffect(() => {
    const handler = () => unlockAudio();
    document.addEventListener("touchstart", handler, {once:true});
    document.addEventListener("mousedown",  handler, {once:true});
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown",  handler);
    };
  }, []);

  function synth(ctx, {freq=440, type="sine", gain=0.4, start=0, dur=0.12, attack=0.008}={}) {
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime + start);
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + attack);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur + 0.05);
    } catch (e79) {}
  }

  function playTaskDone() {
    const ctx = unlockAudio(); if (!ctx) return;
    synth(ctx, {freq:523, gain:0.3,  start:0,    dur:0.18, attack:0.005});
    synth(ctx, {freq:784, gain:0.22, start:0.07, dur:0.15, attack:0.005});
    synth(ctx, {freq:1046,gain:0.18, start:0.14, dur:0.22, attack:0.005});
  }

  function playStageCheck() {
    const ctx = unlockAudio(); if (!ctx) return;
    synth(ctx, {freq:880,  gain:0.18, start:0,    dur:0.1,  attack:0.003});
    synth(ctx, {freq:1320, gain:0.12, start:0.05, dur:0.1,  attack:0.003});
  }

  function playDoneSound() {
    const ctx = unlockAudio(); if (!ctx) return;
    synth(ctx, {freq:880,  gain:0.4, start:0,   dur:0.15, attack:0.005});
    synth(ctx, {freq:880,  gain:0.4, start:0.2, dur:0.15, attack:0.005});
    synth(ctx, {freq:1320, gain:0.45,start:0.4, dur:0.35, attack:0.005});
  }

  function playDayComplete() {
    const ctx = unlockAudio(); if (!ctx) return;
    synth(ctx, {freq:523,  gain:0.28, start:0,    dur:0.4,  attack:0.01});
    synth(ctx, {freq:659,  gain:0.22, start:0.1,  dur:0.4,  attack:0.01});
    synth(ctx, {freq:784,  gain:0.22, start:0.2,  dur:0.4,  attack:0.01});
    synth(ctx, {freq:1046, gain:0.30, start:0.32, dur:0.6,  attack:0.01});
    synth(ctx, {freq:261,  gain:0.13, start:0.32, dur:0.6,  attack:0.02});
  }

  function playCheckinSaved() {
    const ctx = unlockAudio(); if (!ctx) return;
    synth(ctx, {freq:659,  gain:0.22, start:0,    dur:0.12, attack:0.005});
    synth(ctx, {freq:880,  gain:0.18, start:0.08, dur:0.15, attack:0.005});
  }

  function playSupplementTap() {
    const ctx = unlockAudio(); if (!ctx) return;
    synth(ctx, {freq:1200, gain:0.14, start:0, dur:0.08, attack:0.003});
  }

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    try { window.scrollTo({top:0, behavior:"instant"}); } catch (e80) { window.scrollTo(0,0); }
  }, [tab, selectedSkill]);

  const wakeLockRef = useRef(null);

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch(e) {}
  }

  function releaseWakeLock() {
    try {
      if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
    } catch(e) {}
  }

  // Re-acquire wake lock if released (e.g. tab switch then return)
  useEffect(() => {
    const reacquire = () => { if (_optionalChain([activeTimer, 'optionalAccess', _190 => _190.running])) requestWakeLock(); };
    document.addEventListener('visibilitychange', reacquire);
    return () => document.removeEventListener('visibilitychange', reacquire);
  }, [_optionalChain([activeTimer, 'optionalAccess', _191 => _191.running])]);

  const timerStartRef = useRef(null); // wall clock when timer last started/resumed

  useEffect(() => {
    if (!activeTimer || !activeTimer.running) {
      releaseWakeLock();
      timerStartRef.current = null;
      return;
    }
    if (activeTimer.remaining <= 0) {
      releaseWakeLock();
      return;
    }
    requestWakeLock();
    // record wall clock start so we can correct for background time
    timerStartRef.current = Date.now();
    const remainingAtStart = activeTimer.remaining;

    const interval = setInterval(() => {
      if (_optionalChain([audioCtxRef, 'access', _192 => _192.current, 'optionalAccess', _193 => _193.state]) === 'suspended') {
        audioCtxRef.current.resume().catch(()=>{});
      }
      const elapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
      const newRemaining = Math.max(0, remainingAtStart - elapsed);
      setActiveTimer(t => {
        if (!t || !t.running) return t;
        if (newRemaining <= 0) {
          playDoneSound();
          releaseWakeLock();
          return { ...t, remaining: 0, running: false };
        }
        return { ...t, remaining: newRemaining };
      });
      if (newRemaining <= 0) clearInterval(interval);
    }, 500); // tick every 500ms for responsiveness

    // when page becomes visible after backgrounding, correct the remaining time immediately
    const onVisible = () => {
      if (document.visibilityState === 'visible' && timerStartRef.current) {
        const elapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
        const newRemaining = Math.max(0, remainingAtStart - elapsed);
        setActiveTimer(t => {
          if (!t || !t.running) return t;
          if (newRemaining <= 0) {
            playDoneSound();
            releaseWakeLock();
            return { ...t, remaining: 0, running: false };
          }
          return { ...t, remaining: newRemaining };
        });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [_optionalChain([activeTimer, 'optionalAccess', _194 => _194.running]), _optionalChain([activeTimer, 'optionalAccess', _195 => _195.key])]);

  function extractSeconds(text) {
    const lower = text.toLowerCase();
    // Only show timer for static holds, stretches, breathing exercises
    // NOT for reps, sprints, kicks, rest periods, or target times
    const isTimerWorthy = (
      lower.includes("each side") ||
      lower.includes("hold") ||
      lower.includes("stretch") ||
      lower.includes("eyes closed") ||
      lower.includes("breathing") ||
      lower.includes("plank") ||
      lower.includes("position for") ||
      lower.includes("static") ||
      lower.includes("minutes of") ||
      lower.includes("minute of") ||
      lower.includes("per side") ||
      lower.includes("each leg") ||
      lower.includes("each foot") ||
      lower.includes("minutes breathing") ||
      lower.includes("visualis") ||
      lower.includes("eyes-closed")
    );
    if (!isTimerWorthy) return null;

    // Extract the duration — prefer "X seconds" or "X minutes" patterns
    // Avoid matching things like "4.4s+" or "rest" contexts
    const secMatch = lower.match(/(\d+)\s*(?:seconds?|secs?)\b(?!\s*rest|\s*\+)/);
    const minMatch = lower.match(/(\d+)[–\-]?(?:\d+)?\s*(?:minutes?|mins?)\b/);

    if (secMatch) return parseInt(secMatch[1]);
    if (minMatch) return parseInt(minMatch[1]) * 60;
    return null;
  }

  function fmtTimer(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}:${String(s).padStart(2,"0")}` : `${s}s`;
  }


  const allDone = skills.length > 0 && (() => {
    return skills.every((sk, pos) => {
      const cardKey = `${sk}_pos${pos}`;
      return done[cardKey];
    });
  })();

  // clean stale skill keys from settings on mount
  useEffect(() => {
    const validKeys = Object.keys(SKILLS);
    const w = (settings.weaknesses||[]).filter(k=>validKeys.includes(k));
    const e = (settings.excluded||[]).filter(k=>validKeys.includes(k));
    if (w.length !== (settings.weaknesses||[]).length || e.length !== (settings.excluded||[]).length) {
      saveSettings({...settings, weaknesses:w, excluded:e});
    }
  }, []);

  // play day complete sound when all tasks done for first time
  const prevAllDoneRef = useRef(false);
  useEffect(() => {
    if (allDone && !prevAllDoneRef.current) { haptic("heavy"); playDayComplete(); }
    prevAllDoneRef.current = allDone;
  }, [allDone]);
  const streak = calcStreak(todayK);
  const [bonusAccepted, setBonusAccepted] = useState(()=>{
    try { return !!store.get("rwc_bonus_accepted_"+todayK); } catch (e81) { return false; }
  });
  const [bonusSkill, setBonusSkill] = useState(null);

  function acceptBonus(skip) {
    setBonusAccepted(true);
    store.set("rwc_bonus_accepted_"+todayK, "1");
    if (!skip) return;
  }
  const [dayReflection, setDayReflection] = useState(() => {
    try { return store.get("rwc_dayreflect_"+todayK) || ""; } catch (e82) { return ""; }
  });
  const [dayReflectSaved, setDayReflectSaved] = useState(() => {
    try { return !!store.get("rwc_dayreflect_"+todayK); } catch (e83) { return false; }
  });
  const [journalAnswers, setJournalAnswers] = useState({});
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalStep, setJournalStep] = useState(0);

  const JOURNAL_PROMPTS = {
    performance: {
      label:"⚡ Performance",
      color: GRNA,
      prompts: [
        "What was the single best rep or moment in today's session? What made it work?",
        "What felt off today? Was it physical, mental, or technical?",
        "On a scale of 1-10, how close were you to your best today? What would have made it a 10?",
        "Did you execute your pre-session focus? What happened?",
        "What's one technical thing you noticed that you want to bring to the next session?",
        "Where did you feel the most uncomfortable today? That's probably where you're growing.",
        "If your coach watched today's full session, what would they say you did well? What would they challenge?",
        "What habit or pattern did today reinforce — good or bad?",
      ]
    },
    mental: {
      label:"🧘 Mental",
      color: PRP,
      prompts: [
        "How present were you during the session? When did your mind wander?",
        "Did you feel fear, hesitation or avoidance at any point? What triggered it?",
        "What was your self-talk like under pressure today? Would you say those things to a teammate?",
        "On a scale of 1-10, how much did you believe in yourself today? What shifted that number?",
        "Did you compete or just participate today? What's the difference for you?",
        "How did you respond to the first mistake? That response pattern matters more than the mistake.",
        "Describe your emotional state in one word at the start. One word at the end. What changed it?",
        "GSP said: 'I fear not the man who has practiced 10,000 kicks once, but the man who has practiced one kick 10,000 times.' Which kick are you practising 10,000 times?",
      ]
    },
    body: {
      label:"💪 Body",
      color: AMB,
      prompts: [
        "Energy levels 1-10 today. What do you think caused that number?",
        "Any soreness, tightness or discomfort worth noting? Where exactly?",
        "How did your body respond differently today vs your last session?",
        "Sleep last night: how many hours, how was the quality? How did that affect today?",
        "What did you eat in the 2 hours before training? Did it help or hinder you?",
        "What does your body need most right now — more load, more rest, or more quality?",
      ]
    },
    tactics: {
      label:"🎯 Tactics",
      color: GOLD,
      prompts: [
        "What did you discover about your game today that you didn't know yesterday?",
        "Which of your opponents' patterns (Ireland, Uruguay, Scotland) did you work on today?",
        "If you played Ireland tomorrow, what's the one thing you'd be most worried about?",
        "What decision did you make today that you'd make differently next time?",
        "What's your biggest tactical gap right now — the one thing opponents can exploit?",
        "What does your best version do in the first ruck of a match? Did you rehearse that today?",
        "When you watch elite 9s, what do they do that you want to steal?",
      ]
    },
    growth: {
      label:"🌱 Growth",
      color: BLU,
      prompts: [
        "What's one thing you're better at today than you were a month ago? What caused that?",
        "What are you most afraid to work on? That's probably the most important thing.",
        "Describe your biggest weakness right now without softening it. Then write what you're doing about it.",
        "What would the version of you that plays at RWC 2027 say about today's session?",
        "Who did you train like today — someone trying to survive, or someone building a legacy?",
        "What story are you telling yourself about your progress? Is it accurate?",
        "What sacrifice did you make today that no one saw? Those compound into championships.",
        "In 446 days you play Ireland. What would you change about today if you could?",
      ]
    },
  };

  // find the best bonus skill — next most overdue that wasn't in today's list
  const getBonusSkill = () => {
    const ALL = ["shortBoxKick","longBoxKick","grubber","crossKick","fiftyTwo","clearingKick","agility","passing","breakdown",
      "edgeDefense","highBall","gameStudy","mental","prehab"];
    const lastTrained = getSkillLastTrained(todayK);
    return ALL
      .filter(sk => !skills.includes(sk)) // not already in today
      .sort((a,b) => (_nullishCoalesce(lastTrained[b], () => (9999))) - (_nullishCoalesce(lastTrained[a], () => (9999))))
      [0] || null;
  };

  const stripItems = ci?[
    ...(ci.weight?[{label:"Weight", value:`${ci.weight}kg`, c:parseFloat(ci.weight)>=wMin&&parseFloat(ci.weight)<=wMax?GRNA:AMB}]:[]),
  ]:[];

  const TABS=[
    {key:"today",    icon:"📅", label:"Today"},
    {key:"notes",    icon:"📝", label:"Notes"},
    {key:"progress", icon:"📊", label:"Progress"},
    {key:"games",    icon:"⚡", label:"Games"},
    {key:"settings", icon:"⚙️", label:"Settings"},
  ];

  const renderInjuryBanner = () => {
    if (!_optionalChain([ci, 'optionalAccess', _196 => _196.notes])) return null;
    const n = ci.notes.toLowerCase();
    const bodyParts = ["hamstring","groin","hip","ankle","knee","quad","calf","shoulder","back"];
    const found = bodyParts.find(p => n.includes(p));
    if (!found) return null;
    return (
      React.createElement('div', { style: {...card,padding:"10px 14px",marginBottom:8,borderLeft:`3px solid ${AMB}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7548}}
        , React.createElement('div', { style: {fontSize:12,color:AMB,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7549}}, "⚠️ " , found, " flagged — prehab prioritised today"     )
      )
    );
  }

  const renderPreSessionReview = () => {
    const pastNotes = getPastReflections(reflections, selectedSkill, 3);
    if (pastNotes.length === 0) return null;
    const buildCue = getBuildOnCue(pastNotes[0]);
    return (
      React.createElement('div', { style: {marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7559}}
        , React.createElement('div', { style: {...lbl,color:AMB,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7560}}, "📖 Last time you did this"     )
        , buildCue && (
          React.createElement('div', { style: {...card,padding:"12px 15px",marginBottom:8,borderLeft:`3px solid ${AMB}`,background:"#1e140a"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7562}}
            , React.createElement('div', { style: {fontSize:10,color:AMB,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7563}}, "Build on this today"   )
            , React.createElement('div', { style: {fontSize:13.5,color:T1,lineHeight:1.65,fontWeight:500}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7564}}, buildCue)
          )
        )
        , pastNotes.map((r,i) => (
          React.createElement('div', { key: r.id, style: {...card,padding:"11px 14px",marginBottom:6,opacity:i===0?1:0.65}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7568}}
            , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7569}}
              , React.createElement('span', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7570}}, fmtDate(r.date))
              , !!r.rating && React.createElement('span', { style: {fontSize:10,fontWeight:700,color:r.rating>=4?GRNA:r.rating>=3?T2:AMB}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7571}}, r.rating, "/5")
            )
            , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7573}}, r.text)
          )
        ))
      )
    );
  }

  const renderBonusRound = () => {
    const bonus=bonusSkill||getBonusSkill();
    if(!bonus) return null;
    const s=SKILLS[bonus];
    return (
      React.createElement('div', { style: {...card,padding:"16px 18px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7585}}
        , React.createElement('div', { style: {...lbl,color:GRNA,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7586}}, "One more thing"  )
        , React.createElement('div', { style: {display:"flex",gap:10,alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7587}}
          , React.createElement('div', { style: {flex:1,display:"flex",alignItems:"center",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7588}}
            , React.createElement('span', { style: {fontSize:22}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7589}}, _optionalChain([s, 'optionalAccess', _197 => _197.icon])||"🏉")
            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 7590}}
              , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7591}}, _optionalChain([s, 'optionalAccess', _198 => _198.name])||bonus)
              , React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7592}}, "most overdue" )
            )
          )
          , React.createElement('div', { style: {display:"flex",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7595}}
            , React.createElement('button', { onClick: ()=>{
              setBonusSkill(bonus);acceptBonus(false);
              const updated=[...(frozenSkills||[]),bonus];
              setFrozenSkills(updated);store.set("rwc_skills_"+todayK,JSON.stringify(updated));
            }, style: {padding:"9px 14px",borderRadius:10,border:"none",background:GRNA,color:BG,fontSize:13,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7596}}, "Do it →"  )
            , React.createElement('button', { onClick: ()=>acceptBonus(true), style: {padding:"9px 14px",borderRadius:10,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:12,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7601}}, "Skip")
          )
        )
      )
    );
  }

  const renderNotesTab = () => {
    const sorted=[...reflections].sort((a,b)=>b.date.localeCompare(a.date));
    const patterns=detectPatterns(reflections);
    const isSearching=_optionalChain([notesQuery, 'optionalAccess', _199 => _199.trim, 'call', _200 => _200(), 'access', _201 => _201.length])>0;

    // daily reflections (separate from skill notes)
    const dailyReflections = sorted.filter(r=>r.skillKey==="day");
    const skillReflections  = sorted.filter(r=>r.skillKey!=="day");

    // notes view toggle
    const [notesView, setNotesView_] = [notesViewMode, setNotesViewMode];

    if(isSearching){
      const filtered=sorted.filter(r=>r.text.toLowerCase().includes(notesQuery.toLowerCase())||_optionalChain([r, 'access', _202 => _202.skillName, 'optionalAccess', _203 => _203.toLowerCase, 'call', _204 => _204(), 'access', _205 => _205.includes, 'call', _206 => _206(notesQuery.toLowerCase())]));
      return (
        React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 7623}}
          , React.createElement('input', { value: notesQuery, onChange: e=>setNotesQuery(e.target.value), placeholder: "Search notes..." ,
            style: {width:"100%",padding:"10px 13px",borderRadius:10,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13.5,outline:"none",boxSizing:"border-box",fontFamily:"inherit",caretColor:GOLD,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7624}})
          , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7626}}, filtered.length, " result" , filtered.length!==1?"s":"")
          , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7627}}
            , filtered.map(r=>{const skill=SKILLS[r.skillKey];return (
              React.createElement('div', { key: r.id, style: {...card,padding:"13px 15px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7629}}
                , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7630}}
                  , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:7}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7631}}
                    , React.createElement('span', { style: {fontSize:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7632}}, _optionalChain([skill, 'optionalAccess', _207 => _207.icon])||"📝")
                    , React.createElement('span', { style: {fontSize:11,fontWeight:700,color:_optionalChain([skill, 'optionalAccess', _208 => _208.color])||T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7633}}, _optionalChain([skill, 'optionalAccess', _209 => _209.name])||r.skillKey)
                    , !!r.rating&&React.createElement('span', { style: {fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:6,background:S2,color:r.rating>=4?GRNA:r.rating>=3?T2:AMB}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7634}}, r.rating, "/5")
                  )
                  , React.createElement('span', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7636}}, fmtDate(r.date))
                )
                , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.65,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7638}}, r.text)
                , React.createElement('button', { onClick: ()=>deleteReflection(r.id), style: {fontSize:10,color:T3,background:"transparent",border:`1px solid ${BD}`,borderRadius:6,padding:"3px 9px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7639}}, "delete")
              )
            );})
          )
        )
      );
    }

    const groups={};
    skillReflections.forEach(r=>{if(!groups[r.skillKey])groups[r.skillKey]=[];groups[r.skillKey].push(r);});
    const groupKeys=Object.keys(groups).sort((a,b)=>groups[b][0].date.localeCompare(groups[a][0].date));

    // skill comparison: this month vs last month
    const now = new Date(todayK+"T12:00:00");
    const thisMonthStr = todayK.slice(0,7);
    const lastMonth = new Date(now); lastMonth.setMonth(lastMonth.getMonth()-1);
    const lastMonthStr = lastMonth.toISOString().slice(0,7);
    const skillComparison = Object.entries(groups).map(([sk, notes])=>{
      const thisMonth = notes.filter(n=>n.date.startsWith(thisMonthStr)&&n.rating);
      const lastMonthNotes = notes.filter(n=>n.date.startsWith(lastMonthStr)&&n.rating);
      if (!thisMonth.length) return null;
      const thisAvg = thisMonth.reduce((a,n)=>a+n.rating,0)/thisMonth.length;
      const lastAvg = lastMonthNotes.length ? lastMonthNotes.reduce((a,n)=>a+n.rating,0)/lastMonthNotes.length : null;
      const delta = lastAvg!=null ? thisAvg-lastAvg : null;
      return {sk, thisAvg, lastAvg, delta, count:thisMonth.length};
    }).filter(Boolean).sort((a,b)=>(_nullishCoalesce(b.delta, () => (-99)))-(_nullishCoalesce(a.delta, () => (-99))));

    return (
      React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 7667}}
        , reflections.length===0?(
          React.createElement('div', { style: {...card,padding:"36px 20px",textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7669}}
            , React.createElement('div', { style: {fontSize:32,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7670}}, "📝")
            , React.createElement('div', { style: {fontSize:15,fontWeight:700,color:T1,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7671}}, "No notes yet"  )
            , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7672}}, "Tick a session as done — you'll be asked what you learned."           )
          )
        ):(
          React.createElement(React.Fragment, null
            , React.createElement('input', { value: notesQuery||"", onChange: e=>setNotesQuery(e.target.value), placeholder: "Search notes..." ,
              style: {width:"100%",padding:"10px 13px",borderRadius:10,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13.5,outline:"none",boxSizing:"border-box",fontFamily:"inherit",caretColor:GOLD,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7676}})

            /* view toggle */
            , React.createElement('div', { style: {display:"flex",gap:4,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7680}}
              , [
                {key:"skills",  label:"Performance"},
                {key:"journal", label:"Journal"},
                {key:"trends",  label:"Trends"},
              ].map(v=>(
                React.createElement('button', { key: v.key, onClick: ()=>setNotesViewMode(v.key), style: {
                  flex:1,padding:"7px 0",borderRadius:9,border:"none",fontSize:11,fontWeight:notesView===v.key?700:400,
                  cursor:"pointer",background:notesView===v.key?GOLD:S2,color:notesView===v.key?BG:T3,
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7686}}, v.label)
              ))
            )

            /* SKILLS VIEW */
            , notesView==="skills"&&(
              React.createElement(React.Fragment, null
                , React.createElement(FreeNoteForm, {
                  onSave: (text)=>{
                    if(!text.trim()) return;
                    const entry={id:Date.now().toString(36)+"f",date:todayK,skillKey:"freenote",skillName:"General note",text:text.trim(),rating:0};
                    const updated=[entry,...reflections];
                    setReflections(updated);
                    store.set("rwc_reflections",JSON.stringify(updated));
                  },
                  BD: BD, S1: S1, S2: S2, T1: T1, T2: T2, T3: T3, GOLD: GOLD, GRNA: GRNA, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7696}}
                )
                , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7706}}
                  , groupKeys.map(sk=>{
                    const notes=groups[sk];const skill=SKILLS[sk];const isOpen=notesFilter===sk;
                    const avgRating=notes.filter(n=>n.rating).length?(notes.filter(n=>n.rating).reduce((a,n)=>a+n.rating,0)/notes.filter(n=>n.rating).length).toFixed(1):null;
                    return (
                      React.createElement('div', { key: sk, style: {borderRadius:12,overflow:"hidden",border:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7711}}
                        , React.createElement('button', { onClick: ()=>setNotesFilter(isOpen?null:sk), style: {width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:isOpen?S2:S1,border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7712}}
                          , React.createElement('span', { style: {fontSize:20,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7713}}, sk==="freenote"?"✏️":sk==="mental"?"🧠":_optionalChain([skill, 'optionalAccess', _210 => _210.icon])||"📝")
                          , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7714}}
                            , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:sk==="freenote"?GOLD:_optionalChain([skill, 'optionalAccess', _211 => _211.color])||T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7715}}, sk==="freenote"?"General notes":_optionalChain([skill, 'optionalAccess', _212 => _212.name])||sk)
                            , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7716}}, notes.length, " note" , notes.length!==1?"s":"", " · last "   , fmtDate(notes[0].date), avgRating?` · avg ${avgRating}/5`:"")
                          )
                          , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7718}}, isOpen?"▲":"▼")
                        )
                        , isOpen&&(
                          React.createElement('div', { style: {background:S2,borderTop:`1px solid ${BD}`,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7721}}
                            , notes.map(r=>(
                              React.createElement('div', { key: r.id, style: {...card,padding:"12px 14px",background:S1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7723}}
                                , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7724}}
                                  , !!r.rating&&sk!=="freenote"&&React.createElement('span', { style: {fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:6,background:S2,color:r.rating>=4?GRNA:r.rating>=3?T2:AMB}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7725}}, r.rating, "/5")
                                  , React.createElement('span', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7726}}, fmtDate(r.date))
                                )
                                , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.65,marginBottom:6,whiteSpace:"pre-wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7728}}, r.text)
                                , React.createElement('button', { onClick: ()=>deleteReflection(r.id), style: {fontSize:10,color:T3,background:"transparent",border:`1px solid ${BD}`,borderRadius:6,padding:"3px 9px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7729}}, "delete")
                              )
                            ))
                          )
                        )
                      )
                    );
                  })
                )
              )
            )

            , notesView==="journal"&&(
              React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7742}}
                , journalEntries.length===0?(
                  React.createElement('div', { style: {...card,padding:"28px 20px",textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7744}}
                    , React.createElement('div', { style: {fontSize:13,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7745}}, "No journal entries yet — complete your session to write one."          )
                  )
                ):journalEntries.map(e=>(
                  React.createElement(JournalEntryCard, { key: e.date, entry: e,
                    onDelete: deleteJournalEntry,
                    BD: BD, S1: S1, S2: S2, T1: T1, T2: T2, T3: T3,
                    GOLD: GOLD, REDA: REDA, REDDIM: REDDIM, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7748}}
                  )
                ))
              )
            )


            , notesView==="trends"&&(
              React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 7759}}
                , skillComparison.length===0?(
                  React.createElement('div', { style: {...card,padding:"28px 20px",textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7761}}
                    , React.createElement('div', { style: {fontSize:13,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7762}}, "Not enough data yet — rate your sessions to see trends."          )
                  )
                ):(
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7766}}, "This month vs last month · based on your session ratings"          )
                    , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7767}}
                      , skillComparison.map(({sk,thisAvg,lastAvg,delta,count})=>{
                        const s=SKILLS[sk];
                        const improving=delta!=null&&delta>0.2;
                        const declining=delta!=null&&delta<-0.2;
                        const color=improving?GRNA:declining?REDA:T3;
                        return (
                          React.createElement('div', { key: sk, style: {...card,padding:"13px 15px",display:"flex",alignItems:"center",gap:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7774}}
                            , React.createElement('span', { style: {fontSize:20,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7775}}, _optionalChain([s, 'optionalAccess', _213 => _213.icon])||"🏉")
                            , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7776}}
                              , React.createElement('div', { style: {fontSize:13,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7777}}, _optionalChain([s, 'optionalAccess', _214 => _214.name])||sk)
                              , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7778}}, count, " session" , count!==1?"s":"", " this month"  )
                            )
                            , React.createElement('div', { style: {textAlign:"right",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7780}}
                              , React.createElement('div', { style: {fontSize:18,fontWeight:800,color:improving?GRNA:declining?REDA:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7781}}, thisAvg.toFixed(1))
                              , delta!=null?(
                                React.createElement('div', { style: {fontSize:10,fontWeight:700,color}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7783}}
                                  , delta>0?"+":"", delta.toFixed(1), " vs last month"
                                )
                              ):React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7786}}, "no prev data"  )
                            )
                          )
                        );
                      })
                    )
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  const renderProgressTab = () => {
    const totalSpan=475;const elapsed=Math.max(0,totalSpan-days);const pct=Math.min(100,(elapsed/totalSpan)*100);
    // Phase boundaries (days remaining at RWC start):
    // Foundation:  days 475→400 = 75 days elapsed = first 75/475 of bar
    // Development: days 400→250 = 150 days
    // Sharpening:  days 250→100 = 150 days
    // Tournament:  days 100→0   = 100 days
    const PHASES=[
      {name:"Foundation", daysFrom:0,   daysTo:75,  accent:GRNA,     weeks:"~11 weeks",focus:"Aerobic base, movement quality, technical fundamentals."},
      {name:"Development",daysFrom:75,  daysTo:225, accent:GOLD,     weeks:"~21 weeks",focus:"Match-specific skills, strength to power, decision making."},
      {name:"Sharpening", daysFrom:225, daysTo:375, accent:REDA,     weeks:"~21 weeks",focus:"Pressure work, match-pace only, opponent-specific prep."},
      {name:"Tournament", daysFrom:375, daysTo:475, accent:"#f0c060",weeks:"~14 weeks",focus:"Taper, sharpness, freshness above all."},
    ];
    // active phase: elapsed days in range
    const activePhase = PHASES.find(p => elapsed >= p.daysFrom && elapsed < p.daysTo) || PHASES[PHASES.length-1];
    const phasesBar = (
      React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7818}}
        , React.createElement('div', { style: {...lbl,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7819}}, "475-day journey" )
        , React.createElement('div', { style: {position:"relative",height:24,borderRadius:6,overflow:"hidden",display:"flex",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7820}}
          , PHASES.map((p,i)=>{
            const w = (p.daysTo - p.daysFrom) / totalSpan * 100;
            return React.createElement('div', { key: p.name, style: {width:`${w}%`,background:p.name===activePhase.name?p.accent+"66":p.accent+"22",borderRight:i<PHASES.length-1?`1px solid ${BG}`:"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7823}});
          })
          , React.createElement('div', { style: {position:"absolute",left:`${pct}%`,top:0,bottom:0,width:2,background:T1,boxShadow:"0 0 4px rgba(255,255,255,0.5)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7825}})
        )
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:9,color:T3,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7827}}, React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 7827}}, "Start"), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 7827}}, "RWC 2027" ))
        , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7828}}
          , PHASES.map(p => {
            const isActive = p.name === activePhase.name;
            return (
              React.createElement('div', { key: p.name, style: {padding:"9px 12px",borderRadius:8,background:isActive?p.accent+"18":S2,border:`1px solid ${isActive?p.accent+"55":BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7832}}
                , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isActive?4:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7833}}
                  , React.createElement('span', { style: {fontSize:12,fontWeight:700,color:isActive?p.accent:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7834}}, isActive?"▶ ":"", p.name)
                  , React.createElement('span', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7835}}, p.weeks)
                )
                , isActive&&React.createElement('div', { style: {fontSize:11,color:T2,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7837}}, p.focus)
              )
            );
          })
        )
      )
    );
    return (
      React.createElement(React.Fragment, null
        , phasesBar
        , React.createElement(Progress, { history: history, scores: scores, reflections: reflections, customDrills: customDrills, streak: streak, wMin: wMin, wMax: wMax, doneKey: Object.keys(done).filter(k=>done[k]).length, gamePtsV: gamePtsVersion, todayK: todayK, customSkills: settings.customSkills||[], suppV: suppVersion, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7847}})
      )
    );
  }


  const renderSkillSession = () => {
    const totalMins = freeTimeMins === 0 ? 15 : freeTimeMins;
    const perSkillMins = freeTimeMins >= 90
      ? 999
      : Math.max(Math.floor(totalMins / Math.max(skills.length, 1)), 10);

    const session = buildProgressionSession(selectedSkill, perSkillMins, extraStages[selectedSkill]||[]);
    if (!session || session.steps.length===0) return null;
    // actual total is sum of non-skipped steps only
    const actualMins = session.steps.reduce((a,st,i)=>{
      const sk = `${selectedSkill}_stage_${(st.stage||st.name||String(i)).replace(/\s+/g,"_").toLowerCase()}`;
      return stagesSkipped[sk] ? a : a + (parseInt(st.duration)||10);
    }, 0);
    const isVisualSkill = selectedSkill === "mental";

    // Only show opponent focus within 90 days of first pool match (4 Oct 2027)
    const daysToFirstMatch = Math.ceil((new Date("2027-10-04") - new Date(todayK+"T12:00:00")) / 86400000);
    const gameStudyOpponent = selectedSkill === "gameStudy" && daysToFirstMatch <= 90 ? algoMeta.opponentFocus : null;

    return (
      React.createElement(React.Fragment, null
        , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7874}}
          , React.createElement('div', { style: lbl, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7875}}, "Session — "  , actualMins, " min" )
          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7876}}
            , noField && React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7877}}, "no field needed"  )
            , (()=>{
              const doneCount = session.steps.filter((step)=>stagesDone[`${selectedSkill}_stage_${(step.stage||step.name||"").replace(/\s+/g,"_").toLowerCase()}`]).length;
              if (doneCount===0) return null;
              return React.createElement('span', { style: {fontSize:11,fontWeight:700,color:doneCount===session.steps.length?GRNA:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7881}}, doneCount, "/", session.steps.length, " stages" );
            })()
          )
        )
        , gameStudyOpponent && (
          React.createElement('div', { style: {...card,padding:"10px 14px",marginBottom:10,
            borderLeft:`3px solid ${algoMeta.opponentMandatory?REDA:GOLD}`,
            background:algoMeta.opponentMandatory?REDDIM:GOLDDIM}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7886}}
            , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:algoMeta.opponentMandatory?REDA:GOLD,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7889}}
              , algoMeta.opponentMandatory?"🚨":"📹", " Study "  , gameStudyOpponent, " today"
            )
            , React.createElement('div', { style: {fontSize:11,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7892}}
              , algoMeta.opponentMandatory
                ? `${gameStudyOpponent} in ${Math.ceil((new Date(["Ireland","Uruguay","Scotland"].indexOf(gameStudyOpponent)===0?"2027-10-04":["Ireland","Uruguay","Scotland"].indexOf(gameStudyOpponent)===1?"2027-10-11":"2027-10-17") - new Date()) / 86400000)} days — focus on their 9's kicking patterns, ruck speed and defensive reads.`
                : `Rotating all 3 opponents. ${gameStudyOpponent} is today's focus — analyse their 9, patterns and tendencies.`
              
            )
          )
        )
        , isVisualSkill && React.createElement(SpeakSession, {
          steps: session.steps,
          skillName: _optionalChain([SKILLS, 'access', _215 => _215[selectedSkill], 'optionalAccess', _216 => _216.name])||selectedSkill,
          skillColor: _optionalChain([SKILLS, 'access', _217 => _217[selectedSkill], 'optionalAccess', _218 => _218.color])||GRNA, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7900}}
        )
        , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7905}}
          , session.steps.map((st,i)=>{
            const swapKey = `${selectedSkill}_swap_${(st.stage||st.name||String(i)).replace(/\s+/g,"_").toLowerCase()}`;
            const stageKey = `${selectedSkill}_stage_${(st.stage||st.name||String(i)).replace(/\s+/g,"_").toLowerCase()}`;
            const swapData = stageSwaps[swapKey];
            const swapped = swapData ? (typeof swapData === "object" ? swapData.text : swapData) : null;
            // for old string-format swaps, derive name from first sentence of text
            const swappedName = swapData
              ? (typeof swapData === "object" ? swapData.name : swapData.split(/[.—]/)[0].slice(0,40).trim())
              : null;
            const stageDone = !!stagesDone[stageKey];
            const stageSkipped = !!stagesSkipped[stageKey];
            const isSwapOpen = _optionalChain([stageSwapOpen, 'optionalAccess', _219 => _219.skillKey])===selectedSkill && _optionalChain([stageSwapOpen, 'optionalAccess', _220 => _220.stageIndex])===i;
            const libCat = SKILL_TO_LIBRARY[selectedSkill] || selectedSkill;
            // Build swap options from ALL stages of this skill (built-in + custom progressions)
            // so custom skill stages always appear, even if added after app load
            const s_for_swap = SKILLS[selectedSkill];
            const customProg_for_swap = _optionalChain([settings, 'access', _221 => _221.customProgressions, 'optionalAccess', _222 => _222[selectedSkill]])||{};
            const allSkillStages = [
              ...(_optionalChain([s_for_swap, 'optionalAccess', _223 => _223.progression])||[]).map(stage=>({
                name: stage.stage,
                execution: stage.text,
                timer: stage.timer||"",
              })),
              ...Object.entries(customProg_for_swap)
                .filter(([idx,v])=>parseInt(idx)>=(_optionalChain([s_for_swap, 'optionalAccess', _224 => _224.progression])||[]).length && !_optionalChain([v, 'optionalAccess', _225 => _225.deleted]))
                .map(([,v])=>({name:typeof v==="object"?v.name:"Custom",execution:typeof v==="object"?v.text:v, timer:typeof v==="object"?v.timer||"":"", custom:true}))
            ].filter(d =>
              d.execution !== "PROGRESSIVE_PLANK" &&
              d.name !== st.stage &&
              d.name !== (_optionalChain([swapData, 'optionalAccess', _226 => _226.name]))
            );
            const altDrills = allSkillStages;

            // skipped stages are hidden — show a tiny restore pill instead
            if (stageSkipped) {
              return (
                React.createElement('div', { key: i, style: {display:"flex",alignItems:"center",gap:8,padding:"6px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7942}}
                  , React.createElement('div', { style: {flex:1,height:1,background:BD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7943}})
                  , React.createElement('button', { onClick: ()=>{
                    const updated={...stagesSkipped};delete updated[stageKey];
                    setStagesSkipped(updated);
                    store.set("rwc_stages_skip_"+todayK,JSON.stringify(updated));
                  }, style: {fontSize:10,color:T3,background:S2,border:`1px solid ${BD}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7944}}
                    , st.stage, " — skipped ↩"
                  )
                  , React.createElement('div', { style: {flex:1,height:1,background:BD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7951}})
                )
              );
            }

            // collapse logic: first undone stage is expanded by default; rest collapsed
            const firstUndoneIdx = session.steps.findIndex((_s,_i)=>{
              const _k=`${selectedSkill}_stage_${(_s.stage||_s.name||String(_i)).replace(/\s+/g,"_").toLowerCase()}`;
              return !stagesDone[_k] && !stagesSkipped[_k];
            });
            const defaultExpanded = (i === firstUndoneIdx) || stageDone;
            const isExpanded = expandedStages[stageKey] !== undefined ? expandedStages[stageKey] : defaultExpanded;
            const toggleExpand = () => setExpandedStages(prev=>({...prev,[stageKey]:!isExpanded}));

            return (
              React.createElement('div', { key: i, style: {...card,padding:"0",opacity:stageDone?0.55:1,transition:"opacity 0.2s",overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7966}}
                /* stage header row — always visible, tap to expand/collapse */
                , React.createElement('div', { onClick: toggleExpand, style: {display:"flex",gap:12,alignItems:"center",padding:"12px 15px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7968}}
                  /* tappable circle — tap to mark stage done */
                  , React.createElement('button', { onClick: (e)=>{
                    e.stopPropagation();
                    const updated = {...stagesDone, [stageKey]: !stageDone};
                    setStagesDone(updated);
                    store.set("rwc_stages_"+(isViewingToday?todayK:viewingDate), JSON.stringify(updated));
                    if (!stageDone) { haptic("light"); playStageCheck(); }
                  }, style: {
                    width:26,height:26,borderRadius:"50%",flexShrink:0,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:12,fontWeight:800,cursor:"pointer",border:"none",
                    background:stageDone?GRNA:_optionalChain([SKILLS, 'access', _227 => _227[selectedSkill], 'optionalAccess', _228 => _228.color])+"22"||GRNA+"22",
                    color:stageDone?BG:_optionalChain([SKILLS, 'access', _229 => _229[selectedSkill], 'optionalAccess', _230 => _230.color])||GRNA,
                    transition:"background-color 0.15s,color 0.15s",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7970}}, stageDone?"✓":i+1)
                  , React.createElement('div', { style: {flex:1,minWidth:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7984}}
                    /* always-visible name + duration + chevron */
                    , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7986}}
                      , React.createElement('div', { style: {display:"flex",alignItems:"baseline",gap:6,minWidth:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7987}}
                        , React.createElement('span', { style: {fontSize:13.5,fontWeight:700,color:T1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7988}}, swappedName || st.stage)
                        , swappedName && React.createElement('span', { style: {fontSize:10,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7989}}, "(was: " , st.stage, ")")
                      )
                      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7991}}
                        , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7992}}, st.duration)
                        , React.createElement('span', { style: {fontSize:11,color:T3,transition:"transform 0.2s",display:"inline-block",transform:isExpanded?"rotate(180deg)":"rotate(0deg)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7993}}, "▾")
                      )
                    )
                  )
                )
                /* collapsible body */
                , isExpanded && React.createElement('div', { style: {padding:"0 15px 13px 15px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7999}}
                  , React.createElement('div', { style: {display:"flex",justifyContent:"flex-end",gap:6,marginBottom:8,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8000}}
                    , altDrills.length>0&&(
                      React.createElement('button', { onClick: ()=>setStageSwapOpen(isSwapOpen?null:{skillKey:selectedSkill,stageIndex:i}), style: {
                        fontSize:9,color:T3,background:"transparent",border:`1px solid ${BD}`,
                        borderRadius:8,padding:"2px 7px",cursor:"pointer",
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8002}}, "swap")
                    )
                    , React.createElement('button', { onClick: (e)=>{e.stopPropagation();
                      const updated={...stagesSkipped,[stageKey]:true};
                      setStagesSkipped(updated);
                      store.set("rwc_stages_skip_"+todayK,JSON.stringify(updated));
                    }, style: {
                      fontSize:9,color:REDA,background:"transparent",border:`1px solid ${REDA}44`,
                      borderRadius:8,padding:"2px 7px",cursor:"pointer",
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8007}}, "skip")
                  )
                  , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8016}}
                    , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.65}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8017}}
                      , (swapped || st.text) === "PROGRESSIVE_PLANK"
                        ? React.createElement(PlankProgressionCard, { store: store, todayK: todayK, haptic: haptic,
                            GOLD: GOLD, GRNA: GRNA, BG: BG, T1: T1, T2: T2, T3: T3, S1: S1, S2: S2, BD: BD, REDA: REDA, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8019}})
                        : (swapped || st.text)
                    )
                    /* ice bath temperature slider + timer — always visible */
                    , selectedSkill==="recovery" && !(swappedName) && (st.stage||"").toLowerCase().includes("ice bath") && (()=>{
                      const getIceBathRec = (t) => {
                        if (t <= 5)  return { time:"3–5 min max", mins:4,  label:"⚠️ Cold shock risk — extreme caution", color:REDA };
                        if (t <= 7)  return { time:"5–8 min",     mins:6,  label:"Very cold — acclimatise first",        color:AMB  };
                        if (t <= 9)  return { time:"8–10 min",    mins:9,  label:"Cold — effective for recovery",        color:GOLD };
                        if (t <= 11) return { time:"10–12 min",   mins:11, label:"✓ Optimal — most evidence-supported",  color:GRNA };
                        if (t <= 13) return { time:"10–12 min",   mins:11, label:"Good — strong research base",          color:GRNA };
                        if (t <= 16) return { time:"15–20 min",   mins:17, label:"Warmer — longer time needed for effect",color:BLU };
                        if (t <= 18) return { time:"20–25 min",   mins:22, label:"Borderline — reduced vasoconstriction",color:T3  };
                        return       { time:"25–30 min",           mins:27, label:"⚠️ Minimal benefit zone",             color:T3  };
                      };
                      const rec = getIceBathRec(iceBathTemp);
                      const totalSecs = rec.mins * 60;
                      const timerSecs = iceBathTimerSecs;
                      const isRunning = iceBathRunning;
                      const isDone = timerSecs !== null && timerSecs <= 0 && iceBathRound >= iceBathTargetRounds;
                      const isBetweenRounds = timerSecs !== null && timerSecs <= 0 && iceBathRound < iceBathTargetRounds;
                      const display = timerSecs !== null
                        ? `${String(Math.floor(Math.max(0,timerSecs)/60)).padStart(2,"0")}:${String(Math.max(0,timerSecs)%60).padStart(2,"0")}`
                        : `${String(Math.floor(totalSecs/60)).padStart(2,"0")}:00`;
                      const progress = timerSecs !== null ? Math.max(0, timerSecs / totalSecs) : 1;
                      const startTimer = () => {
                        const startSecs = timerSecs !== null && timerSecs > 0 ? timerSecs : totalSecs;
                        setIceBathTimerSecs(startSecs);
                        setIceBathRunning(true);
                        clearInterval(iceBathIntervalRef.current);
                        let s = startSecs;
                        iceBathIntervalRef.current = setInterval(()=>{
                          s -= 1;
                          setIceBathTimerSecs(s);
                          if (s <= 0) {
                            clearInterval(iceBathIntervalRef.current);
                            setIceBathRunning(false);
                            haptic("heavy");
                            // check rounds via refs approach — use setState callback to get fresh round
                            setIceBathRound(prev => {
                              if (prev < iceBathTargetRounds) { setTimeout(()=>{setIceBathTimerSecs(null);}, 300); return prev+1; }
                              playDoneSound(); return prev;
                            });
                          }
                        }, 1000);
                      };
                      const pauseTimer = () => {
                        clearInterval(iceBathIntervalRef.current);
                        setIceBathRunning(false);
                      };
                      const resetTimer = () => {
                        clearInterval(iceBathIntervalRef.current);
                        setIceBathRunning(false);
                        setIceBathTimerSecs(null);
                        setIceBathRound(1);
                      };
                      const isAllDone = timerSecs !== null && timerSecs <= 0 && iceBathRound >= iceBathTargetRounds;
                      // arc for circular progress
                      const R = 54; const C = 2*Math.PI*R;
                      const timerColor = isDone ? GRNA : (progress < 0.2 ? REDA : rec.color);
                      return (
                        React.createElement('div', { style: {marginTop:14,padding:"14px 16px",background:`${BLU}10`,border:`1px solid ${BLU}30`,borderRadius:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8081}}
                          /* temperature slider */
                          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8083}}
                            , React.createElement('span', { style: {fontSize:12,fontWeight:700,color:T2,letterSpacing:0.3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8084}}, "🌡 WATER TEMPERATURE"  )
                            , React.createElement('span', { style: {fontSize:20,fontWeight:800,color:BLU}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8085}}, iceBathTemp, "°C")
                          )
                          , React.createElement('input', { type: "range", min: 3, max: 20, step: 1, value: iceBathTemp,
                            onChange: e=>{ if (!isRunning && timerSecs===null) setIceBathTemp(Number(e.target.value)); },
                            style: {width:"100%",accentColor:rec.color,cursor:"pointer",marginBottom:8,height:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8087}}
                          )
                          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:10,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8091}}
                            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8092}}, "3°C"), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8092}}, "10°C"), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8092}}, "20°C")
                          )
                          /* recommended time pill */
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"8px 14px",
                            background:`${rec.color}18`,border:`1px solid ${rec.color}40`,borderRadius:10,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8095}}
                            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8097}}
                              , React.createElement('div', { style: {fontSize:15,fontWeight:800,color:rec.color}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8098}}, rec.time)
                              , React.createElement('div', { style: {fontSize:11,color:T2,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8099}}, rec.label)
                            )
                          )
                          /* rounds selector */
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8103}}
                            , React.createElement('span', { style: {fontSize:12,color:T2,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8104}}, "Rounds:")
                            , React.createElement('button', { onClick: ()=>setIceBathTargetRounds(r=>Math.max(1,r-1)), disabled: isRunning,
                              style: {width:26,height:26,borderRadius:"50%",border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T2,fontSize:16,lineHeight:"24px",padding:0,opacity:isRunning?0.4:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8105}}, "−")
                            , React.createElement('span', { style: {fontSize:15,fontWeight:800,color:BLU,minWidth:18,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8107}}, iceBathTargetRounds)
                            , React.createElement('button', { onClick: ()=>setIceBathTargetRounds(r=>Math.min(10,r+1)), disabled: isRunning,
                              style: {width:26,height:26,borderRadius:"50%",border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T2,fontSize:16,lineHeight:"24px",padding:0,opacity:isRunning?0.4:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8108}}, "+")
                            , iceBathTargetRounds > 1 && React.createElement('span', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8110}}, "Round " , iceBathRound, "/", iceBathTargetRounds)
                          )
                          /* circular timer */
                          , React.createElement('div', { style: {display:"flex",flexDirection:"column",alignItems:"center",gap:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8113}}
                            , React.createElement('div', { style: {position:"relative",width:130,height:130}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8114}}
                              , React.createElement('svg', { width: "130", height: "130", style: {transform:"rotate(-90deg)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8115}}
                                , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: `${timerColor}22`, strokeWidth: "8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 8116}})
                                , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: timerColor, strokeWidth: "8",
                                  strokeDasharray: C, strokeDashoffset: C*(1-progress),
                                  strokeLinecap: "round",
                                  style: {transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8117}})
                              )
                              , React.createElement('div', { style: {position:"absolute",inset:0,display:"flex",flexDirection:"column",
                                alignItems:"center",justifyContent:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8122}}
                                , React.createElement('div', { style: {fontSize:isDone?22:26,fontWeight:800,color:timerColor,letterSpacing:1,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8124}}
                                  , isDone ? "✓ Done!" : display
                                )
                                , !isDone && React.createElement('div', { style: {fontSize:10,color:T3,marginTop:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8127}}
                                  , isRunning ? "in progress" : (timerSecs===null ? "ready" : "paused")
                                )
                              )
                            )
                            , isBetweenRounds && (
                              React.createElement('div', { style: {fontSize:12,color:GRNA,fontWeight:700,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8133}}, "✓ Round "
                                  , iceBathRound-1, " done — rest, then start next"
                              )
                            )
                            , React.createElement('div', { style: {display:"flex",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8137}}
                              , !isDone && !isRunning && (
                                React.createElement('button', { onClick: startTimer, style: {
                                  padding:"10px 28px",borderRadius:22,border:"none",cursor:"pointer",
                                  background:rec.color,color:"#000",fontSize:14,fontWeight:800,letterSpacing:0.3,
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8139}}, "▶ " , timerSecs===null?"Start":(isBetweenRounds?`Round ${iceBathRound}`:"Resume"))
                              )
                              , isRunning && (
                                React.createElement('button', { onClick: pauseTimer, style: {
                                  padding:"10px 28px",borderRadius:22,border:`2px solid ${rec.color}`,cursor:"pointer",
                                  background:"transparent",color:rec.color,fontSize:14,fontWeight:800,
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8145}}, "⏸ Pause" )
                              )
                              , timerSecs !== null && (
                                React.createElement('button', { onClick: resetTimer, style: {
                                  padding:"10px 18px",borderRadius:22,border:`1px solid ${BD}`,cursor:"pointer",
                                  background:"transparent",color:T3,fontSize:13,fontWeight:600,
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8151}}, "↺ Reset" )
                              )
                            )
                          )
                          , iceBathTemp<=5 && (
                            React.createElement('div', { style: {marginTop:12,fontSize:11,color:REDA,lineHeight:1.5,padding:"8px 12px",
                              background:`${REDA}12`,borderRadius:8,border:`1px solid ${REDA}30`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8159}}, "⚠️ Below 6°C increases cold shock response risk. Start at 10–12°C if new to cold immersion. Always have someone nearby."

                            )
                          )
                          , React.createElement('div', { style: {marginTop:10,fontSize:10,color:T3,lineHeight:1.4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8164}}, "Based on Bleakley et al. & Machado et al. systematic reviews. CWI at 10–15°C most evidence-supported for elite rugby recovery."

                          )
                        )
                      );
                    })()
                    /* sauna / hot bath timer */
                    , selectedSkill==="recovery" && !(swappedName) && (st.stage||"").toLowerCase().includes("hot bath") && (()=>{
                      // Science: 38°C=20min, 40°C=18min, 42°C=15min, 44°C=10min
                      const getHotBathMins = (t) => t <= 38 ? 20 : t <= 40 ? 18 : t <= 42 ? 15 : 10;
                      const recMins = getHotBathMins(hotBathTemp);
                      const TOTAL_SECS = recMins * 60;
                      const timerSecs = saunaTimerSecs;
                      const isRunning = saunaRunning;
                      const isDone = timerSecs !== null && timerSecs <= 0 && hotBathRound >= hotBathTargetRounds;
                      const isBetweenRounds = timerSecs !== null && timerSecs <= 0 && hotBathRound < hotBathTargetRounds;
                      const displayMins = String(Math.floor(Math.max(0,_nullishCoalesce(timerSecs, () => (TOTAL_SECS)))/60)).padStart(2,"0");
                      const displaySecs = String(Math.max(0,(_nullishCoalesce(timerSecs, () => (TOTAL_SECS))))%60).padStart(2,"0");
                      const display = `${displayMins}:${displaySecs}`;
                      const progress = timerSecs !== null ? Math.max(0, timerSecs / TOTAL_SECS) : 1;
                      const timerColor = isDone ? GRNA : (progress < 0.2 ? AMB : "#ff6b35");
                      const startTimer = () => {
                        const startSecs = timerSecs !== null && timerSecs > 0 ? timerSecs : TOTAL_SECS;
                        setSaunaTimerSecs(startSecs);
                        setSaunaRunning(true);
                        clearInterval(saunaIntervalRef.current);
                        let s = startSecs;
                        saunaIntervalRef.current = setInterval(()=>{
                          s -= 1;
                          setSaunaTimerSecs(s);
                          if (s <= 0) {
                            clearInterval(saunaIntervalRef.current);
                            setSaunaRunning(false);
                            haptic("heavy");
                            setHotBathRound(prev => {
                              if (prev < hotBathTargetRounds) { setTimeout(()=>{setSaunaTimerSecs(null);}, 300); return prev+1; }
                              playDoneSound(); return prev;
                            });
                          }
                        }, 1000);
                      };
                      const pauseTimer = () => { clearInterval(saunaIntervalRef.current); setSaunaRunning(false); };
                      const resetTimer = () => { clearInterval(saunaIntervalRef.current); setSaunaRunning(false); setSaunaTimerSecs(null); setHotBathRound(1); };
                      const R = 54; const C = 2*Math.PI*R;
                      const tempLabel = hotBathTemp <= 38 ? "Warm — relaxation" : hotBathTemp <= 40 ? "Optimal — vasodilation" : hotBathTemp <= 42 ? "Hot — deep tissue" : "Very hot — short only";
                      return (
                        React.createElement('div', { style: {marginTop:14,padding:"14px 16px",background:`#ff6b3510`,border:`1px solid #ff6b3530`,borderRadius:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8210}}
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8211}}
                            , React.createElement('span', { style: {fontSize:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8212}}, "🔥")
                            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8213}}
                              , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:"#ff6b35"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8214}}, recMins, " min — "   , hotBathTemp, "°C")
                              , React.createElement('div', { style: {fontSize:11,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8215}}, tempLabel)
                            )
                          )
                          /* Temperature slider */
                          , React.createElement('div', { style: {marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8219}}
                            , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:10,color:T3,marginBottom:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8220}}
                              , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8221}}, "38°C"), React.createElement('span', { style: {color:"#ff6b35",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8221}}, hotBathTemp, "°C"), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8221}}, "44°C")
                            )
                            , React.createElement('input', { type: "range", min: "38", max: "44", step: "1", value: hotBathTemp,
                              onChange: e=>{setHotBathTemp(Number(e.target.value));setSaunaTimerSecs(null);setSaunaRunning(false);clearInterval(saunaIntervalRef.current);},
                              style: {width:"100%",accentColor:"#ff6b35"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8223}})
                            , React.createElement('div', { style: {fontSize:10,color:T3,textAlign:"center",marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8226}}
                              , hotBathTemp<=38?"Comfortable warmth — 20 min safe":hotBathTemp<=40?"Sweet spot — maximum vasodilation":hotBathTemp<=42?"Hot — limit to 15 min":"Very hot — max 10 min, stay alert"
                            )
                          )
                          /* rounds selector */
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8231}}
                            , React.createElement('span', { style: {fontSize:12,color:T2,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8232}}, "Rounds:")
                            , React.createElement('button', { onClick: ()=>setHotBathTargetRounds(r=>Math.max(1,r-1)), disabled: isRunning,
                              style: {width:26,height:26,borderRadius:"50%",border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T2,fontSize:16,lineHeight:"24px",padding:0,opacity:isRunning?0.4:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8233}}, "−")
                            , React.createElement('span', { style: {fontSize:15,fontWeight:800,color:"#ff6b35",minWidth:18,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8235}}, hotBathTargetRounds)
                            , React.createElement('button', { onClick: ()=>setHotBathTargetRounds(r=>Math.min(10,r+1)), disabled: isRunning,
                              style: {width:26,height:26,borderRadius:"50%",border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T2,fontSize:16,lineHeight:"24px",padding:0,opacity:isRunning?0.4:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8236}}, "+")
                            , hotBathTargetRounds > 1 && React.createElement('span', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8238}}, "Round " , hotBathRound, "/", hotBathTargetRounds)
                          )
                          , React.createElement('div', { style: {display:"flex",flexDirection:"column",alignItems:"center",gap:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8240}}
                            , React.createElement('div', { style: {position:"relative",width:130,height:130}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8241}}
                              , React.createElement('svg', { width: "130", height: "130", style: {transform:"rotate(-90deg)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8242}}
                                , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: `${timerColor}22`, strokeWidth: "8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 8243}})
                                , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: timerColor, strokeWidth: "8",
                                  strokeDasharray: C, strokeDashoffset: C*(1-progress),
                                  strokeLinecap: "round",
                                  style: {transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8244}})
                              )
                              , React.createElement('div', { style: {position:"absolute",inset:0,display:"flex",flexDirection:"column",
                                alignItems:"center",justifyContent:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8249}}
                                , React.createElement('div', { style: {fontSize:isDone?22:26,fontWeight:800,color:timerColor,letterSpacing:1,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8251}}
                                  , isDone ? "✓ Done!" : display
                                )
                                , !isDone && React.createElement('div', { style: {fontSize:10,color:T3,marginTop:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8254}}
                                  , isRunning ? "in progress" : (timerSecs===null ? "ready" : "paused")
                                )
                              )
                            )
                            , isBetweenRounds && (
                              React.createElement('div', { style: {fontSize:12,color:GRNA,fontWeight:700,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8260}}, "✓ Round "
                                  , hotBathRound-1, " done — rest, then start next"
                              )
                            )
                            , React.createElement('div', { style: {display:"flex",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8264}}
                              , !isDone && !isRunning && (
                                React.createElement('button', { onClick: startTimer, style: {
                                  padding:"10px 28px",borderRadius:22,border:"none",cursor:"pointer",
                                  background:"#ff6b35",color:"#fff",fontSize:14,fontWeight:800,
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8266}}, "▶ " , timerSecs===null?"Start":(isBetweenRounds?`Round ${hotBathRound}`:"Resume"))
                              )
                              , isRunning && (
                                React.createElement('button', { onClick: pauseTimer, style: {
                                  padding:"10px 28px",borderRadius:22,border:`2px solid #ff6b35`,cursor:"pointer",
                                  background:"transparent",color:"#ff6b35",fontSize:14,fontWeight:800,
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8272}}, "⏸ Pause" )
                              )
                              , timerSecs !== null && (
                                React.createElement('button', { onClick: resetTimer, style: {
                                  padding:"10px 18px",borderRadius:22,border:`1px solid ${BD}`,cursor:"pointer",
                                  background:"transparent",color:T3,fontSize:13,fontWeight:600,
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8278}}, "↺ Reset" )
                              )
                            )
                          )
                        )
                      );
                    })()
                    /* Sauna timer */
                    , selectedSkill==="recovery" && !(swappedName) && (st.stage||"").toLowerCase().includes("sauna") && (()=>{
                      // Science: 70°C=20min, 80°C=15min, 90°C=12min, 100°C=8min max
                      const getSaunaRec = (t) => {
                        if (t <= 70) return { time:"20 min", mins:20, label:"Mild — good for beginners", color:"#e05c00" };
                        if (t <= 80) return { time:"15 min", mins:15, label:"✓ Optimal — peak GH response", color:"#ff6b35" };
                        if (t <= 90) return { time:"12 min", mins:12, label:"Hot — experienced only", color:AMB };
                        return        { time:"8 min max", mins:8,  label:"⚠️ Very hot — exit if dizzy",  color:REDA };
                      };
                      const rec = getSaunaRec(saunaTemp);
                      const TOTAL_SECS = rec.mins * 60;
                      const timerSecs = saunaCabineTimerSecs;
                      const isRunning = saunaCabineRunning;
                      const isDone = timerSecs !== null && timerSecs <= 0 && saunaRound >= saunaTargetRounds;
                      const isBetweenRounds = timerSecs !== null && timerSecs <= 0 && saunaRound < saunaTargetRounds;
                      const dispM = String(Math.floor(Math.max(0,_nullishCoalesce(timerSecs, () => (TOTAL_SECS)))/60)).padStart(2,"0");
                      const dispS = String(Math.max(0,(_nullishCoalesce(timerSecs, () => (TOTAL_SECS))))%60).padStart(2,"0");
                      const progress = timerSecs !== null ? Math.max(0, timerSecs / TOTAL_SECS) : 1;
                      const timerColor = isDone ? GRNA : (progress < 0.2 ? REDA : rec.color);
                      const R = 54; const C = 2*Math.PI*R;
                      const startTimer = () => {
                        const s0 = timerSecs !== null && timerSecs > 0 ? timerSecs : TOTAL_SECS;
                        setSaunaCabineTimerSecs(s0); setSaunaCabineRunning(true);
                        clearInterval(saunaCabineIntervalRef.current);
                        let s = s0;
                        saunaCabineIntervalRef.current = setInterval(()=>{
                          s -= 1; setSaunaCabineTimerSecs(s);
                          if (s <= 0) {
                            clearInterval(saunaCabineIntervalRef.current); setSaunaCabineRunning(false); haptic("heavy");
                            setSaunaRound(prev => {
                              if (prev < saunaTargetRounds) { setTimeout(()=>{setSaunaCabineTimerSecs(null);}, 300); return prev+1; }
                              playDoneSound(); return prev;
                            });
                          }
                        }, 1000);
                      };
                      const pauseTimer = () => { clearInterval(saunaCabineIntervalRef.current); setSaunaCabineRunning(false); };
                      const resetTimer = () => { clearInterval(saunaCabineIntervalRef.current); setSaunaCabineRunning(false); setSaunaCabineTimerSecs(null); setSaunaRound(1); };
                      return (
                        React.createElement('div', { style: {marginTop:14,padding:"14px 16px",background:`${rec.color}10`,border:`1px solid ${rec.color}30`,borderRadius:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8327}}
                          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8328}}
                            , React.createElement('span', { style: {fontSize:12,fontWeight:700,color:T2,letterSpacing:0.3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8329}}, "🌡 SAUNA TEMPERATURE"  )
                            , React.createElement('span', { style: {fontSize:20,fontWeight:800,color:rec.color}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8330}}, saunaTemp, "°C")
                          )
                          , React.createElement('input', { type: "range", min: 60, max: 100, step: 5, value: saunaTemp,
                            onChange: e=>{ if (!isRunning && timerSecs===null) { setSaunaTemp(Number(e.target.value)); } },
                            style: {width:"100%",accentColor:rec.color,cursor:"pointer",marginBottom:8,height:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8332}})
                          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",fontSize:10,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8335}}
                            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8336}}, "60°C"), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8336}}, "80°C"), React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8336}}, "100°C")
                          )
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"8px 14px",
                            background:`${rec.color}18`,border:`1px solid ${rec.color}40`,borderRadius:10,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8338}}
                            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8340}}
                              , React.createElement('div', { style: {fontSize:15,fontWeight:800,color:rec.color}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8341}}, rec.time)
                              , React.createElement('div', { style: {fontSize:11,color:T2,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8342}}, rec.label)
                            )
                          )
                          /* rounds selector — sauna defaults to 3 */
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8346}}
                            , React.createElement('span', { style: {fontSize:12,color:T2,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8347}}, "Rounds:")
                            , React.createElement('button', { onClick: ()=>setSaunaTargetRounds(r=>Math.max(1,r-1)), disabled: isRunning,
                              style: {width:26,height:26,borderRadius:"50%",border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T2,fontSize:16,lineHeight:"24px",padding:0,opacity:isRunning?0.4:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8348}}, "−")
                            , React.createElement('span', { style: {fontSize:15,fontWeight:800,color:rec.color,minWidth:18,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8350}}, saunaTargetRounds)
                            , React.createElement('button', { onClick: ()=>setSaunaTargetRounds(r=>Math.min(10,r+1)), disabled: isRunning,
                              style: {width:26,height:26,borderRadius:"50%",border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T2,fontSize:16,lineHeight:"24px",padding:0,opacity:isRunning?0.4:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8351}}, "+")
                            , saunaTargetRounds > 1 && React.createElement('span', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8353}}, "Round " , saunaRound, "/", saunaTargetRounds)
                          )
                          , React.createElement('div', { style: {display:"flex",flexDirection:"column",alignItems:"center",gap:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8355}}
                            , React.createElement('div', { style: {position:"relative",width:130,height:130}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8356}}
                              , React.createElement('svg', { width: "130", height: "130", style: {transform:"rotate(-90deg)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8357}}
                                , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: `${timerColor}22`, strokeWidth: "8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 8358}})
                                , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: timerColor, strokeWidth: "8",
                                  strokeDasharray: C, strokeDashoffset: C*(1-progress), strokeLinecap: "round",
                                  style: {transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8359}})
                              )
                              , React.createElement('div', { style: {position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8363}}
                                , React.createElement('div', { style: {fontSize:isDone?22:26,fontWeight:800,color:timerColor,letterSpacing:1,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8364}}
                                  , isDone ? "✓ Done!" : `${dispM}:${dispS}`
                                )
                                , !isDone && React.createElement('div', { style: {fontSize:10,color:T3,marginTop:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8367}}
                                  , isRunning ? "in progress" : (timerSecs===null ? "ready" : "paused")
                                )
                              )
                            )
                            , isBetweenRounds && (
                              React.createElement('div', { style: {fontSize:12,color:GRNA,fontWeight:700,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8373}}, "✓ Round "
                                  , saunaRound-1, " done — cool down, then next"
                              )
                            )
                            , React.createElement('div', { style: {display:"flex",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8377}}
                              , !isDone && !isRunning && (
                                React.createElement('button', { onClick: startTimer, style: {padding:"10px 28px",borderRadius:22,border:"none",cursor:"pointer",background:rec.color,color:"#fff",fontSize:14,fontWeight:800}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8379}}, "▶ "
                                   , timerSecs===null?"Start":(isBetweenRounds?`Round ${saunaRound}`:"Resume")
                                )
                              )
                              , isRunning && (
                                React.createElement('button', { onClick: pauseTimer, style: {padding:"10px 28px",borderRadius:22,border:`2px solid ${rec.color}`,cursor:"pointer",background:"transparent",color:rec.color,fontSize:14,fontWeight:800}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8384}}, "⏸ Pause"

                                )
                              )
                              , timerSecs !== null && (
                                React.createElement('button', { onClick: resetTimer, style: {padding:"10px 18px",borderRadius:22,border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T3,fontSize:13,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8389}}, "↺ Reset"

                                )
                              )
                            )
                          )
                        )
                      );
                    })()

                    /* EMS timer */
                    , selectedSkill==="recovery" && !(swappedName) && (st.stage||"").toLowerCase().includes("electrostimulation") && (()=>{
                      const EMS_TOTAL = 20 * 60;
                      const emsAllDone = emsTimerSecs !== null && emsTimerSecs <= 0 && emsRound >= emsTargetRounds;
                      const emsBetween = emsTimerSecs !== null && emsTimerSecs <= 0 && emsRound < emsTargetRounds;
                      const dispM = String(Math.floor(Math.max(0,_nullishCoalesce(emsTimerSecs, () => (EMS_TOTAL)))/60)).padStart(2,"0");
                      const dispS = String(Math.max(0,(_nullishCoalesce(emsTimerSecs, () => (EMS_TOTAL))))%60).padStart(2,"0");
                      const progress = emsTimerSecs !== null ? Math.max(0, emsTimerSecs / EMS_TOTAL) : 1;
                      const col = emsAllDone ? GRNA : (progress < 0.2 ? AMB : BLU);
                      const R = 54; const C = 2*Math.PI*R;
                      const startEms = () => {
                        const s0 = emsTimerSecs !== null && emsTimerSecs > 0 ? emsTimerSecs : EMS_TOTAL;
                        setEmsTimerSecs(s0); setEmsRunning(true); clearInterval(emsIntervalRef.current);
                        let s = s0;
                        emsIntervalRef.current = setInterval(()=>{
                          s-=1; setEmsTimerSecs(s);
                          if(s<=0){
                            clearInterval(emsIntervalRef.current); setEmsRunning(false); haptic("heavy");
                            setEmsRound(prev => {
                              if (prev < emsTargetRounds) { setTimeout(()=>{setEmsTimerSecs(null);},300); return prev+1; }
                              playDoneSound(); return prev;
                            });
                          }
                        },1000);
                      };
                      return (
                        React.createElement('div', { style: {marginTop:14,padding:"14px 16px",background:`${BLU}10`,border:`1px solid ${BLU}30`,borderRadius:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8425}}
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8426}}
                            , React.createElement('span', { style: {fontSize:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8427}}, "⚡")
                            , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8428}}
                              , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:BLU}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8429}}, "EMS — 20 min session"    )
                              , React.createElement('div', { style: {fontSize:11,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8430}}, "Low frequency recovery mode (1–10 Hz)"     )
                            )
                          )
                          /* rounds selector */
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8434}}
                            , React.createElement('span', { style: {fontSize:12,color:T2,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8435}}, "Rounds:")
                            , React.createElement('button', { onClick: ()=>setEmsTargetRounds(r=>Math.max(1,r-1)), disabled: emsRunning,
                              style: {width:26,height:26,borderRadius:"50%",border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T2,fontSize:16,lineHeight:"24px",padding:0,opacity:emsRunning?0.4:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8436}}, "−")
                            , React.createElement('span', { style: {fontSize:15,fontWeight:800,color:BLU,minWidth:18,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8438}}, emsTargetRounds)
                            , React.createElement('button', { onClick: ()=>setEmsTargetRounds(r=>Math.min(10,r+1)), disabled: emsRunning,
                              style: {width:26,height:26,borderRadius:"50%",border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T2,fontSize:16,lineHeight:"24px",padding:0,opacity:emsRunning?0.4:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8439}}, "+")
                            , emsTargetRounds > 1 && React.createElement('span', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8441}}, "Round " , emsRound, "/", emsTargetRounds)
                          )
                          , React.createElement('div', { style: {display:"flex",flexDirection:"column",alignItems:"center",gap:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8443}}
                            , React.createElement('div', { style: {position:"relative",width:130,height:130}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8444}}
                              , React.createElement('svg', { width: "130", height: "130", style: {transform:"rotate(-90deg)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8445}}
                                , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: `${col}22`, strokeWidth: "8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 8446}})
                                , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: col, strokeWidth: "8",
                                  strokeDasharray: C, strokeDashoffset: C*(1-progress), strokeLinecap: "round",
                                  style: {transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8447}})
                              )
                              , React.createElement('div', { style: {position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8451}}
                                , React.createElement('div', { style: {fontSize:emsAllDone?22:26,fontWeight:800,color:col,letterSpacing:1,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8452}}, emsAllDone?"✓ Done!":`${dispM}:${dispS}`)
                                , !emsAllDone&&React.createElement('div', { style: {fontSize:10,color:T3,marginTop:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8453}}, emsRunning?"in progress":(emsTimerSecs===null?"ready":"paused"))
                              )
                            )
                            , emsBetween && (
                              React.createElement('div', { style: {fontSize:12,color:GRNA,fontWeight:700,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8457}}, "✓ Round "
                                  , emsRound-1, " done — rest, then start next"
                              )
                            )
                            , React.createElement('div', { style: {display:"flex",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8461}}
                              , !emsAllDone&&!emsRunning&&React.createElement('button', { onClick: startEms, style: {padding:"10px 28px",borderRadius:22,border:"none",cursor:"pointer",background:BLU,color:"#fff",fontSize:14,fontWeight:800}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8462}}, "▶ " , emsTimerSecs===null?"Start":(emsBetween?`Round ${emsRound}`:"Resume"))
                              , emsRunning&&React.createElement('button', { onClick: ()=>{clearInterval(emsIntervalRef.current);setEmsRunning(false);}, style: {padding:"10px 28px",borderRadius:22,border:`2px solid ${BLU}`,cursor:"pointer",background:"transparent",color:BLU,fontSize:14,fontWeight:800}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8463}}, "⏸ Pause" )
                              , emsTimerSecs!==null&&React.createElement('button', { onClick: ()=>{clearInterval(emsIntervalRef.current);setEmsRunning(false);setEmsTimerSecs(null);setEmsRound(1);}, style: {padding:"10px 18px",borderRadius:22,border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T3,fontSize:13,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8464}}, "↺ Reset" )
                            )
                          )
                        )
                      );
                    })()

                    /* Contrast baths timer — alternating hot/cold cycles */
                    , selectedSkill==="recovery" && !(swappedName) && (st.stage||"").toLowerCase().includes("contrast") && (()=>{
                      const HOT_SECS = 3 * 60;
                      const COLD_SECS = 1 * 60;
                      const TOTAL_CYCLES = 4;
                      const phaseSecs = contrastPhase === "hot" ? HOT_SECS : COLD_SECS;
                      const isDone = contrastCycle > TOTAL_CYCLES;
                      const dispM = String(Math.floor(Math.max(0,_nullishCoalesce(contrastSecs, () => (phaseSecs)))/60)).padStart(2,"0");
                      const dispS = String(Math.max(0,(_nullishCoalesce(contrastSecs, () => (phaseSecs))))%60).padStart(2,"0");
                      const progress = contrastSecs !== null ? Math.max(0, contrastSecs / phaseSecs) : 1;
                      const phaseCol = contrastPhase === "hot" ? "#ff6b35" : BLU;
                      const R = 54; const C = 2*Math.PI*R;
                      const nextPhase = () => {
                        clearInterval(contrastIntervalRef.current);
                        setContrastRunning(false);
                        if (contrastPhase === "hot") {
                          setContrastPhase("cold"); setContrastSecs(null);
                        } else {
                          const nextCycle = contrastCycle + 1;
                          setContrastCycle(nextCycle);
                          setContrastPhase("hot"); setContrastSecs(null);
                          if (nextCycle > TOTAL_CYCLES) { haptic("heavy"); playDoneSound(); }
                        }
                      };
                      const startContrast = () => {
                        const s0 = contrastSecs !== null && contrastSecs > 0 ? contrastSecs : phaseSecs;
                        setContrastSecs(s0); setContrastRunning(true); clearInterval(contrastIntervalRef.current);
                        let s = s0;
                        contrastIntervalRef.current = setInterval(()=>{
                          s-=1; setContrastSecs(s);
                          if (s <= 0) { clearInterval(contrastIntervalRef.current); setContrastRunning(false); haptic("medium"); nextPhase(); }
                        }, 1000);
                      };
                      const resetContrast = () => { clearInterval(contrastIntervalRef.current); setContrastRunning(false); setContrastSecs(null); setContrastPhase("hot"); setContrastCycle(1); };
                      return (
                        React.createElement('div', { style: {marginTop:14,padding:"14px 16px",background:`${phaseCol}10`,border:`1px solid ${phaseCol}30`,borderRadius:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8506}}
                          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8507}}
                            , React.createElement('span', { style: {fontSize:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8508}}, "🔄")
                            , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8509}}
                              , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:phaseCol}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8510}}, "Contrast baths — "   , TOTAL_CYCLES, " cycles" )
                              , React.createElement('div', { style: {fontSize:11,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8511}}, "3 min hot → 1 min cold · finish cold"         )
                            )
                          )
                          , React.createElement('div', { style: {display:"flex",flexDirection:"column",alignItems:"center",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8514}}
                            /* Cycle progress dots */
                            , React.createElement('div', { style: {display:"flex",gap:6,alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8516}}
                              , Array.from({length:TOTAL_CYCLES},(_,ci)=>(
                                React.createElement('div', { key: ci, style: {width:10,height:10,borderRadius:"50%",
                                  background:ci+1 < contrastCycle ? GRNA : ci+1 === contrastCycle ? phaseCol : `${BD}60`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8518}})
                              ))
                              , React.createElement('span', { style: {fontSize:11,color:T2,marginLeft:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8521}}
                                , isDone ? "Complete!" : `Cycle ${contrastCycle}/${TOTAL_CYCLES} — ${contrastPhase === "hot" ? "🔥 Hot (3 min)" : "🧊 Cold (1 min)"}`
                              )
                            )
                            , !isDone && (
                              React.createElement(React.Fragment, null
                                , React.createElement('div', { style: {position:"relative",width:130,height:130}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8527}}
                                  , React.createElement('svg', { width: "130", height: "130", style: {transform:"rotate(-90deg)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8528}}
                                    , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: `${phaseCol}22`, strokeWidth: "8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 8529}})
                                    , React.createElement('circle', { cx: "65", cy: "65", r: R, fill: "none", stroke: phaseCol, strokeWidth: "8",
                                      strokeDasharray: C, strokeDashoffset: C*(1-progress), strokeLinecap: "round",
                                      style: {transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8530}})
                                  )
                                  , React.createElement('div', { style: {position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8534}}
                                    , React.createElement('div', { style: {fontSize:26,fontWeight:800,color:phaseCol,letterSpacing:1,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8535}}, `${dispM}:${dispS}`)
                                    , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8536}}, contrastRunning?"in progress":(contrastSecs===null?"ready":"paused"))
                                  )
                                )
                                , React.createElement('div', { style: {display:"flex",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8539}}
                                  , !contrastRunning&&React.createElement('button', { onClick: startContrast, style: {padding:"10px 22px",borderRadius:22,border:"none",cursor:"pointer",background:phaseCol,color:"#fff",fontSize:14,fontWeight:800}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8540}}, "▶ " , contrastSecs===null?"Start":"Resume")
                                  , contrastRunning&&React.createElement('button', { onClick: ()=>{clearInterval(contrastIntervalRef.current);setContrastRunning(false);}, style: {padding:"10px 22px",borderRadius:22,border:`2px solid ${phaseCol}`,cursor:"pointer",background:"transparent",color:phaseCol,fontSize:14,fontWeight:800}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8541}}, "⏸ Pause" )
                                  , React.createElement('button', { onClick: nextPhase, style: {padding:"10px 14px",borderRadius:22,border:`1px solid ${phaseCol}50`,cursor:"pointer",background:"transparent",color:phaseCol,fontSize:12,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8542}}, "→ Skip" )
                                  , React.createElement('button', { onClick: resetContrast, style: {padding:"10px 14px",borderRadius:22,border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T3,fontSize:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8543}}, "↺")
                                )
                              )
                            )
                            , isDone && (
                              React.createElement('div', { style: {textAlign:"center",padding:"12px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8548}}
                                , React.createElement('div', { style: {fontSize:28,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8549}}, "✓")
                                , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:GRNA}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8550}}, "Contrast session complete!"  )
                                , React.createElement('button', { onClick: resetContrast, style: {marginTop:10,padding:"8px 18px",borderRadius:20,border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:T3,fontSize:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8551}}, "↺ Reset" )
                              )
                            )
                          )
                        )
                      );
                    })()

                    /* last weight badge — shown when set and not plank */
                    , (()=>{
                      if ((swapped || st.text) === "PROGRESSIVE_PLANK") return null;
                      // Always look up directly from settings by stage name AND by index
                      // so it works even if buildProgressionSession didn't carry lastWeight through
                      let lw = "";
                      try {
                        const cp = JSON.parse(store.get("rwc_settings")||"{}");
                        const progEntries = Object.entries(_optionalChain([cp, 'optionalAccess', _231 => _231.customProgressions, 'optionalAccess', _232 => _232[selectedSkill]])||{});
                        const stageName = (st.stage||st.name||"").toLowerCase().replace(/\s+/g,"_");
                        // First try to match by _cpIdx
                        if (st._cpIdx !== undefined) {
                          const byIdx = _optionalChain([cp, 'optionalAccess', _233 => _233.customProgressions, 'optionalAccess', _234 => _234[selectedSkill], 'optionalAccess', _235 => _235[st._cpIdx]]);
                          if (_optionalChain([byIdx, 'optionalAccess', _236 => _236.lastWeight])) lw = byIdx.lastWeight;
                        }
                        // Then fall back to name match
                        if (!lw && stageName) {
                          for (const [,entry] of progEntries) {
                            if (typeof entry==="object" && entry.lastWeight) {
                              const entryName = (entry.name||"").toLowerCase().replace(/\s+/g,"_");
                              if (entryName === stageName) { lw = entry.lastWeight; break; }
                            }
                          }
                        }
                        // Also try from st.lastWeight (from buildProgressionSession)
                        if (!lw && st.lastWeight) lw = st.lastWeight;
                      } catch (e84) {}
                      if (!lw) return null;
                      return (
                        React.createElement('div', { style: {marginTop:6,display:"inline-flex",alignItems:"center",gap:5,
                          background:`${GOLD}18`,border:`1px solid ${GOLD}44`,borderRadius:8,
                          padding:"3px 10px",fontSize:12,color:GOLD,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8588}}, "🏋 Last used: "
                             , lw
                        )
                      );
                    })()
                    /* timer button — from explicit timer field or extracted from text */
                    , (()=>{
                      const stageText = swapped || st.text;
                      // Also check settings directly for timer (in case buildProgressionSession missed it)
                      let stTimer = st.timer || "";
                      if (!stTimer) {
                        try {
                          const cp = JSON.parse(store.get("rwc_settings")||"{}");
                          const cpIdx = st._cpIdx !== undefined ? st._cpIdx : i;
                          const stageCp = _optionalChain([cp, 'optionalAccess', _237 => _237.customProgressions, 'optionalAccess', _238 => _238[selectedSkill], 'optionalAccess', _239 => _239[cpIdx]]);
                          if (_optionalChain([stageCp, 'optionalAccess', _240 => _240.timer])) stTimer = stageCp.timer;
                        } catch (e85) {}
                      }
                      let secs = 0;
                      if (stTimer && stTimer.trim()) {
                        const t = stTimer.toLowerCase().trim();
                        const minMatch = t.match(/(\d+(?:\.\d+)?)\s*m(?:in)?/);
                        const secMatch = t.match(/(\d+(?:\.\d+)?)\s*s(?:ec)?/);
                        if (minMatch) secs = Math.round(parseFloat(minMatch[1]) * 60);
                        else if (secMatch) secs = Math.round(parseFloat(secMatch[1]));
                        else secs = parseInt(t) || 0;
                      } else {
                        secs = extractSeconds(stageText);
                      }
                      if (!secs) return null;
                      const timerKey = `${selectedSkill}_${i}`;
                      const isActive = _optionalChain([activeTimer, 'optionalAccess', _241 => _241.key]) === timerKey;
                      const t = isActive ? activeTimer : null;
                      const done = t && t.remaining === 0;
                      return (
                        React.createElement('div', { style: {marginTop:8,display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8625}}
                          /* timer display */
                          , React.createElement('div', { style: {
                            fontSize:20,fontWeight:700,letterSpacing:"-0.02em",
                            color:done?GRNA:isActive?GOLD:T3,minWidth:48,
                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8627}}
                            , isActive ? fmtTimer(t.remaining) : fmtTimer(secs)
                          )
                          /* start/pause/reset buttons */
                          , !isActive || done ? (
                            React.createElement('button', { onClick: ()=>{
                              unlockAudio();
                              haptic("light");
                              setActiveTimer({key:timerKey,secs,remaining:secs,running:true});
                            }, style: {
                              fontSize:12,fontWeight:700,padding:"5px 14px",borderRadius:20,border:"none",
                              background:done?S2:GOLD,color:done?T3:BG,cursor:"pointer",
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8635}}, done?"↺ again":"▶ start")
                          ) : (
                            React.createElement(React.Fragment, null
                              , React.createElement('button', { onClick: ()=>setActiveTimer(t=>({...t,running:!t.running})), style: {
                                fontSize:12,fontWeight:700,padding:"5px 14px",borderRadius:20,border:"none",
                                background:t.running?AMB:GRNA,color:BG,cursor:"pointer",
                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8645}}, t.running?"⏸ pause":"▶ resume")
                              , React.createElement('button', { onClick: ()=>setActiveTimer(null), style: {
                                fontSize:11,color:T3,background:"transparent",border:"none",cursor:"pointer",padding:0,
                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8649}}, "✕")
                            )
                          )
                          , done&&React.createElement('span', { style: {fontSize:12,color:GRNA,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8654}}, "✓ done" )
                        )
                      );
                    })()
                    , swapped && (
                      React.createElement('button', { onClick: ()=>{
                        const updated = {...stageSwaps};
                        delete updated[swapKey];
                        setStageSwaps(updated);
                        store.set("rwc_swaps_"+(isViewingToday?todayK:viewingDate), JSON.stringify(updated));
                      }, style: {fontSize:10,color:T3,background:"transparent",border:"none",cursor:"pointer",padding:0,marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8659}}, "↺ restore original"

                      )
                    )
                  )
                  /* alternative drill picker */
                  , isSwapOpen && (
                    React.createElement('div', { style: {marginTop:10,borderTop:`1px solid ${BD}`,paddingTop:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8671}}
                      , React.createElement('div', { style: {fontSize:10,color:T3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8672}}, "Pick an alternative"  )
                      , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8673}}
                        , altDrills.map((d,j)=>(
                          React.createElement('button', { key: j, onClick: ()=>{
                            const updated = {...stageSwaps, [swapKey]:{name:d.name, text:d.execution}};
                            setStageSwaps(updated);
                            store.set("rwc_swaps_"+(isViewingToday?todayK:viewingDate), JSON.stringify(updated));
                            setStageSwapOpen(null);
                          }, style: {
                            textAlign:"left",padding:"9px 12px",borderRadius:10,
                            border:`1px solid ${d.custom?GOLD:BD}`,background:d.custom?GOLDDIM:S2,
                            color:T2,fontSize:12,cursor:"pointer",
                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8675}}
                            , d.custom&&React.createElement('span', { style: {fontSize:9,color:GOLD,fontWeight:700,marginRight:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8685}}, "YOURS")
                            , React.createElement('span', { style: {fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8686}}, d.name)
                            , !d.custom&&d.cue&&React.createElement('span', { style: {color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8687}}, " — "  , d.cue)
                            , d.custom&&React.createElement('div', { style: {fontSize:11,color:T2,marginTop:3,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8688}}, d.execution.slice(0,80), d.execution.length>80?"…":"")
                          )
                        ))
                      )
                      , React.createElement('button', { onClick: ()=>setStageSwapOpen(null), style: {
                        marginTop:6,fontSize:10,color:T3,background:"transparent",
                        border:"none",cursor:"pointer",padding:0,
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8692}}, "cancel")
                    )
                  )
                )/* end isExpanded */
              )
            );
          })
        )
      )
    );
  }

  const renderSkillCards = () => {
    // ── Mental task card — same tap behaviour as skill cards ─────────────────
    const mentalCard = (() => {
      const t = todayMentalTask;
      return (
        React.createElement('div', { key: "mental_daily", style: {
          ...card, padding:"14px 16px",
          borderLeft:`3px solid ${mentalDone?GRNA:PRP}`,
          opacity: mentalDone ? 0.55 : 1,
          display:"flex", alignItems:"center", gap:14,
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8712}}
          , React.createElement('button', { onClick: ()=>{ mentalDone ? uncompleteMentalTask() : setShowMentalTask(true); }, style: {
            flex:1, display:"flex", alignItems:"center", gap:14,
            background:"transparent", border:"none", cursor:"pointer", textAlign:"left", padding:0,
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8718}}
            , React.createElement('div', { style: {fontSize:24, flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8722}}, t.icon)
            , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8723}}
              , React.createElement('div', { style: {display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8724}}
                , React.createElement('span', { style: {fontSize:15, fontWeight:700, color:mentalDone?T3:T1,
                  textDecoration:mentalDone?"line-through":"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8725}}, t.title)
              )
              , React.createElement('div', { style: {display:"flex", gap:6, alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8728}}
                , React.createElement('span', { style: {fontSize:9,color:PRP,background:PRP+"22",borderRadius:6,padding:"2px 7px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8729}}, t.pillar)
                , React.createElement('span', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8730}}, "⏱ " , t.duration)
              )
            )
            , React.createElement('span', { style: {fontSize:14, color:T3, flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8733}}, mentalDone?"":"›")
          )
          /* done checkbox */
          , React.createElement('button', { onClick: ()=>{ mentalDone ? uncompleteMentalTask() : completeMentalTask(""); }, style: {
            width:28, height:28, borderRadius:8, flexShrink:0, cursor:"pointer",
            border:`1.5px solid ${mentalDone?GOLD:T3}`,
            background:mentalDone?GOLD:"transparent",
            display:"flex", alignItems:"center", justifyContent:"center",
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8736}}
            , mentalDone&&React.createElement('span', { style: {color:BG,fontSize:14,fontWeight:900,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8742}}, "✓")
          )
        )
      );
    })();

    const seen={};
    const deduped=[];
    skills.forEach((sk,pos)=>{seen[sk]=(seen[sk]||0)+1; deduped.push({sk,idx:seen[sk],pos});});
    return [mentalCard, ...deduped.map(({sk,idx,pos})=>{
      const cardKey=`${sk}_pos${pos}`;
      const s=SKILLS[sk];
      const isDone=!!done[cardKey];
      const isSkipped=false; // skip now removes task from list entirely
      const isExpanded=seen[sk]>1&&idx>1;
      const skillScores=scores.filter(sc=>sc.skillKey===sk).sort((a,b)=>b.date.localeCompare(a.date));
      const lastScore=skillScores[0];
      const prevScore=skillScores[1];
      const trend=lastScore&&prevScore?(lastScore.rating>prevScore.rating?"up":lastScore.rating<prevScore.rating?"down":"flat"):null;
      const trendColor=trend==="up"?GRNA:trend==="down"?REDA:T3;
      const trendIcon=trend==="up"?"↑":trend==="down"?"↓":"→";
      // decay — how long since this skill was trained
      const lastTrainedDays = getSkillLastTrained(todayK)[sk];
      const cold = lastTrainedDays!=null && lastTrainedDays > 7;
      const frozen = lastTrainedDays!=null && lastTrainedDays > 14;
      const decayColor = frozen ? "#4fc3f7" : AMB; // icy blue if 14+ days, amber if 7+
      const decayLabel = frozen ? `❄️ ${lastTrainedDays}d` : cold ? `🌡️ ${lastTrainedDays}d` : null;
      return (
        React.createElement('div', { key: cardKey, style: {
          ...card,display:"flex",alignItems:"center",gap:14,
          padding:"16px 16px",
          borderLeft:`3px solid ${isDone?"#3d5a3d":isSkipped?REDA:_optionalChain([s, 'optionalAccess', _242 => _242.color])||GRNA}`,
          opacity:isDone?0.55:isSkipped?0.6:1,
          background:isSkipped?REDDIM:S1,
          transition:"background-color 0.2s,border-color 0.2s",flexDirection:"column",
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8770}}
          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:14,width:"100%"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8778}}
            , React.createElement('button', { onClick: ()=>{setSkill(sk);setSkillIdx(pos);setTrackNote("");setTrackDuration("");setTrackRating(0);setTrackSaved(false);setExpandedStages({});}, style: {
              flex:1,display:"flex",alignItems:"center",gap:14,
              background:"transparent",border:"none",cursor:"pointer",textAlign:"left",padding:0,
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8779}}
              , React.createElement('div', { style: {fontSize:24,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8783}}, _optionalChain([s, 'optionalAccess', _243 => _243.icon])||"🏉")
              , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8784}}
                , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:7}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8785}}
                  , React.createElement('span', { style: {fontSize:15,fontWeight:700,
                    color:isDone?T3:isSkipped?REDA:T1,
                    textDecoration:isDone||isSkipped?"line-through":"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8786}}, _optionalChain([s, 'optionalAccess', _244 => _244.name])||sk)
                  , algoMeta.retrySkills.includes(sk)&&!isDone&&(
                    React.createElement('span', { style: {fontSize:9,color:REDA,background:REDDIM,borderRadius:6,padding:"2px 6px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8790}}, "retry")
                  )
                  , isExpanded&&React.createElement('span', { style: {fontSize:9,color:GOLD,background:GOLDDIM,borderRadius:6,padding:"2px 6px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8792}}, "+extra")
                  , decayLabel&&!isDone&&(
                    React.createElement('span', { style: {fontSize:9,color:decayColor,background:decayColor+"22",borderRadius:6,padding:"2px 6px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8794}}, decayLabel)
                  )
                  , lastScore&&(
                    React.createElement('span', { style: {fontSize:11,color:trendColor,fontWeight:700,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8797}}
                      , lastScore.rating, "/5", trend&&React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8798}}, trendIcon)
                    )
                  )
                )
              )
              , React.createElement('div', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8803}}, "→")
            )
            , !isSkipped&&React.createElement('button', { onClick: e=>{e.stopPropagation();toggleDone(cardKey,sk,pos);}, style: {
              width:28,height:28,borderRadius:8,flexShrink:0,cursor:"pointer",
              border:`1.5px solid ${isDone?GOLD:T3}`,
              background:isDone?GOLD:"transparent",
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"background-color 0.15s,border-color 0.15s,color 0.15s",
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8805}}
              , isDone&&React.createElement('span', { style: {color:BG,fontSize:14,fontWeight:900,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8812}}, "✓")
            )
          )

          /* skip / can't do */
          , !isDone&&isSkipped&&(
            React.createElement('button', { onClick: e=>{
              e.stopPropagation();
              const updated={...skipped};delete updated[cardKey];
              setSkipped(updated);store.set("rwc_skipped_"+todayK,JSON.stringify(updated));
            }, style: {alignSelf:"flex-start",fontSize:10,color:T3,background:"transparent",border:"none",cursor:"pointer",padding:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8818}}, "↩ undo skip"

            )
          )
          , !isDone&&!isSkipped&&swapReason!==sk&&(
            React.createElement('div', { style: {display:"flex",gap:14,alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8827}}
              , React.createElement('button', { onClick: e=>{e.stopPropagation();setSwapReason(sk);}, style: {
                fontSize:10,color:T3,background:"transparent",border:"none",cursor:"pointer",padding:0,letterSpacing:"0.03em",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8828}}, "Can't do this →"   )
              , React.createElement('button', { onClick: e=>{
                e.stopPropagation();
                // remove from frozen list — remap done/skipped keys for shifted positions
                const currentSkills = frozenSkills||[];
                const updatedSkills = currentSkills.filter((_,i)=>i!==pos);
                setFrozenSkills(updatedSkills);
                store.set("rwc_skills_"+todayK,JSON.stringify(updatedSkills));
                // remap done keys: shift all positions after the removed one down by 1
                const newDone = {};
                Object.entries(done).forEach(([key,val])=>{
                  const m = key.match(/^(.+)_pos(\d+)$/);
                  if (!m) { newDone[key]=val; return; }
                  const p = parseInt(m[2]);
                  if (p === pos) return; // removed
                  const newPos = p > pos ? p-1 : p;
                  newDone[`${m[1]}_pos${newPos}`] = val;
                });
                setDone(newDone);
                store.set("rwc_done_"+todayK, JSON.stringify(newDone));
              }, style: {
                fontSize:10,color:REDA,background:"transparent",border:"none",cursor:"pointer",padding:0,letterSpacing:"0.03em",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8831}}, "Skip →" )
            )
          )

          /* reason picker */
          , !isSkipped&&swapReason===sk&&(
            React.createElement('div', { style: {width:"100%",borderTop:`1px solid ${BD}`,paddingTop:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8858}}
              , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8859}}, "Why not?" )
              , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8860}}
                , [
                  {id:"time",   label:"⏱ Not enough time",        pool:["mental","gameStudy","prehab"]},
                  {id:"space",  label:"🏠 Wrong location",         pool:["mental","prehab","gameStudy"]},
                  {id:"solo",   label:"🧍 Training alone",         pool:["shortBoxKick","passing","agility","prehab","mental","gameStudy"]},
                  {id:"tired",  label:"😴 Too tired",              pool:["prehab","mental","gameStudy"]},
                  {id:"injury", label:"🤕 Pain or tightness",      pool:["prehab","mental","gameStudy"]},
                  {id:"other",  label:"Something else",            pool:["gameStudy","mental","prehab"]},
                ].map(r=>(
                  React.createElement('button', { key: r.id, onClick: e=>{
                    e.stopPropagation();
                    const current=[...(frozenSkills||[])];
                    const alt=r.pool.find(a=>a!==sk&&!current.includes(a));
                    const updated=current.map(s2=>s2===sk?(alt||r.pool[0]):s2);
                    setFrozenSkills(updated);store.set("rwc_skills_"+todayK,JSON.stringify(updated));
                    setSwapReason(null);
                  }, style: {
                    textAlign:"left",padding:"9px 12px",borderRadius:10,
                    border:`1px solid ${BD}`,background:S2,
                    color:T2,fontSize:12,cursor:"pointer",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8869}}, r.label)
                ))
              )
              , React.createElement('button', { onClick: e=>{e.stopPropagation();setSwapReason(null);}, style: {
                marginTop:6,fontSize:10,color:T3,background:"transparent",border:"none",cursor:"pointer",padding:0,
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8883}}, "cancel")
            )
          )
        )
      );
    })];
  }

  const renderTomorrowPreview = () => {
    const tomorrowDow=(new Date().getDay()+1)%7;
    const tomorrowSkills=getTodaySkills(50,tomorrowDow,{},freeTimeMins,space,partners,matchStatus);
    if(!tomorrowSkills.length) return null;
    return (
      React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 8898}}
        , React.createElement('div', { style: {fontSize:10,color:T3,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8899}}, "Tomorrow")
        , React.createElement('div', { style: {display:"flex",gap:6,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8900}}
          , tomorrowSkills.map(sk=>{const s=SKILLS[sk];return React.createElement('span', { key: sk, style: {fontSize:12,color:_optionalChain([s, 'optionalAccess', _245 => _245.color])||T2,background:S1,borderRadius:7,padding:"4px 10px",fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8901}}, _optionalChain([s, 'optionalAccess', _246 => _246.icon]), " " , _optionalChain([s, 'optionalAccess', _247 => _247.name])||sk);})
        )
      )
    );
  }

  const renderMatchCalendarSection = () => {
    const open = expandedSkills.has("section_match_calendar");
    const customMatches = settings.customMatches||[];
    const deletedRwc = settings.deletedRwcMatches||[];
    const rwcOverrides = customMatches.filter(c=>c._rwcOverride);
    const baseRwc = RWC_MATCHES
      .filter(r=>!deletedRwc.includes(r.opponent))
      .map(r=>{ const ov=rwcOverrides.find(o=>o.opponent===r.opponent); return ov||r; });
    const userMatches = customMatches.filter(c=>!c._rwcOverride);
    const allMatches = [...baseRwc, ...userMatches].sort((a,b)=>a.date.localeCompare(b.date));
    const [newDate,setNewDate] = [expandedSkills.has("mcNewDate")?store.get("mc_tmp_date")||"":"", v=>{ store.set("mc_tmp_date",v); setExpandedSkills(p=>{const n=new Set(p); v?n.add("mcNewDate"):n.delete("mcNewDate"); return n;}); }];
    const [newOpp,setNewOpp]   = [store.get("mc_tmp_opp")||"", v=>store.set("mc_tmp_opp",v)];
    const [newComp,setNewComp] = [store.get("mc_tmp_comp")||"Club", v=>store.set("mc_tmp_comp",v)];

    return (
      React.createElement('div', { style: {...card,overflow:"hidden",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8922}}
        , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has("section_match_calendar")?n.delete("section_match_calendar"):n.add("section_match_calendar");return n;}),
          style: {width:"100%",display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8923}}
          , React.createElement('span', { style: {fontSize:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8925}}, "🏉")
          , React.createElement('span', { style: {flex:1,...lbl}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8926}}, "Match calendar" )
          , React.createElement('span', { style: {fontSize:10,color:T3,background:S2,borderRadius:6,padding:"2px 7px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8927}}, allMatches.length)
          , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8928}}, open?"▲":"▼")
        )
        , open&&(
          React.createElement('div', { style: {padding:"0 16px 16px",borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8931}}
            , React.createElement('div', { style: {fontSize:12,color:T3,margin:"10px 0 12px",lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8932}}, "The app auto-adjusts your training 72h before and 48h after each match. RWC fixtures are pre-loaded."

            )
            /* All matches */
            , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8936}}
              , allMatches.map((m,i)=>{
                const isPast   = m.date < todayK;
                const isRwc    = RWC_MATCHES.some(r=>r.date===m.date&&r.opponent===m.opponent);
                const optKey   = `mc_opt_${i}`;
                const optOpen  = expandedSkills.has(optKey);
                const editKey  = `mc_edit_date_${i}`;
                return (
                  React.createElement('div', { key: i, style: {background:S2,borderRadius:10,overflow:"hidden",opacity:isPast?0.55:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8944}}
                    , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8945}}
                      , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8946}}
                        , (()=>{
                        const t = _optionalChain([m, 'access', _248 => _248.competition, 'optionalAccess', _249 => _249.includes, 'call', _250 => _250(" · ")]) ? m.competition.split(" · ")[0] : "Portugal";
                        return React.createElement('div', { style: {fontSize:13,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8949}}, t, " v "  , m.flag||"🏉", " " , m.opponent);
                      })()
                        , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8951}}, fmtDate(m.date), " · "  , m.competition||"Club", m.venue?` · ${m.venue}`:"")
                      )
                      , isRwc&&React.createElement('span', { style: {fontSize:9,color:GOLD,fontWeight:700,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8953}}, "RWC")
                      , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has(optKey)?n.delete(optKey):n.add(optKey);return n;}),
                        style: {fontSize:16,color:T3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 6px",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8954}}, "⋯")
                    )
                    , optOpen&&(
                      React.createElement('div', { style: {borderTop:`1px solid ${BD}`,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8958}}
                        , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8959}}
                          , React.createElement('span', { style: {fontSize:11,color:T3,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8960}}, "📅 Reschedule:" )
                          , React.createElement('input', { type: "date", defaultValue: m.date,
                            onChange: e=>{
                              const newDate = e.target.value;
                              if (!newDate) return;
                              if (isRwc) {
                                // override RWC date via customMatches with same opponent
                                const withoutOld = customMatches.filter(c=>c.opponent!==m.opponent);
                                saveSettings({...settings,customMatches:[...withoutOld,{...m,date:newDate,_rwcOverride:true}]});
                              } else {
                                const updated = customMatches.map((c,j)=>j===i-RWC_MATCHES.length?{...c,date:newDate}:c);
                                saveSettings({...settings,customMatches:updated});
                              }
                              setExpandedSkills(p=>{const n=new Set(p);n.delete(optKey);return n;});
                            },
                            style: {flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:12,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8961}})
                        )
                        , React.createElement('button', { onClick: ()=>{
                          if (isRwc) {
                            const hidden = [...(settings.deletedRwcMatches||[]),m.opponent];
                            saveSettings({...settings,deletedRwcMatches:hidden});
                          } else {
                            const updated = userMatches.filter(c=>!(c.date===m.date&&c.opponent===m.opponent));
                            saveSettings({...settings,customMatches:[...(settings.customMatches||[]).filter(c=>c._rwcOverride), ...updated]});
                          }
                          setExpandedSkills(p=>{const n=new Set(p);n.delete(optKey);return n;});
                        }, style: {padding:"7px 12px",borderRadius:8,border:`1px solid ${REDA}44`,background:REDA+"11",color:REDA,fontSize:12,cursor:"pointer",fontWeight:600,alignSelf:"flex-start"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8977}}, "🗑 Remove"

                        )
                      )
                    )
                  )
                );
              })
            )
            /* Restore deleted RWC matches */
            , (settings.deletedRwcMatches||[]).length>0&&(
              React.createElement('button', { onClick: ()=>saveSettings({...settings,deletedRwcMatches:[]}),
                style: {width:"100%",padding:"9px",borderRadius:9,border:`1px dashed ${BD}`,background:"transparent",color:T3,fontSize:12,cursor:"pointer",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8997}}, "Restore "
                 , (settings.deletedRwcMatches||[]).length, " removed RWC match"   , (settings.deletedRwcMatches||[]).length>1?"es":""
              )
            )
            /* Add match form */
            , (()=>{
              const TEAMS = [
                { key:"portugal",  label:"Portugal",  flag:"🇵🇹", color:REDA },
                { key:"lusitanos", label:"Lusitanos", flag:"🦁",  color:GOLD },
                { key:"agronomia", label:"Agronomia", flag:"🌿",  color:GRNA },
              ];
              const COMPS = ["Liga", "Cup", "Test Match", "Friendly", "Other"];
              const selTeam = store.get("mc_tmp_team")||"portugal";
              const selComp = store.get("mc_tmp_comp2")||"Liga";
              const setTeam = v => { store.set("mc_tmp_team",v); setExpandedSkills(p=>new Set(p)); };
              const setComp = v => { store.set("mc_tmp_comp2",v); setExpandedSkills(p=>new Set(p)); };
              return (
                React.createElement('div', { style: {background:S2,borderRadius:10,padding:"12px 14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9015}}
                  , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9016}}, "Add match" )
                  /* Team */
                  , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9018}}, "Playing for" )
                  , React.createElement('div', { style: {display:"flex",gap:6,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9019}}
                    , TEAMS.map(t=>(
                      React.createElement('button', { key: t.key, onClick: ()=>setTeam(t.key), style: {
                        flex:1,padding:"7px 4px",borderRadius:8,cursor:"pointer",
                        border:`1.5px solid ${selTeam===t.key?t.color:BD}`,
                        background:selTeam===t.key?t.color+"22":"transparent",
                        color:selTeam===t.key?t.color:T3,
                        fontSize:11,fontWeight:selTeam===t.key?700:400,
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9021}}, t.flag, " " , t.label)
                    ))
                  )
                  /* Date */
                  , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9031}}, "Date")
                  , React.createElement('input', { type: "date", defaultValue: newDate, onChange: e=>setNewDate(e.target.value),
                    style: {width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9032}})
                  /* Opponent */
                  , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9035}}, "Opponent")
                  , React.createElement('input', { defaultValue: newOpp, onChange: e=>setNewOpp(e.target.value),
                    placeholder: "e.g. Benfica, France, Belenenses"   ,
                    style: {width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9036}})
                  /* Competition — autocomplete from history */
                  , React.createElement('div', { style: {fontSize:10,color:T3,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9040}}, "Competition")
                  , (()=>{
                    // Build list of past competitions from saved matches
                    const pastComps = [...new Set(
                      [...(settings.customMatches||[]).map(m=>{
                        // strip "Team · " prefix to get just the competition
                        const c = m.competition||"";
                        return c.includes(" · ") ? c.split(" · ").slice(1).join(" · ") : c;
                      }), "Liga", "Cup", "Test Match", "Friendly"]
                        .filter(Boolean)
                    )];
                    const compVal = store.get("mc_tmp_comp2")||"";
                    const suggestions = compVal
                      ? pastComps.filter(c=>c.toLowerCase().includes(compVal.toLowerCase()) && c!==compVal)
                      : pastComps;
                    return (
                      React.createElement('div', { style: {position:"relative",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9056}}
                        , React.createElement('input', {
                          value: compVal,
                          onChange: e=>setComp(e.target.value),
                          placeholder: "e.g. Liga, Cup, Test Match"    ,
                          style: {width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9057}}
                        )
                        , suggestions.length>0&&compVal!==undefined&&(
                          React.createElement('div', { style: {position:"absolute",left:0,right:0,top:"100%",zIndex:20,background:S2,border:`1px solid ${BD}`,borderRadius:8,marginTop:2,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9064}}
                            , suggestions.map(c=>(
                              React.createElement('button', { key: c, onClick: ()=>setComp(c),
                                style: {width:"100%",padding:"9px 12px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",fontSize:12,color:T1,borderBottom:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9066}}
                                , c
                              )
                            ))
                          )
                        )
                      )
                    );
                  })()
                  , React.createElement('button', { onClick: ()=>{
                    const d = store.get("mc_tmp_date")||"";
                    const o = store.get("mc_tmp_opp")||"";
                    if (!d||!o) return;
                    const team = TEAMS.find(t=>t.key===selTeam)||TEAMS[0];
                    const comp = store.get("mc_tmp_comp2")||selComp;
                    const newMatch = { date:d, opponent:o.trim(), competition:`${team.label} · ${comp}`, flag:team.flag };
                    saveSettings({...settings, customMatches:[...customMatches, newMatch]});
                    store.set("mc_tmp_date",""); store.set("mc_tmp_opp",""); store.set("mc_tmp_team","portugal"); store.set("mc_tmp_comp2","Liga");
                  }, style: {width:"100%",padding:"9px",borderRadius:9,border:"none",background:GRNA,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9076}}, "Add match"

                  )
                )
              );
            })()
          )
        )
      )
    );
  };

  const renderWeaknessesSection = () => {
    const validKeys = Object.keys(SKILLS);
    // clean stale keys from saved settings silently
    const cleanWeaknesses = (settings.weaknesses||[]).filter(k=>validKeys.includes(k));
    const cleanExcluded   = (settings.excluded||[]).filter(k=>validKeys.includes(k));
    const open=expandedSkills.has("section_weaknesses"); const count=cleanWeaknesses.length;
    return (
      React.createElement('div', { style: {...card,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9104}}
        , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has("section_weaknesses")?n.delete("section_weaknesses"):n.add("section_weaknesses");return n;}),
          style: {width:"100%",display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9105}}
          , React.createElement('span', { style: {flex:1,...lbl}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9107}}, "My weaknesses" )
          , count>0&&React.createElement('span', { style: {fontSize:10,color:REDA,background:REDDIM,borderRadius:6,padding:"2px 7px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9108}}, count, " flagged" )
          , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9109}}, open?"▲":"▼")
        )
        , open&&(
          React.createElement('div', { style: {padding:"0 16px 14px",borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9112}}
            , React.createElement('div', { style: {fontSize:12,color:T3,margin:"10px 0",lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9113}}, "These appear more often in your daily plan."       )
            , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9114}}
              , Object.entries(SKILLS).filter(([k])=>k!=="prehab").map(([k,s])=>{
                const active=cleanWeaknesses.includes(k);
                return (
                  React.createElement('button', { key: k, onClick: ()=>saveSettings({...settings,weaknesses:active?cleanWeaknesses.filter(w=>w!==k):[...cleanWeaknesses,k]}),
                    style: {display:"flex",alignItems:"center",gap:12,padding:"11px 13px",borderRadius:10,textAlign:"left",cursor:"pointer",border:`1px solid ${active?REDA:BD}`,background:active?REDDIM:"transparent"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9118}}
                    , React.createElement('span', { style: {fontSize:18,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9120}}, s.icon)
                    , React.createElement('span', { style: {flex:1,fontSize:13,fontWeight:active?700:400,color:active?T1:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9121}}, s.name)
                    , React.createElement('span', { style: {fontSize:11,fontWeight:700,color:active?REDA:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9122}}, active?"weak":"–")
                  )
                );
              })
            )
          )
        )
      )
    );
  }


  const renderActiveSkillsSection = () => {
    const validKeys = Object.keys(SKILLS);
    const cleanExcl = (settings.excluded||[]).filter(k=>validKeys.includes(k));
    const open=expandedSkills.has("section_active"); const offCount=cleanExcl.length;
    return (
      React.createElement('div', { style: {...card,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9139}}
        , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has("section_active")?n.delete("section_active"):n.add("section_active");return n;}),
          style: {width:"100%",display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9140}}
          , React.createElement('span', { style: {flex:1,...lbl}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9142}}, "Active skills" )
          , offCount>0&&React.createElement('span', { style: {fontSize:10,color:T3,background:S2,borderRadius:6,padding:"2px 7px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9143}}, offCount, " off" )
          , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9144}}, open?"▲":"▼")
        )
        , open&&(
          React.createElement('div', { style: {padding:"0 16px 14px",borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9147}}
            , React.createElement('div', { style: {fontSize:12,color:T3,margin:"10px 0",lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9148}}, "Toggle off any skill to remove it from your rotation."         )
            , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9149}}
              , Object.entries(SKILLS).map(([k,s])=>{
                const excluded=cleanExcl.includes(k);
                return (
                  React.createElement('button', { key: k, onClick: ()=>saveSettings({...settings,excluded:excluded?cleanExcl.filter(e=>e!==k):[...cleanExcl,k]}),
                    style: {display:"flex",alignItems:"center",gap:12,padding:"11px 13px",borderRadius:10,textAlign:"left",cursor:"pointer",border:`1px solid ${excluded?BD:GRNA+"44"}`,background:excluded?S2:GDIM,opacity:excluded?0.5:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9153}}
                    , React.createElement('span', { style: {fontSize:18,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9155}}, s.icon)
                    , React.createElement('span', { style: {flex:1,fontSize:13,fontWeight:excluded?400:600,color:excluded?T3:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9156}}, s.name)
                    , React.createElement('span', { style: {fontSize:11,fontWeight:700,color:excluded?T3:GRNA}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9157}}, excluded?"off":"on")
                  )
                );
              })
            )
          )
        )
      )
    );
  }

  const renderCustomSkillSection = () => {
    const customSkillsList = settings.customSkills || [];
    const open = expandedSkills.has("section_custom_skills");
    const [editingKey, setEditingKey] = [
      expandedSkills.has("adding_custom_skill") ? "new" : null,
      (v) => setExpandedSkills(p => { const n=new Set(p); v ? n.add("adding_custom_skill") : n.delete("adding_custom_skill"); return n; })
    ];
    return (
      React.createElement('div', { style: {...card,overflow:"hidden",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9176}}
        , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has("section_custom_skills")?n.delete("section_custom_skills"):n.add("section_custom_skills");return n;}),
          style: {width:"100%",display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9177}}
          , React.createElement('span', { style: {flex:1,...lbl}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9179}}, "Custom skills" )
          , customSkillsList.length>0&&React.createElement('span', { style: {fontSize:10,color:T3,background:S2,borderRadius:6,padding:"2px 7px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9180}}, customSkillsList.length)
          , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9181}}, open?"▲":"▼")
        )
        , open&&(
          React.createElement('div', { style: {padding:"0 16px 14px",borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9184}}
            , React.createElement('div', { style: {fontSize:12,color:T3,margin:"10px 0 12px",lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9185}}, "Create a new skill from scratch. It will appear in your daily rotation, notes, and progress charts exactly like built-in skills."

            )
            /* existing custom skills */
            , customSkillsList.map((cs,i)=>(
              React.createElement('div', { key: cs.key, style: {...card,padding:"12px 14px",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9190}}
                , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9191}}
                  , React.createElement('span', { style: {fontSize:22}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9192}}, cs.icon||"⭐")
                  , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9193}}
                    , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:cs.color||GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9194}}, cs.name)
                    , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9195}}, cs.type, " · "  , cs.spaceNeeded, " · "  , (cs.stages||[]).length, " stages" )
                  )
                  , React.createElement('button', { onClick: ()=>{
                    const updated = customSkillsList.filter((_,j)=>j!==i);
                    saveSettings({...settings, customSkills:updated,
                      excluded:(settings.excluded||[]).filter(k=>k!==cs.key)});
                  }, style: {fontSize:11,color:REDA,background:"transparent",border:"none",cursor:"pointer",padding:"4px 8px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9197}}, "Delete")
                )
              )
            ))
            /* add new skill form */
            , editingKey==="new"
              ? React.createElement(CustomSkillForm, {
                  onSave: (newSkill)=>{
                    const updated = [...customSkillsList, newSkill];
                    saveSettings({...settings, customSkills:updated});
                    setEditingKey(false);
                  },
                  onCancel: ()=>setEditingKey(false),
                  BD: BD, S1: S1, S2: S2, T1: T1, T2: T2, T3: T3, GOLD: GOLD, GRNA: GRNA, REDA: REDA, PRP: PRP, AMB: AMB, BLU: BLU, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9207}}
                )
              : React.createElement('button', { onClick: ()=>setEditingKey(true), style: {
                  width:"100%",padding:"11px",borderRadius:10,border:`1px dashed ${BD}`,
                  background:"transparent",color:T3,fontSize:13,cursor:"pointer",
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9216}}, "+ Create new skill"   )
            
          )
        )
      )
    );
  };

  const renderExerciseSection = () => {
    const open = expandedSkills.has("section_exercises");
    return (
      React.createElement('div', { style: {...card,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9230}}
        , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has("section_exercises")?n.delete("section_exercises"):n.add("section_exercises");return n;}),
          style: {width:"100%",display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9231}}
          , React.createElement('span', { style: {flex:1,...lbl}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9233}}, "Exercise progressions" )
          , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9234}}, open?"▲":"▼")
        )
        , open&&(
          React.createElement('div', { style: {padding:"0 12px 14px",borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9237}}
            , React.createElement('div', { style: {fontSize:12,color:T3,margin:"10px 0 12px",lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9238}}, "Edit, add timers, or delete any stage. Changes apply to future sessions."           )
            , Object.entries(SKILLS).filter(([k,s])=>(s.progression||[]).length>0).map(([sk,s])=>{
              const customProg = _optionalChain([settings, 'access', _251 => _251.customProgressions, 'optionalAccess', _252 => _252[sk]])||{};
              const isSkillOpen = expandedSkills.has("ex_"+sk);
              // merge built-in + custom overrides into one editable list
              // custom stages beyond progression length = added stages
              const builtIn = s.progression.map((stage,i)=>{
                const ov = customProg[i];
                // Built-in stages from s.progression are NEVER hidden by deleted flags
                // (stale {deleted:true} from old versions would hide new stages added at same index)
                return {
                  idx: i, isBuiltIn: true, isDeleted: false,
                  name: _optionalChain([ov, 'optionalAccess', _253 => _253.name]) || stage.stage,
                  text: _optionalChain([ov, 'optionalAccess', _254 => _254.text]) || stage.text,
                  duration: _optionalChain([ov, 'optionalAccess', _255 => _255.duration]) || stage.duration || "10 min",
                  timer: _optionalChain([ov, 'optionalAccess', _256 => _256.timer]) || stage.timer || "",
                  lastWeight: _optionalChain([ov, 'optionalAccess', _257 => _257.lastWeight]) || "",
                };
              });
              const added = Object.entries(customProg)
                .filter(([idx])=>parseInt(idx)>=(s.progression||[]).length)
                .map(([idx,entry])=>({
                  idx: parseInt(idx), isBuiltIn: false,
                  name: typeof entry==="object"?entry.name:"Your exercise",
                  text: typeof entry==="object"?entry.text:entry,
                  duration: typeof entry==="object"?entry.duration:"10 min",
                  timer: typeof entry==="object"?entry.timer||"":"",
                  lastWeight: typeof entry==="object"?entry.lastWeight||"":"",
                }));
              const allStages = [...builtIn, ...added];
              const addedCount = added.length;

              const saveStage = (idx, fields) => {
                const cp = {...(settings.customProgressions||{})};
                if(!cp[sk]) cp[sk]={};
                const existing = cp[sk][idx]||{};
                cp[sk][idx] = {...existing, ...fields};
                saveSettings({...settings, customProgressions:cp});
              };
              const deleteStage = (idx, isBuiltIn) => {
                const cp = {...(settings.customProgressions||{})};
                if(!cp[sk]) cp[sk]={};
                if(isBuiltIn) cp[sk][idx] = {deleted:true};
                else delete cp[sk][idx];
                saveSettings({...settings, customProgressions:cp});
              };
              const restoreStage = (idx) => {
                const cp = {...(settings.customProgressions||{})};
                if(cp[sk]) delete cp[sk][idx];
                saveSettings({...settings, customProgressions:cp});
              };

              // count deleted for badge
              const deletedCount = Object.values(customProg).filter(v=>_optionalChain([v, 'optionalAccess', _258 => _258.deleted])).length;

              return (
                React.createElement('div', { key: sk, style: {marginBottom:6,borderRadius:10,border:`1px solid ${BD}`,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9294}}
                  , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has("ex_"+sk)?n.delete("ex_"+sk):n.add("ex_"+sk);return n;}),
                    style: {width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:isSkillOpen?S2:S3,border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9295}}
                    , React.createElement('span', { style: {fontSize:18,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9297}}, s.icon)
                    , React.createElement('span', { style: {flex:1,fontSize:13,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9298}}, s.name)
                    , addedCount>0&&React.createElement('span', { style: {fontSize:10,color:GOLD,background:GOLDDIM,borderRadius:6,padding:"2px 7px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9299}}, "+", addedCount)
                    , deletedCount>0&&React.createElement('span', { style: {fontSize:10,color:REDA,background:REDDIM,borderRadius:6,padding:"2px 7px",fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9300}}, "−", deletedCount)
                    , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9301}}, isSkillOpen?"▲":"▼")
                  )
                  , isSkillOpen&&(
                    React.createElement('div', { style: {padding:"12px 14px",background:S2,borderTop:`1px solid ${BD}`,display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9304}}

                      , allStages.map(st=>(
                        React.createElement(StageEditor, { key: st.idx, stage: st,
                          onSave: (fields)=>saveStage(st.idx, fields),
                          onDelete: ()=>deleteStage(st.idx, st.isBuiltIn),
                          onRestore: st.isBuiltIn?()=>restoreStage(st.idx):null,
                          isPlank: st.text==="PROGRESSIVE_PLANK",
                          BD: BD, S1: S1, S2: S2, BG: BG, T1: T1, T2: T2, T3: T3, GOLD: GOLD, GRNA: GRNA, REDA: REDA, REDDIM: REDDIM, AMB: AMB, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9307}}
                        )
                      ))

                      /* deleted built-in stages — show restore option */
                      , Object.entries(customProg).filter(([,v])=>_optionalChain([v, 'optionalAccess', _259 => _259.deleted])).map(([idx])=>{
                        const orig = s.progression[parseInt(idx)];
                        if(!orig) return null;
                        return (
                          React.createElement('div', { key: idx, style: {borderRadius:9,padding:"8px 12px",border:`1px dashed ${BD}`,opacity:0.5,display:"flex",justifyContent:"space-between",alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9321}}
                            , React.createElement('span', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9322}}, orig.stage, " — deleted"  )
                            , React.createElement('button', { onClick: ()=>restoreStage(parseInt(idx)), style: {fontSize:10,color:GOLD,background:"transparent",border:"none",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9323}}, "restore")
                          )
                        );
                      })

                      /* add new stage */
                      , React.createElement(AddStageForm, { sk: sk, onAdd: (name,text,duration,timer,lastWeight)=>{
                        const cp={...(settings.customProgressions||{})};
                        if(!cp[sk]) cp[sk]={};
                        const nextIdx=(s.progression||[]).length+Object.keys(cp[sk]).filter(k=>parseInt(k)>=(s.progression||[]).length).length;
                        cp[sk][nextIdx]={name,text,duration,timer,lastWeight:lastWeight||""};
                        saveSettings({...settings,customProgressions:cp});
                      },
                        BD: BD, S1: S1, S2: S2, BG: BG, T1: T1, T2: T2, T3: T3, GOLD: GOLD, GRNA: GRNA, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9329}}
                      )
                    )
                  )
                )
              );
            })
          )
        )
      )
    );
  };

  return (
    React.createElement('div', { style: {fontFamily:"-apple-system,'SF Pro Text','SF Pro Display',system-ui,sans-serif",background:BG,minHeight:"100vh",color:T1,position:"relative"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9350}}
      , React.createElement('style', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 9351}}, APPLE_CSS)
      , reactionGame==="passing"&&React.createElement(PassingGame, { onClose: ()=>setReactionGame(null), onPointsScored: ()=>setGamePtsVersion(v=>v+1), todayK: todayK, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9352}})
      , reactionGame==="kickpass"&&React.createElement(ReadAndDecideGame, { onClose: ()=>setReactionGame(null), onPointsScored: ()=>setGamePtsVersion(v=>v+1), todayK: todayK, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9353}})
      , reactionGame==="numtrack"&&React.createElement(NumberTrackerGame, { onClose: ()=>setReactionGame(null), onPointsScored: ()=>setGamePtsVersion(v=>v+1), todayK: todayK, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9354}})
      , reactionGame==="ruckscan"&&React.createElement(RuckScanGame, { onClose: ()=>setReactionGame(null), onPointsScored: ()=>setGamePtsVersion(v=>v+1), todayK: todayK, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9355}})
      , reactionGame==="cogprime"&&React.createElement(CognitivePrimeGame, { onClose: ()=>setReactionGame(null), onPointsScored: ()=>setGamePtsVersion(v=>v+1), todayK: todayK, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9356}})

      , showMentalTask&&(
        React.createElement(MentalTaskPage, {
          task: todayMentalTask, todayK: todayK,
          mentalDone: mentalDone,
          onClose: ()=>setShowMentalTask(false),
          onComplete: (note)=>completeMentalTask(note),
          onUncomplete: uncompleteMentalTask,
          onSaveReflection: (r,n)=>saveReflection("mentalTask",r,n,0),
          store: store,
          card: card, BD: BD, S1: S1, S2: S2, BG: BG,
          T1: T1, T2: T2, T3: T3, GOLD: GOLD, GRNA: GRNA, PRP: PRP, AMB: AMB,
          GOLDDIM: GOLDDIM, GRN: GRN, RED: RED, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9359}}
        )
      )

      /* Report modal — renders HTML inline since blob/data URIs don't work in sandboxed iframes */
      , showCI&&React.createElement(Checkin, { key: openCount, onDone: saveCi, existing: ci, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9374}})
      /* ── JOURNAL MODAL ── */
      , journalOpen&&(()=>{
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
        const todayPrompts = Object.entries(JOURNAL_PROMPTS).map(([key,cat], ci) => ({
          key, color: cat.color, label: cat.label,
          prompt: cat.prompts[(dayOfYear + ci * 7) % cat.prompts.length],
        }));
        const totalSteps = todayPrompts.length + 1;
        const isFreeWrite = journalStep >= todayPrompts.length;
        const current = isFreeWrite ? null : todayPrompts[journalStep];
        const currentAnswer = isFreeWrite ? dayReflection : (journalAnswers[journalStep]||"");

        const setCurrentAnswer = (val) => {
          if (isFreeWrite) setDayReflection(val);
          else setJournalAnswers(a=>({...a,[journalStep]:val}));
        };

        const saveAndClose = () => {
          const parts = [];
          todayPrompts.forEach((p,i) => {
            if (_optionalChain([journalAnswers, 'access', _260 => _260[i], 'optionalAccess', _261 => _261.trim, 'call', _262 => _262()])) parts.push(`${p.prompt}\n${journalAnswers[i].trim()}`);
          });
          if (dayReflection.trim()) parts.push(dayReflection.trim());
          const full = parts.join("\n\n---\n\n");
          if (!full.trim()) { setJournalOpen(false); return; }
          haptic("medium");
          store.set("rwc_dayreflect_"+todayK, full);
          saveJournalEntry(todayK, full);
          setDayReflectSaved(true);
          setJournalOpen(false);
        };

        return (
          React.createElement('div', { style: {position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",flexDirection:"column"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9408}}
            , React.createElement('div', { style: {background:S1,borderRadius:"24px 24px 0 0",marginTop:"auto",maxHeight:"88vh",display:"flex",flexDirection:"column"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9409}}

              /* progress bar */
              , React.createElement('div', { style: {height:3,background:S2,borderRadius:"24px 24px 0 0",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9412}}
                , React.createElement('div', { style: {height:"100%",background:GOLD,borderRadius:2,transition:"width 0.3s",
                  width:`${(journalStep/totalSteps)*100}%`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9413}})
              )

              /* header */
              , React.createElement('div', { style: {padding:"16px 20px 10px",flexShrink:0,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9418}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 9419}}
                  , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9420}}
                    , isFreeWrite ? "Free reflection" : `${current.label} · ${journalStep+1} of ${todayPrompts.length}`
                  )
                  , React.createElement('div', { style: {fontSize:16,fontWeight:700,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9423}}
                    , new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"short"})
                  )
                )
                , React.createElement('button', { onClick: ()=>setJournalOpen(false), style: {fontSize:16,color:T3,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,paddingTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9427}}, "✕")
              )

              /* prompt card */
              , React.createElement('div', { style: {padding:"0 20px 12px",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9431}}
                , !isFreeWrite&&(
                  React.createElement('div', { style: {background:current.color+"18",borderRadius:14,padding:"14px 16px",borderLeft:`3px solid ${current.color}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9433}}
                    , React.createElement('div', { style: {fontSize:14.5,color:T1,fontWeight:500,lineHeight:1.65}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9434}}, current.prompt)
                  )
                )
                , isFreeWrite&&(
                  React.createElement('div', { style: {background:GOLDDIM,borderRadius:14,padding:"12px 16px",borderLeft:`3px solid ${GOLD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9438}}
                    , React.createElement('div', { style: {fontSize:13,color:GOLD,fontWeight:700,marginBottom:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9439}}, "Anything else?" )
                    , React.createElement('div', { style: {fontSize:12,color:T2,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9440}}, "Optional — add any other thought, feeling, or thing to carry forward."           )
                  )
                )
              )

              /* textarea — key forces remount on step change so keyboard stays open */
              , React.createElement('div', { style: {flex:1,padding:"0 20px 12px",minHeight:0,display:"flex"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9446}}
                , React.createElement('textarea', {
                  key: `journal_step_${journalStep}`,
                  value: currentAnswer,
                  onChange: e=>setCurrentAnswer(e.target.value),
                  placeholder: isFreeWrite ? "Write anything..." : "Write your answer...",
                  autoFocus: true,
                  style: {width:"100%",padding:14,borderRadius:12,
                    border:`1px solid ${isFreeWrite?GOLD:_optionalChain([current, 'optionalAccess', _263 => _263.color])||BD}`,
                    background:S2,color:T1,fontSize:16,lineHeight:1.65,
                    resize:"none",outline:"none",boxSizing:"border-box",
                    fontFamily:"inherit",caretColor:GOLD,touchAction:"manipulation"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9447}})
              )

              /* nav buttons */
              , React.createElement('div', { style: {padding:"0 20px 36px",flexShrink:0,display:"flex",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9461}}
                , journalStep > 0&&(
                  React.createElement('button', { onClick: ()=>setJournalStep(s=>s-1), style: {
                    padding:"12px 14px",borderRadius:12,border:`1px solid ${BD}`,
                    background:"transparent",color:T3,fontSize:13,cursor:"pointer",flexShrink:0,
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9463}}, "←")
                )
                , !isFreeWrite&&(
                  React.createElement('button', { onClick: ()=>setJournalStep(s=>s+1), style: {
                    flex:1,padding:"14px",borderRadius:12,border:`1px solid ${BD}`,
                    background:S2,color:T3,fontSize:13,fontWeight:600,cursor:"pointer",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9469}}, "Skip →" )
                )
                , !isFreeWrite&&currentAnswer.trim()&&(
                  React.createElement('button', { onClick: ()=>setJournalStep(s=>s+1), style: {
                    flex:2,padding:"14px",borderRadius:12,border:"none",
                    background:current.color,color:BG,fontSize:14,fontWeight:800,cursor:"pointer",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9475}}, "Next →" )
                )
                , isFreeWrite&&(
                  React.createElement('button', { onClick: saveAndClose, style: {
                    flex:1,padding:"14px",borderRadius:12,border:"none",
                    background:GOLD,color:BG,fontSize:15,fontWeight:800,cursor:"pointer",
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9481}}, "Bank the day ✓"   )
                )
              )
            )
          )
        );
      })()

      , reflectPrompt && (
        React.createElement(ReflectionModal, {
          skillKey: reflectPrompt.skillKey,
          initialText: draftNotes[`${reflectPrompt.skillKey}_${reflectPrompt.instanceIdx||0}`] || draftNotes[reflectPrompt.skillKey] || "",
          onSave: (rating,text)=>saveReflection(reflectPrompt.skillKey, rating, text, reflectPrompt.instanceIdx||0),
          onSkip: ()=>setReflectPrompt(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 9493}}
        )
      )

      /* HEADER — Apple large title style */
      , React.createElement('div', { 'data-surface': "1", style: {background:"rgba(0,0,0,0.85)",backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        borderBottom:`0.5px solid rgba(255,255,255,0.12)`,
        position:"sticky",top:0,zIndex:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9502}}
        , React.createElement('div', { style: {padding:"12px 16px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9506}}

          /* top row */
          , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9509}}
            , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9510}}
              , React.createElement('span', { style: {fontSize:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9511}}, "🇵🇹")
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 9512}}
                , React.createElement('div', { style: {fontSize:11,fontWeight:600,color:T2,letterSpacing:"0.01em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9513}}, "Portugal · #9 · RWC 2027"

                )
              )
            )
            , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9518}}
              , React.createElement('div', { style: {background:phase.accent+"18",borderRadius:20,padding:"0 10px",
                border:`1px solid ${phase.accent}30`,height:20,display:"flex",alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9519}}
                , React.createElement('span', { style: {fontSize:11,fontWeight:600,color:phase.accent,letterSpacing:"0.01em",lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9521}}, phase.name)
              )
              , React.createElement('button', { onClick: openCI, style: {
                background:S2,borderRadius:8,padding:"4px 10px",
                border:"none",cursor:"pointer",display:"flex",alignItems:"baseline",gap:3,
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9523}}
                , React.createElement('span', { style: {fontSize:13,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9527}}, ci?"↻ Check in":"Check in")
              )
            )
          )

          /* compact title + day nav in one row */
          , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9533}}
            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 9534}}
              , React.createElement('span', { style: {fontSize:28,fontWeight:700,letterSpacing:"-0.02em",color:T1,lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9535}}, days)
              , React.createElement('span', { style: {fontSize:13,fontWeight:400,color:T2,marginLeft:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9536}}, "days")
            )
            /* day navigator — center */
            , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9539}}
              , React.createElement('button', { onClick: ()=>{
                const d=new Date(viewingDate+"T12:00:00");
                d.setDate(d.getDate()-1);
                setViewingDate(localDateStr(d));
              }, style: {background:"transparent",border:"none",cursor:"pointer",fontSize:18,color:T3,padding:"2px 6px",lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9540}}, "‹")
              , React.createElement('button', { onClick: ()=>setViewingDate(todayK), style: {
                background:"transparent",border:"none",cursor:"pointer",padding:0,
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9545}}
                , React.createElement('div', { style: {fontSize:13,fontWeight:viewingDate===todayK?700:500,
                  color:viewingDate===todayK?GOLD:T1,textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9548}}
                  , viewingDate===todayK?"Today":new Date(viewingDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})
                )
              )
              , React.createElement('button', { onClick: ()=>{
                if(viewingDate>=todayK) return;
                const d=new Date(viewingDate+"T12:00:00");
                d.setDate(d.getDate()+1);
                setViewingDate(localDateStr(d));
              }, style: {background:"transparent",border:"none",cursor:"pointer",fontSize:18,
                color:viewingDate>=todayK?"#333":T3,padding:"2px 6px",lineHeight:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9553}}, "›")
            )
          )
          /* tab bar — Apple bottom-nav style but at top */
          , React.createElement('div', { style: {display:"flex",gap:0,borderTop:`0.5px solid rgba(255,255,255,0.08)`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9563}}
            , TABS.map(t=>(
              React.createElement('button', { key: t.key, onClick: ()=>{setTab(t.key);setSkill(null);setNotesFilter(null);setNotesQuery("");}, style: {
                flex:1,padding:"8px 0 10px",border:"none",background:"transparent",
                color:tab===t.key?REDA:T3,fontSize:9,fontWeight:tab===t.key?600:400,cursor:"pointer",
                transition:"color 0.15s",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9565}}
                , React.createElement('div', { style: {fontSize:18,marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9570}}, t.icon)
                , React.createElement('div', { style: {letterSpacing:"0.01em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9571}}, t.label)
              )
            ))
          )
        )
      )

      , React.createElement('div', { ref: scrollRef, className: "tab-content", style: {padding:"16px 16px 100px",maxWidth:560,margin:"0 auto",overflowY:"auto",WebkitOverflowScrolling:"touch",flex:1,minHeight:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9578}}

        /* ── TODAY ── */
        , tab==="today"&&(
          !isViewingToday ? (
            // ── PAST DAY VIEW ──
            React.createElement(PastDayView, {
              key: viewingDate,
              viewingDate: viewingDate,
              viewCi: viewCi,
              settings: settings, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9584}}
            )
          ) :
          !ci?(
            React.createElement('div', { style: {...card,padding:"44px 20px",textAlign:"center",marginTop:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9592}}
              , React.createElement('div', { style: {fontSize:36,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9593}}, "🌅")
              , React.createElement('div', { style: {fontSize:17,fontWeight:700,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9594}}, "Start with your check-in"   )
              , React.createElement('div', { style: {fontSize:13,color:T2,marginBottom:20,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9595}}, "Weight + today's session details — that's all you need."         )
              , React.createElement('button', { onClick: openCI, style: {padding:"13px 28px",borderRadius:12,
                border:"none",background:REDA,color:T1,fontWeight:600,fontSize:14,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9596}}, "Morning check-in →"

              )
            )
          ) : selectedSkill ? (
            // ── SKILL DETAIL ──
            React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 9603}}
              , React.createElement('button', { onClick: ()=>setSkill(null), style: {fontSize:11,color:T3,background:"transparent",
                border:`1px solid ${BD}`,borderRadius:8,padding:"5px 11px",cursor:"pointer",marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9604}}, "← back"

              )

              /* PRE-SESSION REFLECTION REVIEW — shows last notes before the session plan */
              , renderPreSessionReview()

              , React.createElement('div', { style: {...card,padding:"18px 18px",borderLeft:`3px solid ${_optionalChain([SKILLS, 'access', _264 => _264[selectedSkill], 'optionalAccess', _265 => _265.color])||GRNA}`,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9612}}
                , React.createElement('div', { style: {fontSize:22,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9613}}, _optionalChain([SKILLS, 'access', _266 => _266[selectedSkill], 'optionalAccess', _267 => _267.icon])||"🏉")
                , React.createElement('div', { style: {fontSize:20,fontWeight:800,color:T1,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9614}}, _optionalChain([SKILLS, 'access', _268 => _268[selectedSkill], 'optionalAccess', _269 => _269.name])||selectedSkill)
                , freeTimeMins===0&&React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9615}}, "15 min session"  )
              )

              /* TRACK-ONLY SKILLS — simplified logger: duration + note + emoji rating */
              , _optionalChain([SKILLS, 'access', _270 => _270[selectedSkill], 'optionalAccess', _271 => _271.trackOnly]) ? (
                React.createElement('div', { style: {...card,padding:"18px 18px",marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9620}}
                  , trackSaved ? (
                    React.createElement('div', { style: {textAlign:"center",padding:"20px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9622}}
                      , React.createElement('div', { style: {fontSize:28,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9623}}, "✅")
                      , React.createElement('div', { style: {fontSize:15,fontWeight:700,color:GRNA}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9624}}, "Logged!")
                    )
                  ) : (
                    React.createElement(React.Fragment, null
                      , React.createElement('div', { style: {fontSize:11,color:T3,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9628}}, "Log session" )
                      /* Duration */
                      , React.createElement('div', { style: {marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9630}}
                        , React.createElement('div', { style: {fontSize:12,color:T2,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9631}}, "Duration (minutes)" )
                        , React.createElement('div', { style: {display:"flex",gap:8,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9632}}
                          , [15,20,30,45,60,90].map(m=>(
                            React.createElement('button', { key: m, onClick: ()=>setTrackDuration(String(m)),
                              style: {padding:"8px 14px",borderRadius:9,border:`1px solid ${trackDuration===String(m)?_optionalChain([SKILLS, 'access', _272 => _272[selectedSkill], 'optionalAccess', _273 => _273.color])||GRNA:BD}`,
                                background:trackDuration===String(m)?(_optionalChain([SKILLS, 'access', _274 => _274[selectedSkill], 'optionalAccess', _275 => _275.color])||GRNA):"transparent",
                                color:trackDuration===String(m)?"#000":T2,fontSize:13,fontWeight:700,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9634}}
                              , m
                            )
                          ))
                          , React.createElement('input', { value: trackDuration, onChange: e=>setTrackDuration(e.target.value.replace(/\D/g,"")),
                            placeholder: "other",
                            style: {width:60,padding:"8px 10px",borderRadius:9,border:`1px solid ${BD}`,background:S2,color:T1,fontSize:13,outline:"none",fontFamily:"inherit",textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9641}})
                        )
                      )
                      /* Emoji rating */
                      , React.createElement('div', { style: {marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9647}}
                        , React.createElement('div', { style: {fontSize:12,color:T2,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9648}}, "Session rating" )
                        , React.createElement('div', { style: {display:"flex",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9649}}
                          , [{e:"😴",v:1,label:"Bad"},{e:"💪",v:2,label:"Average"},{e:"🔥",v:3,label:"Good"},{e:"⚡",v:4,label:"Elite"}].map(({e,v,label})=>(
                            React.createElement('button', { key: v, onClick: ()=>setTrackRating(trackRating===v?0:v),
                              style: {display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 10px",borderRadius:10,
                                border:`1px solid ${trackRating===v?(_optionalChain([SKILLS, 'access', _276 => _276[selectedSkill], 'optionalAccess', _277 => _277.color])||GRNA):BD}`,
                                background:trackRating===v?"rgba(255,255,255,0.07)":"transparent",
                                cursor:"pointer",flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9651}}
                              , React.createElement('span', { style: {fontSize:22}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9656}}, e)
                              , React.createElement('span', { style: {fontSize:9,color:trackRating===v?T1:T3,fontWeight:trackRating===v?700:400}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9657}}, label)
                            )
                          ))
                        )
                      )
                      /* Note */
                      , React.createElement('div', { style: {marginBottom:16}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9663}}
                        , React.createElement('div', { style: {fontSize:12,color:T2,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9664}}, "Notes (optional)" )
                        , React.createElement('textarea', { value: trackNote, onChange: e=>setTrackNote(e.target.value),
                          placeholder: `What did you do? How did it feel?`,
                          style: {width:"100%",minHeight:72,padding:"10px 12px",borderRadius:10,border:`1px solid ${BD}`,
                            background:S2,color:T1,fontSize:13,lineHeight:1.5,resize:"none",outline:"none",
                            boxSizing:"border-box",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9665}})
                      )
                      /* Save */
                      , React.createElement('button', {
                        disabled: !trackDuration,
                        onClick: ()=>{
                          const mins = parseInt(trackDuration)||0;
                          if (!mins) return;
                          const sk = selectedSkill;
                          const skName = _optionalChain([SKILLS, 'access', _278 => _278[sk], 'optionalAccess', _279 => _279.name])||sk;
                          // Save note/rating as reflection
                          if (trackNote.trim() || trackRating) {
                            const entry = {
                              id: Date.now().toString(36)+"to",
                              date: todayK,
                              skillKey: sk,
                              skillName: skName + (trackDuration?` [${trackDuration} min]`:""),
                              text: trackNote.trim(),
                              rating: trackRating||0,
                              extra:"trackOnly",
                            };
                            const updated = [entry, ...reflections];
                            setReflections(updated);
                            store.set("rwc_reflections", JSON.stringify(updated));
                            if (trackRating) {
                              const scoreEntry = {id: Date.now().toString(36)+"tos", date:todayK, skillKey:sk, rating:trackRating};
                              const updatedScores = [scoreEntry, ...scores];
                              setScores(updatedScores);
                              store.set("rwc_scores", JSON.stringify(updatedScores));
                            }
                          }
                          // Write to rwc_done_ with __extra__ prefix (same as LogExtraWork)
                          try {
                            const doneKey = "rwc_done_"+todayK;
                            const existing = JSON.parse(store.get(doneKey)||"{}");
                            existing["__extra__"+sk+"__"+Date.now().toString(36)] = true;
                            store.set(doneKey, JSON.stringify(existing));
                          } catch (e86) {}
                          // Add to extraWork state for card display
                          const newEntry = {skillKey:sk, skillName:skName, duration:trackDuration, note:trackNote.trim(), rating:trackRating||0};
                          const updatedExtra = [...extraWork, newEntry];
                          setExtraWork(updatedExtra);
                          store.set("rwc_extra_done_"+todayK, JSON.stringify(updatedExtra));
                          // Update check-in timeMins
                          try {
                            const ciKey = "rwc_ci_"+todayK;
                            const ci = JSON.parse(store.get(ciKey)||"{}");
                            ci.timeMins = (ci.timeMins||0) + mins;
                            store.set(ciKey, JSON.stringify(ci));
                          } catch (e87) {}
                          setTrackSaved(true);
                          setTimeout(()=>{ setSkill(null); setTrackSaved(false); setTrackNote(""); setTrackDuration(""); setTrackRating(0); }, 1200);
                        },
                        style: {width:"100%",padding:"13px",borderRadius:12,border:"none",
                          background:trackDuration?GRNA:"#333",color:trackDuration?"#000":T3,
                          fontSize:15,fontWeight:700,cursor:trackDuration?"pointer":"not-allowed",opacity:trackDuration?1:0.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9672}}, "Log "
                         , trackDuration ? `${trackDuration} min` : "session"
                      )
                    )
                  )
                )
              ) : (
              React.createElement(React.Fragment, null
              , renderSkillSession()
              )
              )

              /* ADD EXTRA STAGE — today only, add as many as you want */
              , (()=>{
                const s = SKILLS[selectedSkill];
                if (!s || !s.progression || s.trackOnly) return null;
                const todayExtras = extraStages[selectedSkill] || [];
                const addOpen = expandedSkills.has(`add_stage_${selectedSkill}`);
                return (
                  React.createElement('div', { style: {marginTop:16,borderRadius:12,overflow:"hidden",border:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9743}}
                    , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has(`add_stage_${selectedSkill}`)?n.delete(`add_stage_${selectedSkill}`):n.add(`add_stage_${selectedSkill}`);return n;}),
                      style: {width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 15px",background:S2,border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9744}}
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 9746}}
                        , React.createElement('span', { style: {fontSize:11,fontWeight:700,color:T3,textTransform:"uppercase",letterSpacing:"0.08em"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9747}}, "Add a stage"  )
                        , todayExtras.length>0&&React.createElement('span', { style: {fontSize:10,color:GOLD,marginLeft:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9748}}, todayExtras.length, " added today"  )
                      )
                      , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9750}}, addOpen?"▲":"▼")
                    )
                    , addOpen&&(
                      React.createElement('div', { style: {background:S1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8,borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9753}}
                        /* added today — show with remove option */
                        , todayExtras.length>0&&(
                          React.createElement('div', { style: {marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9756}}
                            , React.createElement('div', { style: {fontSize:10,color:GOLD,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9757}}, "Added today" )
                            , todayExtras.map((e,i)=>(
                              React.createElement('div', { key: i, style: {display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:GOLDDIM,borderRadius:8,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9759}}
                                , React.createElement('span', { style: {flex:1,fontSize:12,color:GOLD,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9760}}, e.name)
                                , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9761}}, e.duration)
                                , React.createElement('button', { onClick: ()=>{
                                  const updated={...extraStages,[selectedSkill]:todayExtras.filter((_,j)=>j!==i)};
                                  setExtraStages(updated);
                                  store.set("rwc_stages_extra_"+todayK,JSON.stringify(updated));
                                }, style: {fontSize:11,color:REDA,background:"transparent",border:"none",cursor:"pointer",padding:"0 2px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9762}}, "✕")
                              )
                            ))
                          )
                        )
                        /* pick from skill's stages — all of them, with Settings overrides applied */
                        , (()=>{
                          let customProg = {};
                          try { const st=JSON.parse(store.get("rwc_settings")||"null"); customProg=_optionalChain([st, 'optionalAccess', _280 => _280.customProgressions, 'optionalAccess', _281 => _281[selectedSkill]])||{}; } catch (e88) {}
                          // Built-in stages with overrides
                          const builtIn = s.progression.map((stage,i)=>{
                            const ov = customProg[i];
                            return {
                              name: (ov && typeof ov==="object" ? ov.name : null) || stage.stage,
                              text: (ov && typeof ov==="object" ? ov.text : null) || stage.text,
                              duration: (ov && typeof ov==="object" && ov.duration && ov.duration!=="0 min" ? ov.duration : null) || stage.duration,
                              timer: (ov && typeof ov==="object" ? ov.timer : null) || stage.timer || "",
                            };
                          });
                          // Custom-added stages (from Settings)
                          const customAdded = Object.entries(customProg)
                            .filter(([k,v])=>parseInt(k)>=s.progression.length&&!_optionalChain([v, 'optionalAccess', _282 => _282.deleted]))
                            .sort((a,b)=>parseInt(a[0])-parseInt(b[0]))
                            .map(([,v])=>({
                              name: typeof v==="object"?v.name:"Custom",
                              text: typeof v==="object"?v.text:v,
                              duration: typeof v==="object"?v.duration||"10 min":"10 min",
                              timer: typeof v==="object"?v.timer||"":"",
                            }));
                          return [...builtIn, ...customAdded].map((stage,i)=>(
                            React.createElement('div', { key: i, style: {...card,padding:"12px 14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9796}}
                              , React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9797}}
                                , React.createElement('span', { style: {fontSize:13,fontWeight:700,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9798}}, stage.name)
                                , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9799}}, stage.duration)
                              )
                              , React.createElement('div', { style: {fontSize:12,color:T2,lineHeight:1.6,marginBottom:8,display:stage.text==="PROGRESSIVE_PLANK"?"none":"block"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9801}}, stage.text)
                              , React.createElement('button', { onClick: ()=>{
                                const updated={...extraStages,[selectedSkill]:[...todayExtras,{name:stage.name,text:stage.text,duration:stage.duration,timer:stage.timer}]};
                                setExtraStages(updated);
                                store.set("rwc_stages_extra_"+todayK,JSON.stringify(updated));
                              }, style: {fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:8,border:"none",background:GRNA,color:BG,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9802}}, "+ add" )
                            )
                          ));
                        })()
                      )
                    )
                  )
                );
              })()

              /* INLINE REFLECTION — hidden for trackOnly skills (note captured in tracker) */
              , !_optionalChain([SKILLS, 'access', _283 => _283[selectedSkill], 'optionalAccess', _284 => _284.trackOnly]) && (()=>{
                const savedReflection = selectedSkillIdx===0
                  ? reflections.find(r=>r.skillKey===selectedSkill&&r.date===todayK&&!r.extra)
                  : reflections.find(r=>r.skillKey===selectedSkill&&r.date===todayK&&r.extra===selectedSkillIdx);
                const alreadySaved = !!savedReflection;
                // pre-populate draft with saved text so editing works after untick
                const draftKey = `${selectedSkill}_${selectedSkillIdx}`;
                const currentDraft = draftNotes[draftKey] || (_optionalChain([savedReflection, 'optionalAccess', _285 => _285.text])||"");
                return (
                  React.createElement(InlineReflection, {
                    skillKey: selectedSkill,
                    skillName: _optionalChain([SKILLS, 'access', _286 => _286[selectedSkill], 'optionalAccess', _287 => _287.name])||selectedSkill,
                    draft: currentDraft,
                    onDraftChange: (sk,text)=>setDraft(`${sk}_${selectedSkillIdx}`,text),
                    alreadySaved: alreadySaved,
                    savedText: _optionalChain([savedReflection, 'optionalAccess', _288 => _288.text])||"", __self: this, __source: {fileName: _jsxFileName, lineNumber: 9826}}
                  )
                );
              })()

              /* DONE BUTTON — tick this skill from inside the detail view */
              , !_optionalChain([SKILLS, 'access', _289 => _289[selectedSkill], 'optionalAccess', _290 => _290.trackOnly]) && (()=>{
                const cardKey = `${selectedSkill}_pos${selectedSkillIdx}`;
                const isDone = !!done[cardKey];
                const isSkipped = !!skipped[cardKey];
                return (
                  React.createElement('div', { style: {marginTop:16,paddingTop:16,borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9843}}
                    , !isDone && !isSkipped ? (
                      React.createElement('button', { onClick: ()=>{ toggleDone(cardKey, selectedSkill, selectedSkillIdx); setSkill(null); }, style: {
                        width:"100%",padding:"15px",borderRadius:12,border:"none",
                        background:GRNA,color:BG,fontSize:16,fontWeight:700,cursor:"pointer",
                        letterSpacing:"-0.01em",
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9845}}, "✓ Mark as done"   )
                    ) : isDone ? (
                      React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8,alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9851}}
                        , React.createElement('div', { style: {fontSize:14,fontWeight:600,color:GRNA,padding:"4px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9852}}, "✓ Done" )
                        , React.createElement('button', { onClick: ()=>{ toggleDone(cardKey, selectedSkill, selectedSkillIdx); }, style: {
                          fontSize:11,color:T3,background:"transparent",
                          border:`1px solid ${BD}`,borderRadius:8,padding:"5px 14px",cursor:"pointer",
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9853}}, "Untick")
                      )
                    ) : (
                      React.createElement('div', { style: {textAlign:"center",fontSize:14,color:T3,padding:"12px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9859}}, "Skipped")
                    )
                  )
                );
              })()
            )
          ) : (
            // ── TODAY MAIN ──
            React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 9867}}

              /* injury banner */
              , (()=>{
                const notesLower=(_optionalChain([ci, 'optionalAccess', _291 => _291.notes])||"").toLowerCase();
                const injuryWords=["hamstring","hip","groin","quad","knee","ankle","calf","foot","back","shoulder","wrist","elbow"];
                const found=injuryWords.filter(b=>notesLower.includes(b));
                if(found.length===0) return null;
                return (
                  React.createElement('div', { style: {...card,padding:"10px 14px",marginBottom:8,borderLeft:`3px solid ${AMB}`,background:"rgba(255,159,10,0.08)"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9876}}
                    , React.createElement('div', { style: {fontSize:10,fontWeight:700,color:AMB,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9877}}, "⚠️ Injury flag"  )
                    , React.createElement('div', { style: {fontSize:12,color:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9878}}, "Plan adjusted for "   , found.join(", "), ".")
                  )
                );
              })()

              /* pre-session focus */
              , _optionalChain([ci, 'optionalAccess', _292 => _292.focus])&&(
                React.createElement('div', { style: {...card,padding:"12px 16px",marginBottom:8,borderLeft:`3px solid ${GOLD}`,background:GOLDDIM}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9885}}
                  , React.createElement('div', { style: {fontSize:10,fontWeight:700,color:GOLD,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9886}}, "Today's focus" )
                  , React.createElement('div', { style: {fontSize:14,color:T1,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9887}}, ci.focus)
                )
              )

              /* supplement reminder — always visible, warns on missed */
              , (()=>{
                const hour = new Date().getHours();
                const mySupps = settings.mySupplements ||
                  ["Creatine monohydrate","Omega-3 (EPA+DHA)","Vitamin D3","Beta-alanine","Magnesium glycinate","Multivitamin"];
                const suppTimings = settings.suppTimings || {};

                // get each supplement's effective timing (custom override or default)
                const getWhen = s => suppTimings[s.name] || s.when || "morning";

                const allSupps = [...SUPPLEMENT_SCHEDULE,...(settings.customSupplements||[])];
                const groups = [];

                const morningSupps = allSupps.filter(s=>mySupps.includes(s.name)&&getWhen(s)==="morning");
                const nightSupps   = allSupps.filter(s=>mySupps.includes(s.name)&&getWhen(s)==="night");
                const preSupps     = allSupps.filter(s=>mySupps.includes(s.name)&&getWhen(s)==="pre");
                const morningAllTaken = morningSupps.length > 0 && morningSupps.every(s=>suppLog[s.name]);
                const nightAllTaken   = nightSupps.length > 0 && nightSupps.every(s=>suppLog[s.name]);
                const preAllTaken     = preSupps.length > 0 && preSupps.every(s=>suppLog[s.name]);

                if (morningSupps.length > 0 && !morningAllTaken) {
                  const overdue = hour >= 12;
                  groups.push({label:"Morning", items:morningSupps, overdue});
                }
                if (preSupps.length > 0 && !preAllTaken && freeTimeMins > 0) {
                  groups.push({label:"Pre-training", items:preSupps, overdue:false});
                }
                if (nightSupps.length > 0 && !nightAllTaken && (hour >= 18 || hour < 5)) {
                  groups.push({label:"Before sleep", items:nightSupps, overdue:false});
                }

                if (groups.length === 0) {
                  // all supplements taken — show a small reset link in case of accident
                  const anyTaken = [...morningSupps,...nightSupps,...preSupps].some(s=>suppLog[s.name]);
                  if (!anyTaken) return null;
                  return (
                    React.createElement('div', { style: {marginBottom:8,textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9927}}
                      , React.createElement('button', { onClick: ()=>{
                        setSuppLog({});
                        store.set("rwc_supps_"+todayK, "{}");
                      }, style: {fontSize:10,color:T3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 0"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9928}}, "💊 all taken ✓ — undo?"

                      )
                    )
                  );
                }

                return (
                  React.createElement('div', { style: {...card,marginBottom:8,overflow:"hidden",borderLeft:`3px solid ${PRP}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9939}}
                    , groups.map((group,gi)=>(
                      React.createElement('div', { key: group.label, style: {padding:"10px 14px",borderBottom:gi<groups.length-1?`1px solid ${BD}`:"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9941}}
                        , React.createElement('div', { style: {fontSize:10,fontWeight:700,color:group.overdue?AMB:PRP,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9942}}
                          , group.overdue?"⚠️ ":"💊 ", group.label, " supplements" , group.overdue?" — not yet taken":""
                        )
                        , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9945}}
                          , group.items.map(s=>{
                            const taken = !!suppLog[s.name];
                            return (
                              React.createElement('button', { key: s.name, onClick: ()=>{
                                const updated = {...suppLog, [s.name]: taken ? null : new Date().toISOString()};
                                const clean = Object.fromEntries(Object.entries(updated).filter(([,v])=>v));
                                setSuppLog(clean);
                                store.set("rwc_supps_"+todayK, JSON.stringify(clean));
                                setSuppVersion(v=>v+1);
                                if (!taken) playSupplementTap();
                              }, style: {
                                display:"flex",alignItems:"center",gap:10,padding:"7px 10px",
                                borderRadius:9,border:`1px solid ${taken?GRNA+"55":group.overdue?AMB+"44":BD}`,
                                background:taken?GDIM:group.overdue?"rgba(255,159,10,0.08)":"transparent",
                                cursor:"pointer",textAlign:"left",
                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9949}}
                                , React.createElement('span', { style: {fontSize:18,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9962}}, s.icon)
                                , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9963}}
                                  , React.createElement('span', { style: {fontSize:12,fontWeight:600,color:taken?GRNA:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9964}}, s.name)
                                  , React.createElement('span', { style: {fontSize:11,color:GOLD,marginLeft:6,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9965}}, s.dose)
                                )
                                , React.createElement('span', { style: {fontSize:12,fontWeight:700,color:taken?GRNA:group.overdue?AMB:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9967}}
                                  , taken?"✓":group.overdue?"⚠️":"tap"
                                )
                              )
                            );
                          })
                        )
                      )
                    ))
                  )
                );
              })()

              /* retry banners — only for skills rated ≤2 */
              , algoMeta.retrySkills.filter(sk=>{
                const skillScores = (scores||[]).filter(s=>s.skillKey===sk).sort((a,b)=>b.date.localeCompare(a.date));
                return skillScores.length > 0 && skillScores[0].rating <= 2 && skills.includes(sk);
              }).map(sk=>(
                React.createElement('div', { key: sk, style: {...card,padding:"10px 14px",marginBottom:8,borderLeft:`3px solid ${REDA}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9985}}
                  , React.createElement('div', { style: {fontSize:12,color:REDA,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9986}}, "↩ "
                     , _optionalChain([SKILLS, 'access', _293 => _293[sk], 'optionalAccess', _294 => _294.name])||sk, " — rated poorly last time. Fix it today."
                  )
                )
              ))

              /* opponent countdown */
              /* injury banner */
              , _optionalChain([ci, 'optionalAccess', _295 => _295.notes]) ? renderInjuryBanner() : null

              /* session summary */
              , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9997}}
                , freeTimeMins>0?`${freeTimeMins} min`:"15 min", " · "  , skills.length, " skill" , skills.length!==1?"s":"", " · "  , partners===0?"solo":partners===1?"1 partner":`${partners} people`
              )

              /* controls */
              , React.createElement('div', { style: {display:"flex",gap:8,marginBottom:10,alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10002}}
                , React.createElement('button', { onClick: ()=>{
                  const newSkills=getTodaySkills(50,dow,notes,freeTimeMins,space,partners,matchStatus);
                  // keep skills that were already ticked — check by skill key regardless of position
                  const doneSkills = new Set(
                    Object.entries(done)
                      .filter(([,v])=>v)
                      .map(([k])=>k.replace(/^__extra__/,'').replace(/__[a-z0-9]+$/,'').replace(/_pos\d+$/,'').replace(/_extra_[a-z0-9]+$/,'').replace(/_\d+$/,''))
                      .filter(sk=>SKILLS[sk])
                  );
                  // kept = done skills in their original order
                  const kept = [...(frozenSkills||[])].filter((sk,pos)=>{
                    const cardKey=`${sk}_pos${pos}`;
                    return !!done[cardKey];
                  });
                  // fresh = new skills excluding already-done ones
                  const fresh = newSkills.filter(sk=>!doneSkills.has(sk));
                  const merged = [...kept,...fresh];
                  store.set("rwc_skills_"+todayK,JSON.stringify(merged));
                  setFrozenSkills(merged);
                  // remap done keys to new positions
                  const newDone = {};
                  merged.forEach((sk,pos)=>{
                    if(doneSkills.has(sk)) newDone[`${sk}_pos${pos}`]=true;
                  });
                  // keep existing done entries that already match
                  Object.entries(done).forEach(([k,v])=>{
                    if(v && !newDone[k]) {
                      const sk=k.replace(/^__extra__/,'').replace(/__[a-z0-9]+$/,'').replace(/_pos\d+$/,'').replace(/_extra_[a-z0-9]+$/,'').replace(/_\d+$/,'');
                      // only add if not already remapped above
                      if(!Object.keys(newDone).some(nk=>nk.startsWith(sk+'_pos'))) newDone[k]=v;
                    }
                  });
                  setDone(newDone);
                  store.set("rwc_done_"+todayK,JSON.stringify(newDone));
                }, style: {fontSize:10,color:T3,background:"transparent",border:`1px solid ${BD}`,
                  borderRadius:8,padding:"4px 10px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10003}}, "↻ regenerate" )
                , React.createElement('button', { onClick: ()=>setShowAddTask(t=>!t), style: {
                  fontSize:10,color:GOLD,background:GOLDDIM,border:`1px solid ${GOLD}44`,
                  borderRadius:8,padding:"4px 10px",cursor:"pointer",fontWeight:700,
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10039}}, "+ add task"  )
              )

              /* add task picker */
              , showAddTask&&(
                React.createElement('div', { style: {...card,padding:"14px 15px",marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10047}}
                  , React.createElement('div', { style: {fontSize:10,color:T3,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10048}}, "Pick a task to add"    )
                  , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10049}}
                    /* recommended option */
                    , (()=>{
                      const rec = getBonusSkill();
                      if (!rec) return null;
                      const s = SKILLS[rec];
                      return (
                        React.createElement('button', { onClick: ()=>{
                          const updated=[...(frozenSkills||[]),rec];
                          setFrozenSkills(updated);
                          store.set("rwc_skills_"+todayK,JSON.stringify(updated));
                          setShowAddTask(false);
                        }, style: {
                          display:"flex",alignItems:"center",gap:12,padding:"12px 13px",
                          borderRadius:10,border:`1px solid ${GRNA}44`,background:GDIM,
                          cursor:"pointer",textAlign:"left",marginBottom:4,
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10056}}
                          , React.createElement('span', { style: {fontSize:18}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10066}}, _optionalChain([s, 'optionalAccess', _296 => _296.icon])||"🏉")
                          , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10067}}
                            , React.createElement('div', { style: {fontSize:13,color:T1,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10068}}, _optionalChain([s, 'optionalAccess', _297 => _297.name])||rec)
                            , React.createElement('div', { style: {fontSize:10,color:GRNA}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10069}}, "⚡ Recommended — most overdue"    )
                          )
                        )
                      );
                    })()
                    , React.createElement('div', { style: {height:1,background:BD,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10074}})
                    , Object.entries(SKILLS).map(([k,s])=>{
                      const alreadyIn = skills.includes(k);
                      return (
                        React.createElement('button', { key: k, onClick: ()=>{
                          const updated=[...(frozenSkills||[]),k];
                          setFrozenSkills(updated);
                          store.set("rwc_skills_"+todayK,JSON.stringify(updated));
                          setShowAddTask(false);
                        }, style: {
                          display:"flex",alignItems:"center",gap:12,padding:"10px 12px",
                          borderRadius:10,border:`1px solid ${BD}`,background:S2,
                          cursor:"pointer",textAlign:"left",
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10078}}
                          , React.createElement('span', { style: {fontSize:18}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10088}}, s.icon)
                          , React.createElement('span', { style: {fontSize:13,color:T1,fontWeight:500,flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10089}}, s.name)
                          , alreadyIn&&React.createElement('span', { style: {fontSize:10,color:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10090}}, "+ again" )
                        )
                      );
                    })
                  )
                  , React.createElement('button', { onClick: ()=>setShowAddTask(false), style: {
                    marginTop:8,fontSize:10,color:T3,background:"transparent",border:"none",cursor:"pointer",padding:0,
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10095}}, "cancel")
                )
              )

              /* skill cards */
              , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8,marginBottom:18}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10102}}
                , _optionalChain([ci, 'optionalAccess', _298 => _298.context, 'optionalAccess', _299 => _299.matchDay]) ? (
                  React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10,marginTop:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10104}}
                    , React.createElement('div', { style: {...card,padding:"44px 20px",textAlign:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10105}}
                      , React.createElement('div', { style: {fontSize:48,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10106}}, "🏉")
                      , React.createElement('div', { style: {fontSize:22,fontWeight:700,color:T1,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10107}}, "Match day" )
                      , React.createElement('div', { style: {fontSize:15,color:T2,lineHeight:1.65}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10108}}, "No tasks today."  , React.createElement('br', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 10108}}), "Go play. Good luck."   )
                      , React.createElement('div', { style: {fontSize:13,color:GOLD,marginTop:16,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10109}}, "Portugal 🇵🇹" )
                    )
                    /* Post-game feedback card */
                    , React.createElement('div', { style: {...card,padding:"15px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10112}}
                      , React.createElement('button', { onClick: ()=>setShowGameFeedback(v=>!v), style: {display:"flex",alignItems:"center",gap:8,background:"transparent",border:"none",cursor:"pointer",padding:0,width:"100%",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10113}}
                        , React.createElement('span', { style: {fontSize:18}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10114}}, "📋")
                        , React.createElement('span', { style: {fontSize:13,fontWeight:700,color:T1,flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10115}}, "Post-game feedback" )
                        , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10116}}, showGameFeedback?"▲":"▼")
                      )
                      , showGameFeedback&&(()=>{
                        const savedFeedbacks = (() => { try { return JSON.parse(store.get("rwc_game_feedback")||"[]"); } catch (e89) { return []; } })();
                        const todayFeedback = savedFeedbacks.find(f => f.date === todayKey());
                        const skillKeys = Object.keys(SKILLS).filter(k => !["recovery","prehab"].includes(k));
                        const saveGameFeedback = () => {
                          const feedbacks = (() => { try { return JSON.parse(store.get("rwc_game_feedback")||"[]"); } catch (e90) { return []; } })();
                          const idx = feedbacks.findIndex(f => f.date === todayKey());
                          const entry = { date: todayKey(), text: gameFeedbackText, skills: gameFeedbackSkills };
                          if (idx >= 0) feedbacks[idx] = entry; else feedbacks.push(entry);
                          // Keep last 10
                          if (feedbacks.length > 10) feedbacks.splice(0, feedbacks.length - 10);
                          store.set("rwc_game_feedback", JSON.stringify(feedbacks));
                          setGameFeedbackSaved(true);
                          setTimeout(() => setGameFeedbackSaved(false), 2000);
                        };
                        return (
                          React.createElement('div', { style: {marginTop:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10134}}
                            , React.createElement('div', { style: {fontSize:12,color:T2,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10135}}, "What didn't go well? These skills will be prioritised in training over the next 3 days."               )
                            , React.createElement('textarea', {
                              placeholder: "e.g. My box kick was inconsistent under pressure, struggled at the lineout..."           ,
                              value: gameFeedbackText,
                              onChange: e=>setGameFeedbackText(e.target.value),
                              style: {width:"100%",minHeight:72,borderRadius:8,border:`1px solid ${BD}`,background:BG,color:T1,fontSize:12,padding:"8px",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10136}}
                            )
                            , React.createElement('div', { style: {fontSize:11,color:T3,marginTop:8,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10142}}, "Tag skills to prioritise:"   )
                            , React.createElement('div', { style: {display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10143}}
                              , skillKeys.map(k=>{
                                const active = gameFeedbackSkills.includes(k);
                                return (
                                  React.createElement('button', { key: k, onClick: ()=>setGameFeedbackSkills(prev=>active?prev.filter(s=>s!==k):[...prev,k]),
                                    style: {fontSize:10,padding:"4px 8px",borderRadius:12,border:`1px solid ${active?REDA:BD}`,background:active?`${REDA}22`:"transparent",color:active?REDA:T2,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10147}}
                                    , _optionalChain([SKILLS, 'access', _300 => _300[k], 'optionalAccess', _301 => _301.icon])||"•", " " , _optionalChain([SKILLS, 'access', _302 => _302[k], 'optionalAccess', _303 => _303.name])||k
                                  )
                                );
                              })
                            )
                            , todayFeedback && React.createElement('div', { style: {fontSize:11,color:GRNA,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10154}}, "✓ Saved earlier today"   )
                            , React.createElement('button', { onClick: saveGameFeedback, style: {padding:"8px 18px",borderRadius:8,background:gameFeedbackSaved?GRNA:REDA,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,transition:"background 0.3s"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10155}}
                              , gameFeedbackSaved ? "✓ Saved!" : "Save feedback"
                            )
                          )
                        );
                      })()
                    )
                  )
                ) : React.createElement(React.Fragment, null
                  /* Match window card */
                  , matchStatus&&matchStatus.type!=="normal"&&(()=>{
                    const m = matchStatus.match;
                    const isMatchday = matchStatus.type==="matchday";
                    const isRecovery = matchStatus.type==="recovery";
                    const col = isMatchday?REDA:GRNA;
                    const icon = isMatchday?"🏉":"🧊";
                    const team = _optionalChain([m, 'access', _304 => _304.competition, 'optionalAccess', _305 => _305.includes, 'call', _306 => _306(" · ")]) ? m.competition.split(" · ")[0] : "Portugal";
                    const title = isMatchday?`Match day — ${team} v ${m.opponent}`
                      :`Recovery — day after ${m.opponent} ${m.flag}`;
                    const sub = isMatchday?"Cognitive prime + light activation only"
                      :"Recovery day · prehab + mental only";
                    return (
                      React.createElement('div', { style: {...card,padding:"13px 15px",marginBottom:8,borderLeft:`3px solid ${col}`,background:`${col}18`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10177}}
                        , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10178}}
                          , React.createElement('span', { style: {fontSize:22}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10179}}, icon)
                          , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 10180}}
                            , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:col}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10181}}, title)
                            , React.createElement('div', { style: {fontSize:11,color:T3,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10182}}, sub, " · "  , m.competition, " · "  , m.venue)
                          )
                        )
                      )
                    );
                  })()
                  /* Next match reminder when normal */
                  , _optionalChain([matchStatus, 'optionalAccess', _307 => _307.type])==="normal"&&matchStatus.match&&matchStatus.daysUntil<=14&&(
                    React.createElement('div', { style: {...card,padding:"10px 14px",marginBottom:8,border:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10190}}
                      , React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10191}}
                        , (()=>{ const t=_optionalChain([matchStatus, 'access', _308 => _308.match, 'access', _309 => _309.competition, 'optionalAccess', _310 => _310.includes, 'call', _311 => _311(" · ")])?matchStatus.match.competition.split(" · ")[0]:"Portugal"; return React.createElement(React.Fragment, null, "🏉 " , React.createElement('span', { style: {color:T2,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10192}}, t, " v "  , matchStatus.match.opponent, " " , matchStatus.match.flag)); })()
                        , " ", "in " , React.createElement('span', { style: {color:GOLD,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10193}}, matchStatus.daysUntil, "d")
                        , " ", "· " , matchStatus.match.venue, " · "  , matchStatus.match.competition
                      )
                    )
                  )
                  , renderSkillCards()
                )
              )

              , !showCI&&extraWork.length>0&&(
                React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8,marginTop:8,marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10203}}
                  , extraWork.map((ew,i)=>(
                    React.createElement('div', { key: i, style: {...card,padding:"13px 15px",borderLeft:`3px solid ${GRNA}`,background:`rgba(48,209,88,0.06)`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10205}}
                      , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10206}}
                        , React.createElement('span', { style: {fontSize:20}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10207}}, _optionalChain([SKILLS, 'access', _312 => _312[ew.skillKey], 'optionalAccess', _313 => _313.icon])||"➕")
                        , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10208}}
                          , React.createElement('div', { style: {fontSize:14,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10209}}, ew.skillName)
                          , ew.duration&&React.createElement('div', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10210}}, ew.duration)
                        )
                        , React.createElement('span', { style: {fontSize:13,color:GRNA,fontWeight:700}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10212}}, "✓ extra" )
                      )
                      , ew.note&&React.createElement('div', { style: {fontSize:12,color:T2,marginTop:6,lineHeight:1.5,borderTop:`1px solid ${BD}`,paddingTop:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10214}}, ew.note)
                    )
                  ))
                )
              )

              /* Log extra work — always available in Today tab */
              , !showCI&&(
                React.createElement(LogExtraWork, {
                  todayK: todayK,
                  reflections: reflections,
                  setReflections: setReflections,
                  scores: scores,
                  setScores: setScores,
                  extraWork: extraWork,
                  setExtraWork: setExtraWork,
                  onSaved: ()=>setGamePtsVersion(v=>v+1),
                  card: card, BD: BD, S1: S1, S2: S2, S3: S3,
                  T1: T1, T2: T2, T3: T3, GOLD: GOLD, GRNA: GRNA, REDA: REDA, PRP: PRP, AMB: AMB, BG: BG,
                  store: store, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10222}}
                )
              )
              , allDone&&(
                React.createElement('div', { style: {marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10237}}
                  , React.createElement('div', { style: {...card,padding:"20px 18px",marginBottom:10,borderLeft:`3px solid ${GOLD}`,background:GOLDDIM}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10238}}
                    , React.createElement('div', { style: {fontSize:22,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10239}}, "✓")
                    , React.createElement('div', { style: {fontSize:18,fontWeight:700,color:GOLD,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10240}}, "Session complete" )
                    , React.createElement('div', { style: {fontSize:13,color:T2,lineHeight:1.65,marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10241}}
                      , (()=>{
                        const doneCount = skills.filter((sk,pos)=>{
                          const cardKey=`${sk}_pos${pos}`;
                          return !!done[cardKey];
                        }).length;
                        return `${doneCount} skill${doneCount!==1?"s":""} done${freeTimeMins>0?` · ${freeTimeMins} min`:""}`;
                      })()
                    )
                    , React.createElement('div', { style: {fontSize:12,color:GOLD,fontWeight:700,marginBottom:14}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10250}}, "🔥 "
                       , streak, " day streak · day "     , Math.max(0,476-days), " of 475"
                    )
                    , React.createElement('div', { style: {display:"flex",gap:6,flexWrap:"wrap"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10253}}
                      , [...new Set(skills)].map(sk=>{const s=SKILLS[sk];return React.createElement('span', { key: sk, style: {fontSize:11,color:_optionalChain([s, 'optionalAccess', _314 => _314.color])||T2,background:S1,borderRadius:6,padding:"3px 9px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10254}}, _optionalChain([s, 'optionalAccess', _315 => _315.icon]), " " , _optionalChain([s, 'optionalAccess', _316 => _316.name])||sk);})
                    )
                  )

                  , !bonusAccepted ? renderBonusRound() : null

                  , !dayReflectSaved?(
                    React.createElement('button', { onClick: ()=>{ setJournalStep(0); setJournalAnswers({}); setJournalOpen(true); }, style: {
                      ...card,width:"100%",padding:"16px 18px",marginBottom:10,
                      border:`1px solid ${GOLD}44`,background:GOLDDIM,cursor:"pointer",
                      display:"flex",alignItems:"center",gap:12,textAlign:"left",
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10261}}
                      , React.createElement('span', { style: {fontSize:24}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10266}}, "📓")
                      , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10267}}
                        , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:GOLD,marginBottom:3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10268}}, "Write today's reflection"  )
                        , React.createElement('div', { style: {fontSize:12,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10269}}, "Guided prompts · 2 minutes · bank the day"        )
                      )
                      , React.createElement('span', { style: {fontSize:18,color:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10271}}, "→")
                    )
                  ):null
                )
              )


              /* end of today tab */

            )
          )
        )

        /* ── NOTES ── */
        , tab==="notes" ? renderNotesTab() : null

        , tab==="progress"&&renderProgressTab()

        /* ── GAMES ── */
        , tab==="games"&&(
          React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10291}}

            /* PB DASHBOARD */
            , (()=>{
              const pbs = { passing:loadPB("passing"), kickpass:loadPB("kickpass"), numtrack:loadPB("numtrack"), ruckscan:loadPB("ruckscan") };
              if (!Object.values(pbs).some(p=>p)) return null;
              const lastStr = (pb) => {
                if (!_optionalChain([pb, 'optionalAccess', _317 => _317.lastPlayed])) return "";
                const t = pb.lastTime ? ` · ${pb.lastTime}` : "";
                return pb.lastPlayed + t;
              };
              return (
                React.createElement('div', { style: {...card,padding:"14px 16px",marginBottom:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10303}}
                  , React.createElement('div', { style: {...lbl,marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10304}}, "Personal bests" )
                  , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:7}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10305}}
                    , pbs.passing&&React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:S2,borderRadius:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10306}}
                      , React.createElement('span', { style: {fontSize:16,width:24,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10307}}, "←→")
                      , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10308}}
                        , React.createElement('div', { style: {fontSize:12,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10309}}, "Passing direction" )
                        , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10310}}, lastStr(pbs.passing))
                        , pbs.passing.lastAvgRt&&React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10311}}, "Last: " , pbs.passing.lastAvgRt, "ms · "  , pbs.passing.lastAccuracy, "%")
                      )
                      , React.createElement('div', { style: {textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10313}}, React.createElement('div', { style: {fontSize:14,fontWeight:800,color:GOLD}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10313}}, pbs.passing.avgRt, "ms"), React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10313}}, "best ↓" ))
                    )
                    , pbs.kickpass&&React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:S2,borderRadius:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10315}}
                      , React.createElement('span', { style: {fontSize:16,width:24,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10316}}, "🧠")
                      , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10317}}
                        , React.createElement('div', { style: {fontSize:12,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10318}}, "Read & Decide"  )
                        , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10319}}, lastStr(pbs.kickpass))
                        , pbs.kickpass.lastScore!==undefined&&React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10320}}, "Last: " , pbs.kickpass.lastScore, "/", pbs.kickpass.lastTotal)
                      )
                      , React.createElement('div', { style: {textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10322}}, React.createElement('div', { style: {fontSize:14,fontWeight:800,color:GRNA}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10322}}, pbs.kickpass.score, "/", pbs.kickpass.total), React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10322}}, "best"))
                    )
                    , pbs.ruckscan&&React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:S2,borderRadius:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10324}}
                      , React.createElement('span', { style: {fontSize:16,width:24,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10325}}, "👀")
                      , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10326}}
                        , React.createElement('div', { style: {fontSize:12,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10327}}, "Ruck scan" )
                        , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10328}}, lastStr(pbs.ruckscan))
                        , pbs.ruckscan.lastScore!==undefined&&React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10329}}, "Last: " , pbs.ruckscan.lastScore, "/", pbs.ruckscan.lastTotal)
                      )
                      , React.createElement('div', { style: {textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10331}}
                        , pbs.ruckscan.bestFlashMs
                          ? React.createElement(React.Fragment, null, React.createElement('div', { style: {fontSize:14,fontWeight:800,color:GRNA}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10333}}, (pbs.ruckscan.bestFlashMs/1000).toFixed(1), "s"), React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10333}}, "best 100%" ))
                          : React.createElement(React.Fragment, null, React.createElement('div', { style: {fontSize:14,fontWeight:800,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10334}}, "—"), React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10334}}, "no 100% yet"  ))
                        
                      )
                    )
                    , pbs.numtrack&&React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:S2,borderRadius:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10338}}
                      , React.createElement('span', { style: {fontSize:16,width:24,flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10339}}, "🔢")
                      , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10340}}
                        , React.createElement('div', { style: {fontSize:12,fontWeight:600,color:T1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10341}}, "Number tracker" )
                        , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10342}}, lastStr(pbs.numtrack))
                        , pbs.numtrack.lastScore!==undefined&&React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10343}}, "Last: " , pbs.numtrack.lastScore, "/", pbs.numtrack.lastTotal)
                      )
                      , React.createElement('div', { style: {textAlign:"right"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10345}}
                        , pbs.numtrack.bestFlashMs
                          ? React.createElement(React.Fragment, null, React.createElement('div', { style: {fontSize:14,fontWeight:800,color:PRP}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10347}}, (pbs.numtrack.bestFlashMs/1000).toFixed(1), "s"), React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10347}}, "best 100%" ))
                          : React.createElement(React.Fragment, null, React.createElement('div', { style: {fontSize:14,fontWeight:800,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10348}}, "—"), React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10348}}, "no 100% yet"  ))
                        
                      )
                    )
                  )
                )
              );
            })()

            , React.createElement('div', { style: {...lbl,marginBottom:2,marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10357}}, "Games")
            , React.createElement('div', { style: {fontSize:11,color:T3,marginBottom:8,lineHeight:1.6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10358}}, "Each completed game adds 1–2pts to your daily readiness score. Do 1–2 before a session."              )
            , [
              {key:"passing",  icon:"←→", label:"Passing direction", sub:"Read the signal · tap correct side · 10 rounds",    color:BLU,  desc:"Trains ruck-base read speed. Sub-350ms is world class."},
              {key:"kickpass", icon:"🧠", label:"Read & Decide",      sub:"Defensive shape · choose best action · 14 scenarios",color:GRNA, desc:"Merges defensive read + decision making. Difficulty increases over time."},
              {key:"numtrack", icon:"🔢", label:"Number tracker",     sub:"Scan jersey numbers · count by zone · 8 rounds",     color:PRP,  desc:"Spatial awareness. Flash time shortens as your accuracy improves."},
              {key:"ruckscan", icon:"👀", label:"Ruck scan",           sub:"Read defender cues · attack or pick · 10 rounds",   color:AMB,  desc:"Trains the sub-second read of defender body language at the breakdown."},
              {key:"cogprime", icon:"🧩", label:"Cognitive prime",    sub:"Pre-training · working memory + implementation intent",color:PRP, desc:"4-min pre-training protocol. Research shows it improves early-match decision speed by activating the prefrontal cortex before physical activity."},
            ].map(g=>(
              React.createElement('button', { key: g.key, onClick: ()=>setReactionGame(g.key), style: {
                ...card,width:"100%",padding:"14px 16px",
                border:`1px solid ${g.color}33`,background:g.color+"0d",
                cursor:"pointer",textAlign:"left",display:"block",
              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10366}}
                , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:12,marginBottom:5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10371}}
                  , React.createElement('span', { style: {fontSize:22,width:30,textAlign:"center",flexShrink:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10372}}, g.icon)
                  , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10373}}
                    , React.createElement('div', { style: {fontSize:14,fontWeight:700,color:g.color}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10374}}, g.label)
                    , React.createElement('div', { style: {fontSize:11,color:T3,marginTop:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10375}}, g.sub)
                  )
                  , React.createElement('span', { style: {fontSize:13,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10377}}, "→")
                )
                , React.createElement('div', { style: {fontSize:12,color:T2,lineHeight:1.55,paddingLeft:42}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10379}}, g.desc)
              )
            ))
          )
        )


        /* ── SETTINGS ── */
        , tab==="settings"&&(
          React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10388}}

            /* BODY */
            , React.createElement('div', { style: {fontSize:10,fontWeight:700,color:T3,textTransform:"uppercase",letterSpacing:"0.1em",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10391}}, "Body")

            /* target weight */
            , React.createElement('div', { style: {...card,padding:"16px 17px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10394}}
              , React.createElement('div', { style: {...lbl,marginBottom:12}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10395}}, "Target weight" )
              , React.createElement('div', { style: {display:"flex",gap:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10396}}
                , ["Min","Max"].map((label,i)=>{
                  const key=i===0?"weightMin":"weightMax";
                  return (
                    React.createElement('div', { key: key, style: {flex:1,background:S2,borderRadius:10,padding:"12px 14px"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10400}}
                      , React.createElement('div', { style: {fontSize:9,color:T3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10401}}, label)
                      , React.createElement('div', { style: {display:"flex",alignItems:"baseline",gap:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10402}}
                        , React.createElement('input', { type: "number", value: settings[key], onChange: e=>saveSettings({...settings,[key]:parseFloat(e.target.value)||settings[key]}),
                          style: {width:"100%",fontSize:28,fontWeight:900,background:"transparent",border:"none",outline:"none",color:GOLD,caretColor:GOLD,fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10403}})
                        , React.createElement('span', { style: {fontSize:14,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10405}}, "kg")
                      )
                    )
                  );
                })
              )
            )

            /* supplements */
            , (()=>{
              const open = expandedSkills.has("section_supplements");
              return (
                React.createElement('div', { style: {...card,overflow:"hidden"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10417}}
                  , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.has("section_supplements")?n.delete("section_supplements"):n.add("section_supplements");return n;}),
                    style: {width:"100%",display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10418}}
                    , React.createElement('span', { style: {flex:1,...lbl}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10420}}, "💊 Supplements" )
                    , React.createElement('span', { style: {fontSize:11,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10421}}, open?"▲":"▼")
                  )
                  , open&&(
                    React.createElement('div', { style: {borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10424}}
                      , React.createElement('div', { style: {padding:"10px 16px",background:REDDIM}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10425}}
                        , React.createElement('div', { style: {fontSize:11,color:REDA,fontWeight:600}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10426}}, "⚠️ Always choose Informed Sport certified products — tested against the WADA prohibited list."             )
                      )
                      /* per-supplement: toggle have + set timing */
                      , React.createElement('div', { style: {padding:"12px 16px",borderTop:`1px solid ${BD}`}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10429}}
                        , React.createElement('div', { style: {fontSize:10,color:T3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10430}}, "My supplements" )
                        , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10431}}
                          , [...SUPPLEMENT_SCHEDULE, ...(settings.customSupplements||[]).map(s=>({...s,custom:true}))].map(s=>{
                            const mySupps = settings.mySupplements||[];
                            const have = mySupps.includes(s.name);
                            const suppTimings = settings.suppTimings||{};
                            const timing = suppTimings[s.name] || s.when || "morning";
                            const timingLabels = {morning:"🌅 Morning", pre:"⚡ Pre-training", night:"🌙 Night"};
                            const editKey = "edit_supp_"+s.name;
                            const isEditing = expandedSkills.has(editKey);
                            return (
                              React.createElement('div', { key: s.name, style: {
                                background:S2,borderRadius:10,padding:"10px 12px",
                                border:`1px solid ${have?GRNA+"33":BD}`,
                                opacity:have?1:0.5,
                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10441}}
                                , isEditing ? (
                                  React.createElement(SuppEditor, {
                                    supp: s, isCustom: !!s.custom,
                                    onSave: (updated)=>{
                                      if (s.custom) {
                                        const updatedCustom = (settings.customSupplements||[]).map(cs=>cs.name===s.name?{...cs,...updated}:cs);
                                        // update mySupplements key if name changed
                                        const updatedMySupps = mySupps.map(n=>n===s.name?updated.name:n);
                                        const updatedTimings = {...suppTimings};
                                        if (updated.name!==s.name) { updatedTimings[updated.name]=updatedTimings[s.name]; delete updatedTimings[s.name]; }
                                        saveSettings({...settings,customSupplements:updatedCustom,mySupplements:updatedMySupps,suppTimings:updatedTimings});
                                      } else {
                                        // built-in: store overrides in suppOverrides
                                        const updatedOverrides = {...(settings.suppOverrides||{}),[s.name]:updated};
                                        const updatedTimings = {...suppTimings,[updated.name||s.name]:updated.when||timing};
                                        saveSettings({...settings,suppOverrides:updatedOverrides,suppTimings:updatedTimings});
                                      }
                                      setExpandedSkills(p=>{const n=new Set(p);n.delete(editKey);return n;});
                                    },
                                    onCancel: ()=>setExpandedSkills(p=>{const n=new Set(p);n.delete(editKey);return n;}),
                                    BD: BD, S1: S1, S2: S2, T1: T1, T2: T2, T3: T3, GOLD: GOLD, GRNA: GRNA, REDA: REDA, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10447}}
                                  )
                                ) : (
                                  React.createElement(React.Fragment, null
                                    , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,marginBottom:have?8:0}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10470}}
                                      , React.createElement('span', { style: {fontSize:18}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10471}}, s.icon||"💊")
                                      , React.createElement('div', { style: {flex:1}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10472}}
                                        , React.createElement('div', { style: {fontSize:13,fontWeight:600,color:have?T1:T2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10473}}, s.name)
                                        , React.createElement('div', { style: {fontSize:10,color:T3}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10474}}, s.dose||"")
                                      )
                                      , React.createElement('div', { style: {display:"flex",gap:5,alignItems:"center"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10476}}
                                        , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.add(editKey);return n;}),
                                          style: {fontSize:10,color:T3,background:"transparent",border:`1px solid ${BD}`,borderRadius:6,padding:"3px 8px",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10477}}, "edit")
                                        , React.createElement('button', { onClick: ()=>{
                                          const updated = have ? mySupps.filter(n=>n!==s.name) : [...mySupps,s.name];
                                          saveSettings({...settings,mySupplements:updated});
                                        }, style: {
                                          fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:7,border:"none",
                                          cursor:"pointer",background:have?GRNA:S3,color:have?BG:T3,
                                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10479}}, have?"✓":"+ add")
                                        , s.custom&&React.createElement('button', { onClick: ()=>{
                                          const updated=(settings.customSupplements||[]).filter(cs=>cs.name!==s.name);
                                          const updatedMySupps=mySupps.filter(n=>n!==s.name);
                                          saveSettings({...settings,customSupplements:updated,mySupplements:updatedMySupps});
                                        }, style: {fontSize:10,color:T3,background:"transparent",border:"none",cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10486}}, "✕")
                                      )
                                    )
                                    , have&&(
                                      React.createElement('div', { style: {display:"flex",gap:5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10494}}
                                        , ["morning","pre","night"].map(t=>(
                                          React.createElement('button', { key: t, onClick: ()=>{
                                            const updated = {...suppTimings,[s.name]:t};
                                            saveSettings({...settings,suppTimings:updated});
                                          }, style: {
                                            flex:1,fontSize:10,fontWeight:timing===t?700:400,
                                            padding:"5px 4px",borderRadius:7,border:"none",cursor:"pointer",
                                            background:timing===t?GOLD:S3,color:timing===t?BG:T3,
                                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10496}}, timingLabels[t])
                                        ))
                                      )
                                    )
                                    , have&&s.why&&React.createElement('div', { style: {fontSize:10,color:T3,marginTop:6,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10507}}, s.why.split('.')[0], ".")
                                  )
                                )
                              )
                            );
                          })

                          /* add custom supplement */
                          , React.createElement('div', { style: {borderTop:`1px solid ${BD}`,paddingTop:10,marginTop:2}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10515}}
                            , !expandedSkills.has("add_supp") ? (
                              React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.add("add_supp");return n;}), style: {
                                width:"100%",padding:"9px",borderRadius:9,border:`1px dashed ${BD}`,
                                background:"transparent",color:T3,fontSize:12,cursor:"pointer",
                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10517}}, "+ Add custom supplement"   )
                            ) : (
                              React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10522}}
                                , React.createElement('input', { placeholder: "Name (e.g. Ashwagandha)"  , id: "supp_name_input",
                                  style: {padding:"9px 12px",borderRadius:9,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:16,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10523}})
                                , React.createElement('div', { style: {display:"flex",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10525}}
                                  , React.createElement('input', { placeholder: "Dose (e.g. 600mg)"  , id: "supp_dose_input",
                                    style: {flex:1,padding:"9px 12px",borderRadius:9,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:16,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10526}})
                                  , React.createElement('select', { id: "supp_when_input", style: {flex:1,padding:"9px 12px",borderRadius:9,border:`1px solid ${BD}`,background:S1,color:T1,fontSize:13,outline:"none",fontFamily:"inherit"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10528}}
                                    , React.createElement('option', { value: "morning", __self: this, __source: {fileName: _jsxFileName, lineNumber: 10529}}, "Morning")
                                    , React.createElement('option', { value: "pre", __self: this, __source: {fileName: _jsxFileName, lineNumber: 10530}}, "Pre-training")
                                    , React.createElement('option', { value: "night", __self: this, __source: {fileName: _jsxFileName, lineNumber: 10531}}, "Night")
                                  )
                                )
                                , React.createElement('div', { style: {display:"flex",gap:6}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10534}}
                                  , React.createElement('button', { onClick: ()=>{
                                    const name = _optionalChain([document, 'access', _318 => _318.getElementById, 'call', _319 => _319("supp_name_input"), 'optionalAccess', _320 => _320.value, 'optionalAccess', _321 => _321.trim, 'call', _322 => _322()]);
                                    const dose = _optionalChain([document, 'access', _323 => _323.getElementById, 'call', _324 => _324("supp_dose_input"), 'optionalAccess', _325 => _325.value, 'optionalAccess', _326 => _326.trim, 'call', _327 => _327()]);
                                    const when = _optionalChain([document, 'access', _328 => _328.getElementById, 'call', _329 => _329("supp_when_input"), 'optionalAccess', _330 => _330.value])||"morning";
                                    if (!name) return;
                                    const custom = [...(settings.customSupplements||[]),{name,dose,when,icon:"💊"}];
                                    const mySupps = [...(settings.mySupplements||[]),name];
                                    saveSettings({...settings,customSupplements:custom,mySupplements:mySupps});
                                    setExpandedSkills(p=>{const n=new Set(p);n.delete("add_supp");return n;});
                                  }, style: {flex:1,padding:"9px",borderRadius:9,border:"none",background:GOLD,color:BG,fontWeight:700,fontSize:12,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10535}}, "Add")
                                  , React.createElement('button', { onClick: ()=>setExpandedSkills(p=>{const n=new Set(p);n.delete("add_supp");return n;}), style: {flex:1,padding:"9px",borderRadius:9,border:`1px solid ${BD}`,background:"transparent",color:T3,fontSize:12,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10545}}, "Cancel")
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              );
            })()

            /* target weight — moved to Body section above */

            /* TRAINING */
            , React.createElement('div', { style: {fontSize:10,fontWeight:700,color:T3,textTransform:"uppercase",letterSpacing:"0.1em",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10561}}, "Training")

            /* weaknesses */
            , renderMatchCalendarSection()
            , renderWeaknessesSection()

            /* active skills */
            , renderActiveSkillsSection()

            /* ── WEEKLY EXTRA PLAN ── */

            /* exercise progressions */
            , renderExerciseSection()
            /* ── ADD CUSTOM SKILL ── */
            , renderCustomSkillSection()

            /* BACKUP */
            , React.createElement('div', { style: {fontSize:10,fontWeight:700,color:T3,textTransform:"uppercase",letterSpacing:"0.1em",marginTop:4}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10578}}, "Backup")
            , React.createElement('div', { style: {...card,padding:"12px 16px",marginBottom:10}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10579}}
              , React.createElement('div', { style: {display:"flex",gap:8,marginBottom:8}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10580}}
                , React.createElement('button', { onClick: ()=>{
                  const csv=exportAllDataToCsv(history,scores,reflections,customDrills);
                  downloadCsv(csv,`portugal-9-data-${todayK}.csv`);
                }, style: {flex:1,padding:"11px",borderRadius:10,border:`1px solid ${BD}`,background:S2,color:T1,fontSize:13,fontWeight:600,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10581}}, "↓ Export CSV"  )
                , React.createElement('button', { onClick: ()=>document.getElementById("settings-csv-import").click(), style: {flex:1,padding:"11px",borderRadius:10,border:`1px solid ${GOLD}44`,background:GOLDDIM,color:GOLD,fontSize:13,fontWeight:600,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10585}}, "↑ Import CSV"  )
                , React.createElement('input', { id: "settings-csv-import", type: "file", accept: ".csv", onChange: (e)=>{
                  const file=e.target.files[0]; if(!file) return;
                  const reader=new FileReader();
                  reader.onload=(ev)=>{
                    const result=importCsvData(ev.target.result);
                    if(result.error) alert("Import failed: "+result.error);
                    else alert(`Imported: ${result.checkins} check-ins, ${result.scores} scores, ${result.reflections} notes. Reload to see it.`);
                  };
                  reader.readAsText(file);
                  e.target.value="";
                }, style: {display:"none"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10586}})
              )
              /* Export all notes as readable text for AI analysis */
              , React.createElement('button', { onClick: ()=>{
                const lines = [];
                lines.push("PORTUGAL #9 — ALL TRAINING NOTES");
                lines.push("Generated: " + new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}));
                lines.push("=".repeat(50));
                lines.push("");

                // Performance notes + general notes grouped by date
                const byDate = {};
                [...reflections].filter(r=>r.skillKey!=="day").sort((a,b)=>b.date.localeCompare(a.date)).forEach(r=>{
                  if(!byDate[r.date]) byDate[r.date]=[];
                  byDate[r.date].push(r);
                });
                if(Object.keys(byDate).length>0){
                  lines.push("── PERFORMANCE NOTES ──");
                  lines.push("");
                  Object.entries(byDate).forEach(([date,notes])=>{
                    const d = new Date(date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
                    lines.push(`[ ${d} ]`);
                    notes.forEach(r=>{
                      const skillLabel = r.skillKey==="freenote"?"General note":r.skillName||r.skillKey;
                      lines.push(`  ${skillLabel}${r.rating?` [${r.rating}/5]`:""}`);
                      if(r.text) r.text.split("\n").forEach(l=>lines.push(`    ${l}`));
                    });
                    lines.push("");
                  });
                }

                // Journal entries
                const journalEntries = [];
                try {
                  for(let i=0;i<localStorage.length;i++){
                    const k=localStorage.key(i);
                    if(_optionalChain([k, 'optionalAccess', _331 => _331.startsWith, 'call', _332 => _332("rwc_journal_")])){
                      const date=k.replace("rwc_journal_","");
                      const text=localStorage.getItem(k)||"";
                      if(text.trim()) journalEntries.push({date,text:text.trim()});
                    }
                  }
                } catch (e91) {}
                journalEntries.sort((a,b)=>b.date.localeCompare(a.date));
                if(journalEntries.length>0){
                  lines.push("── DAILY JOURNAL ──");
                  lines.push("");
                  journalEntries.forEach(e=>{
                    const d = new Date(e.date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
                    lines.push(`[ ${d} ]`);
                    e.text.split("\n").forEach(l=>lines.push(`  ${l}`));
                    lines.push("");
                  });
                }

                const blob = new Blob([lines.join("\n")], {type:"text/plain;charset=utf-8"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href=url; a.download=`training-notes-${todayK}.txt`; a.click();
                URL.revokeObjectURL(url);
              }, style: {width:"100%",padding:"11px",borderRadius:10,border:`1px solid ${PRP}44`,background:PRP+"11",color:PRP,fontSize:13,fontWeight:600,cursor:"pointer"}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10599}}, "✏️ Export all notes as text (for AI)"

              )
              , React.createElement('div', { style: {fontSize:10,color:T3,marginTop:6,lineHeight:1.5}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10659}}, "Downloads a readable .txt file of all your performance notes and journal entries — paste into ChatGPT, Claude, or any AI to get a summary of your progress and areas to improve."                               )
            )
          )
        )

      )
    )
  );
}

// ── error boundary — catches crashes and shows a recovery screen instead of white screen ──
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: _optionalChain([error, 'optionalAccess', _333 => _333.message]) || String(error) };
  }
  componentDidCatch(error, info) {
    try { console.error("App crashed:", error, info); } catch (e92) {}
  }
  render() {
    if (this.state.hasError) {
      return (
        React.createElement('div', { style: {
          fontFamily:"'Inter',-apple-system,sans-serif", background:"#090f09", minHeight:"100vh",
          color:"#e8f0e8", display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", padding:"32px 24px", textAlign:"center",
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10684}}
          , React.createElement('div', { style: { fontSize:40, marginBottom:16 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10689}}, "🏉")
          , React.createElement('div', { style: { fontSize:18, fontWeight:800, marginBottom:8 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10690}}, "Something went wrong"  )
          , React.createElement('div', { style: { fontSize:13, color:"#7a9a7a", lineHeight:1.6, marginBottom:16, maxWidth:320 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10691}}, "Your data is safe — it's saved to your browser, not lost."

          )
          , this.state.errorMsg && (
            React.createElement('div', { style: { fontSize:11, color:"#f87171", background:"#1a0808", border:"1px solid #f8717144",
              borderRadius:8, padding:"10px 14px", marginBottom:16, maxWidth:360,
              wordBreak:"break-word", textAlign:"left", lineHeight:1.6 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10695}}
              , this.state.errorMsg
            )
          )
          , React.createElement('button', { onClick: ()=>{
            this.setState({hasError:false,errorMsg:null}, ()=>{
              if(this.props.onReset) this.props.onReset();
            });
          }, style: {
            padding:"13px 28px", borderRadius:12, border:"none",
            background:"#c9a84c", color:"#0a0a0c", fontWeight:800, fontSize:14, cursor:"pointer",
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10701}}, "Reload app"

          )
        )
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [appKey, setAppKey] = React.useState(0);
  return (
    React.createElement(React.Fragment, null
      , React.createElement('style', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 10722}}, `
        /* prevent iOS from zooming into inputs — must be font-size >= 16px */
        input, textarea, select { font-size: 16px !important; }
        /* prevent double-tap zoom on buttons */
        button { touch-action: manipulation; }
        /* prevent overscroll bounce on the body */
        body { overscroll-behavior: none; }
        /* prevent pinch zoom inside game modals */
        .game-modal { touch-action: pan-y; overflow: hidden; }
        .game-modal * { touch-action: manipulation; }
      `)
    , React.createElement(ErrorBoundary, { onReset: ()=>setAppKey(k=>k+1), __self: this, __source: {fileName: _jsxFileName, lineNumber: 10733}}
      , React.createElement(AppInner, { key: appKey, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10734}})
    )
    )
  );
}
const _container = document.getElementById("root");
const _root = ReactDOM.createRoot(_container);
_root.render(React.createElement(App));
