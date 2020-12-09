from bs4 import BeautifulSoup 
import urllib2
import requests
 
 
def match_class(target):
    def do_match(tag):
        classes = tag.get('class', [])
        return all(c in classes for c in target)
    return do_match
 
 
def get_html(url):
    html_content = urllib2.urlopen(url)
    return BeautifulSoup(html_content, "html.parser")
 
 
 
 
def getProjectHTML(name, pitch, link, built_with):
    return '''
 
        <a class="column" href="'''+link+'''" target="_blank">
            <article class="message">
              <div class="message-body">
                <div class="title is-5">'''+name+'''</div>
                '''+pitch+'''
                <br>
                <small>'''+", ".join(map(str, built_with))+'''</small>
              </div>
            </article>
        </a>
 
    '''
 
 
 
def getProjects(url1, url2):
    raw_html1 = get_html(url1)
    raw_html2 = get_html(url2)
 
    count = 0
 
    projects = ""
 
    raw_projects = raw_html1.findAll(match_class(['link-to-software']))
    raw_projects.extend(raw_html2.findAll(match_class(['link-to-software'])))
 
    for raw_project in raw_projects:
        p = raw_project.findAll(match_class(['software-entry-name']))[0]
         
        name = p.find('h5').getText().strip()
        pitch = p.find('p').getText().strip()
        link = raw_project['href']
        built_with = []
 
        print name
 
        project_html = get_html(link)
        raw_built_with = project_html.find("div", { "id": "built-with" }).findAll('li')
        for b in raw_built_with:
            built_with.append(b.getText().strip())
 
        if count % 6 == 0:
            if count != 0:
                projects += '''</div><div class="columns">'''
            else:
                projects += '''<div class="columns">'''
 
 
        projects += getProjectHTML(name, pitch, link, built_with)
 
        count += 1
    return projects
 
 
 
 
def execute():
    projects = '''<div id="projects" class="container" style="padding:25px; padding-top:0;">'''
 
    projects += getProjects('https://devpost.com/mdni007', 'https://devpost.com/mdni007?page=2')
 
    projects += '''</div></div>'''
 
    with open('web/templates/sections/hackathon_projects.html', 'w') as html_file:
        html_file.write(projects.encode('utf8'))
 
execute()
