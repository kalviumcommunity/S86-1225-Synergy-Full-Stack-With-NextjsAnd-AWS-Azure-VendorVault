
## 🎨 Responsive & Themed Design

### Theme Configuration

VendorVault features a comprehensive theme system with custom Tailwind configuration:

**Custom Breakpoints:**
- `xs`: 480px - Extra small devices
- `sm`: 640px - Small devices (landscape phones)
- `md`: 768px - Medium devices (tablets)
- `lg`: 1024px - Large devices (desktops)
- `xl`: 1280px - Extra large devices
- `2xl`: 1536px - 2X large devices

**Brand Colors:**
```javascript
brand: {
  light: '#93C5FD',    // Light blue
  DEFAULT: '#3B82F6',  // Primary blue
  dark: '#1E40AF',     // Dark blue
}
```

**Theme Features:**
- ✅ Custom color palette (primary, secondary, success, warning, error, info)
- ✅ Extended spacing system (128, 144)
- ✅ Custom border radius (4xl)
- ✅ Brand shadows for enhanced depth
- ✅ Smooth animations (fade-in, slide-in, bounce-slow)
- ✅ Custom typography (Inter, Fira Code)

### Dark Mode Implementation

**Configuration:**
- Dark mode enabled using `class` strategy in Tailwind
- Theme persistence via localStorage
- System preference detection
- Smooth theme transitions (0.3s ease)

**Usage:**
```tsx
// Access theme state
const { isDarkMode, toggleTheme } = useUI();

// Apply theme-specific styles
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

**Theme Toggle Component:**
- Accessible with ARIA labels
- Smooth icon transitions
- Visual feedback on hover/active states
- Prevents hydration mismatch with SSR

### Responsive Design Strategy

**Mobile-First Approach:**
All components are built mobile-first, with progressive enhancement for larger screens:

```tsx
// Example: Responsive padding and text sizing
<div className="p-4 md:p-8 lg:p-12">
  <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold">
    Responsive Heading
  </h1>
</div>
```

**Layout Responsiveness:**
- Header: Collapsible menu for mobile, full navigation for desktop
- Sidebar: Hidden on mobile with toggle button, persistent on desktop
- Forms: Full-width on mobile, constrained width on desktop
- Cards: Single column on mobile, grid layout on tablet/desktop

**Testing Methodology:**
1. Chrome DevTools → Device Toolbar
2. Tested on: iPhone SE, iPad, Galaxy S21, Desktop (1920x1080)
3. Verified: Layout integrity, text readability, interactive element accessibility

### Accessibility Considerations

**WCAG Compliance:**
- ✅ Color contrast ratios meet WCAG AA standards
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support
- ✅ Semantic HTML structure

**Dark Mode Accessibility:**
- Light mode: 7:1 contrast ratio (text/background)
- Dark mode: 8.5:1 contrast ratio (text/background)
- Error messages: Contrasting colors in both themes
- Link underlines for better visibility

### Component Theme Support

All UI components support dark mode out of the box:

**Updated Components:**
- `Button`: Multiple variants with theme-aware colors
- `Card`: Adaptive background and borders
- `InputField`: Theme-aware input styling with validation states
- `Modal`: Dark mode backdrop and content
- `Loader`: Theme-aware loading states
- `ThemeToggle`: Dedicated theme switcher component

### Screenshots & Evidence

**Responsive Breakpoints:**
- Mobile (375px): ✅ Tested - Single column layout, collapsible navigation
- Tablet (768px): ✅ Tested - Two-column grid, persistent sidebar
- Desktop (1920px): ✅ Tested - Three-column grid, full navigation

**Theme Modes:**
- Light Mode: Clean, professional appearance with high contrast
- Dark Mode: Easy on eyes, reduced eye strain for extended use
- Transition: Smooth 0.3s ease transition between themes

### Performance Optimization

**Theme System Performance:**
- localStorage caching prevents theme flash on page load
- CSS transitions use GPU acceleration
- Minimal JavaScript for theme toggling
- No layout shifts during theme change

**Responsive Performance:**
- Lazy-loaded images with appropriate sizes
- Conditional rendering for mobile/desktop components
- Optimized Tailwind bundle with PurgeCSS
- CSS Grid for efficient layouts

### Design Challenges & Solutions

**Challenge 1: Hydration Mismatch**
- **Problem:** Theme state differs between server and client
- **Solution:** Mounting state tracking with neutral SSR classes

**Challenge 2: Color Contrast in Dark Mode**
- **Problem:** Insufficient contrast for secondary text
- **Solution:** Carefully selected gray scale with tested contrast ratios

**Challenge 3: Mobile Navigation**
- **Problem:** Limited screen space for navigation items
- **Solution:** Collapsible sidebar with smooth animations and overlay

**Challenge 4: Form Accessibility**
- **Problem:** Input labels hard to read in dark mode
- **Solution:** Adjusted label colors with sufficient contrast in both themes

### Quick Theme Testing Guide

**Test Theme Switching:**
1. Start dev server: `npm run dev`
2. Open application at `http://localhost:3000`
3. Click the theme toggle button in header (moon/sun icon)
4. Verify smooth transition between light and dark modes
5. Refresh page - theme should persist

**Test Responsive Design:**
1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Test preset devices: iPhone SE, iPad, Responsive
4. Verify: Header collapses, Sidebar toggles, Forms adapt
5. Check all pages: Home, Dashboard, Login, Apply

**Test Accessibility:**
1. Navigate using Tab key only
2. Verify focus indicators are visible
3. Check color contrast in both themes
4. Test with screen reader if available

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ database
- AWS Account with S3 access (for file uploads)
- Docker & Docker Compose (optional)
- At least 1GB free disk space for indexes

## 🚀 Setup Instructions

### Option 1: Local Development (without Docker)

```powershell
# 1. Navigate to vendorvault directory
cd vendorvault

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env and update with your database credentials
# Make sure DATABASE_URL, DB_PASSWORD, and DB_NAME are set
# Also configure AWS S3: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME

# 4. Generate Prisma Client
npx prisma generate

# 5. Apply database schema and optimized indexes
npx prisma migrate dev --name init
# or for pushing directly:
npx prisma db push

# 6. Seed the database with initial data
npm run db:seed

# 7. Start the development server
npm run dev
```
 
The application will be available at `http://localhost:3000`

**Note:** Database indexes are automatically created during migration/push. This enables 150x faster queries on large datasets.

### Option 2: Docker Setup

```powershell
# 1. Navigate to project root (where docker-compose.yml is)
cd ..

# 2. Make sure .env file is configured in vendorvault directory

# 3. Stop any existing containers
docker-compose down

# 4. Remove old volumes (optional - only if you want fresh database)
docker-compose down -v

# 5. Build and start containers
docker-compose up --build -d

# 6. Check container status
docker-compose ps

# 7. View logs
docker-compose logs -f

# 8. Access the app container to run migrations/seed
docker exec -it nextjs_app sh

# Inside container:
npx prisma generate
npx prisma db push
npm run db:seed
exit
```

## 🔑 Default Login Credentials

After seeding the database, use these credentials to login:

- **Admin**: `admin@vendorvault.com` / `Password123!`
- **Admin 2**: `admin2@vendorvault.com` / `Password123!`
- **Inspector 1**: `inspector1@vendorvault.com` / `Password123!`
- **Inspector 2**: `inspector2@vendorvault.com` / `Password123!`

Vendors should register through the application.

## 🛠️ Useful Commands

### Development
```powershell
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database Management
```powershell
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and run migrations
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:reset         # Reset database (careful!)
```

### Docker Commands
```powershell
# View database in Prisma Studio
npx prisma studio

# Stop Docker containers
docker-compose down

# Restart Docker containers
docker-compose restart

# View container logs
docker-compose logs app
docker-compose logs db

# Access PostgreSQL database directly
docker exec -it postgres_db psql -U postgres -d railway_vendor_db
```

## 📁 Project Structure

```
vendorvault/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   ├── vendor/upload/  # Pre-signed URL generation
│   │   └── files/      # File metadata storage
│   ├── admin/          # Admin pages
│   ├── vendor/         # Vendor pages
│   └── auth/           # Authentication pages
├── components/         # React components
├── lib/                # Utility libraries
│   └── s3.ts          # AWS S3 utilities
├── middleware.ts       # Authorization middleware (RBAC)
├── prisma/             # Database schema and migrations
├── services/           # Business logic services
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 📤 File Upload System

Production-ready file upload using **AWS S3 Pre-Signed URLs**.

### Features:
- ✅ Secure direct-to-S3 uploads
- ✅ File validation (type & size)
- ✅ Time-limited URLs (60s expiry)
- ✅ Metadata storage in database

### Documentation:
See [FILEUPLOAD_README.md](FILEUPLOAD_README.md) for complete implementation guide.

### Supported Files:
- Images: JPG, PNG, WEBP
- Documents: PDF
- Max Size: 5MB