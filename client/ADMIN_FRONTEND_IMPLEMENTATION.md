# Admin Dashboard Frontend Implementation Guide

## Backend Configuration ✅

**Admin Email**: `fineanswer2025@gmail.com`

### How It Works
1. When a user logs in (email or Google), the backend checks if their email matches the admin email
2. If it matches, `isAdmin: true` is returned in the login response
3. The user's `isAdmin` field is automatically updated in the database
4. The `/api/auth/me` endpoint also returns `isAdmin` status

### API Response Format

**Login Response** (Email or Google):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "fineanswer2025@gmail.com",
    "authProvider": "email" or "google",
    "isAdmin": true,
    ...
  },
  "isAdmin": true
}
```

**Get Current User** (`GET /api/auth/me`):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "fineanswer2025@gmail.com",
    "isAdmin": true,
    ...
  },
  "isAdmin": true
}
```

## Frontend Implementation Steps

### Step 1: Update Auth Context/State Management

Store `isAdmin` in your auth state:

```javascript
// contexts/AuthContext.js or hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      const { data, isAdmin: adminStatus } = await response.json();
      setUser(data);
      setIsAdmin(adminStatus || data?.isAdmin || false);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const { token, data, isAdmin: adminStatus } = await response.json();
      localStorage.setItem('token', token);
      setUser(data);
      setIsAdmin(adminStatus || data?.isAdmin || false);
      
      return { token, data, isAdmin: adminStatus || data?.isAdmin || false };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const { token, data, isAdmin: adminStatus } = await response.json();
      localStorage.setItem('token', token);
      setUser(data);
      setIsAdmin(adminStatus || data?.isAdmin || false);
      
      return { token, data, isAdmin: adminStatus || data?.isAdmin || false };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      login, 
      googleLogin, 
      logout, 
      fetchUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Step 2: Update Login Component with Redirect Logic

```javascript
// pages/Login.jsx or components/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { isAdmin } = await login(email, password);
      
      // Redirect based on admin status
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (googleData) => {
    setError('');
    setLoading(true);
    
    try {
      const { isAdmin } = await googleLogin(googleData);
      
      // Redirect based on admin status
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {/* Google Login Button */}
      <button onClick={handleGoogleLogin} disabled={loading}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
```

### Step 3: Create Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect non-admin users to regular dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

### Step 4: Set Up Routes

```javascript
// App.jsx or routes configuration
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

const AppRoutes = () => {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          !user ? (
            <Login />
          ) : (
            <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
          )
        } 
      />
      
      {/* User Dashboard - Protected */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <UserDashboard />
            )}
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Dashboard - Protected, Admin Only */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### Step 5: Create Admin Dashboard Component

```javascript
// pages/AdminDashboard.jsx
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminStats from '../components/admin/AdminStats';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name} (Admin)</p>
        </header>
        
        <div className="admin-main">
          <AdminStats />
          <UserManagement />
          {/* Add more admin components here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

### Step 6: Create User Dashboard Component

```javascript
// pages/UserDashboard.jsx
import { useAuth } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="user-dashboard">
      <header>
        <h1>Welcome, {user?.name}</h1>
      </header>
      
      <div className="dashboard-content">
        {/* User-specific content */}
        <p>This is your personal dashboard</p>
      </div>
    </div>
  );
};

export default UserDashboard;
```

### Step 7: Update Navigation Component

```javascript
// components/Navigation.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="navigation">
      <Link to="/dashboard">Dashboard</Link>
      
      {/* Show admin links only if user is admin */}
      {isAdmin && (
        <>
          <Link to="/admin/dashboard">Admin Panel</Link>
          <Link to="/admin/users">Manage Users</Link>
          <Link to="/admin/settings">Admin Settings</Link>
        </>
      )}
      
      <div className="user-info">
        <span>{user?.name}</span>
        {isAdmin && <span className="admin-badge">Admin</span>}
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navigation;
```

## Testing Checklist

### ✅ Test Admin Login
1. Login with `fineanswer2025@gmail.com`
2. Check if `isAdmin: true` is in the response
3. Verify redirect to `/admin/dashboard`
4. Check if admin navigation links appear

### ✅ Test Regular User Login
1. Login with a non-admin email
2. Check if `isAdmin: false` is in the response
3. Verify redirect to `/dashboard`
4. Check if admin links are NOT visible

### ✅ Test Protected Routes
1. Try accessing `/admin/dashboard` as regular user → Should redirect to `/dashboard`
2. Try accessing `/admin/dashboard` as admin → Should show admin dashboard
3. Try accessing without login → Should redirect to `/login`

### ✅ Test Google Login
1. Login with Google using admin email
2. Verify `isAdmin: true` is set
3. Verify redirect to admin dashboard

## Important Notes

1. **Admin Email**: The backend automatically detects admin based on email `fineanswer2025@gmail.com`
2. **Auto-Update**: If an existing user's email is changed to admin email, their `isAdmin` status will be updated on next login
3. **Token Storage**: Store JWT token in localStorage/sessionStorage
4. **Token Refresh**: Call `/api/auth/me` on app load to verify user and admin status
5. **Security**: Always check `isAdmin` on the backend for sensitive operations

## API Endpoints Reference

- `POST /api/auth/login` - Email login (returns `isAdmin`)
- `POST /api/auth/google` - Google login (returns `isAdmin`)
- `GET /api/auth/me` - Get current user (returns `isAdmin`)

## Example Response Structure

All login endpoints return:
```json
{
  "success": true,
  "token": "jwt_token",
  "data": { ...userData },
  "isAdmin": true/false
}
```

The `isAdmin` field is available in:
- Login response (`isAdmin` at root level)
- User data object (`data.isAdmin`)
- `/api/auth/me` response

Use either `isAdmin` from root or `data.isAdmin` - both are the same value.
