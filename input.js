export { Input };
import { Loader } from "./loader.js";
import { lerp } from "./math.js";

class Input {
    constructor(main) {
        this.main = main;
    }

    //transform panel的值改变时重绘画面
    inputTransform(event) {
        let id = event.target.parentElement.id;

        this.main.transfromTable[id](event.target.value);

        if (document.getElementById("sliderTitle").innerText != "slide bar")
            document.getElementById("slider").value = event.target.value;

        this.main.pipeline.drawScene();
    }

    lerpRotation() {
        let rotationY = 0;

        for (let alpha = 0; alpha < 1; alpha += 0.01) {
            rotationY = lerp(0, 180, alpha);
            this.main.transfromTable["RotationY"](rotationY);
        }

    }

    DepthMap() {
        if (document.getElementById("DepthMap").checked) {
            this.main.pipeline.fragmentShader = this.main.pipeline.depthMapShader;
        }
        else {
            this.main.pipeline.fragmentShader = this.main.pipeline.blinnPhongShader;
        }

        this.main.pipeline.drawScene();
    }

    setShadingFrequency(event) {
        let shadingFrequency = event.target.value;

        if (shadingFrequency == "FlatShading") {
            this.main.pipeline.shadingFrequency = "flat";
        }
        else if (shadingFrequency == "GouraudShading") {
            this.main.pipeline.shadingFrequency = "gouraud";
        }
        else if (shadingFrequency == "PhongShading") {
            this.main.pipeline.shadingFrequency = "phong";
        }

        this.main.pipeline.drawScene();
    }

    //点击transfrom panel的具体属性时，把transfrom panel下面的滑动条更改为对应属性的滑动条
    setSlideBar(event) {
        let ID = event.currentTarget.id;
        document.getElementById("sliderTitle").innerText = ID;
        let slideBar = document.getElementById("slider");

        if (ID.includes("Rotation")) {
            slideBar.setAttribute("min", -360);
            slideBar.setAttribute("max", 360);
            slideBar.value = document.getElementById(ID).childNodes[1].value;
        }
        else {
            slideBar.setAttribute("min", -100);
            slideBar.setAttribute("max", 100);
            slideBar.value = document.getElementById(ID).childNodes[1].value;
        }
    }

    //滑动条的值改变时，更改transfrom panel对应属性的值
    setValueWithSlider(event) {
        let id = this.main.slider.previousElementSibling.innerText;

        if (id.includes("Rotation"))
            this.main.transfromTable[id](slider.value);
        else
            this.main.transfromTable[id](slider.value);

        document.getElementById(id).childNodes[1].value = slider.value;
        this.main.pipeline.drawScene();
        //console.log("call input function");
    }

    selectedObject(event) {
        let objectName = event.target.innerText;

        for (let i = 0; i < this.main.objectList.length; i++) {
            if (this.main.objectList[i].objectName == objectName) {
                this.main.selectedObject = i;
                this.setTransfrom(this.main.objectList[i]);
                break;
            }
        }

        let res = document.getElementById("objectList").querySelector(".selected");
        if (res) {
            res.removeAttribute("class");
        }

        if (event.target.tagName == "SPAN")
            event.target.parentElement.setAttribute("class", "selected");
        else
            event.target.setAttribute("class", "selected");
    }

    readObjFile(event) {
        const file = event.target.files[0];

        let fileName = file.name.split(".")[0];

        if (file) {
            const reader = new FileReader();
            const self = this;

            reader.onload = function (e) {
                let loader = new Loader(self.main);
                loader.objLoader(e, fileName);

                //manipulate html and css of page
                let li = document.createElement("li");
                let span = document.createElement("span");
                let objectList = document.getElementById("objectList");
                span.textContent = fileName
                li.appendChild(span);
                objectList.appendChild(li);

                let res = objectList.querySelector(".selected");
                if (res) {
                    res.removeAttribute("class");
                }
                objectList.lastChild.setAttribute("class", "selected");

                self.setTransfrom(self.main.objectList.at(-1));
                self.main.pipeline.drawScene();
            };

            reader.readAsText(file);
        }
    }

    glReadObjFile(event) {
        const file = event.target.files[0];

        let fileName = file.name.split(".")[0];

        if (file) {
            const reader = new FileReader();
            const self = this;

            reader.onload = function (e) {
                let loader = new Loader(self.main);
                let object = loader.objLoader2(e, fileName);
                self.main.objectList.push(object);
            };

            reader.readAsText(file);
        }
    }

    //设置transform panel的值
    setTransfrom(GameObject) {
        document.getElementById("PositionX").childNodes[1].value = GameObject.position[0];
        document.getElementById("PositionY").childNodes[1].value = GameObject.position[1];
        document.getElementById("PositionZ").childNodes[1].value = GameObject.position[2];

        document.getElementById("RotationX").childNodes[1].value = GameObject.rotation[0];
        document.getElementById("RotationY").childNodes[1].value = GameObject.rotation[1];
        document.getElementById("RotationZ").childNodes[1].value = GameObject.rotation[2];

        document.getElementById("ScaleX").childNodes[1].value = GameObject.scale[0];
        document.getElementById("ScaleY").childNodes[1].value = GameObject.scale[1];
        document.getElementById("ScaleZ").childNodes[1].value = GameObject.scale[2];
    }

    //debug function:select a face and draw it with polygon
    drawFace(event) {

        const rect = this.main.canvas.getBoundingClientRect();

        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        console.log(`x:${x},y:${y}`);

        let faceID = this.main.pipeline.IDBuffer[y][x];

        let vertexID1 = this.main.objectList[0].faces[faceID][0];
        let vertexID2 = this.main.objectList[0].faces[faceID][1];
        let vertexID3 = this.main.objectList[0].faces[faceID][2];

        console.log(`vertex1:${vertexID1},vertex2:${vertexID2},vertex3:${vertexID3},faceID:${faceID}`);

        this.main.pipeline.drawLine(this.main.pipeline.vertex[vertexID1].slice(0, 2), this.main.pipeline.vertex[vertexID2].slice(0, 2), "black");
        this.main.pipeline.drawLine(this.main.pipeline.vertex[vertexID1].slice(0, 2), this.main.pipeline.vertex[vertexID3].slice(0, 2), "black");
        this.main.pipeline.drawLine(this.main.pipeline.vertex[vertexID2].slice(0, 2), this.main.pipeline.vertex[vertexID3].slice(0, 2), "black");

        this.main.pipeline.scanLine(this.main.objectList[0].faces[faceID], faceID);

    }

    readTextureFile(event) {
        const files = event.target.files;

        const canvas = document.createElement('canvas');
        let promises = [];

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();

            promises.push(new Promise((resolve, reject) => {
                const self = this;
                reader.onload = function (e) {

                    const img = new Image();
                    img.onload = function () {

                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;

                        // 绘制图片到Canvas
                        ctx.drawImage(img, 0, 0);

                        // 获取像素数据
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                        let textureData = imageData.data;
                        let textureWidth = img.width;
                        let textureHeight = img.height;

                        self.main.textureList.push(self.main.genTexture(files[i].name, textureData, textureWidth, textureHeight));

                        resolve();

                    };

                    img.src = e.target.result;
                };

            }));


            reader.readAsDataURL(files[i]);
        }

        Promise.all(promises).then(results => {
            this.main.initMtlMAP();
            console.log("texture loading finished");
        });
    }

}