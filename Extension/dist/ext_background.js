/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ext_background.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/ext_background.js":
/*!*******************************!*\
  !*** ./src/ext_background.js ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_urls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/urls */ "./src/modules/urls.js");


Object(_modules_urls__WEBPACK_IMPORTED_MODULE_0__["checkConnection"])();

//register onCompleted event so that content script can be triggered after page is ready
chrome.webRequest.onCompleted.addListener((details) => {    
    Object(_modules_urls__WEBPACK_IMPORTED_MODULE_0__["checkURLOnServer"])(details);
},
    {urls:["*://www.youtube.com/watch?v=*", "*://youtube.com/watch?v=*"]}
);

//register event for users click extension icon
chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL("ext_popup.html")});    
});

//register event for user reseting the keyword list
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if("newKeyword" in request){
        setForbiddenWords(request.newKeyword);
        Object(_modules_urls__WEBPACK_IMPORTED_MODULE_0__["checkConnection"])();
        Object(_modules_urls__WEBPACK_IMPORTED_MODULE_0__["resetServerTable"])();
    }
});

////////////////////////////////////////
// chrome storage configure functions //
////////////////////////////////////////
function setForbiddenWords(wordList){
    chrome.storage.sync.remove("word_list");    
    chrome.storage.sync.set({word_list: wordList});
    wordList.forEach((word, i) => {
        console.log("Set keyword - " + i + ": " + word);
    })
}


/***/ }),

/***/ "./src/modules/urls.js":
/*!*****************************!*\
  !*** ./src/modules/urls.js ***!
  \*****************************/
/*! exports provided: checkConnection, checkURLOnServer, resetServerTable */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkConnection", function() { return checkConnection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkURLOnServer", function() { return checkURLOnServer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetServerTable", function() { return resetServerTable; });


const serverURL = "http://localhost:8080"

//checking if local server is ready//
function checkConnection(){    
    chrome.storage.sync.get(["word_list"], (results) => {
        console.log(results.word_list);
        fetch(serverURL + "/checkLink", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(results)
        }).then(function(res){            
            return res.text();            
        }).then(function(resText){
            console.log(resText);                                           
        }).catch(function(err){
            alert("Video Blocker cannot work because: \n" + err.message);
        });
    })
}

//pass the url to local server for speech recognition analysis
async function checkURLOnServer(details){
    let jsonDetails = null;
    //remove other parameters appended to video urls. avoid server to analysis the same video multiple times
    let url = details.url.split("&")[0];
    let domain = (new URL(url)).hostname;
    let tabId = details.tabId;

    //check if url can be found in local database        
    let pExist = await fetch(serverURL + "/urlExisted", {
        method: "post",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: url, domain: domain})
    });
    if(pExist.ok){
        let jsonExist = await pExist.json();   
        //url exists in local database, fetch details                  
        if(jsonExist.exist == 1){            
            let pDetails = await fetch(serverURL + "/urlDetails", {
                method: "post",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({url: url, domain: domain})
            });
            jsonDetails = await pDetails.json();
            if(jsonDetails.Blocked == "True"){           
                chrome.tabs.update(tabId, {url: "http://" + domain});
                alert("The video is blocked due to improper content found in dialog.");           
            }
        }else{
            chrome.tabs.sendMessage(tabId, {blockVideo: true});           
            //url not found in local server either, trigger speech recognition            
            let pDetails = await fetch(serverURL + "/analysis", {
                method: "post",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({url: url, domain: domain})
            });
            if(pDetails.ok){
                jsonDetails = await pDetails.json();
                //redirect current page to youtube.com if the video is improper
                if(jsonDetails.Blocked == "True"){            
                    chrome.tabs.update(tabId, {url: "http://" + domain});
                    alert("The video is blocked due to improper content found in dialog.");          
                }else if(jsonDetails.Blocked == "False"){
                    console.log("Video OK!");
                    chrome.tabs.query({"lastFocusedWindow": true, "active": true}, function(tabs){
                        console.log("resume video");
                        let currentURL = tabs[0].url;
                        if(currentURL == url){
                            chrome.tabs.reload(tabId, {"bypassCache": true});
                        }
                    });                    
                }else{
                    //This video is in process                    
                    console.log("Send Blocking Message to Content scripts.");
                    console.log("Server is currently working on this video.");                    
                }
            }
        }   
    }
}

function resetServerTable(){
    fetch(serverURL + "/reset").then(function(res){
        console.log(res.text());
    })
}




/***/ })

/******/ });