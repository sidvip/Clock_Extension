let digitalTimeInterval;
let analogTimeInterval;
let storageKeys = ["isAnalog", "wlname", "wlgender"];
let mapURI;
let quickInfoJSON = {
    "link": "",
    "image": "../appearance/images/icons/link.png"
}

function storeInsideBrowserStorage(key, value) {
    window.localStorage.setItem(key, value);
}

function initiateClock(hrEle, minEle, secEle, isAnalog) {
    let currentTime = new Date();
    let currentSec = currentTime.getSeconds();
    let currentMin = currentTime.getMinutes();
    let currentHour = isAnalog ? currentTime.getHours() % 12 : currentTime.getHours();
    if (isAnalog) {
        hrEle[0].style.transform = `rotateZ(${(currentHour * 30 + (currentMin/60) * 30)}deg)`;
        minEle[0].style.transform = `rotateZ(${(currentMin * 6)}deg)`;
        secEle[0].style.transform = `rotateZ(${(currentSec * 6)}deg)`;
    } else {
        hrEle.innerText = currentHour.toString().length === 1 ? "0" + currentHour : currentHour;
        minEle.innerText = currentMin.toString().length === 1 ? "0" + currentMin : currentMin;
        secEle.innerText = currentSec.toString().length === 1 ? "0" + currentSec : currentSec;
    }
}

function startDigitalClock(hrEle, minEle, secEle) {
    initiateClock(hrEle, minEle, secEle, false);
    digitalTimeInterval = setInterval(() => {
        initiateClock(hrEle, minEle, secEle, false);
    }, 1000);
}

function startAnalogClock(hrEle, minEle, secEle) {
    initiateClock(hrEle, minEle, secEle, true);
    analogTimeInterval = setInterval(() => {
        initiateClock(hrEle, minEle, secEle, true);
    }, 1000);
}

function toggleClocks(isAnalog) {
    if (isAnalog) {
        document.getElementsByClassName('analog-clock')[0].style.display = 'block';
        document.getElementsByClassName('digital-clock')[0].style.display = 'none';
    } else {
        document.getElementsByClassName('analog-clock')[0].style.display = 'none';
        document.getElementsByClassName('digital-clock')[0].style.display = 'block';
    }
}

function startClock(isAnalog) {
    toggleClocks(isAnalog);
    if (isAnalog) {
        if (digitalTimeInterval) {
            clearInterval(digitalTimeInterval);
        }
        if (analogTimeInterval) {
            clearInterval(analogTimeInterval);
        }
        startAnalogClock(document.getElementsByClassName('hr-hand'),
            document.getElementsByClassName('min-hand'),
            document.getElementsByClassName('sec-hand'));
    } else {
        if (analogTimeInterval) {
            clearInterval(analogTimeInterval);
        }
        if (digitalTimeInterval) {
            clearInterval(digitalTimeInterval);
        }
        startDigitalClock(document.getElementById('hr-div'),
            document.getElementById('min-div'),
            document.getElementById('sec-div'));
    }
}

function updateDisplayName() {
    let genEle = document.getElementsByClassName('gender-tag');
    if (window.localStorage.getItem(storageKeys[2]) === "male") {
        genEle[0].innerText = "Mr. ";
    } else {
        genEle[0].innerText = "Ms. ";
    }
    document.getElementsByClassName('name-tag')[0].innerText = window.localStorage.getItem(storageKeys[1]);
}

function selectImage(e) {
    let fr = new FileReader();

    fr.readAsDataURL(e.target.files[0]);
    fr.onerror = () => {
        console.error(fr.error);
        alert(fr.error);
    };

    fr.onload = (result) => {
        if (e.target.id === 'main-ext-bg') {
            document.getElementsByClassName('bgDiv')[0].style.backgroundImage = `url(${fr.result})`;
            storeInsideBrowserStorage('userDefinedImage', fr.result);
            document.getElementById('bing-uri-id').style.visibility = 'hidden';
            document.getElementsByClassName('bg-file-select')[0].value = "";
        } else {
            quickInfoJSON.image = fr.result;
        }
    };
}

function deleteBackground() {
    window.localStorage.removeItem('userDefinedImage');
    fetchBingImage();
}

function toggleOverlay(isOverlay) {
    let overlaidId = document.getElementById('overlaid-div');
    if (isOverlay) {
        overlaidId.style.visibility = 'visibile';
        overlaidId.style["z-index"] = 35;
        overlaidId.style.width = 'auto';
        overlaidId.style.height = 'auto';
        overlaidId.style.minWidth = '100%';
        overlaidId.style.minHeight = '100%';

    } else {
        overlaidId.style.width = '0px';
        overlaidId.style.height = '0px';
        overlaidId.style.minWidth = '0%';
        overlaidId.style.minHeight = '0%';
        overlaidId.style.visibility = 'hidden';
        overlaidId.style.zIndex = -10;
    }
}

function animateSearch() {
    let gForm = document.getElementById('search-form');
    gForm.style.visibility = 'visible';
    toggleOverlay(true);
    let left = Math.round(0.5 * (window.innerWidth - gForm.getBoundingClientRect().width));
    let top = Math.round(0.3 * (window.innerHeight - gForm.getBoundingClientRect().height));
    gForm.style.transform = `translate(${left}px, ${top}px)`;
}

function closeSearchBar() {
    toggleOverlay(false);
    document.getElementById(this.parentElement.id).style.transform = 'translate(0px, 0px)';
    document.getElementById(this.parentElement.id).style.visibility = 'hidden';
}

function deleteAll() {
    let data = window.localStorage;
    if (Object.keys(data).length !== 0) {
        Object.keys(data).forEach(key => {
            if (key.startsWith('sveopc-')) {
                deleteNoteCompletely(key);
            }
        });
    }
}

function decideLocations(eleId, left, top) {
    let parentDiv = document.getElementById('notes-main-div');
    let parentDivWidth = parentDiv.getBoundingClientRect().width * 0.7;
    let parentDivHeight = parentDiv.getBoundingClientRect().height * 0.95;

    let eleDiv = document.getElementById(eleId);
    let eleDivWidth = eleDiv.getBoundingClientRect().width;
    let eleDivHeight = eleDiv.getBoundingClientRect().height;
    let padding = 50;

    eleDiv.style.left = left + 'px';
    eleDiv.style.top = top + 'px';

    if (left < parentDivWidth) {
        left += eleDivWidth + padding;
    } else if (left > parentDivWidth) {
        left = 0;
        top += eleDivHeight + padding;
    }
    if (top > parentDivHeight) {
        top = 0;
    }

    return [left, top];
}

function alignAllNotes() {
    let data = window.localStorage;
    let top = 0;
    let left = 0;

    if (Object.keys(data).length !== 0) {
        Object.keys(data).forEach(key => {
            if (key.startsWith('sveopc-')) {
                locations = decideLocations(key, left, top);
                left = locations[0];
                top = locations[1];
            }
        });
    }
}

function changeOpacity(e) {
    let opacityValue = parseInt(e.target.value) / 10;
    document.getElementsByClassName('bgDiv')[0].style.opacity = opacityValue;    
    window.localStorage.setItem('opacValue', opacityValue);
}

function registerEvents() {
    let trackClick = 1;

    document.getElementsByClassName('search-icon')[0].addEventListener('click', animateSearch);
    document.getElementsByClassName('search-close')[0].addEventListener('click', closeSearchBar);
    document.getElementsByClassName('bg-file-select')[0].addEventListener('change', selectImage);
    document.getElementsByClassName('delete-background')[0].addEventListener('click', deleteBackground);
    document.getElementById('main-ext-opac').addEventListener('change', changeOpacity);
    function selectSpan(e) {
        if (e.target.classList.value.includes('analog')) {
            storeInsideBrowserStorage("isAnalog", true);
            startClock(window.localStorage.getItem("isAnalog") === "false" ? false : true);
        } else if (e.target.classList.value.includes('notes')) {
            createNewNote();
        } else if (e.target.classList.value.includes('all-del')) {
            deleteAll();
        } else if (e.target.classList.value.includes('quick-click')) {
            document.getElementsByClassName('quick-click-ext')[0].style.visibility = 'visible';
            document.getElementById('quick-link').value = '';
        } else if (e.target.classList.value.includes('align-all')) {
            alignAllNotes();
        } else {
            storeInsideBrowserStorage("isAnalog", false);
            startClock(window.localStorage.getItem("isAnalog") === "false" ? false : true);
        }
        toggleSettings();
    }

    function toggleSettings(e) {
        let popUpEle = document.getElementById('pop-up-settings');
        if (trackClick % 2 !== 0) {
            popUpEle.style.visibility = 'visible';
            popUpEle.style.opacity = 1;
        } else {
            popUpEle.style.visibility = 'hidden';
            popUpEle.style.opacity = 0;
        }
        ++trackClick;
    }

    function saveInfoModalWindow() {
        toggleOverlay(false);
        let name = document.getElementById('welcome-name').value;
        let gender;

        document.getElementsByName('gender').forEach(ele => {
            if (ele.checked) {
                gender = ele.value;
            }
        });
        let checkArr = [undefined, "", null];
        if (checkArr.includes(name) || checkArr.includes(gender)) {
            alert(' Missing Information ! ');
        } else {
            document.getElementById('info-div').style.visibility = 'hidden';
            storeInsideBrowserStorage(storageKeys[1], name);
            storeInsideBrowserStorage(storageKeys[2], gender);
            updateDisplayName();
        }
    }

    document.querySelectorAll('.select-span').forEach(ele => {
        ele.addEventListener('click', selectSpan);
    });

    let settEle = document.getElementsByClassName('settings-icon');
    let saveEle = document.getElementsByClassName('save-btn');
    settEle[0].addEventListener('click', toggleSettings);
    saveEle[0].addEventListener('click', saveInfoModalWindow);
}

function fetchBingImage() {
    let bingImageURL = "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1";
    fetch(bingImageURL).then(function (response) {
        response.json().then(function (data) {
            document.getElementById('bing-uri-id').style.visibility = 'visible';
            document.getElementsByClassName('bgDiv')[0].style.backgroundImage = "url(https://www.bing.com" + `${data.images[0].url})`;
        });
    }).catch(function (err) {
        document.getElementById('bing-uri-id').style.visibility = 'hidden';
        console.error("Bing URI Failure");
        document.getElementsByClassName('bgDiv')[0].style.backgroundImage = `url(../appearance/images/fk_images/fall${Math.round(Math.random()*2 + 1)}.jpg)`;
    });
}

function decideBackground() {
    if (window.localStorage.userDefinedImage) {
        document.getElementsByClassName('bgDiv')[0].style.backgroundImage = `url(${window.localStorage.getItem('userDefinedImage')})`;
    } else {
        fetchBingImage();
    }
}

function locateClockElements() {

    let analogDiv = document.getElementsByClassName('analog-clock');
    let digitalDiv = document.getElementsByClassName('digital-clock');
    let parentDiv = document.getElementsByClassName('clock-class');

    let parentDivHeight = parentDiv[0].getBoundingClientRect().height;
    let parentDivWidth = parentDiv[0].getBoundingClientRect().width;

    let analogDivBBox = analogDiv[0].getBoundingClientRect();
    let digitalDivBBox = digitalDiv[0].getBoundingClientRect();

    analogDiv[0].style.left = Math.round(0.5 * (parentDivWidth - analogDivBBox.width)) + "px";
    digitalDiv[0].style.left = Math.round(0.5 * (parentDivWidth - digitalDivBBox.width)) + "px";

    document.getElementsByClassName('bgDiv')[0].style.width = window.innerWidth + "px";
    document.getElementsByClassName('bgDiv')[0].style.height = window.innerHeight + "px";

    let analogClockCenter = document.getElementsByClassName('clock-center');
    analogClockCenter[0].style.left = Math.round(0.5 * analogDivBBox.width) - Math.round(0.5 * analogClockCenter[0].getBoundingClientRect().width) + "px";
    analogClockCenter[0].style.top = Math.round(0.5 * analogDivBBox.height) - Math.round(0.5 * analogClockCenter[0].getBoundingClientRect().height) + "px";

    // let handsTopShift = 1;

    // let hrHand = document.getElementsByClassName('hr-hand');
    // hrHand[0].style.left = Math.round(0.5 * analogDivBBox.width) - hrHand[0].getBoundingClientRect().width + "px";
    // hrHand[0].style.top = Math.round(0.5 * analogDivBBox.height) - hrHand[0].getBoundingClientRect().height + handsTopShift + "px";

    // let minHand = document.getElementsByClassName('min-hand');
    // minHand[0].style.left = Math.round(0.5 * analogDivBBox.width) - minHand[0].getBoundingClientRect().width + "px";
    // minHand[0].style.top = Math.round(0.5 * analogDivBBox.height) - minHand[0].getBoundingClientRect().height + handsTopShift + "px";

    // let secHand = document.getElementsByClassName('sec-hand');
    // secHand[0].style.left = Math.round(0.5 * analogDivBBox.width) - secHand[0].getBoundingClientRect().width + "px";
    // secHand[0].style.top = Math.round(0.5 * analogDivBBox.height) - secHand[0].getBoundingClientRect().height + handsTopShift + "px";

}

function locateInfoDiv() {
    let infoDivEle = document.getElementById('info-div');
    infoDivEle.style.left = Math.round(0.5 * (window.innerWidth - infoDivEle.getBoundingClientRect().width)) + 'px';
    infoDivEle.style.top = Math.round(0.5 * (window.innerHeight - infoDivEle.getBoundingClientRect().height)) + 'px';
}

function fillLocationPopUp(fill, position) {
    if (fill) {
        let latitude = Number(position.coords.latitude).toFixed(5);
        let longitude = Number(position.coords.longitude).toFixed(5);
        mapURI = `http://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=12`;
        document.getElementById('lat-id').innerHTML = latitude + "&#176;";
        document.getElementById('long-id').innerHTML = longitude + "&#176;";
        document.getElementsByClassName('off-message')[0].style.display = 'none';
        document.getElementsByClassName('location-div')[0].style.display = 'block';
        document.getElementsByClassName('map-div')[0].style.display = 'block';
        document.getElementsByClassName('map-div')[0].src = mapURI;
        document.getElementsByClassName('new-tab-png')[0].style.visibility = 'visible';
        document.getElementsByClassName('new-tab-png')[0].addEventListener('click', () => {
            window.open(mapURI, '_blank');
        });
    } else {
        document.getElementsByClassName('map-div')[0].style.display = 'none';
        document.getElementsByClassName('location-div')[0].style.display = 'none';
        document.getElementsByClassName('off-message')[0].style.display = 'block';
        document.getElementsByClassName('new-tab-png')[0].style.visibility = 'hidden';
    }
}

function getDate() {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let date = new Date().toLocaleDateString();
    let day = days[new Date().getDay()];

    document.getElementsByClassName('day-date-ext')[0].innerHTML = day + '<br>' + date;
}

function loadNavigator() {
    var geoOptions = {
        timeout: 10 * 1000
    };
    var geoSuccess = function (position) {
        fillLocationPopUp(true, position);
    };
    var geoError = function (error) {
        fillLocationPopUp(false, undefined);
        alert(error.message);
        console.log('Error occurred. Error code: ' + error);
    };

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
}

function setCountry() {
    let splittedArray = new Date().toString().split("(")[1].split(' Standard ')[0];
    let counEle = document.getElementById('country-name');
    let locName = splittedArray.replaceAll(/\(|\)/g, "");
    counEle.innerText = locName;
    counEle.title = locName;
}

function retrieveNotesAndLinks() {
    let data = window.localStorage;
    if (Object.keys(data).length !== 0) {
        Object.keys(data).forEach(key => {
            if (key.startsWith('sveopc-')) {
                createNewNote(key, data[key]);
            } else if (key.startsWith('extsveopql-')) {
                let linkJSON = JSON.parse(data[key]);
                addLinkToBlock(linkTemplate(linkJSON.image, linkJSON.link, key));
            } else if (key === 'opacValue') {
                document.getElementsByClassName('bgDiv')[0].style.opacity = parseFloat(data[key]);
                document.getElementById('main-ext-opac').value = parseFloat(data[key]) * 10;
            }
        });
    }
}

function retrievePersonalInfo() {
    if (!window.localStorage.isAnalog) {
        storeInsideBrowserStorage("isAnalog", false);
    }
    if (!(window.localStorage[storageKeys[1]] && window.localStorage[storageKeys[2]])) {
        document.getElementById('info-div').style.visibility = 'visible';
        toggleOverlay(true);
    } else {
        document.getElementById('info-div').style.visibility = 'hidden';
        updateDisplayName();
    }
}

function registerHangingEvent() {

    function toggleHangingDiv(e) {
        if (e.target.id === 'mini') {
            document.getElementsByClassName('hanging-div')[0].style.visibility = 'hidden';
            document.getElementsByClassName('hanging-div')[0].style.opacity = 0;
            document.getElementById('maxi').style.visibility = 'visible';
            document.getElementsByClassName('map-div')[0].src = "";
        } else {
            document.getElementsByClassName('hanging-div')[0].style.opacity = 1;
            document.getElementsByClassName('hanging-div')[0].style.visibility = 'visible';
            document.getElementById('maxi').style.visibility = 'hidden';
            document.getElementsByClassName('map-div')[0].src = mapURI;
        }
    }

    document.querySelectorAll('.hanging-icon').forEach(ele => {
        ele.addEventListener('click', toggleHangingDiv);
    });
}


/********************************
 *  QUICK CLICK IMPLEMENTATION
 *******************************/

let linkPrefixTag = `extsveopql-`;

function linkTemplate(srcValue, link, qkId) {
    let linkBlock = document.createElement('div');
    linkBlock.className = 'individual-link';
    linkBlock.id = qkId;

    let imgDiv = document.createElement('img');
    imgDiv.className = 'subIcon-class';
    imgDiv.src = srcValue;
    imgDiv.title = link;

    let aTag = document.createElement('a');
    aTag.target = '_blank';
    aTag.href = link;
    aTag.rel = 'noopener noreferrer';

    let deleteImg = document.createElement('img');
    deleteImg.className = 'delete-quick-link';
    deleteImg.src = '../appearance/images/icons/delete.png';
    deleteImg.title = ' Delete the Quick Link ';

    imgDiv.addEventListener('click', () => {aTag.click();});
    deleteImg.addEventListener('click', (e) => {
        window.localStorage.removeItem(e.target.parentElement.id);
        e.target.parentElement.remove();
    });
    linkBlock.appendChild(imgDiv);
    linkBlock.appendChild(aTag);
    linkBlock.appendChild(deleteImg);

    return linkBlock;
}

function addLinkToBlock(child) {
    document.getElementsByClassName('icons-div-qk')[0].appendChild(child);
}

function saveInfoQuickLink() {
    let uri = document.getElementById('quick-link').value;
    let numberOfQuickLinks = new Date().getTime();
    if (uri.startsWith("https") || uri.startsWith("http") || uri.startsWith("ftp") || uri.startsWith("wss")) {
        quickInfoJSON.link = uri;
        addLinkToBlock(linkTemplate(quickInfoJSON.image, quickInfoJSON.link, linkPrefixTag + numberOfQuickLinks));
        window.localStorage.setItem(linkPrefixTag + numberOfQuickLinks, JSON.stringify(quickInfoJSON));
        document.getElementsByClassName('quick-click-ext')[0].style.visibility = 'hidden';
        ++numberOfQuickLinks;
    } else {
        alert('Enter Valid URI');
    }
}

function showLinks(e) {
    if (e.type === 'mouseenter' && document.getElementsByClassName('icons-div-qk')[0].children.length !== 0) {
        document.getElementsByClassName('list-qk-links')[0].style.visibility = 'visible';
        document.getElementsByClassName('list-qk-links')[0].style.height = '200px';
        document.getElementsByClassName('list-quick-clicks')[0].title = ' QuickLinks are available now ! ';

    } else {
        document.getElementsByClassName('list-qk-links')[0].style.visibility = 'hidden';
        document.getElementsByClassName('list-qk-links')[0].style.height = '0px';
        document.getElementsByClassName('icons-div-qk')[0].style.display = 'none';
        document.getElementsByClassName('list-quick-clicks')[0].title = 'No Quick Links are configured on your browser.';
    }
}

function displayInnerLinks(e) {
    if (document.getElementsByClassName('icons-div-qk')[0].children.length !== 0) {
        document.getElementsByClassName('list-quick-clicks')[0].title = ' QuickLinks are available now ! ';
        document.getElementsByClassName('icons-div-qk')[0].style.display = 'block';
        document.getElementsByClassName('list-qk-links')[0].style.visibility = 'visible';
        document.getElementsByClassName('list-qk-links')[0].style.height = '200px';
    }
}

function locateQuickLinksDiv() {
    let quickEle = document.getElementsByClassName('quick-click-ext')[0];
    let quickBBox = quickEle.getBoundingClientRect();
    quickEle.style.left = 0.5 * (window.innerWidth - quickBBox.width) + "px";
    quickEle.style.top = 0.4 * (window.innerHeight - quickBBox.height) + "px";
}


function initialiseQuickClicks()  {
    locateQuickLinksDiv();
    document.getElementById('quick-icon').addEventListener('change', selectImage);
    document.getElementById('quick-button').addEventListener('click', saveInfoQuickLink);
    document.getElementsByClassName('list-quick-clicks')[0].addEventListener('mouseenter', showLinks);
    document.getElementsByClassName('list-quick-clicks')[0].addEventListener('mouseleave', showLinks);
    document.getElementsByClassName('list-quick-clicks')[0].addEventListener('transitionend', displayInnerLinks);
    document.getElementsByClassName('list-qk-links')[0].addEventListener('mouseleave', showLinks);
    document.getElementsByClassName('list-qk-links')[0].addEventListener('mouseenter', displayInnerLinks);
}


/**************************
 *       ENDS HERE 
 ************************** */

function main() {

    setCountry();
    locateClockElements();
    initialiseQuickClicks();

    decideBackground();
    retrieveNotesAndLinks();
    alignAllNotes();

    getDate();
    loadNavigator();
    locateInfoDiv();

    window.onresize = () => {
        locateClockElements();
        alignAllNotes();
        locateQuickLinksDiv();
    };

    registerEvents();
    registerHangingEvent();
    retrievePersonalInfo();

    startClock(window.localStorage.getItem("isAnalog") === "false" ? false : true);
}

/// Main Program Starts Here ///

if (document.body.id === "ext-clock-angDASDdas4das4d8") {
    main();
}
