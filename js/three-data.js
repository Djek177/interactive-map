import * as THREE from '../vendor/threejs/build/three.module.js';
import { OrbitControls } from '../vendor/threejs/jsm/controls/OrbitControls.js';
import { TrackballControls } from '../vendor/threejs/jsm/controls/TrackballControls.js';

import { FBXLoader } from '../vendor/threejs/jsm/loaders/FBXLoader.js';


var container, ui, stats, controls, previewControls;
var camera, previewCamera, scene, previewScene, renderer, previewRenderer, light;
var INTERSECTED;
var SELECTED;
var mixer;
var objHidden = false;

var mobileMouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();
var mouse = new THREE.Vector2();
var cameraTarget = new THREE.Vector2(0, -500, 0);

const datas = [];

var currentColor = hslcolor;

initScene();
initTerrain();
initData();
animate();

function initScene() {
    mobileMouse.x = 0;
    mobileMouse.y = 0;

    //Container
    container = document.getElementById('container');

    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(1700, 0, -1500);


    //Preview Container
    var previewContainer = document.getElementById("previewContainer");

    //PreviewRenderer
    previewRenderer = new THREE.WebGLRenderer({ canvas: previewContainer, antialias: true, alpha: true });
    previewRenderer.setPixelRatio(window.devicePixelRatio);

    var previewWindowSize = 420;
    var x = window.matchMedia("(max-width: 600px)");

    if (x.matches) { previewWindowSize = 150; }
    previewRenderer.setSize(previewWindowSize, previewWindowSize);
    previewRenderer.shadowMap.enabled = true;
    previewRenderer.domElement.setAttribute("id", "previewViewer");

    //previewCamera
    previewCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
    previewCamera.position.set(1700, 0, -1500);


    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 4000, 17000);
    scene.add(camera);

    previewScene = new THREE.Scene();
    previewScene.fog = new THREE.Fog(0xffffff, 4000, 17000);
    previewScene.add(previewCamera);

    // light
    light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    scene.add(light);


    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 100);
    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.left = -120;
    light.shadow.camera.right = 120;
    scene.add(light);


    //Renderer
    renderer = new THREE.WebGLRenderer({ canvas:container, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.domElement.setAttribute("id", "viewer");

    // controls
    controls = new OrbitControls(camera, renderer.domElement, false, false);
    controls.target.set(0, -500, 0);
    controls.update();
    scene.userData.controls = controls;

    // Preview controls
    previewControls = new TrackballControls(previewCamera, previewRenderer.domElement);
    /* previewControls.target.set(0, -500, 0);
    previewControls.rotateSpeed = 1.0;
    previewControls.zoomSpeed = 1.2;
    previewControls.panSpeed = 10; */

    previewControls.update();
    previewScene.userData.controls = controls;


    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousemove', onMouseMove, false);

    document.addEventListener('touchmove', onMouseMove, false);
    window.addEventListener('touchmove', onMouseMove, false);

    document.addEventListener('mousedown', function () { onMouseDown(INTERSECTED); }, false);
    document.addEventListener('touchstart', function () { onMouseDown(INTERSECTED); }, false);

    previewContainer.addEventListener('mouseover', function(){controls.enabled=false; console.log("over");});
    previewContainer.addEventListener('mouseleave', function(){controls.enabled=true;});


    window.addEventListener('resize', onWindowResize, false);
}

function alignCamera() {
    controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    controls.update();

    alignPreviewCamera(cameraTarget);

}

function updateDetails(object) {
    SELECTED = object;

    var dataDetails = document.getElementById("selectedDetails");
    dataDetails.innerHTML = "Selected: " + SELECTED.name;
}

function updateColor() {
    if (SELECTED != null) {
        if (hslcolor != SELECTED.material.color && currentColor != hslcolor) //only updates if useerr moves cursor
        {
            SELECTED.material.color.set(hslcolor);
            currentColor = hslcolor;
        }
    }
}



function initTerrain() {
    // model
    var loader = new FBXLoader();

    loader.load('models/fbx/TerrainData.FBX', function (object) {
        mixer = new THREE.AnimationMixer(object);
        object.name = "Terrain";
        object.traverse(function (child) {

            if (child.isMesh) {
                if (child.material != null) {
                    var mat = child.material;
                    mat.transparent = true;
                    mat.side = THREE.DoubleSide;
                    mat.opacity = 0.5;
                }

                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(object);

    }, undefined, function (e) {
        console.error(e);
    });
}

function initData() {
    var manager = new THREE.LoadingManager();

    manager.onStart = function (url, itemsLoaded, itemsTotal) { }
    manager.onLoad = function () {
        createDataList();

        console.log('Loading complete!');
    };

    loadData(manager, 'SOL_SS_BAE_180B_MAR13', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BAE_180B_MAR13.fbx', 0xb53636);
    loadData(manager, 'SOL_SS_BAE_180C_MAR13', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BAE_180C_MAR13.fbx', 0xcc7c7c);
    loadData(manager, 'SOL_SS_BAE_200A_JUL12', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BAE_200A_JUL12.fbx', 0xc98236);
    loadData(manager, 'SOL_SS_BAE_200B_DEC13', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BAE_200B_DEC13.fbx', 0xc9bd36);
    loadData(manager, 'SOL_SS_BAE_230_DEC13', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BAE_230_DEC13.fbx', 0x9fc936);
    loadData(manager, 'SOL_SS_BAE_240_DEC13', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BAE_240_DEC13.fbx', 0x4ac936);
    loadData(manager, 'SOL_SS_BME_APRIL_2017', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BME_APRIL_2017.fbx', 0x36c969);
    loadData(manager, 'SOL_SS_BMS_410', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BMS_410.fbx', 0x36c9b5);
    loadData(manager, 'SOL_SS_BQU_361', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_BQU_361.fbx', 0x3689c9);
    loadData(manager, 'SOL_SS_EF1_-60_JUN_2018', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_EF1_-60_JUN_2018.fbx', 0x363bc9);
    loadData(manager, 'SOL_SS_EF2_DEC__18', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_EF2_DEC__18.fbx', 0x6c36c9);
    loadData(manager, 'SOL_SS_MOB_510_JAN12', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_MOB_510_JAN12.fbx', 0xa436c9);
    loadData(manager, 'SOL_SS_MOB_C_STOPE', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_MOB_C_STOPE.fbx', 0xc936b5);
    loadData(manager, 'SOL_SS_MOB_D_STOPE', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_MOB_D_STOPE.fbx', 0xc9367f);
    loadData(manager, 'SOL_SS_NCM', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_NCM.fbx', 0x520707);
    loadData(manager, 'SOL_SS_NFI_350', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_NFI_350.fbx', 0x525007);
    loadData(manager, 'SOL_SS_S1N_DEC__2018', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_S1N_DEC__2018.fbx', 0x215207);
    loadData(manager, 'SOL_SS_SF3_140', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_SF3_140.fbx', 0x075224);
    loadData(manager, 'SOL_SS_SF3_170', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_SF3_170.fbx', 0x075252);
    loadData(manager, 'SOL_SS_WF2_240', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_WF2_240.fbx', 0x072e52);
    loadData(manager, 'SOL_SS_WF3_DEC__2018', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_WF3_DEC__2018.fbx', 0x140752);
    loadData(manager, 'SOL_SS_WF4_JUNE2016', 'models/fbx/Rosh_Pinah_Mining Voids_YE2019/SOL_SS_WF4_JUNE2016.fbx', 0x3d0752);

}

function loadData(manager, name, path, color) {
    var data = new THREE.Mesh();
    var loader = new FBXLoader(manager);
    var position = new THREE.Vector3(0, 0, 0);

    loader.load(path, function (object) {

        data = object;
        data.position.set(position.x, position.y, position.z);
        data.name = name;

        data.traverse(function (child) {
            if (child.isMesh) {
                const oldMat = child.material;
                child.material = new THREE.MeshStandardMaterial({
                    color: color,
                    side: THREE.DoubleSide,
                    shadowSide: THREE.FrontSide

                });
            }
        });
        scene.add(data);
        datas.push({ data });
    });
}


function createDataList() {
    let i = 0;
    let listElement = document.createElement('ul');
    let refElement = document.getElementById("footer");

    listElement.id = "dataList";
    listElement.className = "listElement";
    refElement.parentNode.insertBefore(listElement, refElement);

    datas.forEach((item) => {

        let itemContainer = document.createElement('div');
        let listItem = document.createElement('li');
        let toggleVisibilityBtn = document.createElement('button');
        let icon = document.createElement('i');
        let controlsContainer = document.createElement('div');

        icon.className = "dataIcon fa fa-eye-slash";

        itemContainer.className = "listItemContainer";
        listItem.className = "listItem";
        toggleVisibilityBtn.className = "toggleVisibilityBtn";
        controlsContainer.className = "controlsContainer";


        toggleVisibilityBtn.addEventListener('click', function () {
            if (objHidden) {
                objHidden = false;
                item.data.visible = true;
                icon.className = "dataIcon fa fa-eye-slash";

            }
            else {
                objHidden = true;
                item.data.visible = false;
                icon.className = "dataIcon fa fa-eye";
            }
        }, false);

        listItem.innerHTML += item.data.name;

        toggleVisibilityBtn.appendChild(icon);

        controlsContainer.appendChild(toggleVisibilityBtn);

        itemContainer.appendChild(listItem);
        itemContainer.appendChild(controlsContainer);

        listElement.appendChild(itemContainer);
    });
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();

    if (mixer) mixer.update(delta);
    render();
}

function onMouseMove(event) {
    event.preventDefault();
    event.stopPropagation();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    updateColor();
}

function onMouseDown(object) {
    GetHits();
    if (INTERSECTED != null) {
        if (INTERSECTED.name != "TerrainData") {
            alignCamera();
            updateDetails(INTERSECTED);
            //openNav(INTERSECTED);
        }
    }
}

function reset(ObjectArray) {
}

function GetHits() {
    if (mobileSideNav && navOpen) {
        raycaster.setFromCamera(mobileMouse, camera);
    } else {
        raycaster.setFromCamera(mouse, camera);
    }

    let intersection = [];
    intersection = raycaster.intersectObjects(scene.children, true);

    if (intersection.length > 0) {
        if (intersection[0].object.name != "TerrainData") {
            cameraTarget = intersection[0].point;
            INTERSECTED = intersection[0].object;
        }
        else if (intersection.length > 1) {
            cameraTarget = intersection[1].point;
            INTERSECTED = intersection[1].object;
        }
    }//not intersecting anything			
}

function render() {
    if (mobileSideNav) {
        raycaster.setFromCamera(mobileMouse, camera);
    }
    else {
        raycaster.setFromCamera(mouse, camera);
    }
    previewRenderer.render(scene, previewCamera);
    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', function () {
    // console.log("DOM LOADED");
});

window.addEventListener('load', (event) => {
    // console.log('page is fully loaded');
    document.querySelector('body').classList.add("loaded");

    var dataSideBar = document.querySelector('#sideNav');
    dataSideBar.addEventListener('mousemove', function (ev) {
        ev.preventDefault();
    })

});

function alignPreviewCamera(position) {
    let previewDistance = 500;
    previewCamera.position.set(position.x + previewDistance, position.y, position.z + previewDistance);
    previewCamera.lookAt(position.x, position.y, position.z);
}