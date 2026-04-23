import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0"> {/* ← min-w-0 evita overflow */}
        <Header titulo="DASHBOARD" />
        
        <main className="flex-1 p-4 sm:p-6 bg-gray-100 w-full">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;