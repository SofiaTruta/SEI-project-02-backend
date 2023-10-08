import mongoose, { Schema} from "mongoose"


const professionalSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    specialty: String,
    lastLoggedIn: Date,
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }]
})

export default professionalSchema