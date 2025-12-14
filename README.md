# MotorTrace 🏍️

> A comprehensive motor vehicle tracking and service management system with QR code technology, role-based access control, and activity logging.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)

## 🌟 Features

### Core Features
- ✅ **Motor CRUD Operations** - Complete motor management with admin controls
- ✅ **QR Code Technology** - Automatic QR code generation and scanning
- ✅ **Service History Tracking** - Comprehensive service record management
- ✅ **Advanced Search & Filtering** - Multi-field search and filter capabilities
- ✅ **Role-Based Access Control** - Three-tier permission system (Admin, User, Technician)
- ✅ **Activity Logging** - Complete audit trail of all system actions
- ✅ **Service Type Management** - Customizable service categories
- ✅ **User Management** - Full user administration panel
- ✅ **Bulk Import** - CSV-based mass motor entry
- ✅ **Modern UI/UX** - Responsive design with glassmorphism effects

### Advanced Features
- 🔐 JWT-based authentication
- 📊 Dashboard with real-time statistics
- 🎨 Premium glassmorphism design
- 📱 Fully responsive mobile interface
- 🔍 Real-time search and filtering
- 📄 Service report generation
- 📎 Service attachment management
- 🎯 Permission-based UI components

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js v14+ / Express.js
- **Database:** MySQL 8.0+
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcrypt
- **QR Generation:** qrcode library
- **Environment:** dotenv

### Frontend
- **Framework:** Vanilla JavaScript (SPA)
- **Styling:** Tailwind CSS
- **QR Scanner:** HTML5 QR Code Scanner
- **Design:** Glassmorphism with gradient effects
- **Icons:** Font Awesome

## 📋 Prerequisites

- Node.js v14 or higher
- npm v6 or higher
- MySQL 8.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/umutakoglu/MotorTrace.git
cd MotorTrace
```

### 2. Database Setup

Create the database and run migrations:

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE motortrace;
USE motortrace;

# Run schema script
source backend/database/schema.sql

# Run migrations
cd backend
node database/create-advanced-tables.js
node database/add-technician-role.js
node database/create-activity-logs-table.js
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev

# Or start production server
npm start
```

Backend will run on: `http://localhost:5001`

### 4. Frontend Setup

```bash
# Install http-server globally (if not installed)
npm install -g http-server

# Start frontend server
cd frontend/public
http-server -p 3000 -c-1 --cors
```

Frontend will run on: `http://localhost:3000`

## 🔑 Default Credentials

**Admin Account:**
- Email: `admin@motortrace.com`
- Password: `admin123`

**Test User Account:**
- Email: `hakan@hakan.com`
- Password: `123456`

## 📖 User Roles & Permissions

### Admin
Full system access including:
- All motor operations (create, read, update, delete)
- All service operations (create, read, update, delete)
- User management
- Service type management
- Activity logs viewing
- Bulk import
- System configuration

### User
Limited to motor operations:
- View all motors and services
- Create and edit motors
- Cannot manage services
- No admin panel access

### Technician
Limited to service operations:
- View all motors and services
- Create and edit services
- Cannot manage motors
- No admin panel access

## 🌐 API Documentation

### Authentication Endpoints

```
POST /api/auth/register - Register new user
POST /api/auth/login - User login
```

### Motor Endpoints

```
GET    /api/motors - List all motors (paginated)
GET    /api/motors/:id - Get motor details
POST   /api/motors - Create new motor (Admin/User)
PUT    /api/motors/:id - Update motor (Admin/User)
DELETE /api/motors/:id - Delete motor (Admin only)
GET    /api/motors/scan/:motorId - Scan QR code
POST   /api/motors/generate-all-qr - Generate QR codes (Admin)
```

### Service Endpoints

```
GET    /api/services/motor/:motorId - Get motor service history
POST   /api/services/motor/:motorId - Add service record (Admin/Technician)
PUT    /api/services/:id - Update service (Admin/Technician)
DELETE /api/services/:id - Delete service (Admin only)
GET    /api/services/:id/report - Generate service report
POST   /api/services/:id/attachments - Upload attachment (Admin/Technician)
DELETE /api/services/attachments/:id - Delete attachment (Admin/Technician)
```

### Admin Endpoints

```
GET    /api/users - List all users (Admin only)
POST   /api/users - Create user (Admin only)
PUT    /api/users/:id/role - Update user role (Admin only)
DELETE /api/users/:id - Delete user (Admin only)
GET    /api/service-types - List service types
POST   /api/service-types - Create service type (Admin only)
GET    /api/activity/logs - View activity logs (Admin only)
GET    /api/activity/stats - Activity statistics (Admin only)
```

## 📁 Project Structure

```
MotorTrace/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── motorController.js   # Motor operations
│   │   ├── serviceController.js # Service operations
│   │   ├── userController.js    # User management
│   │   ├── activityLogController.js
│   │   ├── serviceTypeController.js
│   │   └── roleController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── adminMiddleware.js   # Admin check
│   │   ├── roleMiddleware.js    # Role-based access
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── motor.routes.js
│   │   ├── service.routes.js
│   │   ├── user.routes.js
│   │   ├── activityLog.routes.js
│   │   └── serviceType.routes.js
│   ├── database/
│   │   ├── schema.sql            # Database schema
│   │   └── *.js                  # Migration scripts
│   ├── uploads/
│   │   ├── qr-codes/             # Generated QR codes
│   │   └── services/             # Service attachments
│   ├── server.js                 # Main server file
│   ├── .env                      # Environment variables
│   └── package.json
├── frontend/
│   └── public/
│       ├── js/
│       │   ├── components/
│       │   │   ├── auth.js
│       │   │   ├── dashboard.js
│       │   │   ├── motorList.js
│       │   │   ├── motorDetail.js
│       │   │   ├── motorForm.js
│       │   │   ├── serviceHistory.js
│       │   │   ├── userManagement.js
│       │   │   ├── serviceTypeManagement.js
│       │   │   ├── activityLogs.js
│       │   │   └── addServiceModal.js
│       │   ├── utils/
│       │   │   ├── api.js
│       │   │   ├── storage.js
│       │   │   ├── permissions.js
│       │   │   ├── toast.js
│       │   │   └── loading.js
│       │   ├── config/
│       │   │   └── version.js
│       │   └── app.js              # Main application
│       └── index.html              # Entry point
└── README.md
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt encryption for passwords
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Input sanitization
- **CORS Configuration** - Cross-origin resource sharing setup
- **Role-Based Authorization** - Granular permission system
- **Activity Logging** - Complete audit trail

## 🎨 Design Features

- **Glassmorphism Effects** - Modern frosted glass aesthetic
- **Gradient Colors** - Vibrant purple-blue gradients
- **Smooth Animations** - CSS transitions and transforms
- **Dark Theme** - Eye-friendly dark color scheme
- **Responsive Design** - Mobile-first approach
- **Premium UI/UX** - Professional interface design

## 📱 Mobile Compatibility

The web interface features a fully responsive design that works seamlessly on all mobile devices. PWA support planned for future releases.

## 🧪 Testing

### Test User Scenarios

1. **Admin Testing**
   - Login with admin credentials
   - Test all CRUD operations
   - Verify access to all panels
   - Check activity logs

2. **User Testing**
   - Create user with 'user' role
   - Verify motor operations work
   - Confirm service operations are blocked
   - Test UI button visibility

3. **Technician Testing**
   - Create user with 'technician' role
   - Verify service operations work
   - Confirm motor operations are blocked
   - Test permission-based UI

## 🚧 Roadmap

Planned features for upcoming releases:

- [ ] Advanced analytics dashboard
- [ ] Export functionality (PDF, Excel)
- [ ] Email notifications
- [ ] Multi-language support
- [ ] PWA support
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Advanced reporting module
- [ ] Customizable workflows

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Contact

For questions and support, please open an issue on GitHub.

## 🙏 Acknowledgments

- Font Awesome for icons
- Tailwind CSS for styling framework
- QRCode.js for QR generation
- HTML5 QR Code Scanner

---

**MotorTrace** - Simplifying motor vehicle management! 🏍️✨

Made with ❤️ by [@umutakoglu](https://github.com/umutakoglu)
