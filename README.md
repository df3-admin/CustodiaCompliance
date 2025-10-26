# Custodia Blog - Standalone Package

A complete, production-ready blog application built with React, TypeScript, and Tailwind CSS. This package includes everything needed to deploy a professional compliance blog on Vercel with Neon PostgreSQL database.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- A Neon PostgreSQL database
- A Vercel account

### 1. Clone and Install

```bash
# Copy this standalone-blog directory to your project
cd standalone-blog

# Install dependencies
npm install
```

### 2. Database Setup

1. **Create a Neon Database**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Run the Database Schema**
   - Connect to your Neon database using any PostgreSQL client
   - Run the contents of `database/schema.sql` to create the tables

3. **Set Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Add your Neon database URL
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   # Optional: Set your blog domain
   NEXT_PUBLIC_BLOG_URL=https://your-blog-domain.com
   ```

### 3. Local Development

```bash
# Start the development server
npm run dev

# Open http://localhost:5173
```

### 4. Deploy to Vercel

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel
   ```

2. **Set Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add `DATABASE_URL` with your Neon connection string
   - Add `NEXT_PUBLIC_BLOG_URL` with your domain (optional)

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 📁 Project Structure

```
standalone-blog/
├── api/
│   └── articles.ts          # Vercel serverless function for articles
├── database/
│   ├── schema.sql           # Database schema
│   └── README.md            # Database setup guide
├── src/
│   ├── components/
│   │   ├── ui.tsx           # Consolidated UI components
│   │   ├── Navigation.tsx   # Blog navigation header
│   │   └── Footer.tsx       # Blog footer
│   ├── pages/
│   │   ├── BlogListing.tsx  # Blog listing page
│   │   ├── ArticleDetail.tsx # Individual article page
│   │   └── NotFound.tsx     # 404 page
│   ├── types/
│   │   └── article.ts       # TypeScript interfaces
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind CSS styles
├── package.json             # Dependencies and scripts
├── vercel.json              # Vercel deployment config
├── tailwind.config.js       # Tailwind configuration
├── vite.config.ts           # Vite build configuration
└── README.md                # This file
```

## 🎨 Features

### Blog Listing Page
- **Search & Filter**: Full-text search with category filtering
- **Sorting**: Sort by newest, oldest, trending, relevance, or reading time
- **Pagination**: Efficient pagination with page numbers
- **Responsive Design**: Mobile-first design with accordion navigation
- **SEO Optimized**: Complete meta tags and structured data

### Article Detail Page
- **Rich Content**: Support for paragraphs, headings, lists, callouts, CTAs, quotes, tables, and step-by-step guides
- **Related Articles**: Automatic related article suggestions
- **Reading Progress**: Visual reading progress indicator
- **Social Sharing**: Open Graph and Twitter Card meta tags
- **Author Information**: Company bio and expertise display

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Helmet**: Dynamic meta tag management
- **React Markdown**: Markdown content rendering
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized bundle splitting and lazy loading

## 📝 Content Management

### Adding Articles

Articles are stored in the PostgreSQL database with the following structure:

```sql
INSERT INTO articles (
  slug, 
  title, 
  author, 
  category, 
  excerpt, 
  content, 
  read_time, 
  tags,
  image
) VALUES (
  'your-article-slug',
  'Your Article Title',
  'Author Name',
  'Category',
  'Article excerpt...',
  '{"type": "paragraph", "content": "Article content..."}',
  '5 min read',
  ARRAY['tag1', 'tag2'],
  'path/to/image.jpg'
);
```

### Content Types Supported

The blog supports various content types in the `content` JSON field:

- **Paragraphs**: Regular text content
- **Headings**: H1-H4 headings with proper hierarchy
- **Lists**: Bulleted lists with items
- **Callouts**: Info, warning, success, and error callouts
- **CTAs**: Call-to-action blocks with buttons
- **Quotes**: Blockquotes with optional attribution
- **Tables**: Data tables with headers and rows
- **Steps**: Step-by-step guides with difficulty and duration
- **Tool Recommendations**: Tool comparison blocks

### Example Content Structure

```json
[
  {
    "type": "heading",
    "content": "Introduction",
    "level": 2
  },
  {
    "type": "paragraph",
    "content": "This is a paragraph of text..."
  },
  {
    "type": "callout",
    "content": "Important information",
    "variant": "info"
  },
  {
    "type": "cta",
    "ctaType": "contact",
    "content": "Get expert help with your compliance needs"
  }
]
```

## 🔧 Customization

### Styling
- Modify `src/index.css` for global styles
- Update `tailwind.config.js` for theme customization
- Component styles are inlined using Tailwind classes

### Navigation
- Edit `src/components/Navigation.tsx` to modify the header
- Update logo images (currently using base64 encoded SVGs)
- Modify menu items and links

### Footer
- Edit `src/components/Footer.tsx` to customize footer content
- Update company information and links
- Modify certification lists

### SEO
- Update meta tags in `src/pages/BlogListing.tsx` and `src/pages/ArticleDetail.tsx`
- Modify structured data in the Helmet components
- Update social media meta tags

## 🚀 Deployment Options

### Vercel (Recommended)
- Automatic deployments from Git
- Serverless functions for API routes
- Global CDN
- Built-in analytics

### Other Platforms
- **Netlify**: Use `netlify.toml` configuration
- **Railway**: Deploy with `railway.json`
- **DigitalOcean App Platform**: Use `app.yaml`

## 🔍 SEO Features

- **Meta Tags**: Complete Open Graph and Twitter Card support
- **Structured Data**: JSON-LD schema markup
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine directives
- **Canonical URLs**: Proper canonical link tags
- **Breadcrumbs**: Navigation breadcrumbs for articles

## 📊 Analytics Integration

The blog is ready for analytics integration:

- **Google Analytics**: Add GA4 tracking code
- **Vercel Analytics**: Built-in Vercel analytics
- **Custom Analytics**: Add tracking pixels or scripts

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Features

1. **New Content Types**: Add to `ArticleContent` interface and `renderContent` function
2. **New Pages**: Add routes to `App.tsx` and create page components
3. **New Components**: Add to `src/components/` directory
4. **API Endpoints**: Add new serverless functions to `api/` directory

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Check Neon project is active
   - Ensure SSL mode is set to `require`

2. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript errors with `npm run lint`
   - Verify all imports are correct

3. **Deployment Issues**
   - Check environment variables in Vercel dashboard
   - Verify `vercel.json` configuration
   - Check build logs in Vercel dashboard

### Getting Help

- Check the [database README](database/README.md) for database-specific issues
- Review Vercel documentation for deployment issues
- Check Neon documentation for database issues

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@custodiallc.com
- Website: https://custodiallc.com
- Documentation: Check the database README and this file

---

**Built with ❤️ by Custodia, LLC**
