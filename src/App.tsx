import { useRoutes } from 'react-router-dom';
import { routes } from './routes/routes';
import LoginModalProvider from './contexts/LoginModalContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const routeElement = useRoutes(routes);
  
  return (
    <AuthProvider>
      <LoginModalProvider>
        {routeElement}
      </LoginModalProvider>
    </AuthProvider>
  );
}

export default App;
