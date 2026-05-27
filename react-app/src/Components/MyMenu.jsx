import React from 'react';
import { NavLink } from 'react-router-dom';

export default function MyMenu() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>🌅 SiófokSzállás</div>
      <div style={styles.menuItems}>
        <NavLink 
          to="/" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.activeLink : {})
          })}
        >
          Apartmanok & Foglalás
        </NavLink>
        <NavLink 
          to="/foglalasaim" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.activeLink : {})
          })}
        >
          Foglalásaim Kezelése / Lemondás
        </NavLink>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#2c3e50',
    padding: '15px 30px',
    color: 'white',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  menuItems: {
    display: 'flex',
    gap: '15px'
  },
  navLink: {
    color: '#bdc3c7',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
  },
  activeLink: {
    color: '#fff',
    background: '#34495e',
  }
};