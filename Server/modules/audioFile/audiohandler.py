from pydub import AudioSegment

import os, queue
import speech_recognition as sr
import wave
import math

class AudioHandler:

    # allows only one speech recognition thread working
    recognizer = None
    def __init__(self):        
        self._dest_format = "wav"
        self._src_format = "mp3"
        self._src_file_path = "modules/tmp_data"
        self._dest_file_path = "modules/audioFile/sr"

        self._audio_file = None

        self._duration = 15
        self._length = 0

        if AudioHandler.recognizer == None:
            AudioHandler.recognizer = sr.Recognizer()


    def convert_to_wav(self, file_name):
        #construct source file path
        src_video = os.path.join(self._src_file_path, file_name + "." + self._src_format)

        if os.path.exists(src_video): 
            #construct destination file path           
            dest_audio = os.path.join(self._dest_file_path, file_name + "." + self._dest_format)

            #transcribe .mp3 to .wav file
            audio = AudioSegment.from_mp3(src_video)
            audio.export(dest_audio, format=self._dest_format)

            self._audio_file = sr.AudioFile(dest_audio)
            self._get_audio_length(dest_audio)
            self._delete_file(src_video)


    def _delete_file(self, file_path):
        if os.path.exists(file_path):
            os.remove(file_path)


    def trans_audio_file(self, file_name, que, flag):
        dest_path = os.path.join(self._dest_file_path, file_name + "." + self._dest_format)        
        #divide audio file into segments with self._duration for each.
        try:
            with self._audio_file as audio_file:            
                for i in range (0, math.ceil(self._length/self._duration)):
                    audio = AudioHandler.recognizer.record(audio_file, duration = self._duration)
                    text = AudioHandler.recognizer.recognize_google(audio)
                    element = {
                        "line": text,
                        "done": i == (math.ceil(self._length/self._duration)-1)
                    }
                    que.put(element)
                    print("%d : %s" %(i, text))
                    if not flag.empty():                    
                        break
        except sr.UnknownValueError:
            #Cannot process speech recognition, pass and go next round                
            pass
        finally:
            # final, set done to True and put into que to stop wordcatcher
            element = {
                "line": "",
                "done": True
            }
            que.put(element)
            self._delete_file(dest_path)
        


    def _get_audio_length(self, file_path):
        with wave.open(file_path) as f:
            frames = f.getnframes()
            rate = f.getframerate()
            self._length = (frames/float(rate))
