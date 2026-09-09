import Link from 'next/link';
import { Flower2, ArrowUpRight } from 'lucide-react';
export function Header({active='specimen'}:{active?:'specimen'|'garden'|'gallery'}) {
  return <header className="site-header"><Link href="/" className="wordmark" aria-label="Living Colors home"><Flower2 size={27} strokeWidth={1} /><span>living colors<span className="wordmark-dot">®</span></span></Link><nav aria-label="Main navigation"><Link href="/" aria-current={active==='specimen'?'page':undefined}>The specimen</Link><Link href="/garden" aria-current={active==='garden'?'page':undefined}>The garden</Link><Link href="/gallery" aria-current={active==='gallery'?'page':undefined}>The collection <ArrowUpRight size={13}/></Link></nav><span className="header-caption">A DIGITAL BOTANICAL STUDY</span></header>;
}
