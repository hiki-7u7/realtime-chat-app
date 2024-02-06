import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { addFriendValidator } from '@/lib/validations/add-friend';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';

export async function POST(req: Request){
  try {
    
    const body = await req.json();

    const { email: emailToAdd } = addFriendValidator.parse(body.email);
    
    const session = await getServerSession(authOptions);

    if(!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    };

    const idToAdd = (await fetchRedis(
      'get',
      `user:email:${emailToAdd}`
    )) as string;

    if(!idToAdd) {
      return new NextResponse("This person does not exist.", { status: 401 });
    };

    if(idToAdd === session.user.id) {
      return new NextResponse("You cannot add yourself as a friend", { status: 400 });
    };

    const isAlreadyAdded = (await fetchRedis('sismember', `user:${idToAdd}:incomming_friend_requests`, session.user.id)) as 0 | 1;

    if(isAlreadyAdded) {
      return new NextResponse("Already added this user", { status: 400 });
    };

    const isAlreadyFriends = (await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)) as 0 | 1;

    if(isAlreadyFriends) {
      return new NextResponse("Already friends with this user", { status: 400 });
    };

    pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`), 'incoming_friend_requests',
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      },
    )

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    console.log("ADD_FRIENDS", error);
    if(error instanceof z.ZodError){
      return new NextResponse("Invalid request payload", { status: 422 })
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}
