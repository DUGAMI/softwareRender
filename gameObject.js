export {GameObject}

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

    parentTransformMartix=[];
    childList=[];

    constructor(vertex,faces,objectName)
    {
        this.vertex=vertex;
        this.faces=faces;
        this.objectName=objectName;
    }
}

// [
//     // left column front
//     100, -100, 100,
//     100,  100, 100,
//     -100,-100, 100,
//     -100, 100, 100,
//     -100,-100, 100,
//     100,  100, 100,

//     // top rung front
//     100, -100,-100,
//     100,  100,-100,
//     100, -100, 100,
//     100,  100, 100,
//     100, -100, 100,
//     100,  100,-100,

//     // middle rung front
//     100,  100,-100,
//     100, -100,-100,
//     -100, 100,-100,
//     -100,-100,-100,
//     -100, 100,-100,
//     100, -100,-100,

//     // left column back
//     -100,-100, 100,
//     -100, 100, 100,
//     -100,-100,-100,
//     -100, 100,-100,
//     -100,-100,-100,
//     -100, 100, 100,

//     // top rung back
//     100,  100, 100,
//     100,  100,-100,
//     -100, 100, 100,
//     -100, 100,-100,
//     -100, 100, 100,
//     100,  100,-100,

//     // middle rung back
//     100, -100, 100,
//     -100,-100, 100,
//     100, -100,-100,
//    -100, -100,-100,
//     100, -100,-100,
//     -100,-100, 100,

   
// ]