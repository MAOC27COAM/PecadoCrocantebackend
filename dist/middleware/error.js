export function errorHandler(err, _req, res, _next) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
}
