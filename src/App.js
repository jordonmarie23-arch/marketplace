import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle, CheckCircle2, MapPin, Wifi, Plus, X, ArrowRightLeft, ShieldCheck, ChevronRight, Scale, DollarSign, Gavel, History, TrendingUp, Ban, Tag, Repeat, EyeOff, Timer } from 'lucide-react';

// ---------- Static config ----------
// NOTE: Cardiac and PET were added because they show up as subspecialties in the
// provider roster below. Their coverage minimums are a starting guess (1 network-wide)
// since they weren't specified — adjust COVERAGE_MIN if that's wrong.
const SPECIALTIES = ['General', 'MSK', 'Breast', 'Neuro', 'IR', 'Body', 'Peds', 'Cardiac', 'PET'];
const COVERAGE_MIN = { General: 2, MSK: 2, Breast: 3, Neuro: 2, IR: 3, Body: 2, Peds: 2, Cardiac: 1, PET: 1 };

// name() builds a display name that respects title: MDs/DOs get "Dr.", PAs get a ", PA"
// suffix instead, and blank/unknown titles get neither.
function name(first, last, title) {
  if (title === 'PA') return `${first} ${last}, PA`;
  if (title === 'MD' || title === 'DO') return `Dr. ${first} ${last}`;
  return `${first} ${last}`;
}

// Roster sourced from the practice's subspecialty sheet. "specialties" is an ordered
// array (primary first) since most providers cover more than one. "remote" marks
// providers who work off-site and therefore can't cover shifts flagged "on-site required".
const RADIOLOGISTS = [
  { id: 'gabboud', name: name('Ghadi', 'Abboud', 'MD'), title: 'MD', specialties: ['Body', 'General'], remote: false },
  { id: 'cburch', name: name('Cassandra', 'Burch', 'PA'), title: 'PA', specialties: ['IR'], remote: false },
  { id: 'scarbajal', name: name('Scott', 'Carbajal', 'MD'), title: 'MD', specialties: ['General'], remote: true },
  { id: 'jchoi', name: name('James', 'Choi', 'MD'), title: 'MD', specialties: ['MSK', 'General'], remote: false },
  { id: 'aessenmacher', name: name('Alex', 'Essenmacher', 'MD'), title: 'MD', specialties: ['General'], remote: false },
  { id: 'mfazio', name: name('Michael', 'Fazio', 'DO'), title: 'DO', specialties: ['MSK', 'Neuro', 'Breast'], remote: false },
  { id: 'agieseke', name: name('Ashley', 'Gieseke', 'PA'), title: 'PA', specialties: ['IR'], remote: false },
  { id: 'wheggen', name: name('William', 'Heggen', '-'), title: '-', specialties: ['General', 'Breast'], remote: false },
  { id: 'zhill', name: name('Zachary', 'Hill', 'DO'), title: 'DO', specialties: ['General'], remote: true },
  { id: 'nhilpipre', name: name('Nicholas', 'Hilpipre', 'DO'), title: 'DO', specialties: ['Breast', 'General', 'Peds', 'PET'], remote: false },
  { id: 'rholdsworth', name: name('Ryan', 'Holdsworth', 'MD'), title: 'MD', specialties: ['Neuro', 'General', 'PET'], remote: false },
  { id: 'ahurlbut', name: name('Aaron', 'Hurlbut', 'MD'), title: 'MD', specialties: ['Neuro', 'General'], remote: false },
  { id: 'pjabour', name: name('Paul', 'Jabour', 'MD'), title: 'MD', specialties: ['MSK', 'Breast', 'PET'], remote: false },
  { id: 'mjulian', name: name('Mark', 'Julian', 'DO'), title: 'DO', specialties: ['General', 'Breast'], remote: false },
  { id: 'rkaribo', name: name('Rory', 'Karibo', 'MD'), title: 'MD', specialties: ['General'], remote: false },
  { id: 'okaufman', name: name('Olaf', 'Kaufman', 'MD'), title: 'MD', specialties: ['IR', 'General', 'Cardiac'], remote: false },
  { id: 'bking', name: name('Bradley', 'King', 'DO'), title: 'DO', specialties: ['Body', 'General', 'Peds'], remote: false },
  { id: 'bkliewer', name: name('Bradley', 'Kliewer', 'DO'), title: 'DO', specialties: ['Breast', 'General', 'Cardiac'], remote: false },
  { id: 'dlacey', name: name('David', 'Lacey', 'MD'), title: 'MD', specialties: ['IR', 'General'], remote: false },
  { id: 'aliudahl', name: name('Adam', 'Liudahl', 'MD'), title: 'MD', specialties: ['Neuro', 'General'], remote: false },
  { id: 'eluebbert', name: name('Eric', 'Luebbert', 'DO'), title: 'DO', specialties: ['General'], remote: true },
  { id: 'dmagill', name: name('David', 'Magill', 'MD'), title: 'MD', specialties: ['IR', 'General'], remote: false },
  { id: 'rmenzel', name: name('Richard', 'Menzel', 'DO'), title: 'DO', specialties: ['General'], remote: true },
  { id: 'rmiller', name: name('Rebecca', 'Miller', 'PA'), title: 'PA', specialties: ['IR'], remote: false },
  { id: 'gmyneni', name: name('Gopika', 'Myneni', 'MD'), title: 'MD', specialties: ['Breast'], remote: false },
  { id: 'apeters', name: name('Austin', 'Peters', 'DO'), title: 'DO', specialties: ['General', 'Breast', 'Cardiac'], remote: false },
  { id: 'jrappleye', name: name('Jeffrey', 'Rappleye', 'MD'), title: 'MD', specialties: ['Neuro', 'General', 'PET'], remote: false },
  { id: 'briebe', name: name('Blake', 'Riebe', 'DO'), title: 'DO', specialties: ['MSK', 'Breast', 'General', 'PET'], remote: false },
  { id: 'mshaikh', name: name('Mohammed', 'Shaikh', 'MD'), title: 'MD', specialties: ['Body', 'General'], remote: false },
  { id: 'jsmith', name: name('Jordan', 'Smith', 'DO'), title: 'DO', specialties: ['General', 'Body', 'PET'], remote: false },
  { id: 'msoe', name: name('Michael', 'Soe', 'MD'), title: 'MD', specialties: ['General', 'Breast'], remote: true },
  { id: 'bsteinberg', name: name('Brent', 'Steinberg', 'MD'), title: 'MD', specialties: ['General', 'Peds'], remote: false },
  { id: 'astone', name: name('Alan', 'Stone', 'MD'), title: 'MD', specialties: ['Breast', 'General'], remote: false },
  { id: 'bstradling', name: name('Benjamin', 'Stradling', 'DO'), title: 'DO', specialties: ['IR', 'General'], remote: false },
  { id: 'cwaddell', name: name('Christopher', 'Waddell', 'DO'), title: 'DO', specialties: ['Breast', 'General'], remote: true },
  { id: 'jwestercamp', name: name('Jill', 'Westercamp', 'MD'), title: 'MD', specialties: ['Breast'], remote: false },
  { id: 'swise', name: name('Scott', 'Wise', 'MD'), title: 'MD', specialties: ['General'], remote: true },
  { id: 'bwynia', name: name('Brian', 'Wynia', 'DO'), title: 'DO', specialties: ['Breast', 'General'], remote: false },
];

// The annual weekend-call auction is a partner-only obligation. Adjust PARTNER_TITLES
// if PAs or other roles should also carry (or be able to sell/buy into) weekend call.
const PARTNER_TITLES = ['MD', 'DO'];
const PARTNERS = RADIOLOGISTS.filter((r) => PARTNER_TITLES.includes(r.title));

// ---------- Date helpers (UTC day-number based, avoids TZ drift) ----------
const toDay = (d) => Math.floor(new Date(d + 'T00:00:00Z').getTime() / 86400000);
const fromDay = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
const dateRange = (start, end) => {
  const s = toDay(start), e = toDay(end), out = [];
  for (let i = s; i <= e; i++) out.push(fromDay(i));
  return out;
};
const fmtShort = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtMoney = (n) => '$' + n.toLocaleString();

// ---------- Seed data ----------
const START_PRICE = 15000;
const STEP = 5000;

const seedAuctions = () => {
  const now = Date.now();
  return [
    {
      id: 'a1', label: 'Overnight Call', date: 'Sat, Aug 8', specialty: 'Neuro', requiresOnSite: false, postedBy: 'rholdsworth',
      currentPrice: 20000, status: 'open', claimedBy: null,
      history: [
        { event: 'listed', price: 15000, ts: now - 1000 * 60 * 60 * 30 },
        { event: 'raised', price: 20000, ts: now - 1000 * 60 * 60 * 6 },
      ],
    },
    {
      id: 'a2', label: 'Sunday Day Coverage', date: 'Sun, Aug 9', specialty: 'MSK', requiresOnSite: true, postedBy: 'jchoi',
      currentPrice: 15000, status: 'open', claimedBy: null,
      history: [{ event: 'listed', price: 15000, ts: now - 1000 * 60 * 60 * 4 }],
    },
    {
      id: 'a3', label: 'Overnight Call', date: 'Sat, Aug 15', specialty: 'IR', requiresOnSite: true, postedBy: 'okaufman',
      currentPrice: 15000, status: 'open', claimedBy: null,
      history: [{ event: 'listed', price: 15000, ts: now - 1000 * 60 * 60 * 2 }],
    },
    {
      id: 'a4', label: 'Overnight Call', date: 'Sat, Jul 25', specialty: 'General', requiresOnSite: false, postedBy: 'jsmith',
      currentPrice: 15000, status: 'claimed', claimedBy: 'zhill',
      history: [
        { event: 'listed', price: 15000, ts: now - 1000 * 60 * 60 * 24 * 9 },
        { event: 'claimed', price: 15000, ts: now - 1000 * 60 * 60 * 24 * 8, by: 'zhill' },
      ],
    },
  ];
};

const seedVacationRequests = () => [
  { id: 'v-ahurlbut-1', radId: 'ahurlbut', start: '2026-08-22', end: '2026-08-23', status: 'approved', openToTrade: false },
  { id: 'v-mfazio-1', radId: 'mfazio', start: '2026-08-10', end: '2026-08-14', status: 'approved', openToTrade: false },
  { id: 'v-bking-1', radId: 'bking', start: '2026-08-20', end: '2026-08-21', status: 'approved', openToTrade: false },
  { id: 'v-zhill-1', radId: 'zhill', start: '2026-09-01', end: '2026-09-05', status: 'approved', openToTrade: false },
  { id: 'v-nhilpipre-1', radId: 'nhilpipre', start: '2026-09-10', end: '2026-09-12', status: 'approved', openToTrade: false },
  { id: 'v-jchoi-1', radId: 'jchoi', start: '2026-10-01', end: '2026-10-03', status: 'approved', openToTrade: true },
  { id: 'v-scarbajal-1', radId: 'scarbajal', start: '2026-10-15', end: '2026-10-17', status: 'approved', openToTrade: true },
];

const seedTrades = () => [
  { id: 't1', reqAId: 'v-mfazio-1', reqBId: 'v-zhill-1', proposedBy: 'mfazio', status: 'pending', note: "Swap my Aug 10\u201314 week for your Sept 1\u20135 week" },
  { id: 't2', reqAId: 'v-bking-1', reqBId: 'v-nhilpipre-1', proposedBy: 'bking', status: 'pending', note: 'Swap my Aug 20\u201321 for your Sept 10\u201312' },
];

// ---------- Annual weekend-call auction ----------
// Rules encoded here: partners must work REQUIRED_WEEKENDS/year and can sell down to
// MIN_WEEKENDS. Selling and buying is anonymous while a round is open — only the final
// report reveals who sold to whom. Rounds start at ANNUAL_START_PRICE and step up by
// ANNUAL_STEP each time a round doesn't clear the full pool. Real rounds run 7 days on
// Central time; this prototype shows the true close time but also exposes a manual
// "Close Round" action (labeled as an admin/testing action) since there's no server-side
// scheduler here to auto-close a round after 7 real days.
const REQUIRED_WEEKENDS = 8;
const MIN_WEEKENDS = 4;
const MAX_SELLABLE = REQUIRED_WEEKENDS - MIN_WEEKENDS;
const ANNUAL_START_PRICE = 15000;
const ANNUAL_STEP = 5000;
const ROUND_LENGTH_MS = 1000 * 60 * 60 * 24 * 7;

function initialAnnualAuction(year) {
  const sellOffers = {};
  PARTNERS.forEach((p) => { sellOffers[p.id] = { committed: 0, remaining: 0 }; });
  return { year, phase: 'enrollment', sellOffers, rounds: [] };
}

// Round-robin, one unit at a time, across sellers who still have inventory — this is what
// produces the "everyone who's selling gives up one before anyone gives up a second"
// fairness rule from the spec. startOffset rotates which seller goes first each round so
// the same partner doesn't always lose the first unit.
// Buyer side is filled first-come-first-served by request timestamp; a request that can't
// be fully filled from remaining pool gets a partial allocation and any leftover request
// qty is simply dropped (the buyer would need to resubmit next round).
function clearAnnualRound(sellOffers, buyRequests, startOffset) {
  const sellerIds = Object.keys(sellOffers).filter((id) => sellOffers[id].remaining > 0);
  const totalSupply = sellerIds.reduce((sum, id) => sum + sellOffers[id].remaining, 0);
  const totalDemand = buyRequests.reduce((sum, r) => sum + r.qty, 0);
  const unitsToAllocate = Math.min(totalSupply, totalDemand);

  const cap = {};
  sellerIds.forEach((id) => { cap[id] = sellOffers[id].remaining; });
  const sellerSeq = [];
  let idx = sellerIds.length ? startOffset % sellerIds.length : 0;
  let guard = 0;
  while (sellerSeq.length < unitsToAllocate && guard < unitsToAllocate * sellerIds.length + 10) {
    const id = sellerIds[idx % sellerIds.length];
    if (cap[id] > 0) { sellerSeq.push(id); cap[id]--; }
    idx++;
    guard++;
  }

  const sortedRequests = [...buyRequests].sort((a, b) => a.ts - b.ts);
  const buyerSeq = [];
  sortedRequests.forEach((r) => {
    for (let i = 0; i < r.qty && buyerSeq.length < unitsToAllocate; i++) buyerSeq.push(r.buyerId);
  });

  const allocations = sellerSeq.map((sellerId, i) => ({ sellerId, buyerId: buyerSeq[i], qty: 1 }));

  const updatedSellOffers = { ...sellOffers };
  Object.keys(updatedSellOffers).forEach((id) => { updatedSellOffers[id] = { ...updatedSellOffers[id] }; });
  allocations.forEach((a) => { updatedSellOffers[a.sellerId].remaining -= 1; });

  return { allocations, updatedSellOffers, totalSupply, totalDemand, unitsAllocated: unitsToAllocate };
}

const fmtDateTimeCST = (ts) => new Date(ts).toLocaleString('en-US', {
  timeZone: 'America/Chicago', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
});
const fmtCountdownDays = (ms) => {
  if (ms <= 0) return 'Closing soon';
  const totalHours = Math.floor(ms / 3600000);
  const d = Math.floor(totalHours / 24), h = totalHours % 24;
  return d > 0 ? `${d}d ${h}h remaining` : `${h}h remaining`;
};

const badgeColor = 'bg-[#e6e7e8] text-[#211c35]';

export default function App() {
  const [tab, setTab] = useState('auction');
  const [currentUserId, setCurrentUserId] = useState(RADIOLOGISTS[0].id);
  const [auctions, setAuctions] = useState(seedAuctions);
  const [vacationRequests, setVacationRequests] = useState(seedVacationRequests);
  const [trades, setTrades] = useState(seedTrades);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ label: 'Overnight Call', date: '', startPrice: START_PRICE, specialty: RADIOLOGISTS[0].specialties[0], requiresOnSite: true });
  const [vacForm, setVacForm] = useState({ start: '2026-08-22', end: '2026-08-24' });
  const [tradeReview, setTradeReview] = useState({});
  const [proposalTarget, setProposalTarget] = useState(null); // id of board listing being proposed against
  const [proposalMyReq, setProposalMyReq] = useState('');
  const [annualAuction, setAnnualAuction] = useState(() => initialAnnualAuction(new Date().getFullYear() + 1));
  const [sellQtyDraft, setSellQtyDraft] = useState(0);
  const [buyQtyDraft, setBuyQtyDraft] = useState(1);
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNowTick(Date.now()), 30000); return () => clearInterval(t); }, []);

  const currentUser = RADIOLOGISTS.find((r) => r.id === currentUserId);
  const radById = (id) => RADIOLOGISTS.find((r) => r.id === id);

  // Keep the post-form specialty valid whenever the acting user changes.
  useEffect(() => {
    setPostForm((f) => ({ ...f, specialty: currentUser.specialties.includes(f.specialty) ? f.specialty : currentUser.specialties[0] }));
  }, [currentUserId]);

  // ---------- Coverage engine ----------
  function coverageAvailable(dateStr, specialty, excludeRadId, excludeReqIds = []) {
    let count = 0;
    RADIOLOGISTS.forEach((r) => {
      if (!r.specialties.includes(specialty) || r.id === excludeRadId) return;
      const isOff = vacationRequests.some((v) =>
        v.radId === r.id && (v.status === 'approved' || v.status === 'overridden') &&
        !excludeReqIds.includes(v.id) && dateStr >= v.start && dateStr <= v.end
      );
      if (!isOff) count++;
    });
    return count;
  }
  // Vacation for a multi-specialty radiologist can affect coverage on every specialty
  // they cover, not just one, so this checks all of them across the date range.
  function checkRange(radId, start, end, excludeReqIds = []) {
    const rad = radById(radId);
    const violations = [];
    dateRange(start, end).forEach((d) => {
      rad.specialties.forEach((sp) => {
        const avail = coverageAvailable(d, sp, radId, excludeReqIds);
        const min = COVERAGE_MIN[sp];
        if (avail < min) violations.push({ date: d, specialty: sp, avail, min });
      });
    });
    return violations;
  }
  function summarizeViolations(violations) {
    const bySpecialty = {};
    violations.forEach((v) => { bySpecialty[v.specialty] = (bySpecialty[v.specialty] || 0) + 1; });
    return Object.entries(bySpecialty).map(([sp, days]) => `${sp} below minimum on ${days} day${days > 1 ? 's' : ''}`);
  }

  const vacPreviewViolations = currentUser && vacForm.start && vacForm.end && vacForm.end >= vacForm.start
    ? checkRange(currentUserId, vacForm.start, vacForm.end) : [];

  function submitVacationRequest() {
    if (!vacForm.start || !vacForm.end || vacForm.end < vacForm.start) return;
    const violations = checkRange(currentUserId, vacForm.start, vacForm.end);
    const id = 'v-' + currentUserId + '-' + Date.now();
    setVacationRequests((prev) => [...prev, {
      id, radId: currentUserId, start: vacForm.start, end: vacForm.end,
      status: violations.length ? 'flagged' : 'approved', openToTrade: false,
    }]);
  }
  function overrideRequest(id) {
    setVacationRequests((prev) => prev.map((v) => v.id === id ? { ...v, status: 'overridden' } : v));
  }
  function withdrawRequest(id) {
    setVacationRequests((prev) => prev.filter((v) => v.id !== id));
  }
  function toggleOpenToTrade(id) {
    setVacationRequests((prev) => prev.map((v) => v.id === id ? { ...v, openToTrade: !v.openToTrade } : v));
  }

  // ---------- Trades ----------
  // Requests already tied up in a pending trade can't be posted/proposed again until resolved.
  const idsInPendingTrades = new Set(
    trades.filter((t) => t.status === 'pending').flatMap((t) => [t.reqAId, t.reqBId])
  );

  function reviewTrade(trade) {
    const reqA = vacationRequests.find((v) => v.id === trade.reqAId);
    const reqB = vacationRequests.find((v) => v.id === trade.reqBId);
    const violA = checkRange(reqA.radId, reqB.start, reqB.end, [reqA.id, reqB.id]);
    const violB = checkRange(reqB.radId, reqA.start, reqA.end, [reqA.id, reqB.id]);
    setTradeReview((prev) => ({ ...prev, [trade.id]: { violA, violB } }));
  }
  function finalizeTrade(trade) {
    const review = tradeReview[trade.id];
    const reqA = vacationRequests.find((v) => v.id === trade.reqAId);
    const reqB = vacationRequests.find((v) => v.id === trade.reqBId);
    const violA = review ? review.violA : checkRange(reqA.radId, reqB.start, reqB.end, [reqA.id, reqB.id]);
    const violB = review ? review.violB : checkRange(reqB.radId, reqA.start, reqA.end, [reqA.id, reqB.id]);
    setVacationRequests((prev) => prev.map((v) => {
      if (v.id === reqA.id) return { ...v, start: reqB.start, end: reqB.end, status: violA.length ? 'overridden' : 'approved', openToTrade: false };
      if (v.id === reqB.id) return { ...v, start: reqA.start, end: reqA.end, status: violB.length ? 'overridden' : 'approved', openToTrade: false };
      return v;
    }));
    setTrades((prev) => prev.map((t) => t.id === trade.id ? { ...t, status: 'completed' } : t));
  }
  function declineTrade(id) {
    setTrades((prev) => prev.map((t) => t.id === id ? { ...t, status: 'declined' } : t));
  }
  function proposeTrade(targetReqId) {
    if (!proposalMyReq) return;
    const id = 't-' + Date.now();
    setTrades((prev) => [...prev, {
      id, reqAId: proposalMyReq, reqBId: targetReqId, proposedBy: currentUserId, status: 'pending',
      note: 'Proposed from the trade board',
    }]);
    setProposalTarget(null);
    setProposalMyReq('');
  }

  // ---------- Auctions ----------
  function claimShift(auction) {
    setAuctions((prev) => prev.map((a) => {
      if (a.id !== auction.id || a.status !== 'open') return a;
      return {
        ...a, status: 'claimed', claimedBy: currentUserId,
        history: [...a.history, { event: 'claimed', price: a.currentPrice, by: currentUserId, ts: Date.now() }],
      };
    }));
  }
  function raisePrice(auction) {
    setAuctions((prev) => prev.map((a) => {
      if (a.id !== auction.id || a.status !== 'open') return a;
      const newPrice = a.currentPrice + STEP;
      return {
        ...a, currentPrice: newPrice,
        history: [...a.history, { event: 'raised', price: newPrice, ts: Date.now() }],
      };
    }));
  }
  function withdrawListing(auction) {
    setAuctions((prev) => prev.map((a) => {
      if (a.id !== auction.id || a.status !== 'open') return a;
      return {
        ...a, status: 'withdrawn',
        history: [...a.history, { event: 'withdrawn', price: a.currentPrice, ts: Date.now() }],
      };
    }));
  }
  function postShift() {
    if (!postForm.date || !postForm.specialty) return;
    const id = 'a-' + Date.now();
    setAuctions((prev) => [...prev, {
      id, label: postForm.label, date: postForm.date, specialty: postForm.specialty, requiresOnSite: postForm.requiresOnSite,
      currentPrice: Number(postForm.startPrice) || START_PRICE,
      status: 'open', claimedBy: null, postedBy: currentUserId,
      history: [{ event: 'listed', price: Number(postForm.startPrice) || START_PRICE, ts: Date.now() }],
    }]);
    setShowPostForm(false);
    setPostForm({ label: 'Overnight Call', date: '', startPrice: START_PRICE, specialty: currentUser.specialties[0], requiresOnSite: true });
  }

  // ---------- Annual weekend-call auction ----------
  function setSellCommitment(radId, qty) {
    const clamped = Math.max(0, Math.min(MAX_SELLABLE, qty));
    setAnnualAuction((prev) => {
      if (prev.phase !== 'enrollment') return prev;
      return {
        ...prev,
        sellOffers: { ...prev.sellOffers, [radId]: { committed: clamped, remaining: clamped } },
      };
    });
  }
  function startAnnualAuction() {
    setAnnualAuction((prev) => {
      if (prev.phase !== 'enrollment') return prev;
      const totalSupply = Object.values(prev.sellOffers).reduce((sum, o) => sum + o.remaining, 0);
      if (totalSupply === 0) return prev;
      const now = Date.now();
      return {
        ...prev,
        phase: 'auction',
        rounds: [{ number: 1, price: ANNUAL_START_PRICE, opensAt: now, closesAt: now + ROUND_LENGTH_MS, status: 'open', buyRequests: [], allocations: null }],
      };
    });
  }
  function withdrawSellUnit(radId) {
    setAnnualAuction((prev) => {
      if (prev.phase !== 'auction') return prev;
      const offer = prev.sellOffers[radId];
      if (!offer || offer.remaining <= 0) return prev;
      return { ...prev, sellOffers: { ...prev.sellOffers, [radId]: { ...offer, remaining: offer.remaining - 1 } } };
    });
  }
  function submitBuyRequest(buyerId, qty) {
    if (qty < 1) return;
    setAnnualAuction((prev) => {
      const rounds = [...prev.rounds];
      const i = rounds.length - 1;
      if (i < 0 || rounds[i].status !== 'open') return prev;
      const others = rounds[i].buyRequests.filter((r) => r.buyerId !== buyerId);
      rounds[i] = { ...rounds[i], buyRequests: [...others, { id: 'br-' + buyerId + '-' + Date.now(), buyerId, qty, ts: Date.now() }] };
      return { ...prev, rounds };
    });
  }
  function cancelBuyRequest(buyerId) {
    setAnnualAuction((prev) => {
      const rounds = [...prev.rounds];
      const i = rounds.length - 1;
      if (i < 0 || rounds[i].status !== 'open') return prev;
      rounds[i] = { ...rounds[i], buyRequests: rounds[i].buyRequests.filter((r) => r.buyerId !== buyerId) };
      return { ...prev, rounds };
    });
  }
  function closeCurrentRound() {
    setAnnualAuction((prev) => {
      const rounds = [...prev.rounds];
      const i = rounds.length - 1;
      if (i < 0 || rounds[i].status !== 'open') return prev;
      const { allocations, updatedSellOffers, unitsAllocated } = clearAnnualRound(prev.sellOffers, rounds[i].buyRequests, i);
      rounds[i] = { ...rounds[i], status: 'closed', allocations };
      const remainingSupply = Object.values(updatedSellOffers).reduce((sum, o) => sum + o.remaining, 0);
      let phase = prev.phase;
      if (remainingSupply > 0) {
        const now = Date.now();
        rounds.push({
          number: rounds[i].number + 1, price: rounds[i].price + ANNUAL_STEP,
          opensAt: now, closesAt: now + ROUND_LENGTH_MS, status: 'open', buyRequests: [], allocations: null,
        });
      } else {
        phase = 'closed';
      }
      return { ...prev, phase, sellOffers: updatedSellOffers, rounds };
    });
  }
  function startNextYearAuction() {
    setAnnualAuction((prev) => initialAnnualAuction(prev.year + 1));
  }

  const openAuctions = auctions.filter((a) => a.status === 'open').sort((x, y) => x.currentPrice - y.currentPrice);

  const settledAuctions = auctions.filter((a) => a.status !== 'open');

  const mapDays = dateRange('2026-08-05', '2026-08-25');

  return (
    <div className="flex h-full min-h-[720px] w-full bg-[#f8f8f8] text-[#222222] font-sans">
      <div className="w-60 shrink-0 bg-[#1c172e] text-[#f8f8f8] flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-[#635cc6] flex items-center justify-center font-bold text-[#f8f8f8] text-sm">IR</div>
          <div>
            <div className="font-semibold text-sm leading-tight">Iowa Radiology</div>
            <div className="text-xs text-[#966eed]">Shift Exchange</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem icon={Gavel} label="Shift Marketplace" active={tab === 'auction'} onClick={() => setTab('auction')} />
          <NavItem icon={ArrowRightLeft} label="Vacation & Trades" active={tab === 'vacation'} onClick={() => setTab('vacation')} />
          <NavItem icon={Repeat} label="Annual Call Auction" active={tab === 'annual'} onClick={() => setTab('annual')} />
          <NavItem icon={ShieldCheck} label="Coverage Map" active={tab === 'coverage'} onClick={() => setTab('coverage')} />
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-xs text-[#e6e7e8]/70">
          Prototype &middot; sample data only
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e6e7e8]">
          <div className="font-semibold text-[#211c35] text-base">
            {tab === 'auction' && 'Weekend Shift Marketplace'}
            {tab === 'vacation' && 'Vacation Requests & Trades'}
            {tab === 'annual' && `${annualAuction.year} Weekend Call Auction`}
            {tab === 'coverage' && 'Specialty Coverage Map'}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#222222]/60">Viewing as</span>
            <select
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="border border-[#e6e7e8] rounded-md px-2 py-1.5 bg-[#f8f8f8] text-[#211c35] font-medium"
            >
              {RADIOLOGISTS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} &middot; {r.specialties.join(', ')}{r.remote ? ' \u2014 Remote' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'auction' && (
            <AuctionTab
              currentUser={currentUser} radById={radById}
              openAuctions={openAuctions} settledAuctions={settledAuctions}
              claimShift={claimShift} raisePrice={raisePrice} withdrawListing={withdrawListing}
              showPostForm={showPostForm} setShowPostForm={setShowPostForm}
              postForm={postForm} setPostForm={setPostForm} postShift={postShift}
            />
          )}
          {tab === 'vacation' && (
            <VacationTab
              currentUser={currentUser} radById={radById}
              vacationRequests={vacationRequests} vacForm={vacForm} setVacForm={setVacForm}
              vacPreviewViolations={vacPreviewViolations} summarizeViolations={summarizeViolations}
              submitVacationRequest={submitVacationRequest}
              overrideRequest={overrideRequest} withdrawRequest={withdrawRequest}
              toggleOpenToTrade={toggleOpenToTrade} idsInPendingTrades={idsInPendingTrades}
              trades={trades} tradeReview={tradeReview} reviewTrade={reviewTrade}
              finalizeTrade={finalizeTrade} declineTrade={declineTrade}
              proposalTarget={proposalTarget} setProposalTarget={setProposalTarget}
              proposalMyReq={proposalMyReq} setProposalMyReq={setProposalMyReq} proposeTrade={proposeTrade}
            />
          )}
          {tab === 'coverage' && (
            <CoverageTab mapDays={mapDays} coverageAvailable={coverageAvailable} />
          )}
          {tab === 'annual' && (
            <AnnualAuctionTab
              currentUser={currentUser} radById={radById} nowTick={nowTick}
              annualAuction={annualAuction}
              sellQtyDraft={sellQtyDraft} setSellQtyDraft={setSellQtyDraft}
              buyQtyDraft={buyQtyDraft} setBuyQtyDraft={setBuyQtyDraft}
              setSellCommitment={setSellCommitment} startAnnualAuction={startAnnualAuction}
              withdrawSellUnit={withdrawSellUnit} submitBuyRequest={submitBuyRequest}
              cancelBuyRequest={cancelBuyRequest} closeCurrentRound={closeCurrentRound}
              startNextYearAuction={startNextYearAuction}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-[#635cc6] text-white' : 'text-[#e6e7e8]/80 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function SpecialtyBadge({ specialty }) {
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeColor}`}>{specialty}</span>;
}

function SpecialtyBadges({ specialties }) {
  return (
    <span className="flex flex-wrap gap-1">
      {specialties.map((sp) => <SpecialtyBadge key={sp} specialty={sp} />)}
    </span>
  );
}

function RemoteBadge() {
  return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#635cc6]/10 text-[#4a449c]">
      <Wifi size={11} /> Remote provider
    </span>
  );
}

function OnSiteBadge({ requiresOnSite }) {
  return requiresOnSite ? (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#211c35]/5 text-[#211c35]">
      <MapPin size={11} /> On-site required
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#635cc6]/10 text-[#4a449c]">
      <Wifi size={11} /> Remote OK
    </span>
  );
}

// ================= Auction Tab =================
function AuctionTab({ currentUser, radById, openAuctions, settledAuctions, claimShift, raisePrice, withdrawListing, showPostForm, setShowPostForm, postForm, setPostForm, postShift }) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#222222]/70">
          Ascending ask price: shifts list at ${START_PRICE.toLocaleString()}. If no one takes it, the price steps up by ${STEP.toLocaleString()} until someone accepts &mdash; or the poster pulls the listing.
        </p>
        <button
          onClick={() => setShowPostForm((s) => !s)}
          className="flex items-center gap-1.5 bg-[#635cc6] hover:bg-[#4a449c] text-white text-sm font-medium px-3 py-2 rounded-lg shrink-0 ml-4"
        >
          <Plus size={15} /> Post a Shift
        </button>
      </div>

      {showPostForm && (
        <div className="bg-white border border-[#e6e7e8] rounded-xl p-4 mb-5">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-[#222222]/60">Shift</label>
              <input value={postForm.label} onChange={(e) => setPostForm({ ...postForm, label: e.target.value })}
                className="w-full mt-1 border border-[#e6e7e8] rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#222222]/60">Date label (e.g. Sat, Aug 22)</label>
              <input value={postForm.date} onChange={(e) => setPostForm({ ...postForm, date: e.target.value })}
                placeholder="Sat, Aug 22" className="w-full mt-1 border border-[#e6e7e8] rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#222222]/60">Specialty</label>
              <select value={postForm.specialty} onChange={(e) => setPostForm({ ...postForm, specialty: e.target.value })}
                className="w-full mt-1 border border-[#e6e7e8] rounded-md px-2 py-1.5 text-sm bg-white">
                {currentUser.specialties.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#222222]/60">Starting price ($)</label>
              <input type="number" step={STEP} value={postForm.startPrice} onChange={(e) => setPostForm({ ...postForm, startPrice: e.target.value })}
                className="w-full mt-1 border border-[#e6e7e8] rounded-md px-2 py-1.5 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-[#211c35] select-none">
            <input
              type="checkbox"
              checked={postForm.requiresOnSite}
              onChange={(e) => setPostForm({ ...postForm, requiresOnSite: e.target.checked })}
              className="w-4 h-4 accent-[#635cc6]"
            />
            Required On-Site
            <span className="text-xs text-[#222222]/50 font-normal">(uncheck if this shift can be worked remotely)</span>
          </label>
          <div className="text-xs text-[#222222]/50 mt-2">Only radiologists certified in {postForm.specialty} will be able to claim it{postForm.requiresOnSite ? ', and remote-only providers will be excluded' : ''}.</div>
          <div className="flex gap-2 mt-3">
            <button onClick={postShift} className="bg-[#211c35] text-white text-sm font-medium px-3 py-1.5 rounded-md">Post Listing</button>
            <button onClick={() => setShowPostForm(false)} className="text-sm text-[#222222]/60 px-3 py-1.5">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {openAuctions.map((a) => (
          <AuctionCard key={a.id} auction={a} currentUser={currentUser} radById={radById}
            claimShift={claimShift} raisePrice={raisePrice} withdrawListing={withdrawListing} />
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-[#211c35] mb-3">
        <History size={15} /> Filled / Withdrawn
      </div>
      <div className="space-y-2">
        {settledAuctions.map((a) => (
          <div key={a.id} className="bg-white border border-[#e6e7e8] rounded-lg px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{a.label}</span> &middot; {a.date} &middot; <SpecialtyBadge specialty={a.specialty} />
            </div>
            <div className="text-[#222222]/70">
              {a.status === 'claimed'
                ? <>Taken by <span className="font-medium text-[#211c35]">{radById(a.claimedBy).name}</span> at {fmtMoney(a.currentPrice)}</>
                : <>Withdrawn at {fmtMoney(a.currentPrice)} &mdash; not worth it to the poster</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuctionCard({ auction, currentUser, radById, claimShift, raisePrice, withdrawListing }) {
  const specialtyMatches = RADIOLOGISTS.filter((r) => r.specialties.includes(auction.specialty) && r.id !== auction.postedBy);
  const eligible = auction.requiresOnSite ? specialtyMatches.filter((r) => !r.remote) : specialtyMatches;
  const userHasSpecialty = currentUser.specialties.includes(auction.specialty);
  const userBlockedByOnSite = auction.requiresOnSite && currentUser.remote;
  const canClaim = userHasSpecialty && currentUser.id !== auction.postedBy && !userBlockedByOnSite;
  const isPoster = currentUser.id === auction.postedBy;
  const noEligible = eligible.length === 0;

  return (
    <div className="bg-white border border-[#e6e7e8] rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[#211c35]">{auction.label}</span>
            <SpecialtyBadge specialty={auction.specialty} />
            <OnSiteBadge requiresOnSite={auction.requiresOnSite} />
          </div>
          <div className="flex items-center gap-3 text-xs text-[#222222]/60">
            <span className="flex items-center gap-1"><Calendar size={12} />{auction.date}</span>
            <span>Posted by {radById(auction.postedBy).name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e6e7e8]">
        <div className="text-sm flex items-center gap-1.5">
          <span className="text-[#222222]/60">Current price</span>
          <span className="font-semibold text-[#4a449c] text-base">{fmtMoney(auction.currentPrice)}</span>
          {auction.history.filter((h) => h.event === 'raised').length > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#966eed]"><TrendingUp size={12} /> raised {auction.history.filter((h) => h.event === 'raised').length}x</span>
          )}
        </div>
        {isPoster && (
          <div className="flex gap-2">
            <button onClick={() => raisePrice(auction)} className="flex items-center gap-1 text-xs text-[#4a449c] border border-[#e6e7e8] rounded-md px-2 py-1 hover:bg-[#f8f8f8]">
              <TrendingUp size={12} /> Raise by ${STEP.toLocaleString()}
            </button>
            <button onClick={() => withdrawListing(auction)} className="flex items-center gap-1 text-xs text-[#222222]/60 border border-[#e6e7e8] rounded-md px-2 py-1 hover:bg-[#f8f8f8]">
              <Ban size={12} /> Not worth it &mdash; withdraw
            </button>
          </div>
        )}
      </div>

      {noEligible ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-[#966eed] bg-[#966eed]/10 rounded-md px-3 py-2">
          <AlertTriangle size={14} /> No {auction.requiresOnSite ? 'on-site-capable ' : ''}{auction.specialty}-qualified radiologists in the network &mdash; no price will fill this internally.
        </div>
      ) : canClaim ? (
        <div className="mt-3">
          <button onClick={() => claimShift(auction)} className="bg-[#635cc6] hover:bg-[#4a449c] text-white text-sm font-medium px-4 py-2 rounded-md">
            Take this shift &mdash; {fmtMoney(auction.currentPrice)}
          </button>
        </div>
      ) : (
        <div className="mt-3 text-xs text-[#222222]/50">
          {isPoster
            ? 'This is your posted shift.'
            : userBlockedByOnSite
              ? 'This shift requires on-site coverage \u2014 you\u2019re marked as a remote provider.'
              : `Requires ${auction.specialty} certification to take it.`}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {auction.history.map((h, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#e6e7e8] text-[#211c35]">
            {h.event === 'listed' && `Listed at ${fmtMoney(h.price)}`}
            {h.event === 'raised' && `Raised to ${fmtMoney(h.price)}`}
            {h.event === 'claimed' && `Taken at ${fmtMoney(h.price)} by ${radById(h.by).name.replace('Dr. ', '')}`}
          </span>
        ))}
      </div>
    </div>
  );
}

// ================= Vacation Tab =================
function VacationTab({ currentUser, radById, vacationRequests, vacForm, setVacForm, vacPreviewViolations, summarizeViolations, submitVacationRequest, overrideRequest, withdrawRequest, toggleOpenToTrade, idsInPendingTrades, trades, tradeReview, reviewTrade, finalizeTrade, declineTrade, proposalTarget, setProposalTarget, proposalMyReq, setProposalMyReq, proposeTrade }) {
  const myRequests = vacationRequests.filter((v) => v.radId === currentUser.id);
  const boardListings = vacationRequests.filter((v) =>
    v.openToTrade && v.radId !== currentUser.id && v.status === 'approved' && !idsInPendingTrades.has(v.id)
  );
  const myEligibleToOffer = myRequests.filter((v) => v.status === 'approved' && !idsInPendingTrades.has(v.id));

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-[#211c35] mb-2">Request time off</h3>
        <div className="bg-white border border-[#e6e7e8] rounded-xl p-4">
          <div className="flex items-end gap-3">
            <div>
              <label className="text-xs font-medium text-[#222222]/60">Start</label>
              <input type="date" value={vacForm.start} onChange={(e) => setVacForm({ ...vacForm, start: e.target.value })}
                className="block mt-1 border border-[#e6e7e8] rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#222222]/60">End</label>
              <input type="date" value={vacForm.end} onChange={(e) => setVacForm({ ...vacForm, end: e.target.value })}
                className="block mt-1 border border-[#e6e7e8] rounded-md px-2 py-1.5 text-sm" />
            </div>
            <button onClick={submitVacationRequest} className="bg-[#635cc6] hover:bg-[#4a449c] text-white text-sm font-medium px-3 py-2 rounded-md">
              Submit Request
            </button>
            <span className="text-xs text-[#222222]/50">as {currentUser.name} &middot; {currentUser.specialties.join(', ')}</span>
          </div>

          {vacPreviewViolations.length > 0 ? (
            <div className="mt-3 flex items-start gap-2 text-xs text-[#966eed] bg-[#966eed]/10 rounded-md px-3 py-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Coverage would drop below minimum: {summarizeViolations(vacPreviewViolations).join('; ')}.
                Submitting will flag this request for admin override instead of auto-approving.
              </span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#4a449c] bg-[#635cc6]/10 rounded-md px-3 py-2">
              <CheckCircle2 size={14} /> Coverage holds for all of {currentUser.name.replace('Dr. ', '')}'s specialties &mdash; this would auto-approve.
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#211c35] mb-2">My requests</h3>
        <div className="space-y-2">
          {myRequests.length === 0 && <div className="text-sm text-[#222222]/50">No requests yet.</div>}
          {myRequests.map((v) => (
            <RequestRow key={v.id} v={v} radById={radById} overrideRequest={overrideRequest} withdrawRequest={withdrawRequest}
              toggleOpenToTrade={toggleOpenToTrade} lockedInTrade={idsInPendingTrades.has(v.id)} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#211c35] mb-2">Network vacation calendar</h3>
        <div className="space-y-2">
          {vacationRequests.filter((v) => v.radId !== currentUser.id).map((v) => (
            <RequestRow key={v.id} v={v} radById={radById} overrideRequest={overrideRequest} withdrawRequest={withdrawRequest} readOnly />
          ))}
        </div>
      </div>

      {/* Trade board */}
      <div>
        <h3 className="text-sm font-semibold text-[#211c35] mb-2 flex items-center gap-1.5"><Tag size={14} /> Vacation trade board</h3>
        <p className="text-xs text-[#222222]/60 mb-2">Weeks colleagues have posted as open to trade. Propose one of your own approved weeks in exchange.</p>
        <div className="space-y-2">
          {boardListings.length === 0 && <div className="text-sm text-[#222222]/50">No weeks posted for trade right now.</div>}
          {boardListings.map((v) => {
            const rad = radById(v.radId);
            const isProposing = proposalTarget === v.id;
            return (
              <div key={v.id} className="bg-white border border-[#e6e7e8] rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[#211c35]">{rad.name}</span>
                    <SpecialtyBadges specialties={rad.specialties} />
                    <span className="text-[#222222]/60">{fmtShort(v.start)} &ndash; {fmtShort(v.end)}</span>
                  </div>
                  {!isProposing && (
                    <button
                      onClick={() => { setProposalTarget(v.id); setProposalMyReq(''); }}
                      className="text-xs bg-[#635cc6] hover:bg-[#4a449c] text-white px-3 py-1.5 rounded-md"
                    >
                      Propose a trade
                    </button>
                  )}
                </div>
                {isProposing && (
                  <div className="mt-3 pt-3 border-t border-[#e6e7e8]">
                    {myEligibleToOffer.length === 0 ? (
                      <div className="text-xs text-[#222222]/50">You don't have an approved vacation week available to offer in trade.</div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#222222]/60">Offer:</span>
                        <select
                          value={proposalMyReq}
                          onChange={(e) => setProposalMyReq(e.target.value)}
                          className="border border-[#e6e7e8] rounded-md px-2 py-1.5 text-xs"
                        >
                          <option value="">Select your week&hellip;</option>
                          {myEligibleToOffer.map((mv) => (
                            <option key={mv.id} value={mv.id}>{fmtShort(mv.start)}&ndash;{fmtShort(mv.end)}</option>
                          ))}
                        </select>
                        <button
                          disabled={!proposalMyReq}
                          onClick={() => proposeTrade(v.id)}
                          className="text-xs bg-[#211c35] disabled:opacity-40 text-white px-3 py-1.5 rounded-md"
                        >
                          Send Proposal
                        </button>
                        <button onClick={() => setProposalTarget(null)} className="text-xs text-[#222222]/60 px-2 py-1.5">Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#211c35] mb-2 flex items-center gap-1.5"><ArrowRightLeft size={14} /> Pending & completed trades</h3>
        <div className="space-y-3">
          {trades.length === 0 && <div className="text-sm text-[#222222]/50">No trades yet.</div>}
          {trades.map((t) => (
            <TradeCard key={t.id} t={t} vacationRequests={vacationRequests} radById={radById} summarizeViolations={summarizeViolations}
              review={tradeReview[t.id]} reviewTrade={reviewTrade} finalizeTrade={finalizeTrade} declineTrade={declineTrade} />
          ))}
        </div>
      </div>
    </div>
  );
}

function statusStyle(status) {
  if (status === 'approved') return 'bg-[#635cc6]/10 text-[#4a449c]';
  if (status === 'overridden') return 'bg-[#966eed]/20 text-[#4a449c]';
  if (status === 'flagged') return 'bg-[#966eed]/20 text-[#966eed]';
  return 'bg-[#e6e7e8] text-[#222222]/60';
}

function RequestRow({ v, radById, overrideRequest, withdrawRequest, readOnly, toggleOpenToTrade, lockedInTrade }) {
  const rad = radById(v.radId);
  return (
    <div className="bg-white border border-[#e6e7e8] rounded-lg px-4 py-3 flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <span className="font-medium text-[#211c35]">{rad.name}</span>
        <SpecialtyBadges specialties={rad.specialties} />
        {rad.remote && <RemoteBadge />}
        <span className="text-[#222222]/60">{fmtShort(v.start)} &ndash; {fmtShort(v.end)}</span>
        {v.openToTrade && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#635cc6]/10 text-[#4a449c] flex items-center gap-1"><Tag size={10} /> On trade board</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle(v.status)}`}>
          {v.status === 'flagged' ? 'Coverage gap \u2014 needs review' : v.status}
        </span>
        {!readOnly && v.status === 'flagged' && (
          <button onClick={() => overrideRequest(v.id)} className="text-xs border border-[#e6e7e8] rounded-md px-2 py-1 hover:bg-[#f8f8f8]">Override & approve</button>
        )}
        {!readOnly && v.status === 'approved' && toggleOpenToTrade && (
          <button
            onClick={() => toggleOpenToTrade(v.id)}
            disabled={lockedInTrade}
            title={lockedInTrade ? 'Already tied up in a pending trade' : ''}
            className="text-xs border border-[#e6e7e8] rounded-md px-2 py-1 hover:bg-[#f8f8f8] disabled:opacity-40"
          >
            {v.openToTrade ? 'Remove from trade board' : 'Post to trade board'}
          </button>
        )}
        {!readOnly && (
          <button onClick={() => withdrawRequest(v.id)} className="text-[#222222]/40 hover:text-[#966eed]"><X size={14} /></button>
        )}
      </div>
    </div>
  );
}

function TradeCard({ t, vacationRequests, radById, review, reviewTrade, finalizeTrade, declineTrade, summarizeViolations }) {
  const reqA = vacationRequests.find((v) => v.id === t.reqAId);
  const reqB = vacationRequests.find((v) => v.id === t.reqBId);
  const radA = radById(reqA.radId), radB = radById(reqB.radId);
  const hasIssues = review && (review.violA.length > 0 || review.violB.length > 0);

  return (
    <div className="bg-white border border-[#e6e7e8] rounded-xl p-4 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-[#211c35]">{radA.name}</span> <SpecialtyBadges specialties={radA.specialties} />
          <span className="mx-2 text-[#222222]/40"><ArrowRightLeft size={12} className="inline" /></span>
          <span className="font-medium text-[#211c35]">{radB.name}</span> <SpecialtyBadges specialties={radB.specialties} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle(t.status === 'completed' ? 'approved' : t.status === 'pending' ? 'flagged' : '')}`}>
          {t.status}
        </span>
      </div>
      <div className="text-[#222222]/60 text-xs mt-1">
        {radA.name.replace('Dr. ', '')}: {fmtShort(reqA.start)}&ndash;{fmtShort(reqA.end)} &rarr; {fmtShort(reqB.start)}&ndash;{fmtShort(reqB.end)}
        <span className="mx-2">|</span>
        {radB.name.replace('Dr. ', '')}: {fmtShort(reqB.start)}&ndash;{fmtShort(reqB.end)} &rarr; {fmtShort(reqA.start)}&ndash;{fmtShort(reqA.end)}
      </div>

      {t.status === 'pending' && (
        <div className="mt-3">
          {!review && (
            <button onClick={() => reviewTrade(t)} className="text-xs border border-[#e6e7e8] rounded-md px-2 py-1.5 hover:bg-[#f8f8f8]">Check coverage rules</button>
          )}
          {review && (
            <div>
              {hasIssues ? (
                <div className="flex items-start gap-2 text-xs text-[#966eed] bg-[#966eed]/10 rounded-md px-3 py-2 mb-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {review.violA.length > 0 && <>{radA.name.replace('Dr. ', '')}: {summarizeViolations(review.violA).join('; ')}. </>}
                    {review.violB.length > 0 && <>{radB.name.replace('Dr. ', '')}: {summarizeViolations(review.violB).join('; ')}.</>}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#4a449c] bg-[#635cc6]/10 rounded-md px-3 py-2 mb-2">
                  <CheckCircle2 size={14} /> No coverage impact &mdash; safe to confirm.
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => finalizeTrade(t)} className="bg-[#635cc6] hover:bg-[#4a449c] text-white text-xs font-medium px-3 py-1.5 rounded-md">
                  {hasIssues ? 'Override & Confirm Swap' : 'Confirm Swap'}
                </button>
                <button onClick={() => declineTrade(t.id)} className="text-xs text-[#222222]/60 px-3 py-1.5">Decline</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ================= Coverage Tab =================
function CoverageTab({ mapDays, coverageAvailable }) {
  return (
    <div>
      <p className="text-sm text-[#222222]/70 mb-4">Each cell shows how many qualified radiologists remain available after approved vacations. Green = buffer above minimum, amber = exactly at minimum, red = below minimum.</p>

      <div className="overflow-x-auto bg-white border border-[#e6e7e8] rounded-xl p-4 mb-6">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="text-left pr-3 pb-2 sticky left-0 bg-white font-semibold text-[#211c35]">Specialty</th>
              {mapDays.map((d) => <th key={d} className="px-1 pb-2 font-normal text-[#222222]/50 whitespace-nowrap">{fmtShort(d)}</th>)}
            </tr>
          </thead>
          <tbody>
            {SPECIALTIES.map((sp) => (
              <tr key={sp}>
                <td className="pr-3 py-1 sticky left-0 bg-white font-medium text-[#211c35] whitespace-nowrap">{sp}</td>
                {mapDays.map((d) => {
                  const avail = coverageAvailable(d, sp, null, []);
                  const min = COVERAGE_MIN[sp];
                  const color = avail < min ? 'bg-[#966eed]' : avail === min ? 'bg-[#e6e7e8] text-[#211c35] border border-[#966eed]/50' : 'bg-[#635cc6]/15 text-[#211c35]';
                  return (
                    <td key={d} className="p-0.5">
                      <div className={`w-7 h-7 flex items-center justify-center rounded font-semibold ${color} ${avail < min ? 'text-white' : ''}`}>
                        {avail}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#222222]/60 mb-8">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#635cc6]/15 inline-block" /> Above minimum</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#e6e7e8] border border-[#966eed]/50 inline-block" /> At minimum</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#966eed] inline-block" /> Below minimum</span>
      </div>

      <h3 className="text-sm font-semibold text-[#211c35] mb-2">Minimum coverage rules</h3>
      <div className="bg-white border border-[#e6e7e8] rounded-xl divide-y divide-[#e6e7e8]">
        {SPECIALTIES.map((sp) => (
          <div key={sp} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className="flex items-center gap-2"><Users size={13} className="text-[#222222]/40" />{sp}</span>
            <span className="text-[#222222]/60">min {COVERAGE_MIN[sp]} network-wide</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= Annual Weekend-Call Auction Tab =================
function AnnualAuctionTab({
  currentUser, radById, nowTick, annualAuction, sellQtyDraft, setSellQtyDraft, buyQtyDraft, setBuyQtyDraft,
  setSellCommitment, startAnnualAuction, withdrawSellUnit, submitBuyRequest, cancelBuyRequest, closeCurrentRound, startNextYearAuction,
}) {
  const isPartner = PARTNER_TITLES.includes(currentUser.title);

  if (!isPartner) {
    return (
      <div className="max-w-2xl bg-white border border-[#e6e7e8] rounded-xl p-5 text-sm text-[#222222]/70">
        The annual weekend-call auction applies to partner radiologists (MD/DO). {currentUser.name} isn't enrolled in weekend call under the current roster settings.
      </div>
    );
  }

  if (annualAuction.phase === 'enrollment') {
    return <EnrollmentPhase currentUser={currentUser} annualAuction={annualAuction} sellQtyDraft={sellQtyDraft} setSellQtyDraft={setSellQtyDraft} setSellCommitment={setSellCommitment} startAnnualAuction={startAnnualAuction} />;
  }
  if (annualAuction.phase === 'closed') {
    return <ResultsReport radById={radById} annualAuction={annualAuction} startNextYearAuction={startNextYearAuction} />;
  }
  return (
    <LiveAuctionPhase
      currentUser={currentUser} nowTick={nowTick} annualAuction={annualAuction}
      buyQtyDraft={buyQtyDraft} setBuyQtyDraft={setBuyQtyDraft}
      withdrawSellUnit={withdrawSellUnit} submitBuyRequest={submitBuyRequest}
      cancelBuyRequest={cancelBuyRequest} closeCurrentRound={closeCurrentRound}
    />
  );
}

function EnrollmentPhase({ currentUser, annualAuction, sellQtyDraft, setSellQtyDraft, setSellCommitment, startAnnualAuction }) {
  const myOffer = annualAuction.sellOffers[currentUser.id] || { committed: 0, remaining: 0 };
  const partnersCommitted = Object.values(annualAuction.sellOffers).filter((o) => o.committed > 0).length;
  const totalCommitted = Object.values(annualAuction.sellOffers).reduce((sum, o) => sum + o.committed, 0);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-[#e6e7e8] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Repeat size={15} className="text-[#4a449c]" />
          <h3 className="text-sm font-semibold text-[#211c35]">{annualAuction.year} weekend call &mdash; enrollment</h3>
        </div>
        <p className="text-xs text-[#222222]/60 mb-4">
          Every partner covers {REQUIRED_WEEKENDS} call weekends this year, with a minimum of {MIN_WEEKENDS}. You can offer up to {MAX_SELLABLE} of yours for auction &mdash; the auction is anonymous, so no one sees who's selling how many until it closes.
        </p>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-[#222222]/60">Weekends to offer for sale</label>
          <input
            type="number" min={0} max={MAX_SELLABLE}
            value={sellQtyDraft}
            onChange={(e) => setSellQtyDraft(Math.max(0, Math.min(MAX_SELLABLE, Number(e.target.value))))}
            className="w-20 border border-[#e6e7e8] rounded-md px-2 py-1.5 text-sm"
          />
          <button
            onClick={() => setSellCommitment(currentUser.id, sellQtyDraft)}
            className="bg-[#635cc6] hover:bg-[#4a449c] text-white text-sm font-medium px-3 py-1.5 rounded-md"
          >
            Save my offer
          </button>
          {myOffer.committed > 0 && (
            <span className="text-xs text-[#4a449c] flex items-center gap-1"><CheckCircle2 size={13} /> Currently offering {myOffer.committed}</span>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#e6e7e8] rounded-xl p-4 flex items-center justify-between">
        <div className="text-sm">
          <div className="font-medium text-[#211c35] flex items-center gap-1.5"><EyeOff size={13} /> {partnersCommitted} partner{partnersCommitted === 1 ? '' : 's'} have offered weekends so far</div>
          <div className="text-xs text-[#222222]/60 mt-0.5">{totalCommitted} weekend{totalCommitted === 1 ? '' : 's'} in the pool, anonymously. Identities stay hidden until the auction closes.</div>
        </div>
        <button
          onClick={startAnnualAuction}
          disabled={totalCommitted === 0}
          className="bg-[#211c35] disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-md shrink-0"
        >
          Start Auction (Round 1)
        </button>
      </div>
    </div>
  );
}

function LiveAuctionPhase({ currentUser, nowTick, annualAuction, buyQtyDraft, setBuyQtyDraft, withdrawSellUnit, submitBuyRequest, cancelBuyRequest, closeCurrentRound }) {
  const round = annualAuction.rounds[annualAuction.rounds.length - 1];
  const closedRounds = annualAuction.rounds.slice(0, -1);
  const myOffer = annualAuction.sellOffers[currentUser.id] || { committed: 0, remaining: 0 };
  const poolRemaining = Object.values(annualAuction.sellOffers).reduce((sum, o) => sum + o.remaining, 0);
  const myRequest = round.buyRequests.find((r) => r.buyerId === currentUser.id);
  const remaining = round.closesAt - nowTick;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-[#e6e7e8] rounded-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#211c35]">Round {round.number}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#635cc6]/10 text-[#4a449c] flex items-center gap-1"><EyeOff size={11} /> Anonymous</span>
            </div>
            <div className="text-xs text-[#222222]/60 mt-1 flex items-center gap-1"><Timer size={12} /> Closes {fmtDateTimeCST(round.closesAt)} &middot; {fmtCountdownDays(remaining)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#222222]/60">Price per weekend</div>
            <div className="text-lg font-semibold text-[#4a449c]">{fmtMoney(round.price)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm bg-[#f8f8f8] rounded-md px-3 py-2">
          <Users size={14} className="text-[#222222]/50" />
          <span>{poolRemaining} weekend{poolRemaining === 1 ? '' : 's'} still available this round, from an undisclosed number of partners.</span>
        </div>
      </div>

      {myOffer.remaining > 0 && (
        <div className="bg-white border border-[#e6e7e8] rounded-xl p-4">
          <div className="text-sm font-medium text-[#211c35] mb-1">You're offering {myOffer.remaining} weekend{myOffer.remaining === 1 ? '' : 's'} for sale</div>
          <p className="text-xs text-[#222222]/60 mb-3">You can withdraw one at a time if you've changed your mind about selling at the current price.</p>
          <button onClick={() => withdrawSellUnit(currentUser.id)} className="flex items-center gap-1.5 text-xs border border-[#e6e7e8] rounded-md px-3 py-1.5 hover:bg-[#f8f8f8]">
            <Ban size={12} /> Withdraw one weekend from sale
          </button>
        </div>
      )}

      <div className="bg-white border border-[#e6e7e8] rounded-xl p-4">
        <div className="text-sm font-medium text-[#211c35] mb-1">Take on extra weekends</div>
        <p className="text-xs text-[#222222]/60 mb-3">Request how many you'd take at {fmtMoney(round.price)} each. You can change or cancel this until the round closes.</p>
        {myRequest ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-2 text-[#4a449c] font-medium">
              <CheckCircle2 size={15} /> Requesting {myRequest.qty} at {fmtMoney(round.price * myRequest.qty)} total
            </span>
            <button onClick={() => cancelBuyRequest(currentUser.id)} className="text-xs text-[#222222]/60 border border-[#e6e7e8] rounded-md px-2 py-1 hover:bg-[#f8f8f8]">Cancel request</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number" min={1}
              value={buyQtyDraft}
              onChange={(e) => setBuyQtyDraft(Math.max(1, Number(e.target.value)))}
              className="w-20 border border-[#e6e7e8] rounded-md px-2 py-1.5 text-sm"
            />
            <button
              onClick={() => submitBuyRequest(currentUser.id, buyQtyDraft)}
              className="bg-[#635cc6] hover:bg-[#4a449c] text-white text-sm font-medium px-3 py-1.5 rounded-md"
            >
              Request weekends
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-dashed border-[#966eed]/50 rounded-xl p-4">
        <div className="text-xs text-[#222222]/60 mb-2">Rounds close automatically after 7 days in production. This is a prototype without a server-side scheduler, so closing the round is a manual admin action here.</div>
        <button onClick={closeCurrentRound} className="flex items-center gap-1.5 text-xs bg-[#211c35] text-white rounded-md px-3 py-1.5">
          <Scale size={12} /> Close Round {round.number} Now (admin)
        </button>
      </div>

      {closedRounds.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-[#211c35] mb-2 flex items-center gap-1.5"><History size={14} /> Earlier rounds</div>
          <div className="space-y-2">
            {closedRounds.map((r) => (
              <div key={r.number} className="bg-white border border-[#e6e7e8] rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
                <span>Round {r.number} &middot; {fmtMoney(r.price)}/weekend</span>
                <span className="text-[#222222]/60">{r.allocations.length} weekend{r.allocations.length === 1 ? '' : 's'} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsReport({ radById, annualAuction, startNextYearAuction }) {
  const allAllocations = annualAuction.rounds.flatMap((r) => r.allocations.map((a) => ({ ...a, round: r.number, price: r.price })));

  const bySeller = {};
  allAllocations.forEach((a) => {
    if (!bySeller[a.sellerId]) bySeller[a.sellerId] = [];
    bySeller[a.sellerId].push(a);
  });

  const totalSold = allAllocations.length;
  const totalValue = allAllocations.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-[#e6e7e8] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={16} className="text-[#4a449c]" />
          <h3 className="text-sm font-semibold text-[#211c35]">{annualAuction.year} weekend call auction &mdash; final results</h3>
        </div>
        <p className="text-xs text-[#222222]/60">
          {totalSold} weekend{totalSold === 1 ? '' : 's'} changed hands across {annualAuction.rounds.length} round{annualAuction.rounds.length === 1 ? '' : 's'}, totaling {fmtMoney(totalValue)}. Identities are now public.
        </p>
      </div>

      <div className="space-y-2">
        {Object.entries(bySeller).map(([sellerId, sales]) => {
          const seller = radById(sellerId);
          const total = sales.reduce((sum, s) => sum + s.price, 0);
          return (
            <div key={sellerId} className="bg-white border border-[#e6e7e8] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#211c35]">{seller.name}</span>
                <span className="text-sm text-[#4a449c] font-semibold">{fmtMoney(total)}</span>
              </div>
              <div className="space-y-1">
                {sales.map((s, i) => (
                  <div key={i} className="text-xs text-[#222222]/70 flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-[#222222]/30" />
                    Sold 1 weekend to {radById(s.buyerId).name} &middot; Round {s.round} &middot; {fmtMoney(s.price)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={startNextYearAuction} className="flex items-center gap-1.5 bg-[#635cc6] hover:bg-[#4a449c] text-white text-sm font-medium px-4 py-2 rounded-md">
        <Repeat size={14} /> Start {annualAuction.year + 1} Enrollment
      </button>
    </div>
  );
}
