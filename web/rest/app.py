from flask import Flask, render_template, url_for, send_from_directory, make_response

app = Flask(__name__, static_url_path='')


@app.route('/')
def index():
        return render_template('index.html')


@app.route('/<path:path>')
def static_file(path):
    return url_for('static', filename=path)


@app.after_request
def apply_caching(response):
    response.headers["X-Frame-Options"] = "ALLOWALL"
    return response


if __name__ == '__main__':
	app.run()
