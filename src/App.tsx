import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './routes/Home';
import { Lab } from './routes/Lab';
import { Peace } from './routes/Peace';
import { Development } from './routes/Development';
import { Cookbook } from './routes/Cookbook';
import { Connect } from './routes/Connect';
import { Catalogue } from './routes/Catalogue';
import { NotFound } from './routes/NotFound';

/**
 * `import.meta.env.BASE_URL` is whatever Vite was built with, so the same code
 * serves the project page at /un-data-commons-field-guide/ and a root deployment
 * at / without a conditional.
 */
export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/peace-and-security" element={<Peace />} />
          <Route path="/development" element={<Development />} />
          <Route path="/cookbook" element={<Cookbook />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
