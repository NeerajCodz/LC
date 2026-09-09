import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const marigoldStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.45,leafShape:'serrated',leafCount:4,roughness:.82,sheen:.45,layers:Array.from({length:11},(_,i)=>whorl(26-i,.21-i*.016,-.14+i*.05,1.65-i*.14,{length:.67-i*.037,width:.22-i*.011,cup:.08,curl:.17,edge:.07,ripple:.042,taper:.3,roundness:1,twist:.095,thickness:.009},{offset:i*2.399,delay:i*.017,variation:.23,color:i%3===0?'#e99015':i%3===1?'#f0ad22':'#ed9c16'}))};
export function Marigold(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="marigold" structure={marigoldStructure}/>;}
