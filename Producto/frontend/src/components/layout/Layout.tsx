import React from 'react';
import './Layout.css';  // Import layout styles

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <header className="header">
                <h1>Header</h1>
            </header>
            <aside className="sidebar">
                <h2>Sidebar</h2>
            </aside>
            <main className="content">
                {children}
            </main>
            <footer className="footer">
                <p>Footer</p>
            </footer>
        </div>
    );
};

export default Layout;