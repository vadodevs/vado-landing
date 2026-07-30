export type CrawlPage = { url: string; title?: string; text: string };

export type CrawlBundle = {
  domain: string;
  homepageUrl: string;
  visitedUrls: string[];
  pages: CrawlPage[];
  consolidated: string;
  extractedEmails: string[];
  extractedPhones: string[];
  keywords: string[];
};
