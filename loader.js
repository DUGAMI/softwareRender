export {Loader}

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

    static objLoader(e,fileName)
    {
        let result=e.target.result;
        let lines=result.split("\n");

        let vertex=[];
        let vertexNormal=[];
        let vertexUV=[];

        let faces=[];
        let facesNormalVectors=[];
        let UVIndexes=[];

        let materialName="";

        let vertexNum=0;
        let currentVertexNum=0;
        let vertexNormalNum=0;
        let currentVertexNormalNum=0;
        let vertexUVNum=0;
        let currentVertexUVNum=0;

        let currentMeshName="";
        let state="DEFAULT_MESH";


        for(let i=0;i<lines.length;i++)
        {
            var data=lines[i].split(" ");

            if(data[0]=='o'&&state=="DEFAULT_MESH")
            {
                state="MULTI_MESH";
                currentMeshName=data[1];
                continue;
            }
            else if(data[0]=='o'&&state=="MULTI_MESH")
            {   
                let vertexBaseIndex=vertexNum-currentVertexNum;
                let vertexNormalBaseIndex=vertexNormalNum-currentVertexNormalNum;
                let vertexUVBaseIndex=vertexUVNum-currentVertexUVNum;

                //redinex faces
                for(let j=0;j<faces.length;j++)
                {
                    faces[j][0]-=vertexBaseIndex;
                    faces[j][1]-=vertexBaseIndex;
                    faces[j][2]-=vertexBaseIndex;
                }

                if(facesNormalVectors.length!=0)
                {
                    for(let j=0;j<facesNormalVectors.length;j++)
                    {
                        facesNormalVectors[j][0]-=vertexNormalBaseIndex;
                        facesNormalVectors[j][1]-=vertexNormalBaseIndex;
                        facesNormalVectors[j][2]-=vertexNormalBaseIndex;
                    }
                }

                if(UVIndexes.length!=0)
                {
                    for(let j=0;j<UVIndexes.length;j++)
                    {
                        UVIndexes[j][0]-=vertexUVBaseIndex;
                        UVIndexes[j][1]-=vertexUVBaseIndex;
                        UVIndexes[j][2]-=vertexUVBaseIndex;
                    }
                }

                //update object list and selected object
                var newObject=window.main.genGameObject(vertex,faces,currentMeshName);
                newObject.vertexNormalVectors=vertexNormal;
                newObject.facesNormalVectors=facesNormalVectors;
                newObject.vertexUV=vertexUV;
                newObject.UVIndexes=UVIndexes;

                newObject.materialName=materialName;
                newObject.scale=[10,10,10];
                newObject.position=[0,0,0];

                window.main.objectList.push(newObject);
                window.main.selectedObject=window.main.objectList.length-1;

                vertex=[];
                vertexNormal=[];
                vertexUV=[];
                faces=[];
                facesNormalVectors=[];
                UVIndexes=[];

                currentVertexNum=0;
                currentVertexNormalNum=0;
                currentVertexUVNum=0;
                
                currentMeshName=data[1];
                continue;
            }

            
            if(data[0]=='v')
            {
                vertex.push([Number(data[1]),Number(data[2]),Number(data[3]),1]);
                vertexNum++;

                if(state=="MULTI_MESH")
                    currentVertexNum++;
            }
            else if(data[0]=='vn')
            {
                vertexNormal.push([Number(data[1]),Number(data[2]),Number(data[3])]);
                vertexNormalNum++;

                if(state=="MULTI_MESH")
                    currentVertexNormalNum++;
            }
            else if(data[0]=='vt')
            {
                vertexUV.push([Number(data[1]),Number(data[2])]);
                vertexUVNum++;

                if(state=="MULTI_MESH")
                    currentVertexUVNum++;
            }
            else if(data[0]=='usemtl')
            {
                materialName=data[1];
            }
            else if(data[0]=='f')
            {
                if(data.length-1==3)
                {
                    if(data[1].includes("/"))
                    {
                        faces.push([Number(data[1].split("/")[0])-1,Number(data[2].split("/")[0])-1,Number(data[3].split("/")[0])-1]);
                        facesNormalVectors.push([Number(data[1].split("/")[2])-1,Number(data[2].split("/")[2])-1,Number(data[3].split("/")[2])-1]);
                        UVIndexes.push([Number(data[1].split("/")[1])-1,Number(data[2].split("/")[1])-1,Number(data[3].split("/")[1])-1]);
                    }
                    else
                        faces.push([Number(data[1])-1,Number(data[2])-1,Number(data[3])-1]);
                }
                else if(data.length-1>3)
                {
                    //多边形的情况，以第一个顶点为基准，分割成n－2个三角形，依次连接基准顶点和其他顶点即可
                    for(let j=0;j<data.length-3;j++)
                    {
                        if(data[1].includes("/"))
                        {
                            faces.push([Number(data[1].split("/")[0])-1,Number(data[2+j].split("/")[0])-1,Number(data[3+j].split("/")[0])-1]);
                            facesNormalVectors.push([Number(data[1].split("/")[2])-1,Number(data[2+j].split("/")[2])-1,Number(data[3+j].split("/")[2])-1]);
                            UVIndexes.push([Number(data[1].split("/")[1])-1,Number(data[2+j].split("/")[1])-1,Number(data[3+j].split("/")[1])-1]);
                        }
                        else
                            faces.push([Number(data[1])-1,Number(data[2+j])-1,Number(data[3+j])-1]);
                    }
                }
            }
        }

        //last mesh or only one mesh
        if(state=="MULTI_MESH")
        {
            let vertexBaseIndex=vertexNum-currentVertexNum;
            let vertexNormalBaseIndex=vertexNormalNum-currentVertexNormalNum;
            let vertexUVBaseIndex=vertexUVNum-currentVertexUVNum;

            //redinex faces
            for(let j=0;j<faces.length;j++)
            {
                faces[j][0]-=vertexBaseIndex;
                faces[j][1]-=vertexBaseIndex;
                faces[j][2]-=vertexBaseIndex;
            }

            if(facesNormalVectors.length!=0)
            {
                for(let j=0;j<facesNormalVectors.length;j++)
                {
                    facesNormalVectors[j][0]-=vertexNormalBaseIndex;
                    facesNormalVectors[j][1]-=vertexNormalBaseIndex;
                    facesNormalVectors[j][2]-=vertexNormalBaseIndex;
                }
            }

            if(UVIndexes.length!=0)
            {
                for(let j=0;j<UVIndexes.length;j++)
                {
                    UVIndexes[j][0]-=vertexUVBaseIndex;
                    UVIndexes[j][1]-=vertexUVBaseIndex;
                    UVIndexes[j][2]-=vertexUVBaseIndex;
                }
            }

            var newObject=window.main.genGameObject(vertex,faces,currentMeshName);
        }
        else if(state=="DEFAULT_MESH")
        {
            var newObject=window.main.genGameObject(vertex,faces,fileName);
        }
        
        newObject.vertexNormalVectors=vertexNormal;
        newObject.facesNormalVectors=facesNormalVectors;
        newObject.vertexUV=vertexUV;
        newObject.UVIndexes=UVIndexes;

        newObject.materialName=materialName;
        newObject.scale=[10,10,10];
        newObject.position=[0,0,0];

        window.main.objectList.push(newObject);
        window.main.selectedObject=window.main.objectList.length-1;
    }
}