const jwt=require("jsonwebtoken");
const authMiddleWare=(req,res,next)=>{
    const token=req.header("Authorization")?.split(" ")[1]
    if(!token){
        return res.status(401)
        .json({message: "Access denied. No token provided."});
    }
    try{
        const decoded=jwt.verify(token,"secret_key");
        req.user=decoded;
        next()
    }
    catch(error){
        return res.status(401).json({message: "Invalid token"});
    }
}
module.exports=authMiddleWare;