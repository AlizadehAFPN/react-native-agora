export interface SetupScreenProps {
  userId: string;
  fcmToken: string | null;
  onReady: (username: string) => void;
}
