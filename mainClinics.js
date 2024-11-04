import Regions from "./models/regions.model.js";
import Clinics from "./models/clinics.model.js";
import axios from 'axios';
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
const mongooseURL = process.env.MONGODB_URL;
const APIKEY = process.env.GOOGLE_MAPS_API_KEY;

async function extractClinic(){
    const cursor = Regions.find().cursor();
    // console.log(cursor);
    let flag = false;
    for(let doc = await cursor.next(); doc != null; doc = await cursor.next()){
        const zipcode = doc.zipcode;

        if(zipcode == '24012'){
            flag = true;
        }
        // console.log(flag);
        console.log('---------------------- zipcode: ', zipcode);
        
        if(flag){
            const clinics = doc.clinics;

            for(let i = 0; i < clinics.length; i++){
                const placeId = clinics[i].place_id;
                if(placeId){
                    const clinicInfo = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${APIKEY}`);
                    // console.log(clinicInfo);
                    try{
                        await Clinics.create(clinicInfo.data.result);
                        console.log('----- saved clinic place id: ', placeId);
                    }catch(error){
                        console.log('----- save error: ', error.message, placeId);
                    }
                }else{
                    console.log('----- place id isnt exist');
                }
            }
        }else{
            console.log('----- already existed zipcode: ', zipcode);
        }
    }

    console.log('------- Successfully done all things!!!');
}

await mongoose.connect(mongooseURL);
console.log('Connected to mongoDB');

(async () => {  
    await extractClinic();  
    // Any additional logic or cleanup can go here.  
})();  

// const result = await Regions.findOne({zipcode: 22193});
// console.log(result);