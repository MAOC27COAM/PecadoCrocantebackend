import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const productos = [
    { nombre: 'Pecado Burger', descripcion: 'Hamburguesa doble carne, queso, bacon y salsa BBQ', precio: 18.90, categoria: 'hamburguesas', imagen: '/images/img_burger_1.png' },
    { nombre: 'Crocante Pollo', descripcion: 'Pollo frito crocante con papas y ensalada', precio: 15.90, categoria: 'pollos', imagen: '/images/img_pollo_1.png' },
    { nombre: 'Papa Bomba', descripcion: 'Papas rellenas de carne, queso y salsa de la casa', precio: 12.50, categoria: 'papas', imagen: '/images/img_papas_1.png' },
    { nombre: 'Pecado Mix', descripcion: 'Alitas, papas, aros de cebolla y dip', precio: 22.00, categoria: 'combos', imagen: '/images/img_combo_1.png' },
    { nombre: 'Double Pecado', descripcion: 'Dos hamburguesas, papas grandes y bebida', precio: 28.00, categoria: 'combos', imagen: '/images/img_combo_2.png' },
    { nombre: 'Pecado Mono', descripcion: 'Hamburguesa sencilla con papas', precio: 12.00, categoria: 'hamburguesas', imagen: '/images/img_burger_2.png' },
    { nombre: 'Coca-Cola 500ml', descripcion: 'Bebida personal', precio: 3.50, categoria: 'bebidas', imagen: '/images/img_bebida_1.png' },
    { nombre: 'Inca Kola 500ml', descripcion: 'Bebida personal', precio: 3.50, categoria: 'bebidas', imagen: '/images/img_bebida_2.png' },
];
async function main() {
    await prisma.detallePedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.producto.deleteMany();
    await prisma.usuario.deleteMany();
    for (const p of productos) {
        await prisma.producto.create({ data: p });
    }
    console.log('Seed ejecutado correctamente');
}
main().catch(console.error).finally(() => prisma.$disconnect());
