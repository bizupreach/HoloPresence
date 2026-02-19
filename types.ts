
export interface AvatarConfig {
  videoUrl: string;
  scale: number;
  rotation: number;
}

export interface AppState {
  isARSupported: boolean;
  isARActive: boolean;
  isPlaced: boolean;
  error?: string;
}
