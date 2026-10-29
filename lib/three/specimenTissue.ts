import type { SpecimenTissue } from "./specimenModel";

/** Authored optical response; these coefficients are not measured botanical data. */
export const TISSUE_RESPONSE: Record<
  string,
  { roughness: number; sheen: number; coat: number; scatter: number }
> = {
  gazania: { roughness: 0.71, sheen: 0.18, coat: 0.005, scatter: 0.055 },
  salvia: { roughness: 0.65, sheen: 0.2, coat: 0.01, scatter: 0.055 },
  nicotiana: { roughness: 0.68, sheen: 0.17, coat: 0.008, scatter: 0.07 },
  lantana: { roughness: 0.73, sheen: 0.16, coat: 0.003, scatter: 0.058 },
  echinacea: { roughness: 0.77, sheen: 0.15, coat: 0, scatter: 0.055 },
  torenia: { roughness: 0.81, sheen: 0.16, coat: 0, scatter: 0.062 },
  lobelia: { roughness: 0.72, sheen: 0.18, coat: 0.003, scatter: 0.063 },
  pentas: { roughness: 0.7, sheen: 0.2, coat: 0.005, scatter: 0.06 },
  ixora: { roughness: 0.56, sheen: 0.16, coat: 0.035, scatter: 0.045 },
  tuberose: { roughness: 0.43, sheen: 0.2, coat: 0.065, scatter: 0.049 },
  fritillaria: { roughness: 0.48, sheen: 0.17, coat: 0.055, scatter: 0.051 },
  hollyhock: { roughness: 0.63, sheen: 0.23, coat: 0.012, scatter: 0.068 },
  lupine: { roughness: 0.54, sheen: 0.22, coat: 0.02, scatter: 0.047 },
  impatiens: { roughness: 0.6, sheen: 0.19, coat: 0.017, scatter: 0.062 },
  hoya: { roughness: 0.48, sheen: 0.17, coat: 0.065, scatter: 0.037 },
  agapanthus: { roughness: 0.59, sheen: 0.13, coat: 0.025, scatter: 0.044 },
  canna: { roughness: 0.56, sheen: 0.15, coat: 0.035, scatter: 0.047 },
  amaryllis: { roughness: 0.51, sheen: 0.19, coat: 0.05, scatter: 0.054 },
  hyacinth: { roughness: 0.4, sheen: 0.15, coat: 0.1, scatter: 0.042 },
  scabiosa: { roughness: 0.74, sheen: 0.17, coat: 0.003, scatter: 0.063 },
  bottlebrush: { roughness: 0.61, sheen: 0.12, coat: 0.015, scatter: 0.032 },
  wisteria: { roughness: 0.65, sheen: 0.21, coat: 0.012, scatter: 0.058 },
  bluebell: { roughness: 0.5, sheen: 0.23, coat: 0.035, scatter: 0.075 },
  "african-violet": { roughness: 0.74, sheen: 0.23, coat: 0, scatter: 0.048 },
  pansy: { roughness: 0.73, sheen: 0.2, coat: 0.005, scatter: 0.058 },
  cosmos: { roughness: 0.72, sheen: 0.14, coat: 0, scatter: 0.065 },
  nasturtium: { roughness: 0.63, sheen: 0.18, coat: 0.015, scatter: 0.06 },
  gardenia: { roughness: 0.43, sheen: 0.15, coat: 0.075, scatter: 0.04 },
  magnolia: { roughness: 0.42, sheen: 0.14, coat: 0.075, scatter: 0.037 },
  camellia: { roughness: 0.53, sheen: 0.16, coat: 0.03, scatter: 0.043 },
  lisianthus: { roughness: 0.66, sheen: 0.2, coat: 0.008, scatter: 0.055 },
  freesia: { roughness: 0.48, sheen: 0.13, coat: 0.065, scatter: 0.045 },
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
  if (type === "gazania" && tissue === "disc") return "#c7932e";
  if (type === "echinacea" && tissue === "disc") return "#8c6240";
  if (type === "lantana" && tissue === "disc") return "#e99b45";
  if (type === "lantana" && tissue === "guide") return "#eccc47";
  if (type === "lantana" && tissue === "inner") return "#e5d6ac";
  if (type === "torenia" && tissue === "inner") return "#e2d8ad";
  if (type === "lobelia" && tissue === "guide") return "#ece6cb";
  if (type === "lobelia" && tissue === "inner") return "#9584ae";
  if (type === "tuberose" && tissue === "leaf") return "#65835b";
  if (type === "fritillaria" && tissue === "leaf") return "#577948";
  if (type === "lupine" && tissue === "guide") return "#6663ac";
  if (type === "impatiens" && tissue === "inner") return "#d7c5b5";
  if (type === "hoya" && tissue === "inner") return "#e8d4d3";
  if (type === "agapanthus" && tissue === "disc") return "#b9bd98";
  if (type === "canna" && tissue === "guide") return "#d94a23";
  if (type === "canna" && tissue === "inner") return "#eaa255";
  if (type === "amaryllis" && tissue === "disc") return "#b5a87b";
  if (type === "amaryllis" && tissue === "inner") return "#c3d498";
  if (type === "scabiosa" && tissue === "inner") return "#9483bd";
  if (type === "bottlebrush" && tissue === "inner") return "#d0c0a0";
  if (type === "wisteria" && tissue === "inner") return "#8270b3";
  if (type === "pansy" && tissue === "inner") return "#73519a";
  if (type === "pansy" && tissue === "guide") return "#e2b849";
  if (type === "anemone" && tissue === "disc") return "#29243b";
  if (type === "camellia" && tissue === "inner") return "#eddda3";
  if (type === "magnolia" && tissue === "inner") return "#9d8260";
  if (type === "magnolia" && tissue === "disc") return "#87946b";
  if (type === "nasturtium" && tissue === "inner") return "#ba9c5c";
  if (type === "cosmos" && tissue === "disc") return "#e3b95a";
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
    case "gazania":
      if (tissue === "disc")
        return `diffuseColor.rgb*=1.-.07*pow(.5+.5*cos(vPetalUv.x*31.416),12.);`;
      return `float gaW=abs(vPetalUv.x-.5);float gaStripe=exp(-gaW*gaW*150.)*smoothstep(.18,.32,vPetalUv.y);float gaEye=exp(-pow(gaW/.33,4.)-pow((vPetalUv.y-.13)/.09,4.));float gaWhite=exp(-pow(gaW/.10,2.)-pow((vPetalUv.y-.23)/.035,2.));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.48,.12,.018),gaStripe*.6);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.018,.009,.013),gaEye*.98);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.93,.91,.81),gaWhite*.96);`;
    case "salvia":
      return `float saRib=pow(.5+.5*cos(vPetalUv.x*50.265),14.);diffuseColor.rgb*=1.-saRib*.035*smoothstep(.1,.5,vPetalUv.y);`;
    case "nicotiana":
      return `float niTube=1.-smoothstep(.32,.8,vPetalUv.y);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.37,.46,.22),niTube*.6);float niVein=pow(.5+.5*cos(vPetalUv.x*62.832),23.);diffuseColor.rgb*=1.-niVein*.025;`;
    case "lantana":
      if (tissue === "inner") return "";
      return `float laEye=1.-smoothstep(.75,.92,vPetalUv.y);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.61,.29,.065),laEye*.35);diffuseColor.rgb*=1.-.025*pow(.5+.5*cos(vPetalUv.x*50.265),16.);`;
    case "echinacea":
      return `float ecRib=pow(.5+.5*cos(vPetalUv.x*31.416),17.);diffuseColor.rgb*=1.-ecRib*.055;`;
    case "torenia":
      // The stigma has its own cream tissue; corolla UVs run around one fused tube.
      if (tissue === "inner") return "";
      return `float torU=fract(atan(vSpecimenAngle.y,vSpecimenAngle.x)/6.28318530718+1.);
      float torLip=smoothstep(.58,.80,vPetalUv.y);
      float torRoof=1.-smoothstep(.18,.25,abs(torU-.25));
      float torLower=smoothstep(.475,.52,torU)*(1.-smoothstep(.98,1.,torU));
      vec3 torPigment=mix(vec3(.83,.80,.78),vec3(.39,.32,.57),torLip*(.18+.78*torRoof));
      vec2 torLeft=vec2((torU-.575)/.105,(vPetalUv.y-.875)/.24);
      float torRightAcross=abs(torU-.925);
      vec2 torRight=vec2(min(torRightAcross,1.-torRightAcross)/.105,(vPetalUv.y-.875)/.24);
      float torBlotch=(1.-smoothstep(.68,1.,min(length(torLeft),length(torRight))))*smoothstep(.64,.74,vPetalUv.y);
      torPigment=mix(torPigment,vec3(.004,.0008,.018),torBlotch);
      float torRim=torLower*smoothstep(.88,.96,vPetalUv.y);
      torPigment=mix(torPigment,vec3(.027,.003,.095),torRim*.98);
      if(uSpecimenCustomColor>.5){
        vec3 torCustom=diffuseColor.rgb;
        vec3 torCustomThroat=mix(torCustom,vec3(.83,.80,.78),.72);
        vec3 torCustomLip=mix(torCustom,vec3(1.),torRoof*.12);
        torPigment=mix(torCustomThroat,torCustomLip,torLip);
        torPigment=mix(torPigment,torCustom*.035,torBlotch);
        torPigment=mix(torPigment,torCustom*.15,torRim*.98);
      }
      vec2 torGuide=vec2((torU-.75)/.037,(vPetalUv.y-.815)/.12);
      float torYellow=(1.-smoothstep(.58,1.,length(torGuide)))*(1.-smoothstep(.91,.94,vPetalUv.y));
      torPigment=mix(torPigment,vec3(.93,.64,.001),torYellow);
      float torVeinPhase=torU*100.530965+.55*sin(vPetalUv.y*6.283185);
      float torVeinVisibility=1.-smoothstep(.3,1.2,fwidth(torVeinPhase));
      float torVein=pow(.5+.5*cos(torVeinPhase),24.)*torVeinVisibility*smoothstep(.5,.85,vPetalUv.y);
      diffuseColor.rgb=torPigment*(1.+(tissue.g-.5)*.035)*(1.-torVein*.04);`;
    case "lobelia":
      return `float lobThroat=exp(-pow((vPetalUv.x-.5)*7.,2.))*(1.-smoothstep(.5,.8,vPetalUv.y)); float lobVein=pow(.5+.5*cos(vPetalUv.x*31.416),21.)*smoothstep(.66,.91,vPetalUv.y); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.84,.88,.96),lobThroat*.33); diffuseColor.rgb*=1.-lobVein*.052;`;
    case "pentas":
      return `float penThroat=1.-smoothstep(.62,.83,vPetalUv.y); float penVein=pow(.5+.5*cos(vPetalUv.x*31.415927),21.)*smoothstep(.71,.9,vPetalUv.y); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.94,.82,.88),penThroat*.24); diffuseColor.rgb*=1.-penVein*.044;`;
    case "ixora":
      return `float ixoVein=pow(.5+.5*cos(vPetalUv.x*25.13274),23.)*smoothstep(.65,.85,vPetalUv.y); diffuseColor.rgb*=1.-ixoVein*.045;`;
    case "tuberose":
      return `float tubRib=pow(.5+.5*cos(vPetalUv.x*37.699),27.); float tubWax=pow(max(0.,sin(vPetalUv.x*141.)*sin(vPetalUv.y*127.)),8.); diffuseColor.rgb*=1.-tubRib*.023-tubWax*.014;`;
    case "fritillaria":
      return `float fritRib=pow(.5+.5*cos(vPetalUv.x*31.416+vPetalUv.y*2.),25.); diffuseColor.rgb*=1.-fritRib*.039;`;
    case "hollyhock":
      return `float holVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.47)*55.),22.); float holPap=pow(max(0.,sin(vPetalUv.x*167.)*sin(vPetalUv.y*153.)),8.); diffuseColor.rgb*=1.-holVein*.043-holPap*.02;`;
    case "lupine":
      if (tissue === "guide")
        return `float lupPatch=exp(-pow((vPetalUv.x-.5)*5.4,2.)-pow((vPetalUv.y-.28)*8.3,2.)); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.94,.91,.72),lupPatch*.88); float lupGuideVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.62)*56.),24.); diffuseColor.rgb*=1.-lupGuideVein*.022;`;
      return `float lupFiber=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.59)*61.),25.); diffuseColor.rgb*=1.-lupFiber*.035;`;
    case "impatiens":
      if (tissue === "inner")
        return `float impSepFiber=pow(.5+.5*cos(vPetalUv.x*31.416+vPetalUv.y*2.),23.); diffuseColor.rgb*=1.-impSepFiber*.038;`;
      return `float impVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.48)*61.),22.); float impEye=1.-smoothstep(.04,.26,vPetalUv.y); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.96,.85,.79),impEye*.46); diffuseColor.rgb*=1.-impVein*.048;`;
    case "hoya":
      if (tissue === "inner")
        return `float hoyRidge=pow(.5+.5*cos(vPetalUv.x*6.283185),12.); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.61,.17,.28),smoothstep(.12,.48,vPetalUv.y)*.38); diffuseColor.rgb*=1.-hoyRidge*.025;`;
      return `float hoyPap=pow(max(0.,sin(vPetalUv.x*181.)*sin(vPetalUv.y*159.)),8.); float hoyRoot=1.-smoothstep(.06,.29,vPetalUv.y); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.83,.67,.72),hoyRoot*.25); diffuseColor.rgb*=1.-hoyPap*.038;`;
    case "agapanthus":
      if (tissue === "disc")
        return `float agSpatheFiber=pow(.5+.5*cos(vPetalUv.x*71.+vPetalUv.y*5.),22.);diffuseColor.rgb*=1.-agSpatheFiber*.065;`;
      return `float agMid=pow(.5+.5*cos(vPetalUv.x*37.6991),28.)*smoothstep(.31,.53,vPetalUv.y);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.30,.34,.65),agMid*.27);`;
    case "canna":
      if (tissue === "guide")
        return `float canLipSpot=pow(max(0.,sin(vPetalUv.x*61.)*sin(vPetalUv.y*57.)),13.)*smoothstep(.18,.42,vPetalUv.y);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.96,.65,.17),canLipSpot*.65);`;
      return `float canVein=pow(.5+.5*cos(vPetalUv.x*47.+vPetalUv.y*3.),25.);diffuseColor.rgb*=1.-canVein*.032;`;
    case "amaryllis":
      return `if(uSpecimenRegion!=3){float amRoot=1.-smoothstep(.05,.27,vPetalUv.y);float amVein=pow(.5+.5*cos((vPetalUv.x-.5)*48.+vPetalUv.y*2.),22.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.76,.79,.49),amRoot*.72);diffuseColor.rgb*=1.-amVein*.065;}`;
    case "hyacinth":
      return `float hyRib=pow(.5+.5*cos(vPetalUv.x*37.6991118),22.); float hyThroat=1.-smoothstep(.28,.58,vPetalUv.y); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.70,.37,.53),hyThroat*.25); diffuseColor.rgb*=1.-hyRib*.065;`;
    case "scabiosa":
      return `float scaThroat=1.-smoothstep(.25,.64,vPetalUv.y); float scaVein=pow(.5+.5*cos(vPetalUv.x*31.416),24.)*smoothstep(.35,.77,vPetalUv.y); diffuseColor.rgb*=1.-scaVein*.075; diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.65,.60,.76),scaThroat*.24);`;
    case "bottlebrush":
      return `float botVein=pow(.5+.5*cos(vPetalUv.x*38.+vPetalUv.y*6.),23.); diffuseColor.rgb*=1.-botVein*.034;`;
    case "wisteria":
      return `float wisVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.45)*58.),24.); float wisGuide=exp(-pow((vPetalUv.x-.5)*8.,2.))*(1.-smoothstep(.18,.45,vPetalUv.y)); diffuseColor.rgb*=1.-wisVein*.038; diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.86,.76,.44),wisGuide*.38);`;
    case "bluebell":
      return `float bellRib=pow(.5+.5*cos(vPetalUv.x*37.6991118),20.)*sin(vPetalUv.y*3.14159); diffuseColor.rgb*=1.-bellRib*.095;`;
    case "african-violet":
      return `float avThroat=1.-smoothstep(.22,.58,vPetalUv.y); float avVein=pow(.5+.5*cos(vPetalUv.x*31.416),20.); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.69,.64,.8),avThroat*.32); diffuseColor.rgb*=1.-avVein*.046;`;
    case "pansy":
      return `float pansyGuide=exp(-abs(vPetalUv.x-.5)*9.)*(1.-smoothstep(.34,.74,vPetalUv.y)); float pansyLine=pow(.5+.5*cos((vPetalUv.x-.5)*42.+vPetalUv.y*4.),16.); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.14,.045,.2),pansyGuide*pansyLine*.74);`;
    case "cosmos":
      return `float cosVein=pow(.5+.5*cos(vPetalUv.x*46.),24.);diffuseColor.rgb*=1.-cosVein*.045;`;
    case "nasturtium":
      return `float nastVein=pow(.5+.5*cos((vPetalUv.x-.5)*35.+vPetalUv.y*3.),22.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.52,.11,.04),nastVein*smoothstep(.1,.35,vPetalUv.y)*.16);`;
    case "gardenia":
      return `float garVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.5)*57.),25.);diffuseColor.rgb*=1.-garVein*.032;`;
    case "magnolia":
      return `float magVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.35)*51.),26.);diffuseColor.rgb*=1.-magVein*.027;`;
    case "camellia":
      return `float camVein=pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.45)*48.),26.);diffuseColor.rgb*=1.-camVein*.035;`;
    case "lisianthus":
      return `float euPleat=pow(.5+.5*cos(vPetalUv.x*48.+vPetalUv.y*3.),22.); diffuseColor.rgb*=1.-euPleat*.043;`;
    case "freesia":
      return `float frGuide=pow(.5+.5*cos(vPetalUv.x*6.283185),12.)*smoothstep(.5,.77,vPetalUv.y); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.89,.68,.18),frGuide*.66);`;
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
