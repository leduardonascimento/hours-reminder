export interface Config {
  google: GoogleConfig;
  cron: CronConfig;
  jira: JiraConfig;
  giphy: GiphyConfig;
}

export interface GoogleConfig {
  webhookUrl: string;
  threadId: string;
}

export interface CronConfig {
  cronJobTime: string;
}

export interface JiraConfig {
  timeTrackingUrl: string;
}

export interface GiphyConfig {
  apiKey: string;
  limit: number;
  offset: number;
  rating: string;
  lang: string;
  query: string;
}
