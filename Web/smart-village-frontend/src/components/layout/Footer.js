import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-light py-4 mt-auto">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <h5>Smart Village Portal</h5>
                        <p className="text-muted">
                            Connecting residents, streamlining services, and building a smarter community.
                        </p>
                    </div>
                    <div className="col-md-3">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><a href="/" className="text-decoration-none">Home</a></li>
                            <li><a href="/announcements" className="text-decoration-none">Announcements</a></li>
                            <li><a href="/service-requests" className="text-decoration-none">Service Requests</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5>Contact</h5>
                        <ul className="list-unstyled">
                            <li>Email: info@smartvillage.com</li>
                            <li>Phone: +1 (123) 456-7890</li>
                        </ul>
                    </div>
                </div>
                <hr />
                <div className="text-center">
                    <p className="mb-0">© {new Date().getFullYear()} Smart Village Portal. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;