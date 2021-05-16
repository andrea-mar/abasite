from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('account/<str:user>', views.account, name='account'),
    path('jobs', views.jobs, name='jobs'),
    path('schools', views.schools, name='schools'),
    path('events', views.events, name='events'),
    path('resources', views.resources, name='resources'),
    path('newjob/<str:username>', views.newjob, name='newjob'),
    path('jobpost/<int:id>', views.jobpost, name='jobpost'),

    # APIs
    path('jobs/<str:link>/<int:page>', views.jobslist, name='jobslist'),
    path('save/<int:job_id>', views.savejob, name='savejob'),
    path('remove/<int:job_id>', views.removejob, name='removejob'),
    path('delete/<int:job_id>', views.deletejob, name='deletejob'),
    path('account/jobs/<str:link>/<int:page>', views.jobslist, name='account_jobslist'),
    path('account/save/<int:job_id>', views.savejob, name='account_savejob'),
    path('account/remove/<int:job_id>', views.removejob, name='account_removejob'),
    path('account/delete/<int:job_id>', views.deletejob, name='account_deletejob'),


    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register, name='register'),
]