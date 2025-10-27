import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogListing from './pages/BlogListing';
import ArticleDetail from './pages/ArticleDetail';
import CategoryLanding from './pages/CategoryLanding';
import Admin from './pages/Admin';
import ArticleEditor from './pages/ArticleEditor';
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
            
            {/* Compliance Category Routes */}
            <Route path="/compliance/soc-2" element={<CategoryLanding category="SOC 2" />} />
            <Route path="/compliance/iso-27001" element={<CategoryLanding category="ISO 27001" />} />
            <Route path="/compliance/hipaa" element={<CategoryLanding category="HIPAA" />} />
            <Route path="/compliance/pci-dss" element={<CategoryLanding category="PCI DSS" />} />
            <Route path="/compliance/gdpr" element={<CategoryLanding category="GDPR" />} />
            <Route path="/compliance/fedramp" element={<CategoryLanding category="FedRAMP" />} />
            <Route path="/compliance/cmmc" element={<CategoryLanding category="CMMC" />} />
            <Route path="/compliance/nist-csf" element={<CategoryLanding category="NIST CSF" />} />
            <Route path="/compliance/hitrust" element={<CategoryLanding category="HITRUST" />} />
            
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/editor/new" element={<ArticleEditor />} />
            <Route path="/admin/editor/:slug" element={<ArticleEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
