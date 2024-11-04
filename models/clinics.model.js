import mongoose, { mongo } from "mongoose";
const Schema = mongoose.Schema;

const ClinicsSchema = new Schema(
    {
        address_components: [ Schema.Types.Mixed ],
        adr_address: String,
        business_status: String,
        current_opening_hours: Schema.Types.Mixed,
        formatted_address: String,
        formatted_phone_number: String,
        geometry: Schema.Types.Mixed,
        icon: String,
        icon_background_color: String,
        icon_mask_base_uri: String,
        international_phone_number: String,
        name: String,
        opening_hours: Schema.Types.Mixed,
        photos: [ Schema.Types.Mixed ],
        place_id: {
            type: String,
            unique: true,
        },
        plus_code: Schema.Types.Mixed,
        rating: Number,
        reference: String,
        reviews: [ Schema.Types.Mixed ],
        types: [ String ],
        url: String,
        user_ratings_total: Number,
        utc_offset: Number,
        vicinity: String,
        website: String,
        wheelchair_accessible_entrance: Boolean
    },
    {timestamps: true},
);

const Clinics = mongoose.model('Clinics', ClinicsSchema);
export default Clinics;