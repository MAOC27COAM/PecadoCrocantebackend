import { ZodError } from 'zod';
export function validate(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (e) {
            if (e instanceof ZodError) {
                res.status(400).json({ error: 'Datos invalidos', detalles: e.errors });
                return;
            }
            next(e);
        }
    };
}
