import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const cherryBlossomStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.72,stemLength:1.9,stemRadius:.028,leafCount:1,center:'stamens',centerRadius:.1,centerHeight:.06,roughness:.61,sheen:.65,layers:[whorl(5,.025,0,1.13,{length:.59,width:.48,cup:.035,curl:.03,edge:.055,roundness:1,taper:.5,notch:.095,ripple:.008,thickness:.009},{variation:.08})],blossoms:[
  {position:[0,.1,0],rotation:[.1,0,0],scale:1},
  {position:[-.53,-.16,.1],rotation:[.22,.3,.16],scale:.77},
  {position:[.56,-.16,-.02],rotation:[-.22,0,-.1],scale:.9},
]};
export function CherryBlossom(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="cherry-blossom" structure={cherryBlossomStructure}/>;}
