from abc import abstractmethod


class WebCrawler:

    def __init__(self, url):
        self.url = url
        self.video_urls = []

    @abstractmethod
    def collect_video_tags(self):
        pass

    @abstractmethod
    def download_video(self):
        pass

    @abstractmethod
    def get_filename(self):
        pass