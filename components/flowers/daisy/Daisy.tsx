import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const daisyStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.7,stemRadius:.021,leafCount:2,center:'florets',centerRadius:.26,centerHeight:.09,roughness:.65,sheen:.5,layers:[
  whorl(23,.22,.015,1.36,{length:.68,width:.17,cup:.01,curl:.06,edge:.017,taper:.5,roundness:.8,ripple:.004,thickness:.007},{variation:.18}),
  whorl(17,.21,-.015,1.44,{length:.62,width:.155,cup:.025,curl:.06,edge:.017,taper:.5,roundness:.8,ripple:.004,thickness:.007},{offset:.16,delay:.04}),
]};
export function Daisy(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="daisy" structure={daisyStructure}/>;}
