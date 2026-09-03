import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { CommandCenter } from './pages/CommandCenter';
import { Projects } from './pages/Projects';
import { VideoStudio } from './pages/VideoStudio';
import { ImageStudio } from './pages/ImageStudio';
import { AppBuilder } from './pages/AppBuilder';
import { AdStudio } from './pages/AdStudio';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/video" element={<VideoStudio />} />
        <Route path="/images" element={<ImageStudio />} />
        <Route path="/builder" element={<AppBuilder />} />
        <Route path="/ads" element={<AdStudio />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
