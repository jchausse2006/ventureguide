import { NextResponse } from 'next/server'
import { OPPS } from '../match/route'

export async function GET() {
  const paths = (OPPS as any[]).map(o => ({
    title: o.name,
    category: o.cat,
    income: o.income,
    cost: o.cost,
    difficulty: o.diff,
    timeToFirst: o.timeToFirst,
  }))
  return NextResponse.json({ paths })
}