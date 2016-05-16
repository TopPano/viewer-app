var params = {
  modelId: 'qkiZgk1vYAA=',
  center: {
    lat: 0,
    lng: 30
  },
  zoom: 70,
  canvas: 'container'
};

startViewer(params);

var TOPPANO = TOPPANO || {};

// Start Viewer
function startViewer(params) {
  window.onload = function() {
    // Optimization for mobile devices.
    TOPPANO.optimizeMobile();

    // init threejs scene and camera
    TOPPANO.threeInit(params);

    // request metadata, load all img files and build the first scene
    TOPPANO.modelInit(params.modelId);

    TOPPANO.update();
  };
}

// global variables initialization
TOPPANO.gv = {
    modelId: '',
    scene: null,
    objScene: null,
    renderer: null,
    stats: null,
    canvasID: 'pano-container',
    isFullScreen: false,
    headingOffset: 0,
    
    cursor:{
        state: 'default',
        element: null,
        position_array: [],
        slide_func_array:[]
    },

    nodes_meta: null,
    current_node_ID:'',
    
    // camera parameter
    cam: {
        camera: null,
        lat: 0,
        virtual_lat: 0,
        lng: 0,
        camPos: new THREE.Vector3(0, 0, 0),
        defaultCamFOV: 60,
        phi: 0,
        theta: 0,
        fov: 60
    },

    // interative controls
    control: {
        // they are not used
        onMouseDownMouseX: 0,
        onMouseDownMouseY: 0,
        onMouseDownLon: 0,
        onMouseDownLat: 0,
        
        // they are initialized in TOPPANO.controlInit()
        bound:{
            top:0,
            bottom:0,
            left:0,
            right:0
        }
    },

    // scene1 for showing to users
    scene1: {
        geometry: null,
        texture: null,
        material: null,
        mesh: null,
        panoID: '00000000',
        nextInfo: null
    },

    // container of canvas
    container: {
        offsetTop: 0,
        offsetLeft: 0,
        Height: 0,
        Width: 0,
        bound: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        }
    },

    // Const parameters
    para: {
        fov: {
            min: 50,
            max: 85
            // max: 100
        },
        sphereSize: 1000,
        epsilon: 0.1
    },

    // interaction variables
    interact: {
        isUserInteracting: false,
        isAnimate: false,
        onPointerDownPointerX: 0,
        onPointerDownPointerY: 0,
        onPointerDownLon: 0,
        onPointerDownLat: 0,
        timer: null
    },
    // variables for mobile support
    mobile: {
        isMobile: false,
        orientation: 'none'
    },
    click: {
      dblclickDelay: 300, // Delay for differentiate between single and double click
      count: 0,
      timer: null,
      longClickDelay: 150, // Delay for differentiate between short and long click
      lastMouseDown: 0,
      startPos: { x: 0, y: 0 },
      endPos: { x: 0, y: 0 }
    },
    currentLink: '',
    urlHash: window.location.hash,
    defaultMap: './image/tile/0-0.jpeg',
    apiUrl: 'http://dev.verpix.net:3000/api'
   };


TOPPANO.gyro = {
    screen_rot_angle:0,
    lat: 0,
    lng: 0,
    setup: false,
    isOn: false // Only used for iphone/ipad currently.
};
