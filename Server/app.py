from flask import Flask, jsonify, request
from termcolor import colored

import threading
import time
from queue import Queue

from timeit import default_timer as timer
from datetime import timedelta

import modules.database.sqlite_database as SQLITEDB
import modules.crawler.crawlermanager as CRAWLER
import modules.audioFile.audiohandler as AUDIO
import modules.wordCatcher.wordcatcher as WORDCATCHER

app = Flask(__name__)

crawlerMG = CRAWLER.CrawlerManager()
audioMG = AUDIO.AudioHandler()
db = SQLITEDB.DBConnection()
catcher = WORDCATCHER.WordCatcher()

##################################################################
# check the connection between chrome extension and local server #
##################################################################
@app.route("/checkLink", methods=["POST"])
def check_link():
    if not request.method == "OPTIONS":
        req_data = request.get_json()
        if req_data != None:
            catcher.reset_word_list(req_data["word_list"])
        print("Get checking connection request")
        return "Connected!"
    return ""

#########################################
# check if url can be found in database #
# if not, create a cralwer              #
#########################################
@app.route("/urlExisted", methods=["POST"])
def check_if_url_exist():
    if not request.method == "OPTIONS":    
        req_data = request.get_json()        
        url = str(req_data["url"])        
        exist = db.check_if_url_existed(url)
        if exist == 0:
            crawlerMG.add_crawler(url)
            print("Add crawler: " + url)
        print("Found url in server?: " + str(exist == 1))
        return jsonify({"exist": exist})
    return ""
    

########################################################
# trigger video download action and speech recognition #
########################################################
@app.route("/analysis", methods=["POST"])
def check_if_url_legal():
    if not request.method == "OPTIONS":   
        req_data = request.get_json()
        url = str(req_data["url"])
        print("url in analysis: " + url)
        domain = str(req_data["domain"])
        # one crawler for each page
        crawler = None      
        crawler = crawlerMG.pop_crawlers(url)
        data = {
            "URL": url,
            "Domain": domain,
            "Blocked": False,
            "CaughtWord": ""
        }

        q_audio_words = Queue()
        q_stop_flag = Queue()
        q_caught_word = Queue()
        
        if crawler != None:
            try:
                # downlaod video to local disk
                start = timer()
                crawler.collect_video_tags()
                crawler.download_video()
                end = timer()
                print("Time elapse for downloading: " + str(timedelta(seconds=end-start)))
                
                # converting mp3 to wav file
                filename = crawler.get_filename()              

                # new threads to handle SR transcribing and checking all captured words at the same time.
                start = timer()
                transcribe_thread = threading.Thread(target=audioMG.trans_audio_file_batch, args=(filename, q_audio_words, q_stop_flag))
                check_word_thread = threading.Thread(target=catcher.catch_word, args=(q_audio_words, q_stop_flag, q_caught_word))
                # start thread
                transcribe_thread.start()
                check_word_thread.start()
                # close thread
                transcribe_thread.join()
                check_word_thread.join()
                end = timer()
                print("Time elapse for transcribing: " + str(timedelta(seconds=end-start)))
                
                # set url information if there are words got captured                
                if not q_caught_word.empty():                    
                    data["Blocked"] = True
                    data["CaughtWord"] = q_caught_word.get()
                    print(colored(data["CaughtWord"], "red"))
                    
                # insert current information into database
                print("Insert into database")        
                db.insert_url_details(data)
            except Exception as e:
                print(e)    
        return jsonify(data)
    return jsonify({})


#########################################
# get existed url details from database #
#########################################
@app.route("/urlDetails", methods=["POST"])
def get_url_details():
    if not request.method == "OPTIONS":
        req_data = request.get_json()
        url = req_data["url"]
        results = db.get_url_details(str(url))    
        return jsonify(results)
    return ""


#################################
# clear all records in databses #
# called when user reset the    #
# keyword list                  #
#################################
@app.route("/reset", methods=["GET"])
def reset_tables():
    if not request.method == "OPTIONS":
        print("Reset tables")
        if db.reset_all_table():
            return "Table updated!"
        return "Error! Cannot update database."
    return ""


@app.route("/debug", methods=["POST"])
def pop_crawler():
    req_data = request.get_json()
    url = str(req_data["url"])    
    print(crawlerMG.pop_crawlers(url))
    return ""
    
    