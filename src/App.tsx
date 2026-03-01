import { Switch, Route, Link } from 'wouter';
import JobsIndex from './pages/JobsIndex';
import JobDetail from './pages/JobDetail';
import ResumesIndex from './pages/ResumesIndex';
import ResumeDetail from './pages/ResumeDetail';
import './App.css';

function App() {
  return (
    <>
      <header className="app-nav">
        <nav className="top-navbar">
          <Link href="/">Jobs</Link>
          <Link href="/resumes">Resumes</Link>
        </nav>
      </header>

      <Switch>
        <Route path="/" component={JobsIndex} />
        <Route path="/job/:id" component={JobDetail} />
        <Route path="/resumes" component={ResumesIndex} />
        <Route path="/resume/:id" component={ResumeDetail} />
        <Route>
          <div className="app">
            <h1>404 - Page Not Found</h1>
          </div>
        </Route>
      </Switch>
    </>
  );
}

export default App;
