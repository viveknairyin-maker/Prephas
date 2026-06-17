import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { blogPosts } from '../data/blogPosts';

const CATEGORIES = [
  "All",
  "ATS Optimization",
  "Resume Writing",
  "Resume Templates",
  "Job Search",
  "Career Advice",
  "Interview Preparation",
  "Students & Freshers"
];

function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.sections.some(sec => 
          sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          sec.paragraphs.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Featured post is the first article matching current category (or the first article overall if category is All)
  const featuredPost = useMemo(() => {
    const list = selectedCategory === "All" 
      ? blogPosts 
      : blogPosts.filter(p => p.category === selectedCategory);
    return list.length > 0 ? list[0] : null;
  }, [selectedCategory]);

  // Remaining posts to display in the grid
  const gridPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter(post => post.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  return (
    <div className="font-body-md text-body-md bg-white min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>PREPHAS Blog | Resume Tips, ATS Strategies & Career Advice</title>
        <meta name="description" content="Discover professional resume writing tips, applicant tracking system (ATS) optimization guides, career advice, and interview preparation resources on the PREPHAS Blog." />
        <link rel="canonical" href="https://www.prephas.online/blog" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="PREPHAS Blog | Career Tips & ATS Guides" />
        <meta property="og:description" content="Read our latest career insights, resume templates guidance, and step-by-step guides on passing ATS checkers." />
        <meta property="og:image" content="https://www.prephas.online/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prephas.online/blog" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PREPHAS Blog | Resume & Career Tips" />
        <meta name="twitter:description" content="Unlock expert strategies for optimizing your resume templates and understanding ATS scores." />
        <meta name="twitter:image" content="https://www.prephas.online/logo.png" />

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
              }
            ]
          })}
        </script>
      </Helmet>
      
      <Navbar />

      <main className="pt-24 md:pt-32 pb-24 flex-grow px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <section className="border-b border-black pb-12 mb-12">
          <div className="max-w-3xl">
            <span className="font-label-sm text-xs uppercase tracking-widest text-zinc-500 block mb-3">Resources & Guides</span>
            <h1 className="font-display text-4xl md:text-6xl font-black uppercase text-black tracking-tight leading-none mb-6">
              PREPHAS Blog
            </h1>
            <p className="text-zinc-600 text-lg md:text-xl font-light leading-relaxed">
              Expert resume writing tips, ATS matching strategies, fresher career guidance, and job search insights to help you land interviews.
            </p>
          </div>
        </section>

        {/* Filter and Search Bar Container */}
        <section className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
            {/* Categories Scrollable Container */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-zinc-200">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-none whitespace-nowrap transition-all duration-150 ${
                    selectedCategory === category 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-300 focus:outline-none focus:border-black rounded-none placeholder-zinc-400"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg pointer-events-none">
                search
              </span>
            </div>
          </div>
        </section>

        {/* Featured Article Section */}
        {featuredPost && searchQuery.trim() === "" && (
          <section className="mb-16">
            <h2 className="font-label-sm text-xs uppercase tracking-widest text-zinc-400 mb-6 font-bold">Featured Article</h2>
            <div className="border border-black block-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 bg-white grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto bg-zinc-100 overflow-hidden relative border-b lg:border-b-0 lg:border-r border-black">
                <img 
                  src={featuredPost.coverImage} 
                  alt={featuredPost.title} 
                  loading="lazy"
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <span>{featuredPost.category}</span>
                    <span>•</span>
                    <span>{featuredPost.readingTime}</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-black uppercase text-black leading-tight">
                    <Link to={`/blog/${featuredPost.slug}`} className="hover:underline">
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="text-zinc-600 text-sm leading-relaxed font-light">
                    {featuredPost.excerpt}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-zinc-200 flex items-center justify-between">
                  <div className="text-xs text-zinc-500 font-medium">
                    Published on {featuredPost.publishedDate}
                  </div>
                  <Link 
                    to={`/blog/${featuredPost.slug}`}
                    className="text-xs uppercase tracking-widest font-black text-black hover:underline flex items-center gap-1"
                  >
                    Read Article <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Blog Post Grid */}
        <section className="space-y-8">
          <h2 className="font-label-sm text-xs uppercase tracking-widest text-zinc-400 mb-6 font-bold">Latest Articles</h2>
          {filteredPosts.length === 0 ? (
            <div className="border border-zinc-200 py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-zinc-300 block mb-3">drafts</span>
              <p className="text-zinc-500 text-sm">No articles match your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* If search query is present, we show all filtered posts in the grid, else we show gridPosts (which excludes the featured post) */}
              {(searchQuery.trim() !== "" ? filteredPosts : gridPosts).map(post => (
                <article key={post.id} className="border border-zinc-300 block-shadow bg-white flex flex-col h-full hover:border-black transition-colors duration-200">
                  <div className="aspect-[16/10] bg-zinc-100 overflow-hidden border-b border-zinc-300">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      loading="lazy"
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.readingTime}</span>
                      </div>
                      <h3 className="font-display text-lg font-black uppercase text-black leading-snug">
                        <Link to={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3 font-light">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-zinc-200 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">{post.publishedDate}</span>
                      <Link 
                        to={`/blog/${post.slug}`} 
                        className="text-[10px] uppercase tracking-wider font-bold text-black hover:underline flex items-center gap-0.5"
                      >
                        Read <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default BlogListPage;
