import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useState } from 'react';

interface ScheduleEventModalProps {
    show: boolean;
    onClose: () => void;
    onSchedule: (eventData: any) => void;
}

export function ScheduleEventModal({ show, onClose, onSchedule }: ScheduleEventModalProps) {
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        churchId: '',
        attendees: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSchedule(eventData);
        // Reset form
        setEventData({
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            churchId: '',
            attendees: [],
        });
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Schedule New Event</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Event Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={eventData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Church</Form.Label>
                                <Form.Select
                                    name="churchId"
                                    value={eventData.churchId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Church</option>
                                    <option value="1">Main Church</option>
                                    <option value="2">Youth Church</option>
                                    <option value="3">Children Church</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date"
                                    value={eventData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="time"
                                    value={eventData.time}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            type="text"
                            name="location"
                            value={eventData.location}
                            onChange={handleChange}
                            placeholder="Event location"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={eventData.description}
                            onChange={handleChange}
                            placeholder="Event description"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Schedule Event
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
