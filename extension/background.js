
// this executes in the context of web page. We have direct DOM access
function contentScript() {
    
    if (checkIfTabIsImage()) {
        try {
            document.cookie; // if web page is sandboxed this will throw an exception

            downloadURL(uwindow.location.href); // download by content script to save all page cookies
        } catch (error) { // we can't download images via content script when page is sandboxed, 
            chrome.runtime.sendMessage('download-by-chrome-api'); // so we send signal to the background script
        }
    }


    //--------------------------------------------------//
    function downloadURL(url) {
        var link = document.createElement("a");
        link.download = ''; // use default file name
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }

    function checkIfTabIsImage() {
        // check if body has only one img element and it's src equels to window url
        return document.body.children.length == 1 && document.body.children[0] == document.querySelector('img')
            && document.body.children[0].src == window.location.href;
    }

}

// when extension icon clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) { // iterate through each opened tab in the browser
            if (tab.url.startsWith('http')) { // only normal URLs
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: contentScript
                }).catch(e => {}); // if we can't execute script on page an exception will be throwned
            }
        }
    });
});

// listen to our contents scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'download-by-chrome-api') { 
        chrome.downloads.download({
            url: sender.url
        });
    }
});


