const { jwt } = require("jsonwebtoken");


const authMiddlewar=(req,res,next)=>{
    // req.headers-->{
    //     "Authorization": "Bearer <token>"
    // }
const token=req?.header("Authorization")?.split(" ")[1];
if(!token){
    return res.status(401).json({message:"Token Unauthorized"});
}
try{
    const decoded=jwt.verify(token,"secret key");
    req.user=decoded
    next();
}

catch(error){
    return res.status(401).json({message:"Invalid token"});

}

}
module.exports = authMiddlewar;