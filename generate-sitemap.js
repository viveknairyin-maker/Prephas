import fs from 'fs';
import { blogPosts } from './src/data/blogPosts.js';

const DOMAIN = 'https://www.prephas.online';

const staticPages = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'templates', priority: '0.9', changefreq: 'monthly' },
  { path: 'ats-analyzer', priority: '0.9', changefreq: 'monthly' },
  { path: 'login', priority: '0.5', changefreq: 'yearly' },
  { path: 'signup', priority: '0.6', changefreq: 'yearly' },
  { path: 'privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { path: 'terms-and-conditions', priority: '0.4', changefreq: 'yearly' },
  { path: 'blog', priority: '0.8', changefreq: 'daily' },
];

const buildSitemap = () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`;

  // Static Pages
  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/${page.path}</loc>\n`;
    xml += `    <lastmod>2026-06-17</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n\n`;
  });

  // Blog Posts
  blogPosts.forEach(post => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>2026-06-17</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n\n`;
  });

  xml += `</urlset>\n`;

  // Ensure public directory exists
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }

  fs.writeFileSync('./public/sitemap.xml', xml, 'utf8');
  console.log('Sitemap generated successfully inside public/sitemap.xml!');
};

buildSitemap();
