'use client'

import { useState } from 'react'

const DISCOVERY_QUESTIONS = [
  { id: 'age', text: 'How old are you?', sub: 'Affects licensing, contracts and what platforms you can legally use.', multi: false, options: [{ val: '13-15', title: '13-15', desc: 'Some platforms need parental permission' }, { val: '16-17', title: '16-17', desc: 'Can contract independently in most states' }, { val: '18-20', title: '18-20', desc: 'Full legal access to contracts and licenses' }, { val: '21+', title: '21+', desc: 'All doors open' }] },
  { id: 'location_type', text: 'Where do you live?', sub: 'Changes everything — rural Montana and Miami have completely different opportunities.', multi: false, options: [{ val: 'dense_city', title: 'Dense city', desc: 'NYC, LA, Chicago, Houston, Miami etc.' }, { val: 'mid_city', title: 'Mid-size city or suburb', desc: '200k-1M population' }, { val: 'small_town', title: 'Small town', desc: 'Under 100k people' }, { val: 'rural', title: 'Rural / countryside', desc: 'Farm country, spread-out communities' }] },
  { id: 'climate', text: "What's your climate like?", sub: 'Determines whether seasonal businesses work for or against you.', multi: false, options: [{ val: 'four_seasons', title: 'Cold winters, hot summers', desc: 'Full four seasons' }, { val: 'warm_yearround', title: 'Warm or hot year-round', desc: 'South, Southwest, Florida, California' }, { val: 'mild', title: 'Mild and temperate', desc: 'Pacific Northwest, coastal areas' }] },
  { id: 'time', text: 'How many hours a week can you honestly commit?', sub: 'Be real — overcommitting is the #1 reason people quit.', multi: false, options: [{ val: 'under5', title: 'Under 5 hours', desc: 'A couple evenings a week' }, { val: '5to10', title: '5-10 hours', desc: 'About an hour most days' }, { val: '10to20', title: '10-20 hours', desc: 'A solid part-time commitment' }, { val: '20plus', title: '20+ hours', desc: 'Treating this like a real job from day one' }] },
  { id: 'money', text: "What's your real startup budget?", sub: 'No judgment — many of the best paths start free.', multi: false, options: [{ val: 'zero', title: '$0 — needs to be free', desc: '' }, { val: 'under100', title: 'Up to $100', desc: '' }, { val: '100to500', title: '$100-$500', desc: '' }, { val: '500plus', title: '$500 or more', desc: 'Ready to invest properly' }] },
  { id: 'physical', text: 'How do you feel about physical or outdoor work?', sub: 'Honest answer unlocks a whole tier of high-income paths most people overlook.', multi: false, options: [{ val: 'love_it', title: 'Love it', desc: 'Outdoors, tools, physical effort is fine' }, { val: 'fine_with_it', title: 'Fine with it if the money is right', desc: 'Not my first choice but I will do it' }, { val: 'prefer_not', title: 'Prefer to avoid it', desc: 'Rather work from a desk or screen' }, { val: 'cant', title: "Can't do heavy physical work", desc: 'Medical or personal reasons' }] },
  { id: 'environment', text: 'Where would you rather spend most of your working time?', sub: 'Think about what actually energises you day to day.', multi: false, options: [{ val: 'outdoors', title: 'Outside — fresh air, moving around', desc: 'Job sites, neighbourhoods, nature' }, { val: 'indoors_mobile', title: 'Inside but moving between locations', desc: 'Different client homes, offices, venues' }, { val: 'home', title: 'From home or a fixed space', desc: 'My own desk, my own schedule' }, { val: 'no_preference', title: 'No strong preference', desc: 'Whatever the work demands' }] },
  { id: 'interest_area', text: 'Which of these worlds genuinely interests you?', sub: 'Not what you are good at yet — what pulls your attention naturally.', multi: true, options: [{ val: 'tech', title: 'Technology & software', desc: 'Apps, automation, computers, AI' }, { val: 'business', title: 'Business & money', desc: 'Sales, finance, strategy, deals' }, { val: 'trades', title: 'Skilled trades & construction', desc: 'Building, fixing, working with your hands' }, { val: 'health', title: 'Health & the human body', desc: 'Fitness, medicine, wellbeing' }, { val: 'wellness', title: 'Wellness & beauty', desc: 'Skincare, massage, aesthetics, self-care' }, { val: 'creative', title: 'Creative work', desc: 'Design, photography, music, video' }, { val: 'helping', title: 'Helping & serving people', desc: 'Teaching, coaching, caregiving' }, { val: 'nature', title: 'Outdoors & nature', desc: 'Land, animals, agriculture, environment' }, { val: 'animals', title: 'Animals & pets', desc: 'Caring for, grooming, working with animals' }, { val: 'food', title: 'Food & hospitality', desc: 'Cooking, baking, feeding people' }, { val: 'automotive', title: 'Vehicles & automotive', desc: 'Cars, trucks, mechanics, transport' }, { val: 'events', title: 'Events & hospitality', desc: 'Parties, weddings, gatherings, hosting' }, { val: 'flipping', title: 'Buying, selling & flipping', desc: 'Spotting value, reselling, trading' }, { val: 'beauty', title: 'Beauty & aesthetics', desc: 'Lashes, nails, makeup, skin, hair' }] },
  { id: 'income_style', text: 'What income style suits your personality?', sub: 'Both are legitimate — this is about what you can actually live with.', multi: false, options: [{ val: 'steady', title: 'Steady and predictable', desc: 'Same clients, recurring income, reliable schedule' }, { val: 'variable', title: 'Variable but high upside', desc: 'Feast and famine is fine if the ceiling is high' }, { val: 'passive', title: 'Build once, earn repeatedly', desc: 'Products, systems, licensing' }, { val: 'no_pref', title: 'No strong preference', desc: 'Show me the best fit regardless' }] },
  { id: 'people_pref', text: 'How do you feel about working directly with clients or customers?', sub: 'Be honest — some people thrive on it, others find it draining.', multi: false, options: [{ val: 'love_people', title: 'Love it — people give me energy', desc: 'The more interaction the better' }, { val: 'fine_people', title: 'Fine with it', desc: 'I can handle clients well but do not need it' }, { val: 'minimal_people', title: 'Prefer minimal client interaction', desc: 'Give me the work, let me do it alone' }, { val: 'no_people', title: 'Strongly prefer no client-facing work', desc: 'Backend, remote, async only' }] },
  { id: 'business_type', text: 'What kind of business do you want to build eventually?', sub: 'Even if it is years away — this shapes which path makes the most sense to start on.', multi: false, options: [{ val: 'local_physical', title: 'A local business with real presence', desc: 'Vehicles, equipment, employees, community reputation' }, { val: 'online_remote', title: 'A fully online or remote business', desc: 'Location independent, laptop-friendly' }, { val: 'product', title: 'A product or software I own', desc: 'Something I build once and sell repeatedly' }, { val: 'unsure', title: 'Not sure yet', desc: 'Show me what fits and I will figure it out' }] },
  { id: 'skills', text: 'Which of these do you already have some ability in?', sub: 'Even partial skill counts. Select all that honestly apply.', multi: true, options: [{ val: 'coding', title: 'Coding / software development', desc: 'Any language' }, { val: 'nocode', title: 'No-code tools', desc: 'Webflow, Bubble, Zapier, Make, Notion' }, { val: 'tech_general', title: 'General tech / IT', desc: 'Computers, networks, troubleshooting' }, { val: 'numbers', title: 'Numbers / finance / spreadsheets', desc: 'Math comes naturally' }, { val: 'teaching', title: 'Teaching / explaining clearly', desc: 'People get it after you explain' }, { val: 'sales', title: 'Sales / persuasion', desc: 'You can pitch, close, handle objections' }, { val: 'trades', title: 'Trades / mechanical / hands-on', desc: 'Tools, fixing things, building' }, { val: 'driving', title: 'Reliable vehicle + clean license', desc: 'Car, truck or van available' }, { val: 'truck_van', title: 'Own a truck or van', desc: 'Access to a larger vehicle for hauling or transport' }, { val: 'medical', title: 'Medical / health background', desc: 'CNA, EMT, any healthcare experience' }, { val: 'value_eye', title: 'Eye for value / sourcing', desc: 'You naturally spot underpriced or undervalued things' }, { val: 'none', title: 'Nothing specific yet', desc: 'Starting completely from scratch' }] },
  { id: 'goal', text: 'What does success look like in the next 12 months?', sub: '', multi: false, options: [{ val: 'first_dollar', title: 'Make my first real dollar', desc: 'Proof I can actually earn' }, { val: 'side_income', title: '$500-$2,000/month on the side', desc: 'Meaningful supplemental income' }, { val: 'replace_income', title: 'Replace a full-time income', desc: '$3,000+/month' }, { val: 'build_business', title: 'Build something with real equity', desc: 'A business I could eventually sell or scale' }] },
]

const SCALING_QUESTIONS = [
  { id: 'business_name', text: 'What kind of business do you run?', sub: 'Be specific — "mobile dog grooming" is more useful than "pets."', multi: false, freetext: true, options: [] },
  { id: 'time_running', text: 'How long have you been running it?', sub: 'Honest answer — even if it feels longer or shorter than it has been.', multi: false, options: [{ val: 'under6mo', title: 'Less than 6 months', desc: 'Just getting started' }, { val: '6mo_2yr', title: '6 months to 2 years', desc: 'Getting traction but still building' }, { val: '2yr_5yr', title: '2 to 5 years', desc: 'Established but looking to level up' }, { val: '5yr_plus', title: '5+ years', desc: 'This is a real operating business' }] },
  { id: 'team_size', text: 'Are you solo or do you have help?', sub: 'This tells us more about your stage than almost anything else.', multi: false, options: [{ val: 'solo', title: 'Just me — no employees or contractors', desc: '' }, { val: 'contractors', title: 'Me plus occasional contractors or freelancers', desc: 'You bring in help but no one is on payroll' }, { val: 'small_team', title: '1 to 3 employees', desc: 'You have people working for you regularly' }, { val: 'real_team', title: '4 or more employees or crews', desc: 'You are running an actual operation' }] },
  { id: 'monthly_revenue', text: 'What is your monthly revenue right now, roughly?', sub: 'Be honest — this is about building the right roadmap for where you actually are.', multi: false, options: [{ val: 'zero', title: '$0 — not making money yet', desc: 'Still in setup or pre-revenue' }, { val: 'under1k', title: 'Under $1,000/month', desc: '' }, { val: '1k_5k', title: '$1,000-$5,000/month', desc: '' }, { val: '5k_15k', title: '$5,000-$15,000/month', desc: '' }, { val: '15k_50k', title: '$15,000-$50,000/month', desc: '' }, { val: '50k_plus', title: '$50,000+/month', desc: 'Serious operation' }] },
  { id: 'biggest_blocker', text: 'What is actually holding you back from growing right now?', sub: 'Select all that apply — most people have more than one blocker.', multi: true, options: [{ val: 'not_enough_clients', title: 'Not enough clients or customers', desc: 'The pipeline is the problem' }, { val: 'maxed_out_time', title: 'I am maxed out on time and cannot take more work', desc: 'You are the bottleneck' }, { val: 'hiring_help', title: 'I do not know how to hire or manage people', desc: 'Ready to grow but not sure how' }, { val: 'systems', title: 'I have no real systems — everything runs through me', desc: 'Needs structure to scale' }, { val: 'exit_scale', title: 'I want to think about selling or stepping back', desc: 'Ready for Phase 5 conversations' }] },
]

type Answers = Record<string, string | string[]>
type Mode = 'landing' | 'discovery' | 'scaling'

interface Match {
  title: string
  category: string
  why: string
  cost: string
  timeToFirst: string
  difficulty: string
  income: string
  aiProof: boolean
  isDiscovery: boolean
  rankLabel: string
}

interface Results {
  summary: string
  matches: Match[]
  total: number
}

function determinePlacement(answers: Answers): number {
  const team = answers.team_size as string
  const revenue = answers.monthly_revenue as string
  const time = answers.time_running as string
  const blockers = (Array.isArray(answers.biggest_blocker) ? answers.biggest_blocker : [answers.biggest_blocker]) as string[]
  if (revenue === 'zero') return 1
  if (team === 'real_team' || revenue === '50k_plus') return 5
  if (team === 'small_team' || revenue === '15k_50k') return 4
  if (blockers.includes('exit_scale')) return 5
  if (blockers.includes('hiring_help') || blockers.includes('systems')) return 4
  if (revenue === '5k_15k' || time === '2yr_5yr' || time === '5yr_plus') return 3
  if (revenue === '1k_5k' || team === 'contractors') return 2
  return 1
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('landing')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [freetextVal, setFreetextVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [scalingComplete, setScalingComplete] = useState(false)
  const [placement, setPlacement] = useState(1)

  const questions = mode === 'discovery' ? DISCOVERY_QUESTIONS : SCALING_QUESTIONS
  const q = questions[step]
  const ans = answers[q?.id || '']
  const pct = Math.round((step / questions.length) * 100)
  const canNext = (q as any)?.freetext
    ? freetextVal.trim().length > 2
    : q?.multi
    ? Array.isArray(ans) && ans.length > 0
    : !!ans

  function pick(val: string) {
    if (!q) return
    if (q.multi) {
      const cur = (answers[q.id] as string[]) || []
      setAnswers({ ...answers, [q.id]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] })
    } else {
      setAnswers({ ...answers, [q.id]: val })
    }
  }

  function isSelected(val: string) {
    if (!q) return false
    if (q.multi) return Array.isArray(ans) && ans.includes(val)
    return ans === val
  }

  async function next() {
    if ((q as any)?.freetext) {
      setAnswers({ ...answers, [q.id]: freetextVal.trim() })
    }
    if (step < questions.length - 1) {
      setStep(step + 1)
      return
    }
    if (mode === 'discovery') {
      setLoading(true)
      try {
        const finalAnswers = (q as any)?.freetext ? { ...answers, [q.id]: freetextVal.trim() } : answers
        const res = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: finalAnswers }) })
        const data = await res.json()
        setResults(data)
      } catch (e) { console.error(e) }
      setLoading(false)
    } else {
      const finalAnswers = { ...answers, business_name: freetextVal || answers.business_name }
      const phase = determinePlacement(finalAnswers)
      setPlacement(phase)
      setScalingComplete(true)
    }
  }

  function retake() {
    setStep(0)
    setAnswers({})
    setResults(null)
    setFreetextVal('')
    setScalingComplete(false)
    setMode('landing')
  }

  if (mode === 'landing') {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>Venture<span style={{ color: '#10B981' }}>Guide</span></span>
            <p style={{ color: '#666', fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>The honest path from zero to a real scalable business.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => setMode('discovery')} style={{ width: '100%', padding: '20px', borderRadius: 16, border: '2px solid #10B981', background: '#10B98111', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🧭</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>I am starting from scratch</p>
                  <p style={{ fontSize: 13, color: '#888', lineHeight: 1.4 }}>Take the quiz and we will match you to the right business path based on your life, location, and goals.</p>
                </div>
              </div>
            </button>
            <button onClick={() => setMode('scaling')} style={{ width: '100%', padding: '20px', borderRadius: 16, border: '2px solid #333', background: '#111', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🚀</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>I already have a business</p>
                  <p style={{ fontSize: 13, color: '#888', lineHeight: 1.4 }}>Tell us where you are and we will build a scaling roadmap that picks up where you left off.</p>
                </div>
              </div>
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 24 }}>No hype. No get-rich-quick. Just the real path.</p>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #222', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: '#666' }}>Finding your best matches...</p>
          <p style={{ fontSize: 12, color: '#444', marginTop: 4 }}>Matching across 100+ paths</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </main>
    )
  }

  if (scalingComplete) {
    const businessName = (answers.business_name as string) || freetextVal
    const blockers = (Array.isArray(answers.biggest_blocker) ? answers.biggest_blocker : [answers.biggest_blocker]) as string[]
    const phaseLabels: Record<number, string> = { 1: 'Launch', 2: 'Build', 3: 'Establish', 4: 'Operate', 5: 'Own' }
    const phaseDescriptions: Record<number, string> = {
      1: 'Based on your answers you are still in the early stages. Your roadmap starts at Phase 1 to make sure the foundation is solid.',
      2: 'You have traction but need systems and consistency. Your roadmap starts at Phase 2.',
      3: 'You have a real business but it still depends heavily on you. Phase 3 focuses on establishing your reputation and recurring revenue.',
      4: 'You are ready to hire and step back from doing everything yourself. Phase 4 is where your business becomes an operation.',
      5: 'You are running a real business and thinking about what comes next — whether that is scaling, stepping back, or eventually selling.',
    }
    const focusItems = [
      placement <= 2 ? '📣 Getting more clients and consistent revenue' : null,
      placement <= 3 ? '⚙️ Building systems so the business runs without chaos' : null,
      placement >= 3 ? '👥 Hiring, managing, and stepping back from daily operations' : null,
      placement >= 4 ? '📈 Scaling revenue and building something with real equity' : null,
      placement >= 4 ? (blockers.includes('exit_scale') ? '🏷️ Exit strategy, valuation, and what selling actually looks like' : '🏗️ Building a business that operates without you') : null,
    ].filter(Boolean) as string[]

    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>Venture<span style={{ color: '#10B981' }}>Guide</span></span>
          </div>
          <div style={{ background: '#111', border: '2px solid #10B981', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your business</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.3px' }}>{businessName}</p>
            <div style={{ background: '#0a0a0a', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Starting at Phase {placement} — {phaseLabels[placement]}</p>
              <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>{phaseDescriptions[placement]}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(p => (
                <div key={p} style={{ flex: 1, height: 6, borderRadius: 999, background: p <= placement ? '#10B981' : '#222' }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#555', marginTop: 8 }}>Phase {placement} of 5</p>
          </div>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>What your roadmap focuses on</p>
            {focusItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.split(' ')[0]}</span>
                <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{item.slice(3)}</span>
              </div>
            ))}
          </div>
          <a href={`/dashboard?path=${encodeURIComponent(businessName)}&phase=${placement}&mode=scaling`} style={{ display: 'block', width: '100%', padding: '16px', background: '#10B981', color: '#000', fontWeight: 800, fontSize: 15, borderRadius: 16, border: 'none', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', letterSpacing: '-0.2px', boxSizing: 'border-box', marginBottom: 12 }}>
            View my scaling roadmap
          </a>
          <button onClick={retake} style={{ width: '100%', padding: 12, fontSize: 13, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Start over</button>
        </div>
      </main>
    )
  }

  if (results) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 16px' }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>Venture<span style={{ color: '#10B981' }}>Guide</span></span>
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Your results</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>Your top {results.matches.length} matched paths</h2>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>{results.summary}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {results.matches.map((match, i) => (
              <div key={i} style={{ background: '#111', border: `1px solid ${i === 0 ? '#10B981' : '#222'}`, borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, paddingRight: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>#{i + 1}</span>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{match.title}</h3>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, flexShrink: 0, background: i === 0 ? '#10B98122' : i <= 2 ? '#3B82F622' : '#ffffff11', color: i === 0 ? '#10B981' : i <= 2 ? '#60A5FA' : '#888' }}>{match.rankLabel}</span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{match.category}</p>
                <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, marginBottom: 10 }}>{match.why}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {[match.cost, match.timeToFirst, match.difficulty, match.income].map((tag, ti) => (
                    <span key={ti} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: '#1a1a1a', border: '1px solid #333', color: '#888' }}>{tag}</span>
                  ))}
                  {match.aiProof && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: '#8B5CF611', border: '1px solid #8B5CF644', color: '#A78BFA' }}>AI-resistant</span>}
                  {match.isDiscovery && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: '#F59E0B11', border: '1px solid #F59E0B44', color: '#FCD34D' }}>Hidden gem</span>}
                </div>
                <a href={`/dashboard?path=${encodeURIComponent(match.title)}`} style={{ display: 'block', width: '100%', padding: '10px', background: i === 0 ? '#10B981' : '#1a1a1a', color: i === 0 ? '#000' : '#fff', fontWeight: 700, fontSize: 13, borderRadius: 10, border: `1px solid ${i === 0 ? '#10B981' : '#333'}`, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                  Start this path
                </a>
              </div>
            ))}
          </div>
          <button onClick={retake} style={{ fontSize: 13, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Retake quiz</button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>Venture<span style={{ color: '#10B981' }}>Guide</span></span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: mode === 'scaling' ? '#10B98111' : '#3B82F611', border: `1px solid ${mode === 'scaling' ? '#10B98144' : '#3B82F644'}`, padding: '4px 10px', borderRadius: 999, marginBottom: 16 }}>
          <span style={{ fontSize: 12 }}>{mode === 'scaling' ? '🚀' : '🧭'}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: mode === 'scaling' ? '#10B981' : '#60A5FA' }}>{mode === 'scaling' ? 'Scaling existing business' : 'Finding your path'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 999, height: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: mode === 'scaling' ? '#10B981' : '#3B82F6', borderRadius: 999, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>{step + 1} / {questions.length}</span>
        </div>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Question {step + 1}</p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.3, marginBottom: q?.sub ? 8 : 0 }}>{q?.text}</h2>
          {q?.sub && <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{q.sub}</p>}
        </div>
        {(q as any)?.freetext ? (
          <div style={{ marginBottom: 24 }}>
            <input
              type="text"
              value={freetextVal}
              onChange={e => setFreetextVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canNext) next() }}
              placeholder="e.g. Mobile dog grooming, Custom furniture building, Lawn care..."
              style={{ width: '100%', padding: '14px 16px', background: '#111', border: '2px solid #333', borderRadius: 14, fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              autoFocus
            />
            <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>Press Enter or click Next to continue</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {q?.multi && <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Select all that apply</p>}
            {q?.options.map(o => {
              const sel = isSelected(o.val)
              return (
                <button key={o.val} onClick={() => pick(o.val)} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 14, border: `2px solid ${sel ? '#10B981' : '#222'}`, background: sel ? '#10B98111' : '#111', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: sel ? '#10B981' : '#fff' }}>{o.title}</p>
                      {o.desc && <p style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{o.desc}</p>}
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: q?.multi ? 4 : '50%', flexShrink: 0, marginLeft: 12, background: sel ? '#10B981' : 'transparent', border: `2px solid ${sel ? '#10B981' : '#444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sel && <span style={{ fontSize: 10, color: '#000', fontWeight: 900 }}>✓</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={step > 0 ? () => setStep(step - 1) : retake} style={{ fontSize: 13, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Back</button>
          <button onClick={next} disabled={!canNext} style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 700, background: canNext ? '#10B981' : '#1a1a1a', color: canNext ? '#000' : '#444', border: `1px solid ${canNext ? '#10B981' : '#333'}`, cursor: canNext ? 'pointer' : 'not-allowed' }}>
            {step === questions.length - 1 ? (mode === 'scaling' ? 'Build my roadmap' : 'Find my matches') : 'Next'}
          </button>
        </div>
      </div>
    </main>
  )
}
