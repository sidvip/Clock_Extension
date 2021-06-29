let targetParentId;

function deleteNoteCompletely(key) {
    window.localStorage.removeItem(key);
    document.getElementById('notes-main-div').removeChild(document.getElementById(key));
}

function removeNote(e) {
    let parentId = e.target.parentElement.id;
    deleteNoteCompletely(parentId);
    alignAllNotes();
}

function insideViewPort(x, y, target) {
    let adjustPad = 25;
    let viewPortEle = document.getElementById('notes-main-div');
    let viewPortBBox = viewPortEle.getBoundingClientRect();
    let nx, ny;

    if (x > viewPortBBox.right) {
        nx = viewPortBBox.right - target.getBoundingClientRect().width * 0.3;
        document.getElementById("notes-main-div").removeEventListener('mousemove', moveNoteOnWindow);
        document.getElementById('move-' + targetParentId.id).style.backgroundColor = 'orange';
        document.getElementById('move-' + targetParentId.id).innerText = 'Move';
    }
    if (y > viewPortBBox.bottom) {
        ny = viewPortBBox.bottom - 12;
        document.getElementById("notes-main-div").removeEventListener('mousemove', moveNoteOnWindow);
        document.getElementById('move-' + targetParentId.id).style.backgroundColor = 'orange';
        document.getElementById('move-' + targetParentId.id).innerText = 'Move';
    }

    targetParentId.style.left = (nx !== undefined ? nx : x) - viewPortBBox.left - adjustPad + 'px';
    targetParentId.style.top = (ny !== undefined ? ny : y) - viewPortBBox.top - adjustPad + "px";

}

function moveNoteOnWindow(ele) {
    let x = ele.clientX;
    let y = ele.clientY;
    insideViewPort(x, y, ele.target);
}

function moveNote(e) {
    targetParentId = e.target.parentElement;

    if (e.type === 'mousedown') {
        document.getElementById('move-' + targetParentId.id).style.backgroundColor = 'green';
        document.getElementById('move-' + targetParentId.id).innerText = 'Moving';
        document.getElementById("notes-main-div").addEventListener('mousemove', moveNoteOnWindow);
    } else {
        document.getElementById('move-' + targetParentId.id).style.backgroundColor = 'orange';
        document.getElementById('move-' + targetParentId.id).innerText = 'Move';
        document.getElementById("notes-main-div").removeEventListener('mousemove', moveNoteOnWindow);
    }
}

function saveNote(e) {
    let value = e.target.value;
    if (value !== undefined) {
        let dat = window.localStorage.getItem('e.target.parentElement.id');
        let newDat;
        if (dat) {
            newDat = dat[e.target.parentElement.id] + " " + value;
        } else {
            newDat = value;
        }
        storeInsideBrowserStorage(e.target.parentElement.id, `${newDat}`);
    }
}

function renderNoteTemplate(noteId) {
    let mainDiv = document.createElement('div');
    mainDiv.className = 'note-div';
    mainDiv.id = noteId;

    let button = document.createElement('button');
    button.className = 'move-note';
    button.id = "move-" + noteId;
    button.innerText = 'Move';

    let textArea = document.createElement('textarea');
    textArea.className = "notes-area";

    let closeDiv = document.createElement('div');
    closeDiv.className = "close-div";
    closeDiv.id = "close-" + noteId;
    closeDiv.innerHTML = "&#10005;";

    mainDiv.appendChild(button);
    mainDiv.appendChild(textArea);
    mainDiv.appendChild(closeDiv);
    return mainDiv;
    // return `
    // <div class="note-div" id=${noteId}>
    // <button class="move-note" id=${"move-" + noteId}>Move</button>
    // <textarea class="notes-area" tabIndex=${notesCount}></textarea>
    // <div class="close-div" id=${"close-" + noteId}>&#10005;</div>
    // </div>
    // `;
}

function fillDataInsideNote(nT, dt) {
    nT.children[1].innerHTML = dt;
}

function createNewNote(saveNoteId, data) {
    let notePrefix = 'sveopc-';
    let notesCount = new Date().getTime();
    let noteId = saveNoteId ? saveNoteId : notePrefix + notesCount;
    let noteTemplate = renderNoteTemplate(noteId);
    let parentDiv = document.getElementById('notes-main-div');
    parentDiv.appendChild(noteTemplate);
    if (data) {
        fillDataInsideNote(document.getElementById(noteId), data);
    }
    let taDiv = document.getElementById(noteId);
    let color = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
        '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
        '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
        '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
        '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
    ];
    let colorIndex = Math.round(Math.random() * (color.length - 1));
    document.querySelector('#' + noteId + ' .notes-area').style.backgroundColor = color[colorIndex];
    document.querySelector('#' + noteId + ' .notes-area').style.boxShadow = `2px 2px 3px 1px ` + 'black';

    let left = Math.random() * (parentDiv.getBoundingClientRect().width * 0.54) + parentDiv.getBoundingClientRect().left + 'px';
    let top = Math.random() * (parentDiv.getBoundingClientRect().height * 0.54) + parentDiv.getBoundingClientRect().top + 'px';
    taDiv.style.top = top;
    taDiv.style.left = left;
    document.querySelectorAll('.note-div').forEach(ee => {
        ee.children[0].addEventListener('mousedown', moveNote);
        ee.children[0].addEventListener('mouseup', moveNote);
        ee.children[1].addEventListener('keyup', saveNote);
        ee.children[2].addEventListener('click', removeNote);
    });

}