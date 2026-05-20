 uniform sampler2D normalMap;
//uniform samplerCube envMap;
uniform sampler2D reflectionMap;

uniform float normalScale;
uniform vec2 waveSpeed1;
uniform vec2 waveSpeed2;

uniform bool useFresnel;
uniform bool useDiffuse;

uniform vec3 lightDir;
uniform vec3 waterColor;
uniform float waterOpacity;

uniform float time;

varying vec2 vUv;
varying vec3 vWorldPos;

vec2 sampleEquirectangular(vec3 dir) {
    float phi = atan(dir.z, dir.x);
    float theta = asin(dir.y);

    return vec2(
        0.5 + phi / (2.0 * 3.14159265),
        0.5 - theta / 3.14159265
    );
}            

void main() {

    // temporarily override for texture2d
    //gl_FragColor = texture2D(reflectionMap, vUv);
    //return;

    // temporarily override for texturecube
    //gl_FragColor = vec4(textureCube(reflectionMap, vec3(0.0, 1.0, 0.0)).rgb, 1.0);
    //return;

    // -------------------------
    // World-space UVs (stable)
    // -------------------------
    vec2 worldUv = vWorldPos.xz * 0.05;

    // -------------------------
    // Animated normal map (2 layers)
    // -------------------------
    vec2 uv1 = worldUv + vec2(time * waveSpeed1.x, time * waveSpeed1.y);
    vec2 uv2 = worldUv + vec2(-time * waveSpeed2.x, time * waveSpeed2.y);

    vec3 n1 = texture2D(normalMap, uv1).rgb;
    vec3 n2 = texture2D(normalMap, uv2).rgb;

    // combine + convert from [0,1] → [-1,1]
    vec3 normal = normalize(n1 * 2.0 - 1.0 + n2 * 2.0 - 1.0);

    // View direction
    vec3 viewDir = normalize(cameraPosition - vWorldPos);

    // Reflection vector (for skybox)
    vec3 reflectDir = reflect(-viewDir, normal);
    reflectDir.z *= -1.0;

    // reflection / environment map (skybox)
    //vec3 reflection = textureCube(reflectionMap, reflectDir).rgb;
    vec3 reflection = texture2D(reflectionMap, sampleEquirectangular(reflectDir)).rgb;

    // Fresnel (angle-based blend)
    float fresnel = 0.0;
    if (useFresnel) {
        fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 5.0);
        //fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
        //fresnel = clamp(fresnel, 0.2, 0.8);
    }

    // Fake diffuse lighting
    float diffuse = 1.0;
    if (useDiffuse) {
        diffuse = max(dot(normal, normalize(lightDir)), 0.0);
    }

        // Final color
        //vec3 color = mix(waterColor, reflection, fresnel);
        // apply lighting
        //color *= 0.5 + light * 0.5;
        //color = mix(color, waterColor, 0.2);

    // Output (semi-transparent)                    
    // temporary to only show reflection
    //gl_FragColor = vec4(reflection, 1.0);
    //return;

    vec3 base = waterColor * diffuse;
    vec3 color = mix(base, reflection, fresnel);
    
    gl_FragColor = vec4(color, waterOpacity);

        //float alpha = mix(0.4, 0.8, fresnel);
        //gl_FragColor = vec4(color, alpha);                     
}