import time

class WordCatcher:
    
    def __init__(self):
        self.word_set = set()

    def reset_word_list(self, word_list):
        #store all words in a set to avoid any duplication
        self.word_set.clear()       
        for word in word_list:
            self.word_set.add(word)


    def add_new_word(self, new_word):
        self.word_set.add(new_word)

    
    def catch_word(self, q_audio_elements, q_stop_flag, q_caught_word):
        stop = False
        while not stop:
            if not q_audio_elements.empty():
                element = q_audio_elements.get()
                text = element["line"]
                stop = element["done"]                
                for word in self.word_set:  
                    if word in text.split(" "):
                        q_stop_flag.put(True)
                        q_caught_word.put(word)
                        return                
            time.sleep(0.1)            
        return    
                