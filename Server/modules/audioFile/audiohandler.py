from pydub import AudioSegment

import threading
import os, queue
import speech_recognition as sr
import wave
import math

class AudioHandler:

    # use multiple sr to parallelly work on one video
    def __init__(self): 
        self._recognizers = []
        self._num_of_sr_inst = 4

        self._dest_format = "wav"        
        self._src_file_path = "modules/tmp_data"
        self._dest_file_path = "modules/audioFile/sr"     
        
        self._file_names = []
        self._audio_files = []
        self._transcribing_threads = []

        self._duration = 20
        # enable 4 speech recognizors for later usage        
        for i in range (self._num_of_sr_inst):
            self._recognizers.append(sr.Recognizer())
      
    
    def _delete_file(self, file_path):
        if os.path.exists(file_path):
            os.remove(file_path)


    def _divide_audio_file(self, file_name):
        full_file_path = os.path.join(self._src_file_path, file_name + "." + self._dest_format)        
        self._get_audio_length(full_file_path)        
        self._file_names = []
        self._audio_files = []
        self._transcribing_threads = []

        # split original file equally into multiple segments for all recognizor instances
        audio = AudioSegment.from_wav(full_file_path)
        length = self._get_audio_length(full_file_path)
        upper_limit =  min(self._num_of_sr_inst, math.ceil(length/self._duration))
                   
        for i in range (upper_limit):
            print("Chopping file: i = " + str(i))
            ss = i*math.ceil(length/self._num_of_sr_inst)*1000
            es = (i+1)*math.ceil(length/self._num_of_sr_inst)*1000
            segment = audio[ss:es]
            segment_file_name = "%s_%s" %(file_name, str(i))
            segment_file_path = os.path.join(self._dest_file_path, "%s.%s" %(segment_file_name, self._dest_format))
            segment.export(segment_file_path, format="wav")
            self._file_names.append(segment_file_name)
            self._audio_files.append(sr.AudioFile(segment_file_path))
        self._delete_file(full_file_path)
    

    def trans_audio_segment_file(self, sr_session, file_name, audio_file, q_audio_element, q_stop_flag):
        dest_path = os.path.join(self._dest_file_path, file_name + "." + self._dest_format)
        length = self._get_audio_length(dest_path)

        #divide audio file into pieces with self._duration for each.        
        with audio_file as audio_file:            
            for i in range (math.ceil(length/self._duration)):
                try:
                    if not q_stop_flag.empty():
                        return
                    audio = sr_session.record(audio_file, duration = self._duration)
                    text = sr_session.recognize_google(audio)
                    element = {"line": text}
                    q_audio_element.put(element)
                    print("%d : %s" %(i, text))                    
                except sr.UnknownValueError:
                    element = {"line": ""}
        
        self._delete_file(dest_path)
    

    def trans_audio_file_batch(self, file_name, q_audio_element, q_stop_flag):  
        self._divide_audio_file(file_name)
        self._transcribing_threads.clear()

        for i in range(len(self._file_names)):            
            sr_session = self._recognizers[i]
            segment_file_name = self._file_names[i]
            segment_audio_file = self._audio_files[i]

            thread = threading.Thread(target=self.trans_audio_segment_file, args=(sr_session, segment_file_name, segment_audio_file, q_audio_element, q_stop_flag))
            self._transcribing_threads.append(thread)
            thread.start()

        for i in range(len(self._transcribing_threads)):
            self._transcribing_threads[i].join()

        print("Transcription Done!")
        q_stop_flag.put(True)


    def _get_audio_length(self, file_path):
        with wave.open(file_path) as f:
            frames = f.getnframes()
            rate = f.getframerate()
            return frames/float(rate)
