'use client';
import type { FlowerProps } from '@/lib/flowers/types';
import { Rose } from './rose/Rose';
export function Flower(props: FlowerProps) { return <Rose {...props} />; }
