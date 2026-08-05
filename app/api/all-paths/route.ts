import { NextResponse } from 'next/server'
import { OPPS } from '../match/route'

export async function GET() {
  const paths = (OPPS as any[]).map(o => ({
    title: o.title,
    category: o.category,
    income: o.income,
    cost: o.cost,
    difficulty: o.difficulty,
  }))
  return NextResponse.json({ paths })
}