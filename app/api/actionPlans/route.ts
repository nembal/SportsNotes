import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function GET(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const plans = await kv.get<any[]>(`actionPlans:${userId}`) || []
  return NextResponse.json(plans)
}

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { plan } = await request.json()
  const plans = await kv.get<any[]>(`actionPlans:${userId}`) || []
  const updatedPlans = [...plans, plan]
  await kv.set(`actionPlans:${userId}`, updatedPlans)

  return NextResponse.json(plan, { status: 201 })
}