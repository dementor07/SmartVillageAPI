import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AnnouncementService from '../../services/announcement.service';

const AnnouncementDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnnouncementDetails = async () => {
            try {
                const response = await AnnouncementService.getAnnouncementById(id);
                setAnnouncement(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching announcement details:', error);
                setError('Failed to load announcement details. It may have been removed or you do not have permission to view it.');
                setLoading(false);
            }
        };

        fetchAnnouncementDetails();
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
                <button onClick={() => navigate(-1)} className="btn btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Announcement not found</div>
                <Link to="/announcements" className="btn btn-primary">
                    Back to Announcements
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/announcements">Announcements</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {announcement.title}
                    </li>
                </ol>
            </nav>

            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <h2 className="mb-0">{announcement.title}</h2>
                </div>
                <div className="card-body">
                    <div className="d-flex justify-content-between mb-4">
                        <div>
                            <span className="badge bg-primary me-2">{announcement.category}</span>
                            <span className="text-muted">
                                Published on {formatDate(announcement.createdAt)}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted">
                                By {announcement.publishedBy}
                            </span>
                        </div>
                    </div>

                    {announcement.expiresAt && (
                        <div className="alert alert-warning mb-4">
                            <i className="fas fa-clock me-2"></i>
                            This announcement expires on {formatDate(announcement.expiresAt)}
                        </div>
                    )}

                    <div className="announcement-content">
                        {/* Split content by paragraphs for better readability */}
                        {announcement.content.split('\n\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>
                <div className="card-footer">
                    <button onClick={() => navigate(-1)} className="btn btn-outline-primary">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Announcements
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetails;