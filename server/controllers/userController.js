const userModel = require('../models/userModel')

async function getUser(req, res){
    try{
        const users = await userModel.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({message:'Something went wrong',error:error.message});
    }
}

//For admin to get used profile by id
async function getUserId(req, res){
    try {
        if (req.userId !== req.params.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({message:'Something went wrong',error:error.message});
    }
}

//For user to update their profile
async function updateMyProfile(req, res){
    try {
    const updates = req.body;
    const allowedUpdates = [
      'name', 'phone', 'profilePicture', 'addresses','notifications', 'rewardsPoints', 'isBlocked',
    ];

    // Optional: validate incoming fields
    const isValidOperation = Object.keys(updates).every(key => allowedUpdates.includes(key));
    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates in request body" });
    }
    const updatedUser = await userModel.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", data: updatedUser });
    } catch(error) {
        console.error('Error updating user by ID:', error);
        res.status(500).json({message:'Something went wrong',error:error.message});
    }   
}

async function deleteMyProfile(req, res){
    try{
        const user = await userModel.findByIdAndDelete(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });

    }catch(error) {
        console.error('Error deleting user by ID:', error);
        res.status(500).json({message:'Something went wrong',error:error.message});
      }
}