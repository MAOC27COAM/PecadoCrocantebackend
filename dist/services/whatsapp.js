const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const API_BASE = 'https://graph.facebook.com/v21.0';
export async function sendMessage(to, texto) {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.log('[WHATSAPP MOCK] Para:', to, 'Msg:', texto);
        return true;
    }
    try {
        const res = await fetch(`${API_BASE}/${WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to.replace('+', ''),
                type: 'text',
                text: { body: texto },
            }),
        });
        return res.ok;
    }
    catch {
        return false;
    }
}
export function generateWhatsAppLink(celular, pedidoId, total) {
    const msg = encodeURIComponent(`¡Hola! Quiero confirmar mi pedido *${pedidoId}* por un total de S/ ${total.toFixed(2)}.`);
    return `https://wa.me/${celular.replace(/[^0-9]/g, '')}?text=${msg}`;
}
