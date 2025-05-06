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
    var norm=math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]+vector[2]*vector[2]);
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

export { vector3Add, vector2Add, vector3DotProduct, normalize, vector3multiply, vector2multiply, lerp};