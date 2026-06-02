import"./buttonEventListeners-MX2G9K3W.js";import{a as re,g as we,C as N,r as ot,V as b,q as de,s as ke,t as Ge,H as nt,n as I,U as st,l as w,u as ee,B as at,M as lt,v as ct,w as Ue,x as We,T as L,R as V,L as be,S as B,y as ge,z as Be,A as dt,F as ht,J as X,K as E,N as Z,I as Me,P as q,O as Pe,Q as ut,X as ft,m as mt,Y as le,Z as pt,_ as vt,$ as gt,a0 as yt,a1 as xt,b as wt,k as bt,f as Mt,e as $e,E as De,d as Ct,W as Tt,D as _e,j as Oe,a2 as Fe,i as St,h as kt,c as Pt,G as Dt,a3 as _t}from"./terrainSimplexNoiseGenerator-DJx5pUQM.js";import{M as Ot}from"./meshGenerator-B0do2HM7.js";class ue extends re{constructor(e,t={}){super(e),this.isReflector=!0,this.type="Reflector",this.camera=new we;const o=this,r=t.color!==void 0?new N(t.color):new N(8355711),n=t.textureWidth||512,a=t.textureHeight||512,s=t.clipBias||0,l=t.shader||ue.ReflectorShader,c=t.multisample!==void 0?t.multisample:4,d=new ot,u=new b,f=new b,y=new b,m=new de,p=new b(0,0,-1),v=new ke,x=new b,C=new b,A=new ke,$=new de,F=this.camera,se=new Ge(n,a,{samples:c,type:nt}),ae=new I({name:l.name!==void 0?l.name:"unspecified",uniforms:st.clone(l.uniforms),fragmentShader:l.fragmentShader,vertexShader:l.vertexShader});ae.uniforms.tDiffuse.value=se.texture,ae.uniforms.color.value=r,ae.uniforms.textureMatrix.value=$,this.material=ae,this.onBeforeRender=function(_,et,K){if(f.setFromMatrixPosition(o.matrixWorld),y.setFromMatrixPosition(K.matrixWorld),m.extractRotation(o.matrixWorld),u.set(0,0,1),u.applyMatrix4(m),x.subVectors(f,y),x.dot(u)>0)return;x.reflect(u).negate(),x.add(f),m.extractRotation(K.matrixWorld),p.set(0,0,-1),p.applyMatrix4(m),p.add(y),C.subVectors(f,p),C.reflect(u).negate(),C.add(f),F.position.copy(x),F.up.set(0,1,0),F.up.applyMatrix4(m),F.up.reflect(u),F.lookAt(C),F.far=K.far,F.updateMatrixWorld(),F.projectionMatrix.copy(K.projectionMatrix),$.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),$.multiply(F.projectionMatrix),$.multiply(F.matrixWorldInverse),$.multiply(o.matrixWorld),d.setFromNormalAndCoplanarPoint(u,f),d.applyMatrix4(F.matrixWorldInverse),v.set(d.normal.x,d.normal.y,d.normal.z,d.constant);const R=F.projectionMatrix;A.x=(Math.sign(v.x)+R.elements[8])/R.elements[0],A.y=(Math.sign(v.y)+R.elements[9])/R.elements[5],A.z=-1,A.w=(1+R.elements[10])/R.elements[14],v.multiplyScalar(2/v.dot(A)),R.elements[2]=v.x,R.elements[6]=v.y,R.elements[10]=v.z+1-s,R.elements[14]=v.w,o.visible=!1;const tt=_.getRenderTarget(),it=_.xr.enabled,rt=_.shadowMap.autoUpdate;_.xr.enabled=!1,_.shadowMap.autoUpdate=!1,_.setRenderTarget(se),_.state.buffers.depth.setMask(!0),_.autoClear===!1&&_.clear(),_.render(et,F),_.xr.enabled=it,_.shadowMap.autoUpdate=rt,_.setRenderTarget(tt);const Se=K.viewport;Se!==void 0&&_.state.viewport(Se),o.visible=!0},this.getRenderTarget=function(){return se},this.dispose=function(){se.dispose(),o.material.dispose()}}}ue.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,fragmentShader:`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};class Y{constructor(e,t,o,r){this.scene=e,this.bounds=t,this.lod=o,this.isDebug=r}lodColors=[1315860,8965188,16711935,65535,16776960,16711680,65280,65535,16777215];children=[];mesh;grassBillboards;grassInstancedMesh;grassInstancedMeshMaterial;grassInstancedMeshCounter=0;treeBillboards;instancedTreeMesh;helperLabel;helperMesh;split(e){let t=this.bounds.getCenter(new w),o=new Y(e,new ee(new w(this.bounds.min.x,this.bounds.min.y),t),this.lod+1,this.isDebug),r=new Y(e,new ee(new w(this.bounds.min.x,t.y),new w(t.x,this.bounds.max.y)),this.lod+1,this.isDebug),n=new Y(e,new ee(new w(t.x,this.bounds.min.y),new w(this.bounds.max.x,t.y)),this.lod+1,this.isDebug),a=new Y(e,new ee(t,new w(this.bounds.max.x,this.bounds.max.y)),this.lod+1,this.isDebug);this.children.push(o),this.children.push(r),this.children.push(n),this.children.push(a),console.log(`Splitting node (LOD ${this.lod}) with bounds: min(${this.bounds.min.x}, ${this.bounds.min.y}) -> max(${this.bounds.max.x}, ${this.bounds.max.y})`),console.log(`- Upper Left  :  min(${o.bounds.min.x}, ${o.bounds.min.y}) -> max(${o.bounds.max.x}, ${o.bounds.max.y})`),console.log(`- Lower Left  :  min(${r.bounds.min.x}, ${r.bounds.min.y}) -> max(${r.bounds.max.x}, ${r.bounds.max.y})`),console.log(`- Upper Right :  min(${n.bounds.min.x}, ${n.bounds.min.y}) -> max(${n.bounds.max.x}, ${n.bounds.max.y})`),console.log(`- Upper Left  :  min(${a.bounds.min.x}, ${a.bounds.min.y}) -> max(${a.bounds.max.x}, ${a.bounds.max.y})`),console.log("----------------------------------------"),this.helperMesh?.disposeMeshAndRemoveFromScene(e)}getLevelOfDetailColor(){return new N(this.lodColors[this.lod])}switchIsDebug(e){this.children.length>0&&this.children.forEach(t=>t.switchIsDebug(e)),this.isDebug=e}clearGrassBillboards(){this.grassBillboards!=null&&this.grassBillboards?.disposeAndRemoveFromScene(this.scene)}clearGrassInstancedMesh(){this.grassInstancedMesh!=null&&this.grassInstancedMesh?.disposeMeshAndRemoveFromScene(this.scene)}clearInstancedTreeMeshes(){this.instancedTreeMesh!=null&&this.instancedTreeMesh?.disposeMeshAndRemoveFromScene(this.scene)}clearTreeBillboards(){this.treeBillboards!=null&&this.treeBillboards?.disposeAndRemoveFromScene(this.scene)}merge(e){this.children.forEach(t=>{t.cleanUpMeshesAndObjects(e)}),this.children.length=0}cleanUpMeshesAndObjects(e){this.mesh?.disposeMeshAndRemoveFromScene(e),this.grassBillboards?.disposeAndRemoveFromScene(e),this.grassInstancedMesh?.disposeMeshAndRemoveFromScene(e),this.treeBillboards?.disposeAndRemoveFromScene(e),this.instancedTreeMesh?.disposeMeshAndRemoveFromScene(e),this.isDebug&&(this.helperLabel?.disposeAndRemoveFromScene(e),this.helperMesh?.disposeMeshAndRemoveFromScene(e))}getChildren(){let e=[];return this.children.length==0?(e.push(this),e):(this.children.forEach(t=>{e.push(...this.getChildren())}),e)}getTotalNodeCount(){if(this.children==null||this.children?.length==0)return 1;let e=0;for(const t of this.children)e+=t.getTotalNodeCount();return e}generateGrassBillboards(e){this.grassBillboards=e.generateBillboardsForNode(this.isDebug,this.bounds,3,this.getLevelOfDetailColor())}generateGrassInstancedMesh(e){this.grassInstancedMesh=e.generateInstancedMeshForNode(this.isDebug,this.bounds,1e4,3,this.getLevelOfDetailColor())}generateTreeBillboards(e){this.treeBillboards=e.generateBillboardsForNode(this.isDebug,this.bounds,10,this.getLevelOfDetailColor(),30,60)}generateTreeModels(e){this.instancedTreeMesh=e.generateInstancedMeshForNode(this.isDebug,this.bounds,1e4,10,this.getLevelOfDetailColor(),30,60)}update(){if(this.grassInstancedMesh?.material){let e=this.grassInstancedMesh.material;e.uniforms.uTime.value+=.01}}getGrassBillboardsCount(){return(this.grassBillboards?.geometry??null)?.attributes.position.count??null}getTreeBillboardsCount(){return(this.treeBillboards?.geometry??null)?.attributes.position.count??null}generateDebugLabelAndMesh(){this.helperLabel?.disposeAndRemoveFromScene(this.scene),this.helperMesh?.disposeMeshAndRemoveFromScene(this.scene);let e=this.bounds.getCenter(new w);this.helperLabel=this.createTextLabel(`${this.lod}`,new N(this.lodColors[this.lod]),1,.5,96),this.helperLabel.position.set(e.x,200,-e.y).add(new b(0,.5,0));const t=this.bounds.max.x-this.bounds.min.x,o=this.bounds.max.y-this.bounds.min.y,r=100,n=new at(t,r,o),a=new lt({color:this.lodColors[this.lod],transparent:!1,wireframe:!0});this.helperMesh=new re(n,a),this.helperMesh.position.copy(this.helperLabel.position),this.helperMesh.position.set(e.x,r/2,-e.y)}createTextLabel(e,t,o=1,r=.5,n=64){const a=document.createElement("canvas"),s=a.getContext("2d");s.font=`${n}px Arial`;const c=s.measureText(e).width,d=n*1.2;a.width=c+20,a.height=d+20,s.font=`${n}px Arial`;const u=`rgba(${t.r*255}, ${t.g*255}, ${t.b*255}, ${o})`;s.fillStyle=u,s.textAlign="center",s.textBaseline="middle",s.fillText(e,a.width/2,a.height/2);const f=new ct(a);f.needsUpdate=!0;const y=new Ue({map:f,transparent:!0}),m=new We(y);return m.scale.set(a.width*r,a.height*r,1),m}}class Ft{constructor(e,t,o,r,n,a,s,l,c,d){this.scene=e,this.terrainSimplexNoiseGenerator=o,this.treeGenerator=r,this.grassGenerator=n,this.isDebug=d,this.bounds=t,this.root=new Y(e,t,this.maxLOD,d),this.meshGenerator=new Ot,this.terrainGeneratorParams=a,this.MIN_NODE_SIZE=s,this.verticesPerChunk=l,this.heightFactor=c,this.highDetailShaderMaterial=this.generateMaterial(4,c,d),this.lowDetailShaderMaterial=this.generateMaterial(2,c,d),this.maxLOD=0}meshGenerator;root;bounds;highDetailShaderMaterial;lowDetailShaderMaterial;terrainGeneratorParams;MIN_NODE_SIZE=50;verticesPerChunk;heightFactor;maxLOD=0;minLODForDetails=3;insert(e,t){this.insertAtNode(this.root,e,t)}insertAtNode(e,t,o){let r=e.bounds.getCenter(new w).distanceTo(t),n=e.bounds.getSize(new w).x;r<n&&n>this.MIN_NODE_SIZE?(e.children.length==0&&e.split(o),e.children.forEach(a=>{this.insertAtNode(a,t,o)})):e.children.length>0&&e.merge(o)}switchIsDebug(e){this.isDebug=e,this.root.switchIsDebug(e)}getCurrentMaxLOD(e){let t=0;function o(r){r.lod>t&&(t=r.lod);for(const n of r.children)o(n)}return o(e),t}getQuadtreeMaxLOD(){let e=0,t=this.root;function o(r){r.lod>e&&(e=r.lod);for(const n of r.children)o(n)}return o(t),e}getTotalNodeCount(){return this.root.getTotalNodeCount()}updateMeshes(e){this.generateMesh(this.root,e)}isHighLOD(e){let t=this.getQuadtreeMaxLOD();return e.lod>=t-1}isMediumLOD(e){let t=this.getQuadtreeMaxLOD();return e.lod>=t-2}generateMesh(e,t){if(e.children.length>0){e.children.forEach(o=>{this.generateMesh(o,t)}),e.mesh!=null&&(e.mesh.visible=!1),e.grassBillboards!=null&&(e.grassBillboards.visible=!1),e.grassInstancedMesh!=null&&(e.grassInstancedMesh.visible=!1),e.treeBillboards!=null&&(e.treeBillboards.visible=!1),e.instancedTreeMesh!=null&&(e.instancedTreeMesh.visible=!1),this.isDebug&&(e.helperLabel!=null&&(e.helperLabel.visible=!1),e.helperMesh!=null&&(e.helperMesh.visible=!1));return}else{if(e.mesh)e.mesh.visible=!0;else{let o=e.bounds.getSize(new w).x,r=this.meshGenerator.createPlaneMeshFromNoise(e.bounds.getCenter(new w).x,e.bounds.getCenter(new w).y,this.terrainSimplexNoiseGenerator,o,this.verticesPerChunk,o<=this.MIN_NODE_SIZE?this.highDetailShaderMaterial:this.lowDetailShaderMaterial,0,this.terrainGeneratorParams);r.receiveShadow=!1;let n=e.bounds.getCenter(new w);r.position.setX(n.x),r.position.setZ(-n.y),console.log(`Generating mesh for node: size ${o}
                    // LOD ${e.lod}
                    // bounds min(${e.bounds.min.x}, ${e.bounds.min.y}) -> max(${e.bounds.max.x}, ${e.bounds.max.y})
                    // translating (${n.x}, ${n.y}) `),e.mesh=r,t.add(e.mesh)}this.isHighLOD(e)?(this.generateAndDisplayGrassInstancedMesh(e,t),e.clearGrassBillboards(),this.generateAndDisplayTreeInstancedMesh(e,t),e.clearTreeBillboards()):this.isMediumLOD(e)&&(this.generateAndDisplayGrassBillboards(e,t),e.clearGrassInstancedMesh(),this.generateAndDisplayTreeBillboards(e,t),e.clearInstancedTreeMeshes())}this.isDebug&&((!e.helperLabel||!e.helperMesh)&&(e.generateDebugLabelAndMesh(),t.add(e.helperLabel),t.add(e.helperMesh)),e.helperLabel.visible=!0,e.helperMesh.visible=!0)}generateAndDisplayGrassInstancedMesh(e,t){e.grassInstancedMesh?(e.grassInstancedMesh.visible=!0,e.update()):(e.generateGrassInstancedMesh(this.grassGenerator),t.add(e.grassInstancedMesh))}generateAndDisplayGrassBillboards(e,t){e.grassBillboards?(e.grassBillboards.visible=!0,e.update()):(e.generateGrassBillboards(this.grassGenerator),t.add(e.grassBillboards))}generateAndDisplayTreeInstancedMesh(e,t){e.instancedTreeMesh?(e.instancedTreeMesh.visible=!0,e.update()):(e.generateTreeModels(this.treeGenerator),t.add(e.instancedTreeMesh))}generateAndDisplayTreeBillboards(e,t){e.treeBillboards?(e.treeBillboards.visible=!0,e.update()):(e.generateTreeBillboards(this.treeGenerator),t.add(e.treeBillboards))}generateMaterial(e,t,o){const r=new L,n=this.loadAndConfigureTexture(r,"assets/sand_32x32.png",e),a=this.loadAndConfigureTexture(r,"assets/tileable_grass_00_32x32.png",e),s=this.loadAndConfigureTexture(r,"assets/stone_32x32.png",e),l=this.loadAndConfigureTexture(r,"assets/stone_32x32.png",e),c=this.loadAndConfigureTexture(r,"assets/snow_32x32.png",e);return new I({uniforms:{lowTexture:{value:n},lowMidTexture:{value:a},midTexture:{value:s},highMidTexture:{value:l},highTexture:{value:c},repeats:{value:e},heightFactor:{value:t}},vertexShader:this.vertexShader4(),fragmentShader:this.fragmentShader4(),wireframe:o})}loadAndConfigureTexture(e,t,o){const r=e.load(t);return r.wrapS=V,r.wrapT=V,r.magFilter=be,r.colorSpace=B,r.repeat.set(o,o),r}vertexShader4(){return`
      //#include <logdepthbuf_pars_vertex>

      varying vec3 vPosition;
      varying vec2 vUv;
      varying float vFogDepth;

      void main() {
        vPosition = position;
        vUv = uv;
        
        // Calculate model-view position (required for fog)
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        // Pass the fog depth (distance from the camera)
        vFogDepth = -mvPosition.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        //#include <logdepthbuf_vertex>
      }
      `}fragmentShader4(){return`
      //#include <logdepthbuf_pars_fragment>

      uniform sampler2D lowTexture;
      uniform sampler2D lowMidTexture;
      uniform sampler2D midTexture;
      uniform sampler2D highMidTexture;
      uniform sampler2D highTexture;      
      
      uniform float repeats;
      uniform float heightFactor;

      uniform vec3 fogColor;
      uniform float fogNear;
      uniform float fogFar;

      varying vec3 vPosition;      
      varying vec2 vUv;
      varying float vFogDepth;

      void main() {
        float height = vPosition.z / heightFactor; // Normalize height to 0.0 - 1.0

        vec2 repeatedUv = vUv * repeats; // Adjust the number of repetitions here

        vec4 lowColor = texture2D(lowTexture, repeatedUv);
        vec4 lowMidColor = texture2D(lowMidTexture, repeatedUv);
        vec4 midColor = texture2D(midTexture, repeatedUv);
        vec4 highMidColor = texture2D(highMidTexture, repeatedUv);
        vec4 highColor = texture2D(highTexture, repeatedUv);

        vec4 color = mix(lowColor, lowMidColor, smoothstep(0.0, 0.1, height));
        color = mix(color, midColor, smoothstep(0.1, 0.5, height));
        color = mix(color, highMidColor, smoothstep(0.5, 0.75, height));
        color = mix(color, highColor, smoothstep(0.75, 1.0, height));

        gl_FragColor = color;

        
        //// Fog factor calculation (standard linear fog)
        //float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

        //// Mix base color with fog color based on fog factor
        //gl_FragColor = vec4(mix(color.rgb, fogColor, fogFactor), color.a);

        //#include <logdepthbuf_fragment>
      }
        `}}class zt{constructor(e,t,o,r,n){this.simplexNoiseGenerator=t,this.yMin=r,this.yMax=n,this.sprite=new L().load(o),this.sprite.colorSpace=B,this.sprite.wrapS=this.sprite.wrapT=ge,this.pointsMaterial=new Be({size:50,sizeAttenuation:!0,map:this.sprite,alphaTest:.5,transparent:!0,depthTest:!0,depthWrite:!1,vertexColors:!0})}sprite;pointsMaterial;geometry=new dt(.1,5,25,4);instancedMeshMaterial=new ht({vertexColors:!1});counter=0;generateBillboardsForNode(e,t,o,r,n,a){console.log(`generateBillboardsForNode for node with bounds: min(${t.min.x}, ${t.min.y}) -> max(${t.max.x}, ${t.max.y})`);const s=o,l=new X,c=[],d=[];var u=t.min.x-Math.abs(t.min.x)%s,f=Math.floor(t.max.x/s)*s,y=t.min.y-Math.abs(t.min.y)%s,m=Math.floor(t.max.y/s)*s;for(let p=u+1;p<f;p+=s)for(let v=y+1;v<m;v+=s){let x=this.simplexNoiseGenerator.getHeightFromNoiseFunction(p,v);x>n&&x<a&&(c.push(p,x+3,-v),e?d.push(r.r,r.g,r.b):d.push(0,1,0))}return l.setAttribute("position",new E(c,3)),l.setAttribute("color",new E(d,3)),console.log(`tree billboards count for node: ${c.length/3}`),new Z(l,this.pointsMaterial)}generateInstancedMeshForNode(e,t,o,r,n,a,s){const l=r;console.log(`generateInstancedMeshForNode for node with bounds: min(${t.min.x}, ${t.min.y}) -> max(${t.max.x}, ${t.max.y})`),this.counter=0;const c=new Me(this.geometry.clone(),this.instancedMeshMaterial,o);var d=!1,u=t.min.x-Math.abs(t.min.x)%l,f=Math.floor(t.max.x/l)*l,y=t.min.y-Math.abs(t.min.y)%l,m=Math.floor(t.max.y/l)*l;const p=new de,v=new N("green");for(let x=u+1;x<f;x+=l){for(let C=y+1;C<m;C+=l){let A=this.simplexNoiseGenerator.getHeightFromNoiseFunction(x,C);if(A>a&&A<s&&(p.setPosition(x,A+10,-C),this.counter++,c.setMatrixAt(this.counter,p),e?c.setColorAt(this.counter,n):c.setColorAt(this.counter,v)),this.counter>o&&(d=!0),d)break}if(d)break}return c.count=this.counter,console.log(`tree instanced mesh count for node: ${c.count}`),c.visible=!0,c}}const At=`\r
// per primitive\r
uniform float uTime;\r
uniform float uVelocity;\r
uniform vec3 uCameraPosition;\r
uniform float uRainSpawnY;\r
uniform float dropletSize;\r
\r
// per verfex\r
attribute float velocity;\r
\r
// per fragment\r
varying float vIsReset;\r
varying float vAlpha;\r
varying float vVelocity;\r
varying float vAngle;     // rotation to apply in fragment\r
varying float vPointSize; // pass point size to fragment if desired\r
\r
void main() {             \r
                           \r
    vec3 newPosition = position;\r
                    \r
    newPosition.y -= uVelocity * velocity * uTime; // Update position based on velocity and time\r
    newPosition.y = mod(newPosition.y, uRainSpawnY); // scale into range of 0->uRainSpawnY\r
    /*\r
        // Detect recent reset (optional, for visuals)\r
        vIsReset = step(frac, 0.05);\r
        \r
        // usage of mix: false, true, boolean\r
        newPosition.x = mix(position.x, position.x + uCameraPosition.x, vIsReset);\r
        newPosition.z = mix(position.z, position.z + uCameraPosition.z, vIsReset);\r
    */\r
\r
    // view-space transform\r
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);\r
    gl_Position = projectionMatrix * mvPosition;\r
    \r
    // Proper size attenuation based on distance to camera\r
    float dist = -mvPosition.z; // camera-space depth\r
    float attenuation = clamp(100.0 / dist, 0.0, 1.0);\r
    gl_PointSize = dropletSize * attenuation;                    \r
    \r
    vVelocity = velocity;\r
\r
    //float t = (uTime * uVelocity + position.y) / uRainSpawnY;\r
    //float frac = fract(t);\r
    vAlpha = 0.3;// - frac;\r
                        \r
    // ---- compute screen-space direction of world up (0,1,0) at this particle ----\r
    // clip space for worldPos\r
    vec4 clip = projectionMatrix * mvPosition; // same as gl_Position\r
    // compute clip for a small step up in world space\r
    vec4 clipUp = projectionMatrix * (modelViewMatrix * vec4(newPosition + vec3(0.0, 1.0, 0.0), 1.0));\r
\r
    // convert to NDC (divide by w)\r
    vec2 ndc = clip.xy / clip.w;\r
    vec2 ndcUp = clipUp.xy / clipUp.w;\r
\r
    // direction in NDC space (screen-space direction)\r
    vec2 dir = ndcUp - ndc;\r
\r
    // avoid zero-length; normalize direction to get angle\r
    float len = length(dir);\r
    if (len < 1e-6) {\r
        // fallback -> straight up in screen space\r
        vAngle = 0.0;\r
    } else {\r
        float angleDir = atan(dir.y, dir.x);\r
        // rotate so that the point-sprite's local +Y (0,1) aligns with dir\r
        // angle for (0,1) is +pi/2, so subtract that\r
        vAngle = angleDir - 1.57079632679;\r
    }\r
}`,Lt=`uniform float blueColor;\r
\r
varying float vAlpha;\r
varying float vVelocity;\r
varying float vAngle;\r
\r
void main() {\r
\r
    // Convert gl_PointCoord from [0,1] to centered [-1,1]\r
    vec2 uv = gl_PointCoord * 2.0 - 1.0;\r
\r
    // rotate uv by -vAngle (so sprite's Y axis aligns with world-up projection)\r
    float c = cos(-vAngle);\r
    float s = sin(-vAngle);\r
    mat2 rot = mat2(c, -s, s, c);\r
    vec2 r = rot * uv;\r
\r
    r.x *= 10.0;  // change this for streak length\r
    r.y *= 0.25;  // thinner width\r
\r
    float radial = length(r);\r
    if (radial > 1.0) discard;\r
\r
    // vertical fade (so ends are softer)\r
    float vfade = smoothstep(1.2, 0.0, abs(r.x));\r
    // small radial falloff to soften edges\r
    float rfade = smoothstep(1.2, 0.3, radial);\r
\r
    float alpha = vAlpha * vfade * rfade * 0.6; // 0.6 global brightness\r
\r
    if (alpha < 0.01) discard;\r
\r
    gl_FragColor = vec4(0.6, 0.7, 1.0, alpha);\r
}`;class Rt{mesh;material;count;cameraRight=new b;cameraUp=new b;constructor(e,t=500,o){this.count=t;const r=new q(1,1);this.material=new I({transparent:!0,depthWrite:!1,uniforms:{uMap:{value:o},uCameraRight:{value:new b},uCameraUp:{value:new b}},vertexShader:`
        uniform vec3 uCameraRight;
        uniform vec3 uCameraUp;
        attribute vec3 instanceOffset;
        attribute float instanceScale;
        varying vec2 vUv;

        void main() {
          vUv = uv;

          // Compute billboard vertex position
          vec3 pos = (uCameraRight * position.x + uCameraUp * position.y) * instanceScale;
          vec3 worldPos = instanceOffset + pos;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
        }
      `,fragmentShader:`
        uniform sampler2D uMap;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(uMap, vUv);
          if (color.a < 0.05) discard; // soft edges
          gl_FragColor = vec4(color.rgb, color.a);
        }
      `}),this.mesh=new Me(r,this.material,t);const n=new Float32Array(t*3),a=new Float32Array(t);for(let s=0;s<t;s++)n[s*3+0]=(Math.random()-.5)*100,n[s*3+1]=Math.random()*20+10,n[s*3+2]=(Math.random()-.5)*100,a[s]=Math.random()*5+5;r.setAttribute("instanceOffset",new Pe(n,3)),r.setAttribute("instanceScale",new Pe(a,1)),e.add(this.mesh)}update(e){const t=e.matrixWorld.elements;this.cameraRight.set(t[0],t[1],t[2]).normalize(),this.cameraUp.set(t[4],t[5],t[6]).normalize(),this.material.uniforms.uCameraRight.value.copy(this.cameraRight),this.material.uniforms.uCameraUp.value.copy(this.cameraUp)}}var je=(i=>(i[i.None=0]="None",i[i.Rain=1]="Rain",i[i.Snow=2]="Snow",i))(je||{});class P{constructor(e,t,o,r){this.mapSize=t,this.generateRain(e,t,o,r);let n=new L;this.cloudTexture=n.load("assets/weather/cloud-128x128.png"),this.flash=new ut(404873,30,500,1.7),this.flash.position.set(0,300,0),e.add(this.flash);const a=50,s=new ft(this.flash,a);e.add(s)}static maxY=500;static rainCount=1e5;rainGeometry;rainUniforms;rainMaterial;static cloudCount=1e4;cloudGeometry;cloudUniforms;cloudMaterial;cloudTexture;clouds=[];billboardClouds=new mt;instancedMeshClouds;flash;generateRain(e,t,o,r){this.rainGeometry=new X,this.rainUniforms={uTime:{value:0},uVelocity:{value:o==1?250:50},blueColor:{value:o==1?.8:.6},uCameraPosition:{value:new b(0,0,0)},uRainSpawnY:{value:P.maxY},dropletSize:{value:o==1?50:6},uLifetime:{value:3e3}};const n=new Float32Array(P.rainCount*3),a=new Float32Array(P.rainCount);for(let d=0;d<P.rainCount;d++)n[d*3]=Math.random()*(t*r)-t*r/2,n[d*3+1]=Math.random()*P.maxY+P.maxY,n[d*3+2]=Math.random()*(t*r)-t*r/2,a[d]=Math.random()+.5;this.rainGeometry.setAttribute("position",new le(n,3)),this.rainGeometry.setAttribute("velocity",new le(a,1));var s=o==1?"assets/weather/rain_8x8.png":"assets/weather/snow.png",l=new L().load(s);l.colorSpace=B,this.rainMaterial=new I({uniforms:this.rainUniforms,vertexShader:At,fragmentShader:Lt,transparent:!0,blending:pt,depthWrite:!1});const c=new Z(this.rainGeometry,this.rainMaterial);c.frustumCulled=!1,c.renderOrder=2,e.add(c)}generateSpriteClouds(e,t){const o=(r,n,a,s)=>{const l=new Ue({map:this.cloudTexture,transparent:!0,alphaTest:.5,depthTest:!0,color:new N("gray")}),c=new We(l);c.position.set(r,n,a),c.scale.set(s,s,s),this.billboardClouds.add(c)};for(let r=0;r<0;r++){const n=Math.random()*t-t/2,a=Math.random()*100+P.maxY-50,s=Math.random()*t-t/2,l=Math.random()*1e3-500;o(n,a,s,l)}e.add(this.billboardClouds)}generateMeshClouds(e,t){let o=new q(500,500),r=new vt({map:this.cloudTexture,transparent:!0,alphaTest:.5,depthTest:!1,side:gt,blendAlpha:.5,color:new N("gray")});for(let n=0;n<250;n++){let a=new re(o,r);a.position.set(Math.random()*t-t/2,P.maxY,Math.random()*t-t/2),a.rotation.x=Math.random()>.5?1.16:-1.16,a.rotation.z=Math.random()*360,a.material.opacity=.6,this.clouds.push(a),e.add(a)}}generateInstancedMeshClouds(e,t){this.instancedMeshClouds=new Rt(e,500,this.cloudTexture)}generatePointsClouds(e,t,o){this.cloudGeometry=new X;const r=new L().load("assets/weather/cloud-32x32.png");r.wrapS=r.wrapT=V,r.minFilter=yt,r.magFilter=be,r.colorSpace=B;const n=new w;let a=e;a.renderer.getSize(n);const s=a.renderer.getPixelRatio(),l=n.y*s;this.cloudUniforms={uTexture:{value:r},uScale:{value:window.innerHeight/2},uViewportHeight:{value:l},uDarkness:{value:.4},uTime:{value:0},uWind:{value:new w(100,100)}};let c=new Float32Array(P.cloudCount*3);const d=new Float32Array(P.cloudCount);for(let f=0;f<P.rainCount;f++)c[f*3]=Math.random()*(t*o)-t*o/2,c[f*3+1]=Math.random()*P.maxY+P.maxY,c[f*3+2]=Math.random()*(t*o)-t*o/2,d[f]=Math.random()*200+200;this.cloudGeometry.setAttribute("position",new le(c,3)),this.cloudGeometry.setAttribute("aSize",new le(d,1)),this.cloudMaterial=new I({uniforms:this.cloudUniforms,vertexShader:`

                varying vec2 vUv;
                //uniform float uScale;

                uniform float uTime;
                uniform vec2 uWind;

                uniform float uViewportHeight; // in pixels (typically renderer.domElement.height * devicePixelRatio)
                attribute float aSize;         // size in world units (or interpret as desired)
                varying float vAlpha;      
                varying float vSeed;          

                void main() {            
                
                    // Wind movement — offset clouds in XZ
                    vec3 pos = position;
                    pos.xz += uWind * uTime;

                    vUv = uv; // pass texture coordinates to fragment shader                 
                                        
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    float dist = max(0.0001, -mvPosition.z); // distance in camera space

                    // projectionMatrix[1][1] = 1.0 / tan(fov/2)
                    float worldToNDC = projectionMatrix[1][1];
                    float pixelsPerWorldUnit = worldToNDC * (uViewportHeight * 0.5);

                    // final size attenuation in pixels
                    float size = aSize * pixelsPerWorldUnit / dist;

                    gl_PointSize = clamp(size, 1.0, 200.0);
                    gl_Position = projectionMatrix * mvPosition;

                    vAlpha = 1.0; 
                }
            `,fragmentShader:`            
                uniform sampler2D uTexture;
                varying float vSeed;
                varying float vAlpha;
                uniform float uDarkness;

                // hash-like function for subtle per-particle variation
                float rand(float n) { return fract(sin(n) * 43758.5453123); }

                void main() {
                    vec2 uv = gl_PointCoord;

                    // make circular fade mask (soft edges)
                    float distToCenter = length(uv - 0.5);
                    float edgeFade = smoothstep(0.5, 0.25, distToCenter); // 1.0 at center, 0.0 at edge

                    // sample texture (optional; could use white if you prefer)
                    vec4 texColor = texture2D(uTexture, uv);

                    // random brightness and softness variation
                    float variation = mix(0.8, 1.2, rand(vSeed));
                    float softness = mix(0.8, 1.5, rand(vSeed * 2.0));

                    // simulate light falloff from top-left (fake lighting)
                    float lighting = clamp(0.7 + (uv.y - 0.5) * 0.4, 0.6, 1.0);

                    // Darken overall color
                    vec3 baseColor = texColor.rgb * lighting * variation;
                    baseColor = mix(baseColor, vec3(0.05, 0.05, 0.08), uDarkness); // mix toward dark grey-blue

                    float alpha = texColor.a * edgeFade * vAlpha;
                    if (alpha < 0.05) discard;

                    gl_FragColor = vec4(baseColor, alpha);
                }
            `,transparent:!0,blending:xt,depthWrite:!1});const u=new Z(this.cloudGeometry,this.cloudMaterial);u.frustumCulled=!1,u.renderOrder=1,e.add(u)}update(e,t){this.rainMaterial&&(this.rainMaterial.uniforms.uCameraPosition.value.copy(t.getPosition()),this.rainMaterial.uniforms.uTime.value+=.5/60,this.rainMaterial.uniforms.uTime.value>=5&&(this.rainMaterial.uniforms.uTime.value=0)),this.clouds.forEach(o=>{o.rotation.z-=.002}),this.flash&&Math.random()>.93&&(this.flash.intensity<1e3&&this.flash.position.set(Math.random()*this.mapSize-this.mapSize/2,P.maxY-100,Math.random()*this.mapSize-this.mapSize/2),this.flash.intensity=50+Math.random()*2e3),this.billboardClouds.children.forEach(o=>{o.position.x+=.01,o.position.x>100&&(o.position.x=-100)}),this.instancedMeshClouds&&this.instancedMeshClouds.update(t.getCamera()),this.cloudMaterial&&(this.cloudMaterial.uniforms.uTime.value+=.5/60,this.cloudMaterial.uniforms.uTime.value>=10&&(this.cloudMaterial.uniforms.uTime.value=0))}}class Et{smokeParticles;fireParticles;fireParticleMaterial;smokeParticleMaterial;constructor(e){this.fireParticles=this.createFireParticles(3),this.smokeParticles=this.createSmokeParticles(2.5,new b(0,3,0)),e.add(this.fireParticles),e.add(this.smokeParticles)}createFireParticles(e){const o=new Float32Array(3e3),r=new Float32Array(1e3*3),n=new Float32Array(1e3),a=new b(100,5,100),s=5;for(let d=0;d<1e3;d++){const u=Math.random()*Math.PI*2,f=Math.sqrt(Math.random())*e,y=Math.cos(u)*f,m=Math.sin(u)*f;o.set([a.x+y,a.y,a.z+m],d*3),r.set([Math.random()*.2-.1,Math.random()*3,Math.random()*.2-.1],d*3),n[d]=Math.random()*s}const l=new X;return l.setAttribute("position",new E(o,3)),l.setAttribute("velocity",new E(r,3)),l.setAttribute("lifetime",new E(n,1)),this.fireParticleMaterial=new I({vertexShader:`
                uniform float u_time;
                uniform float u_lifetime;
                uniform vec3 u_origin;

                attribute vec3 velocity;
                attribute float lifetime;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {
                    float age = mod(u_time, lifetime);
                    float lifeProgress = age / lifetime;

                    // Reset particle position, velocity, etc., if lifetime is reached
                    vec3 pos = position + velocity * age;

                    // Color transition from yellow to red
                    v_color = mix(vec3(1.0, 0.9, 0.0), vec3(1.0, 0.0, 0.0), lifeProgress);
                    
                    // Opacity fades out as it reaches the lifetime
                    v_opacity = 1.0 - lifeProgress;

                    // When the particle has reached its lifetime, reset
                    if (lifeProgress >= 1.0) {
                        pos = u_origin; // Reset to the origin
                        v_color = vec3(1.0, 0.5, 0.0);
                        v_opacity = 1.0;
                    }
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 1.25 * (300.0 / -mvPosition.z) * (1.0 - lifeProgress);
                    // scale with perspective, shrink with time                                    

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                }
            `,fragmentShader:`
                precision highp float;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {

                    float dist = length(gl_PointCoord - vec2(0.5)); // distance from center of point
                    if (dist > 0.5) discard; // discard outside circle

                    // Render particle with fading opacity
                    gl_FragColor = vec4(v_color, v_opacity);
                }
 
            `,uniforms:{u_time:{value:0},u_lifetime:{value:s},u_origin:{value:a}},transparent:!0,depthWrite:!1}),new Z(l,this.fireParticleMaterial)}createSmokeParticles(e,t){const r=new Float32Array(750),n=new Float32Array(250*3),a=new Float32Array(250),s=new b(100,5,100),l=5;for(let u=0;u<250;u++){const f=Math.random()*Math.PI*2,y=Math.sqrt(Math.random())*e,m=Math.cos(f)*y,p=Math.sin(f)*y;r.set([s.x+m,s.y+t.y,s.z+p],u*3),n.set([Math.random()*1-.5,Math.random()*2+2,Math.random()*1-.5],u*3),a[u]=Math.random()*l}const c=new X;return c.setAttribute("position",new E(r,3)),c.setAttribute("velocity",new E(n,3)),c.setAttribute("lifetime",new E(a,1)),this.smokeParticleMaterial=new I({vertexShader:`
                uniform float u_time;
                uniform float u_lifetime;
                uniform vec3 u_origin;

                attribute vec3 velocity;
                attribute float lifetime;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {
                    float age = mod(u_time, lifetime);
                    float lifeProgress = age / lifetime;

                    // Reset particle position, velocity, etc., if lifetime is reached
                    vec3 pos = position + velocity * age;

                    // Color transition
                    v_color = mix(vec3(0.0, 0.0, 0.0), vec3(0.5, 0.5, 0.5), lifeProgress);
                    
                    v_opacity = 0.25;

                    /*
                    if(lifeProgress < 0.5)
                        v_opacity = 0.25;
                    else if(lifeProgress >= 0.5)
                        v_opacity = 0.25 * (1.0 - lifeProgress);
                    */

                    // When the particle has reached its lifetime, reset
                    if (lifeProgress >= 2.0) {
                        pos = u_origin; // Reset to the origin
                        v_color = vec3(0.0, 0.0, 0.0);
                        v_opacity = 0.25;
                    }

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = (50.0 / -mvPosition.z) * lifeProgress * 25.0;
                    // scale with perspective, grow with time                                    
                }
            `,fragmentShader:`
                precision highp float;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {

                    float dist = length(gl_PointCoord - vec2(0.5)); // distance from center of point
                    if (dist > 0.5) discard; // discard outside circle

                    // Render particle with fading opacity
                    gl_FragColor = vec4(v_color, v_opacity);
                }
 
            `,uniforms:{u_time:{value:0},u_lifetime:{value:l},u_origin:{value:s}},transparent:!0,depthWrite:!1}),new Z(c,this.smokeParticleMaterial)}update(e){let t=this.fireParticles.material;t.uniforms.u_time.value=e.getElapsedTime();let o=this.smokeParticles.material;o.uniforms.u_time.value=e.getElapsedTime()}}class It{constructor(e,t,o,r,n,a){this.simplexNoiseGenerator=t,this.yMin=n,this.yMax=a,this.billboardSprite=new L().load(o),this.billboardSprite.generateMipmaps=!1,this.billboardSprite.minFilter=be,this.billboardSprite.colorSpace=B,this.billboardSprite.wrapS=this.billboardSprite.wrapT=ge,this.pointsMaterial=new Be({size:5,sizeAttenuation:!0,map:this.billboardSprite,alphaTest:.5,transparent:!0,depthTest:!0,depthWrite:!1}),this.instancedMeshSprite=new L().load(r),this.instancedMeshSprite.colorSpace=B,this.instancedMeshSprite.wrapS=this.instancedMeshSprite.wrapT=ge,this.instancedMeshMaterial=new I({vertexShader:`            
            uniform sampler2D uTexture;
            uniform float uTime;
            uniform float uWindStrength;
            uniform vec2 uWindDirection;

            varying vec2 vUv;

            void main() {
                    vUv = uv;

                    // Billboard logic (face camera)
                    vec3 up = vec3(0.0, 1.0, 0.0);
                    vec3 cameraRight = vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]);
                    vec3 cameraForward = vec3(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2]);

                    // Vertex position before wind
                    vec3 pos = position;

                    // Wind sway — only affect upper part of blade
                    float swayFactor = smoothstep(0.0, 1.0, uv.y);
                    float sway = sin((instanceMatrix[3].x + uTime) * 0.5 + instanceMatrix[3].z * 0.2) * uWindStrength;
                    pos.x += sway * swayFactor * uWindDirection.x;
                    pos.z += sway * swayFactor * uWindDirection.y;

                    // Construct billboard position
                    vec3 instancePosition = instanceMatrix[3].xyz;
                    vec3 displaced =
                        cameraRight * pos.x +
                        up * pos.y +
                        cameraForward * pos.z +
                        instancePosition;
                        
                    gl_Position = projectionMatrix * viewMatrix * vec4(displaced, 1.0);                    
                }
                `,fragmentShader:`
                uniform sampler2D uTexture;

                varying vec2 vUv;

                void main() {

                    // for debugging
                    //gl_FragColor = vec4(1, 1, 1, 1);//textureColor;
                    //return;

                    vec4 textureColor = texture2D(uTexture, vUv);                  
                    if(textureColor.a < 0.8)  
                        discard;

                    //gl_FragColor = vec4(textureColor.r, textureColor.g, textureColor.b, 0.2);
                    gl_FragColor = textureColor;

                }
            `,uniforms:{uTexture:{value:this.instancedMeshSprite},uTime:{value:0},uWindStrength:{value:.5},uWindDirection:{value:new w(1,.5)}},transparent:!0}),this.plane=new q(5,5),console.log(this.plane.attributes.uv)}pointsMaterial;plane;instancedMeshMaterial;billboardSprite;instancedMeshSprite;generateBillboardsForNode(e,t,o,r){const n=o,a=new X,s=[],l=[];var c=t.min.x-Math.abs(t.min.x)%n,d=Math.floor(t.max.x/n)*n,u=t.min.y-Math.abs(t.min.y)%n,f=Math.floor(t.max.y/n)*n;for(let y=c+1;y<d;y+=n)for(let m=u+1;m<f;m+=n){let p=this.simplexNoiseGenerator.getHeightFromNoiseFunction(y,m);p>this.yMin&&p<this.yMax&&(s.push(y,p+1,-m),e?l.push(1,0,0):l.push(0,1,0))}return a.setAttribute("position",new E(s,3)),a.setAttribute("color",new E(l,3)),console.log(`grass billboards count for node: ${s.length/3}`),new Z(a,this.pointsMaterial)}generateInstancedMeshForNode(e,t,o,r,n){const a=r,s=new Me(this.plane.clone(),this.instancedMeshMaterial,o);let l=0;var c=!1,d=t.min.x-Math.abs(t.min.x)%a,u=Math.floor(t.max.x/a)*a,f=t.min.y-Math.abs(t.min.y)%a,y=Math.floor(t.max.y/a)*a;const m=new de,p=new N("green");for(let v=d+1;v<u;v+=a){for(let x=f+1;x<y;x+=a){let C=this.simplexNoiseGenerator.getHeightFromNoiseFunction(v,x);if(C>this.yMin&&C<this.yMax&&(m.setPosition(v,C+3,-x),l++,s.setMatrixAt(l,m),e?s.setColorAt(l,n):s.setColorAt(l,p)),l>o&&(c=!0),c)break}if(c)break}return s.count=l,console.log(`grass instanced mesh count for node: ${l}`),s.visible=!0,s}}class Nt{renderTarget=new Ge(512,512);mesh;mirrorCamera=new we;constructor(e){const t=new I({uniforms:{time:{value:0},reflectionTexture:{value:this.renderTarget.texture}},vertexShader:`
                varying vec2 vUv;
                varying vec3 vWorldPos;
                uniform float time;

                void main() {
                    vUv = uv;

                    vec3 pos = position;

                    // simple waves
                    pos.y += sin(pos.x * 2.0 + time) * 0.05;
                    pos.y += cos(pos.z * 2.0 + time) * 0.05;

                    vec4 world = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = world.xyz;

                    gl_Position = projectionMatrix * viewMatrix * world;
                }
            `,fragmentShader:`
                uniform sampler2D reflectionTexture;
                uniform float time;

                varying vec2 vUv;

                void main() {
                    // distortion
                    vec2 distortion = vec2(
                        sin(vUv.y * 10.0 + time) * 0.02,
                        cos(vUv.x * 10.0 + time) * 0.02
                    );

                    vec2 uv = vUv + distortion;

                    vec4 reflection = texture2D(reflectionTexture, uv);

                    vec3 waterColor = vec3(0.0, 0.3, 0.5);

                    // simple fresnel approximation
                    float fresnel = pow(1.0 - vUv.y, 3.0);

                    vec3 color = mix(waterColor, reflection.rgb, 0.6 + fresnel * 0.4);

                    gl_FragColor = vec4(color, 0.9);
                }
            `,transparent:!1});this.mesh=new re(new q(1e4,1e4,128,128),t),this.mesh.rotation.x=-Math.PI/2,e.add(this.mesh)}update(e,t){this.updateMirrorCamera(e,t)}updateMirrorCamera(e,t){this.mirrorCamera.position.copy(e.position),this.mirrorCamera.position.y=t-(e.position.y-t),this.mirrorCamera.rotation.copy(e.rotation),this.mirrorCamera.rotation.x*=-1,this.mirrorCamera.updateProjectionMatrix()}}class Gt{reflector;waterOverlay;constructor(e,t){const o=new L().load("https://threejs.org/examples/textures/waternormals.jpg");o.wrapS=o.wrapT=V,this.reflector=new ue(new q(1e4,1e4,128,128),{textureWidth:512,textureHeight:512,color:8952217});let r=this.reflector.material;r.uniforms.time={value:0},r.onBeforeCompile=n=>{console.log(">>> WATER FRAGMENT SHADER PRE-TRANSFORM: "),console.log(r.fragmentShader),n.uniforms.time={value:0},n.uniforms.normalMap={value:o},n.fragmentShader=n.fragmentShader.replace("uniform vec3 color;",`
                uniform vec3 color;
                uniform sampler2D normalMap;
                uniform float time;
                `),n.fragmentShader=n.fragmentShader.replace("vec4 base = texture2DProj( tDiffuse, vUv );",`
                // projected UV
                vec2 uv = vUv.xy / vUv.w;

                // normal map distortion (world-stable)
                vec2 uv1 = uv * 4.0 + vec2(time * 0.03, time * 0.02);
                vec2 uv2 = uv * 4.0 + vec2(-time * 0.02, time * 0.025);

                vec3 n1 = texture2D(normalMap, uv1).rgb;
                vec3 n2 = texture2D(normalMap, uv2).rgb;

                vec3 normal = normalize(n1 * 2.0 - 1.0 + n2 * 2.0 - 1.0);

                float strength = 0.03;
                uv += normal.xy * strength;

                vec4 base = texture2DProj(
                    tDiffuse,
                    vec4(uv * vUv.w, vUv.z, vUv.w)
                );
                `),r.userData.shader=n,console.log(">>> WATER FRAGMENT SHADER POST-TRANSFORM: "),console.log(n.fragmentShader)},this.reflector.position.y=t,this.reflector.rotation.x=-Math.PI/2,e.add(this.reflector)}update(e,t){}}const Ut=`varying vec2 vUv;\r
varying vec3 vWorldPos;\r
\r
void main() {\r
    vUv = uv;\r
\r
    vec4 world = modelMatrix * vec4(position, 1.0);\r
    vWorldPos = world.xyz;\r
\r
    gl_Position = projectionMatrix * viewMatrix * world;\r
}`,Wt=` uniform sampler2D normalMap;\r
//uniform samplerCube envMap;\r
uniform sampler2D reflectionMap;\r
\r
uniform float normalScale;\r
uniform vec2 waveSpeed1;\r
uniform vec2 waveSpeed2;\r
\r
uniform bool useFresnel;\r
uniform bool useDiffuse;\r
\r
uniform vec3 lightDir;\r
uniform vec3 waterColor;\r
uniform float waterOpacity;\r
\r
uniform float time;\r
\r
varying vec2 vUv;\r
varying vec3 vWorldPos;\r
\r
vec2 sampleEquirectangular(vec3 dir) {\r
    float phi = atan(dir.z, dir.x);\r
    float theta = asin(dir.y);\r
\r
    return vec2(\r
        0.5 + phi / (2.0 * 3.14159265),\r
        0.5 - theta / 3.14159265\r
    );\r
}            \r
\r
void main() {\r
\r
    // temporarily override for texture2d\r
    //gl_FragColor = texture2D(reflectionMap, vUv);\r
    //return;\r
\r
    // temporarily override for texturecube\r
    //gl_FragColor = vec4(textureCube(reflectionMap, vec3(0.0, 1.0, 0.0)).rgb, 1.0);\r
    //return;\r
\r
    // -------------------------\r
    // World-space UVs (stable)\r
    // -------------------------\r
    vec2 worldUv = vWorldPos.xz * 0.05;\r
\r
    // -------------------------\r
    // Animated normal map (2 layers)\r
    // -------------------------\r
    vec2 uv1 = worldUv + vec2(time * waveSpeed1.x, time * waveSpeed1.y);\r
    vec2 uv2 = worldUv + vec2(-time * waveSpeed2.x, time * waveSpeed2.y);\r
\r
    vec3 n1 = texture2D(normalMap, uv1).rgb;\r
    vec3 n2 = texture2D(normalMap, uv2).rgb;\r
\r
    // combine + convert from [0,1] → [-1,1]\r
    vec3 normal = normalize(n1 * 2.0 - 1.0 + n2 * 2.0 - 1.0);\r
\r
    // View direction\r
    vec3 viewDir = normalize(cameraPosition - vWorldPos);\r
\r
    // Reflection vector (for skybox)\r
    vec3 reflectDir = reflect(-viewDir, normal);\r
    reflectDir.z *= -1.0;\r
\r
    // reflection / environment map (skybox)\r
    //vec3 reflection = textureCube(reflectionMap, reflectDir).rgb;\r
    vec3 reflection = texture2D(reflectionMap, sampleEquirectangular(reflectDir)).rgb;\r
\r
    // Fresnel (angle-based blend)\r
    float fresnel = 0.0;\r
    if (useFresnel) {\r
        fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 5.0);\r
        //fresnel = pow(1.0 - dot(viewDir, normal), 3.0);\r
        //fresnel = clamp(fresnel, 0.2, 0.8);\r
    }\r
\r
    // Fake diffuse lighting\r
    float diffuse = 1.0;\r
    if (useDiffuse) {\r
        diffuse = max(dot(normal, normalize(lightDir)), 0.0);\r
    }\r
\r
        // Final color\r
        //vec3 color = mix(waterColor, reflection, fresnel);\r
        // apply lighting\r
        //color *= 0.5 + light * 0.5;\r
        //color = mix(color, waterColor, 0.2);\r
\r
    // Output (semi-transparent)                    \r
    // temporary to only show reflection\r
    //gl_FragColor = vec4(reflection, 1.0);\r
    //return;\r
\r
    vec3 base = waterColor * diffuse;\r
    vec3 color = mix(base, reflection, fresnel);\r
    \r
    gl_FragColor = vec4(color, waterOpacity);\r
\r
        //float alpha = mix(0.4, 0.8, fresnel);\r
        //gl_FragColor = vec4(color, alpha);                     \r
}`;class Bt{mesh;constructor(e,t,o){const r=new L().load("https://threejs.org/examples/textures/waternormals.jpg");r.wrapS=r.wrapT=V;const n=new I({uniforms:{normalMap:{value:r},reflectionMap:{value:o},normalScale:{value:.5},waveSpeed1:{value:new w(.05,.02)},waveSpeed2:{value:new w(-.03,.04)},useFresnel:{value:!0},useDiffuse:{value:!0},lightDir:{value:new b(.5,1,.3).normalize()},waterColor:{value:new N(2003199)},waterOpacity:{value:.6},time:{value:0},cameraPosition:{value:t.position}},vertexShader:Ut,fragmentShader:Wt,transparent:!0,depthWrite:!1});this.mesh=new re(new q(1e5,1e5,128,128),n),this.mesh.position.y=10.01,this.mesh.rotation.x=-Math.PI/2,e.add(this.mesh)}update(e,t){}}class $t extends wt{constructor(e,t,o,r){super(),this.cameraRig=e,this.renderer=t,this.settings=o,this.gameClock=r,this.add(e.yawObject),this.terrainGeneratorParams=new bt(1100,6,1.8,4.5,300,.71),this.simplexNoiseGenerator=new Mt(this.terrainGeneratorParams),this.grassGenerator=new It(this,this.simplexNoiseGenerator,"assets/billboard_grass_blackwhite_32x32.png","assets/billboard_grass_32x32.png",15,25),this.treeGenerator=new zt(this,this.simplexNoiseGenerator,"assets/tree_outline_thin_128x128.png",30,40),this.addSkybox(),this.addTerrain(),this.addWaterSimplePlane(),this.addLights(),this.addFireParticleEmitter(),this.precipitationSystem=new P(this,5e3,je.Rain,1)}skyTexture;skyTexture2;sky;water;waterLite;waterReflector;waterSimplePlane;quadTree;totalNodes=0;maxLOD=0;terrainGeneratorParams;simplexNoiseGenerator;treeGenerator;grassGenerator;precipitationSystem;fireParticleEmitter;switchIsDebug(e){this.settings.isDebug=e,this.quadTree.isDebug=e}switchSky(e){e==$e.Shader?(this.sky.visible=!0,this.background=null):(this.sky.visible=!1,this.background=this.skyTexture)}addSkybox(){const e=new L;this.skyTexture=e.load("assets/industrial_sunset_puresky.jpg",()=>{this.skyTexture.mapping=De,this.skyTexture.colorSpace=B;let t=this;t.background=this.skyTexture,t.environment=this.skyTexture,console.log(">>>>> "+t.background)}),this.skyTexture2=e.load("assets/industrial_sunset_puresky.jpg",()=>{this.skyTexture.mapping=De,this.skyTexture.colorSpace=B})}addShaderSky(){this.sky=new Ct,this.sky.scale.setScalar(45e4);const e=Oe.degToRad(90),t=Oe.degToRad(180),o=new b().setFromSphericalCoords(1,e,t);this.sky.material.uniforms.sunPosition.value=o,this.add(this.sky)}addWater(){const e=new q(1e5,1e5);this.water=new Tt(e,{textureWidth:64,textureHeight:64,waterNormals:new L().load("assets/waternormals.jpg",function(t){t.wrapS=t.wrapT=V}),sunDirection:new b,sunColor:16777215,waterColor:7695,distortionScale:3.7}),this.water.rotation.x=-Math.PI/2,this.water.position.y=5.01,this.add(this.water)}addWaterLite(){this.waterLite=new Nt(this)}addWaterSimplePlane(){this.waterSimplePlane=new Bt(this,this.cameraRig.getCamera(),this.skyTexture2)}addWaterReflector(){this.waterReflector=new Gt(this,5)}addLights(){let e=new _e(8421504,.8);e.position.set(-100,100,-100),e.target.position.set(0,0,0),e.castShadow=!0,this.add(e);let t=new _e(4210752,.8);t.position.set(100,100,-100),t.target.position.set(0,0,0),t.castShadow=!0,this.add(t)}addTerrain(){this.quadTree=new Ft(this,new ee(new w(-this.settings.terrain.mapWidth,-this.settings.terrain.mapWidth),new w(this.settings.terrain.mapWidth,this.settings.terrain.mapWidth)),this.simplexNoiseGenerator,this.treeGenerator,this.grassGenerator,this.terrainGeneratorParams,this.settings.terrain.minimumChunkSize,this.settings.terrain.verticesPerChunkSide,this.settings.terrain.heightFactor,this.settings.isDebug),this.quadTree.insert(new w(this.cameraRig.getPosition().x,-this.cameraRig.getPosition().z),this),this.quadTree.updateMeshes(this),this.maxLOD=this.quadTree.getCurrentMaxLOD(this.quadTree.root)}addFireParticleEmitter(){this.fireParticleEmitter=new Et(this)}update(e){if(this.quadTree.insert(new w(this.cameraRig.getPosition().x,-this.cameraRig.getPosition().z),this),this.quadTree.updateMeshes(this),this.totalNodes=this.quadTree.getTotalNodeCount(),e.lockCameraToTerrain){let t=this.simplexNoiseGenerator.getHeightFromNoiseFunction(this.cameraRig.getPosition().x,-this.cameraRig.getPosition().z)+e.yCameraOffsetFromTerrain;this.cameraRig.lockToTerrain(t)}this.water!=null&&(this.water.material.uniforms.time.value+=.5/60),this.precipitationSystem.update(this.gameClock,this.cameraRig),this.fireParticleEmitter!=null&&this.fireParticleEmitter.update(this.gameClock),this.maxLOD=this.quadTree.getCurrentMaxLOD(this.quadTree.root)}}class jt{constructor(e){this.camera=e,this.pitchObject=new Fe,this.yawObject=new Fe,this.yawObject.add(this.pitchObject),this.pitchObject.add(e)}pitchObject;yawObject;sensitivityX=2.5;sensitivityY=2;deadzone=.1;yaw=0;pitch=0;lookX=0;lookY=0;curve(e){return e*Math.abs(e)}moveRig(e,t){this.yawObject.position.add(e),t&&(this.pitchObject.position.copy(this.yawObject.position),this.camera.position.copy(this.yawObject.position))}lockToTerrain(e){this.yawObject.position.setY(e)}getPosition(){return this.yawObject.position}getCamera(){return this.camera}update(e){let t=Math.abs(this.lookX)<this.deadzone?0:this.lookX,o=Math.abs(this.lookY)<this.deadzone?0:this.lookY;t=this.curve(t),o=this.curve(o),this.yaw-=t*this.sensitivityX*e,this.pitch-=o*this.sensitivityY*e;const r=Math.PI/2-.01;this.pitch=Math.max(-r,Math.min(r,this.pitch)),this.yawObject.rotation.y=this.yaw,this.pitchObject.rotation.x=this.pitch}}class qt{pointerLockControls;constructor(){}initializePointerLock(e,t){const o=t.getElementById("blocker"),r=t.getElementById("instructions");if(!("requestPointerLock"in t.body||"webkitRequestPointerLock"in t.body||"mozRequestPointerLock"in t.body))return null;let a=new St(e.getCamera(),t.body),s=!1;return r.addEventListener("click",async()=>{if(!s)try{s=!0,a.lock(),setTimeout(()=>{s=!1},2e3)}catch(l){console.log("Error locking pointer:",l)}}),a.addEventListener("lock",async()=>{r.style.display="none",o.style.display="none"}),a.addEventListener("unlock",async()=>{o.style.display="block",r.style.display=""}),t.addEventListener("pointerlockerror",async l=>{console.log("Pointer lock failed:",l)}),this.pointerLockControls=a,a}isPointerLockActive(){return this.pointerLockControls?.isLocked??!1}}const ce=(i,e)=>{const t=e.x-i.x,o=e.y-i.y;return Math.sqrt(t*t+o*o)},Yt=(i,e)=>{const t=e.x-i.x,o=e.y-i.y;return Vt(Math.atan2(o,t))},Ht=(i,e,t)=>{const o={x:0,y:0};return t=ye(t),o.x=i.x-e*Math.cos(t),o.y=i.y-e*Math.sin(t),o},ye=i=>i*(Math.PI/180),Vt=i=>i*(180/Math.PI),Xt=i=>isNaN(i.buttons)?i.pressure!==0:i.buttons!==0,me=new Map,ze=i=>{me.has(i)&&clearTimeout(me.get(i)),me.set(i,setTimeout(i,100))},he=(i,e,t)=>{const o=e.split(/[ ,]+/g);let r;for(let n=0;n<o.length;n+=1)r=o[n],i.addEventListener?i.addEventListener(r,t,!1):i.attachEvent&&i.attachEvent(r,t)},Ae=(i,e,t)=>{const o=e.split(/[ ,]+/g);let r;for(let n=0;n<o.length;n+=1)r=o[n],i.removeEventListener?i.removeEventListener(r,t):i.detachEvent&&i.detachEvent(r,t)},qe=i=>(i.preventDefault(),i.type.match(/^touch/)?i.changedTouches:i),Le=()=>{const i=window.pageXOffset!==void 0?window.pageXOffset:(document.documentElement||document.body.parentNode||document.body).scrollLeft,e=window.pageYOffset!==void 0?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop;return{x:i,y:e}},Re=(i,e)=>{e.top||e.right||e.bottom||e.left?(i.style.top=e.top,i.style.right=e.right,i.style.bottom=e.bottom,i.style.left=e.left):(i.style.left=e.x+"px",i.style.top=e.y+"px")},Ce=(i,e,t)=>{const o=Ye(i);for(let r in o)if(o.hasOwnProperty(r))if(typeof e=="string")o[r]=e+" "+t;else{let n="";for(let a=0,s=e.length;a<s;a+=1)n+=e[a]+" "+t+", ";o[r]=n.slice(0,-2)}return o},Zt=(i,e)=>{const t=Ye(i);for(let o in t)t.hasOwnProperty(o)&&(t[o]=e);return t},Ye=i=>{const e={};return e[i]="",["webkit","Moz","o"].forEach(function(o){e[o+i.charAt(0).toUpperCase()+i.slice(1)]=""}),e},pe=(i,e)=>{for(let t in e)e.hasOwnProperty(t)&&(i[t]=e[t]);return i},Jt=(i,e)=>{const t={};for(let o in i)i.hasOwnProperty(o)&&e.hasOwnProperty(o)?t[o]=e[o]:i.hasOwnProperty(o)&&(t[o]=i[o]);return t},xe=(i,e)=>{if(i.length)for(let t=0,o=i.length;t<o;t+=1)e(i[t]);else e(i)},Kt=(i,e,t)=>({x:Math.min(Math.max(i.x,e.x-t),e.x+t),y:Math.min(Math.max(i.y,e.y-t),e.y+t)});var Qt="ontouchstart"in window,ei=!!window.PointerEvent,ti=!!window.MSPointerEvent,Q={touch:{start:"touchstart",move:"touchmove",end:"touchend, touchcancel"},mouse:{start:"mousedown",move:"mousemove",end:"mouseup"},pointer:{start:"pointerdown",move:"pointermove",end:"pointerup, pointercancel"},MSPointer:{start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}},H,te={};ei?H=Q.pointer:ti?H=Q.MSPointer:Qt?(H=Q.touch,te=Q.mouse):H=Q.mouse;function G(){}G.prototype.on=function(i,e){var t=this,o=i.split(/[ ,]+/g),r;t._handlers_=t._handlers_||{};for(var n=0;n<o.length;n+=1)r=o[n],t._handlers_[r]=t._handlers_[r]||[],t._handlers_[r].push(e);return t};G.prototype.off=function(i,e){var t=this;return t._handlers_=t._handlers_||{},i===void 0?t._handlers_={}:e===void 0?t._handlers_[i]=null:t._handlers_[i]&&t._handlers_[i].indexOf(e)>=0&&t._handlers_[i].splice(t._handlers_[i].indexOf(e),1),t};G.prototype.trigger=function(i,e){var t=this,o=i.split(/[ ,]+/g),r;t._handlers_=t._handlers_||{};for(var n=0;n<o.length;n+=1)r=o[n],t._handlers_[r]&&t._handlers_[r].length&&t._handlers_[r].forEach(function(a){a.call(t,{type:r,target:t},e)})};G.prototype.config=function(i){var e=this;e.options=e.defaults||{},i&&(e.options=Jt(e.options,i))};G.prototype.bindEvt=function(i,e){var t=this;return t._domHandlers_=t._domHandlers_||{},t._domHandlers_[e]=function(){typeof t["on"+e]=="function"?t["on"+e].apply(t,arguments):console.warn('[WARNING] : Missing "on'+e+'" handler.')},he(i,H[e],t._domHandlers_[e]),te[e]&&he(i,te[e],t._domHandlers_[e]),t};G.prototype.unbindEvt=function(i,e){var t=this;return t._domHandlers_=t._domHandlers_||{},Ae(i,H[e],t._domHandlers_[e]),te[e]&&Ae(i,te[e],t._domHandlers_[e]),delete t._domHandlers_[e],this};function T(i,e){return this.identifier=e.identifier,this.position=e.position,this.frontPosition=e.frontPosition,this.collection=i,this.defaults={size:100,threshold:.1,color:"white",fadeTime:250,dataOnly:!1,restJoystick:!0,restOpacity:.5,mode:"dynamic",zone:document.body,lockX:!1,lockY:!1,shape:"circle"},this.config(e),this.options.mode==="dynamic"&&(this.options.restOpacity=0),this.id=T.id,T.id+=1,this.buildEl().stylize(),this.instance={el:this.ui.el,on:this.on.bind(this),off:this.off.bind(this),show:this.show.bind(this),hide:this.hide.bind(this),add:this.addToDom.bind(this),remove:this.removeFromDom.bind(this),destroy:this.destroy.bind(this),setPosition:this.setPosition.bind(this),resetDirection:this.resetDirection.bind(this),computeDirection:this.computeDirection.bind(this),trigger:this.trigger.bind(this),position:this.position,frontPosition:this.frontPosition,ui:this.ui,identifier:this.identifier,id:this.id,options:this.options},this.instance}T.prototype=new G;T.constructor=T;T.id=0;T.prototype.buildEl=function(i){return this.ui={},this.options.dataOnly?this:(this.ui.el=document.createElement("div"),this.ui.back=document.createElement("div"),this.ui.front=document.createElement("div"),this.ui.el.className="nipple collection_"+this.collection.id,this.ui.back.className="back",this.ui.front.className="front",this.ui.el.setAttribute("id","nipple_"+this.collection.id+"_"+this.id),this.ui.el.appendChild(this.ui.back),this.ui.el.appendChild(this.ui.front),this)};T.prototype.stylize=function(){if(this.options.dataOnly)return this;var i=this.options.fadeTime+"ms",e=Zt("borderRadius","50%"),t=Ce("transition","opacity",i),o={};return o.el={position:"absolute",opacity:this.options.restOpacity,display:"block",zIndex:999},o.back={position:"absolute",display:"block",width:this.options.size+"px",height:this.options.size+"px",left:0,marginLeft:-this.options.size/2+"px",marginTop:-this.options.size/2+"px",background:this.options.color,opacity:".5"},o.front={width:this.options.size/2+"px",height:this.options.size/2+"px",position:"absolute",display:"block",left:0,marginLeft:-this.options.size/4+"px",marginTop:-this.options.size/4+"px",background:this.options.color,opacity:".5",transform:"translate(0px, 0px)"},pe(o.el,t),this.options.shape==="circle"&&pe(o.back,e),pe(o.front,e),this.applyStyles(o),this};T.prototype.applyStyles=function(i){for(var e in this.ui)if(this.ui.hasOwnProperty(e))for(var t in i[e])this.ui[e].style[t]=i[e][t];return this};T.prototype.addToDom=function(){return this.options.dataOnly||document.body.contains(this.ui.el)?this:(this.options.zone.appendChild(this.ui.el),this)};T.prototype.removeFromDom=function(){return this.options.dataOnly||!document.body.contains(this.ui.el)?this:(this.options.zone.removeChild(this.ui.el),this)};T.prototype.destroy=function(){clearTimeout(this.removeTimeout),clearTimeout(this.showTimeout),clearTimeout(this.restTimeout),this.trigger("destroyed",this.instance),this.removeFromDom(),this.off()};T.prototype.show=function(i){var e=this;return e.options.dataOnly||(clearTimeout(e.removeTimeout),clearTimeout(e.showTimeout),clearTimeout(e.restTimeout),e.addToDom(),e.restCallback(),setTimeout(function(){e.ui.el.style.opacity=1},0),e.showTimeout=setTimeout(function(){e.trigger("shown",e.instance),typeof i=="function"&&i.call(this)},e.options.fadeTime)),e};T.prototype.hide=function(i){var e=this;if(e.options.dataOnly)return e;if(e.ui.el.style.opacity=e.options.restOpacity,clearTimeout(e.removeTimeout),clearTimeout(e.showTimeout),clearTimeout(e.restTimeout),e.removeTimeout=setTimeout(function(){var t=e.options.mode==="dynamic"?"none":"block";e.ui.el.style.display=t,typeof i=="function"&&i.call(e),e.trigger("hidden",e.instance)},e.options.fadeTime),e.options.restJoystick){const t=e.options.restJoystick,o={};o.x=t===!0||t.x!==!1?0:e.instance.frontPosition.x,o.y=t===!0||t.y!==!1?0:e.instance.frontPosition.y,e.setPosition(i,o)}return e};T.prototype.setPosition=function(i,e){var t=this;t.frontPosition={x:e.x,y:e.y};var o=t.options.fadeTime+"ms",r={};r.front=Ce("transition",["transform"],o);var n={front:{}};n.front={transform:"translate("+t.frontPosition.x+"px,"+t.frontPosition.y+"px)"},t.applyStyles(r),t.applyStyles(n),t.restTimeout=setTimeout(function(){typeof i=="function"&&i.call(t),t.restCallback()},t.options.fadeTime)};T.prototype.restCallback=function(){var i=this,e={};e.front=Ce("transition","none",""),i.applyStyles(e),i.trigger("rested",i.instance)};T.prototype.resetDirection=function(){this.direction={x:!1,y:!1,angle:!1}};T.prototype.computeDirection=function(i){var e=i.angle.radian,t=Math.PI/4,o=Math.PI/2,r,n,a;if(e>t&&e<t*3&&!i.lockX?r="up":e>-t&&e<=t&&!i.lockY?r="left":e>-t*3&&e<=-t&&!i.lockX?r="down":i.lockY||(r="right"),i.lockY||(e>-o&&e<o?n="left":n="right"),i.lockX||(e>0?a="up":a="down"),i.force>this.options.threshold){var s={},l;for(l in this.direction)this.direction.hasOwnProperty(l)&&(s[l]=this.direction[l]);var c={};this.direction={x:n,y:a,angle:r},i.direction=this.direction;for(l in s)s[l]===this.direction[l]&&(c[l]=!0);if(c.x&&c.y&&c.angle)return i;(!c.x||!c.y)&&this.trigger("plain",i),c.x||this.trigger("plain:"+n,i),c.y||this.trigger("plain:"+a,i),c.angle||this.trigger("dir dir:"+r,i)}else this.resetDirection();return i};function M(i,e){var t=this;t.nipples=[],t.idles=[],t.actives=[],t.ids=[],t.pressureIntervals={},t.manager=i,t.id=M.id,M.id+=1,t.defaults={zone:document.body,multitouch:!1,maxNumberOfNipples:10,mode:"dynamic",position:{top:0,left:0},catchDistance:200,size:100,threshold:.1,color:"white",fadeTime:250,dataOnly:!1,restJoystick:!0,restOpacity:.5,lockX:!1,lockY:!1,shape:"circle",dynamicPage:!1,follow:!1},t.config(e),(t.options.mode==="static"||t.options.mode==="semi")&&(t.options.multitouch=!1),t.options.multitouch||(t.options.maxNumberOfNipples=1);const o=getComputedStyle(t.options.zone.parentElement);return o&&o.display==="flex"&&(t.parentIsFlex=!0),t.updateBox(),t.prepareNipples(),t.bindings(),t.begin(),t.nipples}M.prototype=new G;M.constructor=M;M.id=0;M.prototype.prepareNipples=function(){var i=this,e=i.nipples;e.on=i.on.bind(i),e.off=i.off.bind(i),e.options=i.options,e.destroy=i.destroy.bind(i),e.ids=i.ids,e.id=i.id,e.processOnMove=i.processOnMove.bind(i),e.processOnEnd=i.processOnEnd.bind(i),e.get=function(t){if(t===void 0)return e[0];for(var o=0,r=e.length;o<r;o+=1)if(e[o].identifier===t)return e[o];return!1}};M.prototype.bindings=function(){var i=this;i.bindEvt(i.options.zone,"start"),i.options.zone.style.touchAction="none",i.options.zone.style.msTouchAction="none"};M.prototype.begin=function(){var i=this,e=i.options;if(e.mode==="static"){var t=i.createNipple(e.position,i.manager.getIdentifier());t.add(),i.idles.push(t)}};M.prototype.createNipple=function(i,e){var t=this,o=t.manager.scroll,r={},n=t.options,a={x:t.parentIsFlex?o.x:o.x+t.box.left,y:t.parentIsFlex?o.y:o.y+t.box.top};if(i.x&&i.y)r={x:i.x-a.x,y:i.y-a.y};else if(i.top||i.right||i.bottom||i.left){var s=document.createElement("DIV");s.style.display="hidden",s.style.top=i.top,s.style.right=i.right,s.style.bottom=i.bottom,s.style.left=i.left,s.style.position="absolute",n.zone.appendChild(s);var l=s.getBoundingClientRect();n.zone.removeChild(s),r=i,i={x:l.left+o.x,y:l.top+o.y}}var c=new T(t,{color:n.color,size:n.size,threshold:n.threshold,fadeTime:n.fadeTime,dataOnly:n.dataOnly,restJoystick:n.restJoystick,restOpacity:n.restOpacity,mode:n.mode,identifier:e,position:i,zone:n.zone,frontPosition:{x:0,y:0},shape:n.shape});return n.dataOnly||(Re(c.ui.el,r),Re(c.ui.front,c.frontPosition)),t.nipples.push(c),t.trigger("added "+c.identifier+":added",c),t.manager.trigger("added "+c.identifier+":added",c),t.bindNipple(c),c};M.prototype.updateBox=function(){var i=this;i.box=i.options.zone.getBoundingClientRect()};M.prototype.bindNipple=function(i){var e=this,t,o=function(r,n){t=r.type+" "+n.id+":"+r.type,e.trigger(t,n)};i.on("destroyed",e.onDestroyed.bind(e)),i.on("shown hidden rested dir plain",o),i.on("dir:up dir:right dir:down dir:left",o),i.on("plain:up plain:right plain:down plain:left",o)};M.prototype.pressureFn=function(i,e,t){var o=this,r=0;clearInterval(o.pressureIntervals[t]),o.pressureIntervals[t]=setInterval(function(){var n=i.force||i.pressure||i.webkitForce||0;n!==r&&(e.trigger("pressure",n),o.trigger("pressure "+e.identifier+":pressure",n),r=n)}.bind(o),100)};M.prototype.onstart=function(i){var e=this,t=e.options,o=i;i=qe(i),e.updateBox();var r=function(n){e.actives.length<t.maxNumberOfNipples?e.processOnStart(n):o.type.match(/^touch/)&&(Object.keys(e.manager.ids).forEach(function(a){if(Object.values(o.touches).findIndex(function(l){return l.identifier===a})<0){var s=[i[0]];s.identifier=a,e.processOnEnd(s)}}),e.actives.length<t.maxNumberOfNipples&&e.processOnStart(n))};return xe(i,r),e.manager.bindDocument(),!1};M.prototype.processOnStart=function(i){var e=this,t=e.options,o,r=e.manager.getIdentifier(i),n=i.force||i.pressure||i.webkitForce||0,a={x:i.pageX,y:i.pageY},s=e.getOrCreate(r,a);s.identifier!==r&&e.manager.removeIdentifier(s.identifier),s.identifier=r;var l=function(d){d.trigger("start",d),e.trigger("start "+d.id+":start",d),d.show(),n>0&&e.pressureFn(i,d,d.identifier),e.processOnMove(i)};if((o=e.idles.indexOf(s))>=0&&e.idles.splice(o,1),e.actives.push(s),e.ids.push(s.identifier),t.mode!=="semi")l(s);else{var c=ce(a,s.position);if(c<=t.catchDistance)l(s);else{s.destroy(),e.processOnStart(i);return}}return s};M.prototype.getOrCreate=function(i,e){var t=this,o=t.options,r;return/(semi|static)/.test(o.mode)?(r=t.idles[0],r?(t.idles.splice(0,1),r):o.mode==="semi"?t.createNipple(e,i):(console.warn("Coudln't find the needed nipple."),!1)):(r=t.createNipple(e,i),r)};M.prototype.processOnMove=function(i){var e=this,t=e.options,o=e.manager.getIdentifier(i),r=e.nipples.get(o),n=e.manager.scroll;if(!Xt(i)){this.processOnEnd(i);return}if(!r){console.error("Found zombie joystick with ID "+o),e.manager.removeIdentifier(o);return}if(t.dynamicPage){var a=r.el.getBoundingClientRect();r.position={x:n.x+a.left,y:n.y+a.top}}r.identifier=o;var s=r.options.size/2,l={x:i.pageX,y:i.pageY};t.lockX&&(l.y=r.position.y),t.lockY&&(l.x=r.position.x);var c=ce(l,r.position),d=Yt(l,r.position),u=ye(d),f=c/s,y={distance:c,position:l},m,p;if(r.options.shape==="circle"?(m=Math.min(c,s),p=Ht(r.position,m,d)):(p=Kt(l,r.position,s),m=ce(p,r.position)),t.follow){if(c>s){let A=l.x-p.x,$=l.y-p.y;r.position.x+=A,r.position.y+=$,r.el.style.top=r.position.y-(e.box.top+n.y)+"px",r.el.style.left=r.position.x-(e.box.left+n.x)+"px",c=ce(l,r.position)}}else l=p,c=m;var v=l.x-r.position.x,x=l.y-r.position.y;r.frontPosition={x:v,y:x},t.dataOnly||(r.ui.front.style.transform="translate("+v+"px,"+x+"px)");var C={identifier:r.identifier,position:l,force:f,pressure:i.force||i.pressure||i.webkitForce||0,distance:c,angle:{radian:u,degree:d},vector:{x:v/s,y:-x/s},raw:y,instance:r,lockX:t.lockX,lockY:t.lockY};C=r.computeDirection(C),C.angle={radian:ye(180-d),degree:180-d},r.trigger("move",C),e.trigger("move "+r.id+":move",C)};M.prototype.processOnEnd=function(i){var e=this,t=e.options,o=e.manager.getIdentifier(i),r=e.nipples.get(o),n=e.manager.removeIdentifier(r.identifier);r&&(t.dataOnly||r.hide(function(){t.mode==="dynamic"&&(r.trigger("removed",r),e.trigger("removed "+r.id+":removed",r),e.manager.trigger("removed "+r.id+":removed",r),r.destroy())}),clearInterval(e.pressureIntervals[r.identifier]),r.resetDirection(),r.trigger("end",r),e.trigger("end "+r.id+":end",r),e.ids.indexOf(r.identifier)>=0&&e.ids.splice(e.ids.indexOf(r.identifier),1),e.actives.indexOf(r)>=0&&e.actives.splice(e.actives.indexOf(r),1),/(semi|static)/.test(t.mode)?e.idles.push(r):e.nipples.indexOf(r)>=0&&e.nipples.splice(e.nipples.indexOf(r),1),e.manager.unbindDocument(),/(semi|static)/.test(t.mode)&&(e.manager.ids[n.id]=n.identifier))};M.prototype.onDestroyed=function(i,e){var t=this;t.nipples.indexOf(e)>=0&&t.nipples.splice(t.nipples.indexOf(e),1),t.actives.indexOf(e)>=0&&t.actives.splice(t.actives.indexOf(e),1),t.idles.indexOf(e)>=0&&t.idles.splice(t.idles.indexOf(e),1),t.ids.indexOf(e.identifier)>=0&&t.ids.splice(t.ids.indexOf(e.identifier),1),t.manager.removeIdentifier(e.identifier),t.manager.unbindDocument()};M.prototype.destroy=function(){var i=this;i.unbindEvt(i.options.zone,"start"),i.nipples.forEach(function(t){t.destroy()});for(var e in i.pressureIntervals)i.pressureIntervals.hasOwnProperty(e)&&clearInterval(i.pressureIntervals[e]);i.trigger("destroyed",i.nipples),i.manager.unbindDocument(),i.off()};function S(i){var e=this;e.ids={},e.index=0,e.collections=[],e.scroll=Le(),e.config(i),e.prepareCollections();var t=function(){var r;e.collections.forEach(function(n){n.forEach(function(a){r=a.el.getBoundingClientRect(),a.position={x:e.scroll.x+r.left,y:e.scroll.y+r.top}})})};he(window,"resize",function(){ze(t)});var o=function(){e.scroll=Le()};return he(window,"scroll",function(){ze(o)}),e.collections}S.prototype=new G;S.constructor=S;S.prototype.prepareCollections=function(){var i=this;i.collections.create=i.create.bind(i),i.collections.on=i.on.bind(i),i.collections.off=i.off.bind(i),i.collections.destroy=i.destroy.bind(i),i.collections.get=function(e){var t;return i.collections.every(function(o){return t=o.get(e),!t}),t}};S.prototype.create=function(i){return this.createCollection(i)};S.prototype.createCollection=function(i){var e=this,t=new M(e,i);return e.bindCollection(t),e.collections.push(t),t};S.prototype.bindCollection=function(i){var e=this,t,o=function(r,n){t=r.type+" "+n.id+":"+r.type,e.trigger(t,n)};i.on("destroyed",e.onDestroyed.bind(e)),i.on("shown hidden rested dir plain",o),i.on("dir:up dir:right dir:down dir:left",o),i.on("plain:up plain:right plain:down plain:left",o)};S.prototype.bindDocument=function(){var i=this;i.binded||(i.bindEvt(document,"move").bindEvt(document,"end"),i.binded=!0)};S.prototype.unbindDocument=function(i){var e=this;(!Object.keys(e.ids).length||i===!0)&&(e.unbindEvt(document,"move").unbindEvt(document,"end"),e.binded=!1)};S.prototype.getIdentifier=function(i){var e;return i?(e=i.identifier===void 0?i.pointerId:i.identifier,e===void 0&&(e=this.latest||0)):e=this.index,this.ids[e]===void 0&&(this.ids[e]=this.index,this.index+=1),this.latest=e,this.ids[e]};S.prototype.removeIdentifier=function(i){var e={};for(var t in this.ids)if(this.ids[t]===i){e.id=t,e.identifier=this.ids[t],delete this.ids[t];break}return e};S.prototype.onmove=function(i){var e=this;return e.onAny("move",i),!1};S.prototype.onend=function(i){var e=this;return e.onAny("end",i),!1};S.prototype.oncancel=function(i){var e=this;return e.onAny("end",i),!1};S.prototype.onAny=function(i,e){var t=this,o,r="processOn"+i.charAt(0).toUpperCase()+i.slice(1);e=qe(e);var n=function(s,l,c){c.ids.indexOf(l)>=0&&(c[r](s),s._found_=!0)},a=function(s){o=t.getIdentifier(s),xe(t.collections,n.bind(null,s,o)),s._found_||t.removeIdentifier(o)};return xe(e,a),!1};S.prototype.destroy=function(){var i=this;i.unbindDocument(!0),i.ids={},i.index=0,i.collections.forEach(function(e){e.destroy()}),i.off()};S.prototype.onDestroyed=function(i,e){var t=this;if(t.collections.indexOf(e)<0)return!1;t.collections.splice(t.collections.indexOf(e),1)};const Ee=new S,Ie={create:function(i){return Ee.create(i)},factory:Ee};class ii{constructor(e,t,o,r,n){this.initializeLeftJoystick(o,r,n),this.initializeRightJoystick(e,t)}initializeLeftJoystick(e,t,o){let r=Ie.create({zone:document.getElementById("leftJoystickContainerDynamic"),mode:"static",dynamicPage:!0,position:{left:"20%",bottom:"20%"},color:"blue",restOpacity:.25});r.on("move",(a,s)=>{s.vector.y>.1?t.z=-o*Math.abs(s.vector.y):s.vector.y<-.1?t.z=o*Math.abs(s.vector.y):t.z=0,s.vector.x>.1?t.x=o*Math.abs(s.vector.x):s.vector.x<-.1?t.x=-o*Math.abs(s.vector.x):t.x=0,console.log("leftJoystickManager on move")}),r.on("end",()=>{t.x=0,t.y=0,t.z=0});const n=document.getElementById("rightJoystickContainerDynamic");n&&(n.style.display="block")}initializeRightJoystick(e,t){let o=Ie.create({zone:document.getElementById("rightJoystickContainerDynamic"),mode:"static",dynamicPage:!0,position:{right:"20%",bottom:"20%"},color:"blue",restOpacity:.25});o.on("move",(n,a)=>{a.vector&&(e.lookX=a.vector.x*t.gamepadLookSensitivityX,e.lookY=a.vector.y*t.gamepadLookSensitivityY)}),o.on("end",()=>{e.lookX=0,e.lookY=0});const r=document.getElementById("rightJoystickContainerDynamic");r&&(r.style.display="block")}}const He=new _t,g={isDebug:!1,lockCameraToTerrain:!0,yCameraOffsetFromTerrain:5,gamepadLookSensitivityX:1.2,gamepadLookSensitivityY:.7,skyType:$e.Skybox,terrain:{mapWidth:2500,minimumChunkSize:250,verticesPerChunkSide:32,heightFactor:100},sky:{turbidity:10,rayleigh:2,mieCoefficient:.005,mieDirectionalG:.8,luminance:1},sun:{inclination:.31,azimuth:.25}},k=new we(75,window.innerWidth/window.innerHeight);k.near=1;k.far=1e5;k.position.set(0,0,0);k.updateProjectionMatrix();const W=new jt(k),j=1,O=new b,ve=new b;let fe=!1;const z=new kt({});z.setPixelRatio(window.devicePixelRatio);z.setSize(window.innerWidth,window.innerHeight);document.body.appendChild(z.domElement);const h=new $t(W,z,g,He),Ve=new Pt;document.body.appendChild(Ve.dom);window.addEventListener("resize",()=>{k.aspect=window.innerWidth/window.innerHeight,k.updateProjectionMatrix(),z.setSize(window.innerWidth,window.innerHeight)});const Te=/Mobi|Android/i.test(navigator.userAgent);let Xe=!1;new ii(W,g,fe,O,j);const Ze=new qt;if(!Te){let i=Ze.initializePointerLock(W,document);i&&!Xe&&h.add(i?.object)}const ie=document.getElementById("blocker"),ri=document.getElementById("instructions");ie.addEventListener("touchstart",i=>{Xe=!0,ri.style.display="none",ie.style.display="none"});ie.addEventListener("touchend",i=>{});ie.addEventListener("touchcancel",i=>{});ie.addEventListener("touchmove",i=>{});document.addEventListener("keydown",i=>{switch(i.code){case"KeyW":case"ArrowUp":O.z=-j;break;case"KeyS":case"ArrowDown":O.z=j;break;case"KeyA":case"ArrowLeft":O.x=-j;break;case"KeyD":case"ArrowRight":O.x=j;break;case"KeyQ":g.lockCameraToTerrain=!1,O.y=j;break;case"KeyZ":g.lockCameraToTerrain=!1,O.y=-j;break;case"ShiftLeft":case"ShiftRight":fe=!0;break;case"KeyL":g.lockCameraToTerrain=!0;break}});document.addEventListener("keyup",i=>{switch(i.code){case"KeyW":case"KeyS":case"ArrowUp":case"ArrowDown":O.z=0;break;case"KeyA":case"KeyD":case"ArrowLeft":case"ArrowRight":O.x=0;break;case"KeyQ":case"KeyZ":O.y=0;break;case"ShiftLeft":case"ShiftRight":fe=!1;break}});function oi(){const i=performance.now(),e=(i-Ne)/1e3;Ne=i;let t=fe?10:1,o=O.clone();Te?ve.copy(o.multiplyScalar(t)).applyQuaternion(W.yawObject.quaternion):ve.copy(o.multiplyScalar(t)).applyQuaternion(k.quaternion),W.moveRig(ve,Ze.isPointerLockActive()),W.update(e)}const U=new Dt;U.title("Debug");U.add(document,"title");(!g.isDebug||Te)&&U.close();const J=U.addFolder("General");J.add(g,"isDebug").listen().onChange(i=>h.switchIsDebug(i));J.add(g,"skyType",{Skybox:0,Shader:1}).onChange(i=>si(i));J.add(h.children,"length").name("Scene Children Count").listen();J.add(z.info.memory,"geometries").name("Scene Geometry Count").listen();J.add(z.info.memory,"textures").name("Scene Texture Count").listen();J.add(z.info?.programs,"length").name("Scene Program Count").listen();const D=U.addFolder("Camera");D.add(g,"lockCameraToTerrain").name("Lock Camera To Terrain?").listen();D.add(g,"yCameraOffsetFromTerrain",-100,100,.5).name("Locked Camera Offset").listen();D.add(k.position,"x",h.quadTree.bounds.min.x,h.quadTree.bounds.max.x).listen();D.add(k.position,"y",0,1e4).listen();D.add(k.position,"z",h.quadTree.bounds.min.y,h.quadTree.bounds.max.y).listen();D.add(k.quaternion,"x").name("quaternion x").listen();D.add(k.quaternion,"y").name("quaternion y").listen();D.add(k.quaternion,"z").name("quaternion z").listen();D.add(k.quaternion,"w").name("quaternion w").listen();D.add(k,"far",0,1e6,10).listen();D.add(W.yawObject.rotation,"y").name("yaw rotation y").listen();D.add(W.pitchObject.rotation,"x").name("pitch rotation x").listen();D.add(O,"x").name("velocity.x").listen();D.add(O,"y").name("velocity.y").listen();D.add(O,"z").name("velocity.z").listen();D.open();const ni=U.addFolder("Quadtree");ni.add(h,"totalNodes").name("Total Nodes").listen();const oe=()=>{h.sky.material.uniforms.turbidity.value=g.sky.turbidity,h.sky.material.uniforms.rayleigh.value=g.sky.rayleigh,h.sky.material.uniforms.mieCoefficient.value=g.sky.mieCoefficient,h.sky.material.uniforms.mieDirectionalG.value=g.sky.mieDirectionalG},Je=()=>{var i=Math.PI*(g.sun.inclination-.5),e=2*Math.PI*(g.sun.azimuth-.5);const t=new b;t.x=Math.cos(e),t.y=Math.sin(e)*Math.sin(i),t.z=Math.sin(e)*Math.cos(i),h.sky.material.uniforms.sunPosition.value.copy(t),h.water!=null&&h.water.material.uniforms.sunDirection.value.copy(t.normalize())},ne=U.addFolder("Sky");ne.add(g.sky,"turbidity",.1,30).onChange(oe);ne.add(g.sky,"rayleigh",.1,4).onChange(oe);ne.add(g.sky,"mieCoefficient",1e-4,.1).onChange(oe);ne.add(g.sky,"mieDirectionalG",0,1).onChange(oe);ne.add(g.sky,"luminance",0,1).onChange(oe);const Ke=U.addFolder("Sun");Ke.add(g.sun,"inclination",0,1).onChange(Je);Ke.add(g.sun,"azimuth",0,1).onChange(Je);h.water!=null&&U.addFolder("Water").add(h.water.position,"y",-10,100,.5).name("Elevation");function si(i){h.switchSky(i)}let Ne=performance.now();function Qe(){oi();const i=He.getElapsedTime();if(h.waterLite!=null){let e=h.waterLite.mesh.material;e.uniforms.time.value=i,h.waterLite.mesh.visible=!1,h.waterLite.update(k,25.01),z.setRenderTarget(h.waterLite.renderTarget),z.render(h,h.waterLite.mirrorCamera),z.setRenderTarget(null),h.waterLite.mesh.visible=!0}if(h.waterReflector!=null){if(h.waterReflector.waterOverlay!=null){let t=h.waterReflector.waterOverlay.material;t.uniforms.time.value=i}let e=h.waterReflector.reflector.material;e.uniforms.time.value=i}if(h.waterSimplePlane!=null){let e=h.waterSimplePlane.mesh.material;e.uniforms.time.value=i}z.render(h,k),Ve.update(),requestAnimationFrame(Qe),h.update(g)}Qe();
