export {Input};

class Input
{
    //transform panel的值改变时重绘画面
    static inputTransform(event)
    {
        var id=event.target.parentElement.id;

        window.main.transfromTable[id](event.target.value);

        if(document.getElementById("sliderTitle").innerText!="slide bar")
            document.getElementById("slider").value=event.target.value;

        window.main.pipeline.draw();
    }

    static DepthMap()
    {
        if(document.getElementById("DepthMap").checked)
        {
            window.main.pipeline.drawingMode=window.main.pipeline.drawDepthMap;
        }
        else
        {
            window.main.pipeline.drawingMode=window.main.pipeline.draw;
        }

        window.main.pipeline.drawingMode();
    }

    static setShadingFrequency(event)
    {
        var shadingFrequency=event.target.value;

        if(shadingFrequency=="FlatShading")
        {
            window.main.pipeline.shadingFragment="flat";
        }
        else if(shadingFrequency=="GouraudShading")
        {
            window.main.pipeline.shadingFragment="gouraud";
        }
        else if(shadingFrequency=="PhongShading")
        {
            window.main.pipeline.shadingFragment="phong";
        }

        window.main.pipeline.drawingMode();
    }

    //点击transfrom panel的具体属性时，把transfrom panel下面的滑动条更改为对应属性的滑动条
    static setSlideBar(event)
    {
        var ID=this.id;
        document.getElementById("sliderTitle").innerText=ID;
        var slideBar=document.getElementById("slider");

        if(ID.includes("Rotation"))
        {
            slideBar.setAttribute("min",-360);
            slideBar.setAttribute("max",360);
            slideBar.value=document.getElementById(ID).childNodes[1].value;
        }
        else
        {
            slideBar.setAttribute("min",-100);
            slideBar.setAttribute("max",100);
            slideBar.value=document.getElementById(ID).childNodes[1].value;
        }
    }

    //滑动条的值改变时，更改transfrom panel对应属性的值
    static setValueWithSlider(event) 
    {
        var id=window.main.slider.previousElementSibling.innerText;

        if(id.includes("Rotation"))
            window.main.transfromTable[id](slider.value);
        else
            window.main.transfromTable[id](slider.value);

        document.getElementById(id).childNodes[1].value=slider.value;
        window.main.pipeline.drawingMode();
        console.log("call input function");
    }

    static readObjFile(event)
    {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) 
            {
                //console.log(e.target.result); // 文件内容

                var result=e.target.result;
                var lines=result.split("\n");

                var vertex=[];
                var faces=[];

                for(let i=0;i<lines.length;i++)
                {
                    var data=lines[i].split(" ");
                    
                    if(data[0]=='v')
                        vertex.push([Number(data[1]),Number(data[2]),Number(data[3]),1]);
                    else if(data[0]=='f')
                        {
                            if(data.length-1==3)
                            {
                                if(data[1].includes("/"))
                                    faces.push([Number(data[1].split("/")[0])-1,Number(data[2].split("/")[0])-1,Number(data[3].split("/")[0])-1]);
                                else
                                    faces.push([Number(data[1])-1,Number(data[2])-1,Number(data[3])-1]);
                            }
                            else if(data.length-1==4)
                            {
                                faces.push([Number(data[1].split("/")[0])-1,Number(data[2].split("/")[0])-1,Number(data[3].split("/")[0])-1]);
                                faces.push([Number(data[1].split("/")[0])-1,Number(data[3].split("/")[0])-1,Number(data[4].split("/")[0])-1]);
                            }
                        }
                }

                var teapot=window.main.genGameObject(vertex,faces);
                teapot.scale=[10,10,10];
                teapot.position=[0,0,0];

                Input.setTransfrom(teapot);
                window.main.objectList.push(teapot);
                window.main.pipeline.faceNormalVectors=Array.from({ length: faces.length }, () => Array(3).fill(0));

                window.main.pipeline.draw();
            };

            reader.readAsText(file);

        }
    }

    //设置transform panel的值
    static setTransfrom(GameObject)
    {
        document.getElementById("PositionX").childNodes[1].value=GameObject.position[0];
        document.getElementById("PositionY").childNodes[1].value=GameObject.position[1];
        document.getElementById("PositionZ").childNodes[1].value=GameObject.position[2];

        document.getElementById("RotationX").childNodes[1].value=GameObject.rotation[0];
        document.getElementById("RotationY").childNodes[1].value=GameObject.rotation[1];
        document.getElementById("RotationZ").childNodes[1].value=GameObject.rotation[2];

        document.getElementById("ScaleX").childNodes[1].value=GameObject.scale[0];
        document.getElementById("ScaleY").childNodes[1].value=GameObject.scale[1];
        document.getElementById("ScaleZ").childNodes[1].value=GameObject.scale[2];
    }

    //debug function:select a face and draw it with polygon
    static drawFace(event) 
    {

        const rect = window.main.canvas.getBoundingClientRect();

        var x=event.clientX - rect.left;
        var y=event.clientY - rect.top;

        console.log(`x:${x},y:${y}`);

        var faceID=window.main.pipeline.IDBuffer[y][x];

        var vertexID1=window.main.objectList[0].faces[faceID][0];
        var vertexID2=window.main.objectList[0].faces[faceID][1];
        var vertexID3=window.main.objectList[0].faces[faceID][2];

        console.log(`vertex1:${vertexID1},vertex2:${vertexID2},vertex3:${vertexID3},faceID:${faceID}`);

        window.main.pipeline.drawLine(window.main.pipeline.vertex[vertexID1].slice(0,2),window.main.pipeline.vertex[vertexID2].slice(0,2),"black");
        window.main.pipeline.drawLine(window.main.pipeline.vertex[vertexID1].slice(0,2),window.main.pipeline.vertex[vertexID3].slice(0,2),"black");
        window.main.pipeline.drawLine(window.main.pipeline.vertex[vertexID2].slice(0,2),window.main.pipeline.vertex[vertexID3].slice(0,2),"black");

        window.main.pipeline.scanLine(window.main.objectList[0].faces[faceID],faceID);

    }

    static readTextureFile(event) 
    {
        const file = event.target.files[0];
        if (!file) return;

        const canvas = document.createElement('canvas');
        const reader = new FileReader();

        reader.onload = function(e) {

            const img = new Image();
            img.onload = function() {

                const ctx = window.main.canvas.getContext('2d');
                window.main.canvas.width = img.width;
                window.main.canvas.height = img.height;

                // 绘制图片到Canvas
                ctx.drawImage(img, 0, 0);

                // 获取像素数据
                const imageData = ctx.getImageData(0, 0, window.main.canvas.width, window.main.canvas.height);

                textureData = imageData.data;
                textureWidth=img.width;
                textureHeight=img.height;

            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

}