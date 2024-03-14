
import * as THREE from '../vendor/threejs/build/three.module.js';
import { MapControls } from '../vendor/threejs/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../vendor/threejs/jsm/loaders/FBXLoader.js';


var container, ui, controls;
var camera, scene, renderer, light;
var clock = new THREE.Clock();
var mixer;
var INTERSECTED;
var lastIntersected;
var mesh;
var mouse = new THREE.Vector2();
var mobileMouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var currentObject = null;
const tempV = new THREE.Vector3();
const cubes = [];
const colliders = [];
var isHovering = false;
const labelContainerElem = document.getElementById('labelContainer');


initScene();
initTerrain();
initUI();
animate();

function initScene() {
    mobileMouse.x = 0;
    mobileMouse.y = 0;

    //Scene
    container = document.createElement('div');
    container.setAttribute("id", "container");

    ui = document.createElement('div');
    ui.setAttribute("id", "ui");

    document.body.appendChild(container);
    container.appendChild(ui);

    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(1700, 1500, -1500);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 4000, 17000);

    scene.add(camera);

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
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.domElement.setAttribute("id", "viewer");

    container.appendChild(renderer.domElement);

    // controls
    controls = new MapControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mousedown', function () { onMouseDown(INTERSECTED); }, false);
    document.addEventListener('touchstart', function () { onMouseDown(INTERSECTED); }, false);


    window.addEventListener('resize', onWindowResize, false);
}

function initTerrain() {
    // model
    var loader = new FBXLoader();

    loader.load('models/fbx/Terrain.FBX', function (object) {
        mixer = new THREE.AnimationMixer(object);
        object.name = "Terrain";
        object.traverse(function (child) {

            if (child.isMesh) {
                if (child.material != null) {
                    var mat = child.material;
                    if (mat.transparent) {
                        mat.transparent = false;
                    }
                    mat.side = THREE.DoubleSide;
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

function makeLocationIcon(name, position) {
    var color = 0x0000FF;
    var cube = new THREE.Mesh();
    var loader = new FBXLoader();
    var collider = new THREE.Mesh(new THREE.SphereBufferGeometry(100, 20, 10));
    var wireMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff99, wireframe: true });
    
    
    //LABEL
    var elem = document.createElement('div');
    elem.textContent = name;
    elem.classList.add("label");
    labelContainerElem.appendChild(elem);

    loader.load('models/fbx/MapPin.FBX', function (object) {

        cube = object;
        var collider_material = new THREE.MeshBasicMaterial({ opacity: 0, transparent: true });
        cube.position.set(position.x, position.y, position.z);
        collider.position.set(position.x, position.y + 75, position.z);
        collider.material = collider_material;
        // collider.material = wireMaterial;
        cube.name = name;
        collider.name = name;

        cube.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    shadowSide:THREE.FrontSide,
                });
            }
        });

        scene.add(collider);
        scene.add(cube);

        cubes.push({ cube, collider, elem});
    });
}

function initUI() {
    //const cubes = makeLocationIcon("Mine", new THREE.Vector3(-400,220,800));
    makeLocationIcon("Mine Surface Infrastructure", new THREE.Vector3(-400, 220, 800));
    makeLocationIcon("Community", new THREE.Vector3(100, 200, 300));
    makeLocationIcon("Underground", new THREE.Vector3(-350, 300, 1200));
}

function rotate(object) {
    object.rotation.y -= 0.05;
}

function hover(object) {
    rotate(object);

    var tl = new TimelineMax();
    tl.to(object.scale, 1,
        {
            x: 2, ease: Expo.easeOut,
            y: 2, ease: Expo.easeOut,
            z: 2, ease: Expo.easeOut
        });
}

function reset(ObjectArray) {

    ObjectArray.forEach((object, ndx) => {
        const { cube, collider, elem } = object;


        var tl = new TimelineMax({});
        tl.to(cube.scale, 0.5,
            {
                x: 1, ease: Expo.easeOut,
                y: 1, ease: Expo.easeOut,
                z: 1, ease: Expo.easeOut
            });
        var t2 = new TimelineMax({});
        t2.to(collider.scale, 0.5,
            {
                x: 1, ease: Expo.easeOut,
                y: 1, ease: Expo.easeOut,
                z: 1, ease: Expo.easeOut
            });


    });
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

    /*mouse.x = (event.targetTouches[0].pageX / window.innerWidth) * 2 -1;
    mouse.y = -(event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;*/

}

function onMouseDown(object) {
    // console.log("onmousedown");
    GetHits();
    // if (INTERSECTED != null) {
        // console.log("Object: " +  INTERSECTED.name + " Mouse: " + mouse.x + ", " + mouse.y);
        if (INTERSECTED.name != "TerrainMesh") {
            // console.log("object not Terrain, MouseDown");
            openNav(INTERSECTED);
            INTERSECTED = null;//reset intersected object after opening
            reset(cubes);
        }
    // }
}

function GetHits() {
    // console.log("get hit");
    raycaster.setFromCamera(mouse, camera);
    var intersection = raycaster.intersectObjects(scene.children, true);
    INTERSECTED = intersection[0].object;
    // console.log(INTERSECTED.name);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {

    const tempV = new THREE.Vector3();

    if (mobileSideNav) {
        raycaster.setFromCamera(mobileMouse, camera);
    }
    else {
        raycaster.setFromCamera(mouse, camera);
    }
    var intersection = raycaster.intersectObjects(scene.children, true);


    if (intersection.length > 0) {
        if (INTERSECTED != intersection[0].object) {
            reset(cubes);
            INTERSECTED = intersection[0].object;
            isHovering = false;
            document.getElementById('container').style.cursor = "default";
        }
        else {
            scene.traverse(function (element) {
                if (element.name == INTERSECTED.name && element.name != "TerrainMesh") {
                    currentObject = element;
                    if (!isHovering) {
                        isHovering = true;
                        lastIntersected = INTERSECTED;
                        document.getElementById('container').style.cursor = "pointer";
                    }

                    if (INTERSECTED != null) {
                        hover(currentObject);
                        isHovering = true;
                    }
                    //return;
                }
            });
        }
    }//not intersecting anything

    renderer.render(scene, camera);

    cubes.forEach((cubeInfo, ndx) => {
        const {cube, collider, elem} = cubeInfo;

        cube.getWorldPosition(tempV);
        tempV.project(camera);

        // convert the normalized position to CSS coordinates
        const x = (tempV.x *  .5 + .5) * document.getElementById("container").clientWidth;
        const y = (tempV.y * -.5 + .42) * document.getElementById("container").clientHeight;

        // move the elem to that position
        elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // console.log("DOM LOADED");
});

window.addEventListener('load', (event) => {
    // console.log('page is fully loaded');
    document.querySelector('body').classList.add("loaded");
});