import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { BASE_STRUCTURE, whorl } from '@/lib/flowers/structure';
import { FlowerPlant } from '../FlowerPlant';
export const sunflowerStructure:FlowerStructure={...BASE_STRUCTURE,headTilt:.95,stemLength:2.2,stemRadius:.042,leafShape:'broad',leafCount:3,center:'seeds',centerRadius:.51,centerHeight:.08,roughness:.7,sheen:.35,layers:[
  whorl(24,.48,0,1.36,{length:.72,width:.21,cup:.01,curl:.09,edge:.05,taper:.75,ripple:.008},{variation:.19}),
  whorl(21,.47,.025,1.26,{length:.64,width:.22,cup:.02,curl:.07,edge:.055,taper:.75,ripple:.009},{offset:.14,delay:.04}),
  whorl(14,.32,-.08,1.5,{length:.44,width:.14,cup:.08,curl:.1,edge:.025,taper:1.1,thickness:.014},{color:'#445c26',offset:.2}),
]};
export function Sunflower(props:Omit<FlowerProps,'type'>){return <FlowerPlant {...props} type="sunflower" structure={sunflowerStructure}/>;}
