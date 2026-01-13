from rest_framework import serializers
from .models import User, Decoration, Booking, ConcertBooking, FestivalBooking, Tournament, SportsRegistration, JobApplication, Fixture, Blog, Concert, Festival

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'is_staff', 'is_superuser']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'USER')
        )
        return user

class DecorationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decoration
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    decoration_details = DecorationSerializer(source='selected_decoration', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'status']

class ConcertBookingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ConcertBooking
        fields = '__all__'
        read_only_fields = ['user']

class FestivalBookingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = FestivalBooking
        fields = '__all__'
        read_only_fields = ['user']

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class SportsRegistrationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    sport = serializers.CharField(source='tournament.sport', read_only=True)

    estimated_prize = serializers.SerializerMethodField()

    class Meta:
        model = SportsRegistration
        fields = '__all__'
        read_only_fields = ['user']

    def get_estimated_prize(self, obj):
        # Logic: 60% of total registration fees for this tournament
        # We need to sum up all registrations for obj.tournament
        from django.db.models import Sum
        total_pool = SportsRegistration.objects.filter(tournament=obj.tournament).aggregate(Sum('price'))['price__sum'] or 0
        return float(total_pool) * 0.60

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = '__all__'

class FixtureSerializer(serializers.ModelSerializer):
    player1_name = serializers.SerializerMethodField()
    player2_name = serializers.SerializerMethodField()
    winner_name = serializers.SerializerMethodField()

    class Meta:
        model = Fixture
        fields = '__all__'

    def get_player1_name(self, obj):
        if not obj.player1: return "TBD"
        return obj.player1.team_name or obj.player1.player_name or obj.player1.user.username

    def get_player2_name(self, obj):
        if not obj.player2: return "TBD"
        return obj.player2.team_name or obj.player2.player_name or obj.player2.user.username

    def get_winner_name(self, obj):
        if not obj.winner: return None
        return obj.winner.team_name or obj.winner.player_name or obj.winner.user.username

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'

class ConcertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concert
        fields = '__all__'

class FestivalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Festival
        fields = '__all__'
