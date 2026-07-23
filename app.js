const canvas = document.getElementById("renderCanvas");

const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {

    const scene = new BABYLON.Scene(engine);

    const camera =
        new BABYLON.ArcRotateCamera(
            "camera",
            -Math.PI/2,
            Math.PI/2.5,
            3,
            BABYLON.Vector3.Zero(),
            scene
        );

    camera.attachControl(canvas,true);

    const light =
        new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(0,1,0),
            scene
        );

    const splat = new BABYLON.GaussianSplattingMesh("splat", null, scene);
    await splat.loadFileAsync("./vrlabdensedreduced.sog");
    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar"
        }
    });

scene.activeCamera = xr.baseExperience.camera;

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

