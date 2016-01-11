/**
 * Toppano Panorama Viewer API
 * @version 0.8
 * @since 0.8
 */
var TOPPANO = TOPPANO || {};

// TOPPANO Panorama Viewer Initialization
TOPPANO.initMap = function(map) {

    window.onload = function(){
        TOPPANO.threeInit(map);
        
        TOPPANO.modelInit();


        TOPPANO.update();
        // add fb-share
        if (TOPPANO.gv.isFBShare) {
            TOPPANO.addFBShare();
        }

        // draw snapshot canvas
        TOPPANO.snapshotCanvasInit();
    };
};

// global variables initialization
TOPPANO.gv = {
    modelID: '',
    scene: null,
    objScene: null,
    renderer: null,
    stats: null,
    canvasID: 'pano-container',
    isFBShare: false,
    isState: false,
    isFullScreen: false,
    headingOffset: 0,
    transInfo: {},
    
    cursor:{
        state: "default",
        element: null
    },

    file_sets: {},

    // camera parameter
    cam: {
        camera: null,
        lat: 0,
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

    // objects in the scene
    objects: {
        showObj: true,
        transitionObj: [],
        waterdropObj: [], //TODO it needs  to be cleared when transition
        objSphereRadius: 90
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
    urlHash: window.location.hash,
    // tilePath: 'http://helios-api-0.cloudapp.net:6688',
    tilePath: './images/',
    //tilePath: 'http://localhost:3002',
    defaultMap: './image/tile/0-0.jpeg',
    apiUrl: 'http://52.11.28.251:3000/api',
    metaURL: 'http://52.11.28.251:3001'
    //metaURL: 'http://helios-api-0.cloudapp.net:6687'
};


TOPPANO.gyro = {
    screen_rot_angle:0, 
    lat: 0,
    lng: 0,
    setup: false
}; 
