import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {id: idToadd} = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if(!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAlreadyFriends = await fetchRedis(
      'sismember', 
      `user:${session.user.id}:friends`,
      idToadd
    );

    if(isAlreadyFriends) {
      return new NextResponse('Already friends', { status: 400 });
    }

    const hasFriendRequest = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToadd
    );

    if (!hasFriendRequest) {
      return new NextResponse('No friend request', { status: 400 })
    }

    await db.sadd(`user:${session.user.id}:friends`, idToadd);
    await db.sadd(`user:${idToadd}:friends`, session.user.id);

    // await db.srem(`user:${idToadd}:incoming_friend_requests`, session.user.id);
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToadd);

    
    return new NextResponse("to bien UwU");

  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request payload', { status: 422 })
    }

    return new NextResponse('Invalid request', { status: 400 });
  }
}