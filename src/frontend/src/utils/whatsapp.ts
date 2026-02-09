export function generateWhatsAppLink(phoneNumber: string, message?: string): string {
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}
