import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { blogPosts } from '../data/blogPosts';

function BlogPostPage() {
  const { slug } = useParams();

  // Find current post
  const post = useMemo(() => {
    return blogPosts.find(p => p.slug === slug);
  }, [slug]);

  // Handle Redirect if not found
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Related posts (from same category, excluding current post, up to 3)
  const relatedPosts = useMemo(() => {
    const filtered = blogPosts.filter(p => p.category === post.category && p.id !== post.id);
    if (filtered.length >= 3) return filtered.slice(0, 3);
    
    // Add other posts if not enough in same category
    const remaining = blogPosts.filter(p => p.id !== post.id && !filtered.includes(p));
    return [...filtered, ...remaining].slice(0, 3);
  }, [post]);

  // Share Actions
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Article link copied to clipboard!");
  };

  const handleTwitterShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this article: "${post.title}" by PREPHAS`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  // Helper to parse markdown-like links [Text](URL) in paragraphs
  const renderParagraphWithLinks = (text) => {
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const label = match[1];
      const url = match[2];

      if (url.startsWith('https://www.prephas.online')) {
        const path = url.replace('https://www.prephas.online', '');
        parts.push(
          <Link key={match.index} to={path || '/'} className="text-black font-semibold underline hover:opacity-85">
            {label}
          </Link>
        );
      } else {
        parts.push(
          <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="text-black font-semibold underline hover:opacity-85">
            {label}
          </a>
        );
      }

      lastIndex = markdownLinkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Structured Data (JSON-LD Article Schema)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": [post.coverImage],
    "datePublished": new Date(post.publishedDate).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "PREPHAS",
      "url": "https://www.prephas.online"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PREPHAS",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.prephas.online/logo.png"
      }
    },
    "description": post.excerpt
  };

  return (
    <div className="font-body-md text-body-md bg-white min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>{post.seoTitle || `${post.title} | PREPHAS Blog`}</title>
        <meta name="description" content={post.seoDescription || post.excerpt} />
        <link rel="canonical" href={`https://www.prephas.online/blog/${post.slug}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={post.seoTitle || post.title} />
        <meta property="og:description" content={post.seoDescription || post.excerpt} />
        <meta property="og:image" content={post.coverImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.prephas.online/blog/${post.slug}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seoTitle || post.title} />
        <meta name="twitter:description" content={post.seoDescription || post.excerpt} />
        <meta name="twitter:image" content={post.coverImage} />
        
        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.prephas.online"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://www.prephas.online/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": `https://www.prephas.online/blog/${post.slug}`
              }
            ]
          })}
        </script>
      </Helmet>

      <Navbar />

      <article className="pt-24 md:pt-32 pb-24 flex-grow px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Back navigation */}
        <div className="mb-8">
          <Link to="/blog" className="text-zinc-500 hover:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Blog
          </Link>
        </div>

        {/* Header Block */}
        <header className="border-b border-black pb-12 mb-12">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-6">
            <span className="text-black">{post.category}</span>
            <span>•</span>
            <span>{post.readingTime}</span>
            <span>•</span>
            <span>{post.publishedDate}</span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-black uppercase text-black tracking-tight leading-tight mb-6 max-w-4xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none border border-black bg-black text-white flex items-center justify-center font-bold text-sm">
                P
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-black block">{post.author}</span>
                <span className="text-[10px] text-zinc-500 block">Editorial Team</span>
              </div>
            </div>

            {/* Sharing Bar */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleTwitterShare}
                className="w-9 h-9 border border-zinc-200 hover:border-black flex items-center justify-center transition-colors"
                title="Share on X"
              >
                <svg className="w-4 h-4 fill-current text-zinc-600 hover:text-black" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button 
                onClick={handleLinkedInShare}
                className="w-9 h-9 border border-zinc-200 hover:border-black flex items-center justify-center transition-colors"
                title="Share on LinkedIn"
              >
                <svg className="w-4 h-4 fill-current text-zinc-600 hover:text-black" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </button>
              <button 
                onClick={handleCopyLink}
                className="w-9 h-9 border border-zinc-200 hover:border-black flex items-center justify-center transition-colors"
                title="Copy Article Link"
              >
                <span className="material-symbols-outlined text-zinc-600 hover:text-black text-lg">link</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="aspect-[21/9] w-full border border-black overflow-hidden mb-16">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover filter grayscale"
          />
        </div>

        {/* Article Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Table of Contents */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 h-fit space-y-6 order-2 lg:order-1 border-t lg:border-t-0 pt-8 lg:pt-0 border-zinc-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-4">Table of Contents</h3>
              <ul className="space-y-3 border-l border-zinc-200 pl-4 text-xs font-medium">
                {post.sections.map((section, idx) => (
                  <li key={idx}>
                    <a 
                      href={`#section-${idx}`} 
                      className="text-zinc-500 hover:text-black hover:underline transition-colors block py-0.5"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-9 order-1 lg:order-2 space-y-12">
            <div className="prose max-w-none">
              {post.sections.map((section, idx) => (
                <section key={idx} id={`section-${idx}`} className="mb-12 scroll-mt-28">
                  <h2 className="font-display text-xl md:text-2xl font-black uppercase text-black border-b border-zinc-200 pb-3 mb-6">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((para, pIdx) => (
                    <p 
                      key={pIdx} 
                      className="text-zinc-700 text-sm md:text-base leading-relaxed mb-6 font-light"
                    >
                      {renderParagraphWithLinks(para)}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>

        {/* Related Articles Section */}
        <section className="border-t border-black pt-16 mt-20">
          <h2 className="font-display text-xl md:text-2xl font-black uppercase text-black mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map(rPost => (
              <div key={rPost.id} className="border border-zinc-200 hover:border-black transition-colors duration-200 bg-white flex flex-col h-full">
                <div className="aspect-[16/10] bg-zinc-50 overflow-hidden border-b border-zinc-200">
                  <img 
                    src={rPost.coverImage} 
                    alt={rPost.title} 
                    loading="lazy"
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">{rPost.category}</span>
                    <h3 className="font-display text-sm font-black uppercase text-black leading-snug">
                      <Link to={`/blog/${rPost.slug}`} className="hover:underline">
                        {rPost.title}
                      </Link>
                    </h3>
                  </div>
                  <Link 
                    to={`/blog/${rPost.slug}`} 
                    className="text-[9px] uppercase tracking-wider font-bold text-black hover:underline mt-4 block"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>

      <Footer />
    </div>
  );
}

export default BlogPostPage;
