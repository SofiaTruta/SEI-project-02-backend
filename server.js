import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import 'dotenv/config'
import professionalSchema from "./schemas/professional.js"
import patientSchema from "./schemas/patient.js"
import appointmentSchema from "./schemas/appointment.js"
import mongoose from "mongoose"

//start app
const app = express()


//tell it which dependencies to use
app.use(cors())
app.use(bodyParser.json())
//tell it which servers you want
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`listening on port: ${port}`)
})

//!DATABASE CONNECTION
const PROJECT_DATABASE = mongoose.connect(process.env.PROJECT_DATABASE)

//creating the models
const Professional = mongoose.model('Professional', professionalSchema)
const Patient = mongoose.model('Patient', patientSchema)
const Appointment = mongoose.model('Appointment', appointmentSchema)

//*endpoints to *get* data from the database

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

app.get('/patients', async (request, response) => {
    try {
        const allPatients = await Patient.find({})
        response.json(allPatients)
    } catch (error) {
        console.log('backend problems getting patients', error)
    }
})

app.get('/appointments', async (request, response) => {
    const allAppointments = await Appointment.find({}).populate('patientDetails')
    response.json(allAppointments)
})

//get a single patient details
app.get('/my-patients/:patientId', async (request, response) => {
    try {
        const patientId = request.params.patientId

        const patient = await Patient.findById(patientId)
        response.json(patient)

    } catch (error) {
        console.log('problems in the backend finding that patient', error)
    }
})

//get a single appointment details
app.get('/appointments/:appointmentId', async (request, response) => {
    try {
        const appointmentId = request.params.appointmentId

        const appointment = await Appointment.findById(appointmentId).populate('patientDetails')
        response.json(appointment)

    } catch (error) {
        console.log('problems in the backend getting that appt', error)
    }
})

app.get('/appointments/:patientId', async (request, response) => {
    try {
        const patientId = request.params.patientId

        //find appointments for this id
        const appointments = await Appointment.find({
            patientDetails: patientId
        })

        response.json(appointments)
    } catch (error) {
        console.log('problems in the backend finding appts for 1 patient', error)
    }
})

app.get('/appointments/', async (request, response) => {
    try {
        const professionalId = request.params.professionalId

        const appointments = await Appointment.find({

        })
    } catch (error) {
        console.log('problems at the backend', error)
    }
})


//*endpoints to *post* data to the database
app.post('/professionals/add-new-professional', async (request, response) => {
    try {
        let professional = await Professional.findOne({
            name: request.body.name
        })
        let now = new Date()

        if (!professional) {
            professional = new Professional({
                email: request.body.email,
                name: request.body.name,
                specialty: request.body.specialty,
                lastLoggedIn: now
            })

            await professional.save()
            response.json(professional)
        }
        else {
            console.log('professional already registered!')
        }

    } catch (error) {
        console.log('problems adding professional', error)
    }
})

app.post('/appointments/add-new-appointment', async (request, response) => {
    try {
        //adding a new appointment
        let appointment = await Appointment.findOne({
            date: request.body.date,
            time: request.body.time,
        })

        if (appointment) {
            console.log('already have an appointment for that date and time')
            return response.json({
                message: 'an appointment already exists for that date and time'
            })
        } else {
            appointment = await Appointment.create({
                date: request.body.date,
                time: request.body.time,
                status: 'upcoming',
                professionalDetails: request.body.professionalDetails._id
            })


            await appointment.save()
        }

        //find professional and push into appointments array
        let professional = await Professional.findOne({
            email: request.body.professionalDetails.email
        })

        professional.appointments.push(appointment._id)
        await professional.save()


        //add a new patient if no patient exists yet
        let patient = await Patient.findOne({
            name: request.body.patientDetails.name,
            dateOfBirth: request.body.patientDetails.dateOfBirth
        })

        if (!patient) {
            patient = new Patient({
                name: request.body.patientDetails.name,
                dateOfBirth: request.body.patientDetails.dateOfBirth,
                currentTreatment: request.body.patientDetails.currentTreatment
            })
        }


        patient.appointments.push(appointment._id)
        await patient.save()

        appointment.patientDetails = patient._id
        await appointment.save()

        console.log('new appointment created!')
        response.status(200).json({ appointment, patient, professional })

    }
    catch (error) {
        console.log('problems adding a new appointment', error)
    }
})

//* endpoints to *delete* data
app.delete('/appointments/:appointmentId', async (request, response) => {
    const appointmentId = request.params.appointmentId
    try {
        const appointment = await Appointment.findByIdAndDelete({
            _id: appointmentId
        })
        response.status(200).json({ message: 'appointment deleted' })
    } catch (error) {
        console.log('backend could not delete the appointment', error)
    }
})

app.delete('/professionals/:professionalId', async (request, response) => {
    try {
        const professionalId = request.params.professionalId
        const professional = await Professional.findByIdAndDelete({
            _id: professionalId
        })
        response.status(200).json({ message: 'professional deleted' })
    } catch (error) {
        console.log('backend could not delete that professional', error)
    }
})

//* endpoints to *edit* data
app.put('/appointments/edit-appointment/:appointmentId', async (request, response) => {
    try {
        const appointmentId = request.params.appointmentId
        console.log(request.body)

        //update the appointment first
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                date: request.body.date,
                time: request.body.time
            },
            { new: true } // To return the updated document
        );

        //update the patient at the same time
        const patientId = request.body.patientDetails._id
        const patient = await Patient.findByIdAndUpdate(patientId, {
            name: request.body.patientDetails.name,
            dateOfBirth: request.body.patientDetails.dateOfBirth,
            currentTreatment: request.body.patientDetails.currentTreatment
        })
        patient.save()
        console.log('appointment updated', appointment, patient)
        response.status(200).json({ appointment, patient })
    } catch (error) {
        console.log('backend could not edit that appointment', error)
    }
})

//updating appointment status only
app.put('/update-appointment-status/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    try {
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        return res.json(appointment);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});



app.put('/patients/:patientId', async (request, response) => {
    try {
        const patientId = request.params.patientId

        const patient = await Patient.findByIdAndUpdate(patientId, {
            name: request.body.name,
            dateOfBirth: request.body.dateOfBirth,
            currentTreatment: request.body.currentTreatment
        })
        response.status(200).json({ message: 'patient successfully updated' })
    } catch (error) {
        console.log('backend could not edit that patient', error)
    }
})

app.put('/professionals/:professionalId', async (request, response) => {
    try {
        const professionalId = request.params.professionalId

        const professional = await Professional.findByIdAndUpdate({
            _id: professionalId
        }, {
            name: request.body.name,
            specialty: request.body.specialty
        })
        response.status(200).json({ message: 'professional updated successfully' })
    } catch (error) {
        console.log('backend could not edit that professional', error)
    }
})

//!GOOGLE OAUTH AND NEW PROFESSIONAL REGISTRATION
app.post('/professionals/login', async (request, response) => {
    const now = new Date()
    try {
        let professional = await Professional.findOne({
            email: request.body.email
        })

        if (!professional) {
            professional = new Professional({
                email: request.body.email,
                name: request.body.name,
                specialty: request.body.specialty,
                lastLoggedIn: now
            })

            await professional.save()
            console.log(`new professional saved: ${professional}`)
            response.json(professional)
        }
        else {
            await Professional.findOneAndUpdate({
                "email": request.body.email
            }, {
                lastLoggedIn: now
            })
            console.log('lastLoggedIn updated')
        }

    } catch (error) {
        console.log('backend problems in authentication', error)
    }
})