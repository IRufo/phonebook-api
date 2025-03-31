import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

// Role-based and Owner-based Authorization Middleware
export const authorizeRolesAndOwner = (roles: string[], checkOwnership: boolean = false) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized: No user found" });
            return;
        }
     
           // If ownership is being checked, verify the user is the owner
        if (checkOwnership && req.user.id === parseInt(req.params.id)) {
            next();
            return
        }

        // Check if user has role
        if (!req.user.role) {
            res.status(403).json({ message: "Forbidden: User role missing" });
            return;
        }

        // Check if user role matches the allowed roles
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: `Forbidden: Requires one of the following roles: ${roles.join(", ")}`,
            });
            return;
        }

        next(); // Proceed to the next middleware/route handler
    };
};
