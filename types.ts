
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  content: string;
  date: string;
  summary?: string;
  score?: number;
}

export interface RoundupData {
  title: string;
  date: string;
  headlineArticle: NewsArticle;
  secondaryArticles: NewsArticle[];
  summaryText: string;
  coverImageUrl?: string;
}

export enum PipelineStep {
  IDLE = 'IDLE',
  CRAWLING = 'CRAWLING',
  SUMMARIZING = 'SUMMARIZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETED = 'COMPLETED'
}
