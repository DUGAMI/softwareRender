import {vector3Add, vector2Add, vector3DotProduct, normalize, vector3multiply, vector2multiply, lerp, barycentricInterpolate, crossProduct} from './math.js';
import {Input} from './input.js';
import {Debug} from './debug.js';

//todo
//pixel  selector

class GameObject
{
    objectName;
    materialName;
    position=[0,0,0];
    rotation=[0,0,0];
    scale=[1,1,1];

    vertexNormalVectors=[];
    facesNormalVectors=[];

    vertexUV=[];
    UVIndexes=[];

    constructor(vertex,faces,objectName)
    {
        this.vertex=vertex;
        this.faces=faces;
        this.objectName=objectName;
    }
}

class Camera
{
    position=[0,0,0];
    rotation=[0,0,0];
    far=0;
    near=0;
    fovX=0;
    fovY=0;

    constructor(position,rotation,far,near,fovX,fovY)
    {
        this.position=position;
        this.rotation=rotation;
        this.far=far;
        this.near=near;
        this.fovX=fovX;
        this.fovY=fovY;
    }
}

class ViewPort
{
    canvasWidth=800;
    canvasHeight=600;

    constructor(canvasWidth,canvasHeight)
    {
        this.canvasWidth=canvasWidth;
        this.canvasHeight=canvasHeight;
    }
}

class Texture
{
    textureName;
    textureData;
    textureWidth;
    textureHeight;

    constructor(textureName,textureData,textureWidth,textureHeight)
    {
        this.textureName=textureName;
        this.textureData=textureData;
        this.textureWidth=textureWidth;
        this.textureHeight=textureHeight;
    }   
}

class RenderPipeline
{
    vertex=[];
    vertexUV=[];
    vertexWorld=[];
    faceNormalVectors=[];
    vertexNormalVectors=[];
    faceNormalVectors=[];

    ZBuffer=null;
    imageData=null;
    buffer=null;
    ctx=null;
    viewPort=null;
    pointLight=null;
    renderingObject=null;

    shadingFrequency="flat";
    objectIndex;
    
    constructor()
    {
        this.viewPort=main.viewPort;
        this.pointLight=main.pointLight;
        this.fragmentShader=this.blinnPhongShader
        this.ctx=main.ctx;

        this.ZBuffer=Array.from({ length: this.viewPort.canvasHeight }, () => Array(this.viewPort.canvasWidth).fill(1));
        this.IDBuffer=Array.from({ length: this.viewPort.canvasHeight }, () => Array(this.viewPort.canvasWidth).fill(-1));
        this.ObjectBuffer=Array.from({ length: this.viewPort.canvasHeight }, () => Array(this.viewPort.canvasWidth).fill(-1));

        this.imageData = this.ctx.getImageData(0, 0, this.viewPort.canvasWidth, this.viewPort.canvasHeight);
        this.buffer = this.imageData.data;
    }

    // Function to draw a pixel
    drawPixel(x, y, color) {

        var index = (y * this.viewPort.canvasWidth + x) * 4;
        this.buffer[index] = color;   // R
        this.buffer[index + 1] = color; // G
        this.buffer[index + 2] = color;   // B
        this.buffer[index + 3] = 255; // A
    }

    drawPixelRGB(x, y, color){

        var index = (y * this.viewPort.canvasWidth + x) * 4;
        this.buffer[index] = color[0];   // R
        this.buffer[index + 1] = color[1]; // G
        this.buffer[index + 2] = color[2];   // B
        this.buffer[index + 3] = 255; // A

    }

    drawLine(v1,v2,color)
    {
        this.ctx.strokeStyle=color
        
        this.ctx.beginPath();
        this.ctx.moveTo(v1[0], v1[1]);
        this.ctx.lineTo(v2[0], v2[1]);
        this.ctx.stroke();
    }

    translation(x,y,z)
    {
        return nj.array([[1,0,0,x],
                        [0,1,0,y],
                        [0,0,1,z],
                        [0,0,0,1]]);
    }

    RotationX(angle)
    {
        return nj.array([[1,0,0,0],
                        [0,math.cos(angle),-math.sin(angle),0],
                        [0,math.sin(angle),math.cos(angle),0],
                        [0,0,0,1]]);
    }

    RotationY(angle)
    {
        return nj.array([[math.cos(angle),0,math.sin(angle),0],
                        [0,1,0,0],
                        [-math.sin(angle),0,math.cos(angle),0],
                        [0,0,0,1]]);
    }

    RotationZ(angle)
    {
        return nj.array([[math.cos(angle),-math.sin(angle),0,0],
                        [math.sin(angle),math.cos(angle),0,0],
                        [0,0,1,0],
                        [0,0,0,1]]);
    }

    Scale(x,y,z)
    {
        return nj.array([[x,0,0,0],
                        [0,y,0,0],
                        [0,0,z,0],
                        [0,0,0,1]]);
    }

    Projection(camera)
    {
        return nj.array([[1/math.tan(camera.fovX/2),0,0,0],
                        [0,1/math.tan(camera.fovY/2),0,0],
                        [0,0,-(camera.far+camera.near)/(camera.far-camera.near),-(2*camera.far*camera.near)/(camera.far-camera.near)],
                        [0,0,-1,0]]);
    } 

    transform(object)
    {
        let vertex=nj.array(object.vertex).T;

        let S=this.Scale(object.scale[0],object.scale[1],object.scale[2]);

        let Rx=this.RotationX((object.rotation[0]/360)*2*math.PI);
        let Ry=this.RotationY((object.rotation[1]/360)*2*math.PI);
        let Rz=this.RotationZ((object.rotation[2]/360)*2*math.PI);
        let R=nj.dot(Rz,nj.dot(Ry,Rx));

        let T=this.translation(object.position[0],object.position[1],object.position[2]);

        let transfromMatrix=nj.dot(T,nj.dot(R,S));

        return nj.dot(transfromMatrix,vertex);

    }

    transformView(vertex,camera)
    {
        let Rx=this.RotationX((-camera.rotation[0]/360)*2*math.PI);
        let Ry=this.RotationY((-camera.rotation[1]/360)*2*math.PI);
        let Rz=this.RotationZ((-camera.rotation[2]/360)*2*math.PI);
        let R=nj.dot(Rz,nj.dot(Ry,Rx));

        let T=this.translation(-camera.position[0],-camera.position[1],-camera.position[2]);

        let transfromMatrix=nj.dot(T,R);        

        return nj.dot(transfromMatrix,vertex);
    }

    transformProjection(vertex,camera)
    {
        let res=nj.dot(this.Projection(camera),vertex);

        var W=res.slice([3,4],null).T;
        W=nj.concatenate(W,W,W,W).T;

        return nj.divide(res,W);
    }

    transformScreen(vertex,viewPort)
    {
        let screenMatrix=nj.dot(this.Scale(viewPort.canvasWidth/2,viewPort.canvasHeight/2,1),this.translation(1,1,0))
        return nj.dot(screenMatrix,vertex);
    }

    generateFaceNormalVector()
    {
        var vertex=this.vertex.T.tolist();

        //generate normal vector with face
        for(let i=0;i<main.objectList[this.objectIndex].faces.length;i++)
        {
            var face=main.objectList[this.objectIndex].faces[i];

            var A=vertex[face[0]];
            var B=vertex[face[1]];
            var C=vertex[face[2]];

            var AB=[B[0]-A[0],B[1]-A[1],B[2]-A[2]];
            var AC=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];

            var normalVector=crossProduct(AB,AC);
            this.faceNormalVectors[i]=normalVector;

        }
    }

    generateNormalVector(object,vertexWorld)
    {
        let vertex=vertexWorld.T.tolist();
        let facePerVertex=Array(vertex.length).fill(0);
        let vertexNormalVectors=Array.from({ length: vertex.length }, () => Array(3).fill(0));
        let faceNormalVectors=Array.from({ length: object.faces.length }, () => Array(3).fill(0));

        //generate normal vector with face
        for(let i=0;i<object.faces.length;i++)
        {
            let face=object.faces[i];

            let A=vertex[face[0]];
            let B=vertex[face[1]];
            let C=vertex[face[2]];

            let AB=[B[0]-A[0],B[1]-A[1],B[2]-A[2]];
            let AC=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];

            let normalVector=crossProduct(AB,AC);
            faceNormalVectors[i]=normalVector;

            vertexNormalVectors[face[0]]=vector3Add(vertexNormalVectors[face[0]],normalVector);
            vertexNormalVectors[face[1]]=vector3Add(vertexNormalVectors[face[1]],normalVector);
            vertexNormalVectors[face[2]]=vector3Add(vertexNormalVectors[face[2]],normalVector);

            facePerVertex[face[0]]+=1;
            facePerVertex[face[1]]+=1;
            facePerVertex[face[2]]+=1;
        }

        //calculate noram vector of vertex(mean of normal vector)
        for(let i=0;i<vertexNormalVectors.length;i++)
        {
            vertexNormalVectors[i]=normalize([vertexNormalVectors[i][0]/facePerVertex[i],vertexNormalVectors[i][1]/facePerVertex[i],vertexNormalVectors[i][2]/facePerVertex[i]]);
        }

        return {"vertex":vertexNormalVectors,"face":faceNormalVectors};

    }

    //gouraud shading
    generateVertexColor()
    {
        this.vertexColor=[];

        for(let i=0;i<this.vertexWorld.length;i++)
        {
            var lightDirection=normalize(vector3Add(pointLight,vector3multiply(this.vertexWorld[i],-1)));
            var normalVector=this.vertexNormalVectors[i];

            this.vertexColor.push(Math.max(0,vector3DotProduct(lightDirection,normalVector)*255));
        }

    }

    //sample pixel of texture according to uv
    textureSample(texture,uv)
    {
        var x=Math.round(uv[0]*(texture.textureWidth-1));
        var y=Math.round((1-uv[1])*(texture.textureHeight-1));

        var index=(y*texture.textureWidth+x)*4
        var R=texture.textureData[index];
        var G=texture.textureData[index+1];
        var B=texture.textureData[index+2];

        return [R,G,B];
    }

    scanLine(vertexs)
    {
        let facePixel=[];

        let maxY=Math.floor(Math.max(vertexs[0][1],vertexs[1][1],vertexs[2][1]));
        let minY=Math.floor(Math.min(vertexs[0][1],vertexs[1][1],vertexs[2][1]));

        for(let scanY=minY;scanY<=maxY;scanY++)
        {
            //skip scanline out of canvas
            if(scanY<0||scanY>=this.viewPort.canvasHeight)
                continue;

            let intersections=[];

            for(let i=0;i<3;i++)
            {
                let v1=vertexs[i];
                let v2=vertexs[(i+1)%3];

                let yMinEdge = Math.min(v1[1], v2[1]);
                let yMaxEdge = Math.max(v1[1], v2[1]);

                if((scanY>=yMinEdge&&scanY<yMaxEdge)&&Math.abs(v1[1]-v2[1])>1e-5)
                {
                    let x=v1[0] + (scanY - v1[1]) * (v2[0] - v1[0]) / (v2[1] - v1[1]);
                    let z=(1/v1[2]) + (scanY - v1[1]) * ((1/v2[2]) - (1/v1[2])) / (v2[1] - v1[1]);

                    intersections.push([x,z]);
                }
            }

            if(intersections.length==2)
            {
                intersections.sort((a,b)=>a[0]-b[0]);

                let xleft=Math.floor(intersections[0][0]);
                let xRight=Math.floor(intersections[1][0]);

                let zleft=intersections[0][1];
                let zRight=intersections[1][1];

                for(let i=xleft;i<=xRight;i++)
                {
                    //skip pixel out of canvas
                    if(i<0||i>=this.viewPort.canvasWidth)
                        continue;

                    let z=1/(zleft + (i-xleft) * (zRight - zleft) / (xRight - xleft));
                    facePixel.push([i,scanY,z]);
                }
            }
        }

        return facePixel;
    }

    //split depthTest code from scanLine
    depthTest(fragment,index)
    {   
        for(let pixel of fragment)
        {
            let i=pixel[0];
            let scanY=pixel[1];
            let z=pixel[2];

            //update ZBuffer
            if(z<this.ZBuffer[scanY][i])
            {
                this.ZBuffer[scanY][i]=z;
                this.IDBuffer[scanY][i]=index;
                this.ObjectBuffer[scanY][i]=this.renderingObject;
            }
        }
    }

    //split shading code from scanLine
    blinnPhongShading(diffuseColor,normalVector,face,lamada)
    {
        let wordPos=vector3Add(vector3multiply(this.vertexWorld[face[0]],lamada[0]),vector3Add(vector3multiply(this.vertexWorld[face[1]],lamada[1]),vector3multiply(this.vertexWorld[face[2]],lamada[2])));
        let cameraDirection=normalize(vector3Add(main.MainCamera.position,vector3multiply(wordPos,-1)));
        let halfVector=normalize(vector3Add(main.directionLight,cameraDirection));

        let Ambient=[32,32,32];
        let Diffuse=vector3multiply(diffuseColor,Math.max(0,vector3DotProduct(normalVector,main.directionLight)));//[0,188,212]
        let Specular=vector3multiply([255,255,255],Math.pow(Math.max(0,vector3DotProduct(normalVector,halfVector)),256));

        return vector3Add(vector3Add(Ambient,Diffuse),Specular)
    }

    blinnPhongShader(i,j)
    {
        if(this.ZBuffer[i][j]<1)
        {
            //数据之间的引用关系太复杂了，感觉要优化一下
            let object=this.ObjectBuffer[i][j];
            
            if(object!=this.renderingObject)
                return;

            let face= this.renderingObject.faces[this.IDBuffer[i][j]];
            let facesNormalVectors=this.renderingObject.facesNormalVectors[this.IDBuffer[i][j]];
            let UVIndexes=this.renderingObject.UVIndexes[this.IDBuffer[i][j]];

            let lamada=barycentricInterpolate([this.vertex[face[0]],this.vertex[face[1]],this.vertex[face[2]]],j,i);
            let RGBcolor;
            let textureColor;

            if(main.textureList.length!=0)
            {
                let texture=main.mtlMap[this.renderingObject.objectName];
                let c1=this.textureSample(texture,this.vertexUV[UVIndexes[0]]);
                let c2=this.textureSample(texture,this.vertexUV[UVIndexes[1]]);
                let c3=this.textureSample(texture,this.vertexUV[UVIndexes[2]]);
                textureColor=vector3Add(vector3Add(vector3multiply(c1,lamada[0]),vector3multiply(c2,lamada[1])),vector3multiply(c3,lamada[2]));
            }
            else
                textureColor=[116,116,116];

        
            if(this.shadingFrequency=="flat")
            {
                let normalVector=this.faceNormalVectors[this.IDBuffer[i][j]];
                normalVector=normalize(normalVector);
                RGBcolor=this.blinnPhongShading(textureColor,normalVector,face,lamada);
            }
            else if(this.shadingFrequency=="gouraud")
            {
                let c1=this.blinnPhongShading(textureColor,this.vertexNormalVectors[face[0]],face,lamada);
                let c2=this.blinnPhongShading(textureColor,this.vertexNormalVectors[face[1]],face,lamada);
                let c3=this.blinnPhongShading(textureColor,this.vertexNormalVectors[face[2]],face,lamada);
                RGBcolor=vector3Add(vector3Add(vector3multiply(c1,lamada[0]),vector3multiply(c2,lamada[1])),vector3multiply(c3,lamada[2]));
            }
            else if(this.shadingFrequency=="phong")
            {
                let normalVector=vector3Add(vector3Add(vector3multiply(this.vertexNormalVectors[face[0]],lamada[0]),vector3multiply(this.vertexNormalVectors[face[1]],lamada[1])),vector3multiply(this.vertexNormalVectors[face[2]],lamada[2]));
                normalVector=normalize(normalVector);
                RGBcolor=this.blinnPhongShading(textureColor,normalVector,face,lamada);
                
            }

            this.drawPixelRGB(j,i,RGBcolor);
        }
    }

    depthMapShader(i,j)
    {
        var depthValue=this.ZBuffer[i][j];
        var colorValue=Math.floor((1-depthValue)*255);
        this.drawPixelRGB(j,i,[colorValue,colorValue,colorValue]);   
    }

    //讲真，我写的很奇怪，我应该写三个生成MVT矩阵的函数，然后一次性进行顶点变换的
    draw()
    {
        
        this.vertex=this.transform(this.renderingObject);
        this.vertexWorld=this.vertex.T.tolist();
        this.vertexUV=this.renderingObject.vertexUV;

        let result=this.generateNormalVector(this.renderingObject,this.vertex);
        this.vertexNormalVectors=result["vertex"];
        this.faceNormalVectors=result["face"];

        // if(this.renderingObject.vertexNormalVectors.length!=0)
        //     this.vertexNormalVectors=this.renderingObject.vertexNormalVectors;

        this.vertex=this.transformView(this.vertex,main.MainCamera);
        this.vertex=this.transformProjection(this.vertex,main.MainCamera);
        this.vertex=this.transformScreen(this.vertex,this.viewPort);

        this.vertex=this.vertex.T;

        //取xy坐标
        var col0=this.vertex.slice(null,[0,1]);
        var col1=nj.subtract(nj.ones([this.vertex.shape[0],1]).multiply(this.viewPort.canvasHeight),this.vertex.slice(null,[1,2]));
        var col2=this.vertex.slice(null,[2,3]);
        this.vertex=nj.concatenate(col0,col1,col2).tolist();


        for(let j=0;j<this.renderingObject.faces.length;j++)
        {
            let face=this.renderingObject.faces[j];
            let fragment=this.scanLine([this.vertex[face[0]],this.vertex[face[1]],this.vertex[face[2]]]);
            this.depthTest(fragment,j);
        }

        //fragment shading
        for(let i=0;i<this.viewPort.canvasHeight;i++)
        {
            for(let j=0;j<this.viewPort.canvasWidth;j++)
            {
                this.fragmentShader(i,j);
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

    }

    drawScene()
    {
        this.buffer.fill(0);
        for(let line of this.ZBuffer)
            line.fill(1);

        for(let objectIndex=0;objectIndex<main.objectList.length;objectIndex++)
        {
            this.renderingObject=main.objectList[objectIndex];
            this.draw();
        }
    }

}

class Main
{
    static getInstance()
    {
        if (!Main.instance)
        {
            Main.instance = new Main()
        }

        return Main.instance
    }

    constructor()
    {
        this.viewPort=new ViewPort(800,600);
        this.sqr2=math.sqrt(2);

        //view frustum parameters
        this.MainCamera=new Camera([0,20,50],[0,0,0],80,10,math.PI/2,math.PI/2);

        //light settings
        this.pointLight=[0,20,20];
        this.directionLight=normalize([-1,1,1]);

        this.objectList=[];

        this.textureList=[];
        //default texture
        this.defaultTexture=this.genTexture("default",Array.from({ length: 512*512*4 }, () => 116),512,512);
        this.mtlMap={"alas_kaki":"dress.png","baju":"dress.png","cd":"eyebrows_and_eyes.png","kalung":"dress.png","kerah":"dress.png",
            "Kubus.007":"hair_(2).png","Lingkaran":"dress.png","Lingkaran.003":"dress.png","NurbsPath.005":"hair_(2).png","NurbsPath.009":"hair_(1).png",
            "NurbsPath.016":"hair_(2).png","pita":"dress.png","Plane.005":"eyebrows_and_eyes.png","Plane.008":"eyebrows_and_eyes.png","rambut":"hair_(1).png",
            "tubuh":"body.png"};
        //selected object index
        this.selectedObject=null;

        this.canvas = document.getElementById('Canvas');
        this.ctx = this.canvas.getContext('2d');
        this.slider= document.getElementById('slider');

        this.canvas.setAttribute("width",this.viewPort.canvasWidth);
        this.canvas.setAttribute("height",this.viewPort.canvasHeight);

        this.IDList=["PositionX","PositionY","PositionZ","RotationX","RotationY","RotationZ","ScaleX","ScaleY","ScaleZ"];

        this.transfromTable={
            "PositionX":(value)=>{this.objectList[this.selectedObject].position[0]=Number(value);},
            "PositionY":(value)=>{this.objectList[this.selectedObject].position[1]=Number(value);},
            "PositionZ":(value)=>{this.objectList[this.selectedObject].position[2]=Number(value);},
            "RotationX":(value)=>{this.objectList[this.selectedObject].rotation[0]=Number(value);},
            "RotationY":(value)=>{this.objectList[this.selectedObject].rotation[1]=Number(value);},
            "RotationZ":(value)=>{this.objectList[this.selectedObject].rotation[2]=Number(value);},
            "ScaleX":(value)=>{this.objectList[this.selectedObject].scale[0]=Number(value);},
            "ScaleY":(value)=>{this.objectList[this.selectedObject].scale[1]=Number(value);},
            "ScaleZ":(value)=>{this.objectList[this.selectedObject].scale[2]=Number(value);},
        }
    }

    genGameObject(vertex,faces,objectName)
    {
        return new GameObject(vertex,faces,objectName);
    }

    genTexture(textureName,textureData,textureWidth,textureHeight)
    {
        return new Texture(textureName,textureData,textureWidth,textureHeight);
    }

    initMtlMAP()
    {
        for(let materialName in this.mtlMap)
        {
            let textureName=this.mtlMap[materialName];
            let result=this.textureList.find(texture=>texture.textureName==textureName);

            if(result)
            {
                this.mtlMap[materialName]=result;
            }
            else
            {
                this.mtlMap[materialName]=this.defaultTexture;
            }
    
        }
    }
}

var main=Main.getInstance();
window.main=main;
main.pipeline=new RenderPipeline();

//事件处理代码
for(const ID of main.IDList)
{
    var transformInput=document.getElementById(ID);
    transformInput.childNodes[1].addEventListener('input',Input.inputTransform);
    transformInput.addEventListener("click",Input.setSlideBar);
}

document.getElementById('slider').addEventListener('input', Input.setValueWithSlider);
document.getElementById('fileInput').addEventListener('change', Input.readObjFile);
document.getElementById('material').addEventListener('change', Input.readTextureFile);
document.getElementById('DepthMap').addEventListener('change', Input.DepthMap);
document.getElementById('shaddingFrequency').addEventListener('change', Input.setShadingFrequency);
document.getElementById('objectList').addEventListener('click', Input.selectedObject);

main.canvas.addEventListener('click', Debug.drawFace);