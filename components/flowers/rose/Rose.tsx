import type { FlowerProps } from '@/lib/flowers/types';
import { FlowerPlant } from '../FlowerPlant';
import { roseStructure } from './roseStructure';
export function Rose(props: Omit<FlowerProps, 'type'>) { return <FlowerPlant {...props} type="rose" structure={roseStructure} />; }
