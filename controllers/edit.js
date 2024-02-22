const user = require('../Model/damn');

exports.userEdit = async(req,res)=>{
    try{
        const { name } = req.params;
         const usersdata = await user.findOne({ name })
         for (const key in req.body) {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                usersdata[key] = req.body[key];
            }
        }
         //usersdata.sub = req.body.sub
         const u = await usersdata.save()
         res.json(u)
    }catch (err){
        res.send("Error: ", err)
    }
}