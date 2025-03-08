import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SchemeService from '../../services/scheme.service';
import AuthService from '../../services/auth.service';

const SchemeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scheme, setScheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isAuthenticated = AuthService.isTokenValid();

    // Fetch scheme details
    const fetchSchemeDetails = useCallback(async () => {
        try {
            const response = await SchemeService.getSchemeById(id);
            setScheme(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching scheme details:', error);
            setError('Failed to load scheme details. Please try again later.');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSchemeDetails();
    }, [fetchSchemeDetails]);

    // Format eligibility criteria JSON to display
    const formatEligibilityCriteria = (criteriaJson) => {
        try {
            if (!criteriaJson) return [];
            const criteria = JSON.parse(criteriaJson);

            // Filter out any arrays and handle them separately
            const arrays = {};
            const simpleProps = {};

            Object.keys(criteria).forEach(key => {
                if (Array.isArray(criteria[key])) {
                    arrays[key] = criteria[key];
                } else {
                    simpleProps[key] = criteria[key];
                }
            });

            // Format simple properties
            const criteriaItems = Object.keys(simpleProps).map(key => {
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                return { key: formattedKey, value: simpleProps[key] };
            });

            // Add array properties
            Object.keys(arrays).forEach(key => {
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                const arrayValue = arrays[key].join(', ');
                criteriaItems.push({ key: formattedKey, value: arrayValue });
            });

            return criteriaItems;
        } catch (e) {
            console.error('Error parsing eligibility criteria:', e);
            return [];
        }
    };

    // Navigate to the apply form
    const handleApplyClick = () => {
        if (!isAuthenticated) {
            // If not logged in, redirect to login page
            navigate('/login', {
                state: {
                    from: `/schemes/${id}`,
                    message: 'Please login to apply for this scheme'
                }
            });
            return;
        }
        navigate(`/schemes/${id}/apply`);
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
                <Link to="/schemes" className="btn btn-primary">
                    Back to Schemes
                </Link>
            </div>
        );
    }

    if (!scheme) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Scheme not found</div>
                <Link to="/schemes" className="btn btn-primary">
                    Back to Schemes
                </Link>
            </div>
        );
    }

    // Parse documents list from string if possible
    const requiredDocuments = scheme.requiredDocuments ? scheme.requiredDocuments.split(',') : [];
    const eligibilityCriteria = formatEligibilityCriteria(scheme.eligibilityCriteria);

    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/schemes">Schemes</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {scheme.name}
                    </li>
                </ol>
            </nav>

            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">{scheme.name}</h3>
                </div>
                <div className="card-body">
                    <div className="row mb-4">
                        <div className="col-md-9">
                            <p className="lead">{scheme.description}</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <div className="d-grid gap-2">
                                <button onClick={handleApplyClick} className="btn btn-success btn-lg">
                                    <i className="fas fa-file-alt me-2"></i>
                                    Apply Now
                                </button>
                                {scheme.moreInfoUrl && (
                                    <a href={scheme.moreInfoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">
                                        <i className="fas fa-external-link-alt me-2"></i>
                                        More Information
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="card mb-4">
                                <div className="card-header bg-light">
                                    <h5 className="mb-0">
                                        <i className="fas fa-check-circle me-2 text-success"></i>
                                        Eligibility Criteria
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {eligibilityCriteria.length > 0 ? (
                                        <ul className="list-group list-group-flush">
                                            {eligibilityCriteria.map((criteria, index) => (
                                                <li key={index} className="list-group-item">
                                                    <strong>{criteria.key}:</strong> {criteria.value}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No specific eligibility criteria specified.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card mb-4">
                                <div className="card-header bg-light">
                                    <h5 className="mb-0">
                                        <i className="fas fa-gift me-2 text-primary"></i>
                                        Benefits
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p>{scheme.benefits}</p>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header bg-light">
                                    <h5 className="mb-0">
                                        <i className="fas fa-file-alt me-2 text-warning"></i>
                                        Required Documents
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {requiredDocuments.length > 0 ? (
                                        <ul className="list-group list-group-flush">
                                            {requiredDocuments.map((doc, index) => (
                                                <li key={index} className="list-group-item">
                                                    <i className="fas fa-file-pdf me-2 text-danger"></i>
                                                    {doc.trim()}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No specific documents mentioned.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                <strong>Department:</strong> {scheme.department}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <div className="d-flex justify-content-between">
                        <Link to="/schemes" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i>
                            Back to Schemes
                        </Link>
                        <button onClick={handleApplyClick} className="btn btn-success">
                            <i className="fas fa-file-alt me-2"></i>
                            Apply Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchemeDetails;