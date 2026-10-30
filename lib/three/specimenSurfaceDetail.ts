/** Authored relief heights in model units; these are not measured tissue data. */
export const SPECIMEN_SURFACE_RELIEF: Record<
  string,
  readonly [number, number, number]
> = {
  gazania: [0.00018, 0.000016, 3],
  salvia: [0.00009, 0.000021, 8],
  nicotiana: [0.000075, 0.000014, 5],
  lantana: [0.000095, 0.000026, 4],
  echinacea: [0.00021, 0.000025, 3],
};

/** Reuses the shared atlas sample; derivatives suppress unresolved fine relief. */
export const SPECIMEN_SURFACE_RELIEF_SHADER = `
if(uSpecimenRelief.x>0.) {
  float specimenReliefPhase=vPetalUv.x*6.28318530718*uSpecimenRelief.z+.12*sin(vPetalUv.y*7.);
  float specimenReliefVisibility=1.-smoothstep(.35,1.5,fwidth(specimenReliefPhase));
  float specimenReliefEnvelope=pow(max(0.,sin(vPetalUv.y*3.14159265)),.7);
  float specimenRelief=cos(specimenReliefPhase)*uSpecimenRelief.x*specimenReliefEnvelope*specimenReliefVisibility;
  microHeight=specimenRelief+(tissue.b-.5)*uSpecimenRelief.y*cellVisibility;
}
`;
