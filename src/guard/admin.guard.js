const { globalError, ClientError } = require("shokhijakhon-error-handler");

module.exports = (req, res, next) => {
    try{
        if(!req.user) throw new ClientError("Unauthorized", 401);
        if(req.user.role == "admin") return next();
        throw new ClientError("Forbidden request", 403);
    }catch(err){
        return globalError(err, res);
    }
};