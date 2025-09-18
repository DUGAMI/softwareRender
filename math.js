function vector3Add(A,B)
{
    return [A[0]+B[0],A[1]+B[1],A[2]+B[2]];
}

function vector2Add(A,B)
{
    return [A[0]+B[0],A[1]+B[1]];
}

function vector3DotProduct(A,B)
{
    return A[0]*B[0]+A[1]*B[1]+A[2]*B[2];
}

function normalize(vector)
{
    let norm=math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]+vector[2]*vector[2]);
    return [vector[0]/norm,vector[1]/norm,vector[2]/norm];
}

function vector3multiply(vector,a)
{
    return [vector[0]*a,vector[1]*a,vector[2]*a];
}

function vector2multiply(vector,a)
{
    return [vector[0]*a,vector[1]*a];
}
         
function lerp(a,b,alpha) 
{
    return a+alpha*(b-a);
}

function barycentricInterpolate(vertexs,x,y)
{
    let lamadaA=((vertexs[1][1]-vertexs[2][1])*(x-vertexs[2][0])+(vertexs[2][0]-vertexs[1][0])*(y-vertexs[2][1]))/
                    ((vertexs[1][1]-vertexs[2][1])*(vertexs[0][0]-vertexs[2][0])+(vertexs[2][0]-vertexs[1][0])*(vertexs[0][1]-vertexs[2][1]));

    let lamadaB=((vertexs[2][1]-vertexs[0][1])*(x-vertexs[2][0])+(vertexs[0][0]-vertexs[2][0])*(y-vertexs[2][1]))/
                    ((vertexs[1][1]-vertexs[2][1])*(vertexs[0][0]-vertexs[2][0])+(vertexs[2][0]-vertexs[1][0])*(vertexs[0][1]-vertexs[2][1]));

    let lamadaC=1-lamadaA-lamadaB;


    return [lamadaA,lamadaB,lamadaC];
}

function crossProduct(A,B)
{
    let cross=[(A[1]*B[2]-A[2]*B[1]),
                (A[2]*B[0]-A[0]*B[2]),
                (A[0]*B[1]-A[1]*B[0])];

    return normalize(cross);
}

export {vector3Add, vector2Add, vector3DotProduct, normalize, vector3multiply, vector2multiply, lerp, barycentricInterpolate, crossProduct};