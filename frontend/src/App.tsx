import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Workspace } from './pages/Workspace';
import { Reader } from './pages/Reader';
import { SkeuomorphicLayout } from './components/SkeuomorphicLayout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workspace" element={
          <SkeuomorphicLayout>
            <Workspace />
          </SkeuomorphicLayout>
        } />
        <Route path="/reader/:id" element={
          <SkeuomorphicLayout>
            <Reader />
          </SkeuomorphicLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
