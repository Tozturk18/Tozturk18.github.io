export const FragmentShader_pars = /* glsl */`
// The Day Texture of Earth
uniform sampler2D dayTexture;
// The Night Texture of Earth
uniform sampler2D nightTexture;

// The position of the Sun relative to Earth
uniform vec3 sunDirection;

// The UV of the Earth
varying vec2 dUv;
// The ModelNormal with respect to Sun's Position
varying vec3 lightNormal;
`;