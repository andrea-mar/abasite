async function loadJobs(link, page) {
    const response = await fetch(`jobs/${link}/${page}`)
    const jobs = await response.json()
    console.log(jobs);
    return jobs
}


// saves a job into users saved jobs list
async function saveJob(job) {
    const response = await fetch(`save/${job}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'save'
        })
    })
    const result = await response.json()
    console.log(result);
    return result
}


// removes a previously saved jobs from the user's list
async function removeJob(job) {
    const response = await fetch(`remove/${job}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'remove'
        })
    })
    const result = await response.json()
    console.log(result);
    return result
}


// deletes user's job from db
async function deleteJob(job) {
    const response = await fetch(`delete/${job}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'delete'
        })
    })
    const result = await response.json()
    console.log(result);
    return result
}


function displayJobs(jobs, link) {
    const jobsListDiv = document.createElement('div')
    jobsListDiv.className = 'list-group'

    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].user_id != undefined) {
            const jobEntryDiv = document.createElement('div')
            jobEntryDiv.className = 'list-group-item transform'
            jobEntryDiv.innerHTML = `
                <li id="job-${jobs[i].id}">
                    <h6 id="job-title-${jobs[i].id}"><a href="/jobpost/${jobs[i].id}">${jobs[i].title}</a></h6>
                    <p id="job-location-${jobs[i].id}" class="fas fa-map-marker-alt"><span class="job-location-pin"> ${jobs[i].location}</span></p>
                    <p id="job-contact-${jobs[i].id}" class="far fa-id-card"> ${jobs[i].contact}</p>
                    <p id="job-timestamp-${jobs[i].id}" class="far fa-clock"> Posted on ${jobs[i].timestamp} by ${jobs[i].user_id}</p>
                    <p id="job-text-${jobs[i].id}" class="job-listing-text">${jobs[i].text.substring(0, 150)}...</p>
                </li>
                <p id="save-btn-${link}-${jobs[i].id}" class="far fa-bookmark"></p>
            `
            jobsListDiv.append(jobEntryDiv)
        }      
    }
    return jobsListDiv
}


function displayPagination(jobs, page) {
    const jobsPagination = document.createElement('div')
    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].num_pages) {
            jobsPagination.innerHTML = `
                <nav aria-label="Jobs page navigation">
                    <ul class="pagination pagination-sm justify-content-center mt-4">
                    <li class="page-item prevPageLink">
                        <a class="page-link" href="#!" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    <li class="page-item currentPageLink"><a class="page-link" href="#!">Page ${page} of ${jobs[i].num_pages}</a></li>
                    <li class="page-item nextPageLink">
                        <a class="page-link" href="#!" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                    </ul>
                </nav>
            `
        }
    }
    return jobsPagination
}


// get csrftoken
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


export { loadJobs, displayJobs, displayPagination, saveJob, removeJob, deleteJob }