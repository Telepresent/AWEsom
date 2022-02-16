 /*
import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Mesh,
  PlaneGeometry,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshBasicMaterial,
  Clock,
  TextureLoader,
  FontLoader,
  TextGeometry,
  PointLight,
  AmbientLight,
  SpotLight,
  Vector2,
  Matrix4,
  Group,
  FrontSide,
  BackSide,
  Shape,
  ShapeGeometry,
  CylinderGeometry,
  sRGBEncoding,
  EquirectangularReflectionMapping,
  AddOperation
}
*/
import * as THREE from './lib/three.module.js'

import { OrbitControls } from './lib/OrbitControls.js'
import { RGBELoader} from './lib/RGBELoader.js'
import { GLTFLoader } from './lib/GLTFLoader.js' 
import { SVGLoader } from './lib/SVGLoader.js'
import { EffectComposer } from './lib/postprocessing/EffectComposer.js'
import { RenderPass } from './lib/postprocessing/RenderPass.js'
import { UnrealBloomPass } from './lib/postprocessing/TransparentBackgroundFixedUnrealBloomPass.js'
 
// loaders
const loader = new THREE.TextureLoader();
const fontLoader = new THREE.FontLoader();
const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();
const svgLoader = new SVGLoader();

const htmlGui = document.getElementById("gui");
var currentQueen = 0;
var queenLooking = new Boolean(true);
var queenChanged = new Boolean(false);
const characters = ['superhero','astronaut','gamer'];
const titles = [];

var currentCharacter = 0;

 // Dynamic Content
 let eventData = "#1,000";
 let eventLocation = " ";
 eventData = eventData.toUpperCase();
 eventLocation = eventLocation.toUpperCase();

let rocketTargetPositionUp = .15;
let rocketTargetPositionDown = -.16;
let rocketDirection = 'up';
const coinGroup = new THREE.Group();

class Sketch {
  smokeDrops = [];
  coins = [];
  animationCounter = 0;
   

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: viewport,
      stencil: true
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x000000, 0)

    //this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.autoClear = false;
    this.camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,1000)
    this.camera.position.set(0, 0, 25)
    this.sceneBack = new THREE.Scene()
    this.scene = new THREE.Scene()
   // this.composer = new EffectComposer(this.renderer);
   // this.composer.addPass(new RenderPass(this.scene,this.camera))
   // this.composer.addPass(new UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 2.2, 1.2, 0.2))
  //  this.canvas = null
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = Math.PI * 0.40;
    this.controls.maxPolarAngle =  Math.PI * 0.60;
    this.controls.enableZoom = false;
    this.controls.enableRotate = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = -6;
    this.clock = new THREE.Clock();
    this.resize()
    this.init()
  }
  init() { 
    this.addCanvas()
    this.addEvents()
    this.addElements()
    this.render()
  }

  addCanvas() {
    this.canvas = this.renderer.domElement;
  //  document.body.appendChild(this.canvas)
  }

  addEvents() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  addElements() {

    //Forward declare all groups in somewhat order
    let codeGroup = new THREE.Group();
    let backGroup = new THREE.Group();
    let cloakGroup = new THREE.Group();
    let nameGroup = new THREE.Group();
    this.textGroup = new THREE.Group();
    this.title1Group = new THREE.Group();
    this.title2Group = new THREE.Group();
    this.title3Group = new THREE.Group();
    this.sceneGroup = new THREE.Group();
    this.characterGroup = new THREE.Group();
    this.superheroGroup = new THREE.Group();
    this.astronautGroup = new THREE.Group();
    this.gamerGroup = new THREE.Group();

    // Stuff groups in groups and add in order
    backGroup.renderOrder = 1;
    this.scene.add(backGroup);

    cloakGroup.renderOrder = 2;
    this.scene.add(cloakGroup);

    this.sceneGroup.renderOrder = 3;
    this.scene.add(this.sceneGroup);

    this.characterGroup.renderOrder = 4;
    this.scene.add(this.characterGroup);
    this.characterGroup.add(this.superheroGroup,this.astronautGroup,this.gamerGroup);

   this.textGroup.renderOrder = 5;
    this.scene.add(this.textGroup);
    this.textGroup.add(this.title1Group,this.title2Group,this.title3Group);

    // env map material
    this.textureEquirec = loader.load( './images/irredecent-texture.jpg' );
    this.textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    this.textureEquirec.encoding = THREE.sRGBEncoding;
  
    
    // Ticket Frame border
    gltfLoader.load('./models/ticket-simple.gltf', (backgltf) => {
      const backFrame = backgltf.scene;
      backFrame.rotation.y = Math.PI / 2;
      backFrame.scale.set(5, 10, 10);
      backFrame.position.set(0,0,0.01);
      backFrame.traverse((o) => {
        if (o.isMesh) {
          o.material = new THREE.MeshPhongMaterial( {   shininess:9,reflectivity:1,envMap: this.textureEquirec, side: THREE.FrontSide,  transparent:false} );
          o.material.needsUpdate = true;
       //   o.layers.enable(1); // place the mesh on both layers
        }
      });
      backGroup.add(backFrame);
    });

    const roundedRectShape = new THREE.Shape();
    ( function roundedRect( ctx, x, y, width, height, radius ) {
        ctx.moveTo( x, y + radius );
        ctx.lineTo( x, y + height - radius );
        ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
        ctx.lineTo( x + width - radius, y + height );
        ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
        ctx.lineTo( x + width, y + radius );
        ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
        ctx.lineTo( x + radius, y );
        ctx.quadraticCurveTo( x, y, x, y + radius );
    } )( roundedRectShape, 0, 0, 10,16, 1 );

     // Back with envmap material: This sits just behind the plane with the transparent png material
    let newRoundedShape = new THREE.ShapeGeometry( roundedRectShape );
    const backSolid = new THREE.Mesh( newRoundedShape, new THREE.MeshPhongMaterial({/*envMap: textureEquirec,*/ color:0x090214, side: THREE.BackSide, specular: 0x050505, shininess: 100  }));
    backSolid.position.set( -5, -8, 0.1);
    backSolid.renderOrder = 1;
    backGroup.add(backSolid);

    //  // Back with transparent png material
    //  const backPattern = new THREE.Mesh( new THREE.PlaneGeometry(9.3,15.4), new THREE.MeshBasicMaterial({color: 0xFF0000, combine: THREE.AddOperation, transparent:true, opacity: 1, depthTest: true, depthWrite: false, side: THREE.BackSide}));
    //  backPattern.position.set(0,0,0.05);
    //  backPattern.renderOrder = 2;
    // backGroup.add(backPattern);
    
  // Load back as svg
  let envmap =  this.textureEquirec;
  svgLoader.load('./images/is-this-you.svg', 	function ( data ) {
    const paths = data.paths;
    const group = new THREE.Group();

    for ( let i = 0; i < paths.length; i ++ ) {
      const path = paths[ i ];
      const material = new THREE.MeshPhongMaterial( {
       // color: 0xFFFFFF,
        envMap: envmap,
        side: THREE.BackSide,
        depthWrite: true
      } );
      const shapes = SVGLoader.createShapes( path );
      for ( let j = 0; j < shapes.length; j ++ ) {
        const shape = shapes[ j ];
        const geometry = new THREE.ShapeGeometry( shape );
        const mesh = new THREE.Mesh( geometry, material );
      
       group.scale.set(0.029, 0.029, 0.029);
       group.rotation.z = Math.PI ;
       group.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 1));
        group.position.set(4,4.5,.05);
        group.add( mesh );
      }
    }
    backGroup.add( group );
  });
    






    // Cloaking using stencil portal ( all scene materials will need to be setup for stencil ops )
    let cloakTexture = loader.load("./images/color-grid.jpg");
    let cloakMaterial = new THREE.MeshLambertMaterial({ map: cloakTexture, side: THREE.FrontSide, colorWrite: false, depthWrite: false, stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc, stencilRef: 1, stencilFuncMask: 0xff, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.ReplaceStencilOp });
    const cloakPortal = new THREE.Mesh( newRoundedShape, cloakMaterial );
    cloakPortal.position.set( -5, -8, -0.1);
    cloakPortal.renderOrder = 1;
    cloakGroup.add( cloakPortal );

    // Inside cylinder env mapped
    var halfCylinderGeometry = new THREE.CylinderGeometry(80,80,80, 5, 2, false, 0, Math.PI);
    let innerCylinder = new THREE.Mesh( halfCylinderGeometry, new THREE.MeshBasicMaterial({ map:loader.load( './images/starfield.jpg' ), side: THREE.BackSide, stencilWrite: true, stencilFunc: THREE.EqualStencilFunc, stencilRef: 1, stencilFuncMask: 0xFF, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.ReplaceStencilOp }) );
    innerCylinder.rotation.y = Math.PI / 2;
    innerCylinder.position.z = -0.02;
    innerCylinder.renderOrder = 1;
    //this.sceneGroup.add( innerCylinder );

    let halfSphereGeometry = new THREE.SphereGeometry(15,10,10, Math.PI/2,  Math.PI*2, 0, Math.PI) 
    let innerSphere = new THREE.Mesh( halfSphereGeometry, new THREE.MeshStandardMaterial({color:0x4400ff, map:loader.load( './images/starfield.jpg' ), side: THREE.BackSide, stencilWrite: true, stencilFunc: THREE.EqualStencilFunc, stencilRef: 1, stencilFuncMask: 0xFF, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.ReplaceStencilOp }) );
    innerSphere.renderOrder = 1;
    innerSphere.position.z = -10;
    this.sceneGroup.add( innerSphere );
 
    // Logo Coin
    let material_coin = new THREE.MeshPhongMaterial( { shininess:9,reflectivity:1,envMap: this.textureEquirec, side: THREE.FrontSide,  transparent:false, stencilWrite: true, stencilFunc: THREE.EqualStencilFunc, stencilRef: 1, stencilFuncMask: 0xFF, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.ReplaceStencilOp });
    let geometry = new THREE.CylinderGeometry( 1, 1, 0.3, 35 );
    let coinmesh = new THREE.Mesh( geometry, material_coin );
    coinGroup.position.set(-3.2,6.2,-.5);
    //coinGroup.rotation.z = Math.PI ;
    coinGroup.rotation.x = Math.PI / 2 ;
    coinGroup.add(coinmesh);
    coinmesh.renderOrder = 7;
    coinGroup.renderOrder = 7;
    this.sceneGroup.add( coinGroup );
    svgLoader.load('./images/!!!.svg', 	function ( data ) {
      const paths = data.paths;
      const group = new THREE.Group();
      const backgroup = new THREE.Group();
      for ( let i = 0; i < paths.length; i ++ ) {
        const path = paths[ i ];
        const material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF,side: THREE.DoubleSide, stencilWrite: true, stencilFunc: THREE.EqualStencilFunc, stencilRef: 1, stencilFuncMask: 0xFF, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.ReplaceStencilOp });
        const shapes = SVGLoader.createShapes( path );
        for ( let j = 0; j < shapes.length; j ++ ) {
          const shape = shapes[ j ];
          const geometry = new THREE.ShapeGeometry( shape );
          const mesh = new THREE.Mesh( geometry, material );
          group.scale.set(0.0032, 0.0032, 0.0032);
          group.rotation.z = Math.PI ;
          group.rotation.x = Math.PI / 2 ;
          group.applyMatrix4(new THREE.Matrix4().makeScale(-1, -1, -1));
          group.position.set(-0.53,.18,-.5);
          group.add( mesh );
          
        }
        for ( let j = 0; j < shapes.length; j ++ ) {
          let backshape = shapes[ j ];
          let backgeometry = new THREE.ShapeGeometry( backshape );
          let backmesh = new THREE.Mesh( backgeometry, material );
          backgroup.scale.set(0.0032, 0.0032, 0.0032);
          backgroup.rotation.z = Math.PI ;
         backgroup.rotation.y = Math.PI ;
          backgroup.rotation.x = Math.PI / 2 ;
          backgroup.applyMatrix4(new THREE.Matrix4().makeScale(-1, -1, -1));
          backgroup.position.set(.53,-.18,-.5);
          backgroup.add( backmesh );
        }
      }
      coinGroup.add( group );
      group.renderOrder = 5;
      coinGroup.add( backgroup );
      backgroup.renderOrder = 5;
      coinGroup.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
    });


    gltfLoader.load('./models/superhero-min.gltf', (gltf) => {

      gltf.scene.scale.set(.72, .72, .72);
      gltf.scene.position.set(0,-1,-4);
      gltf.scene.traverse((mesh) => {
        if (mesh.isMesh) { 
          const prevMat = mesh.material;
          mesh.material.stencilWrite = true;
          mesh.material.stencilRef = 1;
          mesh.material.stencilFunc = THREE.EqualStencilFunc;
          mesh.material.needsUpdate = true;
          mesh.material.envMap = this.textureEquirec;
        }
        mesh.renderOrder = 3;
       });
      gltf.scene.renderOrder = 3;
      this.superheroGroup.add(gltf.scene);
    }); 
    gltfLoader.load('./models/astronaut.gltf', (gltf) => {

      gltf.scene.scale.set(.72, .72, .72);
      gltf.scene.position.set(0,-1,-4);
      gltf.scene.traverse((mesh) => {
        if (mesh.isMesh) { 
          const prevMat = mesh.material;
          mesh.material.stencilWrite = true;
          mesh.material.stencilRef = 1;
          mesh.material.stencilFunc = THREE.EqualStencilFunc;
          mesh.material.needsUpdate = true;
          mesh.material.envMap = this.textureEquirec;
        }
        mesh.renderOrder = 3;
       });
      gltf.scene.renderOrder = 3;
      this.astronautGroup.add(gltf.scene);
    });
    gltfLoader.load('./models/gamer-min.gltf', (gltf) => {

      gltf.scene.scale.set(.72, .72, .72);
      gltf.scene.position.set(0,-1,-4);
      gltf.scene.traverse((mesh) => {
        if (mesh.isMesh) { 
          const prevMat = mesh.material;
          mesh.material.stencilWrite = true;
          mesh.material.stencilRef = 1;
          mesh.material.stencilFunc = THREE.EqualStencilFunc;
          mesh.material.needsUpdate = true;
          mesh.material.envMap = this.textureEquirec;
        }
        mesh.renderOrder = 3;
       });
      gltf.scene.renderOrder = 3;
      this.gamerGroup.add(gltf.scene);
    });       




    // TITLES
    const whiteFace = new THREE.MeshBasicMaterial( { color: 0xffffff, stencilWrite: true, stencilFunc: THREE.EqualStencilFunc, stencilRef: 1, stencilFuncMask: 0xFF, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.ReplaceStencilOp });
    const shadowFace = new THREE.MeshBasicMaterial( {  envMap: this.textureEquirec, stencilWrite: true, stencilFunc: THREE.EqualStencilFunc, stencilRef: 1, stencilFuncMask: 0xFF, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.ReplaceStencilOp });

    gltfLoader.load('./models/title-1.gltf', (gltf) => {
      gltf.scene.scale.set(100, 100, 100);
      gltf.scene.rotation.x = Math.PI  / 2 ;
      gltf.scene.position.set(0,-4.1,-.3);
      gltf.scene.traverse((mesh) => {
        if (mesh.isMesh && mesh.material.name == "white") { 
          mesh.material = whiteFace;
        }
        if (mesh.isMesh && mesh.material.name == "grey") { 
          mesh.material = shadowFace;
        }
        mesh.renderOrder = 4; // This was the KEY !!!!
       });
      gltf.scene.renderOrder = 4; // This was the KEY !!!!
      this.title1Group.add(gltf.scene);
    }); 
    gltfLoader.load('./models/title-2.gltf', (gltf) => {
      gltf.scene.scale.set(100, 100, 100);
      gltf.scene.rotation.x = Math.PI  / 2 ;
      gltf.scene.position.set(0,-5.1,-.3);
      gltf.scene.traverse((mesh) => {
        if (mesh.isMesh && mesh.material.name == "white") { 
          mesh.material = whiteFace;
        }
        if (mesh.isMesh && mesh.material.name == "grey") { 
          mesh.material = shadowFace;
        }
        mesh.renderOrder = 4; // This was the KEY !!!!
       });
      gltf.scene.renderOrder = 4; // This was the KEY !!!!
      this.title2Group.add(gltf.scene);
    });       
    gltfLoader.load('./models/title-3.gltf', (gltf) => {
      titles.push(gltf.scene);
      gltf.scene.scale.set(100, 100, 100);
      gltf.scene.rotation.x = Math.PI  / 2 ;
      gltf.scene.position.set(0,-5.1,-.3);
      gltf.scene.traverse((mesh) => {
        if (mesh.isMesh && mesh.material.name == "white") { 
          mesh.material = whiteFace;
        }
        if (mesh.isMesh && mesh.material.name == "grey") { 
          mesh.material = shadowFace;
        }
        mesh.renderOrder = 4; // This was the KEY !!!!
       });
      gltf.scene.renderOrder = 4; // This was the KEY !!!!
      this.title3Group.add(gltf.scene);
    });    
 //console.log(titles);



    // Lighting
    const light = new THREE.PointLight(0xFFFFFF, 1.9);
    light.position.set( 0, 0, 10 );
    this.scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);
    //ambientLight.layers.enable(1);


    // spotlight
    var spotLight = new THREE.SpotLight(0xffffc0, 2.5);
    spotLight.penumbra = .9;
    spotLight.angle = 0.1;
    spotLight.position.set(10, 5, -50);
    spotLight.target = cloakGroup;
    //spotLight.layers.set(1);
    this.scene.add(spotLight);

    const frontBG = new THREE.Mesh( new THREE.PlaneGeometry(9.5,15.6), new THREE.MeshBasicMaterial({  map:loader.load( './images/starfield.jpg' ), transparent:false}));
    frontBG.position.set(0,0,-0.11);
   // this.sceneBack.add(frontBG);
    frontBG.renderOrder = 0;


// set visibility of initial character:
this.title1Group.visible = true;
this.title2Group.visible = false;
this.title3Group.visible = false;
this.superheroGroup.visible = true;
this.astronautGroup.visible = false;
this.gamerGroup.visible = false;


  } // End addElements()



  resize() {

  
    if (window.innerWidth < 420)  {
      this.renderer.setSize(300, 450)
      this.camera.aspect = 300 / 450
       }

    else if (window.innerWidth > 1500)  {
        this.renderer.setSize(700, 910)
        this.camera.aspect = 700 / 910
    }

    else {
      this.renderer.setSize(400, 600)
      this.camera.aspect = 400 / 600
    }
    this.camera.updateProjectionMatrix();
  }


  render() {
    if (this.characterGroup) {  
       if ( this.characterGroup.position.y <= rocketTargetPositionUp && rocketDirection == 'up') {
         this.characterGroup.position.y += 0.002;
       }else {rocketDirection = 'down'}
       if ( this.characterGroup.position.y >= rocketTargetPositionDown && rocketDirection == 'down') {
         this.characterGroup.position.y -= 0.004;
       }else {rocketDirection = 'up'}
    }
   
    if (this.animationCounter%15 === 0) {
      var cameraDirection = new THREE.Vector3();
      var vector = this.camera.getWorldDirection(cameraDirection);
      var angle = (Math.round(THREE.Math.radToDeg(Math.atan2(vector.x, vector.z))))/* + this.scene.rotation.y*/;

      
     
    
      if (angle > -90 && angle < 90) {queenLooking = false;}
      else {queenLooking = true;queenChanged = false}
      if (queenLooking == false && queenChanged == false) {
        if (currentCharacter >= (characters.length - 1)) {currentCharacter = 0}
        else {currentCharacter ++}
        console.log("character:" + characters[currentCharacter]);
      // this.queenHead.material.map = characters[currentCharacter];
      if ( characters[currentCharacter]== 'superhero') {
        this.title1Group.visible = true;
        this.title2Group.visible = false;
        this.title3Group.visible = false;
        this.superheroGroup.visible = true;
        this.astronautGroup.visible = false;
        this.gamerGroup.visible = false;
      }
      if ( characters[currentCharacter]== 'astronaut') {
        this.title1Group.visible = false;
        this.title2Group.visible = true;
        this.title3Group.visible = false;
        this.superheroGroup.visible = false;
        this.astronautGroup.visible = true;
        this.gamerGroup.visible = false;
      }
      if ( characters[currentCharacter]== 'gamer') {
        this.title1Group.visible = false;
        this.title2Group.visible = false;
        this.title3Group.visible = true;
        this.superheroGroup.visible = false;
        this.astronautGroup.visible = false;
        this.gamerGroup.visible = true;
      }
        queenChanged = true;
      }

    }
     

  
      
    this.animationCounter++;
    //this.composer.render()
    this.renderer.render(this.scene, this.camera); // Render everything else on layer 0
    this.controls.update()
    //this.scene.rotation.x = -this.clock.getElapsedTime() * 0
    coinGroup.rotation.z = -this.clock.getElapsedTime() * 1.55;
   // this.scene.rotation.y = -this.clock.getElapsedTime() * .6;
   
    this.renderer.setAnimationLoop(this.render.bind(this))
  }
}

new Sketch()
