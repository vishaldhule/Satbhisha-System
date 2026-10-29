export interface ToolExecution {
  name: string;
  args: Record<string, any>;
  result: any;
}

export interface GeneratedTool {
  id: string;
  name: string;
  description: string;
  category: 'utility' | 'game' | 'dashboard' | 'finance';
  code: string;
  type: 'html' | 'react' | 'canvas' | 'python';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'jarvis' | 'tool' | 'system';
  text: string;
  timestamp: string;
  toolExecution?: ToolExecution;
  generatedTool?: GeneratedTool;
  imagePreview?: string;
}

export interface SystemHardware {
  cpu: number;
  ram: number;
  ramTotalGb: number;
  ramUsedGb: number;
  gpu: number;
  gpuTemp: number;
  cpuTemp: number;
  volume: number;
  brightness: number;
  battery: number;
  batteryCharging: boolean;
  coolingFanRpm: number;
  networkSpeedMbps: number;
  activeProcesses: number;
  ghostTasksKilled: number;
}

export interface MediaState {
  isPlaying: boolean;
  title: string;
  artist: string;
  duration: string;
  position: string;
  volume: number;
  videoMode: string;
  isAdPlaying: boolean;
  adSkippedCount: number;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  date: string;
}
