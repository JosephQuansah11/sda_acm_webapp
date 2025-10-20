{{ ... }}

A comprehensive church management system built with React, TypeScript, and Bootstrap featuring advanced authentication, theming, and member management capabilities.

## Features

### 🔐 Authentication System
- **Dual Login Methods**: Email or phone number authentication
- **Two-Factor Authentication (2FA)**: 6-digit verification codes via email/SMS
- **Keycloak Integration**: Enterprise SSO support
- **Role-Based Access Control**: Admin, Moderator, and User roles
- **Session Management**: Persistent login with token validation
- **Route Protection**: Automatic redirection for unauthorized access

### Advanced Theme System
- **6 Built-in Themes**: Default, Dark, Ocean, Forest, Sunset, Royal
- **Real-time Switching**: Instant theme changes without page reload
- **CSS Variables**: Dynamic theme switching using custom properties
- **Persistent Preferences**: Theme selection saved to user profile

### Navigation & Layout
- **Fixed Navigation**: Sidebar remains visible during scrolling
- **Responsive Design**: Mobile-friendly Bootstrap layouts
- **User Profile Integration**: Avatar, role badges, and quick actions
- **Expandable Content**: Unlimited scrollable content areas

### Member Management
- **Advanced Table Features**: Sorting, filtering, pagination
- **Permission-Based Actions**: Role-specific edit/delete capabilities
- **Search & Filter**: Multi-column search and dropdown filters
- **Modal Management**: Edit and delete confirmation dialogs

## Technology Stack

- **Frontend**: React 19.2.0, TypeScript 4.9.5
- **UI Framework**: Bootstrap 5.3.8, React Bootstrap 2.10.10
- **Routing**: React Router DOM 7.9.4
- **Icons**: Bootstrap Icons 1.13.1
- **Styling**: Sass 1.93.2
- **HTTP Client**: Axios 1.12.2

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sda_acm_webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

The application includes a mock authentication service with **Two-Factor Authentication (2FA)** for testing. Use these credentials:

| Role | Login | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@sda.com | password123 | Full access (view, edit, delete) |
| **Moderator** | +1234567890 | password123 | Edit members, view all |
| **User** | user@sda.com | password123 | View-only access |

### 🛡️ 2FA Verification Process

After entering your credentials, you'll be prompted to enter a 6-digit verification code:

1. **Code Generation**: System generates a random 6-digit code
2. **Code Delivery**: For demo purposes, codes are displayed via:
   - Browser notifications (if permissions granted)
   - Browser console (check Developer Tools)
3. **Code Entry**: Enter the 6-digit code in the verification screen
4. **Auto-submit**: Code automatically submits when all 6 digits are entered
5. **Expiration**: Codes expire after 4 minutes
6. **Resend**: New codes can be requested if expired or failed

## Architecture

### Context-Based State Management
```tsx
// Authentication Context
const { state, login, logout, hasRole, isAdmin } = useAuth();

// Theme Context
const { state, setTheme, toggleDarkMode } = useTheme();
```

### Higher-Order Components (HOCs)
```tsx
// Route Protection
export default withRequireAuth(MyComponent);
export default withAdminOnly(AdminComponent);

// Custom Protection
export default withAuth(MyComponent, {
    requireAuth: true,
    requiredRoles: ['admin', 'moderator'],
    redirectTo: '/unauthorized'
});
```

### Permission Hooks
```tsx
const { canAccess, isAdmin, checkPermission } = usePermissions();

// Usage
if (canAccess(['admin', 'moderator'])) {
    // Show admin/moderator features
}
```

## Project Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx          # Authentication state management
│   └── ThemeContext.tsx         # Theme state management
├── security/
│   └── withAuth.tsx             # HOC for route protection
├── api/
│   ├── authApi.ts              # Authentication API service
│   └── mockAuthService.ts      # Mock service for demo
├── pages/
│   ├── auth/LoginPage.tsx      # Login with dual authentication
│   ├── profile/UserProfile.tsx # User profile management
│   ├── settings/Settings.tsx   # Theme and app settings
│   ├── home/Home.tsx           # Dashboard with analytics
│   ├── members/Members.tsx     # Member management
│   └── error/
│       ├── ErrorPage.tsx       # General error page
│       └── UnauthorizedPage.tsx # Access denied page
├── components/
│   ├── Nav.tsx                 # Navigation with user profile
│   ├── DemoCredentials.tsx     # Demo login helper
│   └── common/                 # Reusable components
└── hooks/                      # Custom hooks
```

## Key Features Explained

### Authentication Flow
1. User selects login method (email/phone or Keycloak)
2. Credentials validated against mock service
3. JWT token stored in localStorage
4. User context updated with role information
5. Route protection enforced based on permissions

### Theme System
1. CSS custom properties define theme variables
2. Theme context manages current theme state
3. Theme changes update CSS variables dynamically
4. Preferences saved to user profile and localStorage
5. Theme persists across sessions

### Permission System
1. HOCs protect entire components/routes
2. Permission hooks provide granular access control
3. UI elements conditionally rendered based on roles
4. API calls include role validation
5. Unauthorized access redirects to appropriate pages

## Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_KEYCLOAK_URL=https://your-keycloak-server.com
```

### Backend Integration

Replace the mock service with real API endpoints:

1. Remove `import './api/mockAuthService'` from `App.tsx`
2. Update API base URL in `authApi.ts`
3. Implement corresponding backend endpoints
4. Configure Keycloak server settings

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **SDA Church** - For the inspiration and requirements
- **React Team** - For the amazing framework
- **Bootstrap Team** - For the UI components
- **TypeScript Team** - For type safety and developer experience

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the SDA ACM community**
