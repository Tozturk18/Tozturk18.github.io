export const EarthFragmentShader = /* glsl */`
vec3 dayColor = texture2D( dayTexture, dUv ).rgb;
vec3 nightColor = texture2D( nightTexture, dUv ).rgb;

// compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
float cosineAngleSunToNormal = dot(lightNormal, vec3(1,1,1));

// sharpen the edge beween the transition
cosineAngleSunToNormal = clamp( cosineAngleSunToNormal * 10.0, -1.0, 1.0);

// convert to 0 to 1 for mixing
float mixAmount = cosineAngleSunToNormal * 0.5 + 0.5 ;

// Select day or night texture based on mix.
vec3 color = mix( nightColor, dayColor, mixAmount );

vec4 diffuseColor = vec4( color, 1.0 );
// Map the Sphere with the Textures
//gl_FragColor = vec4( color, 1.0 );
`;