from urllib.parse import urlparse
import modules.crawler.ytcrawler as youtube

class CrawlerManager:

    def __init__(self):
        self.crawlers = {}        


    def add_crawler(self, url):
        parsed_uri = urlparse(url)
        domain = parsed_uri.netloc        
        if "youtube" in domain:
            crawler = youtube.YTCrawler(url)
            self.crawlers[url] = crawler
        else:
            pass
        

    def pop_crawlers(self, url):
        return self.crawlers.pop(url)