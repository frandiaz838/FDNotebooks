export function buildWhatsAppLink(nombre: string, precio: number, moneda: string) {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const precioFormateado = new Intl.NumberFormat("es-AR").format(precio);
  const mensaje = `Hola! Te escribo por la notebook ${nombre} que vi en FD Notebooks (${moneda} ${precioFormateado})`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function buildGenericWhatsAppLink() {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const mensaje = "Hola! Te escribo desde FD Notebooks, quería hacerte una consulta.";
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function formatWhatsAppNumberDisplay() {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const codigoPais = numero.slice(0, 2);
  const resto = numero.slice(2);
  if (resto.length !== 10) return `+${numero}`;
  return `+${codigoPais} ${resto.slice(0, 4)} ${resto.slice(4)}`;
}
