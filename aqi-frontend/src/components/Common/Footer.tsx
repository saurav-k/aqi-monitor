import React from 'react';
import { Layout } from 'antd';
const { Footer } = Layout;

const FooterComponent: React.FC = () => (
    <Footer style={{ textAlign: 'center', padding: '10px 0' }}>
        Contact us at <a href="mailto:admin@tridasa.online">admin@tridasa.online</a> or WhatsApp at <a href="https://wa.me/918884111837" target="_blank" rel="noopener noreferrer">+91-8884111837</a>
    </Footer>
);

export default FooterComponent;
