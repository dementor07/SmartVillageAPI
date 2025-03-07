import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementService from '../../services/announcement.service';

const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await AnnouncementService.getAnnouncements();
            setAnnouncements(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load announcements');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await AnnouncementService.deleteAnnouncement(id);
                setSuccess('Announcement deleted successfully');
                fetchAnnouncements();
            } catch (error) {
                setError('Failed to delete announcement');
            }
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Announcements</h2>
                <Link to="/admin/announcements/create" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i> Create Announcement
                </Link>
            </div>

            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccess('')}
                        aria-label="Close"
                    ></button>
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : announcements.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center p-5">
                        <i className="fas fa-bullhorn fa-4x text-muted mb-3"></i>
                        <h3>No announcements available</h3>
                        <p>Create your first announcement to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Published</th>
                                <th>Created Date</th>
                                <th>Expires</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map((announcement) => (
                                <tr key={announcement.id}>
                                    <td>{announcement.title}</td>
                                    <td>{announcement.category}</td>
                                    <td>
                                        <span className={`badge ${announcement.isPublished ? 'bg-success' : 'bg-warning'}`}>
                                            {announcement.isPublished ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {announcement.expiresAt
                                            ? new Date(announcement.expiresAt).toLocaleDateString()
                                            : 'Never'}
                                    </td>
                                    <td>
                                        <div className="btn-group">
                                            <Link
                                                to={`/admin/announcements/edit/${announcement.id}`}
                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(announcement.id)}
                                                className="btn btn-sm btn-outline-danger"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManagement;