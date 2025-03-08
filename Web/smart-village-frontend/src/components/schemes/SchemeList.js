import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SchemeService from '../../services/scheme.service';

const SchemeList = () => {
    const [schemes, setSchemes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const location = useLocation();

    // Fetch categories and schemes
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch categories and schemes in parallel
            const [categoriesResponse, schemesResponse] = await Promise.all([
                SchemeService.getSchemeCategories(),
                SchemeService.getSchemes(selectedCategory)
            ]);

            setCategories(categoriesResponse.data);
            setSchemes(schemesResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching schemes data:', error);
            setError('Failed to load schemes. Please try again later.');
            setLoading(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        // Check for success message from navigation
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location.state]);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // Get category badge color
    const getCategoryBadgeClass = (category) => {
        switch (category) {
            case 'Pension':
                return 'bg-primary';
            case 'Healthcare':
                return 'bg-success';
            case 'Education':
                return 'bg-info';
            case 'Housing':
                return 'bg-warning text-dark';
            case 'Agriculture':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Government Schemes</h2>
                <Link to="/schemes/my-applications" className="btn btn-primary">
                    <i className="fas fa-clipboard-list me-1"></i> My Applications
                </Link>
            </div>

            {/* Success message */}
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

            {/* Error message */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Filter by category */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : schemes.length === 0 ? (
                <div className="alert alert-info">
                    No schemes found for the selected category.
                </div>
            ) : (
                <div className="row">
                    {schemes.map((scheme) => (
                        <div className="col-md-6 mb-4" key={scheme.id}>
                            <div className="card h-100">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">{scheme.name}</h5>
                                    <span className={`badge ${getCategoryBadgeClass(scheme.category)}`}>
                                        {scheme.category}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <p className="card-text">{scheme.description}</p>
                                    <h6>Benefits:</h6>
                                    <p className="card-text">{scheme.benefits}</p>
                                </div>
                                <div className="card-footer bg-white">
                                    <Link to={`/schemes/${scheme.id}`} className="btn btn-primary w-100">
                                        View Details
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

export default SchemeList;