import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const orchidStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:1,stemLength:2.1,leafShape:'broad',leafCount:2,roughness:.46,sheen:.7,center:'stamens',centerRadius:.055,centerHeight:.05,layers:[
  whorl(1,.03,-.035,1.28,{length:.96,width:.4,cup:.04,curl:.05,edge:.1,taper:.7},{offset:Math.PI}),
  whorl(1,.03,-.03,1.28,{length:.88,width:.4,cup:.05,curl:.06,edge:.1,taper:.7},{offset:Math.PI/3}),
  whorl(1,.03,-.03,1.28,{length:.9,width:.4,cup:.06,curl:.05,edge:.1,taper:.7},{offset:-Math.PI/3}),
  whorl(1,.025,.025,1.09,{length:.92,width:.97,cup:.05,curl:.09,edge:.15,roundness:1,ripple:.018,taper:.5,spots:.35},{offset:Math.PI/2,delay:.07}),
  whorl(1,.025,.025,1.13,{length:.89,width:1.02,cup:.08,curl:.07,edge:.15,roundness:1,ripple:.02,taper:.5,spots:.35},{offset:-Math.PI/2,delay:.09}),
  whorl(1,.06,.09,1.5,{length:.53,width:.47,cup:.03,curl:-.25,edge:.18,roundness:.9,ripple:.026,taper:.42,thickness:.024},{offset:0,color:'#ae377f',delay:.13}),
  whorl(1,.02,.11,.3,{length:.25,width:.22,cup:.25,curl:.09,edge:.08,roundness:1},{color:'#e4c06d',delay:.1}),
]};
export function Orchid(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="orchid" structure={orchidStructure}/>;}
