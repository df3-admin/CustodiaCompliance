import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogListing from './pages/BlogListing';
import ArticleDetail from './pages/ArticleDetail';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<BlogListing />} />
            <Route path="/blog" element={<BlogListing />} />
            <Route path="/blog/:slug" element={<ArticleDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
