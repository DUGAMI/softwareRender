import {Input} from './input.js';
import { Loader } from "./loader.js";

"use strict";

let vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// a letying the color to the fragment shader
out vec4 v_color;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

let fragmentShaderSource = `#version 300 es

precision highp float;

// the letied color passed from the vertex shader
in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;


// Draw the scene.
function drawScene() {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // turn on depth testing
  gl.enable(gl.DEPTH_TEST);

  // tell webgl to cull faces
  gl.enable(gl.CULL_FACE);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Compute the matrix
  let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  let zNear = 1;
  let zFar = 2000;
  let matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
  matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
  matrix = m4.xRotate(matrix, rotation[0]);
  matrix = m4.yRotate(matrix, rotation[1]);
  matrix = m4.zRotate(matrix, rotation[2]);
  matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

  // Set the matrix.
  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  // Draw the geometry.
  let primitiveType = gl.TRIANGLES;
  let offset = 0;
  let count = objectList[0].faces.length*3;
  gl.drawArrays(primitiveType, offset, count);
}

// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl) {

  let object=objectList[0];

  let vertexList=[];

  for(let i=0;i<object.faces.length;i++)
  {
    vertexList=vertexList.concat(object.vertex[object.faces[i][0]].slice(0,3));
    vertexList=vertexList.concat(object.vertex[object.faces[i][1]].slice(0,3));
    vertexList=vertexList.concat(object.vertex[object.faces[i][2]].slice(0,3));
  }

  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexList),gl.STATIC_DRAW);
}

// Fill the current ARRAY_BUFFER buffer with colors for the 'F'.
function setColors(gl) {

  let colorList=[];
  let color=[0,188,212]
  let object=objectList[0];


  for(let i=0;i<object.faces.length*3;i++)
  {
    colorList=colorList.concat(color);
  }
  
  gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(colorList),gl.STATIC_DRAW);
}



let m4 = {

  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    let rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0,
    ];
  },

  projection: function(width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function(a, b) {
    let a00 = a[0 * 4 + 0];
    let a01 = a[0 * 4 + 1];
    let a02 = a[0 * 4 + 2];
    let a03 = a[0 * 4 + 3];
    let a10 = a[1 * 4 + 0];
    let a11 = a[1 * 4 + 1];
    let a12 = a[1 * 4 + 2];
    let a13 = a[1 * 4 + 3];
    let a20 = a[2 * 4 + 0];
    let a21 = a[2 * 4 + 1];
    let a22 = a[2 * 4 + 2];
    let a23 = a[2 * 4 + 3];
    let a30 = a[3 * 4 + 0];
    let a31 = a[3 * 4 + 1];
    let a32 = a[3 * 4 + 2];
    let a33 = a[3 * 4 + 3];
    let b00 = b[0 * 4 + 0];
    let b01 = b[0 * 4 + 1];
    let b02 = b[0 * 4 + 2];
    let b03 = b[0 * 4 + 3];
    let b10 = b[1 * 4 + 0];
    let b11 = b[1 * 4 + 1];
    let b12 = b[1 * 4 + 2];
    let b13 = b[1 * 4 + 3];
    let b20 = b[2 * 4 + 0];
    let b21 = b[2 * 4 + 1];
    let b22 = b[2 * 4 + 2];
    let b23 = b[2 * 4 + 3];
    let b30 = b[3 * 4 + 0];
    let b31 = b[3 * 4 + 1];
    let b32 = b[3 * 4 + 2];
    let b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angleInRadians) {
    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);

    return [
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function(m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

};

function glReadObjFile(event)
{
    const file = event.target.files[0];

    let fileName=file.name.split(".")[0];

    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) 
        {
            let loader=new Loader();
            let object=loader.objLoader2(e,fileName);
            objectList.push(object);

            // and make it the one we're currently working with
            gl.bindVertexArray(vao);

            // Turn on the attribute
            gl.enableVertexAttribArray(positionAttributeLocation);

            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            // Set Geometry.
            setGeometry(gl);

            // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            let size = 3;          // 3 components per iteration
            let type = gl.FLOAT;   // the data is 32bit floats
            let normalize = false; // don't normalize the data
            let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            let offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                positionAttributeLocation, size, type, normalize, stride, offset);

            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            setColors(gl);

            // Turn on the attribute
            gl.enableVertexAttribArray(colorAttributeLocation);

            // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
            size = 3;          // 3 components per iteration
            type = gl.UNSIGNED_BYTE;   // the data is 8bit unsigned bytes
            normalize = true;  // convert from 0-255 to 0.0-1.0
            stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
            offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                colorAttributeLocation, size, type, normalize, stride, offset);

            drawScene();
        };

        reader.readAsText(file);
    }
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

// Get A WebGL context
/** @type {HTMLCanvasElement} */
let canvas = document.querySelector("#canvas");
canvas.width=800;
canvas.height=600;

// First let's make some letiables
// to hold the translation,
let translation = [0, 0, -360];
let rotation = [degToRad(0), degToRad(0), degToRad(0)];
let scale = [10, 10, 10];
let fieldOfViewRadians = degToRad(60);

let objectList=[];

let gl = canvas.getContext("webgl2");

// Use our boilerplate utils to compile the shaders and link into a program
let program = webglUtils.createProgramFromSources(gl,
    [vertexShaderSource, fragmentShaderSource]);

// look up where the vertex data needs to go.
let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
let colorAttributeLocation = gl.getAttribLocation(program, "a_color");

// look up uniform locations
let matrixLocation = gl.getUniformLocation(program, "u_matrix");

// Create a buffer
let positionBuffer = gl.createBuffer();

// Create a vertex array object (attribute state)
let vao = gl.createVertexArray();

// and make it the one we're currently working with
gl.bindVertexArray(vao);

// create the color buffer, make it the current ARRAY_BUFFER
// and copy in the color values
let colorBuffer = gl.createBuffer();

//drawScene();

// Setup a ui.
webglLessonsUI.setupSlider("#fieldOfView", {value: radToDeg(fieldOfViewRadians), slide: updateFieldOfView, min: 1, max:179 });
webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition(0), min: -200, max: 200 });
webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition(1), min: -200, max: 200 });
webglLessonsUI.setupSlider("#z",      {value: translation[2], slide: updatePosition(2), min: -1000, max: 0 });
webglLessonsUI.setupSlider("#angleX", {value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360});
webglLessonsUI.setupSlider("#angleY", {value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360});
webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360});
webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});
webglLessonsUI.setupSlider("#scaleZ", {value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2});

function updateFieldOfView(event, ui) {
  fieldOfViewRadians = degToRad(ui.value);
  drawScene();
}

function updatePosition(index) {
  return function(event, ui) {
    translation[index] = ui.value;
    drawScene();
  };
}

function updateRotation(index) {
  return function(event, ui) {
    let angleInDegrees = ui.value;
    let angleInRadians = degToRad(angleInDegrees);
    rotation[index] = angleInRadians;
    drawScene();
  };
}

function updateScale(index) {
  return function(event, ui) {
    scale[index] = ui.value;
    drawScene();
  };
}

document.getElementById('fileInput').addEventListener('change',glReadObjFile);