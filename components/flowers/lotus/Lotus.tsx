import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const lotusStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.32,stemLength:2,stemRadius:.033,leafShape:'round',leafCount:1,center:'pod',centerRadius:.23,centerHeight:.25,roughness:.44,sheen:.55,layers:[
  whorl(9,.22,-.07,1.12,{length:1.02,width:.58,cup:.06,curl:.03,edge:.14,taper:.8,thickness:.023},{offset:.2}),
  whorl(8,.17,0,.83,{length:.99,width:.58,cup:.06,curl:.04,edge:.14,taper:.75,thickness:.022},{offset:.56,delay:.05}),
  whorl(7,.13,.06,.54,{length:.85,width:.49,cup:.08,curl:.03,edge:.1,taper:.8,thickness:.021},{offset:.1,delay:.12}),
]};
export function Lotus(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="lotus" structure={lotusStructure}/>;}
