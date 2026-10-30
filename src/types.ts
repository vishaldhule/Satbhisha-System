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

export interface WeatherHologramData {
  city: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
  temp_c: number;
  temp_f: number;
  condition: string;
  icon?: string;
  humidity: number;
  wind_kph: number;
  wind_dir?: string;
  pressure_mb: number;
  uv: number;
  feelslike_c: number;
  localtime?: string;
}

export interface ChronoHologramData {
  localTime: string;
  istTime: string;
  utcTime: string;
  date: string;
  dayOfWeek: string;
  timezone: string;
  uptimeHours: number;
  cycleCounter: number;
}

export interface HologramPayload {
  type: 'weather' | 'chrono' | 'brain' | 'earth' | 'serious' | 'reactor';
  title?: string;
  data?: WeatherHologramData | ChronoHologramData | any;
  videoUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'jarvis' | 'tool' | 'system';
  text: string;
  timestamp: string;
  toolExecution?: ToolExecution;
  toolExecutions?: any[];
  generatedTool?: GeneratedTool;
  imagePreview?: string;
  image?: string;
  hologram?: HologramPayload;
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
