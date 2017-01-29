var isPlaying = false;
var isSearching = false;
var searchTerm = "";

function play() {
	if(isPlaying) {
		document.getElementsByClassName('play')[0].src = "play.png"
		isPlaying = false;
	} else {
		document.getElementsByClassName('play')[0].src = "pause.png"
		isPlaying = true;
	}
}

function searchbar(){
	if(isSearching){
		document.getElementsByClassName('title')[0].contentEditable = 'false';

		if(document.getElementsByClassName('title')[0].innerHTML == ""){
			document.getElementsByClassName('title')[0].innerHTML = searchTerm;
		}

		isSearching = false;
	} else {
		searchTerm = document.getElementsByClassName('title')[0].innerHTML;
		document.getElementsByClassName('title')[0].contentEditable = 'true';
		selectElementText(document.getElementById("title"));
		document.getElementsByClassName('title')[0].focus();
		isSearching = true;
	}
}

function selectElementText(el, win) {
    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}