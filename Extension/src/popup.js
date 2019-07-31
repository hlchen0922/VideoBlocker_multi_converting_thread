import "./css/popup_style.css"

document.getElementById("btnSubmit").addEventListener("click", updateKeywords);
document.getElementById("btnReset").addEventListener("click", clearKeywordTextarea);

function updateKeywords(){
    let keywordString = document.getElementById("list").value;
    let keywordList = keywordString.split(/[\s,]+/);
    
    let msg = {newKeyword: keywordList};
    chrome.runtime.sendMessage(msg);
}

function clearKeywordTextarea(){
    let list = document.getElementById("list");
    list.value = "";
}