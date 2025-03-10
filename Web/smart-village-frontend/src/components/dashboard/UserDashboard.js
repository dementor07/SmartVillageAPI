// src/components/dashboard/UserDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import RequestService from '../../services/request.service';
import CertificateService from '../../services/certificate.service';
import AnnouncementService from '../../services/announcement.service';
import SchemeService from '../../services/scheme.service';
import AuthService from '../../services/auth.service';

const UserDashboard = () => {
    // State declarations
    const [dashboardData, setDashboardData] = useState({
        serviceRequests: [],
        certificates: [],
        announcements: [],
        schemeApplications: [],
        availableSchemes: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = AuthService.getCurrentUser();

    // Use a single fetchDashboardData function to avoid multiple state updates
    // Memoize with useCallback to prevent recreation on every render
    const fetchDashboardData = useCallback(async () => {
        if (!loading) return; // Only fetch when loading is true

        try {
            setLoading(true);

            // Initialize empty data objects to handle potential API failures
            let reqData = [], certData = [], annData = [], schmData = [], appData = [];

            // Use Promise.allSettled to handle partial failures gracefully
            const results = await Promise.allSettled([
                RequestService.getMyRequests(),
                CertificateService.getMyCertificates(),
                AnnouncementService.getAnnouncements(),
                SchemeService.getSchemes(),
                SchemeService.getMyApplications()
            ]);

            // Process results, handling any rejected promises
            if (results[0].status === 'fulfilled') reqData = results[0].value.data;
            if (results[1].status === 'fulfilled') certData = results[1].value.data;
            if (results[2].status === 'fulfilled') annData = results[2].value.data.slice(0, 3);
            if (results[3].status === 'fulfilled') schmData = results[3].value.data.slice(0, 4);
            if (results[4].status === 'fulfilled') appData = results[4].value.data;

            // Set all data in a single state update to prevent multiple renders
            setDashboardData({
                serviceRequests: reqData,
                certificates: certData,
                announcements: annData,
                availableSchemes: schmData,
                schemeApplications: appData
            });

            // Always set error and loading in the same block to prevent race conditions
            setError('');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please try again later.');
            setLoading(false);
        }
    }, [loading]); // Only depend on loading state

    // Single useEffect to fetch all data
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Get status badge class for various statuses - pure function, no state changes
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            case 'Pending':
                return 'bg-warning text-dark';
            case 'Resolved':
                return 'bg-success';
            default:
                return 'bg-secondary';
        }
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

    // Destructure the data for easier access in the JSX
    const { serviceRequests, certificates, announcements, schemeApplications, availableSchemes } = dashboardData;

    return (
        <div className="container mt-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h2 className="card-title">Welcome, {user?.fullName || 'Resident'}</h2>
                            <p className="card-text">
                                Access your village services, track your applications, and stay updated with the latest announcements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Dashboard summary cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-clipboard-list fa-3x mb-3"></i>
                            <h4>{serviceRequests.length}</h4>
                            <h5>Service Requests</h5>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                            <Link to="/service-requests" className="btn btn-outline-light btn-sm w-100">View All</Link>
                        </div>
                    </div>
                </div>

                {/* Additional dashboard cards */}
                <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-certificate fa-3x mb-3"></i>
                            <h4>{certificates.length}</h4>
                            <h5>Certificates</h5>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                            <Link to="/certificates" className="btn btn-outline-light btn-sm w-100">View All</Link>
                        </div>
                    </div>
                </div>

                {/* Remaining dashboard content... */}
                {/* Additional sections removed for brevity */}
            </div>

            {/* Remaining dashboard sections would follow similar patterns */}
        </div>
    );
};

export default UserDashboard;