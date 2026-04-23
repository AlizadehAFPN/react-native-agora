import type React from 'react';

export type CallPresentation = 'fullscreen' | 'minimized';

export interface CallScreenProps {
  channelId: string;
  peerDisplayName: string;
  presentation: CallPresentation;
  onPresentationChange: (mode: CallPresentation) => void;
  onEnd: (opts?: {skipRejoinBanner?: boolean}) => void;
  /** Rendered behind the floating call tile when `presentation` is `minimized`. */
  children?: React.ReactNode;
}
