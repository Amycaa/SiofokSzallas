import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyMenu from './Components/MyMenu';
import Home from './Components/Home';          // <-- IMPORTÁLD BE
import MyBookings from './Components/MyBookings';
import ApartmentDetail from './Components/ApartmentDetail';

function App() {
  return (
    <Router>
      <MyMenu />

      <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          {/* A sima főoldalon listázzuk ki az összes apartmant */}
          <Route path="/" element={<Home />} />
          
          {/* Ha rákattintanak egyre, az ID alapján ide navigálunk */}
          <Route path="/apartment/:id" element={<ApartmentDetail />} />
          
          {/* Lemondás oldal */}
          <Route path="/foglalasaim" element={<MyBookings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;