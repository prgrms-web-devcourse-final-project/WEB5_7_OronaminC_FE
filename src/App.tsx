import { useRoutes } from 'react-router-dom';
import { routes } from './routes/routes';
import LoginModalProvider from './contexts/LoginModalContext';

function App() {
  const routeElement = useRoutes(routes);
  
  return (
    <LoginModalProvider>
      {routeElement}
    </LoginModalProvider>
  );
}

export default App;
