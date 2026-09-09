import type { FlowerStructure, PetalLayer, PetalProfile } from './types';
import { PETAL } from '../three/geometry';

export const BASE_STRUCTURE: Omit<FlowerStructure,'layers'> = {
  center:'none',centerRadius:0,centerHeight:0,stemLength:2.1,stemRadius:.025,
  leafShape:'lance',leafCount:3,headTilt:.4,roughness:.62,sheen:.6,
};
export function whorl(count:number, radius:number, height:number, angle:number, profile:Partial<PetalProfile>, options:Partial<Omit<PetalLayer,'profile'|'count'|'radius'|'height'|'angle'>>={}):PetalLayer {
  return {count,radius,height,angle,profile:{...PETAL,...profile},...options};
}
