import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return <footer className="site-footer"><div className="shell">
    <div className="footer-top"><div><Link href="/" className="brand" aria-label="Afluma home"><Image unoptimized src="/assets/brand/afluma-wordmark.webp" width={392} height={46} alt="Afluma" /></Link><p>Intelligence in motion.<br />People in command.</p></div>
      <div><h2>Explore</h2><Link href="/workforce">AI workforce</Link><Link href="/platform/agenticos">AgenticOS</Link><Link href="/products">Products</Link><Link href="/services">Services</Link><Link href="/blog">Practical guides</Link></div>
      <div><h2>Company</h2><Link href="/about">About Afluma</Link><Link href="/industries">Industries</Link><Link href="/locations">Regions</Link><Link href="/work">Our work</Link><Link href="/research">Research & thinking</Link><Link href="/news">AI news & reading</Link><Link href="/careers">Careers</Link></div>
      <div><h2>Connect & trust</h2><Link href="/contact">Contact</Link><Link href="/security">Security principles</Link><Link href="/responsible-ai">Responsible AI</Link></div>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} Afluma</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link></span><a href="#main">Back to top ↑</a></div>
  </div></footer>
}


