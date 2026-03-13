import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { instagramGetUrl } = require('instagram-url-direct');

@Injectable()
export class InstagramService {
    private readonly logger = new Logger(InstagramService.name);

    async downloadReel(url: string): Promise<{ url: string } | null> {
        try {
            const result = await instagramGetUrl(url);
            if (result && result.url_list && result.url_list.length > 0) {
                return {
                    url: result.url_list[0],
                };
            }
            return null;
        } catch (error) {
            this.logger.error(`Error downloading reel: ${error.message}`);
            return null;
        }
    }

    isValidUrl(url: string): boolean {
        const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv|reels)\/([^/?#&]+)/;
        return regex.test(url);
    }
}
