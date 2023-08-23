
// this executes in the context of web page. We have direct DOM access.
function contentScript() {

    if (checkIfTabIsImage()) {
        const url = window.location.href;
        downloadURI(url);
    }


    //--------------------------------------------------//
    function downloadURI(uri) {
        var link = document.createElement("a");
        link.download = ''; // use default file name
        link.href = uri;
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
                });
            }
        }
    });
});

