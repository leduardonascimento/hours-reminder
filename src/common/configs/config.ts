import type { Config } from './config.interface';

const config: Config = {
  google: {
    webhookUrl: '', // Webhook URL from Google Chat
    threadId: '', // Thread number following pattern: spaces/<space-id>/threads/<thread-id>
  },
  cron: {
    cronJobTime: '0 8-18 * * 1-5', // Runs every day at 8:00 am and 6:00 pm from Monday to Friday
  },
  jira: {
    timeTrackingUrl: '', // Redirect URL on button click
  },
  giphy: {
    apiKey: '', // API key created in giphy
    limit: 25,
    offset: 0,
    rating: 'g',
    lang: 'en',
    query: 'time', // Query for search a gif
  },
};

export default (): Config => config;
