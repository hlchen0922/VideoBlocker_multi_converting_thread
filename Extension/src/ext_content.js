"use strict"

let emptyContainer = null;
let videoPlayer = null;
let videoPlayerParent = null;

function blockingVideoContainer(){
    console.log("Blocking videos");
    videoPlayer = document.getElementsByClassName("html5-video-player")[0];
    if(videoPlayer != undefined){
        console.log("Hide video player");
        videoPlayerParent = videoPlayer.parentElement;
        videoPlayer.hidden = true;
        videoPlayerParent.appendChild(emptyContainer);
    }else{
        console.log("Cannot get player element");
    }
}

function createEmptyContainer(){
    emptyContainer = document.createElement("IMG");    
    let url = chrome.runtime.getURL("wait.jpg");    

    emptyContainer.src = url;
    emptyContainer.id = "chrome-extension-waiting";

    emptyContainer.style.display = "block";
    emptyContainer.style.width = "80%";
    emptyContainer.style.margin = "auto";
}

function restoreVideo(){
    console.log("Resume video.");
    videoPlayerParent.removeChild(emptyContainer);
    videoPlayer.hidden = false;
}

function pauseVideo(){
    let btnPause = document.getElementsByClassName("ytp-play-button")[0];    
    if(btnPause != undefined){        
        let pauseState = btnPause.getAttribute("aria-label");        
        if(pauseState.includes("Pause")){
            console.log("Pause video");
            btnPause.click();                     
        }else{
            console.log("Video paused already.");
        }
    }else{
        console.log("Cannot get pause button.");
    }  
}

createEmptyContainer();

chrome.runtime.onMessage.addListener((message, sender, response) => {    
    if("resumeVideo" in message){        
        restoreVideo();
    }else if("blockVideo" in message){
        setTimeout(pauseVideo, 1000);
        setTimeout(blockingVideoContainer, 1000);
    }
});
