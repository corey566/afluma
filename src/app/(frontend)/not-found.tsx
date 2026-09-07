import Link from 'next/link'
import { generated } from '@/afluma-site/assets'

export default function NotFound(){return <section className="a7-not-found"><div className="a7-shell"><div><span className="a7-kicker">404</span><h1>That route is not part of the system.</h1><p>Use the main navigation, return home or start from Afluma’s core capabilities.</p><div className="a7-actions"><Link href="/" className="a7-button a7-button--primary">Go home →</Link><Link href="/services/" className="a7-button a7-button--ghost">Explore services</Link></div></div><img src={generated.ribbonSculpture} alt=""/></div></section>}
