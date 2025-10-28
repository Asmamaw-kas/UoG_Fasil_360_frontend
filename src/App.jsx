import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Photos from './pages/Photos';
import Rewards from './pages/Rewards';
import Documents from './pages/Documents';
import SearchPage from './components/common/SearchPage';
import RewardDetail from './pages/RewardDetail';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Profile from './components/auth/Profile';
import DebugAuth from './components/DebugAuth';
import PhotoDetail from './pages/PhotoDetail';
import DocumentDetail from './pages/DocumentDetail';
import RepresentativeRequest from './components/auth/RepresentativeRequest';
import ForgotPassword from './components/auth/ForgotPassword';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/photos" element={<Photos />} /> {/* Fixed: Added JSX syntax */}
              <Route path="/rewards" element={<Rewards/>} />
              <Route path="/photos/:id" element={<PhotoDetail />} />
              <Route path="/rewards/:id" element={<RewardDetail />} />
              <Route path="/documents" element={<Documents/>} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/search" element={<SearchPage/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/register" element={<Register/>} />
              <Route path="/profile" element={<Profile/>} />
              <Route path="/representative-request" element={<RepresentativeRequest/>} />
              <Route path="/forgot-password" element={<ForgotPassword/>} />
              
            </Routes>
          </main>
          <Footer/>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
