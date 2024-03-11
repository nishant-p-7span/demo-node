const user = require('../Model/damn');

exports.getUser = async(req,res)=>{
    try{
         //const users = await user.find()
         //res.json(users)
         res.json({ hello: "world" })
    }catch (err){
        res.send("Error: ", err)
    }
}
