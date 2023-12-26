const published_projects = "data/published_projects.json";
const hackathon_projects = "data/hackathon_projects.json";
const activities = "data/activities.json";

function buildPublishedProjects() {
    $.getJSON(published_projects, function(data) {
        let content = "";
        for (let i = 0; i < data.length; i++) {
            if (i != 0 && i % 3 == 0) {
                content += "</div>";
            }

            if (i % 3 == 0) {
                content += ` <div class="columns">`;
            }

            content += `
            <a class="column" href="`+data[i].url+`" target="_blank">
                <center>
                <div class="card">
                    <div class="card-image">
                    <figure class="image is-2by1">
                        <img class="image-logo" src="`+data[i].image+`" alt="">
                    </figure>
                    </div>
                    <div class="card-content">
                    <div class="content">
                        <div class="title is-5">`+data[i].name+`</div>
                        `+data[i].description+`
                        <br>
                        <small>`+data[i].tags+`</small>
                    </div>
                    </div>
                </div>
                </center>
            </a>
            `;
        } 
        document.getElementById("published-projects").innerHTML = content;
    });
}

function updateTravelPhotos() {
    let imageNumber = Math.floor(Math.random() * 23);
    $('#travel-photos').delay(500).fadeTo(500, 0.5, "swing", function()
    {
        $(this).css('background-image', `linear-gradient(rgba(0, 0, 0, 0.7),rgba(0, 0, 0, 0.7)), url('images/travel/mdni007-`+imageNumber+`.png')`);
    }).fadeTo('slow', 1);
}

function buildActivities(){
    $.getJSON(activities, function(data) {
        let content = "";
        for (let i = 0; i < data.length; i++) {
            let description = "";
            for (let j = 0; j < data[i].description.length; j++) {
                description += "<p>"+data[i].description[j]+"</p><br>";
            }
            if (i % 2 == 0) {
                content += `
                <div class="columns">
                    <div class="column">
                        <img src="`+data[i].image+`">
                    </div>
                    <div class="column">
                        <div class="title is-5">`+data[i].title+`</div>
                        `+description+`
                        <p style="text-align:right;">
                            <a href="`+data[i].link+`" class="button is-medium is-dark" style="color:#ffffff;">`+data[i].text+`</a>
                        </p>
                    </div>
                </div>
                `;
            } else {
                content += `
                <div class="columns">
                    <div class="column is-hidden-desktop">
                        <img src="`+data[i].image+`">
                    </div>
                    <div class="column">
                        <div class="title is-5">`+data[i].title+`</div>
                        `+description+`
                        <p style="text-align:right;">
                            <a href="`+data[i].link+`" class="button is-medium is-dark" style="color:#ffffff;">`+data[i].text+`</a>
                        </p>
                    </div>
                    <div class="column is-hidden-touch">
                        <img src="`+data[i].image+`">
                    </div>
                </div>
                `;
            }
        } 
        document.getElementById("activities").innerHTML = content;
    });
}

function buildHackathonProjects(){
    $.getJSON(hackathon_projects, function(data) {
        let content = "";
        for (let i = 0; i < data.length; i++) {
            if (i != 0 && i % 6 == 0) {
                content += "</div>";
            }

            if (i % 6 == 0) {
                content += ` <div class="columns">`;
            }

            content += `
            <a class="column" href="`+data[i].url+`" target="_blank">
                <article class="message">
                    <div class="message-body">
                        <div class="title is-5">`+data[i].name+`</div>
                        `+data[i].description+`
                        <br>
                        <small>`+data[i].tags+`</small>
                    </div>
                </article>
            </a>
            `;
        } 
        document.getElementById("hackathon-projects").innerHTML = content;
    });
}
