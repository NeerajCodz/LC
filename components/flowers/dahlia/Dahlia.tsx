import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const dahliaStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.65,leafShape:'serrated',roughness:.61,sheen:.65,layers:Array.from({length:13},(_,i)=>whorl(27-i,.2-i*.014,-.15+i*.043,1.52-i*.11,{length:.96-i*.06,width:.27-i*.015,cup:.03,curl:.025,edge:.12-i*.007,taper:.52,roundness:.2,thickness:.012,ripple:.004},{offset:i*2.399,delay:i*.013,variation:.08}))};
export function Dahlia(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="dahlia" structure={dahliaStructure}/>;}
