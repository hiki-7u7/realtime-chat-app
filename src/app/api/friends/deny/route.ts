import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id: idToDeny } = z.object({ id: z.string() }).parse(body)

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny)

    return new NextResponse('OK')
  } catch (error) {
    console.log(error)

    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request payload', { status: 422 })
    }

    return new NextResponse('Invalid request', { status: 400 })
  }
}