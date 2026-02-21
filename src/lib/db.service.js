const { default: mongoose } = require("mongoose");

async function dbConnection(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        // await mongoose.connect(`mongodb://127.0.0.1:27017/exam`)
        console.log("DB successfully connected ✅")
    }catch(err){
        console.log(`DB connection error: ${err.message}`);
        throw new Error(`DB connection error: ${err.message}`);
    }
};

module.exports = dbConnection;