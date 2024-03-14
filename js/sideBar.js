
/* IE */
if (window.msCrypto) { document.location = "notsupported.html"; }

var sideNav = document.getElementById('sideNav');
var sideNavToggle = document.getElementById('sideNavToggle');
sideNavToggle.addEventListener('click', toggleDataList);

var preview = document.getElementById("preview");
var navOpen = false;
var mobileSideNav = false;
if (document.getElementById("btnExplore")) {
    document.getElementById("btnExplore").addEventListener("click", function () { openScene(getSceneID()); });
}

function openNav(object) {
    // console.log("openNav");
    if (!navOpen) {
        toggleDataList();
    }

    // console.log("OPEN NAV");
    INTERSECTED = null;
    document.getElementById("title").innerText = "object.name";
    document.getElementById("title").innerHTML = object.name;
    var img = document.createElement('img');

    img.src = "./tiles/_previews/" + getSceneID(object) + "/preview.jpg";
    //Clear img
    var child = preview.lastElementChild;
    while (child) {
        preview.removeChild(child);
        child = preview.lastElementChild;
    }
    preview.appendChild(img);
    document.getElementById("btnExplore").addEventListener("click", function () { openScene(getSceneID(object)); });

    var sideNavOverlay = document.querySelector('#sideNav');
    sideNavOverlay.addEventListener('mousemove', function (ev) {
        ev.preventDefault();
    })

    var x = window.matchMedia("(max-width: 600px)");
    windowSizeCheck(x);
    x.addListener(windowSizeCheck);

    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function windowSizeCheck(x) {
    // console.log("window check");
    if (x.matches) { //if we are bigger than 600
        document.getElementById("sideNav").classList.add("large");
        document.getElementById("sideNav").classList.remove("small");
        mobileSideNav = true;
    } else {
        document.getElementById("sideNav").classList.add("small");
        document.getElementById("sideNav").classList.remove("large");
        mobileSideNav = false;
    }
    document.getElementById("sideNav").classList.remove("collapsed");
    document.getElementById("sideNav").style.opacity = "100";
}

function closeNav() {
    navOpen = false;
    document.getElementById("sideNav").style.opacity = "0";
    document.getElementById("sideNav").classList.add("sideNavcollapsed");
    document.body.style.backgroundColor = "white";
    INTERSECTED = null;
    mobileSideNav = false;
}

function getSceneID(object = "default") {
    // console.log("obj name" + object.name);
    var hotspot = "0-entrance";
    switch (object.name) {
        case "Underground":
            hotspot = "16-portal";
            break;
        case "Mine Surface Infrastructure":
            hotspot = "7-mineoverview";
            break;
        case "Community":
            hotspot = "14-playground";
            break;
        case "Terrain001":
        default:
            break;
    }

    return hotspot;
}

function openScene(hotspot) {
    window.location = 'VirtualTour.html?sceneId=' + hotspot;
    // console.log("openscene");
}


function toggleDataList() {
    navOpen = sideNav.classList.toggle('enabled');
    sideNavToggle.classList.toggle('enabled');

    var sideNavOverlay = document.getElementById('sideNav');
    sideNavOverlay.addEventListener('mousemove', function (ev) {
        ev.preventDefault();
    })

    sideNavOverlay.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
    })

    var x = window.matchMedia("(max-width: 600px)");
    windowSizeCheck(x);
    x.addListener(windowSizeCheck);
}