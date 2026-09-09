import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const jasmineStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.7,stemRadius:.02,leafCount:3,center:'stamens',centerRadius:.035,centerHeight:.015,layers:[whorl(5,.025,0,1.25,{length:.53,width:.25,cup:.01,curl:.07,edge:.035,taper:.65,thickness:.007,twist:.02},{variation:.1})],blossoms:[
  {position:[0,.25,0],rotation:[0,0,0],scale:1},
  {position:[-.52,-.05,.18],rotation:[.16,0,.2],scale:.82},
  {position:[.5,.02,.08],rotation:[-.06,0,-.28],scale:.9},
  {position:[-.25,.01,-.43],rotation:[-.24,0,.14],scale:.7},
  {position:[.28,-.18,.49],rotation:[.33,0,-.16],scale:.65},
]};
export function Jasmine(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="jasmine" structure={jasmineStructure}/>;}
