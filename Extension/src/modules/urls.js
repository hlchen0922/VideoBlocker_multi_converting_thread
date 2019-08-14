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
                chrome.tabs.update(details.tabId, {url: "http://" + jsonDetails.Domain});
                alert("The video is blocked due to improper content found in dialog.");           
            }
        }else{
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
                    chrome.tabs.update(details.tabId, {url: "http://" + jsonDetails.Domain});
                    alert("The video is blocked due to improper content found in dialog.");          
                }else if(jsonDetails.Blocked == "False"){
                    reloadTab(url);
                }else{
                    //This video is in process
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

function reloadTab(url){
    chrome.tabs.query({active: true, currentWindow: true, url: url}, function(tabs){
        chrome.tabs.reload(tabs[0].id);
    })
}