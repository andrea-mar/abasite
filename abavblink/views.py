import json

from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.db import IntegrityError
from django.http import JsonResponse
from django.core.paginator import Paginator

from abavblink.models import Job, User


def index(request):
    return render(request, 'abavblink/index.html', {})


def jobs(request):
    return render(request, 'abavblink/jobs.html', {})


def schools(request):
    return render(request, 'abavblink/schools.html', {})


def events(request):
    return render(request, 'abavblink/events.html', {})


def resources(request):
    return render(request, 'abavblink/resources.html', {})


@login_required
def account(request, user):
    logged_user = request.user
    if request.method == 'POST' and user == logged_user.username:
        if 'delete-account' in request.POST:
            logout(request)
            logged_user.delete()
            return render(request, 'abavblink/index.html', {
                'message': 'Account deleted.'
            }) 
        elif 'change-password' in request.POST and user == logged_user.username:
            current_password = request.POST['current-password']
            new_password = request.POST['new-password']
            new_password_confirm = request.POST['new-password-confirm']
            # verify current password matches the one in the database
            user_verification = authenticate(request, username=logged_user.username, password=current_password)
            if user_verification is not None and new_password != '':
                # ensure new passwords match
                if new_password == new_password_confirm:
                    logged_user.set_password(new_password)
                    logged_user.save()
                    logout(request)
                    return render(request, "abavblink/login.html", {
                        'message': 'Password changed. Please log in with your new password.'
                    })
                else:
                    return render(request, 'abavblink/account.html', {
                        'error' : 'Passwords don`t match.'
                    })
            else:
                    return render(request, 'abavblink/account.html', {
                        'error' : 'Incorrect password.'
                    })

    return render(request, 'abavblink/account.html', {})


@login_required
def newjob(request, username):
    if request.method == 'POST':
        # save new job post in database
        job = Job(
            user_id = request.user,
            title = request.POST['title'].capitalize(),
            location = request.POST['location'].capitalize(),
            contact = request.POST['contact'],
            text = request.POST['new-job-text'],
        )
        job.save()
        return HttpResponseRedirect(reverse('jobs')) 
    return render(request, 'abavblink/newjob.html', {})


def jobpost(request, id):
    job = Job.objects.get(id=id)
    return render(request, 'abavblink/jobpost.html', {
        "job": job,
    })



def jobslist(request, link, page):
    user = request.user
    # get jobs list for jobs page
    if link == 'all-jobs':
        jobs = Job.objects.all().order_by('id').reverse()
    # get saved jobs for account page
    if link == 'posted':
        jobs = Job.objects.filter(user_id=user).order_by('id').reverse()
    # get posted jobs for account page
    if link == 'saved':
        jobs = user.saved_jobs.all()

    paginator = Paginator(jobs, 10)
    data = [job.serialize() for job in paginator.page(page)]
    data.append({"has_next": paginator.page(page).has_next()})
    data.append({"has_previous": paginator.page(page).has_previous()})
    data.append({"num_pages": paginator.num_pages})
    return JsonResponse(data, safe=False)

@login_required
def savejob(request, job_id):
    job = Job.objects.get(id=job_id)
    user = request.user
    if request.method == 'PUT':
        if user is not None:
            user.saved_jobs.add(job)
            return JsonResponse({"message": "job saved"}, status=201)
        else:
            return JsonResponse({"error": "job not saved"}, status=304)

@login_required
def removejob(request, job_id):
    job = Job.objects.get(id=job_id)
    user = request.user
    if request.method == 'PUT': 
        data = json.loads(request.body) 
        if data.get('action') is not None:
            # remove job from user's saved list
            if data['action'] == 'remove':
                user.saved_jobs.remove(job)
                return JsonResponse({"message": "job removed"}, status=201)
            return JsonResponse({"message": "job not removed"}, status=304)


@login_required
def deletejob(request, job_id):
    job = Job.objects.get(id=job_id)
    user = request.user
    if request.method == 'POST':
        data = json.loads(request.body)
        if data.get('action') is not None:
            # delete job from database
            if data['action'] == 'delete' and user.username == job.user_id.username:
                job.delete()
                return JsonResponse({"message": "job deleted"}, status=201)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
    
        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "abavblink/login.html", {
                "error": "Invalid username and/or password."
            })
    else:
        return render(request, "abavblink/login.html") 



@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]

        # ensure user completed all fields
        if username != '' and email != '' and password != '':
            # Ensure password matches confirmation
            confirmation = request.POST["confirmation"]
        
            if password != confirmation:
                return render(request, "abavblink/register.html", {
                    "error": "Passwords must match."
                })

            # Attempt to create new user
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                return render(request, "abavblink/register.html", {
                    "error": "Username already taken."
                })
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "abavblink/register.html", {
                    "error": "You must complete all fields."
                })
    else:
        return render(request, "abavblink/register.html")


    
    
    