import { LAMBDA_URL as CONFIGURED_LAMBDA_URL } from '../config';

export interface IncomingCallData {
  channelName: string;
  callerDisplayName: string;
  callerUserId: string;
}

/** Active or recent call — same channel string Agora uses as room name. */
export type CallRole = 'caller' | 'callee';

export interface CallSessionMeta {
  channelName: string;
  peerDisplayName: string;
  role: CallRole;
}

export interface CallPayload {
  callerUserId: string;
  calleeUserId: string;
  channelName: string;
  callerDisplayName: string;
}

export async function initiateCall(payload: CallPayload): Promise<void> {
  const url = CONFIGURED_LAMBDA_URL;
  if (!url) {
    throw new Error('LAMBDA_URL is not configured in src/config.ts');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Call failed (${res.status})${text ? `: ${text}` : ''}`);
  }
}
