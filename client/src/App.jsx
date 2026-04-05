import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";

function Shop()    { return <div style={{ minHeight: "60vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Tajawal,sans-serif", fontSize:"1.5rem", color:"#888" }}>صفحة المتجر — قريباً</div>; }
function NotFound(){ return <div style={{ minHeight: "60vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Tajawal,sans-serif", fontSize:"1.5rem", color:"#888" }}>404 — الصفحة غير موجودة</div>; }

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main>
        <Routes>
          <Route path="/"      element={<Home />} />
          <Route path="/shop"  element={<Shop />} />
          <Route path="*"      element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}