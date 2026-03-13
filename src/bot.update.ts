import { Update, Start, Help, On, Message, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { InstagramService } from './instagram.service';
import { Logger } from '@nestjs/common';

@Update()
export class BotUpdate {
    private readonly logger = new Logger(BotUpdate.name);

    constructor(private readonly instagramService: InstagramService) { }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        await ctx.reply('Welcome! Send me an Instagram Reel link and I will download it for you.');
    }

    @Help()
    async onHelp(@Ctx() ctx: Context) {
        await ctx.reply('Just send me the link to the Reel you want to download.');
    }

    @On('text')
    async onText(@Message('text') text: string, @Ctx() ctx: Context) {
        if (this.instagramService.isValidUrl(text)) {
            const processingMsg = await ctx.reply('Processing your reel, please wait...');

            try {
                const videoData = await this.instagramService.downloadReel(text);

                if (videoData && videoData.url) {
                    await ctx.replyWithVideo(videoData.url);
                    await ctx.deleteMessage(processingMsg.message_id).catch(() => { });
                } else {
                    await ctx.reply('Sorry, I couldn\'t find the video for this link. It might be private or deleted.');
                }
            } catch (error) {
                this.logger.error(`Failed to process reel: ${error.message}`);
                await ctx.reply('An error occurred while processing the reel. Please try again later.');
            }
        } else if (text.startsWith('http')) {
            await ctx.reply('That doesn\'t look like a valid Instagram reel link.');
        }
    }
}
