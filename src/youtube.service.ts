import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { youtube } = require('btch-downloader');

@Injectable()
export class YouTubeService {
    private readonly logger = new Logger(YouTubeService.name);

    async downloadVideo(url: string): Promise<{ url: string } | null> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const result = await youtube(url);

            if (result && result.status) {
                const videoUrl = result.mp4 || result.video;
                if (videoUrl) {
                    return {
                        url: videoUrl,
                    };
                }
            }
            this.logger.warn(`No video links found for YouTube URL: ${url}`);
            return null;
        } catch (error: any) {
            this.logger.error(
                `Error downloading YouTube video: ${error instanceof Error ? error.message : String(error)}`,
            );
            return null;
        }
    }

    isValidUrl(url: string): boolean {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|shorts\/|v\/|embed\/)?([^/?#&]+)/;
        return regex.test(url);
    }
}
