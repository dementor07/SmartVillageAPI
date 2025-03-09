import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementService from '../../services/announcement.service';

const AnnouncementList = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Use useCallback to memoize the fetchAnnouncements function
    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            const response = await AnnouncementService.getAnnouncements();

            // Filter by category if selected
            let filteredAnnouncements = response.data;
            if (selectedCategory) {
                filteredAnnouncements = response.data.filter(
                    announcement => announcement.category === selectedCategory
                );
            }

            setAnnouncements(filteredAnnouncements);

            // Extract unique categories
            const uniqueCategories = [...new Set(response.data.map(a => a.category))];
            setCategories(uniqueCategories);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setError('Failed to load announcements. Please try again.');
            setLoading(false);
        }
    }, [selectedCategory]); // Adding selectedCategory as a dependency

    // Now use the memoized function in the dependency array
    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Village Announcements</h2>

            {/* Category filter */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : announcements.length === 0 ? (
                <div className="alert alert-info">
                    {selectedCategory
                        ? `No announcements found in the "${selectedCategory}" category.`
                        : 'No announcements available at the moment.'}
                </div>
            ) : (
                <div className="row">
                    {announcements.map(announcement => (
                        <div className="col-md-6 mb-4" key={announcement.id}>
                            <div className="card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{announcement.title}</h5>
                                    <span className="badge bg-primary">{announcement.category}</span>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted small mb-2">
                                        Published on {formatDate(announcement.createdAt)} by {announcement.publishedBy}
                                    </p>
                                    <p className="card-text">
                                        {announcement.content.length > 200
                                            ? `${announcement.content.substring(0, 200)}...`
                                            : announcement.content}
                                    </p>
                                </div>
                                <div className="card-footer bg-white border-0">
                                    <Link to={`/announcements/${announcement.id}`} className="btn btn-outline-primary">
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementList;