from __future__ import unicode_literals
import re
import youtube_dl
import modules.crawler.webcrawler as CWeb

class YTCrawler(CWeb.WebCrawler):
    def __init__(self, url):
        super().__init__(url)
               
        self.output_file_name = "idNotMatchedFileName"
        match = re.search(r"(?<=(v|V)=)\w+", url)        
        if match:
            self.output_file_name = match.group()
        self.ydl_opts = {
            'format': 'worstaudio/worst',
            'outtmpl': 'modules/tmp_data/{0!s}.%(ext)s'.format(self.output_file_name),
            'restrictfilenames': True,
            'noplaylist': True,           
            'postprocessors': [{
               'key': 'FFmpegExtractAudio',
               'preferredcodec': 'wav',
               'preferredquality': '192',
            }]            
        }
        self.video_urls = []


    def collect_video_tags(self):
        self.video_urls.append(self.url)


    def download_video(self):
        with youtube_dl.YoutubeDL(self.ydl_opts) as ydl:
            ydl.download(self.video_urls)


    def get_filename(self):
        return self.output_file_name