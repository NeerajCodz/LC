import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const tulipStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.17,stemLength:2.35,stemRadius:.037,leafCount:2,roughness:.43,sheen:.65,center:'stamens',centerRadius:.13,centerHeight:.25,layers:[
  whorl(3,.09,0,.24,{length:1.28,width:1.03,cup:.14,curl:.04,edge:.27,roundness:1,taper:.58,thickness:.02},{offset:.24,variation:.06}),
  whorl(3,.07,.035,.13,{length:1.24,width:1,cup:.15,curl:.06,edge:.26,roundness:1,taper:.58,thickness:.021},{offset:Math.PI/3+.24,delay:.06,variation:.04}),
]};
export function Tulip(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="tulip" structure={tulipStructure}/>;}
