import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandRevenueService from '../services/landrevenue.service';

const LandRevenueServiceList = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await LandRevenueService.getServiceTypes();
                setServices(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching land revenue services:', error);
                setError('Failed to load services. Please try again later.');
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredServices = services.filter(service =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Land Revenue Services</h2>
                <Link to="/land-revenue/create" className="btn btn-success">
                    <i className="fas fa-plus me-1"></i> Apply for Service
                </Link>
            </div>

            <div className="card mb-4">
                <div className="card-body bg-light">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <p className="mb-0">
                                <i className="fas fa-info-circle me-2 text-primary"></i>
                                Browse available land revenue services provided by the village administration.
                                Apply online to save time and avoid multiple visits to government offices.
                            </p>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search services..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <span className="input-group-text bg-white">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    No services found matching your search criteria.
                </div>
            ) : (
                <div className="row">
                    {filteredServices.map((service) => (
                        <div className="col-md-6 mb-4" key={service.id}>
                            <div className="card h-100">
                                <div className="card-header bg-success text-white">
                                    <h5 className="mb-0">{service.serviceName}</h5>
                                </div>
                                <div className="card-body">
                                    <p>{service.description}</p>

                                    <div className="mb-3">
                                        <strong>Processing Time:</strong> {service.processingTime}
                                    </div>

                                    <div className="mb-3">
                                        <strong>Required Documents:</strong>
                                        <ul className="mt-2">
                                            {service.requiredDocuments.split(',').map((doc, index) => (
                                                <li key={index}>{doc.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="alert alert-info mb-0">
                                        <strong>Service Fee:</strong> ₹{service.fees.toFixed(2)}
                                        {service.fees === 0 && ' (Free of charge)'}
                                    </div>
                                </div>
                                <div className="card-footer bg-white">
                                    <Link
                                        to="/land-revenue/create"
                                        state={{ selectedService: service }}
                                        className="btn btn-success w-100"
                                    >
                                        Apply for this Service
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="card mt-4">
                <div className="card-header bg-success text-white">
                    <h4 className="mb-0">How to Apply for Land Revenue Services</h4>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3 text-center mb-3">
                            <div className="rounded-circle bg-light p-3 d-inline-block mb-2">
                                <i className="fas fa-search fa-2x text-success"></i>
                            </div>
                            <h5>1. Choose Service</h5>
                            <p className="small">Browse and select the land revenue service you need</p>
                        </div>
                        <div className="col-md-3 text-center mb-3">
                            <div className="rounded-circle bg-light p-3 d-inline-block mb-2">
                                <i className="fas fa-file-alt fa-2x text-success"></i>
                            </div>
                            <h5>2. Fill Application</h5>
                            <p className="small">Complete the online application form with necessary details</p>
                        </div>
                        <div className="col-md-3 text-center mb-3">
                            <div className="rounded-circle bg-light p-3 d-inline-block mb-2">
                                <i className="fas fa-upload fa-2x text-success"></i>
                            </div>
                            <h5>3. Upload Documents</h5>
                            <p className="small">Attach required supporting documents</p>
                        </div>
                        <div className="col-md-3 text-center mb-3">
                            <div className="rounded-circle bg-light p-3 d-inline-block mb-2">
                                <i className="fas fa-check-circle fa-2x text-success"></i>
                            </div>
                            <h5>4. Track Application</h5>
                            <p className="small">Monitor the status of your application online</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandRevenueServiceList;