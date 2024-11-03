import mongoose from "mongoose";

import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import Dentists from './models/dentists.model.js';
import Regions from './models/regions.model.js';
import Clinics from './models/clinics.model.js';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

dotenv.config();
const MongooseURL = process.env.MONGODB_URL;

puppeteer.use(StealthPlugin());

let options = {
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--disable-gpu', '--disable-software-rasterizer']
}
options.headless = true

async function getCookiesForDentist(profile){
    
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    const state = String(profile.State).toLowerCase();
    const county = String(profile.County).toLowerCase().replace(/ /g, '-').replace(/[.,]/g, '');
    const city = String(profile.City).toLowerCase().replace(/ /g, '-').replace(/[.,]/g, '');
    const specialty = String(profile.Specialty.Type).toLowerCase().replace(/ /g, '-');
    const tagname = String(profile.TagName).toLowerCase().replace(/ /g, '-').replace(/[.,]/g, '');
    const addressid = String(profile.AddressId);

    const url = `https://findadentist.ada.org/${state}/${county}/${city}/${specialty}/${tagname}-${addressid}`;

    await page.goto(url, {
        waitUntil: "networkidle0",
    });

    const cookies = await page.cookies();

    await page.close();
    await browser.close();

    // console.log(" --- cookies ----- \n", cookies);
    // console.log(" ---- length of cookies: ", cookies.length);

    var cookiesurl = '';

    for( let i = 0; i < cookies.length; i++){
        cookiesurl = cookiesurl + cookies[i].name + '=' + cookies[i].value + ';';
    }

    // console.log(' ---- cookie url: ', cookiesurl);
    return cookiesurl;
}

async function getRequestForDentist(profile, cookie){

    const addressId = profile.AddressId;
    const url = `https://findadentist.ada.org/api/DentistProfile?AddressId=${addressId}`;
    // console.log('------------ address Id: ', addressId);

    try{
        const response = await axios.get(url, {
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'cookie': cookie,
                'priority': 'u=1, i',
                'referer': `https://findadentist.ada.org/va/prince-william/woodbridge/general-practice/dr-michael-e-king-4941190`,
                'sec-ch-ua': "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': "Windows",
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                    }
        });
        
        const newDentists = new Dentists(
            response.data.Profile
        );
        await newDentists.save();

        console.log("---- push dentists");
        // console.log("---- profile: ", response.data.Profile);

    } catch(error) {
        console.log('------------- getRequestForDentist Error: ', error.message);
        const newCookie = await getCookiesForDentist(profile);
        await getRequestForDentist(profile, newCookie);
    }
}

async function extractdentists(){
    const cursor = Regions.find().cursor();
    let flag = false;
    let cookie = '_gcl_au=1.1.1325107203.1729692642; _ga=GA1.1.867235495.1729692647; OptanonAlertBoxClosed=2024-10-23T14:20:40.572Z; BE_CLA3=p_id%3D6422LAPJ4J8LRA2JR8NNL4R2RAAAAAAAAH%26bf%3D27a2a3983c4bfeae43c7fb5a5bf914fd%26bn%3D9%26bv%3D3.46%26s_expire%3D1729787661380%26s_id%3D6422LAPJ4J8LRN6APJ8NL4R2RAAAAAAAAH; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Oct+23+2024+11%3A33%3A09+GMT-0700+(Pacific+Daylight+Time)&version=202402.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0002%3A1%2CC0003%3A1%2CC0001%3A1&geolocation=%3B&AwaitingReconsent=false; _ga_NVSBFQCBYE=GS1.1.1729707242.3.1.1729708482.0.0.0; _ga_C2503WHWW7=GS1.1.1729707187.3.1.1729708865.0.0.0';
    let zipcodeNumber = 0;
    for(let doc = await cursor.next(); doc!=null; doc = await cursor.next()){

        const dentists = doc.dentists;
        console.log('---------------------------- zipcode: ', doc.zipcode, ', ', zipcodeNumber++);

        if(doc.zipcode == '22193'){
            flag = true;
        }

        if(flag){
            for(let i = 0; i < dentists.length; i++){
                const existed = Dentists.findOne(
                    { AddressId: dentists[i].AddressId}
                )

                if(existed){
                    console.log('----- already existed dentist: ', dentists[i].AddressId);
                }else{
                    // cookie = await getCookiesForDentist(dentists[i]);
                    await getRequestForDentist(dentists[i], cookie);
                    // await Dentists.create(dentist);
                }

            }
        }else{
            console.log('----- bypass zipcode: ', doc.zipcode);
        }

    }
    console.log('---------- Done -------------');
}

await mongoose.connect(MongooseURL);
console.log('Connected to mongoDB');

(async () => {
    await extractdentists();
})();


