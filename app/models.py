from datetime import datetime
from app import db

class Guest(db.Model):
    __tablename__ = 'guests'
    guest_id = db.Column(db.Integer, primary_key=True)
    gname = db.Column(db.String(100), nullable=False)
    gemail = db.Column(db.String(100), nullable=False)
    gpassword = db.Column(db.String(100), nullable=False)
    gphone = db.Column(db.String(10), nullable=True)
    gusername = db.Column(db.String(100), nullable=False)
    glocation = db.Column(db.String(100), nullable=False)

    bookings = db.relationship('Booking', back_populates='guest')
    payments = db.relationship('Payment', back_populates='guest')
    seats = db.relationship('Seat', back_populates='guest')
    reviews = db.relationship('Review', back_populates='guest')


class Organizer(db.Model):
    __tablename__ = 'organizers'
    organizer_id = db.Column(db.Integer, primary_key=True)
    oname = db.Column(db.String(100), nullable=False)
    oemail = db.Column(db.String(100), nullable=False)
    opassword = db.Column(db.String(100), nullable=False)
    ophone = db.Column(db.String(15), nullable=False)
    odescription = db.Column(db.Text, nullable=True)
    ousername = db.Column(db.String(100), nullable=False)

    events = db.relationship('Event', back_populates='organizer')


class Event(db.Model):
    __tablename__ = 'events'
    event_id = db.Column(db.Integer, primary_key=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey('organizers.organizer_id'), nullable=False)
    event_name = db.Column(db.String(100), nullable=False)
    event_thumbnail = db.Column(db.String(500), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    genre = db.Column(db.String(150), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    venue = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(15), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    event_description = db.Column(db.Text, nullable=False)

    organizer = db.relationship('Organizer', back_populates='events')
    bookings = db.relationship('Booking', back_populates='event')
    seats = db.relationship('Seat', back_populates='event')
    reviews = db.relationship('Review', back_populates='event')


class Booking(db.Model):
    __tablename__ = 'bookings'
    booking_id = db.Column(db.Integer, primary_key=True)
    guest_id = db.Column(db.Integer, db.ForeignKey('guests.guest_id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)
    number_of_tickets = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    guest = db.relationship('Guest', back_populates='bookings')
    event = db.relationship('Event', back_populates='bookings')
    payment = db.relationship('Payment', uselist=False, back_populates='booking')
    seats = db.relationship('Seat', back_populates='booking')


class Payment(db.Model):
    __tablename__ = 'payments'
    payment_id = db.Column(db.Integer, primary_key=True)
    guest_id = db.Column(db.Integer, db.ForeignKey('guests.guest_id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.booking_id'), nullable=False)
    stripe_payment_id = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False)

    guest = db.relationship('Guest', back_populates='payments')
    booking = db.relationship('Booking', back_populates='payment')


class Seat(db.Model):
    __tablename__ = 'seats'
    seat_id = db.Column(db.Integer, primary_key=True)
    guest_id = db.Column(db.Integer, db.ForeignKey('guests.guest_id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.booking_id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)
    seat_number = db.Column(db.String(10), nullable=False)

    guest = db.relationship('Guest', back_populates='seats')
    booking = db.relationship('Booking', back_populates='seats')
    event = db.relationship('Event', back_populates='seats')


class Review(db.Model):
    __tablename__ = 'reviews'
    review_id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)
    guest_id = db.Column(db.Integer, db.ForeignKey('guests.guest_id'), nullable=False)
    rating = db.Column(db.SmallInteger, nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    review_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    event = db.relationship('Event', back_populates='reviews')
    guest = db.relationship('Guest', back_populates='reviews')


class GuestGenre(db.Model):
    __tablename__ = 'guest_genres'
    guest_username = db.Column(db.String(100), primary_key=True)
    event_id = db.Column(db.Integer, primary_key=True)
    genre = db.Column(db.String(150), nullable=False)

    def __repr__(self):
        return f'<GuestGenre guest_username={self.guest_username} event_id={self.event_id} genre={self.genre}>'