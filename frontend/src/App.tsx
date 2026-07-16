import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Workspace } from './pages/Workspace';
import { Reader } from './pages/Reader';
import { SkeuomorphicLayout } from './components/SkeuomorphicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace" element={
            <ProtectedRoute>
              <SkeuomorphicLayout>
                <Workspace />
              </SkeuomorphicLayout>
            </ProtectedRoute>
          } />
          <Route path="/reader/:id" element={
            <ProtectedRoute>
              <SkeuomorphicLayout>
                <Reader />
              </SkeuomorphicLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
