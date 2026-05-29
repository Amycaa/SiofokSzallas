import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyMenu from './Components/MyMenu';
import Home from './Components/Home';
import MyBookings from './Components/MyBookings';
import ApartmentDetail from './Components/ApartmentDetail';
import BookingPage from './Components/BookingPage'; 
import FAQ from './Components/FAQ';
import ApartmentTranslationAdmin from './Components/ApartmentTranslationAdmin';


function App() {
  return (
    <Router>
      <MyMenu />

      <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apartment/:id" element={<ApartmentDetail />} />
          <Route path="/foglalasaim" element={<MyBookings />} />
          <Route path="/foglalas" element={<BookingPage />} /> 
          <Route path="/gyik" element={<FAQ />} />
          <Route path="/admin/forditas" element={<ApartmentTranslationAdmin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;