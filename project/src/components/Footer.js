// src/components/Footer.js

import React from 'react';
import '../App.css'; 

const Footer = ({ text }) => {
    return (
        <footer className="footer-container">
            <p>{text}</p>
        </footer>
    );
};

export default Footer;