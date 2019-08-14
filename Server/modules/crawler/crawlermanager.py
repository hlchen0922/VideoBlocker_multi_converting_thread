from urllib.parse import urlparse
import modules.crawler.ytcrawler as youtube

class CrawlerManager:

    def __init__(self):
        self.crawlers = dict()
        self.workingURL = set()     


    def add_crawler(self, url):
        if not url in self.workingURL:
            parsed_uri = urlparse(url)
            domain = parsed_uri.netloc             
            if "youtube" in domain:
                crawler = youtube.YTCrawler(url)
                self.crawlers[url] = crawler
            else:
                pass
     
    
    # make sure no another duplicated crawler would be created when the other is still in processing
    def get_crawler(self, url):
        bHasCrawler = url in self.crawlers
        bHasURLWorking = url in self.workingURL
        if bHasCrawler and not bHasURLWorking:
            self.workingURL.add(url)
            return self.crawlers.get(url)
        else:
            return None


    def del_crawler(self, url):
        self.workingURL.remove(url)
        self.crawlers.pop(url)