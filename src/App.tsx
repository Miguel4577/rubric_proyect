import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Loader from './common/Loader';
import routes from './routes';

import ProtectedRoute from "../src/components/Auth/ProtectedRoute";
import RoleGuard from './components/Auth/RoleGuard';
import { ALL_ROLES } from './config/accessControl';
import SecurityService from './services/securityService';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));
const Welcome = lazy(() => import('./pages/Dashboard/Welcome'));

const RootRedirect = () => {
  return SecurityService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/signin" replace />;
};

function App() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route path="/dashboard" element={<RoleGuard allowedRoles={ALL_ROLES}><Welcome /></RoleGuard>} />
            {routes.map((route, index) => {
              const { path, component: Component, allowedRoles } = route;
              return (
                <Route
                  key={index}
                  path={path}
                  element={
                    <RoleGuard allowedRoles={allowedRoles}>
                      <Suspense fallback={<Loader />}>
                        <Component />
                      </Suspense>
                    </RoleGuard>
                  }
                />
              );
            })}
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;


