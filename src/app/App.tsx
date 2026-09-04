import { BrowserRouter, Routes, Route } from "react-router";
import Wireframe from "../imports/Wireframe1/Wireframe1";
import PortfolioPage from "./components/PortfolioPage";
import { HomePage as IrisHomePage } from "./components/iris/HomePage";
import { GalleryPage as IrisGalleryPage } from "./components/iris/GalleryPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Wireframe />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/iris" element={<IrisHomePage />} />
        <Route path="/iris/gallery" element={<IrisGalleryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
