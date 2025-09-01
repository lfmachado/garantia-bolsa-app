import Mermaid from '@/components/Mermaid';
export default function FlowPage() {
  const chart = String.raw`flowchart TD
A[Inicio] --> B[Registro de Usuario]
B --> C[Asignación de Rol]
C --> D[Inicio de Sesión]
D -->|Credenciales válidas| E[Acceso al Sistema]
D -->|No válidas| F[Denegar Acceso] --> ZF[Fin]
E --> G[Creación y Mapeo de Productos]
G --> H[Mapeo de % de Garantía]
H --> I[Almacenamiento en Base de Datos]
I --> J[Listo para usar]
J --> K[Registro de Créditos a Garantizar]
K --> L{¿Validación OK?}
L -->|Sí| M[Aprobación del Registro] --> N[Notificación de Registro Exitoso]
L -->|No| O[Error de Validación] --> K
M --> P[Generación de Factura]
P --> Q[Carga de Soporte de Pagos]
Q --> R{¿Registros y Valores OK?}
R -->|Sí| S[Actualización de Estado a Pagado] --> T[Ingreso a Bolsa de Garantía]
R -->|No| U[Error en Carga] --> V[Notificación de Corrección Necesaria]
S --> W[Vigencia de Créditos con Garantía]
W --> X{¿Novedad o Vencimiento?}
X -->|Sí| Y[Registro de Novedades y Correcciones]
X -->|No| W
Y --> AA{¿Validar Corrección?}
AA -->|Sí| AB[Actualización de Cartera a Reclamar]
AA -->|No| AC[Corrección Fallida]
AB --> AD[Reclamación de Cartera]
AD --> AE[Subir Documentos de Reclamación]
AE --> AF{¿Validación OK?}
AF -->|Sí| AG[Cambio a Estado Reclamado]
AF -->|No| AH[Rechazo de Reclamación]
AG --> AI[Pago de Cartera Reclamada]
AI --> AJ[Cambio a Estado Pagado Reclamado] --> Z[Fin]
E --> AR[Exportar, Consultar y Filtrar Reportes]
E --> AS[Ver Entradas y Salidas de Bolsa de Garantía]
AS --> AT[Cálculo de Saldo Actual] --> Z`;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Diagrama de Flujo</h1>
      <Mermaid chart={chart}/>
    </div>
  );
}
