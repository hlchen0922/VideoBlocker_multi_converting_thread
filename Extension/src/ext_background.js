import {checkConnection, checkURLOnServer, resetServerTable} from "./modules/urls"

checkConnection();

//register event for before web request 
chrome.webRequest.onBeforeRequest.addListener((details) => {        
        checkURLOnServer(details);     
        return;
    },
    {urls:["*://www.youtube.com/watch?v=*", "*://youtube.com/watch?v=*"]}
);

//register event for blocking vedio components
chrome.webRequest.onCompleted.addListener((details) => {
    let tabId = details.tabId;    
    chrome.tabs.sendMessage(tabId, {blockingTheater: 15});
    console.log("Send Blocking Message to Server.");    
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
