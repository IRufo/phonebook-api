import { Request, Response, NextFunction } from "express";
import { User } from "../models";

interface AuthRequest extends Request {
    user?: User;
}

export const authorizeRolesAndOwner = (roles: string[], checkOwnership: boolean = false) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized: No user found" });
            return;
        }
           // If ownership is being checked, verify the user is the owner. .body is for form data type
        if (checkOwnership && req.user.id === parseInt( req.body.owner_id || req.params.id)) {
            next();
            return
        }

        if (!req.user.role || !roles.length) {
            res.status(403).json({ message: "Forbidden: User role missing" });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: `Forbidden: Requires one of the following roles: ${roles.join(", ")}`,
            });
            return;
        }

        next(); 
    };
};
