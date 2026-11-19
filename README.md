# AI Face Recognition: Attendance Tracker

A browser-based attendance tracker that recognizes known faces from a webcam or video, built on
[face-api.js](https://github.com/justadudewhohacks/face-api.js). Recognized people are logged in a table that you
can copy, or export to Excel or CSV.

## How it works

- Each person has a folder of reference photos in `public/models_database/<Name>/`.
- On startup, the Express server (`src/app.js`) scans that folder and writes `models.json`, the list of people and
  their photos.
- The page (`public/index.html` + `public/js/frScript.js`) loads the face-api.js models, builds a face descriptor
  for each person, and matches faces in the live video against them.

## Run it

```bash
npm install
node src/app.js
```

Open http://localhost:3000 and allow camera access.

## Add a person

Create `public/models_database/<Their Name>/` and add a few clear, front-facing photos, then restart the server.

## Built with

Node.js, Express, face-api.js, jQuery, DataTables, Bootstrap.
