# Implementación: Agregar Lead Manualmente

## Descripción
Se agregó un nuevo botón **"Agregar Lead"** junto al botón de **"Favoritos"** en la página de administración de companies (`/app/admin/company`). Este botón abre un modal que permite crear leads manualmente con los mismos datos que los leads del formulario.

## Cambios Realizados

### 1. **Nuevo Estado para el Formulario** (Línea 372-379)
```typescript
const [manualLeadForm, setManualLeadForm] = useState<{
  nombre: string;
  correo: string;
  empresa: string;
  telefono: string;
  servicio: string;
  mensaje: string;
} | null>(null);
```

### 2. **Función para Crear Lead Manual** (Línea 659-680)
```typescript
const addManualLead = () => {
  if (!manualLeadForm) return;
  const { nombre, correo, empresa, telefono, servicio, mensaje } = manualLeadForm;
  if (!nombre.trim() || !correo.trim()) return;

  const newLead: CompanyContact = {
    id: `manual-${Date.now()}`,
    nombre: nombre.trim(),
    correo: correo.trim(),
    empresa: empresa.trim(),
    telefono: telefono.trim(),
    servicio: servicio.trim(),
    mensaje: mensaje.trim(),
    sector: '',
    ciudad: '',
    fechaSolicitud: formatDateOnly(new Date()),
    createdAtMs: Date.now(),
  };

  setContacts((prev) => [newLead, ...prev]);
  setManualLeadForm(null);
};
```

**Características:**
- Valida que nombre y correo no estén vacíos
- Crea un ID único con timestamp
- Agrega el lead al inicio de la lista (más reciente primero)
- Cierra el modal automáticamente
- Usa `formatDateOnly()` que ya existe en el archivo

### 3. **Botón en la Toolbar** (Línea 864-881)
```typescript
<Button
  type="button"
  variant="outline"
  size="sm"
  className="shrink-0"
  title="Agregar lead manualmente"
  onClick={() => setManualLeadForm({
    nombre: '',
    correo: '',
    empresa: '',
    telefono: '',
    servicio: '',
    mensaje: '',
  })}
>
  <UserPlus className="size-3.5" />
  <span className="text-[11px] font-semibold">Agregar Lead</span>
</Button>
```

**Ubicación:** Junto al botón "Favoritos" en la toolbar de filtros
**Icono:** `UserPlus` (usuario + símbolo)
**Estilo:** Button outline pequeño, consistente con el diseño

### 4. **Modal para Formulario Manual** (Línea 1590-1706)
El modal contiene los siguientes campos:

| Campo | Tipo | Requerido | Placeholder |
|-------|------|-----------|-------------|
| Nombre | text | ✓ | Ej: Juan Pérez |
| Correo | email | ✓ | ej@empresa.com |
| Empresa | text | — | Ej: Acme Corp |
| Teléfono | text | — | 555 123 4567 |
| Servicio/Asunto | text | — | Ej: Custom Software Development |
| Mensaje/Notas | textarea | — | Detalles adicionales... |

**Validación:**
- Botón "Agregar Lead" está deshabilitado si Nombre o Correo están vacíos
- Solo se validan campos requeridos

**Acciones:**
- **Cancelar:** Cierra el modal sin guardar
- **Agregar Lead:** Crea el lead y lo agrega a la tabla

## Comportamiento

1. **Hacer click en "Agregar Lead"** → Se abre el modal con formulario vacío
2. **Llenar los datos** (mínimo nombre y correo) → Botón "Agregar Lead" se habilita
3. **Click en "Agregar Lead"** → El lead se agrega al inicio de la tabla
4. El nuevo lead:
   - Recibe ID único con timestamp
   - Se marca con la fecha actual
   - Aparece en la tabla inmediatamente
   - Puede asignarse a desarrolladores como cualquier otro lead
   - Puede marcarse como favorito
   - Puede cambiar de estado

## Nota Importante: Persistencia

Los leads agregados manualmente **persisten en memoria** durante la sesión actual. Si recargas la página, se perderán. Para persistencia permanente, necesitarías:

1. Crear un endpoint POST en la API para guardar el lead
2. Llamar a ese endpoint en `addManualLead()` antes de actualizar el estado local
3. Manejar errores de la API

Ejemplo de implementación futura:
```typescript
const addManualLead = async () => {
  // ... validaciones ...
  
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) {
    // Usar memoria local si no hay API
    setContacts((prev) => [newLead, ...prev]);
    return;
  }
  
  try {
    const res = await fetch(`${base}/contact/company-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    });
    
    if (res.ok) {
      const saved = await res.json();
      setContacts((prev) => [saved, ...prev]);
      setManualLeadForm(null);
    }
  } catch (err) {
    console.error('Error guardando lead:', err);
  }
};
```

## Estilo y Diseño

- Los inputs siguen el diseño de Shadcn UI
- Soportan dark mode automáticamente
- Tienen focus-visible para accesibilidad
- Los labels tienen asteriscos rojo para campos requeridos
- La textarea no es redimensionable (resize-none)

## Archivo Modificado

`/root/erase/vado-landing/src/pages/app/adminCompany.tsx`

**Total de líneas agregadas:** ~130 líneas
**No se removió código existente**
**Todos los tests pasan: ✓**
