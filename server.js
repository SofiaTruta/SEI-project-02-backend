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

//DATABASE CONNECTION
const PROJECT_DATABASE = mongoose.connect(process.env.PROJECT_DATABASE)

//creating the models
const Professional = mongoose.model('Professional', professionalSchema)
const Patient = mongoose.model('Patient', patientSchema)
const Appointment = mongoose.model('Appointment', appointmentSchema)

//*endpoints to *get* data from the database
app.get('/professionals', async (request, response) => {
    try {
        const allProfessionals = await Professional.find({})
        response.json(allProfessionals)
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
    const allAppointments = await Appointment.find({})
    response.json(allAppointments)
})

//get a single patient details
app.get('/patients/:patientId', async (request, response) => {
    try {
        const patientId = request.params.patientId

        const patient = await Patient.find({
            _id: patientId
        })
        response.json(patient)
    } catch (error) {
        console.log('problems in the backend finding that patient', error)
    }
})

//get a single appointment details
app.get('/appointments/:appointmentId', async (request, response) => {
    try {
        const appointmentId = request.params.appointmentId

        const appointment = await Appointment.find({
            _id: appointmentId
        })
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

//*endpoints to *post* data to the database
app.post('/professionals/add-new-professional', async (request, response) => {
    try {
        let professional = await Professional.findOne({
            name: request.body.name
        })
        let now = new Date()

        if (!professional) {
            professional = new Professional({
                name: request.body.name,
                specialty: request.body.specialty,
                lastLoggedIn: now
            })

            await professional.save()
            console.log(`new professional saved: ${professional}`)
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
            appointment = new Appointment({
                date: request.body.date,
                time: request.body.time,
            })
            await appointment.save()
        }

        //add a new patient if no patient exists yet
        let patient = await Patient.findOne({
            name: request.body.name,
            dateOfBirth: request.body.dateOfBirth
        })

        if (!patient) {
            patient = new Patient({
                name: request.body.patientDetails.name,
                dateOfBirth: request.body.patientDetails.dateOfBirth,
                lastAppointment: appointment._id,
                currentTreatment: request.body.patientDetails.currentTreatment
            })

            await patient.save()

            console.log('new appointment created!')
            response.status(200).json({ message: 'new appointment saved!' })
        }
    }
    catch (error) {
        console.log('problems adding a new patient', error)
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
app.put('/appointments/:appointmentId', async (request, response) => {
    try {
        const appointmentId = request.params.appointmentId

        const appointment = await Appointment.findByIdAndUpdate({
            _id: appointmentId
        }, {
            date: request.body.date,
            time: request.body.time,
            patientDetails: {
                _id: request.body.patientDetails._id,
                name: request.body.patientDetails.name,
                dateOfBirth: request.body.patientDetails.dateOfBirth,
                currentTreatment: request.body.patientDetails.currentTreatment
            }
        })
        console.log('appointment updated')
        response.status(200).json({ message: 'appointment updated successfully' })
    } catch (error) {
        console.log('backend could not edit that appointment', error)
    }
})

app.put('/patients/:patientId', async (request, response) => {
    try {
        const patientId = request.params.patientId

        const patient = await Patient.findByIdAndUpdate({
            _id: patientId
        }, {
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
    },{
        name: request.body.name,
        specialty: request.body.specialty
    })
    response.status(200).json({message: 'professional updated successfully'})
} catch (error) {
    console.log('backend could not edit that professional', error)
}
})