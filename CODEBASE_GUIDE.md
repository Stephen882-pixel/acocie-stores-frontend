# Acocie Stores — Codebase Logic Guide

> **Audience:** Someone new to frontend development who wants to understand *how the JavaScript works*, not just what the UI looks like.  
> **Scope:** Everything built so far (Phase 1 — Auth).

---

## Table of Contents

1. [How a React App Starts](#1-how-a-react-app-starts)
2. [The Libraries We Use and Why](#2-the-libraries-we-use-and-why)
3. [Talking to the Backend — `axios.js`](#3-talking-to-the-backend--axiosjs)
4. [Global State — `authStore.js`](#4-global-state--authstorejs)
5. [All Auth API Calls — `auth.api.js`](#5-all-auth-api-calls--authapijs)
6. [Routing — How Pages Are Wired Up](#6-routing--how-pages-are-wired-up)
7. [Route Guards — Protecting Pages](#7-route-guards--protecting-pages)
8. [The Auth Pages — Logic Walkthrough](#8-the-auth-pages--logic-walkthrough)
9. [Reusable Components — What They Do](#9-reusable-components--what-they-do)
10. [How Data Flows End-to-End — Full Example](#10-how-data-flows-end-to-end--full-example)
11. [Folder Structure Rationale](#11-folder-structure-rationale)

---

## 1. How a React App Starts

**Entry point:** `src/main.jsx`

```jsx
import './index.css';               // loads all CSS
import router from './router/index.jsx'; // the routing config

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

**What happens here, step by step:**

1. The browser loads `index.html`, which has a single `<div id="root">`.
2. `main.jsx` runs and calls `createRoot(...)` — this hands React control of that `<div>`.
3. `RouterProvider` is rendered inside. It reads the `router` config and decides which page component to show based on the current URL.
4. That's it — the whole app runs inside that one `<div>`.

**`App.jsx`** is the persistent shell that lives at the top of every page:

```jsx
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />           {/* always visible */}
      <Outlet />           {/* ← the current page renders here */}
      <Toaster />          {/* toast notification system */}
    </div>
  );
}
```

`<Outlet />` is a React Router concept — it is a placeholder that gets replaced by whichever page component matches the current URL. So `Navbar` and `Toaster` always stay mounted; only the page content swaps.

---

## 2. The Libraries We Use and Why

| Library | What it does in plain English |
|---|---|
| **React** | The UI framework. You describe what the screen should look like for a given state, and React updates the DOM for you. |
| **React Router v7** | Maps URL paths like `/login` or `/register` to specific page components. Also provides navigation (`useNavigate`) and reading URL state (`useLocation`). |
| **Zustand** | Global state store. Lets any component anywhere in the app read or write shared data (like "who is logged in?") without passing it through every parent component. |
| **Axios** | HTTP client for making API requests to the backend (`GET`, `POST`, etc.). Wraps the browser's native `fetch` with a cleaner API and lets us add interceptors. |
| **React Hook Form** | Manages form state (field values, touched/dirty tracking). Much more efficient than using `useState` for every field. |
| **Zod** | Schema validation library. You define rules like "this must be an email" and it validates the form data before it ever reaches the API. |
| **`@hookform/resolvers`** | A bridge package that connects Zod schemas to React Hook Form so they work together. |
| **react-hot-toast** | Shows temporary success/error notification banners ("pop-ups") in the corner of the screen. |
| **clsx** | A tiny utility that conditionally joins CSS class names together. e.g. `clsx('btn', isRed && 'btn-red')`. |

---

## 3. Talking to the Backend — `axios.js`

**File:** `src/api/axios.js`

This is the single configured Axios instance used by the entire app. Think of it as the "phone line" to the backend.

### Base Setup

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});
```

- `axios.create()` creates a pre-configured HTTP client. Every request made through `api` automatically gets this `baseURL` and header.
- `import.meta.env.VITE_API_URL` reads from a `.env` file. If that variable isn't set, it falls back to `localhost:5000`. This means you can point the app at a production server just by changing the `.env` file.

### Request Interceptor — Attaching the Token

```js
api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

An **interceptor** is a function that runs automatically before every request is sent (or after every response arrives). This one:
- Reads the current `accessToken` from the global auth store.
- If a token exists, it adds `Authorization: Bearer <token>` to the request headers.
- This means **every API call automatically sends the user's login token** — you never have to add it manually in each page.

### Response Interceptor — Auto Token Refresh

```js
api.interceptors.response.use(
  (res) => res,   // success: just pass through
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      // ... use the refreshToken to get a new accessToken ...
      // retry the original failed request with the new token
    }
    // if refresh also fails → logout and redirect to /login
  }
);
```

**Why this exists:** Access tokens are short-lived (they expire). When a request comes back with `401 Unauthorized`, instead of immediately kicking the user out, this interceptor:

1. Takes the stored `refreshToken` and sends it to `POST /auth/refresh-token`.
2. Gets back a new `accessToken` and saves it to the store.
3. **Retries the original failed request** with the new token — the user never notices anything happened.
4. If the refresh itself fails (refresh token also expired), it calls `logout()` and redirects to `/login`.

The `_retry` flag prevents an infinite loop — without it, if the retry also 401s, we'd loop forever.

> **Why the lazy import `getAuthStore()`?**  
> `axios.js` and `authStore.js` both need each other at module load time, which would create a circular dependency error. The solution is to import the store lazily — inside the function body — so it's only loaded *when needed*, not when the file first parses.

---

## 4. Global State — `authStore.js`

**File:** `src/store/authStore.js`

```js
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'acocie-auth' }
  )
);
```

### What is Zustand?

In React, normally you share data between components by passing it as "props" through every parent → child level. When your app is large, this becomes painful ("prop drilling"). Zustand solves this with a **global store** — a single object that any component can read from or write to directly.

### What's in the store?

| Field | Type | Purpose |
|---|---|---|
| `user` | object / null | The logged-in user's profile (`id`, `firstName`, `email`, `role`, etc.) |
| `accessToken` | string / null | The JWT used to authenticate API requests |
| `refreshToken` | string / null | The long-lived token used to get a new access token |

### The Actions

- **`setAuth({ user, accessToken, refreshToken })`** — called after login or OTP verification. Sets all three values at once.
- **`setAccessToken(token)`** — called by the auto-refresh interceptor. Updates only the access token without wiping user/refresh.
- **`logout()`** — sets everything back to `null`. Called on logout or when refresh fails.

### `persist` — Surviving Page Refreshes

Without `persist`, the store resets every time you refresh the browser. The `persist` middleware from Zustand automatically **saves the store to `localStorage`** under the key `'acocie-auth'` and **reloads it** when the app starts. This is why a logged-in user stays logged in after refreshing the page.

### Reading the store in a component

```jsx
const user = useAuthStore((s) => s.user);
const setAuth = useAuthStore((s) => s.setAuth);
```

You pass a **selector function** `(s) => s.something`. React will only re-render the component if *that specific piece* of state changes — not every time anything in the store changes. This is an important performance optimisation.

---

## 5. All Auth API Calls — `auth.api.js`

**File:** `src/api/auth.api.js`

```js
export const authApi = {
  register:        (data)          => api.post('/auth/register', data),
  verifyOtp:       (data)          => api.post('/auth/verify-otp', data),
  login:           (data)          => api.post('/auth/login', data),
  refreshToken:    (refreshToken)  => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword:  (email)         => api.post('/auth/forgot-password', { email }),
  verifyResetOtp:  (data)          => api.post('/auth/verify-reset-otp', data),
  resetPassword:   (data)          => api.post('/auth/reset-password', data),
  logout:          (refreshToken)  => api.post('/auth/logout', { refreshToken }),
  changePassword:  (data)          => api.post('/auth/change-password', data),
};
```

This is a simple object where each key is a function that calls `api.post(...)`. It is a "wrapper" around raw Axios calls for two reasons:

1. **Readability** — `authApi.login(values)` is clearer than `api.post('/auth/login', values)`.
2. **Single source of truth** — if the endpoint changes, you update it in one place, not in every page that uses it.

Each function returns a **Promise** — the HTTP request hasn't been made yet when the function is called. The caller must `await` it:

```js
const { data } = await authApi.login(values);
//              ^ this is the API's response: { success, data: { accessToken, user, ... } }
```

---

## 6. Routing — How Pages Are Wired Up

**File:** `src/router/index.jsx`

React Router v7 uses `createBrowserRouter` which maps URL paths to components:

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,       // App is the persistent shell (Navbar + Outlet)
    children: [
      { index: true, element: <HomePage /> },               // matches "/"
      { path: 'login',     element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: 'register',  element: <PublicRoute><RegisterPage /></PublicRoute> },
      { path: 'verify-otp', element: <VerifyOTPPage /> },
      // ...etc
    ],
  },
]);
```

### The Parent-Child Relationship

`App` is the parent route at `/`. Its `children` are all the sub-pages. When you navigate to `/login`, React Router renders `App` and puts `LoginPage` inside `App`'s `<Outlet />`. This is why the Navbar always shows — `App` never unmounts.

### `index: true`

The route with `index: true` is the default — it renders when the path is exactly `/` with nothing after it.

### Navigating Programmatically

In pages, we use `useNavigate` to redirect the user after an action:

```js
const navigate = useNavigate();
navigate('/verify-otp', { state: { email: values.email } });
```

The second argument `{ state: ... }` passes data to the next page through React Router's internal state (it doesn't appear in the URL). The target page reads it with:

```js
const location = useLocation();
const email = location.state?.email;
```

---

## 7. Route Guards — Protecting Pages

Three files in `src/router/` act as **guards** — they wrap page components and decide whether to show them or redirect elsewhere.

### `PublicRoute.jsx` — Redirect if already logged in

```jsx
export default function PublicRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (accessToken) return <Navigate to="/" replace />;
  return children;
}
```

**Purpose:** Wraps auth pages (Login, Register, etc.). If the user already has an access token (is logged in), they shouldn't be able to visit `/login` — they'd be sent back to `/`. Without this, a logged-in user could re-register or see the login form.

### `PrivateRoute.jsx` — Redirect if not logged in

```jsx
export default function PrivateRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
```

**Purpose:** Wraps customer-only pages (Cart, Profile, Orders). If the user isn't logged in, they are sent to `/login`. Crucially, it passes `state={{ from: location }}` — after login, the app knows where the user was trying to go and **redirects them back there**.

This is used in `LoginPage.jsx`:
```js
const from = location.state?.from?.pathname ?? '/';
navigate(from, { replace: true });
```

### `RoleRoute.jsx` — Redirect if wrong role

```jsx
export default function RoleRoute({ allowedRoles, children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
```

**Purpose:** Wraps vendor and admin pages. Even if you're logged in, you can't access the vendor dashboard unless `user.role` is `'vendor'`, `'admin'`, or `'super_admin'`. Usage will look like:

```jsx
<RoleRoute allowedRoles={['vendor', 'admin', 'super_admin']}>
  <VendorDashboardPage />
</RoleRoute>
```

---

## 8. The Auth Pages — Logic Walkthrough

### `LoginPage.jsx`

**Flow:**
1. User fills in email + password.
2. `useForm` + Zod validate the fields *before* any API call is made.
3. On valid submit, `authApi.login(values)` is called.
4. On success: `setAuth(data.data)` saves `user`, `accessToken`, `refreshToken` to the store → `navigate(from)` redirects the user.
5. On failure: the backend's error message is shown in a toast.

**Key pattern — `isLoading` state:**
```js
const [loading, setLoading] = useState(false);
// ...
setLoading(true);
try { /* API call */ } finally { setLoading(false); }
```
`loading` is set to `true` before the API call and `false` after (whether it succeeded or failed, via `finally`). The `Button` component receives `isLoading={loading}` and shows a spinner + disables itself. This prevents double-submitting.

---

### `RegisterPage.jsx`

**Extra logic — password confirmation:**
```js
const schema = z.object({ ... })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

Zod's `.refine()` lets you add cross-field validation. After passing all individual field rules, it checks that `password === confirmPassword`. If not, it attaches the error to the `confirmPassword` field.

**Stripping `confirmPassword` before sending to API:**
```js
const onSubmit = async ({ confirmPassword: _, ...values }) => { ... }
```

This is JavaScript destructuring with aliasing. It pulls `confirmPassword` out as `_` (discarded) and collects everything else into `values`. The backend doesn't expect or want `confirmPassword` — so we strip it here.

**After successful registration:** The user is navigated to `/verify-otp` with the email passed in router state, so the OTP page knows which email to display and submit.

---

### `VerifyOTPPage.jsx` and `VerifyResetOTPPage.jsx`

These pages implement a custom OTP input — 6 individual single-character boxes instead of one text field.

**State:**
```js
const [digits, setDigits] = useState(['', '', '', '', '', '']);
const inputRefs = useRef([]);
```
- `digits` is an array of 6 strings, one per box.
- `inputRefs` is an array of direct DOM references to each `<input>` element, so we can programmatically move focus.

**Auto-advance focus:**
```js
const updateDigit = (idx, val) => {
  const cleaned = val.replace(/\D/, '').slice(-1); // only keep digits, max 1 char
  const next = [...digits];
  next[idx] = cleaned;
  setDigits(next);
  if (cleaned && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
};
```
When you type a digit, it moves focus to the next box automatically.

**Backspace to go back:**
```js
const handleKeyDown = (idx, e) => {
  if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
    inputRefs.current[idx - 1]?.focus();
  }
};
```
If the current box is already empty and you press Backspace, it moves focus to the previous box.

**Paste support:**
```js
const handlePaste = (e) => {
  const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
  // fill all 6 boxes at once
};
```
You can paste a 6-digit code copied from an email and all boxes fill instantly.

**Countdown timer for Resend:**
```js
useEffect(() => {
  if (countdown <= 0) return;
  const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
  return () => clearTimeout(id);  // cleanup prevents memory leaks
}, [countdown]);
```
`useEffect` with `[countdown]` as a dependency runs every time `countdown` changes. It schedules a 1-second decrement. When the effect cleans up (before the next run), it cancels the previous `setTimeout`. This creates a countdown that ticks down every second.

---

### `ForgotPasswordPage.jsx` → `VerifyResetOTPPage.jsx` → `ResetPasswordPage.jsx`

This is a **3-step flow** linked by router state:

```
ForgotPasswordPage
  → collects email
  → calls POST /auth/forgot-password
  → navigate('/verify-reset-otp', { state: { email } })

VerifyResetOTPPage
  → reads email from location.state
  → calls POST /auth/verify-reset-otp({ email, otp })
  → gets back { resetToken }
  → navigate('/reset-password', { state: { resetToken } })

ResetPasswordPage
  → reads resetToken from location.state
  → calls POST /auth/reset-password({ resetToken, newPassword })
  → navigate('/login')
```

The `resetToken` is a security token from the backend — it proves the user completed OTP verification before allowing a password change. It is passed through router state (not the URL) to keep it out of browser history.

**Guard in `ResetPasswordPage`:**
```js
if (!resetToken) {
  toast.error('Missing reset token. Please start the reset process again.');
  navigate('/forgot-password');
  return;
}
```
If someone navigates directly to `/reset-password` without going through the flow, `resetToken` will be `undefined` and they're sent back to step 1.

---

## 9. Reusable Components — What They Do

### `Button.jsx`

```jsx
export default function Button({ variant = 'primary', fullWidth, isLoading, ...props }) { ... }
```

- Renders a `<button>` with the right CSS class based on `variant` (`primary`, `secondary`, `danger`, `ghost`).
- When `isLoading={true}`: disables the button (prevents double-submit) and shows an animated spinner icon instead of the label text.
- `...props` spreads everything else (like `type="submit"`, `onClick`, etc.) directly onto the `<button>` element.

### `Input.jsx`

```jsx
const Input = forwardRef(function Input({ label, error, type, ...props }, ref) { ... });
```

- `forwardRef` is needed because React Hook Form needs a direct DOM reference (`ref`) to the underlying `<input>` element to track its value. `forwardRef` allows that ref to be passed through to the `<input>`.
- When `type="password"`, it renders an eye icon button that toggles between `type="password"` and `type="text"` (show/hide password).
- When an `error` string is passed, the input border turns red and the error message shows below.

### `AuthCard.jsx`

A simple layout wrapper that centres content on the screen with the brand name and tagline above it. All auth pages use it so they all look visually consistent. It takes `title` and `subtitle` props to customise the heading without duplicating the layout code.

### `Navbar.jsx`

- Reads `user` from the auth store to know if someone is logged in.
- Shows the cart icon and user dropdown only when logged in.
- Shows "Vendor" nav link only for `vendor`/`admin`/`super_admin` roles.
- Shows "Admin" nav link only for `admin`/`super_admin` roles.
- The logout function calls `authApi.logout(refreshToken)` to invalidate the token on the backend, then calls `logout()` on the store (wipes state + localStorage), and navigates to `/login`.

---

## 10. How Data Flows End-to-End — Full Example

**Scenario: User logs in**

```
1. User types email + password → React Hook Form tracks field values in its own internal state

2. User clicks "Sign In"
   → handleSubmit (React Hook Form) runs the Zod schema validation
   → If invalid: errors appear on the fields, form does NOT submit
   → If valid: calls onSubmit(values)

3. onSubmit:
   setLoading(true)
   const { data } = await authApi.login({ email, password })
   → authApi.login sends POST http://localhost:5000/api/v1/auth/login
   → The request interceptor fires: no token yet, so no Authorization header added
   → Backend responds with { success: true, data: { accessToken, refreshToken, user } }

4. setAuth(data.data)
   → Zustand store: user, accessToken, refreshToken are all set
   → persist middleware: saves them to localStorage['acocie-auth']

5. toast.success('Welcome back!')
   → react-hot-toast shows a green banner top-right

6. navigate(from, { replace: true })
   → React Router changes the URL to wherever the user was trying to go (or '/')
   → The new page renders inside App's <Outlet />
   → Navbar re-renders: it reads user from the store and now shows the avatar/cart

7. Future API calls:
   → The request interceptor reads accessToken from the store
   → Adds Authorization: Bearer <token> to every request automatically
```

---

## 11. Folder Structure Rationale

```
src/
├── api/          # All HTTP calls. One file per backend resource group.
│                 # Components never call axios directly — only through these files.
│
├── store/        # Zustand global state. Currently just auth.
│                 # Any component can import and read/write state here.
│
├── router/       # Route config + guard components.
│                 # Guards are pure logic — they read state and return either
│                 # the page or a <Navigate> redirect.
│
├── pages/        # Full page components. Organised by role/area:
│   ├── auth/     #   auth pages (no login required)
│   ├── public/   #   browseable without an account
│   ├── customer/ #   requires login (Phase 3)
│   ├── vendor/   #   requires vendor role (Phase 4)
│   └── admin/    #   requires admin role (Phase 5)
│
├── components/   # Reusable pieces used across multiple pages.
│   ├── ui/       #   "atoms" — Button, Input, Badge, Modal (no business logic)
│   ├── layout/   #   Navbar, Footer, Sidebar (structural components)
│   └── auth/     #   AuthCard (layout specific to auth pages)
│
└── index.css     # Global Tailwind setup + reusable CSS component classes
                  # (.btn-primary, .input-field, .card, etc.)
```

**The key principle:** Pages own the *logic* (API calls, navigation, state reads). Components own the *presentation* (rendering, user interactions). The `api/` layer owns the *network communication*. Each layer has one job and doesn't mix with the others.

---

## Quick Reference — State Values After Login

```
localStorage['acocie-auth'] = {
  state: {
    user: {
      id: "uuid",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      role: "customer",       // "customer" | "vendor" | "admin" | "super_admin"
      isVerified: true
    },
    accessToken: "eyJ...",    // short-lived JWT, sent in every API request header
    refreshToken: "eyJ..."    // long-lived, only used to renew the accessToken
  }
}
```

The `role` field is what `RoleRoute` checks to decide whether to show vendor/admin pages.
