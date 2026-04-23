import type {IncomingCallData, CallSessionMeta} from '../../services/lambda';
import type {UserRecord} from '../../services/user';

export type {UserRecord};
export type {IncomingCallData, CallSessionMeta};

export interface RTMCallSignal {
  type: 'CALL_STARTED';
  channelId: string;
  callerName: string;
}

export interface HomeScreenProps {
  userId: string;
  username: string;
  peerOnlineById: Record<string, boolean>;
  incomingFCMCall: IncomingCallData | null;
  postCallBanner: CallSessionMeta | null;
  onCall: (meta: CallSessionMeta) => void;
  onRejoinFromBanner: () => void;
  onDismissPostCall: () => void;
  onDeclineFCMCall: () => void;
  onUsernameChanged: (name: string) => void;
  onProfileCleared: () => void;
}
