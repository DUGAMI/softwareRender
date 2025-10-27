export {Loader}
import {GameObject} from './gameObject.js';

class Loader
{
    //todo
    //1.把objloader修改的更鲁棒性一些
    //2.程序能很好的识别没有现成的法线向量的情况
    //3.法线向量能够根据物体的transfrom做相应的变化

    //读取obj文件里的纹理信息

    // 1.读取每个mesh里的材质信息（Gameobject对象添加材质名称）
    // 2.读取UV坐标索引

    // 从mtl文件中读取材质=>纹理映射
    // 先上传需要的纹理文件，然后把读取的纹理数据存入一个列表
    // 根据映射关系生成一个材质名称到像素数据的一个map

    // 利用纹理信息去渲染
    // 根据UV坐标索引获取UV坐标，然后从对应的材质=>纹理里采样
    // 在渲染某个像素时，获取对应面的三个顶点的RGB值，然后插值

    object=null;

    vertex=[];
    vertexNormal=[];
    vertexUV=[];

    faces=[];
    facesNormalVectors=[];
    UVIndexes=[];

    materialName="";

    vertexNum=0;
    faceNum=0;
    currentVertexNum=0;
    vertexNormalNum=0;
    currentVertexNormalNum=0;
    vertexUVNum=0;
    currentVertexUVNum=0;

    currentMeshName="";
    state="DEFAULT_MESH";


    objLoader(e,fileName)
    {
        let result=e.target.result;
        let lines=result.split("\n");

        for(let i=0;i<lines.length;i++)
        {
            let data=lines[i].split(" ");

            if(data[0]=='o'&&this.state=="DEFAULT_MESH")
            {
                this.state="MULTI_MESH";
                this.currentMeshName=data[1];

                this.object=window.main.genGameObject([],[],fileName);
                this.object.scale=[10,10,10];
                this.object.position=[0,0,0];

                window.main.objectList.push(this.object);
                window.main.selectedObject=window.main.objectList.length-1;

                continue;
            }
            else if(data[0]=='o'&&this.state=="MULTI_MESH")
            {   
                //add object to child list
                this.rebase();

                let newObject=window.main.genGameObject(this.vertex,this.faces,this.currentMeshName);
                newObject=this.genGameObject(newObject);
                newObject.scale=[1,1,1];

                this.object.childList.push(newObject);

                this.initMeshVaribles();

                this.currentMeshName=data[1];
                continue;
            }

            
            if(data[0]=='v')
            {
                this.vertex.push([Number(data[1]),Number(data[2]),Number(data[3]),1]);
                this.vertexNum++;

                if(this.state=="MULTI_MESH")
                    this.currentVertexNum++;
            }
            else if(data[0]=='vn')
            {
                this.vertexNormal.push([Number(data[1]),Number(data[2]),Number(data[3])]);
                this.vertexNormalNum++;

                if(this.state=="MULTI_MESH")
                    this.currentVertexNormalNum++;
            }
            else if(data[0]=='vt')
            {
                this.vertexUV.push([Number(data[1]),Number(data[2])]);
                this.vertexUVNum++;

                if(this.state=="MULTI_MESH")
                    this.currentVertexUVNum++;
            }
            else if(data[0]=='usemtl')
            {
                this.materialName=data[1];
            }
            else if(data[0]=='f')
            {
                this.faceNum++;

                if(data.length-1==3)
                {
                    if(data[1].includes("/"))
                    {
                        this.faces.push([Number(data[1].split("/")[0])-1,Number(data[2].split("/")[0])-1,Number(data[3].split("/")[0])-1]);
                        this.facesNormalVectors.push([Number(data[1].split("/")[2])-1,Number(data[2].split("/")[2])-1,Number(data[3].split("/")[2])-1]);
                        this.UVIndexes.push([Number(data[1].split("/")[1])-1,Number(data[2].split("/")[1])-1,Number(data[3].split("/")[1])-1]);
                    }
                    else
                        this.faces.push([Number(data[1])-1,Number(data[2])-1,Number(data[3])-1]);
                }
                else if(data.length-1>3)
                {
                    //多边形的情况，以第一个顶点为基准，分割成n－2个三角形，依次连接基准顶点和其他顶点即可
                    for(let j=0;j<data.length-3;j++)
                    {
                        if(data[1].includes("/"))
                        {
                            this.faces.push([Number(data[1].split("/")[0])-1,Number(data[2+j].split("/")[0])-1,Number(data[3+j].split("/")[0])-1]);
                            this.facesNormalVectors.push([Number(data[1].split("/")[2])-1,Number(data[2+j].split("/")[2])-1,Number(data[3+j].split("/")[2])-1]);
                            this.UVIndexes.push([Number(data[1].split("/")[1])-1,Number(data[2+j].split("/")[1])-1,Number(data[3+j].split("/")[1])-1]);
                        }
                        else
                            this.faces.push([Number(data[1])-1,Number(data[2+j])-1,Number(data[3+j])-1]);
                    }
                }
            }
        }

        //last mesh or only one mesh
        if(this.state=="MULTI_MESH")
        {
            this.rebase();

            let newObject=window.main.genGameObject(this.vertex,this.faces,this.currentMeshName);
            newObject=this.genGameObject(newObject);
            newObject.scale=[1,1,1];

            this.object.childList.push(newObject);
        }
        else if(this.state=="DEFAULT_MESH")
        {
            let newObject=window.main.genGameObject(this.vertex,this.faces,fileName);

            window.main.objectList.push(this.genGameObject(newObject));
            window.main.selectedObject=window.main.objectList.length-1;
        }

        console.log("vertex num:"+this.vertexNum);
        console.log("face num:"+this.faceNum);
    }

    objLoader2(e,fileName)
    {
        let result=e.target.result;
        let lines=result.split("\n");

        for(let i=0;i<lines.length;i++)
        {
            let data=lines[i].split(" ");

            if(data[0]=='o'&&this.state=="DEFAULT_MESH")
            {
                this.state="MULTI_MESH";
                this.currentMeshName=data[1];

                this.object=window.main.genGameObject([],[],fileName);
                this.object.scale=[10,10,10];
                this.object.position=[0,0,0];

                window.main.objectList.push(this.object);
                window.main.selectedObject=window.main.objectList.length-1;

                continue;
            }
            else if(data[0]=='o'&&this.state=="MULTI_MESH")
            {   
                //add object to child list
                this.rebase();

                let newObject=window.main.genGameObject(this.vertex,this.faces,this.currentMeshName);
                newObject=this.genGameObject(newObject);
                newObject.scale=[1,1,1];

                this.object.childList.push(newObject);

                this.initMeshVaribles();

                this.currentMeshName=data[1];
                continue;
            }

            
            if(data[0]=='v')
            {
                this.vertex.push([Number(data[1]),Number(data[2]),Number(data[3]),1]);
                this.vertexNum++;

                if(this.state=="MULTI_MESH")
                    this.currentVertexNum++;
            }
            else if(data[0]=='vn')
            {
                this.vertexNormal.push([Number(data[1]),Number(data[2]),Number(data[3])]);
                this.vertexNormalNum++;

                if(this.state=="MULTI_MESH")
                    this.currentVertexNormalNum++;
            }
            else if(data[0]=='vt')
            {
                this.vertexUV.push([Number(data[1]),Number(data[2])]);
                this.vertexUVNum++;

                if(this.state=="MULTI_MESH")
                    this.currentVertexUVNum++;
            }
            else if(data[0]=='usemtl')
            {
                this.materialName=data[1];
            }
            else if(data[0]=='f')
            {
                this.faceNum++;

                if(data.length-1==3)
                {
                    if(data[1].includes("/"))
                    {
                        this.faces.push([Number(data[1].split("/")[0])-1,Number(data[2].split("/")[0])-1,Number(data[3].split("/")[0])-1]);
                        this.facesNormalVectors.push([Number(data[1].split("/")[2])-1,Number(data[2].split("/")[2])-1,Number(data[3].split("/")[2])-1]);
                        this.UVIndexes.push([Number(data[1].split("/")[1])-1,Number(data[2].split("/")[1])-1,Number(data[3].split("/")[1])-1]);
                    }
                    else
                        this.faces.push([Number(data[1])-1,Number(data[2])-1,Number(data[3])-1]);
                }
                else if(data.length-1>3)
                {
                    //多边形的情况，以第一个顶点为基准，分割成n－2个三角形，依次连接基准顶点和其他顶点即可
                    for(let j=0;j<data.length-3;j++)
                    {
                        if(data[1].includes("/"))
                        {
                            this.faces.push([Number(data[1].split("/")[0])-1,Number(data[2+j].split("/")[0])-1,Number(data[3+j].split("/")[0])-1]);
                            this.facesNormalVectors.push([Number(data[1].split("/")[2])-1,Number(data[2+j].split("/")[2])-1,Number(data[3+j].split("/")[2])-1]);
                            this.UVIndexes.push([Number(data[1].split("/")[1])-1,Number(data[2+j].split("/")[1])-1,Number(data[3+j].split("/")[1])-1]);
                        }
                        else
                            this.faces.push([Number(data[1])-1,Number(data[2+j])-1,Number(data[3+j])-1]);
                    }
                }
            }
        }

        //last mesh or only one mesh
        if(this.state=="MULTI_MESH")
        {
            this.rebase();

            let newObject=window.main.genGameObject(this.vertex,this.faces,this.currentMeshName);
            newObject=this.genGameObject(newObject);
            newObject.scale=[1,1,1];

            this.object.childList.push(newObject);
        }
        else if(this.state=="DEFAULT_MESH")
        {
            let newObject=new GameObject(this.vertex,this.faces,fileName);
            return newObject;
        }

        console.log("vertex num:"+this.vertexNum);
        console.log("face num:"+this.faceNum);
    }

    //split the vertex index in faces to make it start from 0
    rebase()
    {
        let vertexBaseIndex=this.vertexNum-this.currentVertexNum;
        let vertexNormalBaseIndex=this.vertexNormalNum-this.currentVertexNormalNum;
        let vertexUVBaseIndex=this.vertexUVNum-this.currentVertexUVNum;

        //redinex faces
        for(let j=0;j<this.faces.length;j++)
        {
            this.faces[j][0]-=vertexBaseIndex;
            this.faces[j][1]-=vertexBaseIndex;
            this.faces[j][2]-=vertexBaseIndex;
        }

        if(this.facesNormalVectors.length!=0)
        {
            for(let j=0;j<this.facesNormalVectors.length;j++)
            {
                this.facesNormalVectors[j][0]-=vertexNormalBaseIndex;
                this.facesNormalVectors[j][1]-=vertexNormalBaseIndex;
                this.facesNormalVectors[j][2]-=vertexNormalBaseIndex;
            }
        }

        if(this.UVIndexes.length!=0)
        {
            for(let j=0;j<this.UVIndexes.length;j++)
            {
                this.UVIndexes[j][0]-=vertexUVBaseIndex;
                this.UVIndexes[j][1]-=vertexUVBaseIndex;
                this.UVIndexes[j][2]-=vertexUVBaseIndex;
            }
        }

    }

    genGameObject(object)
    {
        object.vertexNormalVectors=this.vertexNormal;
        object.facesNormalVectors=this.facesNormalVectors;
        object.vertexUV=this.vertexUV;
        object.UVIndexes=this.UVIndexes;

        object.materialName=this.materialName;
        object.scale=[10,10,10];
        object.position=[0,0,0];

        return object;
    }

    initMeshVaribles()
    {
        this.vertex=[];
        this.vertexNormal=[];
        this.vertexUV=[];
        this.faces=[];
        this.facesNormalVectors=[];
        this.UVIndexes=[];

        this.currentVertexNum=0;
        this.currentVertexNormalNum=0;
        this.currentVertexUVNum=0;
    }

}