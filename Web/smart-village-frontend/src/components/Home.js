import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementService from '../services/announcement.service';

const Home = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await AnnouncementService.getAnnouncements();
                setAnnouncements(response.data.slice(0, 3)); // Get only the most recent 3
                setLoading(false);
            } catch (error) {
                console.error('Error fetching announcements:', error);
                setError('Failed to load announcements');
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    return (
        <div className="container mt-4">
            {/* Hero Section */}
            <div className="p-5 mb-4 bg-primary text-white rounded-3">
                <div className="container-fluid py-5">
                    <h1 className="display-5 fw-bold">Welcome to Smart Village Portal</h1>
                    <p className="col-md-8 fs-4">
                        An integrated platform connecting residents with essential services,
                        announcements, and community resources.
                    </p>
                    <Link to="/register" className="btn btn-light btn-lg">
                        Join Now
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-bullhorn fa-3x text-primary mb-3"></i>
                            <h3 className="card-title">Village Announcements</h3>
                            <p className="card-text">
                                Stay updated with the latest news, events, and important announcements from village administration.
                            </p>
                            <Link to="/announcements" className="btn btn-outline-primary">
                                View Announcements
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-tools fa-3x text-primary mb-3"></i>
                            <h3 className="card-title">Service Requests</h3>
                            <p className="card-text">
                                Submit and track service requests for infrastructure, utilities, and other essential services.
                            </p>
                            <Link to="/service-requests" className="btn btn-outline-primary">
                                Request Service
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-users fa-3x text-primary mb-3"></i>
                            <h3 className="card-title">Community Portal</h3>
                            <p className="card-text">
                                Connect with other residents, access community resources, and participate in local initiatives.
                            </p>
                            <Link to="/dashboard" className="btn btn-outline-primary">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Announcements */}
            <div className="row mt-5">
                <div className="col-12">
                    <h2 className="border-bottom pb-2">Recent Announcements</h2>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : (
                <div className="row mt-3">
                    {announcements.length > 0 ? (
                        announcements.map((announcement) => (
                            <div className="col-md-4 mb-4" key={announcement.id}>
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">{announcement.title}</h5>
                                        <h6 className="card-subtitle mb-2 text-muted">
                                            {new Date(announcement.createdAt).toLocaleDateString()} - {announcement.category}
                                        </h6>
                                        <p className="card-text">
                                            {announcement.content?.length > 100
                                                ? `${announcement.content.substring(0, 100)}...`
                                                : announcement.content}
                                        </p>
                                        <Link to={`/announcements/${announcement.id}`} className="card-link">
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <p className="text-muted">No announcements available at the moment.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="d-flex justify-content-center mt-3 mb-5">
                <Link to="/announcements" className="btn btn-primary">
                    View All Announcements
                </Link>
            </div>
        </div>
    );
};

export default Home;