"use strict"

const serverURL = "http://localhost:8080"

//checking if local server is ready//
export function checkConnection(){    
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
export async function checkURLOnServer(details){
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
                    chrome.tabs.query({currentWindow:true, active: true}, function(tabs){                        
                        let currentURL = tabs[0].url;
                        currentURL = currentURL.split("&")[0];
                        if(currentURL == url){
                            console.log("resume video");
                            chrome.tabs.update(tabId, {url: url});
                        }else{
                            console.log("URLs differ: " + url + " vs " + currentURL);
                        }
                    });                    
                }else{
                    //This video is in process
                    chrome.tabs.sendMessage(tabId, {blockVideo: true});                  
                    console.log("Send Blocking Message to Content scripts.");
                    console.log("Server is currently working on this video.");                    
                }
            }
        }   
    }
}

export function resetServerTable(){
    fetch(serverURL + "/reset").then(function(res){
        console.log(res.text());
    })
}


