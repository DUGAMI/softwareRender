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

function crossProductN(A,B)
{
    let cross=[(A[1]*B[2]-A[2]*B[1]),
                (A[2]*B[0]-A[0]*B[2]),
                (A[0]*B[1]-A[1]*B[0])];

    return cross;
}

function rayCas(o,d,p0,p1,p2)
{
    let e1=vector3Add(p1,vector3multiply(p0,-1));
    let e2=vector3Add(p2,vector3multiply(p0,-1));
    let s=vector3Add(o,vector3multiply(p0,-1));

    let n=crossProduct(e1,e2);
    let m=crossProduct(s,d);

    let a=1/(vector3DotProduct(vector3multiply(n,-1),d));
    let b=[vector3DotProduct(n,s),vector3DotProduct(m,e2),vector3DotProduct(vector3multiply(m,-1),e1)];

    let result=vector3multiply(b,a);

    if(result[1]>=0&&result[2]>=0&&result[1]+result[2]<=1)
        return [true,result];

    return [false,[0,0,0]];
}

function rayCast(o,d,p0,p1,p2)
{
    let e1=vector3Add(p1,vector3multiply(p0,-1));
    let e2=vector3Add(p2,vector3multiply(p0,-1));

    let q=crossProductN(d,e2);
    let a=vector3DotProduct(e1,q);

    if(a>-10e-5&&a<10e-5)
        return [false,[0,0,0]];

    let f=1/a;
    let s=vector3Add(o,vector3multiply(p0,-1));
    let u=f*vector3DotProduct(s,q);

    if(u<0)
        return [false,[0,0,0]];

    let r=crossProductN(s,e1);
    let v=f*vector3DotProduct(d,r);

    if(v<0||u+v>1)
        return [false,[0,0,0]];

    let t=f*vector3DotProduct(e2,r);
    return [true,[u,v,t]];
}

export {vector3Add, vector2Add, vector3DotProduct, normalize, vector3multiply, vector2multiply, lerp, barycentricInterpolate, crossProduct,rayCast};