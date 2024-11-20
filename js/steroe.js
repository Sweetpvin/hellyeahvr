import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

// Configuración del renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;  // Habilitar VR
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
document.body.appendChild(VRButton.createButton(renderer));
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0 , 180, 250); 



// Estadísticas de rendimiento
const stats = new Stats();
document.body.appendChild(stats.dom);

// // Reloj para animaciones
// const clock = new THREE.Clock();

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
loadFBXModel('fbx/calle2.fbx', materialGranito, [1, 1, 1], [0, 0, 0], [0, 0, 0]);
loadFBXModel('fbx/calle3.fbx', materialPista, [1, 1, 1], [0, 0, 0], [0, 0, 0]);
loadFBXModel('fbx/calle4.fbx', materialCueva, [1, 1, 1], [0, 0, 0], [0, 0, 0]);
loadFBXModel('fbx/letrero.fbx', materialLetrero, [1, 1, 1], [0, 0, 0], [0, 0, 0]);
loadFBXModel('fbx/palos.fbx', materialPalo, [1, 1, 1], [0, 0, 0], [0, 0, 0]);
loadFBXModel('fbx/Montañas.fbx', materialMontaña, [1, 1, 1], [0, 0, 0], [0, 0, 0]);
loadFBXModel('fbx/fondo.fbx', materialMontaña, [1, 1, 1], [0, 0, 0], [0, 0, 0]);



// // Animación para modelo FBX con animaciones
// let mixers = [];
// const animatedLoader = new FBXLoader();
// let player;
// animatedLoader.load('fbx/Cubito.fbx', (object) => {
//     player= object;
//     player.scale.set(0.02, 0.02, 0.02);
//     player.position.set(-8, -6, 8);
//     scene.add(player);



//     const mixer = new THREE.AnimationMixer(object);
//     object.animations.forEach((clip) => {
//         const action = mixer.clipAction(clip);
//         action.play();
//     });
//     mixers.push(mixer);
// });

function createPointLight(color, intensity, dist, position) {
    const pointLight = new THREE.PointLight(color, intensity, dist);
    pointLight.position.set(position.x, position.y, position.z);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.set(1024, 1024);  // Ajusta la resolución de la sombra
    scene.add(pointLight);
    return pointLight;
}

// Configuración común para las luces
const color = 0xcfcfcf;  // Color común para todas las luces
const intensity = 15;    // Intensidad común para todas las luces
const dist = 50;    // Distancia común para todas las luces

// Lista de posiciones de las luces
const positions = [
    { x: -10, y: 5, z: 10 },
    { x: -55, y: 5, z: -35 },
    { x: -25, y: 5, z: -75 },
    { x: 25, y: 5, z: -35 },
    { x: -10, y: 5, z: -35 }
];

// Crear todas las luces usando un bucle
positions.forEach(pos => createPointLight(color, intensity, dist, pos));

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

const geometry = new THREE.SphereGeometry(0.5, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const sphere = new THREE.Mesh(geometry, material);
sphere.scale.set(70,70,70)
sphere.position.set(0,5,0)
scene.add(sphere)

// Definir el factor de escala
let scaleFactor = 100;  // Puedes cambiar este valor fuera del arreglo

// Arreglo de puntos con la escala aplicada
const points = [
    new THREE.Vector3(-9.88 * scaleFactor, 3.40 * scaleFactor, 13.87 * scaleFactor),
    new THREE.Vector3(-7.48 * scaleFactor, 3.20 * scaleFactor, 12.29 * scaleFactor),
    new THREE.Vector3(-4.72 * scaleFactor, 2.6 * scaleFactor, 10.44 * scaleFactor),
    new THREE.Vector3(-1.9 * scaleFactor, 1.46 * scaleFactor, 8.98 * scaleFactor),
    new THREE.Vector3(-0.45 * scaleFactor, 1.42 * scaleFactor, 8.2 * scaleFactor),
    new THREE.Vector3(1.29 * scaleFactor, 0.6 * scaleFactor, 6.54 * scaleFactor),
    new THREE.Vector3(3.71 * scaleFactor, 0.3 * scaleFactor, 3.38 * scaleFactor),
    new THREE.Vector3(6 * scaleFactor, -0.2 * scaleFactor, 2 * scaleFactor),
    new THREE.Vector3(10.3 * scaleFactor, 0.6 * scaleFactor, 2.8 * scaleFactor),
    new THREE.Vector3(11.7 * scaleFactor, 1 * scaleFactor, 3.6 * scaleFactor),
    new THREE.Vector3(12.4 * scaleFactor, 1.2 * scaleFactor, 4.6 * scaleFactor),
    new THREE.Vector3(12.7 * scaleFactor, 1.5 * scaleFactor, 7.2 * scaleFactor),
    new THREE.Vector3(12.5 * scaleFactor, 1.6 * scaleFactor, 8.9 * scaleFactor),
    new THREE.Vector3(12.5 * scaleFactor, 2 * scaleFactor, 10 * scaleFactor),
    new THREE.Vector3(12.4 * scaleFactor, 1.9 * scaleFactor, 13.9 * scaleFactor),
    new THREE.Vector3(12 * scaleFactor, 1.7 * scaleFactor, 15.4 * scaleFactor),
    new THREE.Vector3(11.2 * scaleFactor, 1.8 * scaleFactor, 16.9 * scaleFactor),
    new THREE.Vector3(8.4 * scaleFactor, 1.9 * scaleFactor, 18.50 * scaleFactor),
    new THREE.Vector3(7.4 * scaleFactor, 2 * scaleFactor, 20 * scaleFactor),
    new THREE.Vector3(7 * scaleFactor, 2.2 * scaleFactor, 22.4 * scaleFactor),
    new THREE.Vector3(5.2 * scaleFactor, 2.3 * scaleFactor, 23.8 * scaleFactor),
    new THREE.Vector3(3.2 * scaleFactor, 2.5 * scaleFactor, 25 * scaleFactor),
    new THREE.Vector3(0.9 * scaleFactor, 3.4 * scaleFactor, 28 * scaleFactor),
    new THREE.Vector3(-3.1 * scaleFactor, 3.3 * scaleFactor, 31.4 * scaleFactor),
    new THREE.Vector3(-7.9 * scaleFactor, 4.7 * scaleFactor, 33.9 * scaleFactor),
    new THREE.Vector3(-11.4 * scaleFactor, 3.3 * scaleFactor, 36.1 * scaleFactor),
    new THREE.Vector3(-14.7 * scaleFactor, 3.4 * scaleFactor, 36.6 * scaleFactor),
    new THREE.Vector3(-16.6 * scaleFactor, 3.5 * scaleFactor, 35.8 * scaleFactor),
    new THREE.Vector3(-18.37 * scaleFactor, 3.7 * scaleFactor, 34.4 * scaleFactor),
    new THREE.Vector3(-20.2 * scaleFactor, 3.7 * scaleFactor, 31.3 * scaleFactor),
    new THREE.Vector3(-20.8 * scaleFactor, 3.4 * scaleFactor, 27.7 * scaleFactor),
    new THREE.Vector3(-20.2 * scaleFactor, 3.2 * scaleFactor, 23.4 * scaleFactor),
    new THREE.Vector3(-19.5 * scaleFactor, 3.2 * scaleFactor, 21.6 * scaleFactor),
    new THREE.Vector3(-18.5 * scaleFactor, 3.25 * scaleFactor, 20.4 * scaleFactor),
    new THREE.Vector3(-16.9 * scaleFactor, 3.5 * scaleFactor, 18.6 * scaleFactor),
    new THREE.Vector3(-14.5 * scaleFactor, 4 * scaleFactor, 16.7 * scaleFactor),
    new THREE.Vector3(-9.88 * scaleFactor, 3.40 * scaleFactor, 13.87 * scaleFactor)
];

const scaleZ = -1;  // Cambia este valor para ajustar la dirección
const adjustedPoints = points.map(point => {
return new THREE.Vector3(point.x, point.y, point.z * scaleZ);
});

const curve = new THREE.CatmullRomCurve3(adjustedPoints);


const geometryLine = new THREE.BufferGeometry().setFromPoints(curve.getPoints(500)); // 500 puntos para suavizar
const materialLine = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const curveObject = new THREE.Line(geometryLine, materialLine);
scene.add(curveObject);

// Controles de cámara
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;   // Deshabilitar el zoom
controls.enablePan = false; // Mejor interacción visual



const listener = new THREE.AudioListener();
camera.add(listener); 
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

function loadAndPlayMusic() {
    audioLoader.load('audios/darrel.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);  // Reproducir en bucle
        sound.setVolume(0.5);
    });
}

function playMusic() {
    if (!musicPlaying) {
        sound.play();
        musicPlaying = true;
    }
}

function pauseMusic() {
    if (musicPlaying) {
        sound.pause();
        musicPlaying = false;
    }
}

function restartMusic() {
    sound.stop();
    sound.play();
    musicPlaying = true;
}

const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');


function startAnimation() {
    if (!animationActive) {
        animationActive = true;
        playMusic();
        animate();  // Iniciar la animación
    }
}

function pauseAnimation() {
    animationActive = false;
    pauseMusic();  // Pausar música cuando se pausa la animación
}

function restartAnimation() {
    t = 0;  // Reiniciar la animación
    camera.position.set(0, 180, 250);  // Resetear la cámara
    startAnimation(); 

}

let t = 0;
let animationActive = false;  // Controla si la animación está activa
let musicPlaying = false;  
const offset = new THREE.Vector3(0, 0, 0); 








function animate() {
    if (!animationActive) return;
    stats.begin();


    const position = curve.getPointAt(t);  
    sphere.position.set(position.x, position.y, position.z);

    const cameraPosition = new THREE.Vector3(position.x + offset.x, position.y + offset.y, position.z + offset.z);
    
    camera.position.copy(cameraPosition);

    const tangent = curve.getTangentAt(t);  
    const lookAtPosition = position.clone().add(tangent);  

    camera.lookAt(lookAtPosition);
    t += 0.0001;
    if (t > 1) t = 0; 

    // if (!renderer.xr.isPresenting) {
    //     controls.update(); // Esto permite que OrbitControls funcione
    // }

    
    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(animate);
}

startButton.addEventListener('click', () => {
    loadAndPlayMusic();  // Cargar la música solo la primera vez
    startAnimation();
});
pauseButton.addEventListener('click', pauseAnimation);
restartButton.addEventListener('click', restartAnimation);
