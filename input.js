export {Input};

class Input
{

    static inputTransform(event){
        var id=event.target.id;

        window.main.transfromTable[id](document.getElementById(id).value);

        window.main.pipeline.draw();

    }

    static setSlideBar(event)
    {

        document.getElementById("sliderTitle").innerText=ID;
        var slideBar=document.getElementById("slider");

        if(ID.includes("Rotation"))
        {
            slideBar.setAttribute("min",-360);
            slideBar.setAttribute("max",360);
            slideBar.setAttribute("value",document.getElementById(ID).value);
        }
        else
        {
            slideBar.setAttribute("min",-100);
            slideBar.setAttribute("max",100);
            slideBar.setAttribute("value",document.getElementById(ID).value);
        }
    }

    static setValueWithSlider(event) 
    {
        var id=slider.previousElementSibling.innerText;

        if(id.includes("Rotation"))
            window.main.transfromTable[id](slider.value);
        else
            window.main.transfromTable[id](slider.value);

        document.getElementById(id).value=slider.value;
        window.main.pipeline.draw();
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

                window.main.pipeline.draw();
            };

            reader.readAsText(file);

        }
    }

    static setTransfrom(GameObject)
    {
        document.getElementById("PositionX").value=GameObject.position[0];
        document.getElementById("PositionY").value=GameObject.position[1];
        document.getElementById("PositionZ").value=GameObject.position[2];

        document.getElementById("RotationX").value=GameObject.rotation[0];
        document.getElementById("RotationY").value=GameObject.rotation[1];
        document.getElementById("RotationZ").value=GameObject.rotation[2];

        document.getElementById("ScaleX").value=GameObject.scale[0];
        document.getElementById("ScaleY").value=GameObject.scale[1];
        document.getElementById("ScaleZ").value=GameObject.scale[2];
    }

    //debug function:select a face and draw it with polygon
    static drawFace(event) 
    {

        const rect = window.main.canvas.getBoundingClientRect();

        var x=event.clientX - rect.left;
        var y=event.clientY - rect.top;

        console.log(`x:${x},y:${y}`);

        faceID=window.main.pipeline.IDBuffer[y][x];

        vertexID1=window.main.objectList[0].faces[faceID][0];
        vertexID2=window.main.objectList[0].faces[faceID][1];
        vertexID3=window.main.objectList[0].faces[faceID][2];

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