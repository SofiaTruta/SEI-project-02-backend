import mongoose, { Schema} from "mongoose"


const professionalSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    specialty: String,
    lastLoggedIn: Date
})

export default professionalSchema