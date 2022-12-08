export const EarthVertexShader = /* glsl */`
varying vec2 dUv;
varying vec3 lightNormal;
void main() {
  dUv = uv; // Share the UV
  vec4 mdPosition = (modelViewMatrix) * vec4(position, 1.0); // get the ModelViewPosition
  lightNormal = normalize(sunDirection * vec3(1,1,1)) * normal; // Get the ModelNormal with respect to Sun's Position
  gl_Position = projectionMatrix * mdPosition  ; // The Global Position of each verticies
`;