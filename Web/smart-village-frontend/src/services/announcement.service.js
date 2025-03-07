import api from '../api';

const getAnnouncements = () => {
    return api.get('/Announcement');
};

const getAnnouncementById = (id) => {
    return api.get(`/Announcement/${id}`);
};

// Admin only functions
const createAnnouncement = (announcementData) => {
    return api.post('/Announcement', announcementData);
};

const updateAnnouncement = (id, announcementData) => {
    return api.put(`/Announcement/${id}`, announcementData);
};

const deleteAnnouncement = (id) => {
    return api.delete(`/Announcement/${id}`);
};

const AnnouncementService = {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
};

export default AnnouncementService;