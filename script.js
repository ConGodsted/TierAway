/*
    Tier Away is a website that helps users create unique tier lists. No accounts, no hassle.
    Copyright (C) 2022 Con Godsted
*/
//declare global variables
let zipArray = [];
let uploadID = 0;
let tempID;
let posX;
let posY;

//declare settings global variables
let enableURL = localStorage.enableURL
if (localStorage.enableURL != "true") {
    enableURL = "false";
}
//declare settings global variables
let enableAnimations = localStorage.enableAnimations
if (localStorage.enableAnimations != "false") {
    enableAnimations = "true";
}


//begin luke's fancy tier list class
class TierList{
    constructor(){
        this.tiers = [];
        this.counter = 0;
    }
    //creates a new tier
    addTier(tier){
        tier.id = this.counter;
        this.counter++;
        this.tiers.push(tier);
        document.querySelector("tbody").innerHTML += tier.render();
        addListeners()
        closeMenu("plus")
    }
    //re-renders the tier list when tier order changes
    render() {
        document.querySelector("tbody").innerHTML = ""
        let i = 0
        tierList.tiers.forEach(function(tier) {
            tier.id = i
            document.querySelector("tbody").innerHTML += tierList.tiers[i].render()
            i++;
        })
    }
    removeTierByID(tierID){
        let q;
        for(q = 0;q<this.tiers.length;q++){
            if(this.tiers[q].id == tierID){
                break;
            }
        }
        document.getElementById(tierID).remove();
        this.tiers.splice(q,1);
    }
}

//begin luke's fancy tier class
class Tier{
    constructor(color,suffix){
        this.id = null;
        this.color = color;
        this.suffix = suffix;
        this.content = "";
    }
    render(){
        return `<tr id="${this.id}">
        <th contenteditable style="background-color: ${this.color};" class="tier${this.suffix} tierheader">${this.suffix.toUpperCase()}</td>
        <td id="content-${this.id}" class="tiers">${this.content}</td>
        <td data-html2canvas-ignore class="tiersettings">
            <div>
            <div id="tier-move">
                <button class="fa fa-chevron-up fa-2x" onclick="moveTierUp(${this.id})"></button>
                <button class="del-tier fa fa-times fa-2x" onclick="tierList.removeTierByID(${this.id})">
            </button>
                <button class="fa fa-chevron-down fa-2x" onclick="moveTierDown(${this.id})"></button>
            </div>
            </div>
        </td></tr>`;
    }
}

let tierList = new TierList();

//the default tiers, s-f
tierList.addTier(new Tier("#e53e3e","s"));
tierList.addTier(new Tier("#e8532a","a"));
tierList.addTier(new Tier("#cba000","b"));
tierList.addTier(new Tier("#86d300","c"));
tierList.addTier(new Tier("#32bc53","d"));
tierList.addTier(new Tier("#009376","f"));
//add new tier
function addTier() {
    tierName = document.getElementById("add-tier").value;
    tierColour = document.getElementById("add-tier-colour").value;
    //Modify rendered HTML
    tierList.addTier(new Tier(tierColour,tierName));
}
//read image from file upload

//The images created exist initially as elements local to the DOM
//They could be re-represented once dragged into a tier
//UNTIL THEN update the DOM API for tiers with a string "children"
function imageRead(imageToRead) {
    if (document.getElementById("upload-images-info").style.display != "none") {
        document.getElementById("upload-images-info").style.display = "none"   
    }
    if (document.getElementById("trash") == null) {
        document.getElementById("image-options").innerHTML += `<div id="trash"><i class="fa fa-trash-o   fa-4x" aria-hidden="true"></i></div>`
    }
    closeMenu("plus");
    //check if it was triggered by the file upload
    if (imageToRead == "file") {
        let fileLength = document.getElementById(`fileselect`).files.length;
        for (let f = 0;f < fileLength;f++) {
            //add the image to the exportable zip
            zipArray.push({"id":uploadID, "file":document.getElementById(`fileselect`).files[f]})
            //create a blob link for the image
            imageToRead = URL.createObjectURL(document.getElementById(`fileselect`).files[f]);
            //turn the image into a draggable div
            document.querySelector("#image-options").innerHTML += `
            <div id="img-${uploadID}" draggable="true" class="potential-drag" style="background-image: url(${imageToRead});" ></div>`;
            uploadID += 1;
        }
    }
    //check if its a url that needs to be parsed
    else if (imageToRead == "url") {
        imageToRead = document.getElementById('urlselect').value
        //turn the image into a draggable div
        document.querySelector("#image-options").innerHTML += `
        <div id="img-${uploadID}" draggable="true" class="potential-drag" style="background-image: url(${imageToRead});" ></div>`;
        uploadID += 1;
    }
    ///triggered by copy paste
    else {
        //add the image to the exportable zip
        zipArray.push({"id":uploadID, "file":imageToRead})
        //create a blob link for the image
        imageToRead = URL.createObjectURL(imageToRead);
        //turn the image into a draggable div
        document.querySelector("#image-options").innerHTML += `
        <div id="img-${uploadID}" draggable="true" class="potential-drag" style="background-image: url(${imageToRead});" ></div>`;
        uploadID += 1;
    
    }
    
    addListeners()
}

//creates a draggable text element
function addText() {
    if (document.getElementById("upload-images-info").style.display != "none") {
        document.getElementById("upload-images-info").style.display = "none"   
    }
    let text = document.getElementById("text-select").value
    document.querySelector("#image-options").innerHTML += `
            <div id="img-${uploadID}" draggable="true" class="potential-drag" >${text}</div>`;
    
    addListeners()
    if (document.getElementById("keep-alive-text").checked == false) {
        closeMenu("plus")
    }
    
    
}
//adds the necessary event listeners for the Drag
function addListeners() {
    //find all draggable elements
    let items = document.querySelectorAll('.potential-drag');
    items.forEach(function(item) {
        item.addEventListener('dragstart', startDrag);
        item.addEventListener('dragend', endDrag);
        item.addEventListener('touchstart', startDrag);
        item.addEventListener('touchend', endTouch);
    });
}
//starts the drag process by setting an id on the element being dragged
function startDrag() {
    tempID = this.id;
    this.id = 'dragged';
}
//ends drag - drag and drop api
function endDrag(e) {
    //find the mouse
    posX = e.clientX;
    posY = e.clientY;
    moveElement()
    
}
//ends drag - touch api
function endTouch(e) {
    //find the touch
    posX = e.changedTouches[0].clientX
    posY = e.changedTouches[0].clientY
    moveElement()
}

//ends the drag process, deletes the old element, and creates a new one
function moveElement() {
//check what the mouse is hovering over
let position = document.elementsFromPoint(posX, posY)
position.forEach(function(element) {
    if (element.tagName == "TD" && element.className != "tiersettings") { //find a part of the table to insert
        //If its a TD, we know it has a TR above it
        //copy a representation of the element
        let content = document.getElementById("dragged").outerHTML
        //remove the old id
        content = content.slice(content.search("draggable"))
        //add the new id
        content = `<div id=${tempID} ${content}`
        //add it to the array
        element.innerHTML += content
        //update the tier list array
        let i = 0
        tierList.tiers.forEach(function() {
            tierList.tiers[i].content = document.getElementById(`content-${i}`).innerHTML
            i++
        })
        //remove the successfully dragged element
        document.getElementById("dragged").remove();

    } else if (element.id == "trash") {
        //find element id to be removed
        let trashID = tempID.split("-")[1];
        let i = 0;
        zipArray.forEach(function(element) {
            //match up element id with array id
            if (element.id == trashID) {
                zipArray.splice(i, 1)
            }
            i++
        })
        document.getElementById("dragged").remove();
    }
});
    //if an element is dragged to the wrong place it may stay dragged/transculent
    if (document.getElementById('dragged')) {
        document.getElementById("dragged").id = tempID;
    }
    //moved elements lose their event listeners after being dragged
    addListeners()
}

function addSelection(select) {
    if (select == "upload") {
        //Add Image from Upload
        document.getElementById("plus").innerHTML =
        `<div id="addimagediv">
            <label class="menu-header">Add Image from File Upload</label>
            <input multiple onchange="imageRead('file')" type="file" accept="image/*" id="fileselect" class="input-upload">
        </div>`;
        //Add Image from URL
    } else if (select == "url") {
        document.getElementById("plus").innerHTML =
        `<div id="addurldiv">
            <label class="menu-header">Add Image from URL</label>
            <div id="url-upload"><input type="url" placeholder="http://example.com/" id="urlselect" class="main-text button-border">
            <button onclick="imageRead('url')" class="button" id="addtierbutton">Add Image</button></div>
        </div>`;
        //Add Image from Clipboard
    } else if (select == "clip") {
        document.getElementById("plus").innerHTML =
        `<div id="addurldiv">
            <label class="menu-header">Add Image from Clipboard</label>
            <p>Paste (ctrl-v/cmd-v) to upload image.</p>
            </div>`;
        //Add Text to Tier List
    } else if (select == "text") {
        document.getElementById("plus").innerHTML =
        `<div id="addtextdiv">
            <p>Add Text to Tier List</p>
            <div id="text-add">
                <input type="text" placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." class="main-text button-border" id="text-select">
                <button onclick="addText()" class="button" id="add-text-button">Add Text</button>
                
                
            </div>
            <label><input type="checkbox" id="keep-alive-text">Keep Alive (use for multiple text elements)</label>
        </div>`;
        //Add New Tier
    } else if (select == "newtier") {
        document.getElementById("plus").innerHTML =
        `<div id="addtierdiv">
            <label class="menu-header">Add New Tier</label>
            <div id="add-tier-content">
                <input type="text" class="button-border main-text" placeholder="S Tier" id="add-tier">
                <input type="color" value="#780063" class="button-border" id="add-tier-colour">
                <button onclick="addTier()" class="button" id="add-tier-button">Add Tier</button>
            </div>
        </div>`;
    }
    else if (select = "import") {
        document.getElementById("plus").innerHTML =
        `<div id="addimagediv">
            <label class="menu-header">Import Tier List Template</label>
            <input onchange="importTiers()" type="file" accept=".zip" id="import-fileselect" class="input-upload">
        </div>`;
    } else {
        document.getElementById.innerHTML = select;
    }

}

//opens the specified menu
function openMenu(menu) {
    document.getElementById(menu).className = "visible-drop";
    if (enableAnimations == "true") {
        document.getElementById(menu).style.opacity = 0;
        let opacity = parseFloat(document.getElementById(menu).style.opacity)
        setInterval(function(){
            if (opacity <= 1) {
                opacity += 1
                document.getElementById(menu).style.opacity = opacity
            }
        }, 15)
    }
    else {
        document.getElementById(menu).style.opacity = 1;
    }
    
    
    if (menu == "plus") {
        document.getElementById("plus").innerHTML = `
        <h2 class="left-header">
            <i class="fa fa-plus" aria-hidden="true"></i>
            Add to Tier List
        </h2>
        <div id="button-panel">
            <button class="menu-button button" onclick="addSelection('upload')">
                <i class="fa fa-file-image-o fa-2x" aria-hidden="true"></i>
                <p>Add Image from Upload</p>
            </button>
            <button class="menu-button button" onclick="addSelection('clip')">
                <i class="fa fa-clipboard fa-2x" aria-hidden="true"></i>
                <p>Add Image from Clipboard</p>
            </button>
            <button class="menu-button button" onclick="addSelection('text')">
                <i class="fa fa-file-text fa-2x" aria-hidden="true"></i>
                <p>Add Text to Tier List</p>
            </button>
            <button class="menu-button button" onclick="addSelection('newtier')">
                <i class="fa fa-plus fa-2x" aria-hidden="true"></i>
                <p>Add New Tier</p>
            </button>
            <button class="menu-button button" onclick="addSelection('import')">
                <i class="fa fa-upload fa-2x" aria-hidden="true"></i>
                <p>Import Tier List Template</p>
            </button>
        </div`;
        if (enableURL == "true") {
            document.getElementById("button-panel").innerHTML += 
            `<button class="menu-button button" onclick="addSelection('url')">
                <i class="fa fa-external-link fa-2x" aria-hidden="true"></i>
                <p>Add Image from URL (legacy)</p>
            </button>`
        }
        document.querySelector("body").addEventListener('click', checkPlus);
    }
    else if (menu == "settings") {
        document.querySelector("body").addEventListener('click', checkSettings);
    }
    else if (menu == "export") {
        let url;
        document.getElementById("export").innerHTML = `
                <h2 class="left-header">
                    <i class="fa fa-share-alt" aria-hidden="true"></i>
                    Download and Share Tier List
                </h2>
                <div id="export-image"></div>
                <div id="export-buttons">
                    <a class="button" href="${url}" download="tierlist.png">
                        <i class="fa fa-download" aria-hidden="true"></i>
                        Download/Share Image
                    </a>
                    <button class="button" onclick="exportTiers()">
                        <i class="fa fa-download" aria-hidden="true"></i>
                        Export Template
                    </button>
                </div>`
        html2canvas(document.querySelector("#tierlist"), {
            scale: 2
        }).then(canvas => {
            canvas.toBlob(function(blob) {
                url = URL.createObjectURL(blob)
                document.getElementById("export-image").innerHTML = `<img src=${url}></img>`
            })
        document.querySelector("body").addEventListener('click', checkExport);
        
        });
    }
    
}


//closes the specified menu
function closeMenu(menu) {
    if (enableAnimations == "true") {
        let opacity = parseFloat(document.getElementById(menu).style.opacity)
        setInterval(function(){
            if (opacity >= -5) {
                opacity -= 1
                document.getElementById(menu).style.opacity = opacity;
                if (opacity <= -5) {
                    document.getElementById(menu).className = "hidden";
                }
            }
          }, 15)
    }
    else {
        document.getElementById(menu).style.opacity = 0;
        document.getElementById(menu).className = "hidden";
    }
    
}

//checks if the menu should be closed
function checkPlus() {
    //check if user is hovering over the dropdown, or the plus button. closes if not.
    if (document.querySelector("#plus.visible-drop:hover") == null && document.querySelector("#new:hover") == null) {
        closeMenu("plus")
    }
}


//closes the plus menu
function checkSettings() {
    //check if user is hovering over the dropdown, or the plus button. closes if not.
    if (document.querySelector("#settings.visible-drop:hover") == null && document.querySelector("#settings-button:hover") == null) {
        closeMenu("settings")
    }
}

//checks if the export menu should be closed
function checkExport() {
    //check if user is hovering over the dropdown, or the plus button. closes if not.
    if (document.querySelector("#export.visible-drop:hover") == null && document.querySelector("#export-button:hover") == null) {
        closeMenu("export") 
    };
}



//moves a tier up
function moveTierUp(tier) {
    if (tier != 0) {
        //backup the tier that's being replaced
        let backup = tierList.tiers[tier-1]
        //move the tier
        tierList.tiers.copyWithin(tier-1, tier, tier+1);
        //replace the tier that's been copied by the backup tier
        tierList.tiers[tier] = backup;
        //renders the new list
        tierList.render()
        addListeners()
    }
    
}
//moves a tier down
function moveTierDown(tier) {
    if (tier != tierList.tiers.length-1) {
        //backup the tier that's being replaced
        let backup = tierList.tiers[tier+1]
        //move the tier
        tierList.tiers.copyWithin(tier+1, tier, tier+1);
        //replace the tier that's been copied by the backup tier
        tierList.tiers[tier] = backup;
        //renders the new list
        tierList.render()
        addListeners()
    }
}

async function exportTiers() {
    //tier list title
    let tierTitle = document.getElementById("list-header").outerText
    let exportString = `${tierTitle}§`
    //tier list length
    exportString += tierList.tiers.length
    //tier list color code and suffix
    tierList.tiers.forEach(function(tier) {
        exportString += `${tier.color}§${tier.suffix}§`
    })
    //generate table file
    let fileData = new Blob([exportString], {type: 'text/plain'});
    
    //generate zip with jszip
    zip.file("tiers.txt", fileData)
    //images
    let f = 0;
    zipArray.forEach(function() {
        zip.file(zipArray[f].file.name, zipArray[f].file)
        f++
    })
    //create file
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js
        saveAs(content, `${tierTitle}.zip`);
    });
}
async function importTiers() {
    let importedfile = document.getElementById("import-fileselect").files[0];
    zip.loadAsync(importedfile).then(function (zip) {
        //read tiers.txt
        return zip.file("tiers.txt").async("text");
      }).then(function (input) {
        //clear the default tiers
        tierList.tiers = [];
        //find the name
        document.getElementById("list-header").textContent = input.slice(0, input.search("§"))
        //find the number of tiers
        let numberOfTiers = input.charAt(input.search("§")+1)
        input = input.slice(input.search("§")+2)
        for (let runningTiers = 0; runningTiers < numberOfTiers; runningTiers++) {
            // Runs however many times is specified in input tiers
            //import tier colour
            let endColour = input.search("§")
            let tierImportColour = input.slice(0, endColour)
            input = input.slice(endColour+1)
            //import tier suffix
            let endSuffix = input.search("§")
            let tierImportSuffix = input.slice(0, endSuffix)
            input = input.slice(endSuffix+1)
            //add the tier
            tierList.addTier(new Tier(tierImportColour, tierImportSuffix));
            console.log(tierImportColour, tierImportSuffix)
        
        }
        //re-render the tier list
        tierList.render()
        console.log(zip.files)
        //import uploaded images
        zip.forEach(async function(file) {
            if (document.getElementById("upload-images-info").style.display != "none") {
                document.getElementById("upload-images-info").style.display = "none"   
            }
            if (document.getElementById("trash") == null) {
                document.getElementById("image-options").innerHTML += `<div id="trash"><i class="fa fa-trash-o fa-4x" aria-hidden="true"></i></div>`
            }
            if (file.search(".txt") == -1) {
                
                let file2 = await zip.file(file).async("blob")
                //console.log(file2)
                imageToRead = URL.createObjectURL(file2);
                document.querySelector("#image-options").innerHTML += `
                <div id="img-${uploadID}" draggable="true" class="potential-drag" style="background-image: url(${imageToRead});" ></div>`;
            }
            
        })
    });
    
}
let setHeight = document.body.offsetHeight
window.onscroll = function() {
    if ((window.innerHeight + Math.ceil(window.scrollY)-60) >= setHeight) {
        document.getElementById("image-options").style.position = "static"
    }
    else {
        document.getElementById("image-options").style.position = "fixed"
    }
}
//keyboard accessible tier list creation
window.onkeydown= function(key){
    
    //esc key - close plus or export menu
    if (key.keyCode == 27){
        closeMenu("plus")
        closeMenu("export")
        closeMenu("settings")
    }
    //+ key - open plus mini-menu
    else if (key.keyCode == 61){
        openMenu("plus")
    };
};
var zip;
//
window.addEventListener("load", function(){
    zip = new JSZip();
    if (localStorage.theme == "light") {
        changeTheme()
    }
});
  
//change theme from dark to light
function changeTheme() {
    if (document.getElementById("theme-style").className == "dark-mode") {
        document.getElementById("theme-style").remove()
        document.querySelector("head").innerHTML += `<link class="light-mode" id="theme-style" rel="stylesheet" href="css/light.css">`
        document.getElementById("change-theme-button").className = "fa fa-moon-o main-text"
        localStorage.theme = "light"
    }
    else {
        document.getElementById("theme-style").remove()
        document.querySelector("head").innerHTML += `<link class="dark-mode" id="theme-style" rel="stylesheet" href="css/dark.css">`
        document.getElementById("change-theme-button").className = "fa fa-sun-o main-text"
        localStorage.theme = "dark"
    }
}

function changeSetting(setting) {
    if (setting == "url" && enableURL == "false") {
        enableURL = "true"
        localStorage.enableURL = "true"
        document.getElementById("url-images-toggle").innerHTML = `<i class="fa fa-times" aria-hidden="true"></i> Disable URL Images`
    }
    else if (setting == "url" && enableURL == "true") {
        enableURL = "false"
        localStorage.enableURL = "false"
        document.getElementById("url-images-toggle").innerHTML = `<i class="fa fa-check" aria-hidden="true"></i> Enable URL Images`
    }
    else if (setting == "animations" && enableAnimations == "false") {
        enableAnimations = "true"
        localStorage.enableAnimations = "true"
        document.getElementById("animations-toggle").innerHTML = `<i class="fa fa-times" aria-hidden="true"></i> Disable Animations`
    }
    else if (setting == "animations" && enableAnimations == "true") {
        enableAnimations = "false"
        localStorage.enableAnimations = "false"
        document.getElementById("animations-toggle").innerHTML = `<i class="fa fa-check" aria-hidden="true"></i> Enable Animations`
    }
}


document.onpaste = function(event) {
    //read all items from clipboard
    let items = event.clipboardData.items;
    //check items for image data
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") == 0) {
        //upload the image into menu function
        imageRead(items[i].getAsFile())
      }
    }
  }