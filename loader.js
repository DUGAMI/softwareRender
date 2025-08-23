export {Loader}

class Loader
{
    static objLoader(e,fileName)
    {
        var result=e.target.result;
        var lines=result.split("\n");
        var onum=0;

        var vertex=[];
        var faces=[];

        for(let i=0;i<lines.length;i++)
        {
            var data=lines[i].split(" ");

            if(onum==2)
                break;
            
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
                else if(data.length-1>3)
                {
                    //多边形的情况，以第一个顶点为基准，分割成n－2个三角形，依次连接基准顶点和其他顶点即可
                    for(let j=0;j<data.length-3;j++)
                    {
                        if(data[1].includes("/"))
                            faces.push([Number(data[1].split("/")[0])-1,Number(data[2+j].split("/")[0])-1,Number(data[3+j].split("/")[0])-1]);
                        else
                            faces.push([Number(data[1])-1,Number(data[2+j])-1,Number(data[3+j])-1]);
                    }
                }
            }
            else if(data[0]=='o')
                onum++;
        }

        //update object list and selected object
        var newObject=window.main.genGameObject(vertex,faces,fileName);
        newObject.scale=[10,10,10];
        newObject.position=[0,0,0];

        window.main.objectList.push(newObject);
        window.main.selectedObject=window.main.objectList.length-1;
    }
}