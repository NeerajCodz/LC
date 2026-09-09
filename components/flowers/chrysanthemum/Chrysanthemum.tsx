import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const chrysanthemumStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.58,leafShape:'serrated',roughness:.74,sheen:.4,layers:Array.from({length:14},(_,i)=>whorl(30-i,.16-i*.009,-.14+i*.045,1.7-i*.12,{length:1.06-i*.064,width:.115-i*.005,cup:.07,curl:.28-i*.017,edge:.035,taper:.35,roundness:.7,ripple:.012,twist:.04,thickness:.008},{offset:i*2.399,delay:i*.012,variation:.17}))};
export function Chrysanthemum(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="chrysanthemum" structure={chrysanthemumStructure}/>;}
