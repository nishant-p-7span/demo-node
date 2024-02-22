const user = require('../Model/damn');

exports.getUserByName = async(req,res)=>{
    try{
        const { name } = req.params;
         const usersdata = await user.findOne({ name })
         res.json(usersdata)
    }catch (err){
        res.send("Error: ", err)
    }
}