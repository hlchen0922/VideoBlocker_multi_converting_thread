# VideoBlocker

This project aims to detect any youtube page opened on chrome with any potentially harmful video for children.

There are two major components in this project, the Server/server.py and the Extension/src/ext_background.js.

The former uses Flask framework to construct a local server which is responsible for manipulating files in the local disk and the sqlite database.

The later is a chrome extension and its published version will be exported to folder Extension/dist. Considering there could possibly be other extra files need to be integerated into the extension, webpack is adopted here to put everything into a single file.


To run this program, here is the steps(for Windows):

1. open terminal and cd to ./Server
2. enter "set FLASK_APP=app.py"
3. enter "set FLASK_ENV=developemnt"
4. enter "set FLASK_DEBUG=1"
5. enter "python -m flask run --host=127.0.0.1 --port=8080"
6. make sure the server is successfully running

(only required if there is any update for chrome extension code) 

7. cd to ./Extension \
8. simply enter "npm start" \
9. reload dist folder on google chrome. 

How to upload chrome extension (in development mode): 
1. open google chrome and enter "chrome://extensions" in the URL bar. 
2. turn on Developer mode on up-right cornor. 
3. click "Load unpacked" button and browse to folder ./Extension/dist 
