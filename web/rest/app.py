import os
import sys
import glob
import feedparser
from bs4 import BeautifulSoup
from flask import Flask, render_template, url_for, send_from_directory, make_response

app = Flask(__name__, static_url_path='')


def get_travel_photos():
    image_path = "%s/images/travel/*" % os.path.join(app.root_path, app.static_folder)
    images = glob.glob(image_path)
    return [url_for('static', filename="images/travel/%s" % os.path.basename(photo)) for photo in images]

def get_blog_posts():
    blog_posts = []
    rss_feed_url = "https://medium.com/feed/@mdnahian"
    rss_feed = feedparser.parse(rss_feed_url)
    for entry in rss_feed.entries:
        post = {
            'title': entry.title,
            'image': BeautifulSoup(entry.summary).find('img')['src'],
            'published': entry.published,
            'link': entry.link
        }
        blog_posts.append(post)
    return blog_posts


@app.route('/')
def index():
        return render_template('index.html', published_projects=published_projects, hackathon_projects=hackathon_projects,
         activities=activities, travel_photos=get_travel_photos(), blog_posts=get_blog_posts())


@app.route('/<path:path>')
def static_file(path):
    return url_for('static', filename=path)


@app.after_request
def apply_caching(response):
    response.headers["X-Frame-Options"] = "ALLOWALL"
    return response


if __name__ == "__main__":
    from data import published_projects, hackathon_projects, activities
    app.run(debug=True)
else:
    from rest.data import published_projects, hackathon_projects, activities
