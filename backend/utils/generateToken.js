
import jwt from "jsonwebtoken";

/**
 * Generate Token
 * @param {object} user 
 * @returns {string} jwt token
 */

export const generateToken = (user)=>{
    try {
      if(!user || !user._id || !user.role){
         throw new Error("User not found");
      }

      const payload = {
          id:user._id,
          role:user.role,
          name:user.name,
      };

      const secret = process.env.JWT_SECRET;

      if(!secret){
         throw Error("JWT secret not found");
      }

      const options = {
          expiresIn: "1d",
          issuer: "SmartCRM",
      };

      return jwt.sign(payload,secret,options);

    } catch (error) {
        console.log("Error generating token",error);
        throw error;
    }
}
