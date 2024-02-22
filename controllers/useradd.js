const user = require('../Model/damn');

exports.userAdd = async(req,res) => {
    const post = new user({
        name: req.body.name,
        tech: req.body.tech,
        sub: req.body.sub
    })

    try{
        const u1 = await post.save()
        res.json(u1)
    }catch(err){
        res.send("Error")
    }
}