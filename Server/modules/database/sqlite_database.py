import sqlite3
import threading

class DBConnection:
    def __init__(self):
        self._lock = threading.Lock()
        self._cmd_create_table = '''CREATE TABLE IF NOT EXISTS records ( 
                                        URL TEXT PRIMARY KEY, 
                                        Domain TEXT NOT NULL, 
                                        Blocked INTEGER NOT NULL, 
                                        CaughtWord TEXT 
                                        );'''
        try:
            self._lock.acquire(True)         
            self._connection = sqlite3.connect("./modules/data/vb.db", check_same_thread=False)
            self._cursor = self._connection.cursor()
            self._cursor.execute(self._cmd_create_table)
        except sqlite3.Error as e:
            print(e)
        finally:
            self._lock.release()


    def check_if_url_existed(self, url):
        param = (url,)        
        try:
            self._lock.acquire(True)
            self._cursor.execute("SELECT COUNT(*) FROM records WHERE URL = ?;", param)
            result = self._cursor.fetchone()
            return result[0]
        except sqlite3.Error as e:
            print(e)
        finally:
            self._lock.release()

    
    def insert_url_details(self, url_info):        
        try:
            self._lock.acquire(True)
            self._cursor.execute('''INSERT INTO records(URL, Domain, Blocked, CaughtWord) 
                                        VALUES(?, ?, ?, ?);''', 
                                        (url_info["URL"], url_info["Domain"], url_info["Blocked"], url_info["CaughtWord"],)
                                    )
            self._connection.commit()
            print("Insert data %s, %s, %s, %s" %(url_info["URL"], url_info["Domain"], url_info["Blocked"], url_info["CaughtWord"]))
        except sqlite3.Error as e:
            if self._connection:
                self._connection.rollback()
            print(e)
        finally:
            self._lock.release()


    def get_url_details(self, url):
        param = (url,)        
        try:
            self._lock.acquire(True)
            self._cursor.execute('''SELECT * FROM records WHERE URL = ?; ''', param)
            result = self._cursor.fetchone()
            return {"URL": result[0], 
                    "Domain":result[1], 
                    "Blocked": result[2], 
                    "CaughtWord": result[3]
                    }
        except sqlite3.Error as e:
            print(e)
        finally:
            self._lock.release()

    
    def reset_all_table(self):        
        try:
            self._lock.acquire(True)
            self._cursor.execute('''DROP TABLE IF EXISTS records;''')
            self._cursor.execute(self._cmd_create_table)
            return True
        except sqlite3.Error as e:
            print(e)
            return False
        finally:
            self._lock.release()

