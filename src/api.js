/**
 * Toppano Panorama Viewer API
 * @version 0.8
 * @since 0.8
 */

var TOPPANO = TOPPANO || {};

// TOPPANO Panorama Viewer Initialization
TOPPANO.initMap = function(map) {
    // threejs init
    TOPPANO.requestMeta(map.PanoID);

    window.onload = function(){
        TOPPANO.threeInit(map);

        // add listener
        TOPPANO.addListener();

        // some functions (download link, snapshot...)
        // TOPPANO.menuInit();

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
        onMouseDownMouseX: 0,
        onMouseDownMouseY: 0,
        onMouseDownLon: 0,
        onMouseDownLat: 0
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

    // scene2 for buffer
    scene2: {
        geometry: null,
        texture: null,
        material: null,
        mesh:1,
        panoID: '00000001'
    },

    // objects in the scene
    objects: {
        showObj: true,
        transitionObj: [],
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
    metaURL: 'http://toppanotest.cloudapp.net:3001'
    //metaURL: 'http://helios-api-0.cloudapp.net:6687'
};



