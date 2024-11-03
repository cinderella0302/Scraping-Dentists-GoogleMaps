import mongoose from "mongoose";
import Dentists from "./models/dentists.model.js";
import dotenv from 'dotenv';
dotenv.config();
const mongooseURL = process.env.MONGODB_URL;

async function removeduplication(){
    console.log('removing');
    const docs = await Dentists.aggregate([
        {
            $group: {
                _id: '$AddressId',
                uniqueIds: { $addToSet: '$_id'},
                count: { $sum: 1}
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]);

    console.log('docs', docs);
    let number = 0;

    for(const doc of docs){
        const idsToDelete = doc.uniqueIds.slice(1);
        await Dentists.deleteMany({
            _id: { $in: idsToDelete }
        });
        console.log('deleted', number++);
    }
    console.log('-------------- Done ------------');
}

await mongoose.connect(mongooseURL);
console.log('connected to MongoDB');

(async () => {
    await removeduplication();
})();


// const uniqueDocs = await YourModel.aggregate([  
//   {  
//     $group: {  
//       _id: { myUniqueField: '$myUniqueField' }, // Replace myUniqueField with the field name(s)  
//       uniqueIds: { $addToSet: '$_id' },  
//       count: { $sum: 1 }  
//     }  
//   },  
//   {  
//     $match: {  
//       count: { $gt: 1 } // Filter groups having more than 1 document  
//     }  
//   }  
// ]);  


// for (const doc of uniqueDocs) {  
//     // Keep the first id and remove the rest  
//     const idsToDelete = doc.uniqueIds.slice(1); // Skip first ID  
    
//     await YourModel.deleteMany({  
//       _id: { $in: idsToDelete }  
//     });  
//   }  
