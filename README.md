<div align="center">

# 🚀 Marketing CRM

### Modern, AI-Powered Customer Relationship Management Platform

*Built with Next.js 15, React 19, and Dynamic Custom Field Architecture*

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation) • [API](#-api-routes)

</div>

---

## 📖 About

**Marketing CRM** is a fully customizable, modern CRM platform designed for businesses to manage customer relationships with unlimited flexibility. Built on cutting-edge technologies, it offers dynamic custom fields, drag-and-drop form configuration, and real-time filtering capabilities.

### 🎯 Key Highlights

- ✨ **Unlimited Custom Fields** - Create any field type for Leads & Investors
- 🎨 **Visual Form Builder** - Drag & drop form layout configurator
- 🔍 **Advanced Filtering** - Real-time search and multi-criteria filtering
- 📊 **Activity Tracking** - Complete timeline of customer interactions
- 🎭 **Modern UI/UX** - Beautiful gradients, animations, and responsive design
- 🔐 **Secure Authentication** - NextAuth v5 with JWT sessions
- 🐳 **Docker Ready** - One-command MySQL setup
- 📱 **Mobile Responsive** - Works seamlessly on all devices

---

## 🌟 Features

### 🎯 Dynamic Custom Fields System

<table>
<tr>
<td width="50%">

**10+ Field Types**
- Text & Textarea
- Email & Phone
- URL & Number
- Date picker
- Select & Multi-select
- Dropdown multi-select

</td>
<td width="50%">

**Full Customization**
- Required/Optional fields
- Custom validation rules
- Help text & placeholders
- Default values
- Section-based organization

</td>
</tr>
</table>

### 📋 Lead Management

- **Smart List View** - Advanced filtering (source, status, priority)
- **Rich Detail Pages** - Modern hero headers with gradient backgrounds
- **Custom Fields Integration** - Section-based dynamic field rendering
- **Activity Timeline** - Track all interactions in one place
- **Quick Actions** - Edit, delete, and manage leads efficiently

### 💼 Investor Management

- **Investor Profiles** - Complete contact and investment information
- **Budget Tracking** - Monitor investment amounts and timelines
- **Status Management** - Track investor journey stages
- **Relationship Mapping** - Link investors to leads

### ⚙️ Form Layout Configurator

- **Drag & Drop Sections** - Reorder form sections visually
- **Section Customization** - Icons, gradients, visibility control
- **Field Assignment** - Assign fields to specific sections
- **Live Preview** - See changes in real-time

### 🎨 Beautiful UI Components

- **shadcn/ui (New York Style)** - Premium component library
- **Gradient Design System** - Blue, purple, emerald color schemes
- **Smooth Animations** - Framer Motion powered transitions
- **Dark Mode Ready** - Complete theme support

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20+
- **Docker** & Docker Compose
- **npm** or **yarn**

### 🚀 Installation (5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/alimehmetoglu-sipsy/marketingcrm.git
cd marketingcrm

# 2. Install dependencies
npm install

# 3. Start MySQL with Docker
docker-compose up -d

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 5. Initialize database
npx prisma generate
npx prisma db push

# 6. Seed initial data (optional)
npm run seed:all

# 7. Start development server
npm run dev
```

### 🎉 Access the Application

- **Web Application:** http://localhost:3000
- **Login Credentials:**
  - Email: `admin@example.com`
  - Password: `password`

---

## 🛠 Tech Stack

### Frontend Framework
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

### Styling
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000)
![Radix UI](https://img.shields.io/badge/Radix_UI-latest-161618?logo=radix-ui)

### Backend & Database
![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748?logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![NextAuth](https://img.shields.io/badge/NextAuth-5.0.0--beta.29-7C3AED)

### Additional Libraries
![Zod](https://img.shields.io/badge/Zod-4.1.11-3B82F6)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.63.0-EC5990?logo=reacthookform)
![dnd-kit](https://img.shields.io/badge/dnd--kit-latest-10B981)
![Recharts](https://img.shields.io/badge/Recharts-3.2.1-8B5CF6)
![Lucide Icons](https://img.shields.io/badge/Lucide-0.544.0-F97316)

---

## 📊 Database Schema

### Core Tables

```mermaid
erDiagram
    users ||--o{ leads : creates
    users ||--o{ investors : manages
    leads ||--o{ lead_field_values : has
    investors ||--o{ investor_field_values : has
    lead_fields ||--o{ lead_field_values : defines
    investor_fields ||--o{ investor_field_values : defines
    lead_fields ||--o{ lead_field_options : has
    investor_fields ||--o{ investor_field_options : has
```

### Dynamic Field System

| Table | Description |
|-------|-------------|
| `lead_fields` | Field definitions for leads |
| `lead_field_options` | Select/multiselect options |
| `lead_field_values` | Actual field values per lead |
| `lead_form_sections` | Form section configuration |
| `investor_fields` | Field definitions for investors |
| `investor_field_options` | Select/multiselect options |
| `investor_field_values` | Actual field values per investor |
| `investor_form_sections` | Form section configuration |

<details>
<summary>📋 View Complete Schema Details</summary>

### Field Types Supported

- `text` - Single line text
- `textarea` - Multi-line text
- `email` - Email with validation
- `phone` - International phone number
- `url` - URL with validation
- `number` - Numeric input
- `date` - Date picker
- `select` - Dropdown selection
- `multiselect` - Checkbox multi-select
- `multiselect_dropdown` - Dropdown multi-select

### Environment Variables

```env
DATABASE_URL="mysql://crm_user:secret@localhost:3308/crm_single"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

</details>

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/callback/credentials` - User login
- `GET /api/auth/session` - Get current session

### Leads API
- `GET /api/leads` - List all leads (with filtering)
- `POST /api/leads` - Create new lead
- `GET /api/leads/[id]` - Get lead details
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

### Investors API
- `GET /api/investors` - List all investors
- `POST /api/investors` - Create new investor
- `GET /api/investors/[id]` - Get investor details
- `PUT /api/investors/[id]` - Update investor
- `DELETE /api/investors/[id]` - Delete investor

### Settings API
- `GET /api/settings/lead-fields` - List lead fields
- `POST /api/settings/lead-fields` - Create lead field
- `PUT /api/settings/lead-fields/[id]` - Update lead field
- `DELETE /api/settings/lead-fields/[id]` - Delete lead field
- `POST /api/settings/lead-fields/reorder` - Reorder fields
- `GET /api/settings/lead-form-sections` - Get form sections
- `POST /api/settings/lead-form-sections` - Update sections

<details>
<summary>📄 View Complete API Documentation</summary>

For complete API documentation, type definitions, and examples, see [CLAUDE.md](./CLAUDE.md).

</details>

---

## 📁 Project Structure

```
marketingcrm/
├── app/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── leads/                # Lead management
│   │   ├── investors/            # Investor management
│   │   ├── activities/           # Activity tracking
│   │   ├── tasks/                # Task management
│   │   ├── reports/              # Reporting
│   │   └── settings/             # Settings & configuration
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── leads/                # Lead CRUD
│   │   ├── investors/            # Investor CRUD
│   │   └── settings/             # Settings API
│   ├── login/                    # Login page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard components
│   ├── leads/                    # Lead components
│   ├── investors/                # Investor components
│   ├── settings/                 # Settings components
│   └── fields/                   # Dynamic field components
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── auth-config.ts            # NextAuth configuration
│   └── utils.ts                  # Utility functions
├── prisma/
│   └── schema.prisma             # Database schema
├── scripts/                      # Seed scripts
├── docker-compose.yml            # Docker configuration
└── README.md
```

---

## 🎨 UI Components

### Core Components (shadcn/ui New York Style)

| Component | Usage |
|-----------|-------|
| **Button** | Multiple variants (default, outline, ghost, destructive) |
| **Input** | Text input with validation states |
| **Select** | Dropdown selection with search |
| **Dialog** | Modal dialogs and drawers |
| **Table** | Data tables with sorting & filtering |
| **Form** | React Hook Form integration |
| **Tabs** | Tabbed navigation |
| **Card** | Content containers with header/footer |
| **Badge** | Status indicators |
| **Avatar** | User avatars with fallback |
| **Tooltip** | Contextual tooltips |
| **Sheet** | Slide-over panels |

### Custom Components

- **DynamicField** - Renders any field type dynamically
- **FormViewConfigurator** - Drag & drop form builder
- **FieldFormDialog** - Create/edit custom fields
- **LeadDetailView** - Modern lead detail page
- **InvestorDetailView** - Modern investor detail page

---

## 🐳 Docker Setup

### MySQL Container

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: crm_mysql
    ports:
      - "3308:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: crm_single
      MYSQL_USER: crm_user
      MYSQL_PASSWORD: secret
```

### Commands

```bash
# Start MySQL
docker-compose up -d

# Stop MySQL
docker-compose down

# View logs
docker-compose logs -f

# Access MySQL CLI
docker exec -it crm_mysql mysql -u crm_user -psecret crm_single
```

---

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Complete technical documentation (Turkish)
- **[Next.js Docs](https://nextjs.org/docs)** - Next.js framework
- **[Prisma Docs](https://www.prisma.io/docs)** - Database ORM
- **[shadcn/ui Docs](https://ui.shadcn.com)** - UI components
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)** - Styling
- **[NextAuth Docs](https://next-auth.js.org)** - Authentication

---

## 🚀 Development

### Available Scripts

```bash
npm run dev          # Start development server (with Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed:all     # Seed all initial data
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow TypeScript strict mode
   - Use existing component patterns
   - Update tests if applicable

3. **Test Locally**
   ```bash
   npm run dev
   # Test your changes at http://localhost:3000
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

---

## 🔒 Security

- **Authentication:** NextAuth v5 with JWT sessions
- **Password Hashing:** bcryptjs
- **SQL Injection Prevention:** Prisma ORM
- **XSS Protection:** React automatic escaping
- **CSRF Protection:** NextAuth built-in
- **Environment Variables:** Sensitive data in .env

### Security Best Practices

✅ Change default credentials in production
✅ Use strong NEXTAUTH_SECRET
✅ Enable HTTPS in production
✅ Regular dependency updates
✅ Database backups

---

## 🐛 Troubleshooting

<details>
<summary><strong>Database connection fails</strong></summary>

```bash
# Check if MySQL container is running
docker ps

# Restart MySQL container
docker-compose restart mysql

# Check MySQL logs
docker-compose logs mysql
```
</details>

<details>
<summary><strong>Prisma schema sync issues</strong></summary>

```bash
# Regenerate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Reset database (⚠️ deletes all data)
npx prisma db push --force-reset
```
</details>

<details>
<summary><strong>Port 3000 already in use</strong></summary>

```bash
# Use different port
PORT=3001 npm run dev

# Or kill process on port 3000
lsof -ti:3000 | xargs kill
```
</details>

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Dynamic custom fields system
- [x] Form layout configurator
- [x] Lead & Investor management
- [x] Activity tracking
- [x] Authentication & authorization
- [x] Modern UI with gradients

### 🚧 In Progress
- [ ] Rich text editor field type
- [ ] File upload field type
- [ ] Advanced reporting & analytics

### 📋 Planned
- [ ] Field dependencies (conditional fields)
- [ ] Bulk operations (import/export)
- [ ] Email integration
- [ ] Calendar integration
- [ ] Kanban board view
- [ ] Mobile app (React Native)
- [ ] API webhooks

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'feat: add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

---

## 📄 License

This project is licensed for **private use**. For commercial licensing, please contact the repository owner.

---

## 👨‍💻 Authors

- **Ali Mehmetoğlu** - *Initial work* - [@alimehmetoglu-sipsy](https://github.com/alimehmetoglu-sipsy)

---

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/) - Amazing React framework
- [shadcn](https://github.com/shadcn) - Beautiful UI components
- [Prisma Team](https://www.prisma.io/) - Best TypeScript ORM
- [Vercel](https://vercel.com/) - Hosting platform

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ using Next.js 15 & React 19

[Report Bug](https://github.com/alimehmetoglu-sipsy/marketingcrm/issues) · [Request Feature](https://github.com/alimehmetoglu-sipsy/marketingcrm/issues)

</div>
