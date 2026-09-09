import { useMemo, useEffect } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import type { Vec3 } from '@/lib/flowers/types';
export function Branch({end,color='#445235'}:{end:Vec3;color?:string}){
  const [x,y,z]=end;
  const geometry=useMemo(()=>new TubeGeometry(new CatmullRomCurve3([new Vector3(0,-.55,0),new Vector3(x*.35,y*.35-.28,z*.35),new Vector3(x,y,z)]),18,.012,6,false),[x,y,z]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} castShadow><meshStandardMaterial color={color} roughness={.9}/></mesh>;
}
