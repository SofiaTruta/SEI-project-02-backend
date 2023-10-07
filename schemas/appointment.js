import mongoose, { Schema} from "mongoose"

const appointmentSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, 
        required: true
    },
    patientDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }
})

export default appointmentSchema