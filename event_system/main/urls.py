from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (RegisterView, DecorationListCreateView, 
                    BookingListCreateView, BookingDetailView, 
                    AdminBookingStatusUpdateView, ProfileView,
                    ConcertBookingCreateView, ConcertBookingListView, 
                    ConcertBookingCancelView, ConcertBookingDetailView,
                    FestivalBookingCreateView, FestivalBookingListView, 
                    FestivalBookingCancelView, FestivalBookingDetailView,
                    BookingCancelView, TournamentListCreateView,
                    TournamentDetailView, SportsRegistrationListCreateView, SportsRegistrationDetailView,
    JobApplicationCreateView, JobApplicationListView, JobApplicationDetailView,
    FixtureListCreateView, FixtureDetailView, BlogListCreateView, BlogDetailView, CustomInquiryView, AdminRestoreItemView,
    ConcertListCreateView, ConcertDetailView, FestivalListCreateView, FestivalDetailView) # Added Concert/Festival views

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Decorations
    path('decorations/', DecorationListCreateView.as_view(), name='decoration-list'),

    # Events (Master Data)
    path('concerts/', ConcertListCreateView.as_view(), name='concert-list'),
    path('concerts/<int:pk>/', ConcertDetailView.as_view(), name='concert-detail'),
    path('festivals/', FestivalListCreateView.as_view(), name='festival-list'),
    path('festivals/<int:pk>/', FestivalDetailView.as_view(), name='festival-detail'),

    # Bookings
    path('bookings/', BookingListCreateView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    
    # Concerts
    path('concert-bookings/', ConcertBookingListView.as_view(), name='concert-booking-list'),
    path('concert-bookings/create/', ConcertBookingCreateView.as_view(), name='concert-booking-create'),
    path('concert-bookings/<int:pk>/', ConcertBookingDetailView.as_view(), name='concert-booking-detail'),
    path('concert-bookings/<int:pk>/cancel/', ConcertBookingCancelView.as_view(), name='concert-booking-cancel'),
    
    # Festivals
    path('festival-bookings/', FestivalBookingListView.as_view(), name='festival-booking-list'),
    path('festival-bookings/create/', FestivalBookingCreateView.as_view(), name='festival-booking-create'),
    path('festival-bookings/<int:pk>/', FestivalBookingDetailView.as_view(), name='festival-booking-detail'),
    path('festival-bookings/<int:pk>/cancel/', FestivalBookingCancelView.as_view(), name='festival-booking-cancel'),

    # Sports
    path('tournaments/', TournamentListCreateView.as_view(), name='tournament-list'),
    path('tournaments/<int:pk>/', TournamentDetailView.as_view(), name='tournament-detail'),
    path('sports-registrations/', SportsRegistrationListCreateView.as_view(), name='sports-registration-list'),
    path('sports-registrations/<int:pk>/', SportsRegistrationDetailView.as_view(), name='sports-registration-detail'),
    path('fixtures/', FixtureListCreateView.as_view(), name='fixture-list'),
    path('fixtures/<int:pk>/', FixtureDetailView.as_view(), name='fixture-detail'),

    # Careers
    path('careers/apply/', JobApplicationCreateView.as_view(), name='career-apply'),
    path('careers/applications/', JobApplicationListView.as_view(), name='career-list'), # New
    path('careers/applications/<int:pk>/', JobApplicationDetailView.as_view(), name='career-detail'), # New

    # Admin
    path('admin/bookings/<int:pk>/status/', AdminBookingStatusUpdateView.as_view(), name='admin-booking-status'),
    path('admin/restore/<int:pk>/', AdminRestoreItemView.as_view(), name='admin-restore-item'),

    # Blogs
    path('blogs/', BlogListCreateView.as_view(), name='blog-list'),
    path('blogs/<int:pk>/', BlogDetailView.as_view(), name='blog-detail'),
    path('custom-inquiry/', CustomInquiryView.as_view(), name='custom-inquiry'),
]
