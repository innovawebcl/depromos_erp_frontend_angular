# Monorepo Backoffice (Laravel 12 + Angular CoreUI)

## Requisitos
- Docker + Docker Compose

## Levantar demo
```bash
docker compose up --build
```

- API: http://localhost:8000/api
- Front: http://localhost:4200

## Credenciales demo
- Usuario: admin (o admin@demo.cl)
- Password: admin123

## Módulos
Productos, Inventario, Banners, Pedidos, Picking, Repartidores, Tarifas por Comuna, Clientes, Usuarios, Roles.

## Estado demo-ready
Incluye pantallas Angular completas (listado + detalle/edición según aplique) para:
- Pedidos
- Picking
- Usuarios
- Roles y módulos
- Productos
- Inventario
- Banners
- Repartidores (incluye vista de calificaciones)
- Tarifas por Comuna (incluye histórico y seteo de nueva tarifa)
- Clientes (lista, detalle, blacklist y meta de compras)

El backend expone endpoints REST para los módulos anteriores y se entrega con migraciones + seeders demo.
