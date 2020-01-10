<template>
    <div>
        <div id="webgl-output"></div>
    </div>
</template>

<script>
    import * as THREE from 'three/src/Three'
    export default {
        mounted() {
            // create a scene, that will hold all our elements such as objects, cameras and lights.
            const scene = new THREE.Scene();

            // create a camera, which defines where we're looking at.
            const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

            // create a render and set the size
            const renderer = new THREE.WebGLRenderer();
            renderer.setClearColor(new THREE.Color(0x000000));
            renderer.setSize(window.innerWidth, window.innerHeight);

            // show axes in the screen
            const axes = new THREE.AxesHelper(20);
            scene.add(axes);

            // create the ground plane
            const planeGeometry = new THREE.PlaneGeometry(60, 20);
            const planeMaterial = new THREE.MeshBasicMaterial({
                color: 0xAAAAAA
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);

            // rotate and position the plane
            plane.rotation.x = -0.5 * Math.PI;
            plane.position.set(15, 0, 0);

            // add the plane to the scene
            scene.add(plane);

            // create a cube
            const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
            const cubeMaterial = new THREE.MeshBasicMaterial({
                color: 0xFF0000,
                wireframe: true
            });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

            // position the cube
            cube.position.set(-4, 3, 0);

            // add the cube to the scene
            scene.add(cube);

            // create a sphere
            const sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x7777FF,
                wireframe: true
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

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
            renderer.render(scene, camera);

        }
    }
</script>