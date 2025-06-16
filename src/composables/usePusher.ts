// src/composables/usePusher.ts
import Pusher from 'pusher-js';

export function usePusher(channelName: string, eventName: string, callback: (data: any) => void) {
  const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  });

  const channel = pusher.subscribe(channelName);
  channel.bind(eventName, (data: any) => {
    callback(data);
  });

  return { pusher, channel };
}
