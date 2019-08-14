let containerClone = null;
let blockingPeriod_s = 10;

let emptyContainer = null;
createEmptyContainer();

chrome.runtime.onMessage.addListener((message, sender, response) => {
    skipAds();
    if("blockingTheater" in message){        
        blockingPeriod_s = message.blockingTheater;
        console.log("Blocking video for " + blockingPeriod_s + " seconds.");
        blockingVideoContainer();
    }
});

function blockingVideoContainer(){
    let player = document.getElementById("ytd-player");
    let video = document.getElementsByTagName("video")[0];

    if(video){
        console.log("Pause video");
        video.pause();
    }

    for(let i = 0; i < player.children.length; i++){        
        if(player.children[i].id == "container"){
            console.log("Catch container!");
            containerClone = player.children[i].cloneNode(true);                    
            player.replaceChild(emptyContainer, player.children[i]);            
            break;
        }          
    }
}

function restoreVideoContainer(){
    console.log("Restore container");
    let player = document.getElementById("ytd-player");
    for(let i = 0; i < player.children.length; i++){
        if(player.children[i].id == "chrome-extension-waiting"){
            player.replaceChild(containerClone, player.children[i]);
        }
    }    
}

function createEmptyContainer(){
    emptyContainer = document.createElement("IMG");    
    let url = chrome.runtime.getURL("wait.jpg");    

    emptyContainer.src = url;
    emptyContainer.id = "chrome-extension-waiting";

    emptyContainer.style.display = "block";
    emptyContainer.style.width = "50%";
    emptyContainer.style.margin = "auto";
}

//skip ads at first place
function skipAds(){
    let layer = 0;   
    let ad = document.getElementsByClassName("ytp-ad-player-overlay")[layer];  
    console.log(ad);
    while(ad != undefined){        
        let skip = document.getElementsByClassName("ytp-ad-skip-button")[0];
        if(skip != undefined){
            console.log("Skip Ad");
            skip.click();
        }
        layer++;
        ad = document.getElementsByClassName("ytp-ad-player-overlay")[layer];
    }
}
