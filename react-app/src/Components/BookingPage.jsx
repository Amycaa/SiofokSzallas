import { useLocation } from 'react-router-dom';
import BookingForm from './BookingForm';
import Footer from './Footer';

export default function BookingPage() {
  const location = useLocation();
  const { apartmentName, pricePerNight, maxGuest, minGuest } = location.state || {};

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <BookingForm
        apartmentName={apartmentName}
        pricePerNight={pricePerNight}
        maxGuest={maxGuest}
        minGuest={minGuest}
      />
      <Footer />
    </div>
  );
}