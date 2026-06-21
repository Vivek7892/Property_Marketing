import random
import requests as http_requests
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, OTPVerification
from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer, ResetPasswordSerializer


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(user, otp, purpose):
    subject = 'Local Property Hub - Email Verification' if purpose == 'register' else 'Password Reset OTP'
    message = f'Your OTP is: {otp}\nValid for 10 minutes.'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        otp = generate_otp()
        OTPVerification.objects.create(user=user, otp=otp, purpose='register')
        send_otp_email(user, otp, 'register')
        return Response({'message': 'Registration successful. Check your email for OTP.'}, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        try:
            user = User.objects.get(email=email)
            otp_obj = user.otps.filter(otp=otp, purpose='register', is_used=False).first()
            if not otp_obj:
                return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            if timezone.now() - otp_obj.created_at > timedelta(minutes=10):
                return Response({'error': 'OTP expired.'}, status=status.HTTP_400_BAD_REQUEST)
            user.is_verified = True
            user.save()
            otp_obj.is_used = True
            otp_obj.save()
            return Response({'message': 'Email verified successfully.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            otp = generate_otp()
            OTPVerification.objects.create(user=user, otp=otp, purpose='forgot_password')
            send_otp_email(user, otp, 'forgot_password')
            return Response({'message': 'OTP sent to your email.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            otp_obj = user.otps.filter(
                otp=serializer.validated_data['otp'],
                purpose='forgot_password',
                is_used=False
            ).first()
            if not otp_obj or timezone.now() - otp_obj.created_at > timedelta(minutes=10):
                return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            otp_obj.is_used = True
            otp_obj.save()
            return Response({'message': 'Password reset successful.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class DeactivateAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.is_active = False
        request.user.save()
        return Response({'message': 'Account deactivated.'})


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Frontend sends Google access_token as 'credential'
        access_token = request.data.get('credential')
        if not access_token:
            return Response({'error': 'Google token required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resp = http_requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            if resp.status_code != 200:
                return Response(
                    {'error': 'Invalid or expired Google token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            id_info = resp.json()
        except Exception as e:
            return Response({'error': f'Google verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        email = id_info.get('email')
        full_name = id_info.get('name', '')

        if not email:
            return Response({'error': 'Email not provided by Google.'}, status=status.HTTP_400_BAD_REQUEST)

        if not id_info.get('email_verified', False):
            return Response({'error': 'Google email is not verified.'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': full_name,
                'is_verified': True,
                'user_type': 'buyer',
            }
        )

        if created:
            user.set_unusable_password()
            user.save()
        elif full_name and user.full_name != full_name:
            user.full_name = full_name
            user.save(update_fields=['full_name'])

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })
