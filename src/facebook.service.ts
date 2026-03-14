import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fbdown } = require('btch-downloader');

interface FacebookResult {
    status: boolean;
    HD?: string;
    Normal_video?: string;
}

@Injectable()
export class FacebookService {
    private readonly logger = new Logger(FacebookService.name);

    async downloadPost(url: string): Promise<{ url: string } | null> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const result = (await fbdown(url)) as FacebookResult;

            if (result && result.status) {
                const videoUrl = result.HD || result.Normal_video;
                if (videoUrl) {
                    return {
                        url: videoUrl,
                    };
                }
            }
            this.logger.warn(`No video links found for Facebook URL: ${url}`);
            return null;
        } catch (error: any) {
            const errorMessage = error?.response?.status === 404
                ? 'Facebook content not found (404). It might be private or deleted.'
                : (error instanceof Error ? error.message : String(error));

            this.logger.error(`Error downloading Facebook post: ${errorMessage}`);
            return null;
        }
    }

    isValidUrl(url: string): boolean {
        const regex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.com|m\.facebook\.com)\/.+/;
        return regex.test(url);
    }
}
