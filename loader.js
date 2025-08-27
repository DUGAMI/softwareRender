export {Loader}

class Loader
{
    //todo
    //1.把objloader修改的更鲁棒性一些
    //2.程序能很好的识别没有现成的法线向量的情况
    //3.法线向量能够根据物体的transfrom做相应的变化

    static objLoader(e,fileName)
    {
        var result=e.target.result;
        var lines=result.split("\n");

        var vertex=[];
        var vertexNormal=[];
        var faces=[];
        var facesNormalVectors=[];

        let vertexNum=0;
        let currentVertexNum=0;
        let vertexNormalNum=0;
        let currentVertexNormalNum=0;

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

                //update object list and selected object
                var newObject=window.main.genGameObject(vertex,faces,currentMeshName);
                newObject.vertexNormalVectors=vertexNormal;
                newObject.facesNormalVectors=facesNormalVectors;
                newObject.scale=[10,10,10];
                newObject.position=[0,0,0];

                window.main.objectList.push(newObject);
                window.main.selectedObject=window.main.objectList.length-1;

                vertex=[];
                vertexNormal=[];
                faces=[];
                facesNormalVectors=[];

                currentVertexNum=0;
                currentVertexNormalNum=0;
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
            else if(data[0]=='f')
            {
                if(data.length-1==3)
                {
                    if(data[1].includes("/"))
                    {
                        faces.push([Number(data[1].split("/")[0])-1,Number(data[2].split("/")[0])-1,Number(data[3].split("/")[0])-1]);
                        facesNormalVectors.push([Number(data[1].split("/")[2])-1,Number(data[2].split("/")[2])-1,Number(data[3].split("/")[2])-1]);
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

            var newObject=window.main.genGameObject(vertex,faces,currentMeshName);
        }
        else if(state=="DEFAULT_MESH")
        {
            var newObject=window.main.genGameObject(vertex,faces,fileName);
        }
        
        newObject.vertexNormalVectors=vertexNormal;
        newObject.facesNormalVectors=facesNormalVectors;
        newObject.scale=[10,10,10];
        newObject.position=[0,0,0];

        window.main.objectList.push(newObject);
        window.main.selectedObject=window.main.objectList.length-1;
    }
}