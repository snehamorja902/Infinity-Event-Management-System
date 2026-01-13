from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('USER', 'USER'),
        ('ADMIN', 'ADMIN'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username

class Decoration(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField()
    description = models.TextField()

    def __str__(self):
        return self.name

class Booking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=100)
    event_date = models.DateField()
    guests = models.IntegerField()
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    address = models.TextField(blank=True, null=True)
    
    # Selection Details
    catering_package = models.CharField(max_length=150, blank=True, null=True)
    catering_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    selected_decoration = models.ForeignKey(Decoration, on_delete=models.SET_NULL, null=True, blank=True)
    decoration_name = models.CharField(max_length=150, blank=True, null=True) # Snapshot name
    decoration_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    performer_name = models.CharField(max_length=150, blank=True, null=True)
    performer_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Financials
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    advance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Tracking
    booking_date = models.DateTimeField(auto_now_add=True, null=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cancellation_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    PAYMENT_STATUS = (
        ('Pending', 'Pending'),
        ('Advance Paid', 'Advance Paid'),
        ('Fully Paid', 'Fully Paid'),
    )
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='Pending')
    
    wedding_details = models.JSONField(default=dict, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.event_type} ({self.status})"

class ConcertBooking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    concert_title = models.CharField(max_length=200)
    artist_name = models.CharField(max_length=200)
    event_date = models.CharField(max_length=100)
    ticket_type = models.CharField(max_length=100)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    booking_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, default='Paid')
    status = models.CharField(max_length=20, default='Confirmed') # Confirmed, Cancelled, Refunded
    is_deleted = models.BooleanField(default=False)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cancellation_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username} - {self.concert_title} ({self.quantity} x {self.ticket_type})"

class FestivalBooking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    festival_name = models.CharField(max_length=200)
    pass_type = models.CharField(max_length=100)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    booking_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Confirmed') # Confirmed, Cancelled
    is_deleted = models.BooleanField(default=False)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cancellation_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username} - {self.festival_name} ({self.quantity} x {self.pass_type})"

class Concert(models.Model):
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    artistBio = models.TextField()
    popularTracks = models.JSONField(default=list, blank=True)
    date = models.CharField(max_length=100) # String to match frontend for now
    time = models.CharField(max_length=50)
    venue = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    genre = models.CharField(max_length=100)
    bannerImage = models.TextField()
    thumbnail = models.TextField()
    description = models.TextField()
    highlights = models.JSONField(default=dict, blank=True)
    tickets = models.JSONField(default=list, blank=True)
    schedule = models.JSONField(default=list, blank=True)
    rules = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    sponsors = models.JSONField(default=list, blank=True)
    is_deleted = models.BooleanField(default=False)
    booking_deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Festival(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    venue = models.CharField(max_length=200)
    startDate = models.CharField(max_length=100)
    endDate = models.CharField(max_length=100)
    theme = models.CharField(max_length=200)
    image = models.TextField()
    color = models.CharField(max_length=100, default='rgba(0,0,0,0.9)')
    booking_deadline = models.DateField(null=True, blank=True)
    secondary = models.CharField(max_length=50, default='#FFD700')
    highlights = models.JSONField(default=list, blank=True)
    about = models.TextField()
    attractions = models.JSONField(default=list, blank=True)
    passes = models.JSONField(default=list, blank=True)
    schedule = models.JSONField(default=list, blank=True)
    rules = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Tournament(models.Model):
    name = models.CharField(max_length=200)
    sport = models.CharField(max_length=100)
    category = models.CharField(max_length=50, default='Team') # Team or Solo
    date = models.DateField()
    registration_deadline = models.DateField(null=True, blank=True)
    image = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Registration Open') 
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.sport})"

class SportsRegistration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    registration_type = models.CharField(max_length=50) # Team, Individual
    team_name = models.CharField(max_length=200, blank=True, null=True)
    captain_name = models.CharField(max_length=200, blank=True, null=True)
    player_name = models.CharField(max_length=200, blank=True, null=True) # for individual
    players = models.JSONField(default=list, blank=True)
    substitutes = models.JSONField(default=list, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    winning_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    registration_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Confirmed')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.tournament.name} ({self.registration_type})"

# --- New Model for Job Applications ---
class JobApplication(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    portfolio = models.URLField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    position = models.CharField(max_length=100) # e.g. Lead Decor Stylist
    status = models.CharField(max_length=20, default='Applied') # Applied, Interviewing, Hired
    is_deleted = models.BooleanField(default=False)
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.position}"

class Fixture(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='fixtures')
    round_number = models.CharField(max_length=50, default='1')
    player1 = models.ForeignKey(SportsRegistration, on_delete=models.SET_NULL, related_name='fixtures_as_p1', null=True, blank=True)
    player2 = models.ForeignKey(SportsRegistration, on_delete=models.SET_NULL, related_name='fixtures_as_p2', null=True, blank=True)
    winner = models.ForeignKey(SportsRegistration, on_delete=models.SET_NULL, related_name='won_fixtures', null=True, blank=True)
    match_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Scheduled') # Scheduled, Completed

    def __str__(self):
        p1 = self.player1.team_name if self.player1 and self.player1.team_name else (self.player1.player_name if self.player1 else "TBD")
        p2 = self.player2.team_name if self.player2 and self.player2.team_name else (self.player2.player_name if self.player2 else "TBD")
        return f"{self.tournament.name} - R{self.round_number}: {p1} vs {p2}"

class Blog(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.URLField(blank=True, null=True)
    author = models.CharField(max_length=100, default='Admin')
    date = models.DateField(auto_now_add=True)
    is_published = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
