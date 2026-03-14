import { Update, Start, Help, On, Message, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { InstagramService } from './instagram.service';
import { FacebookService } from './facebook.service';
import { YouTubeService } from './youtube.service';
import { Logger } from '@nestjs/common';
import axios from 'axios';

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private readonly instagramService: InstagramService,
    private readonly facebookService: FacebookService,
    private readonly youtubeService: YouTubeService,
  ) { }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      'Welcome! Send me an Instagram (Reel/Story), Facebook (Video/Post), or YouTube (Video/Shorts) link and I will download it for you.',
    );
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      'Just send me the link to the content you want to download (Instagram, Facebook, or YouTube).',
    );
  }

  @On('text')
  async onText(@Message('text') text: string, @Ctx() ctx: Context) {
    let service: any = null;
    let downloadMethod: string = '';
    let platformName: string = '';

    if (this.instagramService.isValidUrl(text)) {
      service = this.instagramService;
      downloadMethod = 'downloadReel';
      platformName = 'Instagram';
    } else if (this.facebookService.isValidUrl(text)) {
      service = this.facebookService;
      downloadMethod = 'downloadPost';
      platformName = 'Facebook';
    } else if (this.youtubeService.isValidUrl(text)) {
      service = this.youtubeService;
      downloadMethod = 'downloadVideo';
      platformName = 'YouTube';
    }

    if (service) {
      const processingMsg = await ctx.reply(
        `Processing your ${platformName} link, please wait...`,
      );

      try {
        const videoData = await service[downloadMethod](text);

        if (videoData && videoData.url) {
          try {
            const response = await axios({
              method: 'get',
              url: videoData.url,
              responseType: 'stream',
              timeout: 60000,
            });

            await ctx.replyWithVideo({ source: response.data });
          } catch (streamError) {
            this.logger.error(`Failed to stream video to Telegram: ${streamError instanceof Error ? streamError.message : String(streamError)}`);
            // Fallback to sending URL if stream fails
            try {
              await ctx.replyWithVideo(videoData.url);
            } catch (urlError) {
              this.logger.error(`Failed to send video via URL fallback: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
              throw urlError;
            }
          }
          await ctx.deleteMessage(processingMsg.message_id).catch(() => { });
        } else {
          await ctx.reply(
            `Sorry, I couldn't download the video from this ${platformName} link. It might be private, deleted, or the link format is currently unsupported.`,
          );
          await ctx.deleteMessage(processingMsg.message_id).catch(() => { });
        }
      } catch (error) {
        this.logger.error(
          `Failed to process ${platformName} link: ${error instanceof Error ? error.message : String(error)}`,
        );
        await ctx.reply(
          `An error occurred while processing the ${platformName} link. Please try again later.`,
        );
      }
    } else if (text.startsWith('http')) {
      await ctx.reply(
        "That doesn't look like a valid Instagram, Facebook, or YouTube link.",
      );
    }
  }
}
