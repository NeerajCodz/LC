import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const lilyStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.8,leafCount:4,center:'stamens',centerRadius:.3,centerHeight:.52,layers:[
  whorl(3,.08,0,.87,{length:1.35,width:.54,cup:.1,curl:.48,edge:.075,taper:.75,spots:1,thickness:.015},{offset:.3}),
  whorl(3,.06,.04,.72,{length:1.3,width:.65,cup:.1,curl:.5,edge:.1,taper:.65,spots:1,thickness:.017},{offset:Math.PI/3+.3,delay:.05}),
]};
export function Lily(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="lily" structure={lilyStructure}/>;}
