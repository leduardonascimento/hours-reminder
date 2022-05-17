import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronCommand, CronJob } from 'cron';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    private http: HttpService,
  ) {
    if (this.gifs.length <= 0 && !this.configService.get('giphy.apiKey')) {
      throw new Error(
        'You need to fill the gif array or set up an api key for giphy',
      );
    }
  }

  private randomNumber(length: number): number {
    return Math.floor(Math.random() * length);
  }

  get gifs(): Array<string> {
    return [
      // URL FROM GIFS
    ];
  }

  set gifs(value: Array<string>) {
    this.gifs = value;
  }

  onModuleInit() {
    this.logger.log(
      `Cron job running: ${this.configService.get('cron.cronJobTime')}`,
    );

    this.initializeJob(
      this.configService.get('cron.cronJobTime'),
      'GOOGLE_CRON_JOB',
      () => this.handleCron(this.logger),
    );
  }

  private initializeJob(
    cronTime: string,
    jobName: string,
    cronCommand: CronCommand,
  ) {
    const job = new CronJob(cronTime, cronCommand);

    this.schedulerRegistry.addCronJob(jobName, job);

    job.start();

    return job;
  }

  private async getRandomGif() {
    this.logger.log('Getting random gif');

    const {
      apiKey: api_key,
      limit,
      offset,
      rating,
      lang,
      query: q,
    } = this.configService.get('giphy');

    if (!api_key) {
      return;
    }

    const request = this.http.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key,
        limit,
        offset,
        rating,
        lang,
        q,
      },
    });

    const {
      data: { data: gifs },
    } = await firstValueFrom(request);

    this.gifs = gifs.map(
      (gif: Record<string, any>) => gif.images.original.url as string,
    );
  }

  async handleCron(logger: Logger) {
    try {
      logger.log('Preparing to send the webhook');

      await this.getRandomGif();

      const imageUrl = this.gifs[this.randomNumber(this.gifs.length)];

      const googleRequest = this.http.post(
        this.configService.get('google.webhookUrl'),
        {
          text: '',
          cards: [
            {
              header: {
                title: 'Bora galerinha logar essas horas 👀 🏃?',
                subtitle: 'Corre corre que ainda dá tempo!',
              },
              sections: [
                {
                  widgets: [
                    {
                      image: {
                        imageUrl,
                      },
                    },
                    {
                      buttons: [
                        {
                          textButton: {
                            text: 'LOG DE HORAS',
                            onClick: {
                              openLink: {
                                url: this.configService.get(
                                  'jira.timeTrackingUrl',
                                ),
                              },
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          params: {
            threadKey: this.configService.get('google.threadId'),
          },
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        },
      );

      await firstValueFrom(googleRequest);

      logger.log('Webhook sent successfully');
    } catch (e) {
      logger.error(e);
    }
  }
}
