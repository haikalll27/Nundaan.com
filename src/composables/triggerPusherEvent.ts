// src/composables/triggerPusherEvent.ts
import CryptoJS from 'crypto-js';

export async function triggerPusherEvent(channel: string, event: string, payload: object) {
  const appId = import.meta.env.VITE_PUSHER_APP_ID;
  const key = import.meta.env.VITE_PUSHER_KEY;
  const secret = import.meta.env.VITE_PUSHER_SECRET;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER;

  const body = JSON.stringify({
    name: event,
    channel: channel,
    data: JSON.stringify(payload),
  });

  const path = `/apps/${appId}/events`;
  const method = 'POST';
  const host = `api-${cluster}.pusher.com`;
  const timestamp = Math.floor(Date.now() / 1000);
  const bodyMd5 = CryptoJS.MD5(body).toString();

  const query = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`;
  const stringToSign = `${method}\n${path}\n${query}`;
  const signature = CryptoJS.HmacSHA256(stringToSign, secret).toString();

  const url = `https://${host}${path}?${query}&auth_signature=${signature}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  return await res.json();
}
