<template>
    <div>
        <div id="webgl-output"></div>
    </div>
</template>

<script>
    import * as THREE from 'three/src/Three'
    import * as dat from 'dat.gui'
    import Stats from 'stats.js'
    import addTrackballControls from './controls/TrackballControls'
    addTrackballControls(THREE);

    export default {
        data() {
            const gui = new dat.GUI();
            const guiControls = new class {
                constructor() {
                    this.rotationSpeed = 0.02;
                    this.bouncingSpeed = 0.03;
                }
            };
            gui.add(guiControls, 'rotationSpeed', 0, 0.5);
            gui.add(guiControls, 'bouncingSpeed', 0, 0.5);
            return {
                stats: new Stats(),
                guiControls,
                trackballControls: null,
                clock: new THREE.Clock(),
                webglInfo: null,
                step: 0
            }
        },
        mounted() {
            this.main();
        },
        methods: {
            main() {
                this.showStats();
                // create a scene, that will hold all our elements such as objects, cameras and lights.
                const scene = new THREE.Scene();
                const spotLight = new THREE.SpotLight(0xFFFFFF);
                spotLight.position.set(-40, 40, -15);
                spotLight.castShadow = true;
                spotLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
                spotLight.shadow.camera.far = 130;
                spotLight.shadow.camera.near = 40;
                scene.add(spotLight);

                // create a camera, which defines where we're looking at.
                const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

                // create a render and set the size
                const renderer = new THREE.WebGLRenderer();
                renderer.setClearColor(new THREE.Color(0x000000));
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.shadowMap.enabled = true;

                // show axes in the screen
                const axes = new THREE.AxesHelper(20);
                scene.add(axes);

                // create the ground plane
                const planeGeometry = new THREE.PlaneGeometry(60, 20);
                const planeMaterial = new THREE.MeshLambertMaterial({
                    color: 0xAAAAAA
                });
                const plane = new THREE.Mesh(planeGeometry, planeMaterial);
                plane.receiveShadow = true;

                // rotate and position the plane
                plane.rotation.x = -90 * Math.PI/180;
                plane.position.set(15, 0, 0);

                // add the plane to the scene
                scene.add(plane);

                // create a cube
                const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
                const cubeMaterial = new THREE.MeshLambertMaterial({
                    color: 0xFF0000,
                    // wireframe: true
                });
                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.castShadow = true;

                // position the cube
                cube.position.set(-4, 3, 0);

                // add the cube to the scene
                scene.add(cube);

                // create a sphere
                const sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
                const sphereMaterial = new THREE.MeshLambertMaterial({
                    color: 0x7777FF,
                    // wireframe: true
                });
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.castShadow = true;

                // position the sphere
                sphere.position.set(20, 4, 2);

                // add the sphere to the scene
                scene.add(sphere);

                // position and point the camera to the center of the scene
                camera.position.set(-30, 40, 30);
                camera.lookAt(scene.position);

                // add the output of the renderer to the html element
                document.getElementById("webgl-output").appendChild(renderer.domElement);

                // render the scene
                this.webglInfo = {
                    scene,
                    camera,
                    renderer,
                    cube,
                    sphere,
                    plane,
                    spotLight
                };
                this.trackballControls = this.initTrackballControls();
                this.renderScene({ renderer, scene, camera });
            },
            showStats() {
                const { stats } = this;
                stats.showPanel(0);
                document.body.appendChild(stats.dom);
            },
            renderScene() {
                const { renderer, scene, camera, cube, sphere } = this.webglInfo;
                // update the stats and the controls
                this.trackballControls.update(this.clock.getDelta());
                this.stats.begin();
                // rotate the cube
                cube.rotation.x += this.guiControls.rotationSpeed;
                cube.rotation.y += this.guiControls.rotationSpeed;
                cube.rotation.z += this.guiControls.rotationSpeed;
                // Bouncing the sphere
                this.step += this.guiControls.bouncingSpeed;
                sphere.position.x = 20 + 10 * (Math.cos(this.step));
                sphere.position.y = 2 + 10 * Math.abs(Math.sin(this.step));
                renderer.render(scene, camera);
                this.stats.end();
                requestAnimationFrame(this.renderScene);
            },
            initTrackballControls() {
                const { webglInfo: { camera, renderer } } = this;
                const trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
                trackballControls.rotateSpeed = 1.0;
                trackballControls.zoomSpeed = 1.2;
                trackballControls.panSpeed = 0.8;
                trackballControls.noZoom = false;
                trackballControls.noPan = false;
                trackballControls.staticMoving = true;
                trackballControls.dynamicDampingFactor = 0.3;
                trackballControls.keys = [65, 83, 68];

                return trackballControls;
            }
        }
    }
</script>