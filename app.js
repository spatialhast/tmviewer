'use strict';

if (THREE.examples.loaders === undefined) {
    THREE.examples.loaders = {};
};

THREE.examples.loaders.OBJLoader3SimpleCheck = (function () {
    OBJLoader3Verification.prototype = Object.create(THREE.examples.apps.ThreeJsApp.prototype);
    OBJLoader3Verification.prototype.constructor = OBJLoader3Verification;

    function OBJLoader3Verification(elementToBindTo) {
        THREE.examples.apps.ThreeJsApp.call(this);
        // app configuration: see THREE.examples.apps.ThreeJsAppDefaultDefinition (js/apps/ThreeJsApp.js)
        // Only define what is required (name and htmlCanvas).
        this.configure({
            name: 'OBJLoader3Verification',
            htmlCanvas: elementToBindTo
        });

        this.lights = null;
        this.controls = null;

        this.smoothShading = true;
        this.doubleSide = false;

        this.pivot = null;
    }

    // ThreeJsApp.initPreGL()  not required, default is used
    OBJLoader3Verification.prototype.initGL = function () {
        this.renderer.setClearColor(0x303030);

        var cameraDefaults = {
            posCamera: new THREE.Vector3(0.0, 0.0, 100.0)
        };
        this.scenePerspective.setCameraDefaults(cameraDefaults);
        this.controls = new THREE.TrackballControls(this.scenePerspective.camera);

        this.controls.rotateSpeed = 10;

        //APP.scenePerspective.camera.position.x  
        this.lights = {
            ambientLight: new THREE.AmbientLight(0x202020),
            directionalLight1: new THREE.DirectionalLight(0xC0C090),
            directionalLight2: new THREE.DirectionalLight(0xC0C090),
            directionalLight3: new THREE.DirectionalLight(0xC0C090),
            lightArray: new THREE.Object3D()
        };

        this.lights.directionalLight1.position.set(-100, 0, 100);
        this.lights.directionalLight2.position.set(100, 0, 100);
        this.lights.directionalLight3.position.set(0, 0, -100);

        this.lights.lightArray.add(this.lights.directionalLight1);
        this.lights.lightArray.add(this.lights.directionalLight2);
        this.lights.lightArray.add(this.lights.directionalLight3);
        this.scenePerspective.scene.add(this.lights.lightArray);

        this.pivot = new THREE.Object3D();
        this.scenePerspective.scene.add(this.pivot);
    };

    // ThreeJsApp.WWOBJLoaderChecker.prototype.initPostGL()  not required, default is used
    OBJLoader3Verification.prototype.initPostGL = function () {
        var scope = this;

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath(scope.fileDef.path);
        mtlLoader.load(scope.fileDef.fileMtl, function (materials) {

            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath(scope.fileDef.path);

            var onSuccess = function (object3d) {
                if (object3d !== undefined && object3d !== null) {
                    var bbox = new THREE.Box3().setFromObject(object3d);
                    //var width = bbox.max.x - bbox.min.x;
                    var height = bbox.max.y - bbox.min.y;
                    //var depth = bbox.max.z - bbox.min.z;

                    var dist = height / 2 / Math.tan(Math.PI * 45 / 360);
                    APP.scenePerspective.camera.position.z = dist;
                    scope.pivot.add(object3d);
                }
            };

            var onProgress = function (event) {
                if (event.lengthComputable) {
                    var percentComplete = event.loaded / event.total * 100;
                    var output = 'Download of "' + scope.fileDef.fileObj + '": ' + Math.round(percentComplete) + '%';
                    console.log(output);
                }
            };

            var onError = function (event) {
                console.error('Error of type "' + event.type + '" occurred when trying to load: ' + event.src);
            };

            objLoader.load(scope.fileDef.fileObj, onSuccess, onProgress, onError);

        });

        return true;
    };

    OBJLoader3Verification.prototype.resizeDisplayGL = function () {
        this.controls.handleResize();
    };

    OBJLoader3Verification.prototype.renderPre = function () {
        this.controls.update();
    };

    OBJLoader3Verification.prototype.alterDouble = function () {
        var scope = this;
        scope.doubleSide = !scope.doubleSide;

        scope.traversalFunction = function (material) {
            material.side = scope.doubleSide ? THREE.DoubleSide : THREE.FrontSide;
        };

        var scopeTraverse = function (object3d) {
            scope.traverseScene(object3d);
        };
        scope.pivot.traverse(scopeTraverse);
    };

    OBJLoader3Verification.prototype.traverseScene = function (object3d) {
        if (object3d.material instanceof THREE.MultiMaterial) {
            for (var matName in object3d.material.materials) {
                this.traversalFunction(object3d.material.materials[matName]);
            }
        } else if (object3d.material) {
            this.traversalFunction(object3d.material);
        }
    };

    // ThreeJsApp.renderPost()  not required, default is used
    return OBJLoader3Verification;

})();

var APP = new THREE.examples.loaders.OBJLoader3SimpleCheck(document.getElementById('modelviewer'));

APP.fileDef = {
    path: "./data/odm_texturing_toledo/",
    fileObj: "odm_textured_model.obj",
    fileMtl: "odm_textured_model.mtl"
};

// AppRunner handles ThreeJsApp init, window resize event and render loop
var appRunner = new THREE.examples.apps.AppRunner(APP);
appRunner.run(true);

setTimeout(function () {
    APP.alterDouble();
    document.getElementById("loading").style.display = "none";
}, 4000);