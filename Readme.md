guestbook
=========

__guestbook__ is a simple guestbook web app to demonstrate the fundumentals of
building backend Node.js applications.

## Requirements

* Node.js (>= 12) with npm or yarn
* MySQL (>= 5.7)

## Deployment

Create an `.env` file with the following secrets and parameters.

```
# Server Parameter

PORT=80                   # specify the server port
SESSION_SECRET=           # specify the session secret to use with cookies

# Database Parameters

DB_NAME=guestbook_db      # specify the database name
DB_USER=guestbook_db_user # specify the name of a database user
DB_PASS=                  # specify the password to access the database
DB_HOST=localhost         # specify the database host
DB_PORT=3306              # specify the database port
DB_DIALECT=mysql          # select the database dialect (mysql, mariadb, sqlite, postgresql, mssql)
```

Download libraries with `npm install` and start the server with `npm start`.

## Credits

Dmitrii Toksaitov <dmitrii@toksaitov.com>

