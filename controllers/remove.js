const user = require('../Model/damn');

exports.userRM = async(req,res)=>{
    try{
        const { name } = req.params;

        // Delete user based on the provided name
        const deletedUser = await user.findOneAndDelete({ name });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully', deletedUser });
    }catch (err){
        res.send("Error: ", err)
    }
}