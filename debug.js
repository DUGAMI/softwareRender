export{Debug}

class Debug
{
    //debug function
    static drawFace(event) 
    {

        const rect = window.main.canvas.getBoundingClientRect();

        let x=event.clientX - rect.left;
        let y=event.clientY - rect.top;

        let object=window.main.pipeline.ObjectBuffer[y][x];
        let faceIndex=window.main.pipeline.IDBuffer[y][x];

        let textureName=window.main.mtlMap[object.objectName].textureName;
        let faceUV=object.UVIndexes[faceIndex];

        let v1=object.vertexUV[faceUV[0]];
        let v2=object.vertexUV[faceUV[1]];
        let v3=object.vertexUV[faceUV[2]];


        console.log(`selected x:${x},y:${y}`);
        console.log(`Object Name is "${object.objectName}"`);
        console.log(`Texture Name is "${textureName}"`);

        console.log(`UV coordinates is ${v1}`);
    }

    static debugRaytracing(event) 
    {

        const rect = window.main.canvas.getBoundingClientRect();

        let x=event.clientX - rect.left;
        let y=event.clientY - rect.top;

        let index = (y * main.pipeline.viewPort.canvasWidth + x) * 4;
        let R=main.pipeline.buffer[index];   // R
        let G=main.pipeline.buffer[index + 1]; // G
        let B=main.pipeline.buffer[index + 2];   // B
        let A=main.pipeline.buffer[index + 3]; // A

        console.log(`selected x:${x},y:${y}`);
        console.log(`color is RGBA(${R},${G},${B},${A})`);

    }
}