# Auth0 Integration Guide - Taxista EAD Platform

## Overview

Este guia explica como integrar Auth0 com a plataforma EAD Taxista ES, fornecendo Single Sign-On (SSO) entre a aplicação EAD e o Moodle.

## 🔧 Frontend Integration (React)

### 1. Install Auth0 SDK

```bash
npm install @auth0/auth0-react
```

### 2. Configure Auth0Provider

```jsx
// src/index.js or src/App.js
import { Auth0Provider } from '@auth0/auth0-react';

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
      audience="https://taxista-ead-api"
      scope="read:profile update:profile"
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student-portal" element={<ProtectedRoute component={StudentPortal} />} />
          <Route path="/admin" element={<ProtectedRoute component={AdminDashboard} roles={['admin']} />} />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  );
}
```

### 3. Create Protected Route Component

```jsx
// src/components/ProtectedRoute.js
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

const ProtectedRoute = ({ component: Component, roles = [] }) => {
  const { isAuthenticated, loginWithRedirect, user, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check roles if specified
  if (roles.length > 0) {
    const userRoles = user?.['https://taxista-ead.com/roles'] || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return <div>Access Denied</div>;
    }
  }

  return <Component />;
};
```

### 4. Update Login/Logout Components

```jsx
// src/components/LoginButton.js
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return null;
  }

  return (
    <button onClick={() => loginWithRedirect()}>
      Log In
    </button>
  );
};

// src/components/LogoutButton.js
const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </button>
  );
};
```

## 🔧 Backend Integration (FastAPI)

### 1. Install Dependencies

```bash
pip install python-jose[cryptography] requests
```

### 2. Add Auth0 Middleware

```python
# backend/auth.py
from jose import jwt
from jose.exceptions import JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
import requests
import os

security = HTTPBearer()

AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN')
API_AUDIENCE = os.getenv('AUTH0_API_AUDIENCE', 'https://taxista-ead-api')
ALGORITHMS = ["RS256"]

def get_auth0_public_key():
    """Get Auth0 public key for JWT verification"""
    url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    response = requests.get(url)
    jwks = response.json()
    return jwks

def verify_token(token: str = Depends(security)):
    """Verify Auth0 JWT token"""
    try:
        jwks = get_auth0_public_key()
        unverified_header = jwt.get_unverified_header(token.credentials)
        
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        
        if rsa_key:
            payload = jwt.decode(
                token.credentials,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
        
        raise HTTPException(status_code=401, detail="Invalid token")
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(required_role: str):
    """Decorator to require specific role"""
    def role_checker(token_payload: dict = Depends(verify_token)):
        roles = token_payload.get('https://taxista-ead.com/roles', [])
        if required_role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return token_payload
    return role_checker
```

### 3. Update API Routes

```python
# backend/server.py
from auth import verify_token, require_role

# Protected admin route
@api_router.get("/admin/stats")
async def get_admin_stats(token: dict = Depends(require_role("admin"))):
    """Get admin statistics - requires admin role"""
    # Your existing logic here
    pass

# Protected user route
@api_router.get("/user/profile")
async def get_user_profile(token: dict = Depends(verify_token)):
    """Get user profile - requires authentication"""
    user_id = token['sub']
    # Your logic here
    pass
```

## 🔧 Moodle Integration

### 1. Install OAuth2 Plugin

```bash
# SSH to server
ssh ubuntu@YOUR_SERVER_IP

# Enter Moodle container
docker exec -it taxista-moodle bash

# Download OAuth2 plugin (if not included)
# Most Moodle versions include OAuth2 by default
```

### 2. Configure OAuth2 in Moodle

1. Go to **Site administration** → **Plugins** → **Authentication** → **OAuth 2**

2. Create new OAuth2 service:
   - **Name**: Auth0
   - **Client ID**: Your Auth0 client ID
   - **Client secret**: Your Auth0 client secret
   - **Authorization endpoint**: `https://YOUR_DOMAIN.auth0.com/authorize`
   - **Token endpoint**: `https://YOUR_DOMAIN.auth0.com/oauth/token`
   - **User info endpoint**: `https://YOUR_DOMAIN.auth0.com/userinfo`

3. Configure field mappings:
   - **Username**: `email`
   - **Email**: `email`
   - **First name**: `given_name`
   - **Last name**: `family_name`

### 3. Enable OAuth2 Authentication

1. Go to **Site administration** → **Plugins** → **Authentication** → **Manage authentication**
2. Enable **OAuth 2**
3. Configure auto-creation of users if needed

## 🔧 Auth0 Configuration

### 1. Create Applications

#### EAD Application (SPA)
- **Type**: Single Page Application
- **Allowed Callback URLs**: 
  - `http://YOUR_DOMAIN/callback`
  - `http://YOUR_DOMAIN`
- **Allowed Logout URLs**: `http://YOUR_DOMAIN`
- **Allowed Web Origins**: `http://YOUR_DOMAIN`

#### Moodle Application (Regular Web App)
- **Type**: Regular Web Application
- **Allowed Callback URLs**: `http://YOUR_DOMAIN/moodle/auth/oauth2/login.php`
- **Allowed Logout URLs**: `http://YOUR_DOMAIN/moodle`

### 2. Create API

- **Name**: Taxista EAD API
- **Identifier**: `https://taxista-ead-api`
- **Signing Algorithm**: RS256

### 3. Create Roles and Permissions

#### Roles:
- `admin`: Full system access
- `student`: Student portal access
- `instructor`: Course creation access

#### Permissions:
- `read:profile`
- `update:profile`
- `read:courses`
- `create:courses`
- `read:admin`

### 4. Create Rule for Role Assignment

```javascript
// Auth0 Rule: Add roles to token
function addRolesToToken(user, context, callback) {
  const namespace = 'https://taxista-ead.com';
  const assignedRoles = (context.authorization || {}).roles;

  let idTokenClaims = context.idToken || {};
  let accessTokenClaims = context.accessToken || {};

  idTokenClaims[`${namespace}/roles`] = assignedRoles;
  accessTokenClaims[`${namespace}/roles`] = assignedRoles;

  context.idToken = idTokenClaims;
  context.accessToken = accessTokenClaims;

  callback(null, user, context);
}
```

## 🔄 User Flow

### 1. Registration Flow
1. User visits EAD platform
2. Clicks "Cadastrar" or "Login"
3. Redirected to Auth0
4. After registration, user is created in both:
   - EAD platform database
   - Moodle database (auto-provision)

### 2. SSO Flow
1. User logs into EAD platform via Auth0
2. Navigates to Moodle section
3. Automatically logged into Moodle (SSO)
4. Can access both platforms seamlessly

## 🧪 Testing

### Test Authentication
```bash
# Test Auth0 token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://YOUR_SERVER/api/user/profile

# Test Moodle SSO
# Login to EAD platform, then navigate to /moodle
```

### Debug Issues
```bash
# Check Auth0 logs
# Go to Auth0 Dashboard → Monitoring → Logs

# Check backend logs
docker logs taxista-backend

# Check Moodle logs
docker exec taxista-moodle tail -f /var/log/apache2/error.log
```

## 🔒 Security Best Practices

1. **Use HTTPS in production**
2. **Rotate secrets regularly**
3. **Implement proper CORS policies**
4. **Use secure session configurations**
5. **Enable MFA for admin accounts**
6. **Regular security audits**

## 📞 Support

For integration support:
- Auth0 Documentation: https://auth0.com/docs
- Moodle OAuth2: https://docs.moodle.org/en/OAuth_2_authentication
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/