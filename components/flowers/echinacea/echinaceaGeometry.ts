import type { Vec3 } from "@/lib/flowers/types";
import { anchoredHeadCluster, specimenClusterPoint, type SpecimenModel, type SpecimenSurface, type SpecimenOrgan } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";

export function echinaceaRay(index: number): SpecimenSurface["sample"] {
  const a=index*Math.PI*2/21, length=0.79+0.045*Math.sin(index*1.9);
  return (u,v,open) => {
    const across=2*u-1, tooth=0.014*(0.5+0.5*Math.cos(u*Math.PI*6))*v**12;
    const w=across*(0.0025+0.102*Math.sin(v*Math.PI*0.95)**0.64)*(0.16+0.84*open);
    const r=0.30*(1-v)*(1-open)+(1-open)*0.10*Math.sin(v*Math.PI)+open*(0.30+length*Math.sin(v*1.25)-tooth);
    const y=0.052+(1-open)*0.48*v+open*(0.075*Math.sin(v*Math.PI)-0.46*v*v+0.025*across*across*Math.sin(v*Math.PI));
    return [Math.sin(a)*r+Math.cos(a)*w,y,Math.cos(a)*r-Math.sin(a)*w];
  };
}
const corolla: SpecimenSurface = { name: "five-lobed fertile corolla", cluster: 0, role: "tube", tissue: "disc", periodic: true, thickness: 0.0025, overviewColumns: 30,
  sample: (u,v,open) => { const a=u*Math.PI*2,lobe=0.5+0.5*Math.cos(a*5),r=0.009+v*v*(0.005+0.005*open);
    return [Math.sin(a)*r, v*(0.049+0.018*open)+0.016*lobe*v**9*open,Math.cos(a)*r]; },
};
const diskOrgans=floralStamens({ count:5, cluster:0, overviewSides:3, radius:0.007, height:0.061, base:0.023, foldedHeight:0.045, filamentRadius:0.0015, antherLength:0.016, filament:"#b9a976", anther:"#663c32" });
for(const side of [-1,1]) diskOrgans.push({name:"disk style arm",cluster:0,overviewSides:3,
  points:[[0,0.057,0],[side*0.003,0.078,0],[side*0.007,0.087,0.002]],
  foldedPoints:[[0,0.033,0],[side*0.002,0.044,0],[side*0.003,0.052,0]], radius:0.0019,endRadius:0.0015,color:"#dbb665"});
diskOrgans.push({ name: "sharp receptacular palea", cluster: 0, overviewSides: 4, bloomMorph: true,
  points: [[0,-0.015,-0.019],[0,0.060,-0.024],[0,0.132,-0.037]],
  foldedPoints: [[0,-0.01,-0.015],[0,0.038,-0.019],[0,0.081,-0.022]],
  radius: 0.014, endRadius: 0.0007, flatten: 0.45, color: "#bf6328" });
export const ECHINACEA_MODEL: SpecimenModel = {
  ambientSurfaceBatching:true,
  clusters:[anchoredHeadCluster(0.62,-0.18,1,0.012)],surfaces:[],organs:[],
  instances:[{name:"conical bisexual disc florets and paleae",cluster:0,surfaces:[corolla],organs:diskOrgans,
    poses:Array.from({length:112},(_,i)=>{const a=i*2.399963229728653,r=0.305*Math.sqrt((i+0.5)/112),t=1-r/0.305;
      return {position:[Math.sin(a)*r,0.055+0.43*t,Math.cos(a)*r] as Vec3,
        foldedPosition:[Math.sin(a)*r*0.77,0.06+0.10*t,Math.cos(a)*r*0.77] as Vec3,
        rotation:[Math.cos(a)*0.36, a,-Math.sin(a)*0.36] as Vec3,
        scale:0.9+0.08*Math.sin(i*1.7)**2,delay:0.08+0.21*t,phase:i*0.31};}),
  }],
};
for(let i=0;i<21;i++) ECHINACEA_MODEL.surfaces.push({name:"sterile recurved ray",cluster:0,role:"petal",thickness:0.012,
  flexible:true,cage:[3,5],mobileCage:[2,3],compliance:0.000075,shapeCompliance:0.0007,delay:(i%3)*0.012,sample:echinaceaRay(i)});
ECHINACEA_MODEL.surfaces.push({name:"conical receptacle",cluster:0,role:"calyx",periodic:true,thickness:0.018,
  contactObstacle:true,cage:[10,4],mobileCage:[6,3],overviewColumns:24,
  sample:(u,v,open)=>{const a=u*Math.PI*2,r=(0.305*(1-v)+0.004)*(0.77+0.23*open);
    return [Math.sin(a)*r,0.047+v*(0.10+0.33*open),Math.cos(a)*r];},
});
ECHINACEA_MODEL.surfaces.push({name:"peduncle receptacular junction",cluster:0,role:"calyx",periodic:true,thickness:0.016,overviewColumns:24,
  sample:(u,v)=>{const a=u*Math.PI*2,r=0.037+0.268*Math.sin(v*Math.PI*0.5);
    return [Math.sin(a)*r,-0.18+0.227*v,Math.cos(a)*r];},
});
for(let rank=0;rank<2;rank++) for(let i=0;i<12;i++) {
  const a=i*Math.PI/6+rank*0.23;
  ECHINACEA_MODEL.surfaces.push({name:"lanceolate involucral phyllary",cluster:0,role:"calyx",thickness:0.011,
    sample:(u,v,open)=>{const w=(2*u-1)*(0.002+0.028*Math.sin(v*Math.PI));
      const r=(0.255+rank*0.024)*(1-v*0.95)*(1-open)+(0.255+rank*0.024+(0.15-rank*0.04)*v)*open;
      return [Math.sin(a)*r+Math.cos(a)*w,-0.04+v*(0.50*(1-open)-0.17*open),Math.cos(a)*r-Math.sin(a)*w];},
  });
}
export const ECHINACEA_STALKS: SpecimenOrgan[]=[];
export const ECHINACEA_HEAD_CENTER=specimenClusterPoint(ECHINACEA_MODEL.clusters[0],[0,0.21,0]);
