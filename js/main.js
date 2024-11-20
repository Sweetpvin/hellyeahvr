import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

// Configuración inicial de la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Estadísticas de rendimiento
const stats = new Stats();
document.body.appendChild(stats.dom);

// Reloj para animaciones
const clock = new THREE.Clock();

// Texturas cargadas una sola vez
const textureLoader = new THREE.TextureLoader();
const granitomap = textureLoader.load('text/texturagranito.png');
const pistatext = textureLoader.load('text/text pista.png');
const cuevatext = textureLoader.load('text/textMontaña.jpg');
const letreroText = textureLoader.load('text/text letrero.png');
const palostext = textureLoader.load('text/descarga.jpg');
const montañatext = textureLoader.load('text/Green pixel Grass.jpg');

// Materiales reutilizables
const createPhongMaterial = (map, color = 0xf0f0f0) =>
    new THREE.MeshPhongMaterial({
        color,
        map,
        normalScale: new THREE.Vector2(2, 2),
        shininess: 100,
        fog: true,
    });

const materialGranito = createPhongMaterial(granitomap);
const materialPista = createPhongMaterial(pistatext);
const materialCueva = createPhongMaterial(cuevatext);
const materialLetrero = createPhongMaterial(letreroText);
const materialPalo = createPhongMaterial(palostext);
const materialMontaña = createPhongMaterial(montañatext);

// Utilidad para cargar modelos FBX
function loadFBXModel(path, material, scale, position, rotation) {
    const loader = new FBXLoader();
    loader.load(path, (object) => {
        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = material;
            }
        });
        object.scale.set(...scale);
        object.position.set(...position);
        object.rotation.set(...rotation);
        scene.add(object);
    });
}

// Cargar modelos FBX reutilizando materiales
loadFBXModel('fbx/calle2.fbx', materialGranito, [0.02, 0.02, 0.02], [-8, -6, 8], [0, 0, 0]);
loadFBXModel('fbx/calle3.fbx', materialPista, [0.02, 0.02, 0.02], [-8, -6, 8], [0, 0, 0]);
loadFBXModel('fbx/calle4.fbx', materialCueva, [0.02, 0.02, 0.02], [-8, -6, 8], [0, 0, 0]);
loadFBXModel('fbx/letrero.fbx', materialLetrero, [0.02, 0.02, 0.02], [-8, -6, 8], [0, 0, 0]);
loadFBXModel('fbx/palos.fbx', materialPalo, [0.02, 0.02, 0.02], [-8, -6, 8], [0, 0, 0]);
loadFBXModel('fbx/Montañas.fbx', materialMontaña, [0.02, 0.02, 0.02], [-8, -6, 8], [0, 0, 0]);
loadFBXModel('fbx/fondo.fbx', materialMontaña, [0.02, 0.02, 0.02], [-8, -6, 8], [0, 0, 0]);



// Animación para modelo FBX con animaciones
let mixers = [];
const animatedLoader = new FBXLoader();
let player;
animatedLoader.load('fbx/Cubito.fbx', (object) => {
    player= object;
    player.scale.set(0.02, 0.02, 0.02);
    player.position.set(-8, -6, 8);
    scene.add(player);



    const mixer = new THREE.AnimationMixer(object);
    object.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
    });
    mixers.push(mixer);
});



// Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
//scene.add(ambientLight);


var y=10;
var p=50;



const pointLight = new THREE.PointLight(0xcfcfcf, y, p);
pointLight.position.set(-10, 5, 10);
pointLight.castShadow = true;
pointLight.shadow.mapSize.set(1024, 1024);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xcfcfcf, y, p);
pointLight2.position.set(-55, 5, -35);
pointLight2.castShadow = true;
pointLight2.shadow.mapSize.set(1024, 1024);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xcfcfcf, y, p);
pointLight3.position.set(-25, 5, -75);
pointLight3.castShadow = true;
pointLight3.shadow.mapSize.set(1024, 1024);
scene.add(pointLight3);

const pointLight4 = new THREE.PointLight(0xcfcfcf, y, p);
pointLight4.position.set(25, 5, -35);
pointLight4.castShadow = true;
pointLight4.shadow.mapSize.set(1024, 1024);
scene.add(pointLight4);

const pointLight5 = new THREE.PointLight(0xcfcfcf, y, p);
pointLight5.position.set(-10, 5, -35);
pointLight5.castShadow = true;
pointLight5.shadow.mapSize.set(1024, 1024);
scene.add(pointLight5);

// Controles de cámara
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Mejor interacción visual


function animate() {
    stats.begin();

    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));


    

    controls.update();
    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(animate);
}

animate();
