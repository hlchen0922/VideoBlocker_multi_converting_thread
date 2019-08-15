import {checkConnection, resetServerTable, checkURLOnServer} from "./modules/urls"

checkConnection();

//register onCompleted event so that content script can be triggered after page is ready
chrome.webRequest.onCompleted.addListener((details) => {    
    checkURLOnServer(details);
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
        checkConnection();
        resetServerTable();
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
