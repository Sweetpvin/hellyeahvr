import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

class SceneManager {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(VRButton.createButton(this.renderer));

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.set(0, 180, 250);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        this.clock = new THREE.Clock();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        this.controls.update();
        this.stats.update();
    }
}

class AudioManager {
    constructor(camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        this.sound = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();

        document.body.addEventListener('click', () => {
            if (this.listener.context.state === 'suspended') {
                this.listener.context.resume().then(() => {
                    console.log('AudioContext activado después de la interacción del usuario');
                });
            }
        });
    }

    loadAndPlayMusic(path) {
        this.audioLoader.load(path, (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(0.5);
            this.sound.play();
        });
    }

    pauseMusic() {
        this.sound.pause();
    }

    restartMusic() {
        this.sound.stop();
        this.sound.play();
    }
}

class ModelManager {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
    }

    loadTextures(paths) {
        const textures = {};
        for (const [key, path] of Object.entries(paths)) {
            textures[key] = this.textureLoader.load(path);
        }
        return textures;
    }

    createMaterial(texture, color = 0xf0f0f0) {
        return new THREE.MeshPhongMaterial({
            color,
            map: texture,
            normalScale: new THREE.Vector2(2, 2),
            shininess: 100,
            fog: true,
        });
    }

    loadFBXModel(path, material, scale, position, rotation) {
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
            this.scene.add(object);
        });
    }
}

class LightManager {
    constructor(scene) {
        this.scene = scene;
    }

    createPointLight(color, intensity, distance, position) {
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.set(position.x, position.y, position.z);
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        this.scene.add(light);
    }

    createAmbientLight(color) {
        const light = new THREE.AmbientLight(color);
        this.scene.add(light);
    }
}

class AnimationManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.t = 0;
        this.animationActive = false;
        this.offset = new THREE.Vector3(0, 0, 0);
        this.lastTime = 0;
    }

    createCurve(points, scaleZ = -1) {
        const adjustedPoints = points.map(point => new THREE.Vector3(point.x, point.y, point.z * scaleZ));
        const curve = new THREE.CatmullRomCurve3(adjustedPoints);
        return curve;
    }

    addCurveToScene(curve, color = 0x00ff00) {
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(500));
        const material = new THREE.LineBasicMaterial({ color });
        const curveObject = new THREE.Line(geometry, material);
        this.scene.add(curveObject);
    }

    animate(curve, sphere, deltaTime) {
        if (!this.animationActive) return;
    


        const position = curve.getPointAt(this.t);

        sphere.position.set(position.x, position.y, position.z);

        const tangent = curve.getTangentAt(this.t);
        const lookAtPosition = position.clone().add(tangent);

        this.camera.position.set(position.x + this.offset.x, position.y + this.offset.y, position.z + this.offset.z);
        this.camera.lookAt(lookAtPosition);

        const speedFactor = 0.02;  // Factor de velocidad, puedes ajustarlo a tu gusto
        this.t += deltaTime * speedFactor;
        
        
        // Usamos deltaTime aquí en lugar de una constante
        if (this.t > 1) this.t = 0;
    }
    update(deltaTime) {
        this.lastTime = deltaTime;
    }
}

class App {
    constructor() {
        this.sceneManager = new SceneManager();
        this.audioManager = new AudioManager(this.sceneManager.camera);
        this.modelManager = new ModelManager(this.sceneManager.scene);
        this.lightManager = new LightManager(this.sceneManager.scene);
        this.animationManager = new AnimationManager(this.sceneManager.scene, this.sceneManager.camera);

        this.curve = null;
        this.sphere = null;

        this.bullets = [];
        this.enemies = [];
        this.maxEnemies = 6;

        this.init();
    }

    init() {
        this.loadAssets();
        this.addLights();
        this.setupCurve();
        this.setupSphere();

        setInterval(() => this.spawnEnemy(), 1000);

        window.addEventListener("click", (event) => this.onMouseClick(event));

        
        this.startAnimation();
    }

    loadAssets() {
        const textures = this.modelManager.loadTextures({
            granito: 'text/texturagranito.png',
            pista: 'text/text pista.png',
            cueva: 'text/textMontaña.jpg',
            letrero: 'text/text letrero.png',
            palos: 'text/descarga.jpg',
            montana: 'text/Green pixel Grass.jpg',
        });

        const models = [
            { path: 'fbx/calle2.fbx', material: this.modelManager.createMaterial(textures.granito), scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
            { path: 'fbx/calle3.fbx', material: this.modelManager.createMaterial(textures.pista), scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
            { path: 'fbx/calle4.fbx', material: this.modelManager.createMaterial(textures.cueva), scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
            { path: 'fbx/letrero.fbx', material: this.modelManager.createMaterial(textures.letrero), scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
            { path: 'fbx/calle4.fbx', material: this.modelManager.createMaterial(textures.cueva), scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
            { path: 'fbx/palos.fbx', material: this.modelManager.createMaterial(textures.palos), scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
            { path: 'fbx/Montañas.fbx', material: this.modelManager.createMaterial(textures.montana), scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
            { path: 'fbx/fondo.fbx', material: this.modelManager.createMaterial(textures.montana), scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
            
            
        ];

        models.forEach(model => {
            this.modelManager.loadFBXModel(model.path, model.material, model.scale, model.position, model.rotation);
        });
    }

    addLights() {
        this.lightManager.createAmbientLight(0xffffff);
        this.lightManager.createPointLight(0xffffff, 0.7, 500, { x: 0, y: 500, z: 0 });
    }

    setupCurve() {
        const points = [
            new THREE.Vector3(-9.88 * 100, 3.40 * 100, 13.87 * 100),
            new THREE.Vector3(-7.48 * 100, 3.20 * 100, 12.29 * 100),
            new THREE.Vector3(-4.72 * 100, 2.6 * 100, 10.44 * 100),
            new THREE.Vector3(-1.9 * 100, 1.46 * 100, 8.98 * 100),
            new THREE.Vector3(-0.45 * 100, 1.42 * 100, 8.2 * 100),
            new THREE.Vector3(1.29 * 100, 0.6 * 100, 6.54 * 100),
            new THREE.Vector3(3.71 * 100, 0.3 * 100, 3.38 * 100),
            new THREE.Vector3(6 * 100, -0.2 * 100, 2 * 100),
            new THREE.Vector3(10.3 * 100, 0.6 * 100, 2.8 * 100),
            new THREE.Vector3(11.7 * 100, 1 * 100, 3.6 * 100),
            new THREE.Vector3(12.4 * 100, 1.2 * 100, 4.6 * 100),
            new THREE.Vector3(12.7 * 100, 1.5 * 100, 7.2 * 100),
            new THREE.Vector3(12.5 * 100, 1.6 * 100, 8.9 * 100),
            new THREE.Vector3(12.5 * 100, 2 * 100, 10 * 100),
            new THREE.Vector3(12.4 * 100, 1.9 * 100, 13.9 * 100),
            new THREE.Vector3(12 * 100, 1.7 * 100, 15.4 * 100),
            new THREE.Vector3(11.2 * 100, 1.8 * 100, 16.9 * 100),
            new THREE.Vector3(8.4 * 100, 1.9 * 100, 18.50 * 100),
            new THREE.Vector3(7.4 * 100, 2 * 100, 20 * 100),
            new THREE.Vector3(7 * 100, 2.2 * 100, 22.4 * 100),
            new THREE.Vector3(5.2 * 100, 2.3 * 100, 23.8 * 100),
            new THREE.Vector3(3.2 * 100, 2.5 * 100, 25 * 100),
            new THREE.Vector3(0.9 * 100, 3.4 * 100, 28 * 100),
            new THREE.Vector3(-3.1 * 100, 3.3 * 100, 31.4 * 100),
            new THREE.Vector3(-7.9 * 100, 4.7 * 100, 33.9 * 100),
            new THREE.Vector3(-11.4 * 100, 3.3 * 100, 36.1 * 100),
            new THREE.Vector3(-14.7 * 100, 3.4 * 100, 36.6 * 100),
            new THREE.Vector3(-16.6 * 100, 3.5 * 100, 35.8 * 100),
            new THREE.Vector3(-18.37 * 100, 3.7 * 100, 34.4 * 100),
            new THREE.Vector3(-20.2 * 100, 3.7 * 100, 31.3 * 100),
            new THREE.Vector3(-20.8 * 100, 3.4 * 100, 27.7 * 100),
            new THREE.Vector3(-20.2 * 100, 3.2 * 100, 23.4 * 100),
            new THREE.Vector3(-19.5 * 100, 3.2 * 100, 21.6 * 100),
            new THREE.Vector3(-18.5 * 100, 3.25 * 100, 20.4 * 100),
            new THREE.Vector3(-16.9 * 100, 3.5 * 100, 18.6 * 100),
            new THREE.Vector3(-14.5 * 100, 4 * 100, 16.7 * 100),
            new THREE.Vector3(-9.88 * 100, 3.40 * 100, 13.87 * 100)
        ];
        this.curve = this.animationManager.createCurve(points);
        this.animationManager.addCurveToScene(this.curve);
    }

    setupSphere() {
        const geometry = new THREE.SphereGeometry(10, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.scale.set(70, 70, 70);
        this.sceneManager.scene.add(this.sphere);
    }


    spawnEnemy() {
        if (this.enemies.length < this.maxEnemies) {
            const enemy = new THREE.Mesh(
                new THREE.SphereGeometry(55, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xff0000 })
            );

            // Posicionar el enemigo frente a la cámara
            const distance = 100;
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.sceneManager.camera.rotation);
            enemy.position.copy(this.sceneManager.camera.position).add(direction.multiplyScalar(distance));

            enemy.userData.sinePhase = Math.random() * Math.PI * 2;
            this.enemies.push(enemy);
            this.sceneManager.scene.add(enemy);
        }
    }

    onMouseClick(event) {
        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, this.sceneManager.camera);

        const bullet = this.createBullet(raycaster.ray.direction);
        this.bullets.push(bullet);
        this.sceneManager.scene.add(bullet);
    }

    createBullet(direction) {
        const bullet = new THREE.Mesh(
            new THREE.SphereGeometry(5, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        bullet.position.copy(this.sphere.position);
        bullet.velocity = direction.multiplyScalar(10);
        return bullet;
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.add(bullet.velocity.clone().multiplyScalar(deltaTime));

            this.enemies.forEach(enemy => {
                const distance = bullet.position.distanceTo(enemy.position);
                if (distance < 55) {
                    enemy.position.copy(this.getRandomPositionFrontOfCamera());
                    this.sceneManager.scene.remove(bullet);
                    this.bullets.splice(i, 1);
                }
            });

            if (bullet.position.z < -500) {
                this.sceneManager.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }

    getRandomPositionFrontOfCamera() {
        const distance = 100;
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.sceneManager.camera.rotation);
        const randomOffset = Math.random() * 20 - 10;
        return new THREE.Vector3(
            this.sceneManager.camera.position.x + randomOffset,
            this.sceneManager.camera.position.y,
            this.sceneManager.camera.position.z - distance
        );
    }

    updateEnemies() {
        this.enemies.forEach(enemy => {
            enemy.position.add(enemy.userData.velocity);
            enemy.position.y = Math.sin(enemy.userData.sinePhase) * 0.3;
            enemy.userData.sinePhase += 0.05;

            // Movimiento aleatorio
            const randomMovement = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                0,
                (Math.random() - 0.5) * 0.1
            );
            enemy.position.add(randomMovement);
        });
    }

    startAnimation() {
        this.animationManager.animationActive = true;
        this.audioManager.loadAndPlayMusic('audios/darrel.mp3');
        this.animate();
    }

    pauseAnimation() {
        this.animationManager.animationActive = false;
        this.audioManager.pauseMusic();
    }

    restartAnimation() {
        this.animationManager.t = 0;
        this.startAnimation();
    }

    animate() {
        if (!this.animationManager.animationActive) return;
        const deltaTime = this.sceneManager.clock.getDelta();  
        this.animationManager.update(deltaTime)


        this.updateBullets(deltaTime);

        this.sceneManager.update();
        this.animationManager.animate(this.curve, this.sphere, deltaTime);
        this.sceneManager.render();
        requestAnimationFrame(() => this.animate());
    }
    update() {
        this.sceneManager.update();
        this.animationManager.update();
        this.updateBullets();
        this.updateEnemies();
    }
    
}

const app = new App();
app.animate();