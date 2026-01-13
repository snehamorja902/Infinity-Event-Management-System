from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Decoration, Booking, ConcertBooking, FestivalBooking, Tournament, SportsRegistration, JobApplication, Fixture, Blog, Concert, Festival
from .serializers import (
    UserSerializer, DecorationSerializer, BookingSerializer, 
    ConcertBookingSerializer, FestivalBookingSerializer, 
    TournamentSerializer, SportsRegistrationSerializer, JobApplicationSerializer, FixtureSerializer, BlogSerializer,
    ConcertSerializer, FestivalSerializer
)

class ConcertListCreateView(generics.ListCreateAPIView):
    queryset = Concert.objects.all()
    serializer_class = ConcertSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Concert.objects.filter(is_deleted=False).order_by('-id')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class ConcertDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Concert.objects.all()
    serializer_class = ConcertSerializer
    permission_classes = [permissions.AllowAny]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class FestivalListCreateView(generics.ListCreateAPIView):
    queryset = Festival.objects.all()
    serializer_class = FestivalSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Festival.objects.filter(is_deleted=False).order_by('-id')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class FestivalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Festival.objects.all()
    serializer_class = FestivalSerializer
    permission_classes = [permissions.AllowAny]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class CustomInquiryView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        message = request.data.get('message')
        event_type = request.data.get('event_type', 'General Wedding/Event')

        if not name or not email or not message:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Email to Admin
        admin_subject = f"✨ NEW CUSTOM INQUIRY: {event_type}"
        admin_message = (
            f"You have a new customization request!\n\n"
            f"Client: {name}\n"
            f"Email: {email}\n"
            f"Phone: {phone}\n"
            f"Event Interest: {event_type}\n\n"
            f"Message:\n{message}\n\n"
            f"--- Infinity Hospitality Admin ---"
        )
        
        # 2. Confirmation to User
        user_subject = "We received your customization request!"
        user_message = (
            f"Hello {name},\n\n"
            f"Thank you for reaching out to Infinity Hospitality. We have received your request for a customized {event_type} plan.\n\n"
            f"One of our expert planners will review your requirements and contact you within 24 hours.\n\n"
            f"Best Regards,\n"
            f"Infinity Hospitality Team"
        )

        sender_email = settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else 'admin@example.com'
        
        try:
            # Notify Admin
            send_mail(admin_subject, admin_message, sender_email, [sender_email], fail_silently=True)
            # Notify User
            send_mail(user_subject, user_message, sender_email, [email], fail_silently=True)
            
            return Response({"message": "Inquiry sent successfully. Our team will contact you soon!"}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Inquiry Email Error: {e}")
            return Response({"error": "Failed to send email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class DecorationListCreateView(generics.ListCreateAPIView):
    queryset = Decoration.objects.all()
    serializer_class = DecorationSerializer
    permission_classes = [permissions.AllowAny]

class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Auto-Reject Pending bookings older than 2 days
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=2)
        # Update records that are still Pending and were created more than 2 days ago
        Booking.objects.filter(status='Pending', booking_date__lt=cutoff).update(status='Rejected')

        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                # Recycle bin: Either soft-deleted OR status is 'Cancelled'
                from django.db.models import Q
                return Booking.objects.filter(Q(is_deleted=True) | Q(status='Cancelled')).order_by('-id')
            # Main View: Not deleted AND not cancelled
            return Booking.objects.filter(is_deleted=False).exclude(status='Cancelled').order_by('-id')
            
        return Booking.objects.filter(user=user, is_deleted=False).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

class AdminBookingStatusUpdateView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        # Bulletproof Admin Check
        user = request.user
        role_str = (getattr(user, 'role', '') or '').upper()
        is_admin = role_str == 'ADMIN' or user.is_staff or user.is_superuser
        
        if not is_admin:
            print(f"!!! ACCESS DENIED !!! User: {user.username}, Role: {role_str}, Staff: {user.is_staff}, Super: {user.is_superuser}")
            return Response({"error": "Unauthorized. Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        booking = self.get_object()
        new_status = request.data.get('status', '').strip().capitalize()
        
        if new_status in ['Approved', 'Rejected']:
            booking.status = new_status
            booking.save()
            
            # --- EMAIL NOTIFICATION ---
            try:
                subject = f"Booking Update: {new_status}"
                message = f"Dear {booking.user.username},\n\nYour booking for {booking.event_type} on {booking.event_date} has been {new_status}.\n\nThank you for choosing us!"
                recipient_list = [booking.user.email]
                sender_email = settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else 'admin@example.com'
                send_mail(subject, message, sender_email, recipient_list, fail_silently=True)
            except Exception as e:
                print(f"Email failed: {e}")

            return Response(self.get_serializer(booking).data)
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

class AdminRestoreItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if not is_admin:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        item_type = request.data.get('type')
        model_map = {
            'wedding': Booking,
            'concert': ConcertBooking,
            'festival': FestivalBooking,
            'tournament': Tournament,
            'sports-registration': SportsRegistration,
            'job': JobApplication,
            'blog': Blog,
            'concert-master': Concert,
            'festival-master': Festival
        }

        model = model_map.get(item_type)
        if not model:
            return Response({"error": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = model.objects.get(pk=pk)
            item.is_deleted = False
            # Special case for weddings: move back to Pending if it was Cancelled
            if item_type == 'wedding' and item.status == 'Cancelled':
                item.status = 'Pending'
            item.save()
            return Response({"message": "Item restored successfully"})
        except model.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class ConcertBookingCreateView(generics.CreateAPIView):
    serializer_class = ConcertBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ConcertBookingListView(generics.ListAPIView):
    serializer_class = ConcertBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                return ConcertBooking.objects.filter(is_deleted=True).order_by('-id')
            return ConcertBooking.objects.filter(is_deleted=False).order_by('-id')
        return ConcertBooking.objects.filter(user=user, is_deleted=False).order_by('-id')

class ConcertBookingCancelView(generics.UpdateAPIView):
    queryset = ConcertBooking.objects.all()
    serializer_class = ConcertBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        booking = self.get_object()
        
        # Security check
        if booking.user != request.user and request.user.role != 'ADMIN':
             return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # Time check: 24h limit (only for users, admins can always cancel)
        if request.user.role == 'USER':
            time_diff = timezone.now() - booking.booking_date
            if time_diff > timedelta(hours=24):
                return Response({"error": "Cancellation period (24 hours) has expired."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'Cancelled'
        
        # Calculate Penalty (20% penalty + 99 transaction tax)
        original_price = float(booking.total_price)
        penalty_rate = 0.20
        transaction_tax = 99.0
        
        cancellation_fee = (original_price * penalty_rate) + transaction_tax
        refund_amount = original_price - cancellation_fee
        
        booking.cancellation_fee = cancellation_fee
        booking.refund_amount = max(0, refund_amount) # Ensure not negative
        booking.save()
        
        return Response({
            "message": f"Ticket cancelled. Deductions: ₹{cancellation_fee:.2f} (20% Fee + Tax).",
            "refund_amount": booking.refund_amount,
            "status": "Cancelled"
        })

class BookingCancelView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        booking = self.get_object()
        
        # Security check
        if booking.user != request.user and request.user.role != 'ADMIN':
             return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # Time check: 24h limit (only for users, admins can always cancel)
        if request.user.role == 'USER':
            if not booking.booking_date:
                # If booking_date is null (legacy records), we can't check
                pass
            else:
                time_diff = timezone.now() - booking.booking_date
                if time_diff > timedelta(hours=24):
                    return Response({"error": "Cancellation period (24 hours) has expired."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'Cancelled'
        
        # Calculate Penalty (20% penalty + 99 transaction tax)
        # We use total_cost for weddings
        original_price = float(booking.total_cost)
        penalty_rate = 0.20
        transaction_tax = 99.0
        
        cancellation_fee = (original_price * penalty_rate) + transaction_tax
        refund_amount = original_price - cancellation_fee
        
        booking.cancellation_fee = cancellation_fee
        booking.refund_amount = max(0, refund_amount)
        booking.save()
        
        return Response({
            "message": f"Wedding booking cancelled. Deductions: ₹{cancellation_fee:.2f} (20% Fee + Tax).",
            "refund_amount": booking.refund_amount,
            "status": "Cancelled"
        })

class FestivalBookingCreateView(generics.CreateAPIView):
    queryset = FestivalBooking.objects.all()
    serializer_class = FestivalBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FestivalBookingListView(generics.ListAPIView):
    serializer_class = FestivalBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                return FestivalBooking.objects.filter(is_deleted=True).order_by('-id')
            return FestivalBooking.objects.filter(is_deleted=False).order_by('-id')
        return FestivalBooking.objects.filter(user=user, is_deleted=False).order_by('-id')

class FestivalBookingCancelView(generics.UpdateAPIView):
    queryset = FestivalBooking.objects.all()
    serializer_class = FestivalBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        booking = self.get_object()
        
        is_admin = (getattr(request.user, 'role', '') or '').upper() == 'ADMIN' or request.user.is_staff or request.user.is_superuser
        if booking.user != request.user and not is_admin:
             return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == 'USER':
            time_diff = timezone.now() - booking.booking_date
            if time_diff > timedelta(hours=24):
                return Response({"error": "Cancellation period (24 hours) has expired."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'Cancelled'
        
        original_price = float(booking.total_price)
        penalty_rate = 0.20
        transaction_tax = 99.0
        
        cancellation_fee = (original_price * penalty_rate) + transaction_tax
        refund_amount = original_price - cancellation_fee
        
        booking.cancellation_fee = cancellation_fee
        booking.refund_amount = max(0, refund_amount)
        booking.save()
        
        return Response({
            "message": f"Festival pass cancelled. Deductions: ₹{cancellation_fee:.2f} (20% Fee + Tax).",
            "refund_amount": booking.refund_amount,
            "status": "Cancelled"
        })

class TournamentListCreateView(generics.ListCreateAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser

        if is_admin and show_deleted:
            return Tournament.objects.filter(is_deleted=True).order_by('-id')
        
        return Tournament.objects.filter(is_deleted=False).order_by('-id')

class SportsRegistrationListCreateView(generics.ListCreateAPIView):
    serializer_class = SportsRegistrationSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        personal_only = self.request.query_params.get('personal', '').lower() == 'true'
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        # If not logged in, only show winners
        if user.is_anonymous:
            return SportsRegistration.objects.filter(status='Winner', is_deleted=False).order_by('-id')

        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        
        if is_admin and not personal_only:
            if show_deleted:
                return SportsRegistration.objects.filter(is_deleted=True).order_by('-id')
            return SportsRegistration.objects.filter(is_deleted=False).order_by('-id')
        return SportsRegistration.objects.filter(user=user, is_deleted=False).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SportsRegistrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SportsRegistration.objects.all()
    serializer_class = SportsRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return SportsRegistration.objects.all()
        return SportsRegistration.objects.filter(user=user, is_deleted=False)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

# Detail views for DELETE operations
class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

class ConcertBookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ConcertBooking.objects.all()
    serializer_class = ConcertBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return ConcertBooking.objects.all()
        return ConcertBooking.objects.filter(user=user, is_deleted=False)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class FestivalBookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FestivalBooking.objects.all()
    serializer_class = FestivalBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return FestivalBooking.objects.all()
        return FestivalBooking.objects.filter(user=user, is_deleted=False)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class TournamentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return Tournament.objects.all()
        return Tournament.objects.none()

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class JobApplicationCreateView(generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.AllowAny]


# --- EMPLOYMENT MANAGEMENT VIEWS ---

class JobApplicationListView(generics.ListAPIView):
    queryset = JobApplication.objects.all().order_by('-applied_at')
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                return JobApplication.objects.filter(is_deleted=True).order_by('-applied_at')
            return JobApplication.objects.filter(is_deleted=False).order_by('-applied_at')
        return JobApplication.objects.none()

class JobApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
         user = self.request.user
         if (getattr(user, 'role', '') or '').upper() == 'ADMIN':
             return JobApplication.objects.all()
         return JobApplication.objects.none()

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class FixtureListCreateView(generics.ListCreateAPIView):
    queryset = Fixture.objects.all()
    serializer_class = FixtureSerializer
    permission_classes = [permissions.AllowAny] # Or stricter if needed

class FixtureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Fixture.objects.all()
    serializer_class = FixtureSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- SIGNALS FOR NOTIFICATIONS ---
from django.db.models.signals import post_save
from django.dispatch import receiver

# 1. Notify Applicant when they apply
@receiver(post_save, sender=JobApplication)
def notify_job_applicant(sender, instance, created, **kwargs):
    if created:
        # Email to Applicant
        try:
            subject = f"Application Received: {instance.position}"
            message = f"Dear {instance.full_name},\n\nWe have received your application for the position of {instance.position}.\nOur team will review your portfolio and get back to you shortly.\n\nBest Regards,\nInfinity Hospitality"
            from_email = settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else 'careers@example.com'
            send_mail(subject, message, from_email, [instance.email], fail_silently=True)
            print(f"Sent Career Application Email to {instance.email}")
        except Exception as e:
            print(f"Failed to send career email: {e}")

# 2. Work Allocation Notification
# "when any event occur and in that event if there are they work then they get an email"
@receiver(post_save, sender=Booking)
def notify_staff_on_new_booking(sender, instance, created, **kwargs):
    if created or instance.status == 'Approved': # Logic: Notify when booking is confirmed
        print(f"Checking for staff notifications for Booking #{instance.id} ({instance.event_type})")
        
        roles_needed = []
        
        # Determine roles based on booking details
        if instance.catering_package:
            roles_needed.append('Catering Supervisor')
        
        if instance.selected_decoration or instance.decoration_name:
            roles_needed.append('Lead Decor Stylist')
            
        # Generic role for all events
        roles_needed.append('Event Coordinator')

        if not roles_needed:
            return

        # Find Applicants/Staff with these roles
        # Note: In a real system, we'd filter by status='Hired'. 
        # Here we just look for anyone who applied to showcase the feature as requested.
        potential_staff = JobApplication.objects.filter(position__in=roles_needed)
        
        for staff in potential_staff:
            try:
                subject = f"New Work Opportunity: {instance.event_type}"
                message = f"Hello {staff.full_name},\n\nA new event has been booked that requires your expertise!\n\nEvent: {instance.event_type}\nDate: {instance.event_date}\nLocation: {instance.address or 'TBD'}\n\nRole Required: {staff.position}\n\nPlease contact the admin team for assignment details.\n\nInfinity Hospitality"
                from_email = settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else 'work@example.com'
                send_mail(subject, message, from_email, [staff.email], fail_silently=True)
                print(f"Sent Work Notification to {staff.position}: {staff.email}")
            except Exception as e:
                print(f"Failed to notify staff: {e}")

@receiver(post_save, sender=Fixture)
def update_loser_status(sender, instance, **kwargs):
    # Check if we have a winner
    if instance.winner:
        print(f"Fixture {instance} has a winner: {instance.winner}")
        
        # Determine loser
        loser = None
        if instance.player1 and instance.player1 != instance.winner:
            loser = instance.player1
        elif instance.player2 and instance.player2 != instance.winner:
            loser = instance.player2
            
        if loser:
            print(f"Eliminating loser: {loser}")
            loser.status = 'Eliminated'
            loser.save()

        # Check if only one participant remains in the tournament (The Winner)
        remaining_active = SportsRegistration.objects.filter(
            tournament=instance.tournament,
            is_deleted=False
        ).exclude(status='Eliminated').count()

        if remaining_active == 1:
            print(f"ONLY ONE REMAINING. Closing tournament {instance.tournament}.")
            
            # Close Tournament
            instance.tournament.status = 'Completed'
            instance.tournament.save()
            
            # The remaining one is the winner
            final_winner = SportsRegistration.objects.filter(
                tournament=instance.tournament,
                is_deleted=False
            ).exclude(status='Eliminated').first()

            if final_winner:
                final_winner.status = 'Winner'  
                final_winner.save()

                # --- NOTIFICATIONS ---
                winner_user = final_winner.user
                prize_amount = float(final_winner.price or 0) * 1.6
                
                try:
                    subject = f"🏆 CHAMPION DECLARED: {instance.tournament.name}"
                    message = (
                        f"Congratulations {winner_user.username}!\n\n"
                        f"You are the champion of '{instance.tournament.name}'.\n\n"
                        f"TOTAL PRIZE CREDIT: ₹{prize_amount:,.2f}\n\n"
                        f"The amount will reflect in your account within 12-24 hours.\n\n"
                        f"Infinity Sports Management"
                    )
                    from_email = settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else 'sports@infinity.com'
                    send_mail(subject, message, from_email, [winner_user.email], fail_silently=True)
                except Exception as e:
                    print(f"Notification Error: {e}")

class BlogListCreateView(generics.ListCreateAPIView):
    serializer_class = BlogSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                return Blog.objects.filter(is_deleted=True).order_by('-created_at')
            return Blog.objects.filter(is_deleted=False).order_by('-created_at')
        return Blog.objects.filter(is_published=True, is_deleted=False).order_by('-created_at')

class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return Blog.objects.all()
        return Blog.objects.filter(is_published=True, is_deleted=False)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()
