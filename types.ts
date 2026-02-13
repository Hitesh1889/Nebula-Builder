export interface GenerationConfig {
  model: string;
  temperature: number;
}

export interface GeneratedContent {
  html: string;
  css: string;
  javascript: string;
}

export interface WebsiteHistoryItem {
  id: string;
  prompt: string;
  content: GeneratedContent;
  timestamp: number;
  model: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type ViewMode = 'PREVIEW' | 'CODE';