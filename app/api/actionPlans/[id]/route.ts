import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { plan } = await request.json()
  const plans = await kv.get<any[]>(`actionPlans:${userId}`) || []
  const updatedPlans = plans.map((p: any) => p.id === params.id ? plan : p)
  await kv.set(`actionPlans:${userId}`, updatedPlans)

  return NextResponse.json(plan)
}