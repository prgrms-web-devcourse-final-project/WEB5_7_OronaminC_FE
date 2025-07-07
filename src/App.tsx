import { useRoutes } from 'react-router-dom';
import { routes } from './routes/routes';

function App() {
  const routeElement = useRoutes(routes);
  
  return routeElement;
}

export default App;
