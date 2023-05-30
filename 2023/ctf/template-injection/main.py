from flask import Flask, render_template_string, request, make_response
import os
from json import dumps, loads

app = Flask(__name__)

try:
  open('accounts.json', 'r').read()
except:
  open('accounts.json', 'w+').write('[]')

accounts = loads(open('accounts.json', 'r').read())

flag = open('flag.txt', 'r').read()

@app.route('/', methods=['GET'])
def index():
  return render_template_string(open('./index.html', 'r').read())

@app.route('/signup', methods=['GET', 'POST'])
def signup():
  if request.method == 'GET':
    return render_template_string(open('./signup.html', 'r').read())
  
  data = request.form
  if not data.get('username') or not data.get('password'):
    return 'missing credentials', 400
  
  for account in accounts:
    if account['username'] == data.get('username'):
      return 'username already in use', 500
  
  accounts.append({'username': data.get('username'), 'password': data.get('password')})

  open('accounts.json', 'w').write(dumps(accounts))

  return 'Account created. Head to <a href="/login">login</a> to sign in', 200

@app.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == 'GET':
    return render_template_string(open('./login.html', 'r').read())
  
  data = request.form
  if not data.get('username') or not data.get('password'):
    return 'missing credentials', 400

  for account in accounts:
    if account['username'] == data.get('username') and account['password'] == data.get('password'):
      res = make_response('Logged in. You can view your account at <a href="/account">account</a>')
      token = os.popen('openssl rand -base64 32').read()[0:-1]
      account['token'] = token
      res.set_cookie('auth', token)
      return res
  
  return 'account not found or password wrong', 400

@app.route('/account', methods=['GET'])
def account():
  if not request.cookies.get('auth'):
    return 'not logged in. <a href="/login">login</a>', 403
  
  for account in accounts:
    if 'token' in account and account['token'] == request.cookies.get('auth'):
      print(flag)
      return render_template_string('Welcome, ' + account['username'])
  
  return 'Invalid auth', 403
      

