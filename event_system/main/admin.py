from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Decoration, Booking, ConcertBooking, FestivalBooking, Tournament, SportsRegistration, Fixture

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'sport', 'date', 'registration_deadline', 'status')
    list_filter = ('sport', 'status', 'date')
    search_fields = ('name', 'sport')

@admin.register(SportsRegistration)
class SportsRegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tournament', 'registration_type', 'status', 'registration_date')
    list_filter = ('status', 'registration_type', 'tournament')
    search_fields = ('user__username', 'team_name', 'player_name')

@admin.register(Fixture)
class FixtureAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'round_number', 'player1', 'player2', 'winner', 'status')
    list_filter = ('tournament', 'status', 'round_number')

@admin.register(FestivalBooking)
class FestivalBookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'festival_name', 'pass_type', 'quantity', 'total_price', 'status', 'booking_date')
    list_filter = ('festival_name', 'status', 'booking_date')
    search_fields = ('user__username', 'festival_name')
    readonly_fields = ('booking_date',)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )

@admin.register(Decoration)
class DecorationAdmin(admin.ModelAdmin):
    list_display = ('name', 'price')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'event_type', 'event_date', 'total_cost', 'payment_status', 'status')
    list_filter = ('status', 'payment_status', 'event_type', 'event_date')
    search_fields = ('user__username', 'event_type', 'address')
    readonly_fields = ('total_cost', 'advance_amount', 'balance_amount')
    
    fieldsets = (
        ('Event Details', {
            'fields': ('user', 'event_type', 'event_date', 'guests', 'budget', 'address', 'status')
        }),
        ('Selections', {
            'fields': ('catering_package', 'catering_price', 'selected_decoration', 'decoration_name', 'decoration_price', 'performer_name', 'performer_price')
        }),
        ('Financials', {
            'fields': ('total_cost', 'advance_amount', 'balance_amount', 'payment_status')
        }),
    )

@admin.register(ConcertBooking)
class ConcertBookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'concert_title', 'artist_name', 'ticket_type', 'quantity', 'total_price', 'payment_status', 'booking_date')
    list_filter = ('concert_title', 'ticket_type', 'payment_status')
    search_fields = ('user__username', 'concert_title', 'artist_name')
    readonly_fields = ('booking_date',)
