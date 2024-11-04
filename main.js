import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import Dentists from './models/dentists.model.js';
import Regions from './models/regions.model.js';
import Clinics from './models/clinics.model.js';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import { profile } from 'console';

dotenv.config();
const mongooseURL = process.env.MONGODB_URL;
const APIKEY = process.env.GOOGLE_MAPS_API_KEY;

puppeteer.use(StealthPlugin());

let options = {
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--disable-gpu', '--disable-software-rasterizer']
}
options.headless = true

function customToLowerCase(str) {
    let result = '';
    for (let char of str) {
        result += char.toLowerCase(); // Using built-in method for each character
    }
    return result;
}

function readZipcode(path){
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            const jsonData = JSON.parse(data);
            console.log(jsonData.map(zip => zip.zip));
            // console.log(zipCodeData); // Output the content of the file

            const zipcodeData = jsonData.map(zip => zip.zip);
            return resolve(zipcodeData);
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getRequestForRegion(zipcode, token = ''){

    if(token){
        // sleep(1000);
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${token}&key=${APIKEY}`;
        // console.log(url);
        const response = await axios.get(url);

        // for(let i = 0; i < response.data.results.length; i++){
        //     await Regions.findOneAndUpdate(
        //         { zipcode: zipcode},
        //         {
        //             $push: {
        //                 clinics: response.data.results[i],
        //             }
        //         }
        //     );
        // }

        await Regions.findOneAndUpdate(
            { zipcode: zipcode},
            {
                $push: {
                    clinics: { $in: response.data.results },
                }
            }
        );

        if(response.data.next_page_token){
            console.log('----- continue zipcode: ', zipcode);
            await getRequestForRegion(zipcode, response.data.next_page_token);
        }else{
            console.log('----- end in zipcode: ', zipcode);
        }

    }else{
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=dental clinics+in+${zipcode}&key=${APIKEY}`;
        const response = await axios.get(url);
        // console.log(response);

        try{
            await Regions.create(
                {
                    zipcode: zipcode,
                    clinics: response.data.results,
                }
            );

            if(response.data.next_page_token){
                console.log('----- start zipcode: ', zipcode);
                await getRequestForRegion(zipcode, response.data.next_page_token);
            }else{
                console.log('----- end in zipcode: ', zipcode);
            }
        }catch(error){
            console.log('------ create error: ', zipcode, ', ', error.message);
        }
    }
}

await mongoose.connect(mongooseURL);
console.log('Connected to mongoDB');

const zipcodeData = await readZipcode('./zipcode/zip-codes-data-virginia.json');
// console.log(zipcodeData);
// const firstUrl = `https://findadentist.ada.org/api/Dentists?Address=${}&Photo=false&OpenSaturday=false`;

for(let i = 0; i < zipcodeData.length; i++) {
    console.log('-------------------------------zipcode: ', zipcodeData[i], ' ----index: ', i);
    await getRequestForRegion(zipcodeData[i]);
}

// await getRequestForRegion('22193');