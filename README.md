# Patient Bookr - description

This project was an assignment part of General Assembly’s Software Engineering Immersive Bootcamp. The goal was to get familiar with Single Page Application development, both backend and frontend, in a MEVN environment (MongoDB, Express.js, Vue.js and Node.js) as well as CRUD data operations and user authentication via OAuth. 

*this is the backend repo only - please find the frontend repo [here](https://github.com/SofiaTruta/SEI-project-02-frontend)*

Considering my previous experience in healthcare, the idea of an appointment tracker / portal was very familiar and felt like the right project to showcase ability to manage a database as well as dynamically displaying data using Vue.js and Vuetify.

![screenshot](https://i.imgur.com/9aQ0ln2m.png)
![screenshot](https://i.imgur.com/21zFu6nm.png)
![screenshot](https://i.imgur.com/y9jcW9Cm.png)


## Deployment Link

https://patient-bookr.netlify.app/

To experience the full range of features, registration/sign-in via Google OAuth is required. 

## Timeframe 

This was a solo project completed in 7 days.

## Technologies Used

### Backend
- Express.js
- MongoDB
- Google OAuth2

### Frontend
- Vue.js
- Vuetify
- Node.js

Also used Trello for project management and LucidChart for ERD.

## Getting Started / Code installation

The project is split into two repositories - backend and frontend - for easier deployment with Netlify. 

To get the code running on your machine, clone both repositories into your desired location and run them simultaneously. The package.json file lists all necessary dependencies. 

Additional set up:
- Set up a MongoDB database (the free version is appropriate). 
- Register your project with Google Cloud Development to obtain a clientID and secret for OAuth2.
- Create a .env file in both backend and frontend projects to securely store sensitive information (see .env.example).

## MVP requirements
- Have at least 2 data entities (data resources) in addition to the User Model. 
- Use OAuth authentication.
- Have full-CRUD data operations somewhere within the app's feature
- Implement basic authorisation that restricts access to features that need a logged in user in order to work (typically CUD data operations)
- have a consistent and polished user interface

## Planning

Planning involved creating wireframes to visualize the frontend design and layout, as well as an entity relationship diagram (ERD) to plan relationships between database collections.

Initially, my plan involved different access for professionals and patients. Due to time constraints, I shifted focus to professionals only for a more consistent outcome.


![ERD for project](https://i.imgur.com/aWC4HuSm.png)

![wireframe for main view](https://i.imgur.com/xAyztjvm.png)

![wireframe for creating a new appointment](https://i.imgur.com/c7ZxqY7m.png)


## Build Process

I kept a daily log of goals achieved each day to track the project's evolution. 

### Day 1
- Initiated project setup, including Trello board creation and wireframe sketches.

Started coding the backend:
- Established database connectivity.
- Created necessary models.
- Configured endpoints for data retrieval, deletion, and updates.

Began coding the frontend:
- Initialized main.js, importing dependencies, and mounted the Vue app.
- Created the main components for the project
- Set up the router and routes

### Day 2
- Integrated Google OAuth on both frontend and backend.
- Configured cookie handling.
- Implemented redirection to the home page post sign-in.
- Began data retrieval for the home page.

Obstacles:
- Discovered that the Professional Model lacked a required email field for Google authentication. 

### Day 3
- With help from the instructional team, worked out logic to populate the models and improved the referencing between them. 
- Created the main page view, which dynamically accesses information from the database. 
- Added functionality for deleting and editing appointment.

Here is a code snippet for my Appointment Schema:

```
const appointmentSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'missed', 'completed'],
        required: true,
        default: 'upcoming'
    },
    patientDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    professionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional'
    }
})

```

Here is a code snippet for one of the backend's GET requests:
```
//gets both professionals and appointments
app.get('/professionals', async (request, response) => {
    try {
        const allAppointments = await Appointment.find({}).populate('patientDetails')

        const allProfessionals = await Professional.find({}).populate('appointments')
        response.json({ allProfessionals, allAppointments }
        )
    } catch (error) {
        console.log('backend problems getting professionals', error)
    }
})

```

### Day 4
- Started styling using the Vuetify library.
- Gained more in-depth knowledge of Vue.js capabilities with props and custom events.
- Adapted existing code to integrate with styling changes.
- Set up the navigation bar.

### Day 5
- Styled the landing page.
- Fixed bugs with the help of the instructional team (e.g., automatic redirection issue from the landing page, dialog box closure functionality)
- Made minor adjustments to styling and replicated main page functionality across other views.

### Day 6
- Addressed a date-related bug affecting the edit functionality due to formatting issues.
- Ensured style consistency across different views.
- Created a “My Patients" view.
- Fixed a page refresh-related bug occurring throughout the application.
- Introduced new functionality: appointment status classification (upcoming, missed, completed).

### Day 7
- Added a "single patient" view. 
- Automated appointment status changes based on date comparisons.
- Created a view specifically for missed appointments.
- Tested functionality with different new users and fixed bugs related to route protection.
- Focused on mobile responsiveness.

## Challenges

I did not visualise the frontend in enough detail to understand exactly what data I’d need to get in each component. As a result, my code (both in backend and frontend) is not as efficient as it could be. Going forward, I intend to do more planning and try to anticipate what data each component will need to access before working on the backend.

I could not successfully get an endpoint that retrieves all the appointments for a single patient. This means that my frontend methods are bulkier than I hoped for. 

Dealing with timings between API calls to the database and updating/re-rendering Vue.js components often caused problems with accessing the data. I feel like I have a much better understanding of this now and will be aware of it for future projects. 

## Wins

It was very rewarding when I was able to understand and feel comfortable in dealing in the full stack operations and CRUD operations with the database. 

I also really enjoyed learning how to use a CSS library (Vuetify), it was a very relaxing part of the project!

## Key Learnings

A big learning point from this project was understanding that really visualising the frontend and what data you’ll need to access at what point is really helpful to setup a more efficient backend and good database Models that reference each other well. 

I feel quite comfortable working with Vue.js and Vuetify at this point, and I would like to come back to them after the project to keep learning. I have also realised that choosing if/which frontend library is going to be used can be helpful in laying out the skeleton of the web app and create a more uniform look from the beginning.

## Known Bugs

Logout bug: application currently not refreshing access tokens after a few minutes. Token from google OAuth expires after the default 1 hour, so if the page is not refreshed before then, the logout button does not work

Creating New Appointment: I have been unable to identify why, but when a new User creates an appointment for the first time, it does not register - but after refreshing the page, all the functionalities work fine. 
This was only identified after after deployment. 

## Future Improvements

I would like to fix the bug around creating an appointment for the first time. 

I also intend on refactoring the backend using routers and controllers for a more efficient and clean layout.
