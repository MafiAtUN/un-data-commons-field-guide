import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './routes/Home';
import { Start } from './routes/Start';
import { Tutorials } from './routes/Tutorials';
import { Watch } from './routes/Watch';
import { Toolkit } from './routes/Toolkit';
import { Visualise } from './routes/Visualise';
import { Cite } from './routes/Cite';
import { AiTools } from './routes/AiTools';
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

          {/* Practical track — no technical background assumed. */}
          <Route path="/start" element={<Start />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/toolkit" element={<Toolkit />} />
          <Route path="/visualise" element={<Visualise />} />
          <Route path="/cite" element={<Cite />} />
          <Route path="/ai" element={<AiTools />} />

          {/* Technical track. */}
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
