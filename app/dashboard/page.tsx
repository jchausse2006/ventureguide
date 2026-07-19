'use client'

import { useState, useEffect } from 'react'

const TABS = [
  { id: 'roadmap', label: 'Roadmap', icon: '📍' },
  { id: 'partner', label: 'Partner', icon: '💬' },
  { id: 'community', label: 'Community', icon: '👥' },
  { id: 'money', label: 'Money', icon: '💰' },
  { id: 'progress', label: 'Progress', icon: '🏆' },
  { id: 'mypath', label: 'My Path', icon: '🔄' },
]

interface Module {
  id: number
  title: string
  type: string
}

interface Phase {
  phase: number
  label: string
  description: string
  modules: Module[]
  color: string
  textColor: string
}

const FALLBACK_PHASES: Phase[] = [
  { phase: 1, label: 'Launch', color: '#10B981', textColor: '#10B981', description: 'Get your first paying client and make your first dollar.', modules: [{ id: 1, title: 'Business mindset & reality check', type: 'foundation' }, { id: 2, title: 'Pricing your work correctly', type: 'foundation' }, { id: 3, title: 'Landing your first client', type: 'foundation' }, { id: 4, title: 'Sales without feeling slimy', type: 'foundation' }, { id: 5, title: 'Simple contracts & protecting yourself', type: 'foundation' }, { id: 6, title: 'Managing your money from day one', type: 'foundation' }, { id: 7, title: 'Your first 30 days on the ground', type: 'action' }, { id: 8, title: 'Landing your first client in this industry', type: 'action' }] },
  { phase: 2, label: 'Build', color: '#3B82F6', textColor: '#60A5FA', description: 'Get consistent, hit $2,000/month, build your systems.', modules: [{ id: 9, title: 'Building repeatable systems', type: 'action' }, { id: 10, title: 'Income milestones & raising prices', type: 'action' }, { id: 11, title: 'Getting referrals on autopilot', type: 'action' }, { id: 12, title: 'Managing multiple clients at once', type: 'action' }] },
  { phase: 3, label: 'Establish', color: '#8B5CF6', textColor: '#A78BFA', description: 'Fully booked, strong reputation, waiting list.', modules: [{ id: 13, title: 'Building your reputation & reviews', type: 'action' }, { id: 14, title: 'Raising your rates without losing clients', type: 'action' }, { id: 15, title: 'Your first recurring revenue systems', type: 'action' }, { id: 16, title: 'Transitioning from hustle to business', type: 'milestone' }] },
  { phase: 4, label: 'Operate', color: '#F59E0B', textColor: '#FCD34D', description: 'Hire your first person. Stop doing everything yourself.', modules: [{ id: 17, title: 'Hiring your first employee or contractor', type: 'action' }, { id: 18, title: 'Training someone to do what you do', type: 'action' }, { id: 19, title: 'Managing people without micromanaging', type: 'action' }, { id: 20, title: 'Pricing for a team vs pricing solo', type: 'action' }] },
  { phase: 5, label: 'Own', color: '#EF4444', textColor: '#F87171', description: 'You run a business. Not a job. Something you could sell.', modules: [{ id: 21, title: 'Building a business that runs without you', type: 'milestone' }, { id: 22, title: 'Understanding what your business is worth', type: 'action' }, { id: 23, title: 'Access to capital — loans, investors, SBA', type: 'action' }, { id: 24, title: 'Exit strategies — what selling actually looks like', type: 'milestone' }] },
]

const PHASE_COLORS = [
  { color: '#10B981', textColor: '#10B981' },
  { color: '#3B82F6', textColor: '#60A5FA' },
  { color: '#8B5CF6', textColor: '#A78BFA' },
  { color: '#F59E0B', textColor: '#FCD34D' },
  { color: '#EF4444', textColor: '#F87171' },
]

const COMMUNITY_POSTS = [
  { name: 'Marcus T.', time: '2h ago', path: 'Residential cleaning', text: 'Just hit $3,200 this month. 8 months ago I had nothing. Keep going.', likes: 47, emoji: '🔥' },
  { name: 'Priya S.', time: '5h ago', path: 'Pressure washing', text: 'Got my first commercial contract today. $1,800/month recurring. Phase 2 here I come.', likes: 31, emoji: '🎉' },
  { name: 'Jake R.', time: '1d ago', path: 'Lawn care', text: 'Referrals just start happening after month 3. Three this week alone.', likes: 28, emoji: '💡' },
  { name: 'Aisha M.', time: '1d ago', path: 'Bookkeeping', text: 'Finished the pricing module and raised my rates immediately. Lost one client, gained two better ones.', likes: 52, emoji: '💰' },
]

const BADGES = [
  { icon: '💵', label: 'First Dollar' },
  { icon: '💯', label: 'First $100' },
  { icon: '🔥', label: '7-Day Streak' },
  { icon: '📚', label: 'Phase 1 Done' },
  { icon: '🚀', label: 'First $1,000' },
  { icon: '👑', label: 'Business Owner' },
]

const MILESTONES = [
  { label: 'First dollar earned', icon: '💵' },
  { label: 'First $100', icon: '💯' },
  { label: 'First $500 month', icon: '📈' },
  { label: 'First $1,000 month', icon: '🚀' },
  { label: 'First $2,000 month', icon: '🔥' },
  { label: 'First $5,000 month', icon: '👑' },
]

function capitalize(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('roadmap')
  const [showPaywall, setShowPaywall] = useState(false)
  const [pathName, setPathName] = useState('Your chosen path')
  const [phases, setPhases] = useState<Phase[]>(FALLBACK_PHASES)
  const [loadingRoadmap, setLoadingRoadmap] = useState(true)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [startPhase, setStartPhase] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get('path')
    const phaseParam = parseInt(params.get('phase') || '1')
    const mode = params.get('mode') || 'discovery'
    const name = p ? capitalize(decodeURIComponent(p)) : 'Your chosen path'
    setPathName(name)
    setStartPhase(phaseParam)

    fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathName: name, startPhase: phaseParam, mode }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.phases) {
          const merged = data.phases.map((phase: { phase: number; label: string; description: string; modules: Module[] }, i: number) => ({
            ...phase,
            color: PHASE_COLORS[i]?.color || '#10B981',
            textColor: PHASE_COLORS[i]?.textColor || '#10B981',
          }))
          setPhases(merged)
        }
        setLoadingRoadmap(false)
      })
      .catch(() => setLoadingRoadmap(false))
  }, [])

  function toggleModule(phaseIdx: number, moduleIdx: number) {
    const key = `${phaseIdx}-${moduleIdx}`
    setCompletedModules(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (showPaywall) return <Paywall pathName={pathName} onBack={() => setShowPaywall(false)} />
  if (loadingRoadmap) return <RoadmapLoader pathName={pathName} />

  const destinationTitle = startPhase >= 4 ? 'Industry Leader' : startPhase >= 3 ? 'Business Owner' : 'Business Owner'
  const destinationDesc = startPhase >= 4
    ? 'A scaled operation with real equity, multiple revenue streams, and a legacy worth building.'
    : startPhase >= 3
    ? 'A business you own, operate, and could one day sell.'
    : 'A business you own, operate, and could one day sell.'
  const destinationIcon = startPhase >= 4 ? '🏆' : '👑'

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

      <div style={{ background: '#111111', borderBottom: '1px solid #222', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>Venture<span style={{ color: '#10B981' }}>Guide</span></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a1500', border: '1px solid #333300', padding: '6px 12px', borderRadius: 999 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EAB308' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#CA8A04' }}>Preview mode</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#111111', borderBottom: '1px solid #222', padding: '20px 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Your path</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>{pathName}</h1>
          {startPhase > 1 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#10B98111', border: '1px solid #10B98144', padding: '4px 10px', borderRadius: 999, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>Existing business — starting at Phase {startPhase}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, background: '#222', borderRadius: 999, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((completedModules.size / 24) * 100)}%`, background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: 999, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#666', whiteSpace: 'nowrap' }}>{Math.round((completedModules.size / 24) * 100)}% — Phase {startPhase} of 5</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ label: 'Day streak', val: '0 🔥' }, { label: 'Earned', val: '$0' }, { label: 'Modules', val: `${completedModules.size}/24` }].map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.val}</p>
                <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#111111', borderBottom: '1px solid #222', position: 'sticky', top: 53, zIndex: 10, overflowX: 'auto' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '12px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #10B981' : '2px solid transparent', color: activeTab === tab.id ? '#10B981' : '#666' }}>
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 120px' }}>

        {activeTab === 'roadmap' && (
          <div>
            <PreviewBanner text="Unlock Pro to begin your journey and check off each step as you complete it. Click any module to mark it done or skip it." />
            <div style={{ position: 'relative' }}>
              {phases.map((phase, pi) => {
                const isCompleted = pi < startPhase - 1
                const isCurrent = pi === startPhase - 1
                const isLocked = pi > startPhase - 1

                return (
                  <div key={pi} style={{ marginBottom: 8 }}>

                    {/* Completed phases — collapsed and checked off */}
                    {isCompleted && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 12, marginBottom: 8, opacity: 0.7 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#10B98122', border: '1px solid #10B98144', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 12, color: '#10B981', fontWeight: 900 }}>✓</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>Phase {phase.phase} — {phase.label}</p>
                          <p style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{phase.description}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', background: '#10B98111', padding: '2px 8px', borderRadius: 999 }}>Done</span>
                      </div>
                    )}

                    {/* Current phase — bold, expanded, fully visible */}
                    {isCurrent && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: '#111', border: `2px solid ${phase.color}`, borderRadius: 16, marginBottom: 10, boxShadow: `0 0 20px ${phase.color}22` }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: phase.color + '22', border: `2px solid ${phase.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: phase.color, flexShrink: 0 }}>
                            {phase.phase}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: phase.color }}>Phase {phase.phase}</p>
                              <span style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{phase.label}</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.5 }}>{phase.description}</p>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, background: phase.color, color: '#000', padding: '5px 12px', borderRadius: 999, flexShrink: 0 }}>Your stage</span>
                        </div>
                        <div style={{ paddingLeft: 16, paddingRight: 16, marginBottom: 8 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {phase.modules.map((mod, mi) => {
                              const key = `${pi}-${mi}`
                              const done = completedModules.has(key)
                              const isMilestone = mod.type === 'milestone'
                              return (
                                <div
                                  key={mi}
                                  onClick={() => toggleModule(pi, mi)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                                    background: done ? '#10B98111' : '#161616',
                                    border: done ? '1px solid #10B98144' : isMilestone ? `2px solid ${phase.color}44` : '1px solid #2a2a2a',
                                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                                  }}
                                >
                                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: done ? '#10B981' : isMilestone ? phase.color + '22' : '#222', border: done ? '2px solid #10B981' : `2px solid ${isMilestone ? phase.color : '#444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: done ? '#000' : isMilestone ? phase.color : '#666' }}>
                                    {done ? '✓' : isMilestone ? '★' : mod.id}
                                  </div>
                                  <span style={{ fontSize: 13, lineHeight: 1.4, flex: 1, fontWeight: isMilestone ? 700 : 400, color: done ? '#10B981' : isMilestone ? '#fff' : '#ccc', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1 }}>
                                    {mod.title}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    {isMilestone && !done && (
                                      <span style={{ fontSize: 10, fontWeight: 700, color: phase.color, background: phase.color + '22', padding: '2px 6px', borderRadius: 999 }}>Milestone</span>
                                    )}
                                    <span style={{ fontSize: 10, fontWeight: 700, color: done ? '#10B981' : '#555', padding: '2px 8px', borderRadius: 999, background: done ? '#10B98122' : '#1a1a1a', border: `1px solid ${done ? '#10B98144' : '#333'}` }}>
                                      {done ? 'Done' : 'Skip'}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Locked phases — dimmed, compact */}
                    {isLocked && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, marginBottom: 8, opacity: 0.45 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 13, color: '#444', fontWeight: 900 }}>🔒</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#444' }}>Phase {phase.phase} — {phase.label}</p>
                          <p style={{ fontSize: 11, color: '#333', marginTop: 1 }}>{phase.description}</p>
                        </div>
                        <span style={{ fontSize: 11, color: '#333' }}>{phase.modules.length} modules</span>
                      </div>
                    )}

                    {pi < phases.length - 1 && (
                      <div style={{ textAlign: 'center', padding: '2px 0', color: '#222', fontSize: 18 }}>↓</div>
                    )}
                  </div>
                )
              })}

              {/* Final destination */}
              <div style={{ marginTop: 12, padding: '20px', background: startPhase >= 4 ? '#1a0f00' : '#0f0f0f', border: startPhase >= 4 ? '2px solid #F59E0B44' : '2px dashed #333', borderRadius: 16, textAlign: 'center', opacity: startPhase >= 4 ? 0.9 : 0.5 }}>
                <p style={{ fontSize: 36, marginBottom: 8 }}>{destinationIcon}</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: startPhase >= 4 ? '#FCD34D' : '#fff', letterSpacing: '-0.3px' }}>{destinationTitle}</p>
                <p style={{ fontSize: 12, color: startPhase >= 4 ? '#CA8A04' : '#666', marginTop: 6, lineHeight: 1.6 }}>{destinationDesc}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partner' && (
          <div>
            <PreviewBanner text="Unlock Pro to get an AI business partner that knows your path, progress, and goals — not a generic chatbot." />
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ background: '#000', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #222' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#000' }}>V</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>VentureGuide Partner</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                    <p style={{ fontSize: 11, color: '#666' }}>Knows your path & progress</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, filter: 'blur(3px)', userSelect: 'none' }}>
                <ChatBubble from="partner" text="Hey — you have been on this path for 3 weeks and have not logged any income yet. What is actually getting in the way?" />
                <ChatBubble from="user" text="I keep second guessing my pricing. I do not want to charge too much and scare people off." />
                <ChatBubble from="partner" text="That is almost always the wrong instinct. When you underprice, you attract clients who cannot afford better. Price for who you want, not who you are afraid of losing." />
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #222', display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#555' }}>Ask your business partner anything...</div>
                <button disabled style={{ width: 38, height: 38, background: '#10B98122', borderRadius: 12, border: 'none', color: '#10B981', fontWeight: 900, fontSize: 18, cursor: 'not-allowed' }}>↑</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div>
            <PreviewBanner text="Unlock Pro to join people on the same path — sharing wins, asking questions, keeping each other accountable." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, filter: 'blur(2px)', userSelect: 'none' }}>
              {COMMUNITY_POSTS.map((post, i) => (
                <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#000', flexShrink: 0 }}>{post.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{post.name}</p>
                      <p style={{ fontSize: 11, color: '#555' }}>{post.path} · {post.time}</p>
                    </div>
                    <span style={{ fontSize: 20 }}>{post.emoji}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6 }}>{post.text}</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid #1a1a1a' }}>
                    <span style={{ fontSize: 12, color: '#555' }}>❤️ {post.likes}</span>
                    <span style={{ fontSize: 12, color: '#555' }}>💬 Reply</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'money' && (
          <div>
            <PreviewBanner text="Unlock Pro to log every dollar you earn and watch your business grow in real time." />
            <div style={{ filter: 'blur(2px)', userSelect: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[{ label: 'Total earned', val: '$0', icon: '💰' }, { label: 'This month', val: '$0', icon: '📅' }, { label: 'Best month', val: '$0', icon: '🏆' }].map((s, i) => (
                  <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 6 }}>{s.val}</p>
                    <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Income milestones</p>
                {MILESTONES.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < MILESTONES.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span style={{ fontSize: 20, filter: 'grayscale(1)', opacity: 0.3 }}>{m.icon}</span>
                    <span style={{ fontSize: 13, color: '#555', flex: 1 }}>{m.label}</span>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #333' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <PreviewBanner text="Unlock Pro to track your streak, earn badges, and see your business grow week by week." />
            <div style={{ filter: 'blur(2px)', userSelect: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[{ label: 'Day streak', val: '0 🔥' }, { label: 'Modules done', val: '0/24' }, { label: 'Phase', val: `${startPhase} of 5` }].map((s, i) => (
                  <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.val}</p>
                    <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Badges</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {BADGES.map((b, i) => (
                    <div key={i} style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                      <span style={{ fontSize: 28, filter: 'grayscale(1)', opacity: 0.25 }}>{b.icon}</span>
                      <p style={{ fontSize: 11, color: '#444', marginTop: 6, lineHeight: 1.3 }}>{b.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mypath' && (
          <div>
            <PreviewBanner text="Unlock Pro to switch paths anytime, view your match history, and resume previous paths without losing progress." />
            <div style={{ filter: 'blur(2px)', userSelect: 'none' }}>
              <div style={{ background: '#111', border: '2px solid #10B98144', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Currently on</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{pathName}</p>
                    <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>Started today · Phase {startPhase} · 0% complete</p>
                  </div>
                  <span style={{ fontSize: 28 }}>📍</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button disabled style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, background: '#1a1a1a', border: '1px solid #333', color: '#666', cursor: 'not-allowed' }}>Switch path</button>
                  <button disabled style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, background: '#1a1a1a', border: '1px solid #333', color: '#666', cursor: 'not-allowed' }}>Retake quiz</button>
                </div>
              </div>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Your other quiz matches</p>
                {['Pressure washing', 'Mobile car detailing', 'Lawn care & landscaping', 'Handyman & home repair', 'Bookkeeping for small businesses'].map((path, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 4 ? '1px solid #1a1a1a' : 'none' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{path}</p>
                      <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>#{i + 2} match</p>
                    </div>
                    <button disabled style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 8, background: '#1a1a1a', border: '1px solid #333', color: '#555', cursor: 'not-allowed' }}>Start instead</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000', borderTop: '1px solid #222', padding: '14px 16px', zIndex: 30 }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <button onClick={() => setShowPaywall(true)} style={{ width: '100%', padding: '16px', background: '#10B981', color: '#000', fontWeight: 800, fontSize: 15, borderRadius: 16, border: 'none', cursor: 'pointer', letterSpacing: '-0.2px' }}>
            Begin Phase {startPhase} — Unlock VentureGuide Pro
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#555', marginTop: 8 }}>First month free · $9/month after · Cancel anytime</p>
        </div>
      </div>
    </main>
  )
}

function PreviewBanner({ text }: { text: string }) {
  return (
    <div style={{ background: '#1a1500', border: '1px solid #333300', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
      <p style={{ fontSize: 13, color: '#CA8A04', lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}

function ChatBubble({ from, text }: { from: string; text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: from === 'user' ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: from === 'user' ? '#10B981' : '#1a1a1a', color: from === 'user' ? '#000' : '#ccc', fontSize: 13, lineHeight: 1.6, fontWeight: from === 'user' ? 600 : 400 }}>
        {text}
      </div>
    </div>
  )
}

function RoadmapLoader({ pathName }: { pathName: string }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: '🔍', text: 'Analyzing your path', sub: `Reading everything we know about ${pathName}` },
    { icon: '🧠', text: 'Identifying what you actually need to learn', sub: 'Filtering out the noise and generic advice' },
    { icon: '📋', text: 'Sequencing your phases', sub: 'Ordering steps so each one builds on the last' },
    { icon: '⚙️', text: 'Building Phase 1 — Launch', sub: 'The exact steps to get your first dollar' },
    { icon: '📈', text: 'Building Phase 2 through 5', sub: 'From first client to scalable business owner' },
    { icon: '✅', text: 'Finalizing your roadmap', sub: 'Almost ready' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a0a', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>Venture<span style={{ color: '#10B981' }}>Guide</span></span>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{steps[currentStep].icon}</div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.3px' }}>{steps[currentStep].text}</p>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{steps[currentStep].sub}</p>
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#555' }}>Building your roadmap</span>
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div style={{ height: 4, background: '#1a1a1a', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentStep + 1) / steps.length) * 100}%`, background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: 999, transition: 'width 0.8s ease' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i <= currentStep ? 1 : 0.25, transition: 'opacity 0.4s' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: i < currentStep ? '#10B981' : i === currentStep ? '#10B98133' : '#1a1a1a', border: `2px solid ${i < currentStep ? '#10B981' : i === currentStep ? '#10B981' : '#333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s' }}>
                {i < currentStep ? <span style={{ fontSize: 11, color: '#000', fontWeight: 900 }}>✓</span> : i === currentStep ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> : null}
              </div>
              <span style={{ fontSize: 13, color: i <= currentStep ? '#ccc' : '#444', fontWeight: i === currentStep ? 600 : 400 }}>{s.text}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#444', marginTop: 32, lineHeight: 1.6 }}>
          This roadmap is built specifically for {pathName}.<br />No generic advice. Real steps for your exact path.
        </p>
      </div>
    </div>
  )
}

function Paywall({ pathName, onBack }: { pathName: string; onBack: () => void }) {
  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ background: '#111', borderBottom: '1px solid #222', padding: '12px 16px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>Venture<span style={{ color: '#10B981' }}>Guide</span></span>
          <button onClick={onBack} style={{ fontSize: 13, color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>Back</button>
        </div>
      </div>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, background: '#10B98122', border: '2px solid #10B981', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>🚀</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>Start your journey</h1>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>No hype. No fluff. Just the honest path from zero to a real scalable business.</p>
        </div>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 20, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ background: '#000', padding: '20px 20px' }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>VentureGuide Pro</p>
            <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{pathName}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>$9</span>
              <span style={{ fontSize: 14, color: '#666' }}>/month</span>
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, background: '#10B981', color: '#000', padding: '4px 10px', borderRadius: 999 }}>First month free</span>
            </div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['5-phase roadmap built for your exact path', 'AI business partner with full context on your progress', 'Community of people on the same path', 'Income milestone tracker — first dollar to $5k/month', 'Progress tracking, streaks and badges', 'Switch paths anytime — old progress always saved', 'Foundation business skills curriculum', 'Cancel anytime — no questions asked'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#10B98122', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 10, color: '#10B981' }}>✓</span>
                </div>
                <span style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: '14px 16px', marginBottom: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>VentureGuide is the opposite of a $997 course. We will never promise overnight results. We give you the truth and walk you through every step.</p>
        </div>
        <button style={{ width: '100%', padding: '16px', background: '#10B981', color: '#000', fontWeight: 800, fontSize: 15, borderRadius: 16, border: 'none', cursor: 'pointer', marginBottom: 10, letterSpacing: '-0.2px' }}>
          Start my free month
        </button>
        <button onClick={onBack} style={{ width: '100%', padding: 12, fontSize: 13, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Maybe later</button>
      </div>
    </main>
  )
}
