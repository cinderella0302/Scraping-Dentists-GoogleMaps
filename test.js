import mongoose from "mongoose";
import Regions from './models/regions.model.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const mongooseURL = process.env.MONGODB_URL;
const APIKEY = process.env.GOOGLE_MAPS_API_KEY;
const placeId = 'ChIJY_4ExGtWtokRWZ_dga6JfKM';

// await mongoose.connect(mongooseURL);
// console.log('Connected to mongoDB');

// (async () => {  
//     await extractClinic();  
//     // Any additional logic or cleanup can go here.  
// })();  

// const result = await Regions.findOne({zipcode: 22193});
// console.log(result);


const clinicInfo = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${APIKEY}`);
console.log(clinicInfo.data.result);


// import axios from 'axios';

// const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=AdCG2DOBtBZD5IENuCrftFxHNJBsw5F6jWWu4yLGnB7wlOeDMeVmwE7OpUqFJI58eQOE5aCn99fPK71UryvtZeffKfSORNYKaHXOflHXLEgcn3J7KJa9kMLO9nW4KIM813syaMwv_Lro3inHdC0XNlV0PX2EEB3_0JLh9l2lqiODoyq_oCp3qekVYEnChNTEWJO0QucYIEr2tZ3N3w6BV4mZpPu9XBK9QuyT20v4eJ2fB3GHYspvDHQ1y93XwCuYNtvOkJp-7TT3aLsGN5av8cJbojPyTcVQEwFJRnhDQH12lcxX7FA1LLtTzSnQ0nCwzZQNEJ3nUj0oPaLWDNN3XW6kTTCgxalRZXF_Obsq3gkq7N311tuX0qnzwz49XdigGMEOhBlFGIye7uWyKrh0zfqJK7VEC9eR&key=AIzaSyA103_TJ6YH7XUU2_Jd4xpS1qFLti_sK38';

// const response = await axios.get(url);
// console.log('----- response: ', response.data);


// const originalString = [];
// if(originalString){
//     console.log('true');
// }else{
//     console.log('false');
// }

// const modifiedString = originalString.replace(/ /g, '-');
// const modifiedString = originalString.toLowerCase();

// console.log(modifiedString); // Output: "Hello-World!-This-is-a-test."

