const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let splatRoot, camera, xr;

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.5,
        3,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

   
    splatRoot = new BABYLON.TransformNode("splatRoot", scene);
    const splat = new BABYLON.GaussianSplattingMesh("splat", null, scene);
    splat.parent = splatRoot;
    await splat.loadFileAsync("./vrlabdensed100k.sog");

    xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar"
        },
        optionalFeatures: true,
        disableTeleportation: true
    });

    scene.activeCamera = xr.baseExperience.camera;

  
    xr.baseExperience.onStateChangedObservable.add((state) => {
        if (state === BABYLON.WebXRState.IN_XR) {
            camera.detachControl();
        } else if (state === BABYLON.WebXRState.NOT_IN_XR) {
            camera.attachControl(canvas, true);
        }
    });


    xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
            const trigger = motionController.getComponent("xr-standard-trigger");
            if (trigger) {
                trigger.onButtonStateChangedObservable.add(() => {
                    if (trigger.pressed) {
                        splatRoot.position.copyFrom(xr.baseExperience.camera.position);
                    }
                });
            }
        });
    });

    return scene;
};

(async () => {
    const scene = await createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });
})();

window.addEventListener("resize", function () {
    engine.resize();
});
