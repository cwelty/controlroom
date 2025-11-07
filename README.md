# TaskFeed 🌊

A synthwave-themed task management system with a private admin control room and public activity feed, built with Next.js App Router and deployed on Vercel with Postgres.

## 🚀 Features

### 🔐 Admin Control Room (`/admin`)
- **Secure Access**: Protected by middleware checking `TASKFEED_ADMIN_SECRET`
- **Quick Task Creation**: Focused input with real-time creation
- **Template System**: Hot-key template buttons with CRUD operations and reordering
- **Visibility Toggle**: Inline toggle for public/private task visibility
- **Recent Tasks**: Shows last 20 tasks with management controls
- **Undo Functionality**: Snackbar notifications with undo capability
- **No Caching**: Real-time updates without cache interference

### 📊 Public Activity Feed (`/log`)
- **Read-Only Timeline**: Strict reverse-chronological task display
- **Grouping**: Collapsible Week/Month headers with smooth animations
- **Pagination**: Month-by-month navigation with ISR caching
- **Timezone Display**: UTC storage, America/Los_Angeles rendering
- **Public Only**: Only shows tasks with `is_public: true`
- **Performance**: ISR cached with 1-hour revalidation

### 🎨 Synthwave Theme
- **Colors**: Deep dark backgrounds (#0A0E14, #111826) with neon cyan (#00FFF7), blue (#00B7FF), purple (#8A2BE2), and magenta (#FF00E5)
- **Typography**: Orbitron/Exo for headings, Inter for body text
- **Effects**: Subtle neon glows on hover/focus, chevron glow animations
- **Responsive**: Mobile-first design with smooth transitions

### 🗄️ Database Schema
- **Tasks**: `id`, `title`, `created_at` (UTC), `tags[]`, `template_id`, `source`, `is_public`
- **Templates**: `id`, `name`, `title_template`, `tags[]`, `hotkey`, `sort_order`
- **Optimized**: Indexes for performance on common queries

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (local or cloud)

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository>
   cd taskfeed
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Configure environment variables** in `.env.local`:
   ```env
   # Vercel Postgres (get from Vercel dashboard after creating project)
   POSTGRES_URL="postgres://..."
   POSTGRES_PRISMA_URL="postgres://..."
   POSTGRES_URL_NO_SSL="postgres://..."
   POSTGRES_URL_NON_POOLING="postgres://..."
   POSTGRES_USER="..."
   POSTGRES_HOST="..."
   POSTGRES_PASSWORD="..."
   POSTGRES_DATABASE="..."

   # Admin secret (choose a secure value)
   TASKFEED_ADMIN_SECRET="your-secure-secret-here"
   ```

4. **Initialize database**:
   ```bash
   # Connect to your PostgreSQL database and run:
   psql $POSTGRES_URL -f src/lib/db/schema.sql
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Home: http://localhost:3000
   - Public Feed: http://localhost:3000/log  
   - Admin: http://localhost:3000/admin (requires admin secret)

## 🚀 Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/taskfeed)

### Manual Deployment

1. **Create Vercel project**:
   ```bash
   npx vercel
   ```

2. **Add Postgres database**:
   - Go to Vercel Dashboard → Project → Storage
   - Create a new Postgres database
   - Environment variables are automatically added

3. **Set admin secret**:
   ```bash
   vercel env add TASKFEED_ADMIN_SECRET
   ```

4. **Initialize database schema**:
   ```bash
   # Connect to your Vercel Postgres and run schema.sql
   # Or use Vercel's built-in SQL editor in the dashboard
   ```

5. **Deploy**:
   ```bash
   vercel --prod
   ```

### Environment Variables Setup

In Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `POSTGRES_URL` | Auto-generated | Main database connection |
| `POSTGRES_PRISMA_URL` | Auto-generated | Prisma-compatible URL |
| `POSTGRES_URL_NO_SSL` | Auto-generated | Non-SSL connection |
| `POSTGRES_URL_NON_POOLING` | Auto-generated | Direct connection |
| `POSTGRES_USER` | Auto-generated | Database user |
| `POSTGRES_HOST` | Auto-generated | Database host |
| `POSTGRES_PASSWORD` | Auto-generated | Database password |
| `POSTGRES_DATABASE` | Auto-generated | Database name |
| `TASKFEED_ADMIN_SECRET` | Your choice | Admin authentication secret |

## 📝 API Endpoints

### Tasks
- `GET /api/tasks` - Get recent tasks (with optional `limit` and `public_only` params)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/[id]` - Update task visibility
- `DELETE /api/tasks/[id]` - Delete task
- `GET /api/tasks/month/[year]/[month]` - Get tasks by month (public only, ISR cached)

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create new template
- `PATCH /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template
- `POST /api/templates/reorder` - Reorder templates

## 🔧 Configuration

### Caching Strategy
- **Admin routes**: No caching (`Cache-Control: no-cache`)
- **Public log**: ISR with 1-hour revalidation
- **API endpoints**: Custom cache headers per endpoint

### Security Features
- Admin route protection via middleware
- Input validation and sanitization
- Security headers (X-Frame-Options, etc.)
- Environment variable validation

### Performance Optimizations
- Database indexes on common queries
- ISR for public pages
- Font optimization with variable fonts
- Responsive images and icons

## 🎮 Usage

### Admin Workflow
1. Navigate to `/admin` and authenticate
2. Use quick-add input for fast task creation
3. Apply templates with hotkeys (q, b, f, m, n)
4. Toggle visibility with inline switches
5. Manage recent tasks with edit/delete actions
6. Use undo functionality for accidental deletions

### Public Viewing
1. Visit `/log` for the activity feed
2. Navigate between months with arrow buttons
3. Toggle between Week/Month grouping
4. Expand/collapse sections with chevron clicks
5. View task details with tags and timestamps

## 🛡️ Security

- Admin routes protected by secret-based middleware
- Input validation on all API endpoints
- SQL injection protection via parameterized queries
- XSS prevention through proper data handling
- Security headers via Next.js configuration

## 📱 Browser Support

- Modern browsers with ES2020+ support
- CSS Grid and Flexbox support required
- JavaScript enabled for interactive features
- Responsive design for mobile/tablet

## 🚨 Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Verify all POSTGRES_* environment variables are set
   - Check database schema is initialized
   - Ensure database is accessible from your deployment

2. **Admin access denied**:
   - Verify TASKFEED_ADMIN_SECRET is set correctly
   - Clear browser cookies and try again
   - Check middleware configuration

3. **Build failures**:
   - Run `npm run lint` to check for code issues
   - Verify all dependencies are installed
   - Check TypeScript compilation with `npm run build`

### Performance Issues
- Check database indexes are created
- Monitor Vercel function duration limits
- Verify ISR is working for public pages

## 🔄 Updates & Maintenance

### Database Migrations
When updating schema:
1. Update `src/lib/db/schema.sql`
2. Run migration scripts on production database
3. Update TypeScript interfaces in `src/lib/db/index.ts`

### Template Management
- Default templates created on first schema run
- Customize via admin interface after deployment
- Hotkeys should be unique single characters

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Tron Legacy / Synthwave aesthetic inspiration
- Next.js and Vercel teams for excellent developer experience
- Lucide React for consistent iconography
