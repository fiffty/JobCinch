import { useState } from 'react';
import { Switch, Route, Link } from 'wouter';
import JobsIndex from './pages/JobsIndex';
import JobDetail from './pages/JobDetail';
import ResumesIndex from './pages/ResumesIndex';
import ResumeDetail from './pages/ResumeDetail';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="app-nav">
        <button
          className="hamburger-btn"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        {menuOpen && (
          <nav className="hamburger-menu">
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>
            <Link href="/resumes" onClick={closeMenu}>
              Resumes
            </Link>
          </nav>
        )}
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
