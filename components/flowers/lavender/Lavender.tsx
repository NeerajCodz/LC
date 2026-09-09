import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const lavenderStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.1,stemLength:2.1,stemRadius:.012,leafShape:'needle',leafCount:5,roughness:.79,sheen:.3,layers:Array.from({length:12},(_,i)=>whorl(7, .065-(i/12)*.035, i*.08, .98,{length:.18-i*.006,width:.09-i*.003,cup:.15,curl:.04,edge:.035,roundness:.9,taper:.45,thickness:.008},{offset:i*2.399,delay:i*.018,variation:.16,color:i>8?'#8a75a9':undefined})),blossoms:[
  {position:[0,-.1,0],rotation:[0,0,0],scale:1},
  {position:[-.39,-.38,.02],rotation:[0,0,.21],scale:.84},
  {position:[.39,-.53,-.04],rotation:[0,0,-.2],scale:.79},
  {position:[.18,-.25,-.27],rotation:[-.12,0,-.12],scale:.87},
]};
export function Lavender(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="lavender" structure={lavenderStructure}/>;}
