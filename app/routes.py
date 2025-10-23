from flask import render_template, request, redirect, url_for, flash, jsonify, session, current_app
from app import db
from app.models import *
import logging
import random
from datetime import datetime
import stripe
from app.config import Config
from flask import send_from_directory

from flask import jsonify, url_for
import os

# Setting up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

isLoggedIn = False
UserType = ""
currentUser = None
currentUserLocation = None  # Variable to store the location of the user
stripe.api_key = Config.STRIPE_API_KEY

def generate_seat_labels(rows, cols):
    labels = []
    for i in range(rows):
        row_labels = []
        for j in range(1, cols + 1):
            row_labels.append(f"{chr(65 + i)}{j}")
        labels.append(row_labels)
    return labels

def serialize_events(events):
        return [
            {
                "event_id": e.event_id,
                "organizer_id": e.organizer_id,
                "event_name": e.event_name,
                "event_thumbnail": e.event_thumbnail,
                "event_type": e.event_type,
                "genre": e.genre,
                "date": e.date.strftime('%Y-%m-%d'),
                "time": e.time.strftime('%H:%M:%S'),
                "venue": e.venue,
                "city": e.city,
                "price": float(e.price),
                "available_seats": e.available_seats,
                "event_description": e.event_description
            }
            for e in events
        ]


def get_events_by_type(event_type=None, limit=20):
    query = Event.query
    if event_type:
        query = query.filter_by(event_type=event_type)
    return query.order_by(db.func.random()).limit(limit).all()

def init_routes(app):

    @app.route('/')
    def index():
        return render_template('home.html', isLoggedIn=isLoggedIn)

    @app.route('/signup_guest')
    def signup_guest():
        return render_template('signup_guest.html', isLoggedIn=isLoggedIn)

    @app.route('/signup_select')
    def signup_select():
        return render_template('signup_select.html', isLoggedIn=isLoggedIn)
    
    @app.route('/signup_organizer')
    def signup_organizer():
        return render_template('signup_organizer.html', isLoggedIn=isLoggedIn)

    @app.route('/shows')
    def shows():
        events = Event.query.filter_by(event_type='show').all()
        return render_template('shows.html', isLoggedIn=isLoggedIn, events=events)
    
    @app.route('/events')
    def events():
        events = Event.query.filter_by(event_type='event').all()
        return render_template('events.html', isLoggedIn=isLoggedIn, events=events)



    @app.route('/movies')
    def movies():
        events = Event.query.filter_by(event_type='movie').all()
        return render_template('movies.html', isLoggedIn=isLoggedIn, events=events)


    @app.route('/api/events')
    def api_events():
        movies = get_events_by_type('movie', 4)
        shows = get_events_by_type('show', 4)
        events = get_events_by_type('event', 4)

        events_list = {
            "movies": serialize_events(movies),
            "shows": serialize_events(shows),
            "events": serialize_events(events)
        }

        return jsonify({"success": True, "events": events_list})


    @app.route('/api/movies')
    def api_movies():
        movies = get_events_by_type('movie', 20)
        return jsonify({"success": True, "movies": serialize_events(movies)})


    @app.route('/api/shows')
    def api_shows():
        shows = get_events_by_type('show', 20)
        return jsonify({"success": True, "shows": serialize_events(shows)})
    
    @app.route('/view_description')
    def view_description():
        event_id = request.args.get('event_id')
        event = Event.query.get(event_id)
        return render_template('view_description.html', event=event, isLoggedIn=isLoggedIn)

    

    @app.route('/select_seats', methods=['GET', 'POST'])
    def select_seats():

        if not isLoggedIn:
            return redirect(url_for('login'))
        
        if UserType == "Organizer":
            logout()
            return redirect(url_for('login'))

        if request.method == 'POST':
            selected_seats = request.form.getlist('seats')
            event_id = request.form.get('event_id')
            return redirect(url_for('booking_confirmation', seats=','.join(selected_seats), event_id=event_id))

        event_id = request.args.get('event_id')
        if not event_id:
            logger.error('Event ID is missing in the URL.')
            return redirect(url_for('home'))

        booked_seat_numbers = db.session.query(Seat.seat_number).filter(Seat.event_id == event_id).all()
        booked_seat_numbers = [seat[0] for seat in booked_seat_numbers]
        logger.info('Fetched Booked Seat Numbers: %s', booked_seat_numbers)

        guest_id = session.get('guest_id')
        if guest_id is None:
            logger.error('Guest ID is not available in the session.')
            return redirect(url_for('login'))

        seat_labels = generate_seat_labels(10, 20)
        selected_seats = []

        return render_template('seat_selection.html', isLoggedIn=True, event_id=event_id, guest_id=guest_id, booked_seat_numbers=booked_seat_numbers, seat_labels=seat_labels, selected_seats=selected_seats)


    @app.route('/profile')
    def user_profile():
        if not isLoggedIn:
            return redirect(url_for('login'))

        if UserType == "guest":
            return render_template('profile_guest.html')
        elif UserType == "organizer":
            return render_template('profile_organizer.html', currentUser=session.get('currentUser'))
        else:
            return redirect(url_for('login'))

    @app.route('/booking_confirmation')
    def booking_confirmation():
        if not isLoggedIn:
            return redirect(url_for('login'))
        
        seats = request.args.get('seats', '')
        seat_list = seats.split(',') if seats else []
        event_id = request.args.get('event_id')
        event = Event.query.get(event_id)
        price_per_seat = event.price if event else 0
        total_amount = price_per_seat * len(seat_list)
        return render_template('booking_confirmation.html', isLoggedIn=True, seats=seat_list, price_per_seat=price_per_seat, total_amount=total_amount)

    @app.route('/submit_signup_guest', methods=['POST'])
    def submit_signup_guest():
        gname = request.form.get('gname')
        gemail = request.form.get('gemail')
        gpassword = request.form.get('gpassword')
        gusername = request.form.get('gusername')
        gphone = request.form.get('gphone')
        glocation = request.form.get('glocation')

        new_guest = Guest(gname=gname, gemail=gemail, gpassword=gpassword, gusername=gusername, gphone=gphone)
        db.session.add(new_guest)
        db.session.commit()

        flash('Sign up successful! Please log in.', 'success')
        return redirect(url_for('login'))

    @app.route('/submit_signup_organizer', methods=['POST'])
    def submit_signup_organizer():
        oname = request.form.get('oname')
        oemail = request.form.get('oemail')
        opassword = request.form.get('opassword')
        ousername = request.form.get('ousername')
        ophone = request.form.get('ophone')
        odescription = request.form.get('odescription')

        new_organizer = Organizer(oname=oname, oemail=oemail, opassword=opassword, ousername=ousername, ophone=ophone, odescription=odescription)
        db.session.add(new_organizer)
        db.session.commit()

        flash('Sign up successful! Please log in.', 'success')
        return redirect(url_for('login'))

    @app.route('/submit_login', methods=['POST'])
    def submit_login():
        global isLoggedIn, UserType, currentUser, currentUserLocation

        username = request.form.get('username')
        password = request.form.get('password')
        user_type = request.form.get('user_type')

        logging.debug(f"Login attempt with username: {username}, user_type: {user_type}")

        if user_type == "Guest":
            user = Guest.query.filter_by(gusername=username, gpassword=password).first()
            logging.debug(f"Guest user found: {user}")
            if user:
                UserType = "guest"
                currentUser = user.gusername
                session['guest_id'] = user.guest_id
        elif user_type == "Organizer":
            user = Organizer.query.filter_by(ousername=username, opassword=password).first()
            logging.debug(f"Organizer user found: {user}")
            if user:
                UserType = "organizer"
                currentUser = user.ousername
                session['organizer_id'] = user.organizer_id
        else:
            return jsonify({"success": False})

        if user:
            isLoggedIn = True
            return jsonify({"success": True})
        else:
            return jsonify({"success": False})

    @app.route('/login')
    def login():
        return render_template('login.html')

    @app.route('/get_profile')
    def get_profile():
        global currentUser
        if UserType == "guest":
            user = Guest.query.filter_by(gusername=currentUser).first()
        elif UserType == "organizer":
            user = Organizer.query.filter_by(ousername=currentUser).first()
        else:
            return jsonify({"success": False})

        if user:
            profile = {
                "name": user.gname if UserType == "guest" else user.oname,
                "guest_id": user.guest_id if UserType == "guest" else None,
                "organizer_id": user.organizer_id if UserType == "organizer" else None,
                "email": user.gemail if UserType == "guest" else user.oemail,
                "phone": user.gphone if UserType == "guest" else user.ophone,
                "description": user.odescription if UserType == "organizer" else None,
                "location": user.glocation if UserType == "guest" else None
            }
            return jsonify({"success": True, "profile": profile})
        else:
            return jsonify({"success": False})


    @app.route('/logout', methods=['POST'])
    def logout():
        global isLoggedIn, UserType, currentUser, currentUserLocation
        isLoggedIn = False
        UserType = ""
        currentUser = None
        currentUserLocation = None  # Reset the location
        return jsonify({"success": True})

    @app.route('/api/event/<int:event_id>')
    def api_event(event_id):
        event = Event.query.get(event_id)
        if event:
            event_data = {
                "event_id": event.event_id,
                "organizer_id": event.organizer_id,
                "event_name": event.event_name,
                "event_thumbnail": event.event_thumbnail,
                "event_type": event.event_type,
                "genre": event.genre,
                "date": event.date.strftime('%Y-%m-%d'),
                "time": event.time.strftime('%H:%M:%S'),
                "venue": event.venue,
                "city": event.city,
                "price": float(event.price),
                "available_seats": event.available_seats,
                "event_description": event.event_description
            }
            return jsonify({"success": True, "event": event_data})
        else:
            return jsonify({"success": False, "status_message": "Event not found"})

    @app.route('/search_events', methods=['GET', 'POST'])
    def search_events():
        query = request.form.get('query') or request.args.get('query')
        if query:
            events = Event.query.filter(Event.event_name.ilike(f'%{query}%')).all()
            event_list = [
                {
                    "event_id": e.event_id,
                    "event_name": e.event_name,
                    "event_description": e.event_description,
                    "event_type": e.event_type,
                    "thumbnail": e.event_thumbnail
                } for e in events
            ]
            return jsonify(events=event_list)
        return jsonify(events=[])


    @app.route('/search_results')
    def search_results():
        query = request.args.get('query', '')
        return render_template('search_result.html', query=query, isLoggedIn=isLoggedIn)
    

    @app.route('/create-payment-intent', methods=['POST'])
    def create_payment_intent():
        data = request.json
        amount = data.get("amount")
        currency = data.get("currency")

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                payment_method_types=["card"],
            )
            return jsonify({"success": True, "client_secret": intent.client_secret})
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            return jsonify({"success": False, "error": str(e)})

    @app.route('/complete-booking', methods=['POST'])
    def complete_booking():
        data = request.json
        payment_intent_id = data.get("payment_intent_id")
        event_id = data.get("event_id")
        seats = data.get("seats")
        total_amount = data.get("total_amount")

        try:
            logger.debug(f"Seats array before processing: {seats}")

            cleaned_seats = [seat.strip("[]'\" ") for seat in seats]
            logger.debug(f"Seats array after cleaning: {cleaned_seats}")

            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if intent.status != 'succeeded':
                logger.error("Payment was not successful.")
                return jsonify({"success": False, "error": "Payment was not successful."})

            guest_id = session.get('guest_id')

            if not guest_id:
                return jsonify({"success": False, "error": "Guest not logged in."})

            booking = Booking(
                guest_id=guest_id,
                event_id=event_id,
                number_of_tickets=len(cleaned_seats),
                total_price=total_amount
            )
            db.session.add(booking)
            db.session.commit()

            payment = Payment(
                guest_id=guest_id,
                booking_id=booking.booking_id,
                stripe_payment_id=payment_intent_id,
                amount=intent.amount / 100,
                currency=intent.currency,
                status=intent.status
            )
            db.session.add(payment)

            event = Event.query.get(event_id)
            event.available_seats -= len(cleaned_seats)
            db.session.add(event)

            for seat in cleaned_seats:
                seat_record = Seat(
                    guest_id=guest_id,
                    booking_id=booking.booking_id,
                    event_id=event_id,
                    seat_number=seat
                )
                db.session.add(seat_record)

            db.session.commit()
            return jsonify({"success": True})
        except Exception as e:
            logger.error(f"Error completing booking: {str(e)}")
            db.session.rollback()
            return jsonify({"success": False, "error": str(e)})


    @app.route('/api/booking_summary', methods=['GET'])
    def booking_summary():
        if not isLoggedIn:
            return redirect(url_for('login'))

        payment_intent_id = request.args.get('payment_intent')
        if not payment_intent_id:
            logger.error("Missing payment_intent parameter")
            return jsonify({"success": False, "error": "Missing payment_intent parameter"}), 400

        try:
            payment = Payment.query.filter_by(stripe_payment_id=payment_intent_id).first()
            if not payment:
                logger.error("Payment not found")
                return jsonify({"success": False, "error": "Payment not found"}), 404

            booking = Booking.query.get(payment.booking_id)
            if not booking:
                logger.error("Booking not found")
                return jsonify({"success": False, "error": "Booking not found"}), 404

            event = Event.query.get(booking.event_id)
            if not event:
                logger.error("Event not found")
                return jsonify({"success": False, "error": "Event not found"}), 404

            seats = Seat.query.filter_by(booking_id=booking.booking_id).all()
            seat_numbers = [seat.seat_number for seat in seats]

            response_data = {
                "success": True,
                "event_name": event.event_name,
                "location": event.city,
                "date": event.date.strftime("%Y-%m-%d"),
                "time": event.time.strftime("%H:%M:%S"),
                "seats": seat_numbers,
                "txn_id": payment.stripe_payment_id,
                "booking_date": booking.date_created.strftime("%Y-%m-%d"),
                "booking_time": booking.date_created.strftime("%H:%M:%S")
            }
            return jsonify(response_data)
        except Exception as e:
            logger.error(f"Error fetching booking summary: {str(e)}", exc_info=True)
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route('/booking_summary')
    def booking_summary_page():
        payment_intent = request.args.get('payment_intent')
        payment_success = request.args.get('payment_intent') != 'failed'

        if payment_intent:
            payment = Payment.query.filter_by(stripe_payment_id=payment_intent).first()
            if payment and payment.status == 'succeeded':
                payment_success = True

        return render_template('booking_summary.html', isLoggedIn=isLoggedIn, payment_success=payment_success)
    
    
    @app.route('/api/booked_seats', methods=['GET'])
    def booked_seats():
        event_id = request.args.get('event_id')
        if not event_id:
            return jsonify({"success": False, "error": "Missing event_id parameter"}), 400

        try:
            booked_seat_numbers = db.session.query(Seat.seat_number).filter(Seat.event_id == event_id).all()
            booked_seat_numbers = [seat[0] for seat in booked_seat_numbers]  # Unpack tuples
            logger.info('API Fetched Booked Seat Numbers: %s', booked_seat_numbers)  # Debugging line
            return jsonify({"success": True, "booked_seats": booked_seat_numbers})
        except Exception as e:
            logger.error(f"Error fetching booked seats: {str(e)}", exc_info=True)
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route('/get_booking_history')
    def get_booking_history():
        guest_id = session.get('guest_id')
        if not guest_id:
            return jsonify({"success": False, "message": "User not logged in."}), 401

        try:
            bookings = Booking.query.filter_by(guest_id=guest_id).all()
            bookings_list = []

            for booking in bookings:
                event = Event.query.get(booking.event_id)
                bookings_list.append({
                    "type": "Event",
                    "name": event.event_name,
                    "date": booking.date_created.strftime("%Y-%m-%d"),
                    "location": event.venue
                })

            return jsonify({"success": True, "bookings": bookings_list})

        except Exception as e:
            logger.error(f"Error fetching booking history: {str(e)}")
            return jsonify({"success": False, "message": "Error fetching booking history."}), 500
        
    @app.route('/get_organizer_events')
    def get_organizer_events():
        if not isLoggedIn or UserType != "organizer":
            return jsonify({"success": False, "message": "User not logged in or not an organizer"})

        organizer_id = session.get('organizer_id')
        if not organizer_id:
            return jsonify({"success": False, "message": "Organizer ID not found in session"})

        events = Event.query.filter_by(organizer_id=organizer_id).all()
        events_list = [{"event_name": event.event_name, "event_id": event.event_id} for event in events]

        return jsonify({"success": True, "events": events_list})

    @app.route('/delete_event', methods=['POST'])
    def delete_event():
        if not isLoggedIn or UserType != "organizer":
            return jsonify({"success": False, "message": "User not logged in or not an organizer"})

        event_id = request.args.get('event_id')
        if not event_id:
            return jsonify({"success": False, "message": "Event ID not provided"})

        event = Event.query.get(event_id)
        if not event or event.organizer_id != session.get('organizer_id'):
            return jsonify({"success": False, "message": "Event not found or not authorized"})

        db.session.delete(event)
        db.session.commit()

        return jsonify({"success": True, "message": "Event deleted successfully"})
    
    @app.route('/update_event', methods=['GET'])
    def update_event_page():
        if not isLoggedIn or UserType != "organizer":
            return redirect(url_for('login'))

        event_id = request.args.get('event_id')
        event = Event.query.get(event_id)

        if not event:
            return "Event not found", 404

        return render_template('update_event.html', event=event)


    @app.route('/api/event_details')
    def api_event_details():
        if not isLoggedIn or UserType != "organizer":
            return jsonify({"success": False, "message": "User not logged in or not an organizer"})

        event_id = request.args.get('event_id')
        if not event_id:
            return jsonify({"success": False, "message": "Event ID is required"}), 400

        event = Event.query.get(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404

        event_details = {
            "event_name": event.event_name,
            "event_type": event.event_type,
            "date": event.date.strftime('%Y-%m-%d'),
            "time": event.time.strftime('%H:%M:%S'),
            "venue": event.venue,
            "city": event.city,
            "price": event.price,
            "genre": event.genre,
            "thumbnail": event.event_thumbnail,
        }

        return jsonify({"success": True, "event": event_details})

    @app.route('/update_event', methods=['POST'])
    def update_event():
        if not isLoggedIn or UserType != "organizer":
            return jsonify({"success": False, "message": "User not logged in or not an organizer"})

        data = request.json
        event_id = data.get('event_id')
        if not event_id:
            return jsonify({"success": False, "message": "Event ID is required"}), 400

        event = Event.query.get(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404

        if 'name' in data:
            event.event_name = data['name']
        if 'type' in data:
            event.event_type = data['type']
        if 'date' in data:
            event.date = data['date']
        if 'time' in data:
            event.time = data['time']
        if 'venue' in data:
            event.venue = data['venue']
        if 'city' in data:
            event.city = data['city']
        if 'pricePerSeat' in data:
            event.price = data['pricePerSeat']
        if 'genre' in data:
            event.genre = data['genre']
        if 'thumbnail' in data:
            event.event_thumbnail = data['thumbnail']

        db.session.commit()

        return jsonify({"success": True, "message": "Event updated successfully"})
    

    @app.route('/add_event')
    def add_event():
        if isLoggedIn and UserType == "organizer":
            organizer_id = session.get('organizer_id', None)
            return render_template('add_event.html', organizer_id=organizer_id)
        else:
            return redirect(url_for('login'))

    @app.route('/add_event', methods=['POST'])
    def handle_add_event():
        if not isLoggedIn or UserType != "organizer":
            return jsonify({"success": False, "message": "User not logged in or not an organizer"})

        data = request.get_json()
        if not all(key in data for key in ('organizer_id', 'event_name', 'event_type', 'event_date', 'event_time', 'venue', 'city', 'price_per_seat', 'available_seats', 'genre', 'thumbnail', 'event_description')):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        if not data['organizer_id']:
            return jsonify({"success": False, "message": "Organizer ID is required"}), 400

        new_event = Event(
            organizer_id=data['organizer_id'],
            event_name=data['event_name'],
            event_type=data['event_type'],
            date=data['event_date'],
            time=data['event_time'],
            venue=data['venue'],
            city=data['city'],
            price=data['price_per_seat'],
            available_seats=data['available_seats'],
            genre=data['genre'],
            event_thumbnail=data['thumbnail'],
            event_description=data['event_description']
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify({"success": True, "message": "Event added successfully"})
    