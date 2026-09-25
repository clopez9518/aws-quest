# Especificación Técnica: Fase 4 — Frontend Canvas, Contenedores React Flow y Paleta Categorizada

> **Documento de Especificación de Implementación**  
> **Fase:** 4 (Frontend Canvas, React Flow Containers & Categorized Palette)  
> **Proyecto:** AWS Architecture Quest (`apps/web`)  
> **Documento de Referencia:** [`docs/14-aws-network-expansion-plan.md`](file:///c:/workspace/aws/aws-game/docs/14-aws-network-expansion-plan.md)  
> **Dependencias:** Fase 1, Fase 2 y Fase 3 completadas  
> **Estado:** Listo para Implementación

---

## 1. Introducción y Objetivos de la Fase 4

La **Fase 4** transforma la experiencia de usuario en el canvas interactivo (`apps/web`) para dar soporte a la diagramación jerárquica de arquitecturas de red AWS. Pasa de un canvas plano de nodos individuales a un entorno estructurado donde el usuario puede instanciar redes virtuales aisladas (**VPC**), segmentarlas en subredes (**Public / Private / Isolated Subnets**) mediante cajas contenedoras de React Flow (`parentId`), y posicionar servicios gestionados y componentes de infraestructura dentro de ellas con movimiento sincronizado.

### 1.1 Objetivos Principales:
1. **Tipado TypeScript Sincronizado (`canvas.types.ts`):**
   * Incorporar `SubnetTier`, `ResourceKind`, `PlacementScope`.
   * Enriquecer `ComponentConfig`, `AwsServiceNodeData`, `GraphComponentDto` y `ServicePaletteItem` con soporte para `parentId`, `kind`, `placementScope` y configuraciones de red (`cidrBlock`, `routeTableId`, `securityGroupIds`, `routes`, `securityGroupRules`).
2. **Nodos Contenedores Jerárquicos en React Flow:**
   * **`VpcContainerNode.tsx`**: Contenedor visual de nivel superior para VPC (borde azul punteado, banner de VPC con CIDR block e identificador, drop zone para subredes).
   * **`SubnetContainerNode.tsx`**: Contenedor visual para subredes con diferenciación cromática según `subnetTier` (Verde para `Public`, Azul/Gris oscuro para `Private`, Morado para `Isolated`), badge de CIDR y drop zone para servicios.
   * **`GatewayNode.tsx`**: Nodo compacto para `NET_IGW`, `NET_NAT_GATEWAY`, `NET_ROUTE_TABLE` y `NET_NACL`.
   * **`SecurityGroupNode.tsx`**: Nodo de política de seguridad para `NET_SECURITY_GROUP` con visualización de reglas de firewall configuradas.
   * **`AwsServiceNode.tsx`**: Actualizado para indicar visualmente su contención y compatibilidad.
3. **Gestor de Estado del Canvas (`useCanvasStore.ts`):**
   * Soporte nativo para contención jerárquica mediante `parentId` y `extent: 'parent'`.
   * Detección de colisión / drop dentro de contenedores VPC y Subnet con cálculo de coordenadas relativas.
   * Eliminación en cascada de nodos hijos al borrar un contenedor.
   * Serialización y deserialización bidireccional entre `nodes[]` (con `parentId`) y `SemanticGraphDto` (con `parentId`).
4. **Paleta de Servicios Renovada (`ServicePalette.tsx` & `ServicePaletteItemCard.tsx`):**
   * Organización por pestañas / secciones claras:
     * **Pestaña "Servicios AWS"**: Compute, Database, Storage, Networking, CDN, Messaging, Security, Monitoring.
     * **Pestaña "Infraestructura de Red"**: VPC, Subnet, Internet Gateway, NAT Gateway, Route Table, Security Group, Network ACL.
   * Badges de ámbito de ubicación (`PlacementScope`: *Requiere Subred*, *VPC*, *Regional/Global*).
5. **Pruebas Automatizadas en Frontend (Vitest & React Testing Library):**
   * Tests unitarios del store (`useCanvasStore.test.ts`) para verificar contención, adición de nodos anidados, movimiento y serialización.
   * Tests de componentes (`VpcContainerNode.test.tsx`, `SubnetContainerNode.test.tsx`, `ServicePalette.test.tsx`).

---

## 2. Mapa de Archivos y Componentes

```text
apps/web/src/features/
├── canvas/
│   ├── types/
│   │   └── canvas.types.ts                           [MODIFY] (Tipos jerárquicos, SubnetTier, PlacementScope, etc.)
│   ├── components/
│   │   ├── canvasElementTypes.ts                     [MODIFY] (Registro de vpcContainer, subnetContainer, gatewayNode, securityGroupNode)
│   │   └── nodes/
│   │       ├── AwsServiceNode.tsx                    [MODIFY] (Compatibilidad con anidación y badges)
│   │       ├── VpcContainerNode.tsx                  [NEW] (Caja contenedora VPC con borde azul punteado)
│   │       ├── SubnetContainerNode.tsx               [NEW] (Caja contenedora Subred según SubnetTier)
│   │       ├── GatewayNode.tsx                       [NEW] (Nodo de IGW, NAT GW, Route Table, NACL)
│   │       ├── SecurityGroupNode.tsx                 [NEW] (Nodo de Security Group con reglas)
│   │       └── __tests__/
│   │           ├── VpcContainerNode.test.tsx         [NEW]
│   │           ├── SubnetContainerNode.test.tsx      [NEW]
│   │           └── AwsServiceNode.test.tsx           [MODIFY]
│   └── stores/
│       ├── useCanvasStore.ts                         [MODIFY] (Manejo de parentId, drop anidado y coordenadas relativas)
│       └── __tests__/
│           └── useCanvasStore.test.ts                [MODIFY] (Tests de jerarquía y serialización)
│
└── challenge/
    └── components/
        ├── ArchitectureCanvas.tsx                    [MODIFY] (Soporte para drop jerárquico dentro de contenedores)
        ├── ServicePalette.tsx                        [MODIFY] (Pestañas Servicios vs Redes y filtrado)
        ├── ServicePaletteItemCard.tsx                [MODIFY] (Badges de PlacementScope)
        └── __tests__/
            └── ServicePalette.test.tsx               [MODIFY]
```

---

## 3. Especificación de Tipos e Interfaces (`canvas.types.ts`)

```typescript
export type SubnetTier = 'Public' | 'Private' | 'Isolated';

export type ResourceKind = 'ManagedService' | 'NetworkInfrastructure' | 'SecurityPolicy';

export type PlacementScope =
  | 'RegionalGlobal'
  | 'SubnetRequired'
  | 'VpcOptional'
  | 'VpcRoot'
  | 'VpcAttached';

export interface RouteEntryDto {
  destinationCidr: string;
  targetId: string;
  description?: string | null;
}

export interface SecurityGroupRuleDto {
  direction: 'Ingress' | 'Egress';
  protocol: string;
  fromPort?: number | null;
  toPort?: number | null;
  source: string;
  description?: string | null;
}

export interface ComponentConfig {
  isMultiAz?: boolean | null;
  autoScaling?: boolean | null;
  instanceCount?: number | null;
  isPublic?: boolean | null;
  subnetType?: string | null;
  storageClass?: string | null;

  // Nuevas propiedades de Fase 4
  subnetTier?: SubnetTier | null;
  cidrBlock?: string | null;
  routeTableId?: string | null;
  attachedVpcId?: string | null;
  securityGroupIds?: string[];
  routes?: RouteEntryDto[];
  securityGroupRules?: SecurityGroupRuleDto[];
  customProperties?: Record<string, unknown>;
}

export interface AwsServiceNodeData {
  serviceCode: string;
  name: string;
  category: string;
  iconUrl: string;
  config: ComponentConfig;
  parentId?: string | null;
  kind?: ResourceKind;
  placementScope?: PlacementScope;
  maxInstances?: number | null;
  isDistractor?: boolean;
  visualStatus?: NodeVisualStatus;
  statusMessage?: string | null;
  [key: string]: unknown;
}

export type AwsCanvasNodeType =
  | 'awsServiceNode'
  | 'vpcContainerNode'
  | 'subnetContainerNode'
  | 'gatewayNode'
  | 'securityGroupNode';

export type AwsCanvasNode = Node<AwsServiceNodeData, AwsCanvasNodeType>;

export interface GraphComponentDto {
  id: string;
  serviceCode: string;
  label?: string | null;
  parentId?: string | null;
  kind?: ResourceKind;
  category?: string;
  config: ComponentConfig;
}

export interface ServicePaletteItem {
  code: string;
  name: string;
  category: string;
  iconUrl: string;
  kind?: ResourceKind;
  placementScope?: PlacementScope;
  maxInstances?: number | null;
  isDistractor?: boolean;
  defaultConfig?: Partial<ComponentConfig>;
}
```

---

## 4. Diseño y Comportamiento de Nodos Contenedores

### 4.1 `VpcContainerNode.tsx`
* **Dimensiones iniciales:** `width: 620px, height: 420px`.
* **Estilo Visual:**
  * Borde azul punteado (`border-2 border-dashed border-blue-400/80 dark:border-blue-500/60`).
  * Fondo traslúcido (`bg-blue-50/20 dark:bg-blue-950/10`).
  * Cabecera superior con icono de VPC, título `"Virtual Private Cloud (VPC)"`, badge de CIDR (`"10.0.0.0/16"`) y botón de eliminación.
* **Comportamiento:**
  * Actúa como contenedor de primer nivel.
  * No tiene `parentId`.
  * Permite alojar nodos `subnetContainerNode`, `gatewayNode` (`NET_IGW`, `NET_ROUTE_TABLE`) y `securityGroupNode`.

### 4.2 `SubnetContainerNode.tsx`
* **Dimensiones iniciales:** `width: 270px, height: 320px`.
* **Diferenciación Cromática por `SubnetTier`:**
  * **`Public`**: Borde verde punteado (`border-emerald-400 dark:border-emerald-500`), fondo `bg-emerald-50/30 dark:bg-emerald-950/20`, badge verde `"Public Subnet"`, CIDR `"10.0.1.0/24"`.
  * **`Private`**: Borde azul/gris pizarra punteado (`border-blue-400 dark:border-blue-600`), fondo `bg-slate-50/40 dark:bg-slate-900/30`, badge azul `"Private Subnet"`, CIDR `"10.0.2.0/24"`.
  * **`Isolated`**: Borde morado punteado (`border-purple-400 dark:border-purple-500`), fondo `bg-purple-50/30 dark:bg-purple-950/20`, badge morado `"Isolated Subnet"`, CIDR `"10.0.3.0/24"`.
* **Comportamiento:**
  * Reside dentro de una VPC (`parentId = vpcNode.id`, `extent: 'parent'`).
  * Permite alojar servicios de cómputo (`AWS_EC2`, `AWS_LAMBDA`), bases de datos (`AWS_RDS`, `AWS_ELASTICACHE`), balanceadores (`AWS_ALB`) y gateways de subred (`NET_NAT_GATEWAY`).

### 4.3 `GatewayNode.tsx` & `SecurityGroupNode.tsx`
* **`GatewayNode.tsx`**: Nodo compacto (estilo píldora o tarjeta pequeña de 140px de ancho) para representar gateways y tablas de ruteo (`NET_IGW`, `NET_NAT_GATEWAY`, `NET_ROUTE_TABLE`, `NET_NACL`).
* **`SecurityGroupNode.tsx`**: Nodo de política de seguridad (180px de ancho) con visualización de reglas activas (puertos permitidos ej. `TCP 5432 <- EC2`).

---

## 5. Lógica del Store y Manejo de Drag & Drop (`useCanvasStore.ts`)

### 5.1 Determinación de Tipo de Nodo al Instanciar
```typescript
function resolveNodeType(serviceCode: string): AwsCanvasNodeType {
  switch (serviceCode) {
    case 'NET_VPC':
      return 'vpcContainerNode';
    case 'NET_SUBNET':
      return 'subnetContainerNode';
    case 'NET_IGW':
    case 'NET_NAT_GATEWAY':
    case 'NET_ROUTE_TABLE':
    case 'NET_NACL':
      return 'gatewayNode';
    case 'NET_SECURITY_GROUP':
      return 'securityGroupNode';
    default:
      return 'awsServiceNode';
  }
}
```

### 5.2 Algoritmo de Detección de Contenedor (Hit Testing)
Al soltar un servicio en el canvas:
1. Si el servicio es `NET_VPC`, se crea en la raíz sin `parentId`.
2. Si el servicio es `NET_SUBNET`, se verifica si la coordenada del cursor colisiona con el área delimitada de un nodo `NET_VPC`.
   * Si colisiona: `node.parentId = vpc.id`, `node.extent = 'parent'`, y `node.position` se convierte a relativa respecto al origen de la VPC.
   * Si no colisiona: se añade a nivel raíz y se puede anidar posteriormente.
3. Si el servicio es un servicio que requiere subred (ej. `AWS_EC2`, `AWS_RDS`, `AWS_ALB`, `NET_NAT_GATEWAY`), se comprueba si colisiona con el área de una `NET_SUBNET`.
   * Si colisiona: `node.parentId = subnet.id`, `node.extent = 'parent'`, y `node.position` se calcula relativa a la Subnet.

### 5.3 Serialización y Deserialización con `parentId`
* **`toSemanticGraph()`**:
  * Para cada nodo en `nodes`, mapea `parentId: node.parentId || null`.
* **`loadSemanticGraph(graph)`**:
  * Ordena los componentes topológicamente: primero `NET_VPC`, luego `NET_SUBNET`, luego servicios hijos.
  * Asigna `node.parentId = component.parentId`.
  * Si tiene `parentId`, configura `extent: 'parent'`.

---

## 6. Nueva Paleta de Servicios (`ServicePalette.tsx`)

### 6.1 Estructura por Pestañas
1. **Pestaña "Servicios AWS"**:
   * Agrupa servicios gestionados tradicionales (`Compute`, `Database`, `Storage`, `Networking`, `CDN`, `Messaging`, `Security`, `Monitoring`).
2. **Pestaña "Redes y Seguridad"**:
   * Agrupa recursos de infraestructura (`VPC`, `Subredes`, `Internet Gateway`, `NAT Gateway`, `Tablas de Ruteo`, `Security Groups`, `NACLs`).
3. **Filtro de Búsqueda Global**:
   * Permite buscar por nombre, categoría o código de servicio a través de todas las pestañas.

---

## 7. Plan de Verificación y Pruebas Automatizadas

1. **`useCanvasStore.test.ts`**:
   * Instanciar `NET_VPC` y verificar que su tipo es `vpcContainerNode`.
   * Instanciar `NET_SUBNET` dentro de `NET_VPC` y verificar `parentId == vpc.id` y `extent == 'parent'`.
   * Instanciar `AWS_EC2` dentro de `NET_SUBNET` y verificar `parentId == subnet.id`.
   * Serializar con `toSemanticGraph()` y verificar que el DTO preserva `parentId` en todas las capas.
   * Deserializar con `loadSemanticGraph()` y verificar la reconstrucción del árbol.
   * Eliminar un contenedor `NET_VPC` y comprobar la limpieza coordinada de nodos huérfanos.
2. **Tests de Componentes React**:
   * `VpcContainerNode.test.tsx`: Renderizado de título, badge CIDR y botón de borrado.
   * `SubnetContainerNode.test.tsx`: Renderizado correcto de estilos según `subnetTier` (`Public`, `Private`, `Isolated`).
   * `ServicePalette.test.tsx`: Cambio de pestañas, búsqueda y renderizado de items con `PlacementScope`.
3. **Ejecución de Tests en Web**:
   * `pnpm --filter web test` (Vitest).
