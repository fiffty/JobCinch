import { Switch, Route } from 'wouter';
import JobsIndex from './pages/JobsIndex';
import JobDetail from './pages/JobDetail';
import './App.css';

function App() {
  return (
    <Switch>
      <Route path="/" component={JobsIndex} />
      <Route path="/job/:id" component={JobDetail} />
      <Route>
        <div className="app">
          <h1>404 - Page Not Found</h1>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
