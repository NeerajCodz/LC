import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const hibiscusStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.75,leafShape:'serrated',center:'column',centerRadius:.085,centerHeight:.6,roughness:.64,sheen:.5,layers:[whorl(5,.06,0,1.15,{length:1.2,width:1.15,cup:.05,curl:.1,edge:.15,ripple:.045,roundness:1,taper:.4,twist:.1,thickness:.011},{variation:.13,offset:.2})]};
export function Hibiscus(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="hibiscus" structure={hibiscusStructure}/>;}
