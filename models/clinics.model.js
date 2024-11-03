import mongoose, { mongo } from "mongoose";
const Schema = mongoose.Schema;

const ClinicsSchema = new Schema(
    {
        Website: {
            type: String,
            require: true,
            unique: true
        },
        Dentists: [Schema.Types.Mixed],
    },
    {timestamps: true},
);

const Clinics = mongoose.model('Clinics', ClinicsSchema);
export default Clinics;