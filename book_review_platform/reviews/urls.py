from django.urls import path
from . import views

urlpatterns = [
    path('<str:book_id>/', views.ReviewsListView.as_view(), name='reviews_list'),
    path('review/<int:review_id>/', views.ReviewDetailView.as_view(), name='review_detail'),
    path('like/<int:review_id>/', views.LikeReviewView.as_view(), name='like_review'), 
    path('report/<int:review_id>/', views.ReportReviewView.as_view(), name='report_review'),
]
