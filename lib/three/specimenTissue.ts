import type { SpecimenTissue } from "./specimenModel";

/** Authored optical response; these coefficients are not measured botanical data. */
export const TISSUE_RESPONSE: Record<
  string,
  { roughness: number; sheen: number; coat: number; scatter: number }
> = {
  crocus: { roughness: 0.58, sheen: 0.16, coat: 0.025, scatter: 0.045 },
  anemone: { roughness: 0.69, sheen: 0.17, coat: 0.008, scatter: 0.065 },
  ranunculus: { roughness: 0.66, sheen: 0.2, coat: 0.015, scatter: 0.055 },
  hellebore: { roughness: 0.59, sheen: 0.12, coat: 0.04, scatter: 0.055 },
  primrose: { roughness: 0.75, sheen: 0.16, coat: 0, scatter: 0.07 },
  petunia: { roughness: 0.73, sheen: 0.22, coat: 0, scatter: 0.08 },
  "lily-of-the-valley": {
    roughness: 0.43,
    sheen: 0.1,
    coat: 0.08,
    scatter: 0.04,
  },
  snowdrop: { roughness: 0.52, sheen: 0.14, coat: 0.045, scatter: 0.045 },
  gladiolus: { roughness: 0.65, sheen: 0.22, coat: 0.012, scatter: 0.065 },
  delphinium: { roughness: 0.71, sheen: 0.21, coat: 0, scatter: 0.065 },
  alstroemeria: { roughness: 0.61, sheen: 0.18, coat: 0.025, scatter: 0.06 },
  gerbera: { roughness: 0.72, sheen: 0.13, coat: 0, scatter: 0.065 },
  zinnia: { roughness: 0.78, sheen: 0.16, coat: 0, scatter: 0.055 },
};
export function specimenTissueColor(type: string, tissue?: SpecimenTissue) {
  if (type === "anemone" && tissue === "disc") return "#29243b";
  if (type === "delphinium" && tissue === "inner") return "#dfdcc2";
  if (type === "alstroemeria" && tissue === "inner") return "#e8c971";
  if (tissue === "disc") {
    if (type === "gerbera") return "#dac090";
    if (type === "zinnia") return "#eac04d";
  }
}
export function specimenTissueShader(type: string, tissue?: SpecimenTissue) {
  if (tissue === "leaf") return "";
  switch (type) {
    case "crocus":
      return `float croVein=pow(.5+.5*cos(vPetalUv.x*44.),24.); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.28,.16,.43),croVein*.13);`;
    case "anemone":
      return `float anVein=pow(.5+.5*cos(vPetalUv.x*49.+vPetalUv.y*3.),23.); diffuseColor.rgb*=1.-anVein*.047;`;
    case "ranunculus":
      return `float ranVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.45)*61.),24.);
      diffuseColor.rgb*=1.-ranVein*.036;`;
    case "hellebore":
      return `float helVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.6)*49.),24.);
      float helSpot=pow(max(0.,sin(vPetalUv.x*83.)*sin(vPetalUv.y*69.)),12.);
      diffuseColor.rgb*=1.-helVein*.045;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.49,.22,.33),helSpot*.15);`;
    case "primrose":
      return `float primThroat=1.-smoothstep(.52,.79,vPetalUv.y);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.82,.60,.10),primThroat*.45);`;
    case "petunia":
      return `float petVein=pow(.5+.5*cos(vPetalUv.x*31.416),25.)*smoothstep(.45,.85,vPetalUv.y);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.65,.72,.56),petVein*.16);`;
    case "snowdrop":
      return tissue === "inner"
        ? `float snowEdge=smoothstep(.69,.80,vPetalUv.y)*(1.-smoothstep(.93,1.,vPetalUv.y));
      float snowArch=.52+.48*cos((vPetalUv.x-.5)*6.28);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.18,.43,.19),snowEdge*snowArch*.92);`
        : "";
    case "gladiolus":
      return tissue === "guide"
        ? `float gladGuide=exp(-pow((vPetalUv.x-.5)*13.,2.))*smoothstep(.14,.35,vPetalUv.y);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.92,.87,.83),gladGuide*.86);`
        : "";
    case "alstroemeria":
      return tissue === "inner"
        ? `vec2 alCells=vPetalUv*vec2(13.,16.);
      float alMark=1.-smoothstep(.12,.23,length((fract(alCells)-.5)*vec2(1.,.47)));
      float alGuide=smoothstep(.24,.43,vPetalUv.y)*(1.-smoothstep(.88,.97,vPetalUv.y));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.28,.10,.045),alMark*alGuide*.86);`
        : "";
    case "delphinium":
      return `diffuseColor.rgb*=1.-.045*pow(.5+.5*cos(vPetalUv.y*73.+vPetalUv.x*17.),18.);`;
    case "gerbera":
      return `diffuseColor.rgb*=1.-.045*pow(.5+.5*cos(vPetalUv.x*52.),24.);`;
    case "zinnia":
      return `diffuseColor.rgb*=1.-.055*pow(.5+.5*cos(vPetalUv.x*39.+vPetalUv.y*4.),20.);`;
    default:
      return "";
  }
}

const TISSUE_TYPES = Object.keys(TISSUE_RESPONSE);
export function specimenTissueKind(type: string) {
  return TISSUE_TYPES.indexOf(type);
}
export function specimenTissueRegion(tissue?: SpecimenTissue) {
  return tissue === "inner"
    ? 1
    : tissue === "guide"
      ? 2
      : tissue === "disc"
        ? 3
        : 0;
}

/** Uniform branches preserve every authored pattern without a program per organ. */
export const SHARED_SPECIMEN_TISSUE_SHADER = TISSUE_TYPES.map((type, kind) => {
  const base = specimenTissueShader(type);
  const variants = (["inner", "guide", "disc"] as const).flatMap((tissue) => {
    const source = specimenTissueShader(type, tissue);
    return source === base
      ? []
      : [`if(uSpecimenRegion==${specimenTissueRegion(tissue)}) { ${source} }`];
  });
  const source = variants.length
    ? `${variants.join(" else ")} else { ${base} }`
    : base;
  return source ? `if(uSpecimenKind==${kind}) { ${source} }` : "";
}).join("\n");
