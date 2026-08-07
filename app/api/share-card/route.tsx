import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const PHASE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
const PHASE_LABELS = ['Launch', 'Build', 'Establish', 'Operate', 'Own']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pathName = (searchParams.get('pathName') || 'My business').slice(0, 40)
  const phaseNum = Math.min(Math.max(Number(searchParams.get('phaseNum')) || 1, 1), 5)
  const streak = Number(searchParams.get('streak')) || 0

  const color = PHASE_COLORS[phaseNum - 1]
  const label = PHASE_LABELS[phaseNum - 1]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          padding: 80,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            right: -60,
            top: 480,
            fontSize: 620,
            fontWeight: 900,
            color: color + '14',
            lineHeight: 1,
          }}
        >
          {phaseNum}
        </div>

        <div style={{ display: 'flex', fontSize: 34, fontWeight: 900, color: '#ffffff' }}>
          Venture<span style={{ color }}>Guide</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 4,
              color,
              marginBottom: 20,
            }}
          >
            PHASE {phaseNum} COMPLETE
          </div>
          <div style={{ display: 'flex', fontSize: 88, fontWeight: 900, color: '#ffffff', lineHeight: 1.05, marginBottom: 24 }}>
            {label}
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: '#999999', marginBottom: 50 }}>
            {pathName}
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#111111',
                border: `2px solid ${color}55`,
                borderRadius: 24,
                padding: '28px 36px',
              }}
            >
              <div style={{ display: 'flex', fontSize: 48, fontWeight: 900, color }}>{phaseNum}/5</div>
              <div style={{ display: 'flex', fontSize: 20, color: '#666666', marginTop: 6 }}>phases done</div>
            </div>
            {streak > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#111111',
                  border: '2px solid #F59E0B55',
                  borderRadius: 24,
                  padding: '28px 36px',
                }}
              >
                <div style={{ display: 'flex', fontSize: 48, fontWeight: 900, color: '#F59E0B' }}>{streak}</div>
                <div style={{ display: 'flex', fontSize: 20, color: '#666666', marginTop: 6 }}>day streak</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 20, color: '#444444' }}>
          Built with VentureGuide — the app that builds your business with you
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  )
}
