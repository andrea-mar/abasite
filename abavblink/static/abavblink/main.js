import { loadJobs, displayJobs, displayPagination, saveJob, removeJob, deleteJob } from './functions.js'

const pageTitle = document.querySelector('title')
const loggedInUser = document.querySelector('#loggedInUser')
const jobsList = document.querySelectorAll('.jobsList')
const jobsListPagination = document.querySelectorAll('.jobsListPagination')
const postedJobsButton = document.querySelector('#v-pills-posted-tab')
const savedJobsButton = document.querySelector('#v-pills-saved-tab')
const accountSettingsTab = document.querySelector('#v-pills-account-settings-tab')
const accountDeleteTab = document.querySelector('#v-pills-delete-account-tab')
const accountPostedJobs = document.querySelector('#postedJobsList')
const accountSettingsView = document.querySelector('#accountSettings')
const accountDeleteView = document.querySelector('#deleteAccount')

let currentPage = 1


document.addEventListener('DOMContentLoaded', function() {
    if (pageTitle.innerHTML === 'ABA-VB Link Jobs') {
        showJobList('all-jobs', currentPage)
    }
    if (pageTitle.innerHTML === 'ABA-VB Link Account') {
        showJobList('posted', currentPage)
        postedJobsButton.onclick = function() {
            hideTabs()
            // show job list view as active 
            accountPostedJobs.className ='tab-pane fade show active'
            showJobList('posted', currentPage)
        }
        savedJobsButton.onclick = function() {
            hideTabs()
            // show job list view as active 
            accountPostedJobs.className = 'tab-pane fade show active'
            showJobList('saved', currentPage)
        }
        accountSettingsTab.onclick = function() {
            hideTabs()
            // show settings view as active 
            accountSettingsView.className = 'tab-pane fade show active'
        }
        accountDeleteTab.onclick = function() {
            hideTabs()
            // show delete view as active 
            accountDeleteView.className = 'tab-pane fade show active'
        } 
    }
})


// add functionality to page navigation buttons
function paginationNavigation(jobs, page, link) {
    const prevPageLink = document.querySelectorAll('.prevPageLink')
    const currentPageLink = document.querySelectorAll('.currentPageLink') // todo: popup to jump to different pages
    const nextPageLink = document.querySelectorAll('.nextPageLink')
    let pageHasNext
    let pageHasPrev
    let numPages
    // get page atibutes from Json objects
    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].has_next != undefined) {
            pageHasNext = jobs[i].has_next
        }
        if (jobs[i].has_previous != undefined) {
            pageHasPrev = jobs[i].has_previous
        }
        if (jobs[i].num_pages != undefined) {
            numPages = jobs[i].num_pages
        }
    }

    // disable previous button if on the first page
    if (pageHasPrev === false) {
        prevPageLink.forEach(element => {
            element.className = 'page-item prevPageLink disabled'
            element.firstElementChild.ariaDisabled = 'true'
            element.firstElementChild.tabIndex = '-1'

        })
        
    } else if (pageHasPrev === true) {
        prevPageLink.forEach(element => {
            element.className = 'page-item prevPageLink'
            element.firstElementChild.ariaDisabled = 'false'
            element.firstElementChild.tabIndex = 'null'

            // show previous page if it exists
            element.firstElementChild.onclick = function() {
                if (page != 1) { page-- }
                showJobList(link, page)
            }
        })
    }
    // disable the next button if on the last page
    if (pageHasNext === false) {
        nextPageLink.forEach(element => {
            element.className = 'page-item nextPageLink disabled'
            element.firstElementChild.ariaDisabled = 'true'
            element.firstElementChild.tabIndex = '-1'

        })
        
    } else if (pageHasNext === true) {
        nextPageLink.forEach(element => {
            element.className = 'page-item nextPageLink'
            element.firstElementChild.ariaDisabled = 'false'
            element.firstElementChild.tabIndex = 'null'

            // show next page if it exists
            element.firstElementChild.onclick = function() {
                if (page < numPages) { page++ }
                showJobList(link, page)
            }
        })
    }
}


function showJobList(link, page) {
    loadJobs(link, page).then(jobs => {   
        jobsList.forEach(element => {
            element.innerHTML = ''
            element.append(displayJobs(jobs, link))
            
        })
        showCorrectButton(jobs, link)
        manageJobPosts(jobs, link)
        
        jobsListPagination.forEach(element => {
            element.innerHTML = ''
            element.append(displayPagination(jobs, page))
        })
        paginationNavigation(jobs, page, link)
    })
}


// add functionality to the bookmark tag
function manageJobPosts(jobs, link) {
    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].user_id != undefined) {
            let bookmarkButton = document.querySelector(`#save-btn-${link}-${jobs[i].id}`)
            // save/remove/delete job button
            bookmarkButton.onclick = function() {
                if (loggedInUser.innerHTML === '') {
                    alert('You must login to save job')
                } else if (bookmarkButton.className === 'far fa-bookmark' && loggedInUser.innerHTML != '') {
                    saveJob(jobs[i].id).then(response => {
                        if (response.message === 'job saved') {
                            bookmarkButton.className = 'fas fa-bookmark'
                        }
                    })
                } else if (bookmarkButton.className === 'fas fa-bookmark' && loggedInUser.innerHTML != '') {
                    removeJob(jobs[i].id).then(response => {
                        if (response.message === 'job removed') {
                            bookmarkButton.className = 'far fa-bookmark'
                            if (link === 'saved') {
                                bookmarkButton.parentElement.className = 'list-group-item transform-delete'
                            }
                        }
                    })
                } else if (bookmarkButton.className === 'fas fa-trash-alt' && loggedInUser.innerHTML != '') {
                    deleteJob(jobs[i].id).then(response => {
                        if (response.message === 'job deleted') {
                            bookmarkButton.parentElement.className = 'list-group-item transform-delete'
                        }
                    })
                }
            }
        }
    }
}


function showCorrectButton(jobs, link) {
    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].user_id != undefined) {
            let bookmarkButton = document.querySelector(`#save-btn-${link}-${jobs[i].id}`)
            // show the corresponding button based on user's saved/posted db list
            if (jobs[i].user_id === loggedInUser.innerHTML) {
                bookmarkButton.className = 'fas fa-trash-alt'
            }
            // if job already saved show filled in bookmark
            for (let j = 0; j < jobs[i].saved_list.length; j++) {
                if (jobs[i].saved_list[j] === loggedInUser.innerHTML) {
                    console.log(jobs[i].saved_list[j]);
                    bookmarkButton.className = 'fas fa-bookmark'
                    //not working on account page ??
                }
            }
            console.log(bookmarkButton.className);
        }
    }
}


function hideTabs() {
    document.querySelectorAll('.tab-pane').forEach(element => {
        element.className = 'tab-pane fade'
    })
}
