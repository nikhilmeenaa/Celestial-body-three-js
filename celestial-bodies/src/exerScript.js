import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// SCENE
const scene = new THREE.Scene();

// LOADING MANAGER

const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  console.log("Started Loading");
};

loadingManager.onLoad = () => {
  console.log("loading finished");
};

loadingManager.onError = () => {
  console.log("Some error occured while loading");
};

const textureLoader = new THREE.TextureLoader(loadingManager);
const earthTexture = textureLoader.load("earthmap1k.jpg");
earthTexture.wrapS = THREE.MirroredRepeatWrapping;
earthTexture.wrapT = THREE.MirroredRepeatWrapping;
earthTexture.generateMipmaps = false;
earthTexture.minFilter = THREE.NearestFilter;
earthTexture.magFilter = THREE.NearestFilter;
// OBJECTS

const geometry = new THREE.SphereGeometry(1);
const material = new THREE.MeshBasicMaterial({ map: earthTexture });
const box = new THREE.Mesh(geometry, material);

// Adding objects to the scene
scene.add(box);

// Adding STARTS in the scene
const numberOfStarts = 1000;
const stars = [];
for (let i = 0; i < numberOfStarts; i++) {
  const geometry = new THREE.SphereGeometry(Math.random() * 0.03);
  const material = new THREE.MeshBasicMaterial({ color: "gray" });
  const star = new THREE.Mesh(geometry, material);
  const theta = Math.random() * 2 * Math.PI;

  console.log(theta);

  const ringRadius = Math.random() * 1.3 + 1.4;
  const x = ringRadius * Math.cos(theta);
  const z = ringRadius * Math.sin(theta);
  const y = Math.random() * 0.2;
  star.position.x = x;
  star.position.z = z;
  star.position.y = y;
  scene.add(star);
  stars.push({ star, ringRadius });
}

// SIZES for renders and camera
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth,
};

// CAMERA AND IT's POSITION
const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height);
scene.add(camera);

// Camera's position

camera.position.z = 8;

// GETTING CANVAS
const canvas = document.querySelector(".webgl");
console.log(canvas);

// RENDERER
const renderer = new THREE.WebGLRenderer({ canvas, sizes });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.render(scene, camera);

// RESIZING THE CANVAS SIZES AS WINDOW RESIZE
window.addEventListener("resize", () => {
  sizes.height = window.innerHeight;
  sizes.width = window.innerWidth;
  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Define the line
const linePoint = new THREE.Vector3(0, 0, 0); // A point on the line
const lineDirection = new THREE.Vector3(0, 1, 1).normalize(); // Direction of the line

// Function to calculate the position on a circle around the line
function calculatePosition(angle, radius, linePoint, lineDirection) {
  const perpendicularDirection = new THREE.Vector3(1, 0, 0);
  if (
    perpendicularDirection.equals(lineDirection) ||
    perpendicularDirection.equals(lineDirection.clone().negate())
  ) {
    perpendicularDirection.set(0, 1, 0);
  }
  const orthogonalVector1 = lineDirection
    .clone()
    .cross(perpendicularDirection)
    .normalize();
  const orthogonalVector2 = lineDirection
    .clone()
    .cross(orthogonalVector1)
    .normalize();
  const position = linePoint
    .clone()
    .add(orthogonalVector1.clone().multiplyScalar(radius * Math.cos(angle)))
    .add(orthogonalVector2.clone().multiplyScalar(radius * Math.sin(angle)));
  return position;
}

function distancePointToLine(point, linePoint, lineDirection) {
  const v = point.clone().sub(linePoint); // Vector from linePoint to point
  const cross = new THREE.Vector3().crossVectors(v, lineDirection); // Cross product
  return cross.length() / lineDirection.length(); // Distance
}

const tick = () => {
  box.rotation.y += 0.001;
  box.rotation.z += 0.001;
  const axis = new THREE.Vector3(1, 1, 0).normalize(); // Custom axis (diagonal in XY plane)
  const angle = 0.01; // Rotation angle in radians
  // cube2.rotateOnAxis(axis, angle);
  // stars.forEach((star) => {
  //   // star.position.y += 0.001;
  //   star.rotateOnAxis(axis, angle);
  // });
  // Update the positions of the elements
  const time = Date.now() * 0.0001; // Time in seconds
  stars.forEach((starDetails, index) => {
    const angle = (index / stars.length) * Math.PI * 2 + time;
    // console.log(starDetails.radius);
    const radiusForCurrentStar = distancePointToLine(
      starDetails.star.position,
      linePoint,
      lineDirection
    );
    // const y = starDetails.star.position.y;
    starDetails.star.position.copy(
      calculatePosition(angle, radiusForCurrentStar, linePoint, lineDirection)
    );
    // starDetails.star.position.y = y;
  });

  renderer.render(scene, camera);
  orbitalControl.update();
  window.requestAnimationFrame(tick);
};

// ADDING ORBITAL CONTROL BETEEN CAMERA AND CANVAS
const orbitalControl = new OrbitControls(camera, canvas);
orbitalControl.enableDamping = true;

tick();
