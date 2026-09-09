import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const peonyStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.5,leafShape:'broad',roughness:.7,sheen:.72,layers:[
  whorl(7,.2,-.14,1.1,{length:1.05,width:1.08,cup:.06,curl:.06,edge:.19,roundness:1,ripple:.022},{variation:.2}),
  whorl(9,.16,-.02,.9,{length:.93,width:.85,cup:.08,curl:.04,edge:.18,roundness:1,ripple:.032},{offset:.37,variation:.2,delay:.03}),
  ...Array.from({length:8},(_,i)=>whorl(15-i,.12-i*.012,.05+i*.043,.87-i*.11,{length:.76-i*.06,width:.5-i*.038,cup:.08,curl:.06,edge:.15,ripple:.037,roundness:1,taper:.3,twist:.13,thickness:.01},{offset:i*2.399,variation:.3,delay:.07+i*.015})),
]};
export function Peony(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="peony" structure={peonyStructure}/>;}
