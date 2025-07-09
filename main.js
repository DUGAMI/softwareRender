import {vector3Add, vector2Add, vector3DotProduct, normalize, vector3multiply, vector2multiply, lerp, barycentricInterpolate, crossProduct} from './math.js';
import {Input} from './input.js';

//todo
//pixel  selector

class GameObject
{
    position=[0,0,0];
    rotation=[0,0,0];
    scale=[1,1,1];

    constructor(vertex,faces)
    {
        this.vertex=vertex;
        this.faces=faces;
    }
}

class RenderPipeline
{
    vertex=null;
    vertexWorld=null;

    P=null;
    transfromScreenMatrix=null;
    transfromScreenMatrix=null;
    ZBuffer=null;
    imageData=null;
    buffer=null;
    ctx=null;

    //transfromMatrix=null;
    vertexUV=null;

    cameraPos=null;
    far=0;
    near=0;
    fovX=0;
    fovY=0;

    pointLight=null;
    directionLight=null;

    constructor()
    {
        this.canvasWidth=main.canvasWidth;
        this.canvasHeight=main.canvasHeight;

        this.cameraPos=main.cameraPos;
        this.far=main.far;
        this.near=main.near;
        this.fovX=main.fovX;
        this.fovY=main.fovY;

        this.pointLight=main.pointLight;
        this.directionLight=main.directionLight;


        this.ctx=main.ctx;
        this.P=this.Projection();
        this.transfromScreenMatrix=nj.dot(this.Scale(this.canvasWidth/2,this.canvasHeight/2,1),this.translation(1,1,0));
        this.transformCameraMatrix=nj.dot(this.Projection(),nj.dot(this.RotationY(-main.angleY),this.translation(-this.cameraPos[0],-this.cameraPos[1],-this.cameraPos[2])));
        this.ZBuffer=Array.from({ length: this.canvasHeight }, () => Array(this.canvasWidth).fill(1));
        this.IDBuffer=Array.from({ length: this.canvasHeight }, () => Array(this.canvasWidth).fill(1));
        this.faceNormalVectors=Array.from({ length: 12 }, () => Array(3).fill(0));
        this.vertexUV=Array.from({ length: 8 }, () => Array(2).fill(0));
        //this.faceUV=Array.from({ length: 12 }, () => Array(2).fill(0));

        this.imageData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        this.buffer = this.imageData.data;

        this.vertexUV=[[0.5,0.5],[0,0.5],[0.5,0.5],[0,0.5],[0.5,0],[0,0],[0.5,0],[0,0]];
        this.faceUV=[[[0.5,0.5],[0.5,0],[0,0.5]],
                        [[0,0],[0,0.5],[0.5,0]],
                        [[0.5,0.5],[0.5,0],[0,0.5]],
                        [[0,0],[0,0.5],[0.5,0]],
                        [[0,0],[0,0.5],[0.5,0]],
                        [[0.5,0.5],[0.5,0],[0,0.5]],
                        [[0.5,0.5],[0.5,0],[0,0.5]],
                        [[0,0],[0,0.5],[0.5,0]],
                        [[0.5,1],[0.5,0.5],[0.,1]],
                        [[0,0.5],[0,1],[0.5,0.5]],
                        [[1,0.5],[0.5,0.5],[1,0]],
                        [[0.5,0],[1,0],[0.5,0.5]]];
    }

    // Function to draw a pixel
    drawPixel(x, y, color) {

        var index = (y * this.canvasWidth + x) * 4;
        this.buffer[index] = color;   // R
        this.buffer[index + 1] = color; // G
        this.buffer[index + 2] = color;   // B
        this.buffer[index + 3] = 255; // A
    }

    drawPixelRGB(x, y, color){

        var index = (y * this.canvasWidth + x) * 4;
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

    Projection()
    {
        return nj.array([[1/math.tan(this.fovX/2),0,0,0],
                        [0,1/math.tan(this.fovY/2),0,0],
                        [0,0,-(this.far+this.near)/(this.far-this.near),-(2*this.far*this.near)/(this.far-this.near)],
                        [0,0,-1,0]]);
    } 

    transform(object)
    {
        var S=this.Scale(object.scale[0],object.scale[1],object.scale[2]);

        var Rx=this.RotationX((object.rotation[0]/360)*2*math.PI);
        var Ry=this.RotationY((object.rotation[1]/360)*2*math.PI);
        var Rz=this.RotationZ((object.rotation[2]/360)*2*math.PI);
        var R=nj.dot(Rz,nj.dot(Ry,Rx));

        var T=this.translation(object.position[0],object.position[1],object.position[2]);

        var transfromMatrix=nj.dot(T,nj.dot(R,S));

        this.vertex=nj.dot(transfromMatrix,this.vertex);

    }

    transformCamera()
    {
        this.vertex=nj.dot(this.transformCameraMatrix,this.vertex);

        var W=this.vertex.slice([3,4],null).T;
        W=nj.concatenate(W,W,W,W).T;
        this.vertex=nj.divide(this.vertex,W);
    }

    transformScreen()
    {
        this.vertex=nj.dot(this.transfromScreenMatrix,this.vertex);
    }

    generateNormalVector()
    {
        //var normalVectors=Array.from({ length: this.vertex.shape[0] }, () => Array(this.vertex.shape[1]).fill(0));
        var vertex=this.vertex.T.tolist();
        var facePerVertex=Array(vertex.length).fill(0);

        //generate normal vector with face
        for(let i=0;i<main.objectList[0].faces.length;i++)
        {
            var face=main.objectList[0].faces[i];

            var A=vertex[face[0]];
            var B=vertex[face[1]];
            var C=vertex[face[2]];

            var AB=[B[0]-A[0],B[1]-A[1],B[2]-A[2]];
            var AC=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];

            var normalVector=crossProduct(AB,AC);
            this.faceNormalVectors[i]=normalVector;

            this.vertexNormals[face[0]]=vector3Add(this.vertexNormals[face[0]],normalVector);
            this.vertexNormals[face[1]]=vector3Add(this.vertexNormals[face[1]],normalVector);
            this.vertexNormals[face[2]]=vector3Add(this.vertexNormals[face[2]],normalVector);

            facePerVertex[face[0]]+=1;
            facePerVertex[face[1]]+=1;
            facePerVertex[face[2]]+=1;
        }

        //calculate noram vector of vertex(mean of normal vector)
        for(let i=0;i<this.vertexNormals.length;i++)
        {
            this.vertexNormals[i]=normalize([this.vertexNormals[i][0]/facePerVertex[i],this.vertexNormals[i][1]/facePerVertex[i],this.vertexNormals[i][2]/facePerVertex[i]]);
        }

    }

    //gouraud shading
    generateVertexColor()
    {
        this.vertexColor=[];

        for(let i=0;i<this.vertexWorld.length;i++)
        {
            var lightDirection=normalize(vector3Add(pointLight,vector3multiply(this.vertexWorld[i],-1)));
            var normalVector=this.vertexNormals[i];

            this.vertexColor.push(Math.max(0,vector3DotProduct(lightDirection,normalVector)*255));
        }

    }

    //sample pixel of texture according to uv
    textureSample(texture,uv)
    {
        var x=Math.round(uv[0]*textureWidth);
        var y=Math.round(uv[1]*textureHeight);

        var index=(y*textureHeight+x)*4
        var R=textureData[index];
        var G=textureData[index+1];
        var B=textureData[index+2];

        return [R,G,B];
    }

    scanLine(face,index)
    {
        var vertexs=[this.vertex[face[0]],this.vertex[face[1]],this.vertex[face[2]]];

        var facePixel=[];

        var maxY=Math.floor(Math.max(vertexs[0][1],vertexs[1][1],vertexs[2][1]));
        var minY=Math.floor(Math.min(vertexs[0][1],vertexs[1][1],vertexs[2][1]));

        for(let scanY=minY;scanY<=maxY;scanY++)
        {
            var intersections=[];

            for(let i=0;i<3;i++)
            {
                var v1=vertexs[i];
                var v2=vertexs[(i+1)%3];

                var yMinEdge = Math.min(v1[1], v2[1]);
                var yMaxEdge = Math.max(v1[1], v2[1]);

                if((scanY>=yMinEdge&&scanY<yMaxEdge)&&Math.abs(v1[1]-v2[1])>1e-5)
                {
                    var x=v1[0] + (scanY - v1[1]) * (v2[0] - v1[0]) / (v2[1] - v1[1]);
                    var z=(1/v1[2]) + (scanY - v1[1]) * ((1/v2[2]) - (1/v1[2])) / (v2[1] - v1[1]);

                    intersections.push([x,z]);
                }
            }

            if(intersections.length==2)
            {
                intersections.sort((a,b)=>a[0]-b[0]);

                var xleft=Math.floor(intersections[0][0]);
                var xRight=Math.floor(intersections[1][0]);

                var zleft=intersections[0][1];
                var zRight=intersections[1][1];

                for(let i=xleft;i<=xRight;i++)
                {
                    var z=1/(zleft + (i-xleft) * (zRight - zleft) / (xRight - xleft));

                    //update ZBuffer
                    if(z<this.ZBuffer[scanY][i])
                    {
                        this.ZBuffer[scanY][i]=z;
                        this.IDBuffer[scanY][i]=index;
                        
                        var lamada=barycentricInterpolate(vertexs,i,scanY);

                        var normalVector=vector3Add(vector3Add(vector3multiply(this.vertexNormals[face[0]],lamada[0]),vector3multiply(this.vertexNormals[face[1]],lamada[1])),vector3multiply(this.vertexNormals[face[2]],lamada[2]));
                        normalVector=normalize(normalVector);

                        // var uv=vector2Add(vector2multiply(this.faceUV[index][0],lamada[0]),vector2Add(vector2multiply(this.faceUV[index][1],lamada[1]),vector2multiply(this.faceUV[index][2],lamada[2])));
                        // var color=this.textureSample(textureData,uv);

                        //var wordPos=vector3Add(vector3multiply(this.vertexWorld[face[0]],lamada[0]),vector3Add(vector3multiply(this.vertexWorld[face[1]],lamada[1]),vector3multiply(this.vertexWorld[face[2]],lamada[2])));
                        //var lightDirection=normalize(vector3Add(pointLight,vector3multiply(wordPos,-1)));

                        var wordPos=vector3Add(vector3multiply(this.vertexWorld[face[0]],lamada[0]),vector3Add(vector3multiply(this.vertexWorld[face[1]],lamada[1]),vector3multiply(this.vertexWorld[face[2]],lamada[2])));
                        var cameraDirection=normalize(vector3Add(this.cameraPos,vector3multiply(wordPos,-1)));
                        var halfVector=normalize(vector3Add(this.directionLight,cameraDirection));

                        var Ambient=[32,32,32];
                        var Diffuse=vector3multiply([0,188,212],Math.max(0,vector3DotProduct(normalVector,this.directionLight)));
                        var Specular=vector3multiply([255,255,255],Math.pow(Math.max(0,vector3DotProduct(normalVector,halfVector)),256));
                        

                        //var color=vector3DotProduct([this.vertexColor[face[0]],this.vertexColor[face[1]],this.vertexColor[face[2]]],lamada);
                        //Math.max(0,vector3DotProduct(directionLight,this.faceNormalVectors[index])*255)

                        //this.drawPixel(i,Math.round(scanY),Math.max(0,vector3DotProduct(normalVector,directionLight)*255));
                        //this.drawPixelRGB(i,scanY,vector3multiply([255,255,255],Math.max(0,vector3DotProduct(this.faceNormalVectors[index],directionLight))));
                        this.drawPixelRGB(i,scanY,vector3Add(vector3Add(Ambient,Diffuse),Specular));
                        //this.drawPixelRGB(i,Math.round(scanY),[200,200,200]);
                    }

                    facePixel.push([i,scanY]);
                }
            }
        }

        return facePixel;
    }

    draw()
    {
        //ctx.clearRect(0,0,canvasWidth,canvasHeight);
        this.buffer.fill(0);
        this.ZBuffer=Array.from({ length: this.canvasHeight }, () => Array(this.canvasWidth).fill(1));

        for(let i=0;i<main.objectList.length;i++)
        {
            this.vertex=nj.array(main.objectList[i].vertex).T;
            this.vertexNormals=Array.from({ length: this.vertex.shape[1] }, () => Array(this.vertex.shape[0]).fill(0));

            this.transform(main.objectList[i]);
            this.vertexWorld=this.vertex.T.tolist();

            //nomarl vector
            this.generateNormalVector();
            

            // this.vertexNormals=[[0.577,-0.577,0.577],
            //                     [-0.577,-0.577,0.577],
            //                     [-0.577,-0.577,-0.577],
            //                     [0.577,-0.577,-0.577],
            //                     [0.577,0.577,0.577],
            //                     [-0.577,0.577,0.577],
            //                     [-0.577,0.577,-0.577],
            //                     [0.577,0.577,-0.577],
            //                 ];

            //this.generateVertexColor();


            this.transformCamera();
            this.transformScreen();

            this.vertex=this.vertex.T;

            //取xy坐标
            var col0=this.vertex.slice(null,[0,1]);
            var col1=nj.subtract(nj.ones([this.vertex.shape[0],1]).multiply(this.canvasHeight),this.vertex.slice(null,[1,2]));
            var col3=this.vertex.slice(null,[2,3]);
            this.vertex=nj.concatenate(col0,col1,col3).tolist();


            for(let j=0;j<main.objectList[i].faces.length;j++)
            {
                var face=main.objectList[i].faces[j];

                var fragment=this.scanLine(face,j);


                // for(let k=0;k<fragment.length;k++)
                //     pipeline.drawPixel(fragment[k][0],fragment[k][1],"green");

                // this.drawLine(this.vertex[face[0]].slice(0,2),this.vertex[face[1]].slice(0,2),"black");
                // this.drawLine(this.vertex[face[0]].slice(0,2),this.vertex[face[2]].slice(0,2),"black");
                // this.drawLine(this.vertex[face[1]].slice(0,2),this.vertex[face[2]].slice(0,2),"black");   
            }

            this.ctx.putImageData(this.imageData, 0, 0);
            //for(let i=0;i<this.vertex.length;i++)
                //ctx.fillText((i).toString(),this.vertex[i][0],this.vertex[i][1]);
            
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
        this.canvasWidth=800;
        this.canvasHeight=600;
        this.sqr2=math.sqrt(2);

        //camera settings
        this.angleY=0;
        this.angleX=0;
        this.angleZ=0;

        //view frustum parameters
        this.cameraPos=[0,20,50];
        this.far=80;
        this.near=10;
        this.fovX=math.PI/2;
        this.fovY=math.PI/2;

        //light settings
        this.pointLight=[0,20,20];
        this.directionLight=normalize([-1,1,1]);

        this.objectList=[];
        this.textureData=[];
        this.textureWidth;
        this.textureHeight;

        this.canvas = document.getElementById('Canvas');
        this.ctx = this.canvas.getContext('2d');
        this.slider= document.getElementById('slider');

        this.canvas.setAttribute("width",this.canvasWidth);
        this.canvas.setAttribute("height",this.canvasHeight);

        this.IDList=["PositionX","PositionY","PositionZ","RotationX","RotationY","RotationZ","ScaleX","ScaleY","ScaleZ"];

        this.transfromTable={
            "PositionX":(value)=>{this.objectList[0].position[0]=Number(value);},
            "PositionY":(value)=>{this.objectList[0].position[1]=Number(value);},
            "PositionZ":(value)=>{this.objectList[0].position[2]=Number(value);},
            "RotationX":(value)=>{this.objectList[0].rotation[0]=Number(value);},
            "RotationY":(value)=>{this.objectList[0].rotation[1]=Number(value);},
            "RotationZ":(value)=>{this.objectList[0].rotation[2]=Number(value);},
            "ScaleX":(value)=>{this.objectList[0].scale[0]=Number(value);},
            "ScaleY":(value)=>{this.objectList[0].scale[1]=Number(value);},
            "ScaleZ":(value)=>{this.objectList[0].scale[2]=Number(value);},
        }

    }

    genGameObject(vertex,faces)
    {
        return new GameObject(vertex,faces);
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

main.canvas.addEventListener('click', Input.drawFace);