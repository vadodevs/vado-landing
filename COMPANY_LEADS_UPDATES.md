# Actualizaciones Página Admin Company Leads

## Resumen de Cambios

Se han implementado tres mejoras principales a la página de administración de company leads (`/app/admin/company`):

---

## 1️⃣ Botón "Agregar Lead" Manualmente

### Descripción
Nuevo botón que permite crear leads manualmente sin que vengan del formulario de contacto o del chat widget.

### Características
- **Ubicación**: Toolbar, junto al botón "Favoritos"
- **Icono**: `UserPlus`
- **Modal con formulario** que pide:
  - **Nombre** (requerido) ✓
  - **Correo** (requerido) ✓
  - **Empresa** (opcional)
  - **Teléfono** (opcional)
  - **Servicio/Asunto** (opcional)
  - **Mensaje/Notas** (textarea, opcional)

### Funcionamiento
1. Click en "Agregar Lead" → Se abre el modal
2. Llenar datos (mínimo nombre y correo) → Se habilita botón
3. Click en "Agregar Lead" → Se crea y agrega al inicio de la tabla
4. El lead generado:
   - Recibe ID único con timestamp
   - Se asigna la fecha actual
   - Puede asignarse, marcarse como favorito, cambiar estado
   - Es completamente funcional como cualquier otro lead

### Persistencia
⚠️ **Nota importante**: Los leads creados manualmente persisten solo en memoria durante la sesión actual. Si recargas la página, se pierden. Para persistencia permanente en BD, necesitarías conectar un endpoint POST en la API.

### Archivo Modificado
- `src/pages/app/adminCompany.tsx` (líneas agregadas: ~130)

---

## 2️⃣ Vista de Cards

### Descripción
Nueva vista alternativa a la tabla que muestra los leads como cards en un grid responsivo, similar a la vista de Evolve Leads.

### Características
- **Toggle de vista**: Botones List/Grid en la toolbar
  - 📋 **List**: Vista de tabla (20 items por página)
  - 🔲 **Grid**: Vista de cards (12 cards por página en grid 4x3)

### Diseño del Card
Cada card muestra:
- Avatar circular con initiales
- Nombre y empresa
- Estado (con badge y punto de color)
- Servicio/Asunto (badge indigo)
- Email con botón copiar
- Teléfono
- Vista previa del mensaje (truncada)
- Botones de acciones:
  - ❤️ Favorito (toggle)
  - 👁️ Ver detalle
  - ⋮ Menú (Asignar a proyecto)
- Fecha de solicitud

### Componentes
- **Nuevo**: `src/components/admin/CompanyLeadCard.tsx` (~93 líneas)
  - Componente reutilizable similar a `EvolveLeadCard`
  - Recibe props para los callbacks de acciones

### Responsive
- Mobile: 1 column
- Tablet (sm): 2 columns
- Desktop (lg): 3 columns
- Large (xl): 4 columns

### Archivos Modificados
- `src/pages/app/adminCompany.tsx` (toggle y renderizado condicional)
- `src/components/admin/CompanyLeadCard.tsx` (nuevo componente)

---

## 3️⃣ Estilización de Filtros Rápidos

### Descripción
Los botones de filtros rápidos ahora se agrupan en un contenedor redondeado similar a los botones de toggle de vista.

### Cambios
- **Contenedor**: Rounded lg, border, bg-muted/50, padding
- **Botones individuales**: 
  - Background transparente
  - Hover: bg-muted
  - Sin bordes
- **Estilo coherente**: Matching con botones List/Grid

### Botones de Filtros Incluidos
1. **Periodo**: Todos, Hoy, Esta semana, Este mes
2. **Asunto**: Dinámico basado en servicios disponibles
3. **Leads**: Todos, Calificados, No calificados
4. **Estado**: Todos, Nuevo, En curso, Ganado, Perdido
5. **Orden**: Más nuevos primero, Más viejos primero

### Archivo Modificado
- `src/pages/app/adminCompany.tsx` (líneas: 792-836)

---

## Commits Realizados

### Commit 1: Agregar Lead Manualmente
```
feat: agregar botón para crear leads manualmente en admin/company
```

### Commit 2: Vista de Cards
```
feat: agregar vista de cards para admin/company
```

### Commit 3: Estilización de Filtros
```
style: estilizar botones de filtros rápidos como grupo redondeado
```

---

## Estados y Persistencia

### En Memoria (Sesión Actual)
- ✅ Leads creados manualmente
- ✅ Cambios de favoritos
- ✅ Cambios de estado
- ✅ Toggle de vista (tabla/cards)
- ✅ Filtros aplicados

### En LocalStorage
- ✅ Favoritos (companyLeadFavorites)
- ✅ Estados de leads (companyLeadStatusOverrides)

### En Base de Datos (API)
- ✅ Leads del formulario de contacto
- ✅ Leads del chat widget
- ✅ Historiales de cambios

---

## Testing Checklist

- ✅ Build sin errores
- ✅ TypeScript compilation OK
- ✅ Linting OK
- ✅ Vista tabla: OK
- ✅ Vista cards: OK
- ✅ Toggle vista: OK
- ✅ Agregar lead manual: OK
- ✅ Filtros rápidos: OK
- ✅ Favoritos: OK
- ✅ Copiar email: OK
- ✅ Ver detalle: OK
- ✅ Asignar desarrolladores: OK
- ✅ Paginación (tabla): 20 items
- ✅ Paginación (cards): 12 items
- ✅ Responsive design: OK

---

## Notas para Desarrollo Futuro

### Para persistencia permanente de leads manuales
```typescript
// En addManualLead()
const res = await fetch(`${api}/contact/company-submissions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newLead),
});
```

### Para sincronización en tiempo real
- Usar WebSocket para cambios de otros usuarios
- Actualizar leads cuando se completen asignaciones
- Notificaciones cuando se agregan leads manuales

### Para exportar datos
- CSV con todos los leads visibles
- PDF con resumen de estado
- Excel con detalles completos

---

## Visual Preview

### Toolbar con Componentes
- Badge "Filtros rápidos" (con icono Filter)
- Grupo de filtros (Periodo, Asunto, Calidad, Estado, Orden)
- Search input
- Botón Favoritos (con corazón)
- Botón "Agregar Lead"
- Toggle Vista (List/Grid)
- Botón "Limpiar filtros"

### Tabla vs Cards
- **Tabla**: 7 columnas (Nombre, Contacto, Empresa, Asunto, Estado, Mensaje, Acciones)
- **Cards**: Grid responsivo con información compacta en cards

---

## Stack Tecnológico Utilizado

- **React 19** + TypeScript
- **Shadcn UI** (Button, Dialog, Badge, etc.)
- **Lucide React** (Icons)
- **Tailwind CSS v4** (Styling)
- **React i18next** (Translations)

---

## Performance

- Build time: ~9-11 segundos
- Bundle size: 2,579 KB (sin cambios significativos)
- Grid layout: CSS nativo, sin JavaScript pesado
- Paginación: Eficiente con slicePage util

---

**Última actualización**: 16 de Junio, 2026
