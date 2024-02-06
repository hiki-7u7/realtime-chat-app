import { FC } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';


import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import FriendRequests from '@/components/FriendRequests';


const page: FC = async () => {

  const session = await getServerSession(authOptions);

  if(!session) {
    return notFound();
  }

  const incomingSenderIds = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[]

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map( async (senderId) => {
      const sender = await fetchRedis('get', `user:${senderId}`) as string;
      const senderParsed = JSON.parse(sender) as User
      //? viene en string xd
      //* minuto del bug 3:20:00
      //* pero igual ya funciona bien
      return {
        senderId,
        senderEmail: senderParsed.email,
      }
    })
  );

  return (
    <main className='pt-8'>
      <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
      <div className='flex flex-col gap-4'>
        <FriendRequests 
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
}
 
export default page;