/**
 * Toppano Panorama Viewer API
 * @version 0.8
 * @since 0.8
 */
var TOPPANO = TOPPANO || {};

// TOPPANO Panorama Viewer Initialization
TOPPANO.initMap = function(map) {

    window.onload = function(){
        // Optimization for mobile devices.
        TOPPANO.optimizeMobile();

        // Create UI Layout
        TOPPANO.createUILayout();

        // init threejs scene and camera
        TOPPANO.threeInit(map);
       
        // request metadata, load all img files and build the first scene 
        TOPPANO.modelInit();

        TOPPANO.update();

        /* increase progress bar */
        setTimeout(function(){$('#progress-div progress').val(94);},500);
        setTimeout(function(){$('#progress-div progress').val(100);},1000);
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
    
    cursor:{
        state: "default",
        element: null,
        position_array: [],
        slide_func_array:[]
    },

    nodes_meta: null,
    current_node_ID:'',
    isTransitioning: false,
    
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
    currentLink: '',
    urlHash: window.location.hash,
    defaultMap: './image/tile/0-0.jpeg',
    apiUrl: 'http://dev.verpix.net:3000/api',
    isMobile: false
   };


TOPPANO.gyro = {
    screen_rot_angle:0, 
    lat: 0,
    lng: 0,
    setup: false
}; 
