import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const { instagramGetUrl } = require('instagram-url-direct');

interface InstagramResult {
  url_list: string[];
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  async downloadReel(url: string): Promise<{ url: string } | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = (await instagramGetUrl(url)) as InstagramResult;
      if (result && result.url_list && result.url_list.length > 0) {
        return {
          url: result.url_list[0],
        };
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Error downloading reel: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  isValidUrl(url: string): boolean {
    const regex =
      /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv|reels|stories)\/([^/?#&]+)/;
    return regex.test(url);
  }
}
